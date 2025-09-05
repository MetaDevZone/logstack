# 🚀 Node.js Implementation Guide - Cron Log Service

Complete implementation examples for Node.js projects using CommonJS and ES modules.

## 📋 Table of Contents

1. [CommonJS Implementation](#commonjs-implementation-nodejs)
2. [ES Modules Implementation](#es-modules-implementation-modern-nodejs)
3. [Express.js Integration](#expressjs-integration)
4. [Complete Project Setup](#complete-project-setup)
5. [Production Deployment](#production-deployment)
6. [Environment Configuration](#environment-configuration)

---

## 🟡 CommonJS Implementation (Node.js)

### Step 1: Install Dependencies

```bash
npm install logstack mongodb dotenv
npm install --save-dev @types/node
```

### Step 2: Basic Setup (`app.js`)

```javascript
const {
  init,
  createDailyJobs,
  processSpecificHour,
} = require("logstack");
require("dotenv").config();

// Configuration
const config = {
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp",
  uploadProvider: "local",
  fileFormat: "json",

  // ✨ Keep files organized
  outputDirectory: "api-logs",

  // ✨ Avoid database conflicts
  collections: {
    jobsCollectionName: "myapp_jobs",
    logsCollectionName: "myapp_logs",
  },

  logging: {
    level: "info",
    enableConsole: true,
  },
};

// Initialize service
async function startCronService() {
  try {
    console.log("🚀 Starting cron log service...");
    await init(config);
    console.log("✅ Cron log service initialized successfully");
    console.log("📁 Files will be saved to: ./api-logs/");
    console.log("🗃️  Using collections: myapp_jobs, myapp_logs");
  } catch (error) {
    console.error("❌ Failed to initialize cron service:", error);
    process.exit(1);
  }
}

// Test the service
async function testService() {
  try {
    console.log("🧪 Testing cron service...");

    // Create daily jobs
    const job = await createDailyJobs("2025-08-25", config);
    console.log(`✅ Created job with ${job.hours.length} hour slots`);

    // Process a specific hour
    await processSpecificHour("2025-08-25", 14, config);
    console.log("✅ Processed hour 14-15");
    console.log("📁 Check ./api-logs/2025-08-25/14-15.json");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Start the service
startCronService()
  .then(() => {
    console.log("🎉 Service ready!");

    // Optionally run test
    if (process.argv.includes("--test")) {
      return testService();
    }
  })
  .catch(console.error);

module.exports = { config, startCronService, testService };
```

### Step 3: Environment Configuration (`.env`)

```env
# Database
DB_URI=mongodb://localhost:27017/myapp

# Service Configuration
OUTPUT_DIR=api-logs
JOBS_COLLECTION=myapp_jobs
LOGS_COLLECTION=myapp_logs

# Development/Production
NODE_ENV=development

# Cloud Storage (for production)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=myapp-logs
```

### Step 4: Environment-Based Configuration (`config.js`)

```javascript
require("dotenv").config();

function createConfig() {
  const env = process.env.NODE_ENV || "development";
  const appName = "myapp"; // Change this to your app name

  const baseConfig = {
    dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp",
    fileFormat: "json",
    outputDirectory: process.env.OUTPUT_DIR || `${appName}-${env}-logs`,
    collections: {
      jobsCollectionName:
        process.env.JOBS_COLLECTION || `${appName}_${env}_jobs`,
      logsCollectionName:
        process.env.LOGS_COLLECTION || `${appName}_${env}_logs`,
    },
    logging: {
      level: env === "production" ? "warn" : "info",
      enableConsole: true,
      enableFile: env === "production",
    },
  };

  if (env === "production") {
    return {
      ...baseConfig,
      uploadProvider: "s3",
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || "us-east-1",
        bucket: process.env.S3_BUCKET,
      },
    };
  }

  return {
    ...baseConfig,
    uploadProvider: "local",
  };
}

module.exports = { createConfig };
```

### Step 5: Run Your Application

```bash
# Development
node app.js

# With testing
node app.js --test

# Production
NODE_ENV=production node app.js
```

---

## 🟢 ES Modules Implementation (Modern Node.js)

### Step 1: Package.json Setup

```json
{
  "name": "my-cron-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "node app.js --test",
    "prod": "NODE_ENV=production node app.js"
  },
  "dependencies": {
    "logstack": "latest",
    "mongodb": "^6.0.0",
    "dotenv": "^16.0.0"
  }
}
```

### Step 2: ES Modules Setup (`app.js`)

```javascript
import { init, createDailyJobs, processSpecificHour } from "logstack";
import dotenv from "dotenv";

dotenv.config();

// Configuration
const config = {
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp",
  uploadProvider: "local",
  fileFormat: "json",

  // ✨ Keep files organized
  outputDirectory: "api-logs",

  // ✨ Avoid database conflicts
  collections: {
    jobsCollectionName: "myapp_jobs",
    logsCollectionName: "myapp_logs",
  },

  logging: {
    level: "info",
    enableConsole: true,
  },
};

// Initialize service
async function startCronService() {
  try {
    console.log("🚀 Starting cron log service...");
    await init(config);
    console.log("✅ Cron log service initialized successfully");
    console.log("📁 Files will be saved to: ./api-logs/");
    console.log("🗃️  Using collections: myapp_jobs, myapp_logs");
  } catch (error) {
    console.error("❌ Failed to initialize cron service:", error);
    process.exit(1);
  }
}

// Test the service
async function testService() {
  try {
    console.log("🧪 Testing cron service...");

    // Create daily jobs
    const job = await createDailyJobs("2025-08-25", config);
    console.log(`✅ Created job with ${job.hours.length} hour slots`);

    // Process a specific hour
    await processSpecificHour("2025-08-25", 14, config);
    console.log("✅ Processed hour 14-15");
    console.log("📁 Check ./api-logs/2025-08-25/14-15.json");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Start the service
async function main() {
  await startCronService();

  console.log("🎉 Service ready!");

  // Optionally run test
  if (process.argv.includes("--test")) {
    await testService();
  }
}

main().catch(console.error);

export { config, startCronService, testService };
```

### Step 3: Environment-Based Configuration (`config.js`)

```javascript
import dotenv from "dotenv";
dotenv.config();

export function createConfig() {
  const env = process.env.NODE_ENV || "development";
  const appName = "myapp"; // Change this to your app name

  const baseConfig = {
    dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp",
    fileFormat: "json",
    outputDirectory: process.env.OUTPUT_DIR || `${appName}-${env}-logs`,
    collections: {
      jobsCollectionName:
        process.env.JOBS_COLLECTION || `${appName}_${env}_jobs`,
      logsCollectionName:
        process.env.LOGS_COLLECTION || `${appName}_${env}_logs`,
    },
    logging: {
      level: env === "production" ? "warn" : "info",
      enableConsole: true,
      enableFile: env === "production",
    },
  };

  if (env === "production") {
    return {
      ...baseConfig,
      uploadProvider: "s3",
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || "us-east-1",
        bucket: process.env.S3_BUCKET,
      },
    };
  }

  return {
    ...baseConfig,
    uploadProvider: "local",
  };
}
```

---

## 🌐 Express.js Integration

### CommonJS Express App (`server.js`)

```javascript
const express = require("express");
const { init, setupRequestLogging } = require("logstack");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cron service configuration
const cronConfig = {
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp",
  uploadProvider: "local",
  fileFormat: "json",
  outputDirectory: "api-logs",
  collections: {
    jobsCollectionName: "api_jobs",
    logsCollectionName: "api_logs",
  },
  logging: {
    level: "info",
    enableConsole: true,
  },
};

// Middleware
app.use(express.json());

// Initialize cron service
async function initializeServices() {
  try {
    await init(cronConfig);
    console.log("✅ Cron log service initialized");

    // Add request logging middleware
    app.use(setupRequestLogging(cronConfig));
    console.log("🔌 Request logging middleware added");
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    process.exit(1);
  }
}

// API Routes
app.get("/api/users", (req, res) => {
  // This request will be logged automatically
  res.json({
    users: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ],
  });
});

app.post("/api/orders", (req, res) => {
  // This request will be logged automatically
  const order = {
    id: Date.now(),
    items: req.body.items,
    total: req.body.total,
  };
  res.json({ success: true, order });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Error handling
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
async function startServer() {
  await initializeServices();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 API logs will be saved to: ./api-logs/`);
    console.log(`🔄 Cron jobs will run automatically`);
    console.log(`🌐 Visit: http://localhost:${PORT}/health`);
  });
}

startServer().catch(console.error);

module.exports = app;
```

### ES Modules Express App (`server.js`)

```javascript
import express from "express";
import { init, setupRequestLogging } from "logstack";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cron service configuration
const cronConfig = {
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp",
  uploadProvider: "local",
  fileFormat: "json",
  outputDirectory: "api-logs",
  collections: {
    jobsCollectionName: "api_jobs",
    logsCollectionName: "api_logs",
  },
  logging: {
    level: "info",
    enableConsole: true,
  },
};

// Middleware
app.use(express.json());

// Initialize cron service
async function initializeServices() {
  try {
    await init(cronConfig);
    console.log("✅ Cron log service initialized");

    // Add request logging middleware
    app.use(setupRequestLogging(cronConfig));
    console.log("🔌 Request logging middleware added");
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    process.exit(1);
  }
}

// API Routes
app.get("/api/users", (req, res) => {
  // This request will be logged automatically
  res.json({
    users: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ],
  });
});

app.post("/api/orders", (req, res) => {
  // This request will be logged automatically
  const order = {
    id: Date.now(),
    items: req.body.items,
    total: req.body.total,
  };
  res.json({ success: true, order });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Error handling
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
async function startServer() {
  await initializeServices();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 API logs will be saved to: ./api-logs/`);
    console.log(`🔄 Cron jobs will run automatically`);
    console.log(`🌐 Visit: http://localhost:${PORT}/health`);
  });
}

startServer().catch(console.error);

export default app;
```

---

## 📦 Complete Project Setup

### Project Structure

```
my-cron-app/
├── package.json
├── .env
├── .env.example
├── app.js                 # Main application
├── config.js              # Configuration factory
├── server.js              # Express server (optional)
├── test.js                # Test script
├── api-logs/              # Generated log files (auto-created)
│   └── 2025-08-25/
│       ├── 14-15.json
│       └── 15-16.json
└── node_modules/
```

### Package.json (CommonJS)

```json
{
  "name": "my-cron-app",
  "version": "1.0.0",
  "description": "Cron log service implementation",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "node app.js --test",
    "server": "node server.js",
    "test": "node test.js",
    "prod": "NODE_ENV=production node app.js"
  },
  "dependencies": {
    "logstack": "latest",
    "express": "^4.18.0",
    "mongodb": "^6.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

### Package.json (ES Modules)

```json
{
  "name": "my-cron-app",
  "version": "1.0.0",
  "type": "module",
  "description": "Cron log service implementation",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "node app.js --test",
    "server": "node server.js",
    "test": "node test.js",
    "prod": "NODE_ENV=production node app.js"
  },
  "dependencies": {
    "logstack": "latest",
    "express": "^4.18.0",
    "mongodb": "^6.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

### Test Script (`test.js`) - CommonJS

```javascript
const {
  init,
  createDailyJobs,
  processSpecificHour,
} = require("logstack");
require("dotenv").config();

const testConfig = {
  dbUri: "mongodb://localhost:27017/test",
  uploadProvider: "local",
  fileFormat: "json",
  outputDirectory: "test-logs",
  collections: {
    jobsCollectionName: "test_jobs",
    logsCollectionName: "test_logs",
  },
  logging: {
    level: "info",
    enableConsole: true,
  },
};

async function runTests() {
  try {
    console.log("🧪 Running cron service tests...");

    // Test 1: Initialize service
    await init(testConfig);
    console.log("✅ Test 1: Service initialized");

    // Test 2: Create daily jobs
    const job = await createDailyJobs("2025-08-25", testConfig);
    console.log(`✅ Test 2: Created job with ${job.hours.length} hour slots`);

    // Test 3: Process specific hour
    await processSpecificHour("2025-08-25", 14, testConfig);
    console.log("✅ Test 3: Processed hour 14-15");

    // Test 4: Process another hour
    await processSpecificHour("2025-08-25", 16, testConfig);
    console.log("✅ Test 4: Processed hour 16-17");

    console.log("🎉 All tests passed!");
    console.log("📁 Check ./test-logs/2025-08-25/ for generated files");

    process.exit(0);
  } catch (error) {
    console.error("❌ Tests failed:", error);
    process.exit(1);
  }
}

runTests();
```

### Test Script (`test.js`) - ES Modules

```javascript
import { init, createDailyJobs, processSpecificHour } from "logstack";
import dotenv from "dotenv";

dotenv.config();

const testConfig = {
  dbUri: "mongodb://localhost:27017/test",
  uploadProvider: "local",
  fileFormat: "json",
  outputDirectory: "test-logs",
  collections: {
    jobsCollectionName: "test_jobs",
    logsCollectionName: "test_logs",
  },
  logging: {
    level: "info",
    enableConsole: true,
  },
};

async function runTests() {
  try {
    console.log("🧪 Running cron service tests...");

    // Test 1: Initialize service
    await init(testConfig);
    console.log("✅ Test 1: Service initialized");

    // Test 2: Create daily jobs
    const job = await createDailyJobs("2025-08-25", testConfig);
    console.log(`✅ Test 2: Created job with ${job.hours.length} hour slots`);

    // Test 3: Process specific hour
    await processSpecificHour("2025-08-25", 14, testConfig);
    console.log("✅ Test 3: Processed hour 14-15");

    // Test 4: Process another hour
    await processSpecificHour("2025-08-25", 16, testConfig);
    console.log("✅ Test 4: Processed hour 16-17");

    console.log("🎉 All tests passed!");
    console.log("📁 Check ./test-logs/2025-08-25/ for generated files");

    process.exit(0);
  } catch (error) {
    console.error("❌ Tests failed:", error);
    process.exit(1);
  }
}

runTests();
```

---

## 🚀 Production Deployment

### Environment Variables (`.env.production`)

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DB_URI=mongodb://prod-cluster.mongodb.net/myapp

# Cron Service
OUTPUT_DIR=production-logs
JOBS_COLLECTION=prod_jobs
LOGS_COLLECTION=prod_logs

# AWS S3 (for production file storage)
AWS_ACCESS_KEY_ID=your_production_access_key
AWS_SECRET_ACCESS_KEY=your_production_secret_key
AWS_REGION=us-east-1
S3_BUCKET=myapp-production-logs

# Logging
LOG_LEVEL=warn
ENABLE_FILE_LOGGING=true
```

### Production Configuration (`config/production.js`)

```javascript
const productionConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",
  fileFormat: "json",
  outputDirectory: process.env.OUTPUT_DIR || "production-logs",

  collections: {
    jobsCollectionName: process.env.JOBS_COLLECTION || "prod_jobs",
    logsCollectionName: process.env.LOGS_COLLECTION || "prod_logs",
  },

  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET,
  },

  logging: {
    level: process.env.LOG_LEVEL || "warn",
    enableConsole: false,
    enableFile: process.env.ENABLE_FILE_LOGGING === "true",
    logFilePath: "./logs/production.log",
  },

  retryAttempts: 3,
  timezone: "UTC",
};

module.exports = { productionConfig };
```

### Deployment Scripts

**Start script (`start.sh`):**

```bash
#!/bin/bash
export NODE_ENV=production
node app.js
```

**PM2 Configuration (`ecosystem.config.js`):**

```javascript
module.exports = {
  apps: [
    {
      name: "my-cron-app",
      script: "app.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
```

---

## 🎯 Quick Commands

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Start Express server
npm run server
```

### Production

```bash
# Start production server
npm run prod

# Using PM2
pm2 start ecosystem.config.js --env production

# Check PM2 status
pm2 status
pm2 logs my-cron-app
```

---

## 🔧 Advanced Examples

### Multiple Services Setup

```javascript
// services/userService.js
const { init } = require("logstack");

const userServiceConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "local",
  outputDirectory: "user-service-logs",
  collections: {
    jobsCollectionName: "user_service_jobs",
    logsCollectionName: "user_service_logs",
  },
};

async function initUserService() {
  await init(userServiceConfig);
  console.log("✅ User service initialized");
}

module.exports = { initUserService, userServiceConfig };
```

```javascript
// services/orderService.js
const { init } = require("logstack");

const orderServiceConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",
  outputDirectory: "order-service-exports",
  collections: {
    jobsCollectionName: "order_service_jobs",
    logsCollectionName: "order_service_logs",
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
    bucket: "order-service-logs",
  },
};

