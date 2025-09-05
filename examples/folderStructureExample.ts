/**
 * 📁 Folder Structure Configuration Example
 * 
 * This example demonstrates how to configure folder structures for the logstack package.
 * You can organize files by daily, monthly, yearly folders with custom sub-folders.
 */

import { init, createDailyJobs } from '../src/main';
import { Config } from '../types/config';
import { createFolderStructureConfig, getFolderStructureExamples } from '../lib/folderStructure';

// ==========================================
// 🎯 FOLDER STRUCTURE CONFIGURATION OPTIONS
// ==========================================

// Simple daily structure (default)
const dailyStructureConfig: Config = {
  dbUri: 'mongodb://localhost:27017/logstack',
  uploadProvider: 'local',
  outputDirectory: 'logs',
  
  // 📁 Simple daily folders
  folderStructure: {
    type: 'daily', // Creates folders like: 2024-01-15
    subFolders: {
      enabled: false
    }
  }
};

// Monthly organization
const monthlyStructureConfig: Config = {
  dbUri: 'mongodb://localhost:27017/logstack',
  uploadProvider: 'local',
  outputDirectory: 'monthly-logs',
  
  // 📁 Monthly folders with sub-organization
  folderStructure: {
    type: 'monthly', // Creates folders like: 2024-01
    subFolders: {
      enabled: true,
      byHour: false,
      byStatus: false
    },
    naming: {
      prefix: 'logs',
      suffix: 'data'
    }
  }
};

// Yearly structure with detailed organization
const yearlyStructureConfig: Config = {
  dbUri: 'mongodb://localhost:27017/logstack',
  uploadProvider: 'local',
  outputDirectory: 'yearly-archive',
  
  // 📁 Yearly folders with detailed sub-folders
  folderStructure: {
    type: 'yearly', // Creates folders like: 2024
    subFolders: {
      enabled: true,
      byHour: true, // Creates hour-14-15 sub-folders
      byStatus: true, // Creates success/failed sub-folders
      custom: ['processed', 'api-logs'] // Custom sub-folders
    },
    naming: {
      dateFormat: 'YYYY',
      prefix: 'archive'
    }
  }
};

// Custom pattern structure
const customPatternConfig: Config = {
  dbUri: 'mongodb://localhost:27017/logstack',
  uploadProvider: 'local',
  outputDirectory: 'custom-structure',
  
  // 📁 Custom folder pattern
  folderStructure: {
    pattern: 'YYYY/MM/DD', // Creates nested folders: 2024/01/15
    subFolders: {
      enabled: true,
      byHour: true
    },
    naming: {
      includeTime: false
    }
  }
};

// Highly organized structure for production
const productionStructureConfig: Config = {
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/logstack-prod',
  uploadProvider: 's3',
  
  // 📁 Production-grade organization
  folderStructure: {
    type: 'daily',
    subFolders: {
      enabled: true,
      byHour: true, // Separate folder for each hour
      byStatus: true, // Separate success/failed folders
      custom: ['processed', 'validated'] // Custom processing stages
    },
    naming: {
      dateFormat: 'YYYY-MM-DD',
      prefix: 'prod-logs',
      includeTime: false
    }
  },
  
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'logstack-organized-files'
  }
};

// Development structure (simple and clean)
const developmentStructureConfig: Config = {
  dbUri: 'mongodb://localhost:27017/logstack-dev',
  uploadProvider: 'local',
  outputDirectory: 'dev-logs',
  
  // 📁 Simple development structure
  folderStructure: {
    type: 'daily',
    subFolders: {
      enabled: true,
      byHour: true, // Helpful for debugging specific hours
      byStatus: false,
      custom: ['debug'] // Mark as debug files
    },
    naming: {
      prefix: 'dev',
      suffix: 'debug'
    }
  }
};

// ==========================================
// 🚀 USAGE EXAMPLES
// ==========================================

async function dailyStructureExample() {
  console.log('📁 Daily Folder Structure Example\n');
  
  try {
    await init(dailyStructureConfig);
    console.log('✅ Service initialized with daily folder structure');
    console.log('📝 Files will be organized as: logs/2024-01-15/api_logs_2024-01-15_14-15.json');
    
    await createDailyJobs();
    console.log('🔄 Daily jobs created - files will be organized by date');
    
  } catch (error) {
    console.error('❌ Failed to initialize daily structure:', error);
  }
}

async function monthlyStructureExample() {
  console.log('📁 Monthly Folder Structure Example\n');
  
  try {
    await init(monthlyStructureConfig);
    console.log('✅ Service initialized with monthly folder structure');
    console.log('📝 Files will be organized as: monthly-logs/logs_2024-01_data/api_logs_2024-01-15_14-15.json');
    
    await createDailyJobs();
    console.log('🔄 Monthly organization active');
    
  } catch (error) {
    console.error('❌ Failed to initialize monthly structure:', error);
  }
}

async function customPatternExample() {
  console.log('📁 Custom Pattern Structure Example\n');
  
  try {
    await init(customPatternConfig);
    console.log('✅ Service initialized with custom pattern structure');
    console.log('📝 Files will be organized as: custom-structure/2024/01/15/hour-14-15/api_logs_2024-01-15_14-15.json');
    
    await createDailyJobs();
    console.log('🔄 Custom pattern organization active');
    
  } catch (error) {
    console.error('❌ Failed to initialize custom pattern:', error);
  }
}

async function productionStructureExample() {
  console.log('📁 Production Structure Example\n');
  
  try {
    await init(productionStructureConfig);
    console.log('✅ Service initialized with production-grade folder structure');
    console.log('📝 Files will be organized as: prod-logs_2024-01-15/hour-14-15/success/processed/validated/file.json');
    console.log('☁️ Files will be uploaded to S3 with organized structure');
    
    await createDailyJobs();
    console.log('🔄 Production organization active');
    
  } catch (error) {
    console.error('❌ Failed to initialize production structure:', error);
  }
}

