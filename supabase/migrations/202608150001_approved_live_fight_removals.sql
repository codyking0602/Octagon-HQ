-- Phase 4D: owner-approved, pre-lock inclusion changes for published Picks bouts.
-- Removal preserves the bout and every submitted pick; result_status remains the official outcome owner.

alter table public.pick_bouts
  add column if not exists included_in_picks boolean;

update public.pick_bouts
set included_in_picks = true
where included_in_picks is null;

alter table public.pick_bouts
  alter column included_in_picks set default true;

alter table public.pick_bouts
  alter column included_in_picks set not null;

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_type;
alter table public.pick_card_change_actions
  add constraint pick_card_change_action_type check (
    action_type in (
      'cancel_bout',
      'restore_bout',
      'replace_fighter',
      'reorder_card',
      'remove_bout_from_picks',
      'restore_bout_to_picks'
    )
  );

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_subject;
alter table public.pick_card_change_actions
  add constraint pick_card_change_action_subject check (
    (action_type = 'reorder_card' and bout_id is null)
    or
    (
      action_type in (
        'cancel_bout',
        'restore_bout',
        'replace_fighter',
        'remove_bout_from_picks',
        'restore_bout_to_picks'
      )
      and bout_id is not null
    )
  );

create or replace function public.approve_pick_bout_inclusion(
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
  v_event_id text := lower(trim(p_event_id));
  v_bout_id text := lower(trim(p_bout_id));
  v_expected_red text := lower(trim(p_expected_red_fighter_slug));
  v_expected_blue text := lower(trim(p_expected_blue_fighter_slug));
  v_reason text := trim(p_reason);
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_before jsonb;
  v_after jsonb;
  v_preserved_picks jsonb;
  v_mutable_locks jsonb;
  v_action_type text;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  if p_included_in_picks is null or p_expected_included_in_picks is null then
    raise exception 'requested and expected inclusion states are required';
  end if;

  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'removal reason required';
  end if;

  if v_expected_red = '' or v_expected_blue = '' or v_expected_red = v_expected_blue then
    raise exception 'complete expected fighter identities are required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then
    raise exception 'event not found';
  end if;

  if v_event.status <> 'upcoming'
    or now() >= v_event.locks_at
    or now() >= v_event.starts_at then
    raise exception 'pre-lock Picks inclusion changes are closed';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event_id
    and bout_id = v_bout_id
  for update;

  if not found then
    raise exception 'bout not found';
  end if;

  if v_bout.result_status <> 'pending' then
    raise exception 'only a pending bout can be removed from or restored to Picks';
  end if;

  if v_bout.included_in_picks is distinct from p_expected_included_in_picks then
    raise exception 'Picks inclusion changed; reload Fight Night Control';
  end if;

  if v_bout.red_fighter_slug is distinct from v_expected_red
    or v_bout.blue_fighter_slug is distinct from v_expected_blue then
    raise exception 'matchup changed; reload Fight Night Control';
  end if;

  if v_bout.included_in_picks = p_included_in_picks then
    raise exception 'requested Picks inclusion is unchanged';
  end if;

  if not p_included_in_picks and (
    select count(*)
    from public.pick_bouts included_bout
    where included_bout.event_id = v_event_id
      and included_bout.included_in_picks
  ) <= 1 then
    raise exception 'the final included bout cannot be removed from Picks';
  end if;

  select coalesce(jsonb_agg(to_jsonb(pick) order by pick.profile_id), '[]'::jsonb)
  into v_preserved_picks
  from public.profile_event_picks pick
  where pick.event_id = v_event_id
    and pick.bout_id = v_bout_id;

  select coalesce(jsonb_agg(to_jsonb(lock_row) order by lock_row.profile_id), '[]'::jsonb)
  into v_mutable_locks
  from public.profile_event_underdog_locks lock_row
  where lock_row.event_id = v_event_id
    and lock_row.bout_id = v_bout_id
    and lock_row.frozen_at is null;

  v_before := to_jsonb(v_bout) || jsonb_build_object(
    'preserved_picks', v_preserved_picks,
    'mutable_underdog_locks', v_mutable_locks
  );

  update public.pick_bouts
  set included_in_picks = p_included_in_picks
  where event_id = v_event_id
    and bout_id = v_bout_id
  returning * into v_bout;

  if not p_included_in_picks then
    delete from public.profile_event_underdog_locks
    where event_id = v_event_id
      and bout_id = v_bout_id
      and frozen_at is null;
    v_action_type := 'remove_bout_from_picks';
  else
    v_action_type := 'restore_bout_to_picks';
  end if;

  v_after := to_jsonb(v_bout) || jsonb_build_object(
    'preserved_picks', v_preserved_picks,
    'cleared_mutable_underdog_locks',
      case when p_included_in_picks then '[]'::jsonb else v_mutable_locks end
  );

  insert into public.pick_card_change_actions(
    event_id,
    bout_id,
    action_type,
    reason,
    before_state,
    after_state,
    approved_by
  ) values (
    v_event_id,
    v_bout_id,
    v_action_type,
    v_reason,
    v_before,
    v_after,
    auth.uid()
  );

  return jsonb_build_object(
    'event_id', v_event_id,
    'bout_id', v_bout_id,
    'action_type', v_action_type,
    'included_in_picks', v_bout.included_in_picks,
    'bout', jsonb_build_object(
      'bout_id', v_bout.bout_id,
      'position', v_bout.position,
      'weight_class', v_bout.weight_class,
      'red_fighter_slug', v_bout.red_fighter_slug,
      'red_fighter_name', v_bout.red_fighter_name,
      'blue_fighter_slug', v_bout.blue_fighter_slug,
      'blue_fighter_name', v_bout.blue_fighter_name,
      'result_status', v_bout.result_status
    )
  );
end;
$$;

revoke all on function public.approve_pick_bout_inclusion(text,text,boolean,boolean,text,text,text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_bout_inclusion(text,text,boolean,boolean,text,text,text)
  to authenticated, service_role;

-- While excluded, result, cancellation, replacement, and odds writers cannot mutate
-- the stored bout. Odds are preserved silently so automatic monitoring remains atomic.
create or replace function public.guard_removed_pick_bout_mutations()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.included_in_picks = false and new.included_in_picks = false then
    if new.red_fighter_slug is distinct from old.red_fighter_slug
      or new.red_fighter_name is distinct from old.red_fighter_name
      or new.blue_fighter_slug is distinct from old.blue_fighter_slug
      or new.blue_fighter_name is distinct from old.blue_fighter_name
      or new.result_status is distinct from old.result_status
      or new.winner_fighter_slug is distinct from old.winner_fighter_slug
      or new.result_recorded_at is distinct from old.result_recorded_at then
      raise exception 'removed bout must be restored to Picks before matchup or result changes';
    end if;

    new.red_american_odds := old.red_american_odds;
    new.blue_american_odds := old.blue_american_odds;
    new.odds_source := old.odds_source;
    new.odds_updated_at := old.odds_updated_at;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_removed_pick_bout_mutations on public.pick_bouts;
create trigger guard_removed_pick_bout_mutations
before update on public.pick_bouts
for each row execute function public.guard_removed_pick_bout_mutations();

revoke all on function public.guard_removed_pick_bout_mutations()
  from public, anon, authenticated;

create or replace function public.save_my_event_pick(
  p_event_id text,
  p_bout_id text,
  p_fighter_slug text
)
returns public.profile_event_picks
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_slug text := lower(trim(p_fighter_slug));
  v_row public.profile_event_picks;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id));

  if not found then
    raise exception 'event not found';
  end if;

  if v_event.status = 'complete' or now() >= v_event.locks_at then
    raise exception 'picks are locked';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event.event_id
    and bout_id = lower(trim(p_bout_id));

  if not found then
    raise exception 'bout not found';
  end if;

  if not v_bout.included_in_picks then
    raise exception 'fight is removed from Picks';
  end if;

  if v_bout.result_status = 'cancelled' then
    raise exception 'fight is cancelled';
  end if;

  if v_slug not in (v_bout.red_fighter_slug, v_bout.blue_fighter_slug) then
    raise exception 'fighter is not in this bout';
  end if;

  insert into public.profile_event_picks(
    profile_id,
    event_id,
    bout_id,
    fighter_slug,
    picked_at,
    updated_at
  ) values (
    v_profile_id,
    v_event.event_id,
    v_bout.bout_id,
    v_slug,
    now(),
    now()
  )
  on conflict (profile_id, event_id, bout_id) do update
  set fighter_slug = excluded.fighter_slug,
      updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.save_my_event_pick(text,text,text) from public, anon;
