-- Permanently keep reserved utility/test profiles out of live Weekly Auction fields.
-- Also preserve any NFL Team-Seasons slot that a real participant has already submitted
-- against, so removing a bad participant cannot silently shrink an in-progress board.

create or replace function private.football_weekly_auction_is_reserved_test_profile(
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists(
    select 1
    from public.profiles profile
    where profile.id=p_profile_id
      and (
        upper(regexp_replace(coalesce(profile.normalized_name,''),'[^A-Z0-9]+','','g'))
          in ('TEST','TEST2','TESTPROFILE')
        or upper(regexp_replace(coalesce(profile.display_name,''),'[^A-Z0-9]+','','g'))
          in ('TEST','TEST2','TESTPROFILE')
      )
  );
$$;
revoke all on function private.football_weekly_auction_is_reserved_test_profile(uuid)
  from public,anon,authenticated;

-- Clean unfinished live weeks only when the reserved profile has not already won
-- an item. Daily entries own bids by cascade, so remove those before the participant.
delete from private.football_weekly_auction_daily_entries entry
using private.football_weekly_auction_weeks week
where entry.week_start=week.week_start
  and week.finalized_at is null
  and private.football_weekly_auction_is_reserved_test_profile(entry.profile_id)
  and not exists(
    select 1
    from private.football_weekly_auction_awards award
    where award.week_start=entry.week_start
      and award.profile_id=entry.profile_id
  );

delete from private.football_weekly_auction_participants participant
using private.football_weekly_auction_weeks week
where participant.week_start=week.week_start
  and week.finalized_at is null
  and private.football_weekly_auction_is_reserved_test_profile(participant.profile_id)
  and not exists(
    select 1
    from private.football_weekly_auction_awards award
    where award.week_start=participant.week_start
      and award.profile_id=participant.profile_id
  );

create or replace function private.ensure_football_weekly_auction_participant(
  p_week_start date,
  p_profile_id uuid,
  p_at timestamptz default now()
)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare
  v_subject text;
  v_join_lock_at timestamptz;
  v_field_locked_at timestamptz;
  v_capacity integer;
  v_current integer;
begin
  if p_profile_id is null then return false; end if;

  if private.football_weekly_auction_is_reserved_test_profile(p_profile_id) then
    return false;
  end if;

  if exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
      and participant.profile_id=p_profile_id
  ) then
    return true;
  end if;

  select week.subject_key,week.field_locked_at
  into v_subject,v_field_locked_at
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;

  if v_subject is null then return false; end if;

  -- Every Weekly Auction freezes its competitor field at the Day 1 lock.
  -- Elastic CFB supply affects hidden future cards only, never who may join.
  select min(board.lock_at) into v_join_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=p_week_start
    and board.day_index=1;

  if v_join_lock_at is null
    or v_field_locked_at is not null
    or p_at>=v_join_lock_at
  then
    return false;
  end if;

  -- Capacity protection still applies while the Day 1 join window is open.
  if v_subject='cfb-superteam' then
    v_capacity:=private.football_weekly_superteam_join_capacity(p_week_start,p_at);
    select count(*)::integer into v_current
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
      and not private.football_weekly_auction_is_reserved_test_profile(participant.profile_id);

    if v_current>=v_capacity then return false; end if;
  end if;

  insert into private.football_weekly_auction_participants(
    week_start,profile_id,locked_at,source
  )
  values (p_week_start,p_profile_id,p_at,'day_1_join')
  on conflict(week_start,profile_id) do nothing;

  return exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
      and participant.profile_id=p_profile_id
  );
end;
$$;
revoke all on function private.ensure_football_weekly_auction_participant(date,uuid,timestamptz)
  from public,anon,authenticated;

create or replace function private.football_weekly_auction_cards_for_day(
  p_week_start date,
  p_day_index integer
)
returns integer
language plpgsql
stable
security definer
set search_path=''
as $$
declare
  v_subject text;
  v_day_start timestamptz;
  v_players integer;
  v_base integer;
  v_needed integer;
  v_remaining_days integer;
  v_completion_floor integer;
  v_available integer;
  v_committed_slot integer;
