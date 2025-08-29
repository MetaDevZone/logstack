/**
 * 🚀 Quick Start Example - Copy and modify this for your project
 * 
 * This example shows the most common setup patterns for the cron-log-service.
 * Choose the configuration that matches your needs.
 */

import { init, createDailyJobs, processSpecificHour } from '../src/main';
import { Config } from '../types/config';

// ==========================================
// 🎯 OPTION 1: Basic Setup (Recommended for starting)
// ==========================================

const basicConfig: Config = {
  dbUri: 'mongodb://localhost:27017/myapp',
  uploadProvider: 'local',
  fileFormat: 'json',
  
  // 📁 Keep files organized (not in project root)
  outputDirectory: 'api-logs',
  
  // 🗃️ Avoid database conflicts
  collections: {
    jobsCollectionName: 'myapp_jobs',
    logsCollectionName: 'myapp_logs',
    apiLogsCollectionName: 'myapp_apilogs'
  },
  
  logging: {
    level: 'info',
    enableConsole: true
  }
};

// ==========================================
// 🎯 OPTION 2: Environment-Based Setup
// ==========================================

const environmentConfig = (): Config => {
  const env = process.env.NODE_ENV || 'development';
  const appName = 'myapp'; // Change this to your app name
  
  return {
    dbUri: process.env.DB_URI || 'mongodb://localhost:27017/myapp',
    uploadProvider: env === 'production' ? 's3' : 'local',
    fileFormat: 'json',
    
    // 📁 Environment-specific directories
    outputDirectory: `${appName}-${env}-logs`,
    
    // 🗃️ Environment-specific collections
    collections: {
      jobsCollectionName: `${appName}_${env}_jobs`,
      logsCollectionName: `${appName}_${env}_logs`
    },
    
    // 🌩️ S3 config for production
    ...(env === 'production' && {
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.S3_BUCKET!
      }
    }),
    
    logging: {
      level: env === 'production' ? 'warn' : 'info',
      enableConsole: true,
      enableFile: env === 'production'
    }
  };
};

// ==========================================
// 🎯 OPTION 3: Multi-Service Setup
// ==========================================

const createServiceConfig = (serviceName: string): Config => {
  return {
    dbUri: process.env.DB_URI || 'mongodb://localhost:27017/company',
    uploadProvider: 'local',
    fileFormat: 'json',
    
    // 📁 Service-specific directory
    outputDirectory: `${serviceName}-logs`,
    
    // 🗃️ Service-specific collections
    collections: {
      jobsCollectionName: `${serviceName}_jobs`,
      logsCollectionName: `${serviceName}_logs`
    },
    
    logging: {
      level: 'info',
      enableConsole: true
    }
  };
};

// Usage for different services:
const userServiceConfig = createServiceConfig('user-service');
const orderServiceConfig = createServiceConfig('order-service');
const analyticsConfig = createServiceConfig('analytics');

// ==========================================
// 🎯 OPTION 4: With Existing API Logs
// ==========================================

const existingLogsConfig: Config = {
  dbUri: 'mongodb://localhost:27017/myapp',
  uploadProvider: 'local',
  fileFormat: 'json',
  outputDirectory: 'api-exports',
  
  // 🔌 Use your existing API request logs
  apiLogs: {
    existingCollection: {
      name: 'api_requests',           // Your existing collection name
      timestampField: 'request_time'  // Your timestamp field name
    }
  },
  
  collections: {
    jobsCollectionName: 'api_export_jobs',
    logsCollectionName: 'api_export_logs'
  },
  
  logging: {
    level: 'info',
    enableConsole: true
  }
};

// ==========================================
// 🚀 INITIALIZATION FUNCTIONS
// ==========================================

/**
 * Option 1: Basic initialization
 */
async function initBasicService() {
  try {
    await init(basicConfig);
    console.log('✅ Basic cron service initialized');
    console.log('📁 Files will be saved to: ./api-logs/');
    console.log('🗃️ Using collections: myapp_jobs, myapp_logs');
  } catch (error) {
    console.error('❌ Failed to initialize basic service:', error);
  }
}

/**
 * Option 2: Environment-based initialization
 */
async function initEnvironmentService() {
  try {
    const config = environmentConfig();
    await init(config);
    
    const env = process.env.NODE_ENV || 'development';
    console.log(`✅ ${env} cron service initialized`);
    console.log(`📁 Files will be saved to: ./${config.outputDirectory}/`);
    console.log(`🗃️ Using collections: ${config.collections?.jobsCollectionName}, ${config.collections?.logsCollectionName}`);
  } catch (error) {
    console.error('❌ Failed to initialize environment service:', error);
  }
}

/**
 * Option 3: Multi-service initialization
 */
async function initMultiService() {
  const services = ['user-service', 'order-service', 'analytics'];
  
  for (const service of services) {
    try {
      const config = createServiceConfig(service);
      await init(config);
      console.log(`✅ ${service} cron service initialized`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${service}:`, error);
    }
  }
}

/**
 * Option 4: Existing logs initialization
 */
async function initExistingLogsService() {
  try {
    await init(existingLogsConfig);
    console.log('✅ Existing logs service initialized');
    console.log('📁 Files will be saved to: ./api-exports/');
    console.log('🔌 Using existing collection: api_requests');
  } catch (error) {
    console.error('❌ Failed to initialize existing logs service:', error);
  }
}

// ==========================================
// 🧪 TEST FUNCTIONS
// ==========================================

/**
 * Test your configuration
 */
async function testConfiguration(config: Config) {
  try {
    console.log('🧪 Testing configuration...');
    
    // 1. Test initialization
    await init(config);
    console.log('✅ Service initialized');
    
    // 2. Test job creation
    const job = await createDailyJobs('2025-08-25', config);
    console.log(`✅ Created job with ${job.hours.length} hour slots`);
    
    // 3. Test file processing
    await processSpecificHour('2025-08-25', 14, config);
    console.log('✅ Processed hour 14-15');
    console.log(`📁 Check your ${config.outputDirectory} directory for the generated file`);
    
    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// ==========================================
// 🏃‍♂️ USAGE EXAMPLES
// ==========================================

async function main() {
  console.log('🚀 Cron Log Service - Quick Start');
  console.log('================================\n');
  
  // Choose one of these options:
  
  // 1. Basic setup (good for getting started)
  await initBasicService();
  
  // 2. Environment-based setup (good for dev/prod)
  // await initEnvironmentService();
  
  // 3. Multi-service setup (good for microservices)
  // await initMultiService();
  
  // 4. Existing logs setup (good for existing API logs)
  // await initExistingLogsService();
  
  // Test your configuration (optional)
  // await testConfiguration(basicConfig);
}

// ==========================================
// 📝 EXPRESS.JS INTEGRATION EXAMPLE
// ==========================================

/**
 * How to integrate with Express.js
 */
/*
import express from 'express';
import { setupRequestLogging } from 'cron-log-service';

const app = express();

// Initialize cron service
await initBasicService();

// Add request logging middleware (optional)
app.use(setupRequestLogging(basicConfig));

// Your API routes
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('🔄 Cron jobs will run automatically');
  console.log('📁 Log files will be organized in api-logs/');
});
*/

// ==========================================
// 🎯 COPY THIS FOR YOUR PROJECT
// ==========================================

/*
// 1. Copy this configuration to your project:
const myConfig: Config = {
  dbUri: 'mongodb://localhost:27017/YOUR_APP_NAME',
  uploadProvider: 'local',
  fileFormat: 'json',
  outputDirectory: 'YOUR_APP_NAME-logs',
  collections: {
    jobsCollectionName: 'YOUR_APP_NAME_jobs',
    logsCollectionName: 'YOUR_APP_NAME_logs'
  },
  logging: {
    level: 'info',
    enableConsole: true
  }
};

// 2. Initialize in your app:
import { init } from 'cron-log-service';
await init(myConfig);

// 3. That's it! The service will run automatically.
*/

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export {
  basicConfig,
  environmentConfig,
  createServiceConfig,
  existingLogsConfig,
  initBasicService,
  initEnvironmentService,
  initMultiService,
  initExistingLogsService,
  testConfiguration
};
