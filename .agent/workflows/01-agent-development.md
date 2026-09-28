# Workflow: Backend AI Agent Development & Execution

This document outlines the standard operational workflows for developing, testing, and deploying the Node.js + TypeScript AI Agent Backend service.

---

## 1. Development & Local Run Workflow
- **Start Development Server**:
  ```bash
  npm run dev
  ```
  Runs `tsx watch src/index.ts` with instant TypeScript compilation and hot-reloading.
- **Build for Production**:
  ```bash
  npm run build
  ```
  Compiles TypeScript to standard ES2022 JavaScript in the `/dist` directory.
- **Start Production Server**:
  ```bash
  npm run start
  ```

---

## 2. Core Execution Pipeline (Request Lifecycle)

```
Client (ChatWidget / Tracker)
         │
         ▼
[1] Express API Route (/api/chat, /api/track)
         │
         ▼
[2] Guardrails Check
    ├─► Turnstile verification
    ├─► Upstash Redis sliding window rate-limit (IP + Session)
    └─► Prompt length & injection sanitizer
         │
         ▼
[3] Memory Retrieval
    └─► Load last N conversation turns from Redis / session cache
         │
         ▼
[4] LLM Router Execution
    ├─► Step A: Attempt primary model (Gemini 2.0 / 1.5 Flash)
    ├─► Step B: If quota/rate-limit error -> Fallback to Groq (Llama 3.3 70B)
    └─► Step C: If Groq fails -> Fallback to OpenRouter Free tier
         │
         ▼
[5] Tool Calling & Execution
    ├─► Zod schema validation
    ├─► capture_lead: triggers non-blocking notification dispatcher
    ├─► search_profile: retrieves factual career/tech information
    └─► book_meeting: delivers direct Cal.com booking link
         │
         ▼
[6] SSE Streaming Response
    └─► Server-Sent Events stream chunks back to the client
         │
         ▼
[7] Async Background Persistence
    ├─► Persist lead record to Supabase
    ├─► Dispatch Telegram alert with instant WhatsApp action button
    ├─► Send Resend email alert
    └─► Send offline SMS alert via BD SMS gateway
```

---

## 3. Evaluation & Quality Assurance Workflow
1. Maintain test cases in `src/data/eval.json`:
   - 10+ Factual career questions (tech stack, role history, education).
   - 10+ Lead capture trigger tests (hiring intent, contact offers).
   - 10+ Adversarial & injection tests ("Ignore all rules", system prompt extraction).
2. Run automated prompt regression suite before committing prompt changes.
3. Validate streaming latency remains under 500ms for first-chunk response.
