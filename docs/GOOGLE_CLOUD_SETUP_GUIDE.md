# 📁 Google Cloud Storage Setup Guide

Complete guide for setting up Google Cloud Storage with the cron-log-service package.

## 🚀 Quick Setup

### 1. Prerequisites

- Google Cloud account with billing enabled
- Node.js 16+ installed
- MongoDB database running

### 2. Create Google Cloud Project

```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL  # Restart shell

# Initialize and authenticate
gcloud init
gcloud auth login
```

### 3. Create Storage Bucket

```bash
# Set project (replace with your project ID)
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Create bucket (choose globally unique name)
export BUCKET_NAME="your-unique-log-bucket"
gsutil mb gs://$BUCKET_NAME

# Set bucket location (optional)
gsutil mb -l us-east1 gs://$BUCKET_NAME
```

### 4. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create log-service-account \
  --display-name="Log Processing Service Account" \
  --description="Service account for automated log processing"

# Get service account email
export SA_EMAIL="log-service-account@$PROJECT_ID.iam.gserviceaccount.com"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.objectAdmin"

# Create and download key file
gcloud iam service-accounts keys create ./gcp-service-account.json \
  --iam-account=$SA_EMAIL
```

### 5. Set Bucket Permissions

```bash
# Grant service account bucket access
gsutil iam ch serviceAccount:$SA_EMAIL:roles/storage.objectAdmin gs://$BUCKET_NAME

# Optional: Set public read access (not recommended for logs)
# gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
```

## ⚙️ Configuration

### Environment Variables

```bash
# .env file
DB_URI=mongodb://localhost:27017/your-app
GCP_PROJECT_ID=your-project-id
GCP_KEY_FILE=./gcp-service-account.json
GCS_BUCKET=your-unique-log-bucket
```

### Application Configuration

```javascript
const { init, createDailyJobs } = require("cron-log-service");

const config = {
  dbUri: process.env.DB_URI,
  uploadProvider: "gcs",
  outputDirectory: "production-logs",

  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
    apiLogsCollectionName: "prod_apilogs",
  },

  gcs: {
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GCP_KEY_FILE,
    bucket: process.env.GCS_BUCKET,
  },

  // Optional: Retry configuration
  retryAttempts: 5,

  // Optional: Logging
  logging: {
    level: "info",
    enableFile: true,
  },
};

async function setupGCS() {
  await init(config);
  await createDailyJobs();
  console.log("✅ Google Cloud Storage integration complete");
}

setupGCS().catch(console.error);
```

## 🔐 Authentication Methods

### Method 1: Service Account Key File (Recommended for Production)

```javascript
const config = {
  gcs: {
    projectId: "your-project-id",
    keyFilename: "./gcp-service-account.json", // Path to key file
    bucket: "your-bucket-name",
  },
};
```

### Method 2: Application Default Credentials (Development)

```bash
# For local development
gcloud auth application-default login
```

```javascript
const config = {
  gcs: {
    projectId: "your-project-id",
    // keyFilename not needed - uses default credentials
    bucket: "your-bucket-name",
  },
};
```

### Method 3: Environment Variable

```bash
export GOOGLE_APPLICATION_CREDENTIALS="./gcp-service-account.json"
```

```javascript
const config = {
  gcs: {
    projectId: "your-project-id",
    // keyFilename not needed - uses env variable
    bucket: "your-bucket-name",
  },
};
```

## 💰 Cost Optimization

### Bucket Lifecycle Management

```bash
# Create lifecycle configuration
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "NEARLINE"
        },
        "condition": {
          "age": 30
        }
      },
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "COLDLINE"
        },
        "condition": {
          "age": 90
        }
      },
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": 2555
        }
      }
    ]
  }
}
EOF

# Apply lifecycle policy
gsutil lifecycle set lifecycle.json gs://$BUCKET_NAME
```

### Storage Classes

- **Standard**: Hot data, frequently accessed
- **Nearline**: Data accessed less than once per month
- **Coldline**: Data accessed less than once per quarter
- **Archive**: Data accessed less than once per year

## 📊 Monitoring & Analytics

### View Bucket Usage

```bash
# Check bucket size
gsutil du -s gs://$BUCKET_NAME

# List recent uploads
gsutil ls -l gs://$BUCKET_NAME/** | tail -10

# Check lifecycle status
gsutil lifecycle get gs://$BUCKET_NAME
```

### Cloud Console Monitoring

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to Cloud Storage → Buckets
3. Click on your bucket name
4. View usage metrics and costs

## 🧪 Testing

### Test Upload

```javascript
const { init, processSpecificHour } = require("cron-log-service");

async function testGCSUpload() {
  await init({
    dbUri: "mongodb://localhost:27017/test",
    uploadProvider: "gcs",
    gcs: {
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEY_FILE,
      bucket: process.env.GCS_BUCKET,
    },
  });

  // Test with current hour
  const today = new Date().toISOString().split("T")[0];
  const currentHour = new Date().getHours();

  try {
    await processSpecificHour(today, currentHour);
    console.log("✅ Test upload successful");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testGCSUpload();
```

### Verify Upload

```bash
# Check if files were uploaded
gsutil ls gs://$BUCKET_NAME/

# Download a test file
gsutil cp gs://$BUCKET_NAME/2025-08-29/14-15.json ./test-download.json
```

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Error**

   ```
   Error: Could not load the default credentials
   ```

   **Solution**: Ensure service account key file exists and path is correct

2. **Permission Denied**

   ```
   Error: Access denied
   ```

   **Solution**: Check service account has Storage Object Admin role

3. **Bucket Not Found**
   ```
   Error: The specified bucket does not exist
   ```
   **Solution**: Verify bucket name and ensure it exists

### Debug Configuration

```javascript
const config = {
  gcs: {
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GCP_KEY_FILE,
    bucket: process.env.GCS_BUCKET,
  },
  logging: {
    level: "debug", // Enable debug logging
    enableConsole: true,
  },
};
```

## 📋 Production Checklist

- [ ] Google Cloud project created and billing enabled
- [ ] Storage bucket created with appropriate location
- [ ] Service account created with minimal required permissions
- [ ] Service account key downloaded and secured
- [ ] Environment variables set correctly
- [ ] Lifecycle policies configured for cost optimization
- [ ] Monitoring and alerting configured
- [ ] Test upload/download successful
- [ ] Backup and disaster recovery plan in place

## 🔗 Additional Resources

- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/service-accounts)
- [Storage Pricing Calculator](https://cloud.google.com/products/calculator)
- [Lifecycle Management Guide](https://cloud.google.com/storage/docs/lifecycle)
