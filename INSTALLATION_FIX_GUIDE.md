# 🔧 LogStack Installation & Usage Fix Guide

## 🚨 Issue Resolution

**Error:** `Cannot find module './dist/index'`

**Solution:** Use proper import methods as shown below.

---

## ✅ Correct Usage Methods

### **Method 1: Simple Import (Recommended)**

```javascript
// Single line import - gets everything
const logstack = require("logstack-zee");

// Usage
await logstack.initializeLogStack();
await logstack.logAppEvent("info", "Test message", { test: true });

// File search
const files = await logstack.searchFiles("user-id", {
  limit: 10,
  sortBy: "lastModified",
});
```

### **Method 2: Destructured Import**

```javascript
// Import specific functions
const {
  initializeLogStack,
  logAppEvent,
  searchFiles,
  getFileStatistics,
} = require("logstack-zee");

// Usage
await initializeLogStack();
await logAppEvent("info", "Test message");
```

### **Method 3: Production Setup Import**

```javascript
// Import production configuration
const productionSetup = require("logstack-zee/production-setup");

// Usage
await productionSetup.initializeLogStack();
await productionSetup.logAppEvent("info", "Test message");
```

---

## 🚫 Wrong Import Methods (Don't Use)

```javascript
// ❌ Wrong - This causes the error
const logstack = require("logstack-zee/dist/index");

// ❌ Wrong - Internal path
const logstack = require("logstack-zee/dist/src/main");

// ❌ Wrong - Missing extension
const logstack = require("logstack-zee/main");
```

---

## 📦 After Installation

### **1. Install Package**

```bash
npm install logstack-zee
```

### **2. Setup Environment**

```bash
# Create .env file
echo "AWS_ACCESS_KEY_ID=your_access_key" > .env
echo "AWS_SECRET_ACCESS_KEY=your_secret_key" >> .env
echo "AWS_REGION=us-east-1" >> .env
echo "S3_BUCKET_NAME=your-bucket-name" >> .env
echo "DB_URI=mongodb://localhost:27017/yourapp" >> .env
```

### **3. Basic Implementation**

```javascript
// utils/logger_utils.js
const {
  initializeLogStack,
  logAppEvent,
  logError,
  logInfo,
  logWarning,
} = require("logstack-zee");

// Initialize once in your app
async function setupLogger() {
  try {
    await initializeLogStack();
    console.log("✅ LogStack initialized successfully");
  } catch (error) {
    console.error("❌ LogStack initialization failed:", error);
  }
}

// Export logging functions
module.exports = {
  setupLogger,
  logAppEvent,
  logError,
  logInfo,
  logWarning,
};
```

### **4. Use in Controllers**

```javascript
// controllers/app_api/logger_test.js
const { logAppEvent, logError } = require("../../utils/logger_utils");

async function testLogging(req, res) {
  try {
    // Log API request
    await logAppEvent("info", "API request received", {
      endpoint: req.path,
      method: req.method,
      userId: req.user?.id,
    });

    res.json({ success: true, message: "Logged successfully" });
  } catch (error) {
    await logError("API logging failed", error, {
      endpoint: req.path,
      method: req.method,
    });

    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { testLogging };
```

---

## 🔍 File Search Usage

### **Search Files**

```javascript
const { searchFiles, getFileStatistics } = require("logstack-zee");

// Search recent files
const recentFiles = await searchFiles("user-id", {
  limit: 10,
  sortBy: "lastModified",
  sortOrder: "desc",
});

// Search with filters
const filteredFiles = await searchFiles("user-id", {
  dateRange: {
    from: "2025-09-01",
    to: "2025-09-04",
  },
  serviceFilter: "production",
  fileExtensions: ["json", "gz"],
  limit: 20,
});

// Get statistics
const stats = await getFileStatistics("user-id");
console.log(`Total files: ${stats.statistics.totalFiles}`);
```

---

## 🌐 Express.js Integration

### **Complete Express Setup**

```javascript
// app.js
const express = require("express");
const { setupLogger } = require("./utils/logger_utils");

const app = express();

// Initialize LogStack on app startup
setupLogger().catch(console.error);

// Middleware
app.use(express.json());

// Routes
app.use("/api", require("./routes/app_api"));

// Error handling middleware
app.use((error, req, res, next) => {
  const { logError } = require("./utils/logger_utils");

  logError("Express error", error, {
    url: req.url,
    method: req.method,
    ip: req.ip,
  }).catch(console.error);

  res.status(500).json({ success: false, error: "Internal server error" });
});

module.exports = app;
```

---

## 🔐 Security & File Access

### **Setup File Access API**

```javascript
// routes/files.js
const express = require("express");
const {
  searchFiles,
  getFileDetails,
  generateSecureDownloadUrl,
} = require("logstack-zee");

const router = express.Router();

// Search files endpoint
router.post("/search", async (req, res) => {
  try {
    const userId = req.user.id; // From authentication middleware
    const result = await searchFiles(userId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get secure download URL
router.get("/download/:fileKey", async (req, res) => {
  try {
    const userId = req.user.id;
    const { fileKey } = req.params;

    const downloadUrl = await generateSecureDownloadUrl(userId, fileKey);
    res.json({ downloadUrl, expiresIn: 3600 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

---

## 🧪 Testing

### **Test Your Setup**

```javascript
// test/logger.test.js
const {
  initializeLogStack,
  logAppEvent,
  searchFiles,
} = require("logstack-zee");

async function testLogStack() {
  try {
    // Initialize
    console.log("🔧 Initializing LogStack...");
    await initializeLogStack();

    // Test logging
    console.log("📝 Testing logging...");
    await logAppEvent("info", "Test log message", {
      test: true,
      timestamp: new Date(),
    });

    // Test file search
    console.log("🔍 Testing file search...");
    const files = await searchFiles("test-user", { limit: 5 });
    console.log(`Found ${files.totalCount} files`);

    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testLogStack();
```

---

## 📋 Troubleshooting

### **Common Issues & Solutions**

1. **Module not found error**

   ```javascript
   // ❌ Wrong
   require("logstack-zee/dist/index");

   // ✅ Correct
   require("logstack-zee");
   ```

2. **AWS credentials missing**

   ```bash
   # Add to .env file
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-bucket
   ```

3. **Database connection issues**

   ```javascript
   // Check MongoDB connection
   DB_URI=mongodb://localhost:27017/yourapp
   ```

4. **File permission errors**
   ```javascript
   // Ensure user has proper access tokens
   const token = await createAccessToken("user-id", {
     accessLevel: "read",
     expiresIn: 3600,
   });
   ```

---

## 🎯 Quick Reference

### **All Available Functions**

```javascript
const {
  // Core functions
  initializeLogStack,
  logAppEvent,
  logError,
  logInfo,
  logWarning,
  logDebug,

  // File operations
  searchFiles,
  getFileDetails,
  searchFileContent,
  getFileStatistics,

  // Security
  generateSecureDownloadUrl,
  createAccessToken,
  revokeAccessToken,

  // S3 operations
  uploadToS3,
  downloadFromS3,
  listS3Files,

  // Statistics
  getLogStatistics,
  getRecentLogs,

  // Configuration
  productionConfig,
} = require("logstack-zee");
```

**Now your LogStack import should work perfectly! 🚀**
