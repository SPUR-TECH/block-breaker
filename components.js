/////// LOAD SOUNDS ////////

////// Standard audio ///////
const BG_SOUND = new Audio();
BG_SOUND.src = "sounds/block-breaker-bg2-sound.mp3";

const LIFE_LOST = new Audio();
LIFE_LOST.src = "sounds/block-breaker-life-sound.mp3";

const GAMEOVER = new Audio();
GAMEOVER.src = "sounds/block-breaker-gameover-sound.mp3";

const WIN = new Audio();
WIN.src = "sounds/block-breaker-level-sound.mp3";
////// Standard audio ///////

////////////////////////////////////////////////////////////

////// Howler audio //////
const BRICK_HIT = new Howl({
	src: "sounds/block-breaker-block-sound.mp3",
});

const PADDLE_HIT = new Howl({
	src: "sounds/block-breaker-paddle-sound.mp3",
});

const WALL_HIT = new Howl({
	src: "sounds/block-breaker-walls-sound.mp3",
});
////// Howler audio //////
