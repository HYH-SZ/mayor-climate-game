create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project text not null default '市长气候模拟游戏',
  budget_used integer,
  score integer,
  metrics jsonb not null default '{}'::jsonb,
  layout jsonb not null default '[]'::jsonb,
  survey jsonb not null default '{}'::jsonb,
  raw_result jsonb not null default '{}'::jsonb
);

alter table public.game_results enable row level security;

-- The website inserts through the Vercel serverless function with the
-- service role key stored as a Vercel environment variable.
-- Do not expose the service role key in browser code.