/**
 * 🗑️ Log Retention Service
 * 
 * Handles automatic cleanup of database logs and cloud storage files
 * based on configured retention policies.
 */

import { MongoClient, Db } from 'mongodb';
import { Config } from '../types/config';
import { getJobModel } from '../models/job';
import { getLogModel } from '../models/log';
import { getApiLogModel } from '../models/apiLog';
import AWS from 'aws-sdk';
import cron from 'node-cron';

export class RetentionService {
  private config: Config;
  private db: Db;
  private s3?: AWS.S3;

  constructor(config: Config, db: Db) {
    this.config = config;
    this.db = db;
    
    // Initialize S3 if using S3 storage
    if (config.uploadProvider === 's3' && config.s3) {
      this.s3 = new AWS.S3({
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
        region: config.s3.region,
        endpoint: config.s3.endpoint
      });
    }
  }

  /**
   * 🧹 Start automatic retention cleanup
   */
  public startAutomaticCleanup(): void {
    const retention = this.config.retention;
    
    if (!retention) {
      console.log('⚠️  No retention configuration found, skipping automatic cleanup');
      return;
    }

    // Database cleanup cron
    if (retention.database?.autoCleanup) {
      const dbCron = retention.database.cleanupCron || '0 2 * * *'; // 2 AM daily
      console.log(`🗑️  Scheduling database cleanup: ${dbCron}`);
      
      cron.schedule(dbCron, async () => {
        console.log('🧹 Starting automatic database cleanup...');
        await this.cleanupDatabase();
      });
    }

    // Storage cleanup cron
    if (retention.storage?.autoCleanup) {
      const storageCron = retention.storage.cleanupCron || '0 3 * * *'; // 3 AM daily
      console.log(`🗑️  Scheduling storage cleanup: ${storageCron}`);
      
      cron.schedule(storageCron, async () => {
        console.log('🧹 Starting automatic storage cleanup...');
        await this.cleanupStorage();
      });
    }

    console.log('✅ Automatic retention cleanup scheduled');
  }

  /**
   * 🗃️ Clean up database collections based on retention policy
   */
  public async cleanupDatabase(): Promise<{
    apiLogs: number;
    jobs: number;
    logs: number;
  }> {
    const retention = this.config.retention?.database;
    if (!retention) {
      throw new Error('No database retention configuration found');
    }

    const results = {
      apiLogs: 0,
      jobs: 0,
      logs: 0
    };

    console.log('🗑️  Starting database cleanup...');

    try {
      // Clean API logs
      if (retention.apiLogs) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retention.apiLogs);
        
        const ApiLogModel = getApiLogModel(this.config.collections?.apiLogsCollectionName || 'apilogs');
        const result = await ApiLogModel.deleteMany({
          request_time: { $lt: cutoffDate }
        });
        
        results.apiLogs = result.deletedCount || 0;
        console.log(`🗑️  Deleted ${results.apiLogs} API logs older than ${retention.apiLogs} days`);
      }

