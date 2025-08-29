// Example 1: Using existing collection (your "apilogs" collection)
import { init } from '../index';

async function useExistingCollection() {
  console.log('🔌 Example 1: Using existing "apilogs" collection');
  
  await init({
    dbUri: 'mongodb://localhost:27017/your-database-name',
    uploadProvider: 'local',
    
    // Configure to use your existing collection
    apiLogs: {
      existingCollection: {
        name: 'apilogs', // Your existing collection name
        timestampField: 'request_time', // Field to use for timestamp filtering
        requiredFields: {
          method: 'method',
          path: 'path', 
          client_ip: 'client_ip',
          user_id: 'user_id',
          requestBody: 'requestBody',
          responseStatus: 'responseStatus'
        }
      }
    },
    
    logging: {
      level: 'info',
      enableConsole: true
    }
  });

  console.log('✅ Service initialized with existing collection');
}

// Example 2: Creating new API logs using package middleware
import express from 'express';
import { createApiLogMiddleware } from '../index';

async function createNewApiLogs() {
  console.log('🆕 Example 2: Creating new API logs collection');
  
  await init({
    dbUri: 'mongodb://localhost:27017/your-database-name',
    uploadProvider: 's3',
    s3: {
      accessKeyId: 'your-access-key',
      secretAccessKey: 'your-secret-key',
      region: 'us-east-1',
      bucket: 'your-bucket'
    },
    
    // Configure to create new collection
    apiLogs: {
      createNew: {
        collectionName: 'new_api_logs', // Optional: custom name
        enableMiddleware: true,
        autoFields: true
      }
    },
    
    logging: {
      level: 'info',
      enableConsole: true
    }
  });

  // Setup Express app with logging middleware
  const app = express();
  
  // Add the API logging middleware
  app.use(createApiLogMiddleware());
  
  // Your API routes
  app.get('/api/users', (req, res) => {
    res.json({ users: [] });
  });
  
  app.post('/api/users', (req, res) => {
    res.json({ message: 'User created' });
  });
  
  app.listen(3000, () => {
    console.log('🚀 Server running on port 3000 with API logging');
  });
}

// Example 3: Hybrid approach - use existing for some operations, create new for others
async function hybridApproach() {
  console.log('🔄 Example 3: Hybrid approach');
  
  await init({
    dbUri: 'mongodb://localhost:27017/your-database-name',
    uploadProvider: 'gcs',
    gcs: {
      projectId: 'your-project-id',
      keyFilename: 'path/to/service-account.json',
      bucket: 'your-bucket'
    },
    
    // Primary source: existing collection
    apiLogs: {
      existingCollection: {
        name: 'apilogs',
        timestampField: 'request_time'
      },
      // Also enable new collection for additional logging
      createNew: {
        collectionName: 'supplementary_logs',
        enableMiddleware: true
      }
    }
  });

  console.log('✅ Service initialized with hybrid approach');
}

// Export functions for testing
export { useExistingCollection, createNewApiLogs, hybridApproach };

// Run example if this file is executed directly
if (require.main === module) {
  const example = process.argv[2] || 'existing';
  
  switch (example) {
    case 'existing':
      useExistingCollection().catch(console.error);
      break;
    case 'new':
      createNewApiLogs().catch(console.error);
      break;
    case 'hybrid':
      hybridApproach().catch(console.error);
      break;
    default:
      console.log('Usage: npm run example:flexible [existing|new|hybrid]');
  }
}
