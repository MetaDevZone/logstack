import mongoose, { Schema, Document } from 'mongoose';

export interface Log extends Document {
  job_id: any;
  timestamp: Date;
  action: string;
  error_message: string;
}

const LogSchema = new Schema({
  job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  timestamp: { type: Date, required: true },
  action: { type: String, required: true },
  error_message: { type: String, default: '' },
});

// Create a function to get the Log model with custom collection name
export function getLogModel(collectionName: string = 'logs') {
  // Check if model already exists to avoid re-compilation
  if (mongoose.models[`Log_${collectionName}`]) {
    return mongoose.models[`Log_${collectionName}`] as mongoose.Model<Log>;
  }
  
  return mongoose.model<Log>(`Log_${collectionName}`, LogSchema, collectionName);
}

// Default model for backward compatibility
export const LogModel = getLogModel();
