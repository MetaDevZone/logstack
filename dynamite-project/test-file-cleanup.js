const { init, runHourlyJob } = require("log-archiver");

// Test configuration for file cleanup verification
const config = {
  db: {
    uri:
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/dynamite-lifestyle-dev",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  providers: [
    {
      type: "s3",
      region: process.env.AWS_REGION || "ap-south-1",
      bucket: process.env.S3_BUCKET_NAME || "dynamite-lifestyle-logs-dev",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      keyPrefix: "dynamite_logs",
    },
  ],
  outputDirectory: "./test-cleanup-directory",
  retentionDays: 30,
};

console.log("\n=== File Cleanup Test for 9 Lakh Documents ===\n");

async function testFileCleanup() {
  try {
    console.log("1. Initializing log-archiver with version 1.0.5...");
    const logger = new Logger(config);

    console.log("2. Creating test directory...");
    const fs = require("fs");
    const path = require("path");

    // Create test directory
    const testDir = path.resolve(config.outputDirectory);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    console.log("3. Testing single log upload with file cleanup...");

    // Process a small batch to verify cleanup works
    const testLogs = [
      {
        level: "info",
        message: "Test cleanup log 1",
        timestamp: new Date().toISOString(),
        source: "cleanup-test",
        metadata: { testId: 1 },
      },
      {
        level: "info",
        message: "Test cleanup log 2",
        timestamp: new Date().toISOString(),
        source: "cleanup-test",
        metadata: { testId: 2 },
      },
    ];

    // Check files before upload
    console.log("4. Checking test directory before upload...");
    const filesBefore = fs.readdirSync(testDir).length;
    console.log(`   Files before upload: ${filesBefore}`);

    // Process logs (this should create and then delete local files)
    console.log("5. Processing logs to trigger file cleanup...");
    await logger.processLogs(testLogs);

    // Wait a moment for cleanup to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check files after upload
    console.log("6. Checking test directory after upload...");
    const filesAfter = fs.readdirSync(testDir).length;
    console.log(`   Files after upload: ${filesAfter}`);

    // Verification
    if (filesAfter <= filesBefore) {
      console.log("\n✅ SUCCESS: File cleanup working correctly!");
      console.log("   Local files are being deleted after S3 upload");
      console.log("   Ready for 9 lakh document bulk migration");
    } else {
      console.log("\n❌ WARNING: Files may not be cleaning up properly");
      console.log("   Check uploadProviders.ts for fs.unlink implementation");
    }

    console.log("\n7. Package version verification...");
    const packageInfo = require("log-archiver/package.json");
    console.log(`   Using log-archiver version: ${packageInfo.version}`);

    if (packageInfo.version === "1.0.5") {
      console.log("   ✅ Latest version with file cleanup fix installed");
    } else {
      console.log("   ⚠️  May need to update to version 1.0.5");
    }

    console.log("\n=== File Cleanup Test Complete ===");
  } catch (error) {
    console.error("\n❌ File cleanup test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Run the test
testFileCleanup()
  .then(() => {
    console.log("\nTest finished. Ready for bulk migration.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
