import { Request, Response, NextFunction } from 'express';

const MAX_INPUT_LENGTH = 1000;

// Known adversarial patterns attempting to hijack or leak system prompt
const INJECTION_PATTERNS = [
  /ignore\s+(all|any|previous|prior|above)\s+(instructions|directions|prompts|rules)/i,
  /you\s+are\s+now\s+(in\s+)?(developer\s+mode|dan|jailbroken|unrestricted)/i,
  /(output|print|show|repeat|display|reveal)\s+(your\s+)?(system\s+prompt|initial\s+prompt|developer\s+prompt)/i,
  /(reveal|leak|print|show)\s+(api\s*key|secret|env|environment\s*variable|token)/i,
  /bypass\s+all\s+(safety|guardrails|filters)/i,
];

export const DEFLECTION_MESSAGE =
  "I am designed specifically to assist you with Anthic's portfolio, career history, and project inquiries. How can I help you regarding his engineering work?";

export function sanitizeMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { message } = req.body || {};

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Valid message string is required.' });
    return;
  }

  // 1. Length check
  if (message.length > MAX_INPUT_LENGTH) {
    res.status(400).json({
      error: 'Message Too Long',
      message: `Message exceeds maximum allowed length of ${MAX_INPUT_LENGTH} characters.`,
    });
    return;
  }

  // 2. Prompt Injection Check
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      console.warn(`[SECURITY] Prompt injection pattern detected from user query: "${message.slice(0, 50)}..."`);
      
      // If client requests SSE stream, return SSE deflection
      if (req.headers.accept?.includes('text/event-stream') || req.path === '/api/chat') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ text: DEFLECTION_MESSAGE })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }

      res.json({ text: DEFLECTION_MESSAGE, blocked: true });
      return;
    }
  }

  // Clean message
  req.body.message = message.trim();
  next();
}
