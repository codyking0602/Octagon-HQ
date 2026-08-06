-- Preserve the exact selections invalidated by the canonical fighter-replacement
-- owner without adding a second mutation path. The existing current-event
-- projection continues to read before_state.invalidated_picks.

create or replace function private.capture_invalidated_pick_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_evidence jsonb := coalesce(
    nullif(current_setting('octagon.pick_invalidated_evidence', true), '')::jsonb,
    '[]'::jsonb
  );
begin
  perform set_config(
    'octagon.pick_invalidated_evidence',
    (v_evidence || jsonb_build_array(to_jsonb(old)))::text,
    true
  );
  return old;
end;
$$;
revoke all on function private.capture_invalidated_pick_evidence()
  from public, anon, authenticated, service_role;

drop trigger if exists capture_invalidated_pick_evidence
  on public.profile_event_picks;
create trigger capture_invalidated_pick_evidence
before delete on public.profile_event_picks
for each row execute function private.capture_invalidated_pick_evidence();

create or replace function private.attach_pick_replacement_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_evidence jsonb := '[]'::jsonb;
  v_matches jsonb := '[]'::jsonb;
begin
  if new.action_type <> 'replace_fighter' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    v_evidence := coalesce(
      nullif(current_setting('octagon.pick_invalidated_evidence', true), '')::jsonb,
      '[]'::jsonb
    );

    select coalesce(
      jsonb_agg(entry.value order by entry.value->>'profile_id'),
      '[]'::jsonb
    )
    into v_matches
    from jsonb_array_elements(v_evidence) as entry(value)
    where entry.value->>'event_id' = new.event_id
      and entry.value->>'bout_id' = new.bout_id;

    new.before_state := coalesce(new.before_state, '{}'::jsonb)
      || jsonb_build_object('invalidated_picks', v_matches);
    new.after_state := coalesce(new.after_state, '{}'::jsonb)
      || jsonb_build_object('invalidated_picks', v_matches);

    perform set_config('octagon.pick_invalidated_evidence', '[]', true);
    return new;
  end if;

  v_matches := coalesce(new.before_state->'invalidated_picks', '[]'::jsonb);
  if jsonb_typeof(v_matches) <> 'array' then
    raise exception 'replacement invalidated-pick evidence must be an array';
  end if;

  new.receipt := coalesce(new.receipt, '{}'::jsonb)
    || jsonb_build_object(
      'invalidated_picks', v_matches,
      'before_value', new.before_state,
      'after_value', new.after_state
    );
  return new;
end;
$$;
revoke all on function private.attach_pick_replacement_evidence()
  from public, anon, authenticated, service_role;

drop trigger if exists attach_pick_replacement_evidence
  on public.pick_card_change_actions;
create trigger attach_pick_replacement_evidence
before insert or update of receipt on public.pick_card_change_actions
for each row execute function private.attach_pick_replacement_evidence();

-- Keep the existing dispatcher as the sole approval core. This public adapter
-- only normalizes the final receipt after that core has completed its mutation.
alter function public.approve_pick_monitoring_finding(uuid,text)
  rename to approve_pick_monitoring_finding_repick_evidence_core;
alter function public.approve_pick_monitoring_finding_repick_evidence_core(uuid,text)
  set schema private;
revoke all on function private.approve_pick_monitoring_finding_repick_evidence_core(uuid,text)
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
  v_receipt jsonb;
  v_audit_receipt jsonb;
  v_final_receipt jsonb;
  v_audit_id bigint;
begin
  -- The private core remains the dispatcher that delegates fight changes to
  -- private.apply_pick_fight_change.
  v_receipt := private.approve_pick_monitoring_finding_repick_evidence_core(
    p_finding_id,
    p_reason
  );

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
  'Public approval adapter that returns and persists the exact canonical audit receipt.';

notify pgrst, 'reload schema';
