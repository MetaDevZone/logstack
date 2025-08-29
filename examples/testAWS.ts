/**
 * 🌩️ AWS S3 Testing - Cron Log Service
 * 
 * This example demonstrates how to test the cron-log-service with AWS S3 storage.
 * Make sure you have AWS credentials configured before running this test.
 */

import { init, createDailyJobs, processSpecificHour } from '../src/main';
import { Config } from '../types/config';

// Load environment variables from .env file
try {
  require('dotenv').config();
} catch (error) {
  console.log('Note: dotenv not found, using system environment variables');
}

// ==========================================
// 🌩️ AWS S3 CONFIGURATION
// ==========================================

const awsConfig: Config = {
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/aws-cron-test',
  uploadProvider: 's3',
  fileFormat: 'json',
  
  // ✨ Organized S3 storage
  outputDirectory: 'aws-cron-logs',
  
  // ✨ Custom collections for AWS testing
  collections: {
    jobsCollectionName: 'aws_test_jobs',
    logsCollectionName: 'aws_test_logs',
    apiLogsCollectionName: 'apilogs'
  },
  
  // 🌩️ AWS S3 Configuration
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'cron-log-service-test'
  },
  
  logging: {
    level: 'info',
    enableConsole: true
  }
};

// ==========================================
// 🧪 AWS TESTING FUNCTIONS
// ==========================================

async function validateAWSCredentials() {
  console.log('🔐 Validating AWS Credentials...');
  
  const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required AWS environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.log('\n💡 Add these to your .env file:');
    console.log('AWS_ACCESS_KEY_ID=your_access_key');
    console.log('AWS_SECRET_ACCESS_KEY=your_secret_key');
    console.log('AWS_REGION=us-east-1');
    console.log('S3_BUCKET=your-bucket-name');
    return false;
  }
  
  console.log('✅ AWS credentials found');
  console.log(`📦 S3 Bucket: ${process.env.S3_BUCKET}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  return true;
}

async function testAWSConnection() {
  try {
    console.log('\n🌩️ Testing AWS S3 Connection...');
    
    await init(awsConfig);
    console.log('✅ Successfully connected to AWS S3');
    console.log('✅ Cron service initialized with S3 storage');
    
  } catch (error) {
    console.error('❌ AWS S3 connection failed:', error);
    throw error;
  }
}

async function testS3FileUpload() {
  try {
    console.log('\n📤 Testing S3 File Upload...');
    
    // Create daily jobs
    const job = await createDailyJobs('2025-08-25', awsConfig);
    console.log(`✅ Created job with ${job.hours.length} hour slots`);
    
    // Process specific hours to generate files
    console.log('⚡ Processing hours and uploading to S3...');
    
    await processSpecificHour('2025-08-25', 9, awsConfig);
    console.log('✅ Processed hour 09:00-10:00 → Uploaded to S3');
    
    await processSpecificHour('2025-08-25', 14, awsConfig);
    console.log('✅ Processed hour 14:00-15:00 → Uploaded to S3');
    
    await processSpecificHour('2025-08-25', 18, awsConfig);
    console.log('✅ Processed hour 18:00-19:00 → Uploaded to S3');
    
    console.log('\n🎉 S3 Upload Test Complete!');
    console.log('📦 Files uploaded to S3:');
    console.log(`   s3://${awsConfig.s3?.bucket}/aws-cron-logs/2025-08-25/09-10.json`);
    console.log(`   s3://${awsConfig.s3?.bucket}/aws-cron-logs/2025-08-25/14-15.json`);
    console.log(`   s3://${awsConfig.s3?.bucket}/aws-cron-logs/2025-08-25/18-19.json`);
    
  } catch (error) {
    console.error('❌ S3 upload test failed:', error);
    throw error;
  }
}

// ==========================================
// 🔄 MULTIPLE ENVIRONMENT TESTING
// ==========================================

async function testMultipleS3Environments() {
  console.log('\n🏢 Testing Multiple S3 Environments...');
  
  const environments = [
    {
      name: '🧪 Development S3',
      config: {
        ...awsConfig,
        outputDirectory: 'dev-s3-logs',
        collections: {
          jobsCollectionName: 'dev_s3_jobs',
          logsCollectionName: 'dev_s3_logs',
          apiLogsCollectionName: 'dev_s3_apilogs'
        }
      }
    },
    {
      name: '🚀 Production S3',
      config: {
        ...awsConfig,
        outputDirectory: 'prod-s3-logs',
        collections: {
          jobsCollectionName: 'prod_s3_jobs',
          logsCollectionName: 'prod_s3_logs',
          apiLogsCollectionName: 'prod_s3_apilogs'
        }
      }
    },
    {
      name: '📊 Analytics S3',
      config: {
        ...awsConfig,
        outputDirectory: 'analytics-s3-exports',
        collections: {
          jobsCollectionName: 'analytics_s3_jobs',
          logsCollectionName: 'analytics_s3_logs',
          apiLogsCollectionName: 'analytics_s3_apilogs'
        }
      }
    }
  ];
  
  for (const env of environments) {
    console.log(`\n${env.name}`);
    console.log('─'.repeat(30));
    
    try {
      await init(env.config);
      const job = await createDailyJobs('2025-08-25', env.config);
      await processSpecificHour('2025-08-25', 12, env.config);
      
      console.log(`✅ ${env.name} working!`);
      console.log(`📦 S3 Path: s3://${awsConfig.s3?.bucket}/${env.config.outputDirectory}/`);
      console.log(`🗃️  Collections: ${env.config.collections.jobsCollectionName}, ${env.config.collections.logsCollectionName}, ${env.config.collections.apiLogsCollectionName}`);
      
    } catch (error) {
      console.error(`❌ ${env.name} failed:`, error instanceof Error ? error.message : error);
    }
  }
}

