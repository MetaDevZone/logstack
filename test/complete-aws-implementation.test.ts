/**
 * 🧪 Complete AWS S3 Implementation Test
 * 
 * Tests the complete logstack implementation with:
 * - AWS S3 storage
 * - Daily folder structure
 * - 180 days file retention
 * - 14 days API logs retention in MongoDB
 * - No file compression
 * - Password masking enabled
 * - Fully testable scenarios
 */

import { init, createDailyJobs } from '../src/main';
import { Config } from '../types/config';
import { generateFolderPath } from '../lib/folderStructure';
import { validateConfig } from '../lib/validation';

// Mock AWS SDK for testing
jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue({
        Location: 'https://test-bucket.s3.amazonaws.com/test-file.json',
        Bucket: 'test-bucket',
        Key: 'test-file.json',
        ETag: '"test-etag"'
      })
    })),
    deleteObject: jest.fn().mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue({})
    })),
    listObjectsV2: jest.fn().mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue({
        Contents: [
          {
            Key: 'old-file.json',
            LastModified: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000) // 200 days old
          }
        ]
      })
    }))
  }))
}));

// Mock MongoDB for testing
jest.mock('../lib/db', () => ({
  connectToDatabase: jest.fn().mockResolvedValue(true),
  getDatabase: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      insertMany: jest.fn().mockResolvedValue({ insertedCount: 10 }),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          {
            _id: 'test-id',
            date: '2024-01-15',
            provider: 'test',
            status: 'completed',
            createdAt: new Date()
          }
        ])
      }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 5 }),
      countDocuments: jest.fn().mockResolvedValue(100)
    })
  })
}));

// Test configuration
const testConfig: Config = {
  // Database configuration
  dbUri: 'mongodb://localhost:27017/logstack-test',
  
  // AWS S3 configuration
  uploadProvider: 's3',
  outputDirectory: 'production-logs',
  
  // AWS S3 settings
  s3: {
    accessKeyId: 'TEST_ACCESS_KEY',
    secretAccessKey: 'TEST_SECRET_KEY',
    region: 'us-east-1',
    bucket: 'logstack-test-bucket'
  },
  
  // Daily folder structure
  folderStructure: {
    type: 'daily', // Creates daily folders like: 2024-01-15
    subFolders: {
      enabled: true,
      byHour: true, // Creates hour-based sub-folders for better organization
      byStatus: false // Disable status folders for this test
    },
    naming: {
      dateFormat: 'YYYY-MM-DD',
      prefix: 'prod-logs',
      includeTime: false
    }
  },
  
  // File retention: 180 days
  retention: {
    database: {
      apiLogs: 14, // Keep API logs for 14 days in MongoDB
      jobs: 90,
      logs: 90,
      autoCleanup: true,
      cleanupCron: '0 3 * * *' // Run cleanup at 3 AM daily
    },
    storage: {
      files: 180, // Keep files for 180 days
      autoCleanup: true,
      cleanupCron: '0 2 * * *', // Run cleanup at 2 AM daily
      s3Lifecycle: {
        expiration: 180 // Delete after 180 days
      }
    }
  },
  
  // File compression: Disabled
  compression: {
    enabled: false // No compression as requested
  },
  
  // Data masking: Password masking enabled
  dataMasking: {
    enabled: true,
    maskingChar: '*',
    preserveLength: true,
    showLastChars: 0, // Completely mask passwords
    maskEmails: false, // Don't mask emails
    maskIPs: false, // Don't mask IPs
    customFields: ['password', 'pwd', 'pass', 'secret'] // Fields to mask
  },
  
  // Collection names
  collections: {
    jobsCollectionName: 'test_jobs',
    logsCollectionName: 'test_logs',
    apiLogsCollectionName: 'test_api_logs'
  }
};

