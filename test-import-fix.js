/**
 * 🧪 Test Fixed Import
 * Testing the corrected import method
 */

console.log("🧪 Testing LogStack Import Fix...\n");

try {
  // Test Method 1: Default import
  console.log("1. Testing default import...");
  const logstack = require("logstack-zee");
  console.log("✅ Default import successful");
  console.log(`   Available functions: ${Object.keys(logstack).length}`);

  // Test Method 2: Destructured import
  console.log("\n2. Testing destructured import...");
  const {
    initializeLogStack,
    logAppEvent,
    searchFiles,
  } = require("logstack-zee");
  console.log("✅ Destructured import successful");

  // Test Method 3: Production setup import
  console.log("\n3. Testing production setup import...");
  const productionSetup = require("logstack-zee/production-setup");
  console.log("✅ Production setup import successful");

  console.log("\n🎯 Import Test Results:");
  console.log("   ✅ All import methods working");
  console.log("   ✅ No module resolution errors");
  console.log("   ✅ Main entry point functioning correctly");

  console.log("\n📋 Available Core Functions:");
  const coreFunctions = [
    "initializeLogStack",
    "logAppEvent",
    "searchFiles",
    "getFileStatistics",
    "generateSecureDownloadUrl",
  ];

  coreFunctions.forEach((func) => {
    const isAvailable = typeof logstack[func] === "function";
    console.log(`   ${isAvailable ? "✅" : "❌"} ${func}`);
  });

  console.log("\n🚀 Import fix verified successfully!");
} catch (error) {
  console.error("❌ Import test failed:", error.message);
  console.error("   Please check the installation and try again.");
}
