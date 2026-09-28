# SENIOR AI ARCHITECT MASTER SPECIFICATION: PORTFOLIO AI AGENT BACKEND

## 1. System Vision & Architecture Overview
This repository (`my-ai-agent-portfolio`) is an enterprise-grade, autonomous, production-ready **Node.js + TypeScript Backend Service** for a personal AI Portfolio Agent.

Unlike basic chatbots that merely echo canned responses, this agent is designed with:
- **Resilient Multi-LLM Routing**: Zero-downtime fallback switching across Gemini Flash, Groq Llama 3.3, and OpenRouter.
- **Two-Tier Knowledge Architecture**: Zero-retrieval-error In-Context Memory (Phase 1) progressing to Hybrid Supabase pgvector RAG (Phase 2).
- **Zod-Enforced Tool Calling**: Strict schema validation for intent recognition, lead qualification, and booking.
- **Non-Blocking Multi-Channel Notification Dispatcher**: Asynchronous fire-and-forget alerts across Telegram, WhatsApp, Email, and BD Offline SMS.
- **Defense-In-Depth Guardrails**: Cloudflare Turnstile bot deterrence, Upstash Redis sliding-window rate limiting, and prompt injection filters.
- **Production Server-Sent Events (SSE)**: Low-latency streaming to the frontend chat client.

---

## 2. High-Level Data & Execution Topology

```
[ Frontend ChatWidget / Tracking Link (?ref=acme) ]
                        │
                        ▼ (HTTP POST / SSE)
         ┌──────────────────────────────┐
         │      Express API Layer       │
         │   /api/chat  │  /api/track   │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │       Guardrails Gate        │
         │ • Cloudflare Turnstile token │
         │ • Upstash Redis Rate-Limit   │
         │ • Prompt Injection Sanitizer │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │       Session Context        │
         │ • Redis Session History      │
         │ • profile.md In-Context Core │
         │ • (Optional) RAG Context     │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │      LLM Router Engine       │
         │ Gemini 2.0 Flash (Primary)   │
         │      ↓ (On 429/Timeout)      │
         │ Groq Llama 3.3 70B (Tier 2)  │
         │      ↓ (On Quota Failure)    │
         │ OpenRouter Free (Safety Net) │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   Zod Tool Calling Engine    │
         │ • capture_lead               │
         │ • search_profile             │
         │ • book_meeting               │
         │ • request_callback           │
         │ • navigate_portfolio         │
         └──────────────┬───────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼ (Instant Stream)              ▼ (Async Background Worker)
 [ SSE Stream to User ]         [ Notification Dispatcher ]
                                ├─► Telegram (with 1-Tap WA button)
                                ├─► Resend (HTML lead email)
                                ├─► BD SMS Gateway (Offline delivery)
                                └─► Supabase (leads & audit logs)
```

---

## 3. Subsystem Breakdown & Architecture Rules

Detailed engineering standards are documented in `.agent/Rules/`:
- **[Rules/01-core-architecture.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/01-core-architecture.md)**: Layered architectural boundaries and clean code principles.
- **[Rules/02-llm-router-fallback.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/02-llm-router-fallback.md)**: Tri-model fallback strategy, retry budgets, and failover mechanics.
- **[Rules/03-rag-and-vectordb.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/03-rag-and-vectordb.md)**: In-Context grounding vs. Supabase pgvector semantic search.
- **[Rules/04-tools-and-function-calling.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/04-tools-and-function-calling.md)**: Schema contracts and execution lifecycle of all tools.
- **[Rules/05-notification-dispatcher.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/05-notification-dispatcher.md)**: Non-blocking background alerting matrix across Telegram, Email, and SMS.
- **[Rules/06-guardrails-and-security.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/06-guardrails-and-security.md)**: Turnstile, Redis sliding window rate-limiting, and prompt injection defense.
- **[Rules/07-database-schema.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/07-database-schema.md)**: Supabase PostgreSQL DDL, indexes, and privacy rules.
- **[Rules/08-evaluation-and-testing.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/Rules/08-evaluation-and-testing.md)**: Offline evaluation dataset, regression harness, and tracing.

---

## 4. Workflows & Implementation Roadmap
Detailed step-by-step phased execution guides are documented in `.agent/workflows/`:
1. **[workflows/phase-1-scaffolding-and-env.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-1-scaffolding-and-env.md)**: Config validation, Supabase & Upstash clients.
2. **[workflows/phase-2-llm-router-and-memory.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-2-llm-router-and-memory.md)**: Fallback router and session history manager.
3. **[workflows/phase-3-knowledge-and-rag.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-3-knowledge-and-rag.md)**: Profile grounding and vector search store.
4. **[workflows/phase-4-tools-and-notifications.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-4-tools-and-notifications.md)**: Tool execution and non-blocking notification dispatcher.
5. **[workflows/phase-5-api-and-streaming.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-5-api-and-streaming.md)**: Express API routes, SSE streaming, and visit attribution.
6. **[workflows/phase-6-evals-and-verification.md](file:///d:/main-portfolio/my-ai-agent-portfolio/.agent/workflows/phase-6-evals-and-verification.md)**: Test harness and security hardening.
