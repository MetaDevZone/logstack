/**
 * 🚀 LogStack Express Server
 *
 * Standalone server mode for LogStack - can run as separate service
 * with REST API endpoints for external applications to use
 */

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");
const logstack = require("./dist/index.js");

class LogStackServer {
  constructor(config = {}) {
    this.app = express();
    this.config = {
      port: process.env.LOGSTACK_PORT || 4000,
      host: process.env.LOGSTACK_HOST || "0.0.0.0",
      apiKey:
        process.env.LOGSTACK_API_KEY ||
        "logstack-default-key-change-in-production",
      enableAuth: process.env.LOGSTACK_ENABLE_AUTH !== "false",
      enableRateLimit: process.env.LOGSTACK_ENABLE_RATE_LIMIT !== "false",
      rateLimitMax: parseInt(process.env.LOGSTACK_RATE_LIMIT_MAX) || 1000,
      rateLimitWindow:
        parseInt(process.env.LOGSTACK_RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
      enableCors: process.env.LOGSTACK_ENABLE_CORS !== "false",
      corsOrigin: process.env.LOGSTACK_CORS_ORIGIN || "*",
      ...config,
    };

    this.logstackConfig = null;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(compression());

    // CORS
    if (this.config.enableCors) {
      this.app.use(
        cors({
          origin: this.config.corsOrigin,
          credentials: true,
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
        })
      );
    }

    // Rate limiting
    if (this.config.enableRateLimit) {
      const limiter = rateLimit({
        windowMs: this.config.rateLimitWindow,
        max: this.config.rateLimitMax,
        message: {
          error: "Too many requests from this IP, please try again later.",
          retryAfter: Math.ceil(this.config.rateLimitWindow / 1000),
        },
        standardHeaders: true,
        legacyHeaders: false,
      });
      this.app.use("/api/", limiter);
    }

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // API Key authentication middleware
    if (this.config.enableAuth) {
      this.app.use("/api", (req, res, next) => {
        const apiKey =
          req.headers["x-api-key"] ||
          req.headers["authorization"]?.replace("Bearer ", "");

        if (!apiKey || apiKey !== this.config.apiKey) {
          return res.status(401).json({
            error: "Unauthorized",
            message:
              "Valid API key required in X-API-Key header or Authorization Bearer token",
          });
        }

        next();
      });
    }

    // Request logging
    this.app.use((req, res, next) => {
      console.log(
        `${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`
      );
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint (no auth required)
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        service: "LogStack",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      });
    });

    // Service info endpoint (no auth required)
    this.app.get("/info", (req, res) => {
      res.json({
        service: "LogStack Standalone Server",
        description: "API for saving and retrieving application logs",
        version: "1.0.0",
        features: [
          "Save API logs",
          "Retrieve logs with filtering",
          "Create and manage jobs",
          "Automatic hourly/daily processing",
          "S3/Local storage support",
          "Data retention policies",
        ],
        endpoints: {
          "POST /api/logs": "Save single API log",
          "POST /api/logs/batch": "Save multiple API logs",
          "GET /api/logs": "Retrieve logs with optional filtering",
          "GET /api/logs/hour/:date/:hour": "Get logs for specific hour",
          "POST /api/jobs/create": "Create daily jobs",
          "POST /api/jobs/run": "Run hourly job",
          "GET /api/jobs/status/:jobId": "Get job status",
          "GET /api/stats": "Get processing statistics",
        },
      });
    });

    // Initialize LogStack endpoint
    this.app.post("/api/initialize", async (req, res) => {
      try {
        const config = req.body;

        if (!config.dbUri || !config.uploadProvider) {
          return res.status(400).json({
            error: "Invalid configuration",
            message: "dbUri and uploadProvider are required",
          });
        }

        await logstack.init(config);
        this.logstackConfig = config;

        res.json({
          success: true,
          message: "LogStack initialized successfully",
          config: {
            uploadProvider: config.uploadProvider,
            outputDirectory: config.outputDirectory,
            collections: config.collections,
          },
        });
      } catch (error) {
        res.status(500).json({
          error: "Initialization failed",
          message: error.message,
        });
      }
    });

