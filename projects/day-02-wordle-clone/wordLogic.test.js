import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluateGuess, pickAnswer, isValidGuess, WORD_LIST } from "./wordLogic.js";

describe("evaluateGuess", () => {
  test("all correct when guess equals answer", () => {
    assert.deepEqual(evaluateGuess("apple", "apple"), [
      "correct", "correct", "correct", "correct", "correct",
    ]);
  });

  test("all absent when no letters overlap", () => {
    assert.deepEqual(evaluateGuess("zzzzz", "apple"), [
      "absent", "absent", "absent", "absent", "absent",
    ]);
  });

  test("mix of present and absent for partial overlap", () => {
    assert.deepEqual(evaluateGuess("lemon", "apple"), [
      "present", "present", "absent", "absent", "absent",
    ]);
  });

  test("does not over-count a duplicated guess letter", () => {
    // answer "apple" has exactly two Ps (positions 1 and 2).
    // Guessing "ppppp" should mark only those two as correct,
    // and the rest absent -- not "present".
    assert.deepEqual(evaluateGuess("ppppp", "apple"), [
      "absent", "correct", "correct", "absent", "absent",
    ]);
  });

  test("is case-insensitive", () => {
    assert.deepEqual(evaluateGuess("APPLE", "apple"), [
      "correct", "correct", "correct", "correct", "correct",
    ]);
  });
});

describe("pickAnswer", () => {
  test("always returns a word from the given list", () => {
    for (let i = 0; i < 20; i++) {
      assert.ok(WORD_LIST.includes(pickAnswer()));
    }
  });

  test("is deterministic given a fixed random source", () => {
    assert.equal(pickAnswer(["a", "b", "c"], () => 0), "a");
    assert.equal(pickAnswer(["a", "b", "c"], () => 0.99), "c");
  });
});

describe("isValidGuess", () => {
  test("accepts a 5-letter alphabetic word", () => {
    assert.equal(isValidGuess("apple"), true);
  });

  test("rejects wrong length or non-letters", () => {
    assert.equal(isValidGuess("ab"), false);
    assert.equal(isValidGuess("a1234"), false);
    assert.equal(isValidGuess(""), false);
  });
});