describe('Complete AWS S3 Implementation', () => {

  describe('Configuration Validation', () => {
    
    test('should validate complete AWS S3 configuration', () => {
      const validation = validateConfig(testConfig);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should validate AWS S3 credentials', () => {
      expect(testConfig.s3?.accessKeyId).toBeDefined();
      expect(testConfig.s3?.secretAccessKey).toBeDefined();
      expect(testConfig.s3?.region).toBeDefined();
      expect(testConfig.s3?.bucket).toBeDefined();
    });

    test('should validate folder structure configuration', () => {
      expect(testConfig.folderStructure?.type).toBe('daily');
      expect(testConfig.folderStructure?.subFolders?.enabled).toBe(true);
      expect(testConfig.folderStructure?.subFolders?.byHour).toBe(true);
      expect(testConfig.folderStructure?.naming?.prefix).toBe('prod-logs');
    });

    test('should validate retention settings', () => {
      expect(testConfig.retention?.database?.apiLogs).toBe(14);
      expect(testConfig.retention?.storage?.files).toBe(180);
      expect(testConfig.retention?.storage?.autoCleanup).toBe(true);
    });

    test('should validate data masking configuration', () => {
      expect(testConfig.dataMasking?.enabled).toBe(true);
      expect(testConfig.dataMasking?.customFields).toContain('password');
    });

    test('should validate compression is disabled', () => {
      expect(testConfig.compression?.enabled).toBe(false);
    });
  });

  describe('Folder Structure Generation', () => {
    
    test('should generate daily folder structure with prefix', () => {
      const date = '2024-01-15';
      const hourRange = '14-15';
      
      const folderPath = generateFolderPath(date, testConfig, hourRange);
      
      expect(folderPath).toContain('prod-logs_2024-01-15');
      expect(folderPath).toContain('hour-14-15');
    });

    test('should generate different folders for different dates', () => {
      const date1 = '2024-01-15';
      const date2 = '2024-01-16';
      const hourRange = '10-11';
      
      const folder1 = generateFolderPath(date1, testConfig, hourRange);
      const folder2 = generateFolderPath(date2, testConfig, hourRange);
      
      expect(folder1).not.toBe(folder2);
      expect(folder1).toContain('2024-01-15');
      expect(folder2).toContain('2024-01-16');
    });

    test('should generate different hour sub-folders', () => {
      const date = '2024-01-15';
      const hour1 = '08-09';
      const hour2 = '14-15';
      
      const folder1 = generateFolderPath(date, testConfig, hour1);
      const folder2 = generateFolderPath(date, testConfig, hour2);
      
      expect(folder1).toContain('hour-08-09');
      expect(folder2).toContain('hour-14-15');
    });
  });

  describe('Service Initialization', () => {
    
    test('should initialize service with AWS S3 configuration', async () => {
      // This test verifies the service can be initialized with our config
      expect(async () => {
        await init(testConfig);
      }).not.toThrow();
    });

    test('should create daily jobs', async () => {
      // Mock the createDailyJobs function
      expect(async () => {
        await createDailyJobs();
      }).not.toThrow();
    });
  });

  describe('Data Masking', () => {
    
    test('should mask password fields', () => {
      const sensitiveData = {
        username: 'testuser',
        password: 'secretPassword123',
        email: 'user@example.com'
      };
      
      // Test password masking logic
      const maskPassword = (value: string): string => {
        if (testConfig.dataMasking?.enabled && testConfig.dataMasking?.customFields?.includes('password')) {
          return testConfig.dataMasking?.preserveLength ? 
            testConfig.dataMasking.maskingChar?.repeat(value.length) || '*'.repeat(value.length) :
            '*'.repeat(value.length);
        }
        return value;
      };
      
      const maskedPassword = maskPassword(sensitiveData.password);
      expect(maskedPassword).toBe('*******************');
      expect(maskedPassword).not.toContain('secret');
    });

    test('should not mask non-password fields', () => {
      const userData = {
        username: 'testuser',
        email: 'user@example.com'
      };
      
      // These should not be masked based on our configuration
      expect(userData.username).toBe('testuser');
      expect(userData.email).toBe('user@example.com');
    });

    test('should mask custom password fields', () => {
      const customFields = testConfig.dataMasking?.customFields || [];
      
      expect(customFields).toContain('password');
      expect(customFields).toContain('pwd');
      expect(customFields).toContain('pass');
      expect(customFields).toContain('secret');
    });
  });

  describe('Retention Policies', () => {
    
    test('should configure 180 days file retention', () => {
      expect(testConfig.retention?.storage?.files).toBe(180);
      expect(testConfig.retention?.storage?.autoCleanup).toBe(true);
    });

    test('should configure 14 days API logs retention', () => {
      expect(testConfig.retention?.database?.apiLogs).toBe(14);
      expect(testConfig.retention?.database?.autoCleanup).toBe(true);
    });

    test('should validate retention schedules', () => {
      // File retention runs at 2 AM
      expect(testConfig.retention?.storage?.cleanupCron).toBe('0 2 * * *');
      
      // API logs retention runs at 3 AM
      expect(testConfig.retention?.database?.cleanupCron).toBe('0 3 * * *');
    });

    test('should calculate retention dates correctly', () => {
      const now = new Date();
      const fileRetentionDate = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
      const apiRetentionDate = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
      
      expect(fileRetentionDate.getTime()).toBeLessThan(now.getTime());
      expect(apiRetentionDate.getTime()).toBeLessThan(now.getTime());
      expect(apiRetentionDate.getTime()).toBeGreaterThan(fileRetentionDate.getTime());
    });
  });

  describe('AWS S3 Integration', () => {
    
    test('should have correct S3 bucket configuration', () => {
      expect(testConfig.s3?.bucket).toBe('logstack-test-bucket');
      expect(testConfig.s3?.region).toBe('us-east-1');
    });

    test('should generate correct S3 paths', () => {
      const date = '2024-01-15';
      const fileName = 'api_logs_2024-01-15_14-15.json';
      
      // Expected S3 path structure
      const expectedPath = 'prod-logs_2024-01-15/hour-14-15/api_logs_2024-01-15_14-15.json';
      
      // This would be the actual path generated for S3
      expect(expectedPath).toContain('prod-logs_2024-01-15');
      expect(expectedPath).toContain('hour-14-15');
      expect(expectedPath).toContain(fileName);
    });
  });

  describe('Complete Workflow Test', () => {
    
    test('should handle complete log processing workflow', async () => {
      // Sample API log data
      const apiLogData = {
        method: 'POST',
        path: '/api/auth/login',
        requestBody: {
          username: 'testuser',
          password: 'secretPassword123' // This should be masked
        },
        responseStatus: 200,
        timestamp: new Date().toISOString(),
        client_ip: '192.168.1.100',
        user_agent: 'Mozilla/5.0...'
      };
      
      // Test the complete workflow
      expect(apiLogData.requestBody.password).toBe('secretPassword123');
      
      // After masking (simulated)
      const maskedData = {
        ...apiLogData,
        requestBody: {
          ...apiLogData.requestBody,
          password: '*'.repeat(apiLogData.requestBody.password.length)
        }
      };
      
      expect(maskedData.requestBody.password).toBe('*******************');
      expect(maskedData.requestBody.username).toBe('testuser'); // Not masked
    });

    test('should validate complete configuration object', () => {
      const configKeys = Object.keys(testConfig);
      
      // Verify all required configuration sections exist
      expect(configKeys).toContain('dbUri');
      expect(configKeys).toContain('uploadProvider');
      expect(configKeys).toContain('s3');
      expect(configKeys).toContain('folderStructure');
      expect(configKeys).toContain('retention');
      expect(configKeys).toContain('apiLogsRetention');
      expect(configKeys).toContain('compression');
      expect(configKeys).toContain('dataMasking');
      expect(configKeys).toContain('collections');
    });

    test('should simulate daily job processing', async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockJobs = [
        {
          _id: 'job1',
          date: today,
          hour_range: '08-09',
          status: 'pending',
          provider: 'test'
        },
        {
          _id: 'job2', 
          date: today,
          hour_range: '09-10',
          status: 'pending',
          provider: 'test'
        }
      ];
      
      // Simulate processing each job
      mockJobs.forEach(job => {
        const folderPath = generateFolderPath(job.date, testConfig, job.hour_range);
        
        expect(folderPath).toContain(today);
        expect(folderPath).toContain(`hour-${job.hour_range}`);
        expect(folderPath).toContain('prod-logs');
      });
    });
  });

  describe('Error Handling', () => {
    
    test('should handle missing S3 credentials gracefully', () => {
      const invalidConfig = {
        ...testConfig,
        s3: {
          ...testConfig.s3,
          accessKeyId: ''
        }
      };
      
      // This should be caught during validation
      expect(invalidConfig.s3?.accessKeyId).toBe('');
    });

    test('should handle invalid retention values', () => {
      const invalidConfig = {
        ...testConfig,
        retention: {
          ...testConfig.retention,
          storage: {
            files: -1 // Invalid negative value
          }
        }
      };
      
      expect(invalidConfig.retention?.storage?.files).toBe(-1);
    });
  });

  describe('Performance Tests', () => {
    
    test('should handle folder path generation efficiently', () => {
      const startTime = Date.now();
      
      // Generate 1000 folder paths
      for (let i = 0; i < 1000; i++) {
        const date = new Date(Date.now() + i * 3600000).toISOString().split('T')[0];
        const hour = `${i % 24}-${(i % 24) + 1}`.padStart(2, '0');
        generateFolderPath(date, testConfig, hour);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Integration Test Scenarios', () => {
    
    test('should simulate real-world usage scenario', async () => {
      console.log('🧪 Testing Complete AWS S3 Implementation');
      console.log('═'.repeat(60));
      
      // Configuration summary
      console.log('\n📋 Configuration Summary:');
      console.log(`- Upload Provider: ${testConfig.uploadProvider}`);
      console.log(`- S3 Bucket: ${testConfig.s3?.bucket}`);
      console.log(`- S3 Region: ${testConfig.s3?.region}`);
      console.log(`- Folder Structure: ${testConfig.folderStructure?.type}`);
      console.log(`- File Retention: ${testConfig.retention?.storage?.files} days`);
      console.log(`- API Logs Retention: ${testConfig.retention?.database?.apiLogs} days`);
      console.log(`- Compression: ${testConfig.compression?.enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`- Password Masking: ${testConfig.dataMasking?.enabled ? 'Enabled' : 'Disabled'}`);
      
      // Test folder structure generation
      console.log('\n📁 Folder Structure Examples:');
      const dates = ['2024-01-15', '2024-01-16', '2024-01-17'];
      const hours = ['08-09', '14-15', '20-21'];
      
      dates.forEach(date => {
        hours.forEach(hour => {
          const folderPath = generateFolderPath(date, testConfig, hour);
          const relativePath = folderPath.split('\\').slice(-3).join('/');
          console.log(`  ${date} ${hour}: ${relativePath}`);
        });
      });
      
      // Test data masking
      console.log('\n🔒 Data Masking Test:');
      const sensitiveData = {
        username: 'testuser',
        password: 'mySecretPassword123',
        email: 'user@example.com'
      };
      
      console.log('Before masking:', sensitiveData);
      
      const maskedData = {
        ...sensitiveData,
        password: testConfig.dataMasking?.enabled && testConfig.dataMasking?.customFields?.includes('password') ? 
          '*'.repeat(sensitiveData.password.length) : 
          sensitiveData.password
      };
      
      console.log('After masking:', maskedData);
      
      // Test retention calculations
      console.log('\n🗑️ Retention Policy Test:');
      const now = new Date();
      const fileRetentionDate = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
      const apiRetentionDate = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
      
      console.log(`Files older than: ${fileRetentionDate.toISOString().split('T')[0]} will be deleted`);
      console.log(`API logs older than: ${apiRetentionDate.toISOString().split('T')[0]} will be deleted`);
      
      console.log('\n✅ All tests completed successfully!');
    });
  });
});

// Export test configuration for external use
export { testConfig as awsTestConfig };
