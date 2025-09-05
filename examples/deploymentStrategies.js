// 🚀 LogStack Deployment Strategies Guide
// Is file main different deployment scenarios aur configurations show kiye gaye hain

const logstack = require("logstack");

// ==========================================
// 📋 DEPLOYMENT SCENARIOS OVERVIEW
// ==========================================

/*
🎯 DEPLOYMENT OPTIONS:

1️⃣ SAME SERVER + SAME DATABASE (Embedded/In-Process)
   - LogStack aur main app ek hi server per
   - Same database share karte hain
   - Direct function calls
   - Fastest performance

2️⃣ SAME SERVER + DIFFERENT DATABASE (Isolated Data)
   - LogStack aur main app ek hi server per
   - Separate databases
   - Direct function calls
   - Data isolation

3️⃣ DIFFERENT SERVER + SAME DATABASE (Microservice Shared DB)
   - LogStack alag server per as microservice
   - Database shared
   - API calls ke through communication
   - Good for scaling

4️⃣ DIFFERENT SERVER + DIFFERENT DATABASE (Complete Isolation)
   - LogStack completely separate
   - Own database
   - API communication
   - Maximum isolation and scalability
*/

// ==========================================
// 1️⃣ SAME SERVER + SAME DATABASE
// ==========================================

const embeddedConfig = {
  deployment: "embedded",
  dbUri: "mongodb://localhost:27017/myapp", // Same as main app
  uploadProvider: "local",
  outputDirectory: "./logs",

  // Same database, different collections
  collections: {
    apiLogsCollectionName: "api_logs", // Your existing or new collection
    jobsCollectionName: "logstack_jobs", // LogStack specific
    logsCollectionName: "logstack_logs", // LogStack specific
  },

  // Lightweight configuration for embedded use
  retention: {
    database: {
      apiLogs: 7, // Keep minimal for same DB
      jobs: 3,
      autoCleanup: true,
    },
  },
};

// Usage in your main app
async function initEmbeddedLogStack() {
  console.log("🔧 Embedded LogStack Setup (Same Server + Same DB)");
  console.log("=".repeat(50));

  try {
    // Initialize LogStack in your main application
    await logstack.init(embeddedConfig);
    console.log("✅ LogStack initialized in embedded mode");
    console.log("📍 Database: Shared with main application");
    console.log("🏠 Server: Same as main application");
    console.log("⚡ Performance: Maximum (direct calls)");

    // Direct usage in your routes
    return {
      // Middleware for Express.js
      middleware: logstack.createApiLogMiddleware(),

      // Direct functions
      saveLog: logstack.saveApiLog,
      getLogs: logstack.getApiLogs,
      processLogs: logstack.runHourlyJob,
    };
  } catch (error) {
    console.error("❌ Failed to initialize embedded LogStack:", error);
    throw error;
  }
}

// ==========================================
// 2️⃣ SAME SERVER + DIFFERENT DATABASE
// ==========================================

const isolatedDataConfig = {
  deployment: "isolated-data",
  dbUri: "mongodb://localhost:27017/logstack_data", // Separate database
  uploadProvider: "local",
  outputDirectory: "./logstack-data",

  collections: {
    apiLogsCollectionName: "api_logs",
    jobsCollectionName: "jobs",
    logsCollectionName: "processing_logs",
  },

  // More aggressive retention since separate DB
  retention: {
    database: {
      apiLogs: 30,
      jobs: 90,
      logs: 90,
      autoCleanup: true,
      cleanupCron: "0 2 * * *",
    },
  },
};

async function initIsolatedDataLogStack() {
  console.log("🔧 Isolated Data LogStack Setup (Same Server + Different DB)");
  console.log("=".repeat(55));

  try {
    await logstack.init(isolatedDataConfig);
    console.log("✅ LogStack initialized with isolated data");
    console.log("📍 Database: Separate from main application");
    console.log("🏠 Server: Same as main application");
    console.log("🔐 Data: Completely isolated");
    console.log("⚡ Performance: High (direct calls)");

    return {
      middleware: logstack.createApiLogMiddleware(),
      saveLog: logstack.saveApiLog,
      getLogs: logstack.getApiLogs,
      createJobs: logstack.createDailyJobs,
    };
  } catch (error) {
    console.error("❌ Failed to initialize isolated data LogStack:", error);
    throw error;
  }
}

// ==========================================
// 3️⃣ DIFFERENT SERVER + SAME DATABASE
// ==========================================

