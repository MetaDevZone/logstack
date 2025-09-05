#!/usr/bin/env node

/**
 * 🚀 LogStack Multi-Service CLI
 *
 * Start LogStack in different modes:
 * 1. Embedded (same project)
 * 2. REST API Service
 * 3. Kafka Service
 * 4. Redis Queue Service
 * 5. RabbitMQ Service
 * 6. WebSocket Service
 */

const { LogStackServiceManager } = require("./serviceIntegrations.js");

// CLI Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function showBanner() {
  console.log(
    colorize("\n╔════════════════════════════════════════════╗", "cyan")
  );
  console.log(
    colorize("║        🚀 LogStack Multi-Service CLI       ║", "cyan")
  );
  console.log(
    colorize("║      Choose Your Integration Method        ║", "cyan")
  );
  console.log(
    colorize("╚════════════════════════════════════════════╝", "cyan")
  );
}

function showHelp() {
  showBanner();
  console.log("\n📋 Available Service Options:\n");

  console.log(colorize("1️⃣  Embedded Mode (Same Project)", "yellow"));
  console.log("   ├─ Direct integration in your existing codebase");
  console.log("   ├─ No separate service needed");
  console.log('   └─ Usage: require("logstack") in your code\n');

  console.log(colorize("2️⃣  REST API Service", "yellow"));
  console.log("   ├─ HTTP endpoints for external applications");
  console.log("   ├─ Authentication & rate limiting included");
  console.log("   └─ Command: node multi-service-cli.js api --port 4000\n");

  console.log(colorize("3️⃣  Kafka Message Service", "yellow"));
  console.log("   ├─ Event-driven log processing");
  console.log("   ├─ High throughput & scalability");
  console.log(
    "   └─ Command: node multi-service-cli.js kafka --brokers localhost:9092\n"
  );

  console.log(colorize("4️⃣  Redis Queue Service", "yellow"));
  console.log("   ├─ Simple queue-based processing");
  console.log("   ├─ Fast in-memory operations");
  console.log(
    "   └─ Command: node multi-service-cli.js redis --url redis://localhost:6379\n"
  );

  console.log(colorize("5️⃣  RabbitMQ Service", "yellow"));
  console.log("   ├─ Reliable message queuing");
  console.log("   ├─ Advanced routing & persistence");
  console.log(
    "   └─ Command: node multi-service-cli.js rabbitmq --url amqp://localhost\n"
  );

  console.log(colorize("6️⃣  WebSocket Service", "yellow"));
  console.log("   ├─ Real-time bidirectional communication");
  console.log("   ├─ Live log streaming");
  console.log(
    "   └─ Command: node multi-service-cli.js websocket --port 8080\n"
  );

  console.log(colorize("🎯 Multi-Service Mode", "yellow"));
  console.log("   ├─ Run multiple services simultaneously");
  console.log("   ├─ Load balancing & redundancy");
  console.log("   └─ Command: node multi-service-cli.js multi\n");

  console.log(colorize("⚙️  Common Options:", "blue"));
  console.log("   --database    MongoDB connection string");
  console.log("   --storage     Storage provider (aws, local)");
  console.log("   --collection  MongoDB collection name");
  console.log("   --config      Config file path\n");

  console.log(colorize("📖 Examples:", "green"));
  console.log(
    "   node multi-service-cli.js api --port 4000 --database mongodb://localhost:27017/logs"
  );
  console.log(
    "   node multi-service-cli.js kafka --brokers localhost:9092,localhost:9093"
  );
  console.log(
    "   node multi-service-cli.js redis --url redis://localhost:6379"
  );
  console.log(
    "   node multi-service-cli.js multi --services api,kafka,redis\n"
  );
}

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = {};

  for (let i = 1; i < args.length; i += 2) {
    if (args[i].startsWith("--")) {
      const key = args[i].substring(2);
      const value = args[i + 1];
      options[key] = value;
    }
  }

  return { command, options };
}

function getLogStackConfig(options) {
  return {
    database:
      options.database ||
      process.env.LOGSTACK_DATABASE ||
      "mongodb://localhost:27017/logstack",
    storage: options.storage || process.env.LOGSTACK_STORAGE || "local",
    collection:
      options.collection || process.env.LOGSTACK_COLLECTION || "api_logs",
  };
}

async function startApiService(options) {
  console.log(colorize("🚀 Starting REST API Service...", "green"));

  const LogStackServer = require("../server.js");
  const server = new LogStackServer({
    port: options.port || 4000,
    logstack: getLogStackConfig(options),
  });

  await server.start();
  console.log(
    colorize(
      `✅ REST API Service running on port ${options.port || 4000}`,
      "green"
    )
  );
}

async function startKafkaService(options) {
  console.log(colorize("🚀 Starting Kafka Service...", "green"));

  const { KafkaLogStackService } = require("./serviceIntegrations.js");
  const brokers = options.brokers
    ? options.brokers.split(",")
    : ["localhost:9092"];

  const service = new KafkaLogStackService({
    brokers,
    logstack: getLogStackConfig(options),
  });

  await service.start();
  console.log(
    colorize(
      `✅ Kafka Service running with brokers: ${brokers.join(", ")}`,
      "green"
    )
  );
}

