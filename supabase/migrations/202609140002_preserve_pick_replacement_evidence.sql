-- Preserve exact invalidated selections inside the canonical fight-change owner.
-- The existing player projection continues to read before_state.invalidated_picks.

alter function private.apply_pick_fight_change(text,text,jsonb,text)
  rename to apply_pick_fight_change_repick_evidence_core;
revoke all on function private.apply_pick_fight_change_repick_evidence_core(text,text,jsonb,text)
  from public, anon, authenticated, service_role;

create function private.apply_pick_fight_change(
  p_action text,
  p_event_id text,
  p_payload jsonb,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action text := lower(trim(coalesce(p_action, '')));
  v_event_id text := lower(trim(coalesce(p_event_id, '')));
  v_bout_id text := lower(trim(coalesce(p_payload->>'bout_id', '')));
  v_invalidated_picks jsonb := '[]'::jsonb;
  v_before jsonb;
  v_after jsonb;
  v_receipt jsonb;
  v_audit_id bigint;
begin
  if v_action = 'replace_fighter' then
    select coalesce(
      jsonb_agg(to_jsonb(pick) order by pick.profile_id),
      '[]'::jsonb
    )
    into v_invalidated_picks
    from public.profile_event_picks pick
    where pick.event_id = v_event_id
      and pick.bout_id = v_bout_id;
  end if;

  v_receipt := private.apply_pick_fight_change_repick_evidence_core(
    p_action,
    p_event_id,
    p_payload,
    p_reason
  );

  if v_action <> 'replace_fighter' then
    return v_receipt;
  end if;

  v_audit_id := nullif(v_receipt->>'audit_id', '')::bigint;
  if v_audit_id is null then
    raise exception 'replacement audit receipt required';
  end if;

  update public.pick_card_change_actions action
  set before_state = coalesce(action.before_state, '{}'::jsonb)
        || jsonb_build_object('invalidated_picks', v_invalidated_picks),
      after_state = coalesce(action.after_state, '{}'::jsonb)
        || jsonb_build_object('invalidated_picks', v_invalidated_picks)
  where action.action_id = v_audit_id
  returning action.before_state, action.after_state
  into v_before, v_after;

  if not found then
    raise exception 'replacement audit action not found';
  end if;

  v_receipt := coalesce(v_receipt, '{}'::jsonb)
    || jsonb_build_object(
      'invalidated_picks', v_invalidated_picks,
      'before_value', v_before,
      'after_value', v_after
    );

  update public.pick_card_change_actions
  set receipt = v_receipt
  where action_id = v_audit_id;

  return v_receipt;
end;
$$;
revoke all on function private.apply_pick_fight_change(text,text,jsonb,text)
  from public, anon, authenticated, service_role;
comment on function private.apply_pick_fight_change(text,text,jsonb,text) is
  'Sole transactional owner for approved fight changes, including exact fighter-replacement invalidation evidence.';

-- Keep the existing approval dispatcher as the sole mutation core. This public
-- adapter validates the owner reason and makes the final finding receipt
-- identical to its audit receipt.
alter function public.approve_pick_monitoring_finding(uuid,text)
  rename to approve_pick_monitoring_finding_receipt_core;
alter function public.approve_pick_monitoring_finding_receipt_core(uuid,text)
  set schema private;
revoke all on function private.approve_pick_monitoring_finding_receipt_core(uuid,text)
  from public, anon, authenticated, service_role;

create function public.approve_pick_monitoring_finding(
  p_finding_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reason text := trim(coalesce(p_reason, ''));
  v_receipt jsonb;
  v_audit_receipt jsonb;
  v_final_receipt jsonb;
  v_audit_id bigint;
begin
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'monitoring approval reason required';
  end if;

  -- The private core delegates through public.adjust_pick_event_lock_time,
  -- public.approve_pick_event_metadata_change,
  -- public.approve_pick_bout_weight_class_change,
  -- public.approve_pick_bout_inclusion,
  -- public.approve_pick_fighter_replacement, and
  -- public.approve_pick_card_reorder without directly mutating Picks tables.
  -- It also persists review_status = 'reviewed' and reviewed_by = auth.uid().
  begin
    v_receipt := private.approve_pick_monitoring_finding_receipt_core(
      p_finding_id,
      v_reason
    );
  exception when others then
    if sqlerrm = 'STALE_STATE: newer monitoring evidence exists; refresh Picks control' then
      raise exception 'STALE_STATE: newer monitoring evidence exists; refresh Manage Open Picks';
    end if;
    raise;
  end;

  v_audit_id := nullif(v_receipt->>'audit_id', '')::bigint;
  if v_audit_id is not null then
    select action.receipt
    into v_audit_receipt
    from public.pick_card_change_actions action
    where action.action_id = v_audit_id
    for update;
  end if;

  v_final_receipt := coalesce(v_audit_receipt, v_receipt, '{}'::jsonb)
    || jsonb_build_object(
      'finding_id', p_finding_id,
      'finding_resolved', true
    );

  if v_audit_id is not null then
    update public.pick_card_change_actions
    set receipt = v_final_receipt
    where action_id = v_audit_id;
  end if;

  update public.pick_monitoring_findings
  set approval_receipt = v_final_receipt
  where finding_id = p_finding_id;

  return v_final_receipt;
end;
$$;
revoke all on function public.approve_pick_monitoring_finding(uuid,text)
  from public, anon;
grant execute on function public.approve_pick_monitoring_finding(uuid,text)
  to authenticated;
comment on function public.approve_pick_monitoring_finding(uuid,text) is
  'Returns and persists the exact canonical audit receipt for an approved monitoring finding.';

notify pgrst, 'reload schema';
