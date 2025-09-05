# 🌩️ AWS S3 Setup Guide - Cron Log Service

Complete guide to set up and test the logstack with AWS S3 storage.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS IAM Setup](#aws-iam-setup)
3. [S3 Bucket Setup](#s3-bucket-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing with AWS](#testing-with-aws)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 📋 Prerequisites

### Required Tools

- Node.js (v16 or higher)
- AWS Account
- MongoDB instance
- AWS CLI (optional but recommended)

### Install AWS CLI (Optional)

```bash
# Windows
winget install Amazon.AWSCLI

# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

---

## 🔐 AWS IAM Setup

### Step 1: Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. User name: `logstack-user`
4. Select **Programmatic access**
5. Click **Next**

### Step 2: Attach S3 Permissions

**Option A: Use AWS Managed Policy (Simple)**

1. Attach policy: `AmazonS3FullAccess`

**Option B: Create Custom Policy (Recommended)**

1. Click **Create policy**
2. Use this JSON policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

3. Policy name: `CronLogServiceS3Policy`
4. Attach this policy to your user

### Step 3: Get Access Keys

1. After creating user, copy:
   - **Access Key ID**
   - **Secret Access Key**
2. Store these securely - you'll need them for configuration

---

## 📦 S3 Bucket Setup

### Step 1: Create S3 Bucket

1. Go to [S3 Console](https://console.aws.amazon.com/s3/)
2. Click **Create bucket**
3. Bucket name: `your-app-name-logs` (must be globally unique)
4. Region: Choose your preferred region (e.g., `us-east-1`)
5. Keep default settings for now
6. Click **Create bucket**

### Step 2: Configure Bucket Policy (Optional)

For additional security, add this bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CronLogServiceAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/logstack-user"
      },
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Sid": "CronLogServiceListAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/logstack-user"
      },
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

---

## ⚙️ Environment Configuration

### Step 1: Create .env File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Step 2: Configure AWS Settings

Edit your `.env` file:

```env
# Database
DB_URI=mongodb://localhost:27017/logstack

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIA...your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET=your-app-name-logs

# Service Configuration
OUTPUT_DIR=production-logs
JOBS_COLLECTION=prod_jobs
LOGS_COLLECTION=prod_logs

# Environment
NODE_ENV=production
```

### Step 3: Verify Configuration

Test your AWS credentials:

```bash
# If you have AWS CLI installed
aws s3 ls s3://your-bucket-name

# Expected output: (empty or list of objects)
```

---

## 🧪 Testing with AWS

### Step 1: Basic AWS Test

Run the AWS test script:

```bash
# Basic AWS testing
npm run test:aws

# Or directly
node -r ts-node/register examples/testAWS.ts
```

### Step 2: Performance Testing

```bash
# Include performance tests
node -r ts-node/register examples/testAWS.ts --performance
```

### Step 3: Multi-Region Testing

```bash
# Test different AWS regions
node -r ts-node/register examples/testAWS.ts --regions
```

### Step 4: Show Usage Examples

```bash
# Show implementation examples
node -r ts-node/register examples/testAWS.ts --examples
```

---

## 🚀 Production Deployment

### Development Configuration

```typescript
const devConfig: Config = {
  dbUri: "mongodb://localhost:27017/myapp_dev",
  uploadProvider: "s3",
  outputDirectory: "dev-logs",
  collections: {
    jobsCollectionName: "dev_jobs",
    logsCollectionName: "dev_logs",
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: "us-east-1",
    bucket: "myapp-dev-logs",
  },
};
```

### Production Configuration

```typescript
const prodConfig: Config = {
  dbUri: process.env.PROD_DB_URI!,
  uploadProvider: "s3",
  outputDirectory: "production-logs",
  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
    bucket: process.env.S3_BUCKET!,
  },
  logging: {
    level: "warn",
    enableConsole: false,
    enableFile: true,
  },
};
```

### Environment-Based Initialization

```typescript
import { init } from "logstack";

function createAWSConfig() {
  const env = process.env.NODE_ENV || "development";

  return {
    dbUri: process.env.DB_URI!,
    uploadProvider: "s3" as const,
    outputDirectory: process.env.OUTPUT_DIR || `${env}-logs`,
    collections: {
      jobsCollectionName: process.env.JOBS_COLLECTION || `${env}_jobs`,
      logsCollectionName: process.env.LOGS_COLLECTION || `${env}_logs`,
    },
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region: process.env.AWS_REGION || "us-east-1",
      bucket: process.env.S3_BUCKET!,
    },
    logging: {
      level: env === "production" ? "warn" : "info",
      enableConsole: env !== "production",
      enableFile: env === "production",
    },
  };
}

// Initialize
async function startService() {
  const config = createAWSConfig();
  await init(config);
  console.log(`✅ Service started with S3 bucket: ${config.s3.bucket}`);
}

startService();
```

---

## 🔧 Troubleshooting

### Common Issues

#### ❌ "Access Denied" Error

**Problem**: Insufficient S3 permissions
**Solution**:

1. Check IAM user has correct S3 permissions
2. Verify bucket policy allows your IAM user
3. Ensure bucket name is correct

#### ❌ "Bucket does not exist" Error

**Problem**: Bucket name incorrect or doesn't exist
**Solution**:

1. Verify bucket name in AWS S3 console
2. Check region matches bucket region
3. Ensure bucket name is globally unique

#### ❌ "Invalid credentials" Error

**Problem**: AWS credentials are incorrect
**Solution**:

1. Verify Access Key ID and Secret Access Key
2. Check credentials haven't expired
3. Ensure no extra spaces in .env file

#### ❌ "Region mismatch" Error

**Problem**: Bucket region doesn't match configured region
**Solution**:

1. Check bucket region in S3 console
2. Update AWS_REGION in .env file
3. Or create bucket in desired region

### Debug Mode

Enable detailed logging:

```typescript
const debugConfig = {
  // ... other config
  logging: {
    level: "debug",
    enableConsole: true,
    enableFile: true,
  },
};
```

### Test Connectivity

```bash
# Test AWS credentials
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://your-bucket-name

# Test upload
echo "test" | aws s3 cp - s3://your-bucket-name/test.txt
```

---

## 📊 S3 File Structure

Your files will be organized in S3 like this:

```
s3://your-bucket-name/
├── production-logs/
│   ├── 2025-08-25/
│   │   ├── 00-01.json
│   │   ├── 01-02.json
│   │   └── ...
│   └── 2025-08-26/
├── dev-logs/
│   └── 2025-08-25/
└── analytics-exports/
    └── 2025-08-25/
```

---

## 💰 Cost Optimization

### S3 Cost Tips

1. **Use appropriate storage class**:

   ```typescript
   s3: {
     // ... other config
     storageClass: "STANDARD_IA"; // For infrequent access
   }
   ```

2. **Set lifecycle policies** in S3 console:

   - Move to IA after 30 days
   - Move to Glacier after 90 days
   - Delete after 365 days

3. **Monitor usage** with AWS Cost Explorer

---

## 🎯 Next Steps

1. **✅ Complete AWS setup** following this guide
2. **🧪 Run tests** to verify everything works
3. **🚀 Deploy to production** with proper environment configuration
4. **📊 Monitor S3 usage** and costs
5. **🔄 Set up lifecycle policies** for cost optimization

---

**🎉 Your AWS S3 integration is now ready for production use!**

For additional help, check:

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
