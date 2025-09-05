# 🌐 LogStack API Client Setup Guide

Complete guide for setting up LogStack API Client that connects to LogStack server running on a different server.

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   Your App      │   ────────→    │  LogStack       │
│  (Client)       │                │  Server         │
│                 │                │                 │
│ - Express.js    │                │ - AWS S3        │
│ - Microservice  │                │ - MongoDB       │
│ - API Client    │                │ - Cron Jobs     │
└─────────────────┘                └─────────────────┘
```

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install node-fetch dotenv
```

### 2. Configure Environment Variables

Copy `api-client.env` to `.env` and update:

```bash
# LogStack Server (Different Server)
LOGSTACK_SERVER_URL=http://logstack-server:4000
LOGSTACK_API_KEY=your-secure-api-key

# Client Identification
CLIENT_ID=microservice-1
SERVICE_NAME=user-service

# Application
NODE_ENV=production
PORT=3000
```

### 3. Initialize API Client

```javascript
const { initializeLogStackClient } = require("./api-client-setup");

// Initialize with automatic configuration
await initializeLogStackClient();
```

## ⚙️ API Client Features

| Feature                  | Description                         | Benefit                  |
| ------------------------ | ----------------------------------- | ------------------------ |
| **🔄 Auto Retry**        | Exponential backoff retry logic     | Handles network failures |
| **📦 Offline Queue**     | Stores logs when server unavailable | No log loss              |
| **🔍 Health Monitoring** | Connection testing and status       | Real-time monitoring     |
| **⚡ Async Processing**  | Non-blocking API calls              | High performance         |
| **🔒 Authentication**    | API key based security              | Secure communication     |
| **📊 Enriched Logs**     | Auto-adds client metadata           | Better traceability      |

## 🔄 Configuration Options

### Basic Configuration

```javascript
const config = {
  // LogStack Server
  logstackServerUrl: "http://logstack-server:4000",
  apiKey: "your-secure-api-key",

  // Client Info
  clientId: "microservice-1",
  serviceName: "user-service",

  // Retry Logic
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
  },

  // Offline Queue
  offlineQueue: {
    enabled: true,
    maxSize: 1000,
    flushInterval: 30000, // 30 seconds
  },
};
```

### Advanced Configuration

```javascript
const config = {
  logstackServerUrl: process.env.LOGSTACK_SERVER_URL,
  apiKey: process.env.LOGSTACK_API_KEY,
  clientId: process.env.CLIENT_ID,
  serviceName: process.env.SERVICE_NAME,

  retry: {
    maxRetries: 5, // More retries for production
    retryDelay: 2000, // Longer initial delay
    backoffMultiplier: 3, // Faster backoff
  },

  offlineQueue: {
    enabled: true,
    maxSize: 5000, // Larger queue
    flushInterval: 15000, // More frequent flushing
  },

  timeout: 15000, // Longer timeout for slow networks
};
```

## 🔧 Usage Examples

### Express.js Integration

```javascript
const express = require("express");
const {
  initializeLogStackClient,
  logApiRequest,
  logAppEvent,
} = require("./api-client-setup");

const app = express();

// Initialize API Client
await initializeLogStackClient();

// Add automatic API logging
app.use(logApiRequest);

// Manual logging
app.post("/api/users", (req, res) => {
  const user = createUser(req.body);

  // Log via API call to LogStack server
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
const { runBackgroundJob } = require("./api-client-setup");

// Wrap your background jobs
async function processEmails() {
  await runBackgroundJob("email-processor", async () => {
    const emailsSent = await sendPendingEmails();
    return { emailsSent };
  });
}
```

### Manual Logging

```javascript
const { logAppEvent, logJob } = require("./api-client-setup");

// Log application events
await logAppEvent("info", "Payment processed", {
  service: "payment-service",
  amount: 100,
  currency: "USD",
});

// Log job status
await logJob("data-sync", "completed", {
  startTime: startTime,
  endTime: new Date(),
  recordsSynced: 1500,
});
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```javascript
const { healthCheck } = require('./api-client-setup');

app.get('/health', async (req, res) => {
  const health = await healthCheck();
  res.json(health);
});

// Response:
{
  "status": "healthy",
  "client": {
    "serviceName": "user-service",
    "clientId": "microservice-1",
    "offlineQueueSize": 0
  },
  "server": {
    "status": "healthy",
    "apiLogs": 45,
    "appLogs": 123
  },
  "lastCheck": "2025-09-04T10:30:00Z"
}
```

### Offline Queue Monitoring

```javascript
const {
  getOfflineQueueStatus,
  flushOfflineQueue,
} = require("./api-client-setup");

