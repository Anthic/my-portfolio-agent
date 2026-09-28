# SENIOR AI ARCHITECTURE: WORKFLOW & SYSTEM RULES SITEMAP

## 1. Project Identity
- **Repository**: `my-ai-agent-portfolio`
- **Type**: Autonomous Node.js + TypeScript Backend Service (API & SSE Streaming Engine)
- **Role**: AI Representative, Lead Qualifier, and Interactive Guide for Anthic Kumar Singh's Portfolio

---

## 2. Core Architecture Rules Index (`.agent/Rules/`)
1. [Rules/01-core-architecture.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/01-core-architecture.md) — Layered boundaries, typed environment, error contracts.
2. [Rules/02-llm-router-fallback.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/02-llm-router-fallback.md) — Tri-model failover: Gemini 2.0/1.5 Flash -> Groq Llama 3.3 70B -> OpenRouter.
3. [Rules/03-rag-and-vectordb.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/03-rag-and-vectordb.md) — In-context `profile.md` vs. Supabase pgvector hybrid search.
4. [Rules/04-tools-and-function-calling.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/04-tools-and-function-calling.md) — Zod tool schemas (`capture_lead`, `search_profile`, `book_meeting`, `navigate_portfolio`).
5. [Rules/05-notification-dispatcher.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/05-notification-dispatcher.md) — Non-blocking alerting (Telegram + WA button, Resend, BD SMS Gateway).
6. [Rules/06-guardrails-and-security.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/06-guardrails-and-security.md) — Turnstile bot barrier, Upstash sliding window rate limit, prompt injection defense.
7. [Rules/07-database-schema.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/07-database-schema.md) — Supabase PostgreSQL DDL, vector indexes, RLS.
8. [Rules/08-evaluation-and-testing.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/08-evaluation-and-testing.md) — `eval.json` test harness, factuality, and latency benchmarks.

---

## 3. Phased Implementation Roadmap (`.agent/workflows/`)
- [Phase 1: Scaffolding & Env](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-1-scaffolding-and-env.md) — Config validation, Redis & Supabase clients.
- [Phase 2: LLM Router & Memory](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-2-llm-router-and-memory.md) — Failover router and Upstash session memory.
- [Phase 3: Knowledge & RAG](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-3-knowledge-and-rag.md) — `profile.md` grounding and vector indexing.
- [Phase 4: Tools & Notifications](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-4-tools-and-notifications.md) — Zod tools & multi-channel async dispatcher.
- [Phase 5: API & Streaming](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-5-api-and-streaming.md) — Express `/api/chat` SSE & `/api/track`.
- [Phase 6: Evals & Hardening](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-6-evals-and-verification.md) — Automated regression testing with `eval.json`.
