// LogStack Client SDK for API-based deployments
// Use this when LogStack is deployed as a separate service

class LogStackClient {
  constructor(baseURL, apiKey, options = {}) {
    this.baseURL = baseURL.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.token = options.token;
    this.timeout = options.timeout || 5000;
    this.retries = options.retries || 3;
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

    let lastError;
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: options.method || "GET",
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (attempt < this.retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw new Error(
      `LogStack API Error after ${this.retries} attempts: ${lastError.message}`
    );
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

  // Batch operations
  async saveBatchLogs(logs) {
    return this.request("/api/logs/batch", {
      method: "POST",
      body: { logs },
    });
  }

  // Express.js middleware for API-based LogStack
  createMiddleware() {
    return async (req, res, next) => {
      const startTime = Date.now();

      // Capture original end method
      const originalEnd = res.end;

      res.end = async function (chunk, encoding) {
        try {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          // Log the request
          await this.saveLog({
            request_time: new Date(startTime),
            response_time: new Date(endTime),
            method: req.method,
            path: req.path,
            requestBody: req.body,
            requestHeaders: req.headers,
            responseStatus: res.statusCode,
            requestQuery: req.query,
            requestParams: req.params,
            client_ip: req.ip || req.connection.remoteAddress,
            client_agent: req.get("User-Agent"),
            responseTime: responseTime,
          });
        } catch (error) {
          console.error("LogStack middleware error:", error);
        }

        // Call original end method
        originalEnd.call(this, chunk, encoding);
      }.bind(this);

      next();
    };
  }
}

module.exports = LogStackClient;

// Usage Examples:

/*
// Basic usage
const LogStackClient = require('logstack/client');
const client = new LogStackClient('http://localhost:4000', 'your-api-key');

// With JWT authentication
await client.login('admin', 'password');

// Save logs
await client.saveLog({
  request_time: new Date(),
  response_time: new Date(),
  method: 'GET',
  path: '/api/users',
  responseStatus: 200
});

// Get logs
const logs = await client.getLogs({ limit: 10 });

// Express.js middleware
const express = require('express');
const app = express();

app.use(client.createMiddleware());

// Batch save logs
await client.saveBatchLogs([
  { method: 'GET', path: '/api/users', responseStatus: 200 },
  { method: 'POST', path: '/api/users', responseStatus: 201 }
]);
*/
