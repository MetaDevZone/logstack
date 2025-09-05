# 📁 Folder Structure Configuration Guide

The **logstack** package provides flexible folder organization for your log files and cloud uploads. You can configure daily, monthly, yearly structures with custom sub-folders to match your specific organizational needs.

## 🎯 Quick Overview

The folder structure system allows you to:

- **Organize by time**: Daily, monthly, or yearly folders
- **Add sub-folders**: Hour-based, status-based, or custom processing stages
- **Custom naming**: Add prefixes and suffixes to folder names
- **Cloud compatibility**: Works with local storage and AWS S3
- **Production ready**: Battle-tested templates for different environments

## 📋 Basic Configuration

### Simple Daily Structure (Default)

```javascript
const config = {
  dbUri: "mongodb://localhost:27017/logstack",
  uploadProvider: "local",
  outputDirectory: "logs",

  // 📁 Simple daily folders: 2024-01-15/file.json
  folderStructure: {
    type: "daily", // Creates folders like: 2024-01-15
  },
};
```

**Output Structure:**

```
logs/
├── 2024-01-15/
│   ├── api_logs_2024-01-15_00-01.json
│   ├── api_logs_2024-01-15_01-02.json
│   └── ...
├── 2024-01-16/
└── 2024-01-17/
```

### Monthly Organization

```javascript
const config = {
  folderStructure: {
    type: "monthly", // Creates folders like: 2024-01
  },
};
```

**Output Structure:**

```
logs/
├── 2024-01/
│   ├── api_logs_2024-01-15_00-01.json
│   ├── api_logs_2024-01-16_02-03.json
│   └── ...
├── 2024-02/
└── 2024-03/
```

### Yearly Archival

```javascript
const config = {
  folderStructure: {
    type: "yearly", // Creates folders like: 2024
  },
};
```

**Output Structure:**

```
logs/
├── 2024/
│   ├── api_logs_2024-01-15_00-01.json
│   ├── api_logs_2024-02-20_10-11.json
│   └── ...
├── 2025/
└── 2026/
```

## 🗂️ Sub-Folder Organization

### Hour-Based Sub-Folders

Perfect for debugging specific time ranges and high-frequency processing.

```javascript
const config = {
  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      byHour: true, // Creates hour-XX-XX sub-folders
    },
  },
};
```

**Output Structure:**

```
logs/
└── 2024-01-15/
    ├── hour-00-01/
    │   └── api_logs_2024-01-15_00-01.json
    ├── hour-01-02/
    │   └── api_logs_2024-01-15_01-02.json
    ├── hour-14-15/
    │   └── api_logs_2024-01-15_14-15.json
    └── hour-23-24/
        └── api_logs_2024-01-15_23-24.json
```

### Status-Based Sub-Folders

Great for quality control and error tracking.

```javascript
const config = {
  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      byStatus: true, // Creates success/failed sub-folders
    },
  },
};
```

**Output Structure:**

```
logs/
└── 2024-01-15/
    ├── success/
    │   ├── api_logs_2024-01-15_00-01.json
    │   └── api_logs_2024-01-15_02-03.json
    └── failed/
        └── api_logs_2024-01-15_01-02.json
```

### Custom Processing Stages

Ideal for multi-stage processing pipelines.

```javascript
const config = {
  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      custom: ["processed", "validated", "archived"],
    },
  },
};
```

**Output Structure:**

```
logs/
└── 2024-01-15/
    └── processed/
        └── validated/
            └── archived/
                └── api_logs_2024-01-15_14-15.json
```

### Combined Sub-Folders

You can combine multiple sub-folder types for maximum organization.

```javascript
const config = {
  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      byHour: true,
      byStatus: true,
      custom: ["processed"],
    },
  },
};
```

**Output Structure:**

```
logs/
└── 2024-01-15/
    └── hour-14-15/
        └── success/
            └── processed/
                └── api_logs_2024-01-15_14-15.json
```

