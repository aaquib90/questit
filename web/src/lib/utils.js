import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function trackEvent(name, props = {}) {
  try {
    // Replace with real analytics later
    // eslint-disable-next-line no-console
    console.debug('[telemetry]', name, props);
  } catch {
    // noop
  }
}
