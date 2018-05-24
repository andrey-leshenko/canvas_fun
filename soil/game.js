let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

let W = canvas.width;
let H = canvas.height;

let soil = new Array(W * H);
soil.fill(0);
let imageData = ctx.createImageData(W, H);

for (let y = H - 20; y < H; y++) {
	for (let x = 0; x < W; x++) {
		soil[lin(x, y)] = 255;
		imageData.data[lin(x, y) * 4 + 3] = 255;
	}
}

function lin(x, y) {
	return y * W + x;
}

var cx = 100;
var cy = 100;

var px = [];
var py = [];
var vx = [];
var vy = [];

var mouseX = 0;
var mouseY = 0;
var mouseDown = false;
let keys = {};

function update() {
	if (mouseDown) {
		let burstSize = 40;
		for (let i = 0; i < burstSize; i++) {
			let dx = mouseX - cx;
			let dy = mouseY - cy;
			let dist = Math.sqrt(dx * dx + dy * dy) + 1;

			let fireSpeed = 20;
			let randomness = 3;

			px.push(cx);
			py.push(cy);
			vx.push(dx / dist * fireSpeed + (Math.random() - 0.5) * randomness);
			vy.push(dy / dist * fireSpeed + (Math.random() - 0.5) * randomness);
			px[px.length - 1] += vx[vx.length - 1] * Math.random();
			py[py.length - 1] += vy[vy.length - 1] * Math.random();
		}
	}

	for (let i = 0; i < px.length; i++) {
		let checks = 20;
		let prevX = Math.round(px[i]);
		let prevY = Math.round(py[i]);

		let destroyed = false;

		for (let t = 0; t <= checks; t++) {
			x = Math.round(px[i] + (t / checks) * vx[i]);
			y = Math.round(py[i] + (t / checks) * vy[i]);

			if (x < 0 || x >= W || y > H) {
				destroyed = true;
				break;
			}
			if (soil[lin(x, y)] != 0) {
				soil[lin(prevX, prevY)] = 255;
				imageData.data[lin(prevX, prevY) * 4 + 3] = 255;
				destroyed = true;
				break;
			}

			prevX = x;
			prevY = y;
		}

		if (destroyed) {
			px.splice(i, 1);
			py.splice(i, 1);
			vx.splice(i, 1);
			vy.splice(i, 1);
			continue;
		}

		px[i] += vx[i];
		py[i] += vy[i];

		vy[i] += 1.3;

		vx[i] *= 0.95;
		vy[i] *= 0.95;
	}

	// Movement

	let movementSpeed = 5;
	if (keys['a']) {
		cx -= movementSpeed;
	}
	if (keys['d']) {
		cx += movementSpeed;
	}
	if (keys['w']) {
		cy -= movementSpeed;
	}
	if (keys['s']) {
		cy += movementSpeed;
	}

	// Draw

	ctx.putImageData(imageData, 0, 0);
	ctx.strokeRect(cx - 6, cy - 6, 13, 13);

	for (var i = 0; i < px.length; i++) {
		ctx.fillRect(px[i], py[i], 1, 1);
	}

	setTimeout(update, 16);

	/*
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'white';

	if (mouseDown) {
		for (var i = 0; i < px.length; i++) {
			var dx = mouseX - px[i];
			var dy = mouseY - py[i];
			var dist = Math.sqrt(dx * dx + dy * dy) + 1;

			vx[i] += dx / dist;
			vy[i] += dy / dist;
		}
	}

	for (var i = 0; i < px.length; i++) {
		var dx = startx[i] - px[i];
		var dy = starty[i] - py[i];
		var dist = Math.sqrt(dx * dx + dy * dy) + 1;

		vx[i] += dx / dist * 0.5;
		vy[i] += dy / dist * 0.5;
	}

	for (var i = 0; i < px.length; i++) {
		px[i] += vx[i];
		py[i] += vy[i];

		vx[i] *= 0.93;
		vy[i] *= 0.93;
	}

	*/
}

function onMouseEvent(e) {
	var x = e.clientX - canvas.offsetLeft;
	var y = e.clientY - canvas.offsetTop;

	if (e.type == 'mousedown') {
		mouseDown = true;
	}
	else if (e.type == 'mouseup') {
		mouseDown = false;
	}
	else if (e.type == 'mousemove') {
		mouseX = x;
		mouseY = y;
	}
}

function onKeyEvent(e) {
	if (e.type == 'keydown')
		keys[e.key] = true;
	else if (e.type == 'keyup')
		keys[e.key] = false;
}

document.addEventListener('mousedown', onMouseEvent);
document.addEventListener('mouseup', onMouseEvent);
document.addEventListener('mousemove', onMouseEvent);
document.addEventListener('keydown', onKeyEvent);
document.addEventListener('keyup', onKeyEvent);

update();
