# 🔄 Log Retention Control Guide

## ❌ Current Status: DISABLED

Log retention is currently **DISABLED** in your Dynamite project. This means:

- ✅ **No logs will be deleted** from MongoDB database
- ✅ **No files will be deleted** from S3 bucket
- ⚠️ **Storage will grow continuously**
- 💰 **Costs will increase** over time

## 🔄 To Re-Enable Retention Later:

### 1. Edit `server.js` file:

Find this section (around line 103):

```javascript
// Database Retention (DISABLED - will not delete logs automatically)
retention: {
  enabled: false, // ← Change this to true
  days: 90,
  cleanupSchedule: "0 2 * * *",

  // S3 File Retention (DISABLED - will not delete files automatically)
  s3Retention: {
    enabled: false, // ← Change this to true
    days: 180,
    cleanupSchedule: "0 3 * * 0",
  },
},
```

### 2. Change to:

```javascript
// Database Retention (90 days as requested)
retention: {
  enabled: true, // ← ENABLED
  days: 90, // Keep logs in database for 90 days
  cleanupSchedule: "0 2 * * *", // Daily cleanup at 2 AM

  // S3 File Retention (180 days as requested)
  s3Retention: {
    enabled: true, // ← ENABLED
    days: 180, // Keep files on S3 for 180 days
    cleanupSchedule: "0 3 * * 0", // Weekly cleanup on Sunday at 3 AM
  },
},
```

### 3. Restart the server:

```bash
npm restart
# or
npm run dev
```

## ⚙️ Custom Retention Periods:

You can also customize the retention periods:

```javascript
retention: {
  enabled: true,
  days: 365,        // Keep for 1 year instead of 90 days

  s3Retention: {
    enabled: true,
    days: 730,      // Keep files for 2 years instead of 180 days
  },
},
```

## 📊 Monitor Storage Usage:

### Check Database Size:

```bash
# MongoDB command
db.stats()
```

### Check S3 Usage:

- Go to AWS S3 Console
- Check bucket size in metrics tab
- Monitor monthly costs in AWS billing

## 🚨 Warning Signs:

Watch for these indicators that you need to enable retention:

- 📈 **Database queries getting slower**
- 💰 **Monthly AWS bills increasing**
- 🐌 **Application performance degrading**
- 💾 **High memory usage**

## 💡 Best Practice:

**Recommended approach:**

1. Start with retention **disabled** for initial testing
2. **Monitor storage growth** for a few weeks
3. **Enable retention** before going to production
4. Set **appropriate retention periods** based on your needs

---

**Current Settings File:** `e:\node\app\logstack\dynamite-project\server.js`  
**Line Numbers:** ~103-115 (retention config section)
