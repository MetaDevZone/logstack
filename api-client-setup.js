/**
 * 🌐 LogStack API Client Setup for Different Server
 *
 * Features:
 * - REST API based logging (for microservices/different servers)
 * - HTTP client for LogStack server
 * - Same retention policies (14 days DB, 180 days S3)
 * - Automatic retry logic
 * - Error handling
 * - Health monitoring
 */

const fetch = require("node-fetch");
require("dotenv").config();

// API Client configuration
const apiClientConfig = {
  // LogStack Server URL (running on different server)
  logstackServerUrl:
    process.env.LOGSTACK_SERVER_URL || "http://logstack-server:4000",

  // API Authentication
  apiKey: process.env.LOGSTACK_API_KEY || "your-secure-api-key",

  // Client Configuration
  clientId: process.env.CLIENT_ID || "client-app-1",
  serviceName: process.env.SERVICE_NAME || "my-microservice",

  // Retry Configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    backoffMultiplier: 2,
  },

  // Queue for offline scenarios
  offlineQueue: {
    enabled: true,
    maxSize: 1000,
    flushInterval: 30000, // 30 seconds
  },

  // Request timeout
  timeout: 10000, // 10 seconds
};

// Offline queue for storing logs when server is unavailable
let offlineQueue = [];
let isProcessingQueue = false;

/**
 * LogStack API Client Class
 */
class LogStackAPIClient {
  constructor(config = apiClientConfig) {
    this.config = config;
    this.baseUrl = config.logstackServerUrl;
    this.apiKey = config.apiKey;
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "X-Client-ID": config.clientId,
      "X-Service-Name": config.serviceName,
    };

    // Start offline queue processor
    if (config.offlineQueue.enabled) {
      this.startQueueProcessor();
    }
  }

  /**
   * Make HTTP request to LogStack server
   */
  async makeRequest(endpoint, data, method = "POST") {
    const url = `${this.baseUrl}${endpoint}`;

    for (let attempt = 0; attempt <= this.config.retry.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: this.headers,
          body: method !== "GET" ? JSON.stringify(data) : undefined,
          timeout: this.config.timeout,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error(
          `❌ LogStack API error (attempt ${attempt + 1}):`,
          error.message
        );

        // If it's the last attempt or not a network error, throw
        if (
          attempt === this.config.retry.maxRetries ||
          !this.isNetworkError(error)
        ) {
          // Add to offline queue if enabled
          if (this.config.offlineQueue.enabled && method === "POST") {
            this.addToOfflineQueue(endpoint, data);
          }
          throw error;
        }

        // Wait before retry
        const delay =
          this.config.retry.retryDelay *
          Math.pow(this.config.retry.backoffMultiplier, attempt);
        await this.sleep(delay);
      }
    }
  }

  /**
   * Check if error is network-related
   */
  isNetworkError(error) {
    return (
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.code === "ETIMEDOUT" ||
      error.message.includes("timeout")
    );
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Add log to offline queue
   */
  addToOfflineQueue(endpoint, data) {
    if (offlineQueue.length >= this.config.offlineQueue.maxSize) {
      console.warn("⚠️ Offline queue is full, dropping oldest log");
      offlineQueue.shift();
    }

    offlineQueue.push({
      endpoint,
      data,
      timestamp: new Date(),
      attempts: 0,
    });

    console.log(`📦 Added to offline queue (${offlineQueue.length} items)`);
  }

  /**
   * Process offline queue
   */
  async processOfflineQueue() {
    if (isProcessingQueue || offlineQueue.length === 0) {
      return;
    }

    isProcessingQueue = true;
    console.log(`🔄 Processing offline queue (${offlineQueue.length} items)`);

    const toProcess = [...offlineQueue];
    offlineQueue = [];

    for (const item of toProcess) {
      try {
        await this.makeRequest(item.endpoint, item.data);
        console.log(`✅ Offline log sent: ${item.endpoint}`);
      } catch (error) {
        item.attempts++;
        if (item.attempts < 3) {
          offlineQueue.push(item); // Re-queue for retry
        } else {
          console.error(`❌ Dropping log after 3 attempts:`, error.message);
        }
      }
    }

    isProcessingQueue = false;
  }

  /**
   * Start queue processor
   */
  startQueueProcessor() {
    setInterval(() => {
      this.processOfflineQueue();
    }, this.config.offlineQueue.flushInterval);
  }

  /**
   * Save API Log
   */
  async saveApiLog(logData) {
    try {
      const enrichedData = {
        ...logData,
        clientId: this.config.clientId,
        serviceName: this.config.serviceName,
        timestamp: new Date(),
        source: "api-client",
      };

      const result = await this.makeRequest("/api/api-logs", enrichedData);
      return result;
    } catch (error) {
      console.error("❌ Failed to save API log:", error.message);
      throw error;
    }
  }

  /**
   * Save Application Log
   */
  async saveLog(logData) {
    try {
      const enrichedData = {
        ...logData,
        clientId: this.config.clientId,
        serviceName: this.config.serviceName,
        timestamp: new Date(),
        source: "api-client",
      };

      const result = await this.makeRequest("/api/logs", enrichedData);
      return result;
    } catch (error) {
      console.error("❌ Failed to save log:", error.message);
      throw error;
    }
  }

  /**
   * Save Job Log
   */
  async saveJob(jobData) {
    try {
      const enrichedData = {
        ...jobData,
        clientId: this.config.clientId,
        serviceName: this.config.serviceName,
        timestamp: new Date(),
        source: "api-client",
      };

      const result = await this.makeRequest("/api/jobs", enrichedData);
      return result;
    } catch (error) {
      console.error("❌ Failed to save job:", error.message);
      throw error;
    }
  }

  /**
   * Get API Logs
   */
  async getApiLogs(query = {}) {
    try {
      const queryString = new URLSearchParams(query).toString();
      const result = await this.makeRequest(
        `/api/api-logs?${queryString}`,
        null,
        "GET"
      );
      return result;
    } catch (error) {
      console.error("❌ Failed to get API logs:", error.message);
      throw error;
    }
  }

  /**
   * Get Application Logs
   */
  async getLogs(query = {}) {
    try {
      const queryString = new URLSearchParams(query).toString();
      const result = await this.makeRequest(
        `/api/logs?${queryString}`,
        null,
        "GET"
      );
      return result;
    } catch (error) {
      console.error("❌ Failed to get logs:", error.message);
      throw error;
    }
  }

  /**
   * Get Health Status
   */
  async getHealth() {
    try {
      const result = await this.makeRequest("/health", null, "GET");
      return result;
    } catch (error) {
      console.error("❌ Failed to get health:", error.message);
      throw error;
    }
  }

  /**
   * Test connection to LogStack server
   */
  async testConnection() {
    try {
      const result = await this.getHealth();
      console.log("✅ LogStack server connection successful");
      return { status: "connected", serverHealth: result };
    } catch (error) {
      console.error("❌ LogStack server connection failed:", error.message);
      return { status: "failed", error: error.message };
    }
  }
}

