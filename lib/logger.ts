import winston from 'winston';
import { Config } from '../types/config';

let logger: winston.Logger;

export function initLogger(config: Config) {
  const logConfig = config.logging || {
    level: 'info' as const,
    enableConsole: true,
    enableFile: false
  };
  const transports: winston.transport[] = [];

  if (logConfig.enableConsole !== false) {
    transports.push(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }));
  }

  if (logConfig.enableFile) {
    transports.push(new winston.transports.File({
      filename: logConfig.logFilePath || 'cron-log-service.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }));
  }

  logger = winston.createLogger({
    level: logConfig.level || 'info',
    transports,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  });

  return logger;
}

export function getLogger(): winston.Logger {
  if (!logger) {
    // Initialize with default config if not already initialized
    logger = winston.createLogger({
      level: 'info',
      transports: [new winston.transports.Console()]
    });
  }
  return logger;
}
