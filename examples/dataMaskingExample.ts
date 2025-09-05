/**
 * 🔒 Sensitive Data Masking Example
 * 
 * This example demonstrates how to configure sensitive data masking for the logstack package.
 * Data masking helps protect PII and sensitive information in logs and stored files.
 */

import { init, createDailyJobs, saveApiLog } from '../src/main';
import { Config } from '../types/config';
import { maskSensitiveData, createMaskingConfig } from '../lib/dataMasking';

// ==========================================
// 🎯 DATA MASKING CONFIGURATION OPTIONS
// ==========================================

// Basic masking setup
const basicMaskingConfig: Config = {
  dbUri: 'mongodb://localhost:27017/logstack',
  uploadProvider: 'local',
  fileFormat: 'json',
  
  // Enable basic data masking
  dataMasking: {
    enabled: true,
    maskingChar: '*',
    preserveLength: false,
    showLastChars: 0,
    maskEmails: true,
    maskIPs: false,
    maskConnectionStrings: true
  }
};

// Production masking with strict privacy
const productionMaskingConfig: Config = {
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/logstack-prod',
  uploadProvider: 's3',
  fileFormat: 'json',
  
  // Strict production masking
  dataMasking: {
    enabled: true,
    maskingChar: '*',
    preserveLength: false,
    showLastChars: 0, // No characters visible in production
    maskEmails: true,
    maskIPs: true, // Mask IP addresses in production
    maskConnectionStrings: true,
    
    // Custom fields to mask
    customFields: ['user_id', 'session_id', 'transaction_id'],
    
    // Fields to exempt from masking (for debugging)
    exemptFields: ['timestamp', 'method', 'status_code'],
    
    // Custom patterns
    customPatterns: {
      'session_token': /sess_[a-zA-Z0-9]{32}/g,
      'api_token': /ak_[a-zA-Z0-9]{24}/g
    }
  },
  
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'logstack-masked-logs'
  }
};

// Development setup with minimal masking for debugging
const developmentMaskingConfig: Config = {
  dbUri: 'mongodb://localhost:27017/logstack-dev',
  uploadProvider: 'local',
  fileFormat: 'json',
  outputDirectory: 'dev-logs',
  
  // Minimal masking in development
  dataMasking: {
    enabled: true,
    maskingChar: '*',
    preserveLength: true,
    showLastChars: 4, // Show last 4 characters for debugging
    maskEmails: false, // Don't mask emails in dev
    maskIPs: false,
    maskConnectionStrings: false, // Don't mask for easier debugging
    
    // Only mask critical sensitive data in development
    customFields: ['password', 'credit_card', 'ssn'],
    exemptFields: ['email', 'ip_address', 'user_agent']
  }
};

// Environment-specific configurations
const environmentConfigs = {
  development: {
    ...basicMaskingConfig,
    dataMasking: createMaskingConfig('development')
  },
  staging: {
    ...basicMaskingConfig,
    dataMasking: createMaskingConfig('staging')
  },
  production: {
    ...productionMaskingConfig,
    dataMasking: createMaskingConfig('production')
  }
};

// ==========================================
// 🧪 TESTING DATA MASKING
// ==========================================

// Sample sensitive data for testing
const sensitiveTestData = {
  user_id: 'user_12345',
  email: 'john.doe@example.com',
  password: 'mySecretPassword123',
  credit_card: '4532-1234-5678-9012',
  phone: '+1-555-123-4567',
  ssn: '123-45-6789',
  api_key: 'ak_1234567890abcdefghijklmn',
  jwt_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  ip_address: '192.168.1.100',
  request_body: JSON.stringify({
    username: 'johndoe',
    password: 'secret123',
    email: 'john@example.com'
  }),
  connection_string: 'mongodb://admin:password123@localhost:27017/myapp'
};

// API log data with sensitive information
const sensitiveApiLogData = {
  request_time: new Date(),
  response_time: new Date(),
  method: 'POST',
  path: '/api/auth/login',
  requestBody: {
    email: 'user@example.com',
    password: 'myPassword123',
    remember_me: true
  },
  requestHeaders: {
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'x-api-key': 'ak_1234567890abcdefghij'
  },
  responseStatus: 200,
  responseBody: {
    success: true,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0...',
    user: {
      id: 12345,
      email: 'user@example.com',
      phone: '555-123-4567',
      credit_card_last4: '9012'
    }
  },
  client_ip: '203.0.113.42',
  client_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
};

// ==========================================
// 🚀 USAGE EXAMPLES
// ==========================================

async function basicMaskingExample() {
  console.log('🔒 Basic Data Masking Example\n');
  
  try {
    await init(basicMaskingConfig);
    console.log('✅ Service initialized with basic data masking');
    
    // Test data masking
    console.log('📝 Original data:');
    console.log(JSON.stringify(sensitiveTestData, null, 2));
    
    const maskedData = maskSensitiveData(sensitiveTestData, basicMaskingConfig.dataMasking);
    console.log('\n🔒 Masked data:');
    console.log(JSON.stringify(maskedData, null, 2));
    
    // Save API log with automatic masking
    console.log('\n💾 Saving API log (automatically masked)...');
    await saveApiLog(sensitiveApiLogData, basicMaskingConfig);
    console.log('✅ API log saved with sensitive data masked');
    
  } catch (error) {
    console.error('❌ Failed to run basic masking example:', error);
  }
}

