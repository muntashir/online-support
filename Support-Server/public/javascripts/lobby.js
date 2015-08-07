var request;

$(document).ready(function () {
    socket = io();

    $('#request').click(function () {
        bootbox.prompt({
            title: "Please describe your issue briefly",
            value: "",
            callback: function (result) {
                if (result !== null && result !== "") {
                    request = sessionID + "," + result;
                    socket.emit('request-chat', request);
                    $('#request').prop('disabled', true);
                    $("#request").html('Waiting for support...');
                }
            }
        });
    });

    socket.on('request-chat-response', function (r) {
        if (r === request) {
            window.location = "/rooms/" + sessionID;
        }
    });
});