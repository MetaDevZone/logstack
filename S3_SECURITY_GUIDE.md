# 🔒 S3 File Security Implementation Guide

## Overview

LogStack ab **protected S3 file access** provide karta hai jisme direct file URLs hit nahi kar sakte. Sab files **pre-signed URLs** aur **access tokens** ke through secure access milti hai.

## 🛡️ Security Features

### 1. Pre-signed URLs

- ✅ **Temporary URLs** jo 1 hour mein expire ho jate hain
- ✅ **AWS Signature V4** authentication
- ✅ **No direct S3 access** required

### 2. Access Token Management

- ✅ **User-specific tokens** with permissions
- ✅ **Token expiration** (default 1 hour)
- ✅ **Token revocation** capability

### 3. User Permission Control

- ✅ **Date-based access** - users sirf 180 days purane files access kar sakte hain
- ✅ **Service-based filtering** (optional)
- ✅ **Read/Write permissions** control

### 4. Access Logging & Monitoring

- ✅ **Every file access logged** for audit
- ✅ **Failed access attempts** tracked
- ✅ **User activity monitoring**

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install aws-sdk crypto
```

### 2. Environment Variables

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your-logs-bucket

# Security Settings (optional)
S3_SECURITY_ENABLED=true
S3_TOKEN_EXPIRATION=3600
S3_MAX_FILE_AGE_DAYS=180
```

### 3. Initialize Security

```javascript
const { initializeS3Security } = require("./production-setup");

// Initialize security on app startup
initializeS3Security();
```

## 📚 API Usage

### 1. Generate Access Token

```javascript
POST /api/files/generate-token

Headers:
Authorization: Bearer YOUR_AUTH_TOKEN

Body:
{
  "permissions": ["read"]
}

Response:
{
  "success": true,
  "accessToken": "abc123...",
  "expiration": 1725456000000,
  "message": "Access token generated successfully"
}
```

### 2. Get Secure Download URL

```javascript
POST /api/files/download-url

Headers:
Authorization: Bearer YOUR_AUTH_TOKEN

Body:
{
  "fileName": "production-logs/2025/09/04/hour-14-15.json.gz",
  "accessToken": "abc123..."
}

Response:
{
  "success": true,
  "downloadUrl": "https://bucket.s3.amazonaws.com/file.json?AWSAccessKeyId=...",
  "expiration": 1725456000000,
  "message": "Secure download URL generated"
}
```

### 3. List Accessible Files

```javascript
GET /api/files/list?folder=production-logs/2025/09/04

Headers:
Authorization: Bearer YOUR_AUTH_TOKEN

Response:
{
  "success": true,
  "files": [
    {
      "key": "production-logs/2025/09/04/hour-14-15.json.gz",
      "size": 1024,
      "lastModified": "2025-09-04T14:00:00Z",
      "accessible": true
    }
  ],
  "count": 1
}
```

### 4. Revoke Access Token

```javascript
POST /api/files/revoke-token

Headers:
Authorization: Bearer YOUR_AUTH_TOKEN

Body:
{
  "accessToken": "abc123..."
}

Response:
{
  "success": true,
  "message": "Access token revoked successfully"
}
```

## 🔧 Implementation Examples

### Express.js Integration

```javascript
const express = require("express");
const { setupSecureFileAccess } = require("./secure-file-api");

const app = express();
app.use(express.json());

// Setup secure file access endpoints
setupSecureFileAccess(app);

app.listen(3000, () => {
  console.log("🔐 Secure file access enabled on port 3000");
});
```

### Frontend JavaScript Usage

```javascript
// Complete workflow
async function downloadSecureFile(fileName) {
  try {
    // Step 1: Generate access token
    const tokenResponse = await fetch("/api/files/generate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAuthToken,
      },
      body: JSON.stringify({ permissions: ["read"] }),
    });

    const { accessToken } = await tokenResponse.json();

    // Step 2: Get secure download URL
    const urlResponse = await fetch("/api/files/download-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAuthToken,
      },
      body: JSON.stringify({
        fileName,
        accessToken,
      }),
    });

    const { downloadUrl } = await urlResponse.json();

    // Step 3: Download file
    window.open(downloadUrl, "_blank");

    // Step 4: Revoke token (optional)
    await fetch("/api/files/revoke-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAuthToken,
      },
      body: JSON.stringify({ accessToken }),
    });
  } catch (error) {
    console.error("File download failed:", error);
  }
}
```

### React Component Example

```jsx
import React, { useState, useEffect } from "react";

function SecureFileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccessibleFiles();
  }, []);

  const loadAccessibleFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/files/list", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
      });

      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Failed to load files:", error);
    }
    setLoading(false);
  };

  const downloadFile = async (fileName) => {
    // Use the downloadSecureFile function from above
    await downloadSecureFile(fileName);
  };

  return (
    <div>
      <h3>🔒 Secure Log Files</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file.key}>
              {file.key} ({file.size} bytes)
              <button onClick={() => downloadFile(file.key)}>
                🔗 Secure Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 🧪 Testing

### Start Test Server

```bash
node s3-security-test.js
```

### Test Endpoints

```bash
# Health check
curl http://localhost:4000/health

# Demo info
curl http://localhost:4000/api/demo/security-test

# Generate token (requires auth)
curl -X POST http://localhost:4000/api/files/generate-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_token" \
  -d '{"permissions": ["read"]}'
```

## ⚙️ Configuration Options

### S3 Security Manager Settings

```javascript
const securityConfig = {
  accessKeyId: "your_aws_key",
  secretAccessKey: "your_aws_secret",
  region: "us-east-1",
  bucket: "your-bucket",
  defaultExpiration: 3600, // 1 hour
  maxFileAge: 180, // 180 days
};
```

### User Permissions Structure

```javascript
const userPermissions = {
  read: true,
  write: false,
  delete: false,
  dateRestriction: true,
  dayLimit: 180, // Access files from last 180 days
  serviceRestriction: false,
  allowedServices: [], // Specific services only
};
```

## 🔍 Security Benefits

### ✅ Protection Against:

- **Direct S3 URL access**
- **Unauthorized file downloads**
- **Token replay attacks**
- **Long-term URL exposure**

### ✅ Provides:

- **Audit trail** of all file access
- **User-specific permissions**
- **Time-limited access**
- **Token management**

### ✅ Features:

- **Automatic token cleanup**
- **Failed access logging**
- **Permission validation**
- **Date-based restrictions**

## 📊 Monitoring

### Access Logs

```javascript
// Every file access is logged
🔐 Pre-signed URL generated for user: user123, file: logs/2025/09/04/hour-14.json
✅ Secure access granted - User: user123, File: logs/2025/09/04/hour-14.json
❌ Access denied - User: user456, File: logs/2025/08/01/old-file.json, Error: File older than 180 days
```

### Token Statistics

```javascript
const stats = s3SecurityManager.getAccessStats();
// {
//   activeTokens: 5,
//   totalGenerated: 150,
//   revokedTokens: 45
// }
```

## 🎯 Best Practices

1. **Regular Token Cleanup** - Expired tokens automatically cleaned every hour
2. **Short Expiration Times** - Default 1 hour for download URLs
3. **User Permission Validation** - Check permissions before every access
4. **Access Logging** - Monitor all file access attempts
5. **Date Restrictions** - Limit access to recent files only

---

**🛡️ Your S3 files are now completely protected with enterprise-grade security!**
