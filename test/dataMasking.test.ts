/**
 * 🧪 Data Masking Test Suite
 * 
 * This test verifies that the data masking functionality works correctly
 * with different configurations and data types.
 */

import { maskSensitiveData, createMaskingConfig, validateMaskingConfig } from '../lib/dataMasking';

// Test data with various sensitive information
const testData = {
  // Personal information
  email: 'john.doe@example.com',
  phone: '+1-555-123-4567',
  ssn: '123-45-6789',
  
  // Authentication
  password: 'mySecretPassword123',
  api_key: 'ak_1234567890abcdefghijklmnopqr',
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  
  // Financial
  credit_card: '4532-1234-5678-9012',
  cvv: '123',
  
  // Network
  ip_address: '192.168.1.100',
  connection_string: 'mongodb://user:password@host:27017/db',
  
  // Non-sensitive
  username: 'johndoe',
  timestamp: '2024-01-15T10:30:00Z',
  status: 'active',
  count: 42
};

// Nested object test
const nestedTestData = {
  user: {
    id: 'user_123',
    profile: {
      email: 'nested@example.com',
      password: 'nestedSecret123'
    },
    settings: {
      api_key: 'ak_nested123456789012345',
      preferences: {
        notifications: true
      }
    }
  },
  request: {
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9...',
      'x-api-key': 'ak_header123456789012345'
    },
    body: {
      email: 'body@example.com',
      credit_card: '5555-4444-3333-2222'
    }
  }
};

// Array test data
const arrayTestData = [
  { email: 'user1@example.com', password: 'pass1' },
  { email: 'user2@example.com', password: 'pass2' },
  { email: 'user3@example.com', password: 'pass3' }
];

async function testBasicMasking() {
  console.log('🧪 Testing Basic Data Masking\n');
  
  const config = {
    enabled: true,
    maskingChar: '*',
    showLastChars: 0
  };
  
  console.log('📝 Original data:');
  console.log(JSON.stringify(testData, null, 2));
  
  const masked = maskSensitiveData(testData, config);
  
  console.log('\n🔒 Masked data:');
  console.log(JSON.stringify(masked, null, 2));
  
  // Verify masking worked
  const tests = [
    { field: 'email', original: testData.email, masked: masked.email },
    { field: 'password', original: testData.password, masked: masked.password },
    { field: 'credit_card', original: testData.credit_card, masked: masked.credit_card },
    { field: 'api_key', original: testData.api_key, masked: masked.api_key }
  ];
  
  console.log('\n✅ Verification:');
  tests.forEach(test => {
    const isMasked = test.masked === '[MASKED]' || test.masked.includes('[MASKED]');
    console.log(`${test.field}: ${isMasked ? '✅ MASKED' : '❌ NOT MASKED'} (${test.original} → ${test.masked})`);
  });
  
  return tests.every(test => test.masked === '[MASKED]' || test.masked.includes('[MASKED]'));
}

async function testPartialMasking() {
  console.log('\n🧪 Testing Partial Masking (Show Last 4 Chars)\n');
  
  const config = {
    enabled: true,
    showLastChars: 4
  };
  
  const masked = maskSensitiveData(testData, config);
  
  console.log('🔒 Partially masked data:');
  console.log(JSON.stringify(masked, null, 2));
  
  // Verify partial masking
  const tests = [
    { field: 'email', expected: testData.email.slice(-4) },
    { field: 'password', expected: testData.password.slice(-4) },
    { field: 'credit_card', expected: testData.credit_card.slice(-4) }
  ];
  
  console.log('\n✅ Verification (last 4 chars):');
  tests.forEach(test => {
    const hasLastChars = masked[test.field].endsWith(test.expected);
    console.log(`${test.field}: ${hasLastChars ? '✅ CORRECT' : '❌ INCORRECT'} (ends with '${test.expected}')`);
  });
  
  return tests.every(test => masked[test.field].endsWith(test.expected));
}

