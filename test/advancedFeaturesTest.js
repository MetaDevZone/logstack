/**
 * 🧪 S3 Download and Database Features Test
 *
 * Tests for new S3 download and advanced database features
 */

const { LogStackAdvanced } = require("../lib/advancedFeatures");
const { init } = require("../dist/src/main");

// Test configuration
const testConfig = {
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/logstack_test",
  uploadProvider: "s3",
  outputDirectory: "test-logs",
  collections: {
    apiLogsCollectionName: "test_api_logs",
    jobsCollectionName: "test_jobs",
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET,
  },
};

async function testS3DownloadFeatures() {
  console.log("🧪 Testing S3 Download Features");
  console.log("═".repeat(40));

  try {
    // Initialize LogStack
    await init(testConfig);
    const advanced = new LogStackAdvanced(testConfig);

    // Test 1: List S3 files
    console.log("\n1️⃣ Testing S3 File Listing...");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const today = new Date();

    const dateStr1 = yesterday.toISOString().split("T")[0];
    const dateStr2 = today.toISOString().split("T")[0];

    const files = await advanced.listS3Files(dateStr1, dateStr2);
    console.log(`✅ Found ${files.length} files in S3`);

    if (files.length > 0) {
      console.log("📁 Sample files:");
      files.slice(0, 3).forEach((file) => {
        console.log(
          `   ${file.filename} (${(file.size / 1024).toFixed(1)} KB)`
        );
      });

      // Test 2: Download specific file
      console.log("\n2️⃣ Testing File Download...");
      const firstFile = files[0];
      const localPath = `./test_downloads/${firstFile.filename}`;

      const downloadResult = await advanced.downloadFromS3(
        firstFile.key,
        localPath
      );
      console.log(`✅ Downloaded: ${downloadResult.localPath}`);
      console.log(
        `📊 Records in file: ${
          downloadResult.content.data ? downloadResult.content.data.length : 0
        }`
      );

      // Test 3: Search in S3
      console.log("\n3️⃣ Testing S3 Search...");
      const searchResults = await advanced.searchS3(
        { method: "GET" },
        { startDate: dateStr1, endDate: dateStr2 }
      );
      console.log(`✅ Found ${searchResults.length} files with GET requests`);
    } else {
      console.log(
        "⚠️ No files found in S3 for testing. Upload some logs first."
      );
    }

    return true;
  } catch (error) {
    console.error("❌ S3 Download test failed:", error.message);
    return false;
  }
}

async function testDatabaseFeatures() {
  console.log("\n🧪 Testing Database Features");
  console.log("═".repeat(40));

  try {
    await init(testConfig);
    const advanced = new LogStackAdvanced(testConfig);

    // Test 1: Bulk insert sample logs
    console.log("\n1️⃣ Testing Bulk Insert...");
    const sampleLogs = [
      {
        method: "GET",
        path: "/api/test1",
        responseStatus: 200,
        request_time: new Date(),
        response_time: new Date(Date.now() + 100),
        client_ip: "127.0.0.1",
      },
      {
        method: "POST",
        path: "/api/test2",
        responseStatus: 201,
        request_time: new Date(),
        response_time: new Date(Date.now() + 200),
        client_ip: "127.0.0.1",
      },
      {
        method: "PUT",
        path: "/api/test3",
        responseStatus: 404,
        request_time: new Date(),
        response_time: new Date(Date.now() + 300),
        client_ip: "192.168.1.1",
      },
    ];

    const bulkResult = await advanced.bulkInsert(sampleLogs);
    console.log(
      `✅ Bulk insert: ${bulkResult.successful} success, ${bulkResult.failed} failed`
    );

    // Test 2: Advanced search
    console.log("\n2️⃣ Testing Advanced Search...");
    const searchResult = await advanced.advancedSearch({
      methods: ["GET", "POST"],
      statusCodes: [200, 201],
      groupBy: "method",
      limit: 100,
    });

    console.log(`✅ Advanced search found ${searchResult.total} logs`);
    if (searchResult.grouped) {
      console.log("📊 Grouped results:");
      Object.keys(searchResult.grouped).forEach((method) => {
        console.log(
          `   ${method}: ${searchResult.grouped[method].count} requests`
        );
      });
    }

    // Test 3: Analytics generation
    console.log("\n3️⃣ Testing Analytics Generation...");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const analytics = await advanced.generateAnalytics({
      start: yesterday.toISOString(),
      end: new Date().toISOString(),
    });

    console.log("✅ Analytics generated:");
    console.log(`   Total requests: ${analytics.summary.totalRequests}`);
    console.log(
      `   Top methods: ${Object.keys(analytics.methods).slice(0, 3).join(", ")}`
    );
    console.log(
      `   Avg response time: ${analytics.responseTimeStats.avg.toFixed(2)}ms`
    );

    return true;
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    return false;
  }
}

async function testS3DatabaseSync() {
  console.log("\n🧪 Testing S3 to Database Sync");
  console.log("═".repeat(40));

  try {
    await init(testConfig);
    const advanced = new LogStackAdvanced(testConfig);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const today = new Date();

    const dateStr1 = yesterday.toISOString().split("T")[0];
    const dateStr2 = today.toISOString().split("T")[0];

    console.log(`🔄 Syncing S3 logs from ${dateStr1} to ${dateStr2}`);

    const syncResult = await advanced.syncS3ToDb(dateStr1, dateStr2, {
      allowDuplicates: false,
    });

    console.log(
      `✅ Sync complete: ${syncResult.synced} synced, ${syncResult.errors} errors`
    );
    return true;
  } catch (error) {
    console.error("❌ S3 sync test failed:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 LogStack Advanced Features Test Suite");
  console.log("═".repeat(50));

  const results = [];

  // Test S3 features
  results.push(await testS3DownloadFeatures());

  // Test database features
  results.push(await testDatabaseFeatures());

  // Test sync features
  results.push(await testS3DatabaseSync());

  // Summary
  console.log("\n📊 Test Summary");
  console.log("═".repeat(20));

  const passed = results.filter((r) => r === true).length;
  const total = results.length;

  if (passed === total) {
    console.log("✅ All tests passed!");
  } else {
    console.log(`⚠️ ${passed}/${total} tests passed`);
  }

  console.log("\n🎯 Available Features:");
  console.log("✅ S3 file listing and download");
  console.log("✅ S3 search functionality");
  console.log("✅ Bulk database operations");
  console.log("✅ Advanced log search with grouping");
  console.log("✅ Analytics generation");
  console.log("✅ S3 to Database synchronization");
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testS3DownloadFeatures,
  testDatabaseFeatures,
  testS3DatabaseSync,
};
