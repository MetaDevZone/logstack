# 📊 LogStack Database Schema Guide

## 🔄 **Flexible Schema - Kuch Bhi Save Kar Sakte Hain!**

LogStack mein MongoDB use hota hai jo **schema-less** hai, matlab aap **koi bhi object** save kar sakte hain!

---

## 📝 **1. API Logs Schema**

### **Minimum Required Fields:**

```javascript
{
  method: "POST",           // Required
  path: "/api/users",       // Required
  responseStatus: 200       // Required
}
```

### **Complete Available Fields:**

```javascript
{
  // Basic Request Info (Required)
  method: "POST",                    // GET, POST, PUT, DELETE, etc.
  path: "/api/users/123",           // API endpoint path
  responseStatus: 200,              // HTTP status code

  // Timing (Auto-generated if not provided)
  request_time: new Date(),         // When request started
  response_time: new Date(),        // When response sent
  responseTime: 1250,               // Response time in milliseconds

  // Request Data (All Optional)
  requestBody: {                    // Koi bhi object
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    preferences: {
      theme: "dark",
      notifications: true
    }
  },

  requestHeaders: {                 // HTTP headers
    "content-type": "application/json",
    "authorization": "Bearer token123",
    "user-agent": "Mozilla/5.0...",
    "custom-header": "any-value"
  },

  requestQuery: {                   // URL query parameters
    page: 1,
    limit: 10,
    filter: "active",
    search: "john"
  },

  requestParams: {                  // URL path parameters
    userId: "123",
    companyId: "456"
  },

  // Response Data (Optional)
  responseBody: {                   // Koi bhi response object
    success: true,
    data: {
      id: 123,
      name: "John Doe",
      created_at: "2025-09-04T10:30:00Z"
    },
    message: "User created successfully"
  },

  // Client Info (Optional)
  client_ip: "192.168.1.100",
  client_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",

  // Custom Metadata (Bilkul Free!)
  metadata: {
    user_id: "user123",
    session_id: "sess456",
    transaction_id: "txn789",
    custom_field_1: "any value",
    custom_field_2: { nested: "object" },
    custom_array: [1, 2, 3, "string", { obj: true }],
    business_context: {
      department: "sales",
      region: "asia",
      version: "v2.1.0"
    }
  }
}
```

## 📱 **2. Application Logs Schema**

### **Minimum Required:**

```javascript
{
  level: "info",           // Required: info, warn, error, debug
  message: "User logged in" // Required: log message
}
```

### **Complete Available Fields:**

```javascript
{
  // Basic Log Info (Required)
  level: "info",                    // info, warn, error, debug, trace
  message: "User authentication successful",

  // Service Info (Optional)
  service: "auth-service",          // Which service/module

  // Timing (Auto-generated)
  timestamp: new Date(),

  // Metadata (Completely Free!)
  metadata: {
    // User Context
    user_id: "user123",
    username: "john_doe",
    email: "john@example.com",

    // Request Context
    request_id: "req_456",
    session_id: "sess_789",
    ip_address: "192.168.1.100",

    // Business Context
    action: "login",
    resource: "user_account",
    result: "success",

    // Technical Context
    execution_time: 1200,
    memory_usage: "45MB",
    cpu_usage: "12%",

    // Error Context (for error logs)
    error_code: "AUTH_001",
    error_details: {
      attempted_username: "john_doe",
      failed_attempts: 2,
      last_attempt: new Date()
    },

    // Custom Business Data
    purchase_amount: 150.50,
    product_ids: [1, 2, 3],
    payment_method: "credit_card",

    // Any Nested Objects
    complex_data: {
      level1: {
        level2: {
          level3: "deep nested value",
          array: [1, 2, { nested: true }]
        }
      }
    },

    // Arrays of Any Type
    tags: ["important", "billing", "notification"],
    user_permissions: ["read", "write", "admin"],

    // Geographic Data
    location: {
      country: "Pakistan",
      city: "Karachi",
      coordinates: { lat: 24.8607, lng: 67.0011 }
    },

    // Performance Metrics
    performance: {
      db_query_time: 45,
      api_call_time: 120,
      cache_hit: true,
      memory_before: "40MB",
      memory_after: "42MB"
    }
  }
}
```

