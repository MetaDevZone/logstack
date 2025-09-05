const { stopAllLogStackJobs, emergencyStopLogStack } = require("./main.js");

async function quickTest() {
  try {
    console.log("🛑 Quick Cron Control Test...\n");

    // Test emergency stop
    console.log("1. Testing emergency stop...");
    const emergencyResult = await emergencyStopLogStack();
    console.log("Emergency Stop Result:", emergencyResult);
    console.log("");

    // Test normal stop
    console.log("2. Testing stop all jobs...");
    const stopResult = await stopAllLogStackJobs();
    console.log("Stop Result:", stopResult);
    console.log("");

    console.log("✅ Quick test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
quickTest();
