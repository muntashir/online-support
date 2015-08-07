var app = require('./app');
var config = require('./config');
var redis = require('redis');
var db = redis.createClient();

//Init HTTP server
var port = process.env.PORT || config.port || 80;
var password = config.password;
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

db.on('connect', function () {
    console.log('Connected to Redis');
});

//Init socket
io.on('connection', function (socket) {
    socket.on('get-username', function (sessionID) {
        db.hget("usernames", sessionID, function (err, reply) {
            if (reply) {
                socket.emit('send-username', reply);
            } else {
                socket.emit('send-username', null);
            }
        });
    });

    socket.on('request-chat', function (request) {
        db.sadd("requests", request);
        io.emit('new-request', request);
    });

    socket.on('grant-request', function (request, p) {
        if (p === password) {
            db.srem("requests", request);
            io.emit('del-request', request);
            io.emit('request-chat-response', request);
        }
    });

    socket.on('request-client-init', function (p) {
        if (p === password) {
            db.smembers("requests", function (err, reply) {
                socket.emit('client-init', reply);
            });
        }
    });

    socket.on('check-room', function (roomID) {
        db.sismember("rooms", roomID, function (err, reply) {
            if (reply) {
                socket.emit('check-room-response', true);
            } else {
                socket.emit('check-room-response', false);
            }
        });
    });

    socket.on('create-room', function (roomID, p) {
        if (p === password) {
            db.sadd("rooms", roomID);
        }
    });

    socket.on('del-room', function (roomID, p) {
        if (p === password) {
            db.srem("rooms", roomID);
        }
    });

    socket.on('join-room', function (roomID, sessionID) {
        socket.join(roomID);
        db.sadd(roomID + ":users", sessionID);
    });

    socket.on('new-user', function (sessionID, username) {
        var roomID = socket.rooms[1];
        socket.broadcast.to(roomID).emit('add-user', sessionID);
        db.hset("usernames", sessionID, username);
    });

    socket.on('user-leave', function (sessionID, username) {});

    socket.on('chat-message', function (msg) {
        socket.broadcast.to(socket.rooms[1]).emit('chat-message', msg);
    });
});

//Start server
server.on('error', onError);
server.on('listening', onListening);
server.listen(port);

//Server functions
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
    case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
    default:
        throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}