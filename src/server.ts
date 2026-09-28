import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { LLMRouter } from './llm/router.js';
import { SessionMemory } from './memory/session-memory.js';
import { supabase } from './lib/supabase.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check Endpoint
app.get('/health', async (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    services: {
      supabase: !!supabase,
      llmPrimary: 'groq-llama-gpt',
    },
  });
});

// Chat SSE Streaming Endpoint
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  const { message, sessionId = 'default-session' } = req.body || {};

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Valid message is required' });
    return;
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const history = await SessionMemory.getHistory(sessionId);

    let fullAssistantResponse = '';

    await LLMRouter.streamChat(message, history, {
      onChunk: (chunk: string) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      },
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
});

// Start Express Server
const PORT = env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio AI Agent Server running at http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /api/chat (SSE Stream)\n`);
});
