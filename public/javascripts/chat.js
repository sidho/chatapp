(function () {
  if (typeof App === "undefined") {
    window.App = {};
  }

  var Chat = App.Chat = function (socket) {
    this.socket = socket;
  };

  Chat.prototype.sendMessage = function (text) {
    this.socket.emit('message', { text: text })
  }

})();
