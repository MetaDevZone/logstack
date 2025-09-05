/**
 * 🌩️ LogStack Production Setup with AWS S3
 *
 * Features:
 * - AWS S3 log uploads
 * - 14 days database retention
 * - 180 days S3 file retention
 * - Daily cron jobs
 * - Hourly file processing
 * - Date-based folder structure
 */

const { init, createDailyJobs } = require("./dist/index");
const { S3SecurityManager } = require("./lib/s3Security");
const { S3FileSearchManager } = require("./lib/s3FileSearch");
const {
  stopAllLogStackJobs,
  stopLogStackJob,
  startLogStackJob,
  showLogStackJobStatus,
  getLogStackJobStatus,
  emergencyStopLogStack,
  destroyAllLogStackJobs,
  restartAllLogStackJobs,
  stopLogStackCronsByPattern,
  getActiveLogStackJobs,
} = require("./lib/cronController");
require("dotenv").config();

// Production configuration
const productionConfig = {
  // MongoDB Database
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp_production",

  // AWS S3 Upload Provider
  uploadProvider: "s3",

  // S3 Configuration
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET || "my-app-logs-bucket",
  },

  // File Organization (Date-based folders)
  outputDirectory: "production-logs",
  folderStructure: {
    type: "daily", // Creates folders like: 2025/09/03/
    subFolders: {
      enabled: true,
      byHour: true, // Creates hourly files: hour-14-15.json
      byStatus: false,
    },
  },

  // File Settings
  fileFormat: "json",
  compression: {
    enabled: true,
    format: "gzip",
    level: 6,
    fileSize: 1024, // Compress files larger than 1KB
  },

  // Cron Job Scheduling
  cron: {
    dailyCron: "0 0 * * *", // Daily at midnight
    hourlyCron: "0 * * * *", // Every hour
    timezone: "UTC",
  },

  // Database Retention (14 days)
  retention: {
    enabled: true,
    days: 14, // Keep logs in database for 14 days
    cleanupSchedule: "0 2 * * *", // Daily cleanup at 2 AM

    // S3 File Retention (180 days)
    s3Retention: {
      enabled: true,
      days: 180, // Keep files on S3 for 180 days
      cleanupSchedule: "0 3 * * 0", // Weekly cleanup on Sunday at 3 AM
    },
  },

  // Collection Names
  collections: {
    apiLogsCollectionName: "production_api_logs",
    logsCollectionName: "production_app_logs",
    jobsCollectionName: "production_jobs",
  },

  // Security & Performance
  dataMasking: {
    enabled: true,
    maskEmails: true,
    maskIPs: false,
    fields: ["password", "token", "apiKey", "creditCard"],
    showLastChars: 0,
  },

  // S3 Security Configuration
  s3Security: {
    enabled: true,
    defaultExpiration: 3600, // 1 hour for pre-signed URLs
    maxFileAge: 180, // days - users can access files max 180 days old (matches S3 retention)
    accessControl: true,
  },
};

/**
 * Initialize LogStack with production configuration
 */
async function initializeLogStack() {
  try {
    console.log("🚀 Initializing LogStack for production...");

    // Initialize the service
    await init(productionConfig);

    // Create today's jobs immediately
    await createDailyJobs();

    console.log("✅ LogStack initialized successfully!");
    console.log("📊 Configuration Summary:");
    console.log(`   Database: ${productionConfig.dbUri}`);
    console.log(`   S3 Bucket: ${productionConfig.s3.bucket}`);
    console.log(`   DB Retention: ${productionConfig.retention.days} days`);
    console.log(
      `   S3 Retention: ${productionConfig.retention.s3Retention.days} days`
    );
    console.log(`   Daily Cron: ${productionConfig.cron.dailyCron}`);
    console.log(`   Hourly Cron: ${productionConfig.cron.hourlyCron}`);
    console.log("");
    console.log("🔄 Automatic processing:");
    console.log("   ✅ Hourly log processing and S3 upload");
    console.log("   ✅ Daily database cleanup (14 days)");
    console.log("   ✅ Weekly S3 cleanup (180 days)");

    return true;
  } catch (error) {
    console.error("❌ LogStack initialization failed:", error);
    throw error;
  }
}

/**
 * Log API requests (Express.js middleware example)
 */
