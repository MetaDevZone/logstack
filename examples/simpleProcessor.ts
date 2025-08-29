// Simple standalone processor for your apilogs collection
import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

interface SimpleApiLog {
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

// Simple function to process your existing apilogs
async function processYourApiLogs() {
  console.log('🚀 Simple API Logs Processor');
  console.log('===============================');
  
  try {
    // Step 1: Connect to your database
    console.log('🔌 Connecting to database...');
    await mongoose.connect('mongodb://localhost:27017/dynamite-lifestyle-prod-app');
    console.log('✅ Connected successfully');
    
    // Step 2: Access your apilogs collection
    const db = mongoose.connection.db!;
    const collection = db.collection<SimpleApiLog>('apilogs');
    
    // Step 3: Get collection info
    const totalCount = await collection.countDocuments();
    console.log(`📊 Found ${totalCount} API logs in your collection`);
    
    if (totalCount === 0) {
      console.log('❌ No data found. Please check your collection name and database.');
      return;
    }
    
    // Step 4: Get sample data to show structure
    const sample = await collection.findOne();
    if (sample) {
      console.log('📄 Your data structure:');
      Object.keys(sample).forEach(key => {
        const value = sample[key as keyof SimpleApiLog];
        const type = typeof value;
        const preview = type === 'string' ? (value as string).substring(0, 50) : value;
        console.log(`   ${key}: ${type} - ${preview}`);
      });
    }
    
    // Step 5: Find date range of your data
    const oldest = await collection.findOne({}, { sort: { request_time: 1 } });
    const newest = await collection.findOne({}, { sort: { request_time: -1 } });
    
    if (oldest?.request_time && newest?.request_time) {
      console.log(`📅 Your data spans from ${oldest.request_time.toLocaleString()} to ${newest.request_time.toLocaleString()}`);
    }
    
    console.log('\n🔄 Processing logs into hourly files...');
    
    // Step 6: Group all logs by hour
    const pipeline = [
      {
        $addFields: {
          hourBucket: {
            $dateFromParts: {
              year: { $year: "$request_time" },
              month: { $month: "$request_time" },
              day: { $dayOfMonth: "$request_time" },
              hour: { $hour: "$request_time" }
            }
          }
        }
      },
      {
        $group: {
          _id: "$hourBucket",
          logs: { $push: "$$ROOT" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];
    
    const hourlyGroups = await collection.aggregate(pipeline).toArray();
    console.log(`📈 Found ${hourlyGroups.length} different hours with data`);
    
    // Step 7: Create uploads directory
    const uploadsDir = './uploads';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`📁 Created uploads directory: ${uploadsDir}`);
    }
    
    // Step 8: Generate files for each hour
    const generatedFiles = [];
    
    for (const group of hourlyGroups) {
      const hourDate = new Date(group._id);
      const dateStr = hourDate.toISOString().split('T')[0];
      const hourStr = hourDate.getHours().toString().padStart(2, '0');
      
      const fileName = `${dateStr}_hour_${hourStr}.json`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Write the logs to file
      const fileContent = {
        metadata: {
          date: dateStr,
          hour: hourStr,
          count: group.count,
          generatedAt: new Date().toISOString()
        },
        logs: group.logs
      };
      
      fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
      
      generatedFiles.push({
        file: fileName,
        count: group.count,
        hour: `${hourStr}:00-${(parseInt(hourStr) + 1).toString().padStart(2, '0')}:00`
      });
      
      console.log(`   📄 ${fileName} - ${group.count} logs`);
    }
    
    // Step 9: Generate summary
    console.log('\n🎉 Processing Complete!');
    console.log('========================');
    console.log(`📊 Total files generated: ${generatedFiles.length}`);
    console.log(`📈 Total logs processed: ${generatedFiles.reduce((sum, f) => sum + f.count, 0)}`);
    console.log(`📁 Files saved to: ${path.resolve(uploadsDir)}`);
    
    // Step 10: Show some file examples
    if (generatedFiles.length > 0) {
      console.log('\n📋 Generated files:');
      generatedFiles.slice(0, 5).forEach(file => {
        console.log(`   📄 ${file.file} (${file.count} logs for ${file.hour})`);
      });
      
      if (generatedFiles.length > 5) {
        console.log(`   ... and ${generatedFiles.length - 5} more files`);
      }
    }
    
    // Step 11: Show next steps
    console.log('\n🚀 Next Steps:');
    console.log('   1. Check the generated files in ./uploads/ folder');
    console.log('   2. Each file contains logs for one hour period');
    console.log('   3. You can now upload these files to cloud storage if needed');
    console.log('   4. Set up automated processing for future logs');
    
    return generatedFiles;
    
  } catch (error) {
    console.error('❌ Error processing API logs:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Quick test function to verify your data
async function quickDataCheck() {
  console.log('🔍 Quick Data Check');
  console.log('===================');
  
  try {
    await mongoose.connect('mongodb://localhost:27017/dynamite-lifestyle-prod-app');
    const collection = mongoose.connection.collection('apilogs');
    
    const count = await collection.countDocuments();
    console.log(`📊 Total documents: ${count}`);
    
    if (count > 0) {
      const sample = await collection.findOne();
      console.log('📄 Sample document fields:', Object.keys(sample || {}));
      
      // Check for timestamp fields
      const timestampFields = ['request_time', 'response_time', 'createdAt', 'updatedAt', 'timestamp'];
      const availableTimestamps = timestampFields.filter(field => sample && sample[field]);
      console.log('🕒 Available timestamp fields:', availableTimestamps);
      
      if (availableTimestamps.length > 0) {
        console.log('✅ Ready to process! Run: npm run simple:process');
      } else {
        console.log('❌ No timestamp fields found. Please check your data structure.');
      }
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Export functions
export { processYourApiLogs, quickDataCheck };

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'process';
  
  switch (command) {
    case 'process':
      processYourApiLogs().catch(console.error);
      break;
    case 'check':
      quickDataCheck().catch(console.error);
      break;
    default:
      console.log(`
🚀 Simple API Logs Processor Commands:
  npm run simple:process - Process all your API logs into hourly files
  npm run simple:check   - Quick check of your data structure
      `);
  }
}
