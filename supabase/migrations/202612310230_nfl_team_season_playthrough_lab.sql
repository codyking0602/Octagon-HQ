-- Owner-only isolated playthrough lab for NFL Team-Seasons Weekly Auction.
-- Reuses the real shared board, bid, award, Wildcard/Reaping and finalization engines
-- on historical shadow weeks. Live competition rows are never touched.

create table if not exists private.football_weekly_nfl_team_season_lab_runs (
  owner_profile_id uuid primary key references public.profiles(id) on delete cascade,
  run_number integer not null check(run_number between 1 and 2000),
  lab_week_start date not null unique,
  current_day integer not null check(current_day between 1 and 8),
  final_payloads jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
revoke all on private.football_weekly_nfl_team_season_lab_runs from public,anon,authenticated;

create table if not exists private.football_weekly_nfl_team_season_lab_seats (
  owner_profile_id uuid not null references private.football_weekly_nfl_team_season_lab_runs(owner_profile_id) on delete cascade,
  seat_index integer not null check(seat_index between 1 and 5),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  primary key(owner_profile_id,seat_index),
  unique(owner_profile_id,profile_id)
);
revoke all on private.football_weekly_nfl_team_season_lab_seats from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_lab_week_start(p_run integer)
returns date
language sql immutable
set search_path=''
as $$
  select date '1975-01-07' + ((greatest(p_run,1)-1)*7);
$$;
revoke all on function private.football_weekly_nfl_team_season_lab_week_start(integer)
  from public,anon,authenticated;

create or replace function private.reset_football_weekly_nfl_team_season_lab(p_owner uuid)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_old_week date;
  v_run integer;
  v_week date;
  v_seat integer:=1;
  v_candidate record;
begin
  -- Reuse the existing locked owner identity contract.
  if p_owner<>private.football_weekly_superteam_lab_owner() then
    raise exception 'NFL Team-Seasons Playthrough Lab is owner-only';
  end if;

  select lab_week_start,run_number into v_old_week,v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=p_owner
  for update;

  if found then
    delete from private.football_weekly_auction_bankroll_adjustments
    where source_week_start=v_old_week;
    delete from private.football_weekly_auction_weeks
    where week_start=v_old_week;
    v_run:=case when v_run>=2000 then 1 else v_run+1 end;
    v_week:=private.football_weekly_nfl_team_season_lab_week_start(v_run);
    delete from private.football_weekly_auction_bankroll_adjustments
    where source_week_start=v_week;
    delete from private.football_weekly_auction_weeks where week_start=v_week;
    update private.football_weekly_nfl_team_season_lab_runs
    set run_number=v_run,lab_week_start=v_week,current_day=1,final_payloads=null,updated_at=now()
    where owner_profile_id=p_owner;
    delete from private.football_weekly_nfl_team_season_lab_seats
    where owner_profile_id=p_owner;
  else
    v_run:=1;
    v_week:=private.football_weekly_nfl_team_season_lab_week_start(v_run);
    delete from private.football_weekly_auction_bankroll_adjustments
    where source_week_start=v_week;
    delete from private.football_weekly_auction_weeks where week_start=v_week;
    insert into private.football_weekly_nfl_team_season_lab_runs(
      owner_profile_id,run_number,lab_week_start,current_day
    ) values(p_owner,v_run,v_week,1);
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(v_week,'nfl-best-team-seasons-since-2000');

  perform private.materialize_football_weekly_nfl_team_season_week(v_week);

  insert into private.football_weekly_nfl_team_season_lab_seats(
    owner_profile_id,seat_index,profile_id
  ) values(p_owner,1,p_owner);

  for v_candidate in
    with recent as (
      select participant.profile_id,max(participant.week_start) as last_week
      from private.football_weekly_auction_participants participant
      join public.profiles profile on profile.id=participant.profile_id
      where participant.week_start>=date '2026-09-15'
        and participant.week_start<date '2026-12-31'
        and participant.profile_id<>p_owner
        and profile.normalized_name not like 'TEST%'
      group by participant.profile_id
    )
    select recent.profile_id
    from recent
    join public.profiles profile on profile.id=recent.profile_id
    order by recent.last_week desc,lower(profile.display_name),recent.profile_id
    limit 4
  loop
    v_seat:=v_seat+1;
    insert into private.football_weekly_nfl_team_season_lab_seats(
      owner_profile_id,seat_index,profile_id
    ) values(p_owner,v_seat,v_candidate.profile_id);
  end loop;

  if v_seat<5 then
    for v_candidate in
      select profile.id as profile_id
      from public.profiles profile
      where profile.id<>p_owner
        and profile.normalized_name not like 'TEST%'
        and not exists(
          select 1 from private.football_weekly_nfl_team_season_lab_seats seat
          where seat.owner_profile_id=p_owner and seat.profile_id=profile.id
        )
      order by profile.created_at,profile.id
      limit (5-v_seat)
    loop
      v_seat:=v_seat+1;
      insert into private.football_weekly_nfl_team_season_lab_seats(
        owner_profile_id,seat_index,profile_id
      ) values(p_owner,v_seat,v_candidate.profile_id);
    end loop;
  end if;

  if v_seat<>5 then
    raise exception 'NFL Team-Seasons Playthrough Lab needs five available non-test profiles';
  end if;

  insert into private.football_weekly_auction_participants(
    week_start,profile_id,locked_at,source
  )
  select
    v_week,seat.profile_id,
    ((v_week::timestamp at time zone 'America/Chicago')-interval '1 minute'),
    'owner_lab'
  from private.football_weekly_nfl_team_season_lab_seats seat
  where seat.owner_profile_id=p_owner;

  if private.football_weekly_auction_cards_for_day(v_week,1)<>4 then
    raise exception 'Five-player NFL Team-Seasons lab must expose four normal cards';
  end if;
end;
$$;
revoke all on function private.reset_football_weekly_nfl_team_season_lab(uuid)
  from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_lab_state(
  p_owner uuid,p_seat_index integer
)
returns jsonb
language plpgsql
stable security definer
set search_path=''
as $$
declare
  v_run private.football_weekly_nfl_team_season_lab_runs%rowtype;
  v_profile uuid;
  v_at timestamptz;
  v_cards integer;
  v_bankroll integer;
  v_owned integer;
  v_submitted boolean;
  v_submitted_count integer;
  v_theme text;
  v_teams jsonb:='[]'::jsonb;
  v_bids jsonb:='{}'::jsonb;
  v_prior jsonb:='[]'::jsonb;
  v_collection jsonb:='[]'::jsonb;
  v_wildcard jsonb:=null;
  v_state jsonb:=null;
  v_seats jsonb;
  v_final jsonb:=null;
begin
  if p_owner<>private.football_weekly_superteam_lab_owner() then
    raise exception 'NFL Team-Seasons Playthrough Lab is owner-only';
  end if;
  if p_seat_index not between 1 and 5 then
    raise exception 'Lab seat must be between 1 and 5';
  end if;

  select * into v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=p_owner;
  if v_run.owner_profile_id is null then
    raise exception 'NFL Team-Seasons Playthrough Lab is not initialized';
  end if;

  select profile_id into v_profile
  from private.football_weekly_nfl_team_season_lab_seats
  where owner_profile_id=p_owner and seat_index=p_seat_index;
  if v_profile is null then raise exception 'Lab seat unavailable'; end if;

  if v_run.current_day between 1 and 7 then
    v_at:=((v_run.lab_week_start+(v_run.current_day-1))::date+time '12:00')
      at time zone 'America/Chicago';
  else
    v_at:=((v_run.lab_week_start+7)::date+time '00:05')
      at time zone 'America/Chicago';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'seat_index',seat.seat_index,
    'profile_id',seat.profile_id,
    'display_name',profile.display_name,
    'submitted_today',case
      when v_run.current_day between 1 and 6 then exists(
        select 1 from private.football_weekly_auction_daily_entries entry
        where entry.week_start=v_run.lab_week_start
          and entry.day_index=v_run.current_day
          and entry.profile_id=seat.profile_id
      )
      when v_run.current_day=7 then exists(
        select 1 from private.football_weekly_nfl_team_season_wildcard_submissions submission
        where submission.week_start=v_run.lab_week_start
          and submission.profile_id=seat.profile_id
      )
      else true end,
    'owned_count',(
      select count(*)::integer
      from private.football_weekly_nfl_team_season_effective_collection(
        v_run.lab_week_start,seat.profile_id
      )
    ),
    'bankroll',50-coalesce((
      select sum(award.winning_bid)::integer
      from private.football_weekly_auction_awards award
      where award.week_start=v_run.lab_week_start
        and award.day_index between 1 and 6
        and award.profile_id=seat.profile_id
    ),0)
  ) order by seat.seat_index),'[]'::jsonb)
  into v_seats
  from private.football_weekly_nfl_team_season_lab_seats seat
  join public.profiles profile on profile.id=seat.profile_id
  where seat.owner_profile_id=p_owner;

  if v_run.current_day between 1 and 6 then
    select count(*)::integer into v_submitted_count
    from private.football_weekly_auction_daily_entries
    where week_start=v_run.lab_week_start and day_index=v_run.current_day;

    v_cards:=private.football_weekly_auction_cards_for_day(
      v_run.lab_week_start,v_run.current_day
    );

    select 50-coalesce(sum(award.winning_bid),0)::integer,
           count(award.profile_id)::integer
    into v_bankroll,v_owned
    from private.football_weekly_auction_awards award
    where award.week_start=v_run.lab_week_start
      and award.day_index between 1 and 6
      and award.profile_id=v_profile;

    select exists(
      select 1 from private.football_weekly_auction_daily_entries
      where week_start=v_run.lab_week_start
        and day_index=v_run.current_day
        and profile_id=v_profile
    ) into v_submitted;

    select min(board.theme) into v_theme
    from private.football_weekly_auction_board board
    where board.week_start=v_run.lab_week_start
      and board.day_index=v_run.current_day
      and board.slot<=v_cards;

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
    into v_teams
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_items item
      on item.item_reference=board.season_reference
    where board.week_start=v_run.lab_week_start
      and board.day_index=v_run.current_day
      and board.slot<=v_cards;

    select coalesce(jsonb_object_agg(bid.slot::text,bid.amount),'{}'::jsonb)
    into v_bids
    from private.football_weekly_auction_bids bid
    where bid.week_start=v_run.lab_week_start
      and bid.day_index=v_run.current_day
      and bid.profile_id=v_profile
      and bid.slot<=v_cards;

    if v_run.current_day>1 then
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
              'amount',coalesce(bid.amount,0)
            ) order by coalesce(bid.amount,0) desc,bidder.display_name)
            from private.football_weekly_auction_daily_entries entry
            join public.profiles bidder on bidder.id=entry.profile_id
            left join private.football_weekly_auction_bids bid
              on bid.week_start=entry.week_start
             and bid.day_index=entry.day_index
             and bid.profile_id=entry.profile_id
             and bid.slot=board.slot
            where entry.week_start=v_run.lab_week_start
              and entry.day_index=v_run.current_day-1
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
        where board.week_start=v_run.lab_week_start
          and board.day_index=v_run.current_day-1
          and board.slot<=private.football_weekly_auction_cards_for_day(
            v_run.lab_week_start,v_run.current_day-1
          )
      ) result_row;
    end if;

    select coalesce(jsonb_agg(jsonb_build_object(
      'item_reference',item.item_reference,
      'team_name',item.primary_name,
      'team_code',item.team_code,
      'season_year',item.season_year,
      'display_label',item.display_label,
      'winning_bid',effective.winning_bid,
      'source',effective.source
    ) order by item.season_year desc,item.primary_name),'[]'::jsonb)
    into v_collection
    from private.football_weekly_nfl_team_season_effective_collection(
      v_run.lab_week_start,v_profile
    ) effective
    join private.football_weekly_auction_items item
      on item.item_reference=effective.item_reference;

    v_state:=jsonb_build_object(
      'available',true,
      'subject_key','nfl-best-team-seasons-since-2000',
      'week_start',v_run.lab_week_start,
      'week_end',v_run.lab_week_start+6,
      'day_index',v_run.current_day,
      'starting_bankroll',50,
      'bankroll',v_bankroll,
      'owned_count',jsonb_array_length(v_collection),
      'reserve_floor',0,
      'max_commit',v_bankroll,
      'submitted_today',v_submitted,
      'show_intro',false,
      'theme',v_theme,
      'teams',v_teams,
      'bids',v_bids,
      'prior_results',v_prior,
      'collection',v_collection,
      'wildcard',null,
      'previous_final',null
    );
  elsif v_run.current_day=7 then
    select count(*)::integer into v_submitted_count
    from private.football_weekly_nfl_team_season_wildcard_submissions
    where week_start=v_run.lab_week_start;

    select exists(
      select 1 from private.football_weekly_nfl_team_season_wildcard_submissions
      where week_start=v_run.lab_week_start and profile_id=v_profile
    ) into v_submitted;

    select 50-coalesce(sum(award.winning_bid),0)::integer into v_bankroll
    from private.football_weekly_auction_awards award
    where award.week_start=v_run.lab_week_start
      and award.day_index between 1 and 6
      and award.profile_id=v_profile;

    select coalesce(jsonb_agg(jsonb_build_object(
      'item_reference',item.item_reference,
      'team_name',item.primary_name,
      'team_code',item.team_code,
      'season_year',item.season_year,
      'display_label',item.display_label,
      'winning_bid',effective.winning_bid,
      'source',effective.source
    ) order by item.season_year desc,item.primary_name),'[]'::jsonb)
    into v_collection
    from private.football_weekly_nfl_team_season_effective_collection(
      v_run.lab_week_start,v_profile
    ) effective
    join private.football_weekly_auction_items item
      on item.item_reference=effective.item_reference;

    v_wildcard:=private.football_weekly_nfl_team_season_wildcard_state(
      v_run.lab_week_start,v_profile,v_at
    );

    v_state:=jsonb_build_object(
      'available',true,
      'subject_key','nfl-best-team-seasons-since-2000',
      'week_start',v_run.lab_week_start,
      'week_end',v_run.lab_week_start+6,
      'day_index',7,
      'starting_bankroll',50,
      'bankroll',v_bankroll,
      'owned_count',jsonb_array_length(v_collection),
      'reserve_floor',0,
      'max_commit',0,
      'submitted_today',v_submitted,
      'show_intro',false,
      'theme','Wildcard Finale',
      'teams','[]'::jsonb,
      'bids','{}'::jsonb,
      'prior_results','[]'::jsonb,
      'collection',v_collection,
      'wildcard',v_wildcard,
      'previous_final',null
    );
  else
    v_submitted_count:=5;
    v_final:=v_run.final_payloads->p_seat_index::text;
  end if;

  return jsonb_build_object(
    'available',true,
    'run_number',v_run.run_number,
    'lab_week_start',v_run.lab_week_start,
    'day_index',v_run.current_day,
    'completed',v_run.current_day=8,
    'submitted_count',v_submitted_count,
    'seat_index',p_seat_index,
    'seats',v_seats,
    'state',v_state,
    'final',v_final
  );
