# 🚀 Flexible API Logs Configuration

The package now supports **two approaches** for handling API logs:

## 🔌 Option 1: Use Existing Collection

Perfect for when you already have API logs stored in your database (like your "apilogs" collection).

### Basic Setup

```typescript
import { init } from "logstack";

await init({
  dbUri: "mongodb://localhost:27017/your-database-name",
  uploadProvider: "local", // or 's3', 'gcs', 'azure'

  apiLogs: {
    existingCollection: {
      name: "apilogs", // Your existing collection name
      timestampField: "request_time", // Field to filter by time
      requiredFields: {
        method: "method",
        path: "path",
        client_ip: "client_ip",
        user_id: "user_id",
        requestBody: "requestBody",
        responseStatus: "responseStatus",
      },
    },
  },
});
```

### Advanced Configuration

```typescript
apiLogs: {
  existingCollection: {
    name: 'apilogs',
    timestampField: 'request_time', // or 'createdAt', 'created_at', etc.
    requiredFields: {
      method: 'method',
      path: 'path',
      client_ip: 'client_ip',
      user_id: 'user_id',
      requestBody: 'requestBody',
      responseStatus: 'responseStatus',
      responseBody: 'responseBody',
      requestHeaders: 'requestHeaders'
    }
  }
}
```

## 🆕 Option 2: Create New Collection

Perfect for new projects or when you want to use the package's built-in logging middleware.

### Express App with Auto-Logging

```typescript
import express from "express";
import { init, createApiLogMiddleware } from "logstack";

// Initialize service
await init({
  dbUri: "mongodb://localhost:27017/your-database-name",
  uploadProvider: "s3",
  s3: {
    accessKeyId: "your-key",
    secretAccessKey: "your-secret",
    region: "us-east-1",
    bucket: "your-bucket",
  },

  apiLogs: {
    createNew: {
      collectionName: "api_logs", // Optional: default is 'apilogs'
      enableMiddleware: true,
      autoFields: true, // Auto-capture IP, user-agent, etc.
    },
  },
});

// Setup Express with logging
const app = express();
app.use(createApiLogMiddleware());

// Your API routes - automatically logged!
app.get("/api/users", (req, res) => {
  res.json({ users: [] });
});

app.listen(3000);
```

### Manual Logging

```typescript
import { saveApiLog } from "logstack";

// Manually save logs
await saveApiLog({
  method: "POST",
  path: "/api/users",
  client_ip: "192.168.1.1",
  requestBody: { name: "John" },
  responseStatus: 200,
});
```

## 🔄 Option 3: Hybrid Approach

Use both existing collection AND create new logs:

```typescript
await init({
  dbUri: "mongodb://localhost:27017/your-database-name",
  uploadProvider: "gcs",

  apiLogs: {
    // Primary: existing collection
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

## 📊 Supported Data Sources

The package automatically handles various timestamp field names:

- `request_time`
- `response_time`
- `createdAt`
- `created_at`
- `updatedAt`
- `timestamp`
- `date`
- `time`

## 🎯 Quick Start Commands

### Inspect Your Existing Data

```bash
npm run practical:inspect
```

### Setup with Existing Collection

```bash
npm run practical:setup
```

### Setup with Cloud Storage

```bash
npm run practical:cloud
```

### Test Different Approaches

```bash
# Test existing collection approach
npm run example:flexible existing

# Test new collection approach
npm run example:flexible new

# Test hybrid approach
npm run example:flexible hybrid
```

## 🛠️ Configuration Examples

### For Your "apilogs" Collection

```typescript
await init({
  dbUri: "mongodb://localhost:27017/dynamite-lifestyle-prod-app",
  uploadProvider: "local",

  apiLogs: {
    existingCollection: {
      name: "apilogs",
      timestampField: "request_time",
    },
  },

  // File generation settings
  fileFormat: "json", // or 'csv', 'txt'
  dailyCron: "0 0 * * *", // Create jobs at midnight
  hourlyCron: "0 * * * *", // Process hourly
  retryAttempts: 3,
});
```

### With S3 Upload

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

## 💡 Best Practices

1. **Start with inspection**: Use `npm run practical:inspect` to understand your data
2. **Test locally first**: Use `uploadProvider: 'local'` for testing
3. **Gradual migration**: Start with existing collection, add new logging incrementally
4. **Monitor performance**: Use appropriate `retryAttempts` and cron schedules
5. **Secure credentials**: Use environment variables for cloud provider credentials

## 🔍 Troubleshooting

### Collection Not Found

- Verify collection name spelling
- Check database name in connection string
- Ensure collection has documents

### No Data Generated

- Check timestamp field mapping
- Verify date ranges in your data
- Review cron schedule settings

### Performance Issues

- Add indexes on timestamp fields
- Adjust retry attempts
- Use appropriate batch sizes
