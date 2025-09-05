# 🎯 LogStack Dual Processing Guide

LogStack ab **dual processing modes** support کرتا ہے آپ کی flexibility کے لیے:

## 🔄 Processing Options

### Option 1: Store + Process Mode

```javascript
// LogStack database میں store ہوگا اور S3 پر بھی upload ہوگا
await logAppEvent("info", "User login", { userId: "123" });
```

**Features:**

- ✅ LogStack database میں store
- ✅ 14 days database retention
- ✅ S3 پر automatic upload
- ✅ 180 days S3 retention

### Option 2: Process-Only Mode

```javascript
// صرف S3 پر upload، LogStack database میں store نہیں ہوگا
await processExternalLogs(yourData, {
  skipDatabase: true,
  uploadToS3: true,
  customFolder: "your-logs",
});
```

**Features:**

- ❌ LogStack database میں store نہیں
- ✅ Direct S3 upload
- ✅ آپ کا existing data process
- ✅ Custom folder structure

## 📊 Usage Scenarios

| Use Case                    | Recommended Mode | Description            |
| --------------------------- | ---------------- | ---------------------- |
| **New Application**         | Store + Process  | Full LogStack features |
| **Existing Data Migration** | Process-Only     | Migrate existing logs  |
| **Real-time Analytics**     | Both Available   | Choose based on needs  |
| **Microservices**           | API Client Mode  | Different server setup |
| **Data Archival**           | Process-Only     | Just backup to S3      |

## 🚀 Quick Setup

### 1. Direct Integration (Same Server)

```bash
# Use production-setup.js
node production-setup.js
```

### 2. API Client (Different Server)

```bash
# Use api-client-setup.js
node api-client-setup.js
```

### 3. Test Examples

```bash
# See all options in action
node flexible-usage-examples.js

# Mock demo (no AWS needed)
node mock-demo.js
```

## 📁 File Structure

```
production-setup.js       # Direct integration setup
api-client-setup.js       # API client for microservices
flexible-usage-examples.js # All usage examples
mock-demo.js              # Demo without AWS
microservice-example.js   # Express.js integration
```

## 🌐 API Endpoints

### Store + Process

```javascript
POST /api/logstack/store-and-process
{
  "level": "info",
  "message": "User action",
  "metadata": { "userId": "123" }
}
```

### Process-Only

```javascript
POST /api/logstack/only-process
{
  "eventType": "purchase",
  "userId": "456",
  "amount": 100
}
```

### Real-time Processing

```javascript
POST /api/logstack/realtime
{
  "event": "live_data",
  "skipDatabase": false,
  "data": { ... }
}
```

## ⚙️ Configuration

### Environment Variables

```bash
# MongoDB
DB_URI=mongodb://localhost:27017/myapp

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name

# Collection Name
API_LOGS_COLLECTION_NAME=production_api_logs
```

### Retention Settings

```javascript
retentionDays: 14,        // Database retention
fileRetentionDays: 180,   // S3 retention
uploadToS3: true,         // Enable S3 upload
compression: true         // GZIP compression
```

## 🎯 Key Benefits

1. **Flexibility** - Choose storage vs processing based on needs
2. **Scalability** - API client mode for distributed systems
3. **Retention Management** - Automated cleanup (14 days DB, 180 days S3)
4. **Real-time Processing** - Immediate data processing capabilities
5. **Batch Processing** - Scheduled processing from existing collections
6. **Compression** - GZIP compression for efficient storage
7. **Monitoring** - Built-in health checks and error handling

## 🔧 Next Steps

1. **Configure AWS credentials** in `.env` file
2. **Choose your processing mode** (store+process or process-only)
3. **Setup production environment** using provided files
4. **Test with mock-demo.js** first
5. **Deploy to production** with real credentials

---

**📞 Support:** All features tested and ready for production use! 🚀
