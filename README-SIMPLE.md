# 🌩️ LogStack

**Complete Node.js logging solution** with multiple integration methods, cloud storage, and advanced analytics.

[![npm version](https://badge.fury.io/js/logstack.svg)](https://www.npmjs.com/package/logstack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

## ✨ Key Features

- **🔄 Multiple Integration Methods**: Embedded, REST API, Kafka, Redis, RabbitMQ, WebSocket
- **☁️ Multi-Cloud Storage**: AWS S3, Google Cloud, Azure, Local files
- **📥 S3 Bidirectional Operations**: Upload to and download from S3
- **📊 Advanced Analytics**: Real-time monitoring and comprehensive reports
- **⚡ High Performance**: Handles 10,000+ logs/second
- **🔒 Enterprise Security**: Data masking, encryption, retention policies
- **🎯 TypeScript Support**: Full type safety and IntelliSense

## 🚀 Quick Start

### Installation

```bash
npm install logstack
```

### Basic Usage

```javascript
const logstack = require("logstack");

// Initialize
await logstack.init({
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "s3", // or 'local', 'gcs', 'azure'
});

// Log API requests
await logstack.saveApiLog({
  method: "GET",
  path: "/api/users",
  responseStatus: 200,
  request_time: new Date(),
  response_time: new Date(),
});

// Log application events
await logstack.saveLog({
  level: "info",
  message: "User login successful",
  service: "auth-service",
});
```

## 🔄 Integration Methods

| Method           | Best For        | Setup                       |
| ---------------- | --------------- | --------------------------- |
| **🔗 Embedded**  | Single apps     | `require('logstack')`       |
| **🌐 REST API**  | Multi-language  | `npm run service:api`       |
| **📨 Kafka**     | High volume     | `npm run service:kafka`     |
| **⚡ Redis**     | Real-time       | `npm run service:redis`     |
| **🐰 RabbitMQ**  | Enterprise      | `npm run service:rabbitmq`  |
| **🔄 WebSocket** | Live dashboards | `npm run service:websocket` |

### REST API Example

```bash
# Start server
npm run service:api

# Send logs
curl -X POST http://localhost:4000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"Hello LogStack"}'
```

## 🌟 Advanced Features

### S3 Operations

```javascript
const { LogStackAdvanced } = require("logstack/lib/advancedFeatures");
const advanced = new LogStackAdvanced(config);

// Download logs from S3
const files = await advanced.downloadDateRange("2025-01-01", "2025-01-31");

// Search archived logs
const errors = await advanced.searchS3({ responseStatus: /^5\d{2}$/ });

// Generate analytics
const analytics = await advanced.generateAnalytics({
  start: "2025-01-01T00:00:00Z",
  end: "2025-01-31T23:59:59Z",
});
```

### Multi-Service CLI

```bash
# Start specific services
npm run service:api       # REST API server
npm run service:kafka     # Kafka consumer
npm run service:websocket # WebSocket server
npm run service:multi     # All services

# With custom options
node examples/multi-service-cli.js api --port 4000
node examples/multi-service-cli.js kafka --brokers localhost:9092
```

## ⚙️ Configuration

### Basic Configuration

```javascript
await logstack.init({
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "s3",
  outputDirectory: "production-logs",

  // S3 Configuration
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
    bucket: "my-logs-bucket",
  },

  // Security & Performance
  compression: { enabled: true },
  dataMasking: { enabled: true, fields: ["password", "token"] },
  retention: { enabled: true, days: 90 },
});
```

### Framework Integration

#### Express.js

```javascript
const express = require("express");
const logstack = require("logstack");

const app = express();
await logstack.init(config);

// Automatic API logging middleware
app.use(async (req, res, next) => {
  const start = new Date();
  res.on("finish", async () => {
    await logstack.saveApiLog({
      method: req.method,
      path: req.path,
      responseStatus: res.statusCode,
      request_time: start,
      response_time: new Date(),
    });
  });
  next();
});
```

#### Other Frameworks

- **NestJS**: Full TypeScript integration
- **Fastify**: High-performance logging
- **Koa**: Middleware support
- **Next.js**: API routes logging

## 📊 Storage Options

| Provider            | Best For            | Setup                     |
| ------------------- | ------------------- | ------------------------- |
| **📁 Local**        | Development         | `uploadProvider: 'local'` |
| **☁️ AWS S3**       | Production          | `uploadProvider: 's3'`    |
| **🌐 Google Cloud** | GCP environments    | `uploadProvider: 'gcs'`   |
| **💙 Azure**        | Microsoft ecosystem | `uploadProvider: 'azure'` |

## 🎯 Use Cases

### Startup/Small Apps

```javascript
// Simple setup
await logstack.init();
await logstack.saveLog({ level: "info", message: "App started" });
```

### Enterprise/High Scale

```javascript
// Full configuration
await logstack.init({
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",
  integrations: {
    kafka: { brokers: ["kafka1:9092", "kafka2:9092"] },
    redis: { host: "redis-cluster", port: 6379 },
  },
  dataMasking: { enabled: true },
  retention: { days: 365 },
});
```

## 📚 Documentation

### Quick References

- **[📋 Features Summary](FEATURES_SUMMARY.md)** - Quick decision guide
- **[🌩️ Complete Guide](COMPLETE_FEATURES_GUIDE.md)** - Detailed features
- **[🚀 Examples](examples/)** - Practical code examples

### Setup Guides

- **[🚀 Step-by-Step Setup](docs/COMPLETE_STEP_BY_STEP_GUIDE.md)**
- **[☁️ AWS S3 Setup](docs/AWS_SETUP_GUIDE.md)**
- **[🧪 Testing Guide](docs/TESTING_GUIDE.md)**

### Advanced Topics

- **[🔧 Custom Collections](docs/CUSTOM_COLLECTIONS.md)**
- **[🗑️ Log Retention](docs/LOG_RETENTION_GUIDE.md)**
- **[📊 Multi-Database Setup](docs/MULTI_DATABASE_TYPE_SETUP_GUIDE.md)**

## 🚦 Performance

| Metric          | Performance         |
| --------------- | ------------------- |
| **Throughput**  | 10,000+ logs/second |
| **Storage**     | 60-80% compression  |
| **Reliability** | 99.9% uptime        |
| **Scalability** | Unlimited (cloud)   |

## 🤝 Support

- 📚 [Full Documentation](docs/)
- 🐛 [Report Issues](https://github.com/MetaDevZone/logstack/issues)
- 💬 [Discussions](https://github.com/MetaDevZone/logstack/discussions)
- 📧 [Contact](mailto:support@metadevzone.com)

## 📄 License

MIT License

---

**🎉 LogStack - Making logging simple, scalable, and secure for every Node.js application!**