## 🏷️ Custom Naming

### Prefixes and Suffixes

Add prefixes and suffixes to folder names for better organization.

```javascript
const config = {
  folderStructure: {
    type: "daily",
    naming: {
      prefix: "logs", // Adds prefix
      suffix: "data", // Adds suffix
    },
  },
};
```

**Output Structure:**

```
logs/
├── logs_2024-01-15_data/
├── logs_2024-01-16_data/
└── logs_2024-01-17_data/
```

### Date Format Customization

```javascript
const config = {
  folderStructure: {
    type: "monthly",
    naming: {
      dateFormat: "YYYY-MM", // Custom date format
      prefix: "monthly-logs",
    },
  },
};
```

## 🎨 Custom Patterns

For ultimate flexibility, use custom patterns.

```javascript
const config = {
  folderStructure: {
    pattern: "YYYY/MM/DD", // Custom nested pattern
    subFolders: {
      enabled: true,
      byHour: true,
    },
  },
};
```

**Output Structure:**

```
logs/
└── 2024/
    └── 01/
        └── 15/
            └── hour-14-15/
                └── api_logs_2024-01-15_14-15.json
```

## 🌍 Environment-Specific Configurations

### Development Environment

```javascript
const developmentConfig = {
  dbUri: "mongodb://localhost:27017/logstack-dev",
  uploadProvider: "local",
  outputDirectory: "dev-logs",

  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      byHour: true, // Helpful for debugging
      custom: ["debug"], // Mark as debug files
    },
    naming: {
      prefix: "dev",
      suffix: "debug",
    },
  },
};
```

### Staging Environment

```javascript
const stagingConfig = {
  dbUri: "mongodb://localhost:27017/logstack-staging",
  uploadProvider: "local",
  outputDirectory: "staging-logs",

  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      byHour: true,
      byStatus: true, // Test quality control
    },
    naming: {
      prefix: "staging",
    },
  },
};
```

### Production Environment

```javascript
const productionConfig = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",

  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      byHour: true, // Time-based organization
      byStatus: true, // Quality control
      custom: ["processed", "validated"], // Processing pipeline
    },
    naming: {
      dateFormat: "YYYY-MM-DD",
      prefix: "prod-logs",
      includeTime: false,
    },
  },

  s3: {
    bucket: "production-logs-bucket",
    // ... other S3 settings
  },
};
```

## 📊 Use Case Examples

### High-Volume Analytics

For processing large datasets with monthly reports:

```javascript
const analyticsConfig = {
  folderStructure: {
    type: "monthly", // Reduce folder count
    subFolders: {
      enabled: true,
      byStatus: true, // Track processing quality
    },
    naming: {
      prefix: "analytics",
      dateFormat: "YYYY-MM",
    },
  },
};
```

### Compliance & Archival

For long-term storage and compliance requirements:

```javascript
const complianceConfig = {
  folderStructure: {
    type: "yearly", // Long-term archival
    subFolders: {
      enabled: true,
      byStatus: true, // Audit trail
      custom: ["compliant", "reviewed"],
    },
    naming: {
      prefix: "archive",
      dateFormat: "YYYY",
    },
  },
};
```

### Debugging & Development

For development and debugging scenarios:

```javascript
const debugConfig = {
  folderStructure: {
    type: "daily",
    subFolders: {
      enabled: true,
      byHour: true, // Fine-grained time tracking
      custom: ["debug", "trace"],
    },
    naming: {
      prefix: "debug",
      includeTime: true,
    },
  },
};
```

## ☁️ Cloud Storage Integration

The folder structure works seamlessly with cloud storage providers.

### AWS S3 Example

```javascript
const s3Config = {
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",

  folderStructure: {
    type: "monthly",
    subFolders: {
      enabled: true,
      byStatus: true,
    },
    naming: {
      prefix: "logs",
    },
  },

  s3: {
    bucket: "my-organized-logs",
    region: "us-east-1",
    // ... other S3 settings
  },
};
```

