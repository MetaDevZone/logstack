# cron-log-service

Production-ready Node.js package for automated hourly API logs processing and cloud storage uploads with MongoDB and cron jobs.

## ✨ Features

- **🔄 Automated Processing**: Hourly cron jobs for API logs processing and uploads
- **☁️ Multi-Cloud Storage**: AWS S3, Google Cloud, Azure Blob, and local file storage
- **🗃️ Database Flexibility**: Custom collection names to avoid conflicts
- **📁 Organized Structure**: Clean output directories and file organization
- **⚡ High Performance**: Batch processing for large datasets (163+ records/sec)
- **🎯 TypeScript Support**: Full type safety and IntelliSense
- **🛡️ Production Ready**: Comprehensive error handling and retry logic

## 🚀 Installation

```bash
npm install cron-log-service
```

## 📋 Quick Start

```javascript
const { init, createDailyJobs } = require("cron-log-service");

async function setup() {
  await init({
    dbUri: "mongodb://localhost:27017/your-app",
    uploadProvider: "local", // or 's3', 'gcs', 'azure'
    outputDirectory: "api-logs",
    collections: {
      jobsCollectionName: "myapp_jobs",
      logsCollectionName: "myapp_logs",
      apiLogsCollectionName: "myapp_apilogs",
    },
  });

  // Creates 24 hourly jobs for today
  await createDailyJobs();
}

setup().catch(console.error);
```

## 🎯 Node.js Implementation Examples

### Basic Express.js Integration

```javascript
const express = require("express");
const { init, createApiLogMiddleware } = require("cron-log-service");

const app = express();

async function setupApp() {
  // Initialize the service
  await init({
    dbUri: process.env.DB_URI,
    uploadProvider: "local",
    outputDirectory: "logs",
    collections: {
      jobsCollectionName: "express_jobs",
      logsCollectionName: "express_logs",
      apiLogsCollectionName: "api_requests",
    },
  });

  // Add automatic API logging middleware
  app.use(createApiLogMiddleware());

  // Your API routes
  app.get("/api/users", (req, res) => {
    res.json({ users: [] });
  });

  app.listen(3000, () => {
    console.log("Server running with automatic API logging");
  });
}

setupApp();
```

### AWS S3 Production Setup

```javascript
const { init, createDailyJobs } = require("cron-log-service");

const productionConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",
  outputDirectory: "production-logs",

  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
    apiLogsCollectionName: "prod_apilogs",
  },

  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.S3_BUCKET,
  },

  retryAttempts: 5,
  logging: { level: "info", enableFile: true },
};

async function deployProduction() {
  await init(productionConfig);

  // Setup jobs for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    await createDailyJobs(dateStr);
  }

  console.log("Production deployment complete");
}

deployProduction();
```

### Multi-Environment Setup

```javascript
const { init } = require("cron-log-service");

const createConfig = (env) => ({
  dbUri: process.env.DB_URI,
  uploadProvider: env === "production" ? "s3" : "local",
  outputDirectory: `${env}-logs`,

  collections: {
    jobsCollectionName: `${env}_jobs`,
    logsCollectionName: `${env}_logs`,
    apiLogsCollectionName: `${env}_apilogs`,
  },

  s3:
    env === "production"
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: "us-east-1",
          bucket: process.env.S3_BUCKET,
        }
      : undefined,
});

// Initialize for current environment
const config = createConfig(process.env.NODE_ENV || "development");
init(config);
```

### Processing Existing API Logs

```javascript
const { init, processSpecificHour, getApiLogs } = require("cron-log-service");

async function processBacklog() {
  await init({
    dbUri: process.env.DB_URI,
    uploadProvider: "local",
    outputDirectory: "backlog-processing",
    collections: {
      apiLogsCollectionName: "your_existing_apilogs", // Your collection
    },
  });

  // Process last 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split("T")[0];

    // Process all 24 hours
    for (let hour = 0; hour < 24; hour++) {
      try {
        await processSpecificHour(dateStr, hour);
        console.log(`✅ Processed ${dateStr} ${hour}:00`);
      } catch (error) {
        console.error(`❌ Failed ${dateStr} ${hour}:00:`, error.message);
      }
    }
  }
}

processBacklog();
```

