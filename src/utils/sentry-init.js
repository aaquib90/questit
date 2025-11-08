/**
 * Initialize Sentry for browser error tracking
 * Call this early in your app initialization
 */

export function initSentry(dsn, options = {}) {
  if (typeof window === 'undefined' || !dsn) {
    return null;
  }

  // Dynamically load Sentry if not already present
  if (!window.Sentry) {
    const script = document.createElement('script');
    script.src = 'https://browser.sentry-cdn.com/7.91.0/bundle.min.js';
    script.integrity = 'sha384-+VrqjN4qJx8Y5qJx8Y5qJx8Y5qJx8Y5q';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (window.Sentry) {
        window.Sentry.init({
          dsn,
          environment: options.environment || 'production',
          tracesSampleRate: options.tracesSampleRate || 0.1,
          beforeSend(event, hint) {
            // Add Questit context
            event.tags = event.tags || {};
            event.tags.questit = true;
            return event;
          }
        });
      }
    };
    document.head.appendChild(script);
    return null;
  }

  // Sentry already loaded
  window.Sentry.init({
    dsn,
    environment: options.environment || 'production',
    tracesSampleRate: options.tracesSampleRate || 0.1,
    beforeSend(event, hint) {
      event.tags = event.tags || {};
      event.tags.questit = true;
      return event;
    }
  });

  return window.Sentry;
}

export default { initSentry };

