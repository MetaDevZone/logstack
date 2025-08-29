# 🔥 Testing with Your Existing "apilogs" Collection

Aap ka database mein "apilogs" naam se collection hai jis mein logs stored hain. Yahan step-by-step guide hai:

## 🚀 Quick Setup

### 1. First, Check Your Database

```bash
npm run inspect:apilogs
```

Ye command aap ke database mein:

- ✅ "apilogs" collection exist karta hai ya nahi
- 📊 Kitne documents hain
- 📄 Document structure kya hai
- 🕒 Kaunse timestamp fields hain

### 2. Update Database Name

`examples/inspectApiLogs.ts` file mein line 8 par apna database name update karein:

```typescript
const dbName = "your-actual-database-name"; // Change this
```

### 3. Test with Your Logs

```bash
npm run test:apilogs
```

Ye command:

- 🔌 Aap ke database se connect karega
- 📥 "apilogs" collection se logs fetch karega
- 📁 JSON files generate karega
- 💾 Local storage mein save karega

## 🛠️ Customization

### Database Name Change

Har file mein `dbName` variable ko update karein:

**inspectApiLogs.ts:**

```typescript
const dbName = "dynamite-lifestyle-prod-app"; // Your DB name
```

**testWithApiLogsCollection.ts:**

```typescript
const dbName = "dynamite-lifestyle-prod-app"; // Your DB name
```

### Timestamp Field Names

Agar aap ke logs mein different timestamp field names hain, to `testWithApiLogsCollection.ts` mein `$or` query update karein:

```typescript
const logs = await apilogsCollection.find({
  $or: [
    { timestamp: { $gte: startDate, $lt: endDate } },
    { request_time: { $gte: startDate, $lt: endDate } },
    { created_at: { $gte: startDate, $lt: endDate } },
    { your_custom_timestamp_field: { $gte: startDate, $lt: endDate } }, // Add your field
  ],
});
```

## 📋 Expected Output

### Successful Run:

```
🚀 Testing with existing apilogs collection...
✅ Service initialized
📅 Creating daily jobs for 2025-08-25
✅ Daily jobs created
⚡ Testing with previous hour...
🔍 Fetching data from 'apilogs' collection for 2025-08-25 09-10
📅 Date range: 2025-08-25T09:00:00.000Z to 2025-08-25T10:00:00.000Z
✅ Found 150 logs for 09-10 hour
📄 Sample log structure: ['_id', 'timestamp', 'method', 'path', ...]
✅ Hourly job completed
📁 Files generated:
   E:\your-project\2025-08-25\09-10.json
```

### Generated Files Location:

```
📁 your-project-folder/
  └── 2025-08-25/
      ├── 00-01.json
      ├── 01-02.json
      ├── 09-10.json (your processed logs)
      └── ...
```

## 🔧 Troubleshooting

### Collection Not Found

```
❌ Collection "apilogs" not found
📋 Available collections: [users, products, orders, ...]
```

**Solution:** Check collection name or update in code

### No Documents

```
📊 Total documents in apilogs: 0
```

**Solution:** Verify data exists in collection

### No Recent Logs

```
📈 Logs from last 24 hours: 0
```

**Solution:** Check timestamp fields or add older date range

### Connection Error

```
❌ Error inspecting database: MongoError: connect ECONNREFUSED
```

**Solution:**

- MongoDB service running karo
- Connection string check karo
- Port 27017 available hai ya nahi

## 🎯 Custom Implementation

Agar aap chahte hain apna custom logic, to `lib/userDataProvider.ts` file edit karein:

```typescript
export async function getDataForHour(
  date: string,
  hourRange: string
): Promise<any> {
  // Apna custom logic yahan likhein
  const db = mongoose.connection.db;
  const apilogsCollection = db.collection("apilogs");

  // Custom query
  const logs = await apilogsCollection
    .find({
      // Your custom filters
    })
    .toArray();

  return logs;
}
```

## 📞 Help & Support

Agar koi issue hai to:

1. `npm run inspect:apilogs` se pahle database structure check karein
2. Console output dekh kar debug karein
3. Error messages carefully padhein
