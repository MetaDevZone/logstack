# 🔍 File Search & Filter Guide

Complete guide for using advanced file search and filtering capabilities in LogStack.

## 📝 Overview

LogStack now provides comprehensive file search and filtering functionality that allows you to:

- Search files by date ranges, service names, filename patterns
- Filter by file size, extensions, and content
- Sort results by various criteria
- Get detailed file statistics and analytics
- Access files securely with proper authentication

## 🚀 Quick Start

### 1. Basic Setup

```javascript
const {
  initializeLogStack,
  initializeS3Security,
  initializeFileSearch,
  searchFiles,
  getFileStatistics,
} = require("./production-setup");

// Initialize components
await initializeLogStack();
initializeS3Security();
initializeFileSearch();
```

### 2. Simple File Search

```javascript
const userId = "your-user-id";

// Basic search - get recent files
const result = await searchFiles(userId, {
  limit: 10,
  sortBy: "lastModified",
  sortOrder: "desc",
});

console.log(`Found ${result.totalCount} files`);
result.files.forEach((file) => {
  console.log(`- ${file.fileName} (${file.sizeFormatted})`);
});
```

## 🔧 Advanced Search Features

### Date Range Filtering

```javascript
// Search files from specific date range
const result = await searchFiles(userId, {
  dateRange: {
    from: "2025-09-01",
    to: "2025-09-04",
  },
  limit: 20,
});
```

### Service and Pattern Filtering

```javascript
// Search by service name and filename pattern
const result = await searchFiles(userId, {
  serviceFilter: "production", // Service name
  fileNamePattern: "hour-.*\\.json", // Regex pattern
  limit: 15,
});
```

### File Size and Extension Filtering

```javascript
// Filter by file size and extensions
const result = await searchFiles(userId, {
  sizeRange: {
    min: 1024, // Minimum 1KB
    max: 1048576, // Maximum 1MB
  },
  fileExtensions: ["json", "gz", "log"],
  sortBy: "size",
  sortOrder: "desc",
});
```

### Content Search

```javascript
// Search within file content
const result = await searchFileContent(userId, {
  searchTerm: "error 500",
  fileTypes: ["json", "log"],
  limit: 10,
});

result.matches.forEach((match) => {
  console.log(`Found in: ${match.fileName}`);
  console.log(`Context: ${match.context}`);
});
```

## 🌐 API Endpoints

### 1. Advanced Search

```http
POST /api/files/search
Content-Type: application/json

{
  "dateRange": {
    "from": "2025-09-01",
    "to": "2025-09-04"
  },
  "serviceFilter": "production",
  "fileNamePattern": "hour-.*\\.json",
  "sizeRange": {
    "min": 1024,
    "max": 1048576
  },
  "fileExtensions": ["json", "gz"],
  "sortBy": "lastModified",
  "sortOrder": "desc",
  "limit": 50,
  "offset": 0
}
```

### 2. Quick Search

```http
GET /api/files/quick-search?q=hour-14&date=2025-09-04&ext=json&limit=10
GET /api/files/quick-search?service=production&size=1024-1048576
```

### 3. Content Search

```http
POST /api/files/search-content
Content-Type: application/json

{
  "searchTerm": "error 500",
  "fileTypes": ["json", "log"],
  "limit": 20
}
```

### 4. File Details

```http
GET /api/files/details/production-logs/2025/09/04/hour-14-15.json.gz
```

### 5. Statistics

```http
GET /api/files/statistics
GET /api/files/statistics?folder=production-logs
```

## 📊 Search Parameters Reference

### Core Search Options

| Parameter   | Type   | Description                 | Example                                  |
| ----------- | ------ | --------------------------- | ---------------------------------------- |
| `limit`     | number | Maximum results (1-1000)    | `50`                                     |
| `offset`    | number | Skip results for pagination | `100`                                    |
| `sortBy`    | string | Sort field                  | `"lastModified"`, `"size"`, `"fileName"` |
| `sortOrder` | string | Sort direction              | `"asc"`, `"desc"`                        |

### Date Filtering

| Parameter        | Type   | Description             | Example        |
| ---------------- | ------ | ----------------------- | -------------- |
| `dateRange.from` | string | Start date (YYYY-MM-DD) | `"2025-09-01"` |
| `dateRange.to`   | string | End date (YYYY-MM-DD)   | `"2025-09-04"` |

### Content Filtering

| Parameter         | Type   | Description                | Example                 |
| ----------------- | ------ | -------------------------- | ----------------------- |
| `serviceFilter`   | string | Filter by service name     | `"production"`          |
| `fileNamePattern` | string | Regex pattern for filename | `"hour-.*\\.json"`      |
| `fileExtensions`  | array  | Allowed file extensions    | `["json", "gz", "log"]` |

