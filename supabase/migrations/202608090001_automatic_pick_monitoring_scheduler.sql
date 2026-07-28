-- Automatic UFC Picks monitoring, first production-safe slice.
-- One hourly database job invokes the existing monitoring Edge Function. The function
-- decides whether a provider call is due from canonical event/lock timestamps.
-- This migration installs the job inactive so exact-head PR deployment consumes no quota;
-- the canonical main deployment owner enables it only after merge.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

create table if not exists public.pick_monitoring_schedule_state (
  source_event_identity text primary key,
  next_eligible_at timestamptz not null default '-infinity',
  lease_until timestamptz,
  last_claimed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint pick_monitoring_schedule_identity check (length(trim(source_event_identity)) > 0),
  constraint pick_monitoring_schedule_lease_order check (
    lease_until is null or last_claimed_at is null or lease_until >= last_claimed_at
  )
);

alter table public.pick_monitoring_schedule_state enable row level security;
revoke all on table public.pick_monitoring_schedule_state from public, anon, authenticated;

-- Service-only canonical projection for the existing monitoring runner. This reads the
-- same staged and published tables; it does not create another card or identity owner.
create or replace function public.get_pick_monitoring_event_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_staged jsonb;
  v_current jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to read pick monitoring event state';
  end if;

  select jsonb_build_object(
    'event_id', draft.event_id,
    'source_event_key', draft.source_event_key,
    'name', draft.name,
    'subtitle', draft.subtitle,
    'starts_at', draft.starts_at,
    'locks_at', draft.locks_at,
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_name', bout.blue_fighter_name
      ) order by bout.position)
      from public.pick_event_draft_bouts bout
      where bout.draft_id = draft.draft_id and bout.included
    ), '[]'::jsonb)
  ) into v_staged
  from public.pick_event_drafts draft
  where draft.state = 'staged'
  order by draft.synced_at desc
  limit 1;

  select jsonb_build_object(
    'event_id', event.event_id,
    'name', event.name,
    'subtitle', event.subtitle,
    'starts_at', event.starts_at,
    'locks_at', event.locks_at,
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_name', bout.blue_fighter_name,
        'red_american_odds', bout.red_american_odds,
        'blue_american_odds', bout.blue_american_odds
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  ) into v_current
  from public.pick_events event
  where event.status in ('upcoming', 'locked')
  order by event.starts_at asc
  limit 1;

  return jsonb_build_object('staged', v_staged, 'current', v_current);
end;
$$;
revoke all on function public.get_pick_monitoring_event_state() from public, anon, authenticated;
grant execute on function public.get_pick_monitoring_event_state() to service_role;

