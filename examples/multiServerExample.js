// LogStack Multi-Server aur Multi-Database Example
// Is example main 3 alag servers per alag configurations show ki gayi hain

const logstack = require("logstack");

// ==========================================
// 🏢 PRODUCTION SERVER CONFIGURATION
// ==========================================
const productionConfig = {
  dbUri:
    process.env.PROD_DB_URI ||
    "mongodb://prod-mongo-cluster:27017/production-app",
  uploadProvider: "s3",

  // Production S3 Settings
  s3: {
    bucket: "company-production-logs",
    region: "us-east-1",
    accessKeyId: process.env.PROD_AWS_ACCESS_KEY,
    secretAccessKey: process.env.PROD_AWS_SECRET_KEY,
  },

  // Production Collections
  collections: {
    apiLogsCollectionName: "prod_api_logs",
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_processing_logs",
  },

  // Production Retention Policies
  retention: {
    database: {
      apiLogs: 30, // 30 days
      jobs: 90, // 90 days
      logs: 90, // 90 days
      autoCleanup: true,
      cleanupCron: "0 2 * * *", // 2 AM daily
    },
    storage: {
      files: 2555, // 7 years
      autoCleanup: true,
      s3Lifecycle: {
        transitionToIA: 30,
        transitionToGlacier: 90,
        transitionToDeepArchive: 365,
        expiration: 2555,
      },
    },
  },

  outputDirectory: "production-logs",
  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      byHour: true,
      byStatus: true,
    },
  },
};

// ==========================================
// 🧪 STAGING SERVER CONFIGURATION
// ==========================================
const stagingConfig = {
  dbUri:
    process.env.STAGING_DB_URI || "mongodb://staging-mongo:27017/staging-app",
  uploadProvider: "s3",

  // Staging S3 Settings
  s3: {
    bucket: "company-staging-logs",
    region: "us-west-2",
    accessKeyId: process.env.STAGING_AWS_ACCESS_KEY,
    secretAccessKey: process.env.STAGING_AWS_SECRET_KEY,
  },

  // Staging Collections
  collections: {
    apiLogsCollectionName: "staging_api_logs",
    jobsCollectionName: "staging_jobs",
    logsCollectionName: "staging_processing_logs",
  },

  // Staging Retention (shorter than production)
  retention: {
    database: {
      apiLogs: 7, // 7 days
      jobs: 30, // 30 days
      logs: 30, // 30 days
      autoCleanup: true,
      cleanupCron: "0 3 * * *", // 3 AM daily
    },
    storage: {
      files: 90, // 90 days
      autoCleanup: true,
    },
  },

  outputDirectory: "staging-logs",
};

// ==========================================
// 💻 DEVELOPMENT SERVER CONFIGURATION
// ==========================================
const developmentConfig = {
  dbUri: process.env.DEV_DB_URI || "mongodb://localhost:27017/dev-app",
  uploadProvider: "local", // Local storage for development

  // Development Collections
  collections: {
    apiLogsCollectionName: "dev_api_logs",
    jobsCollectionName: "dev_jobs",
    logsCollectionName: "dev_processing_logs",
  },

  // Development Retention (very short)
  retention: {
    database: {
      apiLogs: 1, // 1 day
      jobs: 7, // 7 days
      logs: 7, // 7 days
      autoCleanup: true,
      cleanupCron: "0 4 * * *", // 4 AM daily
    },
  },

  outputDirectory: "./dev-logs",
  fileFormat: "json",
};

// ==========================================
// 🏭 MICROSERVICES CONFIGURATION
// ==========================================

// User Service Configuration
const userServiceConfig = {
  dbUri: "mongodb://microservices-cluster:27017/user-service",
  uploadProvider: "s3",
  s3: {
    bucket: "microservices-logs",
    region: "eu-west-1",
  },
  collections: {
    apiLogsCollectionName: "user_service_api_logs",
    jobsCollectionName: "user_service_jobs",
    logsCollectionName: "user_service_logs",
  },
  outputDirectory: "microservices/user-service",
};

// Payment Service Configuration
const paymentServiceConfig = {
  dbUri: "mongodb://microservices-cluster:27017/payment-service",
  uploadProvider: "s3",
  s3: {
    bucket: "microservices-logs",
    region: "eu-west-1",
  },
  collections: {
    apiLogsCollectionName: "payment_service_api_logs",
    jobsCollectionName: "payment_service_jobs",
    logsCollectionName: "payment_service_logs",
  },
  outputDirectory: "microservices/payment-service",
};

// Order Service Configuration
const orderServiceConfig = {
  dbUri: "mongodb://microservices-cluster:27017/order-service",
  uploadProvider: "s3",
  s3: {
    bucket: "microservices-logs",
    region: "eu-west-1",
  },
  collections: {
    apiLogsCollectionName: "order_service_api_logs",
    jobsCollectionName: "order_service_jobs",
    logsCollectionName: "order_service_logs",
  },
  outputDirectory: "microservices/order-service",
};

// ==========================================
// 🚀 INITIALIZATION FUNCTIONS
// ==========================================

