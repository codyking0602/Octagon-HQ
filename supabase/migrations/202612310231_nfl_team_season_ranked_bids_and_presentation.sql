-- Restore the approved Weekly Auction interaction model for NFL Team-Seasons:
-- ranked conditional overcommit, exact postseason outcomes, stable season links,
-- and owner-lab persistence for claim priorities.

create or replace function private.football_weekly_nfl_team_season_outcome(
  p_item_reference text,
  p_finish text
)
returns text
language sql
immutable
set search_path=''
as $$
  select case
    when p_finish='Super Bowl Champion' then 'Won Super Bowl'
    when p_finish='Super Bowl Runner-Up' then 'Lost Super Bowl'
    when p_finish='Conference Championship Game' then 'Lost Conference Championship'
    when p_finish='Won Playoff Game' then 'Lost Divisional'
    when p_finish='Missed Playoffs' then 'Missed Playoffs'
    when p_finish='Playoff Team'
      and p_item_reference=any(array[
        'nfl-best-ten-2000','nfl-best-chi-2001','nfl-best-kc-2003',
        'nfl-best-ind-2005','nfl-best-bal-2006','nfl-best-lac-2006',
        'nfl-best-dal-2007','nfl-best-ind-2007','nfl-best-nyg-2008',
        'nfl-best-ten-2008','nfl-best-lac-2009','nfl-best-atl-2010',
        'nfl-best-ne-2010','nfl-best-gb-2011','nfl-best-den-2012',
        'nfl-best-car-2013','nfl-best-den-2014','nfl-best-dal-2016',
        'nfl-best-kc-2016','nfl-best-pit-2017','nfl-best-bal-2019',
        'nfl-best-gb-2021','nfl-best-ten-2021','nfl-best-det-2024'
      ]::text[])
      then 'Lost Divisional'
    when p_finish='Playoff Team' then 'Lost Wild Card'
    else p_finish
  end;
$$;
revoke all on function private.football_weekly_nfl_team_season_outcome(text,text)
  from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_source_url(
  p_franchise text,
  p_season_year integer
)
returns text
language sql
immutable
set search_path=''
as $$
  select 'https://www.pro-football-reference.com/teams/' ||
    case p_franchise
      when 'ARI' then 'crd' when 'ATL' then 'atl' when 'BAL' then 'rav'
      when 'BUF' then 'buf' when 'CAR' then 'car' when 'CHI' then 'chi'
      when 'CIN' then 'cin' when 'CLE' then 'cle' when 'DAL' then 'dal'
      when 'DEN' then 'den' when 'DET' then 'det' when 'GB' then 'gnb'
      when 'HOU' then 'htx' when 'IND' then 'clt' when 'JAX' then 'jax'
      when 'KC' then 'kan' when 'LAC' then 'sdg' when 'LAR' then 'ram'
      when 'LV' then 'rai' when 'MIA' then 'mia' when 'MIN' then 'min'
      when 'NE' then 'nwe' when 'NO' then 'nor' when 'NYG' then 'nyg'
      when 'NYJ' then 'nyj' when 'PHI' then 'phi' when 'PIT' then 'pit'
      when 'SEA' then 'sea' when 'SF' then 'sfo' when 'TB' then 'tam'
      when 'TEN' then 'oti' when 'WAS' then 'was'
      else lower(p_franchise)
    end ||
    '/' || p_season_year::text || '.htm';
$$;
revoke all on function private.football_weekly_nfl_team_season_source_url(text,integer)
  from public,anon,authenticated;

update private.nfl_best_team_seasons_v1_authority authority
set
  postseason_finish=private.football_weekly_nfl_team_season_outcome(
    authority.item_reference,authority.postseason_finish
  ),
  card_tag=authority.record || ' · ' ||
    private.football_weekly_nfl_team_season_outcome(
      authority.item_reference,authority.postseason_finish
    );

update private.football_weekly_auction_items item
set
  secondary_name=authority.card_tag,
  source_url=private.football_weekly_nfl_team_season_source_url(
    authority.franchise_id,authority.season_year
  ),
  grading_inputs=item.grading_inputs || jsonb_build_object(
    'postseason_finish',authority.postseason_finish,
    'card_tag',authority.card_tag
  )
from private.nfl_best_team_seasons_v1_authority authority
where item.item_reference=authority.item_reference
  and item.subject_key='nfl-best-team-seasons-since-2000';

