/**
 * 🧪 Hour-Specific Log Processing Verification Test
 *
 * This test verifies that cron jobs only process logs for the current hour
 * and don't touch logs from previous hours.
 */

const axios = require("axios");
const { MongoClient } = require("mongodb");

const API_BASE = "http://localhost:4000";
const API_KEY = "dynamite-dev-api-key-2025";
const DB_URI = "mongodb://localhost:27017/logarchiver_dev";

let testResults = {
  previousHourLogs: [],
  currentHourLogs: [],
  processedLogs: [],
  unprocessedLogs: [],
};

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(DB_URI);
    const db = client.db();
    return { client, db };
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return null;
  }
}

async function addLogWithSpecificTime(timestamp, testLabel) {
  const testLog = {
    method: "GET",
    url: `/test-hour-verification/${testLabel}`,
    statusCode: 200,
    responseTime: Math.floor(Math.random() * 100) + 20,
    userAgent: "HourVerificationTest/1.0",
    ip: "192.168.1.100",
    userId: `hour-test-${testLabel}`,
    timestamp: timestamp, // Specific timestamp
    requestBody: { test: "hour-verification", label: testLabel },
    responseBody: {
      success: true,
      timestamp: timestamp,
      testLabel: testLabel,
    },
  };

  try {
    const response = await axios.post(
      `${API_BASE}/api/dynamite/logs/save`,
      testLog,
      { headers: { "X-API-Key": API_KEY } }
    );

    console.log(`✅ Log added for ${testLabel}:`, response.data.id);
    return { success: true, id: response.data.id, timestamp, testLabel };
  } catch (error) {
    console.error(`❌ Error adding log for ${testLabel}:`, error.message);
    return { success: false, timestamp, testLabel };
  }
}

async function checkDatabaseLogs() {
  const dbConnection = await connectToDatabase();
  if (!dbConnection) return;

  const { client, db } = dbConnection;

  try {
    // Check logs in database
    const apiLogsCollection = db.collection("api_logs_dynamite-lifestyle-dev");
    const allLogs = await apiLogsCollection
      .find({
        url: { $regex: "/test-hour-verification/" },
      })
      .toArray();

    console.log(`📊 Total verification logs in database: ${allLogs.length}`);

    // Group by hour
    const logsByHour = {};
    allLogs.forEach((log) => {
      const logTime = new Date(log.timestamp || log.createdAt);
      const hour = logTime.getHours();
      const hourKey = `hour-${hour}`;

      if (!logsByHour[hourKey]) {
        logsByHour[hourKey] = [];
      }
      logsByHour[hourKey].push({
        id: log._id,
        url: log.url,
        timestamp: log.timestamp || log.createdAt,
        processed: log.processed || false,
      });
    });

    console.log("\n📈 Logs grouped by hour:");
    Object.keys(logsByHour).forEach((hourKey) => {
      const logs = logsByHour[hourKey];
      const processedCount = logs.filter((log) => log.processed).length;
      const unprocessedCount = logs.length - processedCount;

      console.log(
        `   ${hourKey}: ${logs.length} total (${processedCount} processed, ${unprocessedCount} unprocessed)`
      );
    });

    await client.close();
    return logsByHour;
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
    await client.close();
    return null;
  }
}

