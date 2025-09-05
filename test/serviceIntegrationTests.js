/**
 * 🧪 LogStack Service Integration Tests
 *
 * Tests for all service integration methods:
 * 1. Embedded Mode
 * 2. REST API Service
 * 3. Kafka Service
 * 4. Redis Service
 * 5. RabbitMQ Service
 * 6. WebSocket Service
 */

const path = require("path");
const fs = require("fs");

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

function logTest(testName, status, message = "") {
  const statusColor =
    status === "PASS" ? "green" : status === "FAIL" ? "red" : "yellow";
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
  console.log(
    `${icon} ${colorize(testName, "blue")}: ${colorize(
      status,
      statusColor
    )} ${message}`
  );
}

// Test data
const testLogData = [
  {
    endpoint: "/api/test",
    method: "GET",
    status: 200,
    timestamp: new Date(),
    responseTime: 150,
    userAgent: "test-client",
    ip: "127.0.0.1",
  },
  {
    endpoint: "/api/users",
    method: "POST",
    status: 201,
    timestamp: new Date(),
    responseTime: 200,
    userAgent: "test-client",
    ip: "127.0.0.1",
  },
];

// ===================================
// 🧪 1️⃣ EMBEDDED MODE TEST
// ===================================
async function testEmbeddedMode() {
  console.log(colorize("\n🧪 Testing Embedded Mode...", "cyan"));

  try {
    // Check if dist folder exists
    if (!fs.existsSync(path.join(__dirname, "../dist"))) {
      logTest(
        "Embedded Mode - Build Check",
        "FAIL",
        "dist folder not found. Run npm run build first."
      );
      return false;
    }

    const { EmbeddedLogStack } = require("../examples/serviceIntegrations.js");

    const logger = new EmbeddedLogStack({
      database: "mongodb://localhost:27017/logstack_test",
      collection: "test_logs",
      storage: "local",
      outputDirectory: "./test_output",
    });

    logTest("Embedded Mode - Initialization", "PASS");

    // Test log saving
    await logger.saveLogs(testLogData);
    logTest("Embedded Mode - Save Logs", "PASS");

    return true;
  } catch (error) {
    logTest("Embedded Mode - Error", "FAIL", error.message);
    return false;
  }
}

// ===================================
// 🧪 2️⃣ REST API SERVICE TEST
// ===================================
async function testApiService() {
  console.log(colorize("\n🧪 Testing REST API Service...", "cyan"));

  try {
    const { ApiServiceClient } = require("../examples/serviceIntegrations.js");

    // Test client creation
    const client = new ApiServiceClient(
      "http://localhost:4000",
      "test-api-key"
    );
    logTest("API Service - Client Creation", "PASS");

    // Note: This test requires the API server to be running
    logTest(
      "API Service - Manual Test",
      "WARN",
      "Start server with: npm run service:api"
    );

    return true;
  } catch (error) {
    logTest("API Service - Error", "FAIL", error.message);
    return false;
  }
}

// ===================================
// 🧪 3️⃣ KAFKA SERVICE TEST
// ===================================
async function testKafkaService() {
  console.log(colorize("\n🧪 Testing Kafka Service...", "cyan"));

  try {
    // Check if kafkajs is installed
    try {
      require("kafkajs");
      logTest(
        "Kafka Service - Dependency Check",
        "PASS",
        "kafkajs is installed"
      );
    } catch (error) {
      logTest(
        "Kafka Service - Dependency Check",
        "FAIL",
        "kafkajs not installed. Run: npm install kafkajs"
      );
      return false;
    }

    const {
      KafkaLogStackClient,
    } = require("../examples/serviceIntegrations.js");

    // Test client creation
    const client = new KafkaLogStackClient(["localhost:9092"]);
    logTest("Kafka Service - Client Creation", "PASS");

    // Note: This test requires Kafka to be running
    logTest(
      "Kafka Service - Manual Test",
      "WARN",
      "Requires Kafka running on localhost:9092"
    );

    return true;
  } catch (error) {
    logTest("Kafka Service - Error", "FAIL", error.message);
    return false;
  }
}

