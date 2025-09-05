import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { Job, HourJob } from '../models/job';
import { Config } from '../types/config';
import { generateFolderPath } from './folderStructure';

const gzip = promisify(zlib.gzip);
const brotliCompress = promisify(zlib.brotliCompress);

export async function saveFile(job: Job, hourJob: HourJob, data: any, format: string, config?: Config) {
  // Generate folder path based on configuration
  const folder = generateFolderPath(job.date, config, hourJob.hour_range);
  await fs.mkdir(folder, { recursive: true });
  
  let fileName = hourJob.file_name.replace('.json', `.${format}`);
  let filePath = path.join(folder, fileName);
  
  // Generate content
  let content = '';
  if (format === 'json') content = JSON.stringify(data, null, 2);
  else if (format === 'csv') content = toCSV(data);
  else if (format === 'txt') content = toTxt(data);
  
  // Check if compression is enabled and file meets size requirements
  const shouldCompress = config?.compression?.enabled && 
                        Buffer.byteLength(content, 'utf8') >= (config.compression.fileSize || 1024);
  
  if (shouldCompress) {
    const compressionFormat = config.compression?.format || 'gzip';
    const compressionLevel = config.compression?.level || 6;
    
    let compressedData: Buffer;
    let extension: string;
    
    switch (compressionFormat) {
      case 'gzip':
        compressedData = await gzip(content, { level: compressionLevel });
        extension = '.gz';
        break;
      case 'brotli':
        compressedData = await brotliCompress(content, { 
          params: { [zlib.constants.BROTLI_PARAM_QUALITY]: compressionLevel } 
        });
        extension = '.br';
        break;
      case 'zip':
        // For zip, we'll use gzip as it's simpler for single files
        compressedData = await gzip(content, { level: compressionLevel });
        extension = '.gz';
        break;
      default:
        compressedData = await gzip(content, { level: compressionLevel });
        extension = '.gz';
    }
    
    fileName += extension;
    filePath = path.join(folder, fileName);
    await fs.writeFile(filePath, compressedData);
  } else {
    await fs.writeFile(filePath, content);
  }
  
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
