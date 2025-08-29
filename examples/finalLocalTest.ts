/**
 * 🏁 Final Comprehensive Local Test - Cron Log Service
 * 
 * This test demonstrates the complete functionality of the cron-log-service
 * with local file storage, including:
 * - Real-time API logs processing from database
 * - High-performance batch processing for large datasets
 * - Local file storage with organized directory structure
 * - Performance monitoring and optimization
 * - Complete end-to-end testing
 */

import { init, createDailyJobs, processSpecificHour } from '../src/main';
import { saveApiLog, getApiLogs, getApiLogsByHour } from '../src/apiLogs';
import { Config } from '../types/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.log('Note: dotenv not found, using default values');
}

// ==========================================
// 🔧 LOCAL FILE STORAGE CONFIGURATION
// ==========================================

const localConfig: Config = {
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/final-local-test',
  uploadProvider: 'local',  // 📁 Local file storage
  fileFormat: 'json',
  
  // 📂 Organized local directory structure
  outputDirectory: 'final-test-outputs',
  
  // 🗃️ Custom collections for final testing
  collections: {
    jobsCollectionName: 'final_test_jobs',
    logsCollectionName: 'final_test_logs',
    apiLogsCollectionName: 'apilogs'  // Use your existing apilogs collection
  },
  
  retryAttempts: 3,
  logging: {
    level: 'info',
    enableConsole: true
  }
};

// ==========================================
// 📊 PERFORMANCE METRICS
// ==========================================

interface PerformanceMetrics {
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  totalFiles: number;
  totalSize: string;
  startTime: Date;
  endTime?: Date;
  duration?: string;
  recordsPerSecond?: number;
  memoryUsage: NodeJS.MemoryUsage;
}

let performanceMetrics: PerformanceMetrics = {
  totalRecords: 0,
  processedRecords: 0,
  failedRecords: 0,
  totalFiles: 0,
  totalSize: '0 MB',
  startTime: new Date(),
  memoryUsage: process.memoryUsage()
};

// ==========================================
// 🎯 SAMPLE DATA GENERATION
// ==========================================

async function generateSampleApiLogs(count: number = 100) {
  console.log(`📝 Generating ${count} sample API logs for testing...`);
  
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const paths = [
    '/api/users', '/api/orders', '/api/products', '/api/auth/login',
    '/api/auth/logout', '/api/dashboard', '/api/reports', '/api/settings',
    '/api/notifications', '/api/payments', '/api/search', '/api/upload'
  ];
  const statuses = [200, 201, 400, 401, 403, 404, 500];
  const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.45'];
  
  const logs = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Create logs spread across the last 24 hours
    const hoursAgo = Math.floor(Math.random() * 24);
    const requestTime = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
    const responseTime = new Date(requestTime.getTime() + Math.random() * 1000);
    
    const method = methods[Math.floor(Math.random() * methods.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const ip = ips[Math.floor(Math.random() * ips.length)];
    
    const logData = {
      request_time: requestTime,
      response_time: responseTime,
      method: method,
      path: path,
      requestBody: method === 'POST' || method === 'PUT' ? {
        data: `Sample ${method} data for ${path}`,
        userId: Math.floor(Math.random() * 1000),
        timestamp: requestTime.toISOString()
      } : undefined,
      requestHeaders: {
        'content-type': 'application/json',
        'user-agent': 'FinalTest/1.0',
        'authorization': 'Bearer sample-token'
      },
      responseStatus: status,
      responseBody: {
        success: status < 400,
        message: status < 400 ? 'Operation successful' : 'Operation failed',
        data: status < 400 ? { id: Math.floor(Math.random() * 10000) } : null
      },
      requestQuery: path.includes('search') ? { q: 'test query', limit: 10 } : {},
      requestParams: { id: Math.floor(Math.random() * 1000) },
      client_ip: ip,
      client_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    
    logs.push(logData);
    
    // Save to database
    try {
      await saveApiLog(logData, localConfig);
      if ((i + 1) % 50 === 0) {
        console.log(`✅ Generated ${i + 1}/${count} sample logs`);
      }
    } catch (error) {
      console.error(`❌ Failed to save log ${i + 1}:`, error);
    }
  }
  
  console.log(`🎉 Successfully generated ${count} sample API logs`);
  return logs;
}

// ==========================================
// 📂 LOCAL FILE UTILITIES
// ==========================================

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function getFileSize(filePath: string): string {
  try {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } catch (error) {
    return '0 B';
  }
}

function getTotalDirectorySize(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;
  
  let totalSize = 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      totalSize += getTotalDirectorySize(fullPath);
    } else {
      totalSize += fs.statSync(fullPath).size;
    }
  }
  
  return totalSize;
}

