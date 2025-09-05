# ✅ LogStack Import Issue - RESOLVED!

## 🎯 Problem Fixed

**Previous Error:** `Cannot find module './dist/index'`

**Solution:** Updated package entry point and exports configuration.

---

## 🚀 New Installation & Usage (v1.0.7+)

### **1. Install Latest Version**

```bash
npm install logstack-zee@latest
```

### **2. ✅ Correct Import Methods**

#### **Method 1: Simple Import (Recommended)**

```javascript
// utils/logger_utils.js
const logstack = require("logstack-zee");

// OR with destructuring
const {
  initializeLogStack,
  logAppEvent,
  logError,
  searchFiles,
  getFileStatistics,
} = require("logstack-zee");

module.exports = {
  setupLogger: async () => {
    await logstack.initializeLogStack();
    console.log("✅ LogStack ready!");
  },
  logAppEvent: logstack.logAppEvent,
  logError: logstack.logError,
  searchFiles: logstack.searchFiles,
};
```

#### **Method 2: Production Setup Import**

```javascript
// For production configurations
const productionSetup = require("logstack-zee/production-setup");

await productionSetup.initializeLogStack();
await productionSetup.logAppEvent("info", "Test message");
```

#### **Method 3: File Search API Import**

```javascript
// For file search functionality
const fileSearchAPI = require("logstack-zee/file-search-api");
const secureFileAPI = require("logstack-zee/secure-file-api");

// Setup Express.js endpoints
fileSearchAPI.setupFileSearchAPI(app, s3Config);
secureFileAPI.setupSecureFileAccess(app);
```

---

## 📋 Complete Working Example

### **Setup Logger (utils/logger_utils.js)**

```javascript
const {
  initializeLogStack,
  logAppEvent,
  logError,
  logInfo,
  logWarning,
  searchFiles,
  getFileStatistics,
} = require("logstack-zee");

let isInitialized = false;

async function setupLogger() {
  if (isInitialized) return;

  try {
    await initializeLogStack();
    isInitialized = true;
    console.log("✅ LogStack initialized successfully");
  } catch (error) {
    console.error("❌ LogStack initialization failed:", error.message);
    throw error;
  }
}

module.exports = {
  setupLogger,
  logAppEvent: async (level, message, data) => {
    if (!isInitialized) await setupLogger();
    return logAppEvent(level, message, data);
  },
  logError: async (message, error, data) => {
    if (!isInitialized) await setupLogger();
    return logError(message, error, data);
  },
  logInfo: async (message, data) => {
    if (!isInitialized) await setupLogger();
    return logInfo(message, data);
  },
  logWarning: async (message, data) => {
    if (!isInitialized) await setupLogger();
    return logWarning(message, data);
  },
  searchFiles: async (userId, criteria) => {
    if (!isInitialized) await setupLogger();
    return searchFiles(userId, criteria);
  },
  getFileStatistics: async (userId) => {
    if (!isInitialized) await setupLogger();
    return getFileStatistics(userId);
  },
};
```

### **Use in Controller (controllers/app_api/logger_test.js)**

```javascript
const {
  logAppEvent,
  logError,
  searchFiles,
} = require("../../utils/logger_utils");

async function testLogging(req, res) {
  try {
    // Log the API request
    await logAppEvent("info", "API request received", {
      endpoint: req.path,
      method: req.method,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Test file search
    const files = await searchFiles("test-user", {
      limit: 5,
      sortBy: "lastModified",
    });

    res.json({
      success: true,
      message: "Logged successfully",
      filesFound: files.totalCount,
    });
  } catch (error) {
    await logError("API logging test failed", error, {
      endpoint: req.path,
      method: req.method,
    });

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function searchLogFiles(req, res) {
  try {
    const userId = req.user?.id || "default-user";
    const searchCriteria = req.body;

    const result = await searchFiles(userId, searchCriteria);

    res.json(result);
  } catch (error) {
    await logError("File search failed", error, {
      userId: req.user?.id,
      searchCriteria: req.body,
    });

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  testLogging,
  searchLogFiles,
};
```

