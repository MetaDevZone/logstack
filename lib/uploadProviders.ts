import path from 'path';
import fs from 'fs/promises';
import AWS from 'aws-sdk';
import { Storage } from '@google-cloud/storage';
import { BlobServiceClient } from '@azure/storage-blob';
import { Job, HourJob } from '../models/job';
import { Config } from '../types/config';
import { getLogger } from './logger';

export async function uploadFile(
  filePath: string, 
  provider: string, 
  job: Job, 
  hourJob: HourJob, 
  config: Config
): Promise<string> {
  const logger = getLogger();
  const fileName = path.basename(filePath);
  const remotePath = path.join(job.date, hourJob.file_name).replace(/\\/g, '/');

  logger.info(`Uploading file to ${provider}`, { filePath, remotePath });

  try {
    switch (provider) {
      case 'local':
        return await uploadToLocal(filePath);

      case 's3':
        return await uploadToS3(filePath, remotePath, config);

      case 'gcs':
        return await uploadToGCS(filePath, remotePath, config);

      case 'azure':
        return await uploadToAzure(filePath, remotePath, config);

      default:
        throw new Error(`Unknown upload provider: ${provider}`);
    }
  } catch (error) {
    logger.error(`Failed to upload file to ${provider}`, { error, filePath, remotePath });
    throw error;
  }
}

async function uploadToLocal(filePath: string): Promise<string> {
  // For local storage, just return the file path
  return filePath;
}

async function uploadToS3(filePath: string, remotePath: string, config: Config): Promise<string> {
  if (!config.s3) throw new Error('S3 configuration is missing');

  const s3Config: AWS.S3.ClientConfiguration = {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
    region: config.s3.region,
  };

  if (config.s3.endpoint) {
    s3Config.endpoint = config.s3.endpoint;
  }

  const s3 = new AWS.S3(s3Config);
  const fileContent = await fs.readFile(filePath);

  const result = await s3.upload({
    Bucket: config.s3.bucket,
    Key: remotePath,
    Body: fileContent,
    ContentType: getContentType(filePath),
  }).promise();

  return result.Location || `s3://${config.s3.bucket}/${remotePath}`;
}

async function uploadToGCS(filePath: string, remotePath: string, config: Config): Promise<string> {
  if (!config.gcs) throw new Error('GCS configuration is missing');

  const storageOptions: any = {
    projectId: config.gcs.projectId,
  };

  if (config.gcs.keyFilename) {
    storageOptions.keyFilename = config.gcs.keyFilename;
  } else if (config.gcs.credentials) {
    storageOptions.credentials = config.gcs.credentials;
  }

  const storage = new Storage(storageOptions);
  const bucket = storage.bucket(config.gcs.bucket);
  const file = bucket.file(remotePath);

  await file.save(await fs.readFile(filePath), {
    metadata: {
      contentType: getContentType(filePath),
    },
  });

  return `gs://${config.gcs.bucket}/${remotePath}`;
}

async function uploadToAzure(filePath: string, remotePath: string, config: Config): Promise<string> {
  if (!config.azure) throw new Error('Azure configuration is missing');

  const blobServiceClient = BlobServiceClient.fromConnectionString(config.azure.connectionString);
  const containerClient = blobServiceClient.getContainerClient(config.azure.containerName);
  
  // Ensure container exists
  await containerClient.createIfNotExists();
  
  const blockBlobClient = containerClient.getBlockBlobClient(remotePath);
  const fileContent = await fs.readFile(filePath);

  await blockBlobClient.upload(fileContent, fileContent.length, {
    blobHTTPHeaders: {
      blobContentType: getContentType(filePath),
    },
  });

  return blockBlobClient.url;
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: { [key: string]: string } = {
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.log': 'text/plain',
  };
  return contentTypes[ext] || 'application/octet-stream';
}
