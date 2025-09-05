/**
 * 🚀 LogStack Service Integrations
 *
 * Multiple ways to use LogStack as a service:
 * 1. Embedded Mode (Same Project)
 * 2. REST API Service
 * 3. Kafka Message Service
 * 4. Redis Queue Service
 * 5. RabbitMQ Service
 * 6. WebSocket Service
 */

const LogStack = require("../dist/index.js");

// ===================================
// 1️⃣ EMBEDDED MODE (SAME PROJECT)
// ===================================
class EmbeddedLogStack {
  constructor(config) {
    this.logStack = new LogStack(config);
  }

  async saveLogs(logData) {
    return await this.logStack.saveLogs(logData);
  }

  async processJobs() {
    return await this.logStack.processJobs();
  }
}

// Usage:
async function embeddedExample() {
  const logger = new EmbeddedLogStack({
    database: "mongodb://localhost:27017/myapp",
    collection: "api_logs",
    storage: "local",
  });

  await logger.saveLogs([
    { endpoint: "/api/users", method: "GET", status: 200 },
  ]);
}

// ===================================
// 2️⃣ REST API SERVICE
// ===================================
class ApiServiceClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async saveLogs(logData) {
    const response = await fetch(`${this.baseUrl}/api/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
      },
      body: JSON.stringify({ logs: logData }),
    });
    return await response.json();
  }

  async getLogs(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseUrl}/api/logs?${queryString}`, {
      headers: { "X-API-Key": this.apiKey },
    });
    return await response.json();
  }
}

// Usage:
async function apiServiceExample() {
  const client = new ApiServiceClient("http://localhost:4000", "your-api-key");

  await client.saveLogs([
    { endpoint: "/api/products", method: "POST", status: 201 },
  ]);
}

// ===================================
// 3️⃣ KAFKA MESSAGE SERVICE
// ===================================
class KafkaLogStackService {
  constructor(config) {
    this.kafka = require("kafkajs").kafka({
      clientId: "logstack-service",
      brokers: config.brokers || ["localhost:9092"],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "logstack-group" });
    this.logStack = new LogStack(config.logstack);
  }

  async start() {
    await this.producer.connect();
    await this.consumer.connect();

    // Subscribe to log events
    await this.consumer.subscribe({ topic: "logstack-logs" });

    // Process incoming messages
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const logData = JSON.parse(message.value.toString());
        await this.logStack.saveLogs([logData]);
        console.log("✅ Processed log via Kafka:", logData.endpoint);
      },
    });
  }

  async sendLogs(logData) {
    await this.producer.send({
      topic: "logstack-logs",
      messages: logData.map((log) => ({
        key: log.endpoint,
        value: JSON.stringify(log),
      })),
    });
  }

  async stop() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }
}

// Kafka Producer (Client Side)
class KafkaLogStackClient {
  constructor(brokers) {
    this.kafka = require("kafkajs").kafka({
      clientId: "logstack-client",
      brokers: brokers || ["localhost:9092"],
    });
    this.producer = this.kafka.producer();
  }

  async connect() {
    await this.producer.connect();
  }

  async sendLogs(logData) {
    await this.producer.send({
      topic: "logstack-logs",
      messages: logData.map((log) => ({
        key: log.endpoint,
        value: JSON.stringify(log),
      })),
    });
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}

// Usage:
async function kafkaServiceExample() {
  // Service Side
  const service = new KafkaLogStackService({
    brokers: ["localhost:9092"],
    logstack: {
      database: "mongodb://localhost:27017/logs",
      storage: "aws",
    },
  });
  await service.start();

  // Client Side
  const client = new KafkaLogStackClient(["localhost:9092"]);
  await client.connect();

  await client.sendLogs([
    { endpoint: "/api/orders", method: "POST", status: 200 },
  ]);

  await client.disconnect();
}

// ===================================
// 4️⃣ REDIS QUEUE SERVICE
// ===================================
class RedisLogStackService {
  constructor(config) {
    this.redis = require("redis").createClient(config.redis);
    this.logStack = new LogStack(config.logstack);
    this.queueName = config.queueName || "logstack:queue";
  }

