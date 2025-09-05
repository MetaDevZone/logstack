# ✅ Implementation Checklist - Cron Log Service

Use this checklist to implement the service step-by-step in your project.

## 📋 Phase 1: Basic Setup

### ☐ 1. Installation

```bash
npm install logstack
```

### ☐ 2. Create Configuration File

Create `src/config/cronConfig.ts`:

```typescript
import { Config } from "logstack/types/config";

export const cronConfig: Config = {
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp",
  uploadProvider: "local",
  fileFormat: "json",
  logging: {
    level: "info",
    enableConsole: true,
  },
};
```

### ☐ 3. Initialize in Your App

Add to your main app file:

```typescript
import { init } from "logstack";
import { cronConfig } from "./src/config/cronConfig";

// Initialize during app startup
await init(cronConfig);
```

### ☐ 4. Test Basic Setup

Run this test script:

```typescript
import { createDailyJobs } from "logstack";
const job = await createDailyJobs("2025-08-25");
console.log("✅ Basic setup working!", job.hours.length);
```

---

## 📂 Phase 2: Organize Your Files

### ☐ 1. Add Output Directory

Update your config:

```typescript
export const cronConfig: Config = {
  // ... existing config
  outputDirectory: "api-logs", // Add this line
};
```

### ☐ 2. Choose Directory Name

Pick based on your use case:

- `'api-logs'` - API request exports
- `'user-activity'` - User activity logs
- `'system-exports'` - System data exports
- `'analytics-data'` - Analytics exports

### ☐ 3. Test File Organization

```typescript
import { processSpecificHour } from "logstack";
await processSpecificHour("2025-08-25", 14);
// Check: ./api-logs/2025-08-25/14-15.json should exist
```

### ☐ 4. Verify Clean Structure

Your project root should now be clean:

```
your-project/
├── api-logs/          ← All log files here
├── src/
├── package.json
└── other-app-files    ← No date folders here!
```

---

## 🗃️ Phase 3: Avoid Database Conflicts

### ☐ 1. Add Custom Collection Names

Update your config:

```typescript
export const cronConfig: Config = {
  // ... existing config
  collections: {
    jobsCollectionName: "myapp_jobs", // Add this
    logsCollectionName: "myapp_logs", // Add this
  },
};
```

### ☐ 2. Choose Unique Names

Use your app/service name:

- `'userservice_jobs'` for user service
- `'orderapi_jobs'` for order API
- `'analytics_jobs'` for analytics service
- `'mycompany_prod_jobs'` for production

### ☐ 3. Test Collection Isolation

```typescript
// Check MongoDB - you should see your custom collections:
// - myapp_jobs (instead of jobs)
// - myapp_logs (instead of logs)
```

### ☐ 4. Verify Multiple Services Work

If you have multiple services, each should use different collection names.

---

## 🚀 Phase 4: Production Setup

### ☐ 1. Environment Configuration

Create `.env` file:

```env
NODE_ENV=production
DB_URI=mongodb://your-prod-cluster.mongodb.net/myapp
OUTPUT_DIR=production-logs
JOBS_COLLECTION=prod_jobs
LOGS_COLLECTION=prod_logs
```

### ☐ 2. Cloud Storage (Optional)

For production, consider cloud storage:

```typescript
// AWS S3
export const prodConfig: Config = {
  uploadProvider: "s3",
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
    bucket: "myapp-logs",
  },
};
```

### ☐ 3. Environment-Based Config

```typescript
const createConfig = (): Config => {
  const isProd = process.env.NODE_ENV === "production";

  return {
    dbUri: process.env.DB_URI!,
    uploadProvider: isProd ? "s3" : "local",
    outputDirectory: process.env.OUTPUT_DIR!,
    collections: {
      jobsCollectionName: process.env.JOBS_COLLECTION!,
      logsCollectionName: process.env.LOGS_COLLECTION!,
    },
    // S3 config only for production
    ...(isProd && {
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: "us-east-1",
        bucket: "myapp-logs",
      },
    }),
  };
};
```

---

## 🔌 Phase 5: API Request Logging (Optional)

### ☐ 1. Add Express Middleware

```typescript
import { setupRequestLogging } from "logstack";

app.use(setupRequestLogging(cronConfig));
```

### ☐ 2. Use Existing API Logs

If you already have API logs in your database:

