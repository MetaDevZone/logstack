# Output Directory Organization

The package now supports organizing generated files into custom directories instead of creating them in the root directory.

## Configuration

Use the `outputDirectory` option to specify where files should be stored:

```typescript
import { init } from "cron-log-service";

await init({
  dbUri: "mongodb://localhost:27017/your-db",
  uploadProvider: "local",

  // Organize files in a dedicated directory
  outputDirectory: "logs", // Default: 'uploads'

  // Your other configurations...
});
```

## Directory Structure

### Before (Default behavior)

```
project-root/
├── 2025-08-25/
│   ├── 00-01.json
│   ├── 01-02.json
│   └── ...
├── 2025-08-26/
│   └── ...
└── your-app-files...
```

### After (With outputDirectory: 'logs')

```
project-root/
├── logs/
│   ├── 2025-08-25/
│   │   ├── 00-01.json
│   │   ├── 01-02.json
│   │   └── ...
│   ├── 2025-08-26/
│   │   └── ...
│   └── ...
├── your-app-files...
└── clean-root-directory
```

## Benefits

1. **Organization**: Keep generated files separate from your application code
2. **Clean Root**: Prevent cluttering your project root directory
3. **Multiple Instances**: Different services can use different directories
4. **Environment Separation**: Use different directories for dev/staging/prod

## Examples

### Development Environment

```typescript
await init({
  outputDirectory: "dev-logs",
  collections: {
    jobsCollectionName: "dev_jobs",
    logsCollectionName: "dev_logs",
  },
});
```

### Production Environment

```typescript
await init({
  outputDirectory: "production-exports",
  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
  },
});
```

### API Log Exports

```typescript
await init({
  outputDirectory: "api-logs-exports",
  apiLogs: {
    existingCollection: {
      name: "apilogs",
      timestampField: "request_time",
    },
  },
});
```

## Testing

```bash
# Test with default 'uploads' directory
npm run example:organized-output

# Test multiple output directories
npm run example:multiple-dirs
```

## Default Value

If not specified, the default `outputDirectory` is `'uploads'`.

This ensures backward compatibility while providing better organization for new projects.
