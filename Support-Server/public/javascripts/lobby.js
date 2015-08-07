$(document).ready(function () {
    socket = io();

    $('#request').click(function () {
        socket.emit('request-chat', sessionID);
        $('#request').prop('disabled', true);
        $("#request").html('Waiting...');
    });

    socket.on('request-chat-response', function (id) {
        if (id === sessionID) {
            window.location = "/rooms/" + sessionID;
        }
    });
});