async function productionMaskingExample() {
  console.log('🏭 Production Data Masking Example\n');
  
  try {
    await init(productionMaskingConfig);
    console.log('✅ Service initialized with production-grade data masking');
    console.log('🔒 All sensitive data will be fully masked');
    console.log('📝 IP addresses and custom fields will be masked');
    
    // Create jobs to test masking in data processing
    await createDailyJobs();
    console.log('🔄 Daily jobs created - data masking will be applied during processing');
    
  } catch (error) {
    console.error('❌ Failed to run production masking example:', error);
  }
}

async function environmentMaskingExample() {
  console.log('🌍 Environment-Specific Masking Example\n');
  
  const environment = (process.env.NODE_ENV || 'development') as keyof typeof environmentConfigs;
  const config = environmentConfigs[environment];
  
  console.log(`🎯 Running in ${environment} mode`);
  
  try {
    await init(config);
    console.log(`✅ Service initialized with ${environment} masking configuration`);
    
    // Test masking behavior for current environment
    const maskedData = maskSensitiveData(sensitiveTestData, config.dataMasking);
    
    console.log('\n📊 Masking behavior:');
    console.log(`- Enabled: ${config.dataMasking?.enabled}`);
    console.log(`- Show last chars: ${config.dataMasking?.showLastChars}`);
    console.log(`- Mask emails: ${config.dataMasking?.maskEmails}`);
    console.log(`- Mask IPs: ${config.dataMasking?.maskIPs}`);
    
    console.log('\n🔒 Sample masked output:');
    console.log(`Email: ${maskedData.email}`);
    console.log(`Credit Card: ${maskedData.credit_card}`);
    console.log(`IP Address: ${maskedData.ip_address}`);
    
  } catch (error) {
    console.error(`❌ Failed to run ${environment} masking example:`, error);
  }
}

function demonstrateMaskingFormats() {
  console.log('🎭 Data Masking Format Comparison\n');
  
  const testValue = 'sensitiveData123';
  
  const formats = [
    { name: 'Full Masking', config: { enabled: true, showLastChars: 0 } },
    { name: 'Show Last 4', config: { enabled: true, showLastChars: 4 } },
    { name: 'Preserve Length', config: { enabled: true, preserveLength: true, maskingChar: '*' } },
    { name: 'Custom Character', config: { enabled: true, preserveLength: true, maskingChar: '#' } },
    { name: 'Disabled', config: { enabled: false } }
  ];
  
  console.log('📝 Original value:', testValue);
  console.log('═══════════════════════════════════════');
  
  formats.forEach(format => {
    const masked = maskSensitiveData({ test: testValue }, format.config);
    console.log(`${format.name.padEnd(15)}: ${masked.test}`);
  });
  
  console.log('═══════════════════════════════════════\n');
}

// ==========================================
// 🎯 BEST PRACTICES DEMONSTRATION
// ==========================================

function dataMaskingBestPractices() {
  console.log(`
🔒 DATA MASKING BEST PRACTICES

🎯 When to enable masking:
- ✅ Production environments (always)
- ✅ Logs that contain user data
- ✅ API requests/responses
- ✅ Database export files
- ✅ Compliance requirements (GDPR, HIPAA, etc.)

⚡ Masking level recommendations:
- 🟢 Development: Light masking (passwords only)
- 🟡 Staging: Moderate masking (PII + credentials)
- 🔴 Production: Full masking (all sensitive data)

🛡️ What to mask:
- Passwords and authentication tokens
- Credit card numbers and financial data
- Email addresses and phone numbers
- Social Security Numbers (SSN)
- API keys and access tokens
- IP addresses (in some jurisdictions)
- Personal identifiable information (PII)

🔍 Debugging considerations:
- Use showLastChars in non-production environments
- Exempt non-sensitive fields (timestamps, status codes)
- Preserve data structure for analysis
- Log masking statistics for monitoring

💡 Performance tips:
- Masking adds minimal overhead (~1-2ms per object)
- Use custom patterns for application-specific data
- Consider masking at collection time vs. processing time
- Cache masking configurations for better performance
  `);
}

// ==========================================
// 🏃‍♂️ RUN EXAMPLES
// ==========================================

async function runExamples() {
  console.log('🚀 Starting Data Masking Examples\n');
  
  // Show best practices
  dataMaskingBestPractices();
  
  // Demonstrate different masking formats
  demonstrateMaskingFormats();
  
  // Run examples based on command line argument
  const example = process.argv[2] || 'basic';
  
  switch (example) {
    case 'basic':
      await basicMaskingExample();
      break;
    case 'production':
      await productionMaskingExample();
      break;
    case 'environment':
      await environmentMaskingExample();
      break;
    case 'demo':
      demonstrateMaskingFormats();
      break;
    default:
      console.log('Available examples: basic, production, environment, demo');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export {
  basicMaskingConfig,
  productionMaskingConfig,
  developmentMaskingConfig,
  environmentConfigs,
  sensitiveTestData,
  sensitiveApiLogData
};
