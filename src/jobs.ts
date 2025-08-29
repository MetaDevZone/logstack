import { getJobModel } from '../models/job';
import { processAndUploadFile } from '../lib/fileProcessor';
import { getPreviousHourRange, getDateString } from '../lib/time';
import { Config } from '../types/config';
import { logJobAction } from './logs';
import { getLogger } from '../lib/logger';
import { getConfig } from './main';

export async function createDailyJobs(dateStr?: string, config?: Config) {
  const logger = getLogger();
  const date = dateStr || getDateString();
  const currentConfig = config || getConfig();
  
  // Get custom collection name or use default
  const jobsCollectionName = currentConfig.collections?.jobsCollectionName || 'jobs';
  const JobModel = getJobModel(jobsCollectionName);
  
  logger.info(`Creating daily jobs for date: ${date}`);

  // Check if job for this date already exists
  const existingJob = await JobModel.findOne({ date });
  if (existingJob) {
    logger.info(`Job for date ${date} already exists`);
    return existingJob;
  }
  
  const hours = [];
  for (let h = 0; h < 24; h++) {
    const hourStart = h.toString().padStart(2, '0');
    const hourEnd = (h + 1).toString().padStart(2, '0');
    const hourRange = `${hourStart}-${hourEnd}`;
    hours.push({
      hour_range: hourRange,
      file_name: `${hourRange}.json`,
      file_path: '',
      status: 'pending',
      retries: 0,
      logs: [],
    });
  }
  
  const job = new JobModel({
    date,
    status: 'pending',
    hours,
  });
  
  await job.save();
  logger.info(`Created daily job with 24 hour slots for ${date}`);
  return job;
}

export async function runHourlyJob(config: Config) {
  const logger = getLogger();
  const { date, hourRange } = getPreviousHourRange();
  
  // Get custom collection name or use default
  const jobsCollectionName = config.collections?.jobsCollectionName || 'jobs';
  const JobModel = getJobModel(jobsCollectionName);
  
  logger.info(`Running hourly job for ${date} ${hourRange}`);

  const job = await JobModel.findOne({ date });
  if (!job) {
    logger.warn(`No job found for date ${date}`);
    return;
  }
  
  const hourJob = job.hours.find(h => h.hour_range === hourRange);
  if (!hourJob) {
    logger.warn(`No hour job found for ${hourRange} on ${date}`);
    return;
  }
  
  if (hourJob.status === 'success') {
    logger.info(`Hour job ${hourRange} already completed successfully`);
    return;
  }

  // Check retry limit
  if (config.retryAttempts && hourJob.retries >= config.retryAttempts) {
    logger.error(`Hour job ${hourRange} exceeded retry limit (${config.retryAttempts})`);
    return;
  }
  
  try {
    await processAndUploadFile(job, hourJob, config);
    hourJob.status = 'success';
    
    // Update overall job status if all hours are complete
    const allComplete = job.hours.every(h => h.status === 'success');
    if (allComplete) {
      job.status = 'success';
      logger.info(`All hourly jobs completed for ${date}`);
    }
    
    await job.save();
    await logJobAction(job._id.toString(), 'success', `File processed and uploaded for ${hourRange}`);
    
    logger.info(`Successfully completed hour job ${hourRange} for ${date}`);
  } catch (err: any) {
    hourJob.status = 'failed';
    hourJob.retries += 1;
    hourJob.logs.push({ timestamp: new Date(), error: err.message });
    job.status = 'failed';
    await job.save();
    await logJobAction(job._id.toString(), 'failed', err.message);
    
    logger.error(`Failed hour job ${hourRange} for ${date}`, { 
      error: err.message, 
      retries: hourJob.retries 
    });
  }
}

export async function processSpecificHour(dateStr: string, hour: number, config: Config) {
  const logger = getLogger();
  const hourRange = `${hour.toString().padStart(2, '0')}-${(hour + 1).toString().padStart(2, '0')}`;
  
  // Get custom collection name or use default
  const jobsCollectionName = config.collections?.jobsCollectionName || 'jobs';
  const JobModel = getJobModel(jobsCollectionName);
  
  logger.info(`Processing specific hour: ${dateStr} ${hourRange}`);

  const job = await JobModel.findOne({ date: dateStr });
  if (!job) {
    logger.warn(`No job found for date ${dateStr}`);
    return;
  }
  
  const hourJob = job.hours.find(h => h.hour_range === hourRange);
  if (!hourJob) {
    logger.warn(`No hour job found for ${hourRange} on ${dateStr}`);
    return;
  }
  
  if (hourJob.status === 'success') {
    logger.info(`Hour job ${hourRange} already completed successfully`);
    return;
  }

  // Check retry limit
  if (config.retryAttempts && hourJob.retries >= config.retryAttempts) {
    logger.error(`Hour job ${hourRange} exceeded retry limit (${config.retryAttempts})`);
    return;
  }
  
  try {
    await processAndUploadFile(job, hourJob, config);
    hourJob.status = 'success';
    
    // Update overall job status if all hours are complete
    const allComplete = job.hours.every(h => h.status === 'success');
    if (allComplete) {
      job.status = 'success';
      logger.info(`All hourly jobs completed for ${dateStr}`);
    }
    
    await job.save();
    await logJobAction(job._id.toString(), 'success', `File processed and uploaded for ${hourRange}`);
    
    logger.info(`Successfully completed hour job ${hourRange} for ${dateStr}`);
    return hourJob;
  } catch (err: any) {
    hourJob.status = 'failed';
    hourJob.retries += 1;
    hourJob.logs.push({ timestamp: new Date(), error: err.message });
    job.status = 'failed';
    await job.save();
    await logJobAction(job._id.toString(), 'failed', err.message);
    
    logger.error(`Failed hour job ${hourRange} for ${dateStr}`, { 
      error: err.message, 
      retries: hourJob.retries 
    });
    throw err;
  }
}

export async function retryFailedJobs(config: Config) {
  const logger = getLogger();
  
  // Get custom collection name or use default
  const jobsCollectionName = config.collections?.jobsCollectionName || 'jobs';
  const JobModel = getJobModel(jobsCollectionName);
  
  logger.info('Checking for failed jobs to retry');

  const failedJobs = await JobModel.find({
    'hours.status': 'failed',
    'hours.retries': { $lt: config.retryAttempts || 3 }
  });

  for (const job of failedJobs) {
    for (const hourJob of job.hours) {
      if (hourJob.status === 'failed' && hourJob.retries < (config.retryAttempts || 3)) {
        logger.info(`Retrying failed job ${job.date} ${hourJob.hour_range}`);
        
        try {
          await processAndUploadFile(job, hourJob, config);
          hourJob.status = 'success';
          
          const allComplete = job.hours.every(h => h.status === 'success');
          if (allComplete) {
            job.status = 'success';
          }
          
          await job.save();
          await logJobAction(job._id.toString(), 'retry_success', `Retry successful for ${hourJob.hour_range}`);
          
          logger.info(`Successfully retried job ${job.date} ${hourJob.hour_range}`);
        } catch (err: any) {
          hourJob.retries += 1;
          hourJob.logs.push({ timestamp: new Date(), error: err.message });
          await job.save();
          await logJobAction(job._id.toString(), 'retry_failed', err.message);
          
          logger.error(`Retry failed for job ${job.date} ${hourJob.hour_range}`, { 
            error: err.message, 
            retries: hourJob.retries 
          });
        }
      }
    }
  }
}
