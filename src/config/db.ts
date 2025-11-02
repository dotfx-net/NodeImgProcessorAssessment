import mongoose from 'mongoose';
import { ensureIndexes } from '../services/index.service';
import { env } from './env';

let isConnected = false;

export async function connectDB(createIndexes: boolean = false): Promise<void> {
  if (isConnected) { return; }

  mongoose.connection
    .on('connected', () => {
      isConnected = true;

      console.log('Mongo connected');
    })
    .on('disconnected', () => {
      isConnected = false;

      console.warn('Mongo disconnected');
    })
    .on('error', (error: any) => console.error('Mongo error', error));

  await mongoose.connect(env.MONGODB_URI);

  if (createIndexes) {
    try {
      await ensureIndexes();
    } catch (error: any) {
      console.error('Warning: Failed to ensure indexes', error);
    }
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) { return; }

  await mongoose.disconnect();

  isConnected = false;
}