    // Save single API log
    this.app.post("/api/logs", async (req, res) => {
      try {
        if (!logstack.isInitialized()) {
          return res.status(503).json({
            error: "Service not initialized",
            message: "Call /api/initialize first",
          });
        }

        const logData = {
          request_time: new Date(req.body.request_time || Date.now()),
          response_time: new Date(req.body.response_time || Date.now()),
          method: req.body.method,
          path: req.body.path,
          requestBody: req.body.requestBody || {},
          requestHeaders: req.body.requestHeaders || {},
          responseStatus: req.body.responseStatus,
          responseBody: req.body.responseBody,
          requestQuery: req.body.requestQuery || {},
          requestParams: req.body.requestParams || {},
          client_ip: req.body.client_ip || req.ip,
          client_agent: req.body.client_agent || req.get("User-Agent"),
          ...req.body, // Allow custom fields
        };

        const result = await logstack.saveApiLog(logData);

        res.json({
          success: true,
          message: "Log saved successfully",
          data: result,
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to save log",
          message: error.message,
        });
      }
    });

    // Save multiple API logs (batch)
    this.app.post("/api/logs/batch", async (req, res) => {
      try {
        if (!logstack.isInitialized()) {
          return res.status(503).json({
            error: "Service not initialized",
            message: "Call /api/initialize first",
          });
        }

        const logs = req.body.logs || [];
        if (!Array.isArray(logs)) {
          return res.status(400).json({
            error: "Invalid data format",
            message: "logs must be an array",
          });
        }

        const results = [];
        const errors = [];

        for (let i = 0; i < logs.length; i++) {
          try {
            const logData = {
              request_time: new Date(logs[i].request_time || Date.now()),
              response_time: new Date(logs[i].response_time || Date.now()),
              method: logs[i].method,
              path: logs[i].path,
              requestBody: logs[i].requestBody || {},
              requestHeaders: logs[i].requestHeaders || {},
              responseStatus: logs[i].responseStatus,
              responseBody: logs[i].responseBody,
              requestQuery: logs[i].requestQuery || {},
              requestParams: logs[i].requestParams || {},
              client_ip: logs[i].client_ip || req.ip,
              client_agent: logs[i].client_agent || req.get("User-Agent"),
              ...logs[i],
            };

            const result = await logstack.saveApiLog(logData);
            results.push({ index: i, success: true, data: result });
          } catch (error) {
            errors.push({ index: i, error: error.message });
          }
        }

        res.json({
          success: true,
          message: `Processed ${logs.length} logs`,
          results: {
            successful: results.length,
            failed: errors.length,
            details: { results, errors },
          },
        });
      } catch (error) {
        res.status(500).json({
          error: "Batch processing failed",
          message: error.message,
        });
      }
    });

    // Get logs with filtering
    this.app.get("/api/logs", async (req, res) => {
      try {
        if (!logstack.isInitialized()) {
          return res.status(503).json({
            error: "Service not initialized",
            message: "Call /api/initialize first",
          });
        }

        const query = {
          limit: parseInt(req.query.limit) || 100,
          skip: parseInt(req.query.skip) || 0,
          method: req.query.method,
          path: req.query.path,
          responseStatus: req.query.responseStatus
            ? parseInt(req.query.responseStatus)
            : undefined,
          startDate: req.query.startDate
            ? new Date(req.query.startDate)
            : undefined,
          endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
          client_ip: req.query.client_ip,
        };

        // Remove undefined values
        Object.keys(query).forEach((key) => {
          if (query[key] === undefined) {
            delete query[key];
          }
        });

        const logs = await logstack.getApiLogs(query);

        res.json({
          success: true,
          data: logs,
          query: query,
          count: logs.length,
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to retrieve logs",
          message: error.message,
        });
      }
    });

    // Get logs for specific hour
    this.app.get("/api/logs/hour/:date/:hour", async (req, res) => {
      try {
        if (!logstack.isInitialized()) {
          return res.status(503).json({
            error: "Service not initialized",
            message: "Call /api/initialize first",
          });
        }

        const { date, hour } = req.params;
        const hourInt = parseInt(hour);

        if (isNaN(hourInt) || hourInt < 0 || hourInt > 23) {
          return res.status(400).json({
            error: "Invalid hour",
            message: "Hour must be between 0 and 23",
          });
        }

        const logs = await logstack.getApiLogsByHour(date, hourInt);

        res.json({
          success: true,
          data: logs,
          date: date,
          hour: hourInt,
          count: logs.length,
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to retrieve logs for hour",
          message: error.message,
        });
      }
    });

    // Create daily jobs
    this.app.post("/api/jobs/create", async (req, res) => {
      try {
        if (!logstack.isInitialized()) {
          return res.status(503).json({
            error: "Service not initialized",
            message: "Call /api/initialize first",
          });
        }

        const date = req.body.date || new Date().toISOString().split("T")[0];
        const result = await logstack.createDailyJobs(date);

        res.json({
          success: true,
          message: "Daily jobs created successfully",
          data: result,
          date: date,
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to create daily jobs",
          message: error.message,
        });
      }
    });

