(function () {
    var socket;
    var username;
    var unreadCount = 0;
    var usersTyping = {};
    var typingNodes = [];

    //var sessionID, roomID passed in from Jade

    function displayUsersTyping() {
        for (var i = 0; i < typingNodes.length; i += 1) {
            typingNodes[i].remove();
        }

        typingNodes = [];

        for (var user in usersTyping) {
            if (usersTyping.hasOwnProperty(user)) {
                var node = $('<li class="list-group-item">' + user + ' is typing...</li>');
                typingNodes.push(node);
                $('#chat-messages').append(node);
            }
        }

        scrollChat();
    }

    function updateWindowTitle() {
        if (unreadCount) {
            window.document.title = company + " Support (" + unreadCount + ")";
        } else {
            window.document.title = company + " Support";
        }
    }

    function joinRoom(id) {
        socket.emit('check-room', roomID);

        socket.on('check-room-response', function (response) {
            if (response) {
                socket.emit('join-room', roomID, sessionID);
                initChat();
            } else {
                bootbox.alert("Error connecting. Please go back and submit another request.", function () {
                    window.location = "/";
                });
            }
        });
    }

    $(document).ready(function () {
        socket = io();
        io = null;
        joinRoom(roomID);
    });

    function initChat() {
        socket.emit('get-username');

        socket.on('send-username', function (u) {
            if (u) {
                username = u;
                socket.emit('check-username', username);
            } else {
                getUserName();
            }
        });

        socket.on('check-username-response', function (response) {
            if (response) {
                addUser();
            } else {
                bootbox.alert("Name is already taken", function () {
                    getUserName();
                });
            }
        });

        socket.on('start-typing', function (username) {
            usersTyping[username] = "";
            displayUsersTyping();
        });

        socket.on('stop-typing', function (username) {
            if (usersTyping.hasOwnProperty(username)) {
                delete usersTyping[username];
                displayUsersTyping();
            }
        });

        $('#chat-input').on('click keydown', function () {
            unreadCount = 0;
            updateWindowTitle();
        });

        $('#chat-input').on('input', function () {
            if ($('#chat-input').val()) {
                socket.emit('start-typing', username);
            } else {
                socket.emit('stop-typing', username);
            }
        });

        $(window).on('beforeunload', function () {
            socket.close();
        });

        $('form').submit(function () {
            if ($('#chat-input').val()) {
                socket.emit('chat-message', username + ": " + $('#chat-input').val());
                printToChat("You: " + $('#chat-input').val(), true);
                $('#chat-input').val('');
            }
            socket.emit('stop-typing', username);
            return false;
        });

        socket.on('chat-message', function (msg) {
            printToChat(msg, false);
            unreadCount += 1;
            updateWindowTitle();
            scrollChat();
        });
    }

    function getUserName() {
        bootbox.prompt({
            title: "Please enter your name",
            value: "",
            callback: function (result) {
                if (result === null || result === "") {
                    getUserName();
                } else {
                    username = result.trim();
                    socket.emit('check-username', username);
                }
            }
        });
    }

    function addUser() {
        printToChat(username + " has joined", true);
        socket.emit('new-user', username);
    }

    function scrollChat() {
        $("#chat-window").stop().animate({
            scrollTop: $("#chat-window")[0].scrollHeight
        }, 300);
    }

    function printToChat(text, active) {
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        text = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(exp, "<a href='$1' target='_blank'>$1</a>");
        if (active) {
            $('#chat-messages').append('<li class="list-group-item active">' + text + '</li>');
        } else {
            $('#chat-messages').append('<li class="list-group-item">' + text + '</li>');
        }
        displayUsersTyping();
    }
})();