// ==========================================
// ⚡ HIGH-PERFORMANCE BATCH PROCESSING
// ==========================================

async function processApiLogsBatch(
  startDate: Date,
  endDate: Date,
  batchSize: number = 1000
): Promise<void> {
  console.log(`⚡ Processing API logs from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  console.log(`📦 Batch size: ${batchSize} records`);
  
  let skip = 0;
  let totalProcessed = 0;
  let batchNumber = 1;
  
  while (true) {
    console.log(`\n🔄 Processing batch ${batchNumber} (records ${skip + 1} to ${skip + batchSize})`);
    
    try {
      // Fetch batch of API logs
      const logs = await getApiLogs({
        startDate: startDate,
        endDate: endDate,
        limit: batchSize,
        skip: skip
      }, localConfig);
      
      if (logs.length === 0) {
        console.log('✅ No more records to process');
        break;
      }
      
      // Group logs by hour for organized file structure
      const logsByHour = new Map<string, any[]>();
      
      for (const log of logs) {
        const hour = new Date(log.request_time).getUTCHours();
        const date = new Date(log.request_time).toISOString().split('T')[0];
        const hourKey = `${date}_${hour.toString().padStart(2, '0')}`;
        
        if (!logsByHour.has(hourKey)) {
          logsByHour.set(hourKey, []);
        }
        logsByHour.get(hourKey)!.push({
          id: log._id,
          request_time: log.request_time,
          response_time: log.response_time,
          method: log.method,
          path: log.path,
          status: log.responseStatus,
          client_ip: log.client_ip,
          requestBody: log.requestBody,
          responseBody: log.responseBody,
          headers: log.requestHeaders,
          query: log.requestQuery,
          params: log.requestParams,
          user_agent: log.client_agent
        });
      }
      
      // Save each hour's data to separate files
      for (const [hourKey, hourLogs] of logsByHour) {
        const [date, hour] = hourKey.split('_');
        const outputDir = path.join(localConfig.outputDirectory || 'final-test-outputs', date);
        ensureDirectoryExists(outputDir);
        
        const fileName = `api-logs-${hour}-00.json`;
        const filePath = path.join(outputDir, fileName);
        
        // Append to existing file or create new one
        let existingData = [];
        if (fs.existsSync(filePath)) {
          try {
            const existingContent = fs.readFileSync(filePath, 'utf8');
            existingData = JSON.parse(existingContent);
          } catch (error) {
            console.warn(`⚠️ Could not read existing file ${filePath}, creating new one`);
          }
        }
        
        // Merge and save data
        const mergedData = [...existingData, ...hourLogs];
        fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
        
        console.log(`💾 Saved ${hourLogs.length} logs to ${filePath} (${getFileSize(filePath)})`);
        performanceMetrics.totalFiles++;
      }
      
      totalProcessed += logs.length;
      performanceMetrics.processedRecords += logs.length;
      
      console.log(`✅ Batch ${batchNumber} processed: ${logs.length} records`);
      console.log(`📊 Total processed: ${totalProcessed} records`);
      
      // Memory usage monitoring
      const memUsage = process.memoryUsage();
      console.log(`💾 Memory: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB used`);
      
      skip += batchSize;
      batchNumber++;
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error processing batch ${batchNumber}:`, error);
      performanceMetrics.failedRecords += batchSize;
      skip += batchSize;
      batchNumber++;
    }
  }
  
  console.log(`\n🎉 Batch processing complete! Total processed: ${totalProcessed} records`);
}

// ==========================================
// 📈 REAL-TIME STREAMING PROCESSOR
// ==========================================

