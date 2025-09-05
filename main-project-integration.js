/**
 * 📡 Main Project Integration Example
 * Is file ko apne main project mein use karo
 */

const axios = require("axios");

class LogStackClient {
  constructor(logServerUrl, apiKey = null) {
    this.baseUrl = logServerUrl;
    this.apiKey = apiKey;
    this.headers = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      this.headers["X-API-Key"] = apiKey;
    }
  }

  // ===== SAVE METHODS =====

  /**
   * API log send karo log server per
   */
  async saveApiLog(logData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/logs/save`,
        logData,
        {
          headers: this.headers,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Failed to save API log:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Application log send karo
   */
  async saveAppLog(level, message, metadata = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/logs/app`,
        {
          level,
          message,
          service: metadata.service || "main-app",
          metadata,
          timestamp: new Date(),
        },
        {
          headers: this.headers,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Failed to save app log:", error.message);
      return { success: false, error: error.message };
    }
  }

  // ===== GET METHODS =====

  /**
   * API logs retrieve karo with filters
   */
  async getApiLogs(filters = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/logs/api`, {
        params: filters,
        headers: this.headers,
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Failed to get API logs:", error.message);
      return { success: false, error: error.message, logs: [] };
    }
  }

  /**
   * App logs retrieve karo with filters
   */
  async getAppLogs(filters = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/logs/app`, {
        params: filters,
        headers: this.headers,
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Failed to get app logs:", error.message);
      return { success: false, error: error.message, logs: [] };
    }
  }

  /**
   * S3 files search karo
   */
  async searchFiles(searchCriteria = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/files/search`, {
        params: searchCriteria,
        headers: this.headers,
        timeout: 15000,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Failed to search files:", error.message);
      return { success: false, error: error.message, files: [] };
    }
  }

  /**
   * File download URL generate karo
   */
  async getDownloadUrl(fileName) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/files/download/${fileName}`,
        {
          headers: this.headers,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Failed to get download URL:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Health check karo
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 3000,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Health check failed:", error.message);
      return { status: "unhealthy", error: error.message };
    }
  }

  // ===== EXPRESS MIDDLEWARE =====

  /**
   * Express middleware - automatic API logging
   */
  getMiddleware() {
    return (req, res, next) => {
      const startTime = new Date();
      const originalSend = res.send;

      // Response capture karo
      res.send = function (data) {
        res.responseBody = data;
        return originalSend.call(this, data);
      };

      res.on("finish", async () => {
        try {
          await this.saveApiLog({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            request_time: startTime,
            response_time: new Date(),
            client_ip: req.ip || req.connection.remoteAddress,
            headers: req.headers,
            request_body: req.body,
            response_body: res.responseBody,
            response_time_ms: Date.now() - startTime.getTime(),
            user_id: req.user?.id,
            session_id: req.sessionID,
          });
        } catch (error) {
          // Silent fail - don't break main app
        }
      });

      next();
    };
  }
}

// ===== USAGE EXAMPLES =====

// Initialize client
const logClient = new LogStackClient(
  "http://your-log-server:4000",
  "your-api-key-123"
);

// Express.js integration example
const express = require("express");
const app = express();

// Use automatic logging middleware
app.use(logClient.getMiddleware());

// Manual logging examples
app.get("/api/users", async (req, res) => {
  try {
    // Your business logic here
    const users = await getUsersFromDatabase();

    // Manual app log
    await logClient.saveAppLog("info", "Users fetched successfully", {
      service: "user-service",
      count: users.length,
      user_id: req.user?.id,
    });

    res.json(users);
  } catch (error) {
    // Error log
    await logClient.saveAppLog("error", "Failed to fetch users", {
      service: "user-service",
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({ error: "Internal server error" });
  }
});

// Logs retrieve karne ka example
app.get("/admin/logs", async (req, res) => {
  try {
    // Last 24 hours ke API logs
    const apiLogs = await logClient.getApiLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(),
      limit: 100,
    });

    // Error level app logs
    const errorLogs = await logClient.getAppLogs({
      level: "error",
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      limit: 50,
    });

    // S3 files search
    const files = await logClient.searchFiles({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      fileType: "json",
      limit: 20,
    });

    res.json({
      apiLogs: apiLogs.logs,
      errorLogs: errorLogs.logs,
      files: files.files,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File download example
app.get("/admin/download/:fileName", async (req, res) => {
  try {
    const result = await logClient.getDownloadUrl(req.params.fileName);

    if (result.success) {
      res.redirect(result.downloadUrl);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export for use in other files
module.exports = LogStackClient;

// Example usage in other files:
/*
const LogStackClient = require('./logstack-client');
const logClient = new LogStackClient('http://log-server:4000', 'api-key');

// Save log
await logClient.saveAppLog('info', 'Process completed', { processId: 123 });

// Get logs
const logs = await logClient.getApiLogs({ method: 'POST', limit: 50 });

// Search files
const files = await logClient.searchFiles({ fileType: 'json' });
*/
