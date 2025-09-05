/**
 * 🔄 LogStack Flexible Usage Examples
 *
 * Shows different ways to use LogStack:
 * 1. Store in LogStack DB + Process
 * 2. Only Process (no storage in LogStack)
 * 3. Process from your existing collection
 * 4. Real-time processing
 */

const {
  initializeLogStack,
  logAppEvent,
  processExternalLogs,
  processFromYourCollection,
  processRealTimeData,
  scheduleBatchProcessing,
} = require("./production-setup");

// Initialize LogStack first
async function setup() {
  await initializeLogStack();
  console.log("✅ LogStack ready for flexible usage!");
}

// ==========================================
// OPTION 1: Store in LogStack + Process
// ==========================================

async function example1_StoreAndProcess() {
  console.log("\n📦 Example 1: Store in LogStack Database + Process");
  console.log("=".repeat(50));

  // This will be stored in LogStack database and also uploaded to S3
  await logAppEvent("info", "User registration", {
    service: "auth-service",
    userId: "user123",
    email: "user@example.com",
    registrationMethod: "email",
  });

  console.log("✅ Log stored in LogStack database (production_api_logs)");
  console.log("✅ Will be uploaded to S3 in next hourly cron");
  console.log("✅ Will be deleted from DB after 14 days");
  console.log("✅ Will be deleted from S3 after 180 days");
}

// ==========================================
// OPTION 2: Only Process (No LogStack Storage)
// ==========================================

async function example2_OnlyProcess() {
  console.log("\n⚡ Example 2: Only Process (No LogStack Storage)");
  console.log("=".repeat(50));

  // Your existing data
  const myData = [
    {
      userId: "user123",
      action: "login",
      timestamp: new Date(),
      ip: "192.168.1.100",
    },
    {
      userId: "user456",
      action: "purchase",
      amount: 100,
      product: "Premium Plan",
      timestamp: new Date(),
    },
    {
      userId: "user789",
      action: "logout",
      sessionDuration: 1800,
      timestamp: new Date(),
    },
  ];

  // Only process, don't store in LogStack database
  const result = await processExternalLogs(myData, {
    skipDatabase: true, // Don't store in LogStack DB
    uploadToS3: true, // Upload to S3
    compression: true, // GZIP compression
    customFolder: "user-actions", // Custom S3 folder
  });

  console.log("✅ External data processed:", result);
  console.log("❌ NOT stored in LogStack database");
  console.log("✅ Uploaded to S3 with compression");
  console.log(`📁 S3 Path: ${result.fileName}`);
}

// ==========================================
// OPTION 3: Process From Your Collection
// ==========================================

