function createChat (server) {
  var io = require('socket.io')(server);
  var nicknames = {};
  var namesTaken = [];
  var guestNumber = 0;

  function nextGuestName () {
    guestNumber += 1;
      return "Guest" + guestNumber;
  }

  var handleNameChange = function (socket, io) {
    socket.on('nicknameChangeRequest', function (name){
      if (name.toLowerCase().indexOf('guest') === 0) {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: 'Your nickname cannot begin with "Guest".'
        })
      } else if (namesTaken.indexOf(name.toLowerCase())) {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: 'That nickname is taken.'
        })
      } else {
        var oldNameIndex = namesTaken.indexOf(nicknames[socket.id]);
        namesTaken.push(name.toLowerCase());
        delete namesTaken[oldNameIndex];
        nicknames[socket.id] = name;
        socket.emit('nicknameChangeResult', {
          success: true,
          message: 'Name has been successfully changed to ' + name + '.'
        })
      }
    })
  }

  io.on('connection', function (socket) {
    nicknames[socket.id] = nextGuestName();
    socket.on('message', function (data) {
      io.emit('message', {
        nickname: nicknames[socket.id],
        text: data.text
      })
    });
  });
}

module.exports = createChat;
