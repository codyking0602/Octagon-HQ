-- Keep the TEST2 utility profile out of live Football Weekly Auction fields.
-- Opening the Weekly Auction route auto-enrolls eligible signed-in profiles through
-- the join window. TEST2 is an owner utility profile and must never affect the
-- live participant count or the elastic CFB Superteam board size.

delete from private.football_weekly_auction_participants participant
using public.profiles profile, private.football_weekly_auction_weeks week
where participant.profile_id=profile.id
  and participant.week_start=week.week_start
  and profile.normalized_name='TEST2'
  and week.finalized_at is null
  and not exists (
    select 1
    from private.football_weekly_auction_daily_entries entry
    where entry.week_start=participant.week_start
      and entry.profile_id=participant.profile_id
  )
  and not exists (
    select 1
    from private.football_weekly_auction_bids bid
    where bid.week_start=participant.week_start
      and bid.profile_id=participant.profile_id
  )
  and not exists (
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
  v_day_index integer;
  v_join_lock_at timestamptz;
  v_field_locked_at timestamptz;
  v_capacity integer;
  v_current integer;
begin
  if p_profile_id is null then return false; end if;

  -- TEST2 is an owner utility profile. It can inspect the app, but it must never
  -- join a live Weekly Auction field or change elastic candidate supply.
  if exists (
    select 1
    from public.profiles profile
    where profile.id=p_profile_id
      and profile.normalized_name='TEST2'
  ) then
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

  select min(board.lock_at) into v_join_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=p_week_start
    and board.day_index=case when v_subject='cfb-superteam' then 4 else 1 end;

  if v_join_lock_at is null
    or v_field_locked_at is not null
    or p_at>=v_join_lock_at
  then
    return false;
  end if;

  if v_subject='cfb-superteam' then
    v_capacity:=private.football_weekly_superteam_join_capacity(p_week_start,p_at);
    select count(*)::integer into v_current
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start;

    if v_current>=v_capacity then return false; end if;
  end if;

  v_day_index:=private.football_weekly_auction_day_index(p_at,p_week_start);

  insert into private.football_weekly_auction_participants(
    week_start,profile_id,locked_at,source
  )
  values (
    p_week_start,
    p_profile_id,
    p_at,
    case
      when v_subject='cfb-superteam' and v_day_index>1 then 'elastic_join'
      else 'day_1_join'
    end
  )
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
