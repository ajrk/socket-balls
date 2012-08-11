var http = require('http'),
    io = require('socket.io'),
    fs = require('fs'),
    path = require('path');


var server = http.createServer(function (request, response) {

    // console.log('requesting...',request.url);

    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    path.exists(filePath, function(exists) {

        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    //console.log('writing',filePath,'as',contentType);
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });

});


var socket = io.listen(8081, {
        'log level': 1,
        });
var players = {};

// Set up events
socket.of('/room').on('connection', function (client) {
//console.log('connect', client.id);
	// Send to the new user the list of active players
	client.emit('playerslist', players);

	// Add the new user to the list of players
	players[client.sessionId] = { x:0, y:0 }

	// Broadcast the new user to all players
	client.broadcast.emit('new', client.sessionId);

	client.on('position', function (message) {
//console.log('position',client.id, message);
		// Broadcast the new user position
		players[message.id] = { x: message.x, y: message.y };
		client.broadcast.emit('position', players);
	});
        client.on('devicemotion', function (id,e) {
console.log('devicemotion',id,e);
        });
	
	client.on('disconnect', function () {
//console.log('disconnect',client.id);
		// Remove the user from the list of players
		delete players[this.sessionId];

		// Broadcast the logged out user's id
		client.broadcast.emit('leave', this.sessionId);
	});

});

// Start listening
server.listen(8080);
