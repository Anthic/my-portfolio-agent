import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { LLMRouter } from './llm/router.js';
import { SessionMemory } from './memory/session-memory.js';
import { supabase } from './lib/supabase.js';
import { redis } from './lib/redis.js';
import { turnstileMiddleware } from './guardrails/turnstile.js';
import { rateLimitMiddleware } from './guardrails/rate-limit.js';
import { sanitizeMiddleware } from './guardrails/sanitizer.js';
import { sendTelegramReferralAlert } from './notify/telegram.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// 1. Health Check Endpoint
app.get('/health', async (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    services: {
      supabase: !!supabase,
      redis: !!redis,
      llmPrimary: 'groq-llama-gpt',
    },
  });
});

// 2. Track Referral Endpoint (POST /api/track)
app.post('/api/track', async (req: Request, res: Response): Promise<void> => {
  const { ref, referrer, userAgent, city, country } = req.body || {};

  if (!ref || typeof ref !== 'string') {
    res.status(400).json({ error: 'Valid ref string parameter is required' });
    return;
  }

  const cleanRef = ref.trim().toLowerCase();
  const ip = (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  ).replace(/[^a-zA-Z0-9_.:-]/g, '');

  const clientHash = Buffer.from(`${ip}-${req.headers['user-agent'] || ''}`).toString('base64').slice(0, 16);
  const dedupeKey = `visit_dedupe:${cleanRef}:${clientHash}`;

  let isNewVisit = true;

  if (redis) {
    try {
      const alreadyLogged = await redis.get(dedupeKey);
      if (alreadyLogged) {
        isNewVisit = false;
      } else {
        await redis.set(dedupeKey, '1', { ex: 3600 }); // 1-hour deduplication window
      }
    } catch (err: any) {
      console.warn('[WARN] Redis visit deduplication error:', err.message);
    }
  }

  if (isNewVisit) {
    // 1. Log to Supabase visits table
    try {
      await supabase.from('visits').insert([
        {
          ref: cleanRef,
          referrer: referrer || (req.headers.referer as string) || null,
          city: city || null,
          country: country || null,
          user_agent: userAgent || (req.headers['user-agent'] as string) || null,
        },
      ]);
      console.log(`[INFO] New tracked visit recorded for ref: ${cleanRef}`);
    } catch (dbErr: any) {
      console.warn(`[WARN] Failed to record visit in Supabase: ${dbErr.message}`);
    }

    // 2. Send silent Telegram ping for campaign visits
    sendTelegramReferralAlert(cleanRef, {
      referrer: referrer || (req.headers.referer as string),
      city,
      country,
    });
  }

  res.json({
    status: 'ok',
    ref: cleanRef,
    tracked: isNewVisit,
  });
});

// 3. Chat SSE Streaming Endpoint with Guardrails
app.post(
  '/api/chat',
  turnstileMiddleware,
  rateLimitMiddleware,
  sanitizeMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { message, sessionId = 'default-session' } = req.body || {};

    // Set SSE Streaming Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const history = await SessionMemory.getHistory(sessionId);

      let fullAssistantResponse = '';

      await LLMRouter.streamChat(message, history, {
        // Emit tool execution event to client widget
        onToolCall: (toolName: string, toolArgs: any) => {
          res.write(
            `data: ${JSON.stringify({
              type: 'tool_call',
              tool: toolName,
              args: toolArgs,
            })}\n\n`
          );
        },
        // Emit token chunk to client widget
        onChunk: (chunk: string) => {
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        },
        // On completion, persist turn to Redis and Supabase
        onFinish: async (fullText: string) => {
          fullAssistantResponse = fullText;
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();

          // Async save to memory and supabase
          await SessionMemory.appendMessage(sessionId, { role: 'user', content: message });
          await SessionMemory.appendMessage(sessionId, { role: 'assistant', content: fullText });

          try {
            await supabase.from('chats').insert([
              { session_id: sessionId, role: 'user', content: message },
              { session_id: sessionId, role: 'assistant', content: fullText },
            ]);
          } catch (dbErr: any) {
            console.warn(`[WARN] Failed to log chat in Supabase: ${dbErr.message}`);
          }
        },
        onError: (err: Error) => {
          console.error('[ERROR] Chat stream error:', err);
          res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
          res.end();
        },
      });
    } catch (err: any) {
      console.error('[ERROR] /api/chat error:', err);
      res.write(`data: ${JSON.stringify({ error: 'Internal agent error' })}\n\n`);
      res.end();
    }
  }
);

// Start Express Server
const PORT = env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio AI Agent Server running at http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /api/track (Referral Analytics)`);
  console.log(`   - POST /api/chat (SSE Stream with Guardrails & Tools)\n`);
});
