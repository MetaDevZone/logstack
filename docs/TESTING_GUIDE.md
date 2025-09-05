# 🧪 Testing Cron Log Service with Your Database

This guide shows you how to test the logstack with your existing database containing logs.

## 📋 Prerequisites

1. **MongoDB running** on localhost:27017 (or update connection string)
2. **Your database** with existing log data
3. **Node.js** and npm installed

## 🚀 Quick Test Methods

### Method 1: Test with Sample Data (Recommended for first test)

```bash
npm run test:sample-data
```

This will:

- Create a test database with sample API logs
- Process the logs and generate files
- Show you exactly how the system works

### Method 2: Test with Your Existing Database

1. **Update the database name** in `examples/testExistingDb.ts`:

   ```typescript
   dbUri: "mongodb://localhost:27017/YOUR_DATABASE_NAME";
   ```

2. **Run the test**:
   ```bash
   npm run test:existing-db
   ```

### Method 3: Basic Test

```bash
npm run test:basic
```

## 🔧 Customizing for Your Database

### Step 1: Update Connection String

Edit any example file and change:

```typescript
dbUri: "mongodb://localhost:27017/YOUR_ACTUAL_DB_NAME";
```

### Step 2: Customize Data Provider (Optional)

If you want to fetch from specific collections, edit `lib/userDataProvider.ts`:

```typescript
// Replace collection names with your actual collections
const possibleCollections = ["your_logs", "audit_logs", "app_logs"];

// Replace timestamp field names with your actual fields
const timestampFields = ["timestamp", "created_at", "log_time"];
```

## 📁 Output Files

Generated files will be saved to:

```
your-project-directory/
  └── YYYY-MM-DD/          # Date folder
      ├── 00-01.json       # Hour 00-01 logs
      ├── 01-02.json       # Hour 01-02 logs
      └── ...              # Other hours
```

## 🏃‍♂️ Running the Tests

```bash
# Build first
npm run build

# Test with sample data (recommended first)
npm run test:sample-data

# Test with your existing database
npm run test:existing-db

# Basic functionality test
npm run test:basic
```

## 🔍 What Each Test Does

### `test:sample-data`

- Creates sample API logs in MongoDB
- Processes them into files
- Perfect for understanding how the system works

### `test:existing-db`

- Connects to your existing database
- Tries to find logs in common collections
- Processes real data from your database

### `test:basic`

- Simple test with minimal logging
- Uses automatic data detection
- Good for quick verification

## 🐛 Troubleshooting

### No logs found?

- Check your database name in the connection string
- Verify your collections have data
- Look at console output for diagnostic information

### Permission errors?

- Ensure MongoDB is running
- Check file system permissions for output directory
- Verify MongoDB connection credentials

### Custom collection names?

Edit `lib/userDataProvider.ts` and update the collection names:

```typescript
const possibleCollections = ["your_actual_collection_name"];
```

## 📊 Example Output

```
🚀 Starting basic logstack test...
✅ Service initialized
📅 Creating daily jobs for 2025-08-25
⚡ Running hourly job...
🔍 Fetching data for 2025-08-25 10-11
📊 Found 15 API logs for 10-11
📁 Generated files should be in:
   E:\your-project\2025-08-25\
🎉 Basic test completed!
```

## 🎯 Next Steps

1. **Run a test** to see the system in action
2. **Check generated files** in the date folder
3. **Customize** the data provider for your specific needs
4. **Set up cron jobs** for automatic processing
5. **Configure cloud storage** if needed (S3, GCS, Azure)
