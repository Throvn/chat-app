const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const Filter = require('bad-words');

const {generateMessage, generateLocation} = require('./utils/message.js');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users.js');

const app = express();
const server = http.createServer(app);
const io = socketIO(server)

const publicPath = path.join(__dirname, '/../public/');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    
    socket.on('disconnect', () => { 
        const removedUser = removeUser(socket.id);
        if(removedUser) {
            io.to(removedUser.room).emit('newMessage', generateMessage("Admin", removedUser.username+' disconnected'));
            io.to(removedUser.room).emit('roomData', {
                room: removedUser.room,
                users: getUsersInRoom(removedUser.room)
            })
        }
    })

    socket.on('join', function({name, room}, callback){
        const user = addUser(name, room, socket.id);
        if(!user) {
            return callback(error)
        }
        socket.join(user.room);

        socket.emit('newMessage', generateMessage("Admin", "You joined the chatroom"));
        socket.broadcast.to(user.room).emit('newMessage', generateMessage("Admin", user.username+" joined"));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('createMessage', (msg, callback) => {
        const filter = new Filter();
        const user = getUser(socket.id);
        if(!user) { return callback('Error: This Username is already in use.') }
        if(filter.isProfane(msg)) {
            return callback('Profanity is not allowed');
        }
        io.to(user.room).emit('newMessage', generateMessage(user.username, msg));
        callback();
    })

    socket.on('sendLocation', (pos, callback) => {
        const user = getUser(socket.id);
        if(user) {
            io.to(user.room).emit('newLocaton', generateLocation(user.username, pos))
            callback('Location shared!');
        }
    })

});

server.listen(port, () => { console.log("Server is up on port" + port); })