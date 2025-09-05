# 🗑️ Log Retention Configuration Examples

This file contains comprehensive examples for configuring log retention based on different use cases and compliance requirements.

## 📋 Quick Reference

### Common Retention Periods

| Use Case        | Database Logs | Job Records  | Storage Files | Compliance |
| --------------- | ------------- | ------------ | ------------- | ---------- |
| **Development** | 3-7 days      | 7-14 days    | 14-30 days    | None       |
| **Startup**     | 7-14 days     | 30-60 days   | 90-180 days   | Basic      |
| **Enterprise**  | 30-90 days    | 365 days     | 730-2555 days | SOX/GDPR   |
| **Healthcare**  | 30-45 days    | 2555 days    | 2555 days     | HIPAA      |
| **Financial**   | 90 days       | 2555 days    | 2555 days     | SOX/PCI    |
| **Analytics**   | 60-90 days    | 180-365 days | 730-1095 days | Custom     |

## 🏢 Industry-Specific Configurations

### Healthcare (HIPAA Compliant)

```javascript
const healthcareRetention = {
  retention: {
    database: {
      apiLogs: 45, // 45 days for operational data
      jobs: 2555, // 7 years for audit trails
      logs: 365, // 1 year for troubleshooting
      autoCleanup: true,
      cleanupCron: "0 2 * * 0", // Weekly cleanup (Sunday 2 AM)
    },
    storage: {
      files: 2555, // 7 years minimum for HIPAA
      autoCleanup: true,
      cleanupCron: "0 3 * * 0", // Weekly cleanup (Sunday 3 AM)
    },
  },
};

// Environment variables for healthcare
/*
DB_RETAIN_API_LOGS=45
DB_RETAIN_JOBS=2555
DB_RETAIN_LOGS=365
STORAGE_RETAIN_FILES=2555
COMPANY_TYPE=healthcare
*/
```

### Financial Services (SOX/PCI Compliant)

```javascript
const financialRetention = {
  retention: {
    database: {
      apiLogs: 90, // 90 days for transaction logs
      jobs: 2555, // 7 years for SOX compliance
      logs: 365, // 1 year for audit logs
      autoCleanup: true,
      cleanupCron: "0 1 * * 1", // Weekly cleanup (Monday 1 AM)
    },
    storage: {
      files: 2555, // 7 years for SOX compliance
      autoCleanup: true,
      cleanupCron: "0 2 * * 1", // Weekly cleanup (Monday 2 AM)
      // Additional security for financial data
      s3Lifecycle: {
        transitionToIA: 90, // Move to IA after 3 months
        transitionToGlacier: 365, // Move to Glacier after 1 year
        transitionToDeepArchive: 1095, // Deep Archive after 3 years
        expiration: 2555, // Delete after 7 years
      },
    },
  },
};

// Environment variables for financial
/*
DB_RETAIN_API_LOGS=90
DB_RETAIN_JOBS=2555
DB_RETAIN_LOGS=365
STORAGE_RETAIN_FILES=2555
COMPANY_TYPE=financial
*/
```

### E-commerce/Retail

```javascript
const ecommerceRetention = {
  retention: {
    database: {
      apiLogs: 30, // 30 days for customer activity
      jobs: 365, // 1 year for order history
      logs: 90, // 3 months for troubleshooting
      autoCleanup: true,
      cleanupCron: "0 3 * * *", // Daily cleanup (3 AM)
    },
    storage: {
      files: 1095, // 3 years for customer data
      autoCleanup: true,
      cleanupCron: "0 4 * * *", // Daily cleanup (4 AM)
      s3Lifecycle: {
        transitionToIA: 60, // Move to IA after 2 months
        transitionToGlacier: 365, // Move to Glacier after 1 year
        expiration: 1095, // Delete after 3 years
      },
    },
  },
};

// Environment variables for e-commerce
/*
DB_RETAIN_API_LOGS=30
DB_RETAIN_JOBS=365
DB_RETAIN_LOGS=90
STORAGE_RETAIN_FILES=1095
COMPANY_TYPE=ecommerce
*/
```

### SaaS/Technology Startup

