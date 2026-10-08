-- ============================================================
-- TalentOS — Supabase Schema (matches 03_ARCHITECTURE.md)
-- Run this in Supabase SQL Editor (fresh project)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('recruiter','approver','auditor')),
  name       text not null,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- ============================================================
-- REQUISITIONS
-- ============================================================
create table public.requisitions (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  location         text not null,
  employment_type  text not null check (employment_type in ('full-time','contract','part-time')),
  skills           text[] not null default '{}',
  comp_min         integer,
  comp_max         integer,
  automatable_share numeric(4,3) default 0,
  status           text not null default 'open' check (status in ('open','filled','closed')),
  created_by       uuid references public.profiles(id),
  created_at       timestamptz default now()
);
alter table public.requisitions enable row level security;
create policy "Authenticated read requisitions" on public.requisitions for select using (auth.role() = 'authenticated');
create policy "Recruiter insert requisitions" on public.requisitions for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- CANDIDATES
-- ============================================================
create table public.candidates (
  id               uuid primary key default uuid_generate_v4(),
  full_name        text not null,
  email            text not null,
  phone            text,
  location         text,
  pool_type        text not null check (pool_type in ('internal','contractor','external')),
  source_channel   text,
  resume_text      text,
  expected_comp    integer,
  available_from   date,
  id_doc_hash      text,
  created_at       timestamptz default now()
);
alter table public.candidates enable row level security;
create policy "Authenticated read candidates" on public.candidates for select using (auth.role() = 'authenticated');

-- ============================================================
-- EMPLOYMENT HISTORY
-- ============================================================
create table public.employment_history (
  id           uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  employer     text not null,
  title        text not null,
  start_date   date not null,
  end_date     date,
  full_time    boolean default true
);
alter table public.employment_history enable row level security;
create policy "Authenticated read employment" on public.employment_history for select using (auth.role() = 'authenticated');

-- ============================================================
-- CREDENTIALS
-- ============================================================
create table public.credentials (
  id           uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  type         text not null,
  issuer       text,
  claimed_year integer
);
alter table public.credentials enable row level security;
create policy "Authenticated read credentials" on public.credentials for select using (auth.role() = 'authenticated');

-- ============================================================
-- VERIFICATIONS (simulated adapters)
-- ============================================================
create table public.verifications (
  id           uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  type         text not null check (type in ('identity','credential','employment','reference')),
  status       text not null check (status in ('verified','review','failed')),
  evidence     jsonb default '{}',
  provider     text not null default 'simulated',
  verified_at  timestamptz default now()
);
alter table public.verifications enable row level security;
create policy "Authenticated read verifications" on public.verifications for select using (auth.role() = 'authenticated');

-- ============================================================
-- FRAUD SIGNALS
-- ============================================================
create table public.fraud_signals (
  id           uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  type         text not null check (type in ('duplicate','overlap','id_mismatch','keyword_stuffing')),
  severity     text not null check (severity in ('high','medium','low')),
  evidence     jsonb default '{}',
  detected_at  timestamptz default now()
);
alter table public.fraud_signals enable row level security;
create policy "Authenticated read fraud_signals" on public.fraud_signals for select using (auth.role() = 'authenticated');

-- ============================================================
-- SKILL ASSESSMENTS
-- ============================================================
create table public.skill_assessments (
  id           uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  skill        text not null,
  score        numeric(5,2),
  proof        jsonb default '{}',
  assessed_at  timestamptz default now()
);
alter table public.skill_assessments enable row level security;
create policy "Authenticated read skill_assessments" on public.skill_assessments for select using (auth.role() = 'authenticated');

-- ============================================================
-- TRUST PASSPORTS
-- ============================================================
create table public.passports (
  id           uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  payload      jsonb not null,
  signature    text not null,
  issued_at    timestamptz default now()
);
alter table public.passports enable row level security;
create policy "Anyone read passports" on public.passports for select using (true);

-- ============================================================
-- BENCHMARKS (synthetic, labelled illustrative)
-- ============================================================
create table public.benchmarks (
  id             uuid primary key default uuid_generate_v4(),
  role           text not null,
  location       text not null,
  comp_p25       integer,
  comp_p50       integer,
  comp_p75       integer,
  avg_days_to_fill integer
);
alter table public.benchmarks enable row level security;
create policy "Authenticated read benchmarks" on public.benchmarks for select using (auth.role() = 'authenticated');

