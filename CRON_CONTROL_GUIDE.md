# LogStack Cron Job Control Guide

LogStack package mein comprehensive cron job management system hai jo aapko complete control deta hai background processes par.

## 🚀 Quick Start

```javascript
const {
  stopAllLogStackJobs,
  getCronJobStatus,
  emergencyStopLogStack,
} = require("logstack");

// Sabhi LogStack cron jobs stop karo
await stopAllLogStackJobs();

// Cron jobs ka status check karo
const status = await getCronJobStatus();
console.log(status);
```

## 📋 Available Functions

### 1. **stopAllLogStackJobs()**

Saari LogStack related cron jobs ko safely stop karta hai.

```javascript
const result = await stopAllLogStackJobs();
console.log(result);
// Output: { stopped: 3, message: 'All LogStack cron jobs stopped', details: [...] }
```

### 2. **emergencyStopLogStack()**

Emergency situation mein immediately saari jobs stop karta hai.

```javascript
const result = await emergencyStopLogStack();
console.log(result);
// Output: { stopped: 3, destroyed: 2, message: 'Emergency stop completed' }
```

### 3. **getCronJobStatus()**

Saari active cron jobs ka detailed status dekho.

```javascript
const status = await getCronJobStatus();
console.log(status);
/* Output:
{
  total: 3,
  running: 2,
  stopped: 1,
  jobs: [
    { name: 'LogStack Daily Job', status: 'running', schedule: '0 0 * * *' },
    { name: 'LogStack Hourly Job', status: 'running', schedule: '0 * * * *' },
    { name: 'LogStack Cleanup Job', status: 'stopped', schedule: '0 2 * * *' }
  ]
}
*/
```

### 4. **startLogStackJob(schedule, name)**

Nayi cron job start karo with custom schedule.

```javascript
// Custom schedule ke saath nayi job start karo
const result = await startLogStackJob("*/5 * * * *", "Custom Log Job");
console.log(result);
// Output: { success: true, message: 'Job started successfully', jobName: 'Custom Log Job' }
```

### 5. **destroyAllLogStackJobs()**

Saari LogStack jobs ko permanently destroy karo.

```javascript
const result = await destroyAllLogStackJobs();
console.log(result);
// Output: { destroyed: 3, message: 'All LogStack jobs destroyed permanently' }
```

### 6. **stopJobsByPattern(pattern)**

Specific pattern ke jobs ko stop karo.

```javascript
// Sirf "Hourly" jobs stop karo
const result = await stopJobsByPattern("Hourly");
console.log(result);
// Output: { stopped: 1, pattern: 'Hourly', stoppedJobs: ['LogStack Hourly Job'] }
```

### 7. **getActiveLogStackJobs()**

Sirf active/running jobs ki list dekho.

```javascript
const activeJobs = await getActiveLogStackJobs();
console.log(activeJobs);
/* Output:
{
  count: 2,
  jobs: [
    { name: 'LogStack Daily Job', schedule: '0 0 * * *', status: 'running' },
    { name: 'LogStack Hourly Job', schedule: '0 * * * *', status: 'running' }
  ]
}
*/
```

## 🎯 Common Use Cases

### Complete Stop (All Jobs)

```javascript
const { stopAllLogStackJobs } = require("logstack");

// Application shutdown ke time saari jobs stop karo
process.on("SIGTERM", async () => {
  console.log("Stopping all LogStack jobs...");
  await stopAllLogStackJobs();
  process.exit(0);
});
```

### Emergency Shutdown

```javascript
const { emergencyStopLogStack } = require("logstack");

// Critical error ke time immediately stop karo
if (criticalError) {
  await emergencyStopLogStack();
  console.log("Emergency stop executed!");
}
```

### Health Monitoring

```javascript
const { getCronJobStatus } = require("logstack");

// Har 5 minute check karo jobs ka status
setInterval(async () => {
  const status = await getCronJobStatus();
  if (status.running === 0) {
    console.log("⚠️  No cron jobs running!");
  } else {
    console.log(`✅ ${status.running} jobs running normally`);
  }
}, 5 * 60 * 1000);
```

### Maintenance Mode

```javascript
const { stopAllLogStackJobs, startLogStackJob } = require("logstack");

// Maintenance mode ON
async function enableMaintenanceMode() {
  await stopAllLogStackJobs();
  console.log("🔧 Maintenance mode enabled");
}

// Maintenance mode OFF
async function disableMaintenanceMode() {
  // Jobs restart karo
  await startLogStackJob("0 0 * * *", "LogStack Daily Job");
  await startLogStackJob("0 * * * *", "LogStack Hourly Job");
  console.log("✅ Normal operations resumed");
}
```

## ⚡ Express.js Integration

```javascript
const express = require("express");
const {
  stopAllLogStackJobs,
  getCronJobStatus,
  startLogStackJob,
} = require("logstack");

const app = express();

// Admin endpoint for job control
app.post("/admin/jobs/stop", async (req, res) => {
  try {
    const result = await stopAllLogStackJobs();
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/admin/jobs/status", async (req, res) => {
  try {
    const status = await getCronJobStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/admin/jobs/start", async (req, res) => {
  try {
    const { schedule, name } = req.body;
    const result = await startLogStackJob(schedule, name);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## 🛡️ Safety Features

1. **Graceful Shutdown**: Jobs properly close karte hain without data loss
2. **Status Tracking**: Real-time status monitoring available
3. **Pattern Matching**: Specific jobs target kar sakte hain
4. **Emergency Stop**: Immediate shutdown capability
5. **Auto Recovery**: Jobs restart kar sakte hain if needed

## 📊 Monitoring Dashboard

```javascript
const { getCronJobStatus, getActiveLogStackJobs } = require("logstack");

async function createJobsDashboard() {
  const status = await getCronJobStatus();
  const activeJobs = await getActiveLogStackJobs();

  console.log("📊 LogStack Jobs Dashboard");
  console.log("========================");
  console.log(`Total Jobs: ${status.total}`);
  console.log(`Running: ${status.running}`);
  console.log(`Stopped: ${status.stopped}`);
  console.log("");

  console.log("Active Jobs:");
  activeJobs.jobs.forEach((job) => {
    console.log(`  ✅ ${job.name} - ${job.schedule}`);
  });
}

// Har 30 seconds dashboard update karo
setInterval(createJobsDashboard, 30000);
```

## 🔧 Production Usage

```javascript
const {
  initializeLogStack,
  stopAllLogStackJobs,
  getCronJobStatus,
} = require("logstack");

async function productionSetup() {
  try {
    // LogStack initialize karo
    await initializeLogStack();

    // Graceful shutdown setup
    process.on("SIGTERM", async () => {
      console.log("Received SIGTERM, shutting down gracefully...");
      await stopAllLogStackJobs();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("Received SIGINT, shutting down gracefully...");
      await stopAllLogStackJobs();
      process.exit(0);
    });

    // Health check every 5 minutes
    setInterval(async () => {
      const status = await getCronJobStatus();
      if (status.running === 0) {
        console.log("⚠️  Alert: No cron jobs running!");
      }
    }, 5 * 60 * 1000);

    console.log("🚀 Production setup complete with cron job monitoring");
  } catch (error) {
    console.error("❌ Production setup failed:", error);
    process.exit(1);
  }
}

productionSetup();
```

Ab aap easily apni cron jobs ko control kar sakte hain! 🎉
