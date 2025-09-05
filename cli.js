#!/usr/bin/env node

/**
 * 🚀 LogStack CLI - Dual Mode Launcher
 *
 * Start LogStack as:
 * 1. Standalone server (separate service)
 * 2. Embedded mode (in your existing project)
 */

const path = require("path");
const fs = require("fs");

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
  console.log(colorize("\n╔══════════════════════════════════════╗", "cyan"));
  console.log(colorize("║           🚀 LogStack CLI            ║", "cyan"));
  console.log(colorize("║      Dual-Mode Log Processing       ║", "cyan"));
  console.log(colorize("╚══════════════════════════════════════╝", "cyan"));
}

function showHelp() {
  showBanner();
  console.log("\n📋 Usage Options:\n");

  console.log(colorize("🎯 Mode 1: Standalone Server", "yellow"));
  console.log("  logstack server [options]");
  console.log("  npm run server");
  console.log("  node server.js\n");

  console.log(colorize("🎯 Mode 2: Embedded (in your project)", "yellow"));
  console.log('  const logstack = require("logstack");');
  console.log("  await logstack.init(config);\n");

  console.log(colorize("⚙️  Server Options:", "blue"));
  console.log("  --port, -p <port>       Server port (default: 4000)");
  console.log("  --host, -h <host>       Server host (default: 0.0.0.0)");
  console.log("  --api-key <key>         API key for authentication");
  console.log("  --no-auth               Disable authentication");
  console.log("  --no-rate-limit         Disable rate limiting");
  console.log("  --config, -c <file>     Configuration file path");
  console.log("  --env <env>             Environment (dev/prod/staging)");
  console.log("  --auto-init             Auto-initialize with config file\n");

  console.log(colorize("📁 Configuration Examples:", "green"));
  console.log("  logstack server --port 3001 --api-key my-secret-key");
  console.log("  logstack server --config ./logstack.config.js --auto-init");
  console.log("  logstack server --env production --no-rate-limit\n");

  console.log(colorize("🌐 Environment Variables:", "magenta"));
  console.log("  LOGSTACK_PORT              Server port");
  console.log("  LOGSTACK_HOST              Server host");
  console.log("  LOGSTACK_API_KEY           API authentication key");
  console.log("  LOGSTACK_ENABLE_AUTH       Enable/disable auth (true/false)");
  console.log("  LOGSTACK_ENABLE_RATE_LIMIT Rate limiting (true/false)");
  console.log(
    "  LOGSTACK_CORS_ORIGIN       CORS origin (* or specific domain)"
  );
  console.log(
    "  NODE_ENV                   Environment (development/production)\n"
  );

  console.log(colorize("📖 Quick Examples:", "cyan"));
  console.log("\n🚀 Start standalone server:");
  console.log("  npm run server");
  console.log("  # OR");
  console.log("  logstack server --port 4000 --api-key secure-key-123\n");

  console.log("🔧 Embedded in your app:");
  console.log('  const { init } = require("logstack");');
  console.log(
    '  await init({ dbUri: "mongodb://...", uploadProvider: "s3" });\n'
  );

  console.log("📡 API Client usage:");
  console.log('  const LogStackClient = require("logstack/client");');
  console.log(
    '  const client = new LogStackClient("http://localhost:4000", "api-key");\n'
  );
}

function parseArgs(argv) {
  const args = {
    mode: "help",
    port: process.env.LOGSTACK_PORT || 4000,
    host: process.env.LOGSTACK_HOST || "0.0.0.0",
    apiKey: process.env.LOGSTACK_API_KEY || `logstack-${Date.now()}`,
    enableAuth: process.env.LOGSTACK_ENABLE_AUTH !== "false",
    enableRateLimit: process.env.LOGSTACK_ENABLE_RATE_LIMIT !== "false",
    configFile: null,
    environment: process.env.NODE_ENV || "development",
    autoInit: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const nextArg = argv[i + 1];

    switch (arg) {
      case "server":
        args.mode = "server";
        break;
      case "--port":
      case "-p":
        args.port = parseInt(nextArg) || args.port;
        i++;
        break;
      case "--host":
      case "-h":
        args.host = nextArg || args.host;
        i++;
        break;
      case "--api-key":
        args.apiKey = nextArg || args.apiKey;
        i++;
        break;
      case "--no-auth":
        args.enableAuth = false;
        break;
      case "--no-rate-limit":
        args.enableRateLimit = false;
        break;
      case "--config":
      case "-c":
        args.configFile = nextArg;
        i++;
        break;
      case "--env":
        args.environment = nextArg || args.environment;
        process.env.NODE_ENV = args.environment;
        i++;
        break;
      case "--auto-init":
        args.autoInit = true;
        break;
      case "--help":
        args.mode = "help";
        break;
    }
  }

  return args;
}