grant execute on function public.save_my_event_pick(text,text,text) to authenticated;

create or replace function public.set_my_event_underdog_lock(
  p_event_id text,
  p_bout_id text,
  p_fighter_slug text
)
returns public.profile_event_underdog_locks
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_pick public.profile_event_picks;
  v_odds integer;
  v_row public.profile_event_underdog_locks;
begin
  if v_profile_id is null then raise exception 'authentication required'; end if;

  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for update;

  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming' or now() >= v_event.locks_at then
    raise exception 'underdog lock is closed';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event.event_id
    and bout_id = lower(trim(p_bout_id));

  if not found then raise exception 'bout not found'; end if;
  if not v_bout.included_in_picks then raise exception 'fight is removed from Picks'; end if;
  if v_bout.result_status = 'cancelled' then raise exception 'fight is cancelled'; end if;

  select * into v_pick
  from public.profile_event_picks
  where profile_id = v_profile_id
    and event_id = v_event.event_id
    and bout_id = v_bout.bout_id;

  if not found or v_pick.fighter_slug <> lower(trim(p_fighter_slug)) then
    raise exception 'underdog lock must match your current pick';
  end if;

  v_odds := case v_pick.fighter_slug
    when v_bout.red_fighter_slug then v_bout.red_american_odds
    when v_bout.blue_fighter_slug then v_bout.blue_american_odds
  end;

  if v_odds is null or v_odds < 100 then
    raise exception 'underdog lock requires positive American odds';
  end if;

  insert into public.profile_event_underdog_locks(
    profile_id, event_id, bout_id, fighter_slug, selected_at
  )
  values(v_profile_id, v_event.event_id, v_bout.bout_id, v_pick.fighter_slug, now())
  on conflict(profile_id,event_id) do update set
    bout_id = excluded.bout_id,
    fighter_slug = excluded.fighter_slug,
    selected_at = now(),
    frozen_american_odds = null,
    frozen_at = null
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.set_my_event_underdog_lock(text,text,text) from public, anon;
grant execute on function public.set_my_event_underdog_lock(text,text,text) to authenticated;

