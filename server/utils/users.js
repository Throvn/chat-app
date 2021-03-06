const users = []

//addUser
const addUser = (name, room, id) => {
    //Clean the data
    username = name.trim()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room) {
        return { error: 'Username and room are required' }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser) {
        return {
            error: 'Username is in use.'
        }
    }

    //Store user
    const user = {id, username, room}
    users.push(user)
    return user;
}

//removeUser
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}
//getUser
const getUser = (id) => {
    return users.find(user => user.id === id)
}

//getUsersInRoom
const getUsersInRoom = (room) => {
    if(room) { room = room.trim().toLowerCase() }
    let usersInRoom = [];
    users.forEach((user) => {
        if(user.room === room) { usersInRoom.push(user) }
    });
    return usersInRoom;
}

module.exports = {addUser, removeUser, getUser, getUsersInRoom}