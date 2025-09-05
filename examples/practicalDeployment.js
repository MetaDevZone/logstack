// Practical Deployment Examples for LogStack
// Run with: node examples/practicalDeployment.js [strategy]

const logstack = require("../dist/index.js");

// ==========================================
// 🎯 SCENARIO-BASED CONFIGURATIONS
// ==========================================

// E-commerce Application
const ecommerceConfigs = {
  // Small startup - embedded deployment
  startup: {
    dbUri: "mongodb://localhost:27017/ecommerce-startup",
    uploadProvider: "local",
    outputDirectory: "./order-logs",
    collections: {
      apiLogsCollectionName: "order_api_logs",
      jobsCollectionName: "logstack_jobs",
    },
    retention: {
      database: { apiLogs: 7, jobs: 3 },
    },
  },

  // Growing company - isolated data
  growing: {
    dbUri: "mongodb://localhost:27017/ecommerce-logs",
    uploadProvider: "s3",
    s3: {
      bucket: "ecommerce-growing-logs",
      region: "us-east-1",
    },
    retention: {
      database: { apiLogs: 30, jobs: 90 },
      storage: { files: 365 },
    },
  },

  // Enterprise - complete isolation
  enterprise: {
    dbUri: "mongodb://logs-cluster:27017/ecommerce-logs",
    uploadProvider: "s3",
    s3: {
      bucket: "ecommerce-enterprise-logs",
      region: "us-east-1",
    },
    apiServer: {
      enabled: true,
      port: 4000,
      auth: { apiKey: "ecommerce-secure-key-2024" },
    },
    retention: {
      database: { apiLogs: 90, jobs: 180 },
      storage: { files: 2555 },
    },
  },
};

// SaaS Application
const saasConfigs = {
  // Development environment
  development: {
    dbUri: "mongodb://localhost:27017/saas-dev",
    uploadProvider: "local",
    outputDirectory: "./saas-dev-logs",
    collections: {
      apiLogsCollectionName: "dev_api_logs",
      jobsCollectionName: "dev_jobs",
    },
    retention: {
      database: { apiLogs: 1, jobs: 1 },
    },
  },

  // Multi-tenant production
  production: {
    dbUri: "mongodb://prod-cluster:27017/saas-logs",
    uploadProvider: "s3",
    s3: {
      bucket: "saas-tenant-logs",
      region: "us-west-2",
    },
    folderStructure: {
      type: "daily",
      subFolders: {
        enabled: true,
        custom: ["tenant-{tenantId}", "service-{service}"],
      },
    },
    collections: {
      apiLogsCollectionName: "tenant_api_logs",
      jobsCollectionName: "tenant_jobs",
    },
    retention: {
      database: { apiLogs: 60, jobs: 120 },
      storage: { files: 1095 }, // 3 years
    },
  },
};

// Microservices Architecture
const microservicesConfigs = {
  // API Gateway
  gateway: {
    dbUri: "mongodb://shared-db:27017/microservices",
    uploadProvider: "s3",
    s3: { bucket: "microservices-logs", region: "eu-west-1" },
    collections: {
      apiLogsCollectionName: "gateway_api_logs",
      jobsCollectionName: "gateway_jobs",
    },
    outputDirectory: "microservices/api-gateway",
  },

  // User Service
  userService: {
    dbUri: "mongodb://user-db:27017/user-service",
    uploadProvider: "s3",
    s3: { bucket: "microservices-logs", region: "eu-west-1" },
    collections: {
      apiLogsCollectionName: "user_service_logs",
      jobsCollectionName: "user_service_jobs",
    },
    outputDirectory: "microservices/user-service",
  },

  // Payment Service
  paymentService: {
    dbUri: "mongodb://payment-db:27017/payment-service",
    uploadProvider: "s3",
    s3: { bucket: "microservices-logs", region: "eu-west-1" },
    collections: {
      apiLogsCollectionName: "payment_service_logs",
      jobsCollectionName: "payment_service_jobs",
    },
    outputDirectory: "microservices/payment-service",
    retention: {
      database: { apiLogs: 180, jobs: 365 }, // Financial data longer retention
      storage: { files: 2555 },
    },
  },
};

// ==========================================
// 🚀 DEPLOYMENT FUNCTIONS
// ==========================================

