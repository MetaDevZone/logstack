# 🔍 Files Pe Search Aur Filter Kaise Apply Hota Hai

## 📋 Complete Process Flow

```
🔐 User Request
      ↓
🔍 Search Parameters
      ↓
✅ User Permission Check
      ↓
📁 S3 Files List (All Accessible)
      ↓
🚀 Apply Filters Step by Step
      ↓
📊 Sort Results
      ↓
📄 Apply Pagination
      ↓
✅ Return Filtered Results
```

---

## 🎯 Step-by-Step Filtering Process

### **1. Initial Setup**

```javascript
// User ki request aati hai
const searchParams = {
  dateRange: { from: "2025-09-01", to: "2025-09-04" },
  serviceFilter: "production",
  fileExtensions: ["json", "gz"],
  sizeRange: { min: 1024, max: 1048576 },
  fileNamePattern: "hour-.*",
  sortBy: "size",
  sortOrder: "desc",
  limit: 10,
};
```

### **2. User Permissions Check**

```javascript
// Pehle user ke permissions check karte hain
const permissions = await getUserPermissions(userId);

// Check karte hain:
// - User ko kitne din purane files access kar sakte hain (180 days)
// - Kya user ke paas file read permission hai
// - Access token valid hai ya nahi
```

### **3. S3 Se All Files Fetch**

```javascript
// S3 bucket se saare accessible files list karte hain
let allFiles = await s3
  .listObjects({
    Bucket: "your-bucket",
    MaxKeys: 1000, // Initial fetch
  })
  .promise();

// Result:
// [
//   { key: 'production-logs/2025/09/04/hour-14-15.json', size: 2048576, lastModified: '2025-09-04T14:00:00Z' },
//   { key: 'api-logs/2025/09/04/hour-16-17.json', size: 1024000, lastModified: '2025-09-04T16:00:00Z' },
//   { key: 'database-logs/2025/09/03/hour-10-11.log', size: 512000, lastModified: '2025-09-03T10:00:00Z' }
// ]
```

### **4. Filter Application (Step by Step)**

#### **📅 Date Range Filter**

```javascript
// Date range filter apply karte hain
if (searchParams.dateRange) {
  allFiles = allFiles.filter((file) => {
    // File path se date extract karte hain: production-logs/2025/09/04/...
    const pathParts = file.key.split("/");
    const datePath = pathParts[1]; // "2025/09/04"
    const fileDate = new Date(datePath.replace(/\//g, "-")); // "2025-09-04"

    const fromDate = new Date(searchParams.dateRange.from);
    const toDate = new Date(searchParams.dateRange.to);

    return fileDate >= fromDate && fileDate <= toDate;
  });
}

// Result after date filter:
// Files from 2025-09-01 to 2025-09-04 only
```

#### **🏷️ Service Filter**

```javascript
// Service/folder filter apply karte hain
if (searchParams.serviceFilter) {
  allFiles = allFiles.filter((file) => {
    // File path se service name extract karte hain
    const pathParts = file.key.split("/");
    const serviceName = pathParts[0]; // "production-logs", "api-logs"

    return serviceName
      .toLowerCase()
      .includes(searchParams.serviceFilter.toLowerCase());
  });
}

// Result after service filter:
// Only "production-logs" files remain
```

#### **📄 File Extension Filter**

```javascript
// File extension filter apply karte hain
if (searchParams.fileExtensions.length > 0) {
  allFiles = allFiles.filter((file) => {
    const fileName = file.key.split("/").pop(); // "hour-14-15.json"
    const fileExtension = fileName.split(".").pop().toLowerCase(); // "json"

    return searchParams.fileExtensions.includes(fileExtension);
  });
}

// Result after extension filter:
// Only .json and .gz files remain
```

#### **📏 Size Filter**

```javascript
// File size filter apply karte hain
if (searchParams.sizeRange) {
  allFiles = allFiles.filter((file) => {
    const fileSize = file.size; // bytes

    if (searchParams.sizeRange.min && fileSize < searchParams.sizeRange.min)
      return false;
    if (searchParams.sizeRange.max && fileSize > searchParams.sizeRange.max)
      return false;

    return true;
  });
}

// Result after size filter:
// Only files between 1KB (1024 bytes) and 1MB (1048576 bytes)
```

#### **🔤 Filename Pattern Filter**

```javascript
// Regex pattern filter apply karte hain
if (searchParams.fileNamePattern) {
  allFiles = allFiles.filter((file) => {
    const fileName = file.key.split("/").pop(); // "hour-14-15.json"

    try {
      const regex = new RegExp(searchParams.fileNamePattern, "i"); // Case insensitive
      return regex.test(fileName);
    } catch (error) {
      // Agar regex invalid hai to simple string matching
      return fileName
        .toLowerCase()
        .includes(searchParams.fileNamePattern.toLowerCase());
    }
  });
}

// Result after pattern filter:
// Only files matching "hour-.*" pattern like "hour-14-15.json"
```

### **5. Sorting**

