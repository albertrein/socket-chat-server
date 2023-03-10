
let mensagens = [];
const gerenciadorMensagens = {
  "geral": []
};
localStorage.getItem('currentColor') ? changeColor(localStorage.getItem('currentColor')) : '';

$(function () {


  $('#userColor').val(localStorage.getItem('currentColor') ?? '#16da40');

  $('#btn-access').click(function (e) {
    e.preventDefault();
    let name = $('#userName').val();
    if (name == "" || (name.length < 5 || name.length > 40)) {
      $('#userName').addClass('error')
      return;
    }

    changeColor($('#userColor').val())
    $('#userName').removeClass('error')
    $('.modal').removeClass('active');
    socketFunctions(name);
  });
  $('#color').click(function (e) {
    e.preventDefault();
    $('#colorChange').trigger('click');
  });

  $('#send-file').click(function (e) {
    e.preventDefault();
    $('#file').trigger('click');

  });

  $('#crypt-key').click(function (e) {
    e.preventDefault();
    $(this).toggleClass('active');
  });

  $('#chave').change(function (e) {
    e.preventDefault();
    renderListaMensagens();
  });

  $('#logout').click(function (e) {
    e.preventDefault();
    localStorage.clear();
    location.reload();
  });

  socketFunctions = (socketUserName) => {
    let ip_address = '192.168.1.36';
    let socket_port = '3000';
    let socket = io(ip_address + ':' + socket_port, { query: "socketUserName=" + socketUserName });
    let chatInput = $('#chatInput');

    chatInput.keypress(function (e) {
      let message = $(this).html();
      message = stringToHTML(message.trim());
      if (message.textContent.trim() == '') {
        if (message.getElementsByTagName('img')[0]) {
          message = $(this).html();
        } else {
          return;
        }
      } else {
        message = $(this).html().trim();
        message = message.replace(/&nbsp;/g, '');
      }
      if (e.which === 13 && !e.shiftKey) {
        chaveAtual = getChaveCriptografia();
        if (getSelectedUser() != 'geral') {
          socket.emit('sendMessageTo', { "message": encrypt(message, chaveAtual), "to": getSelectedUser(), "from": localStorage.userId });
          adicionaNovaMensagem('meu', encrypt(message, chaveAtual), getSelectedUser());
        } else {
          socket.emit('sendChatToServer', encrypt(message, chaveAtual));
          adicionaNovaMensagem('meu', encrypt(message, chaveAtual));
        }
        renderListaMensagens();
        chatInput.html('');
        return false;
      }
    });

    socket.on('sendChatToClient', (message) => {
      adicionaNovaMensagem('outros', message);
      renderListaMensagens();
    });

    socket.on('typingStartClient', (message) => {
      document.getElementById('typingSpan').style.display = 'block';
    });

    socket.on('typingStopClient', (message) => {
      document.getElementById('typingSpan').style.display = 'none';
    });

    socket.on('sendMessageToUser', (message) => {
      console.log('Remetente:', message);
      adicionaNovaMensagem('outros', message.message, message.from);
      renderListaMensagens();
    });

    socket.on('receivedFiles', fileReceived => {
      if (fileReceived.extensao.includes('image')) {
        imgSrc = `data:${fileReceived.extensao};base64,${fileReceived.arquivo}`;
        //adicionaNovaImagem('outros', imgSrc);
        adicionaNovaImagem('outros', imgSrc, fileReceived.arquivoNome);
      } else {
        fileSrc = `data:${fileReceived.extensao};base64,${fileReceived.arquivo}`;
        //adicionaNovoDocumento('outros', fileSrc);
        adicionaNovoDocumento('outros', fileSrc, { "arquivoNome": fileReceived.arquivoNome, "tamanho": fileReceived.tamanho });
      }
      renderListaMensagens();
      //document.body.appendChild(img);
    });

    socket.on('updateUsersList', listaUsuarios => {
      listaUsuarios = JSON.parse(listaUsuarios);
      console.log(socket.id);
      if (!listaUsuarios) {
        return;
      }
      storeUserIdentification(listaUsuarios[socket.id]);
      delete listaUsuarios[socket.id];
      renderUsuariosAtivos(listaUsuarios);
    });

    document.getElementById('file').addEventListener('change', function () {
      let arquivo = this.files[0];
      socket.emit('sendFile', { "arquivo": arquivo, "extensao": arquivo.type, "tamanho": arquivo.size, "arquivoNome": arquivo.name });
      if (arquivo.type.includes('image')) {
        //adicionaNovaImagem('meu', URL.createObjectURL(arquivo));
        adicionaNovaImagem('meu', URL.createObjectURL(arquivo), arquivo.name);
      } else {
        //adicionaNovoDocumento('meu', URL.createObjectURL(arquivo));
        adicionaNovoDocumento('meu', URL.createObjectURL(arquivo), { "arquivoNome": arquivo.name, "tamanho": arquivo.size });
      }
      renderListaMensagens();
    });


    document.addEventListener("click", (event) => {
      var element = event.target;
      if (element.name = "userMessageTo") {
        renderListaMensagens();
      }
    });

    document.getElementById('chatInput').addEventListener('focus', () => {
      socket.emit('startTypingServer', 'usu??rio digitando');
    });
    document.getElementById('chatInput').addEventListener('focusout', () => {
      socket.emit('stopTypingServer', 'usu??rio digitando');
    });

  }

  if (localStorage.getItem('userName')) {
    socketFunctions(localStorage.getItem('userName'));
  } else {
    $('#login').addClass('active');
  }
});



