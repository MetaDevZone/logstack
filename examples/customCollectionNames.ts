import { init, createDailyJobs, processSpecificHour } from '../src/main';
import { Config } from '../types/config';

async function customCollectionExample() {
  console.log('🚀 Custom Collection Names Example');

  const config: Config = {
    dbUri: 'mongodb://localhost:27017/cron-log-service',
    uploadProvider: 'local',
    fileFormat: 'json',
    retryAttempts: 3,
    
    // Custom collection names to avoid conflicts
    collections: {
      jobsCollectionName: 'my_custom_jobs',      // Instead of default 'jobs'
      logsCollectionName: 'my_custom_logs',      // Instead of default 'logs'
      apiLogsCollectionName: 'my_custom_apilogs' // Instead of default 'apilogs'
    },
    
    // Use existing API logs collection
    apiLogs: {
      existingCollection: {
        name: 'my_api_logs',                     // Your custom API logs collection
        timestampField: 'request_time',
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
    
    logging: {
      level: 'info',
      enableConsole: true
    }
  };

  try {
    // Initialize the service
    await init(config);
    console.log('✅ Service initialized with custom collection names');

    // Create jobs for specific dates
    console.log('\n📅 Creating daily jobs...');
    const job1 = await createDailyJobs('2025-08-25', config);
    console.log(`✅ Created job for 2025-08-25 with ${job1.hours.length} hours`);

    // Process specific hours
    console.log('\n⏰ Processing specific hours...');
    await processSpecificHour('2025-08-25', 14, config); // Process 14:00-15:00
    console.log('✅ Processed hour 14:00-15:00');

    await processSpecificHour('2025-08-25', 15, config); // Process 15:00-16:00
    console.log('✅ Processed hour 15:00-16:00');

    console.log('\n🎉 Custom collection example completed successfully!');
    console.log('\n📊 Collection Usage Summary:');
    console.log(`• Jobs stored in: "${config.collections?.jobsCollectionName}"`);
    console.log(`• Logs stored in: "${config.collections?.logsCollectionName}"`);
    console.log(`• API logs read from: "${config.apiLogs?.existingCollection?.name}"`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the example
if (require.main === module) {
  customCollectionExample()
    .then(() => {
      console.log('\n✅ Example completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Example failed:', error);
      process.exit(1);
    });
}

export { customCollectionExample };
