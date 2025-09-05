/**
 * 🎯 Complete LogStack Cron Control Demo
 *
 * Is demo mein aap dekhenge:
 * 1. Cron jobs kaise control karte hain
 * 2. Status kaise check karte hain
 * 3. Emergency stop kaise use karte hain
 * 4. Production mein kaise integrate karte hain
 */

const {
  stopAllLogStackJobs,
  getCronJobStatus,
  emergencyStopLogStack,
  getActiveLogStackJobs,
  startLogStackJob,
} = require("./main.js");

class LogStackCronController {
  constructor() {
    this.isRunning = false;
    this.setupGracefulShutdown();
  }

  /**
   * Application shutdown ke time gracefully stop karo
   */
  setupGracefulShutdown() {
    // SIGTERM handler (PM2, Docker, etc.)
    process.on("SIGTERM", async () => {
      console.log("\n📡 Received SIGTERM signal...");
      await this.gracefulShutdown();
    });

    // SIGINT handler (Ctrl+C)
    process.on("SIGINT", async () => {
      console.log("\n📡 Received SIGINT signal...");
      await this.gracefulShutdown();
    });

    // Uncaught exception handler
    process.on("uncaughtException", async (error) => {
      console.error("\n💥 Uncaught Exception:", error.message);
      await this.emergencyShutdown();
    });
  }

  /**
   * Graceful shutdown - normal application termination
   */
  async gracefulShutdown() {
    try {
      console.log("🔄 Starting graceful shutdown...");

      const result = await stopAllLogStackJobs();
      console.log("✅ All LogStack cron jobs stopped gracefully");
      console.log(`📊 Stopped jobs: ${result.length}`);

      process.exit(0);
    } catch (error) {
      console.error("❌ Graceful shutdown failed:", error.message);
      await this.emergencyShutdown();
    }
  }

  /**
   * Emergency shutdown - immediate termination
   */
  async emergencyShutdown() {
    try {
      console.log("🚨 Starting emergency shutdown...");

      await emergencyStopLogStack();
      console.log("✅ Emergency stop completed");

      process.exit(1);
    } catch (error) {
      console.error("💀 Emergency shutdown failed:", error.message);
      process.exit(1);
    }
  }

  /**
   * Health monitoring - har 30 seconds jobs ka status check karo
   */
  async startHealthMonitoring() {
    console.log("💓 Starting health monitoring...");

    setInterval(async () => {
      try {
        const status = await getCronJobStatus();
        const activeJobs = await getActiveLogStackJobs();

        console.log(`\n📊 Health Check - ${new Date().toLocaleTimeString()}`);
        console.log(`   Total Jobs: ${status.totalJobs}`);
        console.log(`   Running Jobs: ${status.runningJobs}`);
        console.log(`   Active LogStack Jobs: ${activeJobs.count}`);

        // Alert if no jobs running
        if (status.runningJobs === 0 && status.totalJobs > 0) {
          console.log("⚠️  WARNING: Jobs exist but none are running!");
        }

        // Alert if no LogStack jobs
        if (activeJobs.count === 0) {
          console.log("🔍 INFO: No active LogStack jobs found");
        }
      } catch (error) {
        console.error("❌ Health check failed:", error.message);
      }
    }, 30000); // 30 seconds
  }

