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
  
  // Folder structure configuration
  folderStructure?: {
    type?: 'daily' | 'monthly' | 'yearly'; // How to organize folders (default: 'daily')
    pattern?: string; // Custom folder pattern (overrides type)
    subFolders?: {
      enabled?: boolean; // Enable sub-folders (default: false)
      byHour?: boolean; // Create sub-folders by hour (default: false)
      byStatus?: boolean; // Create sub-folders by status (success/failed) (default: false)
      custom?: string[]; // Custom sub-folder names
    };
    naming?: {
      dateFormat?: string; // Date format for folder names (default: 'YYYY-MM-DD')
      includeTime?: boolean; // Include time in folder names (default: false)
      prefix?: string; // Prefix for folder names
      suffix?: string; // Suffix for folder names
    };
  };
  
  // File compression configuration
  compression?: {
    enabled?: boolean; // Enable file compression (default: false)
    format?: 'gzip' | 'zip' | 'brotli'; // Compression format (default: 'gzip')
    level?: number; // Compression level 1-9 (default: 6)
    fileSize?: number; // Minimum file size to compress in bytes (default: 1024)
  };
  
  // Sensitive data masking configuration
  dataMasking?: {
    enabled?: boolean; // Enable data masking (default: true)
    maskingChar?: string; // Character to use for masking (default: '*')
    preserveLength?: boolean; // Preserve original field length (default: false)
    showLastChars?: number; // Show last N characters (default: 0)
    customPatterns?: { [key: string]: RegExp }; // Custom patterns to mask
    customFields?: string[]; // Custom field names to mask
    exemptFields?: string[]; // Fields to exclude from masking
    maskEmails?: boolean; // Mask email addresses (default: true)
    maskIPs?: boolean; // Mask IP addresses (default: false)
    maskConnectionStrings?: boolean; // Mask database connection strings (default: true)
  };
  
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
