import fs from 'fs';
import path from 'path';

export interface Config {
  env: string;
  express: {
    port: number;
    jsonLimit: string;
    requestTimeout: number;
  };

  cors?: {
    origin: string;
  };

  mongodb?: {
    uri: string;
  };

  processing: {
    sizes: number[];
    output: string;
  };
};

function loadConfig(): Config {
  const env = process.env.NODE_ENV || 'production';
  const configPath = path.join(__dirname, `../config.${env}.json`);

  if (!fs.existsSync(configPath)) { throw new Error(`Config file not found: ${configPath}`); }

  const configFile = fs.readFileSync(configPath, 'utf-8');

  return JSON.parse(configFile) as Config;
}

export const config = loadConfig();
