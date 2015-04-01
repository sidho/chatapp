(function() {
    if (typeof App === "undefined") {
        window.App = {};
    }

    var Chat = App.Chat = function(socket) {
        this.socket = socket;
    };

    Chat.prototype.handleCommand = function(command) {
        var commandParams = command.split(' ');
        if (commandParams.length > 1) {
            if (commandParams[0] === "/name") {
                this.socket.emit('nicknameChangeRequest', commandParams[1]);
            } else if (commandParams[0] === "/join") {
                this.socket.emit('roomChangeRequest', commandParams[1]);
            } else if (commandParams[0] === "/w") {
                if (commandParams.length > 2) {
                    this.socket.emit('whisper', commandParams);
                } else {
                    this.socket.emit('adminMessage', {
                        text: "You need a message. Example '/w Sid hello sid!'"
                    });
                }
            } else {
                this.socket.emit('adminMessage', {
                    text: "Invalid command."
                });
            }
        } else {
            this.socket.emit('adminMessage', {
                text: "A name or room is required after the command. Example '/room BaseballFans'"
            });
        }
    };

    Chat.prototype.sendMessage = function(text) {
        this.socket.emit('message', {
            text: text
        });
    };
})();
