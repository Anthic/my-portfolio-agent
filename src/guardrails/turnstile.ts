import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { env } from '../config/env.js';

export async function turnstileMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const secret = env.TURNSTILE_SECRET;

  // In development or if not yet configured, bypass gracefully
  if (!secret) {
    next();
    return;
  }

  const token = req.body?.turnstileToken || req.headers['cf-turnstile-token'];

  if (!token) {
    res.status(403).json({
      error: 'Bot Verification Failed',
      message: 'Cloudflare Turnstile token is missing.',
    });
    return;
  }

  try {
    const remoteIp = (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      ''
    );

    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);
    if (remoteIp) formData.append('remoteip', remoteIp);

    const result = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (result.data.success) {
      next();
    } else {
      res.status(403).json({
        error: 'Bot Verification Failed',
        message: 'Turnstile verification failed or expired.',
      });
    }
  } catch (err: any) {
    console.error('[ERROR] Turnstile verification exception:', err.message);
    res.status(500).json({ error: 'Internal security verification error' });
  }
}
