Sistemের চূড়ান্ত ডিজাইন সাজানো হচ্ছে।
Sistemের চূড়ান্ত ডিজাইন সাজানো হচ্ছে।
Final System Design: Portfolio AI Agent
1. Goal
Recruiter tomar portfolio te ashle bot:

Tomar details niye sothik answer dibe
Recruiter er contact info nibe (lead)
Tomake alert pathabe (Telegram + Email + SMS)
Meaningful visit hole tomake janabe
2. Architecture
                     Recruiter (browser)
                            │
        ┌───────────────────┴──────────────────┐
        ▼                                      ▼
 [Next.js Frontend on Vercel]           [Tracked link ?ref=acme]
  • Portfolio pages                              │
  • ChatWidget (SSE streaming)                   │
  • Tracker.tsx ─────────────────────────────────┘
        │                     │
        ▼                     ▼
  /api/chat              /api/track
        │                     │
        ▼                     ▼
 ┌─────────────────────────────────────┐
 │ Guardrails                          │
 │ Turnstile · Rate limit (Upstash)    │
 │ Input length · Bot filter · Dedupe  │
 └─────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────┐
 │ Agent Loop                          │
 │ • Session memory (Upstash Redis)    │
 │ • System prompt + profile.md        │
 │ • LLM Router:                       │
 │   Gemini Flash → Groq → OpenRouter  │
 │ • Tool calling (validated by zod)   │
 └─────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────┐
 │ Tools                               │
 │ search_profile · capture_lead       │
 │ book_meeting (Cal.com link)         │
 │ request_callback                    │
 └─────────────────────────────────────┘
        │
        ▼
 ┌────────────────┐    ┌────────────────────────────┐
 │ Supabase       │    │ Notification Dispatcher    │
 │ leads          │◄───│ Telegram (instant, button) │
 │ chats          │    │ Email (Resend, backup)     │
 │ visits         │    │ SMS (BD gateway, no-net)   │
 └────────────────┘    └────────────────────────────┘
        ▲
        │
   /admin dashboard (password protected)
3. Tech stack
Layer	Tool	Cost
Frontend + API	Next.js on Vercel	Free
LLM primary	Gemini Flash (AI Studio)	Free tier
LLM fallback	Groq, OpenRouter :free	Free tier
Memory / rate limit	Upstash Redis	Free tier
Database	Supabase (Postgres + pgvector)	Free tier
Alert 1	Telegram Bot	Free
Alert 2	Resend / Gmail SMTP	Free
Alert 3	BD SMS gateway (BulkSMSBD etc.)	~0.4 taka/SMS
Booking	Cal.com	Free
Anti-spam	Cloudflare Turnstile	Free
Tracing	Langfuse	Free tier
Free tier limit change hoy, deploy er age pricing page check koro.

4. Knowledge strategy
Phase 1: profile.md (~3-5k token) puro system prompt e. Retrieval error nai, tai accuracy best.
Phase 2: Project case study/blog boro hole RAG (pgvector). Core profile prompt e thakbe.
Rule: Jaana na hole bolbe "Eta confirm korte pari na, owner ke forward kori". Salary/private info er rule prompt e clearly likho.
5. Data model (Supabase)
sql
leads   (id, created_at, name, email, phone, company, role_offered, message, ref, status)
chats   (id, session_id, created_at, role, content)
visits  (id, created_at, ref, referrer, city, country)   -- IP store korbe na
6. Core flows
Flow A: Chat
Recruiter message → Turnstile + rate limit → agent loop → LLM (fallback router) → streaming reply.

Flow B: Lead capture (sobcheye important)
Recruiter contact dile LLM capture_lead call kore, tarpor:

Supabase e save
Telegram: 🔥 alert + WhatsApp/Email button
Email pathano (backup)
SMS pathano (net na thakleo pabe)
Flow C: Visit tracking
?ref=acme link → Tracker.tsx (session e ekbar) → /api/track → bot filter → interesting kina check → dedupe (1 ghonta) → Telegram e chhoto alert.

7. Alert matrix
Event	Telegram	Email	SMS
Lead capture	✅	✅	✅
Chat shuru	✅	❌	❌
?ref= visit	✅	❌	❌
Random direct visit	❌	❌	❌
Net na thakle Telegram/Email late ashbe (net ashle pending sob ashbe), SMS instant ashbe. Lead Supabase e safe thakbe.

8. Phone call er reality
Bot nijei call kore na. Bot lead nibe → tomake alert dibe → tumi tap kore WhatsApp/call korba. Telegram inline button e tel: kaj kore na, tai phone number message text e dao (tap korle dialer khule). Recruiter chaile Cal.com theke slot book korbe.

9. Guardrails
API key sudhu backend e
Prompt injection defense + tool argument validation (zod)
Per-IP ar per-session rate limit, max input length, max turns
Turnstile captcha
Lead tool sudhu tokhoni jabe jokhon visitor explicitly contact share kore
Sob LLM fail hole fallback: "Please email me at ..."
Privacy line chat widget e: "Ei conversation ar contact info portfolio owner ke pathano hote pare."
10. Folder structure
/app
  /api/chat/route.ts
  /api/track/route.ts
  /admin/page.tsx
/lib
  llm-router.ts
  guardrails.ts
  memory.ts
  notify/ (telegram.ts, email.ts, sms.ts)
  tools/ (captureLead.ts, searchProfile.ts, bookMeeting.ts)
/data
  profile.md
  eval.json
/components
  ChatWidget.tsx
  Tracker.tsx
11. Environment variables
GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY
SUPABASE_URL, SUPABASE_SERVICE_KEY
UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN
TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
RESEND_API_KEY, OWNER_EMAIL
SMS_API_KEY, MY_PHONE
TURNSTILE_SECRET, ADMIN_PASSWORD
12. Evaluation
eval.json e 30-40 question rakho: skills, project, availability, salary, "ei role e fit?", ar injection attempt ("ignore previous instructions"). Prompt/model bodlale run kore check koro. Langfuse diye trace rakho.