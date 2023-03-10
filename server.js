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

const usuarios = {};

io.on('connection', (socket, next) => {
    console.log('connection', socket.request._query['socketUserName']);
    if(socket.request._query['socketUserName']){
        adicionaNovoUsuario(socket.id, socket.request._query['socketUserName']);
    }else{
        adicionaNovoUsuario(socket.id, arrayNomesUsuariosAleatorios[getRandomNumber(arrayNomesUsuariosAleatorios.length)] + ' ' + arrayNomesUsuariosAleatorios[getRandomNumber(arrayNomesUsuariosAleatorios.length)]);
    }
    socket.on('sendChatToServer', (message) => {
        console.log(message);

        // io.sockets.emit('sendChatToClient', message);
        socket.broadcast.emit('sendChatToClient', message);
    });

   /* socket.on('changeUserName', messageObj => {
        adicionaNovoUsuario(socket.id, arrayNomesUsuariosAleatorios[getRandomNumber(arrayNomesUsuariosAleatorios.length)] + ' ' + arrayNomesUsuariosAleatorios[getRandomNumber(arrayNomesUsuariosAleatorios.length)]);
    })*/

    socket.on('sendMessageTo', messageObj => {
        io.to(messageObj.to).emit('sendMessageToUser', {"message":messageObj.message, "from":messageObj.from, "to":messageObj.to});
    });
    
    socket.on("sendFile", (file) => {
        console.log(file);
        //console.log(file.toString('base64'));
        socket.broadcast.emit('receivedFiles', {"arquivo" : file.arquivo.toString('base64'), "extensao" : file.extensao, "arquivoNome" : file.arquivoNome, "tamanho": file.tamanho});
    });

    socket.on('startTypingServer', (e) => {
        socket.broadcast.emit('typingStartClient', 'Algu??m est?? digitando ...');
    });

    socket.on('stopTypingServer', (e) => {
        socket.broadcast.emit('typingStopClient', 'Algu??m parou de digitar.');
    });

    socket.on('disconnect', () => {
        console.log('Disconnect', socket.id);
        removeUsuario(socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server is running');
});

adicionaNovoUsuario = (socketId, nomeUsuario) => {
    console.log('Nova conexao:',socketId, nomeUsuario);
    usuarios[socketId] = {'socketId' : socketId, 'userName' : nomeUsuario};
    console.log(JSON.stringify(usuarios));
    io.sockets.emit('updateUsersList', JSON.stringify(usuarios));
    //sendNewUserListToAllActiveUsers();
    //console.log(nomeUsuario);
    //adiciona usuario a um grupo caso necess??rio
}

removeUsuario = (socketId) => {
    delete usuarios[socketId];
    io.sockets.emit('updateUsersList', JSON.stringify(usuarios));
}

/*sendNewUserListToAllActiveUsers = _ => {
    for (const chave in usuarios){
        console.log('>>',usuarios[chave].socketId);
        io.to(usuarios[chave].socketId).emit('sendChatToClient', 'U2FsdGVkX1/YCYmftECDtEkmqqaGJl6/UeZ7hNbK0cI=');
    }
}*/

getSocketBySocketId = (socketId) => usuarios[socketId];

getRandomNumber = (limitMax) => Math.floor(Math.random() * limitMax);

/*
    io.to(usuarios[chave].socketId).emit -> Envia para usu??rio especifico
    io.sockets.emit -> Envia para todos
    socket.broadcast.emit -> Envia para todos exceto o atual remetente
*/