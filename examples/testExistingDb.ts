import { init, createDailyJobs, runHourlyJob, getLogs, getJobStatus } from '../index';
import mongoose from 'mongoose';

// Example of connecting to existing database with logs
async function testWithExistingLogs() {
  console.log('🚀 Testing with existing logs from database...');

  // Initialize the service with your existing database
  await init({
    dbUri: 'mongodb://localhost:27017/dynamite-lifestyle-prod-app', // Replace with your actual DB name
    uploadProvider: 'local',
    fileFormat: 'json',
    logging: {
      level: 'info',
      enableConsole: true,
    }
  });

  console.log('✅ Service initialized');

  // Create daily jobs for today
  const today = new Date().toISOString().slice(0, 10);
  console.log(`📅 Creating daily jobs for ${today}`);
  
  await createDailyJobs(today);
  console.log('✅ Daily jobs created');

  // Manually run hourly job to test file processing
  console.log('⚡ Running hourly job manually...');
  
  const config = {
    dbUri: 'mongodb://localhost:27017/dynamite-lifestyle-prod-app',
    uploadProvider: 'local' as const,
    fileFormat: 'json' as const,
  };

  await runHourlyJob(config);
  console.log('✅ Hourly job completed');

  // Check job status
  const status = await getJobStatus(today);
  console.log('📊 Job Status:', status.slice(0, 3)); // Show first 3 hours

  // Check logs
  const logs = await getLogs(today);
  console.log('📝 Processing Logs:', logs.length, 'entries');

  console.log('🎉 Test completed successfully!');
}

// Run the test
testWithExistingLogs().catch(console.error);
