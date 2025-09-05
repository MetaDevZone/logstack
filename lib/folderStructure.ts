import path from 'path';
import { Config } from '../types/config';

export interface FolderStructureConfig {
  type?: 'daily' | 'monthly' | 'yearly';
  pattern?: string;
  subFolders?: {
    enabled?: boolean;
    byHour?: boolean;
    byStatus?: boolean;
    custom?: string[];
  };
  naming?: {
    dateFormat?: string;
    includeTime?: boolean;
    prefix?: string;
    suffix?: string;
  };
}

/**
 * Generate folder path based on configuration
 */
export function generateFolderPath(
  date: string, 
  config?: Config,
  hourRange?: string,
  status?: 'success' | 'failed' | 'pending'
): string {
  const folderConfig = config?.folderStructure || {};
  const outputDir = config?.outputDirectory || 'uploads';
  
  // Generate main folder path
  const mainFolder = generateMainFolderPath(date, folderConfig);
  
  // Generate sub-folders if enabled
  const subFolders = generateSubFolders(folderConfig, hourRange, status);
  
  // Combine all parts
  const fullPath = path.join(process.cwd(), outputDir, mainFolder, ...subFolders);
  
  return fullPath;
}

/**
 * Generate main folder path based on type and pattern
 */
function generateMainFolderPath(date: string, config: FolderStructureConfig): string {
  const dateObj = new Date(date);
  
  // If custom pattern is provided, use it
  if (config.pattern) {
    return formatDatePattern(dateObj, config.pattern, config.naming);
  }
  
  // Use type-based folder structure
  const type = config.type || 'daily';
  
  switch (type) {
    case 'daily':
      return formatDatePattern(dateObj, 'YYYY-MM-DD', config.naming);
    
    case 'monthly':
      return formatDatePattern(dateObj, 'YYYY-MM', config.naming);
    
    case 'yearly':
      return formatDatePattern(dateObj, 'YYYY', config.naming);
    
    default:
      return formatDatePattern(dateObj, 'YYYY-MM-DD', config.naming);
  }
}

/**
 * Generate sub-folders based on configuration
 */
function generateSubFolders(
  config: FolderStructureConfig,
  hourRange?: string,
  status?: string
): string[] {
  const subFolders: string[] = [];
  
  if (!config.subFolders?.enabled) {
    return subFolders;
  }
  
  // Add hour-based sub-folder
  if (config.subFolders.byHour && hourRange) {
    subFolders.push(`hour-${hourRange}`);
  }
  
  // Add status-based sub-folder
  if (config.subFolders.byStatus && status) {
    subFolders.push(status);
  }
  
  // Add custom sub-folders
  if (config.subFolders.custom) {
    subFolders.push(...config.subFolders.custom);
  }
  
  return subFolders;
}

/**
 * Format date according to pattern and naming configuration
 */
function formatDatePattern(
  date: Date, 
  pattern: string, 
  naming?: FolderStructureConfig['naming']
): string {
  let formatted = pattern;
  
  // Replace date placeholders
  formatted = formatted.replace('YYYY', date.getFullYear().toString());
  formatted = formatted.replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'));
  formatted = formatted.replace('DD', date.getDate().toString().padStart(2, '0'));
  formatted = formatted.replace('HH', date.getHours().toString().padStart(2, '0'));
  formatted = formatted.replace('mm', date.getMinutes().toString().padStart(2, '0'));
  formatted = formatted.replace('ss', date.getSeconds().toString().padStart(2, '0'));
  
  // Add time if requested
  if (naming?.includeTime) {
    const timeStr = `_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}`;
    formatted += timeStr;
  }
  
  // Add prefix and suffix
  if (naming?.prefix) {
    formatted = `${naming.prefix}_${formatted}`;
  }
  
  if (naming?.suffix) {
    formatted = `${formatted}_${naming.suffix}`;
  }
  
  return formatted;
}

/**
 * Get relative path for cloud storage
 */
