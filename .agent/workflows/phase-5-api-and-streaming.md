# WORKFLOW PHASE 5: EXPRESS API & SERVER-SENT EVENTS (SSE)

## Objectives
Expose the HTTP and streaming interfaces for client integration with the frontend chat widget and referral tracking.

## Step-by-Step Execution Plan

### Step 5.1: Guardrails Middleware
- Create `src/guardrails/turnstile.ts`: Validates Cloudflare Turnstile token.
- Create `src/guardrails/rate-limit.ts`: Upstash Redis sliding window middleware.
- Create `src/guardrails/sanitizer.ts`: Input length truncation & injection check.

### Step 5.2: Chat Streaming Endpoint (`POST /api/chat`)
- Headers:
  ```
  Content-Type: text/event-stream
  Cache-Control: no-cache
  Connection: keep-alive
  ```
- Workflow:
  1. Validate Turnstile + Rate Limit.
  2. Load session memory from Redis.
  3. Stream response tokens via SSE chunks (`data: {"text": "..."}\n\n`).
  4. If tool call is triggered -> execute tool, emit tool status, continue streaming.
  5. Save final user + assistant messages to Redis and Supabase.

### Step 5.3: Track Referral Endpoint (`POST /api/track`)
- Deduplicates visit using `visit_dedupe:<ref>:<clientHash>`.
- Stores visit metadata in Supabase `visits` table.
- Sends silent ping to Telegram if referral is notable (e.g. `?ref=google`).

### Step 5.4: Express Server Integration
- Create `src/server.ts` attaching CORS, JSON parser, and routes.
- Add `/health` endpoint returning server status and connected services.
