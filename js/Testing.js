
//Cria comentarios, canais e usuarios falsos.
//Praticamente a simulação do servidor.
//Não gera fotos de perfil, e nem os usúarios que 
//comentam são os que estão no Pannel de usúarios.

//Bom para testes quando se desenvolve um projeto
//deste tipo sem internet.

const Testing = (_ => {

    //Channels que iremos ter
    //durante o teste.
    const TestChannels = [
        "Assembly
        "Javascript",
        "Lua",
        "Node",
        "Go",
        "Java",
        "Perl",
        "ActionScript",
        "Python",
    ]
    
    //Também gera canais bizarros se precizar.
    function generateBizarrousChannels() {
        u.array(u.randInt(5)).map(e => u.randWords).map(e => Channels.registerChannel(s))
    }
    
    //As fotos utilizadas.
    //Só tem uma, mas se colocar mais
    //virão aleatorias.
    const randPictures = [
        './img/profilepix.png'
    ]
    
    //Gera dados suficientes para um comentário.
    //Apenas gibberish.
    const createSigleChatPacket = e => ({
        userProfilePic: u.randItemOf(randPictures),
        senderName: u.randWords(10),
        date: u.getTime(),
        msgBody: u.randWords(500)
    })

    //Gera dados suficientes para varios comentários
    //em varios canais. 
    const createChatDataPayload = e => {
        const payload = {}
        TestChannels.map(s => payload[s] = u.array(u.randInt(10)).map(e => createSigleChatPacket()))
        return payload
    }
    //Gera dados suficientes para uma certa quantidade 
    //de comentários em alguns canais. 
    const createSizedDataPayload = e => {
        const payload = {}
        TestChannels.map(s => payload[s] = u.array(u.randInt(10)).map(e => createSigleChatPacket()))
        return payload
    }

    //Espalha gibberish por todos os canais.
    function randomlyGenerateComments() {
        Channels.updateChannels(createChatDataPayload())
    }

    //Usúarios de teste.
    const names = [
        'Cold Meson_06',
        'Flicker75',
        'TheOldMan',
        'Poodiepie',
        'BlueDude62',
        'FullMetal_67',
        'Wheatley_555'
    ]

    //Cria um novo usuario falso.
    const userFactory = e => ({
        avatar: u.randItemOf(randPictures),
        name: u.randWords(30),
        id: u.UUID(),
    })

    //Cria a lista de usuarios de teste.
    const buildArrayOfUsers = e => u.array(names.length).map(e => userFactory())

    //Cria uma lista de usuarios falsos de um tamanho especifico.
    const buildSizedArrayOfUsers = e => u.array(e).map(e => userFactory())
    
    //Registra todos os usuarios falsos.
    const registerFakeUsers = e => Users.registerUserList(buildArrayOfUsers())

    //Registra uma quantidade aleatoria de usuarios falsos.
    const registerRandAmountOfFakeUsers = e => Users.registerUserList(buildSizedArrayOfUsers(e))

    const options = {
        channel: {
            wordMaxLenght: 8,
            minTimeout: 1000,
            maxTimeout: 3000,
        },
        users: {
            maxSpawnAmount: 8,
            minSpawnAmount: 1,
            minTimeout: 1000,
            maxTimeout: 3000,
        },
        comments: {
            minTimeout: 1000,
            maxTimeout: 3000,
        }
    }
    
    let spawningChannels = false

    //Cria novos canais com intervalos.
    function spawnNextChannel() {
        if (spawningChannels) {
            const newChannelName = u.randWords(options.channel.wordMaxLenght)
            TestChannels.push(newChannelName)
            Channels.registerChannel(newChannelName)
            u.callAfter(spawnNextComment, u.randIntBetw(options.channel.minTimeout, options.channel.maxTimeout))
        }
    }
    
    //Para ou começa a criar canais.
    function toggleNewChannels() {
        spawningChannels = !spawningChannels
        if (spawningChannels) {
            spawnNextChannel()
            console.warn('Initializing channel random spawn logic.')
        } else {
            console.info('Disabling channel random spawn logic.')
        }
    }

    let spawningNewUsers = false
    
    //Cria novos usuarios.
    function spawnNextUser() {
        if (spawningNewUsers) {
            Users.registerUserList(registerRandAmountOfFakeUsers(u.randIntBetw(options.users.minSpawnAmount, options.users.maxSpawnAmount)))
            u.callAfter(spawnNextUser, u.randIntBetw(options.users.minSpawnTimeout, options.users.maxSpawnTimeout))
        }
    }

    //Começa ou para de criar novos usuarios.
    function toggleNewUsers() {
        spawningNewUsers = !spawningNewUsers
        if (spawningNewUsers) {
            spawnNextUser()
            console.warn('Initializing user random spawn logic.')
        } else {
            console.info('Disabling user random spawn logic.')
        }
    }

    //Cria novos comentarios com intervalos.
    function spawnNextComment() {
        if (spawningNewComments) {
            Channels.updateChannels(createChatDataPayload())
            u.callAfter(spawnNextComment, u.randIntBetw(options.comments.minTimeout, options.comments.maxTimeout))
        }
    }
    
    //Para ou começa a criar comentarios.
    function toggleFakeComments() {
        spawningNewComments = !spawningNewComments
        if (spawningNewComments) {
            spawnNextComment()
            console.warn('Initializing random fake comment spawn logic.')
        } else {
            console.info('Disabling random fake comment spawn logic.')
        }
    }

    //Para de gerar dados.
    function stopAll() {
        spawningNewComments = false
        spawningChannels = false
        spawningNewUsers = false
    }

    //API publica
    return {
        randomlyGenerateComments,
        registerFakeUsers,
        generateBizarrousChannels,
        toggleNewUsers,
        toggleFakeComments,
        toggleNewChannels,
        stopAll,
        options,
        
        //Faz todos os testes uma vez
        doAllTests() {
            TestChannels.map(s => Channels.registerChannel(s))
            registerFakeUsers()
            Channels.updateChannels(createChatDataPayload())
        }
    }

})()
