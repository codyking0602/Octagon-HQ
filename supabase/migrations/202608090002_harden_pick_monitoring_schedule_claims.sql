-- Harden the automatic Picks monitoring scheduler without changing its owner.
-- This follow-up preserves the immutable 202608090001 migration while adding:
-- unresolved-only finding suppression, short execution claims, bounded release/retry,
-- atomic evidence-plus-cadence completion, and a longer source-preview timeout.

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

-- Replace the initial interval reservation with a short execution lease. The next cadence
-- boundary is committed only after evidence is recorded successfully.
drop function if exists public.claim_pick_monitoring_schedule(text, timestamptz, timestamptz);

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

-- Update the one canonical job in place and keep it inactive until the trusted deployment
-- owner explicitly applies the PR/main activation boundary.
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

select cron.alter_job(
  (select jobid from cron.job where jobname = 'octagon-hq-pick-monitoring'),
  active := false
);