function loadConfig(configFile) {
  try {
    const configPath = path.resolve(configFile);

    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    // Clear require cache to allow reloading
    delete require.cache[require.resolve(configPath)];

    const config = require(configPath);
    console.log(
      colorize(`✅ Configuration loaded from: ${configPath}`, "green")
    );

    return config;
  } catch (error) {
    console.error(
      colorize(`❌ Failed to load configuration: ${error.message}`, "red")
    );
    process.exit(1);
  }
}

function createDefaultConfig() {
  const configPath = path.join(process.cwd(), "logstack.config.js");

  if (fs.existsSync(configPath)) {
    console.log(
      colorize(`⚠️  Configuration file already exists: ${configPath}`, "yellow")
    );
    return;
  }

  const defaultConfig = `// LogStack Configuration
module.exports = {
  // Database connection
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/logstack',
  
  // Storage provider
  uploadProvider: 'local', // or 's3'
  
  // Output directory
  outputDirectory: 'logstack-data',
  
  // S3 configuration (if using S3)
  s3: {
    bucket: process.env.S3_BUCKET || 'logstack-logs',
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  
  // Collections
  collections: {
    apiLogsCollectionName: 'api_logs',
    jobsCollectionName: 'jobs',
    logsCollectionName: 'processing_logs'
  },
  
  // Retention policies
  retention: {
    database: {
      apiLogs: 30,     // days
      jobs: 90,        // days
      autoCleanup: true
    },
    storage: {
      files: 365,      // days
      autoCleanup: true
    }
  },
  
  // File format and compression
  fileFormat: 'json',
  compression: {
    enabled: true,
    format: 'gzip',
    level: 6
  },
  
  // Data masking
  dataMasking: {
    enabled: true,
    maskEmails: true,
    maskIPs: false
  },
  
  // Logging
  logging: {
    level: 'info',
    enableConsole: true
  }
};`;

  try {
    fs.writeFileSync(configPath, defaultConfig);
    console.log(
      colorize(`✅ Default configuration created: ${configPath}`, "green")
    );
    console.log(
      colorize(
        "📝 Please edit the configuration file before starting the server",
        "yellow"
      )
    );
  } catch (error) {
    console.error(
      colorize(
        `❌ Failed to create configuration file: ${error.message}`,
        "red"
      )
    );
    process.exit(1);
  }
}

async function startServer(args) {
  try {
    showBanner();

    console.log(
      colorize("\n🚀 Starting LogStack Standalone Server...", "cyan")
    );
    console.log(`📍 Mode: ${colorize("Standalone Server", "yellow")}`);
    console.log(
      `🌐 Host: ${colorize(args.host, "blue")}:${colorize(args.port, "blue")}`
    );
    console.log(
      `🔐 Auth: ${colorize(
        args.enableAuth ? "Enabled" : "Disabled",
        args.enableAuth ? "green" : "red"
      )}`
    );
    console.log(
      `⚡ Rate Limit: ${colorize(
        args.enableRateLimit ? "Enabled" : "Disabled",
        args.enableRateLimit ? "green" : "red"
      )}`
    );
    console.log(`🌍 Environment: ${colorize(args.environment, "magenta")}`);

    const LogStackServer = require("./server.js");

    const serverConfig = {
      port: args.port,
      host: args.host,
      apiKey: args.apiKey,
      enableAuth: args.enableAuth,
      enableRateLimit: args.enableRateLimit,
    };

    const server = new LogStackServer(serverConfig);
    await server.start();

    // Auto-initialize if config file provided
    if (args.autoInit && args.configFile) {
      console.log(colorize("\n🔧 Auto-initializing LogStack...", "yellow"));

      const config = loadConfig(args.configFile);
      const logstack = require("./dist/index.js");

      await logstack.init(config);
      console.log(
        colorize("✅ LogStack auto-initialized successfully!", "green")
      );
      console.log(colorize("🤖 Automatic cron jobs are now running", "cyan"));
    } else {
      console.log(
        colorize(
          "\n📝 To initialize LogStack, make a POST request to:",
          "yellow"
        )
      );
      console.log(
        colorize(`   http://${args.host}:${args.port}/api/initialize`, "blue")
      );
      console.log(
        colorize(
          "   With your LogStack configuration in the request body",
          "yellow"
        )
      );
    }
  } catch (error) {
    console.error(
      colorize(`❌ Server startup failed: ${error.message}`, "red")
    );
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs(process.argv);

  switch (args.mode) {
    case "server":
      await startServer(args);
      break;

    case "init-config":
      createDefaultConfig();
      break;

    case "help":
    default:
      showHelp();
      break;
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log(colorize("\n\n🛑 Shutting down LogStack server...", "yellow"));
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log(colorize("\n\n🛑 LogStack server terminated", "yellow"));
  process.exit(0);
});

// Run CLI
if (require.main === module) {
  main().catch((error) => {
    console.error(colorize(`❌ CLI Error: ${error.message}`, "red"));
    process.exit(1);
  });
}

module.exports = { main, parseArgs, loadConfig, createDefaultConfig };
