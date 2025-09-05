/**
 * 📦 File Compression Example
 * 
 * This example demonstrates how to configure file compression for the logstack package.
 * Compression helps reduce storage costs and improves upload performance for large files.
 */

import { init, createDailyJobs } from '../src/main';
import { Config } from '../types/config';

// ==========================================
// 🎯 COMPRESSION CONFIGURATION OPTIONS
// ==========================================

// Basic compression setup
const basicCompressionConfig: Config = {
  dbUri: 'mongodb://localhost:27017/logstack',
  uploadProvider: 'local',
  fileFormat: 'json',
  
  // Enable basic gzip compression
  compression: {
    enabled: true,
    format: 'gzip',
    level: 6,
    fileSize: 1024 // Only compress files larger than 1KB
  }
};

// Advanced compression for production
const productionCompressionConfig: Config = {
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/logstack-prod',
  uploadProvider: 's3',
  fileFormat: 'json',
  
  // Advanced compression settings
  compression: {
    enabled: true,
    format: 'brotli', // Better compression ratio than gzip
    level: 8, // High compression level for production
    fileSize: 512 // Compress files larger than 512 bytes
  },
  
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'logstack-compressed-logs'
  }
};

// Development - no compression for easier debugging
const developmentConfig: Config = {
  dbUri: 'mongodb://localhost:27017/logstack-dev',
  uploadProvider: 'local',
  fileFormat: 'json',
  outputDirectory: 'dev-logs',
  
  // Disable compression in development
  compression: {
    enabled: false
  }
};

// Different compression formats comparison
const compressionFormats = {
  gzip: {
    ...basicCompressionConfig,
    compression: {
      enabled: true,
      format: 'gzip' as const,
      level: 6,
      fileSize: 1024
    }
  },
  brotli: {
    ...basicCompressionConfig,
    compression: {
      enabled: true,
      format: 'brotli' as const,
      level: 6,
      fileSize: 1024
    }
  },
  zip: {
    ...basicCompressionConfig,
    compression: {
      enabled: true,
      format: 'zip' as const,
      level: 6,
      fileSize: 1024
    }
  }
};

// ==========================================
// 🚀 USAGE EXAMPLES
// ==========================================

async function basicCompressionExample() {
  console.log('📦 Basic Compression Example');
  
  try {
    await init(basicCompressionConfig);
    console.log('✅ Service initialized with basic gzip compression');
    console.log('📝 Files larger than 1KB will be compressed with gzip level 6');
    
    // Create jobs to test compression
    await createDailyJobs();
    console.log('🔄 Daily jobs created - compression will be applied during processing');
    
  } catch (error) {
    console.error('❌ Failed to initialize with compression:', error);
  }
}

async function productionCompressionExample() {
  console.log('🏭 Production Compression Example');
  
  try {
    await init(productionCompressionConfig);
    console.log('✅ Service initialized with production-grade brotli compression');
    console.log('📝 Files larger than 512 bytes will be compressed with brotli level 8');
    console.log('☁️ Compressed files will be uploaded to S3');
    
  } catch (error) {
    console.error('❌ Failed to initialize production compression:', error);
  }
}

async function compressionFormatComparison() {
  console.log('📊 Compression Format Comparison');
  
  const formats = ['gzip', 'brotli', 'zip'] as const;
  
  for (const format of formats) {
    try {
      console.log(`\n🧪 Testing ${format.toUpperCase()} compression...`);
      
      await init(compressionFormats[format]);
      console.log(`✅ ${format} compression initialized successfully`);
      
      // In a real scenario, you would process some data here
      console.log(`📦 Files will be compressed using ${format} format`);
      
    } catch (error) {
      console.error(`❌ Failed to initialize ${format} compression:`, error);
    }
  }
}

// ==========================================
// 🎯 COMPRESSION BEST PRACTICES
// ==========================================

function compressionBestPractices() {
  console.log(`
📦 COMPRESSION BEST PRACTICES

🎯 When to use compression:
- ✅ Large log files (>1KB)
- ✅ Production environments
- ✅ Cloud storage (reduces costs)
- ✅ Slow network connections

⚡ Compression format recommendations:
- 🟢 gzip: Fastest compression/decompression, good for real-time processing
- 🔵 brotli: Best compression ratio, ideal for storage and archival
- 🟡 zip: Universal compatibility, good for sharing files

🎛️ Compression level guidelines:
- Level 1-3: Fast compression, larger files
- Level 4-6: Balanced compression (recommended)
- Level 7-9: Maximum compression, slower processing

📏 File size thresholds:
- < 512 bytes: Usually not worth compressing
- 512-1024 bytes: Optional compression
- > 1KB: Recommended to compress

💡 Environment-specific settings:
- Development: Disabled (easier debugging)
- Staging: Moderate compression (level 4-6)
- Production: High compression (level 7-9)
  `);
}

// ==========================================
// 🏃‍♂️ RUN EXAMPLES
// ==========================================

async function runExamples() {
  console.log('🚀 Starting Compression Examples\n');
  
  // Show best practices
  compressionBestPractices();
  
  // Run examples based on environment
  const example = process.argv[2] || 'basic';
  
  switch (example) {
    case 'basic':
      await basicCompressionExample();
      break;
    case 'production':
      await productionCompressionExample();
      break;
    case 'compare':
      await compressionFormatComparison();
      break;
    default:
      console.log('Available examples: basic, production, compare');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export {
  basicCompressionConfig,
  productionCompressionConfig,
  developmentConfig,
  compressionFormats
};
