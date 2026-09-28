import { redis } from '../lib/redis.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

const SESSION_TTL_SECONDS = 86400; // 24 hours
const MAX_HISTORY_MESSAGES = 10;

// In-memory fallback if Redis is unavailable
const memoryFallback = new Map<string, ChatMessage[]>();

export class SessionMemory {
  static getSessionKey(sessionId: string): string {
    return `agent_session:${sessionId}`;
  }

  static async getHistory(sessionId: string): Promise<ChatMessage[]> {
    if (!sessionId) return [];

    if (redis) {
      try {
        const raw = await redis.get<ChatMessage[]>(this.getSessionKey(sessionId));
        if (Array.isArray(raw)) {
          return raw;
        }
      } catch (err: any) {
        console.warn(`[WARN] Failed to read session from Redis: ${err.message}`);
      }
    }

    return memoryFallback.get(sessionId) || [];
  }

  static async appendMessage(sessionId: string, message: ChatMessage): Promise<void> {
    if (!sessionId) return;

    const history = await this.getHistory(sessionId);
    history.push({
      ...message,
      timestamp: Date.now(),
    });

    // Keep sliding window of latest messages
    const trimmed = history.slice(-MAX_HISTORY_MESSAGES);

    if (redis) {
      try {
        await redis.set(this.getSessionKey(sessionId), trimmed, { ex: SESSION_TTL_SECONDS });
        return;
      } catch (err: any) {
        console.warn(`[WARN] Failed to save session to Redis: ${err.message}`);
      }
    }

    memoryFallback.set(sessionId, trimmed);
  }

  static async clearSession(sessionId: string): Promise<void> {
    if (!sessionId) return;
    if (redis) {
      try {
        await redis.del(this.getSessionKey(sessionId));
      } catch (err: any) {
        console.warn(`[WARN] Failed to clear session in Redis: ${err.message}`);
      }
    }
    memoryFallback.delete(sessionId);
  }
}
