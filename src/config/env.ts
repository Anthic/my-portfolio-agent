import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // LLM Providers
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GROQ_API_KEY: z.string().optional().or(z.literal('')),
  OPENROUTER_API_KEY: z.string().optional().or(z.literal('')),

  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional().or(z.literal('')),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal('')),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal('')),

  // Notifications
  TELEGRAM_BOT_TOKEN: z.string().optional().or(z.literal('')),
  TELEGRAM_CHAT_ID: z.string().optional().or(z.literal('')),
  RESEND_API_KEY: z.string().optional().or(z.literal('')),
  OWNER_EMAIL: z.string().email().optional().or(z.literal('')),
  SMS_API_KEY: z.string().optional().or(z.literal('')),
  MY_PHONE: z.string().optional().or(z.literal('')),

  // Security
  TURNSTILE_SECRET: z.string().optional().or(z.literal('')),
  ADMIN_PASSWORD: z.string().optional().or(z.literal('')),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
