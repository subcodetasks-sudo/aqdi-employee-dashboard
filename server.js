// Custom Next.js server for cPanel / Passenger (Node.js Selector).
// Set this file as the "Application startup file" in the cPanel Node.js app.

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      try {
        handle(req, res, parse(req.url, true));
      } catch (err) {
        console.error("Error handling request:", req.url, err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });

    server.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port} (NODE_ENV=${process.env.NODE_ENV})`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js server:", err);
    process.exit(1);
  });