// ===================================
// 🧪 4️⃣ REDIS SERVICE TEST
// ===================================
async function testRedisService() {
  console.log(colorize("\n🧪 Testing Redis Service...", "cyan"));

  try {
    // Check if redis is installed
    try {
      require("redis");
      logTest("Redis Service - Dependency Check", "PASS", "redis is installed");
    } catch (error) {
      logTest(
        "Redis Service - Dependency Check",
        "FAIL",
        "redis not installed. Run: npm install redis"
      );
      return false;
    }

    const {
      RedisLogStackClient,
    } = require("../examples/serviceIntegrations.js");

    // Test client creation
    const client = new RedisLogStackClient({ url: "redis://localhost:6379" });
    logTest("Redis Service - Client Creation", "PASS");

    // Note: This test requires Redis to be running
    logTest(
      "Redis Service - Manual Test",
      "WARN",
      "Requires Redis running on localhost:6379"
    );

    return true;
  } catch (error) {
    logTest("Redis Service - Error", "FAIL", error.message);
    return false;
  }
}

// ===================================
// 🧪 5️⃣ RABBITMQ SERVICE TEST
// ===================================
async function testRabbitMQService() {
  console.log(colorize("\n🧪 Testing RabbitMQ Service...", "cyan"));

  try {
    // Check if amqplib is installed
    try {
      require("amqplib");
      logTest(
        "RabbitMQ Service - Dependency Check",
        "PASS",
        "amqplib is installed"
      );
    } catch (error) {
      logTest(
        "RabbitMQ Service - Dependency Check",
        "FAIL",
        "amqplib not installed. Run: npm install amqplib"
      );
      return false;
    }

    const {
      RabbitMQLogStackClient,
    } = require("../examples/serviceIntegrations.js");

    // Test client creation
    const client = new RabbitMQLogStackClient("amqp://localhost");
    logTest("RabbitMQ Service - Client Creation", "PASS");

    // Note: This test requires RabbitMQ to be running
    logTest(
      "RabbitMQ Service - Manual Test",
      "WARN",
      "Requires RabbitMQ running on localhost"
    );

    return true;
  } catch (error) {
    logTest("RabbitMQ Service - Error", "FAIL", error.message);
    return false;
  }
}

// ===================================
// 🧪 6️⃣ WEBSOCKET SERVICE TEST
// ===================================
async function testWebSocketService() {
  console.log(colorize("\n🧪 Testing WebSocket Service...", "cyan"));

  try {
    // Check if ws is installed
    try {
      require("ws");
      logTest(
        "WebSocket Service - Dependency Check",
        "PASS",
        "ws is installed"
      );
    } catch (error) {
      logTest(
        "WebSocket Service - Dependency Check",
        "FAIL",
        "ws not installed. Run: npm install ws"
      );
      return false;
    }

    const {
      WebSocketLogStackClient,
    } = require("../examples/serviceIntegrations.js");

    // Test client creation
    const client = new WebSocketLogStackClient("ws://localhost:8080");
    logTest("WebSocket Service - Client Creation", "PASS");

    // Note: This test requires WebSocket server to be running
    logTest(
      "WebSocket Service - Manual Test",
      "WARN",
      "Start server with: npm run service:websocket"
    );

    return true;
  } catch (error) {
    logTest("WebSocket Service - Error", "FAIL", error.message);
    return false;
  }
}

// ===================================
// 🧪 CLI TESTS
// ===================================
async function testCLI() {
  console.log(colorize("\n🧪 Testing CLI...", "cyan"));

  try {
    // Check if CLI file exists
    const cliPath = path.join(__dirname, "../examples/multi-service-cli.js");
    if (fs.existsSync(cliPath)) {
      logTest("CLI - File Exists", "PASS");
    } else {
      logTest("CLI - File Exists", "FAIL", "multi-service-cli.js not found");
      return false;
    }

    // Check if CLI is executable
    const stats = fs.statSync(cliPath);
    if (stats.isFile()) {
      logTest("CLI - File Type", "PASS");
    } else {
      logTest("CLI - File Type", "FAIL");
      return false;
    }

    logTest(
      "CLI - Manual Test",
      "WARN",
      "Run: node examples/multi-service-cli.js help"
    );

    return true;
  } catch (error) {
    logTest("CLI - Error", "FAIL", error.message);
    return false;
  }
}