### Size Filtering

| Parameter       | Type   | Description               | Example   |
| --------------- | ------ | ------------------------- | --------- |
| `sizeRange.min` | number | Minimum file size (bytes) | `1024`    |
| `sizeRange.max` | number | Maximum file size (bytes) | `1048576` |

## 🧪 Testing & Examples

### Running Test Server

```bash
node file-search-test.js
```

This starts a test server on port 4000 with all endpoints and demo data.

### Example cURL Commands

```bash
# Quick search for today's JSON files
curl "http://localhost:4000/api/files/quick-search?q=hour&date=2025-09-04&ext=json&limit=5"

# Advanced search with multiple filters
curl -X POST http://localhost:4000/api/files/search \
  -H "Content-Type: application/json" \
  -d '{
    "fileExtensions": ["json"],
    "limit": 10,
    "sortBy": "lastModified",
    "sortOrder": "desc"
  }'

# Get file statistics
curl "http://localhost:4000/api/files/statistics"

# Search file content
curl -X POST http://localhost:4000/api/files/search-content \
  -H "Content-Type: application/json" \
  -d '{
    "searchTerm": "error",
    "fileTypes": ["json", "log"]
  }'
```

### JavaScript Testing Examples

```javascript
const { testHelpers } = require("./file-search-test");

// Test basic search
await testHelpers.testBasicSearch();

// Test filtered search
await testHelpers.testFilteredSearch();

// Test statistics
await testHelpers.testStatistics();
```

## 📈 Response Format

### Search Results

```json
{
  "success": true,
  "files": [
    {
      "key": "production-logs/2025/09/04/hour-14-15.json.gz",
      "fileName": "hour-14-15.json.gz",
      "size": 2048576,
      "sizeFormatted": "2.0 MB",
      "lastModified": "2025-09-04T15:00:00.000Z",
      "service": "production",
      "extension": "gz",
      "folder": "production-logs/2025/09/04"
    }
  ],
  "totalCount": 156,
  "searchCriteria": {
    "appliedFilters": ["dateRange", "extension"],
    "sortBy": "lastModified",
    "sortOrder": "desc"
  },
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Statistics Response

```json
{
  "success": true,
  "statistics": {
    "totalFiles": 1250,
    "totalSize": 104857600,
    "totalSizeFormatted": "100.0 MB",
    "extensionCounts": {
      "json": 800,
      "gz": 300,
      "log": 150
    },
    "serviceCounts": {
      "production": 900,
      "staging": 250,
      "development": 100
    },
    "dateRange": {
      "earliest": "2025-08-01T00:00:00.000Z",
      "latest": "2025-09-04T23:59:59.999Z"
    },
    "averageFileSize": 83886,
    "largestFile": {
      "fileName": "hour-23-24.json.gz",
      "size": 5242880,
      "sizeFormatted": "5.0 MB"
    }
  }
}
```

## 🔐 Security & Authentication

All file search operations require proper authentication. The system:

- Validates user access tokens
- Enforces user-specific file access permissions
- Uses pre-signed URLs for secure file downloads
- Maintains audit logs of file access

### Authentication Headers

```http
Authorization: Bearer your-access-token
```

## 🎯 Best Practices

### 1. Efficient Searching

- Use specific date ranges to reduce search scope
- Combine multiple filters for precise results
- Use pagination for large result sets
- Cache statistics for dashboard displays

### 2. Performance Tips

- Limit results to reasonable numbers (≤ 100)
- Use file extension filters when possible
- Sort by indexed fields (lastModified, size)
- Use quick-search for simple queries

### 3. Content Search Guidelines

- Be specific with search terms
- Limit content search to necessary file types
- Use reasonable limits for content searches
- Consider file size when searching content

## 🚨 Error Handling

Common error responses:

```json
{
  "success": false,
  "error": "Invalid date range format",
  "code": "INVALID_DATE_RANGE"
}
```

Error codes:

- `INVALID_DATE_RANGE`: Date format or range issues
- `INVALID_FILE_PATTERN`: Malformed regex pattern
- `ACCESS_DENIED`: User lacks file access permission
- `SEARCH_LIMIT_EXCEEDED`: Too many results requested
- `FILE_NOT_FOUND`: Requested file doesn't exist

## 📝 Support & Troubleshooting

### Common Issues

1. **No files found**: Check date ranges and service filters
2. **Search timeout**: Reduce search scope or add more filters
3. **Access denied**: Verify user permissions and authentication
4. **Invalid patterns**: Test regex patterns before using

### Debug Mode

Enable debug logging:

```javascript
process.env.LOGSTACK_DEBUG = "true";
```

This will provide detailed information about search queries and performance metrics.
