-- Owner-only Weekly Auction Playthrough Lab for CFB Superteam.
-- The lab uses a historical shadow week, the real Standard generator, the real
-- bid legality rules, real tie/assignment logic, real day resolver, and real
-- finalizer. Final result rows are captured into the lab run and deleted before
-- commit so live history/leaderboards/titles remain untouched.

create table if not exists private.football_weekly_superteam_lab_runs (
  owner_profile_id uuid primary key references public.profiles(id) on delete cascade,
  run_number integer not null check (run_number between 1 and 2000),
  lab_week_start date not null unique,
  current_day integer not null check (current_day between 1 and 8),
  final_payloads jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
revoke all on private.football_weekly_superteam_lab_runs from public,anon,authenticated;

create table if not exists private.football_weekly_superteam_lab_seats (
  owner_profile_id uuid not null references private.football_weekly_superteam_lab_runs(owner_profile_id) on delete cascade,
  seat_index integer not null check (seat_index between 1 and 6),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  primary key(owner_profile_id,seat_index),
  unique(owner_profile_id,profile_id)
);
revoke all on private.football_weekly_superteam_lab_seats from public,anon,authenticated;

create or replace function private.football_weekly_superteam_lab_owner()
returns uuid
language plpgsql
stable
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  if not public.is_pick_control_owner(v_profile)
    or not exists(
      select 1
      from public.profiles profile
      where profile.id=v_profile
        and profile.normalized_name='CODY'
    )
  then
    raise exception 'Weekly Auction Playthrough Lab is owner-only';
  end if;

  return v_profile;
end;
$$;
revoke all on function private.football_weekly_superteam_lab_owner()
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_lab_week_start(p_run_number integer)
returns date
language sql
immutable
set search_path=''
as $$
  select date '1980-01-01' + ((greatest(p_run_number,1)-1)*7);
$$;
revoke all on function private.football_weekly_superteam_lab_week_start(integer)
  from public,anon,authenticated;

-- Keep the live Sep. 29 launch override, while giving every six-seat lab run a
-- 10-card opening board and normal elastic supply on Days 2-7.
create or replace function private.football_weekly_auction_cards_for_day(
  p_week_start date,p_day_index integer
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
begin
  if p_day_index not between 1 and 7 then
    raise exception 'Football Weekly Auction day must be between 1 and 7';
  end if;

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject<>'cfb-superteam' then
    return private.football_weekly_auction_cards_per_day(p_week_start);
  end if;

  if exists(
    select 1
    from private.football_weekly_superteam_lab_runs lab
    where lab.lab_week_start=p_week_start
  ) then
    if p_day_index=1 then return 10; end if;

    select count(*)::integer into v_players
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start;

    return private.football_weekly_superteam_cards_for_field(v_players);
  end if;

  if p_week_start=date '2026-09-29' and p_day_index=1 then
    return 10;
  end if;

  v_day_start:=((p_week_start+(p_day_index-1))::timestamp at time zone 'America/Chicago');

  select count(*)::integer into v_players
  from private.football_weekly_auction_participants participant
  where participant.week_start=p_week_start
    and participant.locked_at<v_day_start;

  return private.football_weekly_superteam_cards_for_field(v_players);
end;
$$;
revoke all on function private.football_weekly_auction_cards_for_day(date,integer)
  from public,anon,authenticated;

-- Shared live/lab bid legality and persistence. Production submission and lab
-- submission both call this exact function.
create or replace function private.submit_football_weekly_superteam_bids_for_profile(
  p_week_start date,
  p_day_index integer,
  p_profile_id uuid,
  p_bids jsonb,
  p_at timestamptz
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_card_count integer;
  v_lock_at timestamptz;
  v_bankroll integer;
  v_owned integer;
  v_open_slots integer;
  v_max_wins integer;
  v_slot integer;
  v_entry jsonb;
  v_bid integer;
  v_priority integer;
  v_item_reference text;
  v_amounts integer[]:=array[]::integer[];
  v_priorities integer[]:=array[]::integer[];
  v_single_commit integer;
  v_top_commit integer;
  v_reserve_after integer;
begin
  if p_profile_id is null then raise exception 'profile required'; end if;
  if p_day_index not between 1 and 7 then raise exception 'CFB Superteam day must be between 1 and 7'; end if;
  if jsonb_typeof(p_bids)<>'object' then raise exception 'bids must be an object'; end if;

  if not exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
      and participant.profile_id=p_profile_id
  ) then
    raise exception 'Weekly Auction participant is unavailable for this week';
  end if;

  v_card_count:=private.football_weekly_auction_cards_for_day(p_week_start,p_day_index);

  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start=p_week_start and day_index=p_day_index;

  if v_lock_at is null or p_at>=v_lock_at then
    raise exception 'Today''s Weekly Auction bids are locked';
  end if;

  select
    50-coalesce(sum(award.winning_bid),0)::integer,
    count(award.roster_slot)::integer
  into v_bankroll,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=p_week_start
    and award.profile_id=p_profile_id
    and award.roster_slot is not null;

  v_open_slots:=greatest(7-v_owned,0);
  v_max_wins:=least(2,v_open_slots);

  for v_slot in 1..v_card_count loop
    v_entry:=p_bids->v_slot::text;
    if v_entry is null or jsonb_typeof(v_entry)<>'object' then
      raise exception 'Each CFB Superteam bid needs an amount and priority';
    end if;

    begin
      v_bid:=coalesce((v_entry->>'amount')::integer,0);
      v_priority:=coalesce((v_entry->>'priority')::integer,v_slot);
    exception when others then
      raise exception 'CFB Superteam bids and priorities must be whole numbers';
    end;

    if v_bid<0 or v_bid>50 then
      raise exception 'CFB Superteam bids must be between $0 and $50';
    end if;
    if v_priority<1 or v_priority>v_card_count then
      raise exception 'CFB Superteam priority must match today''s board size';
    end if;
    if v_priority=any(v_priorities) then
      raise exception 'CFB Superteam claim priorities must be unique';
    end if;

    select board.season_reference into v_item_reference
    from private.football_weekly_auction_board board
    where board.week_start=p_week_start
      and board.day_index=p_day_index
      and board.slot=v_slot;

    if v_item_reference is null then
      raise exception 'CFB Superteam board is incomplete';
    end if;

    if private.football_weekly_superteam_assignment_slot(
      p_week_start,p_profile_id,v_item_reference
    ) is null and v_bid<>0 then
      raise exception 'That candidate cannot fill one of your remaining Superteam slots';
    end if;

    v_amounts:=array_append(v_amounts,v_bid);
    v_priorities:=array_append(v_priorities,v_priority);
  end loop;

  select coalesce(max(value),0)::integer into v_single_commit
  from unnest(v_amounts) value;

  if v_single_commit>v_bankroll-greatest(v_open_slots-1,0) then
    raise exception 'Any single CFB Superteam win must leave $1 for every roster spot still open after it';
  end if;

  select coalesce(sum(value),0)::integer into v_top_commit
  from (
    select value
    from unnest(v_amounts) value
    order by value desc
    limit v_max_wins
  ) top_values;

  v_reserve_after:=greatest(v_open_slots-v_max_wins,0);

  if v_top_commit>v_bankroll-v_reserve_after then
    raise exception 'Your two highest possible wins must leave $1 for every remaining open roster slot';
  end if;

  insert into private.football_weekly_auction_daily_entries(
    week_start,day_index,profile_id,submitted_at,updated_at
  ) values (
    p_week_start,p_day_index,p_profile_id,p_at,p_at
  )
  on conflict(week_start,day_index,profile_id)
  do update set updated_at=excluded.updated_at;

  delete from private.football_weekly_superteam_bid_preferences
  where week_start=p_week_start
    and day_index=p_day_index
    and profile_id=p_profile_id;

  for v_slot in 1..v_card_count loop
    v_entry:=p_bids->v_slot::text;
    v_bid:=coalesce((v_entry->>'amount')::integer,0);
    v_priority:=coalesce((v_entry->>'priority')::integer,v_slot);

    insert into private.football_weekly_auction_bids(
      week_start,day_index,profile_id,slot,amount,updated_at
    ) values (
      p_week_start,p_day_index,p_profile_id,v_slot,v_bid,p_at
    )
    on conflict(week_start,day_index,profile_id,slot)
    do update set amount=excluded.amount,updated_at=excluded.updated_at;

    insert into private.football_weekly_superteam_bid_preferences(
      week_start,day_index,profile_id,slot,claim_rank
    ) values (
      p_week_start,p_day_index,p_profile_id,v_slot,v_priority
    );
  end loop;
end;
$$;
revoke all on function private.submit_football_weekly_superteam_bids_for_profile(
  date,integer,uuid,jsonb,timestamptz
) from public,anon,authenticated;

create or replace function private.submit_my_football_weekly_superteam_bids(
  p_bids jsonb,p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_day_index integer;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day_index:=private.football_weekly_auction_day_index(p_at,v_week_start);

  perform private.submit_football_weekly_superteam_bids_for_profile(
    v_week_start,v_day_index,v_profile,p_bids,p_at
  );

  return public.get_my_football_weekly_auction(p_at);
end;
$$;
revoke all on function private.submit_my_football_weekly_superteam_bids(jsonb,timestamptz)
  from public,anon,authenticated;

create or replace function private.reset_football_weekly_superteam_lab(p_owner uuid)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_old_week date;
  v_run_number integer;
  v_week_start date;
  v_seat integer:=1;
  v_candidate record;
  v_live_signature text;
  v_lab_signature text;
begin
  select lab_week_start,run_number
  into v_old_week,v_run_number
  from private.football_weekly_superteam_lab_runs
  where owner_profile_id=p_owner
  for update;

  if not found then
    v_run_number:=1;
    v_week_start:=private.football_weekly_superteam_lab_week_start(v_run_number);
    insert into private.football_weekly_superteam_lab_runs(
      owner_profile_id,run_number,lab_week_start,current_day,final_payloads
    ) values (p_owner,v_run_number,v_week_start,1,null);
  else
    if v_old_week is not null then
      delete from private.football_weekly_auction_weeks
      where week_start=v_old_week;
    end if;

    v_run_number:=case when v_run_number>=2000 then 1 else v_run_number+1 end;
    v_week_start:=private.football_weekly_superteam_lab_week_start(v_run_number);

    delete from private.football_weekly_auction_weeks
    where week_start=v_week_start
      and v_week_start<date '2026-09-15';

    update private.football_weekly_superteam_lab_runs
    set run_number=v_run_number,
        lab_week_start=v_week_start,
        current_day=1,
        final_payloads=null,
        updated_at=now()
    where owner_profile_id=p_owner;

    delete from private.football_weekly_superteam_lab_seats
    where owner_profile_id=p_owner;
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(v_week_start,'cfb-superteam');

  perform private.materialize_football_weekly_superteam_week(v_week_start);

  insert into private.football_weekly_superteam_lab_seats(
    owner_profile_id,seat_index,profile_id
  ) values (p_owner,1,p_owner);

  for v_candidate in
    with recent as (
      select
        participant.profile_id,
        max(participant.week_start) as last_week
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
    limit 5
  loop
    v_seat:=v_seat+1;
    insert into private.football_weekly_superteam_lab_seats(
      owner_profile_id,seat_index,profile_id
    ) values (p_owner,v_seat,v_candidate.profile_id);
  end loop;

  if v_seat<6 then
    for v_candidate in
      select profile.id as profile_id
      from public.profiles profile
      where profile.id<>p_owner
        and profile.normalized_name not like 'TEST%'
        and not exists(
          select 1
          from private.football_weekly_superteam_lab_seats seat
          where seat.owner_profile_id=p_owner
            and seat.profile_id=profile.id
        )
      order by profile.created_at,profile.id
      limit (6-v_seat)
    loop
      v_seat:=v_seat+1;
      insert into private.football_weekly_superteam_lab_seats(
        owner_profile_id,seat_index,profile_id
      ) values (p_owner,v_seat,v_candidate.profile_id);
    end loop;
  end if;

  if v_seat<>6 then
    raise exception 'Weekly Auction Playthrough Lab needs six available profiles';
  end if;

  insert into private.football_weekly_auction_participants(
    week_start,profile_id,locked_at,source
  )
  select
    v_week_start,
    seat.profile_id,
    ((v_week_start::timestamp at time zone 'America/Chicago')-interval '1 minute'),
    'owner_lab'
  from private.football_weekly_superteam_lab_seats seat
  where seat.owner_profile_id=p_owner;

  select string_agg(board.season_reference,'|' order by board.slot)
  into v_lab_signature
  from private.football_weekly_auction_board board
  where board.week_start=v_week_start
    and board.day_index=1
    and board.slot<=10;

  select string_agg(board.season_reference,'|' order by board.slot)
  into v_live_signature
  from private.football_weekly_auction_board board
  where board.week_start=date '2026-09-29'
    and board.day_index=1
    and board.slot<=10;

  if v_live_signature is not null and v_lab_signature=v_live_signature then
    raise exception 'Weekly Auction Playthrough Lab generated the live launch board';
  end if;

  if private.football_weekly_auction_cards_for_day(v_week_start,1)<>10
    or private.football_weekly_auction_cards_for_day(v_week_start,2)<>9
  then
    raise exception 'Weekly Auction Playthrough Lab board sizing drifted';
  end if;
end;
$$;
revoke all on function private.reset_football_weekly_superteam_lab(uuid)
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_lab_state(
  p_owner uuid,p_seat_index integer
)
returns jsonb
language plpgsql
stable
security definer
set search_path=''
as $$
declare
  v_run private.football_weekly_superteam_lab_runs%rowtype;
  v_profile uuid;
  v_card_count integer;
  v_bankroll integer;
  v_owned integer;
  v_open_slots integer;
  v_max_commit integer;
  v_submitted boolean;
  v_cards jsonb;
  v_bids jsonb;
  v_prior_results jsonb:='[]'::jsonb;
  v_collection jsonb;
  v_tie_priority jsonb;
  v_seats jsonb;
  v_submitted_count integer;
  v_state jsonb;
  v_final jsonb;
begin
  if p_seat_index not between 1 and 6 then
    raise exception 'Lab seat must be between 1 and 6';
  end if;

  select * into v_run
  from private.football_weekly_superteam_lab_runs
  where owner_profile_id=p_owner;

  if v_run.owner_profile_id is null then
    raise exception 'Weekly Auction Playthrough Lab is not initialized';
  end if;

  select seat.profile_id into v_profile
  from private.football_weekly_superteam_lab_seats seat
  where seat.owner_profile_id=p_owner
    and seat.seat_index=p_seat_index;

  if v_profile is null then
    raise exception 'Weekly Auction Playthrough Lab seat is unavailable';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'seat_index',seat.seat_index,
    'profile_id',seat.profile_id,
    'display_name',profile.display_name,
    'submitted_today',case
      when v_run.current_day between 1 and 7 then exists(
        select 1
        from private.football_weekly_auction_daily_entries entry
        where entry.week_start=v_run.lab_week_start
          and entry.day_index=v_run.current_day
          and entry.profile_id=seat.profile_id
      )
      else true
    end,
    'owned_count',(
      select count(*)::integer
      from private.football_weekly_auction_awards award
      where award.week_start=v_run.lab_week_start
        and award.profile_id=seat.profile_id
        and award.roster_slot is not null
    ),
    'bankroll',50-coalesce((
      select sum(award.winning_bid)::integer
      from private.football_weekly_auction_awards award
      where award.week_start=v_run.lab_week_start
        and award.profile_id=seat.profile_id
        and award.roster_slot is not null
    ),0)
  ) order by seat.seat_index),'[]'::jsonb)
  into v_seats
  from private.football_weekly_superteam_lab_seats seat
  join public.profiles profile on profile.id=seat.profile_id
  where seat.owner_profile_id=p_owner;

  if v_run.current_day between 1 and 7 then
    select count(*)::integer into v_submitted_count
    from private.football_weekly_auction_daily_entries entry
    where entry.week_start=v_run.lab_week_start
      and entry.day_index=v_run.current_day;

    v_card_count:=private.football_weekly_auction_cards_for_day(
      v_run.lab_week_start,v_run.current_day
    );

    select
      50-coalesce(sum(award.winning_bid),0)::integer,
      count(award.roster_slot)::integer
    into v_bankroll,v_owned
    from private.football_weekly_auction_awards award
    where award.week_start=v_run.lab_week_start
      and award.profile_id=v_profile
      and award.roster_slot is not null;

    v_open_slots:=greatest(7-v_owned,0);
    v_max_commit:=greatest(v_bankroll-greatest(v_open_slots-2,0),0);

    select exists(
      select 1
      from private.football_weekly_auction_daily_entries entry
      where entry.week_start=v_run.lab_week_start
        and entry.day_index=v_run.current_day
        and entry.profile_id=v_profile
    ) into v_submitted;

    select coalesce(jsonb_agg(jsonb_build_object(
      'slot',board.slot,
      'item_reference',authority.item_reference,
      'display_name',authority.display_name,
      'school',authority.school,
      'season_year',authority.season_year,
      'group_key',authority.group_key,
      'eligible_slots',authority.eligible_slots,
      'lock_at',board.lock_at
    ) order by board.slot),'[]'::jsonb)
    into v_cards
    from private.football_weekly_auction_board board
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=board.season_reference
    where board.week_start=v_run.lab_week_start
      and board.day_index=v_run.current_day
      and board.slot<=v_card_count;

    select coalesce(jsonb_object_agg(source.slot::text,jsonb_build_object(
      'amount',source.amount,
      'priority',source.claim_rank
    )),'{}'::jsonb)
    into v_bids
    from (
      select bid.slot,bid.amount,preference.claim_rank
      from private.football_weekly_auction_bids bid
      join private.football_weekly_superteam_bid_preferences preference
        on preference.week_start=bid.week_start
       and preference.day_index=bid.day_index
       and preference.profile_id=bid.profile_id
       and preference.slot=bid.slot
      where bid.week_start=v_run.lab_week_start
        and bid.day_index=v_run.current_day
        and bid.profile_id=v_profile
        and bid.slot<=v_card_count
    ) source;

    if v_run.current_day>1 then
      select coalesce(jsonb_agg(result_row.payload order by result_row.slot),'[]'::jsonb)
      into v_prior_results
      from (
        select
          board.slot,
          jsonb_build_object(
            'slot',board.slot,
            'item_reference',authority.item_reference,
            'display_name',authority.display_name,
            'school',authority.school,
            'season_year',authority.season_year,
            'group_key',authority.group_key,
            'winning_bid',award.winning_bid,
            'roster_slot',award.roster_slot,
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
              where entry.week_start=v_run.lab_week_start
                and entry.day_index=v_run.current_day-1
            ),'[]'::jsonb)
          ) as payload
        from private.football_weekly_auction_board board
        join private.cfb_superteam_v1_authority authority
          on authority.item_reference=board.season_reference
        join private.football_weekly_auction_awards award
          on award.week_start=board.week_start
         and award.day_index=board.day_index
         and award.slot=board.slot
        left join public.profiles winner on winner.id=award.profile_id
        where board.week_start=v_run.lab_week_start
          and board.day_index=v_run.current_day-1
      ) result_row;
    end if;

    select coalesce(jsonb_agg(jsonb_build_object(
      'item_reference',authority.item_reference,
      'display_name',authority.display_name,
      'school',authority.school,
      'season_year',authority.season_year,
      'group_key',authority.group_key,
      'roster_slot',award.roster_slot,
      'winning_bid',award.winning_bid
    ) order by array_position(
      array['QB','RB','WR','Flex','Front Seven','Secondary','Head Coach']::text[],
      award.roster_slot
    )),'[]'::jsonb)
    into v_collection
    from private.football_weekly_auction_awards award
    join private.football_weekly_auction_board board
      on board.week_start=award.week_start
     and board.day_index=award.day_index
     and board.slot=award.slot
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=board.season_reference
    where award.week_start=v_run.lab_week_start
      and award.profile_id=v_profile
      and award.roster_slot is not null;

    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id',ranked.profile_id,
      'display_name',ranked.display_name,
      'rank',ranked.tie_rank
    ) order by ranked.tie_rank),'[]'::jsonb)
    into v_tie_priority
    from (
      select
        participant.profile_id,
        profile.display_name,
        private.football_weekly_superteam_tie_rank(
          v_run.lab_week_start,v_run.current_day,participant.profile_id
        ) as tie_rank
      from private.football_weekly_auction_participants participant
      join public.profiles profile on profile.id=participant.profile_id
      where participant.week_start=v_run.lab_week_start
    ) ranked;

    v_state:=jsonb_build_object(
      'available',true,
      'subject_key','cfb-superteam',
      'week_start',v_run.lab_week_start,
      'week_end',v_run.lab_week_start+6,
      'day_index',v_run.current_day,
      'bankroll',v_bankroll,
      'owned_count',v_owned,
      'reserve_floor',v_open_slots,
      'max_commit',v_max_commit,
      'submitted_today',v_submitted,
      'show_intro',false,
      'teams',v_cards,
      'bids',v_bids,
      'prior_results',v_prior_results,
      'collection',v_collection,
      'tie_priority',v_tie_priority,
      'previous_final',null
    );

    v_final:=null;
  else
    v_submitted_count:=6;
    v_state:=null;
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
revoke all on function private.football_weekly_superteam_lab_state(uuid,integer)
  from public,anon,authenticated;