-- ============================================================
-- CHANNEL STATS (synthetic)
-- ============================================================
create table public.channel_stats (
  id         uuid primary key default uuid_generate_v4(),
  channel    text not null,
  applicants integer default 0,
  interviews integer default 0,
  hires      integer default 0
);
alter table public.channel_stats enable row level security;
create policy "Authenticated read channel_stats" on public.channel_stats for select using (auth.role() = 'authenticated');

-- ============================================================
-- MATCH SCORES
-- ============================================================
create table public.match_scores (
  id                  uuid primary key default uuid_generate_v4(),
  requisition_id      uuid not null references public.requisitions(id) on delete cascade,
  candidate_id        uuid not null references public.candidates(id) on delete cascade,
  skill_match         numeric(4,3) default 0,
  trust_score         numeric(5,2) default 0,
  comp_fit            numeric(4,3) default 0,
  location_fit        numeric(4,3) default 0,
  availability        numeric(4,3) default 0,
  channel_conversion  numeric(4,3) default 0,
  probability         numeric(4,3) default 0,
  signals             jsonb default '{}',
  computed_at         timestamptz default now(),
  unique(requisition_id, candidate_id)
);
alter table public.match_scores enable row level security;
create policy "Authenticated read match_scores" on public.match_scores for select using (auth.role() = 'authenticated');

-- ============================================================
-- DECISIONS (Build/Buy/Borrow/Automate/Relocate)
-- ============================================================
create table public.decisions (
  id             uuid primary key default uuid_generate_v4(),
  requisition_id uuid not null references public.requisitions(id) on delete cascade,
  recommendation text not null check (recommendation in ('build','buy','borrow','automate','relocate')),
  rationale      jsonb default '{}',
  created_at     timestamptz default now()
);
alter table public.decisions enable row level security;
create policy "Authenticated read decisions" on public.decisions for select using (auth.role() = 'authenticated');

-- ============================================================
-- AGENT RUNS
-- ============================================================
create table public.agent_runs (
  id             uuid primary key default uuid_generate_v4(),
  agent          text not null check (agent in ('screening','outreach','scheduling','copilot')),
  requisition_id uuid references public.requisitions(id),
  candidate_id   uuid references public.candidates(id),
  input          jsonb default '{}',
  output         jsonb default '{}',
  model          text,
  confidence     numeric(4,3),
  status         text not null default 'pending' check (status in ('pending','done','exception')),
  created_at     timestamptz default now()
);
alter table public.agent_runs enable row level security;
create policy "Authenticated read agent_runs" on public.agent_runs for select using (auth.role() = 'authenticated');

-- ============================================================
-- APPROVALS
-- ============================================================
create table public.approvals (
  id           uuid primary key default uuid_generate_v4(),
  agent_run_id uuid not null references public.agent_runs(id) on delete cascade,
  state        text not null default 'pending' check (state in ('pending','approved','rejected','exception')),
  approver_id  uuid references public.profiles(id),
  reason       text,
  decided_at   timestamptz
);
alter table public.approvals enable row level security;
create policy "Authenticated read approvals" on public.approvals for select using (auth.role() = 'authenticated');
create policy "Approver update approvals" on public.approvals for update using (auth.role() = 'authenticated');

-- ============================================================
-- AUDIT LOG (hash-chained, insert-only)
-- ============================================================
create table public.audit_log (
  id          bigserial primary key,
  ts          timestamptz not null default now(),
  actor_type  text not null check (actor_type in ('user','agent','system')),
  actor_id    text not null,
  action      text not null,
  entity_type text not null,
  entity_id   text not null,
  payload     jsonb default '{}',
  prev_hash   text not null default '',
  hash        text not null
);
alter table public.audit_log enable row level security;
-- Insert-only: no update/delete allowed at RLS level
create policy "Authenticated read audit_log" on public.audit_log for select using (auth.role() = 'authenticated');
create policy "System insert audit_log" on public.audit_log for insert with check (auth.role() = 'authenticated');

-- Indexes for performance
create index on public.candidates(email);
create index on public.candidates(phone);
create index on public.candidates(id_doc_hash);
create index on public.match_scores(requisition_id);
create index on public.audit_log(entity_type, entity_id);
create index on public.audit_log(ts desc);
