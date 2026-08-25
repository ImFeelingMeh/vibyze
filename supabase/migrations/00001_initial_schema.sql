-- Vibyze MVP schema
-- Tables: profiles, projects, scans, issues
-- RLS: users can only access their own data.

-- ============ profiles ============
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid () = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid () = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid () = id)
  with check (auth.uid () = id);

-- Auto-create a profile whenever a user signs up.
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user ();

-- ============ projects ============
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);

alter table public.projects enable row level security;

drop policy if exists "Users can view own projects" on public.projects;
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid () = user_id);

drop policy if exists "Users can insert own projects" on public.projects;
create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid () = user_id);

drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);

drop policy if exists "Users can delete own projects" on public.projects;
create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid () = user_id);

-- ============ scans ============
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid (),
  project_id uuid not null references public.projects (id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'completed', 'failed')),
  score integer check (score between 0 and 100),
  category_scores jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists scans_project_id_idx on public.scans (project_id);
create index if not exists scans_created_at_idx on public.scans (created_at desc);

alter table public.scans enable row level security;

drop policy if exists "Users can view own project scans" on public.scans;
create policy "Users can view own project scans"
  on public.scans for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = scans.project_id and p.user_id = auth.uid ()
    )
  );

drop policy if exists "Users can insert scans for own projects" on public.scans;
create policy "Users can insert scans for own projects"
  on public.scans for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = scans.project_id and p.user_id = auth.uid ()
    )
  );

drop policy if exists "Users can update own project scans" on public.scans;
create policy "Users can update own project scans"
  on public.scans for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = scans.project_id and p.user_id = auth.uid ()
    )
  );

drop policy if exists "Users can delete own project scans" on public.scans;
create policy "Users can delete own project scans"
  on public.scans for delete
  using (
    exists (
      select 1 from public.projects p
      where p.id = scans.project_id and p.user_id = auth.uid ()
    )
  );

-- ============ issues ============
create table if not exists public.issues (
  id uuid primary key default gen_random_uuid (),
  scan_id uuid not null references public.scans (id) on delete cascade,
  category text not null
    check (category in ('security', 'performance', 'seo', 'accessibility', 'mobile', 'ux', 'code_quality')),
  title text not null,
  description text not null,
  impact text,
  severity text not null
    check (severity in ('critical', 'high', 'medium', 'low', 'info')),
  confidence integer check (confidence between 0 and 100),
  evidence jsonb,
  recommendation text,
  ai_prompt text,
  created_at timestamptz not null default now()
);

create index if not exists issues_scan_id_idx on public.issues (scan_id);
create index if not exists issues_severity_idx on public.issues (severity);

alter table public.issues enable row level security;

drop policy if exists "Users can view own scan issues" on public.issues;
create policy "Users can view own scan issues"
  on public.issues for select
  using (
    exists (
      select 1 from public.scans s
      join public.projects p on p.id = s.project_id
      where s.id = issues.scan_id and p.user_id = auth.uid ()
    )
  );

drop policy if exists "Users can insert issues for own scans" on public.issues;
create policy "Users can insert issues for own scans"
  on public.issues for insert
  with check (
    exists (
      select 1 from public.scans s
      join public.projects p on p.id = s.project_id
      where s.id = issues.scan_id and p.user_id = auth.uid ()
    )
  );
