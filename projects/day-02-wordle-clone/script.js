import { evaluateGuess, pickAnswer, isValidGuess } from "./wordLogic.js";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const gridEl = document.getElementById("grid");
const formEl = document.getElementById("guessForm");
const inputEl = document.getElementById("guessInput");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restart");

let answer;
let guessesMade;
let gameOver;

function buildGrid() {
  gridEl.innerHTML = "";
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = document.createElement("div");
    row.className = "row";
    row.dataset.row = r;
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      row.appendChild(tile);
    }
    gridEl.appendChild(row);
  }
}

function renderGuess(rowIndex, guess, statuses) {
  const row = gridEl.querySelector(`[data-row="${rowIndex}"]`);
  const tiles = row.querySelectorAll(".tile");
  guess.split("").forEach((letter, i) => {
    tiles[i].textContent = letter;
    tiles[i].classList.add(statuses[i]);
  });
}

function newGame() {
  answer = pickAnswer();
  guessesMade = 0;
  gameOver = false;
  messageEl.textContent = "";
  restartBtn.classList.add("hidden");
  inputEl.disabled = false;
  inputEl.value = "";
  buildGrid();
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  if (gameOver) return;

  const guess = inputEl.value.trim().toLowerCase();
  if (!isValidGuess(guess)) {
    messageEl.textContent = "Enter a 5-letter word.";
    return;
  }

  const statuses = evaluateGuess(guess, answer);
  renderGuess(guessesMade, guess, statuses);
  guessesMade++;
  inputEl.value = "";

  if (guess === answer) {
    messageEl.textContent = `You got it in ${guessesMade}!`;
    endGame();
  } else if (guessesMade === MAX_GUESSES) {
    messageEl.textContent = `Out of guesses. The word was "${answer}".`;
    endGame();
  }
});

function endGame() {
  gameOver = true;
  inputEl.disabled = true;
  restartBtn.classList.remove("hidden");
}

restartBtn.addEventListener("click", newGame);
newGame();
