(function() {
    if (typeof App === "undefined") {
        window.App = {};
    }

    var ChatUI = App.ChatUI = function(chat) {
        this.chat = chat;
        this.$messages = $('#messages');
        this.$sendButton = $('#send-button');
        this.$chatForm = $('.chat-form');
        this.$messageInput = $('#message-input');
        this.$roomList = $('#room-list');
        this.messageTemplate = _.template($('#message-template').html());
        this.adminMessageTemplate = _.template($('#admin-message-template').html());
        this.whisperSendTemplate = _.template($('#whisper-send-template').html());
        this.whisperReceiveTemplate = _.template($('#whisper-receive-template').html());
        this.roomListTemplate = _.template($('#room-list-template').html());

        this.bindHandlers();
    };

    ChatUI.prototype.bindHandlers = function() {
        this.handleMessages();
        this.handleNicknameChangeResult();
        this.handleSubmit();
        this.handleWhispers();
        this.populateRoomList();
    };

    ChatUI.prototype.handleMessages = function() {
        this.chat.socket.on('message', function(message) {
            var templatedMessage = this.messageTemplate(message);
            // Need to convert to jquery object before smilifying
            this.$messages.append($(templatedMessage).smilify());
            this.scrollDown();
        }.bind(this));

        this.chat.socket.on('adminMessage', function(message) {
            var templatedMessage = this.adminMessageTemplate(message);
            this.$messages.append(templatedMessage);
            this.scrollDown();
        }.bind(this));
    };

    ChatUI.prototype.handleNicknameChangeResult = function() {
        this.chat.socket.on('nicknameChangeResult', function(message) {
            var templatedMessage = this.adminMessageTemplate(message);
            this.$messages.append(templatedMessage);
            this.scrollDown();
        }.bind(this));
    };

    ChatUI.prototype.handleSubmit = function() {
        this.$chatForm.on('submit', function(event) {
            event.preventDefault();
            var message = this.$messageInput.val();

            if (message[0] === '/') {
                this.chat.handleCommand(message);
            } else {
                this.chat.sendMessage(message);
            }

            this.$messageInput.val('');
        }.bind(this));
    };

    ChatUI.prototype.handleWhispers = function() {
        this.chat.socket.on('whisperSend', function(message) {
            var templatedMessage = this.whisperSendTemplate(message);
            this.$messages.append($(templatedMessage).smilify());
            this.scrollDown();
        }.bind(this));

        this.chat.socket.on('whisperReceive', function(message) {
            var templatedMessage = this.whisperReceiveTemplate(message);
            this.$messages.append($(templatedMessage).smilify());
            this.scrollDown();
        }.bind(this));
    };

    ChatUI.prototype.populateRoomList = function() {
        this.chat.socket.on('roomList', function(roomInfo) {
            this.$roomList.empty();

            // Templates require data to be inside of an object
            var data = {
                rooms: roomInfo
            };

            var templatedRoomList = this.roomListTemplate(data);
            this.$roomList.append(templatedRoomList);
        }.bind(this));
    };

    ChatUI.prototype.scrollDown = function() {
        var height = this.$messages[0].scrollHeight;
        this.$messages.animate({
            "scrollTop": height
        }, 'slow');
    };
})();
