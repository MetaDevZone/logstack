/**
 * 🧪 Manual Minute-by-Minute Cron Test
 * This will manually trigger cron jobs every minute instead of relying on automatic cron
 */

const axios = require("axios");

const API_BASE = "http://localhost:4000";
const API_KEY = "dynamite-dev-api-key-2025";

let testCount = 0;

async function addTestLog() {
  testCount++;

  const testLog = {
    method: "GET",
    url: `/test-manual-cron/${testCount}`,
    statusCode: 200,
    responseTime: Math.floor(Math.random() * 100) + 20,
    userAgent: "ManualCronTest/1.0",
    ip: "192.168.1.100",
    userId: `test-user-${testCount}`,
    requestBody: { test: "manual-cron", count: testCount },
    responseBody: {
      success: true,
      timestamp: new Date().toISOString(),
      testNumber: testCount,
    },
  };

  try {
    const response = await axios.post(
      `${API_BASE}/api/dynamite/logs/save`,
      testLog,
      { headers: { "X-API-Key": API_KEY } }
    );

    console.log(`✅ Test log ${testCount} added:`, response.data);
    return true;
  } catch (error) {
    console.error(`❌ Error adding test log ${testCount}:`, error.message);
    return false;
  }
}

async function runManualHourlyJob() {
  try {
    console.log("🔄 Manually triggering hourly job...");

    const response = await axios.post(
      `${API_BASE}/admin/dynamite/run-hourly-job`,
      {},
      { headers: { "X-API-Key": API_KEY } }
    );

    console.log("✅ Manual hourly job completed:", response.data);

    // Check expected S3 path
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const hour = now.getHours();
    const nextHour = (hour + 1) % 24;

    console.log(
      `📁 Expected S3 path: dynamite_logs/${dateStr}/hour-${hour
        .toString()
        .padStart(2, "0")}-${nextHour.toString().padStart(2, "0")}/`
    );

    return true;
  } catch (error) {
    console.error("❌ Error running manual job:", error.message);
    return false;
  }
}

async function startManualTest() {
  console.log("🚀 Starting manual minute-by-minute test...");
  console.log(`⏰ Current time: ${new Date().toISOString()}`);
  console.log("🔄 Will add test log and run cron job every minute\n");

  // Initial test
  await addTestLog();
  await runManualHourlyJob();

  // Run every minute
  setInterval(async () => {
    const now = new Date();
    console.log(
      `\n⏰ ${now.toISOString()} - Running minute test #${testCount + 1}`
    );

    // Add a test log
    const logAdded = await addTestLog();

    if (logAdded) {
      // Wait 2 seconds then run manual job
      setTimeout(async () => {
        await runManualHourlyJob();
      }, 2000);
    }
  }, 60000); // Every 60 seconds (1 minute)

  console.log(
    "✅ Manual test started! Watch console for minute-by-minute processing..."
  );
  console.log("⏹️  Press Ctrl+C to stop");
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Manual test stopped by user");
  console.log(`📊 Total tests run: ${testCount}`);
  process.exit(0);
});

// Start the manual test
startManualTest();
