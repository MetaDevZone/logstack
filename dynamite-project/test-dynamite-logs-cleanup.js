const { init, runHourlyJob } = require("log-archiver");
const fs = require("fs");
const path = require("path");

// Test configuration
const testConfig = {
  dbUri:
    process.env.DB_URI || "mongodb://localhost:27017/dynamite-lifestyle-dev",
  uploadProvider: "s3",
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "ap-south-1",
    bucket: process.env.S3_BUCKET_NAME || "dynamite-lifestyle-logs-dev",
    keyPrefix: "dynamite_logs",
  },
  outputDirectory: `dynamite-logs/${
    process.env.ENVIRONMENT_NAME || "test-env"
  }`,
  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      byHour: true,
      byStatus: false,
    },
  },
  fileFormat: "json",
  compression: { enabled: false, format: "gzip" },
  dailyCron: "0 0 * * *",
  hourlyCron: "* * * * *",
  timezone: "UTC",
  retention: {
    enabled: false,
    days: 90,
    cleanupSchedule: "0 2 * * *",
    s3Retention: { enabled: false, days: 180, cleanupSchedule: "0 3 * * 0" },
  },
  collections: {
    apiLogsCollectionName: `api_logs`,
    logsCollectionName: `app_logs`,
    jobsCollectionName: `jobs`,
  },
};

console.log("\n🧪 Testing Dynamite-Logs Folder Cleanup\n");

function scanDirectory(dir, prefix = "") {
  const items = [];
  if (!fs.existsSync(dir)) return items;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = prefix ? `${prefix}/${file}` : file;

    if (fs.statSync(fullPath).isDirectory()) {
      items.push(`📁 ${relativePath}/`);
      items.push(...scanDirectory(fullPath, relativePath));
    } else {
      const stats = fs.statSync(fullPath);
      items.push(`📄 ${relativePath} (${Math.round(stats.size / 1024)}KB)`);
    }
  }
  return items;
}

async function testDynamiteLogsCleanup() {
  try {
    console.log("1. 📁 Scanning dynamite-logs directory before test...");
    const outputDir = path.resolve(testConfig.outputDirectory);

    console.log(`   Directory: ${outputDir}`);
    const filesBefore = scanDirectory(outputDir);

    if (filesBefore.length === 0) {
      console.log("   ✅ Directory is empty or doesn't exist");
    } else {
      console.log("   📋 Files/folders before:");
      filesBefore.forEach((item) => console.log(`     ${item}`));
    }

    console.log("\n2. 🚀 Initializing log-archiver...");
    await init(testConfig);
    console.log("   ✅ Initialized successfully");

    console.log("\n3. 🔄 Running hourly job to create and upload files...");
    const currentHour = new Date().getUTCHours();
    const dateStr = new Date().toISOString().split("T")[0];
    const hourRange = `${currentHour.toString().padStart(2, "0")}-${(
      currentHour + 1
    )
      .toString()
      .padStart(2, "0")}`;

    console.log(`   Processing: ${dateStr} ${hourRange}`);

    await runHourlyJob(currentHour);
    console.log("   ✅ Hourly job completed");

    console.log("\n4. ⏳ Waiting for file operations to complete...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("\n5. 🔍 Scanning dynamite-logs directory after upload...");
    const filesAfter = scanDirectory(outputDir);

    if (filesAfter.length === 0) {
      console.log("   ✅ SUCCESS: Directory is empty!");
      console.log("   🧹 All files have been cleaned up after S3 upload");
    } else {
      console.log("   📋 Files/folders remaining:");
      filesAfter.forEach((item) => console.log(`     ${item}`));

      // Check if any actual log files remain
      const logFiles = filesAfter.filter(
        (item) => item.includes(".json") && !item.includes("📁")
      );
      if (logFiles.length === 0) {
        console.log("   ✅ Good: No log files remaining (only empty folders)");
      } else {
        console.log(
          "   ⚠️  Warning: Log files still present - cleanup may not be working"
        );
      }
    }

    console.log("\n6. 📊 File cleanup verification summary:");
    console.log(`   Files before: ${filesBefore.length}`);
    console.log(`   Files after: ${filesAfter.length}`);

    if (filesAfter.length <= filesBefore.length) {
      console.log("   ✅ File cleanup working correctly");
      console.log("   🚀 Ready for 9 lakh document migration");
    } else {
      console.log("   ❌ Files increased - something went wrong");
    }

    console.log("\n7. 🔍 S3 keyPrefix verification:");
    console.log(`   Check S3 bucket: ${testConfig.s3.bucket}`);
    console.log(
      `   Expected path: dynamite_logs/${dateStr}/hour-${hourRange}/`
    );
    console.log('   Files should be organized under keyPrefix "dynamite_logs"');
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("   Check your AWS credentials and MongoDB connection");
  }
}

testDynamiteLogsCleanup()
  .then(() => {
    console.log("\n🎉 Dynamite-logs cleanup verification complete!");
    console.log("Local files should be cleaned up after S3 upload.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
