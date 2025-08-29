import { init, createDailyJobs, runHourlyJob, getLogs, getJobStatus } from '../index';
import mongoose from 'mongoose';

// Custom data provider for existing apilogs collection
async function getDataFromExistingApiLogs(date: string, hourRange: string): Promise<any> {
  try {
    console.log(`🔍 Fetching data from 'apilogs' collection for ${date} ${hourRange}`);
    
    // Parse hour range (e.g., "09-10" -> start: 9, end: 10)
    const [startHour, endHour] = hourRange.split('-').map(h => parseInt(h));
    
    // Create date range for the hour
    const startDate = new Date(`${date}T${startHour.toString().padStart(2, '0')}:00:00.000Z`);
    const endDate = new Date(`${date}T${endHour.toString().padStart(2, '0')}:00:00.000Z`);
    
    console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Connect to your database and query the apilogs collection directly
    const db = mongoose.connection.db;
    const apilogsCollection = db.collection('apilogs');
    
    // Query with multiple possible timestamp field names
    // Adjust these field names based on your actual collection structure
    const logs = await apilogsCollection.find({
      $or: [
        {
          timestamp: {
            $gte: startDate,
            $lt: endDate
          }
        },
        {
          request_time: {
            $gte: startDate,
            $lt: endDate
          }
        },
        {
          createdAt: {
            $gte: startDate,
            $lt: endDate
          }
        },
        {
          created_at: {
            $gte: startDate,
            $lt: endDate
          }
        }
      ]
    }).sort({ timestamp: 1 }).toArray();
    
    console.log(`✅ Found ${logs.length} logs for ${hourRange} hour`);
    
    // Log first few records to see the structure
    if (logs.length > 0) {
      console.log('📄 Sample log structure:', Object.keys(logs[0]));
      console.log('📄 First log:', JSON.stringify(logs[0], null, 2).substring(0, 200) + '...');
    }
    
    return logs;
  } catch (error) {
    console.error('❌ Error fetching data from apilogs collection:', error);
    return [];
  }
}

// Test with your existing apilogs collection
async function testWithExistingApiLogs() {
  console.log('🚀 Testing with existing apilogs collection...');

  // Replace with your actual database name
  const dbName = 'dynamite-lifestyle-prod-app'; // Change this to your database name
  
  await init({
    dbUri: `mongodb://localhost:27017/${dbName}`,
    uploadProvider: 'local',
    fileFormat: 'json',
    logging: {
      level: 'info',
      enableConsole: true,
    }
  });

  console.log('✅ Service initialized');

  // Override the default data provider temporarily
  const originalGetDataForHour = require('../lib/userDataProvider').getDataForHour;
  require('../lib/userDataProvider').getDataForHour = getDataFromExistingApiLogs;

  // Create daily jobs for today
  const today = new Date().toISOString().slice(0, 10);
  console.log(`📅 Creating daily jobs for ${today}`);
  
  await createDailyJobs(today);
  console.log('✅ Daily jobs created');

  // Test with a specific hour (you can change this)
  console.log('⚡ Testing with previous hour...');
  
  const config = {
    dbUri: `mongodb://localhost:27017/${dbName}`,
    uploadProvider: 'local' as const,
    fileFormat: 'json' as const,
  };

  await runHourlyJob(config);
  console.log('✅ Hourly job completed');

  // Check what was generated
  const status = await getJobStatus(today);
  console.log('📊 Job Status for first 3 hours:', status.slice(0, 3));

  // Show successful hours
  const successfulHours = status.filter(s => s && s.status === 'success');
  console.log(`✅ Successfully processed ${successfulHours.length} hours`);
  
  if (successfulHours.length > 0) {
    console.log('📁 Files generated:');
    successfulHours.forEach(hour => {
      if (hour && hour.file_path) {
        console.log(`   ${hour.file_path}`);
      }
    });
  }

  console.log('\n📁 Generated files should be in:');
  console.log(`   ${process.cwd()}\\${today}\\`);
  console.log('\n🎉 Test completed successfully!');
}

// Run the test
testWithExistingApiLogs().catch(console.error);