begin
  if p_day_index not between 1 and 7 then
    raise exception 'Football Weekly Auction day must be between 1 and 7';
  end if;

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject='nfl-best-team-seasons-since-2000' then
    if p_day_index=7 then return 0; end if;

    select count(*)::integer into v_available
    from private.football_weekly_auction_board board
    where board.week_start=p_week_start
      and board.day_index=p_day_index;

    -- Day 1 is exposed before the join window freezes. Keep that visible board
    -- immutable at the expected five-player four-card launch shape; only later
    -- unrevealed days may expand or contract with the frozen field.
    if p_day_index=1 then
      return least(v_available,4);
    end if;

    v_day_start:=((p_week_start+(p_day_index-1))::timestamp at time zone 'America/Chicago');
    select count(*)::integer into v_players
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
      and participant.locked_at<v_day_start
      and not private.football_weekly_auction_is_reserved_test_profile(participant.profile_id);

    if v_players=0 then
      select count(*)::integer into v_players
      from private.football_weekly_auction_participants participant
      where participant.week_start=p_week_start
        and not private.football_weekly_auction_is_reserved_test_profile(participant.profile_id);
    end if;

    v_base:=private.football_weekly_nfl_team_season_cards_for_field(v_players);
    v_remaining_days:=7-p_day_index;

    select coalesce(sum(greatest(4-owned.owned_count,0)),0)::integer into v_needed
    from (
      select
        participant.profile_id,
        count(award.profile_id)::integer as owned_count
      from private.football_weekly_auction_participants participant
      left join private.football_weekly_auction_awards award
        on award.week_start=participant.week_start
       and award.profile_id=participant.profile_id
       and award.day_index between 1 and greatest(p_day_index-1,0)
      where participant.week_start=p_week_start
        and not private.football_weekly_auction_is_reserved_test_profile(participant.profile_id)
      group by participant.profile_id
    ) owned;

    v_completion_floor:=case
      when v_remaining_days<=0 then v_base
      else ceil(v_needed::numeric/v_remaining_days)::integer
    end;

    -- Once a real player has submitted against a visible slot, that slot is
    -- committed for the day even if the field is later corrected downward.
    select coalesce(max(bid.slot),0)::integer into v_committed_slot
    from private.football_weekly_auction_bids bid
    join private.football_weekly_auction_participants participant
      on participant.week_start=bid.week_start
     and participant.profile_id=bid.profile_id
    where bid.week_start=p_week_start
      and bid.day_index=p_day_index
      and not private.football_weekly_auction_is_reserved_test_profile(bid.profile_id);

    return least(
      v_available,
      greatest(v_base,v_completion_floor,v_committed_slot)
    );
  end if;

  if v_subject='cfb-superteam' then
    if exists(
      select 1
      from private.football_weekly_superteam_lab_runs lab
      where lab.lab_week_start=p_week_start
    ) then
      if p_day_index=1 then return 10; end if;
      select count(*)::integer into v_players
      from private.football_weekly_auction_participants participant
      where participant.week_start=p_week_start
        and not private.football_weekly_auction_is_reserved_test_profile(participant.profile_id);
      return private.football_weekly_superteam_cards_for_field(v_players);
    end if;

    if p_week_start=date '2026-09-29' and p_day_index=1 then return 10; end if;

    v_day_start:=((p_week_start+(p_day_index-1))::timestamp at time zone 'America/Chicago');
    select count(*)::integer into v_players
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
      and participant.locked_at<v_day_start
      and not private.football_weekly_auction_is_reserved_test_profile(participant.profile_id);
    return private.football_weekly_superteam_cards_for_field(v_players);
  end if;

  return private.football_weekly_auction_cards_per_day(p_week_start);
end;
$$;
revoke all on function private.football_weekly_auction_cards_for_day(date,integer)
  from public,anon,authenticated;

do $weekly_reserved_test_profile_guard_contract$
begin
  if exists(
    select 1
    from private.football_weekly_auction_participants participant
    join private.football_weekly_auction_weeks week
      on week.week_start=participant.week_start
    where week.finalized_at is null
      and private.football_weekly_auction_is_reserved_test_profile(participant.profile_id)
      and not exists(
        select 1
        from private.football_weekly_auction_awards award
        where award.week_start=participant.week_start
          and award.profile_id=participant.profile_id
      )
  ) then
    raise exception 'Reserved test profiles must not remain in unfinished Weekly Auction fields';
  end if;
end;
$weekly_reserved_test_profile_guard_contract$;
