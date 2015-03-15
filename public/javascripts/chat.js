(function () {
  if (typeof App === "undefined") {
    window.App = {};
  }

  var Chat = App.Chat = function (socket) {
    this.socket = socket;
  };

  Chat.prototype.handleCommand = function (command) {
    var commandParams = command.split(' ');
    if (commandParams[0] === "/name") {
      this.socket.emit('nicknameChangeRequest', commandParams[1]);
    } else if (commandParams[0] === "/join") {
      this.socket.emit('roomChangeRequest', commandParams[1]);
    } else {
      this.socket.emit('message', { text: "Invalid command."})
    }
  }

  Chat.prototype.sendMessage = function (text) {
    this.socket.emit('message', { text: text })
  }

})();
