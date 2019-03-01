var socket = io();
    socket.on("connect", function() {
        console.log("connected to server");
    })

    socket.on('disconnect', function() {
        console.log('Disconnect');
        
    })
    socket.on('newMessage', function(msg) {
        let li = $('<li></li>');
        li.text(`${msg.from}: ${msg.text}`);
        $('#messages').append(li);
        
    })

$('#message-form').on('submit', function (e) {
    e.preventDefault();

    socket.emit('createMessage', {
        from: "User",
        text: $('[name=message]').val()
    }, function () {
        
    })
})