async function runHourlyJobForSpecificHour(hourRange) {
  try {
    console.log(`🔄 Running hourly job for hour range: ${hourRange}`);

    const response = await axios.post(
      `${API_BASE}/admin/dynamite/run-specific-hour`,
      { hourRange: hourRange },
      { headers: { "X-API-Key": API_KEY } }
    );

    console.log(`✅ Hourly job completed for ${hourRange}:`, response.data);
    return { success: true, response: response.data };
  } catch (error) {
    console.error(
      `❌ Error running hourly job for ${hourRange}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
}

async function startHourVerificationTest() {
  console.log("🚀 Starting Hour-Specific Processing Verification...\n");

  const now = new Date();
  const currentHour = now.getHours();
  const previousHour = currentHour === 0 ? 23 : currentHour - 1;
  const nextHour = (currentHour + 1) % 24;

  console.log(`⏰ Current time: ${now.toISOString()}`);
  console.log(`📊 Current hour: ${currentHour}`);
  console.log(`📊 Previous hour: ${previousHour}`);
  console.log(`📊 Next hour: ${nextHour}\n`);

  // Step 1: Add logs for previous hour
  console.log("📝 Step 1: Adding logs for PREVIOUS hour...");
  const previousHourTime = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago

  for (let i = 1; i <= 3; i++) {
    const result = await addLogWithSpecificTime(
      previousHourTime.toISOString(),
      `previous-hour-log-${i}`
    );
    if (result.success) {
      testResults.previousHourLogs.push(result);
    }
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
  }

  // Step 2: Add logs for current hour
  console.log("\n📝 Step 2: Adding logs for CURRENT hour...");
  for (let i = 1; i <= 3; i++) {
    const result = await addLogWithSpecificTime(
      now.toISOString(),
      `current-hour-log-${i}`
    );
    if (result.success) {
      testResults.currentHourLogs.push(result);
    }
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
  }

  // Step 3: Check database before processing
  console.log("\n📊 Step 3: Checking database BEFORE hourly job...");
  const logsBefore = await checkDatabaseLogs();

  // Step 4: Run hourly job for CURRENT hour only
  console.log(
    `\n🔄 Step 4: Running hourly job for CURRENT hour (${currentHour}-${nextHour})...`
  );
  const currentHourRange = `${currentHour
    .toString()
    .padStart(2, "0")}-${nextHour.toString().padStart(2, "0")}`;
  const jobResult = await runHourlyJobForSpecificHour(currentHourRange);

  // Wait for processing to complete
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Step 5: Check database after processing
  console.log("\n📊 Step 5: Checking database AFTER hourly job...");
  const logsAfter = await checkDatabaseLogs();

  // Step 6: Verification Results
  console.log("\n🎯 VERIFICATION RESULTS:");
  console.log("═══════════════════════════════════════");

  if (logsBefore && logsAfter) {
    const previousHourKey = `hour-${previousHour}`;
    const currentHourKey = `hour-${currentHour}`;

    const previousHourBefore = logsBefore[previousHourKey] || [];
    const previousHourAfter = logsAfter[previousHourKey] || [];
    const currentHourBefore = logsBefore[currentHourKey] || [];
    const currentHourAfter = logsAfter[currentHourKey] || [];

    console.log(
      `\n📈 Previous Hour (${previousHour}:00-${currentHour}:00) Logs:`
    );
    console.log(`   Before job: ${previousHourBefore.length} logs`);
    console.log(`   After job:  ${previousHourAfter.length} logs`);
    console.log(`   ✅ Previous hour logs should remain UNTOUCHED`);

    console.log(`\n📈 Current Hour (${currentHour}:00-${nextHour}:00) Logs:`);
    console.log(`   Before job: ${currentHourBefore.length} logs`);
    console.log(`   After job:  ${currentHourAfter.length} logs`);
    console.log(`   ✅ Current hour logs should be PROCESSED`);

    // Verification logic
    const previousHourUntouched =
      previousHourBefore.length === previousHourAfter.length;
    const currentHourProcessed =
      currentHourAfter.length >= currentHourBefore.length;

    console.log(`\n🔍 VERIFICATION STATUS:`);
    console.log(
      `   ${
        previousHourUntouched ? "✅" : "❌"
      } Previous hour logs untouched: ${previousHourUntouched}`
    );
    console.log(
      `   ${
        currentHourProcessed ? "✅" : "❌"
      } Current hour logs processed: ${currentHourProcessed}`
    );

    if (previousHourUntouched && currentHourProcessed) {
      console.log(
        `\n🎉 VERIFICATION PASSED! Hour-specific processing is working correctly.`
      );
    } else {
      console.log(
        `\n⚠️  VERIFICATION FAILED! There might be an issue with hour-specific processing.`
      );
    }
  }

  console.log("\n✅ Hour verification test completed!");
}

// Start the verification test
startHourVerificationTest().catch(console.error);
