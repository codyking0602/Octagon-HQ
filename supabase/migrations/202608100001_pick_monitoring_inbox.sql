-- Owner-only monitoring inbox over the existing append-only monitoring ledger.
-- This migration adds no provider, scheduler, card-update, publication, scoring, or Picks owner.

create or replace function public.get_pick_monitoring_inbox()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_monitored_event jsonb;
  v_source_event_identity text;
  v_latest_run public.pick_monitoring_runs;
  v_schedule public.pick_monitoring_schedule_state;
  v_job cron.job;
  v_last_wake_status text;
  v_last_wake_started_at timestamptz;
  v_last_wake_ended_at timestamptz;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  select jsonb_build_object(
    'kind', 'staged',
    'event_id', draft.event_id,
    'source_event_identity', 'ufc:' || coalesce(nullif(trim(draft.source_event_key), ''), to_char(draft.starts_at at time zone 'UTC', 'YYYY-MM-DD')),
    'name', draft.name,
    'subtitle', draft.subtitle,
    'starts_at', draft.starts_at,
    'locks_at', draft.locks_at,
    'bout_count', (
      select count(*)::integer
      from public.pick_event_draft_bouts bout
      where bout.draft_id = draft.draft_id
        and bout.included
    )
  ) into v_monitored_event
  from public.pick_event_drafts draft
  where draft.state = 'staged'
  order by draft.synced_at desc
  limit 1;

  if v_monitored_event is null then
    select jsonb_build_object(
      'kind', 'current',
      'event_id', event.event_id,
      'source_event_identity', 'ufc:' || to_char(event.starts_at at time zone 'UTC', 'YYYY-MM-DD'),
      'name', event.name,
      'subtitle', event.subtitle,
      'starts_at', event.starts_at,
      'locks_at', event.locks_at,
      'bout_count', (
        select count(*)::integer
        from public.pick_bouts bout
        where bout.event_id = event.event_id
      )
    ) into v_monitored_event
    from public.pick_events event
    where event.status in ('upcoming', 'locked')
    order by event.starts_at asc
    limit 1;
  end if;

  v_source_event_identity := nullif(v_monitored_event->>'source_event_identity', '');

  select run.* into v_latest_run
  from public.pick_monitoring_runs run
  where v_source_event_identity is null
     or run.source_event_identity = v_source_event_identity
  order by coalesce(run.completed_at, run.started_at) desc, run.created_at desc
  limit 1;

  if v_source_event_identity is not null then
    select state.* into v_schedule
    from public.pick_monitoring_schedule_state state
    where state.source_event_identity = v_source_event_identity;
  end if;

  select job.* into v_job
  from cron.job job
  where job.jobname = 'octagon-hq-pick-monitoring';

  if v_job.jobid is not null then
    select detail.status, detail.start_time, detail.end_time
      into v_last_wake_status, v_last_wake_started_at, v_last_wake_ended_at
    from cron.job_run_details detail
    where detail.jobid = v_job.jobid
    order by detail.start_time desc
    limit 1;
  end if;

  return jsonb_build_object(
    'generated_at', now(),
    'scheduler', jsonb_build_object(
      'job_id', v_job.jobid,
      'job_name', v_job.jobname,
      'schedule', v_job.schedule,
      'active', coalesce(v_job.active, false),
      'token_configured', exists (
        select 1
        from vault.secrets secret
        where secret.name = 'octagon_pick_monitoring_scheduler_token'
      ),
      'last_wake_status', v_last_wake_status,
      'last_wake_started_at', v_last_wake_started_at,
      'last_wake_ended_at', v_last_wake_ended_at
    ),
    'monitored_event', v_monitored_event,
    'schedule_state', case
      when v_schedule.source_event_identity is null then null
      else jsonb_build_object(
        'source_event_identity', v_schedule.source_event_identity,
        'next_eligible_at', v_schedule.next_eligible_at,
        'lease_until', v_schedule.lease_until,
        'last_claimed_at', v_schedule.last_claimed_at,
        'updated_at', v_schedule.updated_at
      )
    end,
    'latest_run', case
      when v_latest_run.run_id is null then null
      else jsonb_build_object(
        'run_id', v_latest_run.run_id,
        'trigger_kind', v_latest_run.trigger_kind,
        'status', v_latest_run.status,
        'source_event_identity', v_latest_run.source_event_identity,
        'event_id', v_latest_run.event_id,
        'started_at', v_latest_run.started_at,
        'completed_at', v_latest_run.completed_at,
        'card_source', v_latest_run.card_source,
        'card_source_url', v_latest_run.card_source_url,
        'odds_provider', v_latest_run.odds_provider,
        'provider_requests_remaining', v_latest_run.provider_requests_remaining,
        'provider_requests_used', v_latest_run.provider_requests_used,
        'provider_last_request_cost', v_latest_run.provider_last_request_cost,
        'provider_event_count', v_latest_run.provider_event_count,
        'complete_snapshot_count', v_latest_run.complete_snapshot_count,
        'missing_snapshot_count', v_latest_run.missing_snapshot_count,
        'diagnostics', v_latest_run.diagnostics,
        'finding_count', (
          select count(*)::integer
          from public.pick_monitoring_findings finding
          where finding.run_id = v_latest_run.run_id
        ),
        'new_finding_count', (
          select count(*)::integer
          from public.pick_monitoring_findings finding
          where finding.run_id = v_latest_run.run_id
            and finding.review_status = 'new'
        )
      )
    end,
    'unresolved_count', (
      select count(*)::integer
      from public.pick_monitoring_findings finding
      join public.pick_monitoring_runs run on run.run_id = finding.run_id
      where finding.review_status = 'new'
        and (
          v_source_event_identity is null
          or run.source_event_identity = v_source_event_identity
        )
    ),
    'new_findings', coalesce((
      select jsonb_agg(jsonb_build_object(
        'finding_id', finding.finding_id,
        'run_id', finding.run_id,
        'trigger_kind', finding.trigger_kind,
        'run_status', finding.run_status,
        'finding_key', finding.finding_key,
        'finding_type', finding.finding_type,
        'severity', finding.severity,
        'review_status', finding.review_status,
        'matchup_identity', finding.matchup_identity,
        'bout_id', finding.bout_id,
        'summary', finding.summary,
        'before_value', finding.before_value,
        'after_value', finding.after_value,
        'source_details', finding.source_details,
        'detected_at', finding.detected_at,
        'reviewed_at', finding.reviewed_at
      ) order by finding.detected_at desc)
      from (
        select item.*, run.trigger_kind, run.status as run_status
        from public.pick_monitoring_findings item
        join public.pick_monitoring_runs run on run.run_id = item.run_id
        where item.review_status = 'new'
          and (
            v_source_event_identity is null
            or run.source_event_identity = v_source_event_identity
          )
        order by item.detected_at desc
        limit 50
      ) finding
    ), '[]'::jsonb),
    'reviewed_findings', coalesce((
      select jsonb_agg(jsonb_build_object(
        'finding_id', finding.finding_id,
        'run_id', finding.run_id,
        'trigger_kind', finding.trigger_kind,
        'run_status', finding.run_status,
        'finding_key', finding.finding_key,
        'finding_type', finding.finding_type,
        'severity', finding.severity,
        'review_status', finding.review_status,
        'matchup_identity', finding.matchup_identity,
        'bout_id', finding.bout_id,
        'summary', finding.summary,
        'before_value', finding.before_value,
        'after_value', finding.after_value,
        'source_details', finding.source_details,
        'detected_at', finding.detected_at,
        'reviewed_at', finding.reviewed_at
      ) order by finding.reviewed_at desc)
      from (
        select item.*, run.trigger_kind, run.status as run_status
        from public.pick_monitoring_findings item
        join public.pick_monitoring_runs run on run.run_id = item.run_id
        where item.review_status in ('reviewed', 'dismissed')
          and (
            v_source_event_identity is null
            or run.source_event_identity = v_source_event_identity
          )
        order by item.reviewed_at desc
        limit 20
      ) finding
    ), '[]'::jsonb),
    'recent_runs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'run_id', run.run_id,
        'trigger_kind', run.trigger_kind,
        'status', run.status,
        'source_event_identity', run.source_event_identity,
        'event_id', run.event_id,
        'started_at', run.started_at,
        'completed_at', run.completed_at,
        'provider_requests_remaining', run.provider_requests_remaining,
        'provider_requests_used', run.provider_requests_used,
        'provider_last_request_cost', run.provider_last_request_cost,
        'provider_event_count', run.provider_event_count,
        'complete_snapshot_count', run.complete_snapshot_count,
        'missing_snapshot_count', run.missing_snapshot_count,
        'diagnostics', run.diagnostics,
        'finding_count', run.finding_count,
        'new_finding_count', run.new_finding_count
      ) order by coalesce(run.completed_at, run.started_at) desc)
      from (
        select item.*,
          (select count(*)::integer from public.pick_monitoring_findings finding where finding.run_id = item.run_id) as finding_count,
          (select count(*)::integer from public.pick_monitoring_findings finding where finding.run_id = item.run_id and finding.review_status = 'new') as new_finding_count
        from public.pick_monitoring_runs item
        where v_source_event_identity is null
           or item.source_event_identity = v_source_event_identity
        order by coalesce(item.completed_at, item.started_at) desc, item.created_at desc
        limit 12
      ) run
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_pick_monitoring_inbox() from public, anon;
grant execute on function public.get_pick_monitoring_inbox() to authenticated;

create or replace function public.review_pick_monitoring_finding(
  p_finding_id uuid,
  p_review_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text := lower(trim(coalesce(p_review_status, '')));
  v_finding public.pick_monitoring_findings;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  if v_status not in ('reviewed', 'dismissed') then
    raise exception 'invalid monitoring finding review status';
  end if;

  update public.pick_monitoring_findings finding
  set review_status = v_status,
      reviewed_at = now(),
      reviewed_by = auth.uid()
  where finding.finding_id = p_finding_id
  returning finding.* into v_finding;

  if not found then
    raise exception 'monitoring finding not found';
  end if;

  return jsonb_build_object(
    'finding_id', v_finding.finding_id,
    'review_status', v_finding.review_status,
    'reviewed_at', v_finding.reviewed_at
  );
end;
$$;

revoke all on function public.review_pick_monitoring_finding(uuid, text) from public, anon;
grant execute on function public.review_pick_monitoring_finding(uuid, text) to authenticated;

notify pgrst, 'reload schema';
