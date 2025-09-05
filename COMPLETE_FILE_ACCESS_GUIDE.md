# 🎯 File Access, Search & Filter Complete Guide

## 📋 Overview

LogStack now provides **enterprise-grade file management** with the following capabilities:

### 🔐 **Secure File Access**

- **Pre-signed URLs** for secure downloads (no direct S3 access)
- **Access tokens** with user-specific permissions
- **180-day file access period** matching S3 retention
- **Audit logging** for all file operations

### 🔍 **Advanced Search & Filtering**

- **Date range filtering** (search files from specific dates)
- **Service filtering** (filter by service name)
- **File pattern matching** (regex-based filename search)
- **Size-based filtering** (min/max file size)
- **Extension filtering** (by file type: json, gz, log, etc.)
- **Content search** (search within file content)
- **Advanced sorting** (by date, size, name)
- **Pagination** for large result sets

### 📊 **Analytics & Statistics**

- **File statistics** (total files, sizes, date ranges)
- **Service distribution** (files per service)
- **Extension analysis** (file type breakdown)
- **Storage analytics** (largest files, average sizes)

---

## 🚀 Quick Start Examples

### 1. Basic File Search

```javascript
const { searchFiles } = require("./production-setup");

// Get recent files
const result = await searchFiles("user-id", {
  limit: 10,
  sortBy: "lastModified",
  sortOrder: "desc",
});

console.log(`Found ${result.totalCount} files`);
```

### 2. Advanced Filtering

```javascript
// Search with multiple filters
const result = await searchFiles("user-id", {
  dateRange: {
    from: "2025-09-01",
    to: "2025-09-04",
  },
  serviceFilter: "production",
  fileExtensions: ["json", "gz"],
  sizeRange: { min: 1024, max: 1048576 },
  limit: 20,
});
```

### 3. Content Search

```javascript
const { searchFileContent } = require("./production-setup");

// Search within file content
const result = await searchFileContent("user-id", {
  searchTerm: "error 500",
  fileTypes: ["json", "log"],
  limit: 10,
});
```

### 4. Get File Statistics

```javascript
const { getFileStatistics } = require("./production-setup");

const stats = await getFileStatistics("user-id");
console.log(`Total files: ${stats.statistics.totalFiles}`);
console.log(`Total size: ${stats.statistics.totalSizeFormatted}`);
```

---

## 🌐 API Endpoints

### **Search Endpoints**

```http
POST /api/files/search          # Advanced search with filters
GET  /api/files/quick-search    # Quick search with URL params
POST /api/files/search-content  # Search file content
GET  /api/files/statistics      # File statistics
GET  /api/files/details/{key}   # File details
```

### **Secure Access Endpoints**

```http
POST /api/files/generate-token  # Generate access token
POST /api/files/download-url    # Get secure download URL
GET  /api/files/list           # List accessible files
POST /api/files/revoke-token   # Revoke access token
```

---

## 🧪 Testing & Demo

### **Run Mock Demo** (No AWS needed)

```bash
node mock-file-search-demo.js
```

- Generates 500+ mock files
- Demonstrates all search features
- Shows filtering and analytics

### **Run Real Demo** (AWS required)

```bash
# Setup .env with AWS credentials first
node file-search-demo.js
```

- Tests with real S3 files
- Creates sample logs
- Full functionality test

### **Start API Server**

```bash
node file-search-test.js
```

- Starts test server on port 4000
- All endpoints available
- Mock authentication enabled

---

## 📊 Search Parameters Reference

| Parameter         | Type   | Description               | Example                    |
| ----------------- | ------ | ------------------------- | -------------------------- |
| `limit`           | number | Max results (1-1000)      | `50`                       |
| `offset`          | number | Skip results (pagination) | `100`                      |
| `sortBy`          | string | Sort field                | `"lastModified"`, `"size"` |
| `sortOrder`       | string | Sort direction            | `"asc"`, `"desc"`          |
| `dateRange.from`  | string | Start date                | `"2025-09-01"`             |
| `dateRange.to`    | string | End date                  | `"2025-09-04"`             |
| `serviceFilter`   | string | Service name              | `"production"`             |
| `fileNamePattern` | string | Regex pattern             | `"hour-.*\\.json"`         |
| `fileExtensions`  | array  | File types                | `["json", "gz"]`           |
| `sizeRange.min`   | number | Min size (bytes)          | `1024`                     |
| `sizeRange.max`   | number | Max size (bytes)          | `1048576`                  |

---

## 💡 Practical Use Cases

### **1. Error Investigation**

```javascript
// Find error logs from today
const errorLogs = await searchFiles(userId, {
  dateRange: {
    from: "2025-09-04",
    to: "2025-09-04",
  },
  serviceFilter: "production",
});

// Search error content
const errors = await searchFileContent(userId, {
  searchTerm: "error 500",
  fileTypes: ["json", "log"],
});
```

### **2. Performance Analysis**

```javascript
// Get large files for performance analysis
const largeLogs = await searchFiles(userId, {
  sizeRange: { min: 5242880 }, // > 5MB
  sortBy: "size",
  sortOrder: "desc",
  limit: 10,
});
```

### **3. Service Monitoring**