create or replace function public.transition_pick_event(
  p_event_id text,
  p_target_status text
)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_target_status text := lower(trim(p_target_status));
  v_event public.pick_events;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  if v_target_status not in ('locked', 'complete') then
    raise exception 'invalid event transition';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then raise exception 'event not found'; end if;
  if v_event.status = v_target_status then return v_event; end if;
  if v_event.status = 'complete' then raise exception 'completed event is immutable'; end if;
  if now() < v_event.locks_at then raise exception 'event cannot advance before Picks lock'; end if;

  if v_target_status = 'locked' then
    if v_event.status <> 'upcoming' then
      raise exception 'event cannot transition to locked';
    end if;

    update public.pick_events
    set status = 'locked',
        completed_at = null,
        updated_at = now()
    where event_id = v_event_id
    returning * into v_event;

    return v_event;
  end if;

  if v_event.status <> 'locked' then
    raise exception 'event must be locked before completion';
  end if;

  if not exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event_id
      and bout.included_in_picks
  ) then
    raise exception 'event has no included Picks bouts';
  end if;

  if exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event_id
      and bout.included_in_picks
      and bout.result_status = 'pending'
  ) then
    raise exception 'all included bout results must be resolved before completion';
  end if;

  update public.pick_events
  set status = 'complete',
      completed_at = now(),
      updated_at = now()
  where event_id = v_event_id
  returning * into v_event;

  return v_event;
end;
$$;

revoke all on function public.transition_pick_event(text,text)
  from public, anon, authenticated;
grant execute on function public.transition_pick_event(text,text)
  to authenticated, service_role;

