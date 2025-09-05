/**
 * 🚀 LogStack Main Entry Point
 * Simple import for all LogStack functionality
 */

// Core LogStack functions
const {
  init,
  createDailyJobs,
  runHourlyJob,
  processSpecificHour,
  getLogs,
  getJobStatus,
  isInitialized,
  validateConfig,
  sanitizeConfig,
  getConfig,
  saveApiLog,
  getApiLogs,
  createApiLogMiddleware,
  getApiLogsByHour,
  retryFailedJobs,
} = require("./dist/index");

// Production setup functions
const {
  initializeLogStack,
  logAppEvent,
  logError,
  logInfo,
  logWarning,
  logDebug,
  scheduleHourlyJobs,
  processHourlyLogs,
  getRecentLogs,
  getLogStatistics,
  cleanupOldLogs,
  uploadToS3,
  downloadFromS3,
  listS3Files,
  generateSecureDownloadUrl,
  initializeS3Security,
  createAccessToken,
  revokeAccessToken,
  validateAccess,
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
} = require("./production-setup");

// Security and file management
const { S3SecurityManager } = require("./lib/s3Security");
const { S3FileSearchManager } = require("./lib/s3FileSearch");

// Export everything for easy import
module.exports = {
  // Core functions
  init,
  createDailyJobs,
  runHourlyJob,
  processSpecificHour,
  getLogs,
  getJobStatus,
  isInitialized,
  validateConfig,
  sanitizeConfig,
  getConfig,
  saveApiLog,
  getApiLogs,
  createApiLogMiddleware,
  getApiLogsByHour,
  retryFailedJobs,

  // Production setup functions
  initializeLogStack,
  logAppEvent,
  logError,
  logInfo,
  logWarning,
  logDebug,
  scheduleHourlyJobs,
  processHourlyLogs,
  getRecentLogs,
  getLogStatistics,
  cleanupOldLogs,
  uploadToS3,
  downloadFromS3,
  listS3Files,

  // Security functions
  generateSecureDownloadUrl,
  initializeS3Security,
  createAccessToken,
  revokeAccessToken,
  validateAccess,

  // File search functions
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

  // Configuration
  productionConfig,

  // Classes for advanced usage
  S3SecurityManager,
  S3FileSearchManager,
};

// Also provide named exports for CommonJS compatibility
module.exports.LogStack = module.exports;
