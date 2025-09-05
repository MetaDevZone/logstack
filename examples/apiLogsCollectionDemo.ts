/**
 * 🔗 API Logs Collection Name Demo - Cron Log Service
 * 
 * This example demonstrates how to use the new apiLogsCollectionName field
 * to avoid conflicts with existing API logs collections in your database.
 */

import { init, createDailyJobs, processSpecificHour } from '../src/main';
import { saveApiLog, getApiLogs, createApiLogMiddleware } from '../src/apiLogs';
import { Config } from '../types/config';

// ==========================================
// 🗃️ CUSTOM API LOGS COLLECTION CONFIGURATION
// ==========================================

const config: Config = {
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/api-logs-demo',
  uploadProvider: 'local',
  fileFormat: 'json',
  outputDirectory: 'api-logs-demo',
  
  // ✨ Custom collection names to avoid database conflicts
  collections: {
    jobsCollectionName: 'demo_jobs',           // Custom jobs collection
    logsCollectionName: 'demo_logs',           // Custom logs collection
    apiLogsCollectionName: 'demo_api_logs'     // 🎯 Custom API logs collection
  },
  
  logging: {
    level: 'info',
    enableConsole: true
  }
};

// ==========================================
// 🧪 API LOGS COLLECTION TESTING
// ==========================================

async function testApiLogsCollection() {
  try {
    console.log('🗃️ Testing Custom API Logs Collection Name');
    console.log('==========================================\n');
    
    // Initialize the service
    console.log('🚀 Initializing service with custom collections...');
    await init(config);
    console.log('✅ Service initialized successfully');
    console.log(`📋 API logs will be saved to: "${config.collections?.apiLogsCollectionName}"`);
    
    // Test saving API logs with custom collection
    console.log('\n💾 Testing API Log Saving...');
    
    const apiLogData = {
      method: 'POST',
      path: '/api/users',
      requestBody: { name: 'John Doe', email: 'john@example.com' },
      requestHeaders: { 'content-type': 'application/json' },
      responseStatus: 201,
      responseBody: { id: 123, message: 'User created successfully' },
      client_ip: '192.168.1.100',
      client_agent: 'Mozilla/5.0 (Demo Browser)'
    };
    
    const savedLog = await saveApiLog(apiLogData, config);
    console.log('✅ API log saved successfully');
    console.log(`📄 Log ID: ${savedLog._id}`);
    console.log(`🗂️  Saved to collection: ${config.collections?.apiLogsCollectionName}`);
    
    // Test retrieving API logs
    console.log('\n📊 Testing API Log Retrieval...');
    
    const logs = await getApiLogs({
      method: 'POST',
      limit: 5
    }, config);
    
    console.log(`✅ Retrieved ${logs.length} API logs`);
    console.log(`🔍 Searched in collection: ${config.collections?.apiLogsCollectionName}`);
    
    // Show the latest log
    if (logs.length > 0) {
      const latestLog = logs[0];
      console.log('\n📋 Latest API Log:');
      console.log(`   Method: ${latestLog.method}`);
      console.log(`   Path: ${latestLog.path}`);
      console.log(`   Status: ${latestLog.responseStatus}`);
      console.log(`   Time: ${latestLog.request_time}`);
    }
    
  } catch (error) {
    console.error('❌ API logs collection test failed:', error);
    throw error;
  }
}

// ==========================================
// 🏢 MULTIPLE ENVIRONMENTS DEMO
// ==========================================

async function testMultipleEnvironments() {
  console.log('\n🏢 Testing Multiple Environment Collections');
  console.log('==========================================\n');
  
  const environments = [
    {
      name: '🧪 Development',
      config: {
        ...config,
        collections: {
          jobsCollectionName: 'dev_jobs',
          logsCollectionName: 'dev_logs',
          apiLogsCollectionName: 'dev_api_logs'  // Separate dev API logs
        }
      }
    },
    {
      name: '🚀 Production',
      config: {
        ...config,
        collections: {
          jobsCollectionName: 'prod_jobs',
          logsCollectionName: 'prod_logs',
          apiLogsCollectionName: 'prod_api_logs'  // Separate prod API logs
        }
      }
    },
    {
      name: '🧪 Testing',
      config: {
        ...config,
        collections: {
          jobsCollectionName: 'test_jobs',
          logsCollectionName: 'test_logs',
          apiLogsCollectionName: 'test_api_logs'  // Separate test API logs
        }
      }
    }
  ];
  
  for (const env of environments) {
    console.log(`${env.name} Environment`);
    console.log('─'.repeat(25));
    
    try {
      // Save a test API log for each environment
      const testLogData = {
        method: 'GET',
        path: '/health',
        responseStatus: 200,
        responseBody: { status: 'healthy', environment: env.name },
        client_ip: '127.0.0.1'
      };
      
      const savedLog = await saveApiLog(testLogData, env.config);
      console.log(`✅ ${env.name} API log saved`);
      console.log(`🗂️  Collection: ${env.config.collections.apiLogsCollectionName}`);
      console.log(`📄 Log ID: ${savedLog._id}`);
      
    } catch (error) {
      console.error(`❌ ${env.name} failed:`, error instanceof Error ? error.message : error);
    }
    
    console.log(''); // Empty line for readability
  }
}

