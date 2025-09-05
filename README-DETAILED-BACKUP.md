# 🌩️ LogStack

**Complete Node.js logging solution** with 6 integration methods, S3 bidirectional operations, advanced analytics, and enterprise-scale features. From simple app logs to distributed microservices - LogStack handles it all.

[![npm version](https://badge.fury.io/js/logstack.svg)](https://www.npmjs.com/package/logstack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

> **🚀 Production-ready logging for modern Node.js applications**

## ✨ Features

### 🚀 Core Capabilities

- **🔄 Automated Processing**: Hourly cron jobs for API logs processing and uploads
- **☁️ Cloud Storage**: AWS S3, Google Cloud, Azure, and local file storage
- **🗃️ Database Flexibility**: Custom collection names to avoid conflicts
- **📁 Configurable Structure**: Daily/monthly/yearly folder organization with sub-folders
- **📦 File Compression**: gzip, brotli, zip formats with configurable levels
- **🔒 Data Masking**: PII protection with environment-specific configurations
- **🗑️ Log Retention**: Automatic cleanup of old database records and cloud files
- **⚡ High Performance**: Batch processing for large datasets (163+ records/sec)
- **🎯 TypeScript Support**: Full type safety and IntelliSense
- **🛡️ Production Ready**: Comprehensive error handling and retry logic

### 🌐 Multiple Integration Methods

- **🔗 Embedded Integration**: Direct integration within your Node.js application
- **🌐 REST API**: HTTP-based logging service for multi-language support
- **📨 Kafka Integration**: High-throughput message streaming for enterprise scale
- **⚡ Redis Integration**: Fast in-memory queuing for real-time processing
- **🐰 RabbitMQ Integration**: Reliable message queuing with guaranteed delivery
- **🔄 WebSocket Integration**: Real-time bidirectional communication for live dashboards

### 🌟 Advanced Features

- **📥 S3 Bidirectional Operations**: Upload to and download logs from S3
- **🔍 S3 Log Search**: Search through archived logs in S3 by criteria and date ranges
- **🔄 S3 to Database Sync**: Restore logs from S3 back to database for disaster recovery
- **📊 Bulk Database Operations**: Efficiently insert thousands of logs at once
- **📈 Advanced Analytics**: Generate comprehensive reports and performance insights
- **🔍 Advanced Search**: Complex filtering, grouping, and aggregation capabilities
- **📱 Real-time Monitoring**: Live log streaming and instant error alerts
- **🎯 Multi-Service Architecture**: Support for distributed systems and microservices

## 🚀 Installation

```bash
npm install logstack
```

## 📋 Quick Start

```javascript
const { init, createDailyJobs } = require("logstack");

async function setup() {
  await init({
    dbUri: "mongodb://localhost:27017/your-app",
    uploadProvider: "local", // or 's3'
    outputDirectory: "api-logs",

    // 📦 Enable file compression for larger files
    compression: {
      enabled: true,
      format: "gzip", // or 'brotli', 'zip'
      level: 6, // Compression level 1-9
      fileSize: 1024, // Only compress files larger than 1KB
    },

    // 🔒 Enable sensitive data masking
    dataMasking: {
      enabled: true,
      maskEmails: true,
      maskIPs: false, // Set true in production
      showLastChars: 0, // Show last N characters (0 = full masking)
    },

    // 📁 Configure folder structure organization
    folderStructure: {
      type: "daily", // or 'monthly', 'yearly'
      subFolders: {
        enabled: true,
        byHour: true, // Creates hour-14-15 sub-folders
        byStatus: false, // Creates success/failed sub-folders
      },
    },

    collections: {
      jobsCollectionName: "myapp_jobs",
      logsCollectionName: "myapp_logs",
      apiLogsCollectionName: "myapp_apilogs",
    },
  });

  // Optional: Create today's jobs immediately (jobs auto-create daily at midnight)
  await createDailyJobs();

  console.log("✅ Service initialized");
  console.log("🔄 Daily jobs will be created automatically");
  console.log("⚡ Hourly processing runs automatically");
}

setup().catch(console.error);
```

## 🚀 Advanced Features & Integration Methods

### 🌟 S3 Bidirectional Operations

LogStack now supports complete S3 operations - not just uploads, but also downloads and synchronization:

```javascript
const { LogStackAdvanced } = require("logstack/lib/advancedFeatures");

// Initialize with S3 configuration
const advanced = new LogStackAdvanced({
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "s3",
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
    bucket: "my-logs-bucket",
  },
});

// 📥 Download logs from S3
const files = await advanced.downloadDateRange(
  "2025-01-01",
  "2025-01-31",
  "./backup"
);

// 🔍 Search logs in S3 archives
const errorLogs = await advanced.searchS3(
  { responseStatus: /^5\d{2}$/ }, // Find 5xx errors
  { startDate: "2025-01-01", endDate: "2025-01-31" }
);

// 🔄 Sync S3 logs back to database
const syncResult = await advanced.syncS3ToDb("2025-01-01", "2025-01-31", {
  allowDuplicates: false,
});

// 📊 Generate comprehensive analytics
const analytics = await advanced.generateAnalytics({
  start: "2025-01-01T00:00:00Z",
  end: "2025-01-31T23:59:59Z",
});
```

### 🔄 Multiple Integration Methods

Choose the integration method that best fits your architecture:

#### 1. 🔗 Embedded Integration (Recommended for Single Apps)

```javascript
const logstack = require("logstack");
await logstack.init(config);
await logstack.saveApiLog(requestData);
```

#### 2. 🌐 REST API Integration (Multi-Language Support)

```bash
# Start LogStack server
npm run service:api

# Send logs via HTTP
curl -X POST http://localhost:4000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"User logged in"}'
```

#### 3. 📨 Kafka Integration (High Throughput)

```javascript
// Your app sends to Kafka, LogStack consumes automatically
const producer = kafka.producer();
await producer.send({
  topic: "logstack-logs",
  messages: [{ value: JSON.stringify(logData) }],
});
```

#### 4. ⚡ Redis Integration (Fast Processing)

```javascript
const redis = require("redis");
const client = redis.createClient();
await client.lpush("logstack:queue", JSON.stringify(logData));
```

#### 5. 🐰 RabbitMQ Integration (Enterprise Reliability)

```javascript
await channel.sendToQueue(
  "logstack.logs",
  Buffer.from(JSON.stringify(logData))
);
```

#### 6. 🔄 WebSocket Integration (Real-time Dashboards)

```javascript
const ws = new WebSocket("ws://localhost:4000/ws");
ws.send(JSON.stringify({ type: "log", data: logData }));
```

### 📊 Advanced Database Operations

```javascript
// Bulk insert thousands of logs efficiently
const logs = [
  /* thousands of logs */
];
const result = await advanced.bulkInsert(logs, { batchSize: 1000 });

// Advanced search with grouping and filtering
const searchResult = await advanced.advancedSearch({
  dateRange: { start: "2025-01-01T00:00:00Z", end: "2025-01-31T23:59:59Z" },
  statusCodes: [200, 201, 404, 500],
  responseTimeRange: { min: 0, max: 1000 },
  groupBy: "path",
  limit: 5000,
});
```

### 🛠️ Multi-Service CLI

Start different integration services with a single command:

```bash
# Start specific services
npm run service:api       # REST API server
npm run service:kafka     # Kafka consumer
npm run service:redis     # Redis queue processor
npm run service:rabbitmq  # RabbitMQ consumer
npm run service:websocket # WebSocket server
npm run service:multi     # All services together

# Advanced CLI with options
node examples/multi-service-cli.js api --port 4000 --database mongodb://localhost:27017/logs
node examples/multi-service-cli.js kafka --brokers localhost:9092
node examples/multi-service-cli.js websocket --port 4000
```

## 🌐 JavaScript & Framework Support

The `logstack` package supports integration with popular JavaScript frameworks and libraries. Here's how to use it with different JavaScript frameworks:

### 🟨 JavaScript Frameworks

#### Express.js Integration

```javascript
const express = require("express");
const { init, createApiLogMiddleware } = require("logstack");

const app = express();

async function setupExpressApp() {
  // Initialize the service
  await init({
    dbUri: process.env.DB_URI,
    uploadProvider: "s3",
    outputDirectory: "express-logs",
    collections: {
      jobsCollectionName: "express_jobs",
      logsCollectionName: "express_logs",
      apiLogsCollectionName: "express_api_logs",
    },
  });

  // Add API logging middleware
  app.use(
    createApiLogMiddleware({
      excludePaths: ["/health", "/metrics"],
      includePaths: ["/api/*"],
      logLevel: "info",
    })
  );

  // Your Express routes
  app.get("/api/users", (req, res) => {
    res.json({ users: [], timestamp: new Date() });
  });

  app.listen(3000, () => {
    console.log("🚀 Express server with automatic API logging started");
  });
}

setupExpressApp();
```

#### NestJS Integration

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { CronLogModule } from "./cron-log/cron-log.module";

@Module({
  imports: [CronLogModule],
})
export class AppModule {}
```

```typescript
// cron-log/cron-log.module.ts
import { Module, OnModuleInit } from "@nestjs/common";
import { init } from "logstack";

@Module({})
export class CronLogModule implements OnModuleInit {
  async onModuleInit() {
    await init({
      dbUri: process.env.DB_URI,
      uploadProvider: "s3",
      outputDirectory: "nestjs-logs",
      collections: {
        jobsCollectionName: "nestjs_jobs",
        logsCollectionName: "nestjs_logs",
        apiLogsCollectionName: "nestjs_api_logs",
      },
    });
    console.log("🚀 NestJS with logstack initialized");
  }
}
```

```typescript
// cron-log/cron-log.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { logApiRequest } from "logstack";

@Injectable()
export class CronLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Log API request using logstack
        logApiRequest({
          method: request.method,
          url: request.url,
          statusCode: response.statusCode,
          duration,
          timestamp: new Date(),
          ip: request.ip,
          userAgent: request.get("User-Agent"),
        });
      })
    );
  }
}
```

#### Fastify Integration

```javascript
const fastify = require("fastify")({ logger: true });
const { init, createFastifyPlugin } = require("logstack");

