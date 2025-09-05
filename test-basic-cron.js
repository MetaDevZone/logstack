const {
  stopAllLogStackJobs,
  getCronJobStatus,
  startLogStackJob,
  getActiveLogStackJobs,
} = require("./main.js");

// Import cron directly to start some test jobs
const cron = require("node-cron");

async function testCronControlBasic() {
  try {
    console.log("🔧 Testing Cron Control Functions (Basic)...\n");

    // Start some test LogStack jobs manually
    console.log("1. Starting test LogStack jobs...");

    const job1 = cron.schedule(
      "*/5 * * * * *",
      () => {
        console.log("LogStack Daily Job executed");
      },
      { name: "LogStack Daily Job", scheduled: false }
    );

    const job2 = cron.schedule(
      "*/3 * * * * *",
      () => {
        console.log("LogStack Hourly Job executed");
      },
      { name: "LogStack Hourly Job", scheduled: false }
    );

    const job3 = cron.schedule(
      "*/2 * * * * *",
      () => {
        console.log("LogStack Cleanup Job executed");
      },
      { name: "LogStack Cleanup Job", scheduled: false }
    );

    // Start the jobs
    job1.start();
    job2.start();
    job3.start();

    console.log("✅ Test LogStack jobs started!\n");

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 2: Check cron job status
    console.log("2. Checking cron job status...");
    const status = await getCronJobStatus();
    console.log("Cron Status:", JSON.stringify(status, null, 2));
    console.log("");

    // Test 3: Check active jobs
    console.log("3. Checking active LogStack jobs...");
    const activeJobs = await getActiveLogStackJobs();
    console.log("Active Jobs:", JSON.stringify(activeJobs, null, 2));
    console.log("");

    // Wait to see some execution
    console.log("4. Waiting 7 seconds to see job execution...");
    await new Promise((resolve) => setTimeout(resolve, 7000));

    // Test 4: Stop all LogStack jobs
    console.log("\n5. Stopping all LogStack jobs...");
    const stopResult = await stopAllLogStackJobs();
    console.log("Stop Result:", JSON.stringify(stopResult, null, 2));
    console.log("");

    // Test 5: Check final status
    console.log("6. Checking final status...");
    const finalStatus = await getCronJobStatus();
    console.log("Final Status:", JSON.stringify(finalStatus, null, 2));
    console.log("");

    console.log("✅ Cron control test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  }
}

// Run the test
testCronControlBasic();
