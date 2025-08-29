import { Job, HourJob } from '../models/job';
import { getDataForHour } from './userDataProvider';
import { saveFile } from './fileWriters';
import { uploadFile } from './uploadProviders';
import { Config } from '../types/config';
import { getLogger } from './logger';

export async function processAndUploadFile(job: Job, hourJob: HourJob, config: Config) {
  const logger = getLogger();
  
  logger.info(`Processing file for ${job.date} ${hourJob.hour_range}`);

  try {
    // Get data for the hour
    const data = await getDataForHour(job.date, hourJob.hour_range);
    logger.debug(`Retrieved ${Array.isArray(data) ? data.length : 'unknown'} records for ${hourJob.hour_range}`);

    // Save file locally first
    const filePath = await saveFile(job, hourJob, data, config.fileFormat || 'json', config);
    logger.debug(`File saved locally: ${filePath}`);

    // Upload to configured provider
    const uploadedPath = await uploadFile(filePath, config.uploadProvider, job, hourJob, config);
    logger.info(`File uploaded successfully: ${uploadedPath}`);

    // Update hour job with the uploaded path
    hourJob.file_path = uploadedPath;

    return uploadedPath;
  } catch (error) {
    logger.error(`Error processing file for ${job.date} ${hourJob.hour_range}`, { error });
    throw error;
  }
}
