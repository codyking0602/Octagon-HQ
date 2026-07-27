-- Phase 1 automated card and odds monitoring, slice 2: private reviewable storage.
-- This migration records evidence only. It does not fetch sources, schedule work,
-- publish cards, update canonical bout odds, alter picks, or change scoring.

create table if not exists public.pick_monitoring_runs (
  run_id uuid primary key default gen_random_uuid(),
  trigger_kind text not null,
  status text not null,
  source_event_identity text not null,
  event_id text references public.pick_events(event_id) on delete set null,
  observed_locks_at timestamptz,
  started_at timestamptz not null,
  completed_at timestamptz,
  card_source text,
  card_source_url text,
  odds_provider text,
  provider_requests_remaining integer,
  provider_requests_used integer,
  provider_last_request_cost integer,
  provider_event_count integer not null default 0,
  complete_snapshot_count integer not null default 0,
  missing_snapshot_count integer not null default 0,
  diagnostics jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint pick_monitoring_run_trigger check (trigger_kind in ('scheduled','manual')),
  constraint pick_monitoring_run_status check (status in ('completed','partial','failed')),
  constraint pick_monitoring_run_identity check (length(trim(source_event_identity)) > 0),
  constraint pick_monitoring_run_time_order check (completed_at is null or completed_at >= started_at),
  constraint pick_monitoring_run_quota_nonnegative check (
    (provider_requests_remaining is null or provider_requests_remaining >= 0)
    and (provider_requests_used is null or provider_requests_used >= 0)
    and (provider_last_request_cost is null or provider_last_request_cost >= 0)
  ),
  constraint pick_monitoring_run_coverage_nonnegative check (
    provider_event_count >= 0 and complete_snapshot_count >= 0 and missing_snapshot_count >= 0
  ),
  constraint pick_monitoring_run_diagnostics_array check (jsonb_typeof(diagnostics) = 'array')
);

create table if not exists public.pick_monitoring_findings (
  finding_id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.pick_monitoring_runs(run_id) on delete cascade,
  event_id text references public.pick_events(event_id) on delete set null,
  finding_key text not null,
  finding_type text not null,
  severity text not null,
  review_status text not null default 'new',
  matchup_identity text,
  bout_id text,
  summary text not null,
  before_value jsonb,
  after_value jsonb,
  source_details jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (run_id, finding_key),
  constraint pick_monitoring_finding_key check (length(trim(finding_key)) > 0),
  constraint pick_monitoring_finding_type check (
    finding_type in ('card_change','odds_change','unmatched_fight','provider_error','quota_warning')
  ),
  constraint pick_monitoring_finding_severity check (severity in ('info','warning','error')),
  constraint pick_monitoring_finding_review_status check (review_status in ('new','reviewed','dismissed')),
  constraint pick_monitoring_finding_summary check (length(trim(summary)) > 0),
  constraint pick_monitoring_finding_source_object check (jsonb_typeof(source_details) = 'object'),
  constraint pick_monitoring_finding_review_shape check (
    (review_status = 'new' and reviewed_at is null and reviewed_by is null)
    or (review_status in ('reviewed','dismissed') and reviewed_at is not null and reviewed_by is not null)
  )
);

create table if not exists public.pick_monitoring_odds_snapshots (
  snapshot_id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.pick_monitoring_runs(run_id) on delete cascade,
  event_id text,
  bout_id text,
  provider text not null,
  sport_key text not null,
  source_event_id text not null,
  source_event_identity text not null,
  matchup_identity text not null,
  commence_time timestamptz not null,
  sportsbook text not null,
  sportsbook_title text not null,
  sportsbook_updated_at timestamptz not null,
  fetched_at timestamptz not null,
  observed_locks_at timestamptz,
  eligible_before_lock boolean generated always as (
    observed_locks_at is not null and fetched_at < observed_locks_at
  ) stored,
  fighter_one_name text not null,
  fighter_one_identity text not null,
  fighter_one_american_odds integer not null,
  fighter_two_name text not null,
  fighter_two_identity text not null,
  fighter_two_american_odds integer not null,
  created_at timestamptz not null default now(),
  unique (run_id, source_event_id, matchup_identity),
  foreign key (event_id, bout_id)
    references public.pick_bouts(event_id, bout_id) on delete set null,
  constraint pick_monitoring_snapshot_event_bout_shape check (bout_id is null or event_id is not null),
  constraint pick_monitoring_snapshot_provider check (provider = 'the-odds-api'),
  constraint pick_monitoring_snapshot_sport check (sport_key = 'mma_mixed_martial_arts'),
  constraint pick_monitoring_snapshot_sportsbook check (sportsbook in ('draftkings','fanduel')),
  constraint pick_monitoring_snapshot_source_event check (length(trim(source_event_id)) > 0),
  constraint pick_monitoring_snapshot_source_identity check (length(trim(source_event_identity)) > 0),
  constraint pick_monitoring_snapshot_matchup check (length(trim(matchup_identity)) > 0),
  constraint pick_monitoring_snapshot_distinct_fighters check (fighter_one_identity <> fighter_two_identity),
  constraint pick_monitoring_snapshot_fighter_one_odds check (
    fighter_one_american_odds <= -100 or fighter_one_american_odds >= 100
  ),
  constraint pick_monitoring_snapshot_fighter_two_odds check (
    fighter_two_american_odds <= -100 or fighter_two_american_odds >= 100
  )
);