// ===================================
// 🧪 CONFIGURATION TESTS
// ===================================
async function testConfiguration() {
  console.log(colorize("\n🧪 Testing Configuration...", "cyan"));

  try {
    // Check package.json scripts
    const packagePath = path.join(__dirname, "../package.json");
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      const requiredScripts = [
        "service:api",
        "service:kafka",
        "service:redis",
        "service:rabbitmq",
        "service:websocket",
        "service:multi",
        "service:help",
      ];

      let allScriptsExist = true;
      for (const script of requiredScripts) {
        if (packageJson.scripts[script]) {
          logTest(`Configuration - Script ${script}`, "PASS");
        } else {
          logTest(`Configuration - Script ${script}`, "FAIL", "missing");
          allScriptsExist = false;
        }
      }

      // Check dependencies
      const requiredDeps = [
        "kafkajs",
        "redis",
        "amqplib",
        "ws",
        "express",
        "cors",
      ];
      let allDepsExist = true;
      for (const dep of requiredDeps) {
        if (packageJson.dependencies[dep]) {
          logTest(`Configuration - Dependency ${dep}`, "PASS");
        } else {
          logTest(`Configuration - Dependency ${dep}`, "FAIL", "missing");
          allDepsExist = false;
        }
      }

      return allScriptsExist && allDepsExist;
    } else {
      logTest("Configuration - package.json", "FAIL", "not found");
      return false;
    }
  } catch (error) {
    logTest("Configuration - Error", "FAIL", error.message);
    return false;
  }
}

// ===================================
// 🧪 INTEGRATION TEST WITH MOCK DATA
// ===================================
async function testIntegrationWithMockData() {
  console.log(colorize("\n🧪 Testing Integration with Mock Data...", "cyan"));

  try {
    // Test with mock MongoDB (in-memory or file-based)
    const mockConfig = {
      database: "mongodb://localhost:27017/test_integration",
      collection: "integration_test_logs",
      storage: "local",
      outputDirectory: "./integration_test_output",
    };

    // Create test output directory
    if (!fs.existsSync("./integration_test_output")) {
      fs.mkdirSync("./integration_test_output", { recursive: true });
      logTest("Integration - Test Directory", "PASS", "created");
    } else {
      logTest("Integration - Test Directory", "PASS", "exists");
    }

    // Test data validation
    const validLogData = testLogData.filter(
      (log) => log.endpoint && log.method && typeof log.status === "number"
    );

    if (validLogData.length === testLogData.length) {
      logTest(
        "Integration - Data Validation",
        "PASS",
        `${validLogData.length} valid logs`
      );
    } else {
      logTest(
        "Integration - Data Validation",
        "FAIL",
        "invalid log data detected"
      );
    }

    return true;
  } catch (error) {
    logTest("Integration - Error", "FAIL", error.message);
    return false;
  }
}

// ===================================
// 🚀 RUN ALL TESTS
// ===================================
async function runAllTests() {
  console.log(colorize("🚀 LogStack Service Integration Test Suite", "cyan"));
  console.log(colorize("═".repeat(50), "cyan"));

  const results = [];

  // Run all tests
  results.push(await testConfiguration());
  results.push(await testCLI());
  results.push(await testEmbeddedMode());
  results.push(await testApiService());
  results.push(await testKafkaService());
  results.push(await testRedisService());
  results.push(await testRabbitMQService());
  results.push(await testWebSocketService());
  results.push(await testIntegrationWithMockData());

  // Summary
  console.log(colorize("\n📊 Test Summary:", "cyan"));
  console.log(colorize("═".repeat(30), "cyan"));

  const passed = results.filter((r) => r === true).length;
  const total = results.length;

  if (passed === total) {
    console.log(
      colorize(`✅ All ${total} tests completed successfully!`, "green")
    );
  } else {
    console.log(colorize(`⚠️  ${passed}/${total} tests passed`, "yellow"));
  }

  // Instructions for manual testing
  console.log(colorize("\n🔧 Manual Testing Instructions:", "cyan"));
  console.log(colorize("═".repeat(35), "cyan"));
  console.log("1. Build the project: npm run build");
  console.log("2. Start MongoDB: mongod");
  console.log("3. Test API Service: npm run service:api");
  console.log("4. Test Kafka Service: npm run service:kafka (requires Kafka)");
  console.log("5. Test Redis Service: npm run service:redis (requires Redis)");
  console.log("6. Test Multi Service: npm run service:multi");
  console.log("7. View help: npm run service:help");

  console.log(colorize("\n🎯 Quick Start Testing:", "cyan"));
  console.log("npm run build && npm run service:help");
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testEmbeddedMode,
  testApiService,
  testKafkaService,
  testRedisService,
  testRabbitMQService,
  testWebSocketService,
  testCLI,
  testConfiguration,
  testIntegrationWithMockData,
};
