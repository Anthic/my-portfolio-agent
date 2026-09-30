import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis.js';

// In-memory fallback if Redis is temporarily unreachable
const localIpMap = new Map<string, { count: number; resetAt: number }>();
const localSessionMap = new Map<string, number>();

const IP_LIMIT = 15; // Max 15 requests per 60-second window
const IP_WINDOW_SECONDS = 60;
const SESSION_MAX_TURNS = 25; // Max 25 turns per session

export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip = (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  ).replace(/[^a-zA-Z0-9_.:-]/g, '');

  const sessionId = req.body?.sessionId || 'default-session';

  // 1. IP-level Rate Limiting
  try {
    if (redis) {
      const ipKey = `ratelimit:ip:${ip}`;
      const currentCount = await redis.incr(ipKey);
      if (currentCount === 1) {
        await redis.expire(ipKey, IP_WINDOW_SECONDS);
      }

      if (currentCount > IP_LIMIT) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please wait a moment before sending another message.',
        });
        return;
      }

      // 2. Session-level Limit
      const sessionKey = `ratelimit:session:${sessionId}`;
      const sessionTurns = await redis.incr(sessionKey);
      if (sessionTurns === 1) {
        await redis.expire(sessionKey, 86400); // 24 hours
      }

      if (sessionTurns > SESSION_MAX_TURNS) {
        res.status(429).json({
          error: 'Session Limit Exceeded',
          message: 'You have reached the maximum message limit for this chat session. Please reach out to Anthic directly via email or LinkedIn.',
        });
        return;
      }
    } else {
      // Local fallback
      const now = Date.now();
      const ipData = localIpMap.get(ip);

      if (!ipData || now > ipData.resetAt) {
        localIpMap.set(ip, { count: 1, resetAt: now + IP_WINDOW_SECONDS * 1000 });
      } else {
        ipData.count += 1;
        if (ipData.count > IP_LIMIT) {
          res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please wait a moment.',
          });
          return;
        }
      }

      const turns = (localSessionMap.get(sessionId) || 0) + 1;
      localSessionMap.set(sessionId, turns);
      if (turns > SESSION_MAX_TURNS) {
        res.status(429).json({
          error: 'Session Limit Exceeded',
          message: 'Session message limit reached. Please contact Anthic directly.',
        });
        return;
      }
    }

    next();
  } catch (err: any) {
    console.warn('[WARN] Rate limiter fallback allowed request:', err.message);
    next();
  }
}
