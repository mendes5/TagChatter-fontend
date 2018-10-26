const http = require("http");
const express = require("express");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});

const server = http.createServer(app);

const defaults = {
  NAME: 'Guest',
  AVATAR: 'https://avatars3.githubusercontent.com/u/9648865?s=460&v=4',
  MESSAGE: 'Private user info',
  BATCH_SIZE: 200,
  SERVER_PORT: 3000,
};

const date = () => new Date().toISOString();

const uuid = (seed = '0123456789abcdef', pattern = '00000000-0000-0000-0000-000000000000') => pattern.replace(/0/g, () => seed[Math.random() * seed.length << 0]);

const sortMessages = (a, b) => Date.parse(a.created_at) > Date.parse(b.created_at);

const User = (name = defaults.NAME, avatar = defaults.AVATAR, id = uuid()) => ({
  id, name, avatar,
});

const Message = (content = defaults.MESSAGE, user = user(), has_parrot = false, created_at = date(), id = uuid()) => ({
  id, content, has_parrot, created_at, user
});

const userDatabase = {
  users: [],
  createUser(name = defaults.NAME, avatar = defaults.AVATAR) {
    const user = User(name, avatar);
    this.users.push(user);
    return user;
  },
  getUserById(id) {
    return this.users.find(user => user.id === id);
  },
  getAll() {
    return this.users;
  },
};

const shouldUpdateParrot = (message, parrot) => !(message.has_parrot === parrot);

const messageDatabase = {
  messages: [],
  parrotCount: 0,
  createMessage(content = defaults.MESSAGE, user = user()) {
    const message = Message(content, user, false, date());
    this.messages.push(message);
    return message;
  },
  getMessageById(id) {
    return this.messages.find(message => message.id === id);
  },
  getLast(lastCount = 0) {
    if (this.messages.length <= lastCount) {
      return this.messages;
    }
    return this.messages.slice(this.messages.length - lastCount, this.messages.length)
  },
  setParrot(id, parrot) {
    const message = this.getMessageById(id);

    if (message === undefined) {
      return false;
    }
    if (shouldUpdateParrot(message, parrot)) {
      if (parrot) {
        messageDatabase.parrotCount++;
      } else {
        messageDatabase.parrotCount--;
      }
      message.has_parrot = parrot;
    }

    return message;
  },
};

const listMessages = () => messageDatabase.getLast(defaults.BATCH_SIZE).concat().sort(sortMessages);

app.get("/me", (req, res) => {
  const { username, avatar } = req.query;
  const me = userDatabase.createUser(username, avatar);
  res.status(200).json(userDatabase.getUserById(me.id));
});

app.post("/messages", (req, res) => {

  const { author_id, message } = req.body;

  if (!author_id || !message) {

    const properties = [];
    !message && properties.push("message");
    !author_id && properties.push("author_id");

    res.status(400).json({
      type: "missing_property",
      error: "Um parâmetro requerido não foi informado",
      properties,
    });

    return;
  }

  if (!(req.query.stable === "true") && Math.random() < 0.25) {
    res.status(500).json({
      type: "internal_error",
      error: "Houve um erro inesperado",
    });

    return;
  }

  const user = userDatabase.getUserById(author_id);

  if (user === undefined) {
    res.status(404).json({
      type: "user_not_found",
      error: "O User informado não existe",
      user: author_id,
    });
    return;
  }

  res.status(200).json(messageDatabase.createMessage(message, user));
});

app.put("/messages/:messageId/parrot", (req, res) => {
  const { messageId } = req.params;
  const message = messageDatabase.setParrot(messageId, true);

  if (!message) {
    res.status(404).json({
      type: "message_not_found",
      error: "A Message informada não existe",
      message: messageId,
    });
    return;
  }

  res.status(200).json(message);
});

app.put("/messages/:messageId/unparrot", (req, res) => {
  const { messageId } = req.params;
  const message = messageDatabase.setParrot(messageId, false);

  if (!message) {
    res.status(404).json({
      type: "message_not_found",
      error: "A Message informada não existe",
      message: messageId,
    });
    return;
  }

  res.status(200).json(message);
});

app.get("/update-all", (req, res) => res.status(200).json({
  messages: listMessages(),
  parrots: messageDatabase.parrotCount
}));

server.listen(defaults.SERVER_PORT, () => console.log(`Server running at ${defaults.SERVER_PORT}`));
