(function () {
    var request;

    $(document).ready(function () {
        socket = io();
        io = null;

        $('#request').click(function () {
            bootbox.prompt({
                title: prompt,
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
})();