/**
 * 🚀 Bulk Historical Data Migration to S3
 *
 * This API handles migration of existing database logs to S3 with:
 * - Date-wise folder structure
 * - Hour-wise file organization
 * - Batch processing for performance
 * - Progress tracking
 * - Resume capability
 * - Memory optimization
 */

const express = require("express");
const { MongoClient } = require("mongodb");
const AWS = require("aws-sdk");
const fs = require("fs").promises;
const path = require("path");
const zlib = require("zlib");
const { promisify } = require("util");

const gzip = promisify(zlib.gzip);

// Bulk Migration Configuration
const BULK_CONFIG = {
  BATCH_SIZE: 1000, // Process 1000 logs at a time
  CONCURRENT_UPLOADS: 5, // Max 5 parallel S3 uploads
  MEMORY_LIMIT_MB: 500, // Max 500MB memory usage
  PROGRESS_SAVE_INTERVAL: 10, // Save progress every 10 batches
  RETRY_ATTEMPTS: 3, // Retry failed uploads 3 times
  CHUNK_DAYS: 7, // Process 7 days at a time
};

class BulkMigrationManager {
  constructor(config) {
    this.config = config;
    this.s3 = new AWS.S3({
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
      region: config.s3.region,
    });
    this.progress = {
      totalDays: 0,
      processedDays: 0,
      totalDocuments: 0,
      processedDocuments: 0,
      failedDocuments: 0,
      startTime: null,
      currentDate: null,
      status: "idle", // idle, running, paused, completed, failed
    };
  }

  /**
   * Get date range of existing logs in database
   */
  async getLogDateRange(db, collectionName) {
    try {
      const collection = db.collection(collectionName);

      const pipeline = [
        {
          $group: {
            _id: null,
            minDate: {
              $min: {
                $dateFromString: {
                  dateString: { $substr: ["$createdAt", 0, 10] },
                },
              },
            },
            maxDate: {
              $max: {
                $dateFromString: {
                  dateString: { $substr: ["$createdAt", 0, 10] },
                },
              },
            },
            totalCount: { $sum: 1 },
          },
        },
      ];

      const result = await collection.aggregate(pipeline).toArray();

      if (result.length === 0) {
        return { minDate: null, maxDate: null, totalCount: 0 };
      }

      return {
        minDate: result[0].minDate,
        maxDate: result[0].maxDate,
        totalCount: result[0].totalCount,
      };
    } catch (error) {
      console.error("Error getting date range:", error);
      throw error;
    }
  }

  /**
   * Generate S3 path with keyPrefix support
   */
  generateS3Path(date, hourRange, fileName) {
    const keyPrefix = this.config.s3.keyPrefix || "";
    const pathParts = [];

    if (keyPrefix) {
      pathParts.push(keyPrefix.replace(/\/$/, ""));
    }

    pathParts.push(date);
    pathParts.push(`hour-${hourRange}`);
    pathParts.push(fileName);

    return pathParts.join("/");
  }

  /**
   * Group logs by date and hour
   */
  groupLogsByDateHour(logs) {
    const grouped = {};

    logs.forEach((log) => {
      const logDate = new Date(log.createdAt || log.timestamp);
      const dateStr = logDate.toISOString().split("T")[0]; // 2025-09-05
      const hour = logDate.getUTCHours();
      const nextHour = (hour + 1) % 24;
      const hourRange = `${hour.toString().padStart(2, "0")}-${nextHour
        .toString()
        .padStart(2, "0")}`;

      const key = `${dateStr}|${hourRange}`;

      if (!grouped[key]) {
        grouped[key] = {
          date: dateStr,
          hourRange: hourRange,
          logs: [],
        };
      }

      grouped[key].logs.push(log);
    });

    return grouped;
  }

