const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use('/static', express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'))
})

let users = []
let connections = []
let history = []

io.on('connection', (socket) => {
    connections.push(socket)
    console.log('[CONNECT] Connected clients: %s', connections.length)
    socket.emit('history', history)

    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1)
        console.log('[DISCONNECT] Connected clients: %s', connections.length)
        io.emit('users', {
            users,
            username: socket.username,
            action: 'disconnected'
        })
        if(socket.username) {
            users.splice(users.indexOf(socket.username), 1)
        }
    })

    socket.on('new user', (data) => {
        users.push(data)
        socket.username = data
        io.emit('users', {
            users,
            username: socket.username,
            action: 'connected'
        })
    })

    socket.on('chat message', (data) => {
        const payload = {
            user: socket.username,
            msg: data
        }
        io.emit('new message', payload)
        history.push(payload)
        if(history.length > 10)
            history.shift()
    })
})

http.listen(3000, () => {
    console.log('Server running...')
})
