import fs from 'fs/promises';
import path from 'path';
import { Job, HourJob } from '../models/job';
import { Config } from '../types/config';

export async function saveFile(job: Job, hourJob: HourJob, data: any, format: string, config?: Config) {
  const outputDir = config?.outputDirectory || 'uploads';
  const folder = path.join(process.cwd(), outputDir, job.date);
  await fs.mkdir(folder, { recursive: true });
  const filePath = path.join(folder, hourJob.file_name.replace('.json', `.${format}`));
  let content = '';
  if (format === 'json') content = JSON.stringify(data, null, 2);
  else if (format === 'csv') content = toCSV(data);
  else if (format === 'txt') content = toTxt(data);
  await fs.writeFile(filePath, content);
  return filePath;
}

function toCSV(data: any): string {
  if (!Array.isArray(data)) return '';
  const keys = Object.keys(data[0] || {});
  const rows = [keys.join(',')];
  for (const row of data) rows.push(keys.map(k => row[k]).join(','));
  return rows.join('\n');
}

function toTxt(data: any): string {
  if (Array.isArray(data)) return data.map(String).join('\n');
  return String(data);
}
