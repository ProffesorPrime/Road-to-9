-- Road to 9 — database setup
-- Paste this whole file into Supabase → SQL Editor → New query, then press Run.
-- Run it once on a new, empty project.

-- ---------- Tables ----------

-- One row per person who can log in.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('tutor', 'student', 'parent')),
  first_name text not null,
  board text,
  tier text,
  consent_recorded_at timestamptz,         -- when the tutor confirmed parental consent (students)
  created_at timestamptz not null default now()
);

-- Which parent can see which student.
create table if not exists public.parent_links (
  parent_id uuid not null references public.profiles on delete cascade,
  student_id uuid not null references public.profiles on delete cascade,
  primary key (parent_id, student_id)
);

-- Each student's XP, streaks, badges and per-topic counts.
create table if not exists public.progress (
  student_id uuid primary key references public.profiles on delete cascade,
  xp int not null default 0,
  day_streak int not null default 0,
  last_day date,
  clean_run int not null default 0,
  combo int not null default 0,
  badges text[] not null default '{}',
  topics jsonb not null default '{}'::jsonb,             -- per topic: c correct, a attempts, h helped, l lesson done
  placement jsonb,                                       -- latest Grade Check result: { grade, at, answered }
  arcade_best int not null default 0,                    -- Arcade high score
  updated_at timestamptz not null default now()
);

-- Questions the server generated. Holds the answers, so students can never read this table.
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles on delete cascade,
  topic text not null,
  payload jsonb not null,
  wrong int not null default 0,
  helped boolean not null default false,
  hint_idx int not null default 0,
  done boolean not null default false,
  last_answer text,
  created_at timestamptz not null default now()
);
create index if not exists questions_student_idx on public.questions (student_id, created_at desc);

-- Every answer submitted (for reports and "last active").
create table if not exists public.attempts (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.profiles on delete cascade,
  topic text not null,
  correct boolean not null,
  helped boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists attempts_student_idx on public.attempts (student_id, created_at desc);

-- Daily usage counters for Professor Prime (keeps AI costs under control).
create table if not exists public.prime_usage (
  student_id uuid not null references public.profiles on delete cascade,
  day date not null,
  kind text not null,
  count int not null default 0,
  primary key (student_id, day, kind)
);

-- A copy of every Professor Prime conversation, so the tutor can review them (safeguarding).
create table if not exists public.prime_log (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.profiles on delete cascade,
  topic text,
  student_text text not null,
  prime_text text not null,
  created_at timestamptz not null default now()
);
create index if not exists prime_log_student_idx on public.prime_log (student_id, created_at desc);

-- ---------- Helper functions ----------

create or replace function public.is_tutor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor');
$$;

create or replace function public.is_parent_of(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.parent_links where parent_id = auth.uid() and student_id = sid);
$$;

-- Adds 1 to today's counter if it is still under the limit. Returns false when the limit is reached.
create or replace function public.bump_usage(p_student uuid, p_kind text, p_limit int) returns boolean
language plpgsql security definer set search_path = public as $$
declare c int;
begin
  -- Only the website's server (service role) may use this counter.
  if coalesce(current_setting('request.jwt.claims', true)::json ->> 'role', '') <> 'service_role' then
    raise exception 'not allowed';
  end if;
  insert into public.prime_usage (student_id, day, kind, count)
  values (p_student, current_date, p_kind, 1)
  on conflict (student_id, day, kind)
  do update set count = public.prime_usage.count + 1
  where public.prime_usage.count < p_limit
  returning count into c;
  return c is not null;
end;
$$;
revoke execute on function public.bump_usage(uuid, text, int) from public, anon, authenticated;
grant execute on function public.bump_usage(uuid, text, int) to service_role;

-- ---------- Row level security ----------
-- The website writes everything through the server. These rules only control
-- what a logged-in person could read directly, and they default to "nothing".

alter table public.profiles enable row level security;
alter table public.parent_links enable row level security;
alter table public.progress enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.prime_usage enable row level security;
alter table public.prime_log enable row level security;

create policy "read profiles" on public.profiles for select
  using (id = auth.uid() or public.is_tutor() or public.is_parent_of(id));

create policy "read links" on public.parent_links for select
  using (parent_id = auth.uid() or public.is_tutor());

create policy "read progress" on public.progress for select
  using (student_id = auth.uid() or public.is_tutor() or public.is_parent_of(student_id));

create policy "read attempts" on public.attempts for select
  using (student_id = auth.uid() or public.is_tutor() or public.is_parent_of(student_id));

create policy "read usage" on public.prime_usage for select
  using (student_id = auth.uid() or public.is_tutor());

create policy "read prime log" on public.prime_log for select
  using (public.is_tutor());

-- questions: no policy on purpose, so nobody can read answers from the browser.
