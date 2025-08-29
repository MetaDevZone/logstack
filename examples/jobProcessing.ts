// Job-based processing example for existing "apilogs" collection
import { init, createDailyJobs, runHourlyJob, processSpecificHour, getJobStatus, getConfig } from '../index';

async function createAndProcessJobs() {
  console.log('🔥 Creating and processing jobs with your existing "apilogs" collection');
  
  try {
    // Initialize with your existing collection configuration
    await init({
      // Your database connection
      dbUri: 'mongodb://localhost:27017/dynamite-lifestyle-prod-app',
      
      // Where to store generated files
      uploadProvider: 'local',
      fileFormat: 'json',
      
      // Configure to use your existing "apilogs" collection
      apiLogs: {
        existingCollection: {
          name: 'apilogs',
          timestampField: 'request_time', // Primary timestamp field
          requiredFields: {
            method: 'method',
            path: 'path',
            client_ip: 'client_ip',
            requestBody: 'requestBody',
            responseStatus: 'responseStatus',
            responseBody: 'responseBody'
          }
        }
      },
      
      // Job scheduling configuration
      dailyCron: '0 0 * * *',    // Create jobs at midnight
      hourlyCron: '0 * * * *',   // Process hourly at minute 0
      retryAttempts: 3,
      
      logging: {
        level: 'info',
        enableConsole: true,
        enableFile: true,
        logFilePath: './logs/job-processing.log'
      }
    });

    console.log('✅ Service initialized successfully!');
    
    // Step 1: Create daily jobs for recent dates
    console.log('\n📋 Step 1: Creating daily jobs...');
    await createDailyJobs();
    console.log('✅ Daily jobs created for today');
    
    // Step 2: Create jobs for historical dates (based on your data)
    const historicalDates = [
      '2025-07-25',
      '2025-07-28', 
      '2025-07-31',
      '2025-08-19'
    ];
    
    console.log('\n📅 Step 2: Creating jobs for historical dates...');
    for (const date of historicalDates) {
      console.log(`   Creating jobs for ${date}...`);
      await createDailyJobs(date);
      console.log(`   ✅ Jobs created for ${date}`);
    }
    
    // Step 3: Process specific hours manually 
    console.log('\n⚡ Step 3: Processing specific hours...');
    const config = getConfig();
    
    // Process hour 15 for July 25th (your busiest hour)
    console.log('   Processing 2025-07-25 hour 15 (21 logs expected)...');
    await processSpecificHour('2025-07-25', 15, config);
    
    // Process hour 16 for July 28th
    console.log('   Processing 2025-07-28 hour 16 (7 logs expected)...');
    await processSpecificHour('2025-07-28', 16, config);
    
    // Process hour 12 for August 19th
    console.log('   Processing 2025-08-19 hour 12 (3 logs expected)...');
    await processSpecificHour('2025-08-19', 12, config);
    
    console.log('✅ Manual processing completed');
    
    // Step 4: Check job statuses
    console.log('\n📊 Step 4: Checking job statuses...');
    
    for (const date of historicalDates) {
      console.log(`\n📅 Status for ${date}:`);
      const status = await getJobStatus(date);
      
      const successful = status.filter(s => s && s.status === 'success');
      const failed = status.filter(s => s && s.status === 'failed');
      const pending = status.filter(s => s && s.status === 'pending');
      
      console.log(`   ✅ Successful: ${successful.length} hours`);
      console.log(`   ❌ Failed: ${failed.length} hours`);
      console.log(`   ⏳ Pending: ${pending.length} hours`);
      
      // Show successful files
      if (successful.length > 0) {
        console.log('   📁 Generated files:');
        successful.forEach(hour => {
          if (hour && hour.file_path) {
            console.log(`      📄 ${hour.file_path}`);
          }
        });
      }
    }
    
    // Step 5: Process all remaining pending jobs for a specific date
    console.log('\n⚡ Step 5: Processing all remaining hours for July 25th...');
    const july25Status = await getJobStatus('2025-07-25');
    const pendingHours = july25Status
      .map((status, hour) => status && status.status === 'pending' ? hour : null)
      .filter(hour => hour !== null);
    
    if (pendingHours.length > 0) {
      console.log(`   Found ${pendingHours.length} pending hours: [${pendingHours.join(', ')}]`);
      
      for (const hour of pendingHours) {
        console.log(`   Processing hour ${hour}...`);
        await processSpecificHour('2025-07-25', hour, config);
      }
    } else {
      console.log('   ✅ No pending hours found');
    }
    
    // Final summary
    console.log('\n🎉 Job processing completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Daily jobs created for multiple dates');
    console.log('   ⚡ Specific hours processed manually');
    console.log('   📊 Job statuses checked and reported');
    console.log('   📁 Files generated in ./uploads/ directory');
    
    console.log('\n💡 Next steps:');
    console.log('   - Check the ./uploads/ directory for generated files');
    console.log('   - Set up automated cron jobs for real-time processing');
    console.log('   - Configure cloud storage for production use');
    
  } catch (error) {
    console.error('❌ Error during job processing:', error);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Function to process current hour's data
async function processCurrentHour() {
  console.log('⏰ Processing current hour...');
  
  try {
    await init({
      dbUri: 'mongodb://localhost:27017/dynamite-lifestyle-prod-app',
      uploadProvider: 'local',
      fileFormat: 'json',
      apiLogs: {
        existingCollection: {
          name: 'apilogs',
          timestampField: 'request_time'
        }
      }
    });
    
    // Create today's jobs first
    await createDailyJobs();
    
    // Get current date and hour
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const hour = now.getHours();
    
    console.log(`📅 Processing ${date} hour ${hour}...`);
    
    // Process current hour
    const config = getConfig();
    await processSpecificHour(date, hour, config);
    
    // Check status
    const status = await getJobStatus(date);
    const currentHourStatus = status[hour];
    
    if (currentHourStatus && currentHourStatus.status === 'success') {
      console.log(`✅ Successfully processed current hour`);
      console.log(`📄 File: ${currentHourStatus.file_path}`);
    } else {
      console.log(`❌ Failed to process current hour`);
    }
    
  } catch (error) {
    console.error('❌ Error processing current hour:', error);
  }
}

// Function to create jobs for a specific date range
async function createJobsForDateRange(startDate: string, endDate: string) {
  console.log(`📅 Creating jobs for date range: ${startDate} to ${endDate}`);
  
  try {
    await init({
      dbUri: 'mongodb://localhost:27017/dynamite-lifestyle-prod-app',
      uploadProvider: 'local',
      fileFormat: 'json',
      apiLogs: {
        existingCollection: {
          name: 'apilogs',
          timestampField: 'request_time'
        }
      }
    });
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    
    // Generate array of dates
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(date.toISOString().split('T')[0]);
    }
    
    console.log(`📋 Creating jobs for ${dates.length} dates...`);
    
    for (const date of dates) {
      console.log(`   Creating jobs for ${date}...`);
      await createDailyJobs(date);
    }
    
    console.log('✅ All jobs created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating jobs for date range:', error);
  }
}

// Export for use in other files
export { createAndProcessJobs, processCurrentHour, createJobsForDateRange };

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'create-and-process';
  
  switch (command) {
    case 'create-and-process':
      createAndProcessJobs().catch(console.error);
      break;
    case 'current-hour':
      processCurrentHour().catch(console.error);
      break;
    case 'date-range':
      const startDate = process.argv[3];
      const endDate = process.argv[4];
      if (!startDate || !endDate) {
        console.log('Usage: npm run job:date-range YYYY-MM-DD YYYY-MM-DD');
        process.exit(1);
      }
      createJobsForDateRange(startDate, endDate).catch(console.error);
      break;
    default:
      console.log(`
🚀 Available job commands:
  npm run job:create-and-process  - Create and process jobs for historical data
  npm run job:current-hour        - Process current hour only
  npm run job:date-range <start> <end> - Create jobs for date range
      `);
  }
}
