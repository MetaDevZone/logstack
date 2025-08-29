import { createDailyJobs, runHourlyJob, getLogs, getJobStatus } from '../src/main';
import mongoose from 'mongoose';
import { JobModel } from '../models/job';

describe('Cron Log Service', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cronlog_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await JobModel.deleteMany({});
  });

  it('should create 1 job document with 24 hour objects for a day', async () => {
    await createDailyJobs('2025-08-25');
    const jobs = await JobModel.find({ date: '2025-08-25' });
    expect(jobs.length).toBe(1); // One job document per day
    expect(jobs[0].hours.length).toBe(24); // 24 hour objects within the job
  });

  it('should fetch job status', async () => {
    await createDailyJobs('2025-08-25');
    const status = await getJobStatus('2025-08-25', '09-10');
    expect(Array.isArray(status)).toBe(true);
  });

  it('should fetch logs', async () => {
    const logs = await getLogs('2025-08-25', '09-10');
    expect(Array.isArray(logs)).toBe(true);
  });
});