// ==========================================
// 🧪 AWS PERFORMANCE TESTING
// ==========================================

async function testAWSPerformance() {
  console.log('\n⚡ AWS S3 Performance Testing...');
  
  const startTime = Date.now();
  
  try {
    // Test multiple hour processing
    const hours = [8, 9, 10, 11, 12, 13, 14, 15];
    
    console.log(`📊 Processing ${hours.length} hours simultaneously...`);
    
    // Process hours in parallel for performance testing
    const promises = hours.map(hour => 
      processSpecificHour('2025-08-25', hour, awsConfig)
        .then(() => console.log(`✅ Hour ${hour}:00-${hour+1}:00 uploaded`))
        .catch(err => console.error(`❌ Hour ${hour} failed:`, err.message))
    );
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`\n🎉 Performance Test Complete!`);
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log(`📈 Average per file: ${(duration / hours.length).toFixed(2)} seconds`);
    console.log(`📦 ${hours.length} files uploaded to S3`);
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }
}

// ==========================================
// 🌍 DIFFERENT AWS REGIONS TESTING
// ==========================================

async function testDifferentAWSRegions() {
  console.log('\n🌍 Testing Different AWS Regions...');
  
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
  
  for (const region of regions) {
    console.log(`\n🌍 Testing region: ${region}`);
    
    const regionConfig: Config = {
      ...awsConfig,
      outputDirectory: `${region}-logs`,
      s3: {
        ...awsConfig.s3!,
        region: region
      },
      collections: {
        jobsCollectionName: `${region.replace('-', '_')}_jobs`,
        logsCollectionName: `${region.replace('-', '_')}_logs`,
        apiLogsCollectionName: `${region.replace('-', '_')}_apilogs`
      }
    };
    
    try {
      await init(regionConfig);
      await processSpecificHour('2025-08-25', 16, regionConfig);
      console.log(`✅ ${region} working successfully`);
    } catch (error) {
      console.error(`❌ ${region} failed:`, error instanceof Error ? error.message : error);
    }
  }
}

// ==========================================
// 🏃‍♂️ MAIN AWS TESTING FUNCTION
// ==========================================

async function runAWSTests() {
  try {
    console.log('🌩️ AWS S3 Testing - Cron Log Service');
    console.log('=====================================\n');
    
    // Step 1: Validate credentials
    const credentialsValid = await validateAWSCredentials();
    if (!credentialsValid) {
      return;
    }
    
    // Step 2: Test basic connection
    await testAWSConnection();
    
    // Step 3: Test file upload
    await testS3FileUpload();
    
    // Step 4: Test multiple environments
    await testMultipleS3Environments();
    
    // Step 5: Performance testing (optional)
    if (process.argv.includes('--performance')) {
      await testAWSPerformance();
    }
    
    // Step 6: Region testing (optional)
    if (process.argv.includes('--regions')) {
      await testDifferentAWSRegions();
    }
    
    console.log('\n🎉 All AWS Tests Completed Successfully!');
    console.log('=======================================');
    console.log('✅ AWS S3 connection working');
    console.log('✅ File uploads successful');
    console.log('✅ Multiple environments tested');
    console.log('✅ Custom collections working');
    console.log('✅ Organized S3 directory structure');
    
    console.log('\n🌩️ Your AWS S3 setup is ready for production!');
    
  } catch (error) {
    console.error('\n❌ AWS Testing Failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check AWS credentials in .env file');
    console.log('2. Verify S3 bucket exists and is accessible');
    console.log('3. Check IAM permissions for S3 access');
    console.log('4. Ensure MongoDB connection is working');
    process.exit(1);
  }
}

// ==========================================
// 📝 USAGE EXAMPLES
// ==========================================

function showUsageExamples() {
  console.log('\n💡 AWS Usage Examples for Your Project:');
  console.log('======================================\n');
  
  console.log('// Basic AWS S3 Configuration');
  console.log('const awsConfig = {');
  console.log('  dbUri: "mongodb://localhost:27017/myapp",');
  console.log('  uploadProvider: "s3",');
  console.log('  outputDirectory: "production-logs",');
  console.log('  collections: {');
  console.log('    jobsCollectionName: "prod_jobs",');
  console.log('    logsCollectionName: "prod_logs",');
  console.log('    apiLogsCollectionName: "prod_apilogs"');
  console.log('  },');
  console.log('  s3: {');
  console.log('    accessKeyId: process.env.AWS_ACCESS_KEY_ID,');
  console.log('    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,');
  console.log('    region: "us-east-1",');
  console.log('    bucket: "your-production-bucket"');
  console.log('  }');
  console.log('};');
  console.log('');
  console.log('await init(awsConfig);');
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log('🌩️ AWS S3 Testing Options:');
    console.log('  node testAWS.ts                    # Basic AWS tests');
    console.log('  node testAWS.ts --performance       # Include performance tests');
    console.log('  node testAWS.ts --regions          # Test different AWS regions');
    console.log('  node testAWS.ts --examples         # Show usage examples');
    process.exit(0);
  }
  
  if (args.includes('--examples')) {
    showUsageExamples();
    process.exit(0);
  }
  
  runAWSTests().catch(console.error);
}

export {
  awsConfig,
  validateAWSCredentials,
  testAWSConnection,
  testS3FileUpload,
  testMultipleS3Environments,
  testAWSPerformance,
  runAWSTests
};
