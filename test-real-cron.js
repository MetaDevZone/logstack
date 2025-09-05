const {
  initializeLogStack,
  stopAllLogStackJobs,
  getCronJobStatus,
  getActiveLogStackJobs,
} = require("./main.js");

async function testWithRealLogStack() {
  try {
    console.log("🚀 Testing with real LogStack initialization...\n");

    // Test 1: Initialize LogStack (this will start cron jobs)
    console.log("1. Initializing LogStack...");
    await initializeLogStack();
    console.log("✅ LogStack initialized successfully!\n");

    // Wait a moment for jobs to register
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 2: Check cron job status
    console.log("2. Checking cron job status after initialization...");
    const status = await getCronJobStatus();
    console.log("Cron Status:", status);
    console.log("");

    // Test 3: Check active jobs
    console.log("3. Checking active LogStack jobs...");
    const activeJobs = await getActiveLogStackJobs();
    console.log("Active Jobs:", activeJobs);
    console.log("");

    // Test 4: Stop all jobs
    console.log("4. Stopping all LogStack jobs...");
    const stopResult = await stopAllLogStackJobs();
    console.log("Stop Result:", stopResult);
    console.log("");

    // Test 5: Check final status
    console.log("5. Checking final status...");
    const finalStatus = await getCronJobStatus();
    console.log("Final Status:", finalStatus);
    console.log("");

    console.log("✅ Real LogStack cron control test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testWithRealLogStack();
