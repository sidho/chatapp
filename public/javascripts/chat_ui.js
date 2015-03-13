(function () {
  if (typeof App === "undefined") {
    window.App = {};
  }

  var ChatUI = App.ChatUI = function (chat){
    this.chat = chat;
    this.$messages = $('#messages');
    this.$sendButton = $('#send-button');
    this.$chatForm = $('.chat-form');
    this.$messageInput = $('#message-input');

    this.bindHandlers();
  }

  ChatUI.prototype.bindHandlers = function() {
    var that = this;

    this.chat.socket.on('message', function(message) {
      var formattedMessage = that.formatMessage(message);
      if (formattedMessage.html() !== "") {
        that.$messages.append(formattedMessage);
      }
    })

    this.chat.socket.on('adminMessage', function(message) {
      var result = $('<li>').text(message.text);
      that.$messages.append(result);
    })

    this.chat.socket.on('nicknameChangeResult', function(result) {
      var result = $('<li>').text(result.message);
      that.$messages.append(result);
    })

    this.$chatForm.on('submit', function(event){
      event.preventDefault();
      that.handleSubmit();
    })
  };

  ChatUI.prototype.formatMessage = function(message) {
    var formattedMessage = message.nickname + " : " + message.text;

    var template = $('<li>').text(formattedMessage);
    return template;
  }

  ChatUI.prototype.handleSubmit = function() {
    var message = this.$messageInput.val();

    if (message[0] === '/') {
      this.chat.handleCommand(message);
    } else {
      this.chat.sendMessage(message);
    }

    this.$messageInput.val('');
  }

})();