async function setupFastifyApp() {
  // Initialize logstack
  await init({
    dbUri: process.env.DB_URI,
    uploadProvider: "s3",
    outputDirectory: "fastify-logs",
    collections: {
      jobsCollectionName: "fastify_jobs",
      logsCollectionName: "fastify_logs",
      apiLogsCollectionName: "fastify_api_logs",
    },
  });

  // Register logstack plugin
  await fastify.register(createFastifyPlugin(), {
    excludeRoutes: ["/health", "/metrics"],
    includeRoutes: ["/api/*"],
  });

  // Fastify routes
  fastify.get("/api/products", async (request, reply) => {
    return { products: [], timestamp: new Date() };
  });

  const start = async () => {
    try {
      await fastify.listen({ port: 3000 });
      console.log("🚀 Fastify server with logstack started");
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };

  start();
}

setupFastifyApp();
```

#### Koa.js Integration

```javascript
const Koa = require("koa");
const Router = require("@koa/router");
const { init, createKoaMiddleware } = require("logstack");

const app = new Koa();
const router = new Router();

async function setupKoaApp() {
  // Initialize logstack
  await init({
    dbUri: process.env.DB_URI,
    uploadProvider: "local",
    outputDirectory: "koa-logs",
    collections: {
      jobsCollectionName: "koa_jobs",
      logsCollectionName: "koa_logs",
      apiLogsCollectionName: "koa_api_logs",
    },
  });

  // Add Koa middleware for API logging
  app.use(
    createKoaMiddleware({
      excludePaths: ["/health"],
      includePaths: ["/api/*"],
    })
  );

  // Koa routes
  router.get("/api/orders", (ctx, next) => {
    ctx.body = { orders: [], timestamp: new Date() };
  });

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(3000, () => {
    console.log("🚀 Koa server with logstack started");
  });
}

setupKoaApp();
```

### 🔷 TypeScript Integration

#### TypeScript + Express

```typescript
import express, { Application, Request, Response } from "express";
import { init, createApiLogMiddleware, Config } from "logstack";

const app: Application = express();

interface ApiLogConfig extends Config {
  logLevel: "info" | "debug" | "warn" | "error";
}

async function setupTypescriptExpressApp(): Promise<void> {
  const config: ApiLogConfig = {
    dbUri: process.env.DB_URI!,
    uploadProvider: "s3",
    outputDirectory: "typescript-express-logs",
    collections: {
      jobsCollectionName: "ts_express_jobs",
      logsCollectionName: "ts_express_logs",
      apiLogsCollectionName: "ts_express_api_logs",
    },
    logLevel: "info",
  };

  await init(config);

  app.use(
    createApiLogMiddleware({
      excludePaths: ["/health", "/metrics"],
      includePaths: ["/api/*"],
    })
  );

  app.get("/api/users", (req: Request, res: Response) => {
    res.json({
      users: [],
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  app.listen(3000, () => {
    console.log("🚀 TypeScript Express server with logstack started");
  });
}

setupTypescriptExpressApp().catch(console.error);
```

### 🌐 Frontend Frameworks

#### React/Next.js Integration

```typescript
// utils/cronLogClient.ts
interface ApiLogData {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  timestamp: string;
  source: string;
}

export class CronLogClient {
  private serviceUrl: string;

  constructor(serviceUrl: string = "/api/cron-log") {
    this.serviceUrl = serviceUrl;
  }

  async logApiRequest(data: Omit<ApiLogData, "timestamp" | "source">) {
    try {
      await fetch(`${this.serviceUrl}/log-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: "nextjs-app",
        }),
      });
    } catch (error) {
      console.error("Failed to log API request:", error);
    }
  }
}

// pages/api/cron-log/log-request.ts (Next.js API Route)
import { NextApiRequest, NextApiResponse } from "next";
import { init, logApiRequest } from "logstack";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // Initialize if not already done
      await init({
        dbUri: process.env.DB_URI!,
        uploadProvider: "s3",
        outputDirectory: "nextjs-logs",
      });

      await logApiRequest(req.body);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to log request" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
```

#### Vue.js Integration

```javascript
// vue-cron-log-plugin.js
import { ref } from "vue";

class VueCronLogClient {
  constructor(baseURL = "/api/cron-log") {
    this.baseURL = baseURL;
    this.logs = ref([]);
  }

  async logApiRequest(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/log-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...requestData,
          timestamp: new Date().toISOString(),
          source: "vue-app",
        }),
      });

      if (response.ok) {
        this.logs.value.push(requestData);
      }
    } catch (error) {
      console.error("Failed to log API request:", error);
    }
  }
}

// Vue 3 Plugin
export default {
  install(app, options = {}) {
    const cronLogClient = new VueCronLogClient(options.baseURL);

    app.config.globalProperties.$cronLog = cronLogClient;
    app.provide("cronLog", cronLogClient);
  },
};
```

#### Angular Integration

```typescript
// cron-log.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

interface ApiLogData {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  timestamp: string;
  source: string;
}

@Injectable({
  providedIn: "root",
})
export class CronLogService {
  private readonly baseUrl = "/api/cron-log";

  constructor(private http: HttpClient) {}

  logApiRequest(
    data: Omit<ApiLogData, "timestamp" | "source">
  ): Observable<any> {
    const logData: ApiLogData = {
      ...data,
      timestamp: new Date().toISOString(),
      source: "angular-app",
    };

    return this.http.post(`${this.baseUrl}/log-request`, logData);
  }
}

// cron-log.interceptor.ts
import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { CronLogService } from "./cron-log.service";

@Injectable()
export class CronLogInterceptor implements HttpInterceptor {
  constructor(private cronLogService: CronLogService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const startTime = Date.now();

    return next.handle(req).pipe(
      tap((event) => {
        if (event.type === 4) {
          // HttpEventType.Response
          const duration = Date.now() - startTime;

          this.cronLogService
            .logApiRequest({
              method: req.method,
              url: req.url,
              statusCode: (event as any).status,
              duration,
            })
            .subscribe();
        }
      })
    );
  }
}
```

### 🔧 JavaScript Configuration Management

```javascript
// config/javascript-frameworks-setup.js
const { init } = require("logstack");

const frameworkConfigs = {
  express: {
    dbUri: process.env.EXPRESS_DB_URI,
    uploadProvider: "s3",
    outputDirectory: "express-logs",
    collections: {
      jobsCollectionName: "express_jobs",
      logsCollectionName: "express_logs",
      apiLogsCollectionName: "express_api_logs",
    },
  },

  nestjs: {
    dbUri: process.env.NESTJS_DB_URI,
    uploadProvider: "s3",
    outputDirectory: "nestjs-logs",
    collections: {
      jobsCollectionName: "nestjs_jobs",
      logsCollectionName: "nestjs_logs",
      apiLogsCollectionName: "nestjs_api_logs",
    },
  },

  fastify: {
    dbUri: process.env.FASTIFY_DB_URI,
    uploadProvider: "local",
    outputDirectory: "fastify-logs",
    collections: {
      jobsCollectionName: "fastify_jobs",
      logsCollectionName: "fastify_logs",
      apiLogsCollectionName: "fastify_api_logs",
    },
  },

  koa: {
    dbUri: process.env.KOA_DB_URI,
    uploadProvider: "s3",
    outputDirectory: "koa-logs",
    collections: {
      jobsCollectionName: "koa_jobs",
      logsCollectionName: "koa_logs",
      apiLogsCollectionName: "koa_api_logs",
    },
  },

  nextjs: {
    dbUri: process.env.NEXTJS_DB_URI,
    uploadProvider: "s3",
    outputDirectory: "nextjs-logs",
    collections: {
      jobsCollectionName: "nextjs_jobs",
      logsCollectionName: "nextjs_logs",
      apiLogsCollectionName: "nextjs_api_logs",
    },
  },
};

async function initializeForFramework(framework) {
  const config = frameworkConfigs[framework];
  if (!config) {
    throw new Error(`Unsupported framework: ${framework}`);
  }

  await init(config);
  console.log(`✅ Initialized logstack for ${framework}`);
}

module.exports = { initializeForFramework, frameworkConfigs };
```

## 🗃️ Multiple Database Types & Configuration

You can configure the service to work with different types of databases simultaneously - MongoDB, PostgreSQL, MySQL, SQL Server, and more. Each database can have its own configuration and cloud storage settings.

### Supported Database Types

- **MongoDB** - Document database (default)
- **PostgreSQL** - Relational database
- **MySQL** - Relational database
- **SQL Server** - Microsoft SQL Server
- **SQLite** - File-based database
- **Oracle** - Enterprise database
- **Redis** - In-memory database
- **Cassandra** - NoSQL database

### Multi-Database Type Setup

```javascript
const { init, createDailyJobs } = require("logstack");

// Configuration for different database types
const databases = {
  // MongoDB for user data
  userMongoDB: {
    dbType: "mongodb",
    dbUri: "mongodb://localhost:27017/users",
    uploadProvider: "s3",
    outputDirectory: "mongodb-user-logs",
    collections: {
      jobsCollectionName: "mongo_user_jobs",
      logsCollectionName: "mongo_user_logs",
      apiLogsCollectionName: "mongo_user_apilogs",
    },
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "us-east-1",
      bucket: "mongodb-user-logs",
    },
  },

  // PostgreSQL for analytics
  postgresAnalytics: {
    dbType: "postgresql",
    dbUri: "postgresql://username:password@localhost:5432/analytics",
    uploadProvider: "s3",
    outputDirectory: "postgres-analytics-logs",
    tables: {
      // For SQL databases, use 'tables' instead of 'collections'
      jobsTableName: "postgres_analytics_jobs",
      logsTableName: "postgres_analytics_logs",
      apiLogsTableName: "postgres_analytics_apilogs",
    },
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "us-east-1",
      bucket: "postgres-analytics-logs",
    },
  },

  // MySQL for e-commerce
  mysqlEcommerce: {
    dbType: "mysql",
    dbUri: "mysql://user:password@localhost:3306/ecommerce",
    uploadProvider: "local",
    outputDirectory: "mysql-ecommerce-logs",
    tables: {
      jobsTableName: "mysql_ecommerce_jobs",
      logsTableName: "mysql_ecommerce_logs",
      apiLogsTableName: "mysql_ecommerce_apilogs",
    },
  },

  // SQL Server for inventory
  sqlServerInventory: {
    dbType: "sqlserver",
    dbUri: "mssql://username:password@localhost:1433/inventory",
    uploadProvider: "local",
    outputDirectory: "sqlserver-inventory-logs",
    tables: {
      jobsTableName: "sqlserver_inventory_jobs",
      logsTableName: "sqlserver_inventory_logs",
      apiLogsTableName: "sqlserver_inventory_apilogs",
    },
  },

  // SQLite for local development
  sqliteLocal: {
    dbType: "sqlite",
    dbUri: "sqlite:./local_dev.db",
    uploadProvider: "local",
    outputDirectory: "sqlite-dev-logs",
    tables: {
      jobsTableName: "sqlite_dev_jobs",
      logsTableName: "sqlite_dev_logs",
      apiLogsTableName: "sqlite_dev_apilogs",
    },
  },

  // Redis for cache logs
  redisCache: {
    dbType: "redis",
    dbUri: "redis://localhost:6379/0",
    uploadProvider: "s3",
    outputDirectory: "redis-cache-logs",
    keys: {
      // For Redis, use 'keys' instead of 'collections'
      jobsKeyPrefix: "redis_cache_jobs:",
      logsKeyPrefix: "redis_cache_logs:",
      apiLogsKeyPrefix: "redis_cache_apilogs:",
    },
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "us-east-1",
      bucket: "redis-cache-logs",
    },
  },
};

async function setupMultipleDatabaseTypes() {
  for (const [dbName, config] of Object.entries(databases)) {
    try {
      console.log(`🔧 Initializing ${config.dbType} database: ${dbName}...`);

      await init(config);
      await createDailyJobs(null, config);

      console.log(`✅ ${dbName} (${config.dbType}) initialized successfully`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${dbName}:`, error.message);
    }
  }

  console.log("🚀 All database types initialized!");
}

setupMultipleDatabaseTypes();
```

### Environment-Based Multi-Database Type Configuration

```javascript
const { init, createDailyJobs } = require("logstack");

// Define database configurations for different types and environments
const getMultiDbTypeConfig = (env = "development") => {
  const baseConfig = {
    retryAttempts: 3,
    logging: { level: "info", enableFile: true },
  };

  return {
    // MongoDB for main application
    mainMongoDB: {
      ...baseConfig,
      dbType: "mongodb",
      dbUri: process.env[`${env.toUpperCase()}_MONGO_URI`],
      uploadProvider: env === "production" ? "s3" : "local",
      outputDirectory: `${env}-mongo-main-logs`,
      collections: {
        jobsCollectionName: `${env}_mongo_main_jobs`,
        logsCollectionName: `${env}_mongo_main_logs`,
        apiLogsCollectionName: `${env}_mongo_main_apilogs`,
      },
    },

    // PostgreSQL for analytics
    postgresAnalytics: {
      ...baseConfig,
      dbType: "postgresql",
      dbUri: process.env[`${env.toUpperCase()}_POSTGRES_URI`],
      uploadProvider: env === "production" ? "s3" : "local",
      outputDirectory: `${env}-postgres-analytics-logs`,
      tables: {
        jobsTableName: `${env}_postgres_analytics_jobs`,
        logsTableName: `${env}_postgres_analytics_logs`,
        apiLogsTableName: `${env}_postgres_analytics_apilogs`,
      },
    },

    // MySQL for e-commerce
    mysqlEcommerce: {
      ...baseConfig,
      dbType: "mysql",
      dbUri: process.env[`${env.toUpperCase()}_MYSQL_URI`],
      uploadProvider: env === "production" ? "s3" : "local",
      outputDirectory: `${env}-mysql-ecommerce-logs`,
      tables: {
        jobsTableName: `${env}_mysql_ecommerce_jobs`,
        logsTableName: `${env}_mysql_ecommerce_logs`,
        apiLogsTableName: `${env}_mysql_ecommerce_apilogs`,
      },
    },

    // Redis for session data
    redisSession: {
      ...baseConfig,
      dbType: "redis",
      dbUri: process.env[`${env.toUpperCase()}_REDIS_URI`],
      uploadProvider: env === "production" ? "s3" : "local",
      outputDirectory: `${env}-redis-session-logs`,
      keys: {
        jobsKeyPrefix: `${env}_redis_session_jobs:`,
        logsKeyPrefix: `${env}_redis_session_logs:`,
        apiLogsKeyPrefix: `${env}_redis_session_apilogs:`,
      },
    },
  };
};

async function initializeMultiDbTypes() {
  const env = process.env.NODE_ENV || "development";
  const configs = getMultiDbTypeConfig(env);

  console.log(`🌍 Initializing multiple database types for ${env} environment`);

  const results = await Promise.allSettled(
    Object.entries(configs).map(async ([dbName, config]) => {
      console.log(`🔧 Setting up ${config.dbType}: ${dbName}...`);
      await init(config);
      await createDailyJobs(null, config);
      return { dbName, dbType: config.dbType, status: "success" };
    })
  );

  // Report results
  results.forEach((result, index) => {
    const dbName = Object.keys(configs)[index];
    const dbType = Object.values(configs)[index].dbType;
    if (result.status === "fulfilled") {
      console.log(`✅ ${dbName} (${dbType}): Initialized successfully`);
    } else {
      console.error(
        `❌ ${dbName} (${dbType}): Failed -`,
        result.reason.message
      );
    }
  });
}

initializeMultiDbTypes();
```

## 🌍 Multi-Environment Configuration

Configure different settings for development, staging, testing, and production environments with environment-specific optimizations.

### Complete Environment-Based Setup

```javascript
const { init, createDailyJobs, initRetention } = require("logstack");

// Environment-specific configurations
const environmentConfigs = {
  // 💻 Development Environment
  development: {
    dbUri: process.env.DEV_DB_URI || "mongodb://localhost:27017/dev_app",
    uploadProvider: "local",
    outputDirectory: "dev-logs",
    fileFormat: "json",

    collections: {
      jobsCollectionName: "dev_jobs",
      logsCollectionName: "dev_logs",
      apiLogsCollectionName: "dev_apilogs",
    },

    // Development retention (minimal for cost)
    retention: {
      database: {
        apiLogs: 3, // 3 days only
        jobs: 7, // 1 week
        logs: 5, // 5 days
        autoCleanup: true,
        cleanupCron: "0 6 * * *", // 6 AM daily
      },
      storage: {
        files: 14, // 2 weeks
        autoCleanup: true,
        cleanupCron: "0 7 * * *", // 7 AM daily
      },
    },

    logging: {
      level: "debug",
      enableConsole: true,
      enableFile: true,
    },

    retryAttempts: 2,
    dailyCron: "0 0 * * *", // Daily job creation
    hourlyCron: "0 * * * *", // Hourly processing
  },

  // 🧪 Testing Environment
  testing: {
    dbUri: process.env.TEST_DB_URI || "mongodb://localhost:27017/test_app",
    uploadProvider: "local",
    outputDirectory: "test-logs",
    fileFormat: "json",

    collections: {
      jobsCollectionName: "test_jobs",
      logsCollectionName: "test_logs",
      apiLogsCollectionName: "test_apilogs",
    },

    // Testing retention (short-term)
    retention: {
      database: {
        apiLogs: 5, // 5 days
        jobs: 14, // 2 weeks
        logs: 7, // 1 week
        autoCleanup: true,
        cleanupCron: "0 4 * * *", // 4 AM daily
      },
      storage: {
        files: 30, // 1 month
        autoCleanup: true,
        cleanupCron: "0 5 * * *", // 5 AM daily
      },
    },

    logging: {
      level: "info",
      enableConsole: true,
      enableFile: true,
    },

    retryAttempts: 3,
    dailyCron: "0 0 * * *",
    hourlyCron: "0 * * * *",
  },

  // 🚀 Staging Environment
  staging: {
    dbUri: process.env.STAGING_DB_URI,
    uploadProvider: process.env.STAGING_UPLOAD_PROVIDER || "s3",
    outputDirectory: "staging-logs",
    fileFormat: "json",

    collections: {
      jobsCollectionName: "staging_jobs",
      logsCollectionName: "staging_logs",
      apiLogsCollectionName: "staging_apilogs",
    },

    // Staging cloud storage
    s3: {
      accessKeyId: process.env.STAGING_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.STAGING_AWS_SECRET_ACCESS_KEY,
      region: process.env.STAGING_AWS_REGION || "us-east-1",
      bucket: process.env.STAGING_S3_BUCKET,
    },

    gcs: {
      projectId: process.env.STAGING_GCP_PROJECT_ID,
      keyFilename: process.env.STAGING_GCP_KEY_FILE,
      bucket: process.env.STAGING_GCS_BUCKET,
    },

    azure: {
      connectionString: process.env.STAGING_AZURE_STORAGE_CONNECTION_STRING,
      containerName: process.env.STAGING_AZURE_CONTAINER_NAME,
    },

    // Staging retention (medium-term)
    retention: {
      database: {
        apiLogs: 14, // 2 weeks
        jobs: 60, // 2 months
        logs: 30, // 1 month
        autoCleanup: true,
        cleanupCron: "0 3 * * *", // 3 AM daily
      },
      storage: {
        files: 90, // 3 months
        autoCleanup: true,
        cleanupCron: "0 4 * * *", // 4 AM daily
      },
    },

    logging: {
      level: "info",
      enableConsole: true,
      enableFile: true,
    },

    retryAttempts: 4,
    dailyCron: "0 0 * * *",
    hourlyCron: "0 * * * *",
  },

  // 🏭 Production Environment
  production: {
    dbUri: process.env.PROD_DB_URI,
    uploadProvider: process.env.PROD_UPLOAD_PROVIDER || "s3",
    outputDirectory: "production-logs",
    fileFormat: "json",

    collections: {
      jobsCollectionName: "prod_jobs",
      logsCollectionName: "prod_logs",
      apiLogsCollectionName: "prod_apilogs",
    },

    // Production cloud storage
    s3: {
      accessKeyId: process.env.PROD_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.PROD_AWS_SECRET_ACCESS_KEY,
      region: process.env.PROD_AWS_REGION || "us-east-1",
      bucket: process.env.PROD_S3_BUCKET,
    },

    gcs: {
      projectId: process.env.PROD_GCP_PROJECT_ID,
      keyFilename: process.env.PROD_GCP_KEY_FILE,
      bucket: process.env.PROD_GCS_BUCKET,
    },

    azure: {
      connectionString: process.env.PROD_AZURE_STORAGE_CONNECTION_STRING,
      containerName: process.env.PROD_AZURE_CONTAINER_NAME,
    },

    // Production retention (long-term)
    retention: {
      database: {
        apiLogs: 30, // 1 month
        jobs: 365, // 1 year
        logs: 90, // 3 months
        autoCleanup: true,
        cleanupCron: "0 2 * * *", // 2 AM daily
      },
      storage: {
        files: 730, // 2 years
        autoCleanup: true,
        cleanupCron: "0 3 * * *", // 3 AM daily
        // S3 lifecycle for cost optimization
        s3Lifecycle: {
          transitionToIA: 60, // Move to IA after 2 months
          transitionToGlacier: 180, // Move to Glacier after 6 months
          transitionToDeepArchive: 365, // Deep Archive after 1 year
          expiration: 730, // Delete after 2 years
        },
      },
    },

    logging: {
      level: "warn",
      enableConsole: false,
      enableFile: true,
    },

    retryAttempts: 5,
    dailyCron: "0 0 * * *",
    hourlyCron: "0 * * * *",
  },
};

// Initialize based on current environment
async function initializeForEnvironment() {
  const env = process.env.NODE_ENV || "development";
  const config = environmentConfigs[env];

  if (!config) {
    throw new Error(`❌ Unsupported environment: ${env}`);
  }

  console.log(`🌍 Initializing for ${env} environment`);
  console.log(`📂 Output directory: ${config.outputDirectory}`);
  console.log(`☁️ Upload provider: ${config.uploadProvider}`);
  console.log(`📊 Log level: ${config.logging.level}`);

  // Initialize main service
  const { db } = await init(config);

  // Initialize retention if configured
  if (config.retention) {
    await initRetention(config, db);
    console.log(
      `🗑️ Retention: API logs ${config.retention.database.apiLogs} days, Files ${config.retention.storage.files} days`
    );
  }

  // Create daily jobs
  await createDailyJobs(null, config);

  console.log(`✅ ${env} environment initialized successfully`);
  return { env, config, db };
}

// Usage
initializeForEnvironment().catch(console.error);
```

### Multi-Environment with Multiple Databases

```javascript
// Different databases for different environments
const multiEnvironmentDatabases = {
  development: {
    userService: {
      dbType: "mongodb",
      dbUri:
        process.env.DEV_USER_DB_URI || "mongodb://localhost:27017/dev_users",
      uploadProvider: "local",
      collections: { apiLogsCollectionName: "dev_user_apilogs" },
      retention: { database: { apiLogs: 3 }, storage: { files: 14 } },
    },

    orderService: {
      dbType: "postgresql",
      dbUri:
        process.env.DEV_ORDER_DB_URI ||
        "postgresql://user:pass@localhost:5432/dev_orders",
      uploadProvider: "local",
      tables: { apiLogsTableName: "dev_order_apilogs" },
      retention: { database: { apiLogs: 5 }, storage: { files: 14 } },
    },
  },

  staging: {
    userService: {
      dbType: "mongodb",
      dbUri: process.env.STAGING_USER_DB_URI,
      uploadProvider: "s3",
      collections: { apiLogsCollectionName: "staging_user_apilogs" },
      retention: { database: { apiLogs: 14 }, storage: { files: 90 } },
      s3: {
        accessKeyId: process.env.STAGING_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.STAGING_AWS_SECRET_ACCESS_KEY,
        region: "us-east-1",
        bucket: process.env.STAGING_USER_S3_BUCKET,
      },
    },

    orderService: {
      dbType: "postgresql",
      dbUri: process.env.STAGING_ORDER_DB_URI,
      uploadProvider: "gcs",
      tables: { apiLogsTableName: "staging_order_apilogs" },
      retention: { database: { apiLogs: 14 }, storage: { files: 90 } },
      gcs: {
        projectId: process.env.STAGING_GCP_PROJECT_ID,
        keyFilename: process.env.STAGING_GCP_KEY_FILE,
        bucket: process.env.STAGING_ORDER_GCS_BUCKET,
      },
    },
  },

  production: {
    userService: {
      dbType: "mongodb",
      dbUri: process.env.PROD_USER_DB_URI,
      uploadProvider: "s3",
      collections: { apiLogsCollectionName: "prod_user_apilogs" },
      retention: { database: { apiLogs: 30 }, storage: { files: 730 } },
      s3: {
        accessKeyId: process.env.PROD_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.PROD_AWS_SECRET_ACCESS_KEY,
        region: "us-east-1",
        bucket: process.env.PROD_USER_S3_BUCKET,
      },
    },

    orderService: {
      dbType: "postgresql",
      dbUri: process.env.PROD_ORDER_DB_URI,
      uploadProvider: "gcs",
      tables: { apiLogsTableName: "prod_order_apilogs" },
      retention: { database: { apiLogs: 30 }, storage: { files: 730 } },
      gcs: {
        projectId: process.env.PROD_GCP_PROJECT_ID,
        keyFilename: process.env.PROD_GCP_KEY_FILE,
        bucket: process.env.PROD_ORDER_GCS_BUCKET,
      },
    },

    analyticsService: {
      dbType: "mysql",
      dbUri: process.env.PROD_ANALYTICS_DB_URI,
      uploadProvider: "azure",
      tables: { apiLogsTableName: "prod_analytics_apilogs" },
      retention: { database: { apiLogs: 90 }, storage: { files: 1095 } },
      azure: {
        connectionString: process.env.PROD_AZURE_STORAGE_CONNECTION_STRING,
        containerName: process.env.PROD_ANALYTICS_AZURE_CONTAINER,
      },
    },
  },
};

async function initializeMultiEnvironmentDatabases() {
  const env = process.env.NODE_ENV || "development";
  const databases = multiEnvironmentDatabases[env];

  if (!databases) {
    throw new Error(`❌ No database configuration for environment: ${env}`);
  }

  console.log(
    `🌍 Initializing ${
      Object.keys(databases).length
    } databases for ${env} environment`
  );

  const results = [];
  for (const [serviceName, config] of Object.entries(databases)) {
    try {
      console.log(`🔧 Setting up ${serviceName} (${config.dbType})...`);

      const { db } = await init(config);

      if (config.retention) {
        await initRetention(config, db);
      }

      await createDailyJobs(null, config);

      results.push({
        service: serviceName,
        dbType: config.dbType,
        uploadProvider: config.uploadProvider,
        status: "success",
      });

      console.log(
        `✅ ${serviceName} (${config.dbType}) initialized successfully`
      );
    } catch (error) {
      results.push({
        service: serviceName,
        dbType: config.dbType,
        status: "failed",
        error: error.message,
      });
      console.error(`❌ ${serviceName} failed:`, error.message);
    }
  }

  console.log(`\n📊 ${env} Environment Summary:`);
  results.forEach((result) => {
    const status = result.status === "success" ? "✅" : "❌";
    console.log(
      `${status} ${result.service} (${result.dbType}) - ${
        result.uploadProvider || "local"
      }`
    );
  });

  return results;
}

// Usage
initializeMultiEnvironmentDatabases().catch(console.error);
```

### Express.js Multi-Environment Integration

```javascript
const express = require("express");
const { init, createApiLogMiddleware } = require("logstack");

const app = express();

// Environment-specific Express setup
async function setupExpressForEnvironment() {
  const env = process.env.NODE_ENV || "development";

  // Get environment-specific configuration
  const config = environmentConfigs[env];

  // Initialize log service
  await init(config);

  // Create environment-specific middleware
  const apiLogMiddleware = createApiLogMiddleware(config);

  // Apply middleware
  app.use(apiLogMiddleware);

  // Environment-specific middleware
  if (env === "development") {
    // Development-specific middleware
    app.use((req, res, next) => {
      console.log(`🔧 DEV: ${req.method} ${req.path}`);
      next();
    });
  }

  if (env === "production") {
    // Production-specific middleware
    app.use(require("helmet")()); // Security headers
    app.use(require("compression")()); // Gzip compression
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      environment: env,
      timestamp: new Date().toISOString(),
      uploadProvider: config.uploadProvider,
      retention: config.retention?.database?.apiLogs + " days",
    });
  });

  app.get("/api/config", (req, res) => {
    // Only show config in non-production environments
    if (env === "production") {
      return res
        .status(403)
        .json({ error: "Configuration not available in production" });
    }

    res.json({
      environment: env,
      outputDirectory: config.outputDirectory,
      uploadProvider: config.uploadProvider,
      logLevel: config.logging.level,
      retention: config.retention,
    });
  });

  const port = process.env.PORT || (env === "production" ? 8080 : 3000);

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port} (${env} environment)`);
    console.log(`📊 Upload provider: ${config.uploadProvider}`);
    console.log(`📂 Output directory: ${config.outputDirectory}`);
  });
}

setupExpressForEnvironment().catch(console.error);
```

````

### Database-Specific Connection Examples

```javascript
// MongoDB Connection Examples
const mongoConfigs = {
  // Local MongoDB
  mongoLocal: {
    dbType: "mongodb",
    dbUri: "mongodb://localhost:27017/myapp",
  },

  // MongoDB Atlas (Cloud)
  mongoAtlas: {
    dbType: "mongodb",
    dbUri:
      "mongodb+srv://username:password@cluster.mongodb.net/myapp?retryWrites=true&w=majority",
  },

  // MongoDB with authentication
  mongoAuth: {
    dbType: "mongodb",
    dbUri: "mongodb://username:password@localhost:27017/myapp?authSource=admin",
  },
};

// PostgreSQL Connection Examples
const postgresConfigs = {
  // Local PostgreSQL
  postgresLocal: {
    dbType: "postgresql",
    dbUri: "postgresql://username:password@localhost:5432/myapp",
  },

  // Amazon RDS PostgreSQL
  postgresRDS: {
    dbType: "postgresql",
    dbUri:
      "postgresql://username:password@myinstance.123456789012.us-east-1.rds.amazonaws.com:5432/myapp",
  },

  // Google Cloud SQL PostgreSQL
  postgresGCP: {
    dbType: "postgresql",
    dbUri: "postgresql://username:password@1.2.3.4:5432/myapp?sslmode=require",
  },
};

// MySQL Connection Examples
const mysqlConfigs = {
  // Local MySQL
  mysqlLocal: {
    dbType: "mysql",
    dbUri: "mysql://username:password@localhost:3306/myapp",
  },

  // Amazon RDS MySQL
  mysqlRDS: {
    dbType: "mysql",
    dbUri:
      "mysql://username:password@myinstance.123456789012.us-east-1.rds.amazonaws.com:3306/myapp",
  },

  // PlanetScale MySQL
  mysqlPlanetScale: {
    dbType: "mysql",
    dbUri:
      "mysql://username:password@aws.connect.psdb.cloud/myapp?ssl={'rejectUnauthorized':true}",
  },
};

// SQL Server Connection Examples
const sqlServerConfigs = {
  // Local SQL Server
  sqlServerLocal: {
    dbType: "sqlserver",
    dbUri: "mssql://username:password@localhost:1433/myapp",
  },

  // Azure SQL Database
  sqlServerAzure: {
    dbType: "sqlserver",
    dbUri:
      "mssql://username:password@myserver.database.windows.net:1433/myapp?encrypt=true",
  },
};

// Redis Connection Examples
const redisConfigs = {
  // Local Redis
  redisLocal: {
    dbType: "redis",
    dbUri: "redis://localhost:6379/0",
  },

  // Redis with password
  redisAuth: {
    dbType: "redis",
    dbUri: "redis://:password@localhost:6379/0",
  },

  // Redis Cloud
  redisCloud: {
    dbType: "redis",
    dbUri:
      "redis://:password@redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345/0",
  },

  // AWS ElastiCache Redis
  redisElastiCache: {
    dbType: "redis",
    dbUri: "redis://my-cluster.abc123.cache.amazonaws.com:6379/0",
  },
};
````

### Express.js Multi-Database Type Integration

```javascript
const express = require("express");
const { init, createApiLogMiddleware } = require("logstack");

const app = express();

// Different database types for different services
const dbConfigs = {
  userServiceMongo: {
    dbType: "mongodb",
    dbUri: "mongodb://localhost:27017/users",
    uploadProvider: "s3",
    collections: { apiLogsCollectionName: "mongo_user_api_logs" },
  },

  orderServicePostgres: {
    dbType: "postgresql",
    dbUri: "postgresql://user:pass@localhost:5432/orders",
    uploadProvider: "gcs",
    tables: { apiLogsTableName: "postgres_order_api_logs" },
  },

  paymentServiceMySQL: {
    dbType: "mysql",
    dbUri: "mysql://user:pass@localhost:3306/payments",
    uploadProvider: "azure",
    tables: { apiLogsTableName: "mysql_payment_api_logs" },
  },

  cacheServiceRedis: {
    dbType: "redis",
    dbUri: "redis://localhost:6379/0",
    uploadProvider: "local",
    keys: { apiLogsKeyPrefix: "redis_cache_api_logs:" },
  },
};

async function setupMultiDbTypeApp() {
  // Initialize all database configurations
  for (const [serviceName, config] of Object.entries(dbConfigs)) {
    await init(config);
    console.log(`✅ ${serviceName} (${config.dbType}) database initialized`);
  }

  // Create middleware for each service with different database types
  const userMiddleware = createApiLogMiddleware(dbConfigs.userServiceMongo);
  const orderMiddleware = createApiLogMiddleware(
    dbConfigs.orderServicePostgres
  );
  const paymentMiddleware = createApiLogMiddleware(
    dbConfigs.paymentServiceMySQL
  );
  const cacheMiddleware = createApiLogMiddleware(dbConfigs.cacheServiceRedis);

  // Apply middleware to specific routes
  app.use("/api/users", userMiddleware); // MongoDB logging
  app.use("/api/orders", orderMiddleware); // PostgreSQL logging
  app.use("/api/payments", paymentMiddleware); // MySQL logging
  app.use("/api/cache", cacheMiddleware); // Redis logging

  // Routes
  app.get("/api/users/:id", (req, res) => {
    res.json({ user: { id: req.params.id, database: "MongoDB" } });
  });

  app.post("/api/orders", (req, res) => {
    res.json({ order: { id: "12345", database: "PostgreSQL" } });
  });

  app.post("/api/payments", (req, res) => {
    res.json({ payment: { status: "success", database: "MySQL" } });
  });

  app.get("/api/cache/:key", (req, res) => {
    res.json({ cache: { key: req.params.key, database: "Redis" } });
  });

  app.listen(3000, () => {
    console.log("🚀 Multi-database type API server running on port 3000");
    console.log(
      "📊 Using MongoDB, PostgreSQL, MySQL, and Redis simultaneously"
    );
  });
}

setupMultiDbTypeApp();
```

```javascript
const { init, createDailyJobs } = require("logstack");

// Configuration for multiple databases
const databases = {
  // E-commerce application
  ecommerce: {
    dbUri: "mongodb://localhost:27017/ecommerce",
    uploadProvider: "s3",
    outputDirectory: "ecommerce-logs",
    collections: {
      jobsCollectionName: "ecommerce_jobs",
      logsCollectionName: "ecommerce_logs",
      apiLogsCollectionName: "ecommerce_apilogs",
    },
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "us-east-1",
      bucket: "ecommerce-api-logs",
    },
  },

  // User management system
  userManagement: {
    dbUri: "mongodb://localhost:27017/users",
    uploadProvider: "gcs",
    outputDirectory: "user-logs",
    collections: {
      jobsCollectionName: "user_jobs",
      logsCollectionName: "user_logs",
      apiLogsCollectionName: "user_apilogs",
    },
    gcs: {
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEY_FILE,
      bucket: "user-management-logs",
    },
  },

  // Analytics service
  analytics: {
    dbUri: "mongodb://localhost:27017/analytics",
    uploadProvider: "azure",
    outputDirectory: "analytics-logs",
    collections: {
      jobsCollectionName: "analytics_jobs",
      logsCollectionName: "analytics_logs",
      apiLogsCollectionName: "analytics_apilogs",
    },
    azure: {
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
      containerName: "analytics-logs",
    },
  },
};

async function setupMultipleDatabases() {
  // Initialize each database configuration
  for (const [dbName, config] of Object.entries(databases)) {
    try {
      console.log(`🔧 Initializing ${dbName} database...`);

      await init(config);
      await createDailyJobs(null, config);

      console.log(`✅ ${dbName} database initialized successfully`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${dbName}:`, error.message);
    }
  }

  console.log("🚀 All databases initialized!");
}

setupMultipleDatabases();
```

### Environment-Based Multi-Database Configuration

```javascript
const { init, createDailyJobs } = require("logstack");

// Define database configurations for different environments
const getMultiDbConfig = (env = "development") => {
  const baseConfig = {
    retryAttempts: 3,
    logging: { level: "info", enableFile: true },
  };

  return {
    // Main application database
    mainApp: {
      ...baseConfig,
      dbUri: process.env[`${env.toUpperCase()}_MAIN_DB_URI`],
      uploadProvider: env === "production" ? "s3" : "local",
      outputDirectory: `${env}-main-logs`,
      collections: {
        jobsCollectionName: `${env}_main_jobs`,
        logsCollectionName: `${env}_main_logs`,
        apiLogsCollectionName: `${env}_main_apilogs`,
      },
      s3:
        env === "production"
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              region: process.env.AWS_REGION,
              bucket: process.env.MAIN_S3_BUCKET,
            }
          : undefined,
    },

    // Microservice 1 database
    microservice1: {
      ...baseConfig,
      dbUri: process.env[`${env.toUpperCase()}_MICRO1_DB_URI`],
      uploadProvider: env === "production" ? "gcs" : "local",
      outputDirectory: `${env}-micro1-logs`,
      collections: {
        jobsCollectionName: `${env}_micro1_jobs`,
        logsCollectionName: `${env}_micro1_logs`,
        apiLogsCollectionName: `${env}_micro1_apilogs`,
      },
      gcs:
        env === "production"
          ? {
              projectId: process.env.GCP_PROJECT_ID,
              keyFilename: process.env.GCP_KEY_FILE,
              bucket: process.env.MICRO1_GCS_BUCKET,
            }
          : undefined,
    },

    // Analytics database
    analytics: {
      ...baseConfig,
      dbUri: process.env[`${env.toUpperCase()}_ANALYTICS_DB_URI`],
      uploadProvider: env === "production" ? "azure" : "local",
      outputDirectory: `${env}-analytics-logs`,
      collections: {
        jobsCollectionName: `${env}_analytics_jobs`,
        logsCollectionName: `${env}_analytics_logs`,
        apiLogsCollectionName: `${env}_analytics_apilogs`,
      },
      azure:
        env === "production"
          ? {
              connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
              containerName: `analytics-${env}`,
            }
          : undefined,
    },
  };
};

async function initializeByEnvironment() {
  const env = process.env.NODE_ENV || "development";
  const configs = getMultiDbConfig(env);

  console.log(`🌍 Initializing for ${env} environment`);

  const results = await Promise.allSettled(
    Object.entries(configs).map(async ([dbName, config]) => {
      console.log(`🔧 Setting up ${dbName}...`);
      await init(config);
      await createDailyJobs(null, config);
      return { dbName, status: "success" };
    })
  );

  // Report results
  results.forEach((result, index) => {
    const dbName = Object.keys(configs)[index];
    if (result.status === "fulfilled") {
      console.log(`✅ ${dbName}: Initialized successfully`);
    } else {
      console.error(`❌ ${dbName}: Failed -`, result.reason.message);
    }
  });
}

initializeByEnvironment();
```

### Individual Database Management

```javascript
const { init, processSpecificHour, getJobStatus } = require("logstack");

class MultiDatabaseManager {
  constructor() {
    this.databases = new Map();
  }

  // Register a database configuration
  async registerDatabase(name, config) {
    try {
      await init(config);
      this.databases.set(name, config);
      console.log(`✅ Database '${name}' registered successfully`);
    } catch (error) {
      console.error(`❌ Failed to register database '${name}':`, error.message);
      throw error;
    }
  }

  // Process specific hour for a specific database
  async processDatabase(dbName, date, hour) {
    const config = this.databases.get(dbName);
    if (!config) {
      throw new Error(`Database '${dbName}' not found`);
    }

    try {
      await processSpecificHour(date, hour, config);
      console.log(`✅ Processed ${dbName} for ${date} ${hour}:00`);
    } catch (error) {
      console.error(`❌ Failed to process ${dbName}:`, error.message);
      throw error;
    }
  }

  // Process all registered databases
  async processAllDatabases(date, hour) {
    const results = [];

    for (const [dbName, config] of this.databases) {
      try {
        await processSpecificHour(date, hour, config);
        results.push({ database: dbName, status: "success" });
        console.log(`✅ ${dbName}: Processed successfully`);
      } catch (error) {
        results.push({
          database: dbName,
          status: "failed",
          error: error.message,
        });
        console.error(`❌ ${dbName}: Failed -`, error.message);
      }
    }

    return results;
  }

  // Get status for all databases
  async getAllStatus(date, hourRange) {
    const statuses = {};

    for (const [dbName, config] of this.databases) {
      try {
        statuses[dbName] = await getJobStatus(date, hourRange, config);
      } catch (error) {
        statuses[dbName] = { error: error.message };
      }
    }

    return statuses;
  }

  // List registered databases
  listDatabases() {
    return Array.from(this.databases.keys());
  }
}

// Usage example
async function managementExample() {
  const manager = new MultiDatabaseManager();

  // Register databases
  await manager.registerDatabase("ecommerce", {
    dbUri: "mongodb://localhost:27017/ecommerce",
    uploadProvider: "s3",
    collections: { apiLogsCollectionName: "ecommerce_apilogs" },
    s3: {
      /* S3 config */
    },
  });

  await manager.registerDatabase("users", {
    dbUri: "mongodb://localhost:27017/users",
    uploadProvider: "gcs",
    collections: { apiLogsCollectionName: "user_apilogs" },
    gcs: {
      /* GCS config */
    },
  });

  // Process specific database
  await manager.processDatabase("ecommerce", "2025-09-02", 14);

  // Process all databases
  const results = await manager.processAllDatabases("2025-09-02", 15);
  console.log("Processing results:", results);

  // Get status for all
  const statuses = await manager.getAllStatus("2025-09-02");
  console.log("All database statuses:", statuses);
}

managementExample();
```

### Express.js Multi-Database Integration

```javascript
const express = require("express");
const { init, createApiLogMiddleware } = require("logstack");

const app = express();

// Database configurations
const dbConfigs = {
  userService: {
    dbUri: "mongodb://localhost:27017/users",
    uploadProvider: "s3",
    collections: { apiLogsCollectionName: "user_api_logs" },
    s3: { bucket: "user-service-logs" /* other S3 config */ },
  },
  orderService: {
    dbUri: "mongodb://localhost:27017/orders",
    uploadProvider: "gcs",
    collections: { apiLogsCollectionName: "order_api_logs" },
    gcs: { bucket: "order-service-logs" /* other GCS config */ },
  },
  paymentService: {
    dbUri: "mongodb://localhost:27017/payments",
    uploadProvider: "azure",
    collections: { apiLogsCollectionName: "payment_api_logs" },
    azure: { containerName: "payment-logs" /* other Azure config */ },
  },
};

async function setupMultiServiceApp() {
  // Initialize all database configurations
  for (const [serviceName, config] of Object.entries(dbConfigs)) {
    await init(config);
    console.log(`✅ ${serviceName} database initialized`);
  }

  // Create middleware for each service
  const userMiddleware = createApiLogMiddleware(dbConfigs.userService);
  const orderMiddleware = createApiLogMiddleware(dbConfigs.orderService);
  const paymentMiddleware = createApiLogMiddleware(dbConfigs.paymentService);

  // Apply middleware to specific routes
  app.use("/api/users", userMiddleware);
  app.use("/api/orders", orderMiddleware);
  app.use("/api/payments", paymentMiddleware);

  // Routes
  app.get("/api/users/:id", (req, res) => {
    res.json({ user: { id: req.params.id } });
  });

  app.post("/api/orders", (req, res) => {
    res.json({ order: { id: "12345" } });
  });

  app.post("/api/payments", (req, res) => {
    res.json({ payment: { status: "success" } });
  });

  app.listen(3000, () => {
    console.log("🚀 Multi-database API server running on port 3000");
  });
}

setupMultiServiceApp();
```

````

## 🎯 Node.js Implementation Examples

### Basic Express.js Integration

```javascript
const express = require("express");
const { init, createApiLogMiddleware } = require("logstack");

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
````

### 🔄 Automatic Scheduling (How It Works)

```javascript
const { init } = require("logstack");

async function startService() {
  await init({
    dbUri: process.env.DB_URI,
    uploadProvider: "s3",

    // 🕐 Cron Configuration (optional - these are defaults)
    dailyCron: "0 0 * * *", // Create daily jobs at midnight
    hourlyCron: "0 * * * *", // Process hourly at minute 0
  });

  // ✅ That's it! The service now runs automatically:
  //
  // 🌅 Every day at midnight (00:00):
  //    → Creates 24 hourly jobs for the new day
  //    → Jobs: 00-01, 01-02, 02-03, ..., 23-24
  //
  // ⏰ Every hour (at minute 0):
  //    → Processes the current hour's API logs
  //    → Uploads processed file to cloud storage
  //    → Updates job status to 'completed'
  //
  // 🔄 Continuous operation - no manual intervention needed!

  console.log("🚀 Automated log processing service started");
  console.log("🔄 Jobs create daily, process hourly automatically");
}

startService();
```

### AWS S3 Production Setup

```javascript
const { init, createDailyJobs } = require("logstack");

const productionConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",
  outputDirectory: "production-logs",

  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
    apiLogsCollectionName: "prod_apilogs",
  },

  // 🗑️ Log Retention Configuration
  retention: {
    database: {
      apiLogs: 14, // Keep API logs for 14 days
      jobs: 90, // Keep job records for 90 days
      logs: 60, // Keep processing logs for 60 days
      autoCleanup: true, // Enable automatic cleanup
      cleanupCron: "0 2 * * *", // Run at 2 AM daily
    },
    storage: {
      files: 180, // Keep files for 180 days
      autoCleanup: true, // Enable automatic file cleanup
      s3Lifecycle: {
        transitionToIA: 30, // Move to Infrequent Access after 30 days
        transitionToGlacier: 90, // Move to Glacier after 90 days
        expiration: 2555, // Delete after 7 years
      },
    },
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

  // ✅ Jobs are created automatically daily by the cron scheduler
  // No need to manually create jobs for multiple days

  // Optional: Create today's jobs immediately if needed
  await createDailyJobs(); // Creates jobs for today

  console.log("✅ Production deployment complete");
  console.log("🔄 Daily jobs will be created automatically at midnight");
  console.log("⚡ Hourly processing will run automatically");
}

deployProduction();
```

### 📦 File Compression Examples

```javascript
const { init, createDailyJobs } = require("logstack");

// Basic compression setup
const basicCompressionConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "local",
  outputDirectory: "compressed-logs",

  // 📦 Enable basic compression
  compression: {
    enabled: true,
    format: "gzip", // Default format
    level: 6, // Balanced compression
    fileSize: 1024, // Compress files > 1KB
  },

  collections: {
    jobsCollectionName: "comp_jobs",
    logsCollectionName: "comp_logs",
    apiLogsCollectionName: "comp_apilogs",
  },
};

// Production compression with S3
const s3CompressionConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",

  // 📦 High-efficiency compression for cloud storage
  compression: {
    enabled: true,
    format: "brotli", // Best compression ratio
    level: 8, // High compression for storage savings
    fileSize: 512, // Compress smaller files in production
  },

  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.S3_BUCKET,
  },

  // 🗑️ Retention with compressed files
  retention: {
    storage: {
      files: 365, // Keep compressed files longer
      autoCleanup: true,
      s3Lifecycle: {
        transitionToIA: 30,
        transitionToGlacier: 90,
        expiration: 2555,
      },
    },
  },
};

// Development setup (no compression for debugging)
const devConfig = {
  dbUri: "mongodb://localhost:27017/logstack-dev",
  uploadProvider: "local",

  // 📦 Disable compression in development
  compression: {
    enabled: false, // Easier to read uncompressed files
  },
};

async function setupCompression() {
  console.log("📦 Setting up file compression...");

  // Choose config based on environment
  const config =
    process.env.NODE_ENV === "production"
      ? s3CompressionConfig
      : process.env.NODE_ENV === "development"
      ? devConfig
      : basicCompressionConfig;

  await init(config);
  await createDailyJobs();

  console.log("✅ Compression configured successfully");
  console.log(`📝 Format: ${config.compression?.format || "none"}`);
  console.log(`🎛️ Level: ${config.compression?.level || "n/a"}`);
  console.log(`📏 Min size: ${config.compression?.fileSize || "n/a"} bytes`);
}

setupCompression();

// 🎯 Compression Benefits:
// • Reduced storage costs (up to 70% smaller files)
// • Faster uploads to cloud storage
// • Lower bandwidth usage
// • Better performance for large datasets
```

### 🔒 Sensitive Data Masking Examples

```javascript
const { init, createDailyJobs, saveApiLog } = require("logstack");

// Basic data masking setup
const basicMaskingConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "local",
  outputDirectory: "masked-logs",

  // 🔒 Enable basic data masking
  dataMasking: {
    enabled: true,
    maskEmails: true,
    maskIPs: false,
    showLastChars: 0, // Full masking
    customFields: ["user_id", "session_token"],
  },

  collections: {
    jobsCollectionName: "masked_jobs",
    logsCollectionName: "masked_logs",
    apiLogsCollectionName: "masked_apilogs",
  },
};

