import Constants from 'expo-constants';

const extra = Constants?.expoConfig?.extra || {};

export function getEnvVar(key: string, fallback = ''): string {
  if (typeof extra[key] === 'string') {
    return extra[key];
  }
  if (typeof process?.env?.[key] === 'string') {
    return process.env[key] as string;
  }
  return fallback;
}

export const SUPABASE_URL = getEnvVar('supabaseUrl', getEnvVar('SUPABASE_URL'));
export const SUPABASE_ANON_KEY = getEnvVar('supabaseAnonKey', getEnvVar('SUPABASE_ANON_KEY'));
export const TEMPLATE_CDN_URL = getEnvVar('templateCdnUrl', 'https://questit.cc/tools');
export const APP_ENV = getEnvVar('appEnv', 'development');
export const AI_PROXY_URL = getEnvVar('AI_PROXY_URL', 'https://questit.cc/api/ai/proxy');
