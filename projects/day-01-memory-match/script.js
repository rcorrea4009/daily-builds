const ICONS = ["🚀", "🪐", "⭐", "🌙", "☄️", "🛰️", "👽", "🌌"];

const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
const winEl = document.getElementById("win");
const winMovesEl = document.getElementById("winMoves");
const winTimeEl = document.getElementById("winTime");
const restartBtn = document.getElementById("restart");

let tiles = [];
let flipped = [];
let matchedCount = 0;
let moves = 0;
let startTime = null;
let tickInterval = null;
let lockBoard = false;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startTimer() {
  startTime = Date.now();
  tickInterval = setInterval(() => {
    timerEl.textContent = `${Math.floor((Date.now() - startTime) / 1000)}s`;
  }, 250);
}

function stopTimer() {
  clearInterval(tickInterval);
}

function render() {
  board.innerHTML = "";
  tiles.forEach((tile, index) => {
    const el = document.createElement("div");
    el.className = "tile";
    el.dataset.index = index;
    const face = document.createElement("div");
    face.className = "face";
    el.appendChild(face);
    el.addEventListener("click", () => onTileClick(index));
    board.appendChild(el);
  });
}

function updateTileFace(index) {
  const el = board.querySelector(`[data-index="${index}"]`);
  const tile = tiles[index];
  el.classList.toggle("flipped", tile.revealed || tile.matched);
  el.classList.toggle("matched", tile.matched);
  el.querySelector(".face").textContent = tile.revealed || tile.matched ? tile.icon : "";
}

function onTileClick(index) {
  const tile = tiles[index];
  if (lockBoard || tile.revealed || tile.matched) return;
  if (!startTime) startTimer();

  tile.revealed = true;
  updateTileFace(index);
  flipped.push(index);

  if (flipped.length === 2) {
    moves++;
    movesEl.textContent = moves;
    lockBoard = true;
    const [a, b] = flipped;
    if (tiles[a].icon === tiles[b].icon) {
      tiles[a].matched = true;
      tiles[b].matched = true;
      updateTileFace(a);
      updateTileFace(b);
      matchedCount += 2;
      flipped = [];
      lockBoard = false;
      if (matchedCount === tiles.length) finishGame();
    } else {
      setTimeout(() => {
        tiles[a].revealed = false;
        tiles[b].revealed = false;
        updateTileFace(a);
        updateTileFace(b);
        flipped = [];
        lockBoard = false;
      }, 650);
    }
  }
}

function finishGame() {
  stopTimer();
  winMovesEl.textContent = moves;
  winTimeEl.textContent = Math.floor((Date.now() - startTime) / 1000);
  winEl.classList.remove("hidden");
}

function newGame() {
  stopTimer();
  moves = 0;
  matchedCount = 0;
  flipped = [];
  lockBoard = false;
  startTime = null;
  movesEl.textContent = "0";
  timerEl.textContent = "0s";
  winEl.classList.add("hidden");

  const deck = shuffle([...ICONS, ...ICONS]).map((icon) => ({
    icon,
    revealed: false,
    matched: false,
  }));
  tiles = deck;
  render();
}

restartBtn.addEventListener("click", newGame);
newGame();
