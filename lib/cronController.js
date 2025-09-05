/**
 * 🛑 LogStack Cron Job Controller
 * Functions to start, stop, and manage cron jobs
 */

const cron = require("node-cron");

class CronJobManager {
  constructor() {
    this.activeTasks = new Map();
    this.isRunning = false;
  }

  /**
   * Get all running cron jobs
   */
  getRunningJobs() {
    const tasks = cron.getTasks();
    const runningJobs = [];

    tasks.forEach((task, name) => {
      runningJobs.push({
        name: name,
        running: task.running || false,
        destroyed: task.destroyed || false,
        expression: task.expression || "unknown",
      });
    });

    return runningJobs;
  }

  /**
   * Stop all LogStack cron jobs
   */
  stopAllCronJobs() {
    console.log("🛑 Stopping all LogStack cron jobs...");

    const tasks = cron.getTasks();
    const stoppedJobs = [];

    tasks.forEach((task, name) => {
      if (task.running) {
        task.stop();
        stoppedJobs.push(name);
        console.log(`   ❌ Stopped: ${name}`);
      }
    });

    this.isRunning = false;

    console.log(`✅ Stopped ${stoppedJobs.length} cron jobs`);
    return stoppedJobs;
  }

  /**
   * Stop specific cron job by name
   */
  stopCronJob(jobName) {
    console.log(`🛑 Stopping cron job: ${jobName}`);

    const tasks = cron.getTasks();
    const task = tasks.get(jobName);

    if (task) {
      if (task.running) {
        task.stop();
        console.log(`✅ Stopped job: ${jobName}`);
        return true;
      } else {
        console.log(`ℹ️  Job ${jobName} was not running`);
        return false;
      }
    } else {
      console.log(`❌ Job ${jobName} not found`);
      return false;
    }
  }

  /**
   * Start specific cron job by name
   */
  startCronJob(jobName) {
    console.log(`▶️  Starting cron job: ${jobName}`);

    const tasks = cron.getTasks();
    const task = tasks.get(jobName);

    if (task) {
      if (!task.running) {
        task.start();
        console.log(`✅ Started job: ${jobName}`);
        return true;
      } else {
        console.log(`ℹ️  Job ${jobName} is already running`);
        return false;
      }
    } else {
      console.log(`❌ Job ${jobName} not found`);
      return false;
    }
  }

  /**
   * Destroy all cron jobs (permanent removal)
   */
  destroyAllCronJobs() {
    console.log("💥 Destroying all LogStack cron jobs...");

    const tasks = cron.getTasks();
    const destroyedJobs = [];

    tasks.forEach((task, name) => {
      task.destroy();
      destroyedJobs.push(name);
      console.log(`   💥 Destroyed: ${name}`);
    });

    this.isRunning = false;

    console.log(`✅ Destroyed ${destroyedJobs.length} cron jobs`);
    return destroyedJobs;
  }

  /**
   * Restart all cron jobs
   */
  restartAllCronJobs() {
    console.log("🔄 Restarting all LogStack cron jobs...");

    this.stopAllCronJobs();

    // Wait a moment before restarting
    setTimeout(() => {
      const tasks = cron.getTasks();
      const restartedJobs = [];

      tasks.forEach((task, name) => {
        if (!task.destroyed) {
          task.start();
          restartedJobs.push(name);
          console.log(`   ▶️  Restarted: ${name}`);
        }
      });

      this.isRunning = restartedJobs.length > 0;
      console.log(`✅ Restarted ${restartedJobs.length} cron jobs`);
    }, 1000);
  }

  /**
   * Get cron job status
   */
  getCronJobStatus() {
    const tasks = cron.getTasks();
    const status = {
      totalJobs: tasks.size,
      runningJobs: 0,
      stoppedJobs: 0,
      destroyedJobs: 0,
      jobs: [],
    };

    tasks.forEach((task, name) => {
      const jobStatus = {
        name: name,
        running: task.running || false,
        destroyed: task.destroyed || false,
        expression: task.expression || "unknown",
      };

      if (jobStatus.destroyed) {
        status.destroyedJobs++;
      } else if (jobStatus.running) {
        status.runningJobs++;
      } else {
        status.stoppedJobs++;
      }

      status.jobs.push(jobStatus);
    });

    return status;
  }

