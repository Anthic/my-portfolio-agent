# RULE 07: SUPABASE DATABASE SCHEMAS & PERSISTENCE

## 1. DDL Specification

```sql
-- Enable UUID and vector extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- 1. Leads Table (Recruiter details captured by agent)
create table if not exists public.leads (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    email text,
    phone text,
    company text,
    role_offered text,
    message text,
    ref text,
    status text default 'new' check (status in ('new', 'contacted', 'interviewing', 'archived'))
);

-- 2. Chat Sessions & Messages Table
create table if not exists public.chats (
    id uuid primary key default uuid_generate_v4(),
    session_id text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    role text not null check (role in ('user', 'assistant', 'system', 'tool')),
    content text not null,
    tool_calls jsonb
);

create index if not exists idx_chats_session_id on public.chats(session_id);

-- 3. Visits Table (Referral and campaign traffic)
create table if not exists public.visits (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    ref text,
    referrer text,
    city text,
    country text,
    user_agent text
);

create index if not exists idx_visits_ref on public.visits(ref);

-- 4. Vector Documents (Phase 2 RAG)
create table if not exists public.documents (
    id bigserial primary key,
    content text not null,
    metadata jsonb default '{}'::jsonb,
    embedding vector(768) -- Matches text-embedding-004 dimensions
);

create index if not exists idx_documents_embedding on public.documents using hnsw (embedding vector_cosine_ops);
```

## 2. Row Level Security (RLS)
- Service role key used by the backend has bypass privileges.
- Public anonymous access must be restricted from reading `leads` and private chat logs.
