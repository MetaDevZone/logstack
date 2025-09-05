/**
 * 🌩️ LogStack Advanced Features Examples
 *
 * Practical examples for S3 download and database features
 */

const { LogStackAdvanced } = require("../lib/advancedFeatures");
const { init } = require("../src/main");

// Example configurations
const config = {
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp",
  uploadProvider: "s3",
  outputDirectory: "production-logs",
  collections: {
    apiLogsCollectionName: "api_logs",
    jobsCollectionName: "processing_jobs",
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET,
  },
};

// ===================================
// 📥 S3 DOWNLOAD EXAMPLES
// ===================================

async function downloadLogsExample() {
  console.log("📥 S3 Download Examples");
  console.log("═".repeat(30));

  try {
    await init(config);
    const advanced = new LogStackAdvanced(config);

    // Example 1: List files for last week
    console.log("\n1️⃣ List files for last 7 days:");
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const files = await advanced.listS3Files(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );

    console.log(`Found ${files.length} log files:`);
    files.forEach((file) => {
      console.log(
        `📁 ${file.filename} - ${file.date} (${(file.size / 1024).toFixed(
          1
        )} KB)`
      );
    });

    // Example 2: Download specific date
    console.log("\n2️⃣ Download logs for specific date:");
    const specificDate = "2025-09-01"; // Change to your date
    const dayFiles = await advanced.downloadDateRange(
      specificDate,
      specificDate,
      "./downloaded_logs"
    );

    console.log(`Downloaded ${dayFiles.length} files for ${specificDate}:`);
    dayFiles.forEach((file) => {
      console.log(`💾 ${file.localPath} - ${file.recordCount} records`);
    });

    // Example 3: Search for error logs
    console.log("\n3️⃣ Search for error logs (5xx status codes):");
    const errorLogs = await advanced.searchS3(
      { responseStatus: /^5\d{2}$/ }, // 5xx status codes
      {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      }
    );

    console.log(`Found ${errorLogs.length} files with server errors:`);
    errorLogs.forEach((result) => {
      console.log(`🚨 ${result.file} - ${result.matches.length} error logs`);
    });
  } catch (error) {
    console.error("❌ S3 download example failed:", error.message);
  }
}

// ===================================
// 📊 DATABASE ANALYTICS EXAMPLES
// ===================================

async function databaseAnalyticsExample() {
  console.log("\n📊 Database Analytics Examples");
  console.log("═".repeat(40));

  try {
    await init(config);
    const advanced = new LogStackAdvanced(config);

    // Example 1: Generate daily analytics
    console.log("\n1️⃣ Daily analytics report:");
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const analytics = await advanced.generateAnalytics({
      start: yesterday.toISOString(),
      end: new Date().toISOString(),
    });

    console.log("📈 Daily Analytics Report:");
    console.log(`   Total Requests: ${analytics.summary.totalRequests}`);
    console.log(
      `   Average Response Time: ${analytics.responseTimeStats.avg.toFixed(
        2
      )}ms`
    );
    console.log(
      `   Top Methods:`,
      Object.entries(analytics.methods).slice(0, 3)
    );
    console.log(`   Status Code Distribution:`, analytics.statusCodes);

    // Example 2: Advanced search with grouping
    console.log("\n2️⃣ Search and group by endpoint:");
    const searchResult = await advanced.advancedSearch({
      dateRange: {
        start: yesterday.toISOString(),
        end: new Date().toISOString(),
      },
      statusCodes: [200, 201, 404, 500],
      groupBy: "path",
      limit: 1000,
    });

    console.log(`🔍 Found ${searchResult.total} logs grouped by endpoint:`);
    Object.entries(searchResult.grouped || {})
      .slice(0, 5)
      .forEach(([path, data]) => {
        console.log(
          `   ${path}: ${
            data.count
          } requests (avg: ${data.stats.avgResponseTime.toFixed(2)}ms)`
        );
      });

    // Example 3: Find slow endpoints
    console.log("\n3️⃣ Find slow endpoints (>1000ms):");
    const slowEndpoints = await advanced.advancedSearch({
      dateRange: {
        start: yesterday.toISOString(),
        end: new Date().toISOString(),
      },
      responseTimeRange: {
        min: 1000, // >1 second
        max: Infinity,
      },
      groupBy: "path",
    });

    console.log(
      `🐌 Found ${
        Object.keys(slowEndpoints.grouped || {}).length
      } slow endpoints:`
    );
    Object.entries(slowEndpoints.grouped || {}).forEach(([path, data]) => {
      console.log(
        `   ${path}: ${data.stats.avgResponseTime.toFixed(2)}ms average`
      );
    });
  } catch (error) {
    console.error("❌ Analytics example failed:", error.message);
  }
}

// ===================================
// 🔄 S3 SYNC EXAMPLES
// ===================================

