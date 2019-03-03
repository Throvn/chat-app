$('.toast').toast({autohide: false});
$('.toast').toast('show')

//Elements
const $messageForm = $('#message-form');
const $locationButton = $('#send-location');
const $messageFormInput = $messageForm.find('input');

const $messages = $('#messages');

//Templates
const adminMessageTemplate = $('#admin-message-template').html();
const messageTemplate = $('#message-template').html();
const locationTemplate = $('#location-template').html();
const toastTemplate = $('#toast-template').html();
const sidebarTemplate = $('#sidebar-template').html();

//Options
const {name, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

var socket = io();
    socket.on("connect", function() {
        console.log("connected to server");
    })

    socket.on('disconnect', function() {
        socket.emit('disconnect')
        
    })
    socket.on('newMessage', function(msg) {
        let html;
        if(msg.from === "Admin") {
            html = Mustache.render(adminMessageTemplate, {
                message: msg.text,
                time: moment(msg.createdAt).format('HH:mm')
            });
        } else {
            html = Mustache.render(messageTemplate, {
                name: msg.from,
                message: msg.text,
                createdAt: moment(msg.createdAt).format('HH:mm')
            });
        }
        
        $messages.append(html);
        $('#message-container').animate({scrollTop: $('#message-container')[0].scrollHeight},"fast");
    })

    socket.on('roomData', ({room, users}) => {
        console.log(room, users);
        const html = Mustache.render(sidebarTemplate, {
            room,
            users
        })
        $('#sidebar-users').html(html)
    })

    socket.on('newLocaton', function(loc) {
        //Append new Map container
        const time = new Date().getTime();
        $messages.append(Mustache.render(locationTemplate, { 
            mapId: "map"+time,
            time: moment(loc.createdAt).format('HH:mm'),
            name: loc.from
        }))

        //Create new Map in the container created above
        const map = L.map('map'+time, {
            center: [loc.lat, loc.lon],
            zoom: 13
        })
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        L.marker([loc.lat, loc.lon]).addTo(map); //Create Marker which points on the position of the User

        $('#message-container').animate({scrollTop: $('#message-container')[0].scrollHeight},"fast");
    })

$messageForm.on('submit', function (e) {
    e.preventDefault();
    $messageFormInput.focus();
    $messageForm.attr('disabled', 'true');
    if($('[name=message]').val() !== '') {
    const message = $('[name=message]').val()
        socket.emit('createMessage', message, function (err) {
            if(err) {
                const toast = Mustache.render(toastTemplate,
                    {
                        type: "⚠️ Error",
                        text: err,
                    }
                )
                $('body').append(toast);
                $('.toast').toast({delay: 5000})
                $('.toast').toast('show')
                
                setTimeout(() => {
                    location.href = './'
                }, 5000)
                return;
            }
            $messageForm.removeAttr('disabled');
        })
    }
    $('[name=message]').val('');
})


$locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation not supportet by your browser.')
    }

    $locationButton.attr('disabled','true');

    navigator.geolocation.getCurrentPosition(function(position) {
        const location = { user: "User", lat: position.coords.latitude, long: position.coords.longitude }
        socket.emit('sendLocation', location, function(msg) {
            console.log(msg)
            $locationButton.removeAttr('disabled');
        })
    })
})

socket.emit('join', {name, room}, function (err) {
    if(err) {
        const toast = Mustache.render(toastTemplate,
            {
                type: "Error",
                text: error,
            }
        )
        $('body').append(toast);
        alert(err)
        location.href = './'
    }
});