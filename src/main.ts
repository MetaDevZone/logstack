import { connectDB } from '../lib/db';
import { setupCronJobs } from '../lib/cron';
import { createDailyJobs, runHourlyJob, processSpecificHour } from './jobs';
import { getLogs, getJobStatus } from './logs';
import { saveApiLog, getApiLogs, createApiLogMiddleware, getApiLogsByHour } from './apiLogs';
import { validateConfig, sanitizeConfig } from '../lib/validation';
import { initLogger, getLogger } from '../lib/logger';
import { initRetention } from './retention';
import { Config } from '../types/config';

// Track initialization state
let initialized = false;
let globalConfig: Config | null = null;

// Initialize LogStack with configuration
export async function init(config: Config) {
  if (initialized) {
    getLogger().warn('Service already initialized');
    return;
  }

  // Validate configuration
  const validation = validateConfig(config);
  if (!validation.isValid) {
    throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
  }

  // Sanitize and set defaults
  const sanitizedConfig = sanitizeConfig(config);
  
  // Store global config
  globalConfig = sanitizedConfig;
  
  // Initialize logger
  initLogger(sanitizedConfig);
  const logger = getLogger();
  
  logger.info('Initializing cron-log-service', { 
    uploadProvider: sanitizedConfig.uploadProvider,
    fileFormat: sanitizedConfig.fileFormat 
  });

  try {
    // Connect to database
    const { db } = await connectDB(sanitizedConfig.dbUri);
    logger.info('Database connected successfully');

    // Initialize retention service if configured
    if (sanitizedConfig.retention) {
      try {
        await initRetention(sanitizedConfig, db);
        logger.info('Retention policies initialized successfully');
      } catch (error) {
        logger.warn('Failed to initialize retention policies', { error });
      }
    }

    // Setup cron jobs
    setupCronJobs(sanitizedConfig);
    logger.info('Cron jobs scheduled successfully');

    initialized = true;
    logger.info('Cron-log-service initialized successfully');
    
    return { db, config: sanitizedConfig };
  } catch (error) {
    logger.error('Failed to initialize cron-log-service', { error });
    throw error;
  }
}

export function isInitialized(): boolean {
  return initialized;
}

export function getConfig(): Config {
  if (!globalConfig) {
    throw new Error('Service not initialized. Call init() first.');
  }
  return globalConfig;
}

export { 
  createDailyJobs, 
  runHourlyJob, 
  processSpecificHour,
  getLogs, 
  getJobStatus,
  saveApiLog,
  getApiLogs,
  createApiLogMiddleware,
  getApiLogsByHour,
  validateConfig,
  sanitizeConfig,
  initRetention
};
