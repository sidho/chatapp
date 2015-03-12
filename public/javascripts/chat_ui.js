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
    });

    this.$chatForm.on('submit', function(event){
      event.preventDefault();
      that.handleSubmit();
    })
  };

  ChatUI.prototype.formatMessage = function(message) {
    console.log(message);
    var formattedMessage = message.nickname + " : " + message.text;

    var template = $('<li>').text(formattedMessage);
    return template;
  }

  ChatUI.prototype.handleSubmit = function() {
    var message = this.$messageInput.val();

    this.chat.sendMessage(message);
    this.$messageInput.val('');
  }

})();