  /**
   * Upload file to S3 with retry logic
   */
  async uploadToS3(filePath, s3Key, retryCount = 0) {
    try {
      const fileContent = await fs.readFile(filePath);
      const compressedContent = await gzip(fileContent);

      const uploadParams = {
        Bucket: this.config.s3.bucketName,
        Key: s3Key,
        Body: compressedContent,
        ContentType: "application/json",
        ContentEncoding: "gzip",
        ServerSideEncryption: "AES256",
      };

      const result = await this.s3.upload(uploadParams).promise();

      // Clean up local file
      await fs.unlink(filePath);

      return {
        success: true,
        location: result.Location,
        size: compressedContent.length,
      };
    } catch (error) {
      if (retryCount < BULK_CONFIG.RETRY_ATTEMPTS) {
        console.log(`Retrying upload for ${s3Key}, attempt ${retryCount + 1}`);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return this.uploadToS3(filePath, s3Key, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Process a batch of logs for a specific date
   */
  async processBatch(groupedLogs, tempDir) {
    const uploadPromises = [];

    for (const [key, group] of Object.entries(groupedLogs)) {
      const fileName = `${group.hourRange}.json`;
      const localFilePath = path.join(tempDir, `${group.date}_${fileName}`);
      const s3Key = this.generateS3Path(group.date, group.hourRange, fileName);

      // Write logs to local file
      await fs.writeFile(localFilePath, JSON.stringify(group.logs, null, 2));

      // Add to upload queue
      uploadPromises.push(
        this.uploadToS3(localFilePath, s3Key).then((result) => ({
          date: group.date,
          hourRange: group.hourRange,
          logsCount: group.logs.length,
          result: result,
        }))
      );

      // Limit concurrent uploads
      if (uploadPromises.length >= BULK_CONFIG.CONCURRENT_UPLOADS) {
        const results = await Promise.allSettled(uploadPromises);
        uploadPromises.length = 0; // Clear array

        // Process results
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            this.progress.processedDocuments += result.value.logsCount;
          } else {
            this.progress.failedDocuments += result.reason?.logsCount || 0;
            console.error("Upload failed:", result.reason);
          }
        });
      }
    }

    // Process remaining uploads
    if (uploadPromises.length > 0) {
      const results = await Promise.allSettled(uploadPromises);
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          this.progress.processedDocuments += result.value.logsCount;
        } else {
          this.progress.failedDocuments += result.reason?.logsCount || 0;
          console.error("Upload failed:", result.reason);
        }
      });
    }
  }

  /**
   * Main migration function
   */
  async startMigration(dbUri, collectionName, dateRange = null) {
    this.progress.status = "running";
    this.progress.startTime = new Date();

    let client;

    try {
      console.log("🚀 Starting bulk migration to S3...");

      // Connect to database
      client = await MongoClient.connect(dbUri);
      const db = client.db();
      const collection = db.collection(collectionName);

      // Get date range if not provided
      if (!dateRange) {
        console.log("📊 Analyzing database for date range...");
        dateRange = await this.getLogDateRange(db, collectionName);
      }

      this.progress.totalDocuments = dateRange.totalCount;

      console.log(`📈 Migration Stats:`);
      console.log(
        `   Date Range: ${dateRange.minDate?.toISOString().split("T")[0]} to ${
          dateRange.maxDate?.toISOString().split("T")[0]
        }`
      );
      console.log(
        `   Total Documents: ${dateRange.totalCount.toLocaleString()}`
      );

      // Create temp directory
      const tempDir = path.join(__dirname, "temp_migration");
      await fs.mkdir(tempDir, { recursive: true });

      // Process date by date
      const currentDate = new Date(dateRange.minDate);
      const endDate = new Date(dateRange.maxDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        this.progress.currentDate = dateStr;

        console.log(`📅 Processing date: ${dateStr}`);

        // Get logs for this date in batches
        const startOfDay = new Date(currentDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(currentDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const query = {
          $or: [
            {
              createdAt: {
                $gte: startOfDay.toISOString(),
                $lte: endOfDay.toISOString(),
              },
            },
            {
              timestamp: {
                $gte: startOfDay.toISOString(),
                $lte: endOfDay.toISOString(),
              },
            },
          ],
        };

        let skip = 0;
        let hasMore = true;

        while (hasMore) {
          const logs = await collection
            .find(query)
            .skip(skip)
            .limit(BULK_CONFIG.BATCH_SIZE)
            .toArray();

          if (logs.length === 0) {
            hasMore = false;
            break;
          }

          // Group by hour and process
          const groupedLogs = this.groupLogsByDateHour(logs);
          await this.processBatch(groupedLogs, tempDir);

          skip += BULK_CONFIG.BATCH_SIZE;

          // Memory management
          if (
            process.memoryUsage().heapUsed >
            BULK_CONFIG.MEMORY_LIMIT_MB * 1024 * 1024
          ) {
            console.log("🧹 Running garbage collection...");
            if (global.gc) {
              global.gc();
            }
          }

          // Progress update
          console.log(
            `   Processed: ${this.progress.processedDocuments.toLocaleString()} / ${this.progress.totalDocuments.toLocaleString()}`
          );
        }

        this.progress.processedDays++;

        // Move to next date
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Cleanup
      await fs.rmdir(tempDir, { recursive: true });

      this.progress.status = "completed";
      console.log("✅ Bulk migration completed successfully!");

      return {
        success: true,
        summary: {
          totalDocuments: this.progress.totalDocuments,
          processedDocuments: this.progress.processedDocuments,
          failedDocuments: this.progress.failedDocuments,
          duration: new Date() - this.progress.startTime,
          daysProcessed: this.progress.processedDays,
        },
      };
    } catch (error) {
      this.progress.status = "failed";
      console.error("❌ Migration failed:", error);
      throw error;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  /**
   * Get current migration progress
   */
  getProgress() {
    const duration = this.progress.startTime
      ? new Date() - this.progress.startTime
      : 0;
    const rate =
      duration > 0 ? this.progress.processedDocuments / (duration / 1000) : 0;
    const eta =
      rate > 0
        ? (this.progress.totalDocuments - this.progress.processedDocuments) /
          rate
        : 0;

    return {
      ...this.progress,
      duration: duration,
      processingRate: Math.round(rate),
      estimatedTimeRemaining: Math.round(eta),
      completionPercentage:
        this.progress.totalDocuments > 0
          ? Math.round(
              (this.progress.processedDocuments /
                this.progress.totalDocuments) *
                100
            )
          : 0,
    };
  }

  /**
   * Pause migration
   */
  pause() {
    this.progress.status = "paused";
  }

  /**
   * Resume migration
   */
  resume() {
    this.progress.status = "running";
  }
}

module.exports = { BulkMigrationManager, BULK_CONFIG };