create or replace function private.resolve_football_weekly_nfl_team_season_day(
  p_week_start date,p_day_index integer,p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_iteration integer;
  v_card_count integer;
  v_lock_at timestamptz;
  v_slot integer;
  v_winner uuid;
  v_amount integer;
begin
  if p_day_index not between 1 and 6 then
    raise exception 'NFL Team-Seasons normal auction day must be 1-6';
  end if;

  v_card_count:=private.football_weekly_auction_cards_for_day(p_week_start,p_day_index);
  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start=p_week_start and day_index=p_day_index and slot<=v_card_count;

  if v_lock_at is null or p_at<v_lock_at then return; end if;

  if (
    select count(*) from private.football_weekly_auction_awards
    where week_start=p_week_start and day_index=p_day_index
  )=v_card_count then return; end if;

  insert into private.football_weekly_auction_daily_entries(
    week_start,day_index,profile_id,submitted_at,updated_at
  )
  select p_week_start,p_day_index,participant.profile_id,p_at,p_at
  from private.football_weekly_auction_participants participant
  where participant.week_start=p_week_start
  on conflict(week_start,day_index,profile_id) do nothing;

  -- Resolve claims in participant priority order rather than by raw board slot.
  -- This is the same ranked-conditional model used by CFB Superteam: submitted
  -- bids may exceed bankroll in total, but a claim is only alive while the
  -- bidder can still afford that individual win.
  for v_iteration in 1..v_card_count loop
    select candidate.slot
    into v_slot
    from (
      select
        board.slot,
        coalesce((
          select coalesce(preference.claim_rank,bid.slot)
          from private.football_weekly_auction_bids bid
          left join private.football_weekly_superteam_bid_preferences preference
            on preference.week_start=bid.week_start
           and preference.day_index=bid.day_index
           and preference.profile_id=bid.profile_id
           and preference.slot=bid.slot
          where bid.week_start=board.week_start
            and bid.day_index=board.day_index
            and bid.slot=board.slot
            and bid.amount>0
            and exists(
              select 1
              from private.football_weekly_auction_participants participant
              where participant.week_start=bid.week_start
                and participant.profile_id=bid.profile_id
            )
            and (
              select count(*)
              from private.football_weekly_auction_awards won
              where won.week_start=p_week_start
                and won.profile_id=bid.profile_id
                and won.day_index between 1 and 6
            ) < 5
            and (
              select count(*)
              from private.football_weekly_auction_awards won
              where won.week_start=p_week_start
                and won.profile_id=bid.profile_id
                and won.day_index=p_day_index
            ) < 2
            and bid.amount <= (
              private.football_weekly_auction_starting_bankroll(
                p_week_start,bid.profile_id,50
              )
              - coalesce((
                select sum(won.winning_bid)
                from private.football_weekly_auction_awards won
                where won.week_start=p_week_start
                  and won.profile_id=bid.profile_id
                  and won.day_index between 1 and 6
              ),0)
            )
          order by
            bid.amount desc,
            (
              select count(*)
              from private.football_weekly_auction_awards won
              where won.week_start=p_week_start
                and won.profile_id=bid.profile_id
                and won.day_index between 1 and 6
            ) asc,
            (
              select coalesce(sum(won.winning_bid),0)
              from private.football_weekly_auction_awards won
              where won.week_start=p_week_start
                and won.profile_id=bid.profile_id
                and won.day_index between 1 and 6
            ) asc,
            coalesce(preference.claim_rank,bid.slot),
            md5(
              p_week_start::text||':'||p_day_index::text||':'||
              board.slot::text||':'||bid.profile_id::text
            )
          limit 1
        ),99) as top_claim_rank
      from private.football_weekly_auction_board board
      where board.week_start=p_week_start
        and board.day_index=p_day_index
        and board.slot<=v_card_count
        and not exists(
          select 1
          from private.football_weekly_auction_awards award
          where award.week_start=board.week_start
            and award.day_index=board.day_index
            and award.slot=board.slot
        )
    ) candidate
    order by candidate.top_claim_rank,candidate.slot
    limit 1;

    exit when v_slot is null;

    v_winner:=null;
    v_amount:=0;

    select candidate.profile_id,candidate.amount
    into v_winner,v_amount
    from (
      select
        participant.profile_id,
        coalesce(bid.amount,0)::integer as amount,
        coalesce(preference.claim_rank,v_slot) as claim_rank,
        (
          select count(*)
          from private.football_weekly_auction_awards won
          where won.week_start=p_week_start
            and won.profile_id=participant.profile_id
            and won.day_index between 1 and 6
        )::integer as weekly_wins,
        (
          select count(*)
          from private.football_weekly_auction_awards won
          where won.week_start=p_week_start
            and won.profile_id=participant.profile_id
            and won.day_index=p_day_index
        )::integer as daily_wins,
        (
          select coalesce(sum(won.winning_bid),0)
          from private.football_weekly_auction_awards won
          where won.week_start=p_week_start
            and won.profile_id=participant.profile_id
            and won.day_index between 1 and 6
        )::integer as spent,
        private.football_weekly_auction_starting_bankroll(
          p_week_start,participant.profile_id,50
        ) as starting_bankroll
      from private.football_weekly_auction_participants participant
      left join private.football_weekly_auction_bids bid
        on bid.week_start=p_week_start
       and bid.day_index=p_day_index
       and bid.slot=v_slot
       and bid.profile_id=participant.profile_id
      left join private.football_weekly_superteam_bid_preferences preference
        on preference.week_start=p_week_start
       and preference.day_index=p_day_index
       and preference.profile_id=participant.profile_id
       and preference.slot=v_slot
      where participant.week_start=p_week_start
    ) candidate
    where candidate.amount>0
      and candidate.weekly_wins<5
      and candidate.daily_wins<2
      and candidate.amount<=candidate.starting_bankroll-candidate.spent
    order by
      candidate.amount desc,
      candidate.weekly_wins asc,
      candidate.spent asc,
      candidate.claim_rank,
      md5(
        p_week_start::text||':'||p_day_index::text||':'||
        v_slot::text||':'||candidate.profile_id::text
      )
    limit 1;

    insert into private.football_weekly_auction_awards(
      week_start,day_index,slot,profile_id,winning_bid,resolved_at
    ) values (
      p_week_start,p_day_index,v_slot,v_winner,coalesce(v_amount,0),p_at
    );
  end loop;
end;
$$;
revoke all on function private.resolve_football_weekly_nfl_team_season_day(date,integer,timestamptz)
  from public,anon,authenticated;

create or replace function private.submit_football_weekly_nfl_team_season_bids_for_profile(
  p_week_start date,p_day_index integer,p_profile_id uuid,p_bids jsonb,p_at timestamptz
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_card_count integer;
  v_lock_at timestamptz;
  v_starting integer;
  v_bankroll integer;
  v_slot integer;
  v_entry jsonb;
  v_bid integer;
  v_priority integer;
  v_priorities integer[]:=array[]::integer[];
begin
  if p_day_index not between 1 and 6 then
    raise exception 'Normal sealed bids are only open on Days 1-6';
  end if;
  if jsonb_typeof(p_bids)<>'object' then raise exception 'bids must be an object'; end if;

  v_card_count:=private.football_weekly_auction_cards_for_day(p_week_start,p_day_index);
  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start=p_week_start and day_index=p_day_index and slot<=v_card_count;
  if v_lock_at is null or p_at>=v_lock_at then
    raise exception 'Today''s Weekly Auction bids are locked';
  end if;

  if not exists(
    select 1
    from private.football_weekly_auction_participants
    where week_start=p_week_start and profile_id=p_profile_id
  ) then
    raise exception 'Weekly Auction field is locked for this week';
  end if;

  v_starting:=private.football_weekly_auction_starting_bankroll(
    p_week_start,p_profile_id,50
  );
  select v_starting-coalesce(sum(award.winning_bid),0)::integer
  into v_bankroll
  from private.football_weekly_auction_awards award
  where award.week_start=p_week_start
    and award.day_index between 1 and 6
    and award.profile_id=p_profile_id;

  for v_slot in 1..v_card_count loop
    v_entry:=p_bids->v_slot::text;
    begin
      if v_entry is not null and jsonb_typeof(v_entry)='object' then
        v_bid:=coalesce((v_entry->>'amount')::integer,0);
        v_priority:=coalesce((v_entry->>'priority')::integer,v_slot);
      else
        v_bid:=coalesce((p_bids->>v_slot::text)::integer,0);
        v_priority:=v_slot;
      end if;
    exception when others then
      raise exception 'NFL Team-Seasons bids and priorities must be whole numbers';
    end;

    if v_bid<0 or v_bid>v_bankroll then
      raise exception 'Any single NFL Team-Seasons bid must be between $0 and your remaining bankroll';
    end if;
    if v_priority<1 or v_priority>v_card_count then
      raise exception 'NFL Team-Seasons priority must match today''s board size';
    end if;
    if v_priority=any(v_priorities) then
      raise exception 'NFL Team-Seasons claim priorities must be unique';
    end if;
    v_priorities:=array_append(v_priorities,v_priority);
  end loop;

  insert into private.football_weekly_auction_daily_entries(
    week_start,day_index,profile_id,submitted_at,updated_at
  ) values (p_week_start,p_day_index,p_profile_id,p_at,p_at)
  on conflict(week_start,day_index,profile_id)
  do update set updated_at=excluded.updated_at;

  delete from private.football_weekly_superteam_bid_preferences
  where week_start=p_week_start
    and day_index=p_day_index
    and profile_id=p_profile_id;

  delete from private.football_weekly_auction_bids
  where week_start=p_week_start
    and day_index=p_day_index
    and profile_id=p_profile_id;

  for v_slot in 1..v_card_count loop
    v_entry:=p_bids->v_slot::text;
    if v_entry is not null and jsonb_typeof(v_entry)='object' then
      v_bid:=coalesce((v_entry->>'amount')::integer,0);
      v_priority:=coalesce((v_entry->>'priority')::integer,v_slot);
    else
      v_bid:=coalesce((p_bids->>v_slot::text)::integer,0);
      v_priority:=v_slot;
    end if;

    insert into private.football_weekly_auction_bids(
      week_start,day_index,profile_id,slot,amount,updated_at
    ) values (
      p_week_start,p_day_index,p_profile_id,v_slot,v_bid,p_at
    );

    insert into private.football_weekly_superteam_bid_preferences(
      week_start,day_index,profile_id,slot,claim_rank
    ) values (
      p_week_start,p_day_index,p_profile_id,v_slot,v_priority
    );
  end loop;
end;
$$;
revoke all on function private.submit_football_weekly_nfl_team_season_bids_for_profile(date,integer,uuid,jsonb,timestamptz)
  from public,anon,authenticated;

create or replace function private.get_my_football_weekly_nfl_team_season(
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_day integer;
  v_previous date;
  v_starting integer;
  v_bankroll integer;
  v_owned integer;
  v_card_count integer;
  v_submitted boolean;
  v_show_intro boolean;
  v_theme text;
  v_cards jsonb:='[]'::jsonb;
  v_bids jsonb:='{}'::jsonb;
  v_prior jsonb:='[]'::jsonb;
  v_collection jsonb:='[]'::jsonb;
  v_wildcard jsonb:=null;
  v_previous_final jsonb:=null;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day:=private.football_weekly_auction_day_index(p_at,v_week_start);
  v_previous:=v_week_start-7;

  if not exists(
    select 1
    from private.football_weekly_auction_participants
    where week_start=v_week_start and profile_id=v_profile
  ) then
    return jsonb_build_object(
      'available',false,
      'subject_key','nfl-best-team-seasons-since-2000',
      'locked_this_week',true,
      'week_start',v_week_start,
      'eligible_week_start',v_week_start+7
    );
  end if;

  if exists(
    select 1 from private.football_weekly_auction_results
    where week_start=v_previous and profile_id=v_profile
  ) and not exists(
    select 1 from private.football_weekly_auction_final_views
    where week_start=v_previous and profile_id=v_profile
  ) then
    v_previous_final:=private.football_weekly_auction_final_payload(v_previous,v_profile);
  end if;

  v_starting:=private.football_weekly_auction_starting_bankroll(v_week_start,v_profile,50);
  select
    v_starting-coalesce(sum(award.winning_bid),0)::integer,
    count(award.profile_id)::integer
  into v_bankroll,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=v_week_start
    and award.day_index between 1 and 6
    and award.profile_id=v_profile;

  if v_day between 1 and 6 then
    v_card_count:=private.football_weekly_auction_cards_for_day(v_week_start,v_day);
    select min(theme) into v_theme
    from private.football_weekly_auction_board
    where week_start=v_week_start and day_index=v_day and slot<=v_card_count;

    select coalesce(jsonb_agg(jsonb_build_object(
      'slot',board.slot,
      'item_reference',item.item_reference,
      'team_name',item.primary_name,
      'team_code',item.team_code,
      'season_year',item.season_year,
      'display_label',item.display_label,
      'card_tag',item.grading_inputs->>'card_tag',
      'lock_at',board.lock_at
    ) order by board.slot),'[]'::jsonb)
    into v_cards
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_items item
      on item.item_reference=board.season_reference
    where board.week_start=v_week_start
      and board.day_index=v_day
      and board.slot<=v_card_count;

    select coalesce(jsonb_object_agg(
      bid.slot::text,
      jsonb_build_object(
        'amount',bid.amount,
        'priority',coalesce(preference.claim_rank,bid.slot)
      )
    ),'{}'::jsonb)
    into v_bids
    from private.football_weekly_auction_bids bid
    left join private.football_weekly_superteam_bid_preferences preference
      on preference.week_start=bid.week_start
     and preference.day_index=bid.day_index
     and preference.profile_id=bid.profile_id
     and preference.slot=bid.slot
    where bid.week_start=v_week_start
      and bid.day_index=v_day
      and bid.profile_id=v_profile
      and bid.slot<=v_card_count;

    select exists(
      select 1
      from private.football_weekly_auction_daily_entries
      where week_start=v_week_start and day_index=v_day and profile_id=v_profile
    ) into v_submitted;
  else
    v_theme:='Wildcard Finale';
    perform private.materialize_football_weekly_nfl_team_season_wildcard(v_week_start);
    v_wildcard:=private.football_weekly_nfl_team_season_wildcard_state(
      v_week_start,v_profile,p_at
    );
    select exists(
      select 1
      from private.football_weekly_nfl_team_season_wildcard_submissions
      where week_start=v_week_start and profile_id=v_profile
    ) into v_submitted;
  end if;

  select not exists(
    select 1
    from private.football_weekly_auction_daily_entries
    where week_start=v_week_start and profile_id=v_profile
  ) into v_show_intro;

  if v_day>1 then
    select coalesce(jsonb_agg(result_row.payload order by result_row.slot),'[]'::jsonb)
    into v_prior
    from (
      select board.slot,jsonb_build_object(
        'slot',board.slot,
        'item_reference',item.item_reference,
        'team_name',item.primary_name,
        'team_code',item.team_code,
        'season_year',item.season_year,
        'display_label',item.display_label,
        'winning_bid',award.winning_bid,
        'winner_profile_id',award.profile_id,
        'winner_display_name',winner.display_name,
        'bids',coalesce((
          select jsonb_agg(jsonb_build_object(
            'profile_id',entry.profile_id,
            'display_name',bidder.display_name,
            'amount',coalesce(bid.amount,0),
            'priority',preference.claim_rank
          ) order by coalesce(bid.amount,0) desc,bidder.display_name)
          from private.football_weekly_auction_daily_entries entry
          join public.profiles bidder on bidder.id=entry.profile_id
          left join private.football_weekly_auction_bids bid
            on bid.week_start=entry.week_start
           and bid.day_index=entry.day_index
           and bid.profile_id=entry.profile_id
           and bid.slot=board.slot
          left join private.football_weekly_superteam_bid_preferences preference
            on preference.week_start=entry.week_start
           and preference.day_index=entry.day_index
           and preference.profile_id=entry.profile_id
           and preference.slot=board.slot
          where entry.week_start=v_week_start
            and entry.day_index=least(v_day-1,6)
        ),'[]'::jsonb)
      ) as payload
      from private.football_weekly_auction_board board
      join private.football_weekly_auction_items item
        on item.item_reference=board.season_reference
      join private.football_weekly_auction_awards award
        on award.week_start=board.week_start
       and award.day_index=board.day_index
       and award.slot=board.slot
      left join public.profiles winner on winner.id=award.profile_id
      where board.week_start=v_week_start
        and board.day_index=least(v_day-1,6)
        and board.slot<=private.football_weekly_auction_cards_for_day(
          v_week_start,least(v_day-1,6)
        )
    ) result_row;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'item_reference',item.item_reference,
    'team_name',item.primary_name,
    'team_code',item.team_code,
    'season_year',item.season_year,
    'display_label',item.display_label,
    'card_tag',item.grading_inputs->>'card_tag',
    'winning_bid',effective.winning_bid,
    'source',effective.source
  ) order by item.season_year desc,item.primary_name),'[]'::jsonb)
  into v_collection
  from private.football_weekly_nfl_team_season_effective_collection(
    v_week_start,v_profile
  ) effective
  join private.football_weekly_auction_items item
    on item.item_reference=effective.item_reference;

  return jsonb_build_object(
    'available',true,
    'subject_key','nfl-best-team-seasons-since-2000',
    'week_start',v_week_start,
    'week_end',v_week_start+6,
    'day_index',least(greatest(v_day,1),7),
    'starting_bankroll',v_starting,
    'bankroll',v_bankroll,
    'owned_count',jsonb_array_length(v_collection),
    'reserve_floor',0,
    'max_commit',v_bankroll,
    'submitted_today',coalesce(v_submitted,false),
    'show_intro',v_show_intro,
    'theme',v_theme,
    'teams',v_cards,
    'bids',v_bids,
    'prior_results',v_prior,
    'collection',v_collection,
    'wildcard',v_wildcard,
    'previous_final',v_previous_final
  );