create index if not exists pick_monitoring_runs_event_created_idx
  on public.pick_monitoring_runs (event_id, created_at desc);
create index if not exists pick_monitoring_findings_review_idx
  on public.pick_monitoring_findings (review_status, detected_at desc);
create index if not exists pick_monitoring_odds_matchup_idx
  on public.pick_monitoring_odds_snapshots (event_id, matchup_identity, fetched_at desc);

alter table public.pick_monitoring_runs enable row level security;
alter table public.pick_monitoring_findings enable row level security;
alter table public.pick_monitoring_odds_snapshots enable row level security;
revoke all on table public.pick_monitoring_runs, public.pick_monitoring_findings,
  public.pick_monitoring_odds_snapshots from public, anon, authenticated;

-- Runs and snapshots are immutable evidence. Findings preserve immutable evidence while
-- allowing a future owner-only review RPC to change only review_status/reviewed_at/reviewed_by.
create or replace function public.protect_pick_monitoring_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'pick monitoring evidence is append-only';
  end if;

  if tg_table_name = 'pick_monitoring_findings' then
    if (to_jsonb(new) - 'review_status' - 'reviewed_at' - 'reviewed_by')
      is distinct from
      (to_jsonb(old) - 'review_status' - 'reviewed_at' - 'reviewed_by') then
      raise exception 'pick monitoring finding evidence is immutable';
    end if;
    return new;
  end if;

  raise exception 'pick monitoring evidence is append-only';
end;
$$;
revoke all on function public.protect_pick_monitoring_evidence() from public, anon, authenticated;

drop trigger if exists protect_pick_monitoring_runs on public.pick_monitoring_runs;
create trigger protect_pick_monitoring_runs
before update or delete on public.pick_monitoring_runs
for each row execute function public.protect_pick_monitoring_evidence();

drop trigger if exists protect_pick_monitoring_findings on public.pick_monitoring_findings;
create trigger protect_pick_monitoring_findings
before update or delete on public.pick_monitoring_findings
for each row execute function public.protect_pick_monitoring_evidence();

drop trigger if exists protect_pick_monitoring_odds_snapshots on public.pick_monitoring_odds_snapshots;
create trigger protect_pick_monitoring_odds_snapshots
before update or delete on public.pick_monitoring_odds_snapshots
for each row execute function public.protect_pick_monitoring_evidence();

