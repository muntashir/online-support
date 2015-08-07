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

function grantRequest(id) {
    socket.emit('create-room', id);
    socket.emit('grant-request', id);
    gui.Shell.openExternal(server + "/rooms/" + id);
}

function renderRequests() {
    var well = $(".well");
    well.empty();
    for (var id in requests) {
        if (requests.hasOwnProperty(id)) {
            well.append('<button class="btn btn-success button" id="' + id + '">' + id + '</button>');
            $("#" + id).click(function () {
                grantRequest(id);
            });
        }
    }
}