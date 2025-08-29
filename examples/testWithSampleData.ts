import { init, createDailyJobs, runHourlyJob, saveApiLog } from '../index';

async function setupTestData() {
  console.log('🔄 Setting up test data...');

  // Initialize the service
  await init({
    dbUri: 'mongodb://localhost:27017/cronlog_test',
    uploadProvider: 'local',
    fileFormat: 'json',
    logging: {
      level: 'debug',
      enableConsole: true,
    }
  });

  // Create some sample API logs for testing
  const testDate = new Date();
  const hours = [8, 9, 10, 11, 12]; // Test hours

  for (const hour of hours) {
    const logTime = new Date(testDate);
    logTime.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    // Create multiple logs per hour
    for (let i = 0; i < 5; i++) {
      await saveApiLog({
        request_time: new Date(logTime.getTime() + i * 60000), // Spread across the hour
        response_time: new Date(logTime.getTime() + i * 60000 + 100), // 100ms response time
        method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
        path: `/api/test/${i}`,
        requestBody: { test: `data-${i}` },
        requestHeaders: { 'user-agent': 'test-client' },
        responseStatus: Math.random() > 0.1 ? 200 : 500, // 90% success rate
        requestQuery: { page: i },
        requestParams: { id: i },
        client_ip: '127.0.0.1',
        client_agent: 'Mozilla/5.0 Test Browser',
        responseBody: { success: true, data: `result-${i}` },
      });
    }
  }

  console.log('✅ Test data created successfully!');
  console.log(`📊 Created logs for hours: ${hours.join(', ')}`);
}

async function testProcessing() {
  console.log('\n🚀 Testing log processing...');

  const config = {
    dbUri: 'mongodb://localhost:27017/cronlog_test',
    uploadProvider: 'local' as const,
    fileFormat: 'json' as const,
  };

  // Create daily jobs
  const today = new Date().toISOString().slice(0, 10);
  await createDailyJobs(today);
  console.log('✅ Daily jobs created');

  // Process current hour (will process previous hour's data)
  await runHourlyJob(config);
  console.log('✅ Hourly job processed');

  console.log('\n📁 Check the following directory for generated files:');
  console.log(`   ${process.cwd()}\\${today}\\`);
  console.log('\n🎉 Test completed! Files should be generated with your log data.');
}

async function main() {
  try {
    await setupTestData();
    await testProcessing();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
