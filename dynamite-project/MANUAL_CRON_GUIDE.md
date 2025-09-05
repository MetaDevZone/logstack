# 🚀 Manual Hourly Cron Job Triggers - Postman Guide

## 📡 New Admin Endpoints for Manual Job Execution

### 1. **Current Hour Job**

**Trigger hourly job for the current hour**

```http
POST http://localhost:4000/admin/dynamite/run-hourly-job
Headers:
  Content-Type: application/json
  X-API-Key: dynamite-dev-api-key-2025

Body: (empty)
```

**Response:**

```json
{
  "success": true,
  "environment": "dynamite-lifestyle-dev",
  "message": "Hourly job completed for 2025-09-04 15-16",
  "date": "2025-09-04",
  "hour_range": "15-16",
  "result": {
    /* job execution details */
  },
  "triggered_at": "2025-09-04T12:30:00.000Z"
}
```

---

### 2. **Specific Hour Job**

**Trigger hourly job for specific date and hour**

```http
POST http://localhost:4000/admin/dynamite/run-specific-hour
Headers:
  Content-Type: application/json
  X-API-Key: dynamite-dev-api-key-2025

Body:
{
  "date": "2025-09-04",
  "hour": "15"
}
```

**Response:**

```json
{
  "success": true,
  "environment": "dynamite-lifestyle-dev",
  "message": "Hourly job completed for 2025-09-04 15-16",
  "date": "2025-09-04",
  "hour_range": "15-16",
  "result": {
    /* job execution details */
  },
  "triggered_at": "2025-09-04T12:30:00.000Z"
}
```

---

### 3. **Process All Pending Logs**

**Process all pending hourly logs at once**

```http
POST http://localhost:4000/admin/dynamite/process-hourly-logs
Headers:
  Content-Type: application/json
  X-API-Key: dynamite-dev-api-key-2025

Body: (empty)
```

**Response:**

```json
{
  "success": true,
  "environment": "dynamite-lifestyle-dev",
  "message": "All hourly logs processed",
  "result": {
    /* processing details */
  },
  "triggered_at": "2025-09-04T12:30:00.000Z"
}
```

---

## 📋 Postman Collection JSON

Copy and import this into Postman:

```json
{
  "info": {
    "name": "Dynamite Hourly Jobs",
    "description": "Manual triggers for hourly cron jobs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "apikey",
    "apikey": [
      {
        "key": "key",
        "value": "X-API-Key",
        "type": "string"
      },
      {
        "key": "value",
        "value": "dynamite-dev-api-key-2025",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Run Current Hour Job",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:4000/admin/dynamite/run-hourly-job",
          "protocol": "http",
          "host": ["localhost"],
          "port": "4000",
          "path": ["admin", "dynamite", "run-hourly-job"]
        }
      }
    },
    {
      "name": "Run Specific Hour Job",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"date\": \"2025-09-04\",\n  \"hour\": \"15\"\n}"
        },
        "url": {
          "raw": "http://localhost:4000/admin/dynamite/run-specific-hour",
          "protocol": "http",
          "host": ["localhost"],
          "port": "4000",
          "path": ["admin", "dynamite", "run-specific-hour"]
        }
      }
    },
    {
      "name": "Process All Hourly Logs",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:4000/admin/dynamite/process-hourly-logs",
          "protocol": "http",
          "host": ["localhost"],
          "port": "4000",
          "path": ["admin", "dynamite", "process-hourly-logs"]
        }
      }
    }
  ]
}
```

---

## 🎯 Usage Examples

### **Scenario 1: Test Current Hour Processing**

```bash
# Postman: POST http://localhost:4000/admin/dynamite/run-hourly-job
# This will process logs for the current hour (e.g., 15-16 if it's 3 PM)
```

### **Scenario 2: Reprocess Yesterday's 2 PM Hour**

```bash
# Postman: POST http://localhost:4000/admin/dynamite/run-specific-hour
# Body: { "date": "2025-09-03", "hour": "14" }
```

### **Scenario 3: Process All Pending Jobs**

```bash
# Postman: POST http://localhost:4000/admin/dynamite/process-hourly-logs
# This will process all pending hourly jobs in the queue
```

---

## 🔑 Authentication

**All admin endpoints require API key in header:**

```
X-API-Key: dynamite-dev-api-key-2025
```

## 📊 What These Jobs Do

1. **Collect logs** from your MongoDB database
2. **Process and aggregate** them into hourly files
3. **Upload to S3** bucket (if configured)
4. **Update job status** in the database
5. **Generate analytics** and statistics

## ⚠️ Important Notes

- Jobs can be run multiple times safely (idempotent)
- Each job processes one specific hour range (e.g., 15-16)
- Files are uploaded to S3 with timestamp naming
- Check server logs for detailed execution output
- Use development API key for local testing

Your server needs to be running for these endpoints to work! 🚀
