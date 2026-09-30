import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { env } from '../config/env.js';
import { ChatMessage } from '../memory/session-memory.js';
import { AGENT_TOOLS, executeTool } from '../tools/index.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let profileContent = '';
try {
  const profilePath = path.resolve(__dirname, '../data/profile.md');
  profileContent = fs.readFileSync(profilePath, 'utf-8');
} catch (e) {
  console.warn('[WARN] Could not load profile.md, using default context');
}

export const BASE_SYSTEM_PROMPT = `
You are the official Portfolio AI Assistant for Anthic Kumar Singh.
Your purpose is to answer recruiters, clients, and visitors with accuracy, clarity, and professionalism.

Anthic's Verified Profile Knowledge Base:
${profileContent}

CRITICAL RULES:
1. Always base technical and career answers directly on Anthic's verified profile.
2. If asked about unknown details (e.g. undisclosed salary, private credentials), politely deflect.
3. Whenever a recruiter, founder, or client shares their contact info or expresses clear interest in hiring/working with Anthic, ALWAYS call the 'capture_lead' tool so Anthic is notified immediately.
4. If they ask to book an interview or schedule a call, call the 'book_meeting' tool.
5. Speak in a confident, articulate, and engineering-sound tone. Be concise and helpful.
`;

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onToolCall?: (toolName: string, toolArgs: any) => void;
  onFinish?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export class LLMRouter {
  private static groqClient = env.GROQ_API_KEY ? new Groq({ apiKey: env.GROQ_API_KEY }) : null;
  private static geminiClient = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;

  static async streamChat(
    userMessage: string,
    history: ChatMessage[],
    callbacks: StreamCallbacks
  ): Promise<string> {
    const formattedMessages: any[] = [
      { role: 'system', content: BASE_SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    // --- Tier 1: Groq with Tool Calling Support ---
    if (this.groqClient) {
      try {
        let fullText = '';
        
        // 1. Initial Call with tools enabled
        const response = await this.groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: formattedMessages,
          tools: AGENT_TOOLS,
          tool_choice: 'auto',
          temperature: 0.5,
          max_tokens: 800,
        });

        const choice = response.choices[0];

        // 2. Check if the model decided to call a tool
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
          for (const toolCall of choice.message.tool_calls) {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
            
            // Notify callback if frontend is listening for tool execution events
            if (callbacks.onToolCall) {
              callbacks.onToolCall(toolName, toolArgs);
            }

            // Execute the tool (e.g. capture lead, book meeting)
            const toolResult = await executeTool(toolName, toolArgs);
            
            // Stream the tool result message to the user
            callbacks.onChunk(toolResult);
            fullText += toolResult;
          }

          if (callbacks.onFinish) callbacks.onFinish(fullText);
          return fullText;
        }

        // 3. If no tool was called, stream the text response
        const stream = await this.groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: formattedMessages,
          stream: true,
          temperature: 0.6,
          max_tokens: 800,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullText += content;
            callbacks.onChunk(content);
          }
        }

        if (callbacks.onFinish) callbacks.onFinish(fullText);
        return fullText;
      } catch (err: any) {
        console.warn(`[WARN] Groq LLM failed (${err.message}). Attempting failover to Gemini...`);
      }
    }

    // --- Tier 2: Gemini Fallback ---
    if (this.geminiClient) {
      try {
        let fullText = '';
        const responseStream = await this.geminiClient.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${BASE_SYSTEM_PROMPT}\n\nUser: ${userMessage}` }] },
          ],
        });

        for await (const chunk of responseStream) {
          const text = chunk.text || '';
          if (text) {
            fullText += text;
            callbacks.onChunk(text);
          }
        }

        if (callbacks.onFinish) callbacks.onFinish(fullText);
        return fullText;
      } catch (err: any) {
        console.warn(`[WARN] Gemini LLM failed (${err.message}).`);
      }
    }

    // --- Tier 3: Graceful Offline Fallback ---
    const fallbackResponse =
      "I am currently experiencing high network volume. You can reach Anthic directly via email at anthickumarsingh2@gmail.com.";
    callbacks.onChunk(fallbackResponse);
    if (callbacks.onFinish) callbacks.onFinish(fallbackResponse);
    return fallbackResponse;
  }
}