function demonstrateFolderStructures() {
  console.log('📁 Folder Structure Examples\n');
  
  const examples = getFolderStructureExamples();
  
  console.log('📋 Available folder structure patterns:');
  console.log('═'.repeat(60));
  
  Object.entries(examples).forEach(([name, { config, example }]) => {
    console.log(`\n🎯 ${name}:`);
    console.log(`   Config: ${JSON.stringify(config, null, 2).split('\n').slice(1, -1).join('\n   ')}`);
    console.log(`   Example: ${example}`);
  });
  
  console.log('\n═'.repeat(60));
}

// ==========================================
// 🎯 FOLDER STRUCTURE TEMPLATES
// ==========================================

function folderStructureTemplates() {
  console.log(`
📁 FOLDER STRUCTURE TEMPLATES

🎯 Common Use Cases:

📅 DAILY ORGANIZATION (Default)
  Structure: uploads/2024-01-15/file.json
  Best for: Small to medium datasets, daily processing
  
  folderStructure: {
    type: 'daily'
  }

📆 MONTHLY ORGANIZATION
  Structure: uploads/2024-01/file.json
  Best for: Large datasets, monthly reporting
  
  folderStructure: {
    type: 'monthly'
  }

📊 YEARLY ARCHIVE
  Structure: uploads/2024/file.json
  Best for: Long-term archival, compliance storage
  
  folderStructure: {
    type: 'yearly'
  }

🕐 HOURLY SUB-FOLDERS
  Structure: uploads/2024-01-15/hour-14-15/file.json
  Best for: High-frequency processing, debugging
  
  folderStructure: {
    type: 'daily',
    subFolders: { enabled: true, byHour: true }
  }

✅ STATUS SUB-FOLDERS
  Structure: uploads/2024-01-15/success/file.json
  Best for: Quality control, error tracking
  
  folderStructure: {
    type: 'daily',
    subFolders: { enabled: true, byStatus: true }
  }

🎨 CUSTOM PATTERN
  Structure: uploads/2024/01/15/file.json
  Best for: Specific organizational requirements
  
  folderStructure: {
    pattern: 'YYYY/MM/DD'
  }

🏷️ PREFIXED FOLDERS
  Structure: uploads/logs_2024-01-15_data/file.json
  Best for: Multi-tenant systems, environment separation
  
  folderStructure: {
    type: 'daily',
    naming: { prefix: 'logs', suffix: 'data' }
  }

📁 CUSTOM SUB-FOLDERS
  Structure: uploads/2024-01-15/processed/validated/file.json
  Best for: Multi-stage processing pipelines
  
  folderStructure: {
    type: 'daily',
    subFolders: { 
      enabled: true, 
      custom: ['processed', 'validated'] 
    }
  }
  `);
}

// ==========================================
// 🎛️ ENVIRONMENT-SPECIFIC CONFIGURATIONS
// ==========================================

function getEnvironmentConfigs() {
  return {
    development: {
      ...developmentStructureConfig,
      folderStructure: createFolderStructureConfig('simple')
    },
    
    staging: {
      ...dailyStructureConfig,
      folderStructure: createFolderStructureConfig('organized')
    },
    
    production: {
      ...productionStructureConfig,
      folderStructure: createFolderStructureConfig('detailed')
    }
  };
}

async function environmentStructureExample() {
  console.log('🌍 Environment-Specific Folder Structures\n');
  
  const environment = (process.env.NODE_ENV || 'development') as keyof ReturnType<typeof getEnvironmentConfigs>;
  const configs = getEnvironmentConfigs();
  const config = configs[environment];
  
  console.log(`🎯 Running in ${environment} mode`);
  
  try {
    await init(config);
    console.log(`✅ Service initialized with ${environment} folder structure`);
    
    // Show what the structure will look like
    const structureType = config.folderStructure?.type || 'daily';
    const hasSubFolders = config.folderStructure?.subFolders?.enabled;
    const hasHourFolders = config.folderStructure?.subFolders?.byHour;
    const hasStatusFolders = config.folderStructure?.subFolders?.byStatus;
    
    console.log('\n📊 Structure details:');
    console.log(`- Type: ${structureType}`);
    console.log(`- Sub-folders: ${hasSubFolders ? 'Enabled' : 'Disabled'}`);
    console.log(`- Hour folders: ${hasHourFolders ? 'Yes' : 'No'}`);
    console.log(`- Status folders: ${hasStatusFolders ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error(`❌ Failed to initialize ${environment} structure:`, error);
  }
}

// ==========================================
// 🏃‍♂️ RUN EXAMPLES
// ==========================================

async function runExamples() {
  console.log('🚀 Starting Folder Structure Examples\n');
  
  // Show templates and patterns
  folderStructureTemplates();
  
  // Demonstrate different structures
  demonstrateFolderStructures();
  
  // Run examples based on command line argument
  const example = process.argv[2] || 'daily';
  
  switch (example) {
    case 'daily':
      await dailyStructureExample();
      break;
    case 'monthly':
      await monthlyStructureExample();
      break;
    case 'custom':
      await customPatternExample();
      break;
    case 'production':
      await productionStructureExample();
      break;
    case 'environment':
      await environmentStructureExample();
      break;
    case 'demo':
      demonstrateFolderStructures();
      break;
    default:
      console.log('Available examples: daily, monthly, custom, production, environment, demo');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export {
  dailyStructureConfig,
  monthlyStructureConfig,
  yearlyStructureConfig,
  customPatternConfig,
  productionStructureConfig,
  developmentStructureConfig
};
