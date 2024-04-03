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
let PAUSED = false;
let RUNNING = false;

// function drawGameTitle() {
// 	ctx.font = "35px Comic Sans MS";
// 	ctx.fillStyle = "red";
// 	ctx.shadowColor = "yellow"; // Shadow color
// 	ctx.shadowOffsetX = 2; // Horizontal shadow offset
// 	ctx.shadowOffsetY = 2; // Vertical shadow offset
// 	ctx.shadowBlur = 3; // Blur amount
// 	ctx.fillText("BLOCK ~ BREAKER", 10, 250); // Adjust xPosition and yPosition as needed
// 	ctx.shadowColor = "black"; // Shadow color
// }

function togglePause() {
	PAUSED = !PAUSED;
	if (PAUSED) {
		BG_SOUND.pause(); // Pause background music
		// drawGameTitle();
	} else {
		BG_SOUND.play(); // Resume background music
		if (!RUNNING) {
			loop(); // Resume game loop only if it's not already running
		}
	}
}

// CREATE THE PADDLE
const paddle = {
	x: cvs.width / 2 - PADDLE_WIDTH / 2,
	y: cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
	width: PADDLE_WIDTH,
	height: PADDLE_HEIGHT,
	dx: 4,
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
	paddleGradient.addColorStop(1, "black");
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

document.getElementById("start-button").addEventListener("click", function () {
	if (GAME_OVER) {
		document.querySelector("#start-button").style.display = "block";
		// Reset game variables
		LIVES = 3;
		SCORE = 0;
		LEVEL = 1;
		GAME_OVER = false;
		createBricks();
		resetBall();
		RUNNING = true; // Start the game loop
		loop(); // Start the game loop
	} else {
		togglePause(); // Toggle pause state
	}
});

document.addEventListener("keydown", function (event) {
	if (event.code === "Space") {
		togglePause();
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

	// Check if the paddle collides with the green dot
	if (
		greenDotVisible &&
		paddle.x < greenDotX + 5 &&
		paddle.x + paddle.width > greenDotX - 5 &&
		paddle.y < greenDotY + 5 &&
		paddle.y + paddle.height > greenDotY - 5
	) {
		// Increase paddle width by 20%
		let newPaddleWidth = paddle.width * 1.5;
		// Ensure the paddle width does not exceed the canvas width
		paddle.width = Math.min(newPaddleWidth, cvs.width - paddle.x);
		greenDotVisible = false; // Hide the green dot after collision

		// Set a timeout to reset the paddle width after 10 seconds
		setTimeout(() => {
			paddle.width = PADDLE_WIDTH; // Reset the paddle width
		}, 10000); // 10 seconds in milliseconds
	}

	// Check if the green dot touches the bottom of the canvas
	if (greenDotVisible && greenDotY + 5 >= cvs.height) {
		greenDotVisible = false; // Hide the green dot
	}
}

// CREATE THE BALL
const ball = {
	x: cvs.width / 2,
	y: paddle.y - BALL_RADIUS,
	radius: BALL_RADIUS,
	speed: 3,
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
	ballGradient.addColorStop(1, "#424242"); // Dark grey
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
	if (GAME_OVER) {
		ball.speed = 3; // Reset ball speed only if game over
	}
}

// BALL AND WALL COLLISION DETECTION
function ballWallCollision() {
	// Side walls
	if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
		ball.dx = -ball.dx;
		WALL_HIT.play();
	}

	// Top wall
	if (ball.y - ball.radius < 0) {
		ball.dy = -ball.dy;
		WALL_HIT.play();
	}

	// Bottom
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
		if (
			greenDotVisible &&
			paddle.x < greenDotX &&
			paddle.x + paddle.width > greenDotX &&
			paddle.y < greenDotY &&
			paddle.y + paddle.height > greenDotY
		) {
			// Increase paddle width by 10%
			let newPaddleWidth = paddle.width * 1.5;
			// Ensure the paddle width does not exceed the canvas width
			paddle.width = Math.min(newPaddleWidth, cvs.width - paddle.x);
		} else {
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
}

// CREATE THE BRICKS
const brick = {
	row: 1,
	column: 6,
	width: 50,
	height: 10,
	offSetLeft: 6,
	offSetTop: 8,
	marginTop: 70,
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

// Variable to store the position of the randomly selected brick
let greenBrickPosition = null;
let blueBrickPosition = null;

// DRAW BRICKS FUNCTION
function drawBricks() {
	for (let r = 0; r < brick.row; r++) {
		for (let c = 0; c < brick.column; c++) {
			let b = bricks[r][c];
			// if the brick isn't broken
			if (b.status) {
				if (
					greenBrickPosition &&
					greenBrickPosition.row === r &&
					greenBrickPosition.column === c
				) {
					ctx.shadowColor = "green"; // Set shadow color to green for the randomly selected brick
				} else {
					ctx.shadowColor = "red"; // Default shadow color
				}

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
				ctx.shadowBlur = 4; // Blur amount
				ctx.shadowOffsetX = 2; // Horizontal shadow offset
				ctx.shadowOffsetY = 2; // Vertical shadow offset
				ctx.fillRect(b.x, b.y, brick.width, brick.height);

				// Reset shadow properties
				ctx.shadowColor = "transparent";
				ctx.shadowBlur = 0;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;

				// Draw right border
				ctx.fillStyle = "cornflowerblue"; // Right border color
				ctx.fillRect(b.x + brick.width - 2, b.y, 2, brick.height);

				// Draw bottom border slightly darker than right border
				ctx.fillStyle = "darkblue"; // Darker blue for bottom border
				ctx.fillRect(b.x, b.y + brick.height - 2, brick.width, 2);
			}
		}
	}

	// Draw a green dot if it's visible
	if (greenDotVisible) {
		ctx.beginPath();
		ctx.fillStyle = "green";
		ctx.arc(greenDotX, greenDotY, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}
}

// Function to select a random brick position for green shadow and dot
function selectRandomBrickPosition() {
	// Randomly choose a row and column within the available bricks
	let row = Math.floor(Math.random() * brick.row);
	let column = Math.floor(Math.random() * brick.column);
	// Check if the selected brick is already broken, if so, choose another position
	while (!bricks[row][column].status) {
		row = Math.floor(Math.random() * brick.row);
		column = Math.floor(Math.random() * brick.column);
	}
	greenBrickPosition = { row, column };
	// Select a different position for the blue shadow and dot
	selectRandomBlueBrickPosition();
}

// Function to select a random brick position for blue shadow and dot
function selectRandomBlueBrickPosition() {
	// Randomly choose a row and column within the available bricks
	let row = Math.floor(Math.random() * brick.row);
	let column = Math.floor(Math.random() * brick.column);
	// Check if the selected brick is already broken, if so, choose another position
	while (
		!bricks[row][column].status ||
		(row === greenBrickPosition.row && column === greenBrickPosition.column)
	) {
		row = Math.floor(Math.random() * brick.row);
		column = Math.floor(Math.random() * brick.column);
	}
	blueBrickPosition = { row, column };
}

// Call selectRandomBrickPosition() to choose a random brick position
selectRandomBrickPosition();

let greenDotX = 0; // Initial X position of the green dot
let greenDotY = 0; // Initial Y position of the green dot
let greenDotSpeed = 2; // Speed of the green dot movement
let greenDotVisible = false; // Flag to indicate if the green dot should be visible
let greenBrickHit = false;

let blueDotX = 0; // Initial X position of the blue dot
let blueDotY = 0; // Initial Y position of the blue dot
let blueDotSpeed = 2; // Speed of the blue dot movement
let blueDotVisible = false; // Flag to indicate if the blue dot should be visible
let blueBrickHit = false;

// DRAW BRICKS FUNCTION
function drawBricks() {
	for (let r = 0; r < brick.row; r++) {
		for (let c = 0; c < brick.column; c++) {
			let b = bricks[r][c];
			// if the brick isn't broken
			if (b.status) {
				if (
					greenBrickPosition &&
					greenBrickPosition.row === r &&
					greenBrickPosition.column === c
				) {
					ctx.shadowColor = "green"; // Set shadow color to green for the randomly selected brick
				} else if (
					blueBrickPosition &&
					blueBrickPosition.row === r &&
					blueBrickPosition.column === c
				) {
					ctx.shadowColor = "blue"; // Set shadow color to blue for the randomly selected brick
				} else {
					ctx.shadowColor = "red"; // Default shadow color
				}

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
				ctx.shadowBlur = 4; // Blur amount
				ctx.shadowOffsetX = 2; // Horizontal shadow offset
				ctx.shadowOffsetY = 2; // Vertical shadow offset
				ctx.fillRect(b.x, b.y, brick.width, brick.height);

				// Reset shadow properties
				ctx.shadowColor = "transparent";
				ctx.shadowBlur = 0;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;

				// Draw right border
				ctx.fillStyle = "cornflowerblue"; // Right border color
				ctx.fillRect(b.x + brick.width - 2, b.y, 2, brick.height);

				// Draw bottom border slightly darker than right border
				ctx.fillStyle = "darkblue"; // Darker blue for bottom border
				ctx.fillRect(b.x, b.y + brick.height - 2, brick.width, 2);
			}
		}
	}

	// Draw a green dot if it's visible
	if (greenDotVisible) {
		ctx.beginPath();
		ctx.fillStyle = "green";
		ctx.arc(greenDotX, greenDotY, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}

	// Draw a blue dot if it's visible
	if (blueDotVisible) {
		ctx.beginPath();
		ctx.fillStyle = "blue";
		ctx.arc(blueDotX, blueDotY, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
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
					if (
						greenBrickPosition &&
						greenBrickPosition.row === r &&
						greenBrickPosition.column === c
					) {
						// If the ball hits the green shadow brick, set a flag to indicate it
						greenBrickHit = true;
						// Set the position of the green dot to the center of the brick
						greenDotX = b.x + brick.width / 2;
						greenDotY = b.y + brick.height / 2;
						greenDotVisible = true; // Make the green dot visible
					} else if (
						blueBrickPosition &&
						blueBrickPosition.row === r &&
						blueBrickPosition.column === c
					) {
						// If the ball hits the blue shadow brick, set a flag to indicate it
						blueBrickHit = true;
						// Set the position of the blue dot to the center of the brick
						blueDotX = b.x + brick.width / 2;
						blueDotY = b.y + brick.height / 2;
						blueDotVisible = true; // Make the blue dot visible
					}
					BRICK_HIT.play();
					ball.dy = -ball.dy;
					b.status = false; // the brick is broken
					SCORE += SCORE_UNIT;
				}
			}
		}
	}
}

// Function to move the green dot down the canvas
function moveGreenDot() {
	if (greenDotVisible) {
		// Move the green dot down the canvas
		greenDotY += greenDotSpeed;
		// Check if the green dot is out of the canvas
		if (greenDotY > cvs.height) {
			// If the green dot is out of the canvas, reset its position
			greenDotY = 0; // You can set it to any value you prefer
		}
	}
}

// Function to move the blue dot down the canvas
function moveBlueDot() {
	if (blueDotVisible) {
		// Move the blue dot down the canvas
		blueDotY += blueDotSpeed;
		// Check if the blue dot hits the paddle
		if (
			blueDotY + 5 >= paddle.y && // Check if the bottom of the blue dot hits the top of the paddle
			blueDotX >= paddle.x && // Check if the blue dot is horizontally aligned with the paddle
			blueDotX <= paddle.x + paddle.width // Check if the blue dot is horizontally aligned with the paddle
		) {
			blueDotVisible = false; // Hide the blue dot
		}
		// Check if the blue dot is out of the canvas
		if (blueDotY > cvs.height) {
			blueDotVisible = false; // Hide the blue dot
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
	ctx.fillText("Score: " + SCORE, 10, 35);

	// Draw level
	ctx.fillStyle = "white";
	ctx.font = "20px Comic Sans MS";
	ctx.fillText("Level: " + LEVEL, 150, 35);

	// Draw lives
	ctx.fillStyle = "lightgreen";
	ctx.font = "20px Comic Sans MS";
	ctx.fillText("Lives: " + LIVES, 260, 35);

	// Draw green dot if it's visible
	if (greenDotVisible) {
		// Create linear gradient for green dot (from top to bottom)
		let greenDotGradient = ctx.createLinearGradient(
			greenDotX,
			greenDotY - 15,
			greenDotX,
			greenDotY + 15,
		);
		greenDotGradient.addColorStop(0, "white"); // Light green at top
		greenDotGradient.addColorStop(0.4, "lightgreen"); // Middle
		greenDotGradient.addColorStop(0.7, "black"); // Dark green at bottom
		ctx.fillStyle = greenDotGradient;

		// Draw green dot with rounded corners
		let radius = 5;
		ctx.beginPath();
		ctx.moveTo(greenDotX - 15 + radius, greenDotY - 5);
		ctx.arcTo(
			greenDotX + 15,
			greenDotY - 5,
			greenDotX + 15,
			greenDotY + 5,
			radius,
		);
		ctx.arcTo(
			greenDotX + 15,
			greenDotY + 5,
			greenDotX - 15,
			greenDotY + 5,
			radius,
		);
		ctx.arcTo(
			greenDotX - 15,
			greenDotY + 5,
			greenDotX - 15,
			greenDotY - 5,
			radius,
		);
		ctx.arcTo(
			greenDotX - 15,
			greenDotY - 5,
			greenDotX + 15,
			greenDotY - 5,
			radius,
		);
		ctx.closePath();
		ctx.fill();
	}
}

// game over
function gameOver() {
	if (LIVES <= 0) {
		document.querySelector("#start-button").style.display = "block";
		//Game Over !!
		ctx.font = "40px Comic Sans MS";
		ctx.fillStyle = "red";
		ctx.shadowColor = "yellow"; // Shadow color
		ctx.shadowOffsetX = 1; // Horizontal shadow offset
		ctx.shadowOffsetY = 1; // Vertical shadow offset
		ctx.shadowBlur = 2; // Blur amount
		ctx.fillText("GAME OVER !!", 50, 250);
		// Score
		ctx.font = "30px Comic Sans MS";
		ctx.fillStyle = "yellow";
		ctx.shadowColor = "red"; // Shadow color
		ctx.shadowOffsetX = 2; // Horizontal shadow offset
		ctx.shadowOffsetY = 2; // Vertical shadow offset
		ctx.shadowBlur = 4; // Blur amount
		ctx.fillText("Score: " + SCORE, 100, 300);
		// Press restart

		ctx.shadowColor = "black"; // Shadow color

		GAME_OVER = true;

		// Reset ball speed
		ball.speed = 3;

		// Reset bricks
		createBricks();
		LEVEL = 1;
		brick.row = 3; // Reset the number of rows of bricks to 3
		GAMEOVER.play();
		BG_SOUND.pause();
	}
}

// Touch start event listener for restarting the game
// cvs.addEventListener("touchstart", function () {
// 	if (GAME_OVER) {
// 		// Reset game variables
// 		LIVES = 3;
// 		SCORE = 0;
// 		LEVEL = 1;
// 		GAME_OVER = false;
// 		createBricks();
// 		resetBall();
// 		loop(); // Restart the game loop
// 	}
// });

// Level up function
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
		// Increase level
		LEVEL++;
		// Reset ball position
		resetBall();
		// Increase ball speed
		ball.speed += 0.5; // Increase ball speed when level is cleared
		// Increase the number of rows of bricks
		brick.row++;
		// Create new bricks
		createBricks();

		// Re-randomize the green brick position
		selectRandomBrickPosition();
	}
}

// UPDATE GAME FUNCTION
function update() {
	movePaddle();
	moveBall();
	ballWallCollision();
	ballPaddleCollision();
	ballBrickCollision();
	moveGreenDot();
	moveBlueDot();
	gameOver();
}

// GAME LOOP
function loop() {
	if (!GAME_OVER) {
		RUNNING = true;
		document.querySelector("#start-button").style.display = "none";
		requestAnimationFrame(loop);
		// CLEAR THE CANVAS
		ctx.clearRect(0, 0, cvs.width, cvs.height);
		draw();
		// drawGameTitle();
		if (!PAUSED) {
			BG_SOUND.play();
			update();
			levelUp(); // Call levelUp function here to check for level transition after all bricks are destroyed
		} else {
			BG_SOUND.pause();
			document.querySelector("#start-button").style.display = "block";
		}
	}
}

// Initialize the game in a paused state
PAUSED = true;
loop();
