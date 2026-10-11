
const board = document.getElementById("board");
const lanes = [...document.querySelectorAll(".lane")];

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const bestText = document.getElementById("best");
const message = document.getElementById("message");
const startButton = document.getElementById("start");

const letters = ["A", "S", "D", "F"];
const tileHeight = 62;
const hitY = 410;

let tiles = [];
let score = 0;
let lives = 3;
let speed = 190;
let running = false;
let lastTime = 0;
let lastSpawn = 0;
let spawnDelay = 850;
let animationId = null;

let best = Number(localStorage.getItem("pianoBest") || 0);
bestText.textContent = best;

function updateStats() {
  scoreText.textContent = score;
  livesText.textContent =
    "❤️".repeat(lives) + "🖤".repeat(3 - lives);
}

function spawnTile() {
  const laneIndex = Math.floor(Math.random() * 4);
  const tile = document.createElement("div");

  tile.className = "tile";
  tile.textContent = letters[laneIndex];

  lanes[laneIndex].appendChild(tile);

  tiles.push({
    element: tile,
    lane: laneIndex,
    y: -tileHeight,
    alive: true
  });
}

function removeTile(tile) {
  tile.alive = false;
  tile.element.remove();
}

function pressLetter(letter) {
  if (!running) return;

  const laneIndex = letters.indexOf(letter);
  if (laneIndex === -1) return;

  const candidates = tiles
    .filter(t => t.alive && t.lane === laneIndex)
    .sort((a, b) => b.y - a.y);

  const tile = candidates[0];

  if (!tile) {
    message.textContent = "Wait for the tile!";
    return;
  }

  const tileBottom = tile.y + tileHeight;

  if (tileBottom >= hitY - 28 && tile.y <= hitY + 25) {
    removeTile(tile);
    score++;

    speed = 190 + Math.floor(score / 5) * 16;
    spawnDelay = Math.max(340, 850 - score * 8);

    message.textContent = "Perfect! ✨";
    updateStats();
  } else {
    message.textContent = "Wait for the line!";
  }
}

function endGame() {
  running = false;
  cancelAnimationFrame(animationId);

  if (score > best) {
    best = score;
    localStorage.setItem("pianoBest", best);
    bestText.textContent = best;
  }

  message.textContent = "Game Over! Score: " + score;
  startButton.textContent = "↻ PLAY AGAIN";
}

function gameLoop(time) {
  if (!running) return;

  const dt = Math.min((time - lastTime) / 1000 || 0, 0.04);
  lastTime = time;

  if (time - lastSpawn > spawnDelay) {
    spawnTile();
    lastSpawn = time;
  }

  for (const tile of tiles) {
    if (!tile.alive) continue;

    tile.y += speed * dt;
    tile.element.style.top = tile.y + "px";

    if (tile.y > hitY + 25) {
      removeTile(tile);
      lives--;
      updateStats();

      if (lives <= 0) {
        endGame();
        return;
      }

      message.textContent = "Missed! Keep going!";
    }
  }

  tiles = tiles.filter(t => t.alive);
  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  cancelAnimationFrame(animationId);

  tiles.forEach(removeTile);
  tiles = [];

  score = 0;
  lives = 3;
  speed = 190;
  spawnDelay = 850;
  lastSpawn = 0;
  lastTime = 0;
  running = true;

  updateStats();
  message.textContent = "Ready? Hit the letters!";
  startButton.textContent = "↻ RESTART";

  animationId = requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", event => {
  const key = event.key.toUpperCase();

  if (letters.includes(key) && !event.repeat) {
    pressLetter(key);
  }
});

document.querySelectorAll("[data-key]").forEach(button => {
  button.addEventListener("click", () => {
    pressLetter(button.dataset.key);
  });
});

startButton.addEventListener("click", startGame);