create or replace function public.resolved_bout_group_picks(
  p_event_id text,
  p_bout_id text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null
      or not exists (
        select 1 from public.profiles viewer where viewer.id = auth.uid()
      )
      or (
        bout.included_in_picks
        and bout.result_status = 'pending'
      )
      or (
        not bout.included_in_picks
        and event.status = 'upcoming'
        and now() < event.locks_at
      )
      then '[]'::jsonb
    else coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'display_name', profile.display_name,
          'picked_fighter_slug', pick.fighter_slug,
          'is_current_user', entrant.profile_id = auth.uid()
        )
        order by profile.display_name
      )
      from (
        select distinct event_pick.profile_id
        from public.profile_event_picks event_pick
        where event_pick.event_id = bout.event_id
      ) entrant
      join public.profiles profile on profile.id = entrant.profile_id
      left join public.profile_event_picks pick
        on pick.profile_id = entrant.profile_id
       and pick.event_id = bout.event_id
       and pick.bout_id = bout.bout_id
    ), '[]'::jsonb)
  end
  from public.pick_bouts bout
  join public.pick_events event on event.event_id = bout.event_id
  where bout.event_id = lower(trim(p_event_id))
    and bout.bout_id = lower(trim(p_bout_id));
$$;

revoke all on function public.resolved_bout_group_picks(text,text)
  from public, anon, authenticated;

create or replace function public.get_current_pick_event()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'event_id', event.event_id,
    'name', event.name,
    'subtitle', event.subtitle,
    'venue', event.venue,
    'location', event.location,
    'starts_at', event.starts_at,
    'locks_at', event.locks_at,
    'season', event.season,
    'status', case when now() >= event.locks_at then 'locked' else event.status end,
    'can_control', public.is_pick_control_owner(auth.uid()),
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'position', bout.position,
        'weight_class', bout.weight_class,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'red_american_odds', bout.red_american_odds,
        'blue_american_odds', bout.blue_american_odds,
        'odds_source', bout.odds_source,
        'odds_updated_at', bout.odds_updated_at,
        'winner_fighter_slug', bout.winner_fighter_slug,
        'result_status', bout.result_status,
        'result_recorded_at', bout.result_recorded_at,
        'included_in_picks', bout.included_in_picks,
        'repick_required', bout.included_in_picks
          and auth.uid() is not null
          and not exists (
            select 1
            from public.profile_event_picks current_pick
            where current_pick.profile_id = auth.uid()
              and current_pick.event_id = bout.event_id
              and current_pick.bout_id = bout.bout_id
          )
          and exists (
            select 1
            from public.pick_card_change_actions action,
              jsonb_array_elements(action.before_state->'invalidated_picks') evidence
            where action.event_id = bout.event_id
              and action.bout_id = bout.bout_id
              and action.action_type = 'replace_fighter'
              and evidence->>'profile_id' = auth.uid()::text
          ),
        'group_picks', public.resolved_bout_group_picks(bout.event_id,bout.bout_id)
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  )
  from public.pick_events event
  where event.status in ('upcoming','locked')
  order by event.starts_at
  limit 1;
$$;

revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

