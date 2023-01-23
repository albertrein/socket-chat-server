let mensagens = [];

$(function() {
    $('#send-file').click(function (e) { 
      e.preventDefault();
      $('#file').trigger('click');
      
    });
    let ip_address = '127.0.0.1';
    let socket_port = '3000';
    let socket = io(ip_address + ':' + socket_port);
    let chatInput = $('#chatInput');
    chatInput.keypress(function(e) {
        let message = $(this).html();
        //console.log(message);
        if(e.which === 13 && !e.shiftKey) {
          chaveAtual = $('#chave').val()
          socket.emit('sendChatToServer', encrypt(message, chaveAtual));
          adicionaNovaMensagem(encrypt(message, chaveAtual));
          chatInput.html('');
          return false;
        }
    });

    socket.on('sendChatToClient', (message) => {
      adicionaNovaMensagem(message);
      renderListaMensagens();
    });

    socket.on('sendFileToClients', image => {
      console.log('ok')
      const img = new Image();
      // change image type to whatever you use, or detect it in the backend 
      // and send it if you support multiple extensions
      img.src = `data:image/jpg;base64,${image}`; 
      document.body.appendChild(img);
    });

    document.getElementById('file').addEventListener('change', function() {

      console.log(this.files[0])
      
      /*const reader = new FileReader();
      reader.onload = function() {
        const bytes = new Uint8Array(this.result);
        console.log(bytes)
        //socket.emit('sendFile', bytes);
      };
      reader.readAsArrayBuffer(this.files[0]);
      */
      socket.emit('sendFile', this.files[0]);

    });
});
adicionaNovaMensagem = (novaMensagem) => {
  mensagens.push(novaMensagem);
}

renderListaMensagens = () => {
  $('.chat-content ul').html('');
  chaveAtual = $('#chave').val()
  mensagens.forEach((msg) => {
    $('.chat-content ul').append(`<li>${decrypt(msg, chaveAtual)}</li>`);
  });
}

