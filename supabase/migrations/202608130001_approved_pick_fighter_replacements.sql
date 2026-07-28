-- Phase 4B: owner-approved, pre-lock fighter replacements.
-- The existing card-change ledger remains the sole private audit owner.

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_type;
alter table public.pick_card_change_actions
  add constraint pick_card_change_action_type check (
    action_type in ('cancel_bout', 'restore_bout', 'replace_fighter')
  );

create or replace function public.approve_pick_fighter_replacement(
  p_event_id text,
  p_bout_id text,
  p_corner text,
  p_expected_red_fighter_slug text,
  p_expected_blue_fighter_slug text,
  p_replacement_fighter_slug text,
  p_replacement_fighter_name text,
  p_reason text
)
returns public.pick_bouts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_bout_id text := lower(trim(p_bout_id));
  v_corner text := lower(trim(p_corner));
  v_expected_red text := lower(trim(p_expected_red_fighter_slug));
  v_expected_blue text := lower(trim(p_expected_blue_fighter_slug));
  v_replacement_slug text := lower(trim(p_replacement_fighter_slug));
  v_replacement_name text := trim(p_replacement_fighter_name);
  v_reason text := trim(p_reason);
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_before jsonb;
  v_affected_picks jsonb;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'replacement reason required';
  end if;
  if v_corner not in ('red', 'blue') then raise exception 'replacement corner must be red or blue'; end if;
  if v_replacement_name = '' or length(v_replacement_name) > 120
    or v_replacement_slug = '' or v_replacement_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'invalid replacement fighter identity';
  end if;

  select * into v_event from public.pick_events where event_id = v_event_id for update;
  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming' or now() >= v_event.locks_at or now() >= v_event.starts_at then
    raise exception 'pre-lock fighter replacements are closed';
  end if;

  select * into v_bout from public.pick_bouts
  where event_id = v_event_id and bout_id = v_bout_id for update;
  if not found then raise exception 'bout not found'; end if;
  if v_bout.result_status <> 'pending' then raise exception 'only a pending bout can replace a fighter'; end if;
  if v_bout.red_fighter_slug <> v_expected_red or v_bout.blue_fighter_slug <> v_expected_blue then
    raise exception 'matchup changed; reload Fight Night Control';
  end if;
  if v_expected_red = v_expected_blue then raise exception 'ambiguous current fighter identity'; end if;
  if v_replacement_slug in (v_bout.red_fighter_slug, v_bout.blue_fighter_slug) then
    raise exception 'replacement fighter must be different from both current fighters';
  end if;

  select coalesce(jsonb_agg(to_jsonb(pick) order by pick.profile_id), '[]'::jsonb)
  into v_affected_picks from public.profile_event_picks pick
  where pick.event_id = v_event_id and pick.bout_id = v_bout_id;

  v_before := to_jsonb(v_bout) || jsonb_build_object(
    'invalidated_picks', v_affected_picks,
    'mutable_underdog_locks', coalesce((
      select jsonb_agg(to_jsonb(lock_row) order by lock_row.profile_id)
      from public.profile_event_underdog_locks lock_row
      where lock_row.event_id = v_event_id and lock_row.bout_id = v_bout_id and lock_row.frozen_at is null
    ), '[]'::jsonb)
  );

  -- Delete, rather than map, every current selection for the changed matchup.
  delete from public.profile_event_underdog_locks
  where event_id = v_event_id and bout_id = v_bout_id and frozen_at is null;
  delete from public.profile_event_picks
  where event_id = v_event_id and bout_id = v_bout_id;

  update public.pick_bouts set
    red_fighter_slug = case when v_corner = 'red' then v_replacement_slug else red_fighter_slug end,
    red_fighter_name = case when v_corner = 'red' then v_replacement_name else red_fighter_name end,
    blue_fighter_slug = case when v_corner = 'blue' then v_replacement_slug else blue_fighter_slug end,
    blue_fighter_name = case when v_corner = 'blue' then v_replacement_name else blue_fighter_name end,
    red_american_odds = null,
    blue_american_odds = null,
    odds_source = null,
    odds_updated_at = null,
    winner_fighter_slug = null,
    result_recorded_at = null
  where event_id = v_event_id and bout_id = v_bout_id
  returning * into v_bout;

  insert into public.pick_card_change_actions(
    event_id, bout_id, action_type, reason, before_state, after_state, approved_by
  ) values (
    v_event_id, v_bout_id, 'replace_fighter', v_reason, v_before,
    to_jsonb(v_bout) || jsonb_build_object('invalidated_pick_count', jsonb_array_length(v_affected_picks)),
    auth.uid()
  );
  return v_bout;
