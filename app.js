'use strict'

// modules
const express = require('express')
const path = require('path')
const logger = require('morgan')
const sequelize = require('./sequelize')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('express-flash')
const { createServer } = require("node:http")
const { Server } = require("socket.io")
const { Message, Contact } = require('./sequelize')

// session middleware
const sessionMiddleware = session({
    secret: 'mango', // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 60 }
})

// test db connection
sequelize.dbConnect()

// routes
var indexRouter = require('./routes/index')
var authRouter = require('./routes/auth')
var imagesRouter = require('./routes/images')
var contactsRouter = require('./routes/contacts')
var chatRoomRouter = require('./routes/chatRoom')

// app setup
const app = express()
const port = 3000
const httpServer = createServer(app)

app.set('views', path.join(__dirname, 'views')) // views path
app.set('view engine', 'ejs') // without this ejs won't work

app.use(express.static('public')) // directory css
app.use(express.static('pfp')) // directory immagini profilo
app.use(logger('dev')) // logger morgan
app.use(bodyParser.urlencoded({ extended: true }))
app.use(sessionMiddleware);
app.use(flash())

// routes usage
app.use('/', indexRouter)
app.use('/', authRouter)
app.use('/images', imagesRouter)
app.use('/contacts', contactsRouter)
app.use('/chatRoom', chatRoomRouter)

app.get('/logout', (req, res) => {
    const sessionId = req.session.user

    req.session.destroy(() => {
        // disconnect all Socket.IO connections linked to this session ID
        io.in(sessionId).disconnectSockets()
        res.redirect('/login')
    })
})

//favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/public/img/favicon.svg')
})

// socket
const io = new Server(httpServer)

io.engine.use(sessionMiddleware)

io.on("connection", (socket) => {
    const sessionId = socket.request.session.user || '';
    console.log(`${sessionId} is online.`);

    // Handle chat initiation
    socket.on('chatStart', ({ chatRoom }) => {
        console.log(`${sessionId} is joining room ${chatRoom}`);
        socket.join(chatRoom);

        // Optionally notify others in the room
        socket.to(chatRoom).emit('notification', {
            message: `${sessionId} has joined the chat.`
        });
    });

    // Handle sending messages
    socket.on('chat message', async ({ chatRoom, message }) => {
        console.log(`In "${chatRoom}" the following message was sent: ${message}`);

        // TODO: add contact to receiver if they receive a message
        // Broadcast the message to everyone in the room
        var receiver = await Contact.findOne({
            where: {
                chatRoom: chatRoom,
                owner: sessionId
            }
        })

        const contact = await Contact.findOne({
            where: {
                owner: receiver.dataValues.contact,
                contact: sessionId
            }
        })

        if (!contact)
            await Contact.create({ owner: receiver.dataValues.contact, contact: sessionId, chatRoom: receiver.dataValues.chatRoom })

        await Message.create({ from: sessionId, to: receiver.dataValues.contact, message: message, chatRoom: chatRoom })

        socket.to(chatRoom).emit('chat message', {
            chatRoom: chatRoom,
            sender: sessionId,
            message: message
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`${sessionId} has gone offline.`);
    });
});


httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
