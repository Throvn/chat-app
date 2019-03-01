const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const {generateMessage} = require('./utils/message.js');

const app = express();
const server = http.createServer(app);
const io = socketIO(server)

const publicPath = path.join(__dirname, '/../public/');
const port = process.env.PORT || 3000;
console.log(publicPath);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log("New User connected");
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
        
    })

    socket.on('createMessage', (msg) => {
        console.log(msg)
        io.emit('newMessage', generateMessage(msg.from, msg.text))
    })

    socket.emit('newMessage', generateMessage("Admin", "You joined the chatroom"));
    socket.broadcast.emit('newMessage', generateMessage("Admin", "New User joined"));

});

server.listen(3000, () => { console.log("Server is up on port" + port); })