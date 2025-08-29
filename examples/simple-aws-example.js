/**
 * 🌩️ Simple AWS S3 Implementation Example
 *
 * Copy this configuration to your project to use AWS S3 storage.
 * Make sure to set up your AWS credentials first.
 */

const {
  init,
  createDailyJobs,
  processSpecificHour,
} = require("cron-log-service");
require("dotenv").config();

// ==========================================
// 🌩️ AWS S3 CONFIGURATION
// ==========================================

const awsConfig = {
  dbUri: process.env.DB_URI || "mongodb://localhost:27017/myapp",
  uploadProvider: "s3",
  fileFormat: "json",

  // ✨ Organized S3 storage
  outputDirectory: "production-logs",

  // ✨ Custom collections (avoid conflicts)
  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
    apiLogsCollectionName: "prod_apilogs",
  },

  // 🌩️ AWS S3 Settings
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET || "your-app-logs",
  },

  logging: {
    level: "info",
    enableConsole: true,
  },
};

// ==========================================
// 🚀 IMPLEMENTATION
// ==========================================

async function startAWSCronService() {
  try {
    console.log("🚀 Starting AWS S3 Cron Service");
    console.log("===============================\n");

    // Check required environment variables
    const required = [
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "S3_BUCKET",
    ];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      console.error("❌ Missing required environment variables:");
      missing.forEach((key) => console.error(`   - ${key}`));
      console.log("\n💡 Add these to your .env file:");
      console.log("AWS_ACCESS_KEY_ID=your_access_key");
      console.log("AWS_SECRET_ACCESS_KEY=your_secret_key");
      console.log("S3_BUCKET=your-bucket-name");
      return;
    }

    // Initialize the service
    console.log("📡 Connecting to AWS S3...");
    await init(awsConfig);
    console.log("✅ Connected to AWS S3 successfully");
    console.log(`📦 S3 Bucket: ${awsConfig.s3.bucket}`);
    console.log(`🌍 Region: ${awsConfig.s3.region}`);
    console.log(
      `📁 Files will be organized in: s3://${awsConfig.s3.bucket}/${awsConfig.outputDirectory}/\n`
    );

    // Create daily jobs
    console.log("📅 Creating daily jobs...");
    const job = await createDailyJobs("2025-08-25", awsConfig);
    console.log(`✅ Created job with ${job.hours.length} hour slots\n`);

    // Process some hours to test S3 upload
    console.log("⚡ Processing hours and uploading to S3...");

    await processSpecificHour("2025-08-25", 9, awsConfig);
    console.log("✅ Hour 09:00-10:00 → Uploaded to S3");

    await processSpecificHour("2025-08-25", 14, awsConfig);
    console.log("✅ Hour 14:00-15:00 → Uploaded to S3");

    console.log("\n🎉 AWS S3 Implementation Complete!");
    console.log("==================================");
    console.log("📦 Files uploaded to S3:");
    console.log(
      `   s3://${awsConfig.s3.bucket}/${awsConfig.outputDirectory}/2025-08-25/09-10.json`
    );
    console.log(
      `   s3://${awsConfig.s3.bucket}/${awsConfig.outputDirectory}/2025-08-25/14-15.json`
    );
    console.log("\n🗄️  Database collections:");
    console.log(`   ${awsConfig.collections.jobsCollectionName}`);
    console.log(`   ${awsConfig.collections.logsCollectionName}`);
    console.log("\n🔄 Cron jobs are now running automatically!");
  } catch (error) {
    console.error("❌ AWS S3 service failed:", error);
    console.log("\n💡 Troubleshooting:");
    console.log("1. Check AWS credentials are correct");
    console.log("2. Verify S3 bucket exists and is accessible");
    console.log("3. Check IAM permissions for S3 access");
    console.log("4. Ensure MongoDB connection is working");
  }
}

// ==========================================
// 🏃‍♂️ RUN THE SERVICE
// ==========================================

if (require.main === module) {
  startAWSCronService();
}

// ==========================================
// 📝 USAGE IN YOUR PROJECT
// ==========================================

/*
🎯 To use this in your project:

1. Install dependencies:
   npm install cron-log-service dotenv

2. Create .env file:
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   S3_BUCKET=your-bucket-name
   AWS_REGION=us-east-1
   DB_URI=mongodb://localhost:27017/myapp

3. Copy this configuration:
   const { init } = require('cron-log-service');
   
   const config = {
     dbUri: process.env.DB_URI,
     uploadProvider: 's3',
     outputDirectory: 'your-app-logs',
     collections: {
       jobsCollectionName: 'your_app_jobs',
       logsCollectionName: 'your_app_logs',
       apiLogsCollectionName: 'your_app_apilogs'
     },
     s3: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
       region: process.env.AWS_REGION,
       bucket: process.env.S3_BUCKET
     }
   };
   
   await init(config);

4. Your files will be automatically uploaded to S3!
*/

module.exports = {
  awsConfig,
  startAWSCronService,
};