async function testLengthPreservation() {
  console.log('\n🧪 Testing Length Preservation\n');
  
  const config = {
    enabled: true,
    preserveLength: true,
    maskingChar: '#'
  };
  
  const masked = maskSensitiveData(testData, config);
  
  console.log('🔒 Length-preserved masked data:');
  console.log(JSON.stringify(masked, null, 2));
  
  // Verify length preservation
  const tests = [
    { field: 'password', originalLength: testData.password.length },
    { field: 'api_key', originalLength: testData.api_key.length }
  ];
  
  console.log('\n✅ Verification (length preservation):');
  tests.forEach(test => {
    const lengthMatch = masked[test.field].length === test.originalLength;
    const allHashChars = masked[test.field] === '#'.repeat(test.originalLength);
    console.log(`${test.field}: ${lengthMatch && allHashChars ? '✅ CORRECT' : '❌ INCORRECT'} (${test.originalLength} chars)`);
  });
  
  return tests.every(test => 
    masked[test.field].length === test.originalLength && 
    masked[test.field] === '#'.repeat(test.originalLength)
  );
}

async function testNestedObjects() {
  console.log('\n🧪 Testing Nested Object Masking\n');
  
  const config = {
    enabled: true,
    showLastChars: 2
  };
  
  console.log('📝 Original nested data:');
  console.log(JSON.stringify(nestedTestData, null, 2));
  
  const masked = maskSensitiveData(nestedTestData, config);
  
  console.log('\n🔒 Masked nested data:');
  console.log(JSON.stringify(masked, null, 2));
  
  // Verify nested masking
  const nestedTests = [
    { path: 'user.profile.email', value: masked.user.profile.email },
    { path: 'user.profile.password', value: masked.user.profile.password },
    { path: 'user.settings.api_key', value: masked.user.settings.api_key },
    { path: 'request.headers.authorization', value: masked.request.headers.authorization },
    { path: 'request.body.email', value: masked.request.body.email }
  ];
  
  console.log('\n✅ Verification (nested objects):');
  nestedTests.forEach(test => {
    const isMasked = test.value.includes('[MASKED]');
    console.log(`${test.path}: ${isMasked ? '✅ MASKED' : '❌ NOT MASKED'}`);
  });
  
  return nestedTests.every(test => test.value.includes('[MASKED]'));
}

async function testArrayMasking() {
  console.log('\n🧪 Testing Array Masking\n');
  
  const config = {
    enabled: true,
    showLastChars: 3
  };
  
  console.log('📝 Original array data:');
  console.log(JSON.stringify(arrayTestData, null, 2));
  
  const masked = maskSensitiveData(arrayTestData, config);
  
  console.log('\n🔒 Masked array data:');
  console.log(JSON.stringify(masked, null, 2));
  
  // Verify array masking
  const allMasked = masked.every((item: any) => 
    item.email.includes('[MASKED]') && item.password.includes('[MASKED]')
  );
  
  console.log(`\n✅ Array masking: ${allMasked ? '✅ ALL ITEMS MASKED' : '❌ SOME ITEMS NOT MASKED'}`);
  
  return allMasked;
}

async function testCustomPatterns() {
  console.log('\n🧪 Testing Custom Patterns\n');
  
  const customData = {
    session_token: 'sess_1234567890abcdef1234567890abcdef',
    transaction_id: 'TXN123456789012',
    employee_id: 'EMP123456',
    normal_text: 'This should not be masked'
  };
  
  const config = {
    enabled: true,
    customPatterns: {
      'session_token': /sess_[a-f0-9]{32}/g,
      'transaction_id': /TXN[0-9]{12}/g,
      'employee_id': /EMP[0-9]{6}/g
    }
  };
  
  console.log('📝 Original custom data:');
  console.log(JSON.stringify(customData, null, 2));
  
  const masked = maskSensitiveData(customData, config);
  
  console.log('\n🔒 Masked custom data:');
  console.log(JSON.stringify(masked, null, 2));
  
  // Verify custom pattern masking
  const customTests = [
    { field: 'session_token', shouldBeMasked: true },
    { field: 'transaction_id', shouldBeMasked: true },
    { field: 'employee_id', shouldBeMasked: true },
    { field: 'normal_text', shouldBeMasked: false }
  ];
  
  console.log('\n✅ Verification (custom patterns):');
  customTests.forEach(test => {
    const isMasked = masked[test.field] === '[MASKED]';
    const isCorrect = test.shouldBeMasked ? isMasked : !isMasked;
    console.log(`${test.field}: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'} (${test.shouldBeMasked ? 'should be' : 'should not be'} masked)`);
  });
  
  return customTests.every(test => {
    const isMasked = masked[test.field] === '[MASKED]';
    return test.shouldBeMasked ? isMasked : !isMasked;
  });
}

