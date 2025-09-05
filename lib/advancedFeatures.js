/**
 * 🌩️ LogStack S3 Download and Advanced Database Features
 *
 * Features for:
 * 1. Downloading/Fetching logs from S3
 * 2. Enhanced database log operations
 * 3. S3 to Database synchronization
 */

const AWS = require("aws-sdk");
const { getApiLogs, saveApiLog } = require("../dist/src/apiLogs");
const { getConfig } = require("../dist/src/main");
const path = require("path");
const fs = require("fs").promises;

// ===================================
// 🔽 S3 DOWNLOAD FEATURES
// ===================================

class LogStackS3Manager {
  constructor(config) {
    this.config = config;
    this.s3 = new AWS.S3({
      accessKeyId: config.s3?.accessKeyId,
      secretAccessKey: config.s3?.secretAccessKey,
      region: config.s3?.region,
    });
    this.bucket = config.s3?.bucket;
  }

  /**
   * List all log files in S3 for a specific date range
   */
  async listS3LogFiles(startDate, endDate, prefix = "") {
    try {
      const files = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Generate date range
      for (
        let date = new Date(start);
        date <= end;
        date.setDate(date.getDate() + 1)
      ) {
        const dateStr = date.toISOString().split("T")[0];
        const dayPrefix = `${this.config.outputDirectory}/${dateStr}/`;

        const params = {
          Bucket: this.bucket,
          Prefix: prefix ? `${prefix}/${dayPrefix}` : dayPrefix,
        };

        const result = await this.s3.listObjectsV2(params).promise();

        result.Contents?.forEach((file) => {
          files.push({
            key: file.Key,
            size: file.Size,
            lastModified: file.LastModified,
            date: dateStr,
            filename: path.basename(file.Key),
          });
        });
      }

      return files.sort(
        (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
      );
    } catch (error) {
      console.error("❌ Failed to list S3 files:", error);
      throw error;
    }
  }

  /**
   * Download a specific log file from S3
   */
  async downloadLogFile(s3Key, localPath = null) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: s3Key,
      };

      console.log(`📥 Downloading: ${s3Key}`);

      const result = await this.s3.getObject(params).promise();
      const content = result.Body.toString();

      if (localPath) {
        // Ensure directory exists
        const dir = path.dirname(localPath);
        await fs.mkdir(dir, { recursive: true });

        // Save to local file
        await fs.writeFile(localPath, content);
        console.log(`💾 Saved to: ${localPath}`);

        return { content: JSON.parse(content), localPath };
      }

      return { content: JSON.parse(content) };
    } catch (error) {
      console.error(`❌ Failed to download ${s3Key}:`, error);
      throw error;
    }
  }

  /**
   * Download all logs for a specific date range
   */
  async downloadLogsByDateRange(
    startDate,
    endDate,
    localDirectory = "./downloaded_logs"
  ) {
    try {
      console.log(`📥 Downloading logs from ${startDate} to ${endDate}`);

      const files = await this.listS3LogFiles(startDate, endDate);
      const downloadedFiles = [];

      for (const file of files) {
        const localPath = path.join(localDirectory, file.date, file.filename);
        const result = await this.downloadLogFile(file.key, localPath);

        downloadedFiles.push({
          s3Key: file.key,
          localPath: result.localPath,
          date: file.date,
          size: file.size,
          recordCount: result.content.data ? result.content.data.length : 0,
        });
      }

      console.log(`✅ Downloaded ${downloadedFiles.length} files`);
      return downloadedFiles;
    } catch (error) {
      console.error("❌ Bulk download failed:", error);
      throw error;
    }
  }

  /**
   * Search for specific logs in S3 by criteria
   */
  async searchLogsInS3(criteria, dateRange) {
    try {
      const { startDate, endDate } = dateRange;
      const files = await this.listS3LogFiles(startDate, endDate);
      const matchingLogs = [];

      for (const file of files) {
        const { content } = await this.downloadLogFile(file.key);

        if (content.data) {
          const filteredLogs = content.data.filter((log) => {
            return Object.keys(criteria).every((key) => {
              if (criteria[key] instanceof RegExp) {
                return criteria[key].test(log[key]);
              }
              return log[key] === criteria[key];
            });
          });

          if (filteredLogs.length > 0) {
            matchingLogs.push({
              file: file.key,
              date: file.date,
              matches: filteredLogs,
            });
          }
        }
      }

      return matchingLogs;
    } catch (error) {
      console.error("❌ S3 search failed:", error);
      throw error;
    }
  }

  /**
   * Sync S3 logs back to database
   */
  async syncS3ToDatabase(startDate, endDate, options = {}) {
    try {
      console.log(`🔄 Syncing S3 logs to database: ${startDate} to ${endDate}`);

      const files = await this.listS3LogFiles(startDate, endDate);
      let totalSynced = 0;
      let totalErrors = 0;

      for (const file of files) {
        try {
          const { content } = await this.downloadLogFile(file.key);

          if (content.data && Array.isArray(content.data)) {
            console.log(
              `📝 Syncing ${content.data.length} logs from ${file.filename}`
            );

            for (const logData of content.data) {
              try {
                // Check if log already exists to avoid duplicates
                const existingLogs = await getApiLogs(
                  {
                    startDate: new Date(logData.request_time),
                    endDate: new Date(logData.request_time),
                    method: logData.method,
                    path: logData.path,
                    limit: 1,
                  },
                  this.config
                );

                if (existingLogs.length === 0 || options.allowDuplicates) {
                  await saveApiLog(logData, this.config);
                  totalSynced++;
                } else {
                  console.log(
                    `⚠️ Skipping duplicate log: ${logData.method} ${logData.path}`
                  );
                }
              } catch (logError) {
                console.error(
                  `❌ Failed to sync individual log:`,
                  logError.message
                );
                totalErrors++;
              }
            }
          }
        } catch (fileError) {
          console.error(
            `❌ Failed to process file ${file.key}:`,
            fileError.message
          );
          totalErrors++;
        }
      }

      console.log(
        `✅ Sync complete: ${totalSynced} synced, ${totalErrors} errors`
      );
      return { synced: totalSynced, errors: totalErrors };
    } catch (error) {
      console.error("❌ S3 to Database sync failed:", error);
      throw error;
    }
  }
}

