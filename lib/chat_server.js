function createChat (server) {
  var io = require('socket.io')(server);
  var nicknames = {};
  var guestNumber = 1;

  io.on('connection', function (socket) {
    nicknames[socket.id] = nextGuestName();
    socket.on('message', function (data) {
      console.log(nicknames[socket.id]);
      io.emit('message', {
        text: data.text,
        nickname: nicknames[socket.id]
      })
    });
  });
}

module.exports = createChat;
