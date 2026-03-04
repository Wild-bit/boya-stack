/**
 * 环境变量配置
 * 统一管理所有环境变量，提供类型安全访问
 */

function getEnv(key: keyof ImportMetaEnv, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`环境变量 ${key} 未定义`);
  }
  return value ?? defaultValue ?? '';
}

export const env = {
  // API 配置
  apiBaseUrl: getEnv('VITE_API_BASE_URL'),

  // 应用配置
  appTitle: getEnv('VITE_APP_TITLE', 'I18n Platform'),
  appEnv: getEnv('VITE_APP_ENV', 'development') as 'development' | 'production' | 'staging',

  // 功能开关
  enableMock: getEnv('VITE_ENABLE_MOCK', 'false') === 'true',

  // 环境判断
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