async function logApiRequest(req, res, next) {
  const startTime = new Date();

  res.on("finish", async () => {
    try {
      const { saveApiLog } = require("logstack");

      await saveApiLog({
        method: req.method,
        path: req.path,
        responseStatus: res.statusCode,
        request_time: startTime,
        response_time: new Date(),
        client_ip: req.ip || req.connection.remoteAddress,
        requestHeaders: req.headers,
        requestBody: req.body,
        responseHeaders: res.getHeaders(),
        userAgent: req.get("User-Agent"),
        responseTime: new Date() - startTime,
      });
    } catch (error) {
      console.error("❌ Failed to log API request:", error);
    }
  });

  next();
}

/**
 * Log application events
 */
async function logAppEvent(level, message, metadata = {}) {
  try {
    const { saveLog } = require("logstack");

    await saveLog({
      level,
      message,
      service: metadata.service || "main-app",
      metadata: {
        ...metadata,
        timestamp: new Date(),
        environment: process.env.NODE_ENV || "production",
      },
    });
  } catch (error) {
    console.error("❌ Failed to log app event:", error);
  }
}

/**
 * Log background jobs
 */
async function logJob(jobName, status, metadata = {}) {
  try {
    const { saveJob } = require("logstack");

    await saveJob({
      jobName,
      status, // 'started', 'completed', 'failed'
      startTime: metadata.startTime || new Date(),
      endTime: metadata.endTime,
      metadata: {
        ...metadata,
        environment: process.env.NODE_ENV || "production",
      },
    });
  } catch (error) {
    console.error("❌ Failed to log job:", error);
  }
}

/**
 * Express.js Integration Example
 */
function setupExpressLogging(app) {
  // Add logging middleware
  app.use(logApiRequest);

  // Log server startup
  logAppEvent("info", "Express server starting", {
    service: "express-server",
    port: process.env.PORT || 3000,
  });

  // Log uncaught errors
  process.on("uncaughtException", (error) => {
    logAppEvent("error", "Uncaught exception", {
      service: "error-handler",
      error: error.message,
      stack: error.stack,
    });
  });

  process.on("unhandledRejection", (reason, promise) => {
    logAppEvent("error", "Unhandled promise rejection", {
      service: "error-handler",
      reason: reason.toString(),
      promise: promise.toString(),
    });
  });
}

/**
 * Background Job Example
 */