```javascript
const startupRetention = {
  retention: {
    database: {
      apiLogs: 14, // 14 days for debugging
      jobs: 60, // 2 months for job history
      logs: 30, // 1 month for troubleshooting
      autoCleanup: true,
      cleanupCron: "0 2 * * *", // Daily cleanup (2 AM)
    },
    storage: {
      files: 180, // 6 months for cost optimization
      autoCleanup: true,
      cleanupCron: "0 3 * * *", // Daily cleanup (3 AM)
      s3Lifecycle: {
        transitionToIA: 30, // Move to IA after 1 month
        transitionToGlacier: 90, // Move to Glacier after 3 months
        expiration: 180, // Delete after 6 months
      },
    },
  },
};

// Environment variables for startup
/*
DB_RETAIN_API_LOGS=14
DB_RETAIN_JOBS=60
DB_RETAIN_LOGS=30
STORAGE_RETAIN_FILES=180
COMPANY_TYPE=startup
*/
```

### Analytics/Data Science

```javascript
const analyticsRetention = {
  retention: {
    database: {
      apiLogs: 90, // 3 months for trend analysis
      jobs: 365, // 1 year for data pipeline history
      logs: 180, // 6 months for troubleshooting
      autoCleanup: true,
      cleanupCron: "0 1 * * *", // Daily cleanup (1 AM)
    },
    storage: {
      files: 1095, // 3 years for historical analysis
      autoCleanup: true,
      cleanupCron: "0 2 * * *", // Daily cleanup (2 AM)
      s3Lifecycle: {
        transitionToIA: 90, // Move to IA after 3 months
        transitionToGlacier: 365, // Move to Glacier after 1 year
        expiration: 1095, // Delete after 3 years
      },
    },
  },
};

// Environment variables for analytics
/*
DB_RETAIN_API_LOGS=90
DB_RETAIN_JOBS=365
DB_RETAIN_LOGS=180
STORAGE_RETAIN_FILES=1095
COMPANY_TYPE=analytics
*/
```

## 🌍 Environment-Based Retention

### Development Environment

```javascript
const devRetention = {
  retention: {
    database: {
      apiLogs: 3, // 3 days only
      jobs: 7, // 1 week
      logs: 5, // 5 days
      autoCleanup: true,
      cleanupCron: "0 6 * * *", // Daily at 6 AM
    },
    storage: {
      files: 14, // 2 weeks
      autoCleanup: true,
      cleanupCron: "0 7 * * *", // Daily at 7 AM
    },
  },
};
```

### Staging Environment

```javascript
const stagingRetention = {
  retention: {
    database: {
      apiLogs: 7, // 1 week
      jobs: 30, // 1 month
      logs: 14, // 2 weeks
      autoCleanup: true,
      cleanupCron: "0 3 * * *", // Daily at 3 AM
    },
    storage: {
      files: 60, // 2 months
      autoCleanup: true,
      cleanupCron: "0 4 * * *", // Daily at 4 AM
    },
  },
};
```

### Production Environment

```javascript
const productionRetention = {
  retention: {
    database: {
      apiLogs: 30, // 1 month
      jobs: 365, // 1 year
      logs: 90, // 3 months
      autoCleanup: true,
      cleanupCron: "0 2 * * *", // Daily at 2 AM
    },
    storage: {
      files: 730, // 2 years
      autoCleanup: true,
      cleanupCron: "0 3 * * *", // Daily at 3 AM
      s3Lifecycle: {
        transitionToIA: 60, // Move to IA after 2 months
        transitionToGlacier: 180, // Move to Glacier after 6 months
        expiration: 730, // Delete after 2 years
      },
    },
  },
};
```

## 📊 Database-Specific Retention

### MongoDB Configuration

```javascript
const mongoRetention = {
  dbType: "mongodb",
  retention: {
    database: {
      apiLogs: 30,
      jobs: 90,
      logs: 60,
      autoCleanup: true,
      cleanupCron: "0 2 * * *",
    },
    storage: {
      files: 365,
      autoCleanup: true,
      cleanupCron: "0 3 * * *",
    },
  },
  collections: {
    apiLogsCollectionName: "api_logs_with_retention",
    jobsCollectionName: "jobs_with_retention",
    logsCollectionName: "logs_with_retention",
  },
};
```

### PostgreSQL Configuration

