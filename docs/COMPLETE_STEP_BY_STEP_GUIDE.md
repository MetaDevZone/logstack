# 📚 Complete Usage Guide - Cron Log Service

This guide covers all features and shows you exactly how to implement them in your project.

## 🎯 Table of Contents

1. [Installation & Basic Setup](#installation--basic-setup)
2. [Feature 1: Custom Collection Names](#feature-1-custom-collection-names)
3. [Feature 2: Organized Output Directory](#feature-2-organized-output-directory)
4. [Multiple Storage Providers](#multiple-storage-providers)
5. [API Request Logging](#api-request-logging)
6. [Production Deployment](#production-deployment)
7. [Testing & Validation](#testing--validation)
8. [Advanced Configurations](#advanced-configurations)

---

## 📦 Installation & Basic Setup

### Step 1: Install the Package

```bash
npm install cron-log-service
```

### Step 2: Basic Implementation

Create a file `src/cronService.ts`:

```typescript
import { init, createDailyJobs } from "cron-log-service";
import { Config } from "cron-log-service/types/config";

const config: Config = {
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "local",
  fileFormat: "json",
  logging: {
    level: "info",
    enableConsole: true,
  },
};

async function startCronService() {
  try {
    await init(config);
    console.log("✅ Cron service initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize:", error);
  }
}

export { startCronService };
```

### Step 3: Add to Your App

In your main application file:

```typescript
import express from "express";
import { startCronService } from "./src/cronService";

const app = express();

// Initialize cron service
startCronService();

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

---

## 🗃️ Feature 1: Custom Collection Names

**Use Case**: Prevent database conflicts when multiple services use the same MongoDB database.

### Step 1: Configure Custom Collections

```typescript
import { Config } from "cron-log-service/types/config";

const config: Config = {
  dbUri: "mongodb://localhost:27017/shared-database",
  uploadProvider: "local",
  fileFormat: "json",

  // 🎯 Custom collection names
  collections: {
    jobsCollectionName: "user_service_jobs", // Instead of default 'jobs'
    logsCollectionName: "user_service_logs", // Instead of default 'logs'
  },

  logging: {
    level: "info",
    enableConsole: true,
  },
};
```

### Step 2: Multiple Service Instances

**Service A (User Service):**

```typescript
const userServiceConfig: Config = {
  dbUri: "mongodb://localhost:27017/company-db",
  collections: {
    jobsCollectionName: "user_service_jobs",
    logsCollectionName: "user_service_logs",
  },
  // ... other config
};
```

**Service B (Order Service):**

```typescript
const orderServiceConfig: Config = {
  dbUri: "mongodb://localhost:27017/company-db",
  collections: {
    jobsCollectionName: "order_service_jobs",
    logsCollectionName: "order_service_logs",
  },
  // ... other config
};
```

**Service C (Analytics Service):**

```typescript
const analyticsConfig: Config = {
  dbUri: "mongodb://localhost:27017/company-db",
  collections: {
    jobsCollectionName: "analytics_jobs",
    logsCollectionName: "analytics_logs",
  },
  // ... other config
};
```

### Step 3: Environment-Based Collections

```typescript
const getCollectionNames = (env: string) => {
  const envPrefix = env.toUpperCase();
  return {
    jobsCollectionName: `${envPrefix}_jobs`,
    logsCollectionName: `${envPrefix}_logs`,
  };
};

// Development
const devConfig: Config = {
  dbUri: "mongodb://localhost:27017/myapp",
  collections: getCollectionNames("dev"), // dev_jobs, dev_logs
  // ... other config
};

// Production
const prodConfig: Config = {
  dbUri: "mongodb://prod-cluster.mongodb.net/myapp",
  collections: getCollectionNames("prod"), // prod_jobs, prod_logs
  // ... other config
};
```

---

## 📁 Feature 2: Organized Output Directory

**Use Case**: Keep your project root clean by organizing log files in dedicated directories.

### Step 1: Basic Directory Organization

```typescript
const config: Config = {
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "local",
  fileFormat: "json",

  // 🎯 Organized output directory
  outputDirectory: "api-logs", // All files go here instead of project root

  logging: {
    level: "info",
    enableConsole: true,
  },
};
```

**Result Structure:**

```
your-project/
├── api-logs/
│   ├── 2025-08-25/
│   │   ├── 00-01.json
│   │   ├── 01-02.json
│   │   └── ...
│   └── 2025-08-26/
├── src/
├── package.json
└── other-app-files
```

### Step 2: Environment-Specific Directories

```typescript
// Development setup
const devConfig: Config = {
  outputDirectory: "dev-logs",
  collections: {
    jobsCollectionName: "dev_jobs",
    logsCollectionName: "dev_logs",
  },
  // ... other config
};

// Production setup
const prodConfig: Config = {
  outputDirectory: "production-logs",
  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
  },
  // ... other config
};

// Analytics export
const analyticsConfig: Config = {
  outputDirectory: "analytics-exports",
  collections: {
    jobsCollectionName: "analytics_jobs",
    logsCollectionName: "analytics_logs",
  },
  // ... other config
};
```

**Result Structure:**

```
your-project/
├── dev-logs/2025-08-25/
├── production-logs/2025-08-25/
├── analytics-exports/2025-08-25/
├── src/
└── clean-project-structure
```

### Step 3: Dynamic Directory Naming

```typescript
const getConfig = (service: string, env: string): Config => {
  return {
    dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp",
    uploadProvider: "local",
    fileFormat: "json",

    // Dynamic directory: "service-env-logs"
    outputDirectory: `${service}-${env}-logs`,

    // Dynamic collections: "service_env_jobs"
    collections: {
      jobsCollectionName: `${service}_${env}_jobs`,
      logsCollectionName: `${service}_${env}_logs`,
    },

    logging: {
      level: env === "prod" ? "warn" : "info",
      enableConsole: true,
    },
  };
};

// Usage
const userDevConfig = getConfig("user", "dev"); // user-dev-logs/
const orderProdConfig = getConfig("order", "prod"); // order-prod-logs/
```

---

## ☁️ Multiple Storage Providers

### Local Storage (Development)

```typescript
const localConfig: Config = {
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "local",
  outputDirectory: "local-logs",
  // Files saved to: ./local-logs/2025-08-25/14-15.json
};
```

### AWS S3 (Production)

```typescript
const s3Config: Config = {
  dbUri: "mongodb://prod-cluster.mongodb.net/myapp",
  uploadProvider: "s3",
  outputDirectory: "api-logs",

  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: "us-east-1",
    bucket: "my-company-logs",
  },

  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
  },
};
```

### Google Cloud Storage

```typescript
const gcsConfig: Config = {
  dbUri: "mongodb://prod-cluster.mongodb.net/myapp",
  uploadProvider: "gcs",
  outputDirectory: "gcs-exports",

  gcs: {
    projectId: "my-gcp-project",
    keyFilename: "./gcp-service-account.json",
    bucket: "company-log-exports",
  },

  collections: {
    jobsCollectionName: "gcs_jobs",
    logsCollectionName: "gcs_logs",
  },
};
```

### Azure Blob Storage

```typescript
const azureConfig: Config = {
  dbUri: "mongodb://prod-cluster.mongodb.net/myapp",
  uploadProvider: "azure",
  outputDirectory: "azure-backups",

  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING!,
    containerName: "log-backups",
  },

  collections: {
    jobsCollectionName: "azure_jobs",
    logsCollectionName: "azure_logs",
  },
};
```

---

## 🔌 API Request Logging

### Step 1: Setup Express Middleware

```typescript
import express from "express";
import { init, setupRequestLogging } from "cron-log-service";

const app = express();

// Initialize cron service
const config = {
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "local",
  outputDirectory: "api-request-logs",
  collections: {
    jobsCollectionName: "api_jobs",
    logsCollectionName: "api_request_logs",
  },
};

await init(config);

// 🎯 Add request logging middleware
app.use(setupRequestLogging(config));

// Your API routes
app.get("/api/users", (req, res) => {
  res.json({ users: [] });
});

app.post("/api/orders", (req, res) => {
  res.json({ orderId: 12345 });
});

app.listen(3000);
```

### Step 2: Custom API Log Collection

```typescript
const config: Config = {
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "local",
  outputDirectory: "api-analytics",

  // 🎯 Use existing API logs collection
  apiLogs: {
    existingCollection: {
      name: "api_requests", // Your existing collection
      timestampField: "request_time", // Your timestamp field
    },
  },

  collections: {
    jobsCollectionName: "api_export_jobs",
    logsCollectionName: "api_export_logs",
  },
};
```

---

## 🚀 Production Deployment

### Step 1: Environment Configuration

Create `.env` files:

**.env.development:**

```env
NODE_ENV=development
DB_URI=mongodb://localhost:27017/myapp_dev
OUTPUT_DIR=dev-logs
JOBS_COLLECTION=dev_jobs
LOGS_COLLECTION=dev_logs
```

**.env.production:**

```env
NODE_ENV=production
DB_URI=mongodb://prod-cluster.mongodb.net/myapp
OUTPUT_DIR=production-logs
JOBS_COLLECTION=prod_jobs
LOGS_COLLECTION=prod_logs
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=company-prod-logs
```

### Step 2: Configuration Factory

```typescript
import dotenv from "dotenv";
import { Config } from "cron-log-service/types/config";

dotenv.config();

export const createConfig = (): Config => {
  const env = process.env.NODE_ENV || "development";

  const baseConfig: Config = {
    dbUri: process.env.DB_URI!,
    fileFormat: "json",
    outputDirectory: process.env.OUTPUT_DIR!,
    collections: {
      jobsCollectionName: process.env.JOBS_COLLECTION!,
      logsCollectionName: process.env.LOGS_COLLECTION!,
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
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: "us-east-1",
        bucket: process.env.S3_BUCKET!,
      },
    };
  }

  return {
    ...baseConfig,
    uploadProvider: "local",
  };
};
```

### Step 3: Application Startup

```typescript
import { init } from "cron-log-service";
import { createConfig } from "./config";

async function startApplication() {
  try {
    const config = createConfig();
    await init(config);

    console.log(`✅ Cron service initialized for ${process.env.NODE_ENV}`);
    console.log(`📁 Files will be saved to: ${config.outputDirectory}`);
    console.log(
      `🗃️  Using collections: ${config.collections?.jobsCollectionName}, ${config.collections?.logsCollectionName}`
    );
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
}

startApplication();
```

---

## 🧪 Testing & Validation

### Step 1: Test Your Configuration

```typescript
import { init, createDailyJobs, processSpecificHour } from "cron-log-service";

async function testConfiguration() {
  const testConfig = {
    dbUri: "mongodb://localhost:27017/test_db",
    uploadProvider: "local" as const,
    outputDirectory: "test-logs",
    collections: {
      jobsCollectionName: "test_jobs",
      logsCollectionName: "test_logs",
    },
    logging: {
      level: "info" as const,
      enableConsole: true,
    },
  };

  try {
    // 1. Initialize service
    await init(testConfig);
    console.log("✅ Service initialized");

    // 2. Create daily jobs
    const job = await createDailyJobs("2025-08-25", testConfig);
    console.log(`✅ Created job with ${job.hours.length} hour slots`);

    // 3. Process a specific hour
    await processSpecificHour("2025-08-25", 14, testConfig);
    console.log("✅ Processed hour 14-15");

    console.log("🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testConfiguration();
```

### Step 2: Validate Directory Structure

```typescript
import fs from "fs";
import path from "path";

function validateDirectoryStructure(outputDir: string) {
  const expectedPath = path.join(process.cwd(), outputDir, "2025-08-25");

  if (fs.existsSync(expectedPath)) {
    console.log(`✅ Directory created: ${expectedPath}`);

    const files = fs.readdirSync(expectedPath);
    console.log(`📁 Files found: ${files.join(", ")}`);
  } else {
    console.log(`❌ Directory not found: ${expectedPath}`);
  }
}

// Test after running your cron service
validateDirectoryStructure("test-logs");
```

---

## ⚙️ Advanced Configurations

### Multi-Service Setup

```typescript
// services/userService.ts
export const userServiceConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "local" as const,
  outputDirectory: "user-service-logs",
  collections: {
    jobsCollectionName: "user_jobs",
    logsCollectionName: "user_logs",
  },
  apiLogs: {
    existingCollection: {
      name: "user_api_logs",
      timestampField: "timestamp",
    },
  },
};

// services/orderService.ts
export const orderServiceConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3" as const,
  outputDirectory: "order-exports",
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: "us-east-1",
    bucket: "order-service-logs",
  },
  collections: {
    jobsCollectionName: "order_jobs",
    logsCollectionName: "order_logs",
  },
};
```

### Conditional Configuration

```typescript
const createServiceConfig = (
  serviceName: string,
  useCloud: boolean = false
) => {
  const baseConfig = {
    dbUri: process.env.DB_URI!,
    outputDirectory: `${serviceName}-logs`,
    collections: {
      jobsCollectionName: `${serviceName}_jobs`,
      logsCollectionName: `${serviceName}_logs`,
    },
  };

  if (useCloud) {
    return {
      ...baseConfig,
      uploadProvider: "s3" as const,
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: "us-east-1",
        bucket: `${serviceName}-logs-bucket`,
      },
    };
  }

  return {
    ...baseConfig,
    uploadProvider: "local" as const,
  };
};

// Usage
const userConfig = createServiceConfig("user-service", true); // Uses S3
const devConfig = createServiceConfig("dev-testing", false); // Uses local
```

---

## 🎯 Quick Reference

### Essential Configuration Options

```typescript
const config: Config = {
  // Required
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "local" | "s3" | "gcs" | "azure",

  // Organization Features
  outputDirectory: "my-logs", // Clean file organization
  collections: {
    jobsCollectionName: "my_jobs", // Avoid DB conflicts
    logsCollectionName: "my_logs", // Separate collections
  },

  // Optional but useful
  fileFormat: "json" | "csv",
  retryAttempts: 3,
  timezone: "UTC",

  // Logging
  logging: {
    level: "info",
    enableConsole: true,
    enableFile: false,
  },
};
```

### Common Use Cases

| Use Case          | outputDirectory       | Collections                        | Upload Provider |
| ----------------- | --------------------- | ---------------------------------- | --------------- |
| Development       | `'dev-logs'`          | `dev_jobs`, `dev_logs`             | `'local'`       |
| Production        | `'prod-logs'`         | `prod_jobs`, `prod_logs`           | `'s3'`          |
| Analytics         | `'analytics'`         | `analytics_jobs`, `analytics_logs` | `'gcs'`         |
| Multiple Services | `'service-name-logs'` | `service_jobs`, `service_logs`     | Any             |

---

## 📞 Support

- **Documentation**: Check the README.md for detailed API reference
- **Examples**: See the `examples/` folder for complete working examples
- **Testing**: Use the provided test configurations to validate your setup

---

**🎉 You're ready to use all features! Start with basic setup, then add the organization features as needed.**
