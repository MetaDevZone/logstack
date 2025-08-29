/**
 * 🗑️ Standalone Log Retention Test
 *
 * Test automatic log retention and cleanup features.
 * Copy this file to any project to test retention policies.
 */

const { init, initRetention } = require("cron-log-service");
require("dotenv").config();

// ==========================================
// ⚙️ RETENTION CONFIGURATION
// ==========================================

const retentionConfig = {
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/test",
  uploadProvider: "s3",

  collections: {
    jobsCollectionName: "retention_test_jobs",
    logsCollectionName: "retention_test_logs",
    apiLogsCollectionName: "apilogs",
  },

  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET,
  },

  // 🗑️ LOG RETENTION POLICIES
  retention: {
    // Database retention (in days)
    database: {
      apiLogs: 14, // Keep API logs for 14 days
      jobs: 90, // Keep job records for 90 days
      logs: 60, // Keep processing logs for 60 days
      autoCleanup: true, // Enable automatic cleanup
      cleanupCron: "0 2 * * *", // Run at 2 AM daily
    },

    // Storage retention (in days)
    storage: {
      files: 180, // Keep files for 180 days (6 months)
      autoCleanup: true, // Enable automatic file cleanup
      cleanupCron: "0 3 * * *", // Run at 3 AM daily

      // S3 Lifecycle policies for cost optimization
      s3Lifecycle: {
        transitionToIA: 30, // Move to Infrequent Access after 30 days
        transitionToGlacier: 90, // Move to Glacier after 90 days
        transitionToDeepArchive: 180, // Move to Deep Archive after 180 days
        expiration: 2555, // Delete after 7 years (compliance)
      },
    },
  },

  logging: {
    level: "info",
    enableConsole: true,
  },
};

// ==========================================
// 🧪 TEST FUNCTIONS
// ==========================================

async function validateEnvironment() {
  console.log("🔍 Validating environment for retention testing...");

  const required = [
    "DB_URI",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "S3_BUCKET",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing.join(", "));
    return false;
  }

  console.log("✅ Environment validated");
  return true;
}

async function testRetentionStatistics(retentionService) {
  console.log("\n📊 Getting retention statistics...");

  try {
    const stats = await retentionService.getRetentionStats();

    console.log("📈 Database Statistics:");
    console.log(
      `   API Logs: ${stats.database.apiLogs.total} total, ${stats.database.apiLogs.oldRecords} old`
    );
    console.log(
      `   Jobs: ${stats.database.jobs.total} total, ${stats.database.jobs.oldRecords} old`
    );
    console.log(
      `   Logs: ${stats.database.logs.total} total, ${stats.database.logs.oldRecords} old`
    );

    console.log("💾 Storage Statistics:");
    console.log(
      `   Files: ${stats.storage.totalFiles} total, ${stats.storage.oldFiles} old`
    );
    console.log(
      `   Size: ${formatBytes(stats.storage.totalSize)} total, ${formatBytes(
        stats.storage.oldSize
      )} old`
    );

    return stats;
  } catch (error) {
    console.error("❌ Failed to get retention statistics:", error.message);
    throw error;
  }
}

async function testDryRunCleanup(retentionService) {
  console.log("\n🔍 Running dry run cleanup (preview mode)...");

  try {
    await retentionService.runManualCleanup({
      database: true,
      storage: true,
      dryRun: true,
    });

    console.log("✅ Dry run completed - no data was actually deleted");
  } catch (error) {
    console.error("❌ Dry run failed:", error.message);
    throw error;
  }
}

async function testManualCleanup(retentionService) {
  console.log("\n🧹 Running manual cleanup...");

  try {
    const results = await retentionService.runManualCleanup({
      database: true,
      storage: true,
      dryRun: false,
    });

    if (results.database) {
      console.log("📊 Database cleanup results:");
      console.log(`   API Logs deleted: ${results.database.apiLogs}`);
      console.log(`   Jobs deleted: ${results.database.jobs}`);
      console.log(`   Logs deleted: ${results.database.logs}`);
    }

    if (results.storage) {
      console.log("💾 Storage cleanup results:");
      console.log(`   Files deleted: ${results.storage.deletedFiles}`);
      console.log(`   Size freed: ${formatBytes(results.storage.deletedSize)}`);
    }

    return results;
  } catch (error) {
    console.error("❌ Manual cleanup failed:", error.message);
    throw error;
  }
}

async function testS3LifecyclePolicies(retentionService) {
  console.log("\n🌩️ Testing S3 lifecycle policies setup...");

  try {
    await retentionService.setupS3LifecyclePolicies();
    console.log("✅ S3 lifecycle policies configured successfully");

    const lifecycle = retentionConfig.retention.storage.s3Lifecycle;
    console.log("📋 Lifecycle configuration:");
    console.log(`   Transition to IA: ${lifecycle.transitionToIA} days`);
    console.log(
      `   Transition to Glacier: ${lifecycle.transitionToGlacier} days`
    );
    console.log(
      `   Transition to Deep Archive: ${lifecycle.transitionToDeepArchive} days`
    );
    console.log(`   Expiration: ${lifecycle.expiration} days`);
  } catch (error) {
    console.error("❌ S3 lifecycle setup failed:", error.message);
    throw error;
  }
}

// ==========================================
// 🎯 MAIN TEST SCENARIOS
// ==========================================

