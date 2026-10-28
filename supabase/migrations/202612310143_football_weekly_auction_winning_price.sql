-- Add resolved winning prices to the public Weekly Auction table without exposing sealed bids.

create or replace function public.get_football_weekly_auction_table(p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_week_start date;
  v_table jsonb := '[]'::jsonb;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  if (p_at at time zone 'America/Chicago')::date < date '2026-09-15' then
    return '[]'::jsonb;
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start := private.football_weekly_auction_week_start(p_at);

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
    select
      participant.profile_id,
      coalesce(profile.display_name, 'Player') as display_name,
      participant.profile_id = v_profile as is_current_user,
      40 - coalesce(sum(award.winning_bid), 0)::integer as bankroll,
      count(award.profile_id)::integer as owned_count,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'season_reference', board.season_reference,
            'school', pool.school,
            'season_year', pool.season_year,
            'display_label', pool.display_label,
            'price_paid', award.winning_bid
          )
          order by award.day_index, award.slot
        ) filter (where award.profile_id is not null),
        '[]'::jsonb
      ) as teams
    from participants participant
    join public.profiles profile on profile.id = participant.profile_id
    left join private.football_weekly_auction_awards award
      on award.week_start = v_week_start
     and award.profile_id = participant.profile_id
    left join private.football_weekly_auction_board board
      on board.week_start = award.week_start
     and board.day_index = award.day_index
     and board.slot = award.slot
    left join private.draft_room_cfb_best_teams_pool pool
      on pool.season_reference = board.season_reference
    group by participant.profile_id, profile.display_name
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'profile_id', summary.profile_id,
        'display_name', summary.display_name,
        'is_current_user', summary.is_current_user,
        'bankroll', summary.bankroll,
        'owned_count', summary.owned_count,
        'teams', summary.teams
      )
      order by summary.is_current_user desc, lower(summary.display_name), summary.profile_id
    ),
    '[]'::jsonb
  )
  into v_table
  from summaries summary;

  return v_table;
end;
$$;

revoke all on function public.get_football_weekly_auction_table(timestamptz)
  from public, anon;
grant execute on function public.get_football_weekly_auction_table(timestamptz)
  to authenticated;

-- Resolved award prices are public strategy state; current sealed bid rows and hidden grades remain private.
do $football_weekly_auction_table_price_contract$
declare
  v_definition text;
begin
  v_definition := pg_get_functiondef(
    'public.get_football_weekly_auction_table(timestamptz)'::regprocedure
  );

  if position('price_paid' in v_definition) = 0
    or position('award.winning_bid' in v_definition) = 0 then
    raise exception 'Weekly Auction table must expose resolved winning prices';
  end if;

  if position('private.football_weekly_auction_bids' in v_definition) > 0
    or position('hidden_grade' in v_definition) > 0 then
    raise exception 'Weekly Auction table must not expose sealed bids or hidden grades';
  end if;
end
$football_weekly_auction_table_price_contract$;
