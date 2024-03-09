const express = require('express')
const app = express()
const path = require('path')
const router = require('./router/router')
const session = require('express-session')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')


require('dotenv').config()

// const server = require('http').createServer(app)
// const socketIO = require('socket.io')(server, {
// 	cors: {
// 		origin: [process.env.CLIENT1, process.env.CLIENT2],
// 		methods: ["GET", "POST", "UPDATE", "DeLETE"],
// 		credential: true
// 	}
// })

mongoose.connect('mongodb://localhost/warriors')
.then(() => {
	console.log('Database connection succeeded')
	
}).catch(err => {
	console.log('Database connection failed' + '\n' + err)
})




app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/views')))
app.use(express.static(path.join(__dirname, '/uploads')))

app.use(session({
	secret: 'lkjhhhjj',
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 60 * 1000 * 60 * 24 * 2,

	}
}))



app.use(router)

const port = process.env.PORT

app.listen(port, () => {
	console.log(`server is listening on port ${port}`)
})