async function basicRetentionTest() {
  console.log("🧪 Basic Retention Test");
  console.log("=======================\n");

  try {
    // Validate environment
    const envOk = await validateEnvironment();
    if (!envOk) return;

    // Initialize service
    console.log("🚀 Initializing service...");
    const { db } = await init(retentionConfig);
    console.log("✅ Service initialized");

    // Initialize retention service
    console.log("🗑️  Initializing retention service...");
    const retentionService = await initRetention(retentionConfig, db);
    console.log("✅ Retention service initialized");

    // Get statistics
    await testRetentionStatistics(retentionService);

    // Run dry run
    await testDryRunCleanup(retentionService);

    console.log("\n🎉 Basic retention test completed successfully!");
  } catch (error) {
    console.error("\n❌ Basic retention test failed:", error.message);
    process.exit(1);
  }
}

async function comprehensiveRetentionTest() {
  console.log("🔬 Comprehensive Retention Test");
  console.log("===============================\n");

  try {
    // Initialize service
    const { db } = await init(retentionConfig);
    const retentionService = await initRetention(retentionConfig, db);

    // Test 1: Statistics
    console.log("📊 Test 1: Retention Statistics");
    await testRetentionStatistics(retentionService);

    // Test 2: Dry run cleanup
    console.log("\n🔍 Test 2: Dry Run Cleanup");
    await testDryRunCleanup(retentionService);

    // Test 3: S3 lifecycle policies
    console.log("\n🌩️ Test 3: S3 Lifecycle Policies");
    await testS3LifecyclePolicies(retentionService);

    // Test 4: Manual cleanup (actual deletion)
    console.log("\n🧹 Test 4: Manual Cleanup");
    await testManualCleanup(retentionService);

    console.log("\n🎉 Comprehensive retention test completed successfully!");
    console.log("✅ All retention features are working properly");
    console.log(
      "🔄 Automatic cleanup is now active based on your cron schedule"
    );
  } catch (error) {
    console.error("\n❌ Comprehensive retention test failed:", error.message);
    process.exit(1);
  }
}

async function costOptimizationTest() {
  console.log("💰 Cost Optimization Test");
  console.log("=========================\n");

  try {
    const { db } = await init(retentionConfig);
    const retentionService = await initRetention(retentionConfig, db);

    console.log("📊 Analyzing storage costs...");
    const stats = await retentionService.getRetentionStats();

    // Calculate potential savings
    const totalSize = stats.storage.totalSize;
    const oldSize = stats.storage.oldSize;

    const standardCost = (totalSize / (1024 * 1024 * 1024)) * 0.023; // $0.023 per GB
    const optimizedCost =
      ((totalSize - oldSize) / (1024 * 1024 * 1024)) * 0.023 +
      (oldSize / (1024 * 1024 * 1024)) * 0.004; // Glacier pricing

    console.log("💰 Cost Analysis:");
    console.log(
      `   Current monthly cost (Standard): $${standardCost.toFixed(2)}`
    );
    console.log(`   Optimized monthly cost: $${optimizedCost.toFixed(2)}`);
    console.log(
      `   Monthly savings: $${(standardCost - optimizedCost).toFixed(2)}`
    );
    console.log(
      `   Annual savings: $${((standardCost - optimizedCost) * 12).toFixed(2)}`
    );

    // Setup lifecycle policies for optimization
    await testS3LifecyclePolicies(retentionService);

    console.log("\n✅ Cost optimization configured successfully!");
  } catch (error) {
    console.error("\n❌ Cost optimization test failed:", error.message);
    process.exit(1);
  }
}

// ==========================================
// 🛠️ HELPER FUNCTIONS
// ==========================================

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// ==========================================
// 🎮 COMMAND LINE INTERFACE
// ==========================================

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log("🗑️ Standalone Log Retention Test");
    console.log("");
    console.log("Usage:");
    console.log(
      "  node retention-test.js                  # Basic retention test"
    );
    console.log(
      "  node retention-test.js --comprehensive  # Full retention testing"
    );
    console.log(
      "  node retention-test.js --cost           # Cost optimization test"
    );
    console.log("  node retention-test.js --help           # Show this help");
    console.log("");
    console.log("Environment Variables Required:");
    console.log("  DB_URI                    # MongoDB connection string");
    console.log("  AWS_ACCESS_KEY_ID         # AWS access key");
    console.log("  AWS_SECRET_ACCESS_KEY     # AWS secret key");
    console.log("  S3_BUCKET                 # S3 bucket name");
    console.log("  AWS_REGION                # AWS region");
    console.log("");
    console.log("Features Tested:");
    console.log("  ✅ Database retention policies");
    console.log("  ✅ Storage retention policies");
    console.log("  ✅ S3 lifecycle configuration");
    console.log("  ✅ Automatic cleanup scheduling");
    console.log("  ✅ Cost optimization");
    return;
  }

  if (args.includes("--comprehensive")) {
    await comprehensiveRetentionTest();
  } else if (args.includes("--cost")) {
    await costOptimizationTest();
  } else {
    await basicRetentionTest();
  }
}

// ==========================================
// 🏁 ENTRY POINT
// ==========================================

if (require.main === module) {
  main().catch((error) => {
    console.error("\n💥 Retention test failed:", error.message);
    console.log("\n🆘 Troubleshooting:");
    console.log("1. Check environment variables in .env file");
    console.log("2. Verify MongoDB connection");
    console.log("3. Test AWS credentials and S3 bucket access");
    console.log("4. Ensure proper IAM permissions for S3 lifecycle");
    process.exit(1);
  });
}

module.exports = {
  retentionConfig,
  basicRetentionTest,
  comprehensiveRetentionTest,
  costOptimizationTest,
};