// Production masking with strict privacy
const productionMaskingConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",

  // 🔒 Strict production masking
  dataMasking: {
    enabled: true,
    maskingChar: "*",
    preserveLength: false,
    showLastChars: 0, // No characters visible
    maskEmails: true,
    maskIPs: true, // Mask IP addresses in production
    maskConnectionStrings: true,

    // Custom sensitive fields
    customFields: ["user_id", "session_id", "transaction_id"],
    exemptFields: ["timestamp", "method", "status_code"],

    // Custom patterns for API keys
    customPatterns: {
      api_token: /ak_[a-zA-Z0-9]{24}/g,
      session_token: /sess_[a-zA-Z0-9]{32}/g,
    },
  },

  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.S3_BUCKET,
  },
};

// Development setup (minimal masking for debugging)
const devMaskingConfig = {
  dbUri: "mongodb://localhost:27017/logstack-dev",
  uploadProvider: "local",

  // 🔒 Light masking for development
  dataMasking: {
    enabled: true,
    showLastChars: 4, // Show last 4 characters for debugging
    maskEmails: false, // Don't mask emails in dev
    maskIPs: false,
    customFields: ["password", "credit_card"], // Only critical data
  },
};

async function setupMasking() {
  console.log("🔒 Setting up data masking...");

  // Choose config based on environment
  const config =
    process.env.NODE_ENV === "production"
      ? productionMaskingConfig
      : process.env.NODE_ENV === "development"
      ? devMaskingConfig
      : basicMaskingConfig;

  await init(config);

  // Example: Save API log with automatic masking
  await saveApiLog(
    {
      method: "POST",
      path: "/api/auth/login",
      requestBody: {
        email: "user@example.com",
        password: "secretPassword123", // Will be automatically masked
      },
      client_ip: "192.168.1.100",
      responseStatus: 200,
    },
    config
  );

  console.log("✅ Data masking configured successfully");
  console.log(`🔒 Emails masked: ${config.dataMasking?.maskEmails}`);
  console.log(`🔒 IPs masked: ${config.dataMasking?.maskIPs}`);
  console.log(`🔒 Show last chars: ${config.dataMasking?.showLastChars}`);
}

