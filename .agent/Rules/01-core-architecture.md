# RULE 01: CORE ARCHITECTURE & CODE CONTRACTS

## 1. Domain Separation
The backend must maintain strict boundary separation between:
1. **API / Transport Layer (`src/routes/`)**: Express controllers, CORS, headers, SSE event formatting. No direct database or LLM business logic here.
2. **Guardrails & Security (`src/guardrails/`)**: Turnstile token validation, Upstash rate limiting, input sanity, and injection regex filters.
3. **Session & Memory (`src/memory/`)**: Upstash Redis key/value storage for conversation turns and visitor state.
4. **LLM Orchestration (`src/llm/`)**: Multi-provider fallback router, prompt assembly, and streaming protocol adapters.
5. **Tools & Function Calling (`src/tools/`)**: Zod-validated tool contracts and execution logic.
6. **Notification Dispatcher (`src/notify/`)**: Background notification workers for Telegram, Resend, and BD SMS.
7. **Data Persistence (`src/db/`)**: Supabase PostgreSQL client wrappers and queries.

## 2. Coding Standards
- **Pure TypeScript**: `noImplicitAny: true`, strict null checks, full type safety.
- **NodeNext Modules**: Always use explicit `.js` extension when importing relative local files (e.g. `import { router } from './router.js'`).
- **No Console Pollution**: Use structured log messages with timestamps and severity prefixes `[INFO]`, `[WARN]`, `[ERROR]`.
- **Environment First**: All configuration must load through a typed `src/config/env.ts` validated with Zod at startup. If an essential environment variable is missing, fail fast at boot time.
