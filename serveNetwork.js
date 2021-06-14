
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {

    res.sendFile(path.join(__dirname, '/index.html'));
})

const port = process.env.PORT|| 3000;

var server = app.listen(port, function () {
    var host = server.address().address
    var portN = server.address().port

    console.log("Example app listening at http://%s:%s", host, portN)
})