setupMasking();

// 🎯 Masking Benefits:
// • Protects PII and sensitive data
// • GDPR/HIPAA compliance
// • Secure logs and data exports
// • Configurable per environment
```

### 📁 Configurable Folder Structure Examples

logstack supports flexible folder organization for your log files and uploads. You can configure daily, monthly, yearly structures with custom sub-folders.

```javascript
const { init, createDailyJobs } = require("logstack");

// 📁 Simple daily structure (default)
const dailyConfig = {
  dbUri: "mongodb://localhost:27017/logstack",
  uploadProvider: "local",
  outputDirectory: "logs",

  // 📁 Daily folders: 2024-01-15/file.json
  folderStructure: {
    type: "daily", // Creates folders like: 2024-01-15
    subFolders: {
      enabled: false,
    },
  },
};

// 📁 Organized daily structure with sub-folders
const organizedConfig = {
  dbUri: "mongodb://localhost:27017/logstack",
  uploadProvider: "local",
  outputDirectory: "organized-logs",

  // 📁 Daily with hour sub-folders: 2024-01-15/hour-14-15/file.json
  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      byHour: true, // Creates hour-based sub-folders
      byStatus: false, // Skip status-based sub-folders
    },
  },
};

// 📁 Monthly organization for large datasets
const monthlyConfig = {
  dbUri: "mongodb://localhost:27017/logstack",
  uploadProvider: "s3",

  // 📁 Monthly folders: logs_2024-01_data/file.json
  folderStructure: {
    type: "monthly", // Creates folders like: 2024-01
    subFolders: {
      enabled: true,
      byStatus: true, // success/failed sub-folders
    },
    naming: {
      prefix: "logs", // Prefix folder names
      suffix: "data", // Suffix folder names
    },
  },

  s3: {
    bucket: "my-log-bucket",
    // ... other S3 settings
  },
};