```javascript
// Results ko sort karte hain
allFiles = allFiles.sort((a, b) => {
  let comparison = 0;

  switch (searchParams.sortBy) {
    case "name":
      comparison = a.key.localeCompare(b.key);
      break;
    case "size":
      comparison = a.size - b.size;
      break;
    case "lastModified":
    default:
      comparison = new Date(a.lastModified) - new Date(b.lastModified);
      break;
  }

  // Descending order ke liye comparison reverse karte hain
  return searchParams.sortOrder === "desc" ? -comparison : comparison;
});

// Result: Files sorted by size (largest first)
```

### **6. Pagination**

```javascript
// Pagination apply karte hain
const totalCount = allFiles.length;
const offset = searchParams.offset || 0;
const limit = searchParams.limit || 100;

const paginatedFiles = allFiles.slice(offset, offset + limit);

// Result: Only 10 files returned (page 1)
```

### **7. Final Response**

```javascript
return {
  success: true,
  files: paginatedFiles.map((file) => ({
    key: file.key,
    fileName: file.key.split("/").pop(),
    size: file.size,
    sizeFormatted: formatBytes(file.size),
    lastModified: file.lastModified,
    service: file.key.split("/")[0].replace("-logs", ""),
    extension: file.key.split(".").pop(),
    folder: file.key.split("/").slice(0, -1).join("/"),
  })),
  totalCount,
  pagination: {
    limit,
    offset,
    hasMore: offset + limit < totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: Math.floor(offset / limit) + 1,
  },
  searchCriteria: {
    appliedFilters: Object.keys(searchParams).filter(
      (key) => searchParams[key]
    ),
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
  },
};
```

---

## 🌐 API Call Example

### **Request**

```javascript
// Frontend se API call
fetch("/api/files/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-access-token",
  },
  body: JSON.stringify({
    dateRange: {
      from: "2025-09-01",
      to: "2025-09-04",
    },
    serviceFilter: "production",
    fileExtensions: ["json"],
    sizeRange: {
      min: 1024,
      max: 1048576,
    },
    sortBy: "lastModified",
    sortOrder: "desc",
    limit: 10,
    offset: 0,
  }),
});
```

### **Response**

```javascript
{
  "success": true,
  "files": [
    {
      "key": "production-logs/2025/09/04/hour-14-15.json",
      "fileName": "hour-14-15.json",
      "size": 524288,
      "sizeFormatted": "512 KB",
      "lastModified": "2025-09-04T15:00:00.000Z",
      "service": "production",
      "extension": "json",
      "folder": "production-logs/2025/09/04"
    }
  ],
  "totalCount": 25,
  "pagination": {
    "limit": 10,
    "offset": 0,
    "hasMore": true,
    "totalPages": 3,
    "currentPage": 1
  },
  "searchCriteria": {
    "appliedFilters": ["dateRange", "serviceFilter", "fileExtensions", "sizeRange"],
    "sortBy": "lastModified",
    "sortOrder": "desc"
  }
}
```

---

## 🎯 Real-World Examples

### **1. Error Investigation**

```javascript
// Aaj ke error logs dhundho
const errorSearch = {
  dateRange: {
    from: "2025-09-04",
    to: "2025-09-04",
  },
  serviceFilter: "production",
  fileNamePattern: ".*error.*",
  sortBy: "lastModified",
  limit: 20,
};
```

### **2. Performance Analysis**

```javascript
// Bade files dhundho (performance issues ke liye)
const performanceSearch = {
  sizeRange: {
    min: 5242880, // 5MB se bade files
  },
  sortBy: "size",
  sortOrder: "desc",
  limit: 10,
};
```

### **3. Service Monitoring**

```javascript
// Specific service ke recent logs
const serviceMonitoring = {
  serviceFilter: "api",
  dateRange: {
    from: "2025-09-01",
    to: "2025-09-04",
  },
  sortBy: "lastModified",
  limit: 50,
};
```

### **4. Content Search**

```javascript
// File content mein "error 500" dhundho
const contentSearch = {
  searchTerm: "error 500",
  fileTypes: ["json", "log"],
  limit: 10,
};

// Ye alag API hai jo file content download kar ke search karta hai
```

---

## 🚀 Performance Optimization

### **Filter Order (Important!)**

```
1. Date Range Filter    (Fastest - path-based)
2. Service Filter       (Fast - path-based)
3. Extension Filter     (Fast - filename-based)
4. Size Filter          (Medium - metadata-based)
5. Pattern Filter       (Slower - regex/string matching)
6. Content Search       (Slowest - requires file download)
```

### **Best Practices**

1. **Pehle restrictive filters lagao** (date range, service)
2. **Limit ko reasonable rakho** (≤ 100 files)
3. **Pagination use karo** large datasets ke liye
4. **Cache statistics** dashboard ke liye

---

## 🔐 Security Implementation

### **Permission Check Process**

```javascript
// Har request pe ye check hota hai
const permissions = {
  accessLevel: "read", // read, write, admin
  dateRestriction: true, // 180 days limit
  dayLimit: 180, // Maximum days back
  allowedServices: ["production", "api"], // Service access
  rateLimit: 100, // Requests per hour
};

// File access check
if (fileDate < cutoffDate) {
  throw new Error("File access expired (180 days limit)");
}
```

**Search aur filter ka ye complete process hai! Files ko efficiently find karne ke liye ye saare steps automatically apply hote hain.** 🎯