## ⚙️ Configuration Options

```typescript
interface Config {
  dbUri: string; // MongoDB connection string
  uploadProvider: "local" | "s3" | "gcs" | "azure";
  fileFormat?: "json" | "csv" | "txt"; // Default: 'json'
  outputDirectory?: string; // Default: 'uploads'
  retryAttempts?: number; // Default: 3

  // Custom collection names (prevents conflicts)
  collections?: {
    jobsCollectionName?: string; // Default: 'jobs'
    logsCollectionName?: string; // Default: 'logs'
    apiLogsCollectionName?: string; // Default: 'apilogs'
  };

  // Cron schedule (optional)
  dailyCron?: string; // Default: '0 0 * * *'
  hourlyCron?: string; // Default: '0 * * * *'

  // Cloud storage configurations
  s3?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  };

  gcs?: {
    projectId: string;
    keyFilename: string;
    bucket: string;
  };

  azure?: {
    connectionString: string;
    containerName: string;
  };

  logging?: {
    level: "debug" | "info" | "warn" | "error";
    enableConsole?: boolean;
    enableFile?: boolean;
  };
}
```

## 🎯 API Reference

### Core Functions

```javascript
// Initialize the service
await init(config);

// Create daily jobs (24 hourly slots)
await createDailyJobs(date?, config?);

// Process specific hour
await processSpecificHour(date, hour, config?);

// Manual job execution
await runHourlyJob(config?);

// Get processing logs
const logs = await getLogs(date, hourRange?);

// Check job status
const status = await getJobStatus(date, hourRange);

// Retry failed jobs
await retryFailedJobs(config?);
```

### API Logging Functions

```javascript
// Express middleware for automatic logging
app.use(createApiLogMiddleware(config?));

// Manual API log saving
await saveApiLog(logData, config?);

// Query API logs
const logs = await getApiLogs(filters?, config?);

// Get logs by hour range
const hourLogs = await getApiLogsByHour(date, hourRange, config?);
```

## 📊 Performance & Features

- **Processing Speed**: 163+ records per second
- **Memory Efficient**: Streaming for large datasets
- **File Organization**: Automatic date/hour structure
- **Error Recovery**: Automatic retry with exponential backoff
- **Cloud Storage**: Multi-provider support with organized structure
- **Database Isolation**: Custom collection names prevent conflicts

## 🧪 Testing

```bash
# Install and test locally
npm install cron-log-service
npx cron-log-service test

# Or with your implementation
node your-implementation.js
```

## 📁 Generated File Structure

```
your-output-directory/
├── 2025-08-26/
│   ├── 09-10.json          # 9 AM to 10 AM logs
│   ├── 10-11.json          # 10 AM to 11 AM logs
│   └── ...
├── 2025-08-25/
│   └── ...
└── analytics/
    └── processing-stats.json
```

## 🛠️ Environment Variables

```bash
# Required
DB_URI=mongodb://localhost:27017/your-app

# AWS S3 (if using S3)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
S3_BUCKET=your-bucket

# Optional
NODE_ENV=production
LOG_LEVEL=info
OUTPUT_DIR=production-logs
```

## 🚀 Production Ready

This package is battle-tested with:

- ✅ High-performance processing (163+ records/sec)
- ✅ Production MongoDB deployments
- ✅ AWS S3 multi-region support
- ✅ Comprehensive error handling
- ✅ Memory-efficient streaming
- ✅ TypeScript support
- ✅ Automated testing suite

## 📄 License

MIT License

## 🤝 Support

- 📚 [Documentation](https://github.com/your-repo/cron-log-service)
- 🐛 [Issues](https://github.com/your-repo/cron-log-service/issues)
- 💬 [Discussions](https://github.com/your-repo/cron-log-service/discussions)
