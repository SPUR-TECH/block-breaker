// SELECT CANVAS ELEMENT
const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

// GAME VARIABLES AND CONSTANTS
const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 5;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 8;
let LIFE = 3; // PLAYER HAS 3 LIVES
let leftArrow = false;
let rightArrow = false;

// CREATE THE PADDLE
const paddle = {
	x: cvs.width / 2 - PADDLE_WIDTH / 2,
	y: cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
	width: PADDLE_WIDTH,
	height: PADDLE_HEIGHT,
	dx: 5,
};

// DRAW PADDLE
function drawPaddle() {
	ctx.fillStyle = "#2e3548";
	ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

	ctx.strokeStyle = "#ffcd05";
	ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// CONTROL THE PADDLE
document.addEventListener("keydown", function (event) {
	if (event.code == "ArrowLeft") {
		leftArrow = true;
	} else if (event.code == "ArrowRight") {
		rightArrow = true;
	}
});
document.addEventListener("keyup", function (event) {
	if (event.code == "ArrowLeft") {
		leftArrow = false;
	} else if (event.code == "ArrowRight") {
		rightArrow = false;
	}
});

// MOVE PADDLE
function movePaddle() {
	if (rightArrow && paddle.x + paddle.width < cvs.width) {
		paddle.x += paddle.dx;
	} else if (leftArrow && paddle.x > 0) {
		paddle.x -= paddle.dx;
	}
}

// CREATE THE BALL
const ball = {
	x: cvs.width / 2,
	y: paddle.y - BALL_RADIUS,
	radius: BALL_RADIUS,
	speed: 4,
	dx: 3 * (Math.random() * 2 - 1),
	dy: -3,
};

// DRAW THE BALL
function drawBall() {
	ctx.beginPath();
	let ballGradient = ctx.createLinearGradient(
		ball.x - ball.radius,
		ball.y - ball.radius,
		ball.x + ball.radius,
		ball.y + ball.radius,
	);
	ballGradient.addColorStop(0.4, "white"); // White
	ballGradient.addColorStop(1, "#424242"); // Darker grey
	ctx.fillStyle = ballGradient;
	ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
	ctx.fill();
}

// MOVE THE BALL
function moveBall() {
	ball.x += ball.dx;
	ball.y += ball.dy;
}

// RESET THE BALL
function resetBall() {
	ball.x = cvs.width / 2;
	ball.y = paddle.y - BALL_RADIUS;
	ball.dx = 3 * (Math.random() * 2 - 1);
	ball.dy = -3;
}

// BALL AND WALL COLLISION DETECTION
function ballWallCollision() {
	if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
		ball.dx = -ball.dx;
	}

	if (ball.y - ball.radius < 0) {
		ball.dy = -ball.dy;
	}

	if (ball.y + ball.radius > cvs.height) {
		LIFE--; // LOSE LIFE
		resetBall();
	}
}

// BALL AND PADDLE COLLISION
function ballPaddleCollision() {
	if (
		ball.x < paddle.x + paddle.width &&
		ball.x > paddle.x &&
		paddle.y < paddle.y + paddle.height &&
		ball.y > paddle.y
	) {
		// CHECK WHERE THE BALL HIT THE PADDLE
		let collidePoint = ball.x - (paddle.x + paddle.width / 2);

		// NORMALIZE THE VALUES
		collidePoint = collidePoint / (paddle.width / 2);

		// CALCULATE THE ANGLE OF THE BALL
		let angle = (collidePoint * Math.PI) / 3;

		ball.dx = ball.speed * Math.sin(angle);
		ball.dy = -ball.speed * Math.cos(angle);
	}
}

// DRAW FUNCTION
function draw() {
	drawPaddle();
	drawBall();

	// drawBall();
}

// UPDATE GAME FUNCTION
function update() {
	movePaddle();
	moveBall();
	ballWallCollision();
	ballPaddleCollision();
}

// GAME LOOP
function loop() {
	// CLEAR THE CANVAS
	ctx.clearRect(0, 0, cvs.width, cvs.height);
	requestAnimationFrame(loop);

	draw();

	update();
}
loop();
