# 🚀 LogStack Separate Instance Setup Guide

## 📋 Aapki Requirements:

✅ Alag instance per project live karna  
✅ Main project se endpoint ke through logs save karna  
✅ Background processing automatically chalta rahe  
✅ Endpoint se logs get karna (DB + S3)  
✅ Files search aur filter karna

## 🎯 LogStack Ye Sab Kar Sakta Hai!

---

## 📝 Step-by-Step Setup

### **Step 1: Separate Instance Setup**

```bash
# Alag server/instance per LogStack install karo
npm install logstack-zee

# Project folder banao
mkdir my-log-server
cd my-log-server
npm init -y
npm install logstack-zee express cors dotenv
```

### **Step 2: Environment Configuration (.env)**

```env
# Database
DB_URI=mongodb://localhost:27017/my_logs_db

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-logs-bucket
AWS_REGION=us-east-1

# Server
PORT=4000
API_KEY=secure-api-key-123
```

### **Step 3: Simple Log Server (server.js)**

```javascript
const express = require("express");
const cors = require("cors");
const {
  initializeLogStack,
  saveApiLog,
  saveLog,
  getApiLogs,
  getLogs,
  searchFiles,
  getSecureFileUrl,
} = require("logstack-zee");

const app = express();
app.use(cors());
app.use(express.json());

// LogStack initialize karo (background processing start hogi)
initializeLogStack().then(() => {
  console.log("✅ LogStack initialized - Background processing started");
});

// 📥 SAVE ENDPOINTS - Main project se yahan send karo

// API logs save karo
app.post("/api/logs/save", async (req, res) => {
  try {
    const result = await saveApiLog({
      method: req.body.method,
      path: req.body.path,
      responseStatus: req.body.status,
      request_time: new Date(req.body.request_time),
      response_time: new Date(req.body.response_time),
      client_ip: req.body.client_ip,
      requestHeaders: req.body.headers,
      requestBody: req.body.request_body,
      responseTime: req.body.response_time_ms,
    });

    res.json({ success: true, id: result._id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// App logs save karo
app.post("/api/logs/app", async (req, res) => {
  try {
    const result = await saveLog({
      level: req.body.level,
      message: req.body.message,
      service: req.body.service,
      metadata: req.body.metadata,
    });

    res.json({ success: true, id: result._id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📤 GET ENDPOINTS - Logs retrieve karo

// API logs get karo
app.get("/api/logs/api", async (req, res) => {
  try {
    const { startDate, endDate, method, status, limit } = req.query;

    const logs = await getApiLogs({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      method,
      responseStatus: status,
      limit: parseInt(limit) || 100,
    });

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// App logs get karo
app.get("/api/logs/app", async (req, res) => {
  try {
    const { startDate, endDate, level, service, limit } = req.query;

    const logs = await getLogs({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      level,
      service,
      limit: parseInt(limit) || 100,
    });

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔍 S3 FILES SEARCH & FILTER

// S3 files search karo
app.get("/api/files/search", async (req, res) => {
  try {
    const { startDate, endDate, fileName, minSize, maxSize, fileType, folder } =
      req.query;

    const files = await searchFiles("admin", {
      dateRange:
        startDate && endDate
          ? {
              start: new Date(startDate),
              end: new Date(endDate),
            }
          : undefined,
      fileName,
      sizeRange:
        minSize && maxSize
          ? {
              min: parseInt(minSize),
              max: parseInt(maxSize),
            }
          : undefined,
      fileType,
      folder,
    });

    res.json({ success: true, ...files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// S3 file download URL generate karo
app.get("/api/files/download/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;

    const result = await getSecureFileUrl(fileName, "admin");

    if (result.success) {
      res.json({
        success: true,
        downloadUrl: result.downloadUrl,
        expiration: result.expiration,
      });
    } else {
      res.status(404).json({ success: false, error: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Server start karo
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Log Server running on port ${PORT}`);
  console.log(`📡 API endpoints ready:`);
  console.log(`   POST /api/logs/save - Save API logs`);
  console.log(`   POST /api/logs/app - Save app logs`);
  console.log(`   GET /api/logs/api - Get API logs`);
  console.log(`   GET /api/logs/app - Get app logs`);
  console.log(`   GET /api/files/search - Search S3 files`);
  console.log(`   GET /api/files/download/:fileName - Download file`);
});
```

### **Step 4: Main Project Integration**

**Main project mein ye function banao:**

```javascript
const axios = require("axios");

const LOG_SERVER_URL = "http://your-log-instance:4000";

// API log send karo
async function sendApiLog(logData) {
  try {
    await axios.post(`${LOG_SERVER_URL}/api/logs/save`, logData);
  } catch (error) {
    console.error("Failed to send API log:", error.message);
  }
}

// App log send karo
async function sendAppLog(level, message, metadata = {}) {
  try {
    await axios.post(`${LOG_SERVER_URL}/api/logs/app`, {
      level,
      message,
      service: "main-app",
      metadata,
    });
  } catch (error) {
    console.error("Failed to send app log:", error.message);
  }
}

// Express middleware example
app.use((req, res, next) => {
  const startTime = new Date();

  res.on("finish", () => {
    sendApiLog({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      request_time: startTime,
      response_time: new Date(),
      client_ip: req.ip,
      headers: req.headers,
      request_body: req.body,
      response_time_ms: Date.now() - startTime.getTime(),
    });
  });

  next();
});
```

### **Step 5: Logs Retrieve Karo**

```javascript
// API logs get karo
async function getApiLogs(filters = {}) {
  try {
    const response = await axios.get(`${LOG_SERVER_URL}/api/logs/api`, {
      params: filters,
    });
    return response.data.logs;
  } catch (error) {
    console.error("Failed to get API logs:", error.message);
    return [];
  }
}

// S3 files search karo
async function searchLogFiles(searchCriteria = {}) {
  try {
    const response = await axios.get(`${LOG_SERVER_URL}/api/files/search`, {
      params: searchCriteria,
    });
    return response.data.files;
  } catch (error) {
    console.error("Failed to search files:", error.message);
    return [];
  }
}

// Usage examples
const apiLogs = await getApiLogs({
  startDate: "2025-09-01",
  endDate: "2025-09-04",
  method: "POST",
  limit: 50,
});

const files = await searchLogFiles({
  startDate: "2025-09-01",
  endDate: "2025-09-04",
  fileType: "json",
});
```

---

## 🎯 **Complete Workflow:**

1. **Separate instance** per LogStack server chalao
2. **Background processing** automatically start hogi
3. **Main project** se logs send karo endpoints per
4. **Database + S3** mein automatically store hoga
5. **API endpoints** se logs retrieve karo
6. **S3 files** search aur filter karo
7. **Download URLs** generate karo files ke liye

## ✅ **Ye Sab Features Available Hain:**

- ✅ Real-time log saving
- ✅ Automatic background processing
- ✅ Database + S3 storage
- ✅ Advanced search & filtering
- ✅ File download with security
- ✅ Date range filtering
- ✅ Service-wise separation
- ✅ Automatic cleanup & retention

## 🚀 **Start Karo:**

```bash
# Log server start karo
node server.js

# Main project se logs send karo
# Retrieve karo jab chahiye
```

**Ye setup aapki saari requirements ko fulfill karta hai!** 🎉

Koi aur question ho ya modification chahiye to batao!
