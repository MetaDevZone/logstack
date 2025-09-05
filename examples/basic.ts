import { init, createDailyJobs, runHourlyJob, getLogs, getJobStatus } from '../index';

async function main() {
  console.log('🚀 Starting basic logstack test...');
  
  await init({
    dbUri: 'mongodb://localhost:27017/cronlog', // Your database name here
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
  await createDailyJobs();
  
  console.log('⚡ Running hourly job...');
  const config = {
    dbUri: 'mongodb://localhost:27017/cronlog',
    uploadProvider: 'local' as const,
    fileFormat: 'json' as const,
  };
  await runHourlyJob(config);
  
  const logs = await getLogs();
  const status = await getJobStatus();
  console.log('📝 Processing Logs:', logs.length, 'entries');
  console.log('📊 Job Status:', status.slice(0, 3)); // Show first 3 hours
  
  console.log('\n📁 Generated files should be in:');
  console.log(`   ${process.cwd()}\\${today}\\`);
  console.log('\n🎉 Basic test completed!');
}

main().catch(console.error);
