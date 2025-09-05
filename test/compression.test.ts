/**
 * 🧪 Compression Test
 * 
 * This test verifies that the compression functionality works correctly
 * with different formats and settings.
 */

import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { saveFile } from '../lib/fileWriters';
import { Config } from '../types/config';

// Mock job data for testing
const mockJob = {
  _id: 'test-job-id',
  date: '2024-01-15',
  status: 'processing' as const,
  created_at: new Date(),
  hours: []
};

const mockHourJob = {
  hour: '14-15',
  status: 'processing' as const,
  file_name: 'api_logs_2024-01-15_14-15.json',
  record_count: 0,
  processed_at: new Date()
};

// Sample data to compress
const sampleData = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  timestamp: new Date().toISOString(),
  method: 'GET',
  path: `/api/endpoint/${i}`,
  status: 200,
  response_time: Math.random() * 1000,
  user_id: `user_${Math.floor(Math.random() * 100)}`,
  ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
  user_agent: 'Mozilla/5.0 (compatible; TestAgent/1.0)',
  request_body: JSON.stringify({ data: `test data ${i}` }),
  response_body: JSON.stringify({ result: `response ${i}`, success: true })
}));

async function testCompression() {
  console.log('🧪 Starting compression tests...\n');
  
  const testResults: any[] = [];
  
  // Test configurations
  const configs = [
    {
      name: 'No Compression',
      config: {
        compression: { enabled: false },
        outputDirectory: 'test-output/no-compression'
      } as Config
    },
    {
      name: 'GZIP Level 6',
      config: {
        compression: { 
          enabled: true, 
          format: 'gzip' as const, 
          level: 6,
          fileSize: 100 
        },
        outputDirectory: 'test-output/gzip-6'
      } as Config
    },
    {
      name: 'GZIP Level 9',
      config: {
        compression: { 
          enabled: true, 
          format: 'gzip' as const, 
          level: 9,
          fileSize: 100 
        },
        outputDirectory: 'test-output/gzip-9'
      } as Config
    },
    {
      name: 'Brotli Level 6',
      config: {
        compression: { 
          enabled: true, 
          format: 'brotli' as const, 
          level: 6,
          fileSize: 100 
        },
        outputDirectory: 'test-output/brotli-6'
      } as Config
    },
    {
      name: 'Brotli Level 9',
      config: {
        compression: { 
          enabled: true, 
          format: 'brotli' as const, 
          level: 9,
          fileSize: 100 
        },
        outputDirectory: 'test-output/brotli-9'
      } as Config
    }
  ];
  
  for (const test of configs) {
    console.log(`📦 Testing: ${test.name}`);
    
    try {
      const startTime = Date.now();
      
      // Save file with compression settings
      const filePath = await saveFile(mockJob, mockHourJob, sampleData, 'json', test.config);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Check file stats
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;
      
      // Original content size for comparison
      const originalContent = JSON.stringify(sampleData, null, 2);
      const originalSize = Buffer.byteLength(originalContent, 'utf8');
      
      const compressionRatio = ((originalSize - fileSize) / originalSize * 100).toFixed(1);
      
      testResults.push({
        name: test.name,
        originalSize,
        compressedSize: fileSize,
        compressionRatio: `${compressionRatio}%`,
        processingTime: `${processingTime}ms`,
        filePath
      });
      
      console.log(`  ✅ Original: ${originalSize} bytes`);
      console.log(`  📦 Compressed: ${fileSize} bytes`);
      console.log(`  📊 Ratio: ${compressionRatio}% reduction`);
      console.log(`  ⏱️ Time: ${processingTime}ms`);
      console.log(`  📁 File: ${filePath}\n`);
      
    } catch (error) {
      console.error(`  ❌ Failed: ${error}\n`);
      testResults.push({
        name: test.name,
        error: String(error)
      });
    }
  }
  
  // Summary table
  console.log('📊 COMPRESSION TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Format          | Original | Compressed | Reduction | Time');
  console.log('───────────────────────────────────────────────────────────────');
  
  testResults.forEach(result => {
    if (!result.error) {
      const name = result.name.padEnd(15);
      const original = `${Math.round(result.originalSize / 1024)}KB`.padEnd(8);
      const compressed = `${Math.round(result.compressedSize / 1024)}KB`.padEnd(10);
      const reduction = result.compressionRatio.padEnd(9);
      const time = result.processingTime.padEnd(8);
      
      console.log(`${name} | ${original} | ${compressed} | ${reduction} | ${time}`);
    }
  });
  
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  console.log('🟢 For real-time processing: GZIP Level 6 (fast, good compression)');
  console.log('🔵 For storage optimization: Brotli Level 6-9 (best compression)');
  console.log('🟡 For development: No compression (easier debugging)');
  console.log('🔴 Avoid: Very high levels (9) unless storage cost is critical\n');
  
  return testResults;
}

async function testDecompression() {
  console.log('🔓 Testing decompression...\n');
  
  try {
    // Test with a gzip compressed file
    const config = {
      compression: { 
        enabled: true, 
        format: 'gzip' as const, 
        level: 6,
        fileSize: 100 
      },
      outputDirectory: 'test-output/decompress-test'
    } as Config;
    
    const filePath = await saveFile(mockJob, mockHourJob, sampleData, 'json', config);
    console.log(`📦 Created compressed file: ${filePath}`);
    
    // Read and decompress
    const compressedData = await fs.readFile(filePath);
    const decompressed = zlib.gunzipSync(compressedData);
    const decompressedContent = decompressed.toString('utf8');
    const parsedData = JSON.parse(decompressedContent);
    
    console.log(`✅ Successfully decompressed ${compressedData.length} bytes to ${decompressed.length} bytes`);
    console.log(`📝 Records recovered: ${parsedData.length}`);
    console.log(`🔍 First record ID: ${parsedData[0]?.id}`);
    console.log(`🔍 Last record ID: ${parsedData[parsedData.length - 1]?.id}\n`);
    
    return true;
  } catch (error) {
    console.error(`❌ Decompression test failed: ${error}\n`);
    return false;
  }
}

async function cleanupTestFiles() {
  console.log('🧹 Cleaning up test files...');
  
  try {
    await fs.rm('test-output', { recursive: true, force: true });
    console.log('✅ Test files cleaned up\n');
  } catch (error) {
    console.log('ℹ️ No test files to clean up\n');
  }
}

async function runTests() {
  console.log('🚀 COMPRESSION FUNCTIONALITY TESTS\n');
  
  // Cleanup any existing test files
  await cleanupTestFiles();
  
  // Run compression tests
  const results = await testCompression();
  
  // Test decompression
  const decompressionSuccess = await testDecompression();
  
  // Cleanup
  await cleanupTestFiles();
  
  // Final summary
  console.log('📋 TEST SUMMARY:');
  console.log(`📦 Compression formats tested: ${results.filter(r => !r.error).length}`);
  console.log(`🔓 Decompression test: ${decompressionSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`🎯 Overall result: ${results.every(r => !r.error) && decompressionSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { testCompression, testDecompression, runTests };
