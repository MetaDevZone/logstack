import { ApiLogModel, getApiLogModel } from '../models/apiLog';
import { Config } from '../types/config';
import { Request, Response } from 'express';

export interface ApiLogData {
  request_time?: Date;
  response_time?: Date;
  method: string;
  path: string;
  requestBody?: any;
  requestHeaders?: any;
  responseStatus?: any;
  requestQuery?: any;
  requestParams?: any;
  client_ip?: string;
  client_agent?: string;
  responseBody?: any;
}

export async function saveApiLog(logData: ApiLogData, config?: Config) {
  try {
    const collectionName = config?.collections?.apiLogsCollectionName || 'apilogs';
    const ApiLogModelInstance = getApiLogModel(collectionName);
    const apiLog = new ApiLogModelInstance(logData);
    await apiLog.save();
    return apiLog;
  } catch (error) {
    console.error('Error saving API log:', error);
    throw error;
  }
}

export async function getApiLogs(filters?: {
  startDate?: Date;
  endDate?: Date;
  method?: string;
  path?: string;
  client_ip?: string;
  limit?: number;
  skip?: number;
}, config?: Config) {
  try {
    const collectionName = config?.collections?.apiLogsCollectionName || 'apilogs';
    const ApiLogModelInstance = getApiLogModel(collectionName);
    
    const query: any = {};
    
    if (filters?.startDate || filters?.endDate) {
      query.request_time = {};
      if (filters.startDate) query.request_time.$gte = filters.startDate;
      if (filters.endDate) query.request_time.$lte = filters.endDate;
    }
    
    if (filters?.method) query.method = filters.method;
    if (filters?.path) query.path = new RegExp(filters.path, 'i');
    if (filters?.client_ip) query.client_ip = filters.client_ip;

    const logs = await ApiLogModelInstance.find(query)
      .sort({ request_time: -1 })
      .limit(filters?.limit || 100)
      .skip(filters?.skip || 0);
    
    return logs;
  } catch (error) {
    console.error('Error fetching API logs:', error);
    throw error;
  }
}

export function createApiLogMiddleware(config?: Config) {
  return (req: Request, res: Response, next: Function) => {
    const startTime = new Date();
    
    // Store original res.json and res.send methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    let responseBody: any;
    
    // Override res.json to capture response body
    res.json = function(body: any) {
      responseBody = body;
      return originalJson.call(this, body);
    };
    
    // Override res.send to capture response body
    res.send = function(body: any) {
      if (!responseBody) responseBody = body;
      return originalSend.call(this, body);
    };
    
    // Log the request when response finishes
    res.on('finish', async () => {
      const endTime = new Date();
      
      const logData: ApiLogData = {
        request_time: startTime,
        response_time: endTime,
        method: req.method,
        path: req.path,
        requestBody: req.body,
        requestHeaders: req.headers,
        responseStatus: res.statusCode,
        requestQuery: req.query,
        requestParams: req.params,
        client_ip: req.ip || req.connection.remoteAddress || '',
        client_agent: req.get('User-Agent') || '',
        responseBody: responseBody,
      };
      
      try {
        await saveApiLog(logData, config);
      } catch (error) {
        console.error('Failed to save API log:', error);
      }
    });
    
    next();
  };
}

export async function getApiLogsByHour(date: string, hourRange: string, config?: Config) {
  try {
    const collectionName = config?.collections?.apiLogsCollectionName || 'apilogs';
    const ApiLogModelInstance = getApiLogModel(collectionName);
    
    const [startHour] = hourRange.split('-').map(h => parseInt(h));
    const startDate = new Date(`${date}T${startHour.toString().padStart(2, '0')}:00:00.000Z`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
    
    const logs = await ApiLogModelInstance.find({
      request_time: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort({ request_time: 1 });
    
    return logs;
  } catch (error) {
    console.error('Error fetching API logs by hour:', error);
    throw error;
  }
}
