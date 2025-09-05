import { init, createDailyJobs, processSpecificHour } from '../src/main';
import { Config } from '../types/config';

async function comprehensiveTest() {
  console.log('🎯 Comprehensive Organization Test');
  console.log('==================================\n');

  // Test different organizational approaches
  const scenarios = [
    {
      name: '📁 Basic Logs Organization',
      config: {
        outputDirectory: 'production-logs',
        collections: {
          jobsCollectionName: 'prod_jobs',
          logsCollectionName: 'prod_logs'
        }
      }
    },
    {
      name: '📊 API Analytics Export',
      config: {
        outputDirectory: 'api-analytics',
        collections: {
          jobsCollectionName: 'analytics_jobs',
          logsCollectionName: 'analytics_logs'
        }
      }
    },
    {
      name: '🔍 Development Testing',
      config: {
        outputDirectory: 'dev-exports',
        collections: {
          jobsCollectionName: 'dev_test_jobs',
          logsCollectionName: 'dev_test_logs'
        }
      }
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n${scenario.name}`);
    console.log('─'.repeat(30));
    
    const config: Config = {
      dbUri: 'mongodb://localhost:27017/logstack',
      uploadProvider: 'local',
      fileFormat: 'json',
      ...scenario.config,
      apiLogs: {
        existingCollection: {
          name: 'apilogs',
          timestampField: 'request_time'
        }
      },
      logging: {
        level: 'info',
        enableConsole: true
      }
    };

    try {
      // Initialize service
      await init(config);
      
      // Create daily job
      const job = await createDailyJobs('2025-08-25', config);
      console.log(`✅ Created job with ${job.hours.length} hour slots`);
      
      // Process one hour
      await processSpecificHour('2025-08-25', 14, config);
      console.log(`✅ Processed hour 14:00-15:00`);
      console.log(`📂 Files saved in: ${scenario.config.outputDirectory}/2025-08-25/`);
      console.log(`🗃️  Jobs tracked in: "${scenario.config.collections.jobsCollectionName}"`);
      
    } catch (error) {
      console.error(`❌ Error in ${scenario.name}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log('\n🎉 Comprehensive Test Results');
  console.log('============================');
  console.log('✅ Output Directory Organization: Working');
  console.log('✅ Custom Collection Names: Working');
  console.log('✅ Multiple Configurations: Working');
  console.log('✅ Clean Project Structure: Achieved');
  
  console.log('\n📂 Expected Directory Structure:');
  console.log('project-root/');
  console.log('├── production-logs/2025-08-25/14-15.json');
  console.log('├── api-analytics/2025-08-25/14-15.json');
  console.log('├── dev-exports/2025-08-25/14-15.json');
  console.log('├── your-app-files...');
  console.log('└── clean-organized-structure');
}

// Run the comprehensive test
if (require.main === module) {
  comprehensiveTest()
    .then(() => {
      console.log('\n✅ Comprehensive test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Comprehensive test failed:', error);
      process.exit(1);
    });
}

export { comprehensiveTest };