adicionaNovaMensagem = (origem, novaMensagem, from = 'geral') => {
  /*if(from == 'geral'){
    mensagens.push({ "origem": origem, "mensagem": novaMensagem, "type": 'mensagem' });
    gerenciadorMensagens[from].push({ "origem": origem, "mensagem": novaMensagem, "type": 'mensagem' });
    return;
  }*/
  try {
    gerenciadorMensagens[from].push({ "origem": origem, "mensagem": novaMensagem, "type": 'mensagem' });
  } catch (e) {
    gerenciadorMensagens[from] = [];
    gerenciadorMensagens[from].push({ "origem": origem, "mensagem": novaMensagem, "type": 'mensagem' });
  }
}

adicionaNovaImagem = (origem, imagemSrc, nomeImagem, from = 'geral') => {
  /*if(from == 'geral'){
    mensagens.push({ "origem": origem, "mensagem": imagemSrc, "type": 'imagem', "nomeArquivo": nomeImagem });
    return;
  }*/
  try {
    gerenciadorMensagens[from].push({ "origem": origem, "mensagem": imagemSrc, "type": 'imagem', "nomeArquivo": nomeImagem });
  } catch (e) {
    gerenciadorMensagens[from] = [];
    gerenciadorMensagens[from].push({ "origem": origem, "mensagem": imagemSrc, "type": 'imagem', "nomeArquivo": nomeImagem });
  }
}

adicionaNovoDocumento = (origem, fileSrc, documento, from = 'geral') => {
  /*if(from == 'geral'){
    mensagens.push({ "origem": origem, "mensagem": fileSrc, "type": 'documento', "nomeArquivo": documento.arquivoNome, "tamanho": documento.tamanho });
    return;
  }*/
  try {
    gerenciadorMensagens[from].push({ "origem": origem, "mensagem": fileSrc, "type": 'documento', "nomeArquivo": documento.arquivoNome, "tamanho": documento.tamanho });
  } catch (e) {
    gerenciadorMensagens[from] = [];
    gerenciadorMensagens[from].push({ "origem": origem, "mensagem": fileSrc, "type": 'documento', "nomeArquivo": documento.arquivoNome, "tamanho": documento.tamanho });
  }
}

renderListaMensagens = () => {
  $('.chat-content ul').html('');
  chaveAtual = getChaveCriptografia();
  let mensagens = gerenciadorMensagens[getSelectedUser()] || [];
  mensagens.forEach((msg) => {
    if (msg.type == "imagem") {
      $('.chat-content ul').append(`<li class='${msg.origem}'><img alt='${msg.nomeArquivo}' src='${msg.mensagem}'></li>`);
    } else if (msg.type == "mensagem") {
      let mensagemImpressao = decrypt(msg.mensagem, chaveAtual);
      if (mensagemImpressao != '') {
        mensagemImpressao = recognizeLinkInMessage(mensagemImpressao);
        $('.chat-content ul').append(`<li class='${msg.origem}'>${mensagemImpressao}</li>`);
      }
    } else {
      $('.chat-content ul').append(`<li class='${msg.origem}'>
      <a class="document" download='${msg.nomeArquivo}' href='${msg.mensagem}'>
      <i class="fa fa-file-arrow-down fa-2x"></i><span><b>${msg.nomeArquivo}</b><small>${niceBytes(msg.tamanho)}</small>
      </span></a></li>`);
    }
  });
  $('.chat-content ul').animate({ scrollTop: 99999999999 }, 250);
}

renderUsuariosAtivos = (listaUsuariosAtivos) => {
  let divUsuarios = $('.chat-users');
  divUsuarios.html('');
  for (const chave in listaUsuariosAtivos) {
    divUsuarios.append(`<li id=${chave}><input type='radio' name='userMessageTo' value=${listaUsuariosAtivos[chave].socketId}>${listaUsuariosAtivos[chave].userName}</input></li>`);
  }
}

getSelectedUser = () => {
  let userChecked = $('input[name=userMessageTo]:checked').val();
  if (userChecked) {
    return userChecked;
  }
  return "geral";
}

getChaveCriptografia = () => $('#chave').val();