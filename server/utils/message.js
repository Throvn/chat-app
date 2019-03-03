const generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocation = (from, loc) => {
    return {
        from,
        lat: loc.lat,
        lon: loc.long,
        createdAt: new Date().getTime()
    }
}
module.exports = {generateMessage, generateLocation}