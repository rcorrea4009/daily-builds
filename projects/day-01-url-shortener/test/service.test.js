import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { InMemoryLinkRepository } from "../src/repository.js";
import { LinkService, InvalidUrlError, CodeNotFoundError, isValidHttpUrl, generateCode } from "../src/service.js";

describe("isValidHttpUrl", () => {
  test("accepts http and https", () => {
    assert.equal(isValidHttpUrl("https://example.com"), true);
    assert.equal(isValidHttpUrl("http://example.com/path?q=1"), true);
  });

  test("rejects garbage and non-http schemes", () => {
    assert.equal(isValidHttpUrl("not a url"), false);
    assert.equal(isValidHttpUrl("ftp://example.com"), false);
  });
});

describe("generateCode", () => {
  test("respects requested length", () => {
    assert.equal(generateCode(8).length, 8);
  });

  test("is deterministic given a fixed random source", () => {
    const fixedRandom = () => 0; // always picks alphabet[0]
    assert.equal(generateCode(4, fixedRandom), "aaaa");
  });
});

describe("LinkService", () => {
  test("shorten + resolve round-trip", () => {
    const service = new LinkService(new InMemoryLinkRepository());
    const code = service.shorten("https://example.com/long/path");
    assert.equal(service.resolve(code), "https://example.com/long/path");
  });

  test("rejects invalid URLs", () => {
    const service = new LinkService(new InMemoryLinkRepository());
    assert.throws(() => service.shorten("not-a-url"), InvalidUrlError);
  });

  test("resolve throws for unknown code", () => {
    const service = new LinkService(new InMemoryLinkRepository());
    assert.throws(() => service.resolve("missing"), CodeNotFoundError);
  });

  test("retries on collision instead of overwriting", () => {
    let calls = 0;
    // First 4 calls (two generateCode attempts) produce the same code,
    // forcing a collision on the second shorten(); the next 2 diverge.
    const random = () => {
      calls += 1;
      return calls <= 4 ? 0 : 0.5;
    };
    const repo = new InMemoryLinkRepository();
    const service = new LinkService(repo, { codeLength: 2, randomFn: random });

    const codeA = service.shorten("https://a.example.com");
    const codeB = service.shorten("https://b.example.com");

    assert.notEqual(codeA, codeB);
    assert.equal(service.resolve(codeA), "https://a.example.com");
    assert.equal(service.resolve(codeB), "https://b.example.com");
  });

  test("stats tracks hit count", () => {
    const service = new LinkService(new InMemoryLinkRepository());
    const code = service.shorten("https://example.com");
    service.resolve(code);
    service.resolve(code);
    assert.equal(service.stats(code).hits, 2);
  });
});
