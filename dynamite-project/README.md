# 🚀 Dynamite Lifestyle Logs Server

Complete LogStack-powered logging solution for Dynamite Lifestyle application.

## 🎯 Features

✅ **Environment-specific setup** (Development & Production)  
✅ **Daily cron jobs** at 12 AM  
✅ **Hourly log processing** with S3 uploads  
✅ **90 days database retention**  
✅ **180 days S3 retention**  
✅ **No compression** (as requested)  
✅ **No S3 security** (as requested)  
✅ **Lifestyle-specific data structure**

## 📦 Quick Setup

### 1. Install Dependencies

```bash
cd dynamite-project
npm install
```

### 2. Configure Environment

```bash
# Development
cp .env.development .env

# Production
cp .env.production .env
```

### 3. Update Environment Variables

Edit `.env` file with your actual values:

```env
# Database
DB_URI=mongodb://localhost:27017/dynamite_lifestyle_dev

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=dynamite-lifestyle-logs-dev

# API Security
API_KEY=your_secure_api_key
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm run prod
```

## 🔗 API Endpoints

### Save Logs

```bash
# Save API Log
POST /api/dynamite/logs/save
Headers: X-API-Key: your_api_key
Body: {
  "method": "POST",
  "path": "/api/lifestyle/profile",
  "status": 201,
  "user_id": "user_123",
  "lifestyle_data": {
    "app_version": "2.1.0",
    "subscription_type": "premium"
  }
}

# Save App Log
POST /api/dynamite/logs/app
Headers: X-API-Key: your_api_key
Body: {
  "level": "info",
  "message": "User completed workout",
  "service": "workout-tracker",
  "lifestyle_context": {
    "workout_type": "cardio",
    "duration": 30
  }
}
```

### Get Logs

```bash
# Get API Logs
GET /api/dynamite/logs/api?limit=100&method=POST
Headers: X-API-Key: your_api_key

# Get App Logs
GET /api/dynamite/logs/app?limit=100&level=info
Headers: X-API-Key: your_api_key
```

### Health Check

```bash
GET /health
# No authentication required
```

## 🏃‍♂️ Lifestyle Data Examples

### Workout Log

```javascript
{
  "level": "info",
  "message": "Workout completed",
  "service": "workout-tracker",
  "metadata": {
    "user_id": "user_123",
    "workout_data": {
      "duration_minutes": 45,
      "calories_burned": 320,
      "exercises": [
        {"name": "Push-ups", "reps": 20, "sets": 3}
      ]
    }
  },
  "lifestyle_context": {
    "goal_progress": {"weekly_workouts": 4},
    "streak_days": 12
  }
}
```

### Nutrition Log

```javascript
{
  "level": "info",
  "message": "Daily nutrition logged",
  "service": "nutrition-tracker",
  "metadata": {
    "nutrition_data": {
      "daily_totals": {
        "calories": 1850,
        "protein": 125,
        "carbs": 180
      }
    }
  }
}
```

### Sleep Log

```javascript
{
  "level": "info",
  "message": "Sleep analysis completed",
  "service": "sleep-tracker",
  "metadata": {
    "sleep_data": {
      "total_sleep_hours": 7.5,
      "sleep_quality_score": 8.2
    }
  }
}
```

## 🔄 Background Processing

### Automatic Jobs

- **Daily Jobs**: Created at 12 AM every day
- **Hourly Processing**: Logs processed and uploaded to S3 every hour
- **Database Cleanup**: Old logs removed after 90 days
- **S3 Cleanup**: Old files removed after 180 days

### Folder Structure on S3

```
dynamite-logs/
  dynamite-lifestyle-dev/  (or dynamite-lifestyle-prod)
    2025/
      09/
        04/
          hour-00-01.json  (12 AM - 1 AM logs)
          hour-01-02.json  (1 AM - 2 AM logs)
          hour-14-15.json  (2 PM - 3 PM logs)
          ...
```

## 🗄️ Database Collections

### Development Environment

- `dynamite_lifestyle_dev_api_logs`
- `dynamite_lifestyle_dev_app_logs`
- `dynamite_lifestyle_dev_jobs`

### Production Environment

- `dynamite_lifestyle_prod_api_logs`
- `dynamite_lifestyle_prod_app_logs`
- `dynamite_lifestyle_prod_jobs`

## 🧪 Testing

Run the test suite to verify everything works:

```bash
# Start server first
npm start

# In another terminal
npm test
```

Test includes:

- Health check
- Save API logs
- Save app logs
- Get logs with filters
- Lifestyle-specific data

## 🔧 Configuration Summary

| Setting           | Value               |
| ----------------- | ------------------- |
| Daily Cron        | 12:00 AM (midnight) |
| Hourly Processing | Every hour          |
| DB Retention      | 90 days             |
| S3 Retention      | 180 days            |
| Compression       | Disabled            |
| S3 Security       | Disabled            |
| File Format       | JSON                |

## 🛑 Admin Operations

### Stop All Jobs (Maintenance Mode)

```bash
POST /admin/dynamite/stop-jobs
Headers: X-API-Key: your_api_key
```

### Graceful Shutdown

```bash
# Send SIGTERM or SIGINT
kill -TERM <process_id>
# or
Ctrl+C
```

## 📊 Monitoring

### Health Check Response

```json
{
  "success": true,
  "service": "Dynamite Lifestyle Development",
  "environment": "dynamite-lifestyle-dev",
  "status": "healthy",
  "config": {
    "database": "Connected",
    "s3_bucket": "dynamite-lifestyle-logs-dev",
    "retention_db": "90 days",
    "retention_s3": "180 days",
    "compression": "Disabled",
    "s3_security": "Disabled"
  }
}
```

## 🚀 Deployment

### Development

```bash
NODE_ENV=development npm start
```

### Production

```bash
NODE_ENV=production npm start
```

### With PM2

```bash
pm2 start server.js --name "dynamite-logs-dev" --env development
pm2 start server.js --name "dynamite-logs-prod" --env production
```

## 📋 Checklist

- [x] ✅ Environment-specific configurations
- [x] ✅ Daily cron at 12 AM
- [x] ✅ Hourly log processing
- [x] ✅ 90 days DB retention
- [x] ✅ 180 days S3 retention
- [x] ✅ Compression disabled
- [x] ✅ S3 security disabled
- [x] ✅ Lifestyle data structure
- [x] ✅ API endpoints ready
- [x] ✅ Test suite included
- [x] ✅ Graceful shutdown
- [x] ✅ Health monitoring

**Server ready for Dynamite Lifestyle application! 🎉**
