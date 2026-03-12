import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env['PORT'] || '4000', 10),
  apiPrefix: process.env['API_PREFIX'] || '/api',
  corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  nodeEnv: process.env['NODE_ENV'] || 'development',
  feishuClientId: process.env['FEISHU_CLIENT_ID'] || '',
  feishuClientSecret: process.env['FEISHU_CLIENT_SECRET'] || '',
  feishuGrantType: process.env['FEISHU_GRANT_TYPE'] || '',
  feishuRedirectUri: process.env['FEISHU_REDIRECT_URI'] || '',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env['DATABASE_URL'] || '',
}));

export type AppConfig = ReturnType<typeof appConfig>;
export type DatabaseConfig = ReturnType<typeof databaseConfig>;
