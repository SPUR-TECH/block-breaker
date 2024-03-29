// https://www.youtube.com/watch?v=opA9Tc-cqgc

// SELECT CANVAS ELEMENT
const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

// GAME VARIABLES AND CONSTANTS
const PADDLE_WIDTH = 80;
const PADDLE_MARGIN_BOTTOM = 5;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 6;
const SCORE_UNIT = 10;
const MAX_ROWS = 10;

let LIVES = 3; // PLAYER HAS 3 LIVES
let SCORE = 0;
let LEVEL = 1;
let leftArrow = false;
let rightArrow = false;
let GAME_OVER = false;

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
	// Create linear gradient for paddle (from top to bottom)
	let paddleGradient = ctx.createLinearGradient(
		paddle.x,
		paddle.y,
		paddle.x,
		paddle.y + paddle.height,
	);
	paddleGradient.addColorStop(0, "lightgreen");
	paddleGradient.addColorStop(1, "darkgreen");
	ctx.fillStyle = paddleGradient;
	let radius = paddle.height / 2; // Radius for rounded corners
	ctx.beginPath();
	ctx.moveTo(paddle.x + radius, paddle.y);
	ctx.arcTo(
		paddle.x + paddle.width,
		paddle.y,
		paddle.x + paddle.width,
		paddle.y + paddle.height,
		radius,
	);
	ctx.arcTo(
		paddle.x + paddle.width,
		paddle.y + paddle.height,
		paddle.x,
		paddle.y + paddle.height,
		radius,
	);
	ctx.arcTo(paddle.x, paddle.y + paddle.height, paddle.x, paddle.y, radius);
	ctx.arcTo(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y, radius);
	ctx.closePath();
	ctx.fill();
}

// CONTROL THE PADDLE
cvs.addEventListener("touchstart", function (event) {
	let touchX = event.touches[0].clientX;
	// Check if touch is on the left half of the screen
	if (touchX < cvs.width / 2) {
		leftArrow = true;
	} else {
		rightArrow = true;
	}
});

// Touch end event listener
cvs.addEventListener("touchend", function () {
	leftArrow = false;
	rightArrow = false;
});

