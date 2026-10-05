// Pure game logic, no DOM. Kept in its own module so it can be
// unit-tested directly (see wordLogic.test.js) without a browser.
export const WORD_LIST = [
  "apple", "brave", "chair", "dance", "eagle",
  "flame", "grape", "house", "input", "joker",
  "knife", "lemon", "mango", "noble", "ocean",
  "piano", "quiet", "robot", "stone", "tiger",
];

export function pickAnswer(list = WORD_LIST, random = Math.random) {
  return list[Math.floor(random() * list.length)];
}

/**
 * Compares a guess to the answer, letter by letter.
 * Returns an array of "correct" | "present" | "absent", handling
 * duplicate letters the way real Wordle does (a letter is only
 * marked "present" as many times as it actually remains unmatched
 * in the answer).
 */
export function evaluateGuess(guess, answer) {
  guess = guess.toLowerCase();
  answer = answer.toLowerCase();
  const result = new Array(guess.length).fill("absent");
  const remaining = answer.split("");

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === remaining[i]) {
      result[i] = "correct";
      remaining[i] = null;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "correct") continue;
    const idx = remaining.indexOf(guess[i]);
    if (idx !== -1) {
      result[i] = "present";
      remaining[idx] = null;
    }
  }

  return result;
}

export function isValidGuess(guess, list = WORD_LIST) {
  return typeof guess === "string" && guess.length === 5 && /^[a-zA-Z]+$/.test(guess);
}
