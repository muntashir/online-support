var socket;
var username;
var unreadCount = 0;

//var sessionID, roomID passed in from Jade

function updateWindowTitle() {
    if (unreadCount) {
        window.document.title = "KNS Support (" + unreadCount + ")";
    } else {
        window.document.title = "KNS Support";
    }
}

function joinRoom(id) {
    socket.emit('check-room', roomID);

    socket.on('check-room-response', function (response) {
        if (response) {
            socket.emit('join-room', roomID, sessionID);
            initChat();
        } else {
            bootbox.alert("Room does not exist", function () {
                window.location = "/";
            });
        }
    });
}

$(document).ready(function () {
    socket = io();
    joinRoom(roomID);

    $('#chat-input').on('click keydown', function () {
        unreadCount = 0;
        updateWindowTitle();
    });
});

function initChat() {
    socket.emit('get-username', sessionID);

    socket.on('send-username', function (u) {
        if (u) {
            username = u;
            addUser();
        } else {
            getUserName();
        }
    });

    $(window).on('beforeunload', function () {
        if (username) {
            socket.emit('chat-message', username + " has left");
            socket.emit('user-leave', sessionID, username);
        }
        socket.close();
    });

    $('form').submit(function () {
        if ($('#chat-input').val()) {
            socket.emit('chat-message', username + ": " + $('#chat-input').val());
            printToChat("You: " + $('#chat-input').val(), true);
            $('#chat-input').val('');
        }
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
        title: "Enter a username",
        value: "",
        callback: function (result) {
            if (result === null || result === "") {
                getUserName();
            } else {
                username = result;
                addUser();
            }
        }
    });
}

function addUser() {
    socket.emit('chat-message', username + " has joined");
    printToChat(username + " has joined", true);
    socket.emit('new-user', sessionID, username);
}

function scrollChat() {
    $("#chat-window").stop().animate({
        scrollTop: $("#chat-window")[0].scrollHeight
    }, 1000);
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
    scrollChat();
}