async function runBackgroundJob(jobName, jobFunction) {
  const startTime = new Date();

  try {
    // Log job start
    await logJob(jobName, "started", { startTime });

    // Run the actual job
    const result = await jobFunction();

    // Log job completion
    await logJob(jobName, "completed", {
      startTime,
      endTime: new Date(),
      result: typeof result === "object" ? JSON.stringify(result) : result,
    });

    return result;
  } catch (error) {
    // Log job failure
    await logJob(jobName, "failed", {
      startTime,
      endTime: new Date(),
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
}

/**
 * Manual Cleanup Functions (optional)
 */
async function cleanupOldLogs() {
  try {
    console.log("🧹 Starting manual cleanup...");

    const { cleanupOldRecords } = require("logstack");

    // Cleanup database records older than 14 days
    const dbCleanup = await cleanupOldRecords(14);
    console.log(`✅ Database cleanup: ${dbCleanup.deleted} records removed`);

    // Cleanup S3 files older than 180 days (if implemented)
    // Note: You may need to implement S3 lifecycle policies

    return { dbCleanup };
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    throw error;
  }
}

/**
 * Process External Data (without storing in LogStack database)
 * Use this when you want only S3 upload and processing
 */
async function processExternalLogs(logsData, options = {}) {
  try {
    console.log(`🔄 Processing ${logsData.length} external logs...`);

    const {
      skipDatabase = false,
      uploadToS3 = true,
      compression = true,
      customFolder = "external-logs",
    } = options;

    // Import file processing utilities
    const {
      uploadToCloudStorage,
      compressData,
    } = require("logstack/lib/fileWriters");

    // Process data
    let processedData = {
      timestamp: new Date(),
      source: "external-processing",
      environment: process.env.NODE_ENV || "production",
      totalRecords: logsData.length,
      data: logsData,
    };

    // Apply compression if enabled
    if (compression) {
      processedData = await compressData(processedData, "gzip");
    }

    // Store in LogStack database (optional)
    if (!skipDatabase) {
      for (const logItem of logsData) {
        await logAppEvent("info", "External log processed", {
          service: "external-processor",
          originalData: logItem,
          processedAt: new Date(),
        });
      }
    }

    // Upload to S3 (if enabled)
    if (uploadToS3) {
      const fileName = `${customFolder}/${
        new Date().toISOString().split("T")[0]
      }/external-logs-${Date.now()}.json${compression ? ".gz" : ""}`;

      await uploadToCloudStorage(processedData, fileName, productionConfig);
      console.log(`✅ External logs uploaded to S3: ${fileName}`);
    }

    return {
      processed: logsData.length,
      storedInDatabase: !skipDatabase,
      uploadedToS3: uploadToS3,
      fileName: uploadToS3 ? fileName : null,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("❌ Failed to process external logs:", error);
    throw error;
  }
}

/**
 * Bulk Process Your Own Collection Data
 */
async function processFromYourCollection(
  mongoUri,
  collectionName,
  query = {},
  options = {}
) {
  try {
    console.log(`🔄 Processing data from collection: ${collectionName}`);

    const mongoose = require("mongoose");
    await mongoose.connect(mongoUri);

    // Get your collection
    const YourCollection = mongoose.model(
      collectionName,
      new mongoose.Schema({}, { strict: false })
    );

    // Fetch data based on query
    const yourData = await YourCollection.find(query).lean();
    console.log(`📊 Found ${yourData.length} records in your collection`);

    // Process the data
    const result = await processExternalLogs(yourData, {
      ...options,
      customFolder: `your-collection-${collectionName}`,
    });

    await mongoose.disconnect();

    return {
      collectionName,
      query,
      ...result,
    };
  } catch (error) {
    console.error("❌ Failed to process from your collection:", error);
    throw error;
  }
}

/**
 * Real-time Processing Endpoint
 * Process incoming data immediately without storing
 */
async function processRealTimeData(incomingData, options = {}) {
  try {
    const processedResult = await processExternalLogs([incomingData], {
      skipDatabase: options.skipDatabase || false,
      uploadToS3: options.uploadToS3 || true,
      customFolder: options.folder || "realtime-logs",
    });

    return processedResult;
  } catch (error) {
    console.error("❌ Failed to process real-time data:", error);
    throw error;
  }
}

/**
 * Scheduled Batch Processing
 * Process data from your database in batches
 */
async function scheduleBatchProcessing(config) {
  try {
    const {
      mongoUri,
      collectionName,
      batchSize = 1000,
      query = {},
      schedule = "0 */6 * * *", // Every 6 hours
      processOptions = {},
    } = config;

    const cron = require("node-cron");

    console.log(
      `⏰ Scheduling batch processing for ${collectionName} every 6 hours`
    );

    cron.schedule(schedule, async () => {
      try {
        console.log(
          `🔄 Starting scheduled batch processing for ${collectionName}`
        );

        const result = await processFromYourCollection(
          mongoUri,
          collectionName,
          query,
          processOptions
        );

        console.log(`✅ Batch processing completed:`, result);
      } catch (error) {
        console.error("❌ Scheduled batch processing failed:", error);
      }
    });

    return { message: "Batch processing scheduled successfully", schedule };
  } catch (error) {
    console.error("❌ Failed to schedule batch processing:", error);
    throw error;
  }
}

/**
 * Health Check Function
 */
async function healthCheck() {
  try {
    const { getApiLogs, getLogs, getJobs } = require("logstack");

    // Check recent logs
    const recentApiLogs = await getApiLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      limit: 1,
    });

    const recentAppLogs = await getLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      limit: 1,
    });

    const recentJobs = await getJobs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      limit: 1,
    });

    return {
      status: "healthy",
      apiLogs: recentApiLogs.length,
      appLogs: recentAppLogs.length,
      jobs: recentJobs.length,
      lastCheck: new Date(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      lastCheck: new Date(),
    };
  }
}

// Export functions
module.exports = {
  initializeLogStack,
  logApiRequest,
  logAppEvent,
  logJob,
  setupExpressLogging,
  runBackgroundJob,
  cleanupOldLogs,
  healthCheck,

  // New External Processing Functions
  processExternalLogs,
  processFromYourCollection,
  processRealTimeData,
  scheduleBatchProcessing,

  // S3 Security Functions
  initializeS3Security,
  generateUserAccessToken,
  getSecureFileUrl,
  getUserAccessibleFiles,
  revokeUserAccess,

  // File Search Functions
  initializeFileSearch,
  searchFiles,
  getFileDetails,
  searchFileContent,
  getFileStatistics,

  // Cron Job Control Functions
  stopAllLogStackJobs,
  startLogStackJob,
  getCronJobStatus: getLogStackJobStatus,
  emergencyStopLogStack,
  destroyAllLogStackJobs,
  stopJobsByPattern: stopLogStackCronsByPattern,
  getActiveLogStackJobs: getActiveLogStackJobs,

  productionConfig,
};

