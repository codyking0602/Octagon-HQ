-- Phase 4E: owner-approved corrections to already-recorded official Picks results.
-- Initial result entry, result correction, and event lifecycle remain separate owners.

create table if not exists public.pick_result_corrections (
  id bigint generated always as identity primary key,
  event_id text not null,
  bout_id text not null,
  reason text not null check (length(trim(reason)) between 3 and 500),
  before_state jsonb not null,
  after_state jsonb not null,
  corrected_by uuid references public.profiles(id) on delete set null,
  corrected_at timestamptz not null default now(),
  foreign key (event_id, bout_id)
    references public.pick_bouts(event_id, bout_id)
    on delete restrict
);

create index if not exists pick_result_corrections_event_bout_idx
  on public.pick_result_corrections(event_id, bout_id, corrected_at, id);

alter table public.pick_result_corrections enable row level security;
revoke all on table public.pick_result_corrections
  from public, anon, authenticated, service_role;

create or replace function public.reject_pick_result_correction_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'pick result correction audit is immutable';
end;
$$;

revoke all on function public.reject_pick_result_correction_mutation()
  from public, anon, authenticated;

drop trigger if exists reject_pick_result_correction_mutation
  on public.pick_result_corrections;
create trigger reject_pick_result_correction_mutation
before update or delete on public.pick_result_corrections
for each row execute function public.reject_pick_result_correction_mutation();

-- Initial official-result entry remains the one owner for a pending locked bout.
-- Once a result exists, every change must use the reasoned correction workflow.
create or replace function public.record_official_pick_bout_result(
  p_event_id text,
  p_bout_id text,
  p_result_status text
)
returns public.pick_bouts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_bout_id text := lower(trim(p_bout_id));
  v_result_status text := lower(trim(p_result_status));
  v_event public.pick_events;
  v_bout public.pick_bouts;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  if v_result_status not in ('red_win', 'blue_win', 'draw', 'no_contest', 'cancelled') then
    raise exception 'initial result entry requires a final official result';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then raise exception 'event not found'; end if;
  if v_event.status = 'complete' then
    raise exception 'completed event results require the correction workflow';
  end if;
  if v_event.status <> 'locked' then
    raise exception 'event must be locked before recording results';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event_id
    and bout_id = v_bout_id
  for update;

  if not found then raise exception 'bout not found'; end if;
  if not v_bout.included_in_picks then raise exception 'fight is removed from Picks'; end if;
  if v_bout.result_status <> 'pending' then
    raise exception 'official result already recorded; use correction workflow';
  end if;

  update public.pick_bouts
  set result_status = v_result_status,
      winner_fighter_slug = case v_result_status
        when 'red_win' then v_bout.red_fighter_slug
        when 'blue_win' then v_bout.blue_fighter_slug
        else null
      end,
      result_recorded_at = now()
  where event_id = v_event_id
    and bout_id = v_bout_id
  returning * into v_bout;

  return v_bout;
end;
$$;

revoke all on function public.record_official_pick_bout_result(text,text,text)
  from public, anon, authenticated;
grant execute on function public.record_official_pick_bout_result(text,text,text)
  to authenticated, service_role;