end;
$$;
revoke all on function private.get_my_football_weekly_nfl_team_season(timestamptz)
  from public,anon,authenticated;

create or replace function public.get_my_football_weekly_nfl_team_season_lab_ranked_bids(
  p_seat_index integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_week_start date;
  v_day integer;
  v_profile uuid;
  v_bids jsonb:='{}'::jsonb;
begin
  v_owner:=private.football_weekly_superteam_lab_owner();
  if auth.uid() is distinct from v_owner then
    raise exception 'NFL Team-Seasons Playthrough Lab is owner-only';
  end if;

  select run.lab_week_start,run.current_day
  into v_week_start,v_day
  from private.football_weekly_nfl_team_season_lab_runs run
  where run.owner_profile_id=v_owner;

  select seat.profile_id
  into v_profile
  from private.football_weekly_nfl_team_season_lab_seats seat
  where seat.owner_profile_id=v_owner
    and seat.seat_index=p_seat_index;

  if v_profile is null or v_day not between 1 and 6 then
    return '{}'::jsonb;
  end if;

  select coalesce(jsonb_object_agg(
    bid.slot::text,
    jsonb_build_object(
      'amount',bid.amount,
      'priority',coalesce(preference.claim_rank,bid.slot)
    )
  ),'{}'::jsonb)
  into v_bids
  from private.football_weekly_auction_bids bid
  left join private.football_weekly_superteam_bid_preferences preference
    on preference.week_start=bid.week_start
   and preference.day_index=bid.day_index
   and preference.profile_id=bid.profile_id
   and preference.slot=bid.slot
  where bid.week_start=v_week_start
    and bid.day_index=v_day
    and bid.profile_id=v_profile;

  return v_bids;
end;
$$;
revoke all on function public.get_my_football_weekly_nfl_team_season_lab_ranked_bids(integer)
  from public,anon;
grant execute on function public.get_my_football_weekly_nfl_team_season_lab_ranked_bids(integer)
  to authenticated;

do $nfl_ranked_bid_contract$
begin
  if exists(
    select 1
    from private.nfl_best_team_seasons_v1_authority authority
    where authority.postseason_finish not in (
      'Lost Wild Card','Lost Divisional','Lost Conference Championship',
      'Lost Super Bowl','Won Super Bowl','Missed Playoffs'
    )
  ) then
    raise exception 'NFL Team-Seasons postseason labels must use exact outcome vocabulary';
  end if;

  if (
    select grading_inputs->>'card_tag'
    from private.football_weekly_auction_items
    where item_reference='nfl-best-ind-2005'
  )<>'14-2 · Lost Divisional' then
    raise exception '2005 Indianapolis outcome calibration drifted';
  end if;

  if (
    select grading_inputs->>'card_tag'
    from private.football_weekly_auction_items
    where item_reference='nfl-best-jax-2025'
  )<>'13-4 · Lost Wild Card' then
    raise exception '2025 Jacksonville outcome calibration drifted';
  end if;
end;
$nfl_ranked_bid_contract$;
