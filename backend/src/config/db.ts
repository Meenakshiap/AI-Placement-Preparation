import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnectedToMongo = false;

export const connectDatabase = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_prep';
  
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    isConnectedToMongo = true;
    console.log(`[Database] Successfully connected to MongoDB at ${conn.connection.host}`);
    return true;
  } catch (err: any) {
    console.warn(`[Database] MongoDB connection failed (${err.message}). Activating In-Memory / JSON File persistence fallback.`);
    isConnectedToMongo = false;
    return false;
  }
};

export const isMongoActive = (): boolean => isConnectedToMongo;