```javascript
const postgresRetention = {
  dbType: "postgresql",
  retention: {
    database: {
      apiLogs: 60, // PostgreSQL handles larger datasets well
      jobs: 180,
      logs: 90,
      autoCleanup: true,
      cleanupCron: "0 2 * * *",
    },
    storage: {
      files: 730,
      autoCleanup: true,
      cleanupCron: "0 3 * * *",
    },
  },
  tables: {
    apiLogsTableName: "api_logs_with_retention",
    jobsTableName: "jobs_with_retention",
    logsTableName: "logs_with_retention",
  },
};
```

### Redis Configuration

```javascript
const redisRetention = {
  dbType: "redis",
  retention: {
    database: {
      apiLogs: 7, // Shorter retention for Redis (memory-based)
      jobs: 30,
      logs: 14,
      autoCleanup: true,
      cleanupCron: "0 1 * * *", // More frequent cleanup
    },
    storage: {
      files: 90,
      autoCleanup: true,
      cleanupCron: "0 2 * * *",
    },
  },
  keys: {
    apiLogsKeyPrefix: "api_logs_retention:",
    jobsKeyPrefix: "jobs_retention:",
    logsKeyPrefix: "logs_retention:",
  },
  ttl: 604800, // 7 days TTL for Redis keys
};
```

## 🛠️ Complete Environment Variables Template

```bash
# =================================
# LOG RETENTION CONFIGURATION
# =================================

# Database Retention (days)
DB_RETAIN_API_LOGS=30
DB_RETAIN_JOBS=90
DB_RETAIN_LOGS=60
DB_AUTO_CLEANUP=true
DB_CLEANUP_CRON="0 2 * * *"

# Storage Retention (days)
STORAGE_RETAIN_FILES=365
STORAGE_AUTO_CLEANUP=true
STORAGE_CLEANUP_CRON="0 3 * * *"

# Company/Industry Type (affects default retention policies)
# Options: startup, enterprise, healthcare, financial, ecommerce, analytics
COMPANY_TYPE=enterprise

# Environment-specific overrides
NODE_ENV=production

# Multi-Database Retention (if using multiple databases)
USER_DB_RETAIN_API_LOGS=14
USER_DB_RETAIN_JOBS=60
USER_STORAGE_RETAIN_FILES=180

ANALYTICS_DB_RETAIN_API_LOGS=90
ANALYTICS_DB_RETAIN_JOBS=365
ANALYTICS_STORAGE_RETAIN_FILES=730

COMPLIANCE_DB_RETAIN_API_LOGS=2555
COMPLIANCE_DB_RETAIN_JOBS=2555
COMPLIANCE_STORAGE_RETAIN_FILES=2555

# S3 Lifecycle Configuration (for cost optimization)
S3_TRANSITION_TO_IA=60              # Days to move to Infrequent Access
S3_TRANSITION_TO_GLACIER=180        # Days to move to Glacier
S3_TRANSITION_TO_DEEP_ARCHIVE=365   # Days to move to Deep Archive
S3_EXPIRATION=730                   # Days to permanently delete

# GCS Lifecycle Configuration
GCS_TRANSITION_TO_NEARLINE=60       # Days to move to Nearline
GCS_TRANSITION_TO_COLDLINE=180      # Days to move to Coldline
GCS_TRANSITION_TO_ARCHIVE=365       # Days to move to Archive
GCS_EXPIRATION=730                  # Days to permanently delete

# Azure Lifecycle Configuration
AZURE_TRANSITION_TO_COOL=60         # Days to move to Cool tier
AZURE_TRANSITION_TO_ARCHIVE=180     # Days to move to Archive tier
AZURE_EXPIRATION=730                # Days to permanently delete
```

## 🎯 Implementation Examples

### Basic Implementation

