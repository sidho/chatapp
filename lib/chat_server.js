var nicknames = {};
var currentRooms = {};
var namesTaken = [];
var guestNumber = 0;

var nextGuestName = function () {
  guestNumber += 1;
  var newName = "Guest" + guestNumber;
  namesTaken.push(newName.toLowerCase());
  return "Guest" + guestNumber;
}

var handleDisconnect = function (socket, io) {
  socket.on('disconnect', function() {
    var name = nicknames[socket.id];
    var nameIndex = namesTaken.indexOf(nicknames[socket.id].toLowerCase());
    delete nicknames[socket.id];
    delete namesTaken[nameIndex];
    io.to(currentRooms[socket.id]).emit('adminMessage', {
      text: name + ' has disconnected.'
    })
  })
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
      var oldName = nicknames[socket.id];
      var oldNameIndex = namesTaken.indexOf(nicknames[socket.id].toLowerCase());
      namesTaken.push(name.toLowerCase());
      nicknames[socket.id] = name;
      delete namesTaken[oldNameIndex];
      io.to(currentRooms[socket.id]).emit('nicknameChangeResult', {
        success: true,
        message: oldName + ' has been successfully changed to ' + nicknames[socket.id] + '.'
      })
    }
  })
}

var handleRoomChangeRequests = function (socket, io) {
  socket.on('roomChangeRequest', function (room){
    var oldRoom = currentRooms[socket.id]
    socket.leave(oldRoom);
    joinRoom(socket, io, room);
    io.to(oldRoom).emit('adminMessage', {
      text: nicknames[socket.id] + ' has left the room.'
    })
  })
}

var joinRoom = function (socket, io, room) {
  socket.join(room);
  currentRooms[socket.id] = room;
  io.to(currentRooms[socket.id]).emit('adminMessage', {
    text: nicknames[socket.id] + ' has joined room ' + room + '.'
  })
}

var createChat = function (server) {
  var io = require('socket.io')(server);
  io.on('connection', function (socket) {
    nicknames[socket.id] = nextGuestName();
    currentRooms[socket.id] = 'lobby';
    joinRoom(socket, io, 'lobby');
    handleNameChange(socket, io);
    handleRoomChangeRequests(socket, io);
    handleDisconnect(socket, io);
    socket.on('message', function (data) {
      io.to(currentRooms[socket.id]).emit('message', {
        nickname: nicknames[socket.id],
        text: data.text
      })
    });
  });
}

module.exports = createChat;