  async start() {
    await this.redis.connect();
    console.log("🚀 Redis LogStack Service started");

    // Process queue continuously
    this.processQueue();
  }

  async processQueue() {
    while (true) {
      try {
        const message = await this.redis.blPop(this.queueName, 5);
        if (message) {
          const logData = JSON.parse(message.element);
          await this.logStack.saveLogs([logData]);
          console.log("✅ Processed log via Redis:", logData.endpoint);
        }
      } catch (error) {
        console.error("❌ Redis queue error:", error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  async stop() {
    await this.redis.disconnect();
  }
}

// Redis Client
class RedisLogStackClient {
  constructor(redisConfig) {
    this.redis = require("redis").createClient(redisConfig);
    this.queueName = "logstack:queue";
  }

  async connect() {
    await this.redis.connect();
  }

  async sendLogs(logData) {
    for (const log of logData) {
      await this.redis.rPush(this.queueName, JSON.stringify(log));
    }
  }

  async disconnect() {
    await this.redis.disconnect();
  }
}

// Usage:
async function redisServiceExample() {
  // Service Side
  const service = new RedisLogStackService({
    redis: { url: "redis://localhost:6379" },
    logstack: {
      database: "mongodb://localhost:27017/logs",
      storage: "local",
    },
  });
  await service.start();

  // Client Side
  const client = new RedisLogStackClient({ url: "redis://localhost:6379" });
  await client.connect();

  await client.sendLogs([
    { endpoint: "/api/payments", method: "POST", status: 200 },
  ]);

  await client.disconnect();
}

// ===================================
// 5️⃣ RABBITMQ SERVICE
// ===================================
class RabbitMQLogStackService {
  constructor(config) {
    this.amqp = require("amqplib");
    this.connectionUrl = config.rabbitmq || "amqp://localhost";
    this.queueName = config.queueName || "logstack_queue";
    this.logStack = new LogStack(config.logstack);
  }

  async start() {
    this.connection = await this.amqp.connect(this.connectionUrl);
    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue(this.queueName, { durable: true });

    console.log("🚀 RabbitMQ LogStack Service started");

    // Consume messages
    this.channel.consume(this.queueName, async (message) => {
      if (message) {
        const logData = JSON.parse(message.content.toString());
        await this.logStack.saveLogs([logData]);
        console.log("✅ Processed log via RabbitMQ:", logData.endpoint);
        this.channel.ack(message);
      }
    });
  }

  async stop() {
    await this.channel.close();
    await this.connection.close();
  }
}

// RabbitMQ Client
class RabbitMQLogStackClient {
  constructor(connectionUrl) {
    this.amqp = require("amqplib");
    this.connectionUrl = connectionUrl || "amqp://localhost";
    this.queueName = "logstack_queue";
  }

  async connect() {
    this.connection = await this.amqp.connect(this.connectionUrl);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queueName, { durable: true });
  }

  async sendLogs(logData) {
    for (const log of logData) {
      this.channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(log)),
        { persistent: true }
      );
    }
  }

  async disconnect() {
    await this.channel.close();
    await this.connection.close();
  }
}

// Usage:
async function rabbitmqServiceExample() {
  // Service Side
  const service = new RabbitMQLogStackService({
    rabbitmq: "amqp://localhost",
    logstack: {
      database: "mongodb://localhost:27017/logs",
      storage: "aws",
    },
  });
  await service.start();

  // Client Side
  const client = new RabbitMQLogStackClient("amqp://localhost");
  await client.connect();

  await client.sendLogs([
    { endpoint: "/api/notifications", method: "POST", status: 200 },
  ]);

  await client.disconnect();
}

// ===================================
// 6️⃣ WEBSOCKET SERVICE
// ===================================
class WebSocketLogStackService {
  constructor(config) {
    this.WebSocket = require("ws");
    this.port = config.port || 8080;
    this.logStack = new LogStack(config.logstack);
  }

