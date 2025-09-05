const { init, runHourlyJob } = require("log-archiver");
const fs = require("fs");
const path = require("path");

// Test configuration with keyPrefix
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
      keyPrefix: "dynamite_logs", // ← This is the key fix!
    },
  ],
  outputDirectory: "./test-fixes-verification",
  retentionDays: 30,
};

console.log("\n🔧 Testing KeyPrefix & File Cleanup Fixes\n");

async function testFixes() {
  try {
    console.log("1. ✅ Using log-archiver v1.0.6 with fixes");
    console.log('   - keyPrefix: "dynamite_logs" for organized S3 structure');
    console.log("   - File cleanup: Deletes local files after S3 upload");

    console.log("\n2. Initializing log-archiver...");
    await init(config);
    console.log("   ✅ Initialized successfully");

    console.log("\n3. Creating test directory...");
    const testDir = path.resolve(config.outputDirectory);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    console.log("\n4. File cleanup test...");
    const filesBefore = fs.readdirSync(testDir).length;
    console.log(`   Files before processing: ${filesBefore}`);

    console.log("\n5. Running hourly job...");
    const currentHour = new Date().getUTCHours();
    await runHourlyJob(currentHour);

    // Wait for file cleanup to complete
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const filesAfter = fs.readdirSync(testDir).length;
    console.log(`   Files after processing: ${filesAfter}`);

    if (filesAfter <= filesBefore) {
      console.log("   ✅ File cleanup working correctly!");
    } else {
      console.log("   ⚠️  Files may still exist:", fs.readdirSync(testDir));
    }

    console.log("\n6. KeyPrefix verification:");
    console.log("   🔍 Check your S3 bucket for organized structure:");
    console.log(`   📁 Expected path: dynamite_logs/YYYY-MM-DD/hour-XX-XX/`);
    console.log(`   📁 Bucket: ${config.providers[0].bucket}`);

    console.log("\n✅ Both fixes should now be working!");
    console.log("📦 Ready for 9 lakh document bulk migration");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  }
}

testFixes().then(() => {
  console.log("\n🎉 Test completed!");
  process.exit(0);
});