export function generateCloudPath(
  date: string,
  fileName: string,
  config?: Config,
  hourRange?: string,
  status?: 'success' | 'failed' | 'pending'
): string {
  const folderConfig = config?.folderStructure || {};
  
  // Generate main folder path (without base directory)
  const mainFolder = generateMainFolderPath(date, folderConfig);
  
  // Generate sub-folders if enabled
  const subFolders = generateSubFolders(folderConfig, hourRange, status);
  
  // Combine for cloud path (use forward slashes for cloud storage)
  const cloudPath = [mainFolder, ...subFolders, fileName].join('/');
  
  return cloudPath;
}

/**
 * Create default folder structure configurations
 */
export function createFolderStructureConfig(type: 'simple' | 'organized' | 'detailed'): FolderStructureConfig {
  switch (type) {
    case 'simple':
      return {
        type: 'daily',
        subFolders: {
          enabled: false
        },
        naming: {
          dateFormat: 'YYYY-MM-DD'
        }
      };
    
    case 'organized':
      return {
        type: 'monthly',
        subFolders: {
          enabled: true,
          byHour: false,
          byStatus: false
        },
        naming: {
          dateFormat: 'YYYY-MM',
          prefix: 'logs'
        }
      };
    
    case 'detailed':
      return {
        type: 'daily',
        subFolders: {
          enabled: true,
          byHour: true,
          byStatus: true
        },
        naming: {
          dateFormat: 'YYYY-MM-DD',
          includeTime: false,
          prefix: 'data'
        }
      };
    
    default:
      return createFolderStructureConfig('simple');
  }
}

/**
 * Validate folder structure configuration
 */
export function validateFolderStructureConfig(config: FolderStructureConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate type
  if (config.type && !['daily', 'monthly', 'yearly'].includes(config.type)) {
    errors.push('Folder structure type must be one of: daily, monthly, yearly');
  }
  
  // Validate pattern
  if (config.pattern && typeof config.pattern !== 'string') {
    errors.push('Folder structure pattern must be a string');
  }
  
  // Validate sub-folders
  if (config.subFolders?.custom && !Array.isArray(config.subFolders.custom)) {
    errors.push('Custom sub-folders must be an array of strings');
  }
  
  // Validate naming
  if (config.naming?.dateFormat && typeof config.naming.dateFormat !== 'string') {
    errors.push('Date format must be a string');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get example folder structures
 */
export function getFolderStructureExamples(): { [key: string]: { config: FolderStructureConfig; example: string } } {
  const date = '2024-01-15';
  const hourRange = '14-15';
  const fileName = 'api_logs_2024-01-15_14-15.json';
  
  return {
    'Daily Structure': {
      config: {
        type: 'daily',
        subFolders: { enabled: false }
      },
      example: `uploads/2024-01-15/${fileName}`
    },
    
    'Monthly Structure': {
      config: {
        type: 'monthly',
        subFolders: { enabled: false }
      },
      example: `uploads/2024-01/${fileName}`
    },
    
    'Yearly Structure': {
      config: {
        type: 'yearly',
        subFolders: { enabled: false }
      },
      example: `uploads/2024/${fileName}`
    },
    
    'Daily with Hour Sub-folders': {
      config: {
        type: 'daily',
        subFolders: { enabled: true, byHour: true }
      },
      example: `uploads/2024-01-15/hour-14-15/${fileName}`
    },
    
    'Monthly with Status Sub-folders': {
      config: {
        type: 'monthly',
        subFolders: { enabled: true, byStatus: true }
      },
      example: `uploads/2024-01/success/${fileName}`
    },
    
    'Custom Pattern': {
      config: {
        pattern: 'YYYY/MM/DD',
        subFolders: { enabled: false }
      },
      example: `uploads/2024/01/15/${fileName}`
    },
    
    'Prefixed with Sub-folders': {
      config: {
        type: 'daily',
        naming: { prefix: 'logs', suffix: 'data' },
        subFolders: { enabled: true, byHour: true, byStatus: true }
      },
      example: `uploads/logs_2024-01-15_data/hour-14-15/success/${fileName}`
    },
    
    'Custom Sub-folders': {
      config: {
        type: 'monthly',
        subFolders: { 
          enabled: true, 
          custom: ['processed', 'api-logs'] 
        }
      },
      example: `uploads/2024-01/processed/api-logs/${fileName}`
    }
  };
}
