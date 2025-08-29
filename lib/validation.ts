import { Config } from '../types/config';

export function validateConfig(config: Config): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Database URI validation
  if (!config.dbUri) {
    errors.push('Database URI is required');
  } else if (!config.dbUri.startsWith('mongodb://') && !config.dbUri.startsWith('mongodb+srv://')) {
    errors.push('Database URI must be a valid MongoDB connection string');
  }

  // Upload provider validation
  const validProviders = ['local', 's3', 'gcs', 'azure'];
  if (!validProviders.includes(config.uploadProvider)) {
    errors.push(`Upload provider must be one of: ${validProviders.join(', ')}`);
  }

  // Provider-specific validation
  if (config.uploadProvider === 's3') {
    if (!config.s3) {
      errors.push('S3 configuration is required when using S3 provider');
    } else {
      if (!config.s3.accessKeyId) errors.push('S3 accessKeyId is required');
      if (!config.s3.secretAccessKey) errors.push('S3 secretAccessKey is required');
      if (!config.s3.region) errors.push('S3 region is required');
      if (!config.s3.bucket) errors.push('S3 bucket is required');
    }
  }

  if (config.uploadProvider === 'gcs') {
    if (!config.gcs) {
      errors.push('GCS configuration is required when using GCS provider');
    } else {
      if (!config.gcs.projectId) errors.push('GCS projectId is required');
      if (!config.gcs.bucket) errors.push('GCS bucket is required');
      if (!config.gcs.keyFilename && !config.gcs.credentials) {
        errors.push('GCS keyFilename or credentials are required');
      }
    }
  }

  if (config.uploadProvider === 'azure') {
    if (!config.azure) {
      errors.push('Azure configuration is required when using Azure provider');
    } else {
      if (!config.azure.connectionString) errors.push('Azure connectionString is required');
      if (!config.azure.containerName) errors.push('Azure containerName is required');
    }
  }

  // File format validation
  if (config.fileFormat && !['json', 'csv', 'txt'].includes(config.fileFormat)) {
    errors.push('File format must be one of: json, csv, txt');
  }

  // Cron schedule validation (basic)
  if (config.dailyCron && !isValidCronExpression(config.dailyCron)) {
    errors.push('Daily cron expression is invalid');
  }

  if (config.hourlyCron && !isValidCronExpression(config.hourlyCron)) {
    errors.push('Hourly cron expression is invalid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function isValidCronExpression(expression: string): boolean {
  // Basic cron validation - 5 or 6 parts separated by spaces
  const parts = expression.trim().split(/\s+/);
  return parts.length === 5 || parts.length === 6;
}

export function sanitizeConfig(config: Config): Config {
  return {
    ...config,
    fileFormat: config.fileFormat || 'json',
    retryAttempts: config.retryAttempts || 3,
    dailyCron: config.dailyCron || '0 0 * * *',
    hourlyCron: config.hourlyCron || '0 * * * *',
    timezone: config.timezone || 'UTC',
    outputDirectory: config.outputDirectory || 'uploads', // Default to 'uploads' folder
    collections: {
      jobsCollectionName: 'jobs',
      logsCollectionName: 'logs',
      ...config.collections
    },
    logging: {
      level: 'info',
      enableConsole: true,
      enableFile: false,
      ...config.logging
    }
  };
}
