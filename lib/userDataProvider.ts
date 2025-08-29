import { getApiLogsByHour } from '../src/apiLogs';
import { createApiLogProvider } from './flexibleApiLogProvider';
import mongoose from 'mongoose';

// User should implement this to fetch data for a given date/hour
export async function getDataForHour(date: string, hourRange: string): Promise<any> {
  console.log(`🔍 Fetching data for ${date} ${hourRange}`);
  
  try {
    // Method 1: Use flexible API log provider (supports both existing and new collections)
    const provider = createApiLogProvider();
    
    const [startHour] = hourRange.split('-').map(h => parseInt(h));
    const parsedDate = new Date(date);
    
    const logs = await provider.getApiLogsByHour(parsedDate, startHour);
    if (logs.length > 0) {
      console.log(`📊 Found ${logs.length} logs for ${hourRange} from collection "${provider.getCollectionName()}"`);
      return logs;
    }

    // Method 2: Fallback to traditional API logs (for backward compatibility)
    const apiLogs = await getApiLogsByHour(date, hourRange);
    if (apiLogs.length > 0) {
      console.log(`📊 Found ${apiLogs.length} API logs for ${hourRange} (fallback method)`);
      return apiLogs;
    }

    // Method 2: Query custom collection (replace with your actual collection name)
    const db = mongoose.connection.db;
    if (db) {
      // Example collection names - replace with your actual collection
      const possibleCollections = ['logs', 'app_logs', 'system_logs', 'audit_logs'];
      
      for (const collectionName of possibleCollections) {
        try {
          const collection = db.collection(collectionName);
          
          // Check if collection exists and has documents
          const count = await collection.countDocuments();
          if (count === 0) continue;
          
          const [startHour] = hourRange.split('-').map(h => parseInt(h));
          const startDate = new Date(`${date}T${startHour.toString().padStart(2, '0')}:00:00.000Z`);
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          
          // Try common timestamp field names
          const timestampFields = ['timestamp', 'createdAt', 'created_at', 'date', 'time'];
          
          for (const field of timestampFields) {
            const logs = await collection.find({
              [field]: {
                $gte: startDate,
                $lt: endDate
              }
            }).limit(1000).toArray(); // Limit for performance
            
            if (logs.length > 0) {
              console.log(`📋 Found ${logs.length} logs from '${collectionName}' collection using field '${field}'`);
              return logs;
            }
          }
        } catch (err) {
          // Continue to next collection if this one fails
          continue;
        }
      }
    }

    // Method 3: Fallback - return sample data for testing
    console.log(`⚠️  No logs found, generating sample data for ${hourRange}`);
    return generateSampleData(date, hourRange);
    
  } catch (error) {
    console.error(`❌ Error fetching data for ${date} ${hourRange}:`, error);
    return generateSampleData(date, hourRange);
  }
}

function generateSampleData(date: string, hourRange: string) {
  const [startHour] = hourRange.split('-').map(h => parseInt(h));
  const sampleData = [];
  
  // Generate 3-10 sample log entries for this hour
  const numLogs = Math.floor(Math.random() * 8) + 3;
  
  for (let i = 0; i < numLogs; i++) {
    const timestamp = new Date(`${date}T${startHour.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00.000Z`);
    
    sampleData.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      message: `Sample log entry ${i + 1} for hour ${hourRange}`,
      level: ['info', 'warn', 'error', 'debug'][Math.floor(Math.random() * 4)],
      source: 'sample-data-generator',
      data: {
        userId: Math.floor(Math.random() * 1000),
        action: ['login', 'logout', 'view_page', 'api_call'][Math.floor(Math.random() * 4)],
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      }
    });
  }
  
  console.log(`🔄 Generated ${sampleData.length} sample log entries for ${hourRange}`);
  return sampleData;
}
