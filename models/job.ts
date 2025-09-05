import mongoose, { Schema, Document } from 'mongoose';

export interface HourJob {
  hour_range: string;
  file_name: string;
  file_path: string;
  status: 'pending' | 'success' | 'failed';
  retries: number;
  logs: Array<{ timestamp: Date; error: string }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Job extends Document {
  date: string;
  status: 'pending' | 'success' | 'failed';
  hours: HourJob[];
  createdAt?: Date;
  updatedAt?: Date;
}

const HourJobSchema = new Schema<HourJob>({
  hour_range: { type: String, required: true },
  file_name: { type: String, required: true },
  file_path: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  retries: { type: Number, default: 0 },
  logs: [{ timestamp: Date, error: String }],
}, { 
  _id: false,
  timestamps: true // This adds createdAt and updatedAt to each hour job
});

const JobSchema = new Schema<Job>({
  date: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  hours: { type: [HourJobSchema], required: true },
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt
});

// Create a function to get the Job model with custom collection name
export function getJobModel(collectionName: string = 'jobs') {
  // Check if model already exists to avoid re-compilation
  if (mongoose.models[`Job_${collectionName}`]) {
    return mongoose.models[`Job_${collectionName}`] as mongoose.Model<Job>;
  }
  
  return mongoose.model<Job>(`Job_${collectionName}`, JobSchema, collectionName);
}

// Default model for backward compatibility
export const JobModel = getJobModel();
