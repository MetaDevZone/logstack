/**
 * 🧪 Dynamite Minute-by-Minute Cron Testing
 *
 * Usage:
 * 1. Start server: npm run dev
 * 2. Run this test: node test-minute-cron.js
 * 3. Watch console for S3 uploads every minute
 */

const axios = require("axios");

const API_BASE = "http://localhost:4000";
const API_KEY = "dynamite-dev-api-key-2025"; // From .env.development

// Test data
const testApiLog = {
  method: "GET",
  url: "/test/minute-cron",
  statusCode: 200,
  responseTime: 45,
  userAgent: "MinuteCronTest/1.0",
  ip: "192.168.1.100",
  userId: "test-user-123",
  requestBody: { test: "minute-cron" },
  responseBody: { success: true, timestamp: new Date().toISOString() },
};

const testAppLog = {
  level: "info",
  message: `Minute cron test at ${new Date().toISOString()}`,
  userId: "test-user-123",
  action: "minute-cron-test",
  metadata: {
    test: true,
    minute: new Date().getMinutes(),
    second: new Date().getSeconds(),
  },
};

async function addTestLogs() {
  try {
    console.log("🧪 Adding test logs...");

    // Add API log
    const apiResponse = await axios.post(
      `${API_BASE}/api/dynamite/logs/save`,
      testApiLog,
      { headers: { "X-API-Key": API_KEY } }
    );
    console.log("✅ API log added:", apiResponse.data);

    // Add App log
    const appResponse = await axios.post(
      `${API_BASE}/api/dynamite/logs/app`,
      testAppLog,
      { headers: { "X-API-Key": API_KEY } }
    );
    console.log("✅ App log added:", appResponse.data);
  } catch (error) {
    console.error("❌ Error adding logs:", error.message);
  }
}

async function manualRunHourlyJob() {
  try {
    console.log("🔄 Manually triggering hourly job...");

    const response = await axios.post(
      `${API_BASE}/admin/dynamite/run-hourly-job`,
      {},
      { headers: { "X-API-Key": API_KEY } }
    );

    console.log("✅ Manual hourly job response:", response.data);
  } catch (error) {
    console.error("❌ Error running manual job:", error.message);
  }
}

async function checkS3Structure() {
  try {
    console.log("📁 Expected S3 structure:");
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // 2025-09-05
    const hour = now.getHours();
    const nextHour = (hour + 1) % 24;

    console.log(`   Bucket: dynamite-lifestyle-dev-bucket`);
    console.log(
      `   Path: dynamite_logs/${dateStr}/hour-${hour
        .toString()
        .padStart(2, "0")}-${nextHour.toString().padStart(2, "0")}/`
    );
    console.log(
      `   File: ${hour.toString().padStart(2, "0")}-${nextHour
        .toString()
        .padStart(2, "0")}.json`
    );
  } catch (error) {
    console.error("❌ Error checking S3 structure:", error.message);
  }
}

async function startMinuteTest() {
  console.log("🚀 Starting minute-by-minute cron test...\n");

  // Add initial test logs
  await addTestLogs();

  // Check expected S3 structure
  await checkS3Structure();

  console.log("\n⏰ Test modes:");
  console.log("1. Automatic: Server will process logs every minute");
  console.log("2. Manual: Run manual job every 30 seconds");
  console.log("\nChoose your test mode:");
  console.log("- For automatic: Just wait and watch server console");
  console.log("- For manual: Run this script with --manual flag");

  if (process.argv.includes("--manual")) {
    console.log("\n🔄 Starting manual testing every 30 seconds...");

    // Run manual test every 30 seconds
    setInterval(async () => {
      console.log(`\n⏰ ${new Date().toISOString()}: Running manual test...`);
      await addTestLogs();
      await manualRunHourlyJob();
    }, 30000);
  } else if (process.argv.includes("--logs-only")) {
    console.log(
      "\n📝 Adding logs every 10 seconds for automatic processing..."
    );

    // Add logs every 10 seconds for automatic processing
    setInterval(async () => {
      console.log(`\n📝 ${new Date().toISOString()}: Adding test logs...`);
      await addTestLogs();
    }, 10000);
  } else {
    console.log("\n✅ Test setup complete!");
    console.log("\nUsage options:");
    console.log(
      "  node test-minute-cron.js --manual     # Manual testing every 30s"
    );
    console.log("  node test-minute-cron.js --logs-only  # Add logs every 10s");
    console.log("  node test-minute-cron.js              # One-time setup");
  }
}

// Handle script termination
process.on("SIGINT", () => {
  console.log("\n\n🛑 Test stopped by user");
  process.exit(0);
});

// Start the test
startMinuteTest();
