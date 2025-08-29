import mongoose from 'mongoose';

export async function connectDB(uri: string) {
  if (mongoose.connection.readyState === 1) {
    return { db: mongoose.connection.db };
  }
  await mongoose.connect(uri);
  return { db: mongoose.connection.db };
}
