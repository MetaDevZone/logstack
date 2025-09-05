import { Config } from '../types/config';

// Sensitive data patterns for masking
const SENSITIVE_PATTERNS = {
  // Password fields
  password: /password/i,
  passwd: /passwd/i,
  pwd: /pwd/i,
  
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Credit card numbers (various formats)
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  
  // Phone numbers (US and international formats)
  phone: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
  
  // Social Security Numbers
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
  
  // API keys and tokens (common patterns)
  apiKey: /\b[A-Za-z0-9]{32,}\b/g,
  jwt: /\beyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\b/g,
  
  // IP addresses (when configured as sensitive)
  ipAddress: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
  
  // Database connection strings
  connectionString: /(mongodb|postgresql|mysql|redis):\/\/[^\/\s]+/gi
};

// Field names that should be masked (case insensitive)
const SENSITIVE_FIELD_NAMES = [
  'password', 'passwd', 'pwd', 'secret', 'token', 'key', 'auth',
  'credit_card', 'creditcard', 'ccnum', 'card_number',
  'ssn', 'social_security', 'social_security_number',
  'phone', 'phone_number', 'mobile', 'telephone',
  'email', 'email_address', 'mail',
  'api_key', 'apikey', 'access_key', 'secret_key',
  'jwt', 'bearer', 'authorization',
  'pin', 'cvv', 'cvc', 'security_code'
];

export interface MaskingConfig {
  enabled?: boolean; // Enable data masking (default: true)
  maskingChar?: string; // Character to use for masking (default: '*')
  preserveLength?: boolean; // Preserve original field length (default: false)
  showLastChars?: number; // Show last N characters (default: 0)
  customPatterns?: { [key: string]: RegExp }; // Custom patterns to mask
  customFields?: string[]; // Custom field names to mask
  exemptFields?: string[]; // Fields to exclude from masking
  maskEmails?: boolean; // Mask email addresses (default: true)
  maskIPs?: boolean; // Mask IP addresses (default: false)
  maskConnectionStrings?: boolean; // Mask database connection strings (default: true)
}

/**
 * Mask sensitive data in API logs and other data
 */
export function maskSensitiveData(data: any, config?: MaskingConfig): any {
  const maskingConfig: Required<MaskingConfig> = {
    enabled: true,
    maskingChar: '*',
    preserveLength: false,
    showLastChars: 0,
    customPatterns: {},
    customFields: [],
    exemptFields: [],
    maskEmails: true,
    maskIPs: false,
    maskConnectionStrings: true,
    ...config
  };

  if (!maskingConfig.enabled) {
    return data;
  }

  if (typeof data === 'string') {
    return maskString(data, maskingConfig);
  }

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item, config));
  }

  if (typeof data === 'object' && data !== null) {
    return maskObject(data, maskingConfig);
  }

  return data;
}

/**
 * Mask sensitive patterns in a string
 */
function maskString(str: string, config: Required<MaskingConfig>): string {
  let maskedStr = str;

  // Apply built-in patterns
  if (config.maskEmails) {
    maskedStr = maskedStr.replace(SENSITIVE_PATTERNS.email, (match) => 
      maskValue(match, config)
    );
  }

  if (config.maskIPs) {
    maskedStr = maskedStr.replace(SENSITIVE_PATTERNS.ipAddress, (match) => 
      maskValue(match, config)
    );
  }

  if (config.maskConnectionStrings) {
    maskedStr = maskedStr.replace(SENSITIVE_PATTERNS.connectionString, (match) => 
      maskValue(match, config)
    );
  }

  // Apply credit card masking
  maskedStr = maskedStr.replace(SENSITIVE_PATTERNS.creditCard, (match) => 
    maskValue(match, config)
  );

  // Apply phone number masking
  maskedStr = maskedStr.replace(SENSITIVE_PATTERNS.phone, (match) => 
    maskValue(match, config)
  );

  // Apply SSN masking
  maskedStr = maskedStr.replace(SENSITIVE_PATTERNS.ssn, (match) => 
    maskValue(match, config)
  );

  // Apply JWT token masking
  maskedStr = maskedStr.replace(SENSITIVE_PATTERNS.jwt, (match) => 
    maskValue(match, config)
  );

  // Apply API key masking
  maskedStr = maskedStr.replace(SENSITIVE_PATTERNS.apiKey, (match) => 
    maskValue(match, config)
  );

  // Apply custom patterns
  Object.entries(config.customPatterns).forEach(([name, pattern]) => {
    maskedStr = maskedStr.replace(pattern, (match) => 
      maskValue(match, config)
    );
  });

  return maskedStr;
}

/**
 * Mask sensitive fields in an object
 */
function maskObject(obj: any, config: Required<MaskingConfig>): any {
  const masked: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // Check if field should be exempted
    if (config.exemptFields.some(field => 
      lowerKey.includes(field.toLowerCase())
    )) {
      masked[key] = value;
      continue;
    }

    // Check if field is sensitive
    const isSensitiveField = 
      SENSITIVE_FIELD_NAMES.some(fieldName => 
        lowerKey.includes(fieldName.toLowerCase())
      ) ||
      config.customFields.some(fieldName => 
        lowerKey.includes(fieldName.toLowerCase())
      );

    if (isSensitiveField) {
      masked[key] = typeof value === 'string' 
        ? maskValue(value, config)
        : '[MASKED]';
    } else {
      // Recursively mask nested objects and arrays
      masked[key] = maskSensitiveData(value, config);
    }
  }

  return masked;
}

/**
 * Mask a single value
 */
function maskValue(value: string, config: Required<MaskingConfig>): string {
  if (!value) return value;

  const { maskingChar, preserveLength, showLastChars } = config;

  if (preserveLength) {
    if (showLastChars > 0 && value.length > showLastChars) {
      const maskedPart = maskingChar.repeat(value.length - showLastChars);
      const visiblePart = value.slice(-showLastChars);
      return maskedPart + visiblePart;
    }
    return maskingChar.repeat(value.length);
  }

  if (showLastChars > 0 && value.length > showLastChars) {
    const visiblePart = value.slice(-showLastChars);
    return '[MASKED]' + visiblePart;
  }

  return '[MASKED]';
}

/**
 * Create a masking configuration for different environments
 */
export function createMaskingConfig(environment: 'development' | 'staging' | 'production'): MaskingConfig {
  const baseConfig: MaskingConfig = {
    enabled: true,
    maskingChar: '*',
    preserveLength: false,
    showLastChars: 0,
    maskEmails: true,
    maskIPs: false,
    maskConnectionStrings: true
  };

  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        enabled: false, // Disable masking in development for easier debugging
        maskIPs: false
      };

    case 'staging':
      return {
        ...baseConfig,
        enabled: true,
        showLastChars: 4, // Show last 4 characters for debugging
        maskIPs: false
      };

    case 'production':
      return {
        ...baseConfig,
        enabled: true,
        showLastChars: 0, // Full masking in production
        maskIPs: true, // Mask IPs in production for privacy
        preserveLength: false
      };

    default:
      return baseConfig;
  }
}

/**
 * Validate masking configuration
 */
export function validateMaskingConfig(config: MaskingConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.showLastChars && config.showLastChars < 0) {
    errors.push('showLastChars must be non-negative');
  }

  if (config.maskingChar && config.maskingChar.length !== 1) {
    errors.push('maskingChar must be a single character');
  }

  if (config.customPatterns) {
    Object.entries(config.customPatterns).forEach(([name, pattern]) => {
      if (!(pattern instanceof RegExp)) {
        errors.push(`Custom pattern '${name}' must be a RegExp`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
