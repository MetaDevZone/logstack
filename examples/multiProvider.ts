import { init, createDailyJobs, runHourlyJob } from '../index';

async function s3Example() {
  console.log('=== AWS S3 Configuration Example ===');
  
  await init({
    dbUri: 'mongodb://localhost:27017/cronlog',
    uploadProvider: 's3',
    fileFormat: 'json',
    retryAttempts: 3,
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-access-key',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-key',
      region: 'us-east-1',
      bucket: 'your-bucket-name',
    },
    logging: {
      level: 'info',
      enableConsole: true,
      enableFile: true,
      logFilePath: './logs/s3-example.log'
    }
  });

  await createDailyJobs();
  console.log('S3 example setup complete');
}

async function gcsExample() {
  console.log('=== Google Cloud Storage Configuration Example ===');
  
  await init({
    dbUri: 'mongodb://localhost:27017/cronlog',
    uploadProvider: 'gcs',
    fileFormat: 'csv',
    retryAttempts: 5,
    gcs: {
      projectId: 'your-gcp-project-id',
      keyFilename: './path/to/service-account-key.json', // or use credentials object
      bucket: 'your-gcs-bucket-name',
    },
    logging: {
      level: 'debug',
      enableConsole: true,
    }
  });

  await createDailyJobs();
  console.log('GCS example setup complete');
}

async function azureExample() {
  console.log('=== Azure Blob Storage Configuration Example ===');
  
  await init({
    dbUri: 'mongodb://localhost:27017/cronlog',
    uploadProvider: 'azure',
    fileFormat: 'txt',
    retryAttempts: 3,
    azure: {
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || 'DefaultEndpointsProtocol=https;AccountName=...',
      containerName: 'your-container-name',
    },
    logging: {
      level: 'info',
      enableConsole: true,
      enableFile: true,
    }
  });

  await createDailyJobs();
  console.log('Azure example setup complete');
}

async function localExample() {
  console.log('=== Local Storage Configuration Example ===');
  
  await init({
    dbUri: 'mongodb://localhost:27017/cronlog',
    uploadProvider: 'local',
    fileFormat: 'json',
    retryAttempts: 2,
    logging: {
      level: 'info',
      enableConsole: true,
    }
  });

  await createDailyJobs();
  console.log('Local storage example setup complete');
}

// Run examples based on command line argument
const provider = process.argv[2] || 'local';

switch (provider) {
  case 's3':
    s3Example().catch(console.error);
    break;
  case 'gcs':
    gcsExample().catch(console.error);
    break;
  case 'azure':
    azureExample().catch(console.error);
    break;
  case 'local':
    localExample().catch(console.error);
    break;
  default:
    console.log('Usage: node examples/multiProvider.js [s3|gcs|azure|local]');
}
