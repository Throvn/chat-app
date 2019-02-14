const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
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
})

server.listen(3000, () => { console.log("Server is up on port" + port); })