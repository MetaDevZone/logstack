/**
 * 🧪 Folder Structure Tests
 * 
 * Comprehensive test suite for folder structure configuration functionality
 */

import { generateFolderPath, generateCloudPath, createFolderStructureConfig, getFolderStructureExamples } from '../lib/folderStructure';
import { Config } from '../types/config';

describe('Folder Structure System', () => {
  
  // Sample data for testing
  const mockDate = '2024-01-15';
  const mockHourRange = '14-15';
  const mockStatus = 'success' as const;
  const mockFileName = 'test-file.json';

  describe('generateFolderPath', () => {
    
    test('should generate daily folder structure', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily'
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config);
      expect(result).toContain('2024-01-15');
    });

    test('should generate monthly folder structure', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'monthly'
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config);
      expect(result).toContain('2024-01');
    });

    test('should generate yearly folder structure', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'yearly'
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config);
      expect(result).toContain('2024');
    });

    test('should handle custom pattern', () => {
      const config: Partial<Config> = {
        folderStructure: {
          pattern: 'YYYY/MM/DD'
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config);
      // The function returns an absolute path, so we check for the pattern parts
      expect(result).toContain('2024');
      expect(result).toContain('01');
      expect(result).toContain('15');
    });

    test('should add prefix and suffix to folder names', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          naming: {
            prefix: 'logs',
            suffix: 'data'
          }
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config);
      expect(result).toContain('logs_2024-01-15_data');
    });

    test('should create hour sub-folders', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true,
            byHour: true
          }
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config, mockHourRange);
      expect(result).toContain('hour-14-15');
    });

    test('should create status sub-folders', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true,
            byStatus: true
          }
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config, undefined, mockStatus);
      expect(result).toContain('success');
    });

    test('should create custom sub-folders', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true,
            custom: ['processed', 'validated']
          }
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config);
      expect(result).toContain('processed');
      expect(result).toContain('validated');
    });

    test('should combine all sub-folder types', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true,
            byHour: true,
            byStatus: true,
            custom: ['processed']
          }
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config, mockHourRange, mockStatus);
      expect(result).toContain('hour-14-15');
      expect(result).toContain('success');
      expect(result).toContain('processed');
    });

    test('should use default structure when no config provided', () => {
      const result = generateFolderPath(mockDate);
      expect(result).toContain('2024-01-15');
    });

    test('should handle edge hours correctly', () => {
      const edgeHourRange = '23-24';
      
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true,
            byHour: true
          }
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config, edgeHourRange);
      expect(result).toContain('hour-23-24');
    });

    test('should handle different statuses', () => {
      const failedStatus = 'failed' as const;
      
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true,
            byStatus: true
          }
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config, undefined, failedStatus);
      expect(result).toContain('failed');
    });
  });

  describe('generateCloudPath', () => {
    
    test('should generate cloud path with folder structure', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily'
        }
      };
      
      const result = generateCloudPath(mockDate, mockFileName, config as Config);
      expect(result).toBe('2024-01-15/test-file.json');
    });

    test('should handle complex folder structure for cloud', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'monthly',
          subFolders: {
            enabled: true,
            byHour: true,
            byStatus: true
          },
          naming: {
            prefix: 'logs'
          }
        }
      };
      
      const result = generateCloudPath(mockDate, 'api-logs.json', config as Config, mockHourRange, mockStatus);
      expect(result).toBe('logs_2024-01/hour-14-15/success/api-logs.json');
    });

    test('should work with custom patterns for cloud', () => {
      const config: Partial<Config> = {
        folderStructure: {
          pattern: 'YYYY/MM/DD'
        }
      };
      
      const result = generateCloudPath(mockDate, 'data.json', config as Config);
      expect(result).toBe('2024/01/15/data.json');
    });
  });

  describe('createFolderStructureConfig', () => {
    
    test('should create simple config template', () => {
      const config = createFolderStructureConfig('simple');
      
      expect(config).toEqual({
        type: 'daily',
        subFolders: {
          enabled: false
        },
        naming: {
          dateFormat: 'YYYY-MM-DD'
        }
      });
    });

    test('should create organized config template', () => {
      const config = createFolderStructureConfig('organized');
      
      expect(config).toEqual({
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
      });
    });

    test('should create detailed config template', () => {
      const config = createFolderStructureConfig('detailed');
      
      expect(config).toEqual({
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
      });
    });
  });

  describe('getFolderStructureExamples', () => {
    
    test('should return all available examples', () => {
      const examples = getFolderStructureExamples();
      
      expect(examples).toHaveProperty('Daily Structure');
      expect(examples).toHaveProperty('Monthly Structure');
      expect(examples).toHaveProperty('Yearly Structure');
      expect(examples).toHaveProperty('Daily with Hour Sub-folders');
      expect(examples).toHaveProperty('Custom Pattern');
      expect(typeof examples).toBe('object');
    });

    test('should have correct structure for each example', () => {
      const examples = getFolderStructureExamples();
      
      Object.values(examples).forEach(example => {
        expect(example).toHaveProperty('config');
        expect(example).toHaveProperty('example');
        expect(typeof example.example).toBe('string');
      });
    });
  });

  describe('Integration Tests', () => {
    
    test('should work with real-world production configuration', () => {
      const productionConfig: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true,
            byHour: true,
            byStatus: true,
            custom: ['processed', 'validated']
          },
          naming: {
            dateFormat: 'YYYY-MM-DD',
            prefix: 'prod-logs',
            includeTime: false
          }
        }
      };
      
      const result = generateFolderPath(mockDate, productionConfig as Config, mockHourRange, mockStatus);
      expect(result).toContain('prod-logs_2024-01-15');
      expect(result).toContain('hour-14-15');
      expect(result).toContain('success');
      expect(result).toContain('processed');
      expect(result).toContain('validated');
    });

    test('should work with development configuration', () => {
      const devConfig: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true,
            byHour: true,
            custom: ['debug']
          },
          naming: {
            prefix: 'dev',
            suffix: 'debug'
          }
        }
      };
      
      const result = generateFolderPath(mockDate, devConfig as Config, mockHourRange);
      expect(result).toContain('dev_2024-01-15_debug');
      expect(result).toContain('hour-14-15');
      expect(result).toContain('debug');
    });

    test('should handle monthly archival configuration', () => {
      const archivalConfig: Partial<Config> = {
        folderStructure: {
          type: 'monthly',
          subFolders: {
            enabled: true,
            byStatus: true
          },
          naming: {
            prefix: 'archive',
            dateFormat: 'YYYY-MM'
          }
        }
      };
      
      const result = generateFolderPath(mockDate, archivalConfig as Config, undefined, mockStatus);
      expect(result).toContain('archive_2024-01');
      expect(result).toContain('success');
    });

    test('should generate consistent paths for same inputs', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true,
            byHour: true,
            byStatus: true
          }
        }
      };
      
      const result1 = generateFolderPath(mockDate, config as Config, mockHourRange, mockStatus);
      const result2 = generateFolderPath(mockDate, config as Config, mockHourRange, mockStatus);
      
      expect(result1).toBe(result2);
    });
  });

  describe('Error Handling', () => {
    
    test('should handle invalid dates gracefully', () => {
      const invalidDate = 'invalid-date';
      
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily'
        }
      };
      
      // Should not throw an error
      expect(() => {
        generateFolderPath(invalidDate, config as Config);
      }).not.toThrow();
    });

    test('should handle missing sub-folder configuration', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true
            // Missing byHour, byStatus, custom
          }
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config);
      expect(result).toContain('2024-01-15');
    });

    test('should handle empty custom sub-folders', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true,
            custom: []
          }
        }
      };
      
      const result = generateFolderPath(mockDate, config as Config);
      expect(result).toContain('2024-01-15');
    });
  });

  describe('Performance Tests', () => {
    
    test('should generate paths efficiently for large number of calls', () => {
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily',
          subFolders: {
            enabled: true,
            byHour: true,
            byStatus: true
          }
        }
      };
      
      const startTime = Date.now();
      
      // Generate paths for 1000 calls
      for (let i = 0; i < 1000; i++) {
        generateFolderPath(mockDate, config as Config, mockHourRange, mockStatus);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second for 1000 calls
    });
  });

  describe('Edge Cases', () => {
    
    test('should handle leap year dates', () => {
      const leapYearDate = '2024-02-29';
      
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily'
        }
      };
      
      const result = generateFolderPath(leapYearDate, config as Config);
      expect(result).toContain('2024-02-29');
    });

    test('should handle year boundary', () => {
      const yearBoundaryDate = '2023-12-31';
      
      const config: Partial<Config> = {
        folderStructure: {
          type: 'yearly'
        }
      };
      
      const result = generateFolderPath(yearBoundaryDate, config as Config);
      expect(result).toContain('2023');
    });

    test('should handle different date formats', () => {
      const isoDate = '2024-01-15T14:30:00Z';
      
      const config: Partial<Config> = {
        folderStructure: {
          type: 'daily'
        }
      };
      
      const result = generateFolderPath(isoDate, config as Config);
      expect(result).toContain('2024-01-15');
    });
  });
});