create or replace function public.get_my_pick_summary(p_season integer default null)
returns table(
  correct integer,
  incorrect integer,
  pending integer,
  events_entered integer,
  base_points integer,
  lock_bonus integer,
  total_points integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with scored as (
    select
      event.event_id,
      bout.result_status,
      bout.winner_fighter_slug,
      pick.fighter_slug,
      lock.bout_id = pick.bout_id
        and lock.fighter_slug = pick.fighter_slug
        and lock.fighter_slug = bout.winner_fighter_slug as lock_won,
      lock.frozen_american_odds
    from public.profile_event_picks pick
    join public.pick_events event on event.event_id = pick.event_id
    join public.pick_bouts bout
      on bout.event_id = pick.event_id
     and bout.bout_id = pick.bout_id
    left join public.profile_event_underdog_locks lock
      on lock.profile_id = pick.profile_id
     and lock.event_id = pick.event_id
    where pick.profile_id = auth.uid()
      and bout.included_in_picks
      and (p_season is null or event.season = p_season)
  ),
  totals as (
    select
      count(*) filter (
        where result_status in ('red_win','blue_win')
          and winner_fighter_slug = fighter_slug
      )::integer correct,
      count(*) filter (
        where result_status in ('red_win','blue_win')
          and winner_fighter_slug <> fighter_slug
      )::integer incorrect,
      count(*) filter (where result_status = 'pending')::integer pending,
      count(distinct event_id)::integer events_entered,
      (
        4 * count(*) filter (
          where result_status in ('red_win','blue_win')
            and winner_fighter_slug = fighter_slug
        )
      )::integer base_points,
      coalesce(
        sum(public.pick_underdog_bonus(frozen_american_odds)) filter (where lock_won),
        0
      )::integer lock_bonus
    from scored
  )
  select
    correct,
    incorrect,
    pending,
    events_entered,
    base_points,
    lock_bonus,
    base_points + lock_bonus
  from totals;
$$;

revoke all on function public.get_my_pick_summary(integer) from public, anon;
grant execute on function public.get_my_pick_summary(integer) to authenticated;

create or replace function public.get_my_pick_history(p_season integer default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
with personal_bouts as (
  select
    event.*,
    bout.bout_id,
    bout.position,
    bout.weight_class,
    bout.red_fighter_slug,
    bout.red_fighter_name,
    bout.blue_fighter_slug,
    bout.blue_fighter_name,
    bout.result_status,
    bout.winner_fighter_slug,
    bout.included_in_picks,
    pick.fighter_slug picked_fighter_slug,
    case
      when not bout.included_in_picks then 'excluded'
      when bout.result_status in ('draw','no_contest','cancelled') then 'excluded'
      when bout.result_status = 'pending' then 'pending'
      when pick.fighter_slug is null then 'missing'
      when pick.fighter_slug = bout.winner_fighter_slug then 'correct'
      else 'incorrect'
    end verdict
  from public.pick_events event
  join public.pick_bouts bout on bout.event_id = event.event_id
  left join public.profile_event_picks pick
    on pick.profile_id = auth.uid()
   and pick.event_id = bout.event_id
   and pick.bout_id = bout.bout_id
  where auth.uid() is not null
    and event.status = 'complete'
    and (p_season is null or event.season = p_season)
),
personal_events as (
  select
    b.event_id,
    b.name,
    b.subtitle,
    b.venue,
    b.location,
    b.starts_at,
    b.season,
    b.completed_at,
    count(*) filter (where verdict = 'correct')::integer correct,
    count(*) filter (where verdict = 'incorrect')::integer incorrect,
    count(*) filter (where verdict = 'missing')::integer missing,
    count(*) filter (where verdict = 'excluded')::integer excluded,
    (4 * count(*) filter (where verdict = 'correct'))::integer base_points,
    coalesce(max(public.pick_underdog_bonus(lock.frozen_american_odds)) filter (
      where b.included_in_picks
        and lock.bout_id = b.bout_id
        and lock.fighter_slug = b.winner_fighter_slug
    ), 0)::integer lock_bonus,
    bool_or(b.included_in_picks and b.picked_fighter_slug is not null) entered,
    case
      when lock.event_id is null then null
      else jsonb_build_object(
        'event_id', lock.event_id,
        'bout_id', lock.bout_id,
        'fighter_slug', lock.fighter_slug,
        'selected_at', lock.selected_at,
        'frozen_american_odds', lock.frozen_american_odds
      )
    end underdog_lock,
    jsonb_agg(jsonb_build_object(
      'bout_id', b.bout_id,
      'position', b.position,
      'weight_class', b.weight_class,
      'red_fighter_slug', b.red_fighter_slug,
      'red_fighter_name', b.red_fighter_name,
      'blue_fighter_slug', b.blue_fighter_slug,
      'blue_fighter_name', b.blue_fighter_name,
      'result_status', b.result_status,
      'winner_fighter_slug', b.winner_fighter_slug,
      'picked_fighter_slug', b.picked_fighter_slug,
      'verdict', b.verdict,
      'included_in_picks', b.included_in_picks,
      'group_picks', public.resolved_bout_group_picks(b.event_id,b.bout_id)
    ) order by b.position) bouts
  from personal_bouts b
  left join public.profile_event_underdog_locks lock
    on lock.profile_id = auth.uid()
   and lock.event_id = b.event_id
  group by
    b.event_id,
    b.name,
    b.subtitle,
    b.venue,
    b.location,
    b.starts_at,
    b.season,
    b.completed_at,
    lock.event_id,
    lock.bout_id,
    lock.fighter_slug,
    lock.selected_at,
    lock.frozen_american_odds
),
entrants as (
  select distinct pick.event_id, pick.profile_id
  from public.profile_event_picks pick
  join public.pick_events event on event.event_id = pick.event_id
  where event.status = 'complete'
    and (p_season is null or event.season = p_season)
),
group_scores as (
  select
    entrant.event_id,
    entrant.profile_id,
    profile.display_name,
    count(*) filter (
      where bout.included_in_picks
        and bout.result_status in ('red_win','blue_win')
        and pick.fighter_slug = bout.winner_fighter_slug
    )::integer correct,
    count(*) filter (
      where bout.included_in_picks
        and bout.result_status in ('red_win','blue_win')
        and pick.fighter_slug is not null
        and pick.fighter_slug <> bout.winner_fighter_slug
    )::integer incorrect,
    count(*) filter (
      where bout.included_in_picks
        and bout.result_status in ('red_win','blue_win')
        and pick.fighter_slug is null
    )::integer missing,
    count(*) filter (
      where not bout.included_in_picks
        or bout.result_status in ('draw','no_contest','cancelled')
    )::integer excluded,
    (
      4 * count(*) filter (
        where bout.included_in_picks
          and bout.result_status in ('red_win','blue_win')
          and pick.fighter_slug = bout.winner_fighter_slug
      )
    )::integer base_points,
    coalesce(max(public.pick_underdog_bonus(lock.frozen_american_odds)) filter (
      where bout.included_in_picks
        and lock.fighter_slug = bout.winner_fighter_slug
    ), 0)::integer lock_bonus
  from entrants entrant
  join public.profiles profile on profile.id = entrant.profile_id
  join public.pick_bouts bout on bout.event_id = entrant.event_id
  left join public.profile_event_picks pick
    on pick.profile_id = entrant.profile_id
   and pick.event_id = entrant.event_id
   and pick.bout_id = bout.bout_id
  left join public.profile_event_underdog_locks lock
    on lock.profile_id = entrant.profile_id
   and lock.event_id = entrant.event_id
   and lock.bout_id = bout.bout_id
  group by entrant.event_id, entrant.profile_id, profile.display_name
),
ranked as (
  select
    *,
    base_points + lock_bonus total_points,
    rank() over (
      partition by event_id
      order by base_points + lock_bonus desc, correct desc
    )::integer rank
  from group_scores
),
event_standings as (
  select
    event_id,
    jsonb_agg(jsonb_build_object(
      'rank', rank,
      'display_name', display_name,
      'correct', correct,
      'incorrect', incorrect,
      'missing', missing,
      'excluded', excluded,
      'base_points', base_points,
      'lock_bonus', lock_bonus,
      'total_points', total_points,
      'is_current_user', profile_id = auth.uid()
    ) order by rank, display_name) items
  from ranked
  group by event_id
),
season as (
  select
    coalesce(sum(correct), 0)::integer correct,
    coalesce(sum(incorrect), 0)::integer incorrect,
    coalesce(sum(missing), 0)::integer missing,
    coalesce(sum(excluded), 0)::integer excluded,
    count(*) filter (where entered)::integer events_entered,
    coalesce(sum(base_points), 0)::integer base_points,
    coalesce(sum(lock_bonus), 0)::integer lock_bonus
  from personal_events
),
events as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'event_id', event.event_id,
    'name', event.name,
    'subtitle', event.subtitle,
    'venue', event.venue,
    'location', event.location,
    'starts_at', event.starts_at,
    'season', event.season,
    'completed_at', event.completed_at,
    'record', jsonb_build_object(
      'correct', event.correct,
      'incorrect', event.incorrect,
      'missing', event.missing,
      'excluded', event.excluded,
      'base_points', event.base_points,
      'lock_bonus', event.lock_bonus,
      'total_points', event.base_points + event.lock_bonus
    ),
    'underdog_lock', event.underdog_lock,
    'bouts', event.bouts,
    'group_results', coalesce(standing.items, '[]'::jsonb)
  ) order by event.starts_at desc), '[]'::jsonb) items
  from personal_events event
  left join event_standings standing on standing.event_id = event.event_id
)
select jsonb_build_object(
  'season', p_season,
  'summary', jsonb_build_object(
    'correct', season.correct,
    'incorrect', season.incorrect,
    'missing', season.missing,
    'excluded', season.excluded,
    'events_entered', season.events_entered,
    'base_points', season.base_points,
    'lock_bonus', season.lock_bonus,
    'total_points', season.base_points + season.lock_bonus
  ),
  'events', events.items
)
from season
cross join events;
$$;

