# 🔷 Azure Blob Storage Setup Guide

Complete guide for setting up Azure Blob Storage with the logstack package.

## 🚀 Quick Setup

### 1. Prerequisites

- Azure account with active subscription
- Node.js 16+ installed
- MongoDB database running

### 2. Install Azure CLI

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi; Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'; rm .\AzureCLI.msi

# macOS
brew update && brew install azure-cli

# Ubuntu/Debian
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login
```

### 3. Create Resource Group

```bash
# Set variables
export RESOURCE_GROUP="logstack-resources"
export LOCATION="eastus"
export STORAGE_ACCOUNT="logstackstorage$(date +%s)" # Unique name
export CONTAINER_NAME="logs"

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

### 4. Create Storage Account

```bash
# Create storage account
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot

# Get connection string
export CONNECTION_STRING=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --output tsv)

echo "Connection String: $CONNECTION_STRING"
```

### 5. Create Blob Container

```bash
# Create container
az storage container create \
  --name $CONTAINER_NAME \
  --connection-string "$CONNECTION_STRING" \
  --public-access off

# Verify container creation
az storage container list \
  --connection-string "$CONNECTION_STRING" \
  --output table
```

## ⚙️ Configuration

### Environment Variables

```bash
# .env file
DB_URI=mongodb://localhost:27017/your-app
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=logstackstorage123;AccountKey=your-account-key;EndpointSuffix=core.windows.net"
AZURE_CONTAINER_NAME=logs
```

### Application Configuration

```javascript
const { init, createDailyJobs } = require("logstack");

const config = {
  dbUri: process.env.DB_URI,
  uploadProvider: "azure",
  outputDirectory: "production-logs",

  collections: {
    jobsCollectionName: "prod_jobs",
    logsCollectionName: "prod_logs",
    apiLogsCollectionName: "prod_apilogs",
  },

  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: process.env.AZURE_CONTAINER_NAME,
  },

  // Optional: Retry configuration
  retryAttempts: 5,

  // Optional: Logging
  logging: {
    level: "info",
    enableFile: true,
  },
};

async function setupAzure() {
  await init(config);
  await createDailyJobs();
  console.log("✅ Azure Blob Storage integration complete");
}

setupAzure().catch(console.error);
```

## 🔐 Authentication Methods

### Method 1: Connection String (Recommended)

```javascript
const config = {
  azure: {
    connectionString:
      "DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net",
    containerName: "logs",
  },
};
```

### Method 2: Account Name + Key

```javascript
const config = {
  azure: {
    accountName: "your-storage-account",
    accountKey: "your-account-key",
    containerName: "logs",
  },
};
```

### Method 3: SAS Token

```bash
# Generate SAS token (valid for 1 year)
az storage container generate-sas \
  --name logs \
  --permissions acdlrw \
  --expiry 2025-12-31T23:59Z \
  --connection-string "$CONNECTION_STRING"
```

```javascript
const config = {
  azure: {
    accountName: "your-storage-account",
    sasToken: "your-sas-token",
    containerName: "logs",
  },
};
```

### Method 4: Managed Identity (Azure VMs)

```javascript
const config = {
  azure: {
    accountName: "your-storage-account",
    // Uses Azure managed identity - no keys needed
    containerName: "logs",
  },
};
```

## 💰 Cost Optimization

### Access Tiers

```bash
# Set blob access tier to Cool (for infrequently accessed data)
az storage blob set-tier \
  --tier Cool \
  --container-name logs \
  --name "2025-08-29/14-15.json" \
  --connection-string "$CONNECTION_STRING"

# Set to Archive tier (for long-term storage)
az storage blob set-tier \
  --tier Archive \
  --container-name logs \
  --name "2025-08-29/14-15.json" \
  --connection-string "$CONNECTION_STRING"
```

### Lifecycle Management

```bash
# Create lifecycle policy JSON
cat > lifecycle-policy.json << EOF
{
  "rules": [
    {
      "name": "logRetentionPolicy",
      "enabled": true,
      "type": "Lifecycle",
      "definition": {
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["logs/"]
        },
        "actions": {
          "baseBlob": {
            "tierToCool": {
              "daysAfterModificationGreaterThan": 30
            },
            "tierToArchive": {
              "daysAfterModificationGreaterThan": 90
            },
            "delete": {
              "daysAfterModificationGreaterThan": 2555
            }
          }
        }
      }
    }
  ]
}
EOF

# Apply lifecycle policy
az storage account management-policy create \
  --account-name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --policy @lifecycle-policy.json
```

