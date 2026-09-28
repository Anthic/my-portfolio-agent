# WORKFLOW PHASE 3: KNOWLEDGE STRATEGY & PROFILE GROUNDING

## Objectives
Construct the structured knowledge base (`profile.md`) for zero-hallucination in-context prompting, and prepare the Supabase `pgvector` hybrid search infrastructure for deep case studies.

## Step-by-Step Execution Plan

### Step 3.1: Curated Profile Document
- Create `src/data/profile.md` containing:
  - Exact biography and contact links.
  - Education (MBSTU Statistics CGPA 3.27, college, high school).
  - Work Experience (Full-Stack Developer at The Nexgenix).
  - All verified tech stack skills (React, Next.js, LangChain, LangGraph, Qdrant, etc.).
  - Deep-dive project summaries: EasyFile Tax Platform architecture, problem, solution, tech stack.

### Step 3.2: System Prompt Engineering
- Create `src/llm/prompt.ts`.
- Implements:
  - Agent Persona: Professional, concise, technically sharp Senior AI & Full-Stack Engineer representative.
  - Injected `profile.md` knowledge.
  - Guardrail instructions: No salary disclosure, no fake credentials, polite boundary handling.

### Step 3.3: (Optional Phase 2) Vector Indexing Script
- Create `src/data/seed-embeddings.ts`.
- Chunks markdown case studies and inserts vector embeddings into Supabase `documents` table using `@google/genai` embedding model.
