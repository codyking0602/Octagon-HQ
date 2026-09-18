-- Lock the Football Weekly Auction competitor field at Tuesday 12:00 AM CT.
-- The launch week is backfilled from Day 1 entrants. Future weeks carry the prior
-- locked field forward and add profiles created after the prior lock but before
-- the new Tuesday lock. Midweek joins wait until the following week.

alter table private.football_weekly_auction_weeks
  add column if not exists field_locked_at timestamptz;

create table if not exists private.football_weekly_auction_participants (
  week_start date not null
    references private.football_weekly_auction_weeks(week_start)
    on delete cascade,
  profile_id uuid not null
    references public.profiles(id)
    on delete cascade,
  locked_at timestamptz not null,
  source text not null,
  primary key (week_start, profile_id)
);

create index if not exists football_weekly_auction_participants_profile_idx
  on private.football_weekly_auction_participants(profile_id, week_start);

revoke all on private.football_weekly_auction_participants
  from public, anon, authenticated;

-- Freeze the already-running launch field to the players who were present on Day 1.
insert into private.football_weekly_auction_participants(
  week_start,
  profile_id,
  locked_at,
  source
)
select
  date '2026-09-15',
  entry.profile_id,
  (date '2026-09-15'::timestamp at time zone 'America/Chicago'),
  'launch_day_1'
from private.football_weekly_auction_daily_entries entry
where entry.week_start = date '2026-09-15'
  and entry.day_index = 1
on conflict (week_start, profile_id) do nothing;

update private.football_weekly_auction_weeks week
set field_locked_at = coalesce(
  week.field_locked_at,
  (week.week_start::timestamp at time zone 'America/Chicago')
)
where week.week_start = date '2026-09-15';

-- A late entrant must never have already won a resolved team before we remove
-- their launch-week bids. Refuse deployment rather than silently rewriting history.
do $launch_guard$
begin
  if exists (
    select 1
    from private.football_weekly_auction_awards award
    where award.week_start = date '2026-09-15'
      and award.profile_id is not null
      and not exists (
        select 1
        from private.football_weekly_auction_participants participant
        where participant.week_start = award.week_start
          and participant.profile_id = award.profile_id
      )
  ) then
    raise exception 'Cannot lock launch Weekly Auction field: a midweek entrant already owns a resolved team';
  end if;
end
$launch_guard$;

-- Remove any launch-week entries from profiles that were not in the Day 1 field.
-- Bid rows cascade from daily entries. Existing resolved winners are guarded above.
delete from private.football_weekly_auction_daily_entries entry
where entry.week_start = date '2026-09-15'
  and not exists (
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start = entry.week_start
      and participant.profile_id = entry.profile_id
  );

delete from private.football_weekly_auction_results result
where result.week_start = date '2026-09-15'
  and not exists (
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start = result.week_start
      and participant.profile_id = result.profile_id
  );

delete from private.football_weekly_auction_final_views view_row
where view_row.week_start = date '2026-09-15'
  and not exists (
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start = view_row.week_start
      and participant.profile_id = view_row.profile_id
  );