      // Clean job records
      if (retention.jobs) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retention.jobs);
        
        const JobModel = getJobModel(this.config.collections?.jobsCollectionName || 'jobs');
        const result = await JobModel.deleteMany({
          createdAt: { $lt: cutoffDate }
        });
        
        results.jobs = result.deletedCount || 0;
        console.log(`🗑️  Deleted ${results.jobs} job records older than ${retention.jobs} days`);
      }

      // Clean processing logs
      if (retention.logs) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retention.logs);
        
        const LogModel = getLogModel(this.config.collections?.logsCollectionName || 'logs');
        const result = await LogModel.deleteMany({
          timestamp: { $lt: cutoffDate }
        });
        
        results.logs = result.deletedCount || 0;
        console.log(`🗑️  Deleted ${results.logs} processing logs older than ${retention.logs} days`);
      }

      console.log('✅ Database cleanup completed successfully');
      return results;

    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
      throw error;
    }
  }

  /**
   * ☁️ Clean up cloud storage files based on retention policy
   */
  public async cleanupStorage(): Promise<{
    deletedFiles: number;
    deletedSize: number;
  }> {
    const retention = this.config.retention?.storage;
    if (!retention?.files) {
      throw new Error('No storage retention configuration found');
    }

    console.log('🗑️  Starting storage cleanup...');

    switch (this.config.uploadProvider) {
      case 's3':
        return await this.cleanupS3Storage(retention.files);
      case 'local':
        return await this.cleanupLocalStorage(retention.files);
      default:
        console.log(`⚠️  Storage cleanup not implemented for ${this.config.uploadProvider}`);
        return { deletedFiles: 0, deletedSize: 0 };
    }
  }

  /**
   * 🌩️ Clean up S3 storage files
   */
  private async cleanupS3Storage(retentionDays: number): Promise<{
    deletedFiles: number;
    deletedSize: number;
  }> {
    if (!this.s3 || !this.config.s3) {
      throw new Error('S3 not configured');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const bucket = this.config.s3.bucket;
    const prefix = this.config.outputDirectory || 'uploads';

    let deletedFiles = 0;
    let deletedSize = 0;

    try {
      // List all objects in the bucket with prefix
      const listParams: AWS.S3.ListObjectsV2Request = {
        Bucket: bucket,
        Prefix: prefix
      };

      let continuationToken: string | undefined;
      
      do {
        if (continuationToken) {
          listParams.ContinuationToken = continuationToken;
        }

        const listResult = await this.s3.listObjectsV2(listParams).promise();
        
        if (listResult.Contents) {
          // Filter objects older than cutoff date
          const objectsToDelete = listResult.Contents.filter(obj => 
            obj.LastModified && obj.LastModified < cutoffDate
          );

          if (objectsToDelete.length > 0) {
            // Delete objects in batches of 1000 (S3 limit)
            const batchSize = 1000;
            for (let i = 0; i < objectsToDelete.length; i += batchSize) {
              const batch = objectsToDelete.slice(i, i + batchSize);
              
              const deleteParams: AWS.S3.DeleteObjectsRequest = {
                Bucket: bucket,
                Delete: {
                  Objects: batch.map(obj => ({ Key: obj.Key! }))
                }
              };

              const deleteResult = await this.s3.deleteObjects(deleteParams).promise();
              
              if (deleteResult.Deleted) {
                deletedFiles += deleteResult.Deleted.length;
                
                // Calculate deleted size
                batch.forEach(obj => {
                  if (obj.Size) deletedSize += obj.Size;
                });
              }
            }
          }
        }

        continuationToken = listResult.NextContinuationToken;
      } while (continuationToken);

      console.log(`🗑️  S3 cleanup: Deleted ${deletedFiles} files (${this.formatBytes(deletedSize)}) older than ${retentionDays} days`);
      
      return { deletedFiles, deletedSize };

    } catch (error) {
      console.error('❌ S3 cleanup failed:', error);
      throw error;
    }
  }

  /**
   * 📁 Clean up local storage files
   */
  private async cleanupLocalStorage(retentionDays: number): Promise<{
    deletedFiles: number;
    deletedSize: number;
  }> {
    const fs = require('fs').promises;
    const path = require('path');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const uploadsDir = this.config.outputDirectory || 'uploads';
    
    let deletedFiles = 0;
    let deletedSize = 0;

    try {
      const cleanupDirectory = async (dirPath: string): Promise<void> => {
        try {
          const items = await fs.readdir(dirPath);
          
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = await fs.stat(itemPath);
            
            if (stats.isDirectory()) {
              await cleanupDirectory(itemPath);
              
              // Check if directory is empty and remove it
              const remainingItems = await fs.readdir(itemPath);
              if (remainingItems.length === 0) {
                await fs.rmdir(itemPath);
                console.log(`🗑️  Removed empty directory: ${itemPath}`);
              }
            } else if (stats.isFile() && stats.mtime < cutoffDate) {
              deletedSize += stats.size;
              await fs.unlink(itemPath);
              deletedFiles++;
            }
          }
        } catch (error) {
          // Directory might not exist or be accessible
          console.log(`⚠️  Could not access directory: ${dirPath}`);
        }
      };

      await cleanupDirectory(uploadsDir);
      
      console.log(`🗑️  Local cleanup: Deleted ${deletedFiles} files (${this.formatBytes(deletedSize)}) older than ${retentionDays} days`);
      
      return { deletedFiles, deletedSize };

    } catch (error) {
      console.error('❌ Local storage cleanup failed:', error);
      throw error;
    }
  }

  /**
   * 🏗️ Setup S3 lifecycle policies for automatic archival and deletion
   */
  public async setupS3LifecyclePolicies(): Promise<void> {
    if (!this.s3 || !this.config.s3) {
      throw new Error('S3 not configured');
    }

    const lifecycle = this.config.retention?.storage?.s3Lifecycle;
    if (!lifecycle) {
      console.log('⚠️  No S3 lifecycle configuration found');
      return;
    }

    const bucket = this.config.s3.bucket;
    const prefix = this.config.outputDirectory || 'uploads';

    const lifecycleRules: AWS.S3.LifecycleRule[] = [];

    // Create lifecycle rule
    const rule: AWS.S3.LifecycleRule = {
      ID: 'cron-log-service-retention',
      Status: 'Enabled',
      Filter: {
        Prefix: prefix
      },
      Transitions: [],
      Expiration: undefined
    };

    // Add transitions
    if (lifecycle.transitionToIA) {
      rule.Transitions!.push({
        Days: lifecycle.transitionToIA,
        StorageClass: 'STANDARD_IA'
      });
    }

    if (lifecycle.transitionToGlacier) {
      rule.Transitions!.push({
        Days: lifecycle.transitionToGlacier,
        StorageClass: 'GLACIER'
      });
    }

    if (lifecycle.transitionToDeepArchive) {
      rule.Transitions!.push({
        Days: lifecycle.transitionToDeepArchive,
        StorageClass: 'DEEP_ARCHIVE'
      });
    }

    // Add expiration
    if (lifecycle.expiration) {
      rule.Expiration = {
        Days: lifecycle.expiration
      };
    }

    lifecycleRules.push(rule);

    try {
      const params: AWS.S3.PutBucketLifecycleConfigurationRequest = {
        Bucket: bucket,
        LifecycleConfiguration: {
          Rules: lifecycleRules
        }
      };

      await this.s3.putBucketLifecycleConfiguration(params).promise();
      
      console.log('✅ S3 lifecycle policies configured successfully');
      console.log(`📁 Prefix: ${prefix}`);
      if (lifecycle.transitionToIA) console.log(`🔄 Transition to IA: ${lifecycle.transitionToIA} days`);
      if (lifecycle.transitionToGlacier) console.log(`🧊 Transition to Glacier: ${lifecycle.transitionToGlacier} days`);
      if (lifecycle.transitionToDeepArchive) console.log(`🗄️  Transition to Deep Archive: ${lifecycle.transitionToDeepArchive} days`);
      if (lifecycle.expiration) console.log(`🗑️  Expiration: ${lifecycle.expiration} days`);

    } catch (error) {
      console.error('❌ Failed to setup S3 lifecycle policies:', error);
      throw error;
    }
  }

  /**
   * 📊 Get retention statistics
   */
  public async getRetentionStats(): Promise<{
    database: {
      apiLogs: { total: number; oldRecords: number };
      jobs: { total: number; oldRecords: number };
      logs: { total: number; oldRecords: number };
    };
    storage: {
      totalFiles: number;
      totalSize: number;
      oldFiles: number;
      oldSize: number;
    };
  }> {
    const retention = this.config.retention;
    if (!retention) {
      throw new Error('No retention configuration found');
    }

    const stats = {
      database: {
        apiLogs: { total: 0, oldRecords: 0 },
        jobs: { total: 0, oldRecords: 0 },
        logs: { total: 0, oldRecords: 0 }
      },
      storage: {
        totalFiles: 0,
        totalSize: 0,
        oldFiles: 0,
        oldSize: 0
      }
    };

    // Database stats
    if (retention.database) {
      if (retention.database.apiLogs) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retention.database.apiLogs);
        
        const ApiLogModel = getApiLogModel(this.config.collections?.apiLogsCollectionName || 'apilogs');
        stats.database.apiLogs.total = await ApiLogModel.countDocuments();
        stats.database.apiLogs.oldRecords = await ApiLogModel.countDocuments({
          request_time: { $lt: cutoffDate }
        });
      }

      if (retention.database.jobs) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retention.database.jobs);
        
        const JobModel = getJobModel(this.config.collections?.jobsCollectionName || 'jobs');
        stats.database.jobs.total = await JobModel.countDocuments();
        stats.database.jobs.oldRecords = await JobModel.countDocuments({
          createdAt: { $lt: cutoffDate }
        });
      }

      if (retention.database.logs) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retention.database.logs);
        
        const LogModel = getLogModel(this.config.collections?.logsCollectionName || 'logs');
        stats.database.logs.total = await LogModel.countDocuments();
        stats.database.logs.oldRecords = await LogModel.countDocuments({
          timestamp: { $lt: cutoffDate }
        });
      }
    }

    // Storage stats (S3 only for now)
    if (retention.storage?.files && this.config.uploadProvider === 's3' && this.s3) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retention.storage.files);

      const bucket = this.config.s3!.bucket;
      const prefix = this.config.outputDirectory || 'uploads';

      const listParams: AWS.S3.ListObjectsV2Request = {
        Bucket: bucket,
        Prefix: prefix
      };

      let continuationToken: string | undefined;
      
      do {
        if (continuationToken) {
          listParams.ContinuationToken = continuationToken;
        }

        const listResult = await this.s3.listObjectsV2(listParams).promise();
        
        if (listResult.Contents) {
          for (const obj of listResult.Contents) {
            stats.storage.totalFiles++;
            stats.storage.totalSize += obj.Size || 0;
            
            if (obj.LastModified && obj.LastModified < cutoffDate) {
              stats.storage.oldFiles++;
              stats.storage.oldSize += obj.Size || 0;
            }
          }
        }

        continuationToken = listResult.NextContinuationToken;
      } while (continuationToken);
    }

    return stats;
  }

  /**
   * 🔧 Manual cleanup trigger
   */
  public async runManualCleanup(options: {
    database?: boolean;
    storage?: boolean;
    dryRun?: boolean;
  } = {}): Promise<{
    database?: { apiLogs: number; jobs: number; logs: number };
    storage?: { deletedFiles: number; deletedSize: number };
  }> {
    const results: any = {};

    if (options.dryRun) {
      console.log('🔍 DRY RUN MODE - No actual deletions will be performed');
      const stats = await this.getRetentionStats();
      console.log('📊 Retention Statistics:');
      console.log('Database:', stats.database);
      console.log('Storage:', stats.storage);
      return results;
    }

    if (options.database !== false) {
      results.database = await this.cleanupDatabase();
    }

    if (options.storage !== false) {
      results.storage = await this.cleanupStorage();
    }

    return results;
  }

  /**
   * 🔧 Helper: Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * 🚀 Initialize retention service
 */
export async function initRetention(config: Config, db: Db): Promise<RetentionService> {
  const service = new RetentionService(config, db);
  
  // Setup S3 lifecycle policies if configured
  if (config.uploadProvider === 's3' && config.retention?.storage?.s3Lifecycle) {
    try {
      await service.setupS3LifecyclePolicies();
    } catch (error) {
      console.warn('⚠️  Could not setup S3 lifecycle policies:', (error as Error).message);
    }
  }
  
  // Start automatic cleanup if enabled
  service.startAutomaticCleanup();
  
  return service;
}

export default RetentionService;