  start() {
    this.wss = new this.WebSocket.Server({ port: this.port });

    console.log(`🚀 WebSocket LogStack Service started on port ${this.port}`);

    this.wss.on("connection", (ws) => {
      console.log("🔗 Client connected");

      ws.on("message", async (message) => {
        try {
          const logData = JSON.parse(message);
          await this.logStack.saveLogs([logData]);

          ws.send(
            JSON.stringify({
              status: "success",
              message: "Log saved successfully",
            })
          );

          console.log("✅ Processed log via WebSocket:", logData.endpoint);
        } catch (error) {
          ws.send(
            JSON.stringify({
              status: "error",
              message: error.message,
            })
          );
        }
      });

      ws.on("close", () => {
        console.log("🔌 Client disconnected");
      });
    });
  }

  stop() {
    this.wss.close();
  }
}

// WebSocket Client
class WebSocketLogStackClient {
  constructor(url) {
    this.WebSocket = require("ws");
    this.url = url || "ws://localhost:8080";
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new this.WebSocket(this.url);

      this.ws.on("open", () => {
        console.log("🔗 Connected to LogStack WebSocket service");
        resolve();
      });

      this.ws.on("error", reject);
    });
  }

  async sendLogs(logData) {
    for (const log of logData) {
      this.ws.send(JSON.stringify(log));
    }
  }

  disconnect() {
    this.ws.close();
  }
}

// Usage:
async function websocketServiceExample() {
  // Service Side
  const service = new WebSocketLogStackService({
    port: 8080,
    logstack: {
      database: "mongodb://localhost:27017/logs",
      storage: "local",
    },
  });
  service.start();

  // Client Side
  const client = new WebSocketLogStackClient("ws://localhost:8080");
  await client.connect();

  await client.sendLogs([
    { endpoint: "/api/websocket", method: "GET", status: 200 },
  ]);

  client.disconnect();
}

// ===================================
// 🎯 UNIFIED SERVICE MANAGER
// ===================================
class LogStackServiceManager {
  constructor() {
    this.services = new Map();
  }

  async startService(type, config) {
    let service;

    switch (type) {
      case "api":
        const { LogStackServer } = require("../server.js");
        service = new LogStackServer(config);
        await service.start();
        break;

      case "kafka":
        service = new KafkaLogStackService(config);
        await service.start();
        break;

      case "redis":
        service = new RedisLogStackService(config);
        await service.start();
        break;

      case "rabbitmq":
        service = new RabbitMQLogStackService(config);
        await service.start();
        break;

      case "websocket":
        service = new WebSocketLogStackService(config);
        service.start();
        break;

      default:
        throw new Error(`Unknown service type: ${type}`);
    }

    this.services.set(type, service);
    console.log(`✅ Started ${type} service`);
  }

  async stopService(type) {
    const service = this.services.get(type);
    if (service && service.stop) {
      await service.stop();
      this.services.delete(type);
      console.log(`🛑 Stopped ${type} service`);
    }
  }

  async stopAll() {
    for (const [type, service] of this.services) {
      await this.stopService(type);
    }
  }
}

// Usage Example:
async function multiServiceExample() {
  const manager = new LogStackServiceManager();

  // Start multiple services
  await manager.startService("api", { port: 4000 });
  await manager.startService("kafka", {
    brokers: ["localhost:9092"],
    logstack: { database: "mongodb://localhost:27017/logs" },
  });
  await manager.startService("redis", {
    redis: { url: "redis://localhost:6379" },
    logstack: { database: "mongodb://localhost:27017/logs" },
  });

  // Services are now running...

  // Stop all services
  // await manager.stopAll();
}

module.exports = {
  EmbeddedLogStack,
  ApiServiceClient,
  KafkaLogStackService,
  KafkaLogStackClient,
  RedisLogStackService,
  RedisLogStackClient,
  RabbitMQLogStackService,
  RabbitMQLogStackClient,
  WebSocketLogStackService,
  WebSocketLogStackClient,
  LogStackServiceManager,

  // Example functions
  embeddedExample,
  apiServiceExample,
  kafkaServiceExample,
  redisServiceExample,
  rabbitmqServiceExample,
  websocketServiceExample,
  multiServiceExample,
};
