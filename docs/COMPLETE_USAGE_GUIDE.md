# 🎯 Complete Usage Guide: Existing vs New API Logs

Your package now supports **both approaches** for API logging:

## 🔌 Approach 1: Use Your Existing "apilogs" Collection

**Perfect for your current setup!** Your existing collection has 34 documents with these fields:

- `client_ip`, `client_agent`
- `request_time`, `response_time`
- `method`, `path`
- `requestBody`, `requestHeaders`
- `responseStatus`, `responseBody`
- `user_id`, `createdAt`, `updatedAt`

### Quick Setup (Copy & Paste Ready)

```typescript
import { init, createDailyJobs, getJobStatus } from "cron-log-service";

async function setupWithYourExistingLogs() {
  await init({
    // Your database connection
    dbUri: "mongodb://localhost:27017/dynamite-lifestyle-prod-app",

    // File storage (change as needed)
    uploadProvider: "local", // or 's3', 'gcs', 'azure'
    fileFormat: "json",

    // 🔥 Configure to use your existing "apilogs" collection
    apiLogs: {
      existingCollection: {
        name: "apilogs",
        timestampField: "request_time", // Your timestamp field
        requiredFields: {
          method: "method",
          path: "path",
          client_ip: "client_ip",
          user_id: "user_id",
          requestBody: "requestBody",
          responseStatus: "responseStatus",
          responseBody: "responseBody",
        },
      },
    },

    // Cron schedules
    dailyCron: "0 0 * * *", // Create jobs at midnight
    hourlyCron: "0 * * * *", // Process every hour
    retryAttempts: 3,

    logging: {
      level: "info",
      enableConsole: true,
    },
  });

  console.log("✅ Service initialized with your existing apilogs!");

  // Create jobs for today
  await createDailyJobs();

  // Check what gets processed
  const today = new Date().toISOString().split("T")[0];
  const status = await getJobStatus(today);
  console.log(`📊 Status: ${status.length} hours scheduled for processing`);
}

// Run it
setupWithYourExistingLogs().catch(console.error);
```

### Test It Out

```bash
# 1. Inspect your data structure
npm run practical:inspect

# 2. Test with your existing collection
npm run practical:setup

# 3. Check generated files in ./uploads/ folder
```

## 🆕 Approach 2: Create New API Logs Collection

**Perfect for new projects or additional logging alongside existing data.**

### Express App with Auto-Logging

```typescript
import express from "express";
import { init, createApiLogMiddleware } from "cron-log-service";

async function setupWithNewLogging() {
  // Initialize service with new collection
  await init({
    dbUri: "mongodb://localhost:27017/dynamite-lifestyle-prod-app",
    uploadProvider: "local",

    // 🆕 Create new collection with auto-logging
    apiLogs: {
      createNew: {
        collectionName: "new_api_logs", // Optional: custom name
        enableMiddleware: true,
        autoFields: true,
      },
    },
  });

  // Setup Express app
  const app = express();
  app.use(express.json());

  // 🔥 Add automatic API logging middleware
  app.use(createApiLogMiddleware());

  // Your API routes - will be automatically logged!
  app.get("/api/test", (req, res) => {
    res.json({ message: "This request will be logged automatically!" });
  });

  app.post("/api/users", (req, res) => {
    res.json({ message: "User created", body: req.body });
  });

  app.listen(3000, () => {
    console.log("🚀 Server running on port 3000 with auto-logging");
  });
}

setupWithNewLogging().catch(console.error);
```

### Manual Logging

```typescript
import { saveApiLog } from "cron-log-service";

// Manually save specific logs
await saveApiLog({
  method: "POST",
  path: "/api/custom-endpoint",
  client_ip: "192.168.1.100",
  requestBody: { action: "custom_action" },
  responseStatus: 200,
  responseBody: { success: true },
});
```

## 🔄 Approach 3: Hybrid (Both!)

**Use existing collection AND create new logs simultaneously.**

```typescript
await init({
  dbUri: "mongodb://localhost:27017/dynamite-lifestyle-prod-app",
  uploadProvider: "local",

  apiLogs: {
    // Primary: your existing apilogs collection
    existingCollection: {
      name: "apilogs",
      timestampField: "request_time",
    },
    // Secondary: new collection for additional logging
    createNew: {
      collectionName: "supplementary_logs",
      enableMiddleware: true,
    },
  },
});
```

## ☁️ Cloud Storage Examples

### AWS S3

```typescript
await init({
  dbUri: "mongodb://localhost:27017/dynamite-lifestyle-prod-app",
  uploadProvider: "s3",

  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
    bucket: "your-logs-bucket",
  },

  apiLogs: {
    existingCollection: {
      name: "apilogs",
      timestampField: "request_time",
    },
  },
});
```

### Google Cloud Storage

```typescript
await init({
  dbUri: "mongodb://localhost:27017/dynamite-lifestyle-prod-app",
  uploadProvider: "gcs",

  gcs: {
    projectId: "your-project-id",
    keyFilename: "path/to/service-account.json",
    bucket: "your-logs-bucket",
  },

  apiLogs: {
    existingCollection: {
      name: "apilogs",
      timestampField: "request_time",
    },
  },
});
```

## 🎛️ Available Commands

```bash
# Inspect your existing data
npm run practical:inspect

# Setup with existing collection (recommended for you)
npm run practical:setup

# Setup with cloud storage
npm run practical:cloud

# Test flexible approaches
npm run example:flexible existing
npm run example:flexible new
npm run example:flexible hybrid

# Original inspection tool
npm run inspect:apilogs

# Test with your existing collection
npm run test:apilogs
```

## 🚀 Recommended Next Steps for You

1. **Start with your existing data:**

   ```bash
   npm run practical:setup
   ```

2. **Check generated files:**

   ```bash
   ls -la uploads/
   ```

3. **Configure cloud storage** (optional):

   - Update config with your S3/GCS credentials
   - Run `npm run practical:cloud`

4. **Add to production:**

   - The cron jobs will automatically run
   - Files will be generated hourly from your apilogs
   - Check logs for any issues

5. **Optional: Add new logging** for additional endpoints while keeping existing data processing active.

## 💡 Key Benefits

✅ **Zero Migration Required** - Works with your existing "apilogs" collection  
✅ **Flexible Configuration** - Support both existing and new collections  
✅ **Auto-Scheduling** - Cron jobs handle everything automatically  
✅ **Multiple Storage Options** - Local, S3, GCS, Azure support  
✅ **Backward Compatible** - All existing features still work  
✅ **Easy Testing** - Multiple examples and test commands

Your existing 34 API logs are ready to be processed into hourly files! 🎉