```javascript
// Monitor specific service logs
const apiLogs = await searchFiles(userId, {
  serviceFilter: "api",
  dateRange: {
    from: "2025-09-01",
    to: "2025-09-04",
  },
  sortBy: "lastModified",
});
```

### **4. Storage Analytics**

```javascript
// Get storage statistics
const stats = await getFileStatistics(userId);

console.log("Storage Overview:");
console.log(`- Total Files: ${stats.statistics.totalFiles}`);
console.log(`- Total Size: ${stats.statistics.totalSizeFormatted}`);
console.log(
  `- Services: ${Object.keys(stats.statistics.serviceCounts).length}`
);
```

---

## 🔧 Integration Examples

### **Express.js Integration**

```javascript
const express = require("express");
const { setupFileSearchAPI } = require("./file-search-api");
const { setupSecureFileAccess } = require("./secure-file-api");

const app = express();
app.use(express.json());

// Add authentication middleware
app.use("/api/files", requireAuth);

// Setup file APIs
setupSecureFileAccess(app);
setupFileSearchAPI(app, s3Config);

app.listen(3000);
```

### **React Frontend Example**

```javascript
// Search files with React
const [files, setFiles] = useState([]);
const [loading, setLoading] = useState(false);

const searchFiles = async (criteria) => {
  setLoading(true);
  try {
    const response = await fetch("/api/files/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(criteria),
    });

    const result = await response.json();
    setFiles(result.files);
  } catch (error) {
    console.error("Search failed:", error);
  } finally {
    setLoading(false);
  }
};
```

### **Node.js CLI Tool**

```javascript
#!/usr/bin/env node

const { searchFiles } = require("./production-setup");

async function searchCommand(query, options) {
  const result = await searchFiles("cli-user", {
    fileNamePattern: query,
    limit: options.limit || 10,
    sortBy: "lastModified",
  });

  console.log(`Found ${result.totalCount} files:`);
  result.files.forEach((file) => {
    console.log(`- ${file.fileName} (${file.sizeFormatted})`);
  });
}

// Usage: node search-cli.js "hour-.*" --limit 5
```

---

## 🔐 Security Features

### **Access Control**

- ✅ User-specific file permissions
- ✅ Token-based authentication
- ✅ Pre-signed URL expiration (1 hour default)
- ✅ Audit trail for all access

### **Data Protection**

- ✅ No direct S3 URLs exposed
- ✅ Encrypted data transmission
- ✅ Access token validation
- ✅ Rate limiting protection

### **File Security**

- ✅ 180-day access window
- ✅ Automatic cleanup of expired files
- ✅ Secure file downloads only
- ✅ Content type validation

---

## 📈 Performance Tips

### **Efficient Searching**

1. **Use date ranges** to reduce search scope
2. **Combine filters** for precise results
3. **Limit results** to reasonable numbers (≤ 100)
4. **Use pagination** for large datasets

### **Optimization Strategies**

1. **Cache statistics** for dashboards
2. **Use quick-search** for simple queries
3. **Index on lastModified** for date sorting
4. **Batch file operations** when possible

### **Content Search Best Practices**

1. **Be specific** with search terms
2. **Limit file types** being searched
3. **Use reasonable limits** (≤ 20 for content search)
4. **Consider file sizes** before content search

---

## 🚨 Error Handling

### **Common Error Codes**

- `INVALID_DATE_RANGE`: Date format issues
- `INVALID_FILE_PATTERN`: Malformed regex
- `ACCESS_DENIED`: Permission issues
- `SEARCH_LIMIT_EXCEEDED`: Too many results
- `FILE_NOT_FOUND`: Missing file
- `TOKEN_EXPIRED`: Access token expired

### **Error Response Format**

```json
{
  "success": false,
  "error": "Invalid date range format",
  "code": "INVALID_DATE_RANGE",
  "details": {
    "field": "dateRange.from",
    "value": "invalid-date",
    "expected": "YYYY-MM-DD"
  }
}
```

---

## 📝 Configuration

### **Environment Variables**

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket

# LogStack Configuration
LOGSTACK_DEBUG=true
DB_RETENTION_DAYS=14
S3_RETENTION_DAYS=180

# Security Configuration
JWT_SECRET=your-jwt-secret
ACCESS_TOKEN_EXPIRY=3600
RATE_LIMIT_REQUESTS=100
```

### **Production Setup**

```javascript
const config = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucketName: process.env.S3_BUCKET_NAME,
  },
  retention: {
    database: 14, // days
    s3: 180, // days
  },
  security: {
    tokenExpiry: 3600, // seconds
    maxSearchResults: 1000,
  },
};
```

---

## 🎯 Summary

LogStack now provides **complete file management** with:

✅ **Secure Access**: Pre-signed URLs, access tokens, 180-day retention  
✅ **Advanced Search**: Date, service, pattern, size, extension filtering  
✅ **Content Search**: Search within file content with context  
✅ **Analytics**: Comprehensive statistics and storage insights  
✅ **API Ready**: RESTful endpoints for all operations  
✅ **Production Ready**: Security, error handling, rate limiting

**Files ko access, search, aur filter karna ab bilkul aasan hai!** 🚀

### **Next Steps:**

1. **Setup AWS credentials** in `.env`
2. **Run demos** to see functionality
3. **Integrate APIs** in your application
4. **Start using** advanced search features

**Happy File Management! 📁✨**
