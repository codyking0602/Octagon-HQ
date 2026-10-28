-- Restore the locked Weekly Auction bankroll floor after launch.
-- 0 teams owned: keep $2; 1 team owned: keep $1; 2+ teams owned: may spend to $0.

create or replace function private.football_weekly_auction_reserve_floor(p_owned integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case when p_owned <= 0 then 2 when p_owned = 1 then 1 else 0 end;
$$;

create or replace function public.get_my_football_weekly_auction(p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_week_start date;
  v_day_index integer;
  v_previous_week date;
  v_bankroll integer;
  v_owned integer;
  v_floor integer;
  v_submitted boolean;
  v_show_intro boolean;
  v_previous_final jsonb := null;
  v_teams jsonb;
  v_bids jsonb;
  v_prior_results jsonb := '[]'::jsonb;
  v_collection jsonb;
  v_theme text;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if (p_at at time zone 'America/Chicago')::date < date '2026-09-15' then
    return jsonb_build_object(
      'available', false,
      'starts_on', date '2026-09-15'
    );
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start := private.football_weekly_auction_week_start(p_at);
  v_day_index := private.football_weekly_auction_day_index(p_at, v_week_start);
  v_previous_week := v_week_start - 7;

  if exists (
    select 1
    from private.football_weekly_auction_results result
    where result.week_start = v_previous_week and result.profile_id = v_profile
  ) and not exists (
    select 1
    from private.football_weekly_auction_final_views view
    where view.week_start = v_previous_week and view.profile_id = v_profile
  ) then
    v_previous_final := private.football_weekly_auction_final_payload(v_previous_week, v_profile);
  end if;

  select 40 - coalesce(sum(award.winning_bid),0)::integer,
         count(*)::integer
  into v_bankroll, v_owned
  from private.football_weekly_auction_awards award
  where award.week_start = v_week_start
    and award.profile_id = v_profile;


  v_floor := private.football_weekly_auction_reserve_floor(v_owned);

  select exists (
    select 1 from private.football_weekly_auction_daily_entries entry
    where entry.week_start = v_week_start and entry.day_index = v_day_index and entry.profile_id = v_profile
  ) into v_submitted;

  select not exists (
    select 1 from private.football_weekly_auction_daily_entries entry
    where entry.week_start = v_week_start and entry.profile_id = v_profile
  ) into v_show_intro;

  select min(board.theme),
         coalesce(jsonb_agg(jsonb_build_object(
           'slot', board.slot,
           'season_reference', board.season_reference,
           'school', pool.school,
           'season_year', pool.season_year,
           'display_label', pool.display_label,
           'lock_at', board.lock_at
         ) order by board.slot), '[]'::jsonb)
  into v_theme, v_teams
  from private.football_weekly_auction_board board
  join private.draft_room_cfb_best_teams_pool pool using (season_reference)
  where board.week_start = v_week_start and board.day_index = v_day_index;

  select coalesce(jsonb_object_agg(bid.slot::text, bid.amount), '{}'::jsonb)
  into v_bids
  from private.football_weekly_auction_bids bid
  where bid.week_start = v_week_start
    and bid.day_index = v_day_index
    and bid.profile_id = v_profile;

  if v_day_index > 1 then
    select coalesce(jsonb_agg(result_row.payload order by result_row.slot), '[]'::jsonb)
    into v_prior_results
    from (
      select
        board.slot,
        jsonb_build_object(
          'slot', board.slot,
          'season_reference', board.season_reference,
          'school', pool.school,
          'season_year', pool.season_year,
          'display_label', pool.display_label,
          'winning_bid', award.winning_bid,
          'winner_profile_id', award.profile_id,
          'winner_display_name', winner.display_name,
          'bids', coalesce((
            select jsonb_agg(jsonb_build_object(
              'profile_id', entry.profile_id,
              'display_name', bidder.display_name,
              'amount', coalesce(bid.amount,0)
            ) order by coalesce(bid.amount,0) desc, bidder.display_name)
            from private.football_weekly_auction_daily_entries entry
            join public.profiles bidder on bidder.id = entry.profile_id
            left join private.football_weekly_auction_bids bid
              on bid.week_start = entry.week_start
             and bid.day_index = entry.day_index
             and bid.profile_id = entry.profile_id
             and bid.slot = board.slot
            where entry.week_start = v_week_start
              and entry.day_index = v_day_index - 1
          ), '[]'::jsonb)
        ) as payload
      from private.football_weekly_auction_board board
      join private.draft_room_cfb_best_teams_pool pool using (season_reference)
      join private.football_weekly_auction_awards award
        on award.week_start = board.week_start
       and award.day_index = board.day_index
       and award.slot = board.slot
      left join public.profiles winner on winner.id = award.profile_id
      where board.week_start = v_week_start
        and board.day_index = v_day_index - 1
    ) result_row;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'season_reference', board.season_reference,
    'school', pool.school,
    'season_year', pool.season_year,
    'display_label', pool.display_label,
    'winning_bid', award.winning_bid
  ) order by award.day_index, award.slot), '[]'::jsonb)
  into v_collection
  from private.football_weekly_auction_awards award
  join private.football_weekly_auction_board board
    on board.week_start = award.week_start
   and board.day_index = award.day_index
   and board.slot = award.slot
  join private.draft_room_cfb_best_teams_pool pool using (season_reference)
  where award.week_start = v_week_start
    and award.profile_id = v_profile;

  return jsonb_build_object(
    'available', true,
    'week_start', v_week_start,
    'week_end', v_week_start + 6,
    'day_index', v_day_index,
    'theme', v_theme,
    'bankroll', v_bankroll,
    'owned_count', v_owned,
    'reserve_floor', v_floor,
    'max_commit', greatest(v_bankroll - v_floor, 0),
    'submitted_today', v_submitted,
    'show_intro', v_show_intro,
    'teams', v_teams,
    'bids', v_bids,
    'prior_results', v_prior_results,
    'collection', v_collection,
    'previous_final', v_previous_final
  );
