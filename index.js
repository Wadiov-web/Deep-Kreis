const express = require('express')
const app = express()
const path = require('path')
const router = require('./router/router')
const session = require('express-session')
// const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const dbController = require('./router/db.controller')

require('dotenv').config()

const server = require('http').createServer(app)
const socketIO = require('socket.io')(server)

// mongoose.connect('mongodb://localhost/warriors')
// .then(() => {
// 	console.log('Database connection succeeded')
// }).catch(err => {
// 	console.log('Database connection failed' + '\n' + err)
// })


app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/views')))
app.use(express.static(path.join(__dirname, '/uploads')))

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 60 * 1000 * 60 * 24 * 2,
	}
}))


app.use(router)


const port = process.env.PORT

server.listen(port, () => {
	console.log(`server is listening on port ${port}`)
})


let users = []
socketIO.on('connection', (socket) => {
    console.log('a user is connected')
	console.log(socket.id)
    console.log(users)

	socket.on('signin', data => {
        console.log('from signin')
        console.log(data)
        let existed = false
        users.forEach(user => {
            if(user.userId == data.userId){
                user.sid = socket.id
                existed = true
            }
        })
        if(!existed){
            users.push({userId: data.userId, username: data.username, sid: socket.id})
        }

        console.log(users)
    })

    socket.on('messagePrivate', (packet) => {
        console.log(packet)
        let connected = false
        users.forEach(user => {
            if(user.userId == packet.toId){
                connected = true
                socketIO.to(user.sid).emit('incoming', packet)
            }
        })
        dbController.addMessage(packet.msg, packet.fromId, packet.fromId, packet.toId)
    })
})