const root = 'http://localhost:3000';

const me = {
  id: null,
  name: null,
  avatar: null,
  previousMessageIndex: 0,
  messagesSent: [],
  resetPreviousMessage() {
    this.previousMessageIndex = 0;
  },
  getPreviousMessage() {
    if (this.previousMessageIndex < this.messagesSent.length)
      return this.messagesSent[this.previousMessageIndex++];
  },
  getNextMessage() {
    if (this.previousMessageIndex > 0)
      return this.messagesSent[this.previousMessageIndex--];
  }
};

const $$ = selector => {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    return false
  } else if (elements.length === 1) {
    return elements[0];
  } else {
    return new Array.from(elements);
  }
};

const formatDate = date => new Date(Date.parse(date)).toString().split(' ')[4];

const formatParrot = parrot => parrot
  ? "./images/parrot.gif"
  : "./images/parrot.png";

const json = obj => obj.json();

const createMe = (username, avatar) => fetch(`${root}/me?username=${username}&avatar=${encodeURIComponent(avatar)}`).then(json);

const sendMessage = (author_id, message) => fetch(`${root}/messages?stable=true`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ author_id, message }),
}).then(json);

const unparrot = id => fetch(`${root}/messages/${id}/unparrot`, { method: "PUT" });

const parrot = id => fetch(`${root}/messages/${id}/parrot`, { method: "PUT" });

const updateAll = () => fetch(`${root}/update-all`).then(json);

const recursivePrompt = msg => {
  const value = prompt(msg);
  return value ? value : recursivePrompt(msg);
};

const persist = question => {
  let value = localStorage.getItem(question, question);

  if (value) {
    return value;
  }

  value = recursivePrompt(question);
  localStorage.setItem(question, value);
  return value;
};

const parrotCounter = $$('#parrot-counter');
const form = $$('#form');
const sendButton = $$('#send-button');
const profilePicture = $$("#profile-pick");
const chat = $$("#center");
const chatContainer = $$("#chat");

const updateScrool = () =>
  (chatContainer.scrollTop + 300 + chatContainer.getBoundingClientRect().height > chatContainer.scrollHeight) &&
  chatContainer.scroll({ top: chatContainer.scrollHeight, behavior: 'smooth' });

const update = async () => {
  const { parrots, messages } = await updateAll();
  parrotCounter.innerText = parrots;
  chat.innerHTML = messages.map(buildMessage).join('\n');
  updateScrool();
};

const login = async (username, profile) => {
  const userName = username || recursivePrompt('Enter your user name') //persist('Enter your user name');
  const avatarUrl = profile || recursivePrompt('Enter your avatar image url') //persist('Enter your avatar image url');
  const response = await createMe(userName, avatarUrl.length > 10 ? avatarUrl : "https://avatars3.githubusercontent.com/u/9648865?s=460&v=4");
  Object.assign(me, response);
  profilePicture.src = avatar;
  await update();
  chatContainer.scroll({ top: chatContainer.scrollHeight });
  setInterval(update, 3000);
};

const updateParrot = async (messageId, bool) => {
  if (!JSON.parse(bool)) {
    await parrot(messageId);
  } else {
    await unparrot(messageId);
  }
  update();
};

const buildMessage = ({ id: message_id, content, has_parrot, created_at, user: { avatar, name, id: user_id } }) => `
<div class="chat-item ${has_parrot ? "has-parrot" : ''}" id="${message_id}" data-user-id="${user_id}">
  <div class="avatar-container">
    <img class="avatar" src="${avatar}">
    </img>
  </div>
  <div class="content-container">
    <div class="metadata">
      <spam class="user-name">${name}</spam>
      <div class="bullet"></div>
      <spam class="send-time">${formatDate(created_at)}</spam>
      <div class="bullet"></div>
      <div class="message-parrot" onclick="updateParrot('${message_id}', '${has_parrot}')">
        <img src="${formatParrot(has_parrot)}" />
      </div>
    </div>
    <div class="message-text">
      ${content}
    </div>
  </div>
</div>
`;

const formHasFocus = () => document.activeElement.isSameNode(form);

const emitMessage = async () => {
  me.resetPreviousMessage();
  const messageText = form.value;

  if (!messageText.trim()) {
    return;
  }

  form.value = "";
  await sendMessage(me.id, messageText).catch(console.warn);
  me.messagesSent.unshift(messageText);
  update();
};

sendButton.addEventListener('click', emitMessage);

addEventListener('keydown', ({ shiftKey, keyCode }) => {
  if (keyCode === 13 && !shiftKey) { //Enter and not shift
    emitMessage();
  }

  if (keyCode === 38 && formHasFocus()) { //Up
    const message = me.getPreviousMessage();
    if (message) {
      form.value = message;
    }
  }

  if (keyCode === 40 && formHasFocus()) { //Down
    const message = me.getNextMessage();
    if (message) {
      form.value = message;
    }
  }
});

addEventListener('DOMContentLoaded ', login);
