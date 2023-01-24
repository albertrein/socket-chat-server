const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');

app.use('/assets', express.static('assets'))

app.get('/', (req, res) => {
    res.sendFile(__dirname +'/index.html')
})

app.get('/cript', (req, res) => {
    res.sendFile(__dirname +'/cript-teste.html')
})

const server = require('http').createServer(app);


const io = require('socket.io')(server, {
    cors: { origin: "*"}
});


io.on('connection', (socket) => {
    console.log('connection');
 
    socket.on('sendChatToServer', (message) => {
        console.log(message);

        // io.sockets.emit('sendChatToClient', message);
        socket.broadcast.emit('sendChatToClient', message);
    });
    
    socket.on("sendFile", (file) => {
        console.log(file);
        //console.log(file.toString('base64'));
        socket.broadcast.emit('receivedFiles', {"arquivo" : file.arquivo.toString('base64'), "extensao" : file.extensao, "arquivoNome" : file.arquivoNome});
    });

    socket.on('startTypingServer', (e) => {
        socket.broadcast.emit('typingStartClient', 'Alguém está digitando ...');
    });

    socket.on('stopTypingServer', (e) => {
        socket.broadcast.emit('typingStopClient', 'Alguém parou de digitar.');
    });

    socket.on('disconnect', (socket) => {
        console.log('Disconnect');
    });
});

server.listen(3000, () => {
    console.log('Server is running');
});