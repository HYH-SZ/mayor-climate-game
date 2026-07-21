create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text,
  study_phase text not null default 'complete',
  project text not null default '市长气候模拟游戏',
  budget_used integer,
  score integer,
  metrics jsonb not null default '{}'::jsonb,
  layout jsonb not null default '[]'::jsonb,
  survey jsonb not null default '{}'::jsonb,
  pre_survey jsonb not null default '{}'::jsonb,
  post_survey jsonb not null default '{}'::jsonb,
  raw_result jsonb not null default '{}'::jsonb
);

create unique index if not exists game_results_session_id_key
  on public.game_results (session_id)
  where session_id is not null;

alter table public.game_results enable row level security;

-- The website inserts through the Vercel serverless function with the
-- service role key stored as a Vercel environment variable.
-- Do not expose the service role key in browser code.

-- If upgrading an existing table, run:
-- alter table public.game_results add column if not exists session_id text;
-- alter table public.game_results add column if not exists study_phase text not null default 'complete';
-- alter table public.game_results add column if not exists pre_survey jsonb not null default '{}'::jsonb;
-- alter table public.game_results add column if not exists post_survey jsonb not null default '{}'::jsonb;
-- create unique index if not exists game_results_session_id_key on public.game_results (session_id) where session_id is not null;
