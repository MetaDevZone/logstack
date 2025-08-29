import mongoose from 'mongoose';

// Define schema for your existing apilogs collection
const ExistingApiLogSchema = new mongoose.Schema({
  // Add fields that match your existing apilogs collection structure
  // Adjust these fields based on your actual collection structure
  timestamp: Date,
  request_time: Date,
  response_time: Date,
  method: String,
  path: String,
  requestBody: mongoose.Schema.Types.Mixed,
  requestHeaders: mongoose.Schema.Types.Mixed,
  responseStatus: Number,
  requestQuery: mongoose.Schema.Types.Mixed,
  requestParams: mongoose.Schema.Types.Mixed,
  client_ip: String,
  client_agent: String,
  responseBody: mongoose.Schema.Types.Mixed,
  // Add any other fields your collection has
}, { 
  collection: 'apilogs' // This tells Mongoose to use the 'apilogs' collection
});

export const ExistingApiLogModel = mongoose.model('ExistingApiLog', ExistingApiLogSchema);

// Custom data provider for your existing apilogs collection
export async function getDataForHour(date: string, hourRange: string): Promise<any> {
  try {
    console.log(`🔍 Fetching data from apilogs collection for ${date} ${hourRange}`);
    
    // Parse hour range (e.g., "09-10" -> start: 9, end: 10)
    const [startHour, endHour] = hourRange.split('-').map(h => parseInt(h));
    
    // Create date range for the hour
    const startDate = new Date(`${date}T${startHour.toString().padStart(2, '0')}:00:00.000Z`);
    const endDate = new Date(`${date}T${endHour.toString().padStart(2, '0')}:00:00.000Z`);
    
    console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Query your existing apilogs collection
    // Adjust the timestamp field name based on your collection structure
    const logs = await ExistingApiLogModel.find({
      $or: [
        {
          timestamp: {
            $gte: startDate,
            $lt: endDate
          }
        },
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
        }
      ]
    }).sort({ timestamp: 1, request_time: 1, createdAt: 1 });
    
    console.log(`✅ Found ${logs.length} logs for ${hourRange} hour`);
    
    return logs;
  } catch (error) {
    console.error('❌ Error fetching data from apilogs collection:', error);
    return [];
  }
}