async function deployEcommerceStartup() {
  console.log("🛒 E-commerce Startup Deployment (Embedded)");
  console.log("=".repeat(50));

  const config = ecommerceConfigs.startup;
  await logstack.init(config);

  console.log("✅ Embedded LogStack initialized for startup");
  console.log("💡 Benefits:");
  console.log("   - 💰 Cost effective (no additional infrastructure)");
  console.log("   - ⚡ High performance (direct function calls)");
  console.log("   - 🔧 Simple maintenance");
  console.log("\n📊 Usage in your Express.js app:");
  console.log(`
  const express = require('express');
  const app = express();
  
  // Add LogStack middleware
  app.use(logstack.createApiLogMiddleware());
  
  // Your routes
  app.get('/api/products', (req, res) => {
    res.json(products);
  });
  
  app.post('/api/orders', async (req, res) => {
    const order = await createOrder(req.body);
    res.json(order);
  });
  `);

  return config;
}

async function deployEcommerceGrowing() {
  console.log("🛒 E-commerce Growing Company (Isolated Data)");
  console.log("=".repeat(55));

  const config = ecommerceConfigs.growing;
  await logstack.init(config);

  console.log("✅ LogStack with isolated data initialized");
  console.log("💡 Benefits:");
  console.log("   - 🔐 Complete data separation");
  console.log("   - ☁️  Cloud storage for scalability");
  console.log("   - 📊 Better retention policies");
  console.log("\n📈 Growth path advantages:");
  console.log("   - Same codebase, different database");
  console.log("   - Easy to migrate from startup setup");
  console.log("   - No API overhead");

  return config;
}