## 🔧 **3. Job Processing Schema**

```javascript
{
  // Job Info
  jobName: "data-processing",
  status: "started",              // started, completed, failed

  // Timing
  startTime: new Date(),
  endTime: new Date(),

  // Metadata (Free Form!)
  metadata: {
    // Job Details
    job_type: "batch_processing",
    priority: "high",
    scheduled_by: "user123",

    // Processing Info
    total_records: 1000,
    processed_records: 850,
    failed_records: 5,
    skipped_records: 145,

    // File Information
    input_files: ["file1.csv", "file2.json"],
    output_files: ["result.json"],
    file_sizes: { input: "2.5MB", output: "1.8MB" },

    // Custom Business Logic
    business_rules_applied: ["rule1", "rule2"],
    validation_errors: [],
    transformations: ["normalize_names", "validate_emails"],

    // Any Complex Object
    processing_config: {
      batch_size: 100,
      timeout: 30000,
      retry_attempts: 3,
      filters: {
        active_only: true,
        date_range: {
          start: "2025-01-01",
          end: "2025-09-04"
        }
      }
    }
  }
}
```

---

## 🎯 **Key Points:**

### ✅ **1. Complete Flexibility**

- Aap **koi bhi field** add kar sakte hain
- **Nested objects** allowed hain
- **Arrays** of any type allowed
- **Mixed data types** allowed

### ✅ **2. No Schema Restrictions**

```javascript
// Ye sab valid hain:
{
  custom_field_1: "string",
  custom_field_2: 123,
  custom_field_3: true,
  custom_field_4: new Date(),
  custom_field_5: { nested: { deeply: { nested: "value" } } },
  custom_field_6: [1, "string", { mixed: true }, [1, 2, 3]],
  totally_random_field: "whatever you want"
}
```

### ✅ **3. Recommended Structure**

```javascript
{
  // Core fields (specific to log type)
  level: "info",
  message: "Something happened",

  // Standard context
  timestamp: new Date(),
  service: "your-service",

  // Your custom data in metadata
  metadata: {
    // Put ALL your custom fields here
    user_id: "123",
    business_context: { ... },
    technical_details: { ... },
    performance_metrics: { ... },
    anything_else: { ... }
  }
}
```

## 🚀 **Usage Examples:**

### **E-commerce Log:**

```javascript
await saveApiLog({
  method: "POST",
  path: "/api/orders",
  responseStatus: 201,
  metadata: {
    customer_id: "cust123",
    order_amount: 299.99,
    payment_method: "stripe",
    products: [
      { id: 1, name: "T-Shirt", price: 19.99, qty: 2 },
      { id: 2, name: "Jeans", price: 49.99, qty: 1 },
    ],
    shipping_address: {
      street: "123 Main St",
      city: "Karachi",
      country: "Pakistan",
    },
    discount_applied: true,
    coupon_code: "SAVE20",
  },
});
```

### **Banking Transaction Log:**

```javascript
await saveAppLog("info", "Transaction processed", {
  service: "payment-gateway",
  metadata: {
    transaction_id: "txn_789",
    account_from: "acc_123",
    account_to: "acc_456",
    amount: 5000.0,
    currency: "PKR",
    transaction_type: "transfer",
    fee_charged: 25.0,
    exchange_rate: null,
    risk_score: 0.2,
    compliance_checks: {
      aml_passed: true,
      fraud_check: "clean",
      daily_limit_check: "within_limit",
    },
  },
});
```

**Bottom line: LogStack mein aap literally KUCH BHI save kar sakte hain!** 🎉
