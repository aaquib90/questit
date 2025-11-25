export interface QuestitClientOptions {
  appId?: string;
  environment?: 'development' | 'preview' | 'production';
}

export function createQuestitClient(options: QuestitClientOptions = {}) {
  return {
    get appId() {
      return options.appId ?? 'questit-web';
    },
    get environment() {
      return options.environment ?? 'development';
    }
  };
}