// 📁 Production structure with detailed organization
const productionConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",

  // 📁 Detailed organization: prod-logs_2024-01-15/hour-14-15/success/processed/validated/
  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      byHour: true, // Hour-based folders
      byStatus: true, // Status-based folders
      custom: ["processed", "validated"], // Custom processing stages
    },
    naming: {
      dateFormat: "YYYY-MM-DD",
      prefix: "prod-logs",
      includeTime: false,
    },
  },
};

// 📁 Custom pattern structure
const customPatternConfig = {
  dbUri: "mongodb://localhost:27017/logstack",
  uploadProvider: "local",

  // 📁 Custom nested pattern: 2024/01/15/hour-14-15/file.json
  folderStructure: {
    pattern: "YYYY/MM/DD", // Custom date pattern
    subFolders: {
      enabled: true,
      byHour: true,
    },
  },
};

// 📁 Yearly archival structure
const yearlyArchiveConfig = {
  dbUri: "mongodb://localhost:27017/logstack-archive",
  uploadProvider: "s3",

  // 📁 Yearly organization: archive_2024/success/file.json
  folderStructure: {
    type: "yearly", // Creates folders like: 2024
    subFolders: {
      enabled: true,
      byStatus: true, // For archival quality control
    },
    naming: {
      prefix: "archive",
    },
  },
};

async function setupFolderStructure() {
  console.log("📁 Setting up folder structure...");

  // Choose configuration based on your needs
  const config =
    process.env.NODE_ENV === "production" ? productionConfig : organizedConfig;

  await init(config);
  await createDailyJobs();

  console.log("✅ Folder structure configured successfully");
  console.log(`📁 Structure type: ${config.folderStructure?.type || "daily"}`);
  console.log(
    `📁 Sub-folders enabled: ${
      config.folderStructure?.subFolders?.enabled || false
    }`
  );
}

setupFolderStructure();

// 📁 Available Folder Structure Types:
// • daily: 2024-01-15 (default, best for daily processing)
// • monthly: 2024-01 (best for large datasets, monthly reports)
// • yearly: 2024 (best for long-term archival)
// • custom pattern: YYYY/MM/DD (flexible custom organization)

// 🎯 Sub-Folder Options:
// • byHour: hour-14-15 (helpful for debugging specific time ranges)
// • byStatus: success/failed (quality control and error tracking)
// • custom: ['processed', 'validated'] (multi-stage processing pipelines)

// 📋 Common Use Cases:
// • Development: Simple daily structure
// • Staging: Daily with hour sub-folders
// • Production: Daily with hour, status, and custom sub-folders
// • Analytics: Monthly structure for large datasets
// • Compliance: Yearly structure for long-term archival
```

### Google Cloud Storage Setup

```javascript
const { init, createDailyJobs } = require("logstack");

const gcsConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "gcs",
  outputDirectory: "production-logs",

  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
    apiLogsCollectionName: "prod_apilogs",
  },

  gcs: {
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GCP_KEY_FILE, // Path to service account JSON
    bucket: process.env.GCS_BUCKET,
  },

  // 🗑️ Log Retention Configuration
  retention: {
    database: {
      apiLogs: 14,
      jobs: 90,
      logs: 60,
      autoCleanup: true,
      cleanupCron: "0 2 * * *",
    },
    storage: {
      files: 180,
      autoCleanup: true,
    },
  },

  retryAttempts: 5,
  logging: { level: "info", enableFile: true },
};

async function deployGoogleCloud() {
  await init(gcsConfig);
  await createDailyJobs();

  console.log("✅ Google Cloud Storage deployment complete");
  console.log("🔄 Daily jobs will be created automatically at midnight");
  console.log("⚡ Hourly processing will run automatically");
}

deployGoogleCloud();
```

### Azure Blob Storage Setup

```javascript
const { init, createDailyJobs } = require("logstack");

const azureConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "azure",
  outputDirectory: "production-logs",

  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
    apiLogsCollectionName: "prod_apilogs",
  },

  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: process.env.AZURE_CONTAINER_NAME,
  },

  // 🗑️ Log Retention Configuration
  retention: {
    database: {
      apiLogs: 14,
      jobs: 90,
      logs: 60,
      autoCleanup: true,
      cleanupCron: "0 2 * * *",
    },
    storage: {
      files: 180,
      autoCleanup: true,
    },
  },

  retryAttempts: 5,
  logging: { level: "info", enableFile: true },
};

async function deployAzure() {
  await init(azureConfig);
  await createDailyJobs();

  console.log("✅ Azure Blob Storage deployment complete");
  console.log("🔄 Daily jobs will be created automatically at midnight");
  console.log("⚡ Hourly processing will run automatically");
}

deployAzure();
```

### Multi-Environment Setup

```javascript
const { init } = require("logstack");

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
const { init, processSpecificHour, getApiLogs } = require("logstack");

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

## 🗑️ Log Retention & Cleanup

Automatically clean up old database records and cloud storage files to reduce costs and meet compliance requirements.

### Basic Retention Setup

```javascript
const { init, initRetention } = require("logstack");

const config = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",

  // 🗑️ Retention Configuration
  retention: {
    database: {
      apiLogs: 14, // Delete API logs after 14 days
      jobs: 90, // Delete job records after 90 days
      logs: 60, // Delete processing logs after 60 days
      autoCleanup: true, // Enable automatic cleanup
      cleanupCron: "0 2 * * *", // Run at 2 AM daily
    },
    storage: {
      files: 180, // Delete files after 180 days
      autoCleanup: true, // Enable automatic file cleanup
      cleanupCron: "0 3 * * *", // Run at 3 AM daily
    },
  },
};

async function setupWithRetention() {
  // Initialize main service
  const { db } = await init(config);

  // Initialize retention service (automatic cleanup will start)
  const retentionService = await initRetention(config, db);

  console.log("✅ Service initialized with automatic log retention");
}
```

### User-Configurable Retention Examples

Choose retention periods based on your specific needs:

