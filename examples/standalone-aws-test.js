/**
 * 🚀 Standalone AWS S3 Upload Test
 *
 * Copy this entire file to any Node.js project and it will work!
 *
 * SETUP STEPS:
 * 1. npm install cron-log-service dotenv
 * 2. Create .env file with your credentials
 * 3. node standalone-aws-test.js
 *
 * That's it! 🎉
 */

// ==========================================
// 📦 REQUIRED PACKAGES
// ==========================================
const {
  init,
  processSpecificHour,
  createDailyJobs,
} = require("cron-log-service");
require("dotenv").config();

// ==========================================
// ⚙️ CONFIGURATION (EDIT AS NEEDED)
// ==========================================
const config = {
  // Database connection
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp",

  // Upload settings
  uploadProvider: "s3",
  fileFormat: "json",
  outputDirectory: "api-logs-backup",

  // Collection names (change these to match your database)
  collections: {
    jobsCollectionName: "backup_jobs",
    logsCollectionName: "backup_logs",
    apiLogsCollectionName: "apilogs", // Your main API logs collection
  },

  // AWS S3 settings (from .env file)
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET,
  },

  // Other settings
  retryAttempts: 3,
  logging: {
    level: "info",
    enableConsole: true,
  },
};

// ==========================================
// 🛠️ HELPER FUNCTIONS
// ==========================================

async function validateEnvironment() {
  console.log("🔍 Validating environment...");

  const required = [
    "DB_URI",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "S3_BUCKET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing.join(", "));
    console.log("\n📝 Create a .env file with:");
    console.log("DB_URI=mongodb://localhost:27017/your-database");
    console.log("AWS_ACCESS_KEY_ID=your_aws_access_key");
    console.log("AWS_SECRET_ACCESS_KEY=your_aws_secret_key");
    console.log("S3_BUCKET=your-s3-bucket-name");
    console.log("AWS_REGION=us-east-1");
    return false;
  }

  console.log("✅ All environment variables found");
  console.log(
    `📊 Database: ${process.env.DB_URI.split("@")[1] || "localhost"}`
  );
  console.log(`📦 S3 Bucket: ${process.env.S3_BUCKET}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION || "us-east-1"}`);
  return true;
}

async function testConnection() {
  console.log("\n🔗 Testing connections...");

  try {
    // Initialize the cron-log-service
    await init(config);
    console.log("✅ Successfully connected to AWS S3 and MongoDB");
    return true;
  } catch (error) {
    console.error("❌ Connection failed:", error.message);

    // Provide helpful troubleshooting
    if (error.message.includes("MongoDB")) {
      console.log("\n💡 MongoDB troubleshooting:");
      console.log("1. Make sure MongoDB is running");
      console.log("2. Check if DB_URI is correct");
      console.log("3. Verify network connectivity");
    }

    if (error.message.includes("S3") || error.message.includes("AWS")) {
      console.log("\n💡 AWS S3 troubleshooting:");
      console.log("1. Verify AWS credentials are correct");
      console.log("2. Check if S3 bucket exists");
      console.log("3. Ensure proper IAM permissions");
    }

    return false;
  }
}

async function uploadCurrentHour() {
  console.log("\n⏰ Uploading current hour data...");

  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentHour = now.getHours();

    console.log(`📅 Date: ${today}`);
    console.log(`🕐 Hour: ${currentHour}:00 - ${currentHour + 1}:00`);

    // Create daily job structure
    const job = await createDailyJobs(today, config);
    console.log(`📋 Created job with ${job.hours.length} hour slots`);

    // Process current hour
    await processSpecificHour(today, currentHour, config);

    const fileName = `${currentHour.toString().padStart(2, "0")}-${(
      currentHour + 1
    )
      .toString()
      .padStart(2, "0")}.json`;
    const s3Path = `s3://${config.s3.bucket}/${config.outputDirectory}/${today}/${fileName}`;

    console.log("🎉 Upload successful!");
    console.log(`📦 File location: ${s3Path}`);

    return { today, currentHour, s3Path };
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    throw error;
  }
}

