/**
 * 📱 Dynamite Lifestyle App Integration Example
 * Use this in your main Dynamite Lifestyle application
 */

const axios = require("axios");

class DynamiteLogsClient {
  constructor(logServerUrl, apiKey, environment = "development") {
    this.baseUrl = logServerUrl;
    this.apiKey = apiKey;
    this.environment = environment;
    this.headers = {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    };
  }

  // ===== LIFESTYLE SPECIFIC METHODS =====

  /**
   * Log user workout session
   */
  async logWorkout(userId, workoutData) {
    const logData = {
      level: "info",
      message: "User workout session completed",
      service: "workout-tracker",
      metadata: {
        user_id: userId,
        workout_data: workoutData,
        logged_at: new Date(),
      },
      lifestyle_context: {
        fitness_goals: workoutData.goals,
        progress_tracking: true,
        social_sharing: workoutData.share_enabled || false,
      },
    };

    return await this.saveAppLog(logData);
  }

  /**
   * Log nutrition intake
   */
  async logNutrition(userId, nutritionData) {
    const logData = {
      level: "info",
      message: "User nutrition data logged",
      service: "nutrition-tracker",
      metadata: {
        user_id: userId,
        nutrition_data: nutritionData,
        logged_at: new Date(),
      },
      lifestyle_context: {
        dietary_plan: nutritionData.plan_type,
        calorie_tracking: true,
        macro_tracking: nutritionData.track_macros || false,
      },
    };

    return await this.saveAppLog(logData);
  }

  /**
   * Log sleep data
   */
  async logSleep(userId, sleepData) {
    const logData = {
      level: "info",
      message: "Sleep quality data recorded",
      service: "sleep-tracker",
      metadata: {
        user_id: userId,
        sleep_data: sleepData,
        logged_at: new Date(),
      },
      lifestyle_context: {
        sleep_goals: sleepData.target_hours,
        sleep_optimization: true,
        recovery_tracking: sleepData.track_recovery || false,
      },
    };

    return await this.saveAppLog(logData);
  }

  /**
   * Log social activity (challenges, sharing, etc.)
   */
  async logSocialActivity(userId, activityData) {
    const logData = {
      method: "POST",
      path: "/api/lifestyle/social",
      status: 200,
      user_id: userId,
      request_body: activityData,
      lifestyle_data: {
        social_engagement: true,
        community_features: activityData.feature_type,
        sharing_preferences: activityData.sharing_settings,
      },
    };

    return await this.saveApiLog(logData);
  }

  /**
   * Log app errors with lifestyle context
   */
  async logError(error, userId = null, context = {}) {
    const logData = {
      level: "error",
      message: error.message || "Application error occurred",
      service: context.service || "dynamite-app",
      metadata: {
        user_id: userId,
        error_details: {
          message: error.message,
          stack: error.stack,
          code: error.code,
        },
        context,
        logged_at: new Date(),
      },
      lifestyle_context: {
        user_impact: context.user_impact || "unknown",
        feature_affected: context.feature || "unknown",
        recovery_action: context.recovery || "none",
      },
    };

    return await this.saveAppLog(logData);
  }

  // ===== CORE METHODS =====

  async saveApiLog(logData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/dynamite/logs/save`,
        logData,
        {
          headers: this.headers,
          timeout: 5000,
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to save API log:", error.message);
      return { success: false, error: error.message };
    }
  }

  async saveAppLog(logData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/dynamite/logs/app`,
        logData,
        {
          headers: this.headers,
          timeout: 5000,
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to save app log:", error.message);
      return { success: false, error: error.message };
    }
  }

  async getApiLogs(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/dynamite/logs/api`,
        {
          params: filters,
          headers: this.headers,
          timeout: 10000,
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to get API logs:", error.message);
      return { success: false, error: error.message };
    }
  }

  async getAppLogs(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/dynamite/logs/app`,
        {
          params: filters,
          headers: this.headers,
          timeout: 10000,
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to get app logs:", error.message);
      return { success: false, error: error.message };
    }
  }

  // ===== EXPRESS MIDDLEWARE =====

  /**
   * Express middleware for automatic API logging
   */
  getMiddleware() {
    return (req, res, next) => {
      const startTime = new Date();

      res.on("finish", async () => {
        try {
          // Extract lifestyle context from request
          const lifestyleData = {
            app_version: req.headers["app-version"],
            platform: req.headers["platform"],
            user_agent: req.headers["user-agent"],
            subscription_type: req.user?.subscription_type,
            user_tier: req.user?.tier,
          };

          await this.saveApiLog({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            request_time: startTime,
            response_time: new Date(),
            client_ip: req.ip,
            headers: req.headers,
            request_body: req.body,
            response_time_ms: Date.now() - startTime.getTime(),
            user_id: req.user?.id,
            session_id: req.sessionID,
            lifestyle_data: lifestyleData,
          });
        } catch (error) {
          // Silent fail
        }
      });

      next();
    };
  }
}

