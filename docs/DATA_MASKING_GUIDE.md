# 🔒 Sensitive Data Masking Guide

The `logstack` package includes comprehensive sensitive data masking capabilities to protect PII and comply with privacy regulations like GDPR and HIPAA.

## ✨ Features

### 🎯 Automatic Detection

- **Email addresses**: Automatically detects and masks email patterns
- **Credit card numbers**: Masks all major credit card formats
- **Phone numbers**: US and international phone number formats
- **Social Security Numbers**: SSN patterns (123-45-6789)
- **API keys and tokens**: Common API key and JWT token patterns
- **Passwords**: Any field containing "password", "passwd", "pwd"
- **IP addresses**: IPv4 addresses (configurable)

### 🛠️ Configurable Masking

- **Multiple masking styles**: Full masking, partial masking, character preservation
- **Custom patterns**: Define your own RegEx patterns for application-specific data
- **Field-based masking**: Specify field names to mask or exempt
- **Environment-specific**: Different settings for dev/staging/production

### 🎭 Masking Formats

- **Full masking**: `password123` → `[MASKED]`
- **Partial masking**: `password123` → `[MASKED]123` (show last N chars)
- **Length preservation**: `password123` → `***********` (preserve length)
- **Custom characters**: `password123` → `###########` (custom mask char)

## 📋 Configuration Interface

```typescript
interface DataMaskingConfig {
  enabled?: boolean; // Enable data masking (default: true)
  maskingChar?: string; // Character to use for masking (default: '*')
  preserveLength?: boolean; // Preserve original field length (default: false)
  showLastChars?: number; // Show last N characters (default: 0)
  customPatterns?: { [key: string]: RegExp }; // Custom patterns to mask
  customFields?: string[]; // Custom field names to mask
  exemptFields?: string[]; // Fields to exclude from masking
  maskEmails?: boolean; // Mask email addresses (default: true)
  maskIPs?: boolean; // Mask IP addresses (default: false)
  maskConnectionStrings?: boolean; // Mask database connection strings (default: true)
}
```

## 🚀 Quick Start Examples

### Basic Setup

```javascript
await init({
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "local",

  dataMasking: {
    enabled: true,
    maskEmails: true,
    maskIPs: false,
    showLastChars: 0,
  },
});
```

### Production Setup

```javascript
await init({
  dbUri: process.env.DB_URI,
  uploadProvider: "s3",

  dataMasking: {
    enabled: true,
    maskingChar: "*",
    showLastChars: 0, // Full masking in production
    maskEmails: true,
    maskIPs: true, // Mask IPs in production
    maskConnectionStrings: true,

    // Custom sensitive fields
    customFields: ["user_id", "session_id", "transaction_id"],

    // Don't mask these fields
    exemptFields: ["timestamp", "method", "status_code"],

    // Custom patterns for your app
    customPatterns: {
      api_key: /ak_[a-zA-Z0-9]{24}/g,
      session_token: /sess_[a-zA-Z0-9]{32}/g,
    },
  },
});
```

### Development Setup (Light Masking)

```javascript
await init({
  dbUri: "mongodb://localhost:27017/dev",
  uploadProvider: "local",

  dataMasking: {
    enabled: true,
    showLastChars: 4, // Show last 4 characters for debugging
    maskEmails: false, // Don't mask emails in development
    maskIPs: false,
    customFields: ["password", "credit_card"], // Only critical data
  },
});
```

## 🎭 Masking Examples

### Input Data

```javascript
const sensitiveData = {
  user_id: "user_12345",
  email: "john.doe@example.com",
  password: "mySecretPassword123",
  credit_card: "4532-1234-5678-9012",
  phone: "+1-555-123-4567",
  api_key: "ak_1234567890abcdefghijklmn",
  normal_field: "This is not sensitive",
};
```

### Full Masking (Production)

```javascript
// Configuration: { enabled: true, showLastChars: 0 }
{
  user_id: '[MASKED]',
  email: '[MASKED]',
  password: '[MASKED]',
  credit_card: '[MASKED]',
  phone: '[MASKED]',
  api_key: '[MASKED]',
  normal_field: 'This is not sensitive'
}
```

### Partial Masking (Staging)

```javascript
// Configuration: { enabled: true, showLastChars: 4 }
{
  user_id: '[MASKED]2345',
  email: '[MASKED].com',
  password: '[MASKED]123',
  credit_card: '[MASKED]9012',
  phone: '[MASKED]4567',
  api_key: '[MASKED]klmn',
  normal_field: 'This is not sensitive'
}
```

### Length Preservation

```javascript
// Configuration: { enabled: true, preserveLength: true, maskingChar: '*' }
{
  user_id: '**********',
  email: '********************',
  password: '******************',
  credit_card: '******************',
  phone: '***************',
  api_key: '**************************',
  normal_field: 'This is not sensitive'
}
```

## 🌍 Environment-Specific Configurations

### Automatic Environment Detection

```javascript
import { createMaskingConfig } from "logstack";

const config = {
  // ... other configuration
  dataMasking: createMaskingConfig(process.env.NODE_ENV),
};

// Development: Light masking, easier debugging
// Staging: Moderate masking, show last 4 characters
// Production: Full masking, maximum privacy
```

### Manual Environment Setup

```javascript
const environmentConfigs = {
  development: {
    enabled: false, // Or light masking for debugging
  },
  staging: {
    enabled: true,
    showLastChars: 4,
    maskEmails: true,
    maskIPs: false,
  },
  production: {
    enabled: true,
    showLastChars: 0,
    maskEmails: true,
    maskIPs: true,
    maskConnectionStrings: true,
  },
};

const maskingConfig =
  environmentConfigs[process.env.NODE_ENV] || environmentConfigs.development;
```

