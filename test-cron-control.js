const {
  stopAllLogStackJobs,
  getCronJobStatus,
  emergencyStopLogStack,
  getActiveLogStackJobs,
  startLogStackJob,
} = require("./main.js");

async function testCronControl() {
  try {
    console.log("🔧 Testing LogStack Cron Control Functions...\n");

    // Test 1: Check initial status
    console.log("1. Checking initial cron job status...");
    const initialStatus = await getCronJobStatus();
    console.log("Initial Status:", initialStatus);
    console.log("");

    // Test 2: Start a test job
    console.log("2. Starting a test cron job...");
    const startResult = await startLogStackJob("*/2 * * * *", "Test Cron Job");
    console.log("Start Result:", startResult);
    console.log("");

    // Test 3: Check active jobs
    console.log("3. Checking active jobs...");
    const activeJobs = await getActiveLogStackJobs();
    console.log("Active Jobs:", activeJobs);
    console.log("");

    // Test 4: Check status after starting job
    console.log("4. Checking status after starting test job...");
    const statusAfterStart = await getCronJobStatus();
    console.log("Status After Start:", statusAfterStart);
    console.log("");

    // Wait a bit
    console.log("5. Waiting 3 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Test 5: Stop all jobs
    console.log("6. Stopping all LogStack jobs...");
    const stopResult = await stopAllLogStackJobs();
    console.log("Stop Result:", stopResult);
    console.log("");

    // Test 6: Check final status
    console.log("7. Checking final status...");
    const finalStatus = await getCronJobStatus();
    console.log("Final Status:", finalStatus);
    console.log("");

    console.log("✅ All cron control functions tested successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testCronControl();
