# 🚀 LogStack Service Integration Guide

LogStack provides multiple ways to integrate log processing into your applications. Choose the method that best fits your architecture and requirements.

## 📋 Integration Options

### 1️⃣ **Embedded Mode (Same Project)**

Direct integration within your existing application - no separate service needed.

```javascript
const LogStack = require("logstack");

const logger = new LogStack({
  database: "mongodb://localhost:27017/myapp",
  collection: "api_logs",
  storage: "local",
});

// Use directly in your app
await logger.saveLogs([logData]);
```

**Benefits:**

- ✅ Simple integration
- ✅ No network overhead
- ✅ Direct database access
- ✅ Immediate processing

**Use When:**

- Small to medium applications
- Single service architecture
- Direct database access available

---

### 2️⃣ **REST API Service**

HTTP-based service for external applications with authentication and rate limiting.

```bash
# Start API server
node examples/multi-service-cli.js api --port 4000

# Or using npm
npm run server
```

```javascript
// Client usage
const client = new ApiServiceClient("http://localhost:4000", "your-api-key");
await client.saveLogs([logData]);
```

**Benefits:**

- ✅ Language agnostic
- ✅ HTTP standard protocol
- ✅ Built-in authentication
- ✅ Rate limiting protection

**Use When:**

- Multiple applications/languages
- Microservices architecture
- Cross-platform integration
- Need authentication

---

### 3️⃣ **Kafka Message Service**

Event-driven processing with high throughput and scalability.

```bash
# Start Kafka service
node examples/multi-service-cli.js kafka --brokers localhost:9092
```

```javascript
// Producer (Client)
const client = new KafkaLogStackClient(["localhost:9092"]);
await client.connect();
await client.sendLogs([logData]);
```

**Benefits:**

- ✅ High throughput
- ✅ Event-driven architecture
- ✅ Horizontal scaling
- ✅ Message persistence

**Use When:**

- High volume logging
- Event-driven systems
- Need message persistence
- Distributed architecture

---

### 4️⃣ **Redis Queue Service**

Fast in-memory queue processing for quick log handling.

```bash
# Start Redis service
node examples/multi-service-cli.js redis --url redis://localhost:6379
```

```javascript
// Client usage
const client = new RedisLogStackClient({ url: "redis://localhost:6379" });
await client.connect();
await client.sendLogs([logData]);
```

**Benefits:**

- ✅ Ultra-fast processing
- ✅ Simple queue mechanism
- ✅ Low latency
- ✅ Memory-based storage

**Use When:**

- Need fast processing
- Simple queue requirements
- Low latency critical
- Temporary data acceptable

---

### 5️⃣ **RabbitMQ Service**

Reliable message queuing with advanced routing and persistence.

```bash
# Start RabbitMQ service
node examples/multi-service-cli.js rabbitmq --url amqp://localhost
```

```javascript
// Client usage
const client = new RabbitMQLogStackClient("amqp://localhost");
await client.connect();
await client.sendLogs([logData]);
```

**Benefits:**

- ✅ Message reliability
- ✅ Advanced routing
- ✅ Message persistence
- ✅ Dead letter queues

**Use When:**

- Need guaranteed delivery
- Complex routing requirements
- Message persistence critical
- Enterprise environments

---

### 6️⃣ **WebSocket Service**

Real-time bidirectional communication for live log streaming.

```bash
# Start WebSocket service
node examples/multi-service-cli.js websocket --port 8080
```

```javascript
// Client usage
const client = new WebSocketLogStackClient("ws://localhost:8080");
await client.connect();
await client.sendLogs([logData]);
```

**Benefits:**

- ✅ Real-time communication
- ✅ Bidirectional data flow
- ✅ Live updates
- ✅ Low overhead

**Use When:**

- Real-time dashboards
- Live monitoring
- Interactive applications
- Immediate feedback needed

---

## 🎯 **Multi-Service Mode**

Run multiple services simultaneously for redundancy and load distribution.

```bash
# Start multiple services
node examples/multi-service-cli.js multi --services api,kafka,redis
```

**Benefits:**

- ✅ Redundancy
- ✅ Load distribution
- ✅ Multiple integration options
- ✅ Fault tolerance

---

## 🔧 **Service Dependencies**

### Required Dependencies by Service Type:

```json
{
  "embedded": ["mongoose", "aws-sdk", "winston"],
  "api": ["express", "cors", "helmet", "compression"],
  "kafka": ["kafkajs"],
  "redis": ["redis"],
  "rabbitmq": ["amqplib"],
  "websocket": ["ws"]
}
```

### Installation Commands:

```bash
# For Kafka
npm install kafkajs

# For Redis
npm install redis

# For RabbitMQ
npm install amqplib

# For WebSocket
npm install ws

# All at once
npm install kafkajs redis amqplib ws
```

---

## 📊 **Performance Comparison**

| Service Type | Throughput | Latency    | Reliability | Complexity |
| ------------ | ---------- | ---------- | ----------- | ---------- |
| Embedded     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐      | ⭐         |
| REST API     | ⭐⭐⭐     | ⭐⭐⭐     | ⭐⭐⭐⭐    | ⭐⭐       |
| Kafka        | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐   |
| Redis        | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐      | ⭐⭐       |
| RabbitMQ     | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐⭐⭐  | ⭐⭐⭐     |
| WebSocket    | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐      | ⭐⭐       |

---

## 🏗️ **Architecture Recommendations**

### **Small Applications**

```
┌─────────────────┐
│   Your App      │
│  ┌───────────┐  │
│  │ LogStack  │  │ ← Embedded Mode
│  │ Embedded  │  │
│  └───────────┘  │
└─────────────────┘
```

### **Microservices**

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Service A│    │ Service B│    │ Service C│
└────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
              ┌─────────────┐
              │ LogStack    │ ← API Service
              │ API Server  │
              └─────────────┘
```

### **High Volume Systems**

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Service A│    │ Service B│    │ Service C│
└────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
              ┌─────────────┐
              │   Kafka     │ ← Message Queue
              │   Cluster   │
              └──────┬──────┘
                     │
              ┌─────────────┐
              │ LogStack    │ ← Kafka Consumer
              │ Processor   │
              └─────────────┘
```

---

## 🚀 **Quick Start Commands**

```bash
# Clone and install
git clone <your-repo>
cd logstack
npm install

# Install optional dependencies
npm install kafkajs redis amqplib ws

# Start different services
node examples/multi-service-cli.js help
node examples/multi-service-cli.js embedded
node examples/multi-service-cli.js api --port 4000
node examples/multi-service-cli.js kafka --brokers localhost:9092
node examples/multi-service-cli.js redis --url redis://localhost:6379
node examples/multi-service-cli.js multi --services api,redis
```

---

## 💡 **Best Practices**

1. **Choose Based on Scale:**

   - Small apps: Embedded mode
   - Medium apps: REST API
   - Large apps: Kafka/RabbitMQ

2. **Consider Latency:**

   - Real-time: WebSocket or Embedded
   - Near real-time: Redis or REST API
   - Batch processing: Kafka or RabbitMQ

3. **Plan for Growth:**

   - Start with embedded/API
   - Migrate to messaging as you scale
   - Use multi-service for redundancy

4. **Monitor Performance:**
   - Track message processing time
   - Monitor queue depths
   - Set up alerts for failures

Choose the integration method that best fits your current needs and future growth plans! 🎯
