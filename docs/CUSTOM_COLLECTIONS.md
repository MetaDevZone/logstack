# Custom Collection Names Configuration

To prevent database conflicts when using your own collection names, the package supports custom collection names for both jobs and logs.

## Configuration

```typescript
import { init, Config } from "cron-log-service";

const config: Config = {
  dbUri: "mongodb://localhost:27017/your-database",
  uploadProvider: "local",

  // Custom collection names to avoid conflicts
  collections: {
    jobsCollectionName: "my_custom_jobs", // Default: 'jobs'
    logsCollectionName: "my_custom_logs", // Default: 'logs'
  },

  // Use your existing API logs collection
  apiLogs: {
    existingCollection: {
      name: "my_api_logs", // Your API logs collection name
      timestampField: "request_time",
    },
  },
};

await init(config);
```

## Benefits

1. **Avoid Conflicts**: Prevent naming conflicts with existing collections
2. **Multiple Instances**: Run multiple instances with different collection names
3. **Organization**: Keep your collections organized with meaningful names
4. **Isolation**: Separate environments (dev/staging/prod) can use different names

## Default Values

- **Jobs Collection**: `'jobs'`
- **Logs Collection**: `'logs'`

## Example Usage

```bash
# Run example with custom collection names
npm run example:custom-collections
```

## Real-World Example

```typescript
// Production configuration
const prodConfig: Config = {
  dbUri: "mongodb://localhost:27017/production-db",
  uploadProvider: "s3",

  collections: {
    jobsCollectionName: "prod_file_processing_jobs",
    logsCollectionName: "prod_file_processing_logs",
  },

  apiLogs: {
    existingCollection: {
      name: "prod_api_requests",
      timestampField: "created_at",
    },
  },
};

// Development configuration
const devConfig: Config = {
  dbUri: "mongodb://localhost:27017/development-db",
  uploadProvider: "local",

  collections: {
    jobsCollectionName: "dev_jobs",
    logsCollectionName: "dev_logs",
  },

  apiLogs: {
    existingCollection: {
      name: "dev_api_logs",
      timestampField: "request_time",
    },
  },
};
```

This ensures your production and development environments use completely separate collections, preventing any data conflicts.
