// Entry point for the cron-log-service package
import { 
  init, 
  createDailyJobs, 
  runHourlyJob, 
  processSpecificHour,
  getLogs, 
  getJobStatus,
  isInitialized,
  validateConfig,
  sanitizeConfig,
  getConfig
} from './src/main';
import { saveApiLog, getApiLogs, createApiLogMiddleware, getApiLogsByHour } from './src/apiLogs';
import { retryFailedJobs } from './src/jobs';

export { 
  init, 
  createDailyJobs, 
  runHourlyJob, 
  processSpecificHour,
  getLogs, 
  getJobStatus,
  saveApiLog,
  getApiLogs,
  createApiLogMiddleware,
  getApiLogsByHour,
  retryFailedJobs,
  isInitialized,
  validateConfig,
  sanitizeConfig,
  getConfig
};

// Export types for TypeScript users
export { Config } from './types/config';
export { Job, HourJob } from './models/job';
export { ApiLog } from './models/apiLog';