```typescript
export const cronConfig: Config = {
  // ... existing config
  apiLogs: {
    existingCollection: {
      name: "api_requests", // Your existing collection
      timestampField: "request_time", // Your timestamp field
    },
  },
};
```

---

## 🧪 Phase 6: Testing & Validation

### ☐ 1. Test Script

Create `test-cron-service.js`:

```javascript
const {
  init,
  createDailyJobs,
  processSpecificHour,
} = require("logstack");

async function test() {
  const config = {
    dbUri: "mongodb://localhost:27017/test",
    uploadProvider: "local",
    outputDirectory: "test-logs",
    collections: {
      jobsCollectionName: "test_jobs",
      logsCollectionName: "test_logs",
    },
  };

  await init(config);
  const job = await createDailyJobs("2025-08-25", config);
  await processSpecificHour("2025-08-25", 14, config);

  console.log("✅ Test completed!");
  console.log("📁 Check: ./test-logs/2025-08-25/14-15.json");
}

test().catch(console.error);
```

### ☐ 2. Run Test

```bash
node test-cron-service.js
```

### ☐ 3. Verify Results

- ✅ File created in test-logs directory
- ✅ Collections created with custom names
- ✅ No errors in console

---

## 🎯 Final Configuration Examples

### ☐ Development Setup

```typescript
const devConfig: Config = {
  dbUri: "mongodb://localhost:27017/myapp_dev",
  uploadProvider: "local",
  outputDirectory: "dev-logs",
  collections: {
    jobsCollectionName: "dev_jobs",
    logsCollectionName: "dev_logs",
  },
  logging: {
    level: "info",
    enableConsole: true,
  },
};
```

### ☐ Production Setup

```typescript
const prodConfig: Config = {
  dbUri: process.env.PROD_DB_URI,
  uploadProvider: "s3",
  outputDirectory: "production-logs",
  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
    bucket: "company-prod-logs",
  },
  logging: {
    level: "warn",
    enableConsole: false,
    enableFile: true,
  },
};
```

### ☐ Multi-Service Setup

```typescript
// Service A
const userServiceConfig: Config = {
  dbUri: "mongodb://shared-cluster.mongodb.net/company",
  uploadProvider: "local",
  outputDirectory: "user-service-logs",
  collections: {
    jobsCollectionName: "user_service_jobs",
    logsCollectionName: "user_service_logs",
  },
};

// Service B
const orderServiceConfig: Config = {
  dbUri: "mongodb://shared-cluster.mongodb.net/company",
  uploadProvider: "gcs",
  outputDirectory: "order-service-exports",
  collections: {
    jobsCollectionName: "order_service_jobs",
    logsCollectionName: "order_service_logs",
  },
  gcs: {
    projectId: "my-gcp-project",
    keyFilename: "./gcp-key.json",
    bucket: "order-exports",
  },
};
```

---

## 🎉 Completion Checklist

### ☐ Basic Features Working

- ✅ Service initializes without errors
- ✅ Daily jobs are created
- ✅ Hour processing works
- ✅ Files are generated

### ☐ Organization Features Working

- ✅ Files go to custom directory (not project root)
- ✅ Custom collection names prevent conflicts
- ✅ Multiple services can coexist
- ✅ Clean project structure maintained

### ☐ Production Ready

- ✅ Environment-based configuration
- ✅ Proper error handling
- ✅ Cloud storage configured (if needed)
- ✅ Logging configured appropriately

### ☐ Documentation Complete

- ✅ Team knows how to use the service
- ✅ Configuration is documented
- ✅ Environment variables are documented
- ✅ Deployment process is clear

---

## 🆘 Troubleshooting

### Common Issues:

**❌ "Database connection failed"**

- Check your `dbUri` connection string
- Ensure MongoDB is running
- Verify network connectivity

**❌ "Directory not created"**

- Check file permissions
- Verify `outputDirectory` path is valid
- Ensure disk space is available

**❌ "Collection name conflict"**

- Use unique `jobsCollectionName` and `logsCollectionName`
- Check existing collections in your database
- Consider adding service prefix to collection names

**❌ "Cloud upload failed"**

- Verify cloud credentials are correct
- Check bucket/container permissions
- Ensure network connectivity to cloud provider

---

**🎯 Follow this checklist step-by-step and you'll have a fully working, organized, and conflict-free cron log service!**
