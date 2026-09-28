import { Redis } from '@upstash/redis';
import { env } from '../config/env.js';

let redisInstance: Redis | null = null;

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  redisInstance = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.warn('⚠️ Upstash Redis credentials not fully configured. In-memory fallback will be used.');
}

export const redis = redisInstance;