create or replace function public.get_pick_monitoring_schedule_state(p_source_event_identity text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_last public.pick_monitoring_runs;
  v_schedule public.pick_monitoring_schedule_state;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to read pick monitoring schedule state';
  end if;

  select run.* into v_last
  from public.pick_monitoring_runs run
  where run.source_event_identity = p_source_event_identity
  order by coalesce(run.completed_at, run.started_at) desc, run.created_at desc
  limit 1;

  select state.* into v_schedule
  from public.pick_monitoring_schedule_state state
  where state.source_event_identity = p_source_event_identity;

  return jsonb_build_object(
    'last_completed_at', v_last.completed_at,
    'provider_requests_remaining', v_last.provider_requests_remaining,
    'next_eligible_at', v_schedule.next_eligible_at,
    'lease_until', v_schedule.lease_until,
    'existing_finding_keys', coalesce((
      select jsonb_agg(keys.finding_key order by keys.finding_key)
      from (
        select distinct finding.finding_key
        from public.pick_monitoring_findings finding
        join public.pick_monitoring_runs run on run.run_id = finding.run_id
        where run.source_event_identity = p_source_event_identity
          and finding.review_status = 'new'
      ) keys
    ), '[]'::jsonb)
  );
end;
$$;
revoke all on function public.get_pick_monitoring_schedule_state(text) from public, anon, authenticated;
grant execute on function public.get_pick_monitoring_schedule_state(text) to service_role;

-- A claim reserves only a short execution lease. The next cadence boundary is written
-- atomically with scheduled evidence after the canonical writer succeeds. If the worker
-- crashes, the lease expires and the still-due event can be retried safely.
create or replace function public.claim_pick_monitoring_schedule(
  p_source_event_identity text,
  p_now timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_claimed text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to claim pick monitoring schedule';
  end if;
  if length(trim(coalesce(p_source_event_identity, ''))) = 0 then
    raise exception 'invalid pick monitoring schedule claim';
  end if;

  insert into public.pick_monitoring_schedule_state (
    source_event_identity, lease_until, last_claimed_at, updated_at
  ) values (
    p_source_event_identity, p_now + interval '15 minutes', p_now, now()
  )
  on conflict (source_event_identity) do update
  set lease_until = excluded.lease_until,
      last_claimed_at = excluded.last_claimed_at,
      updated_at = now()
  where public.pick_monitoring_schedule_state.next_eligible_at <= p_now
    and (
      public.pick_monitoring_schedule_state.lease_until is null
      or public.pick_monitoring_schedule_state.lease_until <= p_now
    )
  returning source_event_identity into v_claimed;

  return v_claimed is not null;
end;
$$;
revoke all on function public.claim_pick_monitoring_schedule(text, timestamptz) from public, anon, authenticated;
grant execute on function public.claim_pick_monitoring_schedule(text, timestamptz) to service_role;

-- Handled pre-provider failures can release the exact claim with a bounded retry time.
-- Matching last_claimed_at prevents a stale invocation from releasing a newer lease.
create or replace function public.release_pick_monitoring_schedule(
  p_source_event_identity text,
  p_claimed_at timestamptz,
  p_retry_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to release pick monitoring schedule';
  end if;
  if length(trim(coalesce(p_source_event_identity, ''))) = 0
    or p_retry_at <= p_claimed_at then
    raise exception 'invalid pick monitoring schedule release';
  end if;

  update public.pick_monitoring_schedule_state
  set next_eligible_at = p_retry_at,
      lease_until = null,
      updated_at = now()
  where source_event_identity = p_source_event_identity
    and last_claimed_at = p_claimed_at
    and lease_until is not null;

  return found;
end;
$$;
revoke all on function public.release_pick_monitoring_schedule(text, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.release_pick_monitoring_schedule(text, timestamptz, timestamptz) to service_role;

-- Scheduled evidence still uses record_pick_monitoring_run as the sole evidence writer.
-- This wrapper makes the evidence insert and schedule completion one database transaction.
create or replace function public.record_scheduled_pick_monitoring_run(
  p_payload jsonb,
  p_claimed_at timestamptz,
  p_next_eligible_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_event_identity text := trim(coalesce(p_payload->>'source_event_identity', ''));
  v_run_id uuid;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to record scheduled pick monitoring evidence';
  end if;
  if p_payload->>'trigger_kind' is distinct from 'scheduled'
    or length(v_source_event_identity) = 0
    or p_next_eligible_at <= p_claimed_at then
    raise exception 'invalid scheduled pick monitoring completion';
  end if;

  v_run_id := public.record_pick_monitoring_run(p_payload);

  update public.pick_monitoring_schedule_state
  set next_eligible_at = p_next_eligible_at,
      lease_until = null,
      updated_at = now()
  where source_event_identity = v_source_event_identity
    and last_claimed_at = p_claimed_at
    and lease_until is not null;

  if not found then
    raise exception 'scheduled pick monitoring claim is missing or stale';
  end if;

  return v_run_id;
end;
$$;
revoke all on function public.record_scheduled_pick_monitoring_run(jsonb, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.record_scheduled_pick_monitoring_run(jsonb, timestamptz, timestamptz) to service_role;

-- The database generates and retains the scheduler credential. Its plaintext is never
-- committed, printed, or copied into the browser or GitHub secrets.
do $$
begin
  if not exists (
    select 1 from vault.secrets where name = 'octagon_pick_monitoring_scheduler_token'
  ) then
    perform vault.create_secret(
      replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
      'octagon_pick_monitoring_scheduler_token',
      'Database-only credential for the canonical Octagon HQ Picks monitoring cron job.'
    );
  end if;
end;
$$;

create or replace function public.authorize_pick_monitoring_scheduler(p_token text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to authorize pick monitoring scheduler';
  end if;

  return exists (
    select 1
    from vault.decrypted_secrets secret
    where secret.name = 'octagon_pick_monitoring_scheduler_token'
      and length(coalesce(p_token, '')) >= 32
      and secret.decrypted_secret = p_token
  );
end;
$$;
revoke all on function public.authorize_pick_monitoring_scheduler(text) from public, anon, authenticated;
grant execute on function public.authorize_pick_monitoring_scheduler(text) to service_role;

-- Scheduling the same named job is idempotent and updates its command in place.
select cron.schedule(
  'octagon-hq-pick-monitoring',
  '7 * * * *',
  $job$
    select net.http_post(
      url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/run-pick-monitoring',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-octagon-scheduler-token', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'octagon_pick_monitoring_scheduler_token'
        )
      ),
      body := '{"mode":"scheduled"}'::jsonb,
      timeout_milliseconds := 60000
    ) as request_id;
  $job$
);

-- Exact-head PR backend deployment must never perform a real provider-backed run.
select cron.alter_job(
  (select jobid from cron.job where jobname = 'octagon-hq-pick-monitoring'),
  active := false
);

create or replace function public.set_pick_monitoring_scheduler_enabled(p_enabled boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job_id bigint;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to configure pick monitoring scheduler';
  end if;

  select jobid into v_job_id
  from cron.job
  where jobname = 'octagon-hq-pick-monitoring';
  if v_job_id is null then
    raise exception 'pick monitoring scheduler job is missing';
  end if;

  perform cron.alter_job(v_job_id, active := p_enabled);
  return public.get_pick_monitoring_scheduler_health();
end;
$$;

create or replace function public.get_pick_monitoring_scheduler_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_job cron.job;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to inspect pick monitoring scheduler';
  end if;

  select job.* into v_job
  from cron.job job
  where job.jobname = 'octagon-hq-pick-monitoring';

  return jsonb_build_object(
    'job_id', v_job.jobid,
    'job_name', v_job.jobname,
    'schedule', v_job.schedule,
    'active', coalesce(v_job.active, false),
    'token_configured', exists (
      select 1 from vault.secrets where name = 'octagon_pick_monitoring_scheduler_token'
    ),
    'function_name', 'run-pick-monitoring'
  );
end;
$$;

revoke all on function public.set_pick_monitoring_scheduler_enabled(boolean) from public, anon, authenticated;
revoke all on function public.get_pick_monitoring_scheduler_health() from public, anon, authenticated;
grant execute on function public.set_pick_monitoring_scheduler_enabled(boolean) to service_role;
grant execute on function public.get_pick_monitoring_scheduler_health() to service_role;
