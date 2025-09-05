/**
 * 🚀 Complete LogStack Server Example
 * Separate instance per chalane ke liye ready-to-use server
 */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  initializeLogStack,
  saveApiLog,
  saveLog,
  getApiLogs,
  getLogs,
  searchFiles,
  getSecureFileUrl,
  stopAllLogStackJobs,
} = require("logstack-zee");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Simple API key authentication
const authenticate = (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
};

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "LogStack Server",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// ===== SAVE ENDPOINTS =====

// Save API logs
app.post("/api/logs/save", authenticate, async (req, res) => {
  try {
    const {
      method,
      path,
      status,
      request_time,
      response_time,
      client_ip,
      headers,
      request_body,
      response_body,
      response_time_ms,
      user_id,
      session_id,
    } = req.body;

    const result = await saveApiLog({
      method: method || "GET",
      path: path || "/",
      responseStatus: status || 200,
      request_time: request_time ? new Date(request_time) : new Date(),
      response_time: response_time ? new Date(response_time) : new Date(),
      client_ip: client_ip || req.ip,
      requestHeaders: headers || {},
      requestBody: request_body,
      responseBody: response_body,
      responseTime: response_time_ms || 0,
      metadata: {
        user_id,
        session_id,
        saved_at: new Date(),
      },
    });

    res.json({
      success: true,
      id: result._id,
      message: "API log saved successfully",
    });
  } catch (error) {
    console.error("❌ Save API log failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Save application logs
app.post("/api/logs/app", authenticate, async (req, res) => {
  try {
    const { level, message, service, metadata, timestamp } = req.body;

    const result = await saveLog({
      level: level || "info",
      message: message || "Log message",
      service: service || "unknown",
      metadata: {
        ...metadata,
        saved_at: new Date(),
        original_timestamp: timestamp,
      },
    });

    res.json({
      success: true,
      id: result._id,
      message: "App log saved successfully",
    });
  } catch (error) {
    console.error("❌ Save app log failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===== GET ENDPOINTS =====

// Get API logs with filters
app.get("/api/logs/api", authenticate, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      method,
      status,
      path,
      client_ip,
      limit = 100,
      skip = 0,
    } = req.query;

    const filters = {};

    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (method) filters.method = method;
    if (status) filters.responseStatus = parseInt(status);
    if (path) filters.path = path;
    if (client_ip) filters.client_ip = client_ip;

    filters.limit = Math.min(parseInt(limit), 1000); // Max 1000
    filters.skip = parseInt(skip);

    const logs = await getApiLogs(filters);

    res.json({
      success: true,
      count: logs.length,
      filters: filters,
      logs: logs,
    });
  } catch (error) {
    console.error("❌ Get API logs failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get application logs with filters
app.get("/api/logs/app", authenticate, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      level,
      service,
      limit = 100,
      skip = 0,
    } = req.query;

    const filters = {};

    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (level) filters.level = level;
    if (service) filters.service = service;

    filters.limit = Math.min(parseInt(limit), 1000);
    filters.skip = parseInt(skip);

    const logs = await getLogs(filters);

    res.json({
      success: true,
      count: logs.length,
      filters: filters,
      logs: logs,
    });
  } catch (error) {
    console.error("❌ Get app logs failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===== S3 FILE OPERATIONS =====

// Search S3 files with advanced filters
app.get("/api/files/search", authenticate, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      fileName,
      minSize,
      maxSize,
      fileType,
      folder,
      sortBy = "lastModified",
      sortOrder = "desc",
      limit = 50,
    } = req.query;

    const searchOptions = {};

    // Date range filter
    if (startDate && endDate) {
      searchOptions.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    // File name filter
    if (fileName) {
      searchOptions.fileName = fileName;
    }

    // Size range filter
    if (minSize && maxSize) {
      searchOptions.sizeRange = {
        min: parseInt(minSize),
        max: parseInt(maxSize),
      };
    }

    // File type filter
    if (fileType) {
      searchOptions.fileType = fileType;
    }

    // Folder filter
    if (folder) {
      searchOptions.folder = folder;
    }

    // Sorting
    searchOptions.sortBy = sortBy;
    searchOptions.sortOrder = sortOrder;
    searchOptions.limit = Math.min(parseInt(limit), 100);

    const result = await searchFiles("admin", searchOptions);

    res.json({
      success: true,
      searchOptions,
      ...result,
    });
  } catch (error) {
    console.error("❌ File search failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get secure download URL for S3 file
app.get("/api/files/download/:fileName", authenticate, async (req, res) => {
  try {
    const { fileName } = req.params;
    const { expiration = 3600 } = req.query; // Default 1 hour

    const result = await getSecureFileUrl(fileName, "admin");

    if (result.success) {
      res.json({
        success: true,
        fileName,
        downloadUrl: result.downloadUrl,
        expiration: result.expiration,
        message: "Download URL generated successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "File not found or access denied",
        fileName,
      });
    }
  } catch (error) {
    console.error("❌ Generate download URL failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===== ADMIN ENDPOINTS =====

// Stop all cron jobs (maintenance mode)
app.post("/admin/stop-jobs", authenticate, async (req, res) => {
  try {
    const result = await stopAllLogStackJobs();
    res.json({
      success: true,
      message: "All LogStack jobs stopped",
      stoppedJobs: result.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    timestamp: new Date(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
  });
});

// Initialize LogStack and start server
async function startServer() {
  try {
    console.log("🚀 Starting LogStack Server...");

    // Initialize LogStack (background processing will start)
    await initializeLogStack();
    console.log("✅ LogStack initialized - Background processing started");

    // Start Express server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`\n🎉 LogStack Server running on port ${PORT}`);
      console.log(`\n📡 Available API endpoints:`);
      console.log(`   POST /api/logs/save        - Save API logs`);
      console.log(`   POST /api/logs/app         - Save app logs`);
      console.log(`   GET  /api/logs/api         - Get API logs`);
      console.log(`   GET  /api/logs/app         - Get app logs`);
      console.log(`   GET  /api/files/search     - Search S3 files`);
      console.log(`   GET  /api/files/download/  - Download file URL`);
      console.log(`   POST /admin/stop-jobs      - Stop cron jobs`);
      console.log(`   GET  /health               - Health check`);
      console.log(`\n🔑 Use X-API-Key header for authentication`);
      console.log(`\n🔄 Background processing: ACTIVE`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("\n📡 Received SIGTERM signal...");
      await stopAllLogStackJobs();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("\n📡 Received SIGINT signal...");
      await stopAllLogStackJobs();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
