/**
 * Simple test for LogStackServer
 */

console.log("Testing server import...");

try {
  const LogStackServer = require("../server.js");
  console.log("✅ Server imported successfully");
  console.log("Server type:", typeof LogStackServer);

  const server = new LogStackServer({
    port: 4001,
    enableAuth: false,
  });
  console.log("✅ Server instance created");

  // Don't start the server, just test creation
  console.log("✅ Test completed successfully");
} catch (error) {
  console.error("❌ Error:", error.message);
}