// ===================================
// 📝 ENHANCED DATABASE FEATURES
// ===================================

class LogStackDatabaseManager {
  constructor(config) {
    this.config = config;
  }

  /**
   * Bulk insert logs to database
   */
  async bulkInsertLogs(logsArray, options = {}) {
    try {
      console.log(`📝 Bulk inserting ${logsArray.length} logs`);

      const batchSize = options.batchSize || 1000;
      const results = [];

      for (let i = 0; i < logsArray.length; i += batchSize) {
        const batch = logsArray.slice(i, i + batchSize);
        console.log(
          `📦 Processing batch ${Math.floor(i / batchSize) + 1}: ${
            batch.length
          } logs`
        );

        const batchResults = [];
        for (const logData of batch) {
          try {
            const result = await saveApiLog(logData, this.config);
            batchResults.push({ success: true, data: result });
          } catch (error) {
            batchResults.push({ success: false, error: error.message });
          }
        }

        results.push(...batchResults);
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      console.log(
        `✅ Bulk insert complete: ${successful} success, ${failed} failed`
      );
      return { successful, failed, results };
    } catch (error) {
      console.error("❌ Bulk insert failed:", error);
      throw error;
    }
  }

  /**
   * Advanced log search with aggregation
   */
  async searchLogsAdvanced(filters = {}) {
    try {
      const {
        dateRange,
        methods = [],
        statusCodes = [],
        pathPattern,
        clientIp,
        responseTimeRange,
        groupBy,
        limit = 1000,
      } = filters;

      console.log(`🔍 Advanced search with filters:`, filters);

      // Basic filtering
      const basicFilters = {};
      if (dateRange) {
        basicFilters.startDate = new Date(dateRange.start);
        basicFilters.endDate = new Date(dateRange.end);
      }
      if (methods.length > 0) {
        basicFilters.method = methods[0]; // getApiLogs supports single method
      }
      if (clientIp) {
        basicFilters.client_ip = clientIp;
      }
      basicFilters.limit = limit;

      const logs = await getApiLogs(basicFilters, this.config);

      // Additional filtering
      let filteredLogs = logs;

      if (methods.length > 1) {
        filteredLogs = filteredLogs.filter((log) =>
          methods.includes(log.method)
        );
      }

      if (statusCodes.length > 0) {
        filteredLogs = filteredLogs.filter((log) =>
          statusCodes.includes(log.responseStatus)
        );
      }

      if (pathPattern) {
        const regex = new RegExp(pathPattern, "i");
        filteredLogs = filteredLogs.filter((log) => regex.test(log.path));
      }

      if (responseTimeRange) {
        filteredLogs = filteredLogs.filter((log) => {
          const responseTime =
            new Date(log.response_time) - new Date(log.request_time);
          return (
            responseTime >= responseTimeRange.min &&
            responseTime <= responseTimeRange.max
          );
        });
      }

      // Grouping and aggregation
      if (groupBy) {
        const grouped = this.groupLogs(filteredLogs, groupBy);
        return { grouped, total: filteredLogs.length, filters };
      }

      return { logs: filteredLogs, total: filteredLogs.length, filters };
    } catch (error) {
      console.error("❌ Advanced search failed:", error);
      throw error;
    }
  }

  /**
   * Group logs by specified field
   */
  groupLogs(logs, groupBy) {
    const grouped = {};

    logs.forEach((log) => {
      const key = log[groupBy] || "unknown";
      if (!grouped[key]) {
        grouped[key] = {
          count: 0,
          logs: [],
          stats: {
            methods: new Set(),
            statusCodes: new Set(),
            avgResponseTime: 0,
            totalResponseTime: 0,
          },
        };
      }

      grouped[key].count++;
      grouped[key].logs.push(log);
      grouped[key].stats.methods.add(log.method);
      grouped[key].stats.statusCodes.add(log.responseStatus);

      const responseTime =
        new Date(log.response_time) - new Date(log.request_time);
      grouped[key].stats.totalResponseTime += responseTime;
      grouped[key].stats.avgResponseTime =
        grouped[key].stats.totalResponseTime / grouped[key].count;
    });

    // Convert Sets to Arrays for JSON serialization
    Object.keys(grouped).forEach((key) => {
      grouped[key].stats.methods = Array.from(grouped[key].stats.methods);
      grouped[key].stats.statusCodes = Array.from(
        grouped[key].stats.statusCodes
      );
    });

    return grouped;
  }

  /**
   * Generate analytics from database logs
   */
  async generateAnalytics(dateRange, options = {}) {
    try {
      console.log(
        `📊 Generating analytics for ${dateRange.start} to ${dateRange.end}`
      );

      const logs = await getApiLogs(
        {
          startDate: new Date(dateRange.start),
          endDate: new Date(dateRange.end),
          limit: options.limit || 10000,
        },
        this.config
      );

      const analytics = {
        summary: {
          totalRequests: logs.length,
          dateRange: dateRange,
          generatedAt: new Date().toISOString(),
        },
        methods: {},
        statusCodes: {},
        topEndpoints: {},
        clients: {},
        responseTimeStats: {
          total: 0,
          avg: 0,
          min: Infinity,
          max: 0,
        },
        hourlyDistribution: {},
      };

      logs.forEach((log) => {
        // Methods
        analytics.methods[log.method] =
          (analytics.methods[log.method] || 0) + 1;

        // Status codes
        analytics.statusCodes[log.responseStatus] =
          (analytics.statusCodes[log.responseStatus] || 0) + 1;

        // Endpoints
        analytics.topEndpoints[log.path] =
          (analytics.topEndpoints[log.path] || 0) + 1;

        // Clients
        if (log.client_ip) {
          analytics.clients[log.client_ip] =
            (analytics.clients[log.client_ip] || 0) + 1;
        }

        // Response time
        const responseTime =
          new Date(log.response_time) - new Date(log.request_time);
        analytics.responseTimeStats.total += responseTime;
        analytics.responseTimeStats.min = Math.min(
          analytics.responseTimeStats.min,
          responseTime
        );
        analytics.responseTimeStats.max = Math.max(
          analytics.responseTimeStats.max,
          responseTime
        );

        // Hourly distribution
        const hour = new Date(log.request_time).getHours();
        analytics.hourlyDistribution[hour] =
          (analytics.hourlyDistribution[hour] || 0) + 1;
      });

      analytics.responseTimeStats.avg =
        analytics.responseTimeStats.total / logs.length;

      // Sort top endpoints
      analytics.topEndpoints = Object.entries(analytics.topEndpoints)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      console.log(`✅ Analytics generated for ${logs.length} logs`);
      return analytics;
    } catch (error) {
      console.error("❌ Analytics generation failed:", error);
      throw error;
    }
  }
}

// ===================================
// 🚀 UNIFIED API CLASS
// ===================================

class LogStackAdvanced {
  constructor(config) {
    this.config = config;
    this.s3Manager = new LogStackS3Manager(config);
    this.dbManager = new LogStackDatabaseManager(config);
  }

  // S3 Operations
  async listS3Files(startDate, endDate) {
    return await this.s3Manager.listS3LogFiles(startDate, endDate);
  }

  async downloadFromS3(s3Key, localPath) {
    return await this.s3Manager.downloadLogFile(s3Key, localPath);
  }

  async downloadDateRange(startDate, endDate, localDir) {
    return await this.s3Manager.downloadLogsByDateRange(
      startDate,
      endDate,
      localDir
    );
  }

  async searchS3(criteria, dateRange) {
    return await this.s3Manager.searchLogsInS3(criteria, dateRange);
  }

  async syncS3ToDb(startDate, endDate, options) {
    return await this.s3Manager.syncS3ToDatabase(startDate, endDate, options);
  }

  // Database Operations
  async bulkInsert(logs, options) {
    return await this.dbManager.bulkInsertLogs(logs, options);
  }

  async advancedSearch(filters) {
    return await this.dbManager.searchLogsAdvanced(filters);
  }

  async generateAnalytics(dateRange, options) {
    return await this.dbManager.generateAnalytics(dateRange, options);
  }
}

module.exports = {
  LogStackS3Manager,
  LogStackDatabaseManager,
  LogStackAdvanced,
};