end;
$$;

revoke all on function public.get_my_football_weekly_auction(timestamptz)
  from public, anon;
grant execute on function public.get_my_football_weekly_auction(timestamptz)
  to authenticated;


create or replace function public.submit_my_football_weekly_auction_bids(
  p_bids jsonb,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_week_start date;
  v_day_index integer;
  v_lock_at timestamptz;
  v_owned integer;
  v_bankroll integer;
  v_floor integer;
  v_max integer;
  v_bid1 integer;
  v_bid2 integer;
  v_bid3 integer;
  v_total integer;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if (p_at at time zone 'America/Chicago')::date < date '2026-09-15' then
    raise exception 'Football Weekly Auction has not started';
  end if;
  if jsonb_typeof(p_bids) <> 'object' then
    raise exception 'bids must be an object';
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start := private.football_weekly_auction_week_start(p_at);
  v_day_index := private.football_weekly_auction_day_index(p_at, v_week_start);

  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start = v_week_start and day_index = v_day_index;

  if v_lock_at is null or p_at >= v_lock_at then
    raise exception 'Today''s Weekly Auction bids are locked';
  end if;

  begin
    v_bid1 := coalesce((p_bids ->> '1')::integer, 0);
    v_bid2 := coalesce((p_bids ->> '2')::integer, 0);
    v_bid3 := coalesce((p_bids ->> '3')::integer, 0);
  exception when others then
    raise exception 'Weekly Auction bids must be whole-dollar integers';
  end;

  if least(v_bid1,v_bid2,v_bid3) < 0 or greatest(v_bid1,v_bid2,v_bid3) > 40 then
    raise exception 'Weekly Auction bids must be between $0 and $40';
  end if;

  select 40 - coalesce(sum(award.winning_bid),0)::integer,
         count(*)::integer
  into v_bankroll, v_owned
  from private.football_weekly_auction_awards award
  where award.week_start = v_week_start
    and award.profile_id = v_profile;

  v_floor := private.football_weekly_auction_reserve_floor(v_owned);
  v_max := greatest(v_bankroll - v_floor, 0);
  v_total := v_bid1 + v_bid2 + v_bid3;

  if v_total > v_max then
    raise exception 'Today''s bids exceed the available Weekly Auction commitment of $%', v_max;
  end if;

  insert into private.football_weekly_auction_daily_entries(
    week_start, day_index, profile_id, submitted_at, updated_at
  ) values (
    v_week_start, v_day_index, v_profile, p_at, p_at
  )
  on conflict (week_start, day_index, profile_id)
  do update set updated_at = excluded.updated_at;

  insert into private.football_weekly_auction_bids(
    week_start, day_index, profile_id, slot, amount, updated_at
  ) values
    (v_week_start, v_day_index, v_profile, 1, v_bid1, p_at),
    (v_week_start, v_day_index, v_profile, 2, v_bid2, p_at),
    (v_week_start, v_day_index, v_profile, 3, v_bid3, p_at)
  on conflict (week_start, day_index, profile_id, slot)
  do update set amount = excluded.amount, updated_at = excluded.updated_at;

  return public.get_my_football_weekly_auction(p_at);
end;
$$;

revoke all on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  from public, anon;
grant execute on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  to authenticated;



do $weekly_auction_bankroll_floor_contract$
begin
  if private.football_weekly_auction_reserve_floor(0) <> 2
    or private.football_weekly_auction_reserve_floor(1) <> 1
    or private.football_weekly_auction_reserve_floor(2) <> 0 then
    raise exception 'Weekly Auction bankroll floor drifted';
  end if;
end
$weekly_auction_bankroll_floor_contract$;
