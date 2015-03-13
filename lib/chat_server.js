var nicknames = {};
var namesTaken = [];
var guestNumber = 0;

var nextGuestName = function () {
  guestNumber += 1;
  var newName = "Guest" + guestNumber;
  namesTaken.push(newName.toLowerCase());
  return "Guest" + guestNumber;
}

var handleNameChange = function (socket, io) {
  socket.on('nicknameChangeRequest', function (name){
    if (name.toLowerCase().indexOf('guest') === 0) {
      socket.emit('nicknameChangeResult', {
        success: false,
        message: 'Your nickname cannot begin with "Guest".'
      })
    } else if (namesTaken.indexOf(name.toLowerCase()) !== -1) {
      socket.emit('nicknameChangeResult', {
        success: false,
        message: 'That nickname is taken.'
      })
    } else {
      var oldNameIndex = namesTaken.indexOf(nicknames[socket.id].toLowerCase());
      namesTaken.push(name.toLowerCase());
      nicknames[socket.id] = name;
      delete namesTaken[oldNameIndex];
      socket.emit('nicknameChangeResult', {
        success: true,
        message: 'Name has been successfully changed to ' + nicknames[socket.id] + '.'
      })
    }
  })
}

var createChat = function (server) {
  var io = require('socket.io')(server);
  io.on('connection', function (socket) {
    nicknames[socket.id] = nextGuestName();
    handleNameChange(socket, io);
    socket.on('message', function (data) {
      io.emit('message', {
        nickname: nicknames[socket.id],
        text: data.text
      })
    });
  });
}

module.exports = createChat;