end;
$$;
revoke all on function public.approve_pick_fighter_replacement(text,text,text,text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_fighter_replacement(text,text,text,text,text,text,text,text)
  to authenticated, service_role;

-- Owner projection: current matchup plus the fact (not private details) that history exists.
create or replace function public.get_pick_control_event()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then raise exception 'pick control owner required'; end if;
  select jsonb_build_object(
    'event_id',event.event_id,'name',event.name,'subtitle',event.subtitle,'venue',event.venue,
    'location',event.location,'starts_at',event.starts_at,'locks_at',event.locks_at,
    'season',event.season,'status',event.status,
    'can_lock',event.status='upcoming' and now()>=event.locks_at,
    'can_complete',event.status='locked' and exists(select 1 from public.pick_bouts b where b.event_id=event.event_id)
      and not exists(select 1 from public.pick_bouts b where b.event_id=event.event_id and b.result_status='pending'),
    'bouts',coalesce((select jsonb_agg(jsonb_build_object(
      'bout_id',bout.bout_id,'position',bout.position,'weight_class',bout.weight_class,
      'red_fighter_slug',bout.red_fighter_slug,'red_fighter_name',bout.red_fighter_name,
      'blue_fighter_slug',bout.blue_fighter_slug,'blue_fighter_name',bout.blue_fighter_name,
      'result_status',bout.result_status,'winner_fighter_slug',bout.winner_fighter_slug,
      'result_recorded_at',bout.result_recorded_at,
      'can_cancel',event.status='upcoming' and now()<event.locks_at and now()<event.starts_at and bout.result_status='pending',
      'can_restore',event.status='upcoming' and now()<event.locks_at and now()<event.starts_at and bout.result_status='cancelled',
      'can_replace',event.status='upcoming' and now()<event.locks_at and now()<event.starts_at and bout.result_status='pending',
      'has_replacement_history',exists(select 1 from public.pick_card_change_actions a where a.event_id=bout.event_id and a.bout_id=bout.bout_id and a.action_type='replace_fighter')
    ) order by bout.position) from public.pick_bouts bout where bout.event_id=event.event_id),'[]'::jsonb)
  ) into v_result from public.pick_events event where event.status in ('upcoming','locked') order by event.starts_at limit 1;
  return v_result;
end; $$;
revoke all on function public.get_pick_control_event() from public, anon;
grant execute on function public.get_pick_control_event() to authenticated;

-- Player projection exposes only a per-viewer repick flag; audit evidence and other picks remain private.
create or replace function public.get_current_pick_event()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'event_id',event.event_id,'name',event.name,'subtitle',event.subtitle,'venue',event.venue,
    'location',event.location,'starts_at',event.starts_at,'locks_at',event.locks_at,'season',event.season,
    'status',case when now()>=event.locks_at then 'locked' else event.status end,
    'can_control',public.is_pick_control_owner(auth.uid()),
    'bouts',coalesce((select jsonb_agg(jsonb_build_object(
      'bout_id',bout.bout_id,'position',bout.position,'weight_class',bout.weight_class,
      'red_fighter_slug',bout.red_fighter_slug,'red_fighter_name',bout.red_fighter_name,
      'blue_fighter_slug',bout.blue_fighter_slug,'blue_fighter_name',bout.blue_fighter_name,
      'red_american_odds',bout.red_american_odds,'blue_american_odds',bout.blue_american_odds,
      'odds_source',bout.odds_source,'odds_updated_at',bout.odds_updated_at,
      'winner_fighter_slug',bout.winner_fighter_slug,'result_status',bout.result_status,
      'result_recorded_at',bout.result_recorded_at,
      'repick_required',auth.uid() is not null and not exists(
        select 1 from public.profile_event_picks current_pick where current_pick.profile_id=auth.uid()
          and current_pick.event_id=bout.event_id and current_pick.bout_id=bout.bout_id
      ) and exists(
        select 1 from public.pick_card_change_actions action,
          jsonb_array_elements(action.before_state->'invalidated_picks') evidence
        where action.event_id=bout.event_id and action.bout_id=bout.bout_id
          and action.action_type='replace_fighter' and evidence->>'profile_id'=auth.uid()::text
      ),
      'group_picks',public.resolved_bout_group_picks(bout.event_id,bout.bout_id)
    ) order by bout.position) from public.pick_bouts bout where bout.event_id=event.event_id),'[]'::jsonb)
  ) from public.pick_events event where event.status in ('upcoming','locked') order by event.starts_at limit 1;
$$;
revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

notify pgrst, 'reload schema';
