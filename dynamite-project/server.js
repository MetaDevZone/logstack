/**
 * 🚀 Dynamite Lifestyle Logs Server
 *
 * Features:
 * - Daily cron jobs at 12 AM
 * - Hourly log processing
 * - DB retention DISABLED (logs will not be auto-deleted)
 * - S3 retention DISABLED (files will not be auto-deleted)
 * - No S3 security
 * - No compression
 * - Environment-specific collections
 */

const express = require("express");
const cors = require("cors");
const path = require("path");

// Load environment-specific config
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
require("dotenv").config({ path: path.join(__dirname, envFile) });

const {
  init,
  createDailyJobs,
  saveApiLog,
  logAppEvent,
  getApiLogs,
  getLogs,
  stopAllLogStackJobs,
  runHourlyJob,
  processHourlyLogs,
} = require("log-archiver");

// Import Bulk Migration Manager
const { BulkMigrationManager } = require("./bulk-migration");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API Key authentication
const authenticate = (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      error: "Invalid API key",
      environment: process.env.ENVIRONMENT_NAME,
    });
  }
  next();
};

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`
  );
  next();
});

// Dynamite LogStack Configuration
const dynamiteConfig = {
  // MongoDB Database (environment-specific)
  dbUri: process.env.DB_URI,

  // AWS S3 Configuration
  uploadProvider: "s3",
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET,
    keyPrefix: "dynamite_logs",
  },

  // File Organization
  outputDirectory: `dynamite-logs/${process.env.ENVIRONMENT_NAME}`,
  folderStructure: {
    type: "daily", // Creates folders like: 2025/09/04/
    subFolders: {
      enabled: true,
      byHour: true, // Creates hourly files: hour-00-01.json, hour-01-02.json, etc.
      byStatus: false,
    },
  },

  // File Settings (No compression as requested)
  fileFormat: "json",
  compression: {
    enabled: false, // Compression disabled
    format: "gzip", // Valid format but disabled
  },

  // Cron Job Scheduling - Direct properties for log-archiver
  dailyCron: "0 0 * * *", // Daily at 12 AM (midnight)
  hourlyCron: "* * * * *", // Every minute for testing
  timezone: "UTC",

  // Nested cron config (for reference)
  cron: {
    dailyCron: "0 0 * * *", // Daily at 12 AM (midnight)
    hourlyCron: "* * * * *", // Every minute for testing
    timezone: "UTC",
  },

  // Database Retention (DISABLED - will not delete logs automatically)
  retention: {
    enabled: false, // ← DISABLED: Logs will not be deleted from database
    days: 90, // Keep logs in database for 90 days (when enabled)
    cleanupSchedule: "0 2 * * *", // Daily cleanup at 2 AM (when enabled)

    // S3 File Retention (DISABLED - will not delete files automatically)
    s3Retention: {
      enabled: false, // ← DISABLED: Files will not be deleted from S3
      days: 180, // Keep files on S3 for 180 days (when enabled)
      cleanupSchedule: "0 3 * * 0", // Weekly cleanup on Sunday at 3 AM (when enabled)
    },
  },

  // Environment-specific Collection Names
  collections: {
    apiLogsCollectionName: `api_logs`,
    logsCollectionName: `app_logs`,
    jobsCollectionName: `jobs`,
  },

  // Security & Performance
  dataMasking: {
    enabled: true,
    maskEmails: false, // Keep emails for lifestyle app
    maskIPs: false,
    fields: ["password", "token", "apiKey", "creditCard", "ssn"],
    showLastChars: 0,
  },

  // S3 Security (Disabled as requested)
  s3Security: {
    enabled: false, // S3 security disabled
    defaultExpiration: 3600,
    maxFileAge: 180,
    accessControl: false,
  },
};

// ===== HEALTH CHECK =====
app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: process.env.SERVICE_NAME || "Dynamite Lifestyle Logs",
    environment: process.env.ENVIRONMENT_NAME,
    status: "healthy",
    timestamp: new Date(),
    uptime: process.uptime(),
    config: {
      database: process.env.DB_URI ? "Connected" : "Not configured",
      s3_bucket: process.env.S3_BUCKET || "Not configured",
      retention_db: "DISABLED (no auto-deletion)",
      retention_s3: "DISABLED (no auto-deletion)",
      compression: "Disabled",
      s3_security: "Disabled",
    },
  });
});

// ===== BULK MIGRATION ENDPOINTS =====

// Global migration manager instance
let migrationManager = null;

/**
 * Start bulk migration of historical data to S3
 * POST /admin/dynamite/bulk-migration/start
 */
app.post(
  "/admin/dynamite/bulk-migration/start",
  authenticate,
  async (req, res) => {
    try {
      if (
        migrationManager &&
        migrationManager.getProgress().status === "running"
      ) {
        return res.status(400).json({
          success: false,
          error: "Migration is already running",
          progress: migrationManager.getProgress(),
        });
      }

      const {
        startDate,
        endDate,
        collectionName = `api_logs_${process.env.ENVIRONMENT_NAME}`,
        includeAppLogs = false,
      } = req.body;

      console.log(
        `🚀 Starting bulk migration for collection: ${collectionName}`
      );

      // Initialize migration manager
      migrationManager = new BulkMigrationManager(dynamiteConfig);

      // Start migration in background
      const migrationPromise = migrationManager.startMigration(
        process.env.DB_URI,
        collectionName,
        startDate && endDate
          ? {
              minDate: new Date(startDate),
              maxDate: new Date(endDate),
            }
          : null
      );

      // Don't wait for completion, return immediately
      migrationPromise.catch((error) => {
        console.error("Migration failed:", error);
      });

      res.json({
        success: true,
        message: "Bulk migration started",
        collection: collectionName,
        environment: process.env.ENVIRONMENT_NAME,
        progress: migrationManager.getProgress(),
        started_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to start migration:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * Get bulk migration progress
 * GET /admin/dynamite/bulk-migration/progress
 */
app.get("/admin/dynamite/bulk-migration/progress", authenticate, (req, res) => {
  try {
    if (!migrationManager) {
      return res.json({
        success: true,
        message: "No migration running",
        progress: null,
      });
    }

    const progress = migrationManager.getProgress();

    res.json({
      success: true,
      progress: progress,
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Pause bulk migration
 * POST /admin/dynamite/bulk-migration/pause
 */
app.post("/admin/dynamite/bulk-migration/pause", authenticate, (req, res) => {
  try {
    if (!migrationManager) {
      return res.status(400).json({
        success: false,
        error: "No migration running",
      });
    }

    migrationManager.pause();

    res.json({
      success: true,
      message: "Migration paused",
      progress: migrationManager.getProgress(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Resume bulk migration
 * POST /admin/dynamite/bulk-migration/resume
 */
app.post("/admin/dynamite/bulk-migration/resume", authenticate, (req, res) => {
  try {
    if (!migrationManager) {
      return res.status(400).json({
        success: false,
        error: "No migration to resume",
      });
    }

    migrationManager.resume();

    res.json({
      success: true,
      message: "Migration resumed",
      progress: migrationManager.getProgress(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get database statistics for migration planning
 * GET /admin/dynamite/bulk-migration/analyze
 */
app.get(
  "/admin/dynamite/bulk-migration/analyze",
  authenticate,
  async (req, res) => {
    try {
      const { MongoClient } = require("mongodb");
      let client;

      try {
        client = await MongoClient.connect(process.env.DB_URI);
        const db = client.db();

        const collections = [
          `api_logs_${process.env.ENVIRONMENT_NAME}`,
          `logs_${process.env.ENVIRONMENT_NAME}`,
        ];

        const analysis = {};

        for (const collectionName of collections) {
          try {
            const collection = db.collection(collectionName);

            // Get basic stats
            const totalCount = await collection.countDocuments();

            if (totalCount === 0) {
              analysis[collectionName] = {
                exists: false,
                totalDocuments: 0,
              };
              continue;
            }

            // Get date range
            const pipeline = [
              {
                $group: {
                  _id: null,
                  minDate: { $min: { $ifNull: ["$createdAt", "$timestamp"] } },
                  maxDate: { $max: { $ifNull: ["$createdAt", "$timestamp"] } },
                  totalSize: { $sum: { $bsonSize: "$$ROOT" } },
                },
              },
            ];

            const [stats] = await collection.aggregate(pipeline).toArray();

            // Estimate migration time (approximate)
            const avgDocSize = stats ? stats.totalSize / totalCount : 1000;
            const estimatedHours = Math.ceil(
              (totalCount * avgDocSize) / (1024 * 1024 * 100)
            ); // 100MB per hour estimate

            analysis[collectionName] = {
              exists: true,
              totalDocuments: totalCount,
              dateRange: stats
                ? {
                    from: stats.minDate,
                    to: stats.maxDate,
                    days: Math.ceil(
                      (new Date(stats.maxDate) - new Date(stats.minDate)) /
                        (1000 * 60 * 60 * 24)
                    ),
                  }
                : null,
              estimatedSize: stats
                ? `${Math.round(stats.totalSize / (1024 * 1024))} MB`
                : "Unknown",
              estimatedMigrationTime: `${estimatedHours} hours`,
              avgDocumentSize: Math.round(avgDocSize),
            };
          } catch (collError) {
            analysis[collectionName] = {
              exists: false,
              error: collError.message,
            };
          }
        }

        res.json({
          success: true,
          environment: process.env.ENVIRONMENT_NAME,
          analysis: analysis,
          recommendations: {
            batchSize:
              analysis[`api_logs_${process.env.ENVIRONMENT_NAME}`]
                ?.totalDocuments > 500000
                ? 500
                : 1000,
            estimatedMemoryUsage: "500MB - 1GB",
            recommendedSchedule: "Run during low-traffic hours",
          },
          analyzed_at: new Date().toISOString(),
        });
      } finally {
        if (client) {
          await client.close();
        }
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// ===== LOGS ENDPOINTS =====

/**
 * Save Dynamite Lifestyle API logs
 * POST /api/dynamite/logs/save
 */
app.post("/api/dynamite/logs/save", authenticate, async (req, res) => {
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
      lifestyle_data,
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
        // Dynamite Lifestyle specific data
        environment: process.env.ENVIRONMENT_NAME,
        service: "dynamite-lifestyle",
        user_id,
        session_id,
        lifestyle_data, // Any lifestyle-specific data
        saved_at: new Date(),
        server_info: {
          node_env: process.env.NODE_ENV,
          server_name: process.env.SERVICE_NAME,
        },
      },
    });

    res.json({
      success: true,
      id: result._id,
      environment: process.env.ENVIRONMENT_NAME,
      message: "Dynamite lifestyle API log saved successfully",
    });
  } catch (error) {
    console.error("❌ Save API log failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT_NAME,
    });
  }
});

/**
 * Save Dynamite Lifestyle Application logs
 * POST /api/dynamite/logs/app
 */
app.post("/api/dynamite/logs/app", authenticate, async (req, res) => {
  try {
    const { level, message, service, metadata, timestamp, lifestyle_context } =
      req.body;

    const result = await logAppEvent({
      level: level || "info",
      message: message || "Dynamite lifestyle log",
      service: service || "dynamite-lifestyle",
      metadata: {
        ...metadata,
        environment: process.env.ENVIRONMENT_NAME,
        lifestyle_context, // Lifestyle app specific context
        saved_at: new Date(),
        original_timestamp: timestamp,
        server_info: {
          node_env: process.env.NODE_ENV,
          server_name: process.env.SERVICE_NAME,
        },
      },
    });

    res.json({
      success: true,
      id: result._id,
      environment: process.env.ENVIRONMENT_NAME,
      message: "Dynamite lifestyle app log saved successfully",
    });
  } catch (error) {
    console.error("❌ Save app log failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT_NAME,
    });
  }
});

// ===== GET LOGS ENDPOINTS =====

/**
 * Get Dynamite API logs with filters
 * GET /api/dynamite/logs/api
 */
app.get("/api/dynamite/logs/api", authenticate, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      method,
      status,
      path,
      user_id,
      limit = 100,
      skip = 0,
    } = req.query;

    const filters = {};

    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (method) filters.method = method;
    if (status) filters.responseStatus = parseInt(status);
    if (path) filters.path = path;
    if (user_id) filters["metadata.user_id"] = user_id;

    filters.limit = Math.min(parseInt(limit), 1000);
    filters.skip = parseInt(skip);

    const logs = await getApiLogs(filters);

    res.json({
      success: true,
      count: logs.length,
      environment: process.env.ENVIRONMENT_NAME,
      filters: filters,
      logs: logs,
    });
  } catch (error) {
    console.error("❌ Get API logs failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT_NAME,
    });
  }
});

/**
 * Get Dynamite app logs with filters
 * GET /api/dynamite/logs/app
 */
app.get("/api/dynamite/logs/app", authenticate, async (req, res) => {
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
      environment: process.env.ENVIRONMENT_NAME,
      filters: filters,
      logs: logs,
    });
  } catch (error) {
    console.error("❌ Get app logs failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT_NAME,
    });
  }
});

// ===== ADMIN ENDPOINTS =====

/**
 * Stop all cron jobs (maintenance mode)
 * POST /admin/dynamite/stop-jobs
 */
app.post("/admin/dynamite/stop-jobs", authenticate, async (req, res) => {
  try {
    const result = await stopAllLogStackJobs();
    res.json({
      success: true,
      environment: process.env.ENVIRONMENT_NAME,
      message: "All Dynamite LogStack jobs stopped",
      stoppedJobs: result.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT_NAME,
    });
  }
});

/**
 * Manually trigger hourly job for current hour
 * POST /admin/dynamite/run-hourly-job
 */
app.post("/admin/dynamite/run-hourly-job", authenticate, async (req, res) => {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const hour = now.getHours();
    const hourRange = `${hour.toString().padStart(2, "0")}-${(hour + 1)
      .toString()
      .padStart(2, "0")}`;

    console.log(
      `🔄 Manual trigger: Running hourly job for ${dateStr} ${hourRange}`
    );

    const result = await runHourlyJob(dateStr, hourRange);

    res.json({
      success: true,
      environment: process.env.ENVIRONMENT_NAME,
      message: `Hourly job completed for ${dateStr} ${hourRange}`,
      date: dateStr,
      hour_range: hourRange,
      result: result,
      triggered_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Manual hourly job failed:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT_NAME,
    });
  }
});

/**
 * Manually trigger hourly job for specific date and hour
 * POST /admin/dynamite/run-specific-hour
 * Body: { "date": "2025-09-04", "hour": "15" }
 */
app.post(
  "/admin/dynamite/run-specific-hour",
  authenticate,
  async (req, res) => {
    try {
      const { date, hour } = req.body;

      if (!date || !hour) {
        return res.status(400).json({
          success: false,
          error:
            'Date and hour are required. Format: { "date": "YYYY-MM-DD", "hour": "HH" }',
          example: { date: "2025-09-04", hour: "15" },
        });
      }

      const hourInt = parseInt(hour);
      if (hourInt < 0 || hourInt > 23) {
        return res.status(400).json({
          success: false,
          error: "Hour must be between 0 and 23",
        });
      }

      const hourRange = `${hourInt.toString().padStart(2, "0")}-${(hourInt + 1)
        .toString()
        .padStart(2, "0")}`;

      console.log(
        `🔄 Manual trigger: Running specific hourly job for ${date} ${hourRange}`
      );

      const result = await runHourlyJob(date, hourRange);

      res.json({
        success: true,
        environment: process.env.ENVIRONMENT_NAME,
        message: `Hourly job completed for ${date} ${hourRange}`,
        date: date,
        hour_range: hourRange,
        result: result,
        triggered_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Manual specific hour job failed:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        environment: process.env.ENVIRONMENT_NAME,
      });
    }
  }
);

/**
 * Process all pending hourly logs
 * POST /admin/dynamite/process-hourly-logs
 */
app.post(
  "/admin/dynamite/process-hourly-logs",
  authenticate,
  async (req, res) => {
    try {
      console.log(`🔄 Manual trigger: Processing all hourly logs`);

      const result = await processHourlyLogs();

      res.json({
        success: true,
        environment: process.env.ENVIRONMENT_NAME,
        message: "All hourly logs processed",
        result: result,
        triggered_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Manual hourly logs processing failed:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        environment: process.env.ENVIRONMENT_NAME,
      });
    }
  }
);

/**
 * Get job status with timestamps
 * GET /admin/dynamite/jobs-status
 */
app.get("/admin/dynamite/jobs-status", authenticate, async (req, res) => {
  try {
    const { date } = req.query;
    const JobModel =
      require("log-archiver").getJobModel || require("log-archiver").JobModel;

    // Get specific date or latest jobs
    let jobs;
    if (date) {
      jobs = await JobModel.findOne({ date }).lean();
    } else {
      jobs = await JobModel.find().sort({ createdAt: -1 }).limit(5).lean();
    }

    res.json({
      success: true,
      environment: process.env.ENVIRONMENT_NAME,
      data: jobs,
      requested_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Jobs status fetch failed:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.ENVIRONMENT_NAME,
    });
  }
});

// ===== ERROR HANDLING =====

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Dynamite endpoint not found",
    environment: process.env.ENVIRONMENT_NAME,
    path: req.path,
    method: req.method,
    availableEndpoints: [
      "POST /api/dynamite/logs/save",
      "POST /api/dynamite/logs/app",
      "GET /api/dynamite/logs/api",
      "GET /api/dynamite/logs/app",
      "GET /health",
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    environment: process.env.ENVIRONMENT_NAME,
    timestamp: new Date(),
  });
});

// ===== SERVER INITIALIZATION =====

async function startDynamiteServer() {
  try {
    console.log(`🚀 Starting Dynamite Lifestyle Logs Server...`);
    console.log(`📦 Environment: ${process.env.ENVIRONMENT_NAME}`);
    console.log(`🔧 Node Environment: ${process.env.NODE_ENV}`);

    // Initialize LogStack with Dynamite configuration
    await init(dynamiteConfig);
    console.log("✅ LogStack initialized with Dynamite configuration");

    // Create today's jobs immediately
    await createDailyJobs();
    console.log("✅ Daily jobs created for today");

    // Start Express server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(
        `\n🎉 Dynamite Lifestyle Logs Server running on port ${PORT}`
      );
      console.log(`\n📊 Configuration Summary:`);
      console.log(`   Environment: ${process.env.ENVIRONMENT_NAME}`);
      console.log(`   Database: ${dynamiteConfig.dbUri}`);
      console.log(`   S3 Bucket: ${dynamiteConfig.s3.bucket}`);
      console.log(`   DB Retention: ${dynamiteConfig.retention.days} days`);
      console.log(
        `   S3 Retention: ${dynamiteConfig.retention.s3Retention.days} days`
      );
      console.log(`   Daily Cron: ${dynamiteConfig.cron.dailyCron} (12 AM)`);
      console.log(`   Hourly Cron: ${dynamiteConfig.cron.hourlyCron}`);
      console.log(`   Compression: Disabled`);
      console.log(`   S3 Security: Disabled`);

      console.log(`\n📡 Dynamite API endpoints:`);
      console.log(`   POST /api/dynamite/logs/save         - Save API logs`);
      console.log(`   POST /api/dynamite/logs/app          - Save app logs`);
      console.log(`   GET  /api/dynamite/logs/api          - Get API logs`);
      console.log(`   GET  /api/dynamite/logs/app          - Get app logs`);
      console.log(`   GET  /health                         - Health check`);
      console.log(`   POST /admin/dynamite/stop-jobs       - Stop cron jobs`);
      console.log(
        `   POST /admin/dynamite/run-hourly-job  - Manual hourly job (current hour)`
      );
      console.log(
        `   POST /admin/dynamite/run-specific-hour - Manual hourly job (specific hour)`
      );
      console.log(
        `   POST /admin/dynamite/process-hourly-logs - Process all pending logs`
      );
      console.log(`\n📦 Bulk Migration APIs:`);
      console.log(
        `   GET  /admin/dynamite/bulk-migration/analyze   - Analyze database for migration`
      );
      console.log(
        `   POST /admin/dynamite/bulk-migration/start     - Start bulk S3 migration`
      );
      console.log(
        `   GET  /admin/dynamite/bulk-migration/progress  - Get migration progress`
      );
      console.log(
        `   POST /admin/dynamite/bulk-migration/pause     - Pause migration`
      );
      console.log(
        `   POST /admin/dynamite/bulk-migration/resume    - Resume migration`
      );

      console.log(`\n🔑 Use X-API-Key header: ${process.env.API_KEY}`);
      console.log(`\n🔄 Background processing: ACTIVE`);
      console.log(`   ✅ Daily jobs at 12 AM`);
      console.log(`   ✅ Hourly log processing`);
      console.log(`   ✅ Automatic S3 uploads`);
      console.log(`   ✅ Database cleanup (90 days)`);
      console.log(`   ✅ S3 cleanup (180 days)`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("\n📡 Received SIGTERM signal...");
      console.log("🛑 Stopping all Dynamite LogStack jobs...");
      await stopAllLogStackJobs();
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("\n📡 Received SIGINT signal...");
      console.log("🛑 Stopping all Dynamite LogStack jobs...");
      await stopAllLogStackJobs();
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Dynamite server startup failed:", error);
    process.exit(1);
  }
}

// Start the Dynamite server
startDynamiteServer();