  /**
   * Display cron job status in console
   */
  displayCronStatus() {
    const status = this.getCronJobStatus();

    console.log("\n📊 LogStack Cron Jobs Status:");
    console.log("═".repeat(40));
    console.log(`📈 Total Jobs: ${status.totalJobs}`);
    console.log(`▶️  Running: ${status.runningJobs}`);
    console.log(`⏹️  Stopped: ${status.stoppedJobs}`);
    console.log(`💥 Destroyed: ${status.destroyedJobs}`);

    if (status.jobs.length > 0) {
      console.log("\n📋 Job Details:");
      status.jobs.forEach((job) => {
        const statusIcon = job.destroyed ? "💥" : job.running ? "▶️" : "⏹️";
        const statusText = job.destroyed
          ? "DESTROYED"
          : job.running
          ? "RUNNING"
          : "STOPPED";
        console.log(
          `   ${statusIcon} ${job.name}: ${statusText} (${job.expression})`
        );
      });
    }

    console.log("═".repeat(40));
  }

  /**
   * Schedule emergency stop (stops all jobs after delay)
   */
  emergencyStop(delaySeconds = 0) {
    console.log(`🚨 Emergency stop scheduled in ${delaySeconds} seconds...`);

    setTimeout(() => {
      console.log("🚨 EMERGENCY STOP - Destroying all cron jobs!");
      this.destroyAllCronJobs();
      console.log("🛑 All LogStack operations stopped");
    }, delaySeconds * 1000);
  }
}

// Create global instance
const cronManager = new CronJobManager();

/**
 * Quick access functions for easy usage
 */

// Stop all cron jobs
function stopAllLogStackJobs() {
  return cronManager.stopAllCronJobs();
}

// Stop specific job
function stopLogStackJob(jobName) {
  return cronManager.stopCronJob(jobName);
}

// Start specific job
function startLogStackJob(jobName) {
  return cronManager.startCronJob(jobName);
}

// Get status
function getLogStackJobStatus() {
  return cronManager.getCronJobStatus();
}

// Display status
function showLogStackJobStatus() {
  cronManager.displayCronStatus();
}

// Emergency stop
function emergencyStopLogStack(delaySeconds = 0) {
  cronManager.emergencyStop(delaySeconds);
}

// Destroy all jobs
function destroyAllLogStackJobs() {
  return cronManager.destroyAllCronJobs();
}

// Restart all jobs
function restartAllLogStackJobs() {
  cronManager.restartAllCronJobs();
}

// Stop specific LogStack jobs by name patterns
function stopLogStackCronsByPattern() {
  const patterns = [
    "daily-job-creation",
    "hourly-job-execution",
    "retry-failed-jobs",
    "cleanup-old-logs",
    "file-upload-processor",
  ];

  console.log("🛑 Stopping LogStack cron jobs by pattern...");
  const stoppedJobs = [];

  patterns.forEach((pattern) => {
    if (cronManager.stopCronJob(pattern)) {
      stoppedJobs.push(pattern);
    }
  });

  console.log(`✅ Stopped ${stoppedJobs.length} LogStack jobs`);
  return stoppedJobs;
}

/**
 * Get only active/running LogStack jobs
 */
function getActiveLogStackJobs() {
  try {
    const allJobs = cron.getTasks();
    const logStackJobs = [];

    for (let [name, task] of allJobs) {
      if (name.toLowerCase().includes("logstack")) {
        const isRunning =
          task.getStatus() === "scheduled" || task.getStatus() === "running";
        if (isRunning) {
          logStackJobs.push({
            name: name,
            status: task.getStatus(),
            schedule: "Dynamic", // node-cron doesn't expose schedule easily
            isRunning: isRunning,
          });
        }
      }
    }

    return {
      count: logStackJobs.length,
      jobs: logStackJobs,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("❌ Failed to get active LogStack jobs:", error);
    return {
      count: 0,
      jobs: [],
      error: error.message,
      timestamp: new Date(),
    };
  }
}

module.exports = {
  // Manager instance
  cronManager,

  // Quick functions
  stopAllLogStackJobs,
  stopLogStackJob,
  startLogStackJob,
  getLogStackJobStatus,
  showLogStackJobStatus,
  emergencyStopLogStack,
  destroyAllLogStackJobs,
  restartAllLogStackJobs,
  stopLogStackCronsByPattern,
  getActiveLogStackJobs,

  // Class for advanced usage
  CronJobManager,
};
