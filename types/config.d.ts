export interface Config {
  dbUri: string;
  uploadProvider: 'local' | 's3' | 'gcs' | 'azure';
  fileFormat?: 'json' | 'csv' | 'txt';
  retryAttempts?: number;
  dailyCron?: string;
  hourlyCron?: string;
  timezone?: string;
  
  // Log Retention Configuration
  retention?: {
    // Database retention (in days)
    database?: {
      apiLogs?: number; // Days to keep API logs in database (default: 30)
      jobs?: number; // Days to keep job records (default: 90)
      logs?: number; // Days to keep processing logs (default: 90)
      autoCleanup?: boolean; // Enable automatic cleanup (default: false)
      cleanupCron?: string; // Cron for cleanup job (default: "0 2 * * *" - 2 AM daily)
    };
    
    // Cloud storage retention (in days)
    storage?: {
      files?: number; // Days to keep uploaded files (default: 365)
      autoCleanup?: boolean; // Enable automatic file cleanup (default: false)
      cleanupCron?: string; // Cron for file cleanup (default: "0 3 * * *" - 3 AM daily)
      
      // S3 Lifecycle policies (if using S3)
      s3Lifecycle?: {
        transitionToIA?: number; // Days to transition to Infrequent Access (default: 30)
        transitionToGlacier?: number; // Days to transition to Glacier (default: 90)
        transitionToDeepArchive?: number; // Days to transition to Deep Archive (default: 180)
        expiration?: number; // Days to permanently delete (default: 2555 = 7 years)
      };
    };
  };
  
  // Output directory configuration
  outputDirectory?: string; // Default: "uploads" - where to store generated files
  // Collection names configuration
  collections?: {
    jobsCollectionName?: string; // Default: "jobs"
    logsCollectionName?: string; // Default: "logs"
    apiLogsCollectionName?: string; // Default: "apilogs"
  };
  // API Logs Configuration
  apiLogs?: {
    // Option 1: Use existing collection
    existingCollection?: {
      name: string; // Collection name (e.g., "apilogs")
      timestampField: string; // Field to use for timestamp (e.g., "request_time", "createdAt")
      requiredFields?: {
        method?: string;
        path?: string;
        client_ip?: string;
        user_id?: string;
        requestBody?: string;
        responseStatus?: string;
        responseBody?: string;
        requestHeaders?: string;
        responseHeaders?: string;
      };
    };
    // Option 2: Create new collection using package's logging middleware
    createNew?: {
      collectionName?: string; // Default: "apilogs"
      enableMiddleware?: boolean; // Enable Express middleware
      autoFields?: boolean; // Auto-capture common fields
    };
  };
  s3?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
    endpoint?: string; // For S3-compatible services
  };
  gcs?: {
    projectId: string;
    keyFilename?: string; // Path to service account key file
    credentials?: any; // Service account credentials object
    bucket: string;
  };
  azure?: {
    connectionString: string;
    containerName: string;
  };
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole?: boolean;
    enableFile?: boolean;
    logFilePath?: string;
  };
}
