// SELECT CANVAS ELEMENT
const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

// GAME VARIABLES AND CONSTANTS
const PADDLE_WIDTH = 80;
const PADDLE_MARGIN_BOTTOM = 15;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 6;
const SCORE_UNIT = 10;
const MAX_ROWS = 10;

// CREATE THE BRICKS
const brick = {
	row: 3,
	column: 6,
	width: 50,
	height: 10,
	offSetLeft: 6,
	offSetTop: 8,
	marginTop: 70,
	fillColor: "skyblue",
};

// CREATE THE PADDLE
const paddle = {
	x: cvs.width / 2 - PADDLE_WIDTH / 2,
	y: cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
	width: PADDLE_WIDTH,
	height: PADDLE_HEIGHT,
	dx: 4,
};

// CREATE THE BALL
const ball = {
	x: cvs.width / 2,
	y: paddle.y - BALL_RADIUS,
	radius: BALL_RADIUS,
	speed: 3,
	dx: 3 * (Math.random() * 2 - 1),
	dy: -3,
};

// Initialize orange projectiles array
let orangeProjectiles = [];

let bricks = [];
// Variable to store the position of the randomly selected brick
let greenBrickPosition = null;
let blueBrickPosition = null;
let orangeBrickPosition = null;

let greenDotX = 0; // Initial X position of the green dot
let greenDotY = 0; // Initial Y position of the green dot
let greenDotSpeed = 1; // Speed of the green dot movement
let greenDotVisible = false; // Flag to indicate if the green dot should be visible
let greenBrickHit = false;

let blueDotX = 0; // Initial X position of the blue dot
let blueDotY = 0; // Initial Y position of the blue dot
let blueDotSpeed = 1; // Speed of the blue dot movement
let blueDotVisible = false; // Flag to indicate if the blue dot should be visible
let blueBrickHit = false;

let blueWallVisible = false;

let orangeDotX = 0; // Initial X position of the orange dot
let orangeDotY = 0; // Initial Y position of the orange dot
let orangeDotSpeed = 1; // Speed of the orange dot movement
let orangeDotVisible = false; // Flag to indicate if the orange dot should be visible
let orangeBrickHit = false;

let LIVES = 3;
let SCORE = 0;
let LEVEL = 1;
let leftArrow = false;
let rightArrow = false;
let GAME_OVER = false;
let PAUSED = false;
let RUNNING = false;

function togglePause() {
	PAUSED = !PAUSED;
	if (PAUSED) {
		PROJECTILES.pause(); // Pause projectile sound
		BG_SOUND.pause(); // Pause background music

		// Clear projectile creation interval
		clearInterval(projectileInterval);

		// drawGameTitle();
	} else {
		BG_SOUND.play(); // Resume background music
		if (!RUNNING) {
			loop(); // Resume game loop only if it's not already running
		}
	}
}

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
document
	.getElementById("left-button")
	.addEventListener("touchstart", function (event) {
		event.preventDefault(); // Prevent default behavior (e.g., image selection)
		leftArrow = true;
	});

document
	.getElementById("left-button")
	.addEventListener("touchend", function (event) {
		event.preventDefault(); // Prevent default behavior (e.g., image selection)
		leftArrow = false;
	});

document
	.getElementById("right-button")
	.addEventListener("touchstart", function (event) {
		event.preventDefault(); // Prevent default behavior (e.g., image selection)
		rightArrow = true;
	});

document
	.getElementById("right-button")
	.addEventListener("touchend", function (event) {
		event.preventDefault(); // Prevent default behavior (e.g., image selection)
		rightArrow = false;
	});

