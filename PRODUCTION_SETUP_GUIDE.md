# 🌩️ LogStack Production Setup Guide

Complete guide for setting up LogStack with AWS S3, database retention, and automated processing.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install logstack dotenv
```

### 2. Configure Environment Variables

Copy `production.env` to `.env` and update with your values:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_actual_aws_access_key
AWS_SECRET_ACCESS_KEY=your_actual_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your-logs-bucket-name

# Database
DB_URI=mongodb://localhost:27017/myapp_production

# Application
NODE_ENV=production
PORT=3000
```

### 3. Initialize LogStack

```javascript
const { initializeLogStack } = require("./production-setup");

// Initialize with automatic configuration
await initializeLogStack();
```

## 📊 Configuration Summary

| Feature                | Setting            | Value                        |
| ---------------------- | ------------------ | ---------------------------- |
| **Database Retention** | Auto cleanup       | 14 days                      |
| **S3 File Retention**  | Long-term storage  | 180 days                     |
| **Cron Jobs**          | Hourly processing  | Every hour                   |
| **Daily Jobs**         | Database cleanup   | Midnight                     |
| **File Structure**     | Date-based folders | `2025/09/03/hour-14-15.json` |
| **Compression**        | GZIP enabled       | Level 6                      |
| **Data Masking**       | Security enabled   | Passwords, tokens            |

## 🔄 Automatic Processing

### Hourly Jobs (Every Hour)

```
✅ Process new logs
✅ Upload to S3 with date folders
✅ Compress files (GZIP)
✅ Create hourly files (hour-14-15.json)
```

### Daily Jobs (Midnight)

```
✅ Create new daily folder structure
✅ Database cleanup (remove 14+ day old records)
✅ Generate daily summary reports
```

### Weekly Jobs (Sunday 3 AM)

```
✅ S3 file cleanup (remove 180+ day old files)
✅ Generate weekly analytics
```

## 📁 File Structure on S3

```
your-s3-bucket/
└── production-logs/
    └── 2025/
        └── 09/
            └── 03/
                ├── hour-00-01.json.gz
                ├── hour-01-02.json.gz
                ├── hour-02-03.json.gz
                └── ...
            └── 04/
                ├── hour-00-01.json.gz
                └── ...
```

## 🔧 Usage Examples

### Express.js Integration

```javascript
const express = require("express");
const {
  initializeLogStack,
  logApiRequest,
  logAppEvent,
} = require("./production-setup");

const app = express();

// Initialize LogStack
await initializeLogStack();

// Add automatic API logging
app.use(logApiRequest);

// Manual logging
app.post("/api/users", (req, res) => {
  // Your business logic
  const user = createUser(req.body);

  // Log custom event
  logAppEvent("info", "User created", {
    service: "user-service",
    userId: user.id,
    email: user.email,
  });

  res.json(user);
});
```

### Background Jobs

```javascript
const { runBackgroundJob } = require("./production-setup");

// Wrap your background jobs for automatic logging
async function sendEmails() {
  await runBackgroundJob("email-sender", async () => {
    // Your email sending logic
    const emailsSent = await sendPendingEmails();
    return { emailsSent };
  });
}
```

### Manual Logging

```javascript
const { logAppEvent, logJob } = require("./production-setup");

// Log application events
await logAppEvent("info", "Payment processed", {
  service: "payment-service",
  amount: 100,
  currency: "USD",
  userId: "user123",
});

// Log job status
await logJob("data-backup", "completed", {
  startTime: startTime,
  endTime: new Date(),
  recordsBackedUp: 1500,
});
```

## 🏥 Health Monitoring

### Health Check Endpoint

```javascript
const { healthCheck } = require('./production-setup');

app.get('/health', async (req, res) => {
  const health = await healthCheck();
  res.json(health);
});

// Response:
{
  "status": "healthy",
  "apiLogs": 45,      // Last 24h API logs
  "appLogs": 123,     // Last 24h app logs
  "jobs": 12,         // Last 24h jobs
  "lastCheck": "2025-09-03T10:30:00Z"
}
```

### Manual Cleanup

```javascript
const { cleanupOldLogs } = require("./production-setup");

// Force cleanup if needed
const result = await cleanupOldLogs();
console.log(`Cleaned up ${result.dbCleanup.deleted} records`);
```

## 🚦 Running in Production

### Option 1: Direct Integration

```javascript
// In your main app.js
const {
  initializeLogStack,
  setupExpressLogging,
} = require("./production-setup");

async function startApp() {
  await initializeLogStack();
  setupExpressLogging(app);

  app.listen(3000);
}
```

### Option 2: Standalone Example

```bash
# Run the complete example
node express-example.js
```

### Option 3: PM2 Process Manager

```json
// ecosystem.config.js
{
  "apps": [
    {
      "name": "myapp-with-logstack",
      "script": "express-example.js",
      "env": {
        "NODE_ENV": "production"
      },
      "env_file": ".env"
    }
  ]
}
```

```bash
pm2 start ecosystem.config.js
```

## 📊 Monitoring & Alerts

### Set up alerts for:

- **High error rates** (5xx responses)
- **Slow response times** (>2 seconds)
- **Failed background jobs**
- **Storage quota warnings**

### Analytics queries:

```javascript
// Get error rate for last hour
const errors = await getApiLogs({
  startDate: new Date(Date.now() - 60 * 60 * 1000),
  responseStatus: { $gte: 500 },
});

// Get slow requests
const slowRequests = await getApiLogs({
  startDate: new Date(Date.now() - 60 * 60 * 1000),
  responseTime: { $gte: 2000 },
});
```

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit AWS keys to git
2. **Data Masking**: Enabled for passwords, tokens, credit cards
3. **Access Control**: Use IAM roles for S3 access
4. **Encryption**: S3 server-side encryption enabled
5. **Network Security**: VPC and security groups configured

## 💰 Cost Optimization

### Database (MongoDB)

- **14-day retention** keeps database lean
- **Automatic cleanup** prevents storage bloat
- **Indexed queries** for fast retrieval

### S3 Storage

- **GZIP compression** saves 60-80% space
- **180-day retention** for compliance
- **Lifecycle policies** for automatic cleanup
- **Intelligent Tiering** for cost savings

## 🆘 Troubleshooting

### Common Issues:

1. **AWS Permissions**:

```bash
# Test S3 access
aws s3 ls s3://your-bucket-name
```

2. **Database Connection**:

```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/myapp_production"
```

3. **Cron Jobs Not Running**:

```javascript
// Check cron status
console.log("Cron jobs active:", process.env.NODE_ENV !== "test");
```

4. **File Upload Failures**:

```javascript
// Enable debug logging
process.env.DEBUG = "logstack:*";
```

## 📞 Support

- 📚 [Complete Documentation](docs/)
- 🐛 [Report Issues](https://github.com/MetaDevZone/logstack/issues)
- 💬 [Community Support](https://github.com/MetaDevZone/logstack/discussions)

---

**🎉 Your production logging is now fully automated with AWS S3 and intelligent retention policies!**