async function uploadSpecificTime(date, hour) {
  console.log(`\n📤 Uploading specific time: ${date} ${hour}:00`);

  try {
    await processSpecificHour(date, hour, config);

    const fileName = `${hour.toString().padStart(2, "0")}-${(hour + 1)
      .toString()
      .padStart(2, "0")}.json`;
    const s3Path = `s3://${config.s3.bucket}/${config.outputDirectory}/${date}/${fileName}`;

    console.log(`✅ Uploaded: ${s3Path}`);
    return s3Path;
  } catch (error) {
    console.error(`❌ Failed to upload ${date} ${hour}:00:`, error.message);
    throw error;
  }
}

// ==========================================
// 🎯 MAIN FUNCTIONS
// ==========================================

async function quickTest() {
  console.log("⚡ Quick AWS S3 Upload Test");
  console.log("===========================\n");

  try {
    // Step 1: Validate environment
    const envOk = await validateEnvironment();
    if (!envOk) return false;

    // Step 2: Test connections
    const connectionOk = await testConnection();
    if (!connectionOk) return false;

    // Step 3: Upload current hour
    const result = await uploadCurrentHour();

    console.log("\n🎉 QUICK TEST SUCCESSFUL!");
    console.log("========================");
    console.log("✅ Environment validated");
    console.log("✅ Connections working");
    console.log("✅ Data uploaded to S3");
    console.log(`📁 Check S3: ${config.s3.bucket}/${config.outputDirectory}/`);

    return result;
  } catch (error) {
    console.error("\n❌ QUICK TEST FAILED");
    console.error("Error:", error.message);
    return false;
  }
}

async function bulkUpload() {
  console.log("📦 Bulk Upload - Last 7 Days (24 Hours)");
  console.log("=======================================\n");

  try {
    await init(config);

    const results = [];
    const today = new Date();

    // Upload last 7 days, all 24 hours
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().split("T")[0];

      console.log(`\n📅 Processing ${dateStr}...`);

      for (let hour = 0; hour < 24; hour++) {
        try {
          const s3Path = await uploadSpecificTime(dateStr, hour);
          results.push({ date: dateStr, hour, s3Path, status: "success" });
        } catch (error) {
          console.log(`⚠️  ${dateStr} ${hour}:00 - ${error.message}`);
          results.push({
            date: dateStr,
            hour,
            error: error.message,
            status: "failed",
          });
        }
      }
    }

    // Summary
    const successful = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;

    console.log("\n📊 BULK UPLOAD SUMMARY");
    console.log("=====================");
    console.log(`✅ Successful uploads: ${successful}`);
    console.log(`❌ Failed uploads: ${failed}`);
    console.log(`📦 Total processed: ${results.length}`);

    return results;
  } catch (error) {
    console.error("❌ Bulk upload failed:", error.message);
    throw error;
  }
}

async function customUpload(startDate, endDate, hours = []) {
  console.log(`📋 Custom Upload: ${startDate} to ${endDate}`);
  console.log("=====================================\n");

  try {
    await init(config);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const results = [];

    // Default to all 24 hours if no hours specified
    const hoursToProcess =
      hours.length > 0 ? hours : Array.from({ length: 24 }, (_, i) => i);

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = date.toISOString().split("T")[0];

      console.log(`📅 Processing ${dateStr}...`);

      for (const hour of hoursToProcess) {
        try {
          const s3Path = await uploadSpecificTime(dateStr, hour);
          results.push({ date: dateStr, hour, s3Path, status: "success" });
        } catch (error) {
          console.log(`⚠️  ${dateStr} ${hour}:00 - ${error.message}`);
          results.push({
            date: dateStr,
            hour,
            error: error.message,
            status: "failed",
          });
        }
      }
    }

    const successful = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;

    console.log("\n📊 CUSTOM UPLOAD SUMMARY");
    console.log("========================");
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);

    return results;
  } catch (error) {
    console.error("❌ Custom upload failed:", error.message);
    throw error;
  }
}

