var server = "http://localhost";

var requests = {};
var gui = require('nw.gui');
var socket;

$(document).ready(function () {
    socket = io(server);

    socket.emit('request-client-init');

    socket.on('new-request', function (id) {
        requests[id] = "";
        renderRequests();
    });

    socket.on('del-request', function (id) {
        delete requests[id];
        renderRequests();
    });

    socket.on('client-init', function (r) {
        for (var i = 0; i < r.length; i += 1) {
            requests[r[i]] = "";
        }
        renderRequests();
    });
});

function grantRequest(request) {
    var id = request.split(",")[0];
    socket.emit('create-room', id);
    socket.emit('grant-request', request);
    gui.Shell.openExternal(server + "/rooms/" + id);
}

function renderRequests() {
    var well = $(".well");
    well.empty();
    for (var request in requests) {
        if (requests.hasOwnProperty(request)) {
            var id = request.split(",")[0];
            var description = request.split(",")[1];
            well.append('<button class="btn btn-success button" id="' + id + '">' + description + '</button>');
            $("#" + id).click(function () {
                grantRequest(request);
            });
        }
    }
}