const path = require('path');
const express = require('express');
const app = express();

const publicPath = path.join(__dirname, '/../public/');
const port = process.env.PORT || 3000;
console.log(publicPath);

app.use(express.static(publicPath));

app.get('/', (req, res) => {
    console.log('hallo');
    
    res.sendFile(publicPath);
})

app.listen(3000, () => { console.log("Server is up on port" + port); })