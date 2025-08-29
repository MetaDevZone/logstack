import { init, createDailyJobs, processSpecificHour } from '../src/main';
import { Config } from '../types/config';

async function testOutputDirectory() {
  console.log('📁 Testing Output Directory Configuration');

  const config: Config = {
    dbUri: 'mongodb://localhost:27017/cron-log-service',
    uploadProvider: 'local',
    fileFormat: 'json',
    
    // Custom output directory - files will be saved in logs/{date}/
    outputDirectory: 'logs',
    
    // Custom collection names to avoid conflicts
    collections: {
      jobsCollectionName: 'test_organized_jobs',
      logsCollectionName: 'test_organized_logs'
    },
    
    // Use existing API logs collection
    apiLogs: {
      existingCollection: {
        name: 'apilogs',
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
    console.log('✅ Service initialized with organized output directory');

    // Create jobs for today
    console.log('\n📅 Creating daily jobs...');
    const job = await createDailyJobs('2025-08-25', config);
    console.log(`✅ Created job for 2025-08-25 with ${job.hours.length} hours`);

    // Process specific hours to generate files
    console.log('\n⏰ Processing specific hours...');
    
    await processSpecificHour('2025-08-25', 10, config); // 10:00-11:00
    console.log('✅ Processed hour 10:00-11:00');

    await processSpecificHour('2025-08-25', 11, config); // 11:00-12:00
    console.log('✅ Processed hour 11:00-12:00');

    console.log('\n🎉 Output directory test completed successfully!');
    console.log('\n📊 Files Organization:');
    console.log(`• Files saved in: ${config.outputDirectory}/2025-08-25/`);
    console.log(`• Jobs tracked in: "${config.collections?.jobsCollectionName}"`);
    console.log(`• Logs stored in: "${config.collections?.logsCollectionName}"`);
    
    console.log('\n📂 Expected Directory Structure:');
    console.log('logs/');
    console.log('├── 2025-08-25/');
    console.log('│   ├── 10-11.json');
    console.log('│   └── 11-12.json');
    console.log('└── (other dates)...');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test with different output directories
async function testDifferentDirectories() {
  console.log('\n\n📁 Testing Different Output Directories');
  
  const configs = [
    { name: 'uploads', dir: 'uploads' },
    { name: 'processed-logs', dir: 'processed-logs' },
    { name: 'api-exports', dir: 'api-exports' }
  ];
  
  for (const { name, dir } of configs) {
    console.log(`\n📁 Testing directory: ${dir}`);
    
    const config: Config = {
      dbUri: 'mongodb://localhost:27017/cron-log-service',
      uploadProvider: 'local',
      outputDirectory: dir,
      collections: {
        jobsCollectionName: `test_${name.replace('-', '_')}_jobs`,
        logsCollectionName: `test_${name.replace('-', '_')}_logs`
      },
      apiLogs: {
        existingCollection: {
          name: 'apilogs',
          timestampField: 'request_time'
        }
      }
    };
    
    await init(config);
    const job = await createDailyJobs(`2025-08-25-${name}`, config);
    await processSpecificHour(`2025-08-25-${name}`, 12, config);
    
    console.log(`✅ Files created in: ${dir}/2025-08-25-${name}/`);
  }
}

// Run the examples
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'multiple') {
    testDifferentDirectories()
      .then(() => {
        console.log('\n✅ Multiple directory test completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Multiple directory test failed:', error);
        process.exit(1);
      });
  } else {
    testOutputDirectory()
      .then(() => {
        console.log('\n✅ Output directory test completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Output directory test failed:', error);
        process.exit(1);
      });
  }
}

export { testOutputDirectory, testDifferentDirectories };