// ==========================================
// 🌐 EXPRESS MIDDLEWARE DEMO
// ==========================================

function showExpressMiddlewareExample() {
  console.log('\n🌐 Express Middleware Usage Example');
  console.log('===================================\n');
  
  console.log('// Example Express.js integration with custom API logs collection');
  console.log('');
  console.log('const express = require("express");');
  console.log('const { createApiLogMiddleware } = require("logstack");');
  console.log('');
  console.log('const app = express();');
  console.log('');
  console.log('// Your custom configuration');
  console.log('const config = {');
  console.log('  dbUri: "mongodb://localhost:27017/myapp",');
  console.log('  collections: {');
  console.log('    jobsCollectionName: "myapp_jobs",');
  console.log('    logsCollectionName: "myapp_logs",');
  console.log('    apiLogsCollectionName: "myapp_api_logs"  // 🎯 Custom API logs collection');
  console.log('  }');
  console.log('};');
  console.log('');
  console.log('// Use the middleware with your custom collection');
  console.log('app.use(createApiLogMiddleware(config));');
  console.log('');
  console.log('// Your API routes will now be logged to "myapp_api_logs" collection');
  console.log('app.get("/api/users", (req, res) => {');
  console.log('  res.json({ users: [] });');
  console.log('});');
  console.log('');
  console.log('app.listen(3000);');
  console.log('');
  console.log('✨ All API requests will be automatically logged to your custom collection!');
}

// ==========================================
// 🏃‍♂️ MAIN DEMO FUNCTION
// ==========================================

async function runApiLogsDemo() {
  try {
    console.log('🔗 API Logs Collection Name Demo');
    console.log('================================\n');
    
    console.log('💡 Benefits of custom API logs collection names:');
    console.log('  • Avoid conflicts with existing collections');
    console.log('  • Separate environments (dev, prod, test)');
    console.log('  • Better database organization');
    console.log('  • Easy data migration and cleanup');
    console.log('');
    
    // Test basic functionality
    await testApiLogsCollection();
    
    // Test multiple environments
    await testMultipleEnvironments();
    
    // Show Express middleware example
    showExpressMiddlewareExample();
    
    console.log('\n🎉 API Logs Collection Demo Complete!');
    console.log('====================================');
    console.log('✅ Custom API logs collection working');
    console.log('✅ Multiple environment support');
    console.log('✅ Express middleware integration ready');
    console.log('✅ Database conflicts avoided');
    
    console.log('\n🚀 Ready for production with custom collection names!');
    
  } catch (error) {
    console.error('\n❌ API Logs Demo Failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check MongoDB connection');
    console.log('2. Ensure database permissions');
    console.log('3. Verify collection name format');
    process.exit(1);
  }
}

// ==========================================
// 📝 USAGE NOTES
// ==========================================

/*
🔧 Configuration Options for apiLogsCollectionName:

1. Default behavior (if not specified):
   collections: {
     // apiLogsCollectionName will default to "apilogs"
   }

2. Custom collection name:
   collections: {
     apiLogsCollectionName: "my_custom_api_logs"
   }

3. Environment-specific collections:
   collections: {
     apiLogsCollectionName: `${process.env.NODE_ENV}_api_logs`
   }

4. App-specific collections:
   collections: {
     apiLogsCollectionName: "myapp_api_logs"
   }

📋 Collection Naming Best Practices:
  • Use descriptive names: "myapp_api_logs" instead of "logs"
  • Include environment: "prod_api_logs", "dev_api_logs"  
  • Use consistent naming: snake_case or camelCase
  • Avoid special characters except underscore
  • Keep names short but meaningful
*/

// Run the demo if this file is executed directly
if (require.main === module) {
  runApiLogsDemo().catch(console.error);
}

export {
  config,
  testApiLogsCollection,
  testMultipleEnvironments,
  runApiLogsDemo
};
