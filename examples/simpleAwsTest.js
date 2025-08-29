/**
 * 🌩️ Simple AWS S3 Test - Upload API Logs
 *
 * This file demonstrates a simple way to fetch data from your API logs collection
 * and upload it to AWS S3 using the cron-log-service package.
 */

const { init, processSpecificHour, createDailyJobs } = require("../src/main");
const { getApiLogs } = require("../src/apiLogs");
require("dotenv").config();

// ==========================================
// 📋 SIMPLE AWS CONFIGURATION
// ==========================================

const simpleAwsConfig = {
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/test",
  uploadProvider: "s3",
  fileFormat: "json",

  // Clean S3 directory structure
  outputDirectory: "simple-test-uploads",

  // Your collection names
  collections: {
    jobsCollectionName: "simple_test_jobs",
    logsCollectionName: "simple_test_logs",
    apiLogsCollectionName: "apilogs", // Your existing collection
  },

  // AWS S3 settings
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET,
  },

  retryAttempts: 3,
  logging: {
    level: "info",
    enableConsole: true,
  },
};

// ==========================================
// 🧪 SIMPLE TEST FUNCTIONS
// ==========================================

async function checkAwsCredentials() {
  console.log("🔐 Checking AWS credentials...");

  const required = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing AWS credentials:", missing.join(", "));
    console.log("\n💡 Add these to your .env file:");
    console.log("AWS_ACCESS_KEY_ID=your_access_key");
    console.log("AWS_SECRET_ACCESS_KEY=your_secret_key");
    console.log("S3_BUCKET=your-bucket-name");
    return false;
  }

  console.log("✅ AWS credentials found");
  console.log(`📦 S3 Bucket: ${process.env.S3_BUCKET}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION || "us-east-1"}`);
  return true;
}

async function fetchDataFromCollection() {
  console.log("\n📊 Fetching data from your API logs collection...");

  try {
    // Get recent logs (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const today = new Date();

    const logs = await getApiLogs(
      {
        startDate: yesterday,
        endDate: today,
        limit: 100, // Get 100 recent logs for testing
      },
      simpleAwsConfig
    );

    console.log(`✅ Found ${logs.length} API logs in your collection`);

    if (logs.length > 0) {
      const sampleLog = logs[0];
      console.log("📄 Sample log:");
      console.log(`   Method: ${sampleLog.method || "N/A"}`);
      console.log(`   Path: ${sampleLog.path || "N/A"}`);
      console.log(`   Time: ${sampleLog.request_time || "N/A"}`);
      console.log(`   Status: ${sampleLog.responseStatus || "N/A"}`);
    }

    return logs;
  } catch (error) {
    console.error("❌ Failed to fetch data from collection:", error.message);
    console.log("\n💡 Make sure:");
    console.log("1. MongoDB is running and accessible");
    console.log("2. Database URI is correct in .env");
    console.log('3. Collection "apilogs" exists with data');
    throw error;
  }
}

async function uploadToS3() {
  console.log("\n🌩️ Uploading data to AWS S3...");

  try {
    // Initialize the service
    await init(simpleAwsConfig);
    console.log("✅ Connected to AWS S3");

    // Create daily job for today
    const today = new Date().toISOString().split("T")[0];
    const job = await createDailyJobs(today, simpleAwsConfig);
    console.log(
      `📅 Created job for ${today} with ${job.hours.length} hour slots`
    );

    // Process current hour
    const currentHour = new Date().getHours();
    console.log(
      `⚡ Processing current hour: ${currentHour}:00-${currentHour + 1}:00`
    );

    await processSpecificHour(today, currentHour, simpleAwsConfig);

    console.log("🎉 Upload to S3 completed successfully!");
    console.log(
      `📦 File uploaded to: s3://${simpleAwsConfig.s3.bucket}/${
        simpleAwsConfig.outputDirectory
      }/${today}/${currentHour.toString().padStart(2, "0")}-${(currentHour + 1)
        .toString()
        .padStart(2, "0")}.json`
    );

    return true;
  } catch (error) {
    console.error("❌ S3 upload failed:", error.message);
    console.log("\n💡 Troubleshooting:");
    console.log("1. Check AWS credentials are valid");
    console.log("2. Verify S3 bucket exists and is accessible");
    console.log("3. Check IAM permissions for S3 write access");
    throw error;
  }
}