    // Run hourly job
    this.app.post("/api/jobs/run", async (req, res) => {
      try {
        if (!logstack.isInitialized()) {
          return res.status(503).json({
            error: "Service not initialized",
            message: "Call /api/initialize first",
          });
        }

        const date = req.body.date || new Date().toISOString().split("T")[0];
        const hour =
          req.body.hour !== undefined
            ? parseInt(req.body.hour)
            : new Date().getHours();

        if (isNaN(hour) || hour < 0 || hour > 23) {
          return res.status(400).json({
            error: "Invalid hour",
            message: "Hour must be between 0 and 23",
          });
        }

        const result = await logstack.runHourlyJob(date, hour);

        res.json({
          success: true,
          message: "Hourly job completed successfully",
          data: result,
          date: date,
          hour: hour,
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to run hourly job",
          message: error.message,
        });
      }
    });

    // Get job status
    this.app.get("/api/jobs/status/:jobId", async (req, res) => {
      try {
        if (!logstack.isInitialized()) {
          return res.status(503).json({
            error: "Service not initialized",
            message: "Call /api/initialize first",
          });
        }

        const { jobId } = req.params;
        const status = await logstack.getJobStatus(jobId);

        res.json({
          success: true,
          data: status,
          jobId: jobId,
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to get job status",
          message: error.message,
        });
      }
    });

    // Get processing statistics
    this.app.get("/api/stats", async (req, res) => {
      try {
        if (!logstack.isInitialized()) {
          return res.status(503).json({
            error: "Service not initialized",
            message: "Call /api/initialize first",
          });
        }

        const query = {
          startDate: req.query.startDate
            ? new Date(req.query.startDate)
            : undefined,
          endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
          status: req.query.status,
        };

        // Remove undefined values
        Object.keys(query).forEach((key) => {
          if (query[key] === undefined) {
            delete query[key];
          }
        });

        const stats = await logstack.getLogs(query);

        res.json({
          success: true,
          data: stats,
          query: query,
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to get statistics",
          message: error.message,
        });
      }
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      console.error("Unhandled error:", error);
      res.status(500).json({
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    });

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        error: "Not found",
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableEndpoints: [
          "GET /health",
          "GET /info",
          "POST /api/initialize",
          "POST /api/logs",
          "POST /api/logs/batch",
          "GET /api/logs",
          "GET /api/logs/hour/:date/:hour",
          "POST /api/jobs/create",
          "POST /api/jobs/run",
          "GET /api/jobs/status/:jobId",
          "GET /api/stats",
        ],
      });
    });
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        const server = this.app.listen(
          this.config.port,
          this.config.host,
          () => {
            console.log("\n🚀 LogStack Standalone Server Started!");
            console.log("═".repeat(50));
            console.log(
              `🌐 Server URL: http://${this.config.host}:${this.config.port}`
            );
            console.log(`🔐 API Key: ${this.config.apiKey}`);
            console.log(
              `🛡️  Authentication: ${
                this.config.enableAuth ? "Enabled" : "Disabled"
              }`
            );
            console.log(
              `⚡ Rate Limiting: ${
                this.config.enableRateLimit ? "Enabled" : "Disabled"
              }`
            );
            console.log(
              `🌍 CORS: ${this.config.enableCors ? "Enabled" : "Disabled"}`
            );
            console.log(
              `📊 Environment: ${process.env.NODE_ENV || "development"}`
            );
            console.log("\n📋 Available Endpoints:");
            console.log("  GET  /health              - Health check");
            console.log("  GET  /info                - Service information");
            console.log("  POST /api/initialize      - Initialize LogStack");
            console.log("  POST /api/logs            - Save API log");
            console.log("  POST /api/logs/batch      - Save multiple logs");
            console.log("  GET  /api/logs            - Retrieve logs");
            console.log("  GET  /api/logs/hour/DATE/HOUR - Get hour logs");
            console.log("  POST /api/jobs/create     - Create daily jobs");
            console.log("  POST /api/jobs/run        - Run hourly job");
            console.log("  GET  /api/jobs/status/ID  - Get job status");
            console.log("  GET  /api/stats           - Get statistics");
            console.log("\n✨ Server ready to accept requests!");

            resolve(server);
          }
        );

        server.on("error", (error) => {
          console.error("Server startup error:", error);
          reject(error);
        });
      } catch (error) {
        console.error("Failed to start server:", error);
        reject(error);
      }
    });
  }
}

module.exports = LogStackServer;

// CLI usage
if (require.main === module) {
  const server = new LogStackServer();
  server.start().catch(console.error);
}
