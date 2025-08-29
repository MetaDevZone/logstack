// Direct API logs processing without jobs table
import mongoose from 'mongoose';

interface ApiLogDocument {
  _id: any;
  client_ip?: string;
  client_agent?: string;
  request_time?: Date;
  response_time?: Date;
  method: string;
  path: string;
  requestBody?: any;
  requestHeaders?: any;
  responseStatus?: number;
  responseBody?: any;
  user_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Direct processing function that works without jobs table
export async function processApiLogsDirectly() {
  console.log('🚀 Processing API logs directly from "apilogs" collection');
  
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/dynamite-lifestyle-prod-app');
    console.log('✅ Connected to database');
    
    // Get the apilogs collection
    const collection = mongoose.connection.collection('apilogs');
    
    // Get total count
    const totalCount = await collection.countDocuments();
    console.log(`📊 Total API logs found: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('❌ No API logs found in the collection');
      return;
    }
    
    // Get sample document to understand structure
    const sample = await collection.findOne();
    console.log('📄 Sample document fields:', Object.keys(sample || {}));
    
    // Get date range
    const oldest = await collection.findOne({}, { sort: { request_time: 1 } });
    const newest = await collection.findOne({}, { sort: { request_time: -1 } });
    
    if (oldest?.request_time && newest?.request_time) {
      console.log(`📅 Date range: ${oldest.request_time} to ${newest.request_time}`);
    }
    
    // Process logs by hour
    console.log('\n📈 Processing logs by hour...');
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check recent hours for testing
    const hoursToCheck = 24; // Check last 24 hours
    const results = [];
    
    for (let i = 0; i < hoursToCheck; i++) {
      const hourDate = new Date(today.getTime() - (i * 60 * 60 * 1000));
      const startDate = new Date(hourDate);
      startDate.setMinutes(0, 0, 0);
      
      const endDate = new Date(hourDate);
      endDate.setMinutes(59, 59, 999);
      
      // Query logs for this hour
      const hourLogs = await collection.find({
        $or: [
          {
            request_time: {
              $gte: startDate,
              $lte: endDate
            }
          },
          {
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        ]
      }).toArray();
      
      if (hourLogs.length > 0) {
        const hourStr = `${hourDate.getHours().toString().padStart(2, '0')}:00-${(hourDate.getHours() + 1).toString().padStart(2, '0')}:00`;
        console.log(`   ⏰ ${hourDate.toDateString()} ${hourStr}: ${hourLogs.length} logs`);
        
        // Generate file for this hour
        const fileName = `${hourDate.toISOString().split('T')[0]}-${hourStr.replace(':', '-')}.json`;
        const filePath = `./uploads/${fileName}`;
        
        // Create uploads directory if it doesn't exist
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.dirname(filePath);
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Write logs to file
        fs.writeFileSync(filePath, JSON.stringify(hourLogs, null, 2));
        
        results.push({
          hour: hourStr,
          date: hourDate.toDateString(),
          count: hourLogs.length,
          filePath: filePath,
          status: 'success'
        });
      }
    }
    
    console.log(`\n📁 Generated ${results.length} files:`);
    results.forEach(result => {
      console.log(`   📄 ${result.filePath} (${result.count} logs)`);
    });
    
    // Show some statistics
    const totalProcessed = results.reduce((sum, r) => sum + r.count, 0);
    console.log(`\n📊 Summary:`);
    console.log(`   📈 Total logs processed: ${totalProcessed}`);
    console.log(`   📁 Files generated: ${results.length}`);
    console.log(`   📂 Location: ./uploads/`);
    
    if (results.length > 0) {
      console.log(`\n🎉 Success! Your API logs have been processed into hourly files.`);
      console.log(`📋 You can now:`);
      console.log(`   1. Check the generated files in ./uploads/`);
      console.log(`   2. Configure cloud storage (S3, GCS, Azure) if needed`);
      console.log(`   3. Set up automated cron jobs for continuous processing`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error processing API logs:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Function to test with specific date range
export async function processApiLogsByDateRange(startDate: string, endDate: string) {
  console.log(`🗓️ Processing API logs from ${startDate} to ${endDate}`);
  
  try {
    await mongoose.connect('mongodb://localhost:27017/dynamite-lifestyle-prod-app');
    const collection = mongoose.connection.collection('apilogs');
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of day
    
    const logs = await collection.find({
      $or: [
        {
          request_time: {
            $gte: start,
            $lte: end
          }
        },
        {
          createdAt: {
            $gte: start,
            $lte: end
          }
        }
      ]
    }).toArray();
    
    console.log(`📊 Found ${logs.length} logs in date range`);
    
    if (logs.length > 0) {
      // Group by hour
      const hourlyGroups: { [key: string]: any[] } = {};
      
      logs.forEach(log => {
        const timestamp = log.request_time || log.createdAt;
        if (timestamp) {
          const hour = new Date(timestamp);
          hour.setMinutes(0, 0, 0);
          const hourKey = hour.toISOString();
          
          if (!hourlyGroups[hourKey]) {
            hourlyGroups[hourKey] = [];
          }
          hourlyGroups[hourKey].push(log);
        }
      });
      
      // Generate files for each hour
      const fs = require('fs');
      const path = require('path');
      
      Object.keys(hourlyGroups).forEach(hourKey => {
        const hour = new Date(hourKey);
        const hourLogs = hourlyGroups[hourKey];
        
        const fileName = `${hour.toISOString().split('T')[0]}-${hour.getHours().toString().padStart(2, '0')}-00.json`;
        const filePath = `./uploads/${fileName}`;
        
        // Create directory if needed
        const uploadsDir = path.dirname(filePath);
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(hourLogs, null, 2));
        console.log(`📄 Generated: ${filePath} (${hourLogs.length} logs)`);
      });
    }
    
    return logs;
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'process';
  
  switch (command) {
    case 'process':
      processApiLogsDirectly().catch(console.error);
      break;
    case 'range':
      const startDate = process.argv[3] || '2025-07-25';
      const endDate = process.argv[4] || '2025-08-25';
      processApiLogsByDateRange(startDate, endDate).catch(console.error);
      break;
    default:
      console.log(`
🚀 Available commands:
  npm run direct:process - Process all recent API logs
  npm run direct:range - Process specific date range
      `);
  }
}