```javascript
const { init, initRetention } = require("logstack");

const config = {
  dbUri: process.env.DB_URI,
  uploadProvider: process.env.UPLOAD_PROVIDER,

  // Use environment variables for retention
  retention: {
    database: {
      apiLogs: parseInt(process.env.DB_RETAIN_API_LOGS) || 30,
      jobs: parseInt(process.env.DB_RETAIN_JOBS) || 90,
      logs: parseInt(process.env.DB_RETAIN_LOGS) || 60,
      autoCleanup: process.env.DB_AUTO_CLEANUP === "true",
      cleanupCron: process.env.DB_CLEANUP_CRON || "0 2 * * *",
    },
    storage: {
      files: parseInt(process.env.STORAGE_RETAIN_FILES) || 365,
      autoCleanup: process.env.STORAGE_AUTO_CLEANUP === "true",
      cleanupCron: process.env.STORAGE_CLEANUP_CRON || "0 3 * * *",
    },
  },
};

async function setupRetention() {
  const { db } = await init(config);
  const retentionService = await initRetention(config, db);

  console.log("✅ Retention service initialized");
  console.log(`📅 API logs: ${config.retention.database.apiLogs} days`);
  console.log(`📋 Job records: ${config.retention.database.jobs} days`);
  console.log(`📁 Storage files: ${config.retention.storage.files} days`);
}

setupRetention();
```

### Company Type Based Implementation

```javascript
const { init, initRetention } = require("logstack");

function getRetentionByCompanyType(companyType) {
  const retentionPolicies = {
    startup: {
      database: { apiLogs: 14, jobs: 60, logs: 30 },
      storage: { files: 180 },
    },
    enterprise: {
      database: { apiLogs: 30, jobs: 365, logs: 90 },
      storage: { files: 730 },
    },
    healthcare: {
      database: { apiLogs: 45, jobs: 2555, logs: 365 },
      storage: { files: 2555 },
    },
    financial: {
      database: { apiLogs: 90, jobs: 2555, logs: 365 },
      storage: { files: 2555 },
    },
  };

  return retentionPolicies[companyType] || retentionPolicies.startup;
}

async function setupCompanyBasedRetention() {
  const companyType = process.env.COMPANY_TYPE || "startup";
  const retentionPolicy = getRetentionByCompanyType(companyType);

  const config = {
    dbUri: process.env.DB_URI,
    uploadProvider: process.env.UPLOAD_PROVIDER,
    retention: {
      database: {
        ...retentionPolicy.database,
        autoCleanup: true,
        cleanupCron: "0 2 * * *",
      },
      storage: {
        ...retentionPolicy.storage,
        autoCleanup: true,
        cleanupCron: "0 3 * * *",
      },
    },
  };

  const { db } = await init(config);
  await initRetention(config, db);

  console.log(`✅ ${companyType} retention policy applied`);
}

setupCompanyBasedRetention();
```

## 📋 Best Practices

### 1. **Start Conservative**

- Begin with shorter retention periods
- Monitor storage costs and compliance needs
- Gradually increase as requirements become clear

### 2. **Separate by Data Type**

- API logs: Shorter retention (debugging focus)
- Job records: Longer retention (audit trail)
- Storage files: Medium to long retention (historical analysis)

### 3. **Use Lifecycle Policies**

- Automatically transition to cheaper storage tiers
- Significant cost savings without losing data
- Especially important for cloud storage

### 4. **Monitor and Adjust**

- Regular review of retention policies
- Monitor storage costs vs. compliance requirements
- Adjust based on actual usage patterns

### 5. **Environment-Specific Policies**

- Development: Very short retention (cost optimization)
- Staging: Short to medium retention (testing)
- Production: Full retention per compliance requirements

### 6. **Document Your Policies**

- Clear documentation of retention periods
- Justification for each retention period
- Regular review and update schedule

## 🔒 Compliance Requirements

### GDPR (General Data Protection Regulation)

- **Right to be forgotten**: Implement data deletion
- **Data minimization**: Keep only necessary data
- **Default retention**: 30-90 days unless business need

### HIPAA (Health Insurance Portability and Accountability Act)

- **Minimum retention**: 6 years from creation/last effective date
- **Recommended**: 7 years for safety
- **Secure deletion**: Required after retention period

### SOX (Sarbanes-Oxley Act)

- **Financial records**: 7 years minimum
- **Audit trails**: Must be maintained
- **Immutable storage**: Consider for compliance

### PCI DSS (Payment Card Industry Data Security Standard)

- **Transaction logs**: 1 year minimum
- **Security logs**: Varies by requirement
- **Secure deletion**: Required

Remember to consult with your legal and compliance teams to ensure your retention policies meet all applicable requirements for your industry and jurisdiction.
