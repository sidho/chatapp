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
    this.chat.socket.on('message', function(message) {
      var formattedMessage = this.formatMessage(message);
      if (formattedMessage.html() !== "") {
        this.$messages.append(formattedMessage);
        this.scrollDown();
      }
    }.bind(this));

    this.chat.socket.on('adminMessage', function(message) {
      var formattedMessage = this.formatMessage(message);
      this.$messages.append(formattedMessage);
      this.scrollDown();
    }.bind(this));

    this.chat.socket.on('nicknameChangeResult', function(message) {
      var formattedMessage = this.formatMessage(message);
      this.$messages.append(formattedMessage);
      this.scrollDown();
    }.bind(this));

    this.$chatForm.on('submit', function(event){
      event.preventDefault();
      this.handleSubmit();
    }.bind(this));
  };

  ChatUI.prototype.formatMessage = function(message) {
    if (message.nickname) {
      var formattedMessage = message.nickname + " : " + message.text
    } else {
      var formattedMessage = message.text
    }

    var template = $('<li>').text(formattedMessage);
    template.addClass('panel');
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

  ChatUI.prototype.scrollDown = function () {
    var height = this.$messages[0].scrollHeight;
    this.$messages.animate({"scrollTop": height}, 'slow');
  }

})();