```javascript
const { init, initRetention } = require("logstack");

// 🏢 Enterprise Configuration (Long-term compliance)
const enterpriseConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",
  retention: {
    database: {
      apiLogs: 30, // Keep API logs for 30 days in database
      jobs: 365, // Keep job records for 1 year
      logs: 180, // Keep processing logs for 6 months
      autoCleanup: true,
      cleanupCron: "0 2 * * *", // Daily at 2 AM
    },
    storage: {
      files: 2555, // Keep files for 7 years (compliance)
      autoCleanup: true,
      cleanupCron: "0 3 * * *", // Daily at 3 AM
      s3Lifecycle: {
        transitionToIA: 90, // Move to Infrequent Access after 3 months
        transitionToGlacier: 365, // Move to Glacier after 1 year
        transitionToDeepArchive: 1095, // Move to Deep Archive after 3 years
        expiration: 2555, // Delete after 7 years
      },
    },
  },
};

// 🚀 Startup Configuration (Cost-optimized)
const startupConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "gcs",
  retention: {
    database: {
      apiLogs: 7, // Keep API logs for 7 days only
      jobs: 30, // Keep job records for 30 days
      logs: 14, // Keep processing logs for 14 days
      autoCleanup: true,
      cleanupCron: "0 1 * * *", // Daily at 1 AM
    },
    storage: {
      files: 90, // Keep files for 90 days
      autoCleanup: true,
      cleanupCron: "0 4 * * *", // Daily at 4 AM
    },
  },
};

// 🏥 Healthcare Configuration (HIPAA compliant)
const healthcareConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "azure",
  retention: {
    database: {
      apiLogs: 45, // Keep API logs for 45 days
      jobs: 2555, // Keep job records for 7 years
      logs: 365, // Keep processing logs for 1 year
      autoCleanup: true,
      cleanupCron: "0 2 * * 0", // Weekly on Sunday at 2 AM
    },
    storage: {
      files: 2555, // Keep files for 7 years (HIPAA requirement)
      autoCleanup: true,
      cleanupCron: "0 3 * * 0", // Weekly on Sunday at 3 AM
    },
  },
};

// 💻 Development Configuration (Minimal storage)
const devConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "local",
  retention: {
    database: {
      apiLogs: 3, // Keep API logs for 3 days
      jobs: 7, // Keep job records for 7 days
      logs: 5, // Keep processing logs for 5 days
      autoCleanup: true,
      cleanupCron: "0 6 * * *", // Daily at 6 AM
    },
    storage: {
      files: 14, // Keep files for 14 days
      autoCleanup: true,
      cleanupCron: "0 7 * * *", // Daily at 7 AM
    },
  },
};

// 📊 Analytics Configuration (Medium-term storage)
const analyticsConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",
  retention: {
    database: {
      apiLogs: 60, // Keep API logs for 60 days
      jobs: 180, // Keep job records for 6 months
      logs: 90, // Keep processing logs for 3 months
      autoCleanup: true,
      cleanupCron: "0 3 * * *", // Daily at 3 AM
    },
    storage: {
      files: 730, // Keep files for 2 years
      autoCleanup: true,
      cleanupCron: "0 4 * * *", // Daily at 4 AM
      s3Lifecycle: {
        transitionToIA: 60, // Move to IA after 2 months
        transitionToGlacier: 180, // Move to Glacier after 6 months
        expiration: 730, // Delete after 2 years
      },
    },
  },
};

// Usage examples
async function setupCustomRetention() {
  const environment = process.env.NODE_ENV || "development";

  let config;
  switch (environment) {
    case "production":
      config =
        process.env.COMPANY_TYPE === "healthcare"
          ? healthcareConfig
          : enterpriseConfig;
      break;
    case "development":
      config = devConfig;
      break;
    case "analytics":
      config = analyticsConfig;
      break;
    default:
      config = startupConfig;
  }

  // Initialize with custom retention
  const { db } = await init(config);
  const retentionService = await initRetention(config, db);

  console.log(
    `✅ ${environment} environment initialized with custom retention`
  );
  console.log(`📅 Database cleanup: ${config.retention.database.cleanupCron}`);
  console.log(`🗂️ Storage cleanup: ${config.retention.storage.cleanupCron}`);
}

setupCustomRetention();
```

### Environment-Based Retention Configuration

```javascript
// Set retention periods via environment variables
const config = {
  dbUri: process.env.DB_URI,
  uploadProvider: process.env.UPLOAD_PROVIDER,
  retention: {
    database: {
      apiLogs: parseInt(process.env.DB_RETAIN_API_LOGS) || 14,
      jobs: parseInt(process.env.DB_RETAIN_JOBS) || 90,
      logs: parseInt(process.env.DB_RETAIN_LOGS) || 60,
      autoCleanup: process.env.DB_AUTO_CLEANUP === "true",
      cleanupCron: process.env.DB_CLEANUP_CRON || "0 2 * * *",
    },
    storage: {
      files: parseInt(process.env.STORAGE_RETAIN_FILES) || 180,
      autoCleanup: process.env.STORAGE_AUTO_CLEANUP === "true",
      cleanupCron: process.env.STORAGE_CLEANUP_CRON || "0 3 * * *",
    },
  },
};

// Environment variables example (.env file)
/*
# Database retention (days)
DB_RETAIN_API_LOGS=30
DB_RETAIN_JOBS=120
DB_RETAIN_LOGS=90
DB_AUTO_CLEANUP=true
DB_CLEANUP_CRON=0 2 * * *

# Storage retention (days)
STORAGE_RETAIN_FILES=365
STORAGE_AUTO_CLEANUP=true
STORAGE_CLEANUP_CRON=0 3 * * *

# Upload provider
UPLOAD_PROVIDER=s3
*/
```

### Multi-Database Retention Configuration

```javascript
// Different retention policies for different databases
const multiDbConfig = {
  userDatabase: {
    dbType: "mongodb",
    dbUri: process.env.USER_DB_URI,
    uploadProvider: "s3",
    retention: {
      database: {
        apiLogs: 7, // User data: short retention
        jobs: 30,
        logs: 14,
        autoCleanup: true,
      },
      storage: { files: 90, autoCleanup: true },
    },
  },

  analyticsDatabase: {
    dbType: "postgresql",
    dbUri: process.env.ANALYTICS_DB_URI,
    uploadProvider: "gcs",
    retention: {
      database: {
        apiLogs: 90, // Analytics: longer retention
        jobs: 365,
        logs: 180,
        autoCleanup: true,
      },
      storage: { files: 730, autoCleanup: true },
    },
  },

  complianceDatabase: {
    dbType: "mysql",
    dbUri: process.env.COMPLIANCE_DB_URI,
    uploadProvider: "azure",
    retention: {
      database: {
        apiLogs: 2555, // Compliance: 7 years
        jobs: 2555,
        logs: 365,
        autoCleanup: true,
      },
      storage: { files: 2555, autoCleanup: true },
    },
  },
};

// Initialize each database with its own retention policy
for (const [dbName, config] of Object.entries(multiDbConfig)) {
  await init(config);
  await initRetention(config);
  console.log(`✅ ${dbName} initialized with custom retention`);
}
```

### AWS S3 Cost Optimization

```javascript
const config = {
  retention: {
    storage: {
      files: 2555, // 7 years (compliance)

      // S3 Lifecycle for 90%+ cost savings
      s3Lifecycle: {
        transitionToIA: 30, // Move to Infrequent Access (50% cheaper)
        transitionToGlacier: 90, // Move to Glacier (80% cheaper)
        transitionToDeepArchive: 180, // Move to Deep Archive (95% cheaper)
        expiration: 2555, // Delete after 7 years
      },
    },
  },
};

// Automatically sets up S3 lifecycle policies
await initRetention(config, db);
```

### Manual Cleanup

```javascript
// Preview what will be deleted (dry run)
const preview = await retentionService.runManualCleanup({ dryRun: true });

// Actually clean up old data
const results = await retentionService.runManualCleanup({
  database: true, // Clean database records
  storage: true, // Clean storage files
});

console.log("Cleanup results:", results);
// Output: { database: { apiLogs: 1250, jobs: 45, logs: 230 }, storage: { deletedFiles: 67, deletedSize: "2.3 GB" } }
```

### Retention Statistics

```javascript
// Get current retention statistics
const stats = await retentionService.getRetentionStats();

console.log("📊 Retention Overview:");
console.log(
  `API Logs: ${stats.database.apiLogs.total} total, ${stats.database.apiLogs.oldRecords} old`
);
console.log(
  `Storage: ${stats.storage.totalFiles} files, ${stats.storage.oldFiles} old`
);
```

**💰 Cost Impact**: Typical savings of $1,340/year for 1GB daily logs with proper lifecycle policies!

## ☁️ Cloud Storage Setup

### 🌩️ AWS S3 Setup

1. **Create S3 Bucket**

   ```bash
   aws s3 mb s3://your-log-bucket --region us-east-1
   ```

2. **Create IAM User with S3 Permissions**

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::your-log-bucket",
           "arn:aws:s3:::your-log-bucket/*"
         ]
       }
     ]
   }
   ```

3. **Environment Variables**
   ```bash
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   S3_BUCKET=your-log-bucket
   ```

### 📁 Google Cloud Storage Setup

1. **Create GCS Bucket**

   ```bash
   # Install Google Cloud CLI
   curl https://sdk.cloud.google.com | bash
   gcloud init

   # Create bucket
   gsutil mb gs://your-log-bucket
   ```

2. **Create Service Account**

   ```bash
   # Create service account
   gcloud iam service-accounts create log-service-account \
     --display-name="Log Service Account"

   # Create and download key
   gcloud iam service-accounts keys create service-account-key.json \
     --iam-account=log-service-account@your-project.iam.gserviceaccount.com

   # Grant storage permissions
   gsutil iam ch serviceAccount:log-service-account@your-project.iam.gserviceaccount.com:roles/storage.objectAdmin gs://your-log-bucket
   ```

3. **Environment Variables**

   ```bash
   GCP_PROJECT_ID=your-project-id
   GCP_KEY_FILE=./service-account-key.json
   GCS_BUCKET=your-log-bucket
   ```

4. **Alternative: Using Application Default Credentials**

   ```bash
   # For local development
   gcloud auth application-default login

   # For production, use service account key
   export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
   ```

### 🔷 Azure Blob Storage Setup

1. **Create Storage Account**

   ```bash
   # Install Azure CLI
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   az login

   # Create resource group
   az group create --name myResourceGroup --location eastus

   # Create storage account
   az storage account create \
     --name mystorageaccount \
     --resource-group myResourceGroup \
     --location eastus \
     --sku Standard_LRS
   ```

2. **Create Container**

   ```bash
   # Get connection string
   az storage account show-connection-string \
     --name mystorageaccount \
     --resource-group myResourceGroup

   # Create container
   az storage container create \
     --name logs \
     --connection-string "your-connection-string"
   ```

3. **Environment Variables**

   ```bash
   AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=mystorageaccount;AccountKey=your-key;EndpointSuffix=core.windows.net"
   AZURE_CONTAINER_NAME=logs
   ```

4. **Alternative: Using SAS Token**
   ```bash
   # Generate SAS token
   az storage container generate-sas \
     --name logs \
     --permissions acdlrw \
     --expiry 2025-12-31 \
     --connection-string "your-connection-string"
   ```

### 🔄 Multi-Cloud Configuration

```javascript
const { init } = require("logstack");

const configs = {
  aws: {
    uploadProvider: "s3",
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucket: process.env.S3_BUCKET,
    },
  },

  gcp: {
    uploadProvider: "gcs",
    gcs: {
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEY_FILE,
      bucket: process.env.GCS_BUCKET,
    },
  },

  azure: {
    uploadProvider: "azure",
    azure: {
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
      containerName: process.env.AZURE_CONTAINER_NAME,
    },
  },
};

// Choose provider based on environment
const provider = process.env.CLOUD_PROVIDER || "aws";
const config = {
  dbUri: process.env.DB_URI,
  outputDirectory: "production-logs",
  ...configs[provider],
};

init(config);
```

## ⚙️ Configuration Options

```typescript
interface Config {
  dbType?:
    | "mongodb"
    | "postgresql"
    | "mysql"
    | "sqlserver"
    | "sqlite"
    | "redis"
    | "oracle"
    | "cassandra"; // Database type (default: 'mongodb')
  dbUri: string; // Database connection string
  uploadProvider: "local" | "s3" | "gcs" | "azure";
  fileFormat?: "json" | "csv" | "txt"; // Default: 'json'
  outputDirectory?: string; // Default: 'uploads'

  // 📦 File Compression Configuration
  compression?: {
    enabled?: boolean; // Enable file compression (default: false)
    format?: "gzip" | "zip" | "brotli"; // Compression format (default: 'gzip')
    level?: number; // Compression level 1-9 (default: 6)
    fileSize?: number; // Minimum file size to compress in bytes (default: 1024)
  };

  // 🔒 Sensitive Data Masking Configuration
  dataMasking?: {
    enabled?: boolean; // Enable data masking (default: true)
    maskingChar?: string; // Character to use for masking (default: '*')
    preserveLength?: boolean; // Preserve original field length (default: false)
    showLastChars?: number; // Show last N characters (default: 0)
    customPatterns?: { [key: string]: RegExp }; // Custom patterns to mask
    customFields?: string[]; // Custom field names to mask
    exemptFields?: string[]; // Fields to exclude from masking
    maskEmails?: boolean; // Mask email addresses (default: true)
    maskIPs?: boolean; // Mask IP addresses (default: false)
    maskConnectionStrings?: boolean; // Mask database connection strings (default: true)
  };

  retryAttempts?: number; // Default: 3

  // MongoDB: Custom collection names (prevents conflicts)
  collections?: {
    jobsCollectionName?: string; // Default: 'jobs'
    logsCollectionName?: string; // Default: 'logs'
    apiLogsCollectionName?: string; // Default: 'apilogs'
  };

  // SQL Databases: Custom table names
  tables?: {
    jobsTableName?: string; // Default: 'jobs'
    logsTableName?: string; // Default: 'logs'
    apiLogsTableName?: string; // Default: 'apilogs'
  };

  // Redis: Custom key prefixes
  keys?: {
    jobsKeyPrefix?: string; // Default: 'jobs:'
    logsKeyPrefix?: string; // Default: 'logs:'
    apiLogsKeyPrefix?: string; // Default: 'apilogs:'
  };

  // 🕐 Automatic Cron Scheduling (optional - jobs run automatically)
  dailyCron?: string; // Default: '0 0 * * *' (midnight daily - creates 24 hourly jobs)
  hourlyCron?: string; // Default: '0 * * * *' (every hour - processes current hour)

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

  // 🗑️ Log Retention Configuration
  retention?: {
    database?: {
      apiLogs?: number; // Days to keep API logs (default: 30)
      jobs?: number; // Days to keep job records (default: 90)
      logs?: number; // Days to keep processing logs (default: 90)
      autoCleanup?: boolean; // Enable automatic cleanup (default: false)
      cleanupCron?: string; // Cron for cleanup job (default: "0 2 * * *")
    };
    storage?: {
      files?: number; // Days to keep uploaded files (default: 365)
      autoCleanup?: boolean; // Enable automatic file cleanup (default: false)
      cleanupCron?: string; // Cron for file cleanup (default: "0 3 * * *")

      // S3 Lifecycle policies (cost optimization)
      s3Lifecycle?: {
        transitionToIA?: number; // Days to transition to Infrequent Access
        transitionToGlacier?: number; // Days to transition to Glacier
        transitionToDeepArchive?: number; // Days to transition to Deep Archive
        expiration?: number; // Days to permanently delete
      };
    };
  };
}
```

### Multi-Database Type Configuration Interface

```typescript
interface MultiDatabaseConfig {
  // Map of database names to their configurations (supports different database types)
  [databaseName: string]: Config;
}

// Example usage with different database types
interface ProjectConfigs extends MultiDatabaseConfig {
  mainAppMongo: Config; // MongoDB
  analyticsPostgres: Config; // PostgreSQL
  ecommerceMysql: Config; // MySQL
  cacheRedis: Config; // Redis
  inventorySqlServer: Config; // SQL Server
}