async function initializeProductionServer() {
  console.log("🏢 Initializing Production Server...");
  await logstack.init(productionConfig);
  console.log("✅ Production server initialized successfully");
  console.log(`📍 Database: ${productionConfig.dbUri}`);
  console.log(`☁️  Storage: S3 - ${productionConfig.s3.bucket}`);
  console.log(
    `📊 Collections: ${Object.values(productionConfig.collections).join(", ")}`
  );
}

async function initializeStagingServer() {
  console.log("🧪 Initializing Staging Server...");
  await logstack.init(stagingConfig);
  console.log("✅ Staging server initialized successfully");
  console.log(`📍 Database: ${stagingConfig.dbUri}`);
  console.log(`☁️  Storage: S3 - ${stagingConfig.s3.bucket}`);
}

async function initializeDevelopmentServer() {
  console.log("💻 Initializing Development Server...");
  await logstack.init(developmentConfig);
  console.log("✅ Development server initialized successfully");
  console.log(`📍 Database: ${developmentConfig.dbUri}`);
  console.log(`💾 Storage: Local - ${developmentConfig.outputDirectory}`);
}

async function initializeMicroservice(serviceName, config) {
  console.log(`🔧 Initializing ${serviceName}...`);
  await logstack.init(config);
  console.log(`✅ ${serviceName} initialized successfully`);
  console.log(`📍 Database: ${config.dbUri}`);
  console.log(`📁 Output: ${config.outputDirectory}`);
}

// ==========================================
// 🌍 ENVIRONMENT-BASED INITIALIZATION
// ==========================================

async function initializeBasedOnEnvironment() {
  const environment = process.env.NODE_ENV || "development";

  console.log(`🌍 Current Environment: ${environment.toUpperCase()}`);
  console.log("=".repeat(50));

  switch (environment) {
    case "production":
      await initializeProductionServer();
      break;

    case "staging":
      await initializeStagingServer();
      break;

    case "development":
    case "dev":
      await initializeDevelopmentServer();
      break;

    case "microservice-user":
      await initializeMicroservice("User Service", userServiceConfig);
      break;

    case "microservice-payment":
      await initializeMicroservice("Payment Service", paymentServiceConfig);
      break;

    case "microservice-order":
      await initializeMicroservice("Order Service", orderServiceConfig);
      break;

    default:
      console.log("⚠️  Unknown environment, using development config");
      await initializeDevelopmentServer();
  }
}

// ==========================================
// 📊 USAGE EXAMPLES
// ==========================================

async function demonstrateMultiServerUsage() {
  console.log("\n📋 Multi-Server LogStack Usage Examples");
  console.log("=".repeat(50));

  // Environment-based initialization
  await initializeBasedOnEnvironment();

  // Example API log saving
  console.log("\n📝 Saving API log...");
  await logstack.saveApiLog({
    request_time: new Date(),
    response_time: new Date(Date.now() + 500),
    method: "POST",
    path: "/api/users",
    requestBody: { name: "John Doe", email: "john@example.com" },
    responseStatus: 201,
    client_ip: "192.168.1.100",
    client_agent: "PostmanRuntime/7.28.4",
  });

  console.log("✅ API log saved successfully");

  // Create daily jobs
  console.log("\n🗓️  Creating daily jobs...");
  const today = new Date().toISOString().split("T")[0];
  await logstack.createDailyJobs(today);
  console.log("✅ Daily jobs created successfully");

  console.log(
    "\n🎯 LogStack successfully configured for multi-server environment!"
  );
  console.log("📊 Check your configured database and storage for logs");
}

// ==========================================
// 🎯 MAIN EXECUTION
// ==========================================

if (require.main === module) {
  demonstrateMultiServerUsage()
    .then(() => {
      console.log("\n✨ Multi-Server LogStack demo completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error in multi-server demo:", error);
      process.exit(1);
    });
}

// Export configurations for external use
module.exports = {
  productionConfig,
  stagingConfig,
  developmentConfig,
  userServiceConfig,
  paymentServiceConfig,
  orderServiceConfig,
  initializeBasedOnEnvironment,
  demonstrateMultiServerUsage,
};

// ==========================================
// 📚 USAGE INSTRUCTIONS
// ==========================================

/*
🚀 HOW TO USE:

1. Environment Variables Set Karein:
   export NODE_ENV=production
   export PROD_DB_URI=mongodb://your-prod-server:27017/your-prod-db
   export PROD_AWS_ACCESS_KEY=your-access-key
   export PROD_AWS_SECRET_KEY=your-secret-key

2. Script Run Karein:
   node multiServerExample.js

3. Microservice Ke Liye:
   export NODE_ENV=microservice-user
   node multiServerExample.js

4. Different Servers Pe:
   - Production server pe: NODE_ENV=production
   - Staging server pe: NODE_ENV=staging  
   - Dev machine pe: NODE_ENV=development

🔧 KEY BENEFITS:

✅ Har server ka alag database
✅ Har environment ka alag S3 bucket
✅ Alag collection names
✅ Environment-specific retention policies
✅ Flexible configuration management
✅ Microservices support
✅ Easy deployment across servers

🎯 RESULT:
Har server apna alag logs maintain karega aur koi conflict nahi hoga!
*/
