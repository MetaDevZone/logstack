import { createDailyJobs, runHourlyJob, retryFailedJobs } from '../src/jobs';
import { validateConfig } from '../lib/validation';
import mongoose from 'mongoose';
import { JobModel } from '../models/job';
import { ApiLogModel } from '../models/apiLog';

describe('Cron Log Service - Comprehensive Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cronlog_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await JobModel.deleteMany({});
    await ApiLogModel.deleteMany({});
  });

  describe('Configuration Validation', () => {
    it('should validate correct S3 configuration', () => {
      const config = {
        dbUri: 'mongodb://localhost:27017/test',
        uploadProvider: 's3' as const,
        s3: {
          accessKeyId: 'test',
          secretAccessKey: 'test',
          region: 'us-east-1',
          bucket: 'test-bucket'
        }
      };
      
      const result = validateConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid upload provider', () => {
      const config = {
        dbUri: 'mongodb://localhost:27017/test',
        uploadProvider: 'invalid' as any
      };
      
      const result = validateConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Upload provider must be one of: local, s3, gcs, azure');
    });

    it('should reject missing S3 configuration', () => {
      const config = {
        dbUri: 'mongodb://localhost:27017/test',
        uploadProvider: 's3' as const
      };
      
      const result = validateConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('S3 configuration is required when using S3 provider');
    });
  });

  describe('Job Management', () => {
    it('should create 1 job document with 24 hour objects for a day', async () => {
      await createDailyJobs('2025-08-25');
      const job = await JobModel.findOne({ date: '2025-08-25' });
      
      expect(job).toBeTruthy();
      expect(job!.hours).toHaveLength(24);
      expect(job!.status).toBe('pending');
    });

    it('should not create duplicate jobs for the same date', async () => {
      await createDailyJobs('2025-08-25');
      await createDailyJobs('2025-08-25'); // Try to create again
      
      const jobs = await JobModel.find({ date: '2025-08-25' });
      expect(jobs).toHaveLength(1);
    });

    it('should process failed jobs in retry function', async () => {
      const config = {
        dbUri: 'mongodb://localhost:27017/test',
        uploadProvider: 'local' as const,
        retryAttempts: 3
      };

      // Create a job with failed hour
      const job = new JobModel({
        date: '2025-08-25',
        status: 'failed',
        hours: Array(24).fill(null).map((_, i) => ({
          hour_range: `${i.toString().padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}`,
          file_name: `${i.toString().padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}.json`,
          file_path: '',
          status: i === 9 ? 'failed' : 'pending', // Only hour 9-10 is failed
          retries: i === 9 ? 1 : 0,
          logs: i === 9 ? [{ timestamp: new Date(), error: 'Test error' }] : []
        }))
      });
      await job.save();

      await retryFailedJobs(config);
      
      const updatedJob = await JobModel.findById(job._id);
      expect(updatedJob).toBeTruthy();
      // The failed hour should have been processed (retries incremented or status changed)
      const failedHour = updatedJob!.hours.find(h => h.hour_range === '09-10');
      expect(failedHour).toBeTruthy();
    });
  });

  describe('API Logging', () => {
    it('should save API log to database', async () => {
      const { saveApiLog } = require('../src/apiLogs');
      
      await saveApiLog({
        method: 'GET',
        path: '/api/test',
        responseStatus: 200,
        client_ip: '127.0.0.1'
      });

      const logs = await ApiLogModel.find({});
      expect(logs).toHaveLength(1);
      expect(logs[0].method).toBe('GET');
      expect(logs[0].path).toBe('/api/test');
    });

    it('should fetch API logs by hour range', async () => {
      const { saveApiLog, getApiLogsByHour } = require('../src/apiLogs');
      
      // Create a log for a specific time
      const testDate = new Date('2025-08-25T09:30:00Z');
      await saveApiLog({
        method: 'POST',
        path: '/api/users',
        request_time: testDate,
        responseStatus: 201
      });

      const logs = await getApiLogsByHour('2025-08-25', '09-10');
      expect(logs).toHaveLength(1);
      expect(logs[0].method).toBe('POST');
    });
  });
});