async function initOrderService() {
  await init(orderServiceConfig);
  console.log("✅ Order service initialized");
}

module.exports = { initOrderService, orderServiceConfig };
```

```javascript
// app.js - Initialize multiple services
const { initUserService } = require("./services/userService");
const { initOrderService } = require("./services/orderService");

async function initAllServices() {
  await initUserService();
  await initOrderService();
  console.log("🎉 All services initialized");
}

initAllServices().catch(console.error);
```

---

## ✅ Implementation Checklist

### ☐ 1. Choose Your Approach

- [ ] CommonJS (traditional Node.js)
- [ ] ES Modules (modern Node.js)

### ☐ 2. Basic Setup

- [ ] Install `logstack`
- [ ] Create configuration file
- [ ] Initialize in your app
- [ ] Test basic functionality

### ☐ 3. Add Organization Features

- [ ] Configure `outputDirectory`
- [ ] Set custom collection names
- [ ] Test file organization

### ☐ 4. Environment Configuration

- [ ] Create `.env` files
- [ ] Set up environment-based config
- [ ] Test different environments

### ☐ 5. Express Integration (Optional)

- [ ] Add request logging middleware
- [ ] Test API request logging
- [ ] Verify log generation

### ☐ 6. Production Setup

- [ ] Configure cloud storage
- [ ] Set up production environment
- [ ] Test deployment

---

**🎉 You now have complete Node.js implementation examples! Choose the approach that fits your project and follow the step-by-step implementation.**
