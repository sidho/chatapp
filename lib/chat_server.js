function createChat (server) {
  var io = require('socket.io')(server);
  io.on('connection', function (socket) {
    socket.emit('message', { text: 'this is the text' });
    socket.on('message', function (data) {
      socket.emit('message', { text: data })
    });
  });
}

module.exports = createChat;
