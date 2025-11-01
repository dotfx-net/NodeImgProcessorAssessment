import dotenv from 'dotenv';

dotenv.config();

function getEnv(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;

  if (v === undefined) { throw new Error(`Missing env var: ${key}`); }

  return v;
}

export const env = {
  PORT: Number(getEnv('PORT', '3000'))
};
