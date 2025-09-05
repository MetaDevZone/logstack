# 📱 Dynamite Lifestyle Project - Quick Start Guide

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd dynamite-project
npm install
```

### 2. Environment Configuration

**Development Setup:**

```bash
# Copy .env.development to .env
copy .env.development .env

# Edit your MongoDB and AWS credentials in .env
```

**Production Setup:**

```bash
# Copy .env.production to .env
copy .env.production .env

# Edit your production MongoDB and AWS credentials in .env
```

### 3. Environment Variables to Configure

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET=your_s3_bucket_name

# API Security
API_KEY=your_api_key_here

# Server
PORT=4000
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Run Tests

```bash
npm test
```

## 📊 Features Configured

✅ **Daily Processing**: 12:00 AM every day  
✅ **Database Retention**: 90 days  
✅ **S3 Retention**: 180 days  
✅ **Compression**: Disabled for better performance  
✅ **S3 Security**: Disabled for simpler integration  
✅ **Environment Separation**: Dev/Prod databases and S3 buckets

## 🎯 Lifestyle App Integration

The project includes `dynamite-integration.js` which provides a complete client library for your main Dynamite Lifestyle app.

### Basic Usage in Your Main App:

```javascript
const DynamiteLogsClient = require("./dynamite-integration");

// Initialize
const logsClient = new DynamiteLogsClient(
  "http://localhost:4000",
  "dynamite-dev-api-key-2025",
  "development"
);

// Log user workout
await logsClient.logWorkout(userId, {
  session_id: "workout_123",
  duration_minutes: 45,
  calories_burned: 300,
  exercises: ["pushups", "squats"],
  goals: ["weight_loss", "strength"],
});

// Log nutrition
await logsClient.logNutrition(userId, {
  meal_type: "breakfast",
  calories: 400,
  plan_type: "keto",
});

// Log sleep
await logsClient.logSleep(userId, {
  total_hours: 7.5,
  quality_score: 8,
  target_hours: 8,
});
```

## 🔌 API Endpoints

| Method | Endpoint                  | Description           |
| ------ | ------------------------- | --------------------- |
| POST   | `/api/dynamite/logs/save` | Save API logs         |
| POST   | `/api/dynamite/logs/app`  | Save application logs |
| GET    | `/api/dynamite/logs/api`  | Get API logs          |
| GET    | `/api/dynamite/logs/app`  | Get application logs  |
| GET    | `/api/dynamite/health`    | Health check          |
| GET    | `/api/dynamite/status`    | System status         |

## 📈 Monitoring

- **Health Check**: http://localhost:4000/api/dynamite/health
- **System Status**: http://localhost:4000/api/dynamite/status
- **Logs Dashboard**: Built-in endpoints for log retrieval

## 🗂️ Project Structure

```
dynamite-project/
├── server.js                    # Main Express server
├── test.js                      # Comprehensive test suite
├── dynamite-integration.js      # Client library for main app
├── package.json                 # Dependencies and scripts
├── .env.development             # Dev environment config
├── .env.production              # Production environment config
└── README.md                    # This file
```

## 🔧 Customization

The server is configured specifically for Dynamite Lifestyle with:

- **Workout tracking** with fitness goals and progress
- **Nutrition logging** with dietary plans and macro tracking
- **Sleep monitoring** with quality scoring and recovery tracking
- **Social features** with challenges and sharing
- **Error handling** with lifestyle context

All configurations can be modified in `server.js` based on your needs.

## 🚦 Next Steps

1. ✅ **Configure environment variables**
2. ✅ **Start the server** with `npm run dev`
3. ✅ **Run tests** to verify setup with `npm test`
4. ✅ **Integrate with your main app** using `dynamite-integration.js`
5. ✅ **Deploy to production** when ready

## 💡 Tips

- Use different database names for dev/prod (already configured)
- Monitor logs via the API endpoints
- The cron job runs at 12 AM daily for batch processing
- Error logs include lifestyle context for better debugging
- All user data is flexibly stored - no strict schema requirements

Your Dynamite Lifestyle logging system is ready to use! 🎉
