/**
 * 🧪 Bulk Migration Test Script
 * Complete testing workflow for 900K documents migration
 */

const axios = require("axios");

const API_BASE = "http://localhost:4000";
const API_KEY = "dynamite-dev-api-key-2025";

const headers = {
  "Content-Type": "application/json",
  "X-API-Key": API_KEY,
};

class BulkMigrationTester {
  /**
   * Step 1: Analyze database before migration
   */
  async analyzeDatabase() {
    try {
      console.log("📊 Step 1: Analyzing database...\n");

      const response = await axios.get(
        `${API_BASE}/admin/dynamite/bulk-migration/analyze`,
        { headers }
      );

      const analysis = response.data.analysis;
      const recommendations = response.data.recommendations;

      console.log("📈 Database Analysis Results:");
      console.log("═══════════════════════════════════");

      Object.keys(analysis).forEach((collection) => {
        const data = analysis[collection];
        console.log(`\n📋 Collection: ${collection}`);

        if (data.exists) {
          console.log(
            `   ✅ Documents: ${data.totalDocuments.toLocaleString()}`
          );
          console.log(
            `   📅 Date Range: ${data.dateRange.from} to ${data.dateRange.to}`
          );
          console.log(`   📆 Days: ${data.dateRange.days}`);
          console.log(`   💾 Size: ${data.estimatedSize}`);
          console.log(`   ⏱️  Estimated Time: ${data.estimatedMigrationTime}`);
          console.log(`   📄 Avg Doc Size: ${data.avgDocumentSize} bytes`);
        } else {
          console.log(`   ❌ Collection not found or empty`);
        }
      });

      console.log(`\n💡 Recommendations:`);
      console.log(`   Batch Size: ${recommendations.batchSize}`);
      console.log(`   Memory Usage: ${recommendations.estimatedMemoryUsage}`);
      console.log(`   Schedule: ${recommendations.recommendedSchedule}`);

      return analysis;
    } catch (error) {
      console.error(
        "❌ Analysis failed:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  /**
   * Step 2: Start bulk migration
   */
  async startMigration(options = {}) {
    try {
      console.log("\n🚀 Step 2: Starting bulk migration...\n");

      const requestBody = {
        collectionName: options.collection || `api_logs_dynamite-lifestyle-dev`,
        startDate: options.startDate, // Optional: '2025-07-01'
        endDate: options.endDate, // Optional: '2025-09-05'
        includeAppLogs: options.includeAppLogs || false,
      };

      console.log("📋 Migration Parameters:");
      console.log(`   Collection: ${requestBody.collectionName}`);
      if (requestBody.startDate)
        console.log(`   Start Date: ${requestBody.startDate}`);
      if (requestBody.endDate)
        console.log(`   End Date: ${requestBody.endDate}`);
      console.log(`   Include App Logs: ${requestBody.includeAppLogs}\n`);

      const response = await axios.post(
        `${API_BASE}/admin/dynamite/bulk-migration/start`,
        requestBody,
        { headers }
      );

      console.log("✅ Migration Started:");
      console.log(`   Collection: ${response.data.collection}`);
      console.log(`   Environment: ${response.data.environment}`);
      console.log(`   Started At: ${response.data.started_at}`);

      return response.data;
    } catch (error) {
      console.error(
        "❌ Migration start failed:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  /**
   * Step 3: Monitor migration progress
   */
  async monitorProgress(intervalSeconds = 30) {
    try {
      console.log(
        `\n📊 Step 3: Monitoring progress (every ${intervalSeconds}s)...\n`
      );

      const startTime = Date.now();
      let lastProgress = null;

      const monitor = setInterval(async () => {
        try {
          const response = await axios.get(
            `${API_BASE}/admin/dynamite/bulk-migration/progress`,
            { headers }
          );

          const progress = response.data.progress;

          if (!progress) {
            console.log("ℹ️  No migration running");
            clearInterval(monitor);
            return;
          }

          // Clear console and show updated progress
          process.stdout.write("\x1Bc"); // Clear console

          console.log("🔄 BULK MIGRATION PROGRESS");
          console.log("═══════════════════════════════════════════════════");
          console.log(
            `Status: ${this.getStatusEmoji(
              progress.status
            )} ${progress.status.toUpperCase()}`
          );
          console.log(`Current Date: ${progress.currentDate || "N/A"}`);
          console.log("");

          console.log("📊 PROGRESS STATS:");
          console.log(
            `   Processed: ${progress.processedDocuments.toLocaleString()} / ${progress.totalDocuments.toLocaleString()}`
          );
          console.log(
            `   Failed: ${progress.failedDocuments.toLocaleString()}`
          );
          console.log(`   Completion: ${progress.completionPercentage}%`);
          console.log(
            `   Days Processed: ${progress.processedDays}/${progress.totalDays}`
          );
          console.log("");

          console.log("⏱️  TIMING:");
          console.log(`   Duration: ${this.formatDuration(progress.duration)}`);
          console.log(
            `   Processing Rate: ${progress.processingRate} docs/second`
          );
          console.log(
            `   ETA: ${this.formatDuration(
              progress.estimatedTimeRemaining * 1000
            )}`
          );
          console.log("");

          // Progress bar
          const progressBar = this.createProgressBar(
            progress.completionPercentage,
            50
          );
          console.log(
            `Progress: ${progressBar} ${progress.completionPercentage}%`
          );
          console.log("");

          // Show rate change
          if (lastProgress) {
            const rateChange =
              progress.processingRate - lastProgress.processingRate;
            const rateChangeSymbol =
              rateChange > 0 ? "📈" : rateChange < 0 ? "📉" : "➡️";
            console.log(
              `Rate Change: ${rateChangeSymbol} ${
                rateChange > 0 ? "+" : ""
              }${rateChange} docs/s`
            );
          }

          console.log(`Last Updated: ${new Date().toLocaleTimeString()}`);
          console.log("\nPress Ctrl+C to stop monitoring");

          lastProgress = progress;

          // Stop monitoring if completed or failed
          if (progress.status === "completed" || progress.status === "failed") {
            clearInterval(monitor);

            if (progress.status === "completed") {
              console.log("\n🎉 MIGRATION COMPLETED SUCCESSFULLY!");
              console.log("═══════════════════════════════════════");
              console.log(
                `✅ Total Processed: ${progress.processedDocuments.toLocaleString()}`
              );
              console.log(
                `❌ Failed: ${progress.failedDocuments.toLocaleString()}`
              );
              console.log(
                `⏱️  Total Duration: ${this.formatDuration(progress.duration)}`
              );
              console.log(
                `📈 Average Rate: ${Math.round(
                  progress.processedDocuments / (progress.duration / 1000)
                )} docs/second`
              );
            } else {
              console.log("\n❌ MIGRATION FAILED");
              console.log("Check server logs for details");
            }
          }
        } catch (error) {
          console.error("Error checking progress:", error.message);
        }
      }, intervalSeconds * 1000);

      // Handle Ctrl+C
      process.on("SIGINT", () => {
        clearInterval(monitor);
        console.log("\n\n🛑 Monitoring stopped by user");
        process.exit(0);
      });
    } catch (error) {
      console.error("❌ Monitoring failed:", error.message);
    }
  }

  /**
   * Utility: Get status emoji
   */
  getStatusEmoji(status) {
    const emojis = {
      idle: "⏸️",
      running: "🔄",
      paused: "⏸️",
      completed: "✅",
      failed: "❌",
    };
    return emojis[status] || "❓";
  }

  /**
   * Utility: Format duration
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Utility: Create progress bar
   */
  createProgressBar(percentage, width = 30) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }

  /**
   * Full migration workflow
   */
  async runFullMigration(options = {}) {
    console.log("🎯 STARTING FULL BULK MIGRATION WORKFLOW");
    console.log("═══════════════════════════════════════════════════\n");

    // Step 1: Analyze
    const analysis = await this.analyzeDatabase();
    if (!analysis) {
      console.log("❌ Cannot proceed without analysis");
      return;
    }

    // Check if there's data to migrate
    const collectionName =
      options.collection || `api_logs_dynamite-lifestyle-dev`;
    const collectionData = analysis[collectionName];

    if (
      !collectionData ||
      !collectionData.exists ||
      collectionData.totalDocuments === 0
    ) {
      console.log(`❌ No data found in collection: ${collectionName}`);
      return;
    }

    console.log(
      `\n✅ Found ${collectionData.totalDocuments.toLocaleString()} documents to migrate`
    );

    // Confirmation prompt
    console.log("\n⚠️  WARNING: This will start a bulk migration process.");
    console.log("   Make sure you have enough S3 storage space.");
    console.log("   The process may take several hours.");

    // Wait a bit then start
    console.log("\n⏳ Starting migration in 5 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Step 2: Start migration
    const migrationResult = await this.startMigration(options);
    if (!migrationResult) {
      console.log("❌ Migration failed to start");
      return;
    }

    // Step 3: Monitor
    await this.monitorProgress();
  }
}

// CLI Interface
async function main() {
  const tester = new BulkMigrationTester();

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "analyze":
      await tester.analyzeDatabase();
      break;

    case "start":
      const options = {
        collection: args[1],
        startDate: args[2],
        endDate: args[3],
      };
      await tester.startMigration(options);
      break;

    case "monitor":
      const interval = parseInt(args[1]) || 30;
      await tester.monitorProgress(interval);
      break;

    case "full":
      await tester.runFullMigration({
        collection: args[1],
      });
      break;

    default:
      console.log("🧪 Bulk Migration Tester");
      console.log("═════════════════════════");
      console.log("");
      console.log("Commands:");
      console.log("  analyze                    - Analyze database");
      console.log("  start [collection]         - Start migration");
      console.log("  monitor [interval]         - Monitor progress");
      console.log("  full [collection]          - Complete workflow");
      console.log("");
      console.log("Examples:");
      console.log("  node bulk-migration-test.js analyze");
      console.log("  node bulk-migration-test.js full");
      console.log("  node bulk-migration-test.js monitor 15");
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BulkMigrationTester;