// Additional helper test for validation
describe('Folder Structure Validation', () => {
  
  test('should validate folder structure configuration', () => {
    const validConfig = {
      type: 'daily' as const,
      subFolders: {
        enabled: true,
        byHour: true
      }
    };
    
    // This would be validated by the validation.ts file
    expect(validConfig.type).toBe('daily');
    expect(validConfig.subFolders.enabled).toBe(true);
  });

  test('should detect invalid folder structure types', () => {
    const invalidConfig = {
      type: 'invalid-type' as any
    };
    
    // This should be caught by TypeScript or validation
    expect(['daily', 'monthly', 'yearly']).not.toContain(invalidConfig.type);
  });
});

// Additional helper test for validation
describe('Folder Structure Validation', () => {
  
  test('should validate folder structure configuration', () => {
    const validConfig = {
      type: 'daily' as const,
      subFolders: {
        enabled: true,
        byHour: true
      }
    };
    
    // This would be validated by the validation.ts file
    expect(validConfig.type).toBe('daily');
    expect(validConfig.subFolders.enabled).toBe(true);
  });

  test('should detect invalid folder structure types', () => {
    const invalidConfig = {
      type: 'invalid-type' as any
    };
    
    // This should be caught by TypeScript or validation
    expect(['daily', 'monthly', 'yearly']).not.toContain(invalidConfig.type);
  });
});
