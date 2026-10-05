import { createServer } from "node:http";
import { InMemoryLinkRepository } from "./src/repository.js";
import { LinkService } from "./src/service.js";
import { createRequestHandler } from "./src/routes.js";

const port = process.env.PORT || 3000;
const service = new LinkService(new InMemoryLinkRepository());
const server = createServer(createRequestHandler(service));

server.listen(port, () => {
  console.log(`URL shortener listening on http://localhost:${port}`);
});