// ===== USAGE EXAMPLES =====

// Initialize client
const logsClient = new DynamiteLogsClient(
  "http://localhost:4000", // Log server URL
  "dynamite-dev-api-key-2025", // API key
  "development" // Environment
);

// Express.js setup
const express = require("express");
const app = express();

// Use automatic logging middleware
app.use(logsClient.getMiddleware());

// Example routes with lifestyle logging

// User workout endpoint
app.post("/api/workouts", async (req, res) => {
  try {
    const userId = req.user.id;
    const workoutData = req.body;

    // Your workout logic here
    const workout = await saveWorkoutToDatabase(workoutData);

    // Log the workout
    await logsClient.logWorkout(userId, {
      session_id: workout.id,
      duration_minutes: workoutData.duration,
      exercises: workoutData.exercises,
      calories_burned: workout.calories_estimated,
      difficulty: workoutData.difficulty,
      goals: workoutData.goals,
      share_enabled: workoutData.share_with_friends,
    });

    res.json({ success: true, workout });
  } catch (error) {
    // Log the error
    await logsClient.logError(error, req.user?.id, {
      service: "workout-api",
      feature: "workout_creation",
      user_impact: "high",
    });

    res.status(500).json({ error: "Workout save failed" });
  }
});

// User nutrition endpoint
app.post("/api/nutrition", async (req, res) => {
  try {
    const userId = req.user.id;
    const nutritionData = req.body;

    // Your nutrition logic here
    const nutrition = await saveNutritionToDatabase(nutritionData);

    // Log the nutrition
    await logsClient.logNutrition(userId, {
      meal_type: nutritionData.meal_type,
      items: nutritionData.food_items,
      calories: nutrition.total_calories,
      macros: nutrition.macros,
      plan_type: req.user.nutrition_plan,
      track_macros: req.user.settings.track_macros,
    });

    res.json({ success: true, nutrition });
  } catch (error) {
    await logsClient.logError(error, req.user?.id, {
      service: "nutrition-api",
      feature: "nutrition_logging",
    });

    res.status(500).json({ error: "Nutrition save failed" });
  }
});

// Sleep tracking endpoint
app.post("/api/sleep", async (req, res) => {
  try {
    const userId = req.user.id;
    const sleepData = req.body;

    // Your sleep logic here
    const sleep = await saveSleepToDatabase(sleepData);

    // Log the sleep data
    await logsClient.logSleep(userId, {
      bedtime: sleepData.bedtime,
      wake_time: sleepData.wake_time,
      total_hours: sleep.duration_hours,
      quality_score: sleep.quality_score,
      target_hours: req.user.sleep_goal,
      track_recovery: req.user.settings.track_recovery,
    });

    res.json({ success: true, sleep });
  } catch (error) {
    await logsClient.logError(error, req.user?.id, {
      service: "sleep-api",
      feature: "sleep_tracking",
    });

    res.status(500).json({ error: "Sleep save failed" });
  }
});

// Social features endpoint
app.post("/api/social/challenge", async (req, res) => {
  try {
    const userId = req.user.id;
    const challengeData = req.body;

    // Your social logic here
    const challenge = await createSocialChallenge(challengeData);

    // Log the social activity
    await logsClient.logSocialActivity(userId, {
      feature_type: "challenge_creation",
      challenge_type: challengeData.type,
      participants_count: challengeData.participants.length,
      sharing_settings: challengeData.sharing,
    });

    res.json({ success: true, challenge });
  } catch (error) {
    await logsClient.logError(error, req.user?.id, {
      service: "social-api",
      feature: "challenge_creation",
    });

    res.status(500).json({ error: "Challenge creation failed" });
  }
});

// Admin endpoint to view logs
app.get("/admin/logs", async (req, res) => {
  try {
    const { type, start_date, end_date, user_id } = req.query;

    let logs;
    if (type === "api") {
      logs = await logsClient.getApiLogs({
        startDate: start_date,
        endDate: end_date,
        user_id,
        limit: 100,
      });
    } else {
      logs = await logsClient.getAppLogs({
        startDate: start_date,
        endDate: end_date,
        limit: 100,
      });
    }

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export for use in other files
module.exports = DynamiteLogsClient;

// Mock functions (replace with your actual implementations)
async function saveWorkoutToDatabase(data) {
  return { id: "workout_123", calories_estimated: 300 };
}
async function saveNutritionToDatabase(data) {
  return { total_calories: 500, macros: {} };
}
async function saveSleepToDatabase(data) {
  return { duration_hours: 7.5, quality_score: 8 };
}
async function createSocialChallenge(data) {
  return { id: "challenge_123" };
}
