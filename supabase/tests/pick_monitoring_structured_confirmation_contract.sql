begin;

do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.approve_pick_monitoring_finding(uuid,text)'::regprocedure
  ) into v_definition;

  if position('v_reason text := trim(coalesce(p_reason, ''''))' in v_definition) = 0
    or position('length(v_reason) < 3 or length(v_reason) > 500' in v_definition) = 0
    or position('monitoring approval reason required' in v_definition) = 0 then
    raise exception 'structured monitoring approvals do not enforce a finite nonblank audit reason';
  end if;

  if position('public.adjust_pick_event_lock_time' in v_definition) = 0
    or position('public.approve_pick_event_metadata_change' in v_definition) = 0
    or position('public.approve_pick_bout_weight_class_change' in v_definition) = 0
    or position('public.approve_pick_bout_inclusion' in v_definition) = 0
    or position('public.approve_pick_fighter_replacement' in v_definition) = 0
    or position('public.approve_pick_card_reorder' in v_definition) = 0 then
    raise exception 'structured monitoring approvals do not dispatch through every canonical mutation owner';
  end if;

  if position('update public.pick_events' in lower(v_definition)) > 0
    or position('update public.pick_bouts' in lower(v_definition)) > 0 then
    raise exception 'monitoring approval dispatcher directly mutates canonical Picks tables';
  end if;

  if position('review_status = ''reviewed''' in v_definition) = 0
    or position('reviewed_by = auth.uid()' in v_definition) = 0 then
    raise exception 'structured monitoring approval does not persist the owner review receipt';
  end if;
end;
$$;

rollback;
