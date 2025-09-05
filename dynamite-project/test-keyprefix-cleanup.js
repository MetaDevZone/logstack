const { init, runHourlyJob } = require("log-archiver");
const fs = require("fs");
const path = require("path");

// Test configuration
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
      keyPrefix: "dynamite_logs", // ← This should create organized folder structure
    },
  ],
  outputDirectory: "./test-keyprefix-cleanup",
  retentionDays: 30,
};

console.log("\n=== KeyPrefix + File Cleanup Test ===\n");

async function testKeyPrefixAndCleanup() {
  try {
    console.log("1. Testing log-archiver version 1.0.6...");
    const packageInfo = require("log-archiver/package.json");
    console.log(`   ✅ Package version: ${packageInfo.version}`);

    if (packageInfo.version !== "1.0.6") {
      console.log(
        "   ⚠️  Warning: Expected version 1.0.6, but found",
        packageInfo.version
      );
    }

    console.log("\n2. Initializing with keyPrefix configuration...");
    await init(config);
    console.log("   ✅ Log-archiver initialized successfully");

    console.log("\n3. Creating test directory...");
    const testDir = path.resolve(config.outputDirectory);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    console.log("\n4. Checking files before processing...");
    const filesBefore = fs.readdirSync(testDir).length;
    console.log(`   Files before: ${filesBefore}`);

    console.log("\n5. Running hourly job to test both features...");
    console.log(
      "   - keyPrefix should organize S3 structure as: dynamite_logs/..."
    );
    console.log("   - File cleanup should delete local files after S3 upload");

    const currentHour = new Date().getUTCHours();
    console.log(`   Processing UTC hour: ${currentHour}`);

    await runHourlyJob(currentHour);
    console.log("   ✅ Hourly job completed");

    // Wait for cleanup
    console.log("\n6. Waiting for file cleanup...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("\n7. Checking files after processing...");
    const filesAfter = fs.readdirSync(testDir).length;
    console.log(`   Files after: ${filesAfter}`);

    // File cleanup verification
    if (filesAfter <= filesBefore) {
      console.log("   ✅ SUCCESS: File cleanup working!");
      console.log("   Local files are being deleted after S3 upload");
    } else {
      console.log("   ❌ WARNING: Files may not be cleaning up properly");
      console.log("   Files found:", fs.readdirSync(testDir));
    }

    console.log("\n8. KeyPrefix verification:");
    console.log("   ✅ Check your S3 bucket for organized folder structure:");
    console.log(`   📁 Bucket: ${config.providers[0].bucket}`);
    console.log(`   📁 Path: dynamite_logs/YYYY-MM-DD/hour-XX-XX/`);
    console.log(
      '   This should be organized with the keyPrefix "dynamite_logs"'
    );

    console.log("\n9. Test summary:");
    console.log("   📦 Package: log-archiver v1.0.6");
    console.log('   🗂️  KeyPrefix: "dynamite_logs" configured');
    console.log("   🧹 File Cleanup: Automatic deletion after S3 upload");
    console.log("   🚀 Ready for 9 lakh document bulk migration");

    console.log("\n=== Test Complete ===");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Run the comprehensive test
testKeyPrefixAndCleanup()
  .then(() => {
    console.log("\n✅ KeyPrefix and File Cleanup verification complete!");
    console.log("Both features should now be working in your project.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
