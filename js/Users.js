//Este módulo apenas cuida de adicionar os usúarios
//a lista conforme eles aparecem.
//Além de lidar com o `currentUser`

DOMRenderer.registerTemplate('userTemplate')
    `<div class="userItem">
    <img class="userItemPicture" src=IMAGE_LOCATION />
    <p class="userNameInList">USER_NAME</p><br>
    <p class="lastSeen">Last Seen LAST_ACTIVE</p>
</div>
`

//Santa poluição do objeto `window`! Porêm este modulo ficou bem em um objeto.
const userTemplate = DOMRenderer.getTemplate('userTemplate')

//Lança erros se nessesario.
//Como estes erros só são possiveis com
//problemas no server e ele não expoe uma api para lidar
//com isso não há muito o que se fazer além de logar no console.
function validateUser(userData = {}) {
    //BUG; deve se registar por id não por nome.
    if (Users.getUserByID(userData.id)) {
        console.log(`The user ${userData.name} was aleardy registered.`)
        return false
    }
    if (!u.validateObject(userData, ['avatar', 'name', 'id'])) {
        console.error('Falied to register the user: ', userData, ' invalid object.')
        return false
    }
    return true
}

//Gerencia, Amarzena e Registra usuarios. 
const Users = {
    users: {},
    me: {},
    userListRenderer: new DOMRenderer.FixedRendererTarget('.usersMenu'),
    currentUserIsRegistered: false,
    //Registra um usuario com informações da REST API.
    registerUser(userData = {}) {
        if (!validateUser(userData)) {
            return
        }
        userData.lastActive = u.getTime()
        this.users[userData.id] = userData
        this.userListRenderer.renderTemplate(userTemplate, {
            IMAGE_LOCATION: userData.avatar,
            USER_NAME: userData.name,
            LAST_ACTIVE: userData.lastActive,
        })
    },
    //Registra o usuario atual com informações da REST API.
    registerCurrentUser(data) {
        const users = document.getElementsByClassName('currentUserPicturePlaceHolder')
        for (let i = 0; i < users.length; i++) {
            users.item(i).src = data.avatar
        }
        this.currentUserIsRegistered = true
        this.me = data
        Channels.drainQueue()   //Caso o usuario tenha de alguma forma conseguido escrever mesagens enquanto 
    },                          //ele não estava registrado, talvez o GET '/me' esteja demorando. 
    //Retorna um usuario pelo seu id.
    getUserByID(id = "") {
        return this.users[id]
    },
    //Registra uma lista de usuarios
    registerUserList(usersData = []) {
        usersData.map(d => this.registerUser(d))
    }
}