async function uploadSpecificHour(date, hour) {
  console.log(
    `\n📤 Uploading specific hour: ${date} ${hour}:00-${hour + 1}:00`
  );

  try {
    await processSpecificHour(date, hour, simpleAwsConfig);
    console.log(`✅ Successfully uploaded ${date} ${hour}:00-${hour + 1}:00`);
    console.log(
      `📦 S3 location: s3://${simpleAwsConfig.s3.bucket}/${
        simpleAwsConfig.outputDirectory
      }/${date}/${hour.toString().padStart(2, "0")}-${(hour + 1)
        .toString()
        .padStart(2, "0")}.json`
    );
  } catch (error) {
    console.error(`❌ Failed to upload ${date} ${hour}:00:`, error.message);
    throw error;
  }
}

// ==========================================
// 🏃‍♂️ MAIN SIMPLE TEST
// ==========================================

async function runSimpleAwsTest() {
  try {
    console.log("🌩️ Simple AWS S3 Upload Test");
    console.log("============================\n");

    // Step 1: Check AWS credentials
    const credentialsOk = await checkAwsCredentials();
    if (!credentialsOk) {
      return;
    }

    // Step 2: Initialize service and check connection
    console.log("\n🚀 Initializing AWS S3 connection...");
    await init(simpleAwsConfig);
    console.log("✅ AWS S3 connection successful");

    // Step 3: Fetch data from your collection
    const logs = await fetchDataFromCollection();

    if (logs.length === 0) {
      console.log("\n⚠️  No data found in collection. You can either:");
      console.log('1. Add some data to your "apilogs" collection');
      console.log("2. Change the collection name in this script");
      console.log("3. The script will still create a file with sample data");
    }

    // Step 4: Upload to S3
    await uploadToS3();

    console.log("\n🎉 Simple AWS Test Completed Successfully!");
    console.log("========================================");
    console.log("✅ AWS credentials validated");
    console.log("✅ Database connection working");
    console.log("✅ Data fetched from collection");
    console.log("✅ File uploaded to S3");
    console.log(`📦 Check your S3 bucket: ${simpleAwsConfig.s3.bucket}`);
    console.log(`📁 Directory: ${simpleAwsConfig.outputDirectory}/`);
  } catch (error) {
    console.error("\n❌ Simple AWS Test Failed");
    console.error("Error:", error.message);
    console.log("\n💡 Common Solutions:");
    console.log("1. Check .env file has correct AWS credentials");
    console.log("2. Verify S3 bucket exists and is accessible");
    console.log("3. Ensure MongoDB is running and accessible");
    console.log("4. Check network connectivity");
    process.exit(1);
  }
}

// ==========================================
// 📚 USAGE EXAMPLES
// ==========================================

async function runExamples() {
  console.log("\n📚 Usage Examples:");
  console.log("==================\n");

  try {
    await init(simpleAwsConfig);

    // Example 1: Upload yesterday's data
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    console.log("📝 Example 1: Upload yesterday's 9 AM hour");
    await uploadSpecificHour(yesterdayStr, 9);

    // Example 2: Upload today's morning hours
    const today = new Date().toISOString().split("T")[0];

    console.log("\n📝 Example 2: Upload today's morning hours (6-11 AM)");
    for (let hour = 6; hour <= 11; hour++) {
      try {
        await uploadSpecificHour(today, hour);
      } catch (error) {
        console.log(`⚠️  Hour ${hour} skipped: ${error.message}`);
      }
    }

    console.log("\n✅ Examples completed!");
  } catch (error) {
    console.error("❌ Examples failed:", error.message);
  }
}

// ==========================================
// 🎮 COMMAND LINE INTERFACE
// ==========================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log("🌩️ Simple AWS S3 Upload Test");
    console.log("");
    console.log("Usage:");
    console.log("  node simpleAwsTest.js                # Run basic test");
    console.log("  node simpleAwsTest.js --examples     # Run usage examples");
    console.log("  node simpleAwsTest.js --help         # Show this help");
    console.log("");
    console.log("Environment Variables Required:");
    console.log("  DB_URI                    # MongoDB connection string");
    console.log("  AWS_ACCESS_KEY_ID         # AWS access key");
    console.log("  AWS_SECRET_ACCESS_KEY     # AWS secret key");
    console.log("  S3_BUCKET                 # S3 bucket name");
    console.log(
      "  AWS_REGION                # AWS region (optional, defaults to us-east-1)"
    );
    process.exit(0);
  }

  if (args.includes("--examples")) {
    runExamples().catch(console.error);
  } else {
    runSimpleAwsTest().catch(console.error);
  }
}

module.exports = {
  simpleAwsConfig,
  runSimpleAwsTest,
  uploadSpecificHour,
  fetchDataFromCollection,
};
