var socket;

function socketInit(view_only) {
	socket = io.connect(':8081/room');

	connectTimeout = setTimeout(function () {
		if (socket.connected === true) {
			return;
		}

		var popup = document.getElementById('popup');
		popup.innerHTML = 'Sorry, the server is probably down. Retry later';
		popup.style.display = 'block';
	}, 3000);
	
	socket.on('connect', function () {
//console.log("connect",this);
		clearTimeout(connectTimeout);

                if (!view_only) {
		    me = new Player(this.id, 'player');
//console.log('id',me.id);
		    mainLoop = setInterval(moveMe,update_rate);
                }
	});

	socket.on('position', function (messages) {
//console.log("position",messages);
                updatePosition(messages);
                ready = true;
        });
        socket.on('playerslist', function (p) {
//console.log("playerslist",p);
                createOpponents(p);
                ready = true;
        });
        socket.on('new', function (playerid) {
//console.log("new player",playerid);
                players.push(new Player(playerid, 'opponent'));
        });
        socket.on('leave', function (playerid) {
//console.log("end player",playerid);
                leave(playerid);
        });

	socket.on('disconnect', function () {
//console.log("disconnect");
		document.getElementById('popup').style.display = 'block';
	});
}

function sendPosition () {
//console.log('me',me);
	if (ready) {
		ready = false;

		var pos = buffer.length ? buffer[0] : { x:me.x, y:me.y };
		buffer.shift();

//console.log("sending position from",me.id);
		socket.emit('position', {id:me.id, x:pos.x, y:pos.y});
	}
}

function updatePosition (data) {
	var id, i, l;

	for (i=0, l=players.length; i<l; i++) {
		id = players[i].id;
		if (id in data) {
			players[i].update(data[id].x, data[id].y);
		}
	}
}

function createOpponents (list) {
	for (var i in list) {
		players.push(new Player(i, 'opponent', list[i].x, list[i].y));
	}
}

function leave (id) {
	for (var i=0, l=players.length; i<l; i++) {
		if (id == players[i].id) {
			players[i].remove();
			players.splice(i, 1);
			return;
		}
	}
}
