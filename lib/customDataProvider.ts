import { getApiLogsByHour, saveApiLog } from '../src/apiLogs';
import mongoose from 'mongoose';

// Custom data provider that fetches from your existing logs collection
export async function getDataForHour(date: string, hourRange: string): Promise<any> {
  console.log(`🔍 Fetching data for ${date} ${hourRange}`);
  
  try {
    // Example 1: Using API logs (if you have them)
    const apiLogs = await getApiLogsByHour(date, hourRange);
    if (apiLogs.length > 0) {
      console.log(`📊 Found ${apiLogs.length} API logs for ${hourRange}`);
      return apiLogs;
    }

    // Example 2: Custom collection query (replace with your actual collection)
    const db = mongoose.connection.db;
    
    // Replace 'your_logs_collection' with your actual collection name
    const collection = db.collection('your_logs_collection');
    
    const [startHour] = hourRange.split('-').map(h => parseInt(h));
    const startDate = new Date(`${date}T${startHour.toString().padStart(2, '0')}:00:00.000Z`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
    
    // Query your existing logs
    // Adjust the field names according to your schema
    const logs = await collection.find({
      // Replace 'timestamp' with your actual timestamp field
      timestamp: {
        $gte: startDate,
        $lt: endDate
      }
      // Add any other filters you need
    }).toArray();
    
    console.log(`📋 Found ${logs.length} logs from custom collection for ${hourRange}`);
    return logs;
    
  } catch (error) {
    console.error(`❌ Error fetching data for ${date} ${hourRange}:`, error);
    
    // Fallback: return sample data for testing
    return [
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        message: `Sample log entry for ${hourRange}`,
        level: 'info',
        source: 'test-data'
      }
    ];
  }
}