const microserviceSharedDBConfig = {
  deployment: "microservice-shared-db",
  dbUri: "mongodb://localhost:27017/myapp", // Same as main app
  uploadProvider: "s3",

  // S3 configuration for separate server
  s3: {
    bucket: "company-logs",
    region: "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

  collections: {
    apiLogsCollectionName: "api_logs", // Shared with main app
    jobsCollectionName: "logstack_jobs", // LogStack specific
    logsCollectionName: "logstack_logs", // LogStack specific
  },

  // API server configuration
  apiServer: {
    enabled: true,
    port: 3001,
    host: "0.0.0.0",
    cors: {
      origin: ["http://localhost:3000", "https://myapp.com"],
      credentials: true,
    },
    auth: {
      enabled: true,
      apiKey: process.env.LOGSTACK_API_KEY || "your-secure-api-key",
    },
  },

  retention: {
    database: {
      apiLogs: 30,
      jobs: 90,
      autoCleanup: true,
    },
    storage: {
      files: 365,
      autoCleanup: true,
    },
  },
};

async function initMicroserviceSharedDB() {
  console.log("🔧 Microservice LogStack Setup (Different Server + Same DB)");
  console.log("=".repeat(60));

  try {
    await logstack.init(microserviceSharedDBConfig);

    // Start API server
    const express = require("express");
    const cors = require("cors");
    const app = express();

    app.use(cors(microserviceSharedDBConfig.apiServer.cors));
    app.use(express.json());

    // API key middleware
    const authenticateApiKey = (req, res, next) => {
      const apiKey = req.headers["x-api-key"];
      if (apiKey !== microserviceSharedDBConfig.apiServer.auth.apiKey) {
        return res.status(401).json({ error: "Invalid API key" });
      }
      next();
    };

    app.use(authenticateApiKey);

    // LogStack API endpoints
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

    app.post("/api/jobs/create", async (req, res) => {
      try {
        const result = await logstack.createDailyJobs(req.body.date);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/jobs/run", async (req, res) => {
      try {
        const result = await logstack.runHourlyJob(
          req.body.date,
          req.body.hour
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    const port = microserviceSharedDBConfig.apiServer.port;
    app.listen(port, () => {
      console.log("✅ LogStack microservice initialized");
      console.log(`📍 Database: Shared with main application`);
      console.log(`🏠 Server: Separate microservice`);
      console.log(`🌐 API Server: http://localhost:${port}`);
      console.log(`🔐 Authentication: API Key required`);
      console.log(`☁️  Storage: S3 - ${microserviceSharedDBConfig.s3.bucket}`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize microservice LogStack:", error);
    throw error;
  }
}

// ==========================================
// 4️⃣ DIFFERENT SERVER + DIFFERENT DATABASE
// ==========================================

const completelySeparateConfig = {
  deployment: "completely-separate",
  dbUri: "mongodb://logstack-server:27017/logstack", // Completely separate
  uploadProvider: "s3",

  s3: {
    bucket: "logstack-storage",
    region: "us-east-1",
    accessKeyId: process.env.LOGSTACK_AWS_ACCESS_KEY,
    secretAccessKey: process.env.LOGSTACK_AWS_SECRET_KEY,
  },

  collections: {
    apiLogsCollectionName: "api_logs",
    jobsCollectionName: "jobs",
    logsCollectionName: "processing_logs",
  },

  // API server with full features
  apiServer: {
    enabled: true,
    port: 4000,
    host: "0.0.0.0",
    cors: {
      origin: "*", // Configure based on your needs
      credentials: true,
    },
    auth: {
      enabled: true,
      apiKey: process.env.LOGSTACK_API_KEY,
      jwt: {
        enabled: true,
        secret: process.env.JWT_SECRET,
        expiresIn: "24h",
      },
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
    },
  },

  // Comprehensive retention for separate service
  retention: {
    database: {
      apiLogs: 90,
      jobs: 180,
      logs: 180,
      autoCleanup: true,
      cleanupCron: "0 2 * * *",
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
};

async function initCompletelySeparateLogStack() {
  console.log(
    "🔧 Completely Separate LogStack Setup (Different Server + Different DB)"
  );
  console.log("=".repeat(70));

  try {
    await logstack.init(completelySeparateConfig);

    const express = require("express");
    const cors = require("cors");
    const rateLimit = require("express-rate-limit");
    const jwt = require("jsonwebtoken");
    const app = express();

    // Middleware setup
    app.use(cors(completelySeparateConfig.apiServer.cors));
    app.use(express.json());

    // Rate limiting
    const limiter = rateLimit(completelySeparateConfig.apiServer.rateLimit);
    app.use(limiter);

    // Authentication middleware
    const authenticateRequest = (req, res, next) => {
      const apiKey = req.headers["x-api-key"];
      const token = req.headers["authorization"]?.replace("Bearer ", "");

      // API Key authentication
      if (apiKey === completelySeparateConfig.apiServer.auth.apiKey) {
        return next();
      }

      // JWT authentication
      if (token && completelySeparateConfig.apiServer.auth.jwt.enabled) {
        try {
          const decoded = jwt.verify(
            token,
            completelySeparateConfig.apiServer.auth.jwt.secret
          );
          req.user = decoded;
          return next();
        } catch (error) {
          return res.status(401).json({ error: "Invalid token" });
        }
      }

      return res.status(401).json({ error: "Authentication required" });
    };

    app.use("/api", authenticateRequest);

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({ status: "healthy", service: "LogStack", version: "1.0.0" });
    });

    // Authentication endpoint
    app.post("/auth/login", (req, res) => {
      const { username, password } = req.body;

      // Simple authentication (implement your own logic)
      if (username === "admin" && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
          { username, role: "admin" },
          completelySeparateConfig.apiServer.auth.jwt.secret,
          { expiresIn: completelySeparateConfig.apiServer.auth.jwt.expiresIn }
        );
        res.json({ token, expiresIn: "24h" });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    });

    // LogStack API endpoints
    app.post("/api/logs", async (req, res) => {
      try {
        const result = await logstack.saveApiLog(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get("/api/logs", async (req, res) => {
      try {
        const logs = await logstack.getApiLogs(req.query);
        res.json({ success: true, data: logs });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get("/api/logs/hour/:date/:hour", async (req, res) => {
      try {
        const logs = await logstack.getApiLogsByHour(
          req.params.date,
          req.params.hour
        );
        res.json({ success: true, data: logs });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/jobs/create", async (req, res) => {
      try {
        const result = await logstack.createDailyJobs(req.body.date);
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/jobs/run", async (req, res) => {
      try {
        const result = await logstack.runHourlyJob(
          req.body.date,
          req.body.hour
        );
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get("/api/jobs/status/:jobId", async (req, res) => {
      try {
        const status = await logstack.getJobStatus(req.params.jobId);
        res.json({ success: true, data: status });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Statistics endpoint
    app.get("/api/stats", async (req, res) => {
      try {
        const stats = await logstack.getLogs(req.query);
        res.json({ success: true, data: stats });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    const port = completelySeparateConfig.apiServer.port;
    app.listen(port, () => {
      console.log("✅ LogStack completely separate service initialized");
      console.log(`📍 Database: Completely separate`);
      console.log(`🏠 Server: Dedicated LogStack server`);
      console.log(`🌐 API Server: http://localhost:${port}`);
      console.log(`🔐 Authentication: API Key + JWT`);
      console.log(`⚡ Rate Limiting: Enabled`);
      console.log(`☁️  Storage: S3 - ${completelySeparateConfig.s3.bucket}`);
      console.log(`📊 Full featured API available`);
    });
  } catch (error) {
    console.error(
      "❌ Failed to initialize completely separate LogStack:",
      error
    );
    throw error;
  }
}

// ==========================================
// 🎯 CLIENT SDK FOR API USAGE
// ==========================================

class LogStackClient {
  constructor(baseURL, apiKey, options = {}) {
    this.baseURL = baseURL.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.token = options.token;
    this.timeout = options.timeout || 5000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "X-API-Key": this.apiKey,
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`LogStack API Error: ${error.message}`);
    }
  }

  // Authentication
  async login(username, password) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: { username, password },
    });

    this.token = response.token;
    return response;
  }

  // Log operations
  async saveLog(logData) {
    return this.request("/api/logs", {
      method: "POST",
      body: logData,
    });
  }

  async getLogs(query = {}) {
    const queryString = new URLSearchParams(query).toString();
    return this.request(`/api/logs?${queryString}`);
  }

  async getLogsByHour(date, hour) {
    return this.request(`/api/logs/hour/${date}/${hour}`);
  }

  // Job operations
  async createDailyJobs(date) {
    return this.request("/api/jobs/create", {
      method: "POST",
      body: { date },
    });
  }

  async runHourlyJob(date, hour) {
    return this.request("/api/jobs/run", {
      method: "POST",
      body: { date, hour },
    });
  }

  async getJobStatus(jobId) {
    return this.request(`/api/jobs/status/${jobId}`);
  }

  // Statistics
  async getStats(query = {}) {
    const queryString = new URLSearchParams(query).toString();
    return this.request(`/api/stats?${queryString}`);
  }

  // Health check
  async healthCheck() {
    return this.request("/health");
  }
}

// ==========================================
// 📊 USAGE EXAMPLES FOR EACH DEPLOYMENT
// ==========================================

async function demonstrateAllDeployments() {
  console.log("\n🚀 LogStack Deployment Strategies Demo");
  console.log("=".repeat(50));

  // Example 1: Embedded usage
  console.log("\n1️⃣ EMBEDDED DEPLOYMENT EXAMPLE:");
  const embedded = await initEmbeddedLogStack();

  // Use in your Express.js app
  const express = require("express");
  const app = express();

  // Direct middleware usage
  app.use(embedded.middleware);

  // Direct function calls
  app.post("/test-log", async (req, res) => {
    await embedded.saveLog({
      request_time: new Date(),
      response_time: new Date(),
      method: "POST",
      path: "/test-log",
      responseStatus: 200,
    });
    res.json({ success: true });
  });

  // Example 2: API client usage for separate server
  console.log("\n4️⃣ API CLIENT USAGE EXAMPLE:");
  const client = new LogStackClient(
    "http://logstack-server:4000",
    "your-secure-api-key"
  );

  // Login if JWT is enabled
  await client.login("admin", "your-admin-password");

  // Use API methods
  await client.saveLog({
    request_time: new Date(),
    response_time: new Date(),
    method: "GET",
    path: "/api/users",
    responseStatus: 200,
  });

  const logs = await client.getLogs({ limit: 10 });
  console.log("📊 Retrieved logs:", logs.data.length);

  const health = await client.healthCheck();
  console.log("💚 Health status:", health.status);
}

// ==========================================
// 🎛️ DEPLOYMENT CONFIGURATION SELECTOR
// ==========================================

function selectDeploymentStrategy() {
  const strategy = process.env.LOGSTACK_DEPLOYMENT || "embedded";

  console.log(`🎯 Selected Deployment Strategy: ${strategy.toUpperCase()}`);

  switch (strategy) {
    case "embedded":
      return initEmbeddedLogStack();

    case "isolated-data":
      return initIsolatedDataLogStack();

    case "microservice-shared-db":
      return initMicroserviceSharedDB();

    case "completely-separate":
      return initCompletelySeparateLogStack();

    default:
      console.log("⚠️  Unknown deployment strategy, using embedded");
      return initEmbeddedLogStack();
  }
}

// ==========================================
// 🚀 MAIN EXECUTION
// ==========================================

if (require.main === module) {
  selectDeploymentStrategy()
    .then(() => {
      console.log("\n✨ LogStack deployment completed successfully!");
    })
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

// Export for external use
module.exports = {
  embeddedConfig,
  isolatedDataConfig,
  microserviceSharedDBConfig,
  completelySeparateConfig,
  LogStackClient,
  initEmbeddedLogStack,
  initIsolatedDataLogStack,
  initMicroserviceSharedDB,
  initCompletelySeparateLogStack,
  selectDeploymentStrategy,
};

/*
🎯 QUICK DEPLOYMENT GUIDE:

1️⃣ SAME SERVER + SAME DATABASE (Embedded):
   - Install: npm install logstack
   - Usage: Direct function calls in your app
   - Best for: Simple apps, getting started

2️⃣ SAME SERVER + DIFFERENT DATABASE:
   - Install: npm install logstack
   - Setup: Separate MongoDB database
   - Best for: Data isolation with same server

3️⃣ DIFFERENT SERVER + SAME DATABASE:
   - Deploy: LogStack as separate service
   - Communication: HTTP API calls
   - Best for: Microservices with shared data

4️⃣ DIFFERENT SERVER + DIFFERENT DATABASE:
   - Deploy: Completely separate LogStack service
   - Features: Full API, authentication, rate limiting
   - Best for: Enterprise, maximum scalability

🔧 ENVIRONMENT VARIABLES:
   LOGSTACK_DEPLOYMENT=embedded|isolated-data|microservice-shared-db|completely-separate
   LOGSTACK_API_KEY=your-secure-api-key
   JWT_SECRET=your-jwt-secret
   ADMIN_PASSWORD=your-admin-password
*/
