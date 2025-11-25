import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function trackEvent(name, props = {}) {
  try {
    // Replace with real analytics later
    console.debug('[telemetry]', name, props);
  } catch {
    // noop
  }
}
