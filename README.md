# Sema4

[Check it out.][sema4]
[sema4]: http://sema4.sidho.me
[While you`re at it, check out my homepage.](http://sidho.me)

![Screenshot1](http://sidho.me/images/portfolio/sema4.png)

### About Sema4

Sema4 is a lightweight chat application built using node.js and websockets/socket.io.
It features multiple rooms, private messaging, and nicknames.

### Keeping track of users

Upon logging in, clients are automatically given a guest name, with a number based
on the order in which the client logged in. Sema4 keeps track of nicknames by using
an aptly named `nicknames` object, where the key is the socket ID, and the value
is the nickname associated with that socket. To ensure the nicknames are unique,
Sema4 also keeps an array of nicknames for all the sockets currently connected.
When a client attempts a name change, the name is checked against the array and
the change is blocked if that username exists. Otherwise, the new name is added
to the array, the old name is removed, and the `nicknames` object is updated.

### Rooms

Socket.io has room functionality built-in -- Sema4 uses `join` and `leave` to
specify what room a client is in. These can be named anything, so clients can join a
room named anything they want. Users are automatically placed in the `lobby` room
by default. Sema4 keeps track of where the users are by keeping a `currentRooms`
object, where the key is the socket ID, and the value is the room name. When
clients join new rooms or disconnect, `currentRooms` is updated.

### Handling messages

When a client sends a message, their socket will `emit` a `message` event that contains
the message body. The server will then `emit` a `message` to everyone in the
same `room`, passing the `nickname` of the sender and the `text` of the message.
When a client receives a message, the `ChatUI` will format and append that
message to their chat screen.

Private messages (aka whispers) are handled in a similar manner, except the
event is directed to a specific socket, by finding the socket in the nicknames
hash. It is then appeneded to the screen using different formatting to
differentiate the nature of the message.

Finally, admin messages, in response to client commands, will send a message back
to the client`s socket.

### Text Commands

Commands to change rooms, change names, or private message someone, is handled
in the message box, reminiscent of IRC. Commands start with a `/`. The available
commands are:

- `/join` followed by a room name, to join a different room.
- `/name` followed by a nickname, to request a name change.
- `/w` followed by a username and a message, to send a private message to
another client.

When Sema4 encounters a emitted message that starts with `/`, the command is
handled by `Chat#handleCommand`, which runs an associated method, or returns a
message stating why the command could not be processed.

### Keeping track of who is where

Using the `currentRooms` object, the server will `emit` a `roomList` event, sending
to all sockets a object containing the name of each room, and an array of users
as the value. The `ChatUI` will append each room to the sidebar. Every time a
client connects or disconnects, changes rooms, or changes name, this `roomList`
event is emitted once more, to ensure every client has the most up-to-date
information.

### Templating

For the sake of readability, the layouts of elements like messages and room lists
are templated using lodash. The `ChatUI` will choose which template to use and
depending on the event it receives, and display it onscreen.

### Plugins / Technologies used
- [Animate.css](https://daneden.github.io/animate.css/): For pretty chat animations.
- [lodash](https://lodash.com/): For templating.
- [smileys.js](http://cloudcannon.com/smileys/): This makes simple and clean emoticons. :)

And the self-explanatory ones:
- npm
- Bootstrap

### Final Thoughts

Thanks for reading. If you have any comments, criticisms or suggestions, please
let me know.

<p align="center">
  <a href="http://sidho.me"><img src="./app/assets/images/shgreenicon.jpg"/></a>
</p>