async function s3SyncExample() {
  console.log("\n🔄 S3 Sync Examples");
  console.log("═".repeat(25));

  try {
    await init(config);
    const advanced = new LogStackAdvanced(config);

    // Example 1: Sync last 3 days from S3 to database
    console.log("\n1️⃣ Sync recent S3 logs to database:");
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 3);

    const syncResult = await advanced.syncS3ToDb(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
      {
        allowDuplicates: false, // Skip existing logs
      }
    );

    console.log(`✅ Sync Results:`);
    console.log(`   Synced: ${syncResult.synced} logs`);
    console.log(`   Errors: ${syncResult.errors} logs`);

    // Example 2: Bulk insert custom logs
    console.log("\n2️⃣ Bulk insert custom API logs:");
    const customLogs = [
      {
        method: "GET",
        path: "/api/users",
        responseStatus: 200,
        request_time: new Date(),
        response_time: new Date(Date.now() + 150),
        client_ip: "192.168.1.100",
        requestHeaders: { "user-agent": "mobile-app/1.0" },
        responseBody: { users: [] },
      },
      {
        method: "POST",
        path: "/api/orders",
        responseStatus: 201,
        request_time: new Date(),
        response_time: new Date(Date.now() + 250),
        client_ip: "192.168.1.101",
        requestBody: { product_id: 123, quantity: 2 },
        responseBody: { order_id: 456 },
      },
    ];

    const bulkResult = await advanced.bulkInsert(customLogs, {
      batchSize: 1000,
    });
    console.log(`📝 Bulk Insert Results:`);
    console.log(`   Successful: ${bulkResult.successful}`);
    console.log(`   Failed: ${bulkResult.failed}`);
  } catch (error) {
    console.error("❌ S3 sync example failed:", error.message);
  }
}

// ===================================
// 🎯 PRACTICAL USE CASES
// ===================================

async function practicalUseCases() {
  console.log("\n🎯 Practical Use Cases");
  console.log("═".repeat(30));

  try {
    await init(config);
    const advanced = new LogStackAdvanced(config);

    // Use Case 1: Monitor API health
    console.log("\n📊 Use Case 1: API Health Monitoring");
    const healthCheck = await advanced.advancedSearch({
      dateRange: {
        start: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Last hour
        end: new Date().toISOString(),
      },
      statusCodes: [500, 502, 503, 504], // Server errors
      limit: 100,
    });

    if (healthCheck.total > 0) {
      console.log(
        `⚠️ Found ${healthCheck.total} server errors in the last hour!`
      );
    } else {
      console.log(`✅ No server errors in the last hour`);
    }

    // Use Case 2: Track user activity
    console.log("\n👥 Use Case 2: User Activity Tracking");
    const userActivity = await advanced.advancedSearch({
      dateRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
        end: new Date().toISOString(),
      },
      groupBy: "client_ip",
      limit: 1000,
    });

    console.log(
      `👤 Unique clients in last 24h: ${
        Object.keys(userActivity.grouped || {}).length
      }`
    );

    // Use Case 3: Performance analysis
    console.log("\n⚡ Use Case 3: Performance Analysis");
    const performanceData = await advanced.generateAnalytics({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last week
      end: new Date().toISOString(),
    });

    console.log(`📈 Weekly Performance Summary:`);
    console.log(`   Total Requests: ${performanceData.summary.totalRequests}`);
    console.log(
      `   Avg Response Time: ${performanceData.responseTimeStats.avg.toFixed(
        2
      )}ms`
    );
    console.log(
      `   Slowest Request: ${performanceData.responseTimeStats.max.toFixed(
        2
      )}ms`
    );
    console.log(
      `   Peak Hour: ${
        Object.entries(performanceData.hourlyDistribution).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0] || "N/A"
      }`
    );
  } catch (error) {
    console.error("❌ Practical use case failed:", error.message);
  }
}

// ===================================
// 🚀 MAIN EXECUTION
// ===================================

async function runAllExamples() {
  console.log("🚀 LogStack Advanced Features Examples");
  console.log("═".repeat(50));
  console.log("Make sure you have:");
  console.log("✅ AWS credentials configured");
  console.log("✅ S3 bucket with some log files");
  console.log("✅ MongoDB running");
  console.log("");

  try {
    await downloadLogsExample();
    await databaseAnalyticsExample();
    await s3SyncExample();
    await practicalUseCases();

    console.log("\n🎉 All examples completed successfully!");
    console.log("\n💡 Integration Tips:");
    console.log("1. Use S3 download for backup analysis");
    console.log("2. Generate analytics for performance monitoring");
    console.log("3. Sync S3 to database for disaster recovery");
    console.log("4. Use advanced search for troubleshooting");
  } catch (error) {
    console.error("❌ Examples failed:", error.message);
  }
}

// Export functions for individual use
module.exports = {
  downloadLogsExample,
  databaseAnalyticsExample,
  s3SyncExample,
  practicalUseCases,
  runAllExamples,
};

// Run all examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
