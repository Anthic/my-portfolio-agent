-- ========================================================
-- Supabase Schema for Portfolio AI Agent
-- Copy and run this in your Supabase Dashboard -> SQL Editor
-- ========================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. Leads Table (Recruiter & client details captured by AI agent)
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

-- 2. Chat Sessions & Messages Table (Audit and context)
create table if not exists public.chats (
    id uuid primary key default uuid_generate_v4(),
    session_id text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    role text not null check (role in ('user', 'assistant', 'system', 'tool')),
    content text not null,
    tool_calls jsonb
);

create index if not exists idx_chats_session_id on public.chats(session_id);

-- 3. Visits Table (Traffic and referral tracking e.g. ?ref=google)
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