document.getElementById("start-button").addEventListener("click", function () {
	if (GAME_OVER) {
		document.querySelector("#start-button").style.display = "block";
		document.querySelector("#h1").style.display = "flex";

		spliceAllProjectiles(); // Ensure all projectiles are spliced before restart

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
	// Play START sound
	START.play();
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
	if (rightArrow && paddle.x + paddle.width + 3 < cvs.width) {
		paddle.x += paddle.dx;
	} else if (leftArrow && paddle.x - 3 > 0) {
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
		PADDLE_ENLARGED.play();
		// Increase paddle width by 20%
		let paddleGrowth = paddle.width * 0.5; // 25% increase
		let newPaddleWidth = paddle.width + paddleGrowth;
		let paddleShift = paddleGrowth / 2; // Shift paddle to the left by half of the growth

		// Adjust paddle position to the left by the amount it grows
		paddle.x -= paddleShift;

		// Update paddle width
		paddle.width = newPaddleWidth;

		greenDotVisible = false; // Hide the green dot after collision

		// Set a timeout to reset the paddle width after 10 seconds
		setTimeout(() => {
			// Reset paddle width and position
			paddle.width = PADDLE_WIDTH;
			paddle.x += paddleShift;
		}, 10000); // 10 seconds in milliseconds
	}

	// Check if the green dot touches the bottom of the canvas
	if (greenDotVisible && greenDotY + 5 >= cvs.height) {
		greenDotVisible = false; // Hide the green dot
	}
}

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

// Function to reset the ball and increase speed based on level
function resetBall() {
	ball.x = cvs.width / 2;
	ball.y = paddle.y - BALL_RADIUS;
	ball.dx = 3 * (Math.random() * 2 - 1);
	ball.dy = -3;
	ball.speed = 3 + (LEVEL - 1) * 0.5; // Increase ball speed based on level
}

// BALL AND WALL COLLISION DETECTION
function ballWallCollision() {
	// Side walls
	if (ball.x + ball.radius + 3 > cvs.width || ball.x - ball.radius - 3 < 0) {
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

	// Check for collision with blue wall if it's visible
	if (blueWallVisible) {
		// Check if the ball hits the blue wall from below
		if (
			ball.y + ball.radius > cvs.height - 10 && // Check if the bottom of the ball hits the top of the blue wall
			ball.x > 0 && // Check if the ball is within the left boundary of the canvas
			ball.x < cvs.width // Check if the ball is within the right boundary of the canvas
		) {
			ball.dy = -ball.dy; // Reverse the y-direction of the ball
			SHIELD_HIT.play(); // Play the wall hit sound
		}
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
			PADDLE_ENLARGED.play();
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

// Function to select a random brick position for orange shadow and dot
function selectRandomOrangeBrickPosition() {
	// Randomly choose a row and column within the available bricks
	let row = Math.floor(Math.random() * brick.row);
	let column = Math.floor(Math.random() * brick.column);
	// Check if the selected brick is already broken, if so, choose another position
	while (
		!bricks[row][column].status ||
		(row === greenBrickPosition.row && column === greenBrickPosition.column) ||
		(row === blueBrickPosition.row && column === blueBrickPosition.column)
	) {
		row = Math.floor(Math.random() * brick.row);
		column = Math.floor(Math.random() * brick.column);
	}
	orangeBrickPosition = { row, column };
}

// Call selectRandomBrickPosition() to choose a random brick position
selectRandomBrickPosition();

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
				} else if (
					orangeBrickPosition &&
					orangeBrickPosition.row === r &&
					orangeBrickPosition.column === c
				) {
					ctx.shadowColor = "orange"; // Set shadow color to orange for the randomly selected brick
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

	// Draw a blue dot as a line with a more prominent shadow if it's visible
	if (blueDotVisible) {
		// Save the current state of the canvas
		ctx.save();

		// Draw a blue shadow around the blue dot line
		ctx.beginPath();
		ctx.moveTo(blueDotX - 20, blueDotY); // Start from left
		ctx.lineTo(blueDotX + 20, blueDotY); // End at right
		ctx.lineWidth = 4; // Set line width to 4

		// Set the shadow color to a semi-transparent light blue
		ctx.shadowColor = "rgba(0, 150, 255, 0.98)";
		ctx.shadowBlur = 10; // Set blur amount for the shadow
		ctx.strokeStyle = "blue"; // Set stroke color to black
		ctx.stroke();
		ctx.closePath();

		// Restore the canvas to its previous state
		ctx.restore();
	}
}

// Variable to keep track of the projectile creation interval
let projectileInterval = null;

// Function to handle the creation of projectiles
function handleProjectileCreation() {
	// Create projectiles
	createOrangeProjectiles();
}

// Move the orange dot function remains the same
function moveOrangeDot() {
	if (orangeDotVisible) {
		// Move the orange dot down the canvas
		orangeDotY += orangeDotSpeed;

		// Check if the orange dot hits the paddle
		if (
			orangeDotY + 5 >= paddle.y && // Check if the bottom of the orange dot hits the top of the paddle
			orangeDotX >= paddle.x && // Check if the orange dot is horizontally aligned with the paddle
			orangeDotX <= paddle.x + paddle.width // Check if the orange dot is horizontally aligned with the paddle
		) {
			handleProjectileCreation(); // Call the function to handle projectile creation
			orangeDotVisible = false; // Hide the orange dot

			// Set an interval to continue creating projectiles every second for 10 seconds
			projectileInterval = setInterval(handleProjectileCreation, 500);

			// Set a timer to clear the projectile interval after 10 seconds
			setTimeout(() => {
				clearInterval(projectileInterval);
			}, 10000);
		}

		// Check if the orange dot is out of the canvas
		if (orangeDotY > cvs.height) {
			orangeDotVisible = false; // Hide the orange dot
		}
	}
}

// Function to draw the orange dot
function drawOrangeDot() {
	if (orangeDotVisible) {
		// Set the line color to orange
		ctx.strokeStyle = "orange";
		ctx.lineWidth = 3; // Set line width

		// Draw the first orange line with adjusted coordinates
		ctx.beginPath();
		ctx.moveTo(orangeDotX - 10, orangeDotY - 6); // Starting point (top), adjusted by -10 pixels horizontally
		ctx.lineTo(orangeDotX - 10, orangeDotY + 6); // Ending point (bottom), adjusted by -10 pixels horizontally
		ctx.stroke();
		ctx.closePath();

		// Draw the second orange line with adjusted coordinates
		ctx.beginPath();
		ctx.moveTo(orangeDotX + 10, orangeDotY - 6); // Starting point (top), adjusted by +10 pixels horizontally
		ctx.lineTo(orangeDotX + 10, orangeDotY + 6); // Ending point (bottom), adjusted by +10 pixels horizontally
		ctx.stroke();
		ctx.closePath();
	}
}

selectRandomOrangeBrickPosition();

function createOrangeProjectiles() {
	// Calculate initial x position for the projectiles
	let x1 = paddle.x + 10; // Set x1 to 10 pixels in from the left end of the paddle
	let x2 = paddle.x + paddle.width - 10; // Set x2 to 10 pixels in from the right end of the paddle

	// Calculate initial y position for the projectiles
	let y = paddle.y - 10; // Adjust the initial y position as needed

	// Calculate velocity for the projectiles
	let velocityY = -5; // Adjust vertical velocity as needed

	// Create projectiles for both ends
	let projectile1 = { x: x1, y, width: 5, height: 10, velocityY };
	let projectile2 = { x: x2, y, width: 5, height: 10, velocityY };

	// Add projectiles to the array
	orangeProjectiles.push(projectile1, projectile2);
	PROJECTILES.play();
}

// Function to move orange projectiles
function moveOrangeProjectiles() {
	for (let i = 0; i < orangeProjectiles.length; i++) {
		// Move the projectile upwards
		orangeProjectiles[i].y += orangeProjectiles[i].velocityY;

		// Check if the projectile reaches the top of the canvas
		if (orangeProjectiles[i].y <= 0) {
			// Remove the projectile from the array
			orangeProjectiles.splice(i, 1);
			i--; // Decrement i to adjust for the removed element
		} else {
			// Check if the projectile hits a brick
			if (orangeProjectileHitsBrick(orangeProjectiles[i])) {
				// If a hit occurs, remove the projectile from the array
				orangeProjectiles.splice(i, 1);
				i--; // Decrement i to adjust for the removed element
			}
		}
	}
}

// Function to draw orange projectiles
function drawOrangeProjectiles() {
	ctx.fillStyle = "orange"; // Set the fill color to orange
	for (let i = 0; i < orangeProjectiles.length; i++) {
		let projectile = orangeProjectiles[i];
		ctx.fillRect(
			projectile.x,
			projectile.y,
			projectile.width,
			projectile.height,
		);
	}
}

// Function to check if an orange projectile hits a brick
function orangeProjectileHitsBrick(projectile) {
	for (let r = 0; r < brick.row; r++) {
		for (let c = 0; c < brick.column; c++) {
			let b = bricks[r][c];
			if (b.status) {
				if (
					projectile.x + projectile.width > b.x &&
					projectile.x < b.x + brick.width &&
					projectile.y + projectile.height > b.y &&
					projectile.y < b.y + brick.height
				) {
					BRICK_HIT.play();
					// If the projectile hits a brick, set the brick status to false (broken)
					b.status = false;
					return true; // Return true to indicate a hit
				}
			}
		}
	}
	return false; // Return false if no hit occurs
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
					} else if (
						orangeBrickPosition &&
						orangeBrickPosition.row === r &&
						orangeBrickPosition.column === c
					) {
						// If the ball hits the orange shadow brick, set a flag to indicate it
						orangeBrickHit = true;
						// Set the position of the orange dot to the center of the brick
						orangeDotX = b.x + brick.width / 2;
						orangeDotY = b.y + brick.height / 2;
						orangeDotVisible = true; // Make the orange dot visible
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

// Function to reset blue wall visibility after 10 seconds
function resetBlueWallVisibility() {
	blueWallVisible = false;
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
			blueWallVisible = true; // Set flag to show blue wall
			SHIELD_UP.play();
			// Reset blue wall visibility after 10 seconds
			setTimeout(resetBlueWallVisibility, 10000);
		}
		// Check if the blue dot is out of the canvas
		if (blueDotY > cvs.height) {
			blueDotVisible = false; // Hide the blue dot
		}
	}
}

// Function to draw the blue wall with shadow
function drawBlueWall() {
	ctx.save(); // Save the current canvas state

	// Create linear gradient for blue wall (from top to bottom)
	let blueWallGradient = ctx.createLinearGradient(
		0,
		cvs.height - 10,
		0,
		cvs.height,
	);

	blueWallGradient.addColorStop(0, "rgba(0, 0, 255, 0.6)"); // Dark blue at top with 50% opacity
	blueWallGradient.addColorStop(1, "rgba(0, 0, 139, 0.4)"); // Even darker blue at bottom with 80% opacity

	// Set blue wall fill style to the gradient
	ctx.fillStyle = blueWallGradient;

	// Apply shadow effect to the blue wall
	ctx.shadowColor = "rgba(0, 0, 255, 0.98)"; // Blue shadow color
	ctx.shadowBlur = 10; // Blur amount for the shadow
	ctx.shadowOffsetX = 0; // Horizontal offset for the shadow
	ctx.shadowOffsetY = -2; // Vertical offset for the shadow

	// Draw the blue wall as a filled rectangle
	ctx.fillRect(0, cvs.height - 10, cvs.width, 10);

	ctx.restore(); // Restore the canvas state to remove the shadow effect
}

// DRAW FUNCTION
function draw() {
	drawPaddle();
	drawBall();
	drawBricks();
	drawOrangeDot();
	drawOrangeProjectiles(); // Draw orange projectiles

	// Draw blue wall if the flag is true
	if (blueWallVisible) {
		drawBlueWall();
	}

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

	// Check if the orange dot hits the paddle
	if (
		orangeDotVisible &&
		paddle.x < orangeDotX &&
		paddle.x + paddle.width > orangeDotX &&
		paddle.y < orangeDotY &&
		paddle.y + paddle.height > orangeDotY
	) {
		// Call the function to draw vertical lines
		drawVerticalLines();
		// Hide the orange dot
		orangeDotVisible = false;
	}
}

// Function to splice all projectiles
function spliceAllProjectiles() {
	// Splice orange projectiles array
	orangeProjectiles.splice(0, orangeProjectiles.length);
}

// game over
function gameOver() {
	if (LIVES <= 0) {
		document.querySelector("#start-button").style.display = "block";
		document.querySelector("#h1").style.display = "flex";
		// Game Over !!
		ctx.font = "40px Comic Sans MS";
		ctx.fillStyle = "red";
		ctx.shadowColor = "yellow"; // Shadow color
		ctx.shadowOffsetX = 2; // Horizontal shadow offset
		ctx.shadowOffsetY = 2; // Vertical shadow offset
		ctx.shadowBlur = 2; // Blur amount
		ctx.fillText("GAME OVER !!", 50, 300);
		// Score
		ctx.font = "35px Comic Sans MS";
		ctx.fillStyle = "yellow";
		ctx.shadowColor = "red"; // Shadow color
		ctx.shadowOffsetX = 3; // Horizontal shadow offset
		ctx.shadowOffsetY = 3; // Vertical shadow offset
		ctx.shadowBlur = 4; // Blur amount
		ctx.fillText("Score: " + SCORE, 100, 350);
		// Level
		ctx.font = "30px Comic Sans MS";
		ctx.fillStyle = "white";
		ctx.shadowColor = "black"; // Shadow color
		ctx.shadowOffsetX = 2; // Horizontal shadow offset
		ctx.shadowOffsetY = 2; // Vertical shadow offset
		ctx.shadowBlur = 4; // Blur amount
		ctx.fillText("Level: " + LEVEL, 120, 400);

		greenDotVisible = false;
		blueDotVisible = false;
		orangeDotVisible = false;

		GAME_OVER = true;

		// Reset ball speed
		ball.speed = 3;

		// Reset bricks
		createBricks();
		LEVEL = 1;
		brick.row = 3; // Reset the number of rows of bricks to 3
		GAMEOVER.play();
		BG_SOUND.pause();
		PROJECTILES.pause();

		// Clear projectile creation interval
		clearInterval(projectileInterval);
	}
}

// Function to splice all projectiles when a level is cleared
function spliceAllProjectiles() {
	// Clear the orange projectiles array
	orangeProjectiles = [];
}

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

		// Clear projectile creation interval
		clearInterval(projectileInterval);

		// Call the function to splice all projectiles when a level is cleared
		spliceAllProjectiles();
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
	moveOrangeDot();
	moveOrangeProjectiles(); // Move orange projectiles
	gameOver();
	levelUp();
}

// Function to clean up removed items periodically
function cleanupRemovedItems() {
	// Clean up orange projectiles
	orangeProjectiles = orangeProjectiles.filter(
		(projectile) => projectile.y > 0,
	);
}

// GAME LOOP
function loop() {
	if (!GAME_OVER) {
		RUNNING = true;
		document.querySelector("#start-button").style.display = "none";
		document.querySelector("#h1").style.display = "none";
		requestAnimationFrame(loop);
		// CLEAR THE CANVAS
		ctx.clearRect(0, 0, cvs.width, cvs.height);
		draw();
		cleanupRemovedItems();
		// drawGameTitle();
		if (!PAUSED) {
			BG_SOUND.play();
			update();
			levelUp(); // Call levelUp function here to check for level transition after all bricks are destroyed
		} else {
			BG_SOUND.pause();
			document.querySelector("#start-button").style.display = "block";
			document.querySelector("#h1").style.display = "flex";
			cleanupRemovedItems();
		}
	}
}

// Initialize the game in a paused state
PAUSED = true;
loop();