### Storage Tiers Comparison

| Tier        | Use Case                         | Availability | Cost                           |
| ----------- | -------------------------------- | ------------ | ------------------------------ |
| **Hot**     | Frequently accessed data         | Highest      | Highest storage, lowest access |
| **Cool**    | Infrequently accessed (30+ days) | High         | Lower storage, higher access   |
| **Archive** | Rarely accessed (180+ days)      | Lower        | Lowest storage, highest access |

## 📊 Monitoring & Analytics

### Storage Metrics

```bash
# Check storage account usage
az storage account show-usage \
  --location $LOCATION

# List blobs in container
az storage blob list \
  --container-name logs \
  --connection-string "$CONNECTION_STRING" \
  --output table

# Get blob properties
az storage blob show \
  --container-name logs \
  --name "2025-08-29/14-15.json" \
  --connection-string "$CONNECTION_STRING"
```

### Azure Portal Monitoring

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Storage Accounts → Your Account
3. View Metrics, Insights, and Costs

## 🧪 Testing

### Test Upload

```javascript
const { init, processSpecificHour } = require("logstack");

async function testAzureUpload() {
  await init({
    dbUri: "mongodb://localhost:27017/test",
    uploadProvider: "azure",
    azure: {
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
      containerName: process.env.AZURE_CONTAINER_NAME,
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

testAzureUpload();
```

### Verify Upload

```bash
# List uploaded files
az storage blob list \
  --container-name logs \
  --connection-string "$CONNECTION_STRING" \
  --output table

# Download a test file
az storage blob download \
  --container-name logs \
  --name "2025-08-29/14-15.json" \
  --file "./test-download.json" \
  --connection-string "$CONNECTION_STRING"
```

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Failed**

   ```
   Error: Server failed to authenticate the request
   ```

   **Solution**: Check connection string format and account key validity

2. **Container Not Found**

   ```
   Error: The specified container does not exist
   ```

   **Solution**: Verify container name and ensure it exists

3. **Access Denied**

   ```
   Error: This request is not authorized
   ```

   **Solution**: Check SAS token permissions or account access

4. **Storage Account Name Conflict**
   ```
   Error: The storage account name is already taken
   ```
   **Solution**: Use a globally unique storage account name

### Debug Configuration

```javascript
const config = {
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: process.env.AZURE_CONTAINER_NAME,
  },
  logging: {
    level: "debug", // Enable debug logging
    enableConsole: true,
  },
};
```

### Connection String Format

```bash
# Correct format
DefaultEndpointsProtocol=https;AccountName=mystorageaccount;AccountKey=myaccountkey;EndpointSuffix=core.windows.net

# For development with Azurite (local emulator)
DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;
```

## 🧪 Local Development with Azurite

### Install and Run Azurite

```bash
# Install Azurite (Azure Storage Emulator)
npm install -g azurite

# Start Azurite
azurite --silent --location ./azurite-data --debug ./azurite-debug.log

# Or with Docker
docker run -p 10000:10000 -p 10001:10001 -p 10002:10002 mcr.microsoft.com/azure-storage/azurite
```

### Local Configuration

```javascript
const config = {
  azure: {
    connectionString:
      "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;",
    containerName: "logs",
  },
};
```

## 📋 Production Checklist

- [ ] Azure subscription with sufficient credits/billing setup
- [ ] Resource group created in appropriate region
- [ ] Storage account created with appropriate performance tier
- [ ] Blob container created with correct access level
- [ ] Connection string securely stored
- [ ] Lifecycle management policies configured
- [ ] Monitoring and alerting configured
- [ ] Access policies and security reviewed
- [ ] Test upload/download successful
- [ ] Backup and disaster recovery plan in place

## 🔗 Additional Resources

- [Azure Blob Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [Azure Storage Security Guide](https://docs.microsoft.com/en-us/azure/storage/common/storage-security-guide)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
- [Lifecycle Management](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-lifecycle-management-concepts)
- [Azurite Local Emulator](https://github.com/Azure/Azurite)
