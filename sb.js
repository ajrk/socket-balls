
// Lock screen
document.addEventListener('touchmove', function (e) { 
//console.log('touchmove');
		e.preventDefault(); 
        }, false);

var stage, stageW, stageH,
	friction = 0.98,
	bounce = -0.75,
	sensitivity = 0.2,
	diameter = 40,
        update_rate = 50,
	ax = ay = 0,
	mainLoop,
	players = [], me, 
	count = 0,
	floodControl, ready,
	buffer = [];


function Player (id, className, x, y) {
console.log('player',id);
	var that = this, div = document.createElement('div');
	
	div.id = 'b' + id;
	div.className = 'ball ' + className;
	stage.appendChild(div);

	that.id = id;
	that.ball = div;
	
	x = x || 0;
	y = y || 0;
	that.update(x, y);
}

Player.prototype = {
	vx: 1.0,
	vy: 1.0,
	
	move: function () {
		var that = this, x, y;

		that.vx *= friction;
		that.vy *= friction;
		x = that.x + that.vx;
		y = that.y + that.vy;

		if (x > stageW - diameter) {
			x = stageW - diameter;
			that.vx *= bounce;
		} else if (x < 0) {
			x = 0;
			that.vx *= bounce;
		}

		if (y > stageH - diameter) {
			y = stageH - diameter;
			that.vy *= bounce;
		} else if (y < 0) {
			y = 0;
			that.vy *= bounce;
		}

		that.vx += ax;
		that.vy += ay;

		that.update(x, y);
	},
	
	update: function (x, y) {
		var that = this;
		that.x = x;
		that.y = y;
		that.ball.style.webkitTransform = 'translate3d(' + that.x + 'px,'+ that.y +'px,0)';
	},
	
	remove: function () {
//console.log('remove');
		stage.removeChild(this.ball);
	}
}

// Main Game Loop
function moveMe () {
	me.move();

	buffer[buffer.length] = { x: me.x, y: me.y };

	if (buffer.length > 10) buffer.shift();

//console.log('moving to',me.x, me.y);
	sendPosition();
}

window.addEventListener('devicemotion', function (e) {
//console.log('motion');
	ax = e.accelerationIncludingGravity.x * sensitivity;
	ay = -e.accelerationIncludingGravity.y * sensitivity;
socket.emit('devicemotion',me.id,e);
}, false);

window.addEventListener('load', function () {
	stage = document.getElementById('stage');
	stageW = stage.clientWidth;
	stageH = stage.clientHeight;
//console.log('load',stageW,stageH);

	var popup = document.getElementById('popup');
	view_only = !('ondevicemotion' in window);
	
	socketInit(view_only);
}, false);
