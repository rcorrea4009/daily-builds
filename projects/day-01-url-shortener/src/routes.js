// HTTP layer: parses requests, calls the service, formats responses.
// Framework-free (Node's built-in http module) so the whole project
// runs with zero npm installs.
import { CodeNotFoundError, InvalidUrlError } from "./service.js";

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) });
  res.end(data);
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf-8");
  return raw ? JSON.parse(raw) : {};
}

const HOME_PAGE = `<!DOCTYPE html>
<html><head><title>URL Shortener</title></head>
<body style="font-family: system-ui; max-width: 480px; margin: 60px auto;">
  <h1>URL Shortener</h1>
  <form id="f">
    <input id="url" type="url" placeholder="https://example.com/very/long/path" style="width: 100%; padding: 8px;" required />
    <button type="submit" style="margin-top: 8px;">Shorten</button>
  </form>
  <p id="result"></p>
  <script>
    document.getElementById('f').addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('url').value;
      const res = await fetch('/api/shorten', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ url }) });
      const data = await res.json();
      document.getElementById('result').textContent = res.ok ? ('Short link: /' + data.code) : data.error;
    });
  </script>
</body></html>`;

export function createRequestHandler(linkService) {
  return async function handleRequest(req, res) {
    const url = new URL(req.url, "http://localhost");

    try {
      if (req.method === "GET" && url.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(HOME_PAGE);
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/shorten") {
        const body = await readJsonBody(req);
        const code = linkService.shorten(body.url);
        sendJson(res, 201, { code, shortUrl: `/${code}` });
        return;
      }

      if (req.method === "GET" && url.pathname.startsWith("/api/stats/")) {
        const code = url.pathname.replace("/api/stats/", "");
        sendJson(res, 200, linkService.stats(code));
        return;
      }

      if (req.method === "GET" && /^\/[^/]+$/.test(url.pathname)) {
        const code = url.pathname.slice(1);
        const longUrl = linkService.resolve(code);
        res.writeHead(302, { Location: longUrl });
        res.end();
        return;
      }

      sendJson(res, 404, { error: "Not found" });
    } catch (err) {
      if (err instanceof InvalidUrlError) return sendJson(res, 400, { error: err.message });
      if (err instanceof CodeNotFoundError) return sendJson(res, 404, { error: err.message });
      sendJson(res, 500, { error: "Internal error" });
    }
  };
}
