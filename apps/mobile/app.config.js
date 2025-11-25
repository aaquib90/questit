import 'dotenv/config';

const APP_NAME = process.env.APP_NAME || 'Questit Mobile';
const APP_SLUG = process.env.APP_SLUG || 'questit-mobile';

export default ({ config }) => ({
  ...config,
  name: APP_NAME,
  slug: APP_SLUG,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  scheme: 'questit',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#05060b'
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.APP_BUNDLE_ID || 'cc.questit.mobile',
    config: {
      usesNonExemptEncryption: false
    }
  },
  android: {
    package: process.env.APP_PACKAGE || 'cc.questit.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#05060b'
    },
    edgeToEdge: true
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro'
  },
  extra: {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    templateCdnUrl: process.env.TEMPLATE_CDN_URL || 'https://questit.cc/tools',
    appEnv: process.env.APP_ENV || 'development',
    eas: {
      projectId: process.env.EAS_PROJECT_ID || ''
    }
  },
  updates: {
    enabled: true,
    fallbackToCacheTimeout: 0
  }
});
