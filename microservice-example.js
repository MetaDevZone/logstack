/**
 * 🚀 Express.js Application with LogStack API Client Integration
 *
 * This app runs on a different server and communicates with
 * LogStack server via REST API calls
 */

const express = require("express");
const {
  initializeLogStackClient,
  logApiRequest,
  logAppEvent,
  logJob,
  setupExpressLogging,
  runBackgroundJob,
  healthCheck,
  getOfflineQueueStatus,
  flushOfflineQueue,
} = require("./api-client-setup");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Initialize LogStack API Client
 */
async function startServer() {
  try {
    // Initialize LogStack API Client
    await initializeLogStackClient();

    // Setup Express logging
    setupExpressLogging(app);

    console.log("✅ LogStack API Client integrated with Express");
  } catch (error) {
    console.error("❌ Failed to initialize LogStack API Client:", error);
    console.log("⚠️ Continuing without LogStack - logs will be queued");
  }
}

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Microservice with LogStack API Client",
    service: process.env.SERVICE_NAME || "microservice",
    timestamp: new Date(),
    status: "running",
  });
});

// API routes that will be automatically logged via API calls
app.get("/api/users", (req, res) => {
  // Simulate user data
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
  ];

  res.json({
    users,
    total: users.length,
    service: process.env.SERVICE_NAME || "user-service",
    timestamp: new Date(),
  });
});

app.post("/api/users", (req, res) => {
  const userData = req.body;

  // Log custom application event via API
  logAppEvent("info", "New user created via API client", {
    service: "user-service",
    userId: userData.id || "unknown",
    email: userData.email,
    method: "api-call",
  });

  res.status(201).json({
    message: "User created successfully",
    user: userData,
    service: process.env.SERVICE_NAME || "user-service",
    timestamp: new Date(),
  });
});

// Background job example via API
app.post("/api/jobs/process-data", async (req, res) => {
  try {
    const result = await runBackgroundJob("data-processor", async () => {
      // Simulate data processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const recordsProcessed = Math.floor(Math.random() * 100) + 50;
      return { recordsProcessed, status: "completed" };
    });

    res.json({
      message: "Data processing job completed",
      result,
      service: process.env.SERVICE_NAME || "data-service",
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Data processing job failed",
      message: error.message,
      service: process.env.SERVICE_NAME || "data-service",
      timestamp: new Date(),
    });
  }
});

// Health check endpoint (includes LogStack server health)
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

// Offline queue status endpoint
app.get("/api/queue-status", (req, res) => {
  const queueStatus = getOfflineQueueStatus();
  res.json({
    offlineQueue: queueStatus,
    timestamp: new Date(),
  });
});

// Manual queue flush endpoint
app.post("/api/flush-queue", async (req, res) => {
  try {
    await flushOfflineQueue();
    res.json({
      message: "Offline queue flushed successfully",
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to flush queue",
      message: error.message,
      timestamp: new Date(),
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  // Log the error via API
  logAppEvent("error", "Express error handler via API", {
    service: "express-error",
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: "Internal server error",
    message: error.message,
    service: process.env.SERVICE_NAME || "microservice",
    timestamp: new Date(),
  });
});

// Start the server
async function main() {
  await startServer();

  app.listen(PORT, () => {
    console.log(`🚀 Microservice running on port ${PORT}`);
    console.log(`📡 Sending logs to LogStack server via API calls`);

    // Log server startup via API
    logAppEvent("info", "Microservice started with API client", {
      service: process.env.SERVICE_NAME || "microservice",
      port: PORT,
      environment: process.env.NODE_ENV || "development",
      logstackServer: process.env.LOGSTACK_SERVER_URL,
    });
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logAppEvent("info", "Microservice shutting down", {
      service: process.env.SERVICE_NAME || "microservice",
      reason: "SIGTERM received",
    });
    process.exit(0);
  });
}

// Run the application
main().catch((error) => {
  console.error("❌ Failed to start microservice:", error);
  process.exit(1);
});