// ==========================================
// 🎮 COMMAND LINE INTERFACE
// ==========================================

async function main() {
  const args = process.argv.slice(2);

  // Help
  if (args.includes("--help") || args.includes("-h")) {
    console.log("🚀 Standalone AWS S3 Upload Test");
    console.log("");
    console.log("Usage:");
    console.log(
      "  node standalone-aws-test.js                    # Quick test (current hour)"
    );
    console.log(
      "  node standalone-aws-test.js --bulk             # Upload last 7 days (24 hours each)"
    );
    console.log(
      "  node standalone-aws-test.js --custom           # Custom date range (24 hours each)"
    );
    console.log(
      "  node standalone-aws-test.js --help             # Show this help"
    );
    console.log("");
    console.log("Environment Variables (.env file):");
    console.log("  DB_URI=mongodb://localhost:27017/your-db");
    console.log("  AWS_ACCESS_KEY_ID=your_access_key");
    console.log("  AWS_SECRET_ACCESS_KEY=your_secret_key");
    console.log("  S3_BUCKET=your-bucket-name");
    console.log("  AWS_REGION=us-east-1");
    console.log("");
    console.log("Setup:");
    console.log("  1. npm install cron-log-service dotenv");
    console.log("  2. Create .env file with credentials");
    console.log("  3. Run this script");
    return;
  }

  // Bulk upload
  if (args.includes("--bulk")) {
    await bulkUpload();
    return;
  }

  // Custom upload
  if (args.includes("--custom")) {
    const startDate = args[args.indexOf("--custom") + 1] || "2024-01-01";
    const endDate = args[args.indexOf("--custom") + 2] || "2024-01-07";
    await customUpload(startDate, endDate);
    return;
  }

  // Default: Quick test
  await quickTest();
}

// ==========================================
// 🏁 ENTRY POINT
// ==========================================

if (require.main === module) {
  main().catch((error) => {
    console.error("\n💥 Script failed:", error.message);
    console.log("\n🆘 Need help?");
    console.log("1. Check your .env file");
    console.log("2. Verify MongoDB is running");
    console.log("3. Test AWS credentials");
    console.log("4. Run with --help for usage info");
    process.exit(1);
  });
}

// ==========================================
// 📤 EXPORTS (for use in other files)
// ==========================================

module.exports = {
  quickTest,
  bulkUpload,
  customUpload,
  uploadSpecificTime,
  config,
};

// ==========================================
// 💡 USAGE EXAMPLES IN CODE
// ==========================================

/*

// Example 1: Quick test in your code
const { quickTest } = require('./standalone-aws-test');
quickTest().then(result => {
  console.log('Upload result:', result);
});

// Example 2: Upload specific time
const { uploadSpecificTime } = require('./standalone-aws-test');
uploadSpecificTime('2024-01-15', 14).then(s3Path => {
  console.log('Uploaded to:', s3Path);
});

// Example 3: Bulk upload last week (all 24 hours each day)
const { bulkUpload } = require('./standalone-aws-test');
bulkUpload().then(results => {
  console.log('Bulk upload completed:', results.length, 'files processed');
});

// Example 4: Custom date range (all 24 hours by default)
const { customUpload } = require('./standalone-aws-test');
customUpload('2024-01-01', '2024-01-05').then(results => {
  console.log('Custom upload completed');
});

// Example 5: Custom date range with specific hours only
const { customUpload } = require('./standalone-aws-test');
customUpload('2024-01-01', '2024-01-05', [9, 12, 15, 18]).then(results => {
  console.log('Custom upload with specific hours completed');
});

*/