async function deployEcommerceEnterprise() {
  console.log("🛒 E-commerce Enterprise (Complete Isolation)");
  console.log("=".repeat(50));

  const config = ecommerceConfigs.enterprise;
  await logstack.init(config);

  // Start API server for enterprise
  const express = require("express");
  const app = express();

  app.use(express.json());

  // API key authentication
  app.use("/api", (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== config.apiServer.auth.apiKey) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    next();
  });

  // LogStack endpoints
  app.post("/api/logs", async (req, res) => {
    try {
      await logstack.saveApiLog(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await logstack.getApiLogs(req.query);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(config.apiServer.port, () => {
    console.log("✅ Enterprise LogStack API server started");
    console.log(`🌐 Server: http://localhost:${config.apiServer.port}`);
    console.log("💡 Benefits:");
    console.log("   - 🏢 Enterprise-grade isolation");
    console.log("   - 📈 Independent scaling");
    console.log("   - 🔐 API-based security");
    console.log("   - 📊 Comprehensive retention");
  });

  console.log("\n📱 Client usage example:");
  console.log(`
  const LogStackClient = require('logstack/client');
  const client = new LogStackClient(
    'http://logs-server:4000',
    'ecommerce-secure-key-2024'
  );
  
  // In your main application
  app.use(client.createMiddleware());
  
  // Manual logging
  await client.saveLog({
    method: 'POST',
    path: '/api/checkout',
    responseStatus: 200,
    client_ip: req.ip
  });
  `);

  return config;
}

async function deploySaaSMultiTenant() {
  console.log("🌐 SaaS Multi-Tenant Deployment");
  console.log("=".repeat(35));

  const config = saasConfigs.production;
  await logstack.init(config);

  console.log("✅ Multi-tenant LogStack initialized");
  console.log("💡 Key Features:");
  console.log("   - 🏢 Tenant isolation in folder structure");
  console.log("   - 📊 Service-based organization");
  console.log("   - 🔐 Long-term retention for compliance");

  console.log("\n📁 Folder Structure Example:");
  console.log("   saas-tenant-logs/");
  console.log("   ├── 2024-09-03/");
  console.log("   │   ├── tenant-acme-corp/");
  console.log("   │   │   ├── service-api/");
  console.log("   │   │   └── service-billing/");
  console.log("   │   └── tenant-startup-xyz/");
  console.log("   │       ├── service-api/");
  console.log("   │       └── service-analytics/");

  console.log("\n💻 Usage with tenant context:");
  console.log(`
  // Middleware with tenant context
  app.use((req, res, next) => {
    req.tenantId = extractTenantFromAuth(req);
    req.service = 'api'; // or 'billing', 'analytics'
    next();
  });
  
  app.use(async (req, res, next) => {
    await logstack.saveApiLog({
      ...logData,
      tenant_id: req.tenantId,
      service: req.service,
      custom_folder: \`tenant-\${req.tenantId}/service-\${req.service}\`
    });
  });
  `);

  return config;
}

async function deployMicroservices() {
  console.log("🔧 Microservices Architecture Deployment");
  console.log("=".repeat(45));

  const services = ["gateway", "userService", "paymentService"];
  const deployedServices = {};

  for (const service of services) {
    console.log(`\n🚀 Deploying ${service}...`);

    const config = microservicesConfigs[service];
    await logstack.init(config);

    deployedServices[service] = {
      config,
      status: "deployed",
      database: config.dbUri,
      outputPath: config.outputDirectory,
    };

    console.log(`✅ ${service} deployed successfully`);
    console.log(`   📍 Database: ${config.dbUri}`);
    console.log(`   📁 Output: ${config.outputDirectory}`);
  }

  console.log("\n📊 Microservices Summary:");
  console.log("=".repeat(30));
  Object.entries(deployedServices).forEach(([name, info]) => {
    console.log(`🔧 ${name}:`);
    console.log(`   Status: ${info.status}`);
    console.log(`   DB: ${info.database.split("/").pop()}`);
    console.log(`   Path: ${info.outputPath}`);
  });

  console.log("\n💡 Benefits:");
  console.log("   - 🎯 Service-specific databases");
  console.log("   - 📊 Organized S3 structure");
  console.log("   - 🔐 Service-level retention policies");
  console.log("   - 📈 Independent scaling per service");

  return deployedServices;
}

// ==========================================
// 🎛️ INTERACTIVE DEPLOYMENT SELECTOR
// ==========================================

async function interactiveDeployment() {
  const strategy = process.argv[2] || "help";

  console.log("\n🚀 LogStack Practical Deployment Examples");
  console.log("=".repeat(50));

  switch (strategy) {
    case "ecommerce-startup":
      return await deployEcommerceStartup();

    case "ecommerce-growing":
      return await deployEcommerceGrowing();

    case "ecommerce-enterprise":
      return await deployEcommerceEnterprise();

    case "saas-multitenant":
      return await deploySaaSMultiTenant();

    case "microservices":
      return await deployMicroservices();

    case "help":
    default:
      console.log("📋 Available deployment strategies:");
      console.log("");
      console.log("🛒 E-commerce Examples:");
      console.log("   ecommerce-startup     - Small startup (embedded)");
      console.log("   ecommerce-growing     - Growing company (isolated data)");
      console.log(
        "   ecommerce-enterprise  - Large enterprise (complete isolation)"
      );
      console.log("");
      console.log("🌐 SaaS Examples:");
      console.log("   saas-multitenant      - Multi-tenant SaaS platform");
      console.log("");
      console.log("🔧 Architecture Examples:");
      console.log("   microservices         - Microservices deployment");
      console.log("");
      console.log("💻 Usage:");
      console.log("   node examples/practicalDeployment.js [strategy]");
      console.log("");
      console.log("🔍 Examples:");
      console.log("   node examples/practicalDeployment.js ecommerce-startup");
      console.log("   node examples/practicalDeployment.js saas-multitenant");
      console.log("   node examples/practicalDeployment.js microservices");
      return null;
  }
}

// ==========================================
// 🎯 DEPLOYMENT COMPARISON TOOL
// ==========================================

function compareDeployments() {
  console.log("\n📊 Deployment Strategy Comparison");
  console.log("=".repeat(40));

  const comparison = [
    {
      strategy: "Embedded",
      server: "Same",
      database: "Same",
      performance: "⚡⚡⚡",
      isolation: "🔒",
      complexity: "🔧",
      cost: "💰",
      bestFor: "Startups, small apps",
    },
    {
      strategy: "Isolated Data",
      server: "Same",
      database: "Different",
      performance: "⚡⚡⚡",
      isolation: "🔒🔒",
      complexity: "🔧🔧",
      cost: "💰💰",
      bestFor: "Growing companies",
    },
    {
      strategy: "Microservice",
      server: "Different",
      database: "Same",
      performance: "⚡⚡",
      isolation: "🔒🔒",
      complexity: "🔧🔧🔧",
      cost: "💰💰💰",
      bestFor: "Microservices arch",
    },
    {
      strategy: "Enterprise",
      server: "Different",
      database: "Different",
      performance: "⚡",
      isolation: "🔒🔒🔒",
      complexity: "🔧🔧🔧🔧",
      cost: "💰💰💰💰",
      bestFor: "Large enterprises",
    },
  ];

  console.table(comparison);
}

// ==========================================
// 🚀 MAIN EXECUTION
// ==========================================

if (require.main === module) {
  interactiveDeployment()
    .then((result) => {
      if (result) {
        console.log("\n✨ Deployment completed successfully!");
        console.log("📊 Check your configured storage for processed logs");

        // Show comparison table
        setTimeout(() => {
          compareDeployments();
        }, 1000);
      }
    })
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = {
  ecommerceConfigs,
  saasConfigs,
  microservicesConfigs,
  deployEcommerceStartup,
  deployEcommerceGrowing,
  deployEcommerceEnterprise,
  deploySaaSMultiTenant,
  deployMicroservices,
  compareDeployments,
};