-- This is the sole Slice 2 write owner. It stores one run and its evidence atomically.
-- It deliberately never writes public.pick_events, public.pick_bouts, drafts, picks, or locks.
create or replace function public.record_pick_monitoring_run(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run_id uuid;
  v_trigger_kind text := coalesce(nullif(trim(p_payload->>'trigger_kind'),''), 'scheduled');
  v_status text := trim(coalesce(p_payload->>'status',''));
  v_source_event_identity text := trim(coalesce(p_payload->>'source_event_identity',''));
  v_event_id text := nullif(lower(trim(p_payload->>'event_id')), '');
  v_started_at timestamptz := coalesce(nullif(p_payload->>'started_at','')::timestamptz, now());
  v_completed_at timestamptz := nullif(p_payload->>'completed_at','')::timestamptz;
  v_payload_locks_at timestamptz := nullif(p_payload->>'locks_at','')::timestamptz;
  v_observed_locks_at timestamptz;
  v_diagnostics jsonb := coalesce(p_payload->'diagnostics', '[]'::jsonb);
  v_findings jsonb := coalesce(p_payload->'findings', '[]'::jsonb);
  v_snapshots jsonb := coalesce(p_payload->'odds_snapshots', '[]'::jsonb);
  v_finding jsonb;
  v_snapshot jsonb;
  v_prices jsonb;
  v_fetched_at timestamptz;
  v_bout_id text;
  v_fighter_one_odds integer;
  v_fighter_two_odds integer;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to record pick monitoring evidence';
  end if;
  if jsonb_typeof(p_payload) <> 'object' then
    raise exception 'pick monitoring payload must be an object';
  end if;
  if v_status not in ('completed','partial','failed') or v_source_event_identity = '' then
    raise exception 'pick monitoring run identity or status is invalid';
  end if;
  if jsonb_typeof(v_diagnostics) <> 'array'
    or jsonb_typeof(v_findings) <> 'array'
    or jsonb_typeof(v_snapshots) <> 'array' then
    raise exception 'pick monitoring diagnostics, findings, and odds snapshots must be arrays';
  end if;

  if v_event_id is not null then
    select event.locks_at into v_observed_locks_at
    from public.pick_events event
    where event.event_id = v_event_id;
    if not found then
      raise exception 'canonical pick event not found for monitoring run';
    end if;
    if v_payload_locks_at is not null and v_payload_locks_at is distinct from v_observed_locks_at then
      raise exception 'monitoring lock snapshot does not match canonical event';
    end if;
  else
    v_observed_locks_at := v_payload_locks_at;
  end if;

  insert into public.pick_monitoring_runs (
    trigger_kind, status, source_event_identity, event_id, observed_locks_at,
    started_at, completed_at, card_source, card_source_url, odds_provider,
    provider_requests_remaining, provider_requests_used, provider_last_request_cost,
    provider_event_count, complete_snapshot_count, missing_snapshot_count, diagnostics
  ) values (
    v_trigger_kind,
    v_status,
    v_source_event_identity,
    v_event_id,
    v_observed_locks_at,
    v_started_at,
    v_completed_at,
    nullif(trim(p_payload->>'card_source'),''),
    nullif(trim(p_payload->>'card_source_url'),''),
    nullif(trim(p_payload->>'odds_provider'),''),
    nullif(p_payload->'quota'->>'requests_remaining','')::integer,
    nullif(p_payload->'quota'->>'requests_used','')::integer,
    nullif(p_payload->'quota'->>'last_request_cost','')::integer,
    coalesce(nullif(p_payload->'coverage'->>'provider_events','')::integer, 0),
    coalesce(nullif(p_payload->'coverage'->>'complete_snapshots','')::integer, 0),
    coalesce(nullif(p_payload->'coverage'->>'missing_snapshots','')::integer, 0),
    v_diagnostics
  ) returning run_id into v_run_id;

  for v_finding in select value from jsonb_array_elements(v_findings)
  loop
    insert into public.pick_monitoring_findings (
      run_id, event_id, finding_key, finding_type, severity, review_status,
      matchup_identity, bout_id, summary, before_value, after_value,
      source_details, detected_at
    ) values (
      v_run_id,
      v_event_id,
      trim(coalesce(v_finding->>'finding_key','')),
      trim(coalesce(v_finding->>'finding_type','')),
      trim(coalesce(v_finding->>'severity','')),
      'new',
      nullif(trim(v_finding->>'matchup_identity'),''),
      nullif(trim(v_finding->>'bout_id'),''),
      trim(coalesce(v_finding->>'summary','')),
      v_finding->'before_value',
      v_finding->'after_value',
      coalesce(v_finding->'source_details', '{}'::jsonb),
      coalesce(nullif(v_finding->>'detected_at','')::timestamptz, v_completed_at, now())
    );
  end loop;

  for v_snapshot in select value from jsonb_array_elements(v_snapshots)
  loop
    v_prices := v_snapshot->'prices';
    if jsonb_typeof(v_prices) <> 'array' or jsonb_array_length(v_prices) <> 2 then
      raise exception 'monitoring odds snapshot must contain exactly two prices';
    end if;
    v_fetched_at := nullif(v_snapshot->>'fetched_at','')::timestamptz;
    v_bout_id := nullif(trim(v_snapshot->>'bout_id'),'');
    v_fighter_one_odds := (v_prices->0->>'american_odds')::integer;
    v_fighter_two_odds := (v_prices->1->>'american_odds')::integer;

    insert into public.pick_monitoring_odds_snapshots (
      run_id, event_id, bout_id, provider, sport_key, source_event_id,
      source_event_identity, matchup_identity, commence_time, sportsbook,
      sportsbook_title, sportsbook_updated_at, fetched_at, observed_locks_at,
      fighter_one_name, fighter_one_identity, fighter_one_american_odds,
      fighter_two_name, fighter_two_identity, fighter_two_american_odds
    ) values (
      v_run_id,
      v_event_id,
      v_bout_id,
      trim(coalesce(v_snapshot->>'provider','')),
      trim(coalesce(v_snapshot->>'sport_key','')),
      trim(coalesce(v_snapshot->>'source_event_id','')),
      trim(coalesce(v_snapshot->>'source_event_identity','')),
      trim(coalesce(v_snapshot->>'matchup_identity','')),
      (v_snapshot->>'commence_time')::timestamptz,
      trim(coalesce(v_snapshot->>'sportsbook','')),
      trim(coalesce(v_snapshot->>'sportsbook_title','')),
      (v_snapshot->>'sportsbook_updated_at')::timestamptz,
      v_fetched_at,
      v_observed_locks_at,
      trim(coalesce(v_prices->0->>'fighter_name','')),
      trim(coalesce(v_prices->0->>'fighter_identity','')),
      v_fighter_one_odds,
      trim(coalesce(v_prices->1->>'fighter_name','')),
      trim(coalesce(v_prices->1->>'fighter_identity','')),
      v_fighter_two_odds
    );
  end loop;

  return v_run_id;
end;
$$;
revoke all on function public.record_pick_monitoring_run(jsonb) from public, anon, authenticated;
grant execute on function public.record_pick_monitoring_run(jsonb) to service_role;

notify pgrst, 'reload schema';
