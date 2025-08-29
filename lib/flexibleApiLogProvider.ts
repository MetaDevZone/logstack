import mongoose from 'mongoose';
import { getConfig } from '../src/main';

export interface FlexibleApiLogProvider {
  getApiLogsByHour(date: Date, hour: number): Promise<any[]>;
  getCollectionName(): string;
  getTimestampField(): string;
  validateConnection(): Promise<boolean>;
}

export class ExistingCollectionProvider implements FlexibleApiLogProvider {
  private collectionName: string;
  private timestampField: string;
  private requiredFields: any;

  constructor(
    collectionName: string, 
    timestampField: string, 
    requiredFields?: any
  ) {
    this.collectionName = collectionName;
    this.timestampField = timestampField;
    this.requiredFields = requiredFields || {};
  }

  async getApiLogsByHour(date: Date, hour: number): Promise<any[]> {
    const startDate = new Date(date);
    startDate.setHours(hour, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(hour + 1, 0, 0, 0);

    const collection = mongoose.connection.collection(this.collectionName);
    
    // Build query with flexible timestamp field matching
    const query = {
      $or: [
        {
          [this.timestampField]: {
            $gte: startDate,
            $lt: endDate
          }
        },
        // Fallback for different timestamp formats
        {
          request_time: {
            $gte: startDate,
            $lt: endDate
          }
        },
        {
          createdAt: {
            $gte: startDate,
            $lt: endDate
          }
        },
        {
          created_at: {
            $gte: startDate,
            $lt: endDate
          }
        },
        {
          timestamp: {
            $gte: startDate,
            $lt: endDate
          }
        }
      ]
    };

    const logs = await collection.find(query).toArray();
    
    console.log(`📊 Found ${logs.length} logs for ${date.toDateString()} hour ${hour} from collection "${this.collectionName}"`);
    
    return logs;
  }

  getCollectionName(): string {
    return this.collectionName;
  }

  getTimestampField(): string {
    return this.timestampField;
  }

  async validateConnection(): Promise<boolean> {
    try {
      const collection = mongoose.connection.collection(this.collectionName);
      const count = await collection.countDocuments();
      console.log(`✅ Connected to existing collection "${this.collectionName}" with ${count} documents`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to collection "${this.collectionName}":`, error);
      return false;
    }
  }
}

export class NewCollectionProvider implements FlexibleApiLogProvider {
  private collectionName: string;
  private model: any;

  constructor(collectionName: string = 'apilogs') {
    this.collectionName = collectionName;
    
    // Import the model dynamically to avoid circular dependencies
    try {
      const { ApiLogModel } = require('../models/apiLog');
      this.model = ApiLogModel;
    } catch (error) {
      console.warn('ApiLogModel not available, using direct collection access');
    }
  }

  async getApiLogsByHour(date: Date, hour: number): Promise<any[]> {
    const startDate = new Date(date);
    startDate.setHours(hour, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(hour + 1, 0, 0, 0);

    let logs;
    
    if (this.model) {
      // Use the model if available
      logs = await this.model.find({
        $or: [
          { request_time: { $gte: startDate, $lt: endDate } },
          { createdAt: { $gte: startDate, $lt: endDate } }
        ]
      }).lean();
    } else {
      // Fallback to direct collection access
      const collection = mongoose.connection.collection(this.collectionName);
      logs = await collection.find({
        $or: [
          { request_time: { $gte: startDate, $lt: endDate } },
          { createdAt: { $gte: startDate, $lt: endDate } }
        ]
      }).toArray();
    }

    console.log(`📊 Found ${logs.length} logs for ${date.toDateString()} hour ${hour} from new collection "${this.collectionName}"`);
    
    return logs;
  }

  getCollectionName(): string {
    return this.collectionName;
  }

  getTimestampField(): string {
    return 'request_time'; // Default for new collections
  }

  async validateConnection(): Promise<boolean> {
    try {
      const collection = mongoose.connection.collection(this.collectionName);
      const count = await collection.countDocuments();
      console.log(`✅ Connected to collection "${this.collectionName}" with ${count} documents`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to collection "${this.collectionName}":`, error);
      return false;
    }
  }
}

export function createApiLogProvider(): FlexibleApiLogProvider {
  const config = getConfig();
  
  if (config.apiLogs?.existingCollection) {
    const { name, timestampField, requiredFields } = config.apiLogs.existingCollection;
    console.log(`🔌 Using existing collection: "${name}" with timestamp field: "${timestampField}"`);
    return new ExistingCollectionProvider(name, timestampField, requiredFields);
  } else if (config.apiLogs?.createNew) {
    const collectionName = config.apiLogs.createNew.collectionName || 'apilogs';
    console.log(`🆕 Using new collection: "${collectionName}"`);
    return new NewCollectionProvider(collectionName);
  } else {
    // Default to new collection
    console.log('📝 No API logs configuration found, using default new collection: "apilogs"');
    return new NewCollectionProvider();
  }
}
