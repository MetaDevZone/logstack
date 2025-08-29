import { 
  init, 
  createDailyJobs, 
  runHourlyJob, 
  getLogs, 
  getJobStatus,
  retryFailedJobs,
  validateConfig,
  isInitialized 
} from '../index';

async function advancedExample() {
  console.log('=== Advanced Configuration Example ===');

  const config = {
    dbUri: 'mongodb://localhost:27017/cronlog_advanced',
    uploadProvider: 's3' as const,
    fileFormat: 'json' as const,
    retryAttempts: 5,
    dailyCron: '0 0 * * *',  // Daily at midnight
    hourlyCron: '0 * * * *', // Every hour
    timezone: 'America/New_York',
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      region: 'us-east-1',
      bucket: 'my-logs-bucket',
    },
    logging: {
      level: 'debug' as const,
      enableConsole: true,
      enableFile: true,
      logFilePath: './logs/advanced.log'
    }
  };

  // Validate configuration before initialization
  const validation = validateConfig(config);
  if (!validation.isValid) {
    console.error('Configuration errors:', validation.errors);
    return;
  }

  // Initialize the service
  await init(config);
  
  console.log('Service initialized:', isInitialized());

  // Create jobs for today and tomorrow
  await createDailyJobs(); // Today
  await createDailyJobs('2025-08-26'); // Tomorrow

  // Manually run hourly job for testing
  await runHourlyJob(config);

  // Check job status
  const todayStatus = await getJobStatus('2025-08-25');
  console.log('Today\'s job status:', todayStatus.slice(0, 3)); // Show first 3 hours

  // Get logs for specific hour
  const logs = await getLogs('2025-08-25', '09-10');
  console.log('Logs for 09-10:', logs);

  // Retry any failed jobs
  await retryFailedJobs(config);

  console.log('Advanced example completed');
}

advancedExample().catch(console.error);
