import dotenv from 'dotenv';
import { config } from './config';

dotenv.config();

function getEnv(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;

  if (v === undefined) { throw new Error(`Missing env var: ${key}`); }

  return v;
}

export const env = {
  PORT: Number(getEnv('PORT', String(config?.express?.port || 3000))),
  MONGODB_URI: getEnv('MONGODB_URI', config?.mongodb?.uri || 'mongodb://localhost:27017/image_task_api'),
  NODE_ENV: getEnv('NODE_ENV', config.env)
};
