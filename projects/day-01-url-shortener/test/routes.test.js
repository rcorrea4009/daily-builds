import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { InMemoryLinkRepository } from "../src/repository.js";
import { LinkService } from "../src/service.js";
import { createRequestHandler } from "../src/routes.js";

let server;
let baseUrl;

before(async () => {
  const service = new LinkService(new InMemoryLinkRepository());
  server = createServer(createRequestHandler(service));
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

describe("URL shortener HTTP API", () => {
  test("POST /api/shorten then GET redirect round-trip", async () => {
    const shortenRes = await fetch(`${baseUrl}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/some/page" }),
    });
    assert.equal(shortenRes.status, 201);
    const { code } = await shortenRes.json();
    assert.equal(typeof code, "string");

    const redirectRes = await fetch(`${baseUrl}/${code}`, { redirect: "manual" });
    assert.equal(redirectRes.status, 302);
    assert.equal(redirectRes.headers.get("location"), "https://example.com/some/page");
  });

  test("rejects an invalid URL with 400", async () => {
    const res = await fetch(`${baseUrl}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "not-a-url" }),
    });
    assert.equal(res.status, 400);
  });

  test("unknown code returns 404", async () => {
    const res = await fetch(`${baseUrl}/zzzzzz`, { redirect: "manual" });
    assert.equal(res.status, 404);
  });

  test("stats endpoint reports hit count", async () => {
    const shortenRes = await fetch(`${baseUrl}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/stats-me" }),
    });
    const { code } = await shortenRes.json();

    await fetch(`${baseUrl}/${code}`, { redirect: "manual" });
    await fetch(`${baseUrl}/${code}`, { redirect: "manual" });

    const statsRes = await fetch(`${baseUrl}/api/stats/${code}`);
    const stats = await statsRes.json();
    assert.equal(stats.hits, 2);
  });
});