**S3 Structure:**

```
my-organized-logs/
├── logs_2024-01/
│   ├── success/
│   │   ├── api_logs_2024-01-15_00-01.json
│   │   └── api_logs_2024-01-15_01-02.json
│   └── failed/
│       └── api_logs_2024-01-15_02-03.json
└── logs_2024-02/
    └── success/
        └── api_logs_2024-02-01_10-11.json
```

## 🛠️ Configuration Templates

Use pre-built templates for common scenarios:

```javascript
const { createFolderStructureConfig } = require("logstack");

// Simple template
const simple = createFolderStructureConfig("simple");
// { type: 'daily', subFolders: { enabled: false } }

// Organized template
const organized = createFolderStructureConfig("organized");
// { type: 'monthly', subFolders: { enabled: true, byHour: false } }

// Detailed template
const detailed = createFolderStructureConfig("detailed");
// { type: 'daily', subFolders: { enabled: true, byHour: true, byStatus: true } }
```

## 📝 Best Practices

### 1. Choose the Right Time Period

- **Daily**: Best for most applications (< 1GB per day)
- **Monthly**: Good for high-volume applications (1-50GB per day)
- **Yearly**: For archival and compliance (long-term storage)

### 2. Sub-Folder Strategy

- **byHour**: Essential for debugging and high-frequency processing
- **byStatus**: Important for quality control and error tracking
- **custom**: Use for multi-stage processing pipelines

### 3. Naming Conventions

- Use descriptive prefixes for multi-tenant systems
- Include environment in naming for staging/production separation
- Keep names short but meaningful

### 4. Cloud Storage Optimization

- Use monthly/yearly structures for large datasets to reduce S3 listing costs
- Implement lifecycle policies based on your folder structure
- Consider cross-region replication for critical data

### 5. Performance Considerations

- Avoid too many nested sub-folders (max 3-4 levels)
- Use month/year structures for high-volume scenarios
- Consider date-based partitioning for analytics

## 🔧 Configuration Validation

The system automatically validates your configuration:

```javascript
const config = {
  folderStructure: {
    type: "invalid-type", // ❌ This will be caught
  },
};

// Valid types: 'daily', 'monthly', 'yearly'
// Valid patterns: Any valid date format string
```

## 📈 Migration Guide

### From Fixed Structure to Configurable

If you're migrating from a fixed folder structure:

1. **Assess your current structure**: Identify your current organization pattern
2. **Choose equivalent config**: Map to daily/monthly/yearly types
3. **Test with sample data**: Verify the output matches expectations
4. **Gradual rollout**: Start with development environment

### Example Migration

**Before** (fixed daily structure):

```
logs/2024-01-15/files...
```

**After** (configurable with sub-folders):

```javascript
const config = {
  folderStructure: {
    type: "daily", // Same as before
    subFolders: {
      enabled: true,
      byHour: true, // New: hour organization
      byStatus: true, // New: quality control
    },
  },
};
```

## 🚀 Getting Started

1. **Install logstack**: `npm install logstack`
2. **Choose your structure**: Start with a template or create custom
3. **Test locally**: Verify folder organization meets your needs
4. **Deploy gradually**: Start with development, then staging, then production

## 🎯 Summary

The folder structure configuration system provides:

- ✅ **Flexibility**: Daily, monthly, yearly, and custom patterns
- ✅ **Sub-organization**: Hour, status, and custom sub-folders
- ✅ **Custom naming**: Prefixes, suffixes, and date formats
- ✅ **Cloud compatibility**: Works with local and S3 storage
- ✅ **Production ready**: Battle-tested templates and validation
- ✅ **Migration friendly**: Easy to upgrade from fixed structures

Choose the configuration that best matches your use case and scale as needed!