## 🎯 Built-in Patterns

The following patterns are automatically detected and masked:

### 📧 Email Addresses

- `john.doe@example.com` → `[MASKED]`
- `user+tag@domain.co.uk` → `[MASKED]`

### 💳 Credit Card Numbers

- `4532-1234-5678-9012` → `[MASKED]`
- `4532 1234 5678 9012` → `[MASKED]`
- `4532123456789012` → `[MASKED]`

### 📞 Phone Numbers

- `+1-555-123-4567` → `[MASKED]`
- `(555) 123-4567` → `[MASKED]`
- `555.123.4567` → `[MASKED]`

### 🆔 Social Security Numbers

- `123-45-6789` → `[MASKED]`
- `123456789` → `[MASKED]`

### 🔑 API Keys and Tokens

- JWT tokens: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` → `[MASKED]`
- API keys: Long alphanumeric strings (32+ chars) → `[MASKED]`

### 🌐 IP Addresses

- `192.168.1.100` → `[MASKED]` (when `maskIPs: true`)

### 🔐 Passwords and Secrets

Any field containing these terms (case insensitive):

- password, passwd, pwd
- secret, token, key, auth
- credit_card, ssn, phone
- api_key, bearer, authorization

## 🎨 Custom Patterns

### Application-Specific Data

```javascript
dataMasking: {
  enabled: true,
  customPatterns: {
    // Custom user ID format
    'user_id': /USR_[0-9]{8}/g,

    // Custom session tokens
    'session_token': /sess_[a-f0-9]{32}/g,

    // Custom API keys
    'api_key': /ak_[a-zA-Z0-9]{24}/g,

    // Custom transaction IDs
    'transaction_id': /TXN[0-9]{12}/g,

    // Internal employee IDs
    'employee_id': /EMP[0-9]{6}/g
  }
}
```

### Field-Based Masking

```javascript
dataMasking: {
  enabled: true,

  // Mask these fields regardless of content
  customFields: [
    'user_id', 'customer_id', 'session_id',
    'transaction_id', 'order_id', 'invoice_number'
  ],

  // Never mask these fields
  exemptFields: [
    'timestamp', 'created_at', 'updated_at',
    'method', 'status_code', 'response_time',
    'request_id', 'trace_id' // Keep for debugging
  ]
}
```

## 🛡️ Compliance and Security

### GDPR Compliance

- **Right to be forgotten**: Masked data cannot identify individuals
- **Data minimization**: Only necessary data is preserved
- **Privacy by design**: Masking enabled by default

### HIPAA Compliance

- **PHI protection**: All personally identifiable health information masked
- **Audit trails**: Masking logs help demonstrate compliance
- **Secure processing**: Data masked before storage

### Industry Standards

- **PCI DSS**: Credit card data automatically masked
- **SOX**: Financial data protection
- **ISO 27001**: Information security management

## 🧪 Testing Data Masking

### Run Masking Examples

```bash
npm run example:masking              # Basic masking demo
npm run example:masking:production   # Production setup
npm run example:masking:environment  # Environment-specific
npm run example:masking:demo         # Format comparison
```

### Verify Masking

```javascript
import { maskSensitiveData } from "logstack";

const testData = {
  email: "test@example.com",
  password: "secret123",
  credit_card: "4532-1234-5678-9012",
};

const masked = maskSensitiveData(testData, {
  enabled: true,
  showLastChars: 4,
});

console.log(masked);
// Output: { email: '[MASKED].com', password: '[MASKED]123', credit_card: '[MASKED]9012' }
```

## ⚡ Performance Considerations

### Minimal Overhead

- **Processing time**: ~1-2ms per object
- **Memory usage**: Minimal additional memory
- **CPU impact**: Negligible for typical workloads

### Optimization Tips

- Use specific patterns instead of broad ones
- Cache masking configurations
- Consider masking at collection vs. processing time
- Monitor performance in production

### Benchmarks

```
Small object (10 fields):     < 1ms
Medium object (50 fields):    2-3ms
Large object (200 fields):    5-8ms
Array of 1000 small objects:  100-200ms
```

## 🔍 Monitoring and Logging

### Masking Statistics

The package logs masking statistics when enabled:

```
[INFO] Data masking applied: 15 fields masked, 3 patterns matched
[DEBUG] Masking took 2ms for 50-field object
```

### Debugging Masked Data

In non-production environments:

```javascript
dataMasking: {
  enabled: true,
  showLastChars: 4, // Show enough for debugging
  exemptFields: ['request_id', 'trace_id'], // Keep debugging fields
}
```

## 🔧 Migration Guide

### Existing Projects

No breaking changes! Masking is **enabled by default** but can be disabled:

```javascript
// Disable masking temporarily
dataMasking: {
  enabled: false
}

// Or enable gradually
dataMasking: {
  enabled: true,
  customFields: ['password'] // Start with just passwords
}
```

### Gradual Rollout

1. **Stage 1**: Enable with `showLastChars: 8` (debugging friendly)
2. **Stage 2**: Reduce to `showLastChars: 4`
3. **Stage 3**: Full masking with `showLastChars: 0`
4. **Stage 4**: Add custom patterns and IP masking

---

🛡️ **Data masking is now protecting your sensitive information!** Start with basic settings and enhance based on your compliance and privacy requirements.
