# 📦 File Compression Configuration Guide

The `logstack` package now includes comprehensive file compression capabilities to reduce storage costs and improve upload performance.

## ✨ Features Added

### 🎯 Configuration Options

- **Compression formats**: gzip, brotli, zip
- **Compression levels**: 1-9 (configurable)
- **File size threshold**: Only compress files above specified size
- **Environment-specific settings**: Different configs for dev/staging/prod

### 🔧 Technical Implementation

- Uses Node.js built-in `zlib` module (no additional dependencies)
- Automatic file extension handling (`.gz`, `.br`)
- Preserves original filename with compression extension
- Configurable compression level and file size thresholds

## 📋 Configuration Interface

```typescript
interface Config {
  // ... other config options

  // 📦 File Compression Configuration
  compression?: {
    enabled?: boolean; // Enable file compression (default: false)
    format?: "gzip" | "zip" | "brotli"; // Compression format (default: 'gzip')
    level?: number; // Compression level 1-9 (default: 6)
    fileSize?: number; // Minimum file size to compress in bytes (default: 1024)
  };
}
```

## 🚀 Quick Start Examples

### Basic Compression

```javascript
await init({
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "local",

  compression: {
    enabled: true,
    format: "gzip",
    level: 6,
    fileSize: 1024, // Only compress files > 1KB
  },
});
```

### Production S3 with High Compression

```javascript
await init({
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",

  compression: {
    enabled: true,
    format: "brotli", // Best compression ratio
    level: 8, // High compression for storage savings
    fileSize: 512, // Compress smaller files in production
  },

  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.S3_BUCKET,
  },
});
```

### Development (No Compression)

```javascript
await init({
  dbUri: "mongodb://localhost:27017/dev",
  uploadProvider: "local",

  compression: {
    enabled: false, // Easier debugging with uncompressed files
  },
});
```

## 🎛️ Compression Format Comparison

| Format     | Speed  | Ratio | Use Case                          |
| ---------- | ------ | ----- | --------------------------------- |
| **gzip**   | Fast   | Good  | Real-time processing, general use |
| **brotli** | Slower | Best  | Storage optimization, archival    |
| **zip**    | Fast   | Good  | Universal compatibility           |

## 📊 Compression Level Guidelines

| Level | Speed    | Ratio   | Recommendation                 |
| ----- | -------- | ------- | ------------------------------ |
| 1-3   | Fastest  | Lower   | Real-time processing           |
| 4-6   | Balanced | Good    | **Recommended for most cases** |
| 7-9   | Slowest  | Highest | Storage optimization only      |

## 🎯 Best Practices

### ✅ When to Enable Compression

- Large log files (>1KB)
- Production environments
- Cloud storage (reduces costs)
- Slow network connections
- Long-term archival

### ⚡ Performance Considerations

- **Development**: Disable compression for easier debugging
- **Staging**: Moderate compression (level 4-6)
- **Production**: High compression (level 7-9) for storage cost optimization

### 💰 Cost Savings

- **Storage**: Up to 70% reduction in file size
- **Bandwidth**: Faster uploads to cloud storage
- **S3 costs**: Significant savings on storage and transfer costs

## 🧪 Testing Compression

### Run Compression Examples

```bash
npm run example:compression              # Basic compression demo
npm run example:compression:production   # Production setup
npm run example:compression:compare      # Compare formats
```

### Test Compression Functionality

```bash
npm run test:compression  # Run compression tests
```

## 📁 File Output Examples

### Without Compression

```
uploads/
└── 2024-01-15/
    └── api_logs_2024-01-15_14-15.json (156 KB)
```

### With GZIP Compression

```
uploads/
└── 2024-01-15/
    └── api_logs_2024-01-15_14-15.json.gz (47 KB) # 70% reduction
```

### With Brotli Compression

```
uploads/
└── 2024-01-15/
    └── api_logs_2024-01-15_14-15.json.br (42 KB) # 73% reduction
```

## 🔧 Environment-Specific Configurations

### Development

```javascript
compression: {
  enabled: false; // No compression for easier debugging
}
```

### Staging

```javascript
compression: {
  enabled: true,
  format: "gzip",
  level: 6, // Balanced performance
  fileSize: 1024
}
```

### Production

```javascript
compression: {
  enabled: true,
  format: "brotli", // Best compression ratio
  level: 8, // High compression for cost savings
  fileSize: 512 // Compress smaller files
}
```

## 🛠️ Integration with Existing Features

### ✅ Compatible Features

- All storage providers (local, S3)
- All file formats (JSON, CSV, TXT)
- Log retention policies
- Automatic cleanup
- Multi-environment configurations

### 📦 Automatic File Handling

- Compressed files get appropriate extensions (`.gz`, `.br`)
- Original filenames preserved with compression suffix
- No changes needed to existing upload/processing logic

## 💡 Migration Guide

### Existing Projects

No breaking changes! Compression is **disabled by default**.

```javascript
// Add this to your existing config to enable compression
const existingConfig = {
  // ... your existing configuration

  // Add compression (optional)
  compression: {
    enabled: true,
    format: "gzip",
    level: 6,
    fileSize: 1024,
  },
};
```

### Gradual Rollout

1. **Start**: Test with `enabled: false` (no change)
2. **Stage 1**: Enable with `level: 4` (light compression)
3. **Stage 2**: Increase to `level: 6` (balanced)
4. **Production**: Use `level: 8-9` for maximum savings

## 🔍 Monitoring Compression

The compression feature integrates with existing logging:

```javascript
logging: {
  level: "info", // Will log compression stats
  enableConsole: true,
  enableFile: true
}
```

Log output includes:

- Original file size
- Compressed file size
- Compression ratio achieved
- Processing time impact

---

🎉 **Compression is now ready to use!** Start with basic settings and adjust based on your performance and storage requirements.
