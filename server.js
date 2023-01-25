const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const arrayNomesUsuariosAleatorios = require('./assets/js/nome_usuarios');

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

const usuarios = [];

io.on('connection', (socket) => {
    console.log('connection');
    adicionaNovoUsuario(socket.id, arrayNomesUsuariosAleatorios[getRandomNumber(arrayNomesUsuariosAleatorios.length)] + ' ' + arrayNomesUsuariosAleatorios[getRandomNumber(arrayNomesUsuariosAleatorios.length)], socket);
    
    socket.on('sendChatToServer', (message) => {
        console.log(message);

        // io.sockets.emit('sendChatToClient', message);
        socket.broadcast.emit('sendChatToClient', message);
    });
    
    socket.on("sendFile", (file) => {
        console.log(file);
        //console.log(file.toString('base64'));
        socket.broadcast.emit('receivedFiles', {"arquivo" : file.arquivo.toString('base64'), "extensao" : file.extensao, "arquivoNome" : file.arquivoNome, "tamanho": file.tamanho});
    });

    socket.on('startTypingServer', (e) => {
        socket.broadcast.emit('typingStartClient', 'Alguém está digitando ...');
    });

    socket.on('stopTypingServer', (e) => {
        socket.broadcast.emit('typingStopClient', 'Alguém parou de digitar.');
    });

    socket.on('disconnect', (socket) => {
        console.log('Disconnect', socket);
    });
});

server.listen(3000, () => {
    console.log('Server is running');
});

function adicionaNovoUsuario(socketId, nomeUsuario, socketObj){
    usuarios.push({'socketId' : socketId, 'userName' : nomeUsuario, 'socketObj' : socketObj });
    console.log(nomeUsuario);
}

getRandomNumber = (limitMax) => Math.floor(Math.random() * limitMax);