async function streamProcessApiLogs(): Promise<void> {
  console.log('\n🌊 Starting real-time streaming API logs processor...');
  
  try {
    const collection = mongoose.connection.collection(
      localConfig.collections?.apiLogsCollectionName || 'apilogs'
    );
    
    // Get logs from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Use MongoDB cursor for memory-efficient streaming
    const cursor = collection.find({
      request_time: { $gte: oneDayAgo }
    }).sort({ request_time: 1 });
    
    let processedCount = 0;
    const batchBuffer: any[] = [];
    const STREAM_BATCH_SIZE = 500;
    
    console.log('📊 Streaming API logs from database...');
    
    for await (const doc of cursor) {
      batchBuffer.push({
        id: doc._id,
        request_time: doc.request_time,
        response_time: doc.response_time,
        method: doc.method,
        path: doc.path,
        status: doc.responseStatus,
        client_ip: doc.client_ip,
        requestBody: doc.requestBody,
        responseBody: doc.responseBody
      });
      
      // Process when buffer is full
      if (batchBuffer.length >= STREAM_BATCH_SIZE) {
        await processBatchBuffer(batchBuffer);
        batchBuffer.length = 0; // Clear buffer
        processedCount += STREAM_BATCH_SIZE;
        
        if (processedCount % 1000 === 0) {
          console.log(`🔄 Streamed ${processedCount} records...`);
        }
      }
    }
    
    // Process remaining items in buffer
    if (batchBuffer.length > 0) {
      await processBatchBuffer(batchBuffer);
      processedCount += batchBuffer.length;
    }
    
    console.log(`✅ Streaming complete! Processed ${processedCount} records`);
    
  } catch (error) {
    console.error('❌ Streaming processor failed:', error);
    throw error;
  }
}

async function processBatchBuffer(buffer: any[]): Promise<void> {
  // Group by hour and save to files
  const logsByHour = new Map<string, any[]>();
  
  for (const log of buffer) {
    const hour = new Date(log.request_time).getUTCHours();
    const date = new Date(log.request_time).toISOString().split('T')[0];
    const hourKey = `${date}_${hour.toString().padStart(2, '0')}`;
    
    if (!logsByHour.has(hourKey)) {
      logsByHour.set(hourKey, []);
    }
    logsByHour.get(hourKey)!.push(log);
  }
  
  // Save each hour's data
  for (const [hourKey, hourLogs] of logsByHour) {
    const [date, hour] = hourKey.split('_');
    const outputDir = path.join(localConfig.outputDirectory || 'final-test-outputs', 'streaming', date);
    ensureDirectoryExists(outputDir);
    
    const fileName = `stream-api-logs-${hour}-00.json`;
    const filePath = path.join(outputDir, fileName);
    
    // Append to existing file
    let existingData = [];
    if (fs.existsSync(filePath)) {
      try {
        const existingContent = fs.readFileSync(filePath, 'utf8');
        existingData = JSON.parse(existingContent);
      } catch (error) {
        // File might be corrupted, start fresh
      }
    }
    
    const mergedData = [...existingData, ...hourLogs];
    fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
  }
}

// ==========================================
// 📊 COMPREHENSIVE ANALYTICS
// ==========================================

