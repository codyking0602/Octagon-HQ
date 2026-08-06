-- Keep the existing inclusion mutation as the state/audit owner, then reflow
-- the one canonical active card so removed rows cannot leave visible gaps or
-- stale position-owned deadlines.

alter function public.approve_pick_bout_inclusion(
  text,text,boolean,boolean,text,text,text
) rename to approve_pick_bout_inclusion_owner_core;
alter function public.approve_pick_bout_inclusion_owner_core(
  text,text,boolean,boolean,text,text,text
) set schema private;
revoke all on function private.approve_pick_bout_inclusion_owner_core(
  text,text,boolean,boolean,text,text,text
) from public, anon, authenticated;

create function public.approve_pick_bout_inclusion(
  p_event_id text,
  p_bout_id text,
  p_included_in_picks boolean,
  p_expected_included_in_picks boolean,
  p_expected_red_fighter_slug text,
  p_expected_blue_fighter_slug text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
  v_active_card jsonb;
begin
  v_result := private.approve_pick_bout_inclusion_owner_core(
    p_event_id,
    p_bout_id,
    p_included_in_picks,
    p_expected_included_in_picks,
    p_expected_red_fighter_slug,
    p_expected_blue_fighter_slug,
    p_reason
  );

  perform private.reflow_active_pick_bout_slots(p_event_id);

  select coalesce(jsonb_agg(jsonb_build_object(
    'position', bout.position,
    'bout_id', bout.bout_id,
    'locks_at', bout.locks_at,
    'red_fighter_name', bout.red_fighter_name,
    'blue_fighter_name', bout.blue_fighter_name
  ) order by bout.position), '[]'::jsonb)
  into v_active_card
  from public.pick_bouts bout
  where bout.event_id = lower(trim(p_event_id))
    and bout.included_in_picks;

  return v_result || jsonb_build_object('active_card', v_active_card);
end;
$$;
revoke all on function public.approve_pick_bout_inclusion(
  text,text,boolean,boolean,text,text,text
) from public, anon;
grant execute on function public.approve_pick_bout_inclusion(
  text,text,boolean,boolean,text,text,text
) to authenticated, service_role;

notify pgrst, 'reload schema';
