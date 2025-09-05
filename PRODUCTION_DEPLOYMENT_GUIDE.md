# 🚀 Production Deployment Guide

## Complete Implementation Features

✅ **AWS S3** - Daily folder structure with automatic uploads  
✅ **180 Days** - File retention in S3 with lifecycle policies  
✅ **14 Days** - API logs retention in MongoDB  
✅ **No Compression** - Files stored without compression  
✅ **Password Masking** - Sensitive data protection  
✅ **Fully Testable** - Complete test suite included

## 📋 Pre-Production Checklist

### 1. AWS S3 Setup

```bash
# Create S3 bucket (replace 'your-bucket-name' with actual bucket)
aws s3 mb s3://your-production-logstack-bucket

# Set bucket lifecycle policy for 180-day retention
aws s3api put-bucket-lifecycle-configuration \
  --bucket your-production-logstack-bucket \
  --lifecycle-configuration file://s3-lifecycle-policy.json
```

### 2. Environment Variables

Create `.env.production` file:

```bash
# Database
MONGODB_URI=mongodb://your-mongodb-connection-string
NODE_ENV=production

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET=your-production-logstack-bucket

# Optional: Additional settings
LOG_LEVEL=info
```

### 3. MongoDB Setup

```bash
# Create MongoDB database and user (if needed)
mongo
use logstack-production
db.createUser({
  user: "logstack_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

## 🚀 Production Deployment

### Quick Start

```bash
# 1. Set environment variables
export $(cat .env.production | xargs)

# 2. Run production implementation
node production-implementation.js
```

### Docker Deployment

```dockerfile
FROM node:18-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["node", "production-implementation.js"]
```

### PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start production-implementation.js --name "logstack-production"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 📁 Expected Folder Structure

### S3 Bucket Organization

```
your-production-logstack-bucket/
├── production-logs_2025-09-02/
│   ├── hour-00-01/
│   │   ├── success/
│   │   │   └── processed/
│   │   │       ├── api_logs_2025-09-02_00-01_001.json
│   │   │       └── api_logs_2025-09-02_00-01_002.json
│   │   └── failed/
│   │       └── processed/
│   ├── hour-14-15/
│   │   ├── success/
│   │   └── failed/
│   └── hour-23-24/
├── production-logs_2025-09-03/
└── production-logs_2025-09-04/
```

### MongoDB Collections

```
logstack-production database:
├── production_jobs         (Job queue and status)
├── production_logs         (Processing logs)
└── production_api_logs     (API request/response logs - 14 days retention)
```

## 🔒 Security Features

### Password Masking Example

```json
{
  "request": {
    "email": "user@example.com",
    "password": "********", // Fully masked
    "token": "********", // Custom field masked
    "username": "john_doe" // Not masked
  },
  "response": {
    "success": true,
    "session_id": "abc123"
  }
}
```

### Data Protection

- ✅ Passwords completely masked
- ✅ Email addresses masked (optional)
- ✅ Custom sensitive fields configurable
- ✅ IP addresses can be masked (configurable)
- ✅ Server-side encryption in S3

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```bash
# Manual health check
curl http://localhost:3000/health

# Expected response
{
  "status": "healthy",
  "database": "connected",
  "s3": "accessible",
  "uptime": "2h 30m",
  "lastProcessed": "2025-09-02T14:30:00Z"
}
```

### System Metrics

- 📈 Memory usage monitoring
- ⏱️ Processing time tracking
- 🔄 Job queue status
- 📦 S3 upload success rate
- 🗄️ Database connection health

## 🗑️ Retention Policies

### Automatic Cleanup

- **MongoDB**: API logs older than 14 days automatically deleted
- **S3 Files**: Files older than 180 days automatically deleted via lifecycle policy
- **Local Files**: Cleaned up after successful S3 upload

### Manual Retention Management

```bash
# Check retention status
node -e "require('./production-implementation').healthCheck()"

# Force cleanup (emergency)
node scripts/force-cleanup.js --confirm
```

## 🚨 Troubleshooting

### Common Issues

#### 1. AWS Credentials Error

```
Error: AWS credentials not found
```

**Solution**: Verify environment variables are set correctly

```bash
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $S3_BUCKET
```

#### 2. MongoDB Connection Failed

```
Error: connection ECONNREFUSED
```

**Solution**: Check MongoDB connection string and network access

```bash
# Test MongoDB connection
mongo $MONGODB_URI --eval "db.stats()"
```

#### 3. S3 Upload Failed

```
Error: Access Denied
```

**Solution**: Verify S3 bucket permissions and IAM policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket/*"
    }
  ]
}
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=debug
node production-implementation.js
```

## 📈 Performance Optimization

### Recommended Settings

- **Batch Size**: 1000 records (adjust based on memory)
- **Timeout**: 30 seconds for S3 uploads
- **Retry Policy**: 3 attempts with exponential backoff
- **Memory**: Minimum 512MB RAM recommended

### Scaling Considerations

- Use multiple workers for high-volume processing
- Consider Redis for job queue in multi-instance setup
- Implement horizontal scaling with load balancer

## 🔧 Maintenance

### Regular Tasks

- Monitor S3 costs and usage
- Check MongoDB performance
- Review error logs weekly
- Update dependencies monthly
- Backup configuration files

### Update Procedure

```bash
# 1. Backup current deployment
pm2 save

# 2. Update code
git pull origin main
npm ci

# 3. Restart service
pm2 restart logstack-production

# 4. Verify health
pm2 logs logstack-production --lines 50
```

## 📞 Support

### Logs Location

- **Application Logs**: PM2 logs or console output
- **MongoDB Logs**: `/var/log/mongodb/`
- **S3 Access Logs**: CloudTrail (if enabled)

### Key Configuration Files

- `production-implementation.js` - Main application
- `.env.production` - Environment variables
- `s3-lifecycle-policy.json` - S3 retention policy
- `ecosystem.config.js` - PM2 configuration

---

**🎉 Your production log processing system is ready!**

All requirements implemented:

- ✅ AWS S3 with daily folders
- ✅ 180 days file retention
- ✅ 14 days API logs retention
- ✅ No file compression
- ✅ Password masking
- ✅ Completely testable

**Next Steps**: Set your environment variables and run `node production-implementation.js`