### **App Initialization (app.js)**

```javascript
const express = require("express");
const { setupLogger } = require("./utils/logger_utils");

const app = express();
app.use(express.json());

// Initialize LogStack on startup
setupLogger()
  .then(() => console.log("🚀 App ready with LogStack"))
  .catch((err) => console.error("❌ App startup failed:", err));

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

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

module.exports = app;
```

---

## 🔧 Environment Setup

### **.env File**

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-log-bucket

# Database
DB_URI=mongodb://localhost:27017/yourapp_production

# LogStack Configuration
LOGSTACK_DEBUG=false
DB_RETENTION_DAYS=14
S3_RETENTION_DAYS=180
```

---

## 🧪 Testing Your Setup

### **Quick Test Script**

```javascript
// test-logstack.js
const {
  initializeLogStack,
  logAppEvent,
  searchFiles,
} = require("logstack-zee");

async function testLogStack() {
  try {
    console.log("🔧 Initializing LogStack...");
    await initializeLogStack();

    console.log("📝 Testing logging...");
    await logAppEvent("info", "Test log message", {
      test: true,
      timestamp: new Date(),
      source: "test-script",
    });

    console.log("🔍 Testing file search...");
    const files = await searchFiles("test-user", {
      limit: 5,
      sortBy: "lastModified",
    });

    console.log(`✅ Found ${files.totalCount} log files`);
    console.log("🎯 LogStack test completed successfully!");
  } catch (error) {
    console.error("❌ LogStack test failed:", error.message);
  }
}

testLogStack();
```

**Run test:**

```bash
node test-logstack.js
```

---

## 🌐 File Search & Filter Usage

### **Search Recent Files**

```javascript
const { searchFiles } = require("logstack-zee");

// Recent files
const recent = await searchFiles("user-id", {
  limit: 10,
  sortBy: "lastModified",
  sortOrder: "desc",
});

// Date range search
const dateRange = await searchFiles("user-id", {
  dateRange: {
    from: "2025-09-01",
    to: "2025-09-04",
  },
  serviceFilter: "production",
  fileExtensions: ["json", "gz"],
});

// Advanced filtering
const advanced = await searchFiles("user-id", {
  fileNamePattern: "hour-.*\\.json",
  sizeRange: { min: 1024, max: 1048576 },
  sortBy: "size",
  limit: 20,
});
```

### **File Statistics**

```javascript
const { getFileStatistics } = require("logstack-zee");

const stats = await getFileStatistics("user-id");
console.log(`Total files: ${stats.statistics.totalFiles}`);
console.log(`Total size: ${stats.statistics.totalSizeFormatted}`);
```

---

## 🚨 Troubleshooting

### **If you still get import errors:**

1. **Clear npm cache:**

   ```bash
   npm cache clean --force
   ```

2. **Remove and reinstall:**

   ```bash
   npm uninstall logstack-zee
   npm install logstack-zee@latest
   ```

3. **Check your import:**

   ```javascript
   // ✅ Correct
   const logstack = require("logstack-zee");

   // ❌ Wrong (old method)
   const logstack = require("logstack-zee/dist/index");
   ```

4. **Verify installation:**
   ```bash
   npm list logstack-zee
   ```

---

## 📞 Support

If you still face issues:

1. Check that you're using **logstack-zee v1.0.7 or higher**
2. Ensure your Node.js version is **v14.0.0 or higher**
3. Verify AWS credentials are properly set
4. Check that MongoDB is running (if using database features)

**Your LogStack package is now ready to use! 🚀**

**Key changes in v1.0.7:**

- ✅ Fixed main entry point to `main.js`
- ✅ Added proper exports configuration
- ✅ Simplified import methods
- ✅ No more `dist/index` import errors
- ✅ All features accessible through single import
