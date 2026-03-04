import path from 'path';
import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;

dotenv.config({ path: path.resolve(__dirname, envFile) });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
