# RULE 02: MULTI-LLM ROUTER & FAILOVER STRATEGY

## 1. Provider Hierarchy

| Tier | Provider | Model | Client Library | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Primary)** | Google AI Studio | `gemini-2.0-flash` / `gemini-1.5-flash` | `@google/genai` | Lowest latency (<300ms), huge context window, free tier quota |
| **Tier 2 (Fallback 1)** | Groq Cloud | `llama-3.3-70b-versatile` | `groq-sdk` | Ultra-fast token generation (~250 t/s), robust function calling |
| **Tier 3 (Fallback 2)** | OpenRouter | `meta-llama/llama-3.3-70b-instruct:free` | `openai` client | Universal free safety net if primary and secondary fail |

## 2. Failover Trigger Conditions
Trigger failover immediately when:
1. **HTTP 429**: Rate limit or quota exhausted on current provider.
2. **HTTP 5xx**: Provider server error or outage.
3. **Timeout**: Provider fails to return first chunk within **4,000ms**.
4. **Network/Socket Failure**: DNS resolution failure or connection reset.

## 3. Graceful Final Fallback
If all 3 tiers fail:
- Do NOT throw an unhandled 500 error to the client.
- Return a graceful response:
  > *"I am currently experiencing higher-than-normal traffic across our AI nodes. You can reach Anthic directly via email at anthic.dev@gmail.com or book a meeting at cal.com/anthic."*