async function example3_ProcessYourCollection() {
  console.log("\n🗃️ Example 3: Process From Your Existing Collection");
  console.log("=".repeat(60));

  // Process data from your existing MongoDB collection
  const result = await processFromYourCollection(
    "mongodb://localhost:27017/your_existing_app", // Your database
    "user_activities", // Your collection name
    {
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    {
      skipDatabase: false, // Also store in LogStack
      uploadToS3: true, // Also upload to S3
      customFolder: "migrated-user-activities",
    }
  );

  console.log("✅ Your collection processed:", result);
  console.log(`📊 Total records: ${result.processed}`);
  console.log(`💾 Stored in LogStack: ${result.storedInDatabase}`);
  console.log(`☁️ Uploaded to S3: ${result.uploadedToS3}`);
}

// ==========================================
// OPTION 4: Real-time Processing
// ==========================================

async function example4_RealTimeProcessing() {
  console.log("\n⚡ Example 4: Real-time Data Processing");
  console.log("=".repeat(50));

  // Real-time incoming data
  const incomingData = {
    eventType: "payment_completed",
    userId: "user999",
    amount: 50.0,
    currency: "USD",
    paymentMethod: "credit_card",
    timestamp: new Date(),
    metadata: {
      orderId: "order_123",
      productId: "prod_456",
    },
  };

  // Process immediately
  const result = await processRealTimeData(incomingData, {
    skipDatabase: false, // Store in LogStack
    uploadToS3: true, // Upload to S3
    folder: "realtime-payments",
  });

  console.log("✅ Real-time data processed:", result);
  console.log("⚡ Processed immediately");
  console.log("💾 Stored in LogStack database");
  console.log("☁️ Uploaded to S3");
}

// ==========================================
// OPTION 5: Scheduled Batch Processing
// ==========================================

async function example5_ScheduledBatchProcessing() {
  console.log("\n⏰ Example 5: Scheduled Batch Processing");
  console.log("=".repeat(50));

  // Schedule automatic processing from your collection
  const scheduleResult = await scheduleBatchProcessing({
    mongoUri: "mongodb://localhost:27017/your_app",
    collectionName: "audit_logs",
    batchSize: 1000,
    query: { processed: false }, // Only unprocessed records
    schedule: "0 */6 * * *", // Every 6 hours
    processOptions: {
      skipDatabase: false,
      uploadToS3: true,
      customFolder: "scheduled-audit-logs",
    },
  });

  console.log("✅ Batch processing scheduled:", scheduleResult);
  console.log("⏰ Will run every 6 hours automatically");
  console.log("📊 Will process 1000 records at a time");
  console.log("🔄 Only processes unprocessed records");
}

// ==========================================
// EXPRESS.JS ENDPOINTS EXAMPLE
// ==========================================

function createExpressEndpoints(app) {
  console.log("\n🌐 Creating Express.js Endpoints for All Options");
  console.log("=".repeat(55));

  // Endpoint 1: Store in LogStack + Process
  app.post("/api/logstack/store-and-process", async (req, res) => {
    try {
      await logAppEvent(
        req.body.level || "info",
        req.body.message,
        req.body.metadata
      );
      res.json({
        success: true,
        message: "Stored in LogStack DB and will be uploaded to S3",
        storage: "logstack-database",
        processing: "automatic",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint 2: Only Process (No LogStack Storage)
  app.post("/api/logstack/only-process", async (req, res) => {
    try {
      const result = await processExternalLogs([req.body], {
        skipDatabase: true,
        uploadToS3: true,
        customFolder: "api-only-process",
      });
      res.json({
        success: true,
        result,
        storage: "none",
        processing: "immediate-s3-upload",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint 3: Process From Collection
  app.post("/api/logstack/process-collection", async (req, res) => {
    try {
      const { mongoUri, collectionName, query } = req.body;
      const result = await processFromYourCollection(
        mongoUri,
        collectionName,
        query
      );
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint 4: Real-time Processing
  app.post("/api/logstack/realtime", async (req, res) => {
    try {
      const result = await processRealTimeData(req.body, {
        skipDatabase: req.body.skipDatabase || false,
        uploadToS3: true,
        folder: "realtime-api",
      });
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  console.log("✅ Endpoints created:");
  console.log("   POST /api/logstack/store-and-process");
  console.log("   POST /api/logstack/only-process");
  console.log("   POST /api/logstack/process-collection");
  console.log("   POST /api/logstack/realtime");
}

// ==========================================
// RUN ALL EXAMPLES
// ==========================================

async function runAllExamples() {
  try {
    await setup();

    await example1_StoreAndProcess();
    await example2_OnlyProcess();
    await example3_ProcessYourCollection();
    await example4_RealTimeProcessing();
    await example5_ScheduledBatchProcessing();

    console.log("\n🎉 All examples completed successfully!");
    console.log("\n💡 Usage Summary:");
    console.log("   Option 1: Full LogStack storage + processing");
    console.log("   Option 2: Only S3 upload, no LogStack storage");
    console.log("   Option 3: Process existing collections");
    console.log("   Option 4: Real-time immediate processing");
    console.log("   Option 5: Scheduled automatic processing");
  } catch (error) {
    console.error("❌ Examples failed:", error);
  }
}

// Export for use in Express app
module.exports = {
  setup,
  example1_StoreAndProcess,
  example2_OnlyProcess,
  example3_ProcessYourCollection,
  example4_RealTimeProcessing,
  example5_ScheduledBatchProcessing,
  createExpressEndpoints,
  runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
