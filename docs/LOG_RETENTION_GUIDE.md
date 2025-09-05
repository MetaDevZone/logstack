# 🗑️ Log Retention Configuration Guide

## 📋 Overview

The logstack package includes comprehensive log retention management to automatically clean up old database records and cloud storage files. This helps with:

- **💰 Cost Management** - Reduce storage costs by removing old files
- **🔒 Compliance** - Meet data retention requirements
- **⚡ Performance** - Keep databases lean and fast
- **🧹 Maintenance** - Automated cleanup without manual intervention

---

## ⚙️ Configuration Options

### 🗃️ Database Retention

Automatically clean up old database records:

```javascript
const config = {
  // ... other config
  retention: {
    database: {
      apiLogs: 14, // Keep API logs for 14 days
      jobs: 90, // Keep job records for 90 days
      logs: 60, // Keep processing logs for 60 days
      autoCleanup: true, // Enable automatic cleanup
      cleanupCron: "0 2 * * *", // Run at 2 AM daily (optional)
    },
  },
};
```

### ☁️ Storage Retention

Automatically clean up old uploaded files:

```javascript
const config = {
  // ... other config
  retention: {
    storage: {
      files: 180, // Keep files for 180 days
      autoCleanup: true, // Enable automatic cleanup
      cleanupCron: "0 3 * * *", // Run at 3 AM daily (optional)
    },
  },
};
```

### 🌩️ AWS S3 Lifecycle Policies

Automatically transition files to cheaper storage and delete old files:

```javascript
const config = {
  // ... other config
  retention: {
    storage: {
      files: 2555, // 7 years (compliance requirement)
      autoCleanup: false, // Let S3 lifecycle handle deletion

      // S3 Lifecycle configuration
      s3Lifecycle: {
        transitionToIA: 30, // Move to Infrequent Access after 30 days
        transitionToGlacier: 90, // Move to Glacier after 90 days
        transitionToDeepArchive: 180, // Move to Deep Archive after 180 days
        expiration: 2555, // Delete after 7 years
      },
    },
  },
};
```

---

## 🚀 Complete Configuration Examples

### Example 1: Small Business (Cost-Optimized)

```javascript
const config = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",

  retention: {
    // Database: Keep minimal data
    database: {
      apiLogs: 7, // 1 week
      jobs: 30, // 1 month
      logs: 30, // 1 month
      autoCleanup: true,
      cleanupCron: "0 2 * * *", // 2 AM daily
    },

    // Storage: Quick transition to cheaper storage
    storage: {
      files: 365, // 1 year
      autoCleanup: false, // Use S3 lifecycle

      s3Lifecycle: {
        transitionToIA: 7, // IA after 1 week
        transitionToGlacier: 30, // Glacier after 1 month
        expiration: 365, // Delete after 1 year
      },
    },
  },

  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};
```

### Example 2: Enterprise (Compliance-Ready)

```javascript
const config = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",

  retention: {
    // Database: Keep for audit trails
    database: {
      apiLogs: 90, // 3 months
      jobs: 365, // 1 year
      logs: 180, // 6 months
      autoCleanup: true,
      cleanupCron: "0 1 * * 0", // 1 AM every Sunday
    },

    // Storage: 7-year compliance retention
    storage: {
      files: 2555, // 7 years (compliance)
      autoCleanup: false, // Use S3 lifecycle

      s3Lifecycle: {
        transitionToIA: 30, // IA after 1 month
        transitionToGlacier: 90, // Glacier after 3 months
        transitionToDeepArchive: 365, // Deep Archive after 1 year
        expiration: 2555, // Delete after 7 years
      },
    },
  },

  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};
```

### Example 3: Development Environment

```javascript
const config = {
  dbUri: process.env.DB_URI,
  uploadProvider: "local",

  retention: {
    // Database: Keep minimal for development
    database: {
      apiLogs: 3, // 3 days
      jobs: 7, // 1 week
      logs: 7, // 1 week
      autoCleanup: true,
      cleanupCron: "0 0 * * *", // Midnight daily
    },

    // Storage: Local cleanup
    storage: {
      files: 7, // 1 week
      autoCleanup: true,
      cleanupCron: "0 1 * * *", // 1 AM daily
    },
  },
};
```

---

## 🔧 Usage Examples

### Initialize with Retention

```javascript
const { init, initRetention } = require("logstack");

async function setupWithRetention() {
  // Initialize main service
  const { db } = await init(config);

  // Initialize retention service
  const retentionService = await initRetention(config, db);

  console.log("✅ Service initialized with retention policies");
}
```

### Manual Cleanup

```javascript
const { initRetention } = require("logstack");

async function manualCleanup() {
  const retentionService = await initRetention(config, db);

  // Run cleanup immediately
  const results = await retentionService.runManualCleanup({
    database: true,
    storage: true,
    dryRun: false, // Set to true to see what would be deleted
  });

  console.log("Cleanup results:", results);
}
```

### Dry Run (Preview)

```javascript
async function previewCleanup() {
  const retentionService = await initRetention(config, db);

  // See what would be cleaned without actually deleting
  const preview = await retentionService.runManualCleanup({
    dryRun: true,
  });

  console.log("Preview cleanup:", preview);
}
```

### Get Retention Statistics

```javascript
async function getStats() {
  const retentionService = await initRetention(config, db);

  const stats = await retentionService.getRetentionStats();

  console.log("📊 Retention Statistics:");
  console.log("Database:", stats.database);
  console.log("Storage:", stats.storage);
}
```

---

## 📅 Cron Schedule Examples

### Common Cron Patterns

