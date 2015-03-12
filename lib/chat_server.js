function createChat (server) {
  var io = require('socket.io')(server);
  this.nicknames = {};
  this.guestNumber = 0;
  var that = this;

  function nextGuestName () {
    that.guestNumber += 1;
      return "Guest" + that.guestNumber;
  }

  io.on('connection', function (socket) {
    that.nicknames[socket.id] = nextGuestName();
    socket.on('message', function (data) {
      io.emit('message', {
        nickname: that.nicknames[socket.id],
        text: data.text
      })
    });
  });
}

module.exports = createChat;
