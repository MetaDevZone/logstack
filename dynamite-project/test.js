/**
 * 🧪 Dynamite Lifestyle Logs Test File
 * Test all endpoints and functionality
 */

const axios = require("axios");

const BASE_URL = "http://localhost:4000";
const API_KEY = "dynamite-dev-api-key-2025"; // Development API key

class DynamiteLogsTester {
  constructor() {
    this.headers = {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    };
  }

  async testHealthCheck() {
    try {
      console.log("🔍 Testing health check...");
      const response = await axios.get(`${BASE_URL}/health`);
      console.log("✅ Health check passed:", response.data);
      return true;
    } catch (error) {
      console.error("❌ Health check failed:", error.message);
      return false;
    }
  }

  async testSaveApiLog() {
    try {
      console.log("\n📤 Testing API log save...");

      const apiLogData = {
        method: "POST",
        path: "/api/lifestyle/profile",
        status: 201,
        request_time: new Date(),
        response_time: new Date(),
        client_ip: "192.168.1.100",
        headers: {
          "user-agent": "Dynamite Lifestyle App v2.1.0",
          "content-type": "application/json",
        },
        request_body: {
          user_id: "user_123",
          profile_data: {
            name: "Ahmed Ali",
            age: 28,
            fitness_goals: ["weight_loss", "muscle_gain"],
            dietary_preferences: ["halal", "low_carb"],
            activity_level: "moderate",
            password: "1234567"
          },
        },
        response_body: {
          success: true,
          profile_id: "profile_456",
          recommendations: ["cardio_plan", "diet_plan"],
        },
        response_time_ms: 245,
        user_id: "user_123",
        session_id: "sess_789",
        lifestyle_data: {
          app_version: "2.1.0",
          platform: "ios",
          location: "Karachi, Pakistan",
          subscription_type: "premium",
          coach_assigned: "coach_001",
        },
      };

      const response = await axios.post(
        `${BASE_URL}/api/dynamite/logs/save`,
        apiLogData,
        {
          headers: this.headers,
        }
      );

      console.log("✅ API log saved:", response.data);
      return response.data.id;
    } catch (error) {
      console.error(
        "❌ API log save failed:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  async testSaveAppLog() {
    try {
      console.log("\n📱 Testing app log save...");

      const appLogData = {
        level: "info",
        message: "User completed workout session",
        service: "workout-tracker",
        metadata: {
          user_id: "user_123",
          workout_data: {
            session_id: "workout_789",
            duration_minutes: 45,
            calories_burned: 320,
            exercises: [
              { name: "Push-ups", reps: 20, sets: 3 },
              { name: "Squats", reps: 15, sets: 3 },
              { name: "Cardio", duration_minutes: 20 },
            ],
            difficulty: "intermediate",
            completed: true,
          },
          performance_metrics: {
            heart_rate_avg: 145,
            heart_rate_max: 165,
            recovery_time: 8,
            effort_level: 7,
          },
        },
        lifestyle_context: {
          goal_progress: {
            weekly_workouts: 4,
            target_weekly: 5,
            streak_days: 12,
          },
          nutrition_sync: true,
          sleep_quality: 8,
          stress_level: 3,
        },
      };

      const response = await axios.post(
        `${BASE_URL}/api/dynamite/logs/app`,
        appLogData,
        {
          headers: this.headers,
        }
      );

      console.log("✅ App log saved:", response.data);
      return response.data.id;
    } catch (error) {
      console.error(
        "❌ App log save failed:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  async testGetApiLogs() {
    try {
      console.log("\n📥 Testing get API logs...");

      const response = await axios.get(`${BASE_URL}/api/dynamite/logs/api`, {
        headers: this.headers,
        params: {
          limit: 10,
          method: "POST",
        },
      });

      console.log("✅ API logs retrieved:", {
        count: response.data.count,
        environment: response.data.environment,
        sample: response.data.logs.slice(0, 2), // Show first 2 logs
      });
      return true;
    } catch (error) {
      console.error(
        "❌ Get API logs failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }

  async testGetAppLogs() {
    try {
      console.log("\n📋 Testing get app logs...");

      const response = await axios.get(`${BASE_URL}/api/dynamite/logs/app`, {
        headers: this.headers,
        params: {
          limit: 10,
          level: "info",
        },
      });

      console.log("✅ App logs retrieved:", {
        count: response.data.count,
        environment: response.data.environment,
        sample: response.data.logs.slice(0, 2), // Show first 2 logs
      });
      return true;
    } catch (error) {
      console.error(
        "❌ Get app logs failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }

  async testLifestyleSpecificLogs() {
    try {
      console.log("\n🏃‍♂️ Testing lifestyle-specific logs...");

      // Nutrition log
      await this.testNutritionLog();

      // Sleep log
      await this.testSleepLog();

      // Social activity log
      await this.testSocialLog();

      return true;
    } catch (error) {
      console.error("❌ Lifestyle logs test failed:", error.message);
      return false;
    }
  }

  async testNutritionLog() {
    const nutritionLogData = {
      level: "info",
      message: "User logged daily nutrition",
      service: "nutrition-tracker",
      metadata: {
        user_id: "user_123",
        nutrition_data: {
          meals: [
            {
              type: "breakfast",
              items: ["oatmeal", "banana", "almonds"],
              calories: 350,
              macros: { protein: 12, carbs: 45, fat: 8 },
            },
            {
              type: "lunch",
              items: ["grilled_chicken", "rice", "vegetables"],
              calories: 520,
              macros: { protein: 35, carbs: 55, fat: 12 },
            },
          ],
          daily_totals: {
            calories: 1850,
            protein: 125,
            carbs: 180,
            fat: 55,
            water_liters: 2.5,
          },
          goals_met: {
            calorie_target: true,
            protein_target: true,
            water_target: false,
          },
        },
      },
      lifestyle_context: {
        dietary_plan: "muscle_gain",
        meal_prep_day: true,
        cheat_meal_allowed: false,
      },
    };

    const response = await axios.post(
      `${BASE_URL}/api/dynamite/logs/app`,
      nutritionLogData,
      {
        headers: this.headers,
      }
    );

    console.log("   ✅ Nutrition log saved");
  }

  async testSleepLog() {
    const sleepLogData = {
      level: "info",
      message: "Sleep quality analysis completed",
      service: "sleep-tracker",
      metadata: {
        user_id: "user_123",
        sleep_data: {
          bedtime: "23:30",
          wake_time: "07:00",
          total_sleep_hours: 7.5,
          deep_sleep_hours: 2.1,
          rem_sleep_hours: 1.8,
          light_sleep_hours: 3.6,
          sleep_efficiency: 89,
          wake_count: 2,
          sleep_quality_score: 8.2,
        },
        environmental_factors: {
          room_temperature: 22,
          noise_level: "low",
          blue_light_exposure: "minimal",
          caffeine_cutoff: "16:00",
        },
      },
      lifestyle_context: {
        sleep_goal_hours: 8,
        sleep_streak_days: 5,
        bedtime_routine_followed: true,
      },
    };

    const response = await axios.post(
      `${BASE_URL}/api/dynamite/logs/app`,
      sleepLogData,
      {
        headers: this.headers,
      }
    );

    console.log("   ✅ Sleep log saved");
  }

  async testSocialLog() {
    const socialLogData = {
      method: "POST",
      path: "/api/lifestyle/social/challenge",
      status: 200,
      request_body: {
        challenge_type: "group_workout",
        participants: ["user_123", "user_456", "user_789"],
        duration_weeks: 4,
        goals: ["consistency", "motivation", "progress_sharing"],
      },
      response_body: {
        challenge_id: "challenge_001",
        start_date: "2025-09-04",
        leaderboard_enabled: true,
      },
      lifestyle_data: {
        social_features: {
          friend_count: 25,
          active_challenges: 3,
          motivation_level: "high",
          sharing_preferences: ["workouts", "nutrition", "progress_photos"],
        },
        community_engagement: {
          posts_this_week: 5,
          likes_given: 32,
          comments_made: 18,
          challenge_completions: 12,
        },
      },
    };

    const response = await axios.post(
      `${BASE_URL}/api/dynamite/logs/save`,
      socialLogData,
      {
        headers: this.headers,
      }
    );

    console.log("   ✅ Social activity log saved");
  }

  async runAllTests() {
    console.log("🚀 Starting Dynamite Lifestyle Logs Tests...\n");

    const results = {};

    // Test all endpoints
    // results.health = await this.testHealthCheck();
    results.saveApi = await this.testSaveApiLog();
    // results.saveApp = await this.testSaveAppLog();
    // results.getApi = await this.testGetApiLogs();
    // results.getApp = await this.testGetAppLogs();
    // results.lifestyle = await this.testLifestyleSpecificLogs();

    // Summary
    console.log("\n📊 Test Results Summary:");
    console.log("========================");
    Object.entries(results).forEach(([test, passed]) => {
      console.log(
        `${passed ? "✅" : "❌"} ${test}: ${passed ? "PASSED" : "FAILED"}`
      );
    });

    const passedCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;

    console.log(`\n🎯 Overall: ${passedCount}/${totalCount} tests passed`);

    if (passedCount === totalCount) {
      console.log(
        "🎉 All tests passed! Dynamite Lifestyle Logs server is working perfectly!"
      );
    } else {
      console.log("⚠️  Some tests failed. Check the logs above for details.");
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new DynamiteLogsTester();

  // Wait a bit for server to be ready
  setTimeout(() => {
    tester.runAllTests().catch(console.error);
  }, 2000);
}

module.exports = DynamiteLogsTester;
