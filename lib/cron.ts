import cron from 'node-cron';
import { createDailyJobs, runHourlyJob, retryFailedJobs } from '../src/jobs';
import { Config } from '../types/config';
import { getLogger } from './logger';

export function setupCronJobs(config: Config) {
  const logger = getLogger();
  
  logger.info('Setting up cron jobs', {
    dailyCron: config.dailyCron,
    hourlyCron: config.hourlyCron,
    timezone: config.timezone
  });

  // Daily job creation at midnight
  cron.schedule(config.dailyCron || '0 0 * * *', async () => {
    logger.info('Executing daily job creation');
    try {
      await createDailyJobs();
      logger.info('Daily job creation completed successfully');
    } catch (error) {
      logger.error('Daily job creation failed', { error });
    }
  }, { 
    timezone: config.timezone || 'UTC',
    name: 'daily-job-creation'
  });

  // Hourly job execution
  cron.schedule(config.hourlyCron || '0 * * * *', async () => {
    logger.info('Executing hourly job');
    try {
      await runHourlyJob(config);
      logger.info('Hourly job completed successfully');
    } catch (error) {
      logger.error('Hourly job failed', { error });
    }
  }, { 
    timezone: config.timezone || 'UTC',
    name: 'hourly-job-execution'
  });

  // Retry failed jobs every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    logger.debug('Executing retry failed jobs');
    try {
      await retryFailedJobs(config);
      logger.debug('Retry failed jobs completed');
    } catch (error) {
      logger.error('Retry failed jobs failed', { error });
    }
  }, { 
    timezone: config.timezone || 'UTC',
    name: 'retry-failed-jobs'
  });

  logger.info('All cron jobs scheduled successfully');
}
