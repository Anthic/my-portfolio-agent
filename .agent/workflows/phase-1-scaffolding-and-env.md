# WORKFLOW PHASE 1: SCAFFOLDING, CONFIG & CLIENT WRAPPERS

## Objectives
Establish a bulletproof runtime foundation, typed environment validation, and reusable singleton client connections.

## Step-by-Step Execution Plan

### Step 1.1: Typed Environment Configuration
- Create `src/config/env.ts` using `zod` schema to parse `process.env`.
- Ensure mandatory variables (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, etc.) throw clean errors at startup if missing.

### Step 1.2: Upstash Redis Client
- Create `src/lib/redis.ts` wrapping `@upstash/redis`.
- Implement ping test to verify cache and rate-limit storage connectivity.

### Step 1.3: Supabase Admin Client
- Create `src/lib/supabase.ts` wrapping `@supabase/supabase-js` using the service role key.
- Provide typed helper functions for inserting leads, chat logs, and visit records.

### Verification Check
- Run `npm run build` to verify clean compilation without any TypeScript errors.