create or replace function public.get_my_football_weekly_superteam_lab(
  p_seat_index integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
begin
  v_owner:=private.football_weekly_superteam_lab_owner();

  if not exists(
    select 1
    from private.football_weekly_superteam_lab_runs
    where owner_profile_id=v_owner
  ) then
    perform private.reset_football_weekly_superteam_lab(v_owner);
  end if;

  return private.football_weekly_superteam_lab_state(v_owner,p_seat_index);
end;
$$;
revoke all on function public.get_my_football_weekly_superteam_lab(integer)
  from public,anon;
grant execute on function public.get_my_football_weekly_superteam_lab(integer)
  to authenticated;

create or replace function public.reset_my_football_weekly_superteam_lab()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
begin
  v_owner:=private.football_weekly_superteam_lab_owner();
  perform private.reset_football_weekly_superteam_lab(v_owner);
  return private.football_weekly_superteam_lab_state(v_owner,1);
end;
$$;
revoke all on function public.reset_my_football_weekly_superteam_lab()
  from public,anon;
grant execute on function public.reset_my_football_weekly_superteam_lab()
  to authenticated;

create or replace function public.submit_my_football_weekly_superteam_lab_bids(
  p_seat_index integer,p_bids jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_run private.football_weekly_superteam_lab_runs%rowtype;
  v_profile uuid;
  v_submit_at timestamptz;
begin
  v_owner:=private.football_weekly_superteam_lab_owner();

  if p_seat_index not between 1 and 6 then
    raise exception 'Lab seat must be between 1 and 6';
  end if;

  select * into v_run
  from private.football_weekly_superteam_lab_runs
  where owner_profile_id=v_owner;

  if v_run.owner_profile_id is null or v_run.current_day not between 1 and 7 then
    raise exception 'Weekly Auction Playthrough Lab is not on an active day';
  end if;

  select seat.profile_id into v_profile
  from private.football_weekly_superteam_lab_seats seat
  where seat.owner_profile_id=v_owner
    and seat.seat_index=p_seat_index;

  if v_profile is null then
    raise exception 'Weekly Auction Playthrough Lab seat is unavailable';
  end if;

  v_submit_at:=(
    (v_run.lab_week_start+(v_run.current_day-1))::date + time '12:00'
  ) at time zone 'America/Chicago';

  perform private.submit_football_weekly_superteam_bids_for_profile(
    v_run.lab_week_start,
    v_run.current_day,
    v_profile,
    p_bids,
    v_submit_at
  );

  update private.football_weekly_superteam_lab_runs
  set updated_at=now()
  where owner_profile_id=v_owner;

  return private.football_weekly_superteam_lab_state(v_owner,p_seat_index);
end;
$$;
revoke all on function public.submit_my_football_weekly_superteam_lab_bids(integer,jsonb)
  from public,anon;
grant execute on function public.submit_my_football_weekly_superteam_lab_bids(integer,jsonb)
  to authenticated;

create or replace function public.advance_my_football_weekly_superteam_lab(
  p_seat_index integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_run private.football_weekly_superteam_lab_runs%rowtype;
  v_entries integer;
  v_card_count integer;
  v_awards integer;
  v_resolve_at timestamptz;
  v_seat record;
  v_payloads jsonb:='{}'::jsonb;
begin
  v_owner:=private.football_weekly_superteam_lab_owner();

  if p_seat_index not between 1 and 6 then
    raise exception 'Lab seat must be between 1 and 6';
  end if;

  select * into v_run
  from private.football_weekly_superteam_lab_runs
  where owner_profile_id=v_owner
  for update;

  if v_run.owner_profile_id is null then
    raise exception 'Weekly Auction Playthrough Lab is not initialized';
  end if;

  if v_run.current_day=8 then
    return private.football_weekly_superteam_lab_state(v_owner,p_seat_index);
  end if;

  select count(*)::integer into v_entries
  from private.football_weekly_auction_daily_entries entry
  where entry.week_start=v_run.lab_week_start
    and entry.day_index=v_run.current_day;

  if v_entries<>6 then
    raise exception 'Submit all six simulated seats before resolving this day';
  end if;

  select min(board.lock_at)+interval '1 second'
  into v_resolve_at
  from private.football_weekly_auction_board board
  where board.week_start=v_run.lab_week_start
    and board.day_index=v_run.current_day;

  perform private.resolve_football_weekly_superteam_day(
    v_run.lab_week_start,v_run.current_day,v_resolve_at
  );

  v_card_count:=private.football_weekly_auction_cards_for_day(
    v_run.lab_week_start,v_run.current_day
  );

  select count(*)::integer into v_awards
  from private.football_weekly_auction_awards award
  where award.week_start=v_run.lab_week_start
    and award.day_index=v_run.current_day;

  if v_awards<>v_card_count then
    raise exception 'Weekly Auction Playthrough Lab day did not fully resolve';
  end if;

  if v_run.current_day<7 then
    update private.football_weekly_superteam_lab_runs
    set current_day=v_run.current_day+1,
        updated_at=now()
    where owner_profile_id=v_owner;
  else
    perform private.finalize_football_weekly_superteam_week(
      v_run.lab_week_start,v_resolve_at+interval '1 second'
    );

    if (
      select count(*)
      from private.football_weekly_auction_results result
      where result.week_start=v_run.lab_week_start
    )<>6 then
      raise exception 'Weekly Auction Playthrough Lab finalizer did not produce six results';
    end if;

    for v_seat in
      select seat.seat_index,seat.profile_id
      from private.football_weekly_superteam_lab_seats seat
      where seat.owner_profile_id=v_owner
      order by seat.seat_index
    loop
      v_payloads:=v_payloads || jsonb_build_object(
        v_seat.seat_index::text,
        private.football_weekly_superteam_final_payload(
          v_run.lab_week_start,v_seat.profile_id
        )
      );
    end loop;

    -- The actual finalizer is used, but its normal result rows never persist.
    delete from private.football_weekly_auction_results
    where week_start=v_run.lab_week_start;

    update private.football_weekly_superteam_lab_runs
    set current_day=8,
        final_payloads=v_payloads,
        updated_at=now()
    where owner_profile_id=v_owner;
  end if;

  return private.football_weekly_superteam_lab_state(v_owner,p_seat_index);
end;
$$;
revoke all on function public.advance_my_football_weekly_superteam_lab(integer)
  from public,anon;
grant execute on function public.advance_my_football_weekly_superteam_lab(integer)
  to authenticated;

do $weekly_auction_playthrough_lab_contract$
begin
  if private.football_weekly_superteam_lab_week_start(1)<>date '1980-01-01'
    or extract(isodow from private.football_weekly_superteam_lab_week_start(1))<>2
  then
    raise exception 'Weekly Auction Playthrough Lab shadow-week calendar drifted';
  end if;

  if private.football_weekly_superteam_cards_for_field(6)<>9 then
    raise exception 'Weekly Auction Playthrough Lab must preserve the canonical six-player elastic supply';
  end if;
end;
$weekly_auction_playthrough_lab_contract$;
