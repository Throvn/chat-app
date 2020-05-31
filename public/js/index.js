let lastMsgFrom;

$('.toast').toast({autohide: false});
$('.toast').toast('show')

//Elements
const $messageForm = $('#message-form');
const $locationButton = $('#send-location');
const $messageFormInput = $messageForm.find('input');
let $searchBar;

const $messages = $('#messages');

//Templates
const adminMessageTemplate = $('#admin-message-template').html();
const messageTemplate = $('#message-template').html();
const myMessageTemplate = $('#my-message-template').html();
const locationTemplate = $('#location-template').html();
const myLocationTemplate = $('#my-location-template').html();
const toastTemplate = $('#toast-template').html();
const sidebarTemplate = $('#sidebar-template').html();
const navbarTemplate = $('#navbar-template').html();

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
        } else if (name === msg.from) {
            
            html = Mustache.render(myMessageTemplate, {
                message: msg.text,
                createdAt: moment(msg.createdAt).format('HH:mm')
            });
        } else {
            if (lastMsgFrom === msg.from) msg.from = '';
            else lastMsgFrom = msg.from;

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
        users = users.filter(user => name !== user.username)
        const html1 = Mustache.render(sidebarTemplate, {
            users,
            name,
            heading: users.length === 1 ? '1 Participant' : `${users.length} Participants`
        })
        $('#sidebar-users').html(html1)
        $searchBar = $('#search-participants')

        const html2 = Mustache.render(navbarTemplate, {
            room
        })
        $('#navbar-chat').html(html2)
    })

    socket.on('newLocaton', function(loc) {
        
        const time = new Date().getTime();
        let template = locationTemplate;

        if (name === loc.from) {
            template = myLocationTemplate;
        }

        if ( lastMsgFrom === loc.from) loc.from = '';
        else lastMsgFrom = loc.from;

        //Append new Map container
        $messages.append(Mustache.render(template, { 
            name: loc.from,
            mapId: "map"+time,
            time: moment(loc.createdAt).format('HH:mm'),
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

        $('#message-container').animate({scrollTop: $('#message-container')[0].scrollHeight}, "fast");
    })

$messageForm.on('submit', function (e) {
    console.log(e)
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

function searchParticipants () {
    const input = $searchBar.val().toLowerCase()
    $('#users').children().each(function (index, element) {
        if (!element.children[0].textContent.toLowerCase().includes(input)) 
            element.style.display = 'none';
        else element.style.display = 'inline-block';
    })
}

$("body").tooltip({ selector: '[data-toggle="tooltip"]' });