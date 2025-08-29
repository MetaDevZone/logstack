import mongoose, { Schema, Document } from 'mongoose';

export interface ApiLog extends Document {
  request_time: Date;
  response_time: Date;
  method: string;
  path: string;
  requestBody: any;
  requestHeaders: any;
  responseStatus: any;
  requestQuery: any;
  requestParams: any;
  client_ip: string;
  client_agent: string;
  responseBody: any;
}

const apiLogSchema = new mongoose.Schema(
  {
    request_time: {
      type: Date,
      default: Date.now,
      index: true, // Index on timestamp for efficient querying
    },

    response_time: {
      type: Date,
      default: Date.now,
      index: true, // Index on timestamp for efficient querying
    },
    method: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      index: true, // Index on path for efficient querying
    },
    requestBody: {},
    requestHeaders: {},
    responseStatus: {},
    requestQuery: {},
    requestParams: {},
    client_ip: {
      type: String,
      default: "",
    },

    client_agent: {
      type: String,
      default: "",
    },

    responseBody: {},
  },
  {
    timestamps: true,
  }
);

export const ApiLogModel = mongoose.model<ApiLog>('ApiLog', apiLogSchema);

// Dynamic model creation function for custom collection names
export function getApiLogModel(collectionName: string = 'apilogs') {
  try {
    // Check if model already exists
    return mongoose.model<ApiLog>(collectionName);
  } catch (error) {
    // Model doesn't exist, create it
    return mongoose.model<ApiLog>(collectionName, apiLogSchema, collectionName);
  }
}