// Factory function for environment-based configs with different database types
type MultiDbTypeConfigFactory = (env: string) => MultiDatabaseConfig;

// Enhanced database manager interface for multiple database types
interface DatabaseTypeManager {
  registerDatabase(name: string, config: Config): Promise<void>;
  processDatabase(dbName: string, date: string, hour: number): Promise<void>;
  processAllDatabases(date: string, hour: number): Promise<ProcessResult[]>;
  processByDatabaseType(
    dbType: string,
    date: string,
    hour: number
  ): Promise<ProcessResult[]>;
  getAllStatus(date: string, hourRange?: [number, number]): Promise<StatusMap>;
  getStatusByType(
    dbType: string,
    date: string,
    hourRange?: [number, number]
  ): Promise<StatusMap>;
  listDatabases(): string[];
  listDatabasesByType(): { [dbType: string]: string[] };
}

interface ProcessResult {
  database: string;
  dbType: string;
  status: "success" | "failed";
  error?: string;
  recordsProcessed?: number;
}

interface StatusMap {
  [databaseName: string]: JobStatus | { error: string };
}

// Database-specific configuration interfaces
interface MongoDBConfig extends Config {
  dbType: "mongodb";
  collections?: {
    jobsCollectionName?: string;
    logsCollectionName?: string;
    apiLogsCollectionName?: string;
  };
}

interface PostgreSQLConfig extends Config {
  dbType: "postgresql";
  tables?: {
    jobsTableName?: string;
    logsTableName?: string;
    apiLogsTableName?: string;
  };
  schema?: string; // Optional schema name
}

interface MySQLConfig extends Config {
  dbType: "mysql";
  tables?: {
    jobsTableName?: string;
    logsTableName?: string;
    apiLogsTableName?: string;
  };
}

interface SQLServerConfig extends Config {
  dbType: "sqlserver";
  tables?: {
    jobsTableName?: string;
    logsTableName?: string;
    apiLogsTableName?: string;
  };
  schema?: string; // Optional schema name
}

interface RedisConfig extends Config {
  dbType: "redis";
  keys?: {
    jobsKeyPrefix?: string;
    logsKeyPrefix?: string;
    apiLogsKeyPrefix?: string;
  };
  ttl?: number; // Time to live for keys (in seconds)
}

interface SQLiteConfig extends Config {
  dbType: "sqlite";
  tables?: {
    jobsTableName?: string;
    logsTableName?: string;
    apiLogsTableName?: string;
  };
}
```

### Configuration Examples by Database Type

```typescript
// MongoDB configuration
const mongoConfig: MongoDBConfig = {
  dbType: "mongodb",
  dbUri: "mongodb://localhost:27017/ecommerce",
  uploadProvider: "s3",
  collections: {
    apiLogsCollectionName: "ecommerce_apilogs",
  },
  s3: { bucket: "ecommerce-logs", region: "us-east-1" },
};

// PostgreSQL configuration
const postgresConfig: PostgreSQLConfig = {
  dbType: "postgresql",
  dbUri: "postgresql://user:pass@localhost:5432/analytics",
  uploadProvider: "gcs",
  tables: {
    apiLogsTableName: "analytics_apilogs",
  },
  schema: "public", // Optional schema
  gcs: { projectId: "my-project", bucket: "analytics-logs" },
};

// MySQL configuration
const mysqlConfig: MySQLConfig = {
  dbType: "mysql",
  dbUri: "mysql://user:pass@localhost:3306/inventory",
  uploadProvider: "azure",
  tables: {
    apiLogsTableName: "inventory_apilogs",
  },
  azure: { containerName: "inventory-logs" },
};

// Redis configuration
const redisConfig: RedisConfig = {
  dbType: "redis",
  dbUri: "redis://localhost:6379/0",
  uploadProvider: "local",
  keys: {
    apiLogsKeyPrefix: "cache_apilogs:",
  },
  ttl: 86400, // 24 hours TTL
};

// Mixed database types configuration
const mixedConfigs: MultiDatabaseConfig = {
  usersMongo: mongoConfig,
  analyticsPostgres: postgresConfig,
  inventoryMySQL: mysqlConfig,
  cacheRedis: redisConfig,
};

// Environment-based configuration factory for multiple database types
const createMultiDbTypeConfigs: MultiDbTypeConfigFactory = (env) => ({
  // MongoDB for user data
  users: {
    dbType: "mongodb",
    dbUri: process.env[`${env.toUpperCase()}_MONGO_URI`],
    uploadProvider: env === "production" ? "s3" : "local",
    collections: { apiLogsCollectionName: `${env}_users_apilogs` },
  },

  // PostgreSQL for analytics
  analytics: {
    dbType: "postgresql",
    dbUri: process.env[`${env.toUpperCase()}_POSTGRES_URI`],
    uploadProvider: env === "production" ? "gcs" : "local",
    tables: { apiLogsTableName: `${env}_analytics_apilogs` },
  },

  // MySQL for e-commerce
  ecommerce: {
    dbType: "mysql",
    dbUri: process.env[`${env.toUpperCase()}_MYSQL_URI`],
    uploadProvider: env === "production" ? "azure" : "local",
    tables: { apiLogsTableName: `${env}_ecommerce_apilogs` },
  },

  // Redis for caching
  cache: {
    dbType: "redis",
    dbUri: process.env[`${env.toUpperCase()}_REDIS_URI`],
    uploadProvider: "local",
    keys: { apiLogsKeyPrefix: `${env}_cache_apilogs:` },
  },
});
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

### Log Retention Functions

```javascript
// Initialize retention service
const retentionService = await initRetention(config, db);

// Manual cleanup (with optional dry run)
const results = await retentionService.runManualCleanup({
  database: true,
  storage: true,
  dryRun: false, // Set to true for preview
});

// Get retention statistics
const stats = await retentionService.getRetentionStats();

// Setup S3 lifecycle policies
await retentionService.setupS3LifecyclePolicies();
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
npm install logstack
npx logstack test

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

### 🌍 Multi-Environment Configuration

Complete environment variable setup for development, testing, staging, and production environments.

#### Development Environment (.env.development)

```bash
# Environment
NODE_ENV=development

# Database
DEV_DB_URI=mongodb://localhost:27017/dev_app
DEV_USER_DB_URI=mongodb://localhost:27017/dev_users
DEV_ORDER_DB_URI=postgresql://user:pass@localhost:5432/dev_orders
DEV_ANALYTICS_DB_URI=mysql://user:pass@localhost:3306/dev_analytics

# Upload Provider (local for development)
DEV_UPLOAD_PROVIDER=local
DEV_OUTPUT_DIR=dev-logs

# Development Retention (minimal for cost)
DEV_DB_RETAIN_API_LOGS=3       # 3 days
DEV_DB_RETAIN_JOBS=7           # 1 week
DEV_DB_RETAIN_LOGS=5           # 5 days
DEV_STORAGE_RETAIN_FILES=14    # 2 weeks

# Logging
DEV_LOG_LEVEL=debug
DEV_LOG_CONSOLE=true
DEV_LOG_FILE=true

# Development specific
DEV_RETRY_ATTEMPTS=2
DEV_DAILY_CRON="0 0 * * *"
DEV_HOURLY_CRON="0 * * * *"
```

#### Testing Environment (.env.testing)

```bash
# Environment
NODE_ENV=testing

# Database
TEST_DB_URI=mongodb://localhost:27017/test_app
TEST_USER_DB_URI=mongodb://localhost:27017/test_users
TEST_ORDER_DB_URI=postgresql://user:pass@localhost:5432/test_orders

# Upload Provider
TEST_UPLOAD_PROVIDER=local
TEST_OUTPUT_DIR=test-logs

# Testing Retention (short-term)
TEST_DB_RETAIN_API_LOGS=5      # 5 days
TEST_DB_RETAIN_JOBS=14         # 2 weeks
TEST_DB_RETAIN_LOGS=7          # 1 week
TEST_STORAGE_RETAIN_FILES=30   # 1 month

# Logging
TEST_LOG_LEVEL=info
TEST_LOG_CONSOLE=true
TEST_LOG_FILE=true

# Testing specific
TEST_RETRY_ATTEMPTS=3
```

#### Staging Environment (.env.staging)

```bash
# Environment
NODE_ENV=staging

# Database
STAGING_DB_URI=mongodb://staging-cluster:27017/staging_app
STAGING_USER_DB_URI=mongodb://staging-cluster:27017/staging_users
STAGING_ORDER_DB_URI=postgresql://staging-pg:5432/staging_orders

# Upload Provider
STAGING_UPLOAD_PROVIDER=s3

# AWS S3 Configuration (Staging)
STAGING_AWS_ACCESS_KEY_ID=staging-aws-key
STAGING_AWS_SECRET_ACCESS_KEY=staging-aws-secret
STAGING_AWS_REGION=us-east-1
STAGING_S3_BUCKET=staging-api-logs
STAGING_USER_S3_BUCKET=staging-user-logs

# Staging Retention (medium-term)
STAGING_DB_RETAIN_API_LOGS=14  # 2 weeks
STAGING_DB_RETAIN_JOBS=60      # 2 months
STAGING_DB_RETAIN_LOGS=30      # 1 month
STAGING_STORAGE_RETAIN_FILES=90 # 3 months

# Logging
STAGING_LOG_LEVEL=info
STAGING_LOG_CONSOLE=true
STAGING_LOG_FILE=true

# Staging specific
STAGING_RETRY_ATTEMPTS=4
STAGING_OUTPUT_DIR=staging-logs
```

#### Production Environment (.env.production)

```bash
# Environment
NODE_ENV=production

# Database
PROD_DB_URI=mongodb://prod-cluster:27017/prod_app
PROD_USER_DB_URI=mongodb://prod-cluster:27017/prod_users
PROD_ORDER_DB_URI=postgresql://prod-pg:5432/prod_orders
PROD_ANALYTICS_DB_URI=mysql://prod-mysql:3306/prod_analytics

# Upload Provider
PROD_UPLOAD_PROVIDER=s3

# AWS S3 Configuration (Production)
PROD_AWS_ACCESS_KEY_ID=prod-aws-key
PROD_AWS_SECRET_ACCESS_KEY=prod-aws-secret
PROD_AWS_REGION=us-east-1
PROD_S3_BUCKET=prod-api-logs
PROD_USER_S3_BUCKET=prod-user-logs

# Production Retention (long-term)
PROD_DB_RETAIN_API_LOGS=30     # 1 month
PROD_DB_RETAIN_JOBS=365        # 1 year
PROD_DB_RETAIN_LOGS=90         # 3 months
PROD_STORAGE_RETAIN_FILES=730  # 2 years

# S3 Lifecycle (Production cost optimization)
PROD_S3_TRANSITION_TO_IA=60           # Move to IA after 2 months
PROD_S3_TRANSITION_TO_GLACIER=180     # Move to Glacier after 6 months
PROD_S3_TRANSITION_TO_DEEP_ARCHIVE=365 # Deep Archive after 1 year
PROD_S3_EXPIRATION=730                # Delete after 2 years

# Logging (Production)
PROD_LOG_LEVEL=warn
PROD_LOG_CONSOLE=false         # No console logging in production
PROD_LOG_FILE=true

# Production specific
PROD_RETRY_ATTEMPTS=5
PROD_OUTPUT_DIR=production-logs

# Security & Performance
PROD_ENABLE_COMPRESSION=true
PROD_ENABLE_HELMET=true
PROD_PORT=8080
```

### 🏢 Company/Industry-Specific Configuration

#### Healthcare/HIPAA Compliant (.env.healthcare)

```bash
# Base environment
NODE_ENV=production

# Healthcare-specific retention (7 years)
HEALTHCARE_DB_RETAIN_API_LOGS=45    # 45 days operational
HEALTHCARE_DB_RETAIN_JOBS=2555      # 7 years audit trail
HEALTHCARE_DB_RETAIN_LOGS=365       # 1 year troubleshooting
HEALTHCARE_STORAGE_RETAIN_FILES=2555 # 7 years HIPAA

# Weekly cleanup (more careful approach)
HEALTHCARE_DB_CLEANUP_CRON="0 2 * * 0"      # Sunday 2 AM
HEALTHCARE_STORAGE_CLEANUP_CRON="0 3 * * 0" # Sunday 3 AM

# Company type
COMPANY_TYPE=healthcare
```

#### Financial/SOX Compliant (.env.financial)

```bash
# Base environment
NODE_ENV=production

# Financial-specific retention (7 years SOX)
FINANCIAL_DB_RETAIN_API_LOGS=90     # 90 days transactions
FINANCIAL_DB_RETAIN_JOBS=2555       # 7 years SOX compliance
FINANCIAL_DB_RETAIN_LOGS=365        # 1 year audit logs
FINANCIAL_STORAGE_RETAIN_FILES=2555 # 7 years SOX

# Weekly cleanup for financial data
FINANCIAL_DB_CLEANUP_CRON="0 1 * * 1"      # Monday 1 AM
FINANCIAL_STORAGE_CLEANUP_CRON="0 2 * * 1" # Monday 2 AM

# Company type
COMPANY_TYPE=financial
```

#### Startup/Cost-Optimized (.env.startup)

```bash
# Base environment
NODE_ENV=production

# Startup-specific retention (cost-optimized)
STARTUP_DB_RETAIN_API_LOGS=14       # 14 days debugging
STARTUP_DB_RETAIN_JOBS=60           # 2 months history
STARTUP_DB_RETAIN_LOGS=30           # 1 month troubleshooting
STARTUP_STORAGE_RETAIN_FILES=180    # 6 months cost optimization

# Daily cleanup for cost optimization
STARTUP_DB_CLEANUP_CRON="0 2 * * *"      # Daily 2 AM
STARTUP_STORAGE_CLEANUP_CRON="0 3 * * *" # Daily 3 AM

# Company type
COMPANY_TYPE=startup
```

### 📱 Microservices Environment Variables

#### User Service (.env.user-service)

```bash
NODE_ENV=production
SERVICE_NAME=user-service

# User Service Database
USER_SERVICE_DB_URI=mongodb://user-db-cluster:27017/users
USER_SERVICE_DB_TYPE=mongodb
USER_SERVICE_UPLOAD_PROVIDER=s3

# User Service Cloud Storage
USER_SERVICE_S3_BUCKET=user-service-logs
USER_SERVICE_AWS_ACCESS_KEY_ID=user-service-aws-key
USER_SERVICE_AWS_SECRET_ACCESS_KEY=user-service-aws-secret