async function testEnvironmentConfigs() {
  console.log('\n🧪 Testing Environment-Specific Configurations\n');
  
  const environments = ['development', 'staging', 'production'] as const;
  
  environments.forEach(env => {
    const config = createMaskingConfig(env);
    console.log(`\n🌍 ${env.toUpperCase()} configuration:`);
    console.log(`- Enabled: ${config.enabled}`);
    console.log(`- Show last chars: ${config.showLastChars}`);
    console.log(`- Mask emails: ${config.maskEmails}`);
    console.log(`- Mask IPs: ${config.maskIPs}`);
  });
  
  // Test each environment
  const testResults = environments.map(env => {
    const config = createMaskingConfig(env);
    const masked = maskSensitiveData(testData, config);
    
    return {
      environment: env,
      emailMasked: masked.email !== testData.email,
      passwordMasked: masked.password !== testData.password
    };
  });
  
  console.log('\n✅ Environment test results:');
  testResults.forEach(result => {
    console.log(`${result.environment}: Email masked: ${result.emailMasked}, Password masked: ${result.passwordMasked}`);
  });
  
  return testResults.every(result => result.passwordMasked); // Password should always be masked
}

async function testConfigValidation() {
  console.log('\n🧪 Testing Configuration Validation\n');
  
  const validConfig = {
    enabled: true,
    maskingChar: '*',
    showLastChars: 4,
    customPatterns: {
      'test': /test/g
    }
  };
  
  const invalidConfigs = [
    { 
      description: 'Negative showLastChars',
      config: { showLastChars: -1 }
    },
    {
      description: 'Multi-character maskingChar',
      config: { maskingChar: '**' }
    },
    {
      description: 'Invalid custom pattern',
      config: { customPatterns: { 'test': 'not-a-regex' as any } }
    }
  ];
  
  // Test valid config
  const validResult = validateMaskingConfig(validConfig);
  console.log(`Valid config: ${validResult.isValid ? '✅ VALID' : '❌ INVALID'}`);
  
  // Test invalid configs
  console.log('\n❌ Invalid configurations:');
  invalidConfigs.forEach(test => {
    const result = validateMaskingConfig(test.config);
    console.log(`${test.description}: ${result.isValid ? '❌ SHOULD BE INVALID' : '✅ CORRECTLY INVALID'}`);
    if (!result.isValid) {
      console.log(`  Errors: ${result.errors.join(', ')}`);
    }
  });
  
  return validResult.isValid && invalidConfigs.every(test => !validateMaskingConfig(test.config).isValid);
}

async function runAllTests() {
  console.log('🚀 STARTING DATA MASKING TEST SUITE\n');
  console.log('═'.repeat(50));
  
  const tests = [
    { name: 'Basic Masking', test: testBasicMasking },
    { name: 'Partial Masking', test: testPartialMasking },
    { name: 'Length Preservation', test: testLengthPreservation },
    { name: 'Nested Objects', test: testNestedObjects },
    { name: 'Array Masking', test: testArrayMasking },
    { name: 'Custom Patterns', test: testCustomPatterns },
    { name: 'Environment Configs', test: testEnvironmentConfigs },
    { name: 'Config Validation', test: testConfigValidation }
  ];
  
  const results: Array<{ name: string; passed: boolean; error: string | null }> = [];
  
  for (const testCase of tests) {
    try {
      const passed = await testCase.test();
      results.push({ name: testCase.name, passed, error: null });
    } catch (error) {
      results.push({ name: testCase.name, passed: false, error: String(error) });
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═'.repeat(50));
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${result.name.padEnd(20)}: ${status}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log('═'.repeat(50));
  console.log(`🎯 OVERALL RESULT: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 ALL TESTS PASSED! Data masking is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the results above.');
  }
  
  return passedCount === totalCount;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };
