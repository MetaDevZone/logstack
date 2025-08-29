// Practical example for using existing "apilogs" collection
import { init, createDailyJobs, runHourlyJob, getJobStatus } from '../index';

async function setupWithExistingApiLogs() {
  console.log('🔥 Setting up service with your existing "apilogs" collection');
  
  try {
    // Initialize with your existing collection configuration
    await init({
      // Your database connection
      dbUri: 'mongodb://localhost:27017/dynamite-lifestyle-prod-app', // Update with your DB name
      
      // Where to store generated files
      uploadProvider: 'local', // Change to 's3', 'gcs', or 'azure' as needed
      fileFormat: 'json', // or 'csv', 'txt'
      
      // Organize output files in a dedicated directory
      outputDirectory: 'api-logs-exports', // Files will be saved in api-logs-exports/{date}/
      
      // Custom collection names to avoid conflicts with your existing data
      collections: {
        jobsCollectionName: 'cron_jobs',        // Instead of default 'jobs'
        logsCollectionName: 'cron_job_logs',    // Instead of default 'logs'
        apiLogsCollectionName: 'cron_apilogs'   // Instead of default 'apilogs'
      },
      
      // Configure to use your existing "apilogs" collection
      apiLogs: {
        existingCollection: {
          name: 'apilogs', // Your collection name
          timestampField: 'request_time', // Field to filter by time
          requiredFields: {
            method: 'method',
            path: 'path',
            client_ip: 'client_ip',
            user_id: 'user_id',
            requestBody: 'requestBody',
            responseStatus: 'responseStatus',
            responseBody: 'responseBody'
          }
        }
      },
      
      // Optional: Customize cron schedules
      dailyCron: '0 0 * * *',    // Create jobs at midnight
      hourlyCron: '0 * * * *',   // Process hourly at minute 0
      retryAttempts: 3,
      
      logging: {
        level: 'info',
        enableConsole: true,
        enableFile: true,
        logFilePath: './logs/service.log'
      }
    });

    console.log('✅ Service initialized successfully!');
    
    // Test with today's data
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n📅 Testing with date: ${today}`);
    
    // Create daily job for today (if not exists)
    await createDailyJobs();
    console.log('✅ Daily jobs created');
    
    // Test processing first few hours manually
    console.log('\n🧪 Testing manual processing for current hour...');
    
    // Note: runHourlyJob will automatically process the current hour
    // This is typically called by the cron scheduler
    console.log('⏰ Processing current hour...');
    // The actual processing will be done by the cron jobs
    // For manual testing, you can check the job status instead
    
    // Check status
    const status = await getJobStatus(today);
    const successful = status.filter(s => s && s.status === 'success');
    
    console.log(`\n📊 Results:`);
    console.log(`   ✅ Successfully processed: ${successful.length} hours`);
    console.log(`   📁 Files generated in: ./uploads/`);
    
    if (successful.length > 0) {
      console.log('\n📁 Generated files:');
      successful.forEach(hour => {
        if (hour && hour.file_path) {
          console.log(`   📄 ${hour.file_path}`);
        }
      });
    }
    
    console.log('\n🎉 Test completed! The service is now ready to use with your existing data.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Alternative configuration for cloud storage
async function setupWithCloudStorage() {
  console.log('☁️ Setting up with cloud storage (S3 example)');
  
  await init({
    dbUri: 'mongodb://localhost:27017/dynamite-lifestyle-prod-app',
    uploadProvider: 's3',
    
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-access-key',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-key',
      region: 'us-east-1',
      bucket: 'your-logs-bucket'
    },
    
    apiLogs: {
      existingCollection: {
        name: 'apilogs',
        timestampField: 'request_time'
      }
    },
    
    fileFormat: 'json',
    logging: { level: 'info', enableConsole: true }
  });
  
  console.log('✅ Service configured for S3 upload');
}

// Function to inspect your data before setting up
async function inspectData() {
  console.log('🔍 Inspecting your apilogs collection...');
  
  await init({
    dbUri: 'mongodb://localhost:27017/dynamite-lifestyle-prod-app',
    uploadProvider: 'local',
    apiLogs: {
      existingCollection: {
        name: 'apilogs',
        timestampField: 'request_time'
      }
    }
  });
  
  // Get sample data to understand structure
  const mongoose = require('mongoose');
  const collection = mongoose.connection.collection('apilogs');
  
  const sample = await collection.findOne();
  const count = await collection.countDocuments();
  
  console.log(`📊 Total documents: ${count}`);
  console.log('📄 Sample document fields:', Object.keys(sample || {}));
  
  // Check date range
  const oldest = await collection.findOne({}, { sort: { request_time: 1 } });
  const newest = await collection.findOne({}, { sort: { request_time: -1 } });
  
  if (oldest?.request_time && newest?.request_time) {
    console.log(`📅 Date range: ${oldest.request_time} to ${newest.request_time}`);
  }
}

// Export for use in other files
export { setupWithExistingApiLogs, setupWithCloudStorage, inspectData };

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'setup';
  
  switch (command) {
    case 'setup':
      setupWithExistingApiLogs().catch(console.error);
      break;
    case 'cloud':
      setupWithCloudStorage().catch(console.error);
      break;
    case 'inspect':
      inspectData().catch(console.error);
      break;
    default:
      console.log(`
🚀 Available commands:
  npm run practical:setup   - Setup with your existing apilogs collection
  npm run practical:cloud   - Setup with cloud storage (S3 example)
  npm run practical:inspect - Inspect your data structure
      `);
  }
}
