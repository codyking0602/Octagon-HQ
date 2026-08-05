-- Convert supported monitoring findings into explicit, owner-approved live-card
-- mutations. The existing Picks mutation RPCs remain the canonical state owners;
-- this function only validates the durable proposal, dispatches one canonical
-- mutation, and resolves the finding in the same transaction.

create or replace function public.approve_pick_monitoring_finding(
  p_finding_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_finding public.pick_monitoring_findings;
  v_run public.pick_monitoring_runs;
  v_proposal jsonb;
  v_action text;
  v_event_id text;
  v_reason text := trim(coalesce(p_reason, ''));
  v_expected_bout_ids text[];
  v_proposed_bout_ids text[];
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'monitoring approval reason required';
  end if;

  select finding.* into v_finding
  from public.pick_monitoring_findings finding
  where finding.finding_id = p_finding_id
  for update;

  if not found then
    raise exception 'monitoring finding not found';
  end if;
  if v_finding.review_status <> 'new' then
    raise exception 'monitoring finding already reviewed';
  end if;
  if v_finding.finding_type <> 'card_change' then
    raise exception 'monitoring finding is not an applyable card change';
  end if;

  select run.* into v_run
  from public.pick_monitoring_runs run
  where run.run_id = v_finding.run_id;

  if v_run.run_id is null or v_run.event_id is null
    or v_finding.event_id is distinct from v_run.event_id then
    raise exception 'monitoring finding is not bound to a published event';
  end if;

  if v_run.run_id is distinct from (
    select latest.run_id
    from public.pick_monitoring_runs latest
    where latest.event_id = v_run.event_id
    order by latest.created_at desc, latest.run_id desc
    limit 1
  ) then
    raise exception 'newer monitoring evidence exists; run a fresh check';
  end if;

  v_proposal := v_finding.source_details->'approval_proposal';
  if jsonb_typeof(v_proposal) <> 'object' then
    raise exception 'monitoring finding is review-only';
  end if;

  v_action := nullif(trim(v_proposal->>'action'), '');
  v_event_id := lower(trim(coalesce(v_proposal->>'event_id', '')));
  if v_event_id = '' or v_event_id <> v_run.event_id then
    raise exception 'monitoring approval event is stale or invalid';
  end if;

  case v_action
    when 'adjust_event_lock' then
      perform public.adjust_pick_event_lock_time(
        v_event_id,
        (v_proposal->>'proposed_locks_at')::timestamptz,
        (v_proposal->>'expected_locks_at')::timestamptz,
        v_reason
      );

    when 'remove_bout' then
      perform public.approve_pick_bout_inclusion(
        v_event_id,
        lower(trim(v_proposal->>'bout_id')),
        false,
        (v_proposal->>'expected_included_in_picks')::boolean,
        lower(trim(v_proposal->>'expected_red_fighter_slug')),
        lower(trim(v_proposal->>'expected_blue_fighter_slug')),
        v_reason
      );

    when 'replace_fighter' then
      perform public.approve_pick_fighter_replacement(
        v_event_id,
        lower(trim(v_proposal->>'bout_id')),
        lower(trim(v_proposal->>'corner')),
        lower(trim(v_proposal->>'expected_red_fighter_slug')),
        lower(trim(v_proposal->>'expected_blue_fighter_slug')),
        lower(trim(v_proposal->>'replacement_fighter_slug')),
        trim(v_proposal->>'replacement_fighter_name'),
        v_reason
      );

    when 'reorder_card' then
      select array_agg(item.value order by item.ordinality)
        into v_expected_bout_ids
      from jsonb_array_elements_text(v_proposal->'expected_bout_ids')
        with ordinality as item(value, ordinality);

      select array_agg(item.value order by item.ordinality)
        into v_proposed_bout_ids
      from jsonb_array_elements_text(v_proposal->'proposed_bout_ids')
        with ordinality as item(value, ordinality);

      if coalesce(array_length(v_expected_bout_ids, 1), 0) = 0
        or coalesce(array_length(v_proposed_bout_ids, 1), 0) = 0 then
        raise exception 'monitoring reorder proposal is invalid';
      end if;

      perform public.approve_pick_card_reorder(
        v_event_id,
        v_expected_bout_ids,
        v_proposed_bout_ids,
        v_reason
      );

    else
      raise exception 'monitoring finding is review-only';
  end case;

  update public.pick_monitoring_findings finding
  set review_status = 'reviewed',
      reviewed_at = now(),
      reviewed_by = auth.uid()
  where finding.finding_id = v_finding.finding_id
  returning finding.* into v_finding;

  return jsonb_build_object(
    'finding_id', v_finding.finding_id,
    'review_status', v_finding.review_status,
    'reviewed_at', v_finding.reviewed_at,
    'applied_action', v_action,
    'event_id', v_event_id
  );
end;
$$;

revoke all on function public.approve_pick_monitoring_finding(uuid, text)
  from public, anon;
grant execute on function public.approve_pick_monitoring_finding(uuid, text)
  to authenticated;

notify pgrst, 'reload schema';