document.addEventListener("keydown", function (event) {
	if (event.code === "Space") {
		if (GAME_OVER) {
			// Reset game variables
			LIVES = 3;
			SCORE = 0;
			LEVEL = 1;
			GAME_OVER = false;
			createBricks();
			resetBall();
			loop(); // Restart the game loop
		}
	}
});

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
		WALL_HIT.play();
	}

	if (ball.y - ball.radius < 0) {
		ball.dy = -ball.dy;
	}

	if (ball.y + ball.radius > cvs.height) {
		LIVES--; // LOSE LIFE
		LIFE_LOST.play();
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
		// PLAY SOUND
		PADDLE_HIT.play();

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

// CREATE THE BRICKS
const brick = {
	row: 3,
	column: 7,
	width: 50,
	height: 10,
	offSetLeft: 6,
	offSetTop: 8,
	marginTop: 60,
	fillColor: "skyblue",
};

let bricks = [];

function createBricks() {
	bricks = []; // Clear the bricks array
	if (bricks.length === 0 || bricks.length < LEVEL + 1) {
		// Add a new row of bricks only if there are no bricks or if the number of rows is less than LEVEL + 1
		for (let r = 0; r < brick.row; r++) {
			bricks[r] = [];
			for (let c = 0; c < brick.column; c++) {
				bricks[r][c] = {
					x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
					y:
						r * (brick.offSetTop + brick.height) +
						brick.offSetTop +
						brick.marginTop,
					status: true,
				};
			}
		}
	}
}
createBricks();

// draw the bricks
function drawBricks() {
	for (let r = 0; r < brick.row; r++) {
		for (let c = 0; c < brick.column; c++) {
			let b = bricks[r][c];
			// if the brick isn't broken
			if (b.status) {
				// Create linear gradient for brick (from top to bottom)
				let brickGradient = ctx.createLinearGradient(
					b.x,
					b.y,
					b.x,
					b.y + brick.height,
				);
				brickGradient.addColorStop(0, "lightblue"); // Light blue at top
				brickGradient.addColorStop(1, "blue"); // Dark blue at bottom
				ctx.fillStyle = brickGradient;

				// Draw brick with shadow
				ctx.shadowColor = "red"; // Shadow color
				ctx.shadowBlur = 4; // Blur amount
				ctx.shadowOffsetX = 2; // Horizontal shadow offset
				ctx.shadowOffsetY = 2; // Vertical shadow offset
				ctx.fillRect(b.x, b.y, brick.width, brick.height);

				// Reset shadow properties
				// ctx.shadowColor = "transparent";
				// ctx.shadowBlur = 0;
				// ctx.shadowOffsetX = 0;
				// ctx.shadowOffsetY = 0;

				// Draw right border
				ctx.fillStyle = "cornflowerblue"; // Right border color
				ctx.fillRect(b.x + brick.width - 2, b.y, 2, brick.height);

				// Draw bottom border slightly darker than right border
				ctx.fillStyle = "darkblue"; // Darker blue for bottom border
				ctx.fillRect(b.x, b.y + brick.height - 2, brick.width, 2);
			}
		}
	}
}

// ball brick collision
function ballBrickCollision() {
	for (let r = 0; r < brick.row; r++) {
		for (let c = 0; c < brick.column; c++) {
			let b = bricks[r][c];
			// if the brick isn't broken
			if (b.status) {
				if (
					ball.x + ball.radius > b.x &&
					ball.x - ball.radius < b.x + brick.width &&
					ball.y + ball.radius > b.y &&
					ball.y - ball.radius < b.y + brick.height
				) {
					BRICK_HIT.play();
					ball.dy = -ball.dy;
					b.status = false; // the brick is broken
					SCORE += SCORE_UNIT;
				}
			}
		}
	}
}

// show game stats
function showGameStats(text, textX, textY, img, imgX, imgY) {
	// draw text
	ctx.fillStyle = "white";
	ctx.font = "25px Comic Sans MS";
	ctx.fillText(text, textX, textY);

	// draw image
	ctx.drawImage(img, imgX, imgY, 25, 25);
}

// DRAW FUNCTION
function draw() {
	drawPaddle();
	drawBall();
	drawBricks();
	// Draw score
	ctx.fillStyle = "yellow";
	ctx.font = "20px Comic Sans MS";
	ctx.shadowColor = "red"; // Shadow color
	ctx.shadowOffsetX = 2; // Horizontal shadow offset
	ctx.shadowOffsetY = 2; // Vertical shadow offset
	ctx.shadowBlur = 3; // Blur amount
	ctx.fillText("Score: " + SCORE, 10, 25);

	// Draw level
	ctx.fillStyle = "white";
	ctx.font = "20px Comic Sans MS";
	ctx.shadowColor = "black"; // Shadow color
	ctx.shadowOffsetX = 2; // Horizontal shadow offset
	ctx.shadowOffsetY = 2; // Vertical shadow offset
	ctx.shadowBlur = 4; // Blur amount
	ctx.fillText("Level: " + LEVEL, 160, 25);

	// Draw lives
	ctx.fillStyle = "lightgreen";
	ctx.font = "20px Comic Sans MS";
	ctx.shadowColor = "black"; // Shadow color
	ctx.shadowOffsetX = 2; // Horizontal shadow offset
	ctx.shadowOffsetY = 2; // Vertical shadow offset
	ctx.shadowBlur = 4; // Blur amount
	ctx.fillText("Lives: " + LIVES, 310, 25);
}

// game over
function gameOver() {
	if (LIVES <= 0) {
		//Game Over !!
		ctx.font = "40px Comic Sans MS";
		ctx.fillStyle = "red";
		ctx.shadowColor = "yellow"; // Shadow color
		ctx.shadowOffsetX = 1; // Horizontal shadow offset
		ctx.shadowOffsetY = 1; // Vertical shadow offset
		ctx.shadowBlur = 2; // Blur amount
		ctx.fillText("GAME OVER !!", 80, 200);
		// Score
		ctx.font = "30px Comic Sans MS";
		ctx.fillStyle = "yellow";
		ctx.shadowColor = "red"; // Shadow color
		ctx.shadowOffsetX = 2; // Horizontal shadow offset
		ctx.shadowOffsetY = 2; // Vertical shadow offset
		ctx.shadowBlur = 4; // Blur amount
		ctx.fillText("Score: " + SCORE, 150, 250);
		// Press restart
		ctx.font = "20px Comic Sans MS";
		ctx.fillStyle = "lightgreen";
		ctx.shadowColor = "black"; // Shadow color
		ctx.shadowOffsetX = 2; // Horizontal shadow offset
		ctx.shadowOffsetY = 2; // Vertical shadow offset
		ctx.shadowBlur = 9; // Blur amount
		ctx.fillText("Tap to or press (SPACE)'RESTART'", 40, 290);

		GAME_OVER = true;

		// Reset bricks
		createBricks();
		LEVEL = 1;
		brick.row = 3; // Reset the number of rows of bricks to 3
	}
}

// Touch start event listener for restarting the game
cvs.addEventListener("touchstart", function () {
	if (GAME_OVER) {
		// Reset game variables
		LIVES = 3;
		SCORE = 0;
		LEVEL = 1;
		GAME_OVER = false;
		createBricks();
		resetBall();
		loop(); // Restart the game loop
	}
});

// level up
function levelUp() {
	let isLevelDone = true;

	// check if all the bricks are broken
	for (let r = 0; r < brick.row; r++) {
		for (let c = 0; c < brick.column; c++) {
			isLevelDone = isLevelDone && !bricks[r][c].status;
		}
	}

	if (isLevelDone) {
		WIN.play();
		// Reset ball position
		resetBall();
		// Increase level
		LEVEL++;
		// Increase ball speed
		ball.speed += 0.5;
		// Increase the number of rows of bricks
		brick.row++;
		// Create new bricks
		createBricks();
	}
}

// UPDATE GAME FUNCTION
function update() {
	movePaddle();
	moveBall();
	ballWallCollision();
	ballPaddleCollision();
	ballBrickCollision();
	gameOver();
}

// GAME LOOP
function loop() {
	if (!GAME_OVER) {
		requestAnimationFrame(loop);
	}
	// CLEAR THE CANVAS
	ctx.clearRect(0, 0, cvs.width, cvs.height);
	draw();
	update();
	levelUp(); // Call levelUp function here to check for level transition after all bricks are destroyed
}
loop();
