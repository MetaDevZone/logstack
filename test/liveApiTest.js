/**
 * 🧪 LogStack API Service Live Test
 *
 * Tests the running API service endpoints
 */

const fetch = require("node-fetch");

// Colors for test output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Test configuration
const API_BASE_URL = "http://localhost:4000";
const API_KEY = "logstack-default-key-change-in-production";

async function testEndpoint(method, endpoint, data = null, expectAuth = true) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
    };

    if (expectAuth) {
      headers["X-API-Key"] = API_KEY;
    }

    const options = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    const status = response.status;
    const statusColor = status >= 200 && status < 300 ? "green" : "red";

    console.log(
      `${colorize("●", statusColor)} ${method} ${endpoint} - Status: ${colorize(
        status,
        statusColor
      )}`
    );

    if (status >= 400) {
      console.log(`  Error: ${result.error || result.message}`);
    } else {
      console.log(`  ✅ ${result.message || "Success"}`);
    }

    return { status, result };
  } catch (error) {
    console.log(
      `${colorize("●", "red")} ${method} ${endpoint} - ${colorize(
        "FAILED",
        "red"
      )}`
    );
    console.log(`  Error: ${error.message}`);
    return { status: "ERROR", error: error.message };
  }
}

async function runLiveTests() {
  console.log(colorize("\n🧪 LogStack API Service Live Tests", "cyan"));
  console.log(colorize("═".repeat(45), "cyan"));
  console.log(`Testing API at: ${API_BASE_URL}`);
  console.log(`Using API Key: ${API_KEY.substring(0, 20)}...`);
  console.log("");

  // Test 1: Health check (no auth required)
  console.log(colorize("1️⃣ Testing Health Check...", "yellow"));
  await testEndpoint("GET", "/health", null, false);

  // Test 2: Service info (no auth required)
  console.log(colorize("\n2️⃣ Testing Service Info...", "yellow"));
  await testEndpoint("GET", "/info", null, false);

  // Test 3: Initialize LogStack
  console.log(colorize("\n3️⃣ Testing LogStack Initialization...", "yellow"));
  const initData = {
    dbUri: "mongodb://localhost:27017/logstack_test",
    uploadProvider: "local",
    outputDirectory: "./test_output",
    collections: {
      apiLogs: "test_api_logs",
      jobs: "test_jobs",
    },
  };
  await testEndpoint("POST", "/api/initialize", initData);

  // Test 4: Save single log
  console.log(colorize("\n4️⃣ Testing Save Single Log...", "yellow"));
  const singleLog = {
    method: "GET",
    path: "/api/test",
    responseStatus: 200,
    requestHeaders: { "user-agent": "test-client" },
    responseBody: { message: "test successful" },
    client_ip: "127.0.0.1",
  };
  await testEndpoint("POST", "/api/logs", singleLog);

  // Test 5: Save batch logs
  console.log(colorize("\n5️⃣ Testing Save Batch Logs...", "yellow"));
  const batchLogs = {
    logs: [
      {
        method: "POST",
        path: "/api/users",
        responseStatus: 201,
        requestBody: { name: "Test User" },
        responseBody: { id: 1, name: "Test User" },
      },
      {
        method: "GET",
        path: "/api/products",
        responseStatus: 200,
        requestQuery: { category: "electronics" },
        responseBody: { products: [] },
      },
    ],
  };
  await testEndpoint("POST", "/api/logs/batch", batchLogs);

  // Test 6: Retrieve logs
  console.log(colorize("\n6️⃣ Testing Retrieve Logs...", "yellow"));
  await testEndpoint("GET", "/api/logs?limit=5&method=GET");

  // Test 7: Create daily jobs
  console.log(colorize("\n7️⃣ Testing Create Daily Jobs...", "yellow"));
  const today = new Date().toISOString().split("T")[0];
  await testEndpoint("POST", "/api/jobs/create", { date: today });

  // Test 8: Run hourly job
  console.log(colorize("\n8️⃣ Testing Run Hourly Job...", "yellow"));
  const currentHour = new Date().getHours();
  await testEndpoint("POST", "/api/jobs/run", {
    date: today,
    hour: currentHour,
  });

  // Test 9: Get statistics
  console.log(colorize("\n9️⃣ Testing Get Statistics...", "yellow"));
  await testEndpoint("GET", "/api/stats");

  // Test 10: Authentication failure test
  console.log(colorize("\n🔒 Testing Authentication Failure...", "yellow"));
  const headers = { "Content-Type": "application/json" };
  try {
    const response = await fetch(`${API_BASE_URL}/api/logs`, {
      method: "GET",
      headers, // No API key
    });

    if (response.status === 401) {
      console.log(
        `${colorize("●", "green")} Authentication test - Status: ${colorize(
          "401",
          "green"
        )}`
      );
      console.log(`  ✅ Correctly rejected request without API key`);
    } else {
      console.log(
        `${colorize("●", "red")} Authentication test - Status: ${colorize(
          response.status,
          "red"
        )}`
      );
      console.log(`  ❌ Should have returned 401 for missing API key`);
    }
  } catch (error) {
    console.log(
      `${colorize("●", "red")} Authentication test - ${colorize(
        "FAILED",
        "red"
      )}`
    );
    console.log(`  Error: ${error.message}`);
  }

  console.log(colorize("\n🎯 Live API Tests Completed!", "cyan"));
  console.log(colorize("═".repeat(35), "cyan"));
  console.log("To stop the API server, press Ctrl+C in the server terminal.\n");
}

// Check if node-fetch is available, install if needed
async function checkDependencies() {
  try {
    require("node-fetch");
    return true;
  } catch (error) {
    console.log(colorize("❌ node-fetch not found. Installing...", "yellow"));
    const { exec } = require("child_process");

    return new Promise((resolve, reject) => {
      exec("npm install node-fetch@2.6.1", (error, stdout, stderr) => {
        if (error) {
          console.log(colorize("❌ Failed to install node-fetch", "red"));
          console.log("Please run: npm install node-fetch@2.6.1");
          resolve(false);
        } else {
          console.log(
            colorize("✅ node-fetch installed successfully", "green")
          );
          resolve(true);
        }
      });
    });
  }
}

async function main() {
  const depsOk = await checkDependencies();
  if (!depsOk) {
    console.log(colorize("❌ Dependencies not available. Exiting.", "red"));
    return;
  }

  console.log(colorize("🚀 Starting Live API Tests...", "cyan"));
  console.log("Make sure the API server is running on port 4000");
  console.log("Run: node examples/multi-service-cli.js api --port 4000\n");

  // Wait a moment for user to read
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await runLiveTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runLiveTests, testEndpoint };