// Initialize S3 Security Manager
let s3SecurityManager = null;

/**
 * Initialize S3 Security Manager
 */
function initializeS3Security() {
  if (productionConfig.s3Security.enabled) {
    s3SecurityManager = new S3SecurityManager({
      accessKeyId: productionConfig.s3.accessKeyId,
      secretAccessKey: productionConfig.s3.secretAccessKey,
      region: productionConfig.s3.region,
      bucket: productionConfig.s3.bucket,
      defaultExpiration: productionConfig.s3Security.defaultExpiration,
    });

    // Clean expired tokens every hour
    setInterval(() => {
      s3SecurityManager.cleanExpiredTokens();
    }, 60 * 60 * 1000);

    console.log("🔒 S3 Security Manager initialized");
  }
}

/**
 * Generate secure access token for user
 */
function generateUserAccessToken(userId, permissions = ["read"]) {
  if (!s3SecurityManager) {
    throw new Error("S3 Security not initialized");
  }

  return s3SecurityManager.generateAccessToken(userId, permissions);
}

/**
 * Get secure download URL for log file
 */
async function getSecureFileUrl(fileName, userId, accessToken = null) {
  try {
    if (!s3SecurityManager) {
      throw new Error("S3 Security not initialized");
    }

    const result = await s3SecurityManager.secureFileDownload(
      fileName,
      userId,
      accessToken
    );

    return {
      success: true,
      downloadUrl: result.url,
      expiration: result.expiration,
      message: "Secure download URL generated",
    };
  } catch (error) {
    console.error(`❌ Failed to generate secure URL for ${fileName}:`, error);
    return {
      success: false,
      error: error.message,
      message: "Access denied",
    };
  }
}

/**
 * List files user can access
 */
async function getUserAccessibleFiles(userId, folder = "") {
  try {
    if (!s3SecurityManager) {
      throw new Error("S3 Security not initialized");
    }

    const files = await s3SecurityManager.listAccessibleFiles(userId, folder);

    return {
      success: true,
      files,
      count: files.length,
    };
  } catch (error) {
    console.error(
      `❌ Failed to list accessible files for user ${userId}:`,
      error
    );
    return {
      success: false,
      error: error.message,
      files: [],
    };
  }
}

/**
 * Revoke user access token
 */
function revokeUserAccess(accessToken) {
  if (!s3SecurityManager) {
    throw new Error("S3 Security not initialized");
  }

  return s3SecurityManager.revokeAccessToken(accessToken);
}

// Initialize File Search Manager
let fileSearchManager = null;

/**
 * Initialize File Search Manager
 */
function initializeFileSearch() {
  if (productionConfig.s3Security.enabled) {
    fileSearchManager = new S3FileSearchManager({
      accessKeyId: productionConfig.s3.accessKeyId,
      secretAccessKey: productionConfig.s3.secretAccessKey,
      region: productionConfig.s3.region,
      bucket: productionConfig.s3.bucket,
      defaultExpiration: productionConfig.s3Security.defaultExpiration,
    });

    console.log("🔍 File Search Manager initialized");
  }
}

/**
 * Search files with advanced filters
 */
async function searchFiles(userId, searchOptions = {}) {
  if (!fileSearchManager) {
    throw new Error("File search not initialized");
  }

  return await fileSearchManager.searchFiles(userId, searchOptions);
}

/**
 * Get detailed file information
 */
async function getFileDetails(userId, fileKey) {
  if (!fileSearchManager) {
    throw new Error("File search not initialized");
  }

  return await fileSearchManager.getFileDetails(userId, fileKey);
}

/**
 * Search content within files
 */
async function searchFileContent(
  userId,
  searchTerm,
  fileTypes = ["json", "txt", "log"]
) {
  if (!fileSearchManager) {
    throw new Error("File search not initialized");
  }

  return await fileSearchManager.searchFileContent(
    userId,
    searchTerm,
    fileTypes
  );
}

/**
 * Get file statistics and analytics
 */
async function getFileStatistics(userId, folder = "") {
  if (!fileSearchManager) {
    throw new Error("File search not initialized");
  }

  return await fileSearchManager.getFileStatistics(userId, folder);
}

// Auto-initialize if this file is run directly
if (require.main === module) {
  initializeLogStack().catch(console.error);
}
