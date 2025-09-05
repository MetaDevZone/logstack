# 🔗 LogStack Package Link Setup Guide

## ✅ Step 1: Package Linked Successfully

You've already run `npm link` in the LogStack directory, which means the package is now globally linked.

## 🚀 Step 2: Use in Another Project

### **Method 1: Link in Existing Project**

Navigate to your test project directory and run:

```bash
cd /path/to/your/test-project
npm link logstack
```

### **Method 2: Create New Test Project**

```bash
# Create a new test project
mkdir logstack-test
cd logstack-test
npm init -y

# Link the logstack package
npm link logstack

# Install other dependencies if needed
npm install express mongoose
```

## 📝 Step 3: Test the Package

### **Create test file: `test-logstack.js`**

```javascript
const { init, createDailyJobs, saveApiLog } = require("logstack");

async function testLogStack() {
  console.log("🧪 Testing LogStack package...");

  const config = {
    dbUri: "mongodb://localhost:27017/logstack-test",
    uploadProvider: "local",
    outputDirectory: "./test-logs",
    retention: {
      dbRetentionDays: 7,
      fileRetentionDays: 30,
    },
    dataMasking: {
      enabled: true,
      maskPasswords: true,
      maskEmails: false,
    },
  };

  try {
    // Initialize LogStack
    await init(config);
    console.log("✅ LogStack initialized successfully");

    // Test saving a log
    await saveApiLog({
      method: "GET",
      path: "/api/test",
      statusCode: 200,
      responseTime: 123,
      timestamp: new Date(),
      clientIP: "127.0.0.1",
      userAgent: "Test Agent",
    });
    console.log("✅ Test log saved successfully");

    // Create daily jobs
    await createDailyJobs();
    console.log("✅ Daily jobs created successfully");

    console.log("🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testLogStack();
```

### **Run the test:**

```bash
node test-logstack.js
```

## 🔧 Step 4: Express.js Integration Test

### **Create `express-test.js`:**

```javascript
const express = require("express");
const { init, saveApiLog } = require("logstack");

const app = express();
app.use(express.json());

// Initialize LogStack
async function setupLogStack() {
  await init({
    dbUri: "mongodb://localhost:27017/express-test",
    uploadProvider: "local",
    outputDirectory: "./express-logs",
  });
  console.log("✅ LogStack ready for Express");
}

// Logging middleware
app.use(async (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", async () => {
    try {
      await saveApiLog({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        clientIP: req.ip,
        userAgent: req.get("User-Agent"),
      });
    } catch (error) {
      console.error("Logging error:", error);
    }
  });

  next();
});

// Test routes
app.get("/api/test", (req, res) => {
  res.json({ message: "LogStack test successful!", timestamp: new Date() });
});

app.post("/api/data", (req, res) => {
  res.json({ received: req.body, processed: true });
});

// Start server
const PORT = 3001;
setupLogStack().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Test server running on http://localhost:${PORT}`);
    console.log("📊 LogStack logging active");
    console.log("\n🧪 Test endpoints:");
    console.log(`   GET  http://localhost:${PORT}/api/test`);
    console.log(`   POST http://localhost:${PORT}/api/data`);
  });
});
```

### **Run Express test:**

```bash
node express-test.js
```

## 📁 Step 5: File Structure Check

After running tests, your test project should look like:

```
your-test-project/
├── package.json
├── test-logstack.js
├── express-test.js
├── test-logs/          # LogStack output directory
│   └── logs_2025-09-03/
└── node_modules/
    └── logstack -> [linked to your dev package]
```

## 🔄 Step 6: Making Changes & Testing

When you make changes to your LogStack package:

1. **Build the changes:**

```bash
cd /path/to/logstack
npm run build
```

2. **Test immediately** (no need to re-link):

```bash
cd /path/to/your-test-project
node test-logstack.js
```

## 🧪 Step 7: Advanced Testing

### **Test with Different Configurations:**

```javascript
// test-configurations.js
const { init } = require("logstack");

const configs = [
  {
    name: "Local Storage",
    config: {
      dbUri: "mongodb://localhost:27017/test-local",
      uploadProvider: "local",
      outputDirectory: "./logs-local",
    },
  },
  {
    name: "S3 Storage",
    config: {
      dbUri: "mongodb://localhost:27017/test-s3",
      uploadProvider: "s3",
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: "us-east-1",
        bucket: "test-logs-bucket",
      },
    },
  },
];

async function testConfigurations() {
  for (const test of configs) {
    console.log(`\n🧪 Testing: ${test.name}`);
    try {
      await init(test.config);
      console.log(`✅ ${test.name} - Success`);
    } catch (error) {
      console.error(`❌ ${test.name} - Failed:`, error.message);
    }
  }
}

testConfigurations();
```

## 🎯 Quick Commands Summary

```bash
# In your LogStack development directory:
npm link                    # Already done ✅

# In your test project:
npm link logstack          # Link the package
node test-logstack.js      # Run basic test
node express-test.js       # Run Express integration test

# When making changes to LogStack:
cd /path/to/logstack
npm run build              # Build changes
cd /path/to/test-project
node test-logstack.js      # Test immediately
```

## 🔓 Step 8: Unlink When Done

When you're finished testing:

```bash
# In test project:
npm unlink logstack

# In LogStack directory:
npm unlink
```

## 🎉 You're Ready!

Your LogStack package is now linked and ready for testing in any project. The linked package will automatically reflect any changes you make to the source code (after building). Happy testing! 🚀
