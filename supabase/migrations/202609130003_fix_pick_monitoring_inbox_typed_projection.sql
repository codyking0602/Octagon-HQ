-- Keep the current/unique inbox projection while passing the original finding
-- composite to the canonical current-state helper. The ranked row also carries
-- run metadata, so passing that enriched row directly is not type-safe.

create or replace function public.get_pick_monitoring_inbox()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_value jsonb;
  v_event jsonb;
  v_kind text;
  v_event_id text;
  v_source_event_identity text;
  v_pending_count integer := 0;
  v_pending jsonb := '[]'::jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  v_value := private.get_pick_monitoring_inbox_actionable_core();
  v_event := v_value->'monitored_event';
  if jsonb_typeof(v_event) <> 'object' then
    v_value := jsonb_set(v_value, '{unresolved_count}', '0'::jsonb, true);
    return jsonb_set(v_value, '{new_findings}', '[]'::jsonb, true);
  end if;

  v_kind := v_event->>'kind';
  v_event_id := v_event->>'event_id';
  v_source_event_identity := v_event->>'source_event_identity';

  with ranked as (
    select
      item as finding_record,
      run.trigger_kind,
      run.status as run_status,
      row_number() over (
        partition by private.pick_monitoring_finding_identity(item)
        order by item.detected_at desc, item.created_at desc, item.finding_id desc
      ) as identity_rank
    from public.pick_monitoring_findings item
    join public.pick_monitoring_runs run on run.run_id = item.run_id
    where run.source_event_identity = v_source_event_identity
      and (
        (v_kind = 'current' and item.event_id = v_event_id)
        or (v_kind = 'staged' and item.event_id is null)
      )
  )
  select count(*)::integer
    into v_pending_count
  from ranked item
  where item.identity_rank = 1
    and (item.finding_record).review_status = 'new'
    and private.pick_monitoring_finding_is_current(
      item.finding_record,
      v_kind,
      v_event_id
    );

  with ranked as (
    select
      item as finding_record,
      run.trigger_kind,
      run.status as run_status,
      row_number() over (
        partition by private.pick_monitoring_finding_identity(item)
        order by item.detected_at desc, item.created_at desc, item.finding_id desc
      ) as identity_rank
    from public.pick_monitoring_findings item
    join public.pick_monitoring_runs run on run.run_id = item.run_id
    where run.source_event_identity = v_source_event_identity
      and (
        (v_kind = 'current' and item.event_id = v_event_id)
        or (v_kind = 'staged' and item.event_id is null)
      )
  ), current_pending as (
    select *
    from ranked item
    where item.identity_rank = 1
      and (item.finding_record).review_status = 'new'
      and private.pick_monitoring_finding_is_current(
        item.finding_record,
        v_kind,
        v_event_id
      )
    order by
      (item.finding_record).detected_at desc,
      (item.finding_record).created_at desc
    limit 50
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'finding_id', (finding.finding_record).finding_id,
    'run_id', (finding.finding_record).run_id,
    'trigger_kind', finding.trigger_kind,
    'run_status', finding.run_status,
    'finding_key', (finding.finding_record).finding_key,
    'finding_type', (finding.finding_record).finding_type,
    'severity', (finding.finding_record).severity,
    'review_status', (finding.finding_record).review_status,
    'matchup_identity', (finding.finding_record).matchup_identity,
    'bout_id', (finding.finding_record).bout_id,
    'summary', (finding.finding_record).summary,
    'before_value', (finding.finding_record).before_value,
    'after_value', (finding.finding_record).after_value,
    'source_details', (finding.finding_record).source_details,
    'detected_at', (finding.finding_record).detected_at,
    'reviewed_at', (finding.finding_record).reviewed_at
  ) order by (finding.finding_record).detected_at desc), '[]'::jsonb)
    into v_pending
  from current_pending finding;

  v_value := jsonb_set(v_value, '{unresolved_count}', to_jsonb(v_pending_count), true);
  return jsonb_set(v_value, '{new_findings}', v_pending, true);
end;
$$;

revoke all on function public.get_pick_monitoring_inbox()
  from public, anon;
grant execute on function public.get_pick_monitoring_inbox()
  to authenticated;

notify pgrst, 'reload schema';
