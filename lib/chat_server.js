require('newrelic');
_ = require('lodash');

var nicknames = {};
var currentRooms = {};
var namesTaken = [];
var guestNumber = 0;

var nextGuestName = function() {
    guestNumber += 1;
    var newName = "Guest" + guestNumber;
    namesTaken.push(newName.toLowerCase());
    return "Guest" + guestNumber;
};

var handleDisconnect = function(socket, io) {
    socket.on('disconnect', function() {
        var name = nicknames[socket.id];
        var nameIndex = namesTaken.indexOf(nicknames[socket.id].toLowerCase());
        delete nicknames[socket.id];
        delete namesTaken[nameIndex];
        io.to(currentRooms[socket.id]).emit('adminMessage', {
            text: name + ' has disconnected.'
        });
        delete currentRooms[socket.id];
        io.sockets.emit('roomList', getRoomData(io));
    });
};

var getRoomData = function(io) {
    var roomHash = io.sockets.adapter.rooms;
    var roomData = {};
    for (var room in roomHash) {
        if (io.sockets.connected[room]) continue;
        roomData[room] = [];
        for (var socket in roomHash[room]) {
            roomData[room].push(nicknames[socket]);
        }
    }

    return roomData;
};

var handleAdminMessages = function(socket) {
    socket.on('adminMessage', function(data) {
        socket.emit('adminMessage', {
            text: data.text
        });
    });
}

var handleMessages = function(socket, io) {
    socket.on('message', function(data) {
        io.to(currentRooms[socket.id]).emit('message', {
            nickname: nicknames[socket.id],
            text: data.text
        });
    });
};

var handleNameChange = function(socket, io) {
    socket.on('nicknameChangeRequest', function(name) {
        if (name.toLowerCase().indexOf('guest') === 0) {
            socket.emit('nicknameChangeResult', {
                success: false,
                text: 'Your nickname cannot begin with "Guest".'
            });
        } else if (namesTaken.indexOf(name.toLowerCase()) !== -1) {
            socket.emit('nicknameChangeResult', {
                success: false,
                text: 'That nickname is taken.'
            });
        } else {
            var oldName = nicknames[socket.id];
            var oldNameIndex = namesTaken.indexOf(nicknames[socket.id].toLowerCase());
            namesTaken.push(name.toLowerCase());
            nicknames[socket.id] = name;
            delete namesTaken[oldNameIndex];
            io.to(currentRooms[socket.id]).emit('nicknameChangeResult', {
                success: true,
                text: oldName + ' has been successfully changed to ' + nicknames[socket.id] + '.'
            });
            io.sockets.emit('roomList', getRoomData(io));
        }
    });
};

var handleRoomChangeRequests = function(socket, io) {
    socket.on('roomChangeRequest', function(room) {
        var oldRoom = currentRooms[socket.id];
        socket.leave(oldRoom);
        joinRoom(socket, io, room);
        io.to(oldRoom).emit('adminMessage', {
            text: nicknames[socket.id] + ' has left the room.'
        });
        io.sockets.emit('roomList', getRoomData(io));
    });
};

var handleWhisper = function(socket, io) {
    socket.on('whisper', function(commandParams) {
        var receiver = commandParams[1];
        var sender = nicknames[socket.id];
        var message = commandParams.slice(2, (commandParams.length));
        message = message.join(' ');

        if (findSocketID(receiver) === undefined) {
            io.to(socket.id).emit('adminMessage', {
                text: receiver + ' cannot be found.'
            });
        } else {
            whisper(sender, receiver, message, socket, io);
        }
    });
};

var whisper = function(sender, receiver, message, socket, io) {
    io.to(findSocketID(receiver)).emit('whisperReceive', {
        sender: sender,
        body: message
    });
    io.to(findSocketID(sender)).emit('whisperSend', {
        receiver: receiver,
        body: message
    });
};

var findSocketID = function(nickname) {
    for (var socket in nicknames) {
        if (nicknames[socket] == nickname) return socket;
    }
};

var joinRoom = function(socket, io, room) {
    socket.join(room);
    currentRooms[socket.id] = room;
    io.to(currentRooms[socket.id]).emit('adminMessage', {
        text: nicknames[socket.id] + ' has joined room ' + room + '.'
    });
};

var createChat = function(server) {
    var io = require('socket.io')(server);
    io.on('connection', function(socket) {
        nicknames[socket.id] = nextGuestName();
        currentRooms[socket.id] = 'lobby';
        joinRoom(socket, io, 'lobby');
        handleNameChange(socket, io);
        handleRoomChangeRequests(socket, io);
        handleDisconnect(socket, io);
        handleMessages(socket, io);
        handleAdminMessages(socket);
        handleWhisper(socket, io);
        io.sockets.emit('roomList', getRoomData(io));
    });
};

module.exports = createChat;
