const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 3000);
const root = path.resolve(__dirname, "..", "out");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const safeJoin = (base, target) => {
  const targetPath = path.resolve(base, "." + target);
  return targetPath.startsWith(base) ? targetPath : null;
};

const sendFile = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  });
  fs.createReadStream(filePath).pipe(res);
};

const resolvePath = (urlPath) => {
  const normalized = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
  const candidates = [
    normalized,
    `${normalized}.html`,
    path.posix.join(normalized, "index.html"),
  ];

  for (const candidate of candidates) {
    const fullPath = safeJoin(root, candidate);
    if (fullPath && fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
  }

  return safeJoin(root, "/404.html");
};

http
  .createServer((req, res) => {
    const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const filePath = resolvePath(requestUrl.pathname);

    if (!filePath || !fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    sendFile(res, filePath);
  })
  .listen(port, () => {
    console.log(`Serving ${root} at http://localhost:${port}`);
  });
