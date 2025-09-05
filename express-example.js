/**
 * 🚀 Express.js Application with LogStack Integration
 *
 * Complete example showing how to integrate LogStack
 * with your Express.js application
 */

const express = require("express");
const {
  initializeLogStack,
  logApiRequest,
  logAppEvent,
  logJob,
  setupExpressLogging,
  runBackgroundJob,
  healthCheck,
} = require("./production-setup");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Initialize LogStack and setup logging
 */
async function startServer() {
  try {
    // Initialize LogStack
    await initializeLogStack();

    // Setup Express logging
    setupExpressLogging(app);

    console.log("✅ LogStack integrated with Express");
  } catch (error) {
    console.error("❌ Failed to initialize LogStack:", error);
    process.exit(1);
  }
}

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "LogStack Express Application",
    timestamp: new Date(),
    status: "running",
  });
});

// API routes that will be automatically logged
app.get("/api/users", (req, res) => {
  // Simulate user data
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
  ];

  res.json({
    users,
    total: users.length,
    timestamp: new Date(),
  });
});

app.post("/api/users", (req, res) => {
  const userData = req.body;

  // Log custom application event
  logAppEvent("info", "New user created", {
    service: "user-service",
    userId: userData.id || "unknown",
    email: userData.email,
  });

  res.status(201).json({
    message: "User created successfully",
    user: userData,
    timestamp: new Date(),
  });
});

// Background job example
app.post("/api/jobs/email-sender", async (req, res) => {
  try {
    const result = await runBackgroundJob("email-sender", async () => {
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const emailsSent = Math.floor(Math.random() * 50) + 10;
      return { emailsSent, status: "completed" };
    });

    res.json({
      message: "Email job completed",
      result,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Email job failed",
      message: error.message,
      timestamp: new Date(),
    });
  }
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const health = await healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date(),
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  // Log the error
  logAppEvent("error", "Express error handler", {
    service: "express-error",
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: "Internal server error",
    message: error.message,
    timestamp: new Date(),
  });
});

// Start the server
async function main() {
  await startServer();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);

    // Log server startup
    logAppEvent("info", "Express server started", {
      service: "express-server",
      port: PORT,
      environment: process.env.NODE_ENV || "development",
    });
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logAppEvent("info", "Server shutting down", {
      service: "express-server",
      reason: "SIGTERM received",
    });
    process.exit(0);
  });
}

// Run the application
main().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