end;
$$;
revoke all on function private.football_weekly_nfl_team_season_lab_state(uuid,integer)
  from public,anon,authenticated;

create or replace function public.get_my_football_weekly_nfl_team_season_lab(
  p_seat_index integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $lab_get$
declare
  v_owner uuid;
  v_day integer;
  v_week_start date;
begin
  v_owner:=private.football_weekly_superteam_lab_owner();
  if auth.uid() is distinct from v_owner then
    raise exception 'NFL Team-Seasons Playthrough Lab is owner-only';
  end if;
  if not exists(
    select 1 from private.football_weekly_nfl_team_season_lab_runs
    where owner_profile_id=v_owner
  ) then
    perform private.reset_football_weekly_nfl_team_season_lab(v_owner);
  end if;

  select current_day,lab_week_start
  into v_day,v_week_start
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=v_owner;

  if v_day=7 then
    perform private.materialize_football_weekly_nfl_team_season_wildcard(v_week_start);
  end if;

  return private.football_weekly_nfl_team_season_lab_state(v_owner,p_seat_index);
end;
$lab_get$;
revoke all on function public.get_my_football_weekly_nfl_team_season_lab(integer)
  from public,anon;
grant execute on function public.get_my_football_weekly_nfl_team_season_lab(integer)
  to authenticated;

create or replace function public.reset_my_football_weekly_nfl_team_season_lab()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare v_owner uuid;
begin
  v_owner:=private.football_weekly_superteam_lab_owner();
  if auth.uid() is distinct from v_owner then
    raise exception 'NFL Team-Seasons Playthrough Lab is owner-only';
  end if;
  perform private.reset_football_weekly_nfl_team_season_lab(v_owner);
  return private.football_weekly_nfl_team_season_lab_state(v_owner,1);
end;
$$;
revoke all on function public.reset_my_football_weekly_nfl_team_season_lab()
  from public,anon;
grant execute on function public.reset_my_football_weekly_nfl_team_season_lab()
  to authenticated;

create or replace function public.submit_my_football_weekly_nfl_team_season_lab_bids(
  p_seat_index integer,p_bids jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_run private.football_weekly_nfl_team_season_lab_runs%rowtype;
  v_profile uuid;
  v_at timestamptz;
begin
  v_owner:=private.football_weekly_superteam_lab_owner();
  if auth.uid() is distinct from v_owner then
    raise exception 'NFL Team-Seasons Playthrough Lab is owner-only';
  end if;
  select * into v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=v_owner;
  if v_run.current_day not between 1 and 6 then
    raise exception 'Normal lab bids are only open on Days 1-6';
  end if;
  select profile_id into v_profile
  from private.football_weekly_nfl_team_season_lab_seats
  where owner_profile_id=v_owner and seat_index=p_seat_index;
  if v_profile is null then raise exception 'Lab seat unavailable'; end if;

  v_at:=((v_run.lab_week_start+(v_run.current_day-1))::date+time '12:00')
    at time zone 'America/Chicago';
  perform private.submit_football_weekly_nfl_team_season_bids_for_profile(
    v_run.lab_week_start,v_run.current_day,v_profile,p_bids,v_at
  );
  update private.football_weekly_nfl_team_season_lab_runs
  set updated_at=now() where owner_profile_id=v_owner;
  return private.football_weekly_nfl_team_season_lab_state(v_owner,p_seat_index);
end;
$$;
revoke all on function public.submit_my_football_weekly_nfl_team_season_lab_bids(integer,jsonb)
  from public,anon;
grant execute on function public.submit_my_football_weekly_nfl_team_season_lab_bids(integer,jsonb)
  to authenticated;

create or replace function public.submit_my_football_weekly_nfl_team_season_lab_wildcard(
  p_seat_index integer,p_entries integer,p_rankings jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_run private.football_weekly_nfl_team_season_lab_runs%rowtype;
  v_profile uuid;
  v_at timestamptz;
  v_rankings text[];
begin
  v_owner:=private.football_weekly_superteam_lab_owner();
  if auth.uid() is distinct from v_owner then
    raise exception 'NFL Team-Seasons Playthrough Lab is owner-only';
  end if;
  select * into v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=v_owner;
  if v_run.current_day<>7 then raise exception 'Wildcard lab entry is only open on Day 7'; end if;
  if p_rankings is null or jsonb_typeof(p_rankings)<>'array' then
    raise exception 'Wildcard rankings must be an array';
  end if;
  select profile_id into v_profile
  from private.football_weekly_nfl_team_season_lab_seats
  where owner_profile_id=v_owner and seat_index=p_seat_index;
  if v_profile is null then raise exception 'Lab seat unavailable'; end if;

  select coalesce(array_agg(value order by ordinal),array[]::text[])
  into v_rankings
  from jsonb_array_elements_text(p_rankings) with ordinality ranked(value,ordinal);

  v_at:=((v_run.lab_week_start+6)::date+time '12:00')
    at time zone 'America/Chicago';
  perform private.submit_football_weekly_nfl_team_season_wildcard(
    v_run.lab_week_start,v_profile,p_entries,v_rankings,v_at
  );
  update private.football_weekly_nfl_team_season_lab_runs
  set updated_at=now() where owner_profile_id=v_owner;
  return private.football_weekly_nfl_team_season_lab_state(v_owner,p_seat_index);
end;
$$;
revoke all on function public.submit_my_football_weekly_nfl_team_season_lab_wildcard(integer,integer,jsonb)
  from public,anon;
grant execute on function public.submit_my_football_weekly_nfl_team_season_lab_wildcard(integer,integer,jsonb)
  to authenticated;

create or replace function public.advance_my_football_weekly_nfl_team_season_lab(
  p_seat_index integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_run private.football_weekly_nfl_team_season_lab_runs%rowtype;
  v_submitted integer;
  v_resolve_at timestamptz;
  v_seat record;
  v_payloads jsonb:='{}'::jsonb;
begin
  v_owner:=private.football_weekly_superteam_lab_owner();
  if auth.uid() is distinct from v_owner then
    raise exception 'NFL Team-Seasons Playthrough Lab is owner-only';
  end if;
  select * into v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=v_owner
  for update;
  if v_run.current_day not between 1 and 7 then
    raise exception 'NFL Team-Seasons lab has already completed';
  end if;

  if v_run.current_day between 1 and 6 then
    select count(*)::integer into v_submitted
    from private.football_weekly_auction_daily_entries
    where week_start=v_run.lab_week_start and day_index=v_run.current_day;
  else
    select count(*)::integer into v_submitted
    from private.football_weekly_nfl_team_season_wildcard_submissions
    where week_start=v_run.lab_week_start;
  end if;
  if v_submitted<>5 then
    raise exception 'All five lab seats must submit before resolving the day';
  end if;

  if v_run.current_day between 1 and 6 then
    v_resolve_at:=((v_run.lab_week_start+v_run.current_day)::date+time '00:01')
      at time zone 'America/Chicago';
    perform private.resolve_football_weekly_nfl_team_season_day(
      v_run.lab_week_start,v_run.current_day,v_resolve_at
    );
    update private.football_weekly_nfl_team_season_lab_runs
    set current_day=current_day+1,updated_at=now()
    where owner_profile_id=v_owner;

    if v_run.current_day=6 then
      perform private.materialize_football_weekly_nfl_team_season_wildcard(
        v_run.lab_week_start
      );
    end if;
  else
    v_resolve_at:=((v_run.lab_week_start+7)::date+time '00:01')
      at time zone 'America/Chicago';
    perform private.resolve_football_weekly_nfl_team_season_wildcard(
      v_run.lab_week_start,v_resolve_at
    );
    perform private.finalize_football_weekly_nfl_team_season_week(
      v_run.lab_week_start,v_resolve_at
    );

    for v_seat in
      select seat_index,profile_id
      from private.football_weekly_nfl_team_season_lab_seats
      where owner_profile_id=v_owner
      order by seat_index
    loop
      v_payloads:=v_payloads||jsonb_build_object(
        v_seat.seat_index::text,
        private.football_weekly_nfl_team_season_final_payload(
          v_run.lab_week_start,v_seat.profile_id
        )
      );
    end loop;

    update private.football_weekly_nfl_team_season_lab_runs
    set current_day=8,final_payloads=v_payloads,updated_at=now()
    where owner_profile_id=v_owner;

    -- Captured lab finals are retained only in the lab run. Remove shared
    -- result/penalty rows so the QA simulation can never enter live history.
    delete from private.football_weekly_auction_results
    where week_start=v_run.lab_week_start;
    delete from private.football_weekly_auction_bankroll_adjustments
    where source_week_start=v_run.lab_week_start;
  end if;

  return private.football_weekly_nfl_team_season_lab_state(v_owner,p_seat_index);
end;
$$;
revoke all on function public.advance_my_football_weekly_nfl_team_season_lab(integer)
  from public,anon;
grant execute on function public.advance_my_football_weekly_nfl_team_season_lab(integer)
  to authenticated;