create or replace function private.materialize_football_weekly_auction_participants(
  p_week_start date
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_field_locked_at timestamptz;
  v_lock_at timestamptz;
  v_previous_lock_at timestamptz;
begin
  if p_week_start < date '2026-09-15' then
    return;
  end if;
  if extract(isodow from p_week_start) <> 2 then
    raise exception 'Football Weekly Auction participant field must start Tuesday';
  end if;

  -- materialize_football_weekly_auction_week owns week creation.
  select week.field_locked_at
  into v_field_locked_at
  from private.football_weekly_auction_weeks week
  where week.week_start = p_week_start
  for update;

  if not found then
    raise exception 'Football Weekly Auction week % must exist before its field is locked', p_week_start;
  end if;
  if v_field_locked_at is not null then
    return;
  end if;

  v_lock_at := (p_week_start::timestamp at time zone 'America/Chicago');
  v_previous_lock_at := ((p_week_start - 7)::timestamp at time zone 'America/Chicago');

  if p_week_start = date '2026-09-15' then
    insert into private.football_weekly_auction_participants(
      week_start,
      profile_id,
      locked_at,
      source
    )
    select
      p_week_start,
      entry.profile_id,
      v_lock_at,
      'launch_day_1'
    from private.football_weekly_auction_daily_entries entry
    where entry.week_start = p_week_start
      and entry.day_index = 1
    on conflict (week_start, profile_id) do nothing;
  else
    -- Everyone in last week's locked field stays in the competition.
    insert into private.football_weekly_auction_participants(
      week_start,
      profile_id,
      locked_at,
      source
    )
    select
      p_week_start,
      prior.profile_id,
      v_lock_at,
      'carried'
    from private.football_weekly_auction_participants prior
    where prior.week_start = p_week_start - 7
    on conflict (week_start, profile_id) do nothing;

    -- New profiles become eligible only at the next Tuesday lock.
    insert into private.football_weekly_auction_participants(
      week_start,
      profile_id,
      locked_at,
      source
    )
    select
      p_week_start,
      profile.id,
      v_lock_at,
      'joined_previous_week'
    from public.profiles profile
    where profile.created_at >= v_previous_lock_at
      and profile.created_at < v_lock_at
    on conflict (week_start, profile_id) do nothing;
  end if;

  update private.football_weekly_auction_weeks
  set field_locked_at = v_lock_at
  where week_start = p_week_start;
end;
$$;

revoke all on function private.materialize_football_weekly_auction_participants(date)
  from public, anon, authenticated;

-- Make weekly maintenance lock the field exactly once, immediately after the
-- week/board exists and before any gate, state, or resolution can use it.
do $patch_maintenance$
declare
  v_signature constant regprocedure :=
    'private.maintain_football_weekly_auction(timestamp with time zone)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
  v_week_start := private.football_weekly_auction_week_start(p_at);
  perform private.materialize_football_weekly_auction_week(v_week_start);
$old$;
  v_replacement constant text := $new$
  v_week_start := private.football_weekly_auction_week_start(p_at);
  perform private.materialize_football_weekly_auction_week(v_week_start);
  perform private.materialize_football_weekly_auction_participants(v_week_start);
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('materialize_football_weekly_auction_participants' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'Weekly Auction maintenance owner changed unexpectedly';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;
end
$patch_maintenance$;

-- Defense in depth: only locked-field participants can win a resolved team.
do $patch_resolution$
declare
  v_signature constant regprocedure :=
    'private.resolve_football_weekly_auction_day(date,integer,timestamp with time zone)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
      and bid.slot = v_slot
      and bid.amount > 0
    order by
$old$;
  v_replacement constant text := $new$
      and bid.slot = v_slot
      and bid.amount > 0
      and exists (
        select 1
        from private.football_weekly_auction_participants participant
        where participant.week_start = bid.week_start
          and participant.profile_id = bid.profile_id
      )
    order by
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('football_weekly_auction_participants participant' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'Weekly Auction resolution owner changed unexpectedly';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;
end
$patch_resolution$;

-- Final standings are the locked field, including a player who skipped every day.
do $patch_finalization$
declare
  v_signature constant regprocedure :=
    'private.finalize_football_weekly_auction_week(date,timestamp with time zone)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
  with participants as (
    select distinct profile_id
    from private.football_weekly_auction_daily_entries
    where week_start = p_week_start
  ),
$old$;
  v_replacement constant text := $new$
  with participants as (
    select profile_id
    from private.football_weekly_auction_participants
    where week_start = p_week_start
  ),
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('from private.football_weekly_auction_participants' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'Weekly Auction finalization participant source changed unexpectedly';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;
end
$patch_finalization$;

create or replace function public.football_weekly_auction_daily_gate(
  p_profile_id uuid,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_week_start date;
  v_day_index integer;
  v_required boolean;
begin
  if p_profile_id is null then
    raise exception 'profile required';
  end if;
  if (p_at at time zone 'America/Chicago')::date < date '2026-09-15' then
    return jsonb_build_object('required', false, 'available', false);
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start := private.football_weekly_auction_week_start(p_at);
  v_day_index := private.football_weekly_auction_day_index(p_at, v_week_start);

  if not exists (
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start = v_week_start
      and participant.profile_id = p_profile_id
  ) then
    return jsonb_build_object(
      'required', false,
      'available', false,
      'field_locked', true,
      'week_start', v_week_start,
      'day_index', v_day_index,
      'eligible_week_start', v_week_start + 7
    );
  end if;

  select not exists (
    select 1
    from private.football_weekly_auction_daily_entries entry
    where entry.week_start = v_week_start
      and entry.day_index = v_day_index
      and entry.profile_id = p_profile_id
  ) into v_required;

  return jsonb_build_object(
    'required', v_required,
    'available', true,
    'field_locked', true,
    'week_start', v_week_start,
    'day_index', v_day_index
  );
end;
$$;

revoke all on function public.football_weekly_auction_daily_gate(uuid,timestamptz)
  from public, anon, authenticated;
grant execute on function public.football_weekly_auction_daily_gate(uuid,timestamptz)
  to service_role;

-- A nonparticipant can still play Football Daily, but Weekly Auction itself stays
-- unavailable until the following Tuesday.
do $patch_state$
declare
  v_signature constant regprocedure :=
    'public.get_my_football_weekly_auction(timestamp with time zone)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
  v_previous_week := v_week_start - 7;

  if exists (
$old$;
  v_replacement constant text := $new$
  v_previous_week := v_week_start - 7;

  if not exists (
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start = v_week_start
      and participant.profile_id = v_profile
  ) then
    return jsonb_build_object(
      'available', false,
      'locked_this_week', true,
      'week_start', v_week_start,
      'eligible_week_start', v_week_start + 7
    );
  end if;

  if exists (
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('''locked_this_week'', true' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'Weekly Auction current-state owner changed unexpectedly';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;
end
$patch_state$;

-- Submission is rejected server-side even if a stale client tries to post bids.
do $patch_submission$
declare
  v_signature constant regprocedure :=
    'public.submit_my_football_weekly_auction_bids(jsonb,timestamp with time zone)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
  v_week_start := private.football_weekly_auction_week_start(p_at);
  v_day_index := private.football_weekly_auction_day_index(p_at, v_week_start);

  select min(lock_at) into v_lock_at
$old$;
  v_replacement constant text := $new$
  v_week_start := private.football_weekly_auction_week_start(p_at);
  v_day_index := private.football_weekly_auction_day_index(p_at, v_week_start);

  if not exists (
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start = v_week_start
      and participant.profile_id = v_profile
  ) then
    raise exception 'Weekly Auction field is locked for this week';
  end if;

  select min(lock_at) into v_lock_at
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('Weekly Auction field is locked for this week' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'Weekly Auction bid-submission owner changed unexpectedly';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;
end
$patch_submission$;

-- Auction Table membership is the locked field, not whoever happened to submit.
do $patch_table$
declare
  v_signature constant regprocedure :=
    'public.get_football_weekly_auction_table(timestamp with time zone)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
  with participants as (
    select distinct entry.profile_id
    from private.football_weekly_auction_daily_entries entry
    where entry.week_start = v_week_start

    union

    select distinct award.profile_id
    from private.football_weekly_auction_awards award
    where award.week_start = v_week_start

    union

    select v_profile as profile_id
  ), summaries as (
$old$;
  v_replacement constant text := $new$
  with participants as (
    select participant.profile_id
    from private.football_weekly_auction_participants participant
    where participant.week_start = v_week_start
  ), summaries as (
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('from private.football_weekly_auction_participants participant' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'Weekly Auction public-table participant source changed unexpectedly';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;
end
$patch_table$;

-- Contract proof: all live entry rows must now belong to the frozen launch field.
do $field_lock_contract$
begin
  if exists (
    select 1
    from private.football_weekly_auction_daily_entries entry
    where entry.week_start = date '2026-09-15'
      and not exists (
        select 1
        from private.football_weekly_auction_participants participant
        where participant.week_start = entry.week_start
          and participant.profile_id = entry.profile_id
      )
  ) then
    raise exception 'Launch Weekly Auction still contains a nonparticipant entry after field lock';
  end if;

  if position(
    'materialize_football_weekly_auction_participants',
    pg_get_functiondef(
      'private.maintain_football_weekly_auction(timestamp with time zone)'::regprocedure::oid
    )
  ) = 0 then
    raise exception 'Weekly Auction maintenance does not lock the participant field';
  end if;

  if position(
    'Weekly Auction field is locked for this week',
    pg_get_functiondef(
      'public.submit_my_football_weekly_auction_bids(jsonb,timestamp with time zone)'::regprocedure::oid
    )
  ) = 0 then
    raise exception 'Weekly Auction submission does not enforce the locked field';
  end if;
end
$field_lock_contract$;
