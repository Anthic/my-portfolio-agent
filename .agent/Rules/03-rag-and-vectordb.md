# RULE 03: KNOWLEDGE STRATEGY, RAG & VECTOR DB

## 1. Two-Tier Knowledge Strategy

### Tier 1: In-Context Knowledge (`data/profile.md`)
- **Size**: ~3,000 to 5,000 tokens.
- **Coverage**:
  - Personal background, education (MBSTU Statistics B.Sc.), contact info.
  - Core tech stack (Full-stack TypeScript, React 19, Next.js, Node.js, Python, LangChain, LangGraph, Qdrant).
  - High-level project summaries and live demo URLs.
  - Working preference (Full-time, Contract, Remote, Relocation availability).
  - Explicit boundaries: Salary negotiations, private credentials, NDA clauses.
- **Why Tier 1**: In-context prompting eliminates vector search retrieval errors, chunks mismatch, and reduces query latency to near-instant.

### Tier 2: Supabase `pgvector` Hybrid RAG (Phase 2 Scale)
- **When Activated**: Detailed case study deep-dives, blog articles, GitHub repositories, and full resume search where content exceeds 15,000 tokens.
- **Embedding Model**: `text-embedding-004` (Google AI Studio) or `all-MiniLM-L6-v2`.
- **Database**: Supabase PostgreSQL with `pgvector` extension enabled.
- **Index**: HNSW or IVFFlat with Cosine Distance (`vector_cosine_ops`).
- **Chunking Strategy**: Semantic recursive chunking (chunk size: 500 tokens, overlap: 50 tokens).
- **Match Function**:
  ```sql
  create or replace function match_portfolio_documents (
    query_embedding vector(768),
    match_threshold float,
    match_count int
  )
  returns table (
    id bigint,
    content text,
    metadata jsonb,
    similarity float
  )
  language plpgsql
  as $$
  begin
    return query
    select
      documents.id,
      documents.content,
      documents.metadata,
      1 - (documents.embedding <=> query_embedding) as similarity
    from documents
    where 1 - (documents.embedding <=> query_embedding) > match_threshold
    order by documents.embedding <=> query_embedding
    limit match_count;
  end;
  $$;
  ```

## 2. Guardrails on Knowledge & Hallucination Defense
- If a question asks about details not present in the knowledge base, the agent MUST explicitly say:
  > *"I don't have that specific detail confirmed in my records. Would you like me to note your question and forward it directly to Anthic?"*
- Never invent metrics, clients, previous salaries, or confidential project credentials.
