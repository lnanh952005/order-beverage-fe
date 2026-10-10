import { env } from '@/core/config/env';

/**
 * Format currency number according to configured locale and currency
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(env.VITE_LOCALE, {
    style: 'currency',
    currency: env.VITE_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO UTC date string or Date object to locale date string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(env.VITE_LOCALE, {
    dateStyle: 'medium',
  }).format(d);
}

/**
 * Format ISO UTC date string or Date object to locale datetime string
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(env.VITE_LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}