// Check queue status
app.get("/api/queue-status", (req, res) => {
  const status = getOfflineQueueStatus();
  res.json(status);
});

// Manual flush
app.post("/api/flush-queue", async (req, res) => {
  await flushOfflineQueue();
  res.json({ message: "Queue flushed" });
});
```

## 🚦 Deployment Scenarios

### Scenario 1: Microservices Architecture

```bash
# LogStack Server (Central)
docker run -p 4000:4000 logstack-server

# Microservice 1 (User Service)
CLIENT_ID=user-service SERVICE_NAME=user-service node microservice-example.js

# Microservice 2 (Order Service)
CLIENT_ID=order-service SERVICE_NAME=order-service node microservice-example.js

# Microservice 3 (Payment Service)
CLIENT_ID=payment-service SERVICE_NAME=payment-service node microservice-example.js
```

### Scenario 2: Multi-Environment Setup

```bash
# Production LogStack Server
LOGSTACK_SERVER_URL=https://logstack.prod.company.com

# Staging LogStack Server
LOGSTACK_SERVER_URL=https://logstack.staging.company.com

# Development LogStack Server
LOGSTACK_SERVER_URL=http://localhost:4000
```

### Scenario 3: Load Balanced Setup

```bash
# Multiple LogStack Servers behind Load Balancer
LOGSTACK_SERVER_URL=https://logstack-lb.company.com

# API clients automatically distribute load
```

## 🔒 Security Best Practices

### API Key Management

```javascript
// Use environment variables
apiKey: process.env.LOGSTACK_API_KEY;

// Rotate API keys regularly
// Use different keys per environment
// Monitor API key usage
```

### Network Security

```javascript
// HTTPS in production
logstackServerUrl: "https://logstack.company.com";

// VPN/Private networks
logstackServerUrl: "http://internal-logstack:4000";

// API rate limiting on server side
```

## 🔄 Offline Resilience

### Automatic Queue Management

```
📦 When LogStack server is unavailable:
├── Logs stored in local queue (up to 1000 items)
├── Queue processed every 30 seconds
├── Failed logs retried up to 3 times
└── Old logs dropped if queue is full
```

### Manual Queue Control

```javascript
// Check queue size
const status = getOfflineQueueStatus();
console.log(`Queue size: ${status.size}/${status.maxSize}`);

// Force flush queue
await flushOfflineQueue();
console.log("All queued logs sent to server");
```

## 📈 Performance Optimization

### Batch Processing

- Offline queue batches multiple logs
- Reduces API calls during high load
- Automatic retry with exponential backoff

### Async Operations

- Non-blocking API calls
- Background queue processing
- No impact on application performance

### Connection Pooling

- HTTP keep-alive connections
- Reduced connection overhead
- Better throughput

## 🆘 Troubleshooting

### Common Issues:

1. **Server Connection Failed**:

```bash
# Test server connectivity
curl http://logstack-server:4000/health
```

2. **API Authentication Failed**:

```bash
# Verify API key
curl -H "Authorization: Bearer your-api-key" http://logstack-server:4000/health
```

3. **Queue Not Processing**:

```javascript
// Check queue status
const status = getOfflineQueueStatus();
console.log("Queue enabled:", status.enabled);
console.log("Queue size:", status.size);
```

4. **High Memory Usage**:

```javascript
// Reduce queue size
offlineQueue: {
  maxSize: 500;
}

// Increase flush frequency
offlineQueue: {
  flushInterval: 10000;
}
```

## 📊 API Endpoints Reference

| Method | Endpoint        | Purpose               |
| ------ | --------------- | --------------------- |
| `POST` | `/api/logs`     | Send application logs |
| `POST` | `/api/api-logs` | Send API request logs |
| `POST` | `/api/jobs`     | Send job status logs  |
| `GET`  | `/api/logs`     | Retrieve logs         |
| `GET`  | `/health`       | Server health check   |

## 📞 Support

- 📚 [Complete Documentation](docs/)
- 🐛 [Report Issues](https://github.com/MetaDevZone/logstack/issues)
- 💬 [Community Support](https://github.com/MetaDevZone/logstack/discussions)

---

**🎉 Your microservice is now connected to centralized LogStack logging via REST API!**