// Global client instance
let logStackClient = null;

/**
 * Initialize LogStack API Client
 */
async function initializeLogStackClient(config = apiClientConfig) {
  try {
    console.log("🚀 Initializing LogStack API Client...");

    logStackClient = new LogStackAPIClient(config);

    // Test connection
    const connectionTest = await logStackClient.testConnection();

    if (connectionTest.status === "connected") {
      console.log("✅ LogStack API Client initialized successfully!");
      console.log("📊 Configuration Summary:");
      console.log(`   Server URL: ${config.logstackServerUrl}`);
      console.log(`   Client ID: ${config.clientId}`);
      console.log(`   Service Name: ${config.serviceName}`);
      console.log(
        `   Offline Queue: ${
          config.offlineQueue.enabled ? "Enabled" : "Disabled"
        }`
      );
      console.log(`   Max Retries: ${config.retry.maxRetries}`);
      console.log("");
      console.log("🔄 Features enabled:");
      console.log("   ✅ API-based logging to remote LogStack server");
      console.log("   ✅ Automatic retry with exponential backoff");
      console.log("   ✅ Offline queue for network failures");
      console.log("   ✅ Health monitoring and connection testing");
    } else {
      console.warn(
        "⚠️ LogStack server connection failed, but client initialized"
      );
      console.warn("   Logs will be queued and sent when server is available");
    }

    return logStackClient;
  } catch (error) {
    console.error("❌ LogStack API Client initialization failed:", error);
    throw error;
  }
}

/**
 * Helper functions that use the global client
 */

/**
 * Log API requests (Express.js middleware)
 */
async function logApiRequest(req, res, next) {
  if (!logStackClient) {
    console.warn("⚠️ LogStack client not initialized");
    return next();
  }

  const startTime = new Date();

  res.on("finish", async () => {
    try {
      await logStackClient.saveApiLog({
        method: req.method,
        path: req.path,
        responseStatus: res.statusCode,
        request_time: startTime,
        response_time: new Date(),
        client_ip: req.ip || req.connection.remoteAddress,
        requestHeaders: req.headers,
        requestBody: req.body,
        responseHeaders: res.getHeaders(),
        userAgent: req.get("User-Agent"),
        responseTime: new Date() - startTime,
      });
    } catch (error) {
      console.error("❌ Failed to log API request:", error.message);
    }
  });

  next();
}

