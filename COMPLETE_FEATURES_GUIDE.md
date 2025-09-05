# 🌩️ LogStack Complete Features Guide

> **A comprehensive guide to all features and services provided by LogStack - the ultimate Node.js logging solution**

---

## 📖 Table of Contents

1. [🎯 Package Overview](#-package-overview)
2. [🚀 Core Services](#-core-services)
3. [🔄 Integration Methods](#-integration-methods)
4. [📦 Storage Providers](#-storage-providers)
5. [🌐 Advanced Features](#-advanced-features)
6. [🔧 Configuration Options](#-configuration-options)
7. [📊 Monitoring & Analytics](#-monitoring--analytics)
8. [🛠️ CLI Tools](#%EF%B8%8F-cli-tools)
9. [🔍 Real-time Features](#-real-time-features)
10. [📚 Usage Examples](#-usage-examples)

---

## 🎯 Package Overview

### What is LogStack?

LogStack is a **reusable, configurable log processing and storage service** for Node.js applications that provides:

- ✅ **Multi-provider storage** (Local, AWS S3, Google Cloud, Azure)
- ✅ **6 different integration methods** (Embedded, REST API, Kafka, Redis, RabbitMQ, WebSocket)
- ✅ **Real-time log processing** with cron scheduling
- ✅ **Advanced analytics and monitoring**
- ✅ **Bidirectional S3 operations** (upload/download)
- ✅ **Production-ready** with compression, masking, and retention
- ✅ **Framework-agnostic** (Express, Fastify, Koa, etc.)

### Key Benefits

| Feature                   | Benefit                                        |
| ------------------------- | ---------------------------------------------- |
| **Zero Configuration**    | Works out-of-the-box with sensible defaults    |
| **Scalable Architecture** | Handles millions of logs efficiently           |
| **Multiple Integrations** | Choose the best method for your use case       |
| **Cloud-Native**          | First-class AWS/GCP/Azure support              |
| **Real-time Processing**  | Immediate log processing and alerts            |
| **Production Ready**      | Built-in security, compression, and monitoring |

---

## 🚀 Core Services

### 1. **API Log Service** 📡

```javascript
const { saveApiLog, getApiLogs } = require("logstack/src/apiLogs");

// Automatically capture HTTP requests/responses
await saveApiLog({
  method: "GET",
  path: "/api/users",
  responseStatus: 200,
  request_time: new Date(),
  response_time: new Date(),
  client_ip: "192.168.1.100",
  requestHeaders: { "user-agent": "mobile-app" },
  responseBody: { users: [] },
});
```

**Features:**

- ✅ HTTP request/response logging
- ✅ Automatic timestamp tracking
- ✅ Client IP and user agent capture
- ✅ Request/response body storage
- ✅ Status code monitoring

### 2. **Job Processing Service** ⚙️

```javascript
const { saveJob, getJobs } = require("logstack/src/jobs");

// Track background jobs and processes
await saveJob({
  jobName: "email-sender",
  status: "completed",
  startTime: new Date(),
  endTime: new Date(),
  metadata: { emailsSent: 150 },
});
```

**Features:**

- ✅ Background job tracking
- ✅ Status monitoring (pending, running, completed, failed)
- ✅ Execution time measurement
- ✅ Custom metadata storage
- ✅ Job failure analysis

### 3. **General Log Service** 📝

```javascript
const { saveLog, getLogs } = require("logstack/src/logs");

// Store any type of application logs
await saveLog({
  level: "error",
  message: "Database connection failed",
  service: "user-service",
  metadata: { retryCount: 3, errorCode: "DB_TIMEOUT" },
});
```

**Features:**

- ✅ Multi-level logging (debug, info, warn, error, fatal)
- ✅ Service-based categorization
- ✅ Structured metadata
- ✅ Custom log formatting
- ✅ Log filtering and search

---

## 🔄 Integration Methods

### 1. **Embedded Integration** 🔗

_Direct integration within your application_

```javascript
const logstack = require("logstack");

// Initialize once in your app
await logstack.init({
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "s3",
});

// Use anywhere in your code
await logstack.saveApiLog(requestData);
```

**Best For:** Single applications, microservices, simple setups

### 2. **REST API Integration** 🌐

_HTTP-based logging service_

```bash
# Start the LogStack server
npm run server

# Send logs via HTTP
curl -X POST http://localhost:4000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"User logged in"}'
```

**Endpoints:**

- `POST /api/logs` - Save general logs
- `POST /api/api-logs` - Save API logs
- `POST /api/jobs` - Save job logs
- `GET /api/logs` - Retrieve logs
- `GET /api/analytics` - Get analytics

**Best For:** Distributed systems, multiple services, language-agnostic logging

### 3. **Kafka Integration** 📨

_High-throughput message streaming_

```javascript
// Producer (your app)
const kafka = require("kafkajs").kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});
const producer = kafka.producer();
await producer.send({
  topic: "logstack-logs",
  messages: [{ value: JSON.stringify(logData) }],
});

// Consumer (LogStack automatically processes)
// No additional code needed - LogStack handles consumption
```

**Best For:** High-volume logging, event-driven architectures, microservices

### 4. **Redis Integration** ⚡

_Fast in-memory message queuing_

```javascript
const redis = require("redis");
const client = redis.createClient();

// Push logs to Redis queue
await client.lpush("logstack:queue", JSON.stringify(logData));

// LogStack automatically processes the queue
```

**Best For:** High-performance logging, caching integration, real-time processing

### 5. **RabbitMQ Integration** 🐰

_Reliable message queuing_

```javascript
const amqp = require("amqplib");
const connection = await amqp.connect("amqp://localhost");
const channel = await connection.createChannel();

// Send logs to RabbitMQ
await channel.sendToQueue(
  "logstack.logs",
  Buffer.from(JSON.stringify(logData))
);

// LogStack automatically consumes and processes
```

**Best For:** Enterprise systems, guaranteed delivery, complex routing

### 6. **WebSocket Integration** 🔄

_Real-time bidirectional communication_

```javascript
const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:4000/ws");

// Send real-time logs
ws.send(
  JSON.stringify({
    type: "log",
    data: { level: "info", message: "Real-time event" },
  })
);

// Receive real-time updates
ws.on("message", (data) => {
  const update = JSON.parse(data);
  console.log("Log processed:", update);
});
```

**Best For:** Real-time dashboards, live monitoring, interactive applications

---

## 📦 Storage Providers

### 1. **Local File System** 📁

```javascript
{
  uploadProvider: 'local',
  outputDirectory: './logs',
  fileFormat: 'json' // or 'csv'
}
```

**Features:**

- ✅ No external dependencies
- ✅ Fast local access
- ✅ Automatic file rotation
- ✅ Compressed storage (gzip)

### 2. **AWS S3** ☁️

```javascript
{
  uploadProvider: 's3',
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
    bucket: 'my-logs-bucket'
  }
}
```

**Features:**

- ✅ Unlimited scalability
- ✅ 99.999999999% durability
- ✅ Automatic encryption
- ✅ Lifecycle management
- ✅ **Bidirectional operations** (upload/download)

### 3. **Google Cloud Storage** 🌐

```javascript
{
  uploadProvider: 'gcs',
  gcs: {
    projectId: 'my-project',
    keyFilename: './service-account.json',
    bucket: 'my-logs-bucket'
  }
}
```

### 4. **Azure Blob Storage** 💙

```javascript
{
  uploadProvider: 'azure',
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: 'logs'
  }
}
```

---

## 🌐 Advanced Features

### 1. **S3 Download & Sync Features** 📥

```javascript
const { LogStackAdvanced } = require("logstack/lib/advancedFeatures");
const advanced = new LogStackAdvanced(config);

// List S3 files by date range
const files = await advanced.listS3Files("2025-01-01", "2025-01-31");

// Download specific date range
const downloaded = await advanced.downloadDateRange(
  "2025-01-01",
  "2025-01-07",
  "./backup"
);

// Search logs in S3
const errorLogs = await advanced.searchS3(
  { responseStatus: /^5\d{2}$/ }, // 5xx errors
  { startDate: "2025-01-01", endDate: "2025-01-31" }
);

// Sync S3 logs back to database
const syncResult = await advanced.syncS3ToDb("2025-01-01", "2025-01-31", {
  allowDuplicates: false,
});
```

**Use Cases:**

- 📊 **Backup Analysis**: Download logs for offline analysis
- 🔄 **Disaster Recovery**: Restore logs from S3 to database
- 🔍 **Historical Search**: Search through archived logs
- 📈 **Data Migration**: Move logs between environments

### 2. **Bulk Database Operations** 📊

```javascript
// Bulk insert thousands of logs efficiently
const logs = [
  /* thousands of logs */
];
const result = await advanced.bulkInsert(logs, { batchSize: 1000 });

// Advanced search with grouping and filtering
const searchResult = await advanced.advancedSearch({
  dateRange: {
    start: "2025-01-01T00:00:00Z",
    end: "2025-01-31T23:59:59Z",
  },
  statusCodes: [200, 201, 404, 500],
  responseTimeRange: { min: 0, max: 1000 },
  groupBy: "path",
  limit: 5000,
});

// Generate comprehensive analytics
const analytics = await advanced.generateAnalytics({
  start: "2025-01-01T00:00:00Z",
  end: "2025-01-31T23:59:59Z",
});
```

### 3. **Data Security & Privacy** 🔒

```javascript
{
  // Data masking for sensitive information
  dataMasking: {
    enabled: true,
    fields: ['password', 'creditCard', 'ssn'],
    maskChar: '*',
    preserveLength: true
  },

  // Request/response compression
  compression: {
    enabled: true,
    algorithm: 'gzip',
    level: 6
  },

  // Automatic log retention
  retention: {
    enabled: true,
    days: 90,
    cleanupSchedule: '0 2 * * 0' // Weekly cleanup
  }
}
```

---

## 🔧 Configuration Options

### Complete Configuration Example

```javascript
const config = {
  // Database Configuration
  dbUri: "mongodb://localhost:27017/myapp",

  // Storage Provider
  uploadProvider: "s3", // 'local', 's3', 'gcs', 'azure'

  // Output Settings
  outputDirectory: "production-logs",
  fileFormat: "json", // 'json', 'csv'

  // Collection Names
  collections: {
    apiLogsCollectionName: "api_logs",
    logsCollectionName: "application_logs",
    jobsCollectionName: "background_jobs",
  },

  // Cron Scheduling
  cron: {
    dailyCron: "0 0 * * *", // Midnight daily
    hourlyCron: "0 * * * *", // Every hour
    timezone: "UTC",
  },

  // AWS S3 Configuration
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
    bucket: "my-production-logs",
  },

  // Security & Privacy
  dataMasking: {
    enabled: true,
    fields: ["password", "token", "creditCard"],
    maskChar: "*",
  },

  // Performance
  compression: {
    enabled: true,
    algorithm: "gzip",
    level: 6,
  },

  // Retention Policy
  retention: {
    enabled: true,
    days: 90,
    cleanupSchedule: "0 2 * * 0",
  },

  // Integration Settings
  integrations: {
    kafka: {
      brokers: ["localhost:9092"],
      topic: "application-logs",
    },
    redis: {
      host: "localhost",
      port: 6379,
      queueName: "logstack:queue",
    },
    rabbitmq: {
      url: "amqp://localhost",
      queue: "logstack.logs",
    },
    websocket: {
      port: 4000,
      path: "/ws",
    },
  },
};
```

---

## 📊 Monitoring & Analytics

### 1. **Real-time Analytics** 📈

```javascript
// Get comprehensive analytics
const analytics = await advanced.generateAnalytics({
  start: "2025-01-01T00:00:00Z",
  end: "2025-01-31T23:59:59Z",
});

console.log("Analytics Report:", {
  totalRequests: analytics.summary.totalRequests,
  averageResponseTime: analytics.responseTimeStats.avg,
  topEndpoints: analytics.topEndpoints,
  statusCodeDistribution: analytics.statusCodes,
  peakHours: analytics.hourlyDistribution,
});
```

### 2. **Health Monitoring** 🏥

```javascript
// Monitor API health
const healthCheck = await advanced.advancedSearch({
  dateRange: {
    start: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Last hour
    end: new Date().toISOString(),
  },
  statusCodes: [500, 502, 503, 504], // Server errors
});

if (healthCheck.total > 0) {
  console.log(`⚠️ Found ${healthCheck.total} server errors in the last hour!`);
  // Send alerts, notifications, etc.
}
```

### 3. **Performance Analysis** ⚡

```javascript
// Find slow endpoints
const slowEndpoints = await advanced.advancedSearch({
  responseTimeRange: {
    min: 1000, // > 1 second
    max: Infinity,
  },
  groupBy: "path",
});

console.log("Slow Endpoints:", slowEndpoints.grouped);
```

---

## 🛠️ CLI Tools

### Available Commands

```bash
# Initialize LogStack configuration
npx logstack init-config

# Start different service modes
npm run service:api       # REST API server
npm run service:kafka     # Kafka consumer
npm run service:redis     # Redis queue processor
npm run service:rabbitmq  # RabbitMQ consumer
npm run service:websocket # WebSocket server
npm run service:multi     # Multiple services

# Development & Testing
npm run server:dev        # Development server
npm run server:prod       # Production server
npm run test             # Run test suite
npm run build            # Build TypeScript
```

### Multi-Service CLI

```bash
# Start specific integration
node examples/multi-service-cli.js api --port 4000
node examples/multi-service-cli.js kafka --brokers localhost:9092
node examples/multi-service-cli.js redis --host localhost --port 6379
node examples/multi-service-cli.js rabbitmq --url amqp://localhost
node examples/multi-service-cli.js websocket --port 4000

# Get help
node examples/multi-service-cli.js help
```

---

## 🔍 Real-time Features

### 1. **Live Log Streaming** 📡

```javascript
// WebSocket real-time logging
const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:4000/ws");

// Stream logs in real-time
ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "subscribe",
      filters: { level: "error" }, // Only error logs
    })
  );
});

ws.on("message", (data) => {
  const logUpdate = JSON.parse(data);
  console.log("New error log:", logUpdate);
});
```

### 2. **Automated Cron Processing** ⏰

```javascript
// Automatic hourly and daily processing
{
  cron: {
    dailyCron: '0 0 * * *',    // Process daily at midnight
    hourlyCron: '0 * * * *',   // Process hourly
    timezone: 'UTC'
  }
}

// Custom cron schedules
{
  cron: {
    customSchedules: [
      {
        schedule: '*/15 * * * *', // Every 15 minutes
        action: 'process_realtime_alerts'
      },
      {
        schedule: '0 */6 * * *',  // Every 6 hours
        action: 'generate_analytics'
      }
    ]
  }
}
```

### 3. **Event-Driven Processing** ⚡

```javascript
// Automatic processing with different queue systems
const integrations = {
  kafka: {
    autoConsume: true,
    topics: ["logs", "errors", "metrics"],
    processingMode: "real-time",
  },
  redis: {
    autoProcess: true,
    queues: ["logs:high", "logs:normal", "logs:low"],
    concurrency: 10,
  },
  rabbitmq: {
    autoConsume: true,
    exchanges: ["logs.direct", "logs.fanout"],
    prefetch: 100,
  },
};
```

---

## 📚 Usage Examples

### 1. **Express.js Integration** 🚀

```javascript
const express = require("express");
const logstack = require("logstack");

const app = express();

// Initialize LogStack
await logstack.init({
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "s3",
});

// Middleware for automatic API logging
app.use(async (req, res, next) => {
  const startTime = new Date();

  res.on("finish", async () => {
    await logstack.saveApiLog({
      method: req.method,
      path: req.path,
      responseStatus: res.statusCode,
      request_time: startTime,
      response_time: new Date(),
      client_ip: req.ip,
      requestHeaders: req.headers,
      requestBody: req.body,
    });
  });

  next();
});

app.listen(3000);
```

### 2. **Microservices Architecture** 🏗️

```javascript
// Service A (User Service)
const logstack = require("logstack");
await logstack.init({
  dbUri: "mongodb://localhost:27017/users",
  uploadProvider: "s3",
  collections: { apiLogsCollectionName: "user_api_logs" },
});

// Service B (Order Service)
await logstack.init({
  dbUri: "mongodb://localhost:27017/orders",
  uploadProvider: "s3",
  collections: { apiLogsCollectionName: "order_api_logs" },
});

// Centralized Log Aggregation via Kafka
const kafka = require("kafkajs").kafka({
  clientId: "logstack-aggregator",
  brokers: ["localhost:9092"],
});

// All services send logs to Kafka topic
// LogStack automatically aggregates and processes
```

### 3. **Background Job Monitoring** ⚙️

```javascript
const logstack = require("logstack");

// Job processing with automatic logging
async function processEmailQueue() {
  const jobId = `email-job-${Date.now()}`;
  const startTime = new Date();

  try {
    await logstack.saveJob({
      jobId,
      jobName: "email-queue-processor",
      status: "running",
      startTime,
    });

    // Process emails...
    const emailsSent = await sendPendingEmails();

    await logstack.saveJob({
      jobId,
      jobName: "email-queue-processor",
      status: "completed",
      startTime,
      endTime: new Date(),
      metadata: { emailsSent },
    });
  } catch (error) {
    await logstack.saveJob({
      jobId,
      jobName: "email-queue-processor",
      status: "failed",
      startTime,
      endTime: new Date(),
      error: error.message,
    });
  }
}
```

### 4. **Real-time Dashboard** 📊

```javascript
// Real-time log dashboard using WebSocket
const WebSocket = require("ws");
const express = require("express");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });

// Connect to LogStack WebSocket
const logstackWS = new WebSocket("ws://localhost:4000/ws");

// Forward real-time logs to dashboard clients
logstackWS.on("message", (data) => {
  const logUpdate = JSON.parse(data);

  // Broadcast to all connected dashboard clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "log-update",
          data: logUpdate,
        })
      );
    }
  });
});

server.listen(8080);
```

---

## 🚦 Quick Start Guide

### 1. **Installation**

```bash
npm install logstack
```

### 2. **Basic Setup**

```javascript
const logstack = require("logstack");

await logstack.init({
  dbUri: "mongodb://localhost:27017/myapp",
});

// Start logging!
await logstack.saveLog({
  level: "info",
  message: "Application started successfully",
  service: "main",
});
```

### 3. **Production Setup**

```javascript
await logstack.init({
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.S3_BUCKET,
  },
  compression: { enabled: true },
  dataMasking: { enabled: true },
  retention: { enabled: true, days: 90 },
});
```

---

## 🎯 Best Practices

### 1. **Performance Optimization**

- ✅ Use bulk operations for high-volume logging
- ✅ Enable compression for storage efficiency
- ✅ Implement proper retention policies
- ✅ Use appropriate integration method for your scale

### 2. **Security**

- ✅ Enable data masking for sensitive fields
- ✅ Use environment variables for credentials
- ✅ Implement proper access controls
- ✅ Enable encryption at rest and in transit

### 3. **Monitoring**

- ✅ Set up real-time alerts for errors
- ✅ Monitor log volume and performance
- ✅ Regular analytics review
- ✅ Implement health checks

### 4. **Scalability**

- ✅ Use message queues for high throughput
- ✅ Implement horizontal scaling
- ✅ Use cloud storage for unlimited capacity
- ✅ Optimize database indexes

---

## 🆘 Support & Resources

### Documentation

- 📖 [Complete Step-by-Step Guide](./COMPLETE_STEP_BY_STEP_GUIDE.md)
- 🔧 [AWS Implementation Guide](./AWS_IMPLEMENTATION_READY.md)
- 🧪 [Testing Guide](./APILOGS_TESTING_GUIDE.md)
- 📋 [Usage Guide](./COMPLETE_USAGE_GUIDE.md)

### Examples

- 💡 [Basic Examples](./examples/)
- 🚀 [Advanced Features](./examples/advancedFeaturesExample.js)
- 🌐 [Multi-Service CLI](./examples/multi-service-cli.js)

### Community

- 🐛 [Report Issues](https://github.com/MetaDevZone/logstack/issues)
- 💬 [Discussions](https://github.com/MetaDevZone/logstack/discussions)
- 📧 [Contact Support](mailto:support@metadevzone.com)

---

**🎉 LogStack - Making logging simple, scalable, and secure for every Node.js application!**
