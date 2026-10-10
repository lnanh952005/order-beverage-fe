import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default('http://localhost:3000/api/v1'),
  VITE_GOOGLE_CLIENT_ID: z.string().default(''),
  VITE_CURRENCY: z.string().default('VND'),
  VITE_LOCALE: z.string().default('vi-VN'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment variables. Please check your .env configuration.');
}

export const env = parsed.data;