/**
 * Log application events
 */
async function logAppEvent(level, message, metadata = {}) {
  if (!logStackClient) {
    console.warn("⚠️ LogStack client not initialized");
    return;
  }

  try {
    await logStackClient.saveLog({
      level,
      message,
      service: metadata.service || apiClientConfig.serviceName,
      metadata: {
        ...metadata,
        environment: process.env.NODE_ENV || "production",
      },
    });
  } catch (error) {
    console.error("❌ Failed to log app event:", error.message);
  }
}

/**
 * Log background jobs
 */
async function logJob(jobName, status, metadata = {}) {
  if (!logStackClient) {
    console.warn("⚠️ LogStack client not initialized");
    return;
  }

  try {
    await logStackClient.saveJob({
      jobName,
      status,
      startTime: metadata.startTime || new Date(),
      endTime: metadata.endTime,
      metadata: {
        ...metadata,
        environment: process.env.NODE_ENV || "production",
      },
    });
  } catch (error) {
    console.error("❌ Failed to log job:", error.message);
  }
}

/**
 * Express.js Integration Setup
 */
function setupExpressLogging(app) {
  // Add logging middleware
  app.use(logApiRequest);

  // Log server startup
  logAppEvent("info", "Express server starting", {
    service: apiClientConfig.serviceName,
    port: process.env.PORT || 3000,
  });

  // Log uncaught errors
  process.on("uncaughtException", (error) => {
    logAppEvent("error", "Uncaught exception", {
      service: "error-handler",
      error: error.message,
      stack: error.stack,
    });
  });

  process.on("unhandledRejection", (reason, promise) => {
    logAppEvent("error", "Unhandled promise rejection", {
      service: "error-handler",
      reason: reason.toString(),
      promise: promise.toString(),
    });
  });
}

/**
 * Background Job Runner with Logging
 */
async function runBackgroundJob(jobName, jobFunction) {
  const startTime = new Date();

  try {
    // Log job start
    await logJob(jobName, "started", { startTime });

    // Run the actual job
    const result = await jobFunction();

    // Log job completion
    await logJob(jobName, "completed", {
      startTime,
      endTime: new Date(),
      result: typeof result === "object" ? JSON.stringify(result) : result,
    });

    return result;
  } catch (error) {
    // Log job failure
    await logJob(jobName, "failed", {
      startTime,
      endTime: new Date(),
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
}

/**
 * Health Check Function
 */
async function healthCheck() {
  if (!logStackClient) {
    return {
      status: "unhealthy",
      error: "LogStack client not initialized",
      lastCheck: new Date(),
    };
  }

  try {
    const serverHealth = await logStackClient.getHealth();

    return {
      status: "healthy",
      client: {
        serviceName: apiClientConfig.serviceName,
        clientId: apiClientConfig.clientId,
        offlineQueueSize: offlineQueue.length,
      },
      server: serverHealth,
      lastCheck: new Date(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      client: {
        serviceName: apiClientConfig.serviceName,
        clientId: apiClientConfig.clientId,
        offlineQueueSize: offlineQueue.length,
      },
      lastCheck: new Date(),
    };
  }
}

/**
 * Get offline queue status
 */
function getOfflineQueueStatus() {
  return {
    size: offlineQueue.length,
    isProcessing: isProcessingQueue,
    maxSize: apiClientConfig.offlineQueue.maxSize,
    enabled: apiClientConfig.offlineQueue.enabled,
  };
}

/**
 * Flush offline queue manually
 */
async function flushOfflineQueue() {
  if (!logStackClient) {
    throw new Error("LogStack client not initialized");
  }

  console.log("🔄 Manually flushing offline queue...");
  await logStackClient.processOfflineQueue();
  console.log("✅ Offline queue flushed");
}

// Export functions
module.exports = {
  LogStackAPIClient,
  initializeLogStackClient,
  logApiRequest,
  logAppEvent,
  logJob,
  setupExpressLogging,
  runBackgroundJob,
  healthCheck,
  getOfflineQueueStatus,
  flushOfflineQueue,
  apiClientConfig,
};

// Auto-initialize if this file is run directly
if (require.main === module) {
  initializeLogStackClient().catch(console.error);
}