# User Service Retention (shorter for user data)
USER_SERVICE_DB_RETAIN_API_LOGS=7   # 7 days user activity
USER_SERVICE_DB_RETAIN_JOBS=30      # 30 days user jobs
USER_SERVICE_STORAGE_RETAIN_FILES=90 # 90 days user logs
```

#### Order Service (.env.order-service)

```bash
NODE_ENV=production
SERVICE_NAME=order-service

# Order Service Database
ORDER_SERVICE_DB_URI=postgresql://order-pg:5432/orders
ORDER_SERVICE_DB_TYPE=postgresql
ORDER_SERVICE_UPLOAD_PROVIDER=s3

# Order Service Cloud Storage
ORDER_SERVICE_S3_BUCKET=order-service-logs
ORDER_SERVICE_AWS_ACCESS_KEY_ID=order-service-aws-key
ORDER_SERVICE_AWS_SECRET_ACCESS_KEY=order-service-aws-secret

# Order Service Retention (medium for orders)
ORDER_SERVICE_DB_RETAIN_API_LOGS=30  # 30 days order activity
ORDER_SERVICE_DB_RETAIN_JOBS=365     # 1 year order history
ORDER_SERVICE_STORAGE_RETAIN_FILES=730 # 2 years order logs
```

#### Analytics Service (.env.analytics-service)

```bash
NODE_ENV=production
SERVICE_NAME=analytics-service

# Analytics Service Database
ANALYTICS_SERVICE_DB_URI=mysql://analytics-mysql:3306/analytics
ANALYTICS_SERVICE_DB_TYPE=mysql
ANALYTICS_SERVICE_UPLOAD_PROVIDER=s3

# Analytics Service Cloud Storage
ANALYTICS_SERVICE_S3_BUCKET=analytics-service-logs
ANALYTICS_SERVICE_AWS_ACCESS_KEY_ID=analytics-service-aws-key
ANALYTICS_SERVICE_AWS_SECRET_ACCESS_KEY=analytics-service-aws-secret

# Analytics Service Retention (longer for analytics)
ANALYTICS_SERVICE_DB_RETAIN_API_LOGS=90    # 90 days analytics data
ANALYTICS_SERVICE_DB_RETAIN_JOBS=365       # 1 year analytics jobs
ANALYTICS_SERVICE_STORAGE_RETAIN_FILES=1095 # 3 years analytics logs
```

### 🔧 Environment Loading Example

```javascript
// Load environment-specific configuration
const dotenv = require("dotenv");

// Load base environment
dotenv.config();

// Load environment-specific file
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

// Load company-specific overrides if exists
if (process.env.COMPANY_TYPE) {
  dotenv.config({ path: `.env.${process.env.COMPANY_TYPE}`, override: false });
}

// Load service-specific overrides if exists
if (process.env.SERVICE_NAME) {
  dotenv.config({ path: `.env.${process.env.SERVICE_NAME}`, override: false });
}

console.log(`🌍 Loaded configuration for ${env} environment`);
if (process.env.COMPANY_TYPE) {
  console.log(`🏢 Company type: ${process.env.COMPANY_TYPE}`);
}
if (process.env.SERVICE_NAME) {
  console.log(`🔧 Service: ${process.env.SERVICE_NAME}`);
}
```

### Multi-Database Type Configuration

```bash
# MongoDB Databases
DEVELOPMENT_MONGO_URI=mongodb://localhost:27017/dev_main
PRODUCTION_MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/prod_main

# PostgreSQL Databases
DEVELOPMENT_POSTGRES_URI=postgresql://user:pass@localhost:5432/dev_analytics
PRODUCTION_POSTGRES_URI=postgresql://user:pass@prod-postgres.amazonaws.com:5432/analytics

# MySQL Databases
DEVELOPMENT_MYSQL_URI=mysql://user:pass@localhost:3306/dev_ecommerce
PRODUCTION_MYSQL_URI=mysql://user:pass@prod-mysql.rds.amazonaws.com:3306/ecommerce

# SQL Server Databases
DEVELOPMENT_SQLSERVER_URI=mssql://user:pass@localhost:1433/dev_inventory
PRODUCTION_SQLSERVER_URI=mssql://user:pass@prod-sql.database.windows.net:1433/inventory

# Redis Databases
DEVELOPMENT_REDIS_URI=redis://localhost:6379/0
PRODUCTION_REDIS_URI=redis://:pass@prod-redis.cache.amazonaws.com:6379/0

# SQLite (for development)
DEVELOPMENT_SQLITE_URI=sqlite:./dev_local.db
PRODUCTION_SQLITE_URI=sqlite:./prod_local.db

# Oracle Database
DEVELOPMENT_ORACLE_URI=oracle://user:pass@localhost:1521/XE
PRODUCTION_ORACLE_URI=oracle://user:pass@prod-oracle:1521/PROD

# Multiple Cloud Storage Buckets (same as before)
MAIN_S3_BUCKET=main-app-logs
ANALYTICS_GCS_BUCKET=analytics-logs
ECOMMERCE_AZURE_CONTAINER=ecommerce-logs

# Multi-Database Retention Configuration
# User Database (Short retention)
USER_DB_RETAIN_API_LOGS=7
USER_DB_RETAIN_JOBS=30
USER_DB_RETAIN_LOGS=14
USER_STORAGE_RETAIN_FILES=90

# Analytics Database (Medium retention)
ANALYTICS_DB_RETAIN_API_LOGS=90
ANALYTICS_DB_RETAIN_JOBS=365
ANALYTICS_DB_RETAIN_LOGS=180
ANALYTICS_STORAGE_RETAIN_FILES=730

# Compliance Database (Long retention)
COMPLIANCE_DB_RETAIN_API_LOGS=2555  # 7 years
COMPLIANCE_DB_RETAIN_JOBS=2555      # 7 years
COMPLIANCE_DB_RETAIN_LOGS=365       # 1 year
COMPLIANCE_STORAGE_RETAIN_FILES=2555 # 7 years

# Global Retention Settings
RETENTION_AUTO_CLEANUP=true
RETENTION_DB_CLEANUP_CRON="0 2 * * *"
RETENTION_STORAGE_CLEANUP_CRON="0 3 * * *"

# Environment
NODE_ENV=production
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

## 🚀 Deployment Strategies

LogStack supports multiple deployment strategies based on your infrastructure needs:

### 1️⃣ Embedded Deployment (Same Server + Same Database)

**Best for**: Small to medium applications, getting started, cost optimization

```javascript
const { init, createApiLogMiddleware } = require("logstack");

// Initialize in your main application
await init({
  dbUri: "mongodb://localhost:27017/myapp", // Same as your main app
  uploadProvider: "local",
  collections: {
    apiLogsCollectionName: "api_logs",
    jobsCollectionName: "logstack_jobs", // Separate collection for LogStack
  },
  retention: {
    database: { apiLogs: 7, jobs: 3 }, // Minimal retention for shared DB
  },
});

// Use directly in your Express app
app.use(createApiLogMiddleware());

// Direct function calls
await saveApiLog(logData);
const logs = await getApiLogs();
```

**Benefits**:

- ⚡ Maximum performance (direct function calls)
- 💰 Cost effective (no additional servers)
- 🔧 Simple setup and maintenance

### 2️⃣ Isolated Data Deployment (Same Server + Different Database)

**Best for**: Data isolation requirements, compliance needs

```javascript
await init({
  dbUri: "mongodb://localhost:27017/logstack_data", // Separate database
  uploadProvider: "local",
  retention: {
    database: { apiLogs: 30, jobs: 90 }, // More aggressive retention
  },
});
```

**Benefits**:

- 🔐 Complete data isolation
- ⚡ High performance (same server)
- 📊 Dedicated storage for logs

### 3️⃣ Microservice Deployment (Different Server + Shared Database)

**Best for**: Microservices architecture, scaling log processing separately

```javascript
// LogStack Server (separate instance)
await init({
  dbUri: "mongodb://main-db:27017/myapp", // Shared database
  uploadProvider: "s3",
  apiServer: {
    enabled: true,
    port: 3001,
    auth: { apiKey: "your-secure-key" },
  },
});

// Your Main Application (uses API calls)
const LogStackClient = require("logstack/client");
const client = new LogStackClient(
  "http://logstack-server:3001",
  "your-api-key"
);

await client.saveLog(logData);
const logs = await client.getLogs();
```

**Benefits**:

- 🎯 Dedicated resources for log processing
- 📈 Independent scaling
- 🛡️ API-based security

### 4️⃣ Complete Isolation (Different Server + Different Database)

**Best for**: Enterprise applications, maximum scalability, multi-tenant systems

```javascript
// Dedicated LogStack Service
await init({
  dbUri: "mongodb://logstack-cluster:27017/logstack", // Dedicated DB
  uploadProvider: "s3",
  apiServer: {
    enabled: true,
    port: 4000,
    auth: {
      apiKey: "secure-key",
      jwt: { enabled: true, secret: "jwt-secret" },
    },
    rateLimit: { max: 1000 },
  },
  retention: {
    database: { apiLogs: 90, jobs: 180 },
    storage: { files: 2555 }, // 7 years
  },
});

// Enterprise Client Usage
const client = new LogStackClient("https://logstack.company.com", "api-key");
await client.login("username", "password"); // JWT authentication
await client.saveLog(logData);
```

**Benefits**:

- 🏢 Enterprise-grade isolation
- 🚀 Maximum scalability
- 🔐 Advanced authentication & security
- 📊 Comprehensive retention policies

### 🎯 Deployment Strategy Selector

```javascript
// Environment-based deployment
const strategy = process.env.LOGSTACK_DEPLOYMENT || "embedded";

switch (strategy) {
  case "embedded":
    await initEmbeddedLogStack();
    break;
  case "isolated-data":
    await initIsolatedDataLogStack();
    break;
  case "microservice":
    await initMicroserviceLogStack();
    break;
  case "enterprise":
    await initEnterpriseLogStack();
    break;
}
```

### 📊 Deployment Comparison

| Strategy      | Server    | Database  | Performance | Isolation | Complexity | Cost     |
| ------------- | --------- | --------- | ----------- | --------- | ---------- | -------- |
| Embedded      | Same      | Same      | ⚡⚡⚡      | 🔒        | 🔧         | 💰       |
| Isolated Data | Same      | Different | ⚡⚡⚡      | 🔒🔒      | 🔧🔧       | 💰💰     |
| Microservice  | Different | Same      | ⚡⚡        | 🔒🔒      | 🔧🔧🔧     | 💰💰💰   |
| Enterprise    | Different | Different | ⚡          | 🔒🔒🔒    | 🔧🔧🔧🔧   | 💰💰💰💰 |

**See complete examples**: [deploymentStrategies.js](examples/deploymentStrategies.js)

## � Documentation

Complete documentation is available in the [`docs/`](docs/) folder:

### 📋 Getting Started

- **[📋 Package Explanation](docs/PACKAGE_EXPLANATION.md)** - What this package does and why you need it
- **[🚀 Complete Step by Step Guide](docs/COMPLETE_STEP_BY_STEP_GUIDE.md)** - Detailed setup instructions
- **[✅ Implementation Checklist](docs/IMPLEMENTATION_CHECKLIST.md)** - Phase-by-phase implementation guide

### 🔧 Configuration Guides

- **[🗃️ Custom Collections](docs/CUSTOM_COLLECTIONS.md)** - Avoid database conflicts with custom collection names
- **[�️ Multi-Database Type Setup](docs/MULTI_DATABASE_TYPE_SETUP_GUIDE.md)** - Complete guide for MongoDB, PostgreSQL, MySQL, Redis, and more
- **[�📁 Output Directory Setup](docs/OUTPUT_DIRECTORY.md)** - Organize your files properly
- **[🔄 Flexible API Logs](docs/FLEXIBLE_API_LOGS.md)** - Work with existing or create new API logs
- **[🗑️ Log Retention Guide](docs/LOG_RETENTION_GUIDE.md)** - Automatic cleanup and cost optimization
- **[🗑️ Retention Configuration Examples](docs/RETENTION_CONFIGURATION_EXAMPLES.md)** - Industry-specific retention policies and examples

### ☁️ Cloud Integration

- **[🌩️ AWS Setup Guide](docs/AWS_SETUP_GUIDE.md)** - Complete AWS S3 configuration
- **[🚀 AWS Implementation Ready](docs/AWS_IMPLEMENTATION_READY.md)** - Production-ready AWS setup
- **[📁 Google Cloud Setup Guide](docs/GOOGLE_CLOUD_SETUP_GUIDE.md)** - Complete Google Cloud Storage configuration
- **[🔷 Azure Blob Setup Guide](docs/AZURE_BLOB_SETUP_GUIDE.md)** - Complete Azure Blob Storage configuration

### 💻 Implementation Examples

- **[💻 Node.js Implementation](docs/NODE_JS_IMPLEMENTATION.md)** - Detailed Node.js examples
- **[📖 Complete Usage Guide](docs/COMPLETE_USAGE_GUIDE.md)** - Comprehensive usage examples
- **[📊 Node.js Implementation Summary](docs/NODEJS_IMPLEMENTATION_SUMMARY.md)** - Quick reference guide

### 🌟 Advanced Features Documentation

- **[🌩️ Complete Features Guide](COMPLETE_FEATURES_GUIDE.md)** - Comprehensive guide to all LogStack features
- **[📋 Features Summary](FEATURES_SUMMARY.md)** - Quick reference for decision making
- **[🚀 Advanced Features Examples](examples/advancedFeaturesExample.js)** - Practical S3 download and analytics examples
- **[🔄 Multi-Service Integration](examples/multi-service-cli.js)** - CLI for all integration methods

### 🧪 Testing

- **[🧪 Testing Guide](docs/TESTING_GUIDE.md)** - Complete testing instructions
- **[📊 API Logs Testing](docs/APILOGS_TESTING_GUIDE.md)** - API logs specific testing

### 📋 Reference Files

- **[📄 README Backup](docs/README-backup.md)** - Previous README versions
- **[📦 NPM README](docs/README-npm.md)** - NPM optimized README

## �📄 License

MIT License

## 🤝 Support

- 📚 [Documentation](https://github.com/your-repo/logstack)
- 🐛 [Issues](https://github.com/your-repo/logstack/issues)
- 💬 [Discussions](https://github.com/your-repo/logstack/discussions)
