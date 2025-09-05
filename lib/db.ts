import mongoose from 'mongoose';

// Connect to MongoDB database
export async function connectDB(uri: string) {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return { db: mongoose.connection.db };
  }
  // Establish new connection
  await mongoose.connect(uri);
  return { db: mongoose.connection.db };
}
