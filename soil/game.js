let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

let W = canvas.width;
let H = canvas.height;

let soil = new Uint8Array(W * H);
soil.fill(0);
let imageData = ctx.createImageData(W, H);

for (let y = H - 30; y < H; y++) {
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
var anti = [];

var mouseX = W;
var mouseY = H;
var mouseDown = false;
var antiOn = false;
let keys = {};
let burstSize = 40;
let fireSpeed = 20;
let antiLife = 2;
let fall = false;

function update() {
	if (mouseDown) {
		for (let i = 0; i < burstSize; i++) {
			let dx = mouseX - cx;
			let dy = mouseY - cy;
			let dist = Math.sqrt(dx * dx + dy * dy) + 1;

			let randomness = 3;

			px.push(cx);
			py.push(cy);
			vx.push(dx / dist * fireSpeed + (Math.random() - 0.5) * randomness);
			vy.push(dy / dist * fireSpeed + (Math.random() - 0.5) * randomness);
			px[px.length - 1] += vx[vx.length - 1] * Math.random();
			py[py.length - 1] += vy[vy.length - 1] * Math.random();
			anti.push(antiOn ? antiLife : 0);
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
			if (y > 0 && soil[lin(x, y)] != 0) {
				if (!anti[i]) {
					soil[lin(prevX, prevY)] = 255;
					imageData.data[lin(prevX, prevY) * 4 + 3] = 255;
					destroyed = true;
					break;
				}
				else {
					soil[lin(x, y)] = 0;
					imageData.data[lin(x, y) * 4 + 3] = 0;
					anti[i]--;
					if (!anti[i]) {
						destroyed = true;
						break;
					}
				}
			}

			prevX = x;
			prevY = y;
		}

		if (destroyed) {
			px.splice(i, 1);
			py.splice(i, 1);
			vx.splice(i, 1);
			vy.splice(i, 1);
			anti.splice(i, 1);
			continue;
		}

		px[i] += vx[i];
		py[i] += vy[i];

		vy[i] += 1.3;

		vx[i] *= 0.95;
		vy[i] *= 0.95;
	}

	// Sand falling

	if (fall) {
		for (let i = 0; i < 4; i++) {
			for (let y = H - 1; y >= 1; y--) {
				let start = i % 2 ? 0 : W;
				let end = i % 2 ? W : 0;
				let step = i % 2 ? 1 : -1;

				let point = lin(start, y);
				let up = lin(start, y - 1);

				for (let x = start; x != end; x += step, point += step, up +=step) {
					if (soil[point])
						continue;

					if (soil[up]) {
						soil[point] = 255;
						soil[up] = 0;
					}
					else {
						if (Math.random() < 0.5) {
							if (soil[lin(x - 1, y - 1)] && x >= 1) {
								soil[point] = 255;
								soil[up - 1] = 0;
							}
						}
						else {
							if (soil[up + 1] && x < W - 1) {
								soil[point] = 255;
								soil[up + 1] = 0;
							}
						}
					}
				}
			}
		}
		for (let i = 0; i < W * H; i++) {
			imageData.data[i * 4 + 3] = soil[i];
		}
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
	if (false)
	{
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
		ctx.stroke();

		let dx = mouseX - cx;
		let dy = mouseY - cy;
		let dist = Math.sqrt(dx * dx + dy * dy) + 1e-6;
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.lineTo(cx + dx / dist * 9, cy + dy / dist * 9);
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.lineWidth = 2;
	}

	for (var i = 0; i < px.length; i++) {
		ctx.fillRect(px[i], py[i], 1, 1);
	}

	ctx.fillText((antiOn ? '-' : '+') + ' count: ' + burstSize + ' speed: ' + fireSpeed, 10, 10);

	setTimeout(update, 16);
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

	if (e.type == 'keydown') {
		if (e.key == 'q') {
			antiOn = !antiOn;
		}
		if (e.key == ' ') {
			fall = !fall;
		}
		if (e.key == 'c') {
			for (let y = H - 300; y < H; y++) {
				for (let x = W * 0.25; x < W * 0.75; x++) {
					soil[lin(x, y)] = 255;
					imageData.data[lin(x, y) * 4 + 3] = 255;
				}
			}
		}
		if (e.key == 'j') {
			burstSize = Math.max(20, burstSize - 10);
		}
		if (e.key == 'k') {
			burstSize += 10;
		}
		if (e.key == 'h') {
			fireSpeed = Math.max(10, fireSpeed - 5);
		}
		if (e.key == 'l') {
			fireSpeed += 5;
		}
	}
}

document.addEventListener('mousedown', onMouseEvent);
document.addEventListener('mouseup', onMouseEvent);
document.addEventListener('mousemove', onMouseEvent);
document.addEventListener('keydown', onKeyEvent);
document.addEventListener('keyup', onKeyEvent);

update();
