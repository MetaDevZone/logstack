import { getLogModel } from '../models/log';
import { getJobModel } from '../models/job';
import { getConfig } from './main';

export async function logJobAction(jobId: string, action: string, errorMsg?: string) {
  const config = getConfig();
  const logsCollectionName = config.collections?.logsCollectionName || 'logs';
  const LogModel = getLogModel(logsCollectionName);
  
  await LogModel.create({
    job_id: jobId,
    timestamp: new Date(),
    action,
    error_message: errorMsg || '',
  });
}

export async function getLogs(date?: string, hour?: string) {
  const config = getConfig();
  const jobsCollectionName = config.collections?.jobsCollectionName || 'jobs';
  const logsCollectionName = config.collections?.logsCollectionName || 'logs';
  const JobModel = getJobModel(jobsCollectionName);
  const LogModel = getLogModel(logsCollectionName);
  
  const query: any = {};
  if (date) query.date = date;
  
  const jobs = await JobModel.find(query);
  const logs = await LogModel.find({ job_id: { $in: jobs.map(j => j._id) } });
  return logs;
}

export async function getJobStatus(date?: string, hour?: string) {
  const config = getConfig();
  const jobsCollectionName = config.collections?.jobsCollectionName || 'jobs';
  const JobModel = getJobModel(jobsCollectionName);
  
  const query: any = {};
  if (date) query.date = date;
  
  const jobs = await JobModel.find(query);
  
  if (hour) {
    // Return specific hour status
    return jobs.map(j => {
      const hourJob = j.hours.find(h => h.hour_range === hour);
      return hourJob ? {
        date: j.date,
        hour_range: hourJob.hour_range,
        status: hourJob.status,
        retries: hourJob.retries,
        file_path: hourJob.file_path,
      } : null;
    }).filter(Boolean);
  }
  
  // Return all hours for the date(s)
  return jobs.flatMap(j => 
    j.hours.map(h => ({
      date: j.date,
      hour_range: h.hour_range,
      status: h.status,
      retries: h.retries,
      file_path: h.file_path,
    }))
  );
}
