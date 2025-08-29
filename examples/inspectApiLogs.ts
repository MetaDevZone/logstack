import { init, createDailyJobs, runHourlyJob } from '../index';
import mongoose from 'mongoose';

// Quick test to check your apilogs collection
async function inspectApiLogsCollection() {
  console.log('🔍 Inspecting your apilogs collection...');

  // Replace with your actual database name
  const dbName = 'dynamite-lifestyle-prod-app'; // Change this to your database name
  
  try {
    // Connect to your database
    await mongoose.connect(`mongodb://localhost:27017/${dbName}`);
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;
    const apilogsCollection = db.collection('apilogs');

    // Check if collection exists
    const collections = await db.listCollections({ name: 'apilogs' }).toArray();
    if (collections.length === 0) {
      console.log('❌ Collection "apilogs" not found');
      console.log('📋 Available collections:');
      const allCollections = await db.listCollections().toArray();
      allCollections.forEach(col => console.log(`   - ${col.name}`));
      return;
    }

    console.log('✅ Found apilogs collection');

    // Count total documents
    const totalCount = await apilogsCollection.countDocuments();
    console.log(`📊 Total documents in apilogs: ${totalCount}`);

    if (totalCount === 0) {
      console.log('❌ No documents found in apilogs collection');
      return;
    }

    // Get sample document to understand structure
    const sampleDoc = await apilogsCollection.findOne();
    if (!sampleDoc) {
      console.log('❌ Could not fetch sample document');
      return;
    }
    
    console.log('📄 Sample document structure:');
    console.log('Field names:', Object.keys(sampleDoc));
    console.log('Sample document:', JSON.stringify(sampleDoc, null, 2));

    // Check for timestamp fields
    const timestampFields = Object.keys(sampleDoc).filter(key => 
      key.toLowerCase().includes('time') || 
      key.toLowerCase().includes('date') || 
      key === 'timestamp' || 
      key === 'createdAt' || 
      key === 'created_at'
    );
    
    console.log('🕒 Potential timestamp fields:', timestampFields);

    // Check date range of logs
    if (timestampFields.length > 0) {
      for (const field of timestampFields) {
        try {
          const oldest = await apilogsCollection.findOne(
            { [field]: { $exists: true, $ne: null } }, 
            { sort: { [field]: 1 } }
          );
          const newest = await apilogsCollection.findOne(
            { [field]: { $exists: true, $ne: null } }, 
            { sort: { [field]: -1 } }
          );
          
          if (oldest && newest) {
            console.log(`📅 ${field} range: ${oldest[field]} to ${newest[field]}`);
          }
        } catch (e: any) {
          console.log(`⚠️  Could not analyze ${field}: ${e.message}`);
        }
      }
    }

    // Check recent logs (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let recentCount = 0;
    
    for (const field of timestampFields) {
      try {
        const count = await apilogsCollection.countDocuments({
          [field]: { $gte: yesterday }
        });
        if (count > recentCount) {
          recentCount = count;
        }
      } catch (e) {
        // Field might not be a date
      }
    }
    
    console.log(`📈 Logs from last 24 hours: ${recentCount}`);

    await mongoose.disconnect();
    console.log('✅ Inspection completed');

  } catch (error) {
    console.error('❌ Error inspecting database:', error);
  }
}

// Run the inspection
inspectApiLogsCollection().catch(console.error);