```javascript
// Daily at specific time
"0 2 * * *"; // 2:00 AM daily
"0 3 * * *"; // 3:00 AM daily

// Weekly
"0 1 * * 0"; // 1:00 AM every Sunday
"0 2 * * 6"; // 2:00 AM every Saturday

// Monthly
"0 3 1 * *"; // 3:00 AM on 1st of every month
"0 4 15 * *"; // 4:00 AM on 15th of every month

// Custom intervals
"0 */6 * * *"; // Every 6 hours
"0 0 */3 * *"; // Every 3 days at midnight
```

---

## 💰 Cost Optimization Strategies

### AWS S3 Storage Classes & Costs

| Storage Class | Access Time | Cost per GB/month | Use Case                       |
| ------------- | ----------- | ----------------- | ------------------------------ |
| Standard      | Immediate   | $0.023            | Active data (0-30 days)        |
| Standard-IA   | Immediate   | $0.0125           | Infrequent access (30-90 days) |
| Glacier       | 1-5 minutes | $0.004            | Archive (90-365 days)          |
| Deep Archive  | 12 hours    | $0.00099          | Long-term (1+ years)           |

### Recommended Transitions

```javascript
// Cost-optimized for most use cases
s3Lifecycle: {
  transitionToIA: 30,        // Save 46% after 1 month
  transitionToGlacier: 90,   // Save 83% after 3 months
  transitionToDeepArchive: 365, // Save 96% after 1 year
  expiration: 2555           // Delete after 7 years
}
```

### Cost Calculation Example

For 1GB of logs per day:

| Period | Standard | With Lifecycle | Savings      |
| ------ | -------- | -------------- | ------------ |
| Year 1 | $276     | $156           | $120 (43%)   |
| Year 2 | $552     | $169           | $383 (69%)   |
| Year 7 | $1,932   | $178           | $1,754 (91%) |

---

## 🔒 Compliance Considerations

### Industry Requirements

**Financial Services (SOX, PCI-DSS)**

```javascript
retention: {
  database: { apiLogs: 90, jobs: 365, logs: 180 },
  storage: { files: 2555 } // 7 years
}
```

**Healthcare (HIPAA)**

```javascript
retention: {
  database: { apiLogs: 180, jobs: 2555, logs: 365 },
  storage: { files: 2190 } // 6 years minimum
}
```

**General Business**

```javascript
retention: {
  database: { apiLogs: 30, jobs: 90, logs: 60 },
  storage: { files: 1095 } // 3 years
}
```

---

## 🛠️ Troubleshooting

### Common Issues

**1. Permission Denied**

```
Error: Access denied when cleaning up S3 files
Solution: Ensure IAM policy includes s3:DeleteObject permission
```

**2. Database Connection**

```
Error: Cannot connect to database for cleanup
Solution: Check database connection and authentication
```

**3. Large Dataset Performance**

```
Issue: Cleanup taking too long
Solution: Run cleanup during off-peak hours, increase batch sizes
```

### Monitoring Cleanup

```javascript
// Add logging to track cleanup performance
const config = {
  retention: {
    database: {
      apiLogs: 14,
      autoCleanup: true,
      cleanupCron: "0 2 * * *",
    },
  },
  logging: {
    level: "info",
    enableConsole: true,
  },
};
```

---

## 📊 Performance Impact

### Database Cleanup

- **Small datasets** (< 100K records): 1-2 seconds
- **Medium datasets** (100K-1M records): 10-30 seconds
- **Large datasets** (1M+ records): 1-5 minutes

### Storage Cleanup

- **S3**: Efficient batch operations, minimal impact
- **Local**: Depends on file system and disk speed

### Optimization Tips

1. **Schedule during off-peak hours**
2. **Use batch operations** for large datasets
3. **Monitor cleanup duration** and adjust frequency
4. **Use S3 lifecycle policies** instead of manual cleanup when possible

---

## 🎯 Best Practices

### 1. Start Conservative

```javascript
// Begin with shorter retention periods
retention: {
  database: { apiLogs: 7, jobs: 30, logs: 30 },
  storage: { files: 90 }
}
```

### 2. Monitor First

```javascript
// Use dry run to understand impact
await retentionService.runManualCleanup({ dryRun: true });
```

### 3. Gradual Implementation

```javascript
// Enable one component at a time
retention: {
  database: {
    apiLogs: 14,
    autoCleanup: true  // Start with database only
  },
  storage: {
    files: 180,
    autoCleanup: false // Enable later
  }
}
```

### 4. Backup Before Cleanup

```javascript
// Create backup before enabling automatic cleanup
// Export important data to separate storage
```

### 5. Test in Development

```javascript
// Test retention policies in development environment first
// Verify cleanup works as expected
```

---

## 🚀 Quick Setup Guide

### Step 1: Add Retention Config

```javascript
const config = {
  // ... existing config
  retention: {
    database: {
      apiLogs: 14,
      jobs: 90,
      logs: 60,
      autoCleanup: true,
    },
    storage: {
      files: 180,
      autoCleanup: true,
    },
  },
};
```

### Step 2: Initialize Retention

```javascript
const { init, initRetention } = require("logstack");

async function setup() {
  const { db } = await init(config);
  await initRetention(config, db);
  console.log("✅ Retention policies active");
}
```

### Step 3: Monitor & Adjust

```javascript
// Check what will be cleaned
const stats = await retentionService.getRetentionStats();
console.log("Records to be cleaned:", stats);

// Adjust retention periods as needed
config.retention.database.apiLogs = 21; // Increase to 3 weeks
```

Your log retention system is now active! 🎉