async function startRedisService(options) {
  console.log(colorize("🚀 Starting Redis Queue Service...", "green"));

  const { RedisLogStackService } = require("./serviceIntegrations.js");
  const service = new RedisLogStackService({
    redis: { url: options.url || "redis://localhost:6379" },
    logstack: getLogStackConfig(options),
  });

  await service.start();
  console.log(
    colorize(
      `✅ Redis Service running on ${options.url || "redis://localhost:6379"}`,
      "green"
    )
  );
}

async function startRabbitMQService(options) {
  console.log(colorize("🚀 Starting RabbitMQ Service...", "green"));

  const { RabbitMQLogStackService } = require("./serviceIntegrations.js");
  const service = new RabbitMQLogStackService({
    rabbitmq: options.url || "amqp://localhost",
    logstack: getLogStackConfig(options),
  });

  await service.start();
  console.log(
    colorize(
      `✅ RabbitMQ Service running on ${options.url || "amqp://localhost"}`,
      "green"
    )
  );
}

async function startWebSocketService(options) {
  console.log(colorize("🚀 Starting WebSocket Service...", "green"));

  const { WebSocketLogStackService } = require("./serviceIntegrations.js");
  const service = new WebSocketLogStackService({
    port: options.port || 8080,
    logstack: getLogStackConfig(options),
  });

  service.start();
  console.log(
    colorize(
      `✅ WebSocket Service running on port ${options.port || 8080}`,
      "green"
    )
  );
}

async function startMultiService(options) {
  console.log(colorize("🚀 Starting Multi-Service Mode...", "green"));

  const manager = new LogStackServiceManager();
  const services = options.services
    ? options.services.split(",")
    : ["api", "redis"];

  for (const serviceType of services) {
    try {
      switch (serviceType.trim()) {
        case "api":
          await manager.startService("api", {
            port: options.apiPort || 4000,
            logstack: getLogStackConfig(options),
          });
          break;

        case "kafka":
          await manager.startService("kafka", {
            brokers: options.brokers
              ? options.brokers.split(",")
              : ["localhost:9092"],
            logstack: getLogStackConfig(options),
          });
          break;

        case "redis":
          await manager.startService("redis", {
            redis: { url: options.redisUrl || "redis://localhost:6379" },
            logstack: getLogStackConfig(options),
          });
          break;

        case "rabbitmq":
          await manager.startService("rabbitmq", {
            rabbitmq: options.rabbitmqUrl || "amqp://localhost",
            logstack: getLogStackConfig(options),
          });
          break;

        case "websocket":
          await manager.startService("websocket", {
            port: options.wsPort || 8080,
            logstack: getLogStackConfig(options),
          });
          break;
      }
    } catch (error) {
      console.log(
        colorize(`❌ Failed to start ${serviceType}: ${error.message}`, "red")
      );
    }
  }

  console.log(
    colorize(
      `✅ Multi-Service Mode running with: ${services.join(", ")}`,
      "green"
    )
  );

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log(colorize("\n🛑 Shutting down services...", "yellow"));
    await manager.stopAll();
    process.exit(0);
  });
}

function showEmbeddedExample() {
  console.log(colorize("\n📦 Embedded Mode Example:", "yellow"));
  console.log(colorize("────────────────────────────", "blue"));

  const example = `
// Install: npm install logstack
const LogStack = require('logstack');

// Initialize
const logger = new LogStack({
  database: 'mongodb://localhost:27017/myapp',
  collection: 'api_logs',
  storage: 'local' // or 'aws'
});

// Use in your application
app.use(async (req, res, next) => {
  // Your API logic here
  
  // Log the request
  await logger.saveLogs([{
    endpoint: req.path,
    method: req.method,
    status: res.statusCode,
    timestamp: new Date(),
    responseTime: Date.now() - req.startTime
  }]);
  
  next();
});

// Process logs periodically
setInterval(async () => {
  await logger.processJobs();
}, 60000); // Every minute
`;

  console.log(colorize(example, "white"));
}

async function main() {
  const { command, options } = parseArgs();

  if (
    !command ||
    command === "help" ||
    command === "--help" ||
    command === "-h"
  ) {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case "embedded":
        showEmbeddedExample();
        break;

      case "api":
        await startApiService(options);
        break;

      case "kafka":
        await startKafkaService(options);
        break;

      case "redis":
        await startRedisService(options);
        break;

      case "rabbitmq":
        await startRabbitMQService(options);
        break;

      case "websocket":
        await startWebSocketService(options);
        break;

      case "multi":
        await startMultiService(options);
        break;

      default:
        console.log(colorize(`❌ Unknown command: ${command}`, "red"));
        console.log(
          colorize('💡 Use "help" to see available options', "yellow")
        );
    }
  } catch (error) {
    console.log(colorize(`❌ Error: ${error.message}`, "red"));
    process.exit(1);
  }

  // Keep process alive for services
  if (command !== "embedded" && command !== "help") {
    console.log(
      colorize("\n🎯 Service is running... Press Ctrl+C to stop", "cyan")
    );

    process.on("SIGINT", () => {
      console.log(colorize("\n👋 Goodbye!", "green"));
      process.exit(0);
    });
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, showHelp, showEmbeddedExample };
