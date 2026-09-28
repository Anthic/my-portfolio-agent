# WORKFLOW PHASE 2: MULTI-LLM ROUTER & SESSION MEMORY

## Objectives
Build the core intelligence layer capable of streaming tokens, remembering previous turns, and switching models automatically upon failure.

## Step-by-Step Execution Plan

### Step 2.1: Session Memory Manager
- Create `src/memory/session-memory.ts`.
- Methods:
  - `getSessionHistory(sessionId: string): Promise<Message[]>`
  - `appendSessionMessage(sessionId: string, message: Message): Promise<void>`
  - `clearSession(sessionId: string): Promise<void>`
- Storage: Upstash Redis list with TTL = 24 hours.

### Step 2.2: LLM Providers Adapter
- Create `src/llm/providers/gemini.ts` (Google Gen AI SDK).
- Create `src/llm/providers/groq.ts` (Groq SDK).
- Create `src/llm/providers/openrouter.ts` (OpenAI client with OpenRouter base URL).

### Step 2.3: Orchestrated Fallback Router
- Create `src/llm/router.ts`.
- Implements cascade:
  1. Try Gemini Flash -> return async token generator.
  2. If error (429/timeout) -> log warning and try Groq.
  3. If Groq fails -> log warning and try OpenRouter.
  4. If all fail -> yield friendly fallback message.

### Verification Check
- Run a standalone test script invoking the router with mock queries and simulating a network failure.
