#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

// MIME types
const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);

  // Remove query parameters
  filePath = filePath.split("?")[0];

  // Security check - prevent directory traversal
  if (!filePath.startsWith(path.join(__dirname))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        // Try to serve index.html for SPA-style routing
        fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end("404 - Page Not Found");
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
          }
        });
      } else {
        res.writeHead(500);
        res.end("500 - Internal Server Error");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`📊 LogStack Documentation Server running at:`);
  console.log(`🌐 Local:    http://localhost:${PORT}`);
  console.log(`📱 Network:  http://0.0.0.0:${PORT}`);
  console.log("");
  console.log("📚 Available Pages:");
  console.log("  🏠 Home:           http://localhost:" + PORT);
  console.log(
    "  🚀 Getting Started: http://localhost:" + PORT + "/getting-started.html"
  );
  console.log(
    "  📖 API Reference:   http://localhost:" + PORT + "/api-reference.html"
  );
  console.log(
    "  💡 Examples:        http://localhost:" + PORT + "/examples.html"
  );
  console.log(
    "  🔧 Troubleshooting: http://localhost:" + PORT + "/troubleshooting.html"
  );
  console.log("");
  console.log("Press Ctrl+C to stop the server");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down documentation server...");
  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