revoke all on function public.get_my_pick_history(integer) from public, anon;
grant execute on function public.get_my_pick_history(integer) to authenticated;

create or replace function public.get_pick_control_event()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  select jsonb_build_object(
    'event_id', event.event_id,
    'name', event.name,
    'subtitle', event.subtitle,
    'venue', event.venue,
    'location', event.location,
    'starts_at', event.starts_at,
    'locks_at', event.locks_at,
    'season', event.season,
    'status', event.status,
    'can_lock', event.status = 'upcoming' and now() >= event.locks_at,
    'can_complete', event.status = 'locked'
      and exists (
        select 1
        from public.pick_bouts any_bout
        where any_bout.event_id = event.event_id
          and any_bout.included_in_picks
      )
      and not exists (
        select 1
        from public.pick_bouts pending_bout
        where pending_bout.event_id = event.event_id
          and pending_bout.included_in_picks
          and pending_bout.result_status = 'pending'
      ),
    'can_reorder', event.status = 'upcoming'
      and now() < event.locks_at
      and now() < event.starts_at
      and (
        select count(*)
        from public.pick_bouts reorder_bout
        where reorder_bout.event_id = event.event_id
      ) >= 2,
    'has_reorder_history', exists (
      select 1
      from public.pick_card_change_actions reorder_action
      where reorder_action.event_id = event.event_id
        and reorder_action.action_type = 'reorder_card'
    ),
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'position', bout.position,
        'weight_class', bout.weight_class,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'result_status', bout.result_status,
        'winner_fighter_slug', bout.winner_fighter_slug,
        'result_recorded_at', bout.result_recorded_at,
        'included_in_picks', bout.included_in_picks,
        'can_cancel', event.status = 'upcoming'
          and now() < event.locks_at
          and now() < event.starts_at
          and bout.included_in_picks
          and bout.result_status = 'pending',
        'can_restore', event.status = 'upcoming'
          and now() < event.locks_at
          and now() < event.starts_at
          and bout.included_in_picks
          and bout.result_status = 'cancelled',
        'can_replace', event.status = 'upcoming'
          and now() < event.locks_at
          and now() < event.starts_at
          and bout.included_in_picks
          and bout.result_status = 'pending',
        'can_remove_from_picks', event.status = 'upcoming'
          and now() < event.locks_at
          and now() < event.starts_at
          and bout.included_in_picks
          and bout.result_status = 'pending'
          and (
            select count(*)
            from public.pick_bouts included_bout
            where included_bout.event_id = event.event_id
              and included_bout.included_in_picks
          ) > 1,
        'can_restore_to_picks', event.status = 'upcoming'
          and now() < event.locks_at
          and now() < event.starts_at
          and not bout.included_in_picks
          and bout.result_status = 'pending',
        'has_replacement_history', exists (
          select 1
          from public.pick_card_change_actions replacement_action
          where replacement_action.event_id = bout.event_id
            and replacement_action.bout_id = bout.bout_id
            and replacement_action.action_type = 'replace_fighter'
        ),
        'has_removal_history', exists (
          select 1
          from public.pick_card_change_actions removal_action
          where removal_action.event_id = bout.event_id
            and removal_action.bout_id = bout.bout_id
            and removal_action.action_type in (
              'remove_bout_from_picks',
              'restore_bout_to_picks'
            )
        )
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  ) into v_result
  from public.pick_events event
  where event.status in ('upcoming','locked')
  order by event.starts_at
  limit 1;

  return v_result;
end;
$$;

revoke all on function public.get_pick_control_event() from public, anon;
grant execute on function public.get_pick_control_event() to authenticated;

notify pgrst, 'reload schema';