  /**
   * Maintenance mode - saari jobs stop karo
   */
  async enableMaintenanceMode() {
    try {
      console.log("🔧 Enabling maintenance mode...");

      const result = await stopAllLogStackJobs();
      console.log(
        `✅ Maintenance mode enabled - ${result.length} jobs stopped`
      );

      return { success: true, stoppedJobs: result.length };
    } catch (error) {
      console.error("❌ Failed to enable maintenance mode:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Maintenance mode disable - jobs restart karo
   */
  async disableMaintenanceMode() {
    try {
      console.log("🚀 Disabling maintenance mode...");

      // Start essential LogStack jobs
      await startLogStackJob("0 0 * * *", "LogStack Daily Job");
      await startLogStackJob("0 * * * *", "LogStack Hourly Job");
      await startLogStackJob("0 2 * * *", "LogStack Cleanup Job");

      console.log("✅ Maintenance mode disabled - essential jobs restarted");

      return { success: true, message: "Normal operations resumed" };
    } catch (error) {
      console.error("❌ Failed to disable maintenance mode:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete status report
   */
  async getDetailedStatus() {
    try {
      const status = await getCronJobStatus();
      const activeJobs = await getActiveLogStackJobs();

      return {
        timestamp: new Date(),
        overview: {
          totalJobs: status.totalJobs,
          runningJobs: status.runningJobs,
          stoppedJobs: status.stoppedJobs,
          destroyedJobs: status.destroyedJobs,
        },
        activeLogStackJobs: activeJobs,
        allJobs: status.jobs,
        healthStatus: status.runningJobs > 0 ? "healthy" : "warning",
      };
    } catch (error) {
      return {
        timestamp: new Date(),
        error: error.message,
        healthStatus: "error",
      };
    }
  }

  /**
   * Demo function - saare features demonstrate karo
   */
  async runDemo() {
    try {
      console.log("🎭 LogStack Cron Control Demo Starting...\n");

      // 1. Initial status
      console.log("1️⃣  Initial Status Check:");
      const initialStatus = await this.getDetailedStatus();
      console.log("   Status:", initialStatus.healthStatus);
      console.log("   Total Jobs:", initialStatus.overview.totalJobs);
      console.log("   Running Jobs:", initialStatus.overview.runningJobs);
      console.log("");

      // 2. Start some test jobs (if needed)
      console.log("2️⃣  Starting test LogStack jobs...");
      await startLogStackJob("*/10 * * * * *", "Demo LogStack Job 1");
      await startLogStackJob("*/15 * * * * *", "Demo LogStack Job 2");
      console.log("   ✅ Test jobs started\n");

      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 3. Status after starting jobs
      console.log("3️⃣  Status After Starting Jobs:");
      const afterStartStatus = await this.getDetailedStatus();
      console.log("   Status:", afterStartStatus.healthStatus);
      console.log("   Total Jobs:", afterStartStatus.overview.totalJobs);
      console.log("   Running Jobs:", afterStartStatus.overview.runningJobs);
      console.log(
        "   Active LogStack Jobs:",
        afterStartStatus.activeLogStackJobs.count
      );
      console.log("");

      // 4. Enable maintenance mode
      console.log("4️⃣  Testing Maintenance Mode:");
      const maintenanceResult = await this.enableMaintenanceMode();
      console.log("   Maintenance Result:", maintenanceResult);
      console.log("");

      // 5. Status during maintenance
      console.log("5️⃣  Status During Maintenance:");
      const maintenanceStatus = await this.getDetailedStatus();
      console.log("   Status:", maintenanceStatus.healthStatus);
      console.log("   Running Jobs:", maintenanceStatus.overview.runningJobs);
      console.log("");

      // 6. Disable maintenance mode
      console.log("6️⃣  Exiting Maintenance Mode:");
      const resumeResult = await this.disableMaintenanceMode();
      console.log("   Resume Result:", resumeResult);
      console.log("");

      // 7. Final status
      console.log("7️⃣  Final Status:");
      const finalStatus = await this.getDetailedStatus();
      console.log("   Status:", finalStatus.healthStatus);
      console.log("   Total Jobs:", finalStatus.overview.totalJobs);
      console.log("   Running Jobs:", finalStatus.overview.runningJobs);
      console.log("");

      console.log("🎉 Demo completed successfully!");
      console.log("\n📚 Available functions:");
      console.log("   - stopAllLogStackJobs()");
      console.log("   - getCronJobStatus()");
      console.log("   - emergencyStopLogStack()");
      console.log("   - getActiveLogStackJobs()");
      console.log("   - startLogStackJob(schedule, name)");
      console.log("");
      console.log(
        "💡 Use these functions in your production application for complete cron job control!"
      );
    } catch (error) {
      console.error("❌ Demo failed:", error.message);
    }
  }
}

// Export the controller
module.exports = LogStackCronController;

// Run demo if this file is executed directly
if (require.main === module) {
  const controller = new LogStackCronController();

  // Run demo
  controller
    .runDemo()
    .then(() => {
      console.log("\n🔄 Demo completed. Starting health monitoring...");
      console.log("   Press Ctrl+C to exit gracefully");

      // Start health monitoring
      controller.startHealthMonitoring();
    })
    .catch((error) => {
      console.error("❌ Demo startup failed:", error);
      process.exit(1);
    });
}
