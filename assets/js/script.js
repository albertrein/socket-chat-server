
let mensagens = [];

$(function () {

  let ip_address = '192.168.1.165';
  let socket_port = '3000';
  let socket = io(ip_address + ':' + socket_port);
  let chatInput = $('#chatInput');

  $('#send-file').click(function (e) {
    e.preventDefault();
    $('#file').trigger('click');

  });

  $('#crypt-key').click(function (e) {
    e.preventDefault();
    $(this).toggleClass('active');
  });

  chatInput.keypress(function (e) {
    let message = $(this).html();
    if (e.which === 13 && !e.shiftKey) {
      chaveAtual = $('#chave').val()
      socket.emit('sendChatToServer', encrypt(message, chaveAtual));
      adicionaNovaMensagem('meu', encrypt(message, chaveAtual));
      renderListaMensagens();
      chatInput.html('');
      return false;
    }
  });

  socket.on('sendChatToClient', (message) => {
    adicionaNovaMensagem('outros', message);
    renderListaMensagens();
  });

  socket.on('receivedFiles', fileReceived => {
    if (fileReceived.extensao.includes('image')) {
      imgSrc = `data:${fileReceived.extensao};base64,${fileReceived.arquivo}`;
      adicionaNovaImagem('outros', imgSrc);
    } else {
      fileSrc = `data:${fileReceived.extensao};base64,${fileReceived.arquivo}`;
      adicionaNovoDocumento('outros', fileSrc);
    }
    renderListaMensagens();
    //document.body.appendChild(img);
  });

  document.getElementById('file').addEventListener('change', function () {
    let arquivo = this.files[0];
    socket.emit('sendFile', { "arquivo": arquivo, "extensao": arquivo.type });
    if (arquivo.type.includes('image')) {
      adicionaNovaImagem('meu', URL.createObjectURL(arquivo));
    } else {
      adicionaNovoDocumento('meu', URL.createObjectURL(arquivo));
    }
    renderListaMensagens();
  });
});



adicionaNovaMensagem = (origem, novaMensagem) => {
  mensagens.push({ "origem": origem, "mensagem": novaMensagem, "type": 'mensagem' });
}

adicionaNovaImagem = (origem, imagemSrc) => {
  mensagens.push({ "origem": origem, "mensagem": imagemSrc, "type": 'imagem' });
}

adicionaNovoDocumento = (origem, fileSrc) => {
  mensagens.push({ "origem": origem, "mensagem": fileSrc, "type": 'documento' });
}

renderListaMensagens = () => {
  $('.chat-content ul').html('');
  chaveAtual = $('#chave').val()
  mensagens.forEach((msg) => {
    if (msg.type == "imagem") {
      $('.chat-content ul').append(`<li class='${msg.origem}'><img src='${msg.mensagem}'></li>`);
    } else if (msg.type == "mensagem") {
      $('.chat-content ul').append(`<li class='${msg.origem}'>${decrypt(msg.mensagem, chaveAtual)}</li>`);
    } else {
      $('.chat-content ul').append(`<li class='${msg.origem}'><a download='documento.pdf' href='${msg.mensagem}'>Documento</a></li>`);
    }
  });
}