create or replace function public.correct_official_pick_bout_result(
  p_event_id text,
  p_bout_id text,
  p_result_status text,
  p_expected_result_status text,
  p_expected_winner_fighter_slug text,
  p_expected_result_recorded_at timestamptz,
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
  v_result_status text := lower(trim(p_result_status));
  v_expected_result_status text := lower(trim(p_expected_result_status));
  v_expected_winner text := case
    when p_expected_winner_fighter_slug is null then null
    else lower(trim(p_expected_winner_fighter_slug))
  end;
  v_reason text := trim(p_reason);
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_before jsonb;
  v_after jsonb;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  if v_result_status not in ('red_win', 'blue_win', 'draw', 'no_contest', 'cancelled') then
    raise exception 'corrected official result requires a final result';
  end if;
  if v_expected_result_status not in ('red_win', 'blue_win', 'draw', 'no_contest', 'cancelled') then
    raise exception 'expected current final result is required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'result correction reason required';
  end if;
  if p_expected_result_recorded_at is null then
    raise exception 'expected current result timestamp is required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then raise exception 'event not found'; end if;
  if v_event.status not in ('locked', 'complete') then
    raise exception 'result corrections require a locked or completed event';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event_id
    and bout_id = v_bout_id
  for update;

  if not found then raise exception 'bout not found'; end if;
  if not v_bout.included_in_picks then raise exception 'fight is removed from Picks'; end if;
  if v_bout.result_status = 'pending' then
    raise exception 'pending bout requires initial result entry';
  end if;

  if v_bout.result_status is distinct from v_expected_result_status
    or v_bout.winner_fighter_slug is distinct from v_expected_winner
    or v_bout.result_recorded_at is distinct from p_expected_result_recorded_at then
    raise exception 'official result changed; reload Fight Night Control';
  end if;

  if v_bout.result_status = v_result_status then
    raise exception 'corrected official result is unchanged';
  end if;

  v_before := jsonb_build_object(
    'event_status', v_event.status,
    'result_status', v_bout.result_status,
    'winner_fighter_slug', v_bout.winner_fighter_slug,
    'result_recorded_at', v_bout.result_recorded_at,
    'red_fighter_slug', v_bout.red_fighter_slug,
    'blue_fighter_slug', v_bout.blue_fighter_slug
  );

  update public.pick_bouts
  set result_status = v_result_status,
      winner_fighter_slug = case v_result_status
        when 'red_win' then v_bout.red_fighter_slug
        when 'blue_win' then v_bout.blue_fighter_slug
        else null
      end,
      result_recorded_at = now()
  where event_id = v_event_id
    and bout_id = v_bout_id
  returning * into v_bout;

  v_after := jsonb_build_object(
    'event_status', v_event.status,
    'result_status', v_bout.result_status,
    'winner_fighter_slug', v_bout.winner_fighter_slug,
    'result_recorded_at', v_bout.result_recorded_at,
    'red_fighter_slug', v_bout.red_fighter_slug,
    'blue_fighter_slug', v_bout.blue_fighter_slug
  );

  insert into public.pick_result_corrections(
    event_id,
    bout_id,
    reason,
    before_state,
    after_state,
    corrected_by
  ) values (
    v_event_id,
    v_bout_id,
    v_reason,
    v_before,
    v_after,
    auth.uid()
  );

  return v_bout;
end;
$$;

revoke all on function public.correct_official_pick_bout_result(text,text,text,text,text,timestamptz,text)
  from public, anon, authenticated;
grant execute on function public.correct_official_pick_bout_result(text,text,text,text,text,timestamptz,text)
  to authenticated, service_role;

-- Extend the existing owner projection rather than creating another control owner.
-- An explicit event ID supports correcting a completed event even after a new card exists.
drop function if exists public.get_pick_control_event();
create function public.get_pick_control_event(p_event_id text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_requested_event_id text := nullif(lower(trim(p_event_id)), '');
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
    'recent_completed_events', coalesce((
      select jsonb_agg(recent_event.item order by recent_event.completed_at desc)
      from (
        select
          completed.completed_at,
          jsonb_build_object(
            'event_id', completed.event_id,
            'name', completed.name,
            'starts_at', completed.starts_at,
            'completed_at', completed.completed_at
          ) item
        from public.pick_events completed
        where completed.status = 'complete'
        order by completed.completed_at desc
        limit 5
      ) recent_event
    ), '[]'::jsonb),
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
        'can_correct_result', event.status in ('locked', 'complete')
          and bout.included_in_picks
          and bout.result_status <> 'pending',
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
        ),
        'has_correction_history', exists (
          select 1
          from public.pick_result_corrections correction
          where correction.event_id = bout.event_id
            and correction.bout_id = bout.bout_id
        )
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  ) into v_result
  from public.pick_events event
  where (
      v_requested_event_id is not null
      and event.event_id = v_requested_event_id
    ) or (
      v_requested_event_id is null
      and event.status in ('upcoming', 'locked', 'complete')
    )
  order by
    case
      when v_requested_event_id is not null then 0
      when event.status in ('upcoming', 'locked') then 0
      else 1
    end,
    case when event.status = 'complete' then event.completed_at end desc nulls last,
    event.starts_at asc
  limit 1;

  return v_result;
end;
$$;

revoke all on function public.get_pick_control_event(text)
  from public, anon;
grant execute on function public.get_pick_control_event(text)
  to authenticated;

notify pgrst, 'reload schema';