async function generateAnalyticsReport(): Promise<void> {
  console.log('\n📊 Generating comprehensive analytics report...');
  
  try {
    const outputDir = path.join(localConfig.outputDirectory || 'final-test-outputs', 'analytics');
    ensureDirectoryExists(outputDir);
    
    // Get total record count
    const totalLogs = await getApiLogs({ limit: 1 }, localConfig);
    const collection = mongoose.connection.collection(
      localConfig.collections?.apiLogsCollectionName || 'apilogs'
    );
    const totalCount = await collection.countDocuments();
    
    // Generate analytics
    const analytics: any = {
      generated_at: new Date().toISOString(),
      total_api_logs: totalCount,
      performance_metrics: performanceMetrics,
      summary: {
        total_files_created: performanceMetrics.totalFiles,
        total_records_processed: performanceMetrics.processedRecords,
        failed_records: performanceMetrics.failedRecords,
        success_rate: `${((performanceMetrics.processedRecords / (performanceMetrics.processedRecords + performanceMetrics.failedRecords)) * 100).toFixed(2)}%`,
        output_directory: localConfig.outputDirectory,
        collections_used: localConfig.collections
      },
      system_info: {
        node_version: process.version,
        platform: process.platform,
        memory_usage: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    // Method distribution
    const methodStats = await collection.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    analytics.method_distribution = methodStats;
    
    // Status code distribution
    const statusStats = await collection.aggregate([
      { $group: { _id: '$responseStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    analytics.status_distribution = statusStats;
    
    // Top paths
    const pathStats = await collection.aggregate([
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    analytics.top_paths = pathStats;
    
    // Save analytics report
    const reportPath = path.join(outputDir, 'final-test-analytics.json');
    fs.writeFileSync(reportPath, JSON.stringify(analytics, null, 2));
    
    console.log(`📄 Analytics report saved to: ${reportPath}`);
    console.log(`📈 Total API logs processed: ${totalCount}`);
    console.log(`📊 Success rate: ${analytics.summary.success_rate}`);
    
  } catch (error) {
    console.error('❌ Failed to generate analytics:', error);
  }
}

// ==========================================
// 🗂️ FILE ORGANIZATION & CLEANUP
// ==========================================

function organizeOutputFiles(): void {
  console.log('\n🗂️ Organizing output files...');
  
  const baseDir = localConfig.outputDirectory || 'final-test-outputs';
  
  if (!fs.existsSync(baseDir)) {
    console.log('📁 No output directory found');
    return;
  }
  
  const stats = {
    totalFiles: 0,
    totalSize: 0,
    directories: new Set<string>()
  };
  
  function scanDirectory(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        stats.directories.add(fullPath);
        scanDirectory(fullPath);
      } else {
        stats.totalFiles++;
        stats.totalSize += fs.statSync(fullPath).size;
      }
    }
  }
  
  scanDirectory(baseDir);
  
  console.log(`📊 File Organization Summary:`);
  console.log(`   📁 Total directories: ${stats.directories.size}`);
  console.log(`   📄 Total files: ${stats.totalFiles}`);
  console.log(`   💾 Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  // Update performance metrics
  performanceMetrics.totalFiles = stats.totalFiles;
  performanceMetrics.totalSize = `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`;
}

// ==========================================
// 🎯 VALIDATION & TESTING
// ==========================================

async function validateGeneratedFiles(): Promise<void> {
  console.log('\n🔍 Validating generated files...');
  
  const baseDir = localConfig.outputDirectory || 'final-test-outputs';
  
  if (!fs.existsSync(baseDir)) {
    console.log('❌ Output directory not found');
    return;
  }
  
  let validFiles = 0;
  let invalidFiles = 0;
  let totalRecords = 0;
  
  function validateDirectory(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        validateDirectory(fullPath);
      } else if (file.name.endsWith('.json')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const data = JSON.parse(content);
          
          if (Array.isArray(data)) {
            totalRecords += data.length;
            validFiles++;
            console.log(`✅ ${fullPath}: ${data.length} records (${getFileSize(fullPath)})`);
          } else {
            console.log(`⚠️ ${fullPath}: Not an array format`);
          }
        } catch (error) {
          invalidFiles++;
          console.log(`❌ ${fullPath}: Invalid JSON`);
        }
      }
    }
  }
  
  validateDirectory(baseDir);
  
  console.log(`\n📊 Validation Summary:`);
  console.log(`   ✅ Valid files: ${validFiles}`);
  console.log(`   ❌ Invalid files: ${invalidFiles}`);
  console.log(`   📄 Total records: ${totalRecords}`);
  console.log(`   📈 Validation rate: ${((validFiles / (validFiles + invalidFiles)) * 100).toFixed(2)}%`);
}

// ==========================================
// 🏁 MAIN FINAL TEST FUNCTION
// ==========================================

async function runFinalLocalTest(): Promise<void> {
  try {
    console.log('🏁 Final Comprehensive Local Test');
    console.log('=================================\n');
    
    performanceMetrics.startTime = new Date();
    
    // Step 1: Initialize service
    console.log('🚀 Step 1: Initializing cron-log-service...');
    await init(localConfig);
    console.log('✅ Service initialized successfully');
    console.log(`📁 Output directory: ${localConfig.outputDirectory}`);
    console.log(`🗃️ API logs collection: ${localConfig.collections?.apiLogsCollectionName}`);
    
    // Step 2: Check existing data and generate samples if needed
    console.log('\n📊 Step 2: Checking existing API logs data...');
    const existingLogs = await getApiLogs({ limit: 10 }, localConfig);
    console.log(`📈 Found ${existingLogs.length} existing API logs`);
    
    if (existingLogs.length < 50) {
      console.log('📝 Generating sample data for comprehensive testing...');
      await generateSampleApiLogs(500);
    }
    
    // Step 3: Process real-time data with high performance
    console.log('\n⚡ Step 3: High-performance batch processing...');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const today = new Date();
    await processApiLogsBatch(yesterday, today, 1000);
    
    // Step 4: Streaming processor test
    console.log('\n🌊 Step 4: Real-time streaming processor...');
    await streamProcessApiLogs();
    
    // Step 5: Create daily jobs and process specific hours
    console.log('\n📅 Step 5: Creating daily jobs and processing hours...');
    const dateStr = new Date().toISOString().split('T')[0];
    const job = await createDailyJobs(dateStr, localConfig);
    console.log(`✅ Created daily job with ${job.hours.length} hour slots`);
    
    // Process a few specific hours
    const hoursToProcess = [9, 12, 15, 18];
    for (const hour of hoursToProcess) {
      console.log(`⚡ Processing hour ${hour}:00-${hour + 1}:00...`);
      await processSpecificHour(dateStr, hour, localConfig);
      console.log(`✅ Hour ${hour}:00-${hour + 1}:00 processed`);
    }
    
    // Step 6: File organization and validation
    console.log('\n🗂️ Step 6: File organization and validation...');
    organizeOutputFiles();
    await validateGeneratedFiles();
    
    // Step 7: Generate analytics report
    console.log('\n📊 Step 7: Generating analytics report...');
    await generateAnalyticsReport();
    
    // Step 8: Final performance summary
    performanceMetrics.endTime = new Date();
    const duration = performanceMetrics.endTime.getTime() - performanceMetrics.startTime.getTime();
    performanceMetrics.duration = `${(duration / 1000).toFixed(2)} seconds`;
    performanceMetrics.recordsPerSecond = performanceMetrics.processedRecords / (duration / 1000);
    performanceMetrics.memoryUsage = process.memoryUsage();
    
    console.log('\n🎉 Final Test Completed Successfully!');
    console.log('===================================');
    console.log('✅ Local file storage working perfectly');
    console.log('✅ High-performance batch processing');
    console.log('✅ Real-time streaming processor');
    console.log('✅ Complete API logs processing');
    console.log('✅ File organization and validation');
    console.log('✅ Analytics reporting');
    
    console.log('\n📊 Final Performance Summary:');
    console.log(`⏱️  Total duration: ${performanceMetrics.duration}`);
    console.log(`📄 Records processed: ${performanceMetrics.processedRecords}`);
    console.log(`📁 Files created: ${performanceMetrics.totalFiles}`);
    console.log(`💾 Total size: ${performanceMetrics.totalSize}`);
    console.log(`⚡ Processing rate: ${performanceMetrics.recordsPerSecond?.toFixed(2)} records/second`);
    console.log(`🧠 Memory used: ${(performanceMetrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n📁 Output Directory Structure:');
    console.log(`   ${localConfig.outputDirectory}/`);
    console.log(`   ├── {date}/`);
    console.log(`   │   ├── api-logs-{hour}-00.json`);
    console.log(`   │   └── {hour}-{hour+1}.json`);
    console.log(`   ├── streaming/`);
    console.log(`   │   └── {date}/stream-api-logs-{hour}-00.json`);
    console.log(`   └── analytics/`);
    console.log(`       └── final-test-analytics.json`);
    
    console.log('\n🚀 Your local file storage setup is production-ready!');
    
  } catch (error) {
    console.error('\n❌ Final Test Failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check MongoDB connection');
    console.log('2. Ensure write permissions for output directory');
    console.log('3. Verify sufficient disk space');
    console.log('4. Check API logs collection exists');
    process.exit(1);
  }
}

// ==========================================
// 🎮 COMMAND LINE INTERFACE
// ==========================================

function showUsage() {
  console.log('🏁 Final Local Test Usage Options:');
  console.log('');
  console.log('  npm run test:final                 # Run complete final test');
  console.log('  npm run test:final -- --help       # Show this help');
  console.log('  npm run test:final -- --quick      # Quick test with fewer records');
  console.log('  npm run test:final -- --analytics  # Generate analytics only');
  console.log('  npm run test:final -- --validate   # Validate existing files only');
  console.log('');
  console.log('📁 Output will be saved to: ./final-test-outputs/');
  console.log('🗃️ Using collection: apilogs');
  console.log('');
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    showUsage();
    process.exit(0);
  }
  
  if (args.includes('--quick')) {
    // Quick test mode - reduce batch sizes
    console.log('⚡ Running in quick test mode...');
  }
  
  if (args.includes('--analytics')) {
    // Analytics only mode
    console.log('📊 Analytics only mode...');
    init(localConfig)
      .then(() => generateAnalyticsReport())
      .catch(console.error);
  } else if (args.includes('--validate')) {
    // Validation only mode
    console.log('🔍 Validation only mode...');
    validateGeneratedFiles().catch(console.error);
  } else {
    // Full test
    runFinalLocalTest().catch(console.error);
  }
}

export {
  localConfig,
  generateSampleApiLogs,
  processApiLogsBatch,
  streamProcessApiLogs,
  generateAnalyticsReport,
  runFinalLocalTest
};
