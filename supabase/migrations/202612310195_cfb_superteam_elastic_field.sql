-- Make CFB Superteam participation and candidate supply elastic through Day 4.
-- Current-day boards never change after they become visible. Each week prebuilds
-- four hidden reserve cards per day (12 total), and future days reveal 8-12 cards
-- according to the field that existed when that day began.
--
-- Existing Weekly Auction subjects retain their current fixed board sizes and
-- Day 1 field lock. CFB Superteam keeps its $50 bankroll, seven roster spots,
-- max two wins/day, ranked conditional claims, rotating ties, $1/open-slot
-- reserve, Standard grade shape, and end-of-week completion autofill.

alter table private.football_weekly_auction_board
  drop constraint if exists football_weekly_auction_board_slot_check,
  add constraint football_weekly_auction_board_slot_check check (slot between 1 and 12);

alter table private.football_weekly_auction_bids
  drop constraint if exists football_weekly_auction_bids_slot_check,
  add constraint football_weekly_auction_bids_slot_check check (slot between 1 and 12);

alter table private.football_weekly_superteam_bid_preferences
  drop constraint if exists football_weekly_superteam_bid_preferences_slot_check,
  add constraint football_weekly_superteam_bid_preferences_slot_check check (slot between 1 and 12),
  drop constraint if exists football_weekly_superteam_bid_preferences_claim_rank_check,
  add constraint football_weekly_superteam_bid_preferences_claim_rank_check check (claim_rank between 1 and 12);

alter table private.cfb_superteam_week_authority
  drop constraint if exists cfb_superteam_week_authority_launch_slot_check,
  add constraint cfb_superteam_week_authority_launch_slot_check check (launch_slot between 1 and 12);

create or replace function private.football_weekly_superteam_cards_for_field(p_players integer)
returns integer
language sql
immutable
set search_path=''
as $$
  select case
    when greatest(coalesce(p_players,0),0)<=5 then 8
    when p_players<=7 then 9
    when p_players=8 then 10
    when p_players=9 then 11
    else 12
  end;
$$;
revoke all on function private.football_weekly_superteam_cards_for_field(integer)
  from public,anon,authenticated;

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

create or replace function private.football_weekly_auction_cards_per_week(p_week_start date)
returns integer
language plpgsql
stable
security definer
set search_path=''
as $$
declare
  v_subject text;
  v_day integer;
  v_total integer:=0;
begin
  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject='cfb-superteam' then
    for v_day in 1..7 loop
      v_total:=v_total+private.football_weekly_auction_cards_for_day(p_week_start,v_day);
    end loop;
    return v_total;
  end if;

  return private.football_weekly_auction_cards_per_day(p_week_start)*7;
end;
$$;
revoke all on function private.football_weekly_auction_cards_per_week(date)
  from public,anon,authenticated;

create or replace function private.generate_cfb_superteam_standard_authority(p_week_start date)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_existing integer;
  v_day integer;
  v_pick integer;
  v_mode integer;
  v_group_shift integer;
  v_target_shift integer;
  v_reserve_target_shift integer;
  v_groups text[];
  v_reserve_groups text[];
  v_targets integer[];
  v_reserve_targets integer[];
  v_group text;
  v_target integer;
  v_item_reference text;
begin
  if extract(isodow from p_week_start)<>2 then
    raise exception 'CFB Superteam week must start Tuesday';
  end if;

  select count(*)::integer into v_existing
  from private.cfb_superteam_week_authority
  where week_start=p_week_start;

  if v_existing=84 then return; end if;
  if v_existing not in (0,56) then
    raise exception 'CFB Superteam week authority is partial';
  end if;

  if v_existing=56 and exists(
    select 1
    from generate_series(1,7) as days(day_number)
    where (
      select count(*)
      from private.cfb_superteam_week_authority weekly
      where weekly.week_start=p_week_start
        and weekly.launch_day=day_number
        and weekly.launch_slot between 1 and 8
    )<>8
  ) then
    raise exception 'CFB Superteam base authority is not an intact 8-card Standard week';
  end if;

  if v_existing=0 then
    for v_day in 1..7 loop
      v_groups:=case v_day
        when 1 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','TE','RB']
        when 2 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','WR','Front Seven']
        when 3 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','TE','Secondary']
        when 4 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','QB','WR']
        when 5 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','TE','Head Coach']
        when 6 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','RB','Front Seven']
        else array['QB','RB','WR','Front Seven','Secondary','Head Coach','TE','Secondary']
      end;

      v_mode:=1+mod(
        hashtext(p_week_start::text||':standard-mode:'||v_day::text)::bigint+2147483648,
        3
      )::integer;
      v_group_shift:=mod(
        hashtext(p_week_start::text||':group-shift:'||v_day::text)::bigint+2147483648,
        8
      )::integer;
      v_target_shift:=mod(
        hashtext(p_week_start::text||':target-shift:'||v_day::text)::bigint+2147483648,
        8
      )::integer;

      v_targets:=case v_mode
        when 1 then array[97,95,94,92,91,90,89,88]
        when 2 then array[100,96,94,93,91,90,89,88]
        else array[98,95,93,92,91,90,89,88]
      end;

      for v_pick in 1..8 loop
        v_group:=v_groups[1+mod(v_pick-1+v_group_shift,8)];
        v_target:=v_targets[1+mod(v_pick-1+v_target_shift,8)];
        v_item_reference:=null;

        select candidate.item_reference
        into v_item_reference
        from private.cfb_superteam_v1_authority candidate
        where candidate.group_key=v_group
          and not exists(
            select 1 from private.cfb_superteam_week_authority used
            where used.week_start=p_week_start
              and used.item_reference=candidate.item_reference
          )
          and not exists(
            select 1
            from private.cfb_superteam_week_authority used
            join private.cfb_superteam_v1_authority prior
              on prior.item_reference=used.item_reference
            where used.week_start=p_week_start
              and prior.display_name=candidate.display_name
          )
          and not exists(
            select 1
            from private.cfb_superteam_week_authority used
            join private.cfb_superteam_v1_authority prior
              on prior.item_reference=used.item_reference
            where used.week_start=p_week_start
              and used.launch_day=v_day
              and prior.school=candidate.school
          )
        order by
          abs(candidate.hidden_grade-v_target),
          md5(p_week_start::text||':'||v_day::text||':'||v_pick::text||':'||candidate.item_reference)
        limit 1;

        if v_item_reference is null then
          select candidate.item_reference
          into v_item_reference
          from private.cfb_superteam_v1_authority candidate
          where candidate.group_key=v_group
            and not exists(
              select 1 from private.cfb_superteam_week_authority used
              where used.week_start=p_week_start
                and used.item_reference=candidate.item_reference
            )
            and not exists(
              select 1
              from private.cfb_superteam_week_authority used
              join private.cfb_superteam_v1_authority prior
                on prior.item_reference=used.item_reference
              where used.week_start=p_week_start
                and prior.display_name=candidate.display_name
            )
          order by
            abs(candidate.hidden_grade-v_target),
            md5(p_week_start::text||':'||v_day::text||':'||v_pick::text||':'||candidate.item_reference)
          limit 1;
        end if;

        if v_item_reference is null then
          raise exception 'CFB Superteam Standard generator exhausted % on day %',v_group,v_day;
        end if;

        insert into private.cfb_superteam_week_authority(
          week_start,item_reference,launch_day,launch_slot,target_grade
        ) values (
          p_week_start,v_item_reference,v_day,v_pick,v_target
        );
      end loop;
    end loop;
  end if;

  for v_day in 1..7 loop
    v_reserve_groups:=case v_day
      when 1 then array['QB','TE','Head Coach','RB']
      when 2 then array['WR','TE','Secondary','Head Coach']
      when 3 then array['QB','RB','TE','Front Seven']
      when 4 then array['WR','Head Coach','Secondary','TE']
      when 5 then array['QB','RB','WR','TE']
      when 6 then array['Front Seven','Head Coach','RB','TE']
      else array['QB','WR','Front Seven','Secondary']
    end;

    v_mode:=1+mod(
      hashtext(p_week_start::text||':reserve-mode:'||v_day::text)::bigint+2147483648,
      3
    )::integer;
    v_reserve_target_shift:=mod(
      hashtext(p_week_start::text||':reserve-target-shift:'||v_day::text)::bigint+2147483648,
      4
    )::integer;
    v_reserve_targets:=case v_mode
      when 1 then array[94,92,90,88]
      when 2 then array[96,93,91,88]
      else array[95,93,90,89]
    end;

    for v_pick in 1..4 loop
      if exists(
        select 1
        from private.cfb_superteam_week_authority weekly
        where weekly.week_start=p_week_start
          and weekly.launch_day=v_day
          and weekly.launch_slot=8+v_pick
      ) then
        continue;
      end if;

      v_group:=v_reserve_groups[v_pick];
      v_target:=v_reserve_targets[1+mod(v_pick-1+v_reserve_target_shift,4)];
      v_item_reference:=null;

      select candidate.item_reference
      into v_item_reference
      from private.cfb_superteam_v1_authority candidate
      where candidate.group_key=v_group
        and not exists(
          select 1 from private.cfb_superteam_week_authority used
          where used.week_start=p_week_start
            and used.item_reference=candidate.item_reference
        )
        and not exists(
          select 1
          from private.cfb_superteam_week_authority used
          join private.cfb_superteam_v1_authority prior
            on prior.item_reference=used.item_reference
          where used.week_start=p_week_start
            and prior.display_name=candidate.display_name
        )
        and not exists(
          select 1
          from private.cfb_superteam_week_authority used
          join private.cfb_superteam_v1_authority prior
            on prior.item_reference=used.item_reference
          where used.week_start=p_week_start
            and used.launch_day=v_day
            and prior.school=candidate.school
        )
      order by
        abs(candidate.hidden_grade-v_target),
        md5(p_week_start::text||':reserve:'||v_day::text||':'||v_pick::text||':'||candidate.item_reference)
      limit 1;

      if v_item_reference is null then
        select candidate.item_reference
        into v_item_reference
        from private.cfb_superteam_v1_authority candidate
        where candidate.group_key=v_group
          and not exists(
            select 1 from private.cfb_superteam_week_authority used
            where used.week_start=p_week_start
              and used.item_reference=candidate.item_reference
          )
          and not exists(
            select 1
            from private.cfb_superteam_week_authority used
            join private.cfb_superteam_v1_authority prior
              on prior.item_reference=used.item_reference
            where used.week_start=p_week_start
              and prior.display_name=candidate.display_name
          )
        order by
          abs(candidate.hidden_grade-v_target),
          md5(p_week_start::text||':reserve:'||v_day::text||':'||v_pick::text||':'||candidate.item_reference)
        limit 1;
      end if;

      if v_item_reference is null then
        raise exception 'CFB Superteam reserve generator exhausted % on day %',v_group,v_day;
      end if;

      insert into private.cfb_superteam_week_authority(
        week_start,item_reference,launch_day,launch_slot,target_grade
      ) values (
        p_week_start,v_item_reference,v_day,8+v_pick,v_target
      );
    end loop;
  end loop;

  if (select count(*) from private.cfb_superteam_week_authority where week_start=p_week_start)<>84 then
    raise exception 'CFB Superteam elastic authority did not create 84 candidates';
  end if;

  if (
    select count(distinct authority.display_name)
    from private.cfb_superteam_week_authority weekly
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=weekly.item_reference
    where weekly.week_start=p_week_start
  )<>84 then
    raise exception 'CFB Superteam elastic authority repeated a person within the week';
  end if;

  if exists(
    select weekly.launch_day
    from private.cfb_superteam_week_authority weekly
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=weekly.item_reference
    where weekly.week_start=p_week_start
    group by weekly.launch_day
    having count(*)<>12
      or count(distinct authority.school)<>12
      or max(authority.hidden_grade)-min(authority.hidden_grade)<7
      or max(authority.hidden_grade)<95
      or min(authority.hidden_grade)>92
  ) then
    raise exception 'CFB Superteam elastic reserve board is not balanced';
  end if;

  if exists(
    select weekly.launch_day
    from private.cfb_superteam_week_authority weekly
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=weekly.item_reference
    where weekly.week_start=p_week_start
      and weekly.launch_slot<=8
    group by weekly.launch_day
    having count(*)<>8
      or max(authority.hidden_grade)-min(authority.hidden_grade)<7
      or max(authority.hidden_grade)<95
      or min(authority.hidden_grade)>92
      or count(*) filter(where authority.hidden_grade>=96)>3
  ) then
    raise exception 'CFB Superteam base Standard board regressed';
  end if;

  if (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='QB')<>12
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='RB')<>13
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='WR')<>13
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='TE')<>10
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='Front Seven')<>12
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='Secondary')<>12
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='Head Coach')<>12
  then
    raise exception 'CFB Superteam elastic positional reserve mix drifted';
  end if;
end;
$$;
revoke all on function private.generate_cfb_superteam_standard_authority(date)
  from public,anon,authenticated;

create or replace function private.materialize_football_weekly_superteam_week(p_week_start date)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare v_existing integer;
begin
  if extract(isodow from p_week_start)<>2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(p_week_start,'cfb-superteam')
  on conflict(week_start) do nothing;

  if (select subject_key from private.football_weekly_auction_weeks where week_start=p_week_start)<>'cfb-superteam' then
    raise exception 'CFB Superteam materializer requires a CFB Superteam week';
  end if;

  select count(*)::integer into v_existing
  from private.football_weekly_auction_board
  where week_start=p_week_start;

  if v_existing=84 then return; end if;
  if v_existing not in (0,56) then
    raise exception 'CFB Superteam week already has a partial board';
  end if;

  perform private.generate_cfb_superteam_standard_authority(p_week_start);

  insert into private.football_weekly_auction_board(
    week_start,day_index,theme,hidden_shape,slot,season_reference,lock_at,trait
  )
  select
    p_week_start,
    authority.launch_day,
    'CFB Superteam',
    'Standard',
    authority.launch_slot,
    authority.item_reference,
    ((p_week_start+authority.launch_day)::timestamp at time zone 'America/Chicago'),
    null
  from private.cfb_superteam_week_authority authority
  where authority.week_start=p_week_start
    and not exists(
      select 1
      from private.football_weekly_auction_board board
      where board.week_start=authority.week_start
        and board.day_index=authority.launch_day
        and board.slot=authority.launch_slot
    )
  order by authority.launch_day,authority.launch_slot;

  if (select count(*) from private.football_weekly_auction_board where week_start=p_week_start)<>84 then
    raise exception 'CFB Superteam elastic board did not materialize 84 reserve candidates';
  end if;
end;
$$;
revoke all on function private.materialize_football_weekly_superteam_week(date)
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_join_capacity(
  p_week_start date,p_at timestamptz default now()
)
returns integer
language plpgsql
stable
security definer
set search_path=''
as $$
declare
  v_day_index integer;
  v_total integer;
  v_qb integer;
  v_rb integer;
  v_wr integer;
  v_front integer;
  v_secondary integer;
  v_coach integer;
  v_flex_pool integer;
begin
  v_day_index:=least(
    greatest(private.football_weekly_auction_day_index(p_at,p_week_start),1),
    7
  );

  with eligible as (
    select authority.group_key
    from private.football_weekly_auction_board board
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=board.season_reference
    where board.week_start=p_week_start
      and (
        board.day_index>v_day_index
        or (
          board.day_index=v_day_index
          and board.slot<=private.football_weekly_auction_cards_for_day(
            p_week_start,board.day_index
          )
        )
        or (
          board.day_index<v_day_index
          and exists(
            select 1
            from private.football_weekly_auction_awards award
            where award.week_start=board.week_start
              and award.day_index=board.day_index
              and award.slot=board.slot
              and award.profile_id is null
          )
        )
      )
  )
  select
    count(*)::integer,
    count(*) filter(where group_key='QB')::integer,
    count(*) filter(where group_key='RB')::integer,
    count(*) filter(where group_key='WR')::integer,
    count(*) filter(where group_key='Front Seven')::integer,
    count(*) filter(where group_key='Secondary')::integer,
    count(*) filter(where group_key='Head Coach')::integer,
    count(*) filter(where group_key in ('RB','WR','TE'))::integer
  into
    v_total,v_qb,v_rb,v_wr,v_front,v_secondary,v_coach,v_flex_pool
  from eligible;

  return least(
    coalesce(v_total,0)/7,
    coalesce(v_qb,0),
    coalesce(v_rb,0),
    coalesce(v_wr,0),
    coalesce(v_front,0),
    coalesce(v_secondary,0),
    coalesce(v_coach,0),
    coalesce(v_flex_pool,0)/3
  );
end;
$$;
revoke all on function private.football_weekly_superteam_join_capacity(date,timestamptz)
  from public,anon,authenticated;

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

create or replace function private.resolve_football_weekly_superteam_day(
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
  v_slot integer;
  v_item_reference text;
  v_winner uuid;
  v_amount integer;
  v_roster_slot text;
  v_lock_at timestamptz;
begin
  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start=p_week_start and day_index=p_day_index;

  if v_lock_at is null then raise exception 'CFB Superteam day is not materialized'; end if;
  if p_at<v_lock_at then return; end if;

  v_card_count:=private.football_weekly_auction_cards_for_day(p_week_start,p_day_index);

  for v_iteration in 1..v_card_count loop
    select candidate.slot
    into v_slot
    from (
      select
        board.slot,
        coalesce((
          select preference.claim_rank
          from private.football_weekly_auction_bids bid
          join private.football_weekly_superteam_bid_preferences preference
            on preference.week_start=bid.week_start
           and preference.day_index=bid.day_index
           and preference.profile_id=bid.profile_id
           and preference.slot=bid.slot
          where bid.week_start=board.week_start
            and bid.day_index=board.day_index
            and bid.slot=board.slot
            and bid.amount>0
            and exists(
              select 1 from private.football_weekly_auction_participants participant
              where participant.week_start=bid.week_start
                and participant.profile_id=bid.profile_id
            )
            and (
              select count(*)
              from private.football_weekly_auction_awards prior_award
              where prior_award.week_start=p_week_start
                and prior_award.day_index=p_day_index
                and prior_award.profile_id=bid.profile_id
            ) < 2
            and private.football_weekly_superteam_assignment_slot(
              p_week_start,bid.profile_id,board.season_reference
            ) is not null
            and bid.amount <= (
              50
              - coalesce((
                select sum(prior_award.winning_bid)
                from private.football_weekly_auction_awards prior_award
                where prior_award.week_start=p_week_start
                  and prior_award.profile_id=bid.profile_id
              ),0)
              - greatest(
                7
                - (
                  select count(*)
                  from private.football_weekly_auction_awards prior_award
                  where prior_award.week_start=p_week_start
                    and prior_award.profile_id=bid.profile_id
                    and prior_award.roster_slot is not null
                )
                - 1,
                0
              )
            )
          order by
            bid.amount desc,
            private.football_weekly_superteam_tie_rank(p_week_start,p_day_index,bid.profile_id),
            preference.claim_rank,
            bid.profile_id
          limit 1
        ),99) as top_claim_rank
      from private.football_weekly_auction_board board
      where board.week_start=p_week_start
        and board.day_index=p_day_index
        and board.slot<=v_card_count
        and not exists(
          select 1 from private.football_weekly_auction_awards award
          where award.week_start=board.week_start
            and award.day_index=board.day_index
            and award.slot=board.slot
        )
    ) candidate
    order by candidate.top_claim_rank,candidate.slot
    limit 1;

    exit when v_slot is null;

    select board.season_reference into v_item_reference
    from private.football_weekly_auction_board board
    where board.week_start=p_week_start
      and board.day_index=p_day_index
      and board.slot=v_slot;

    v_winner:=null;
    v_amount:=0;
    v_roster_slot:=null;

    select bid.profile_id,bid.amount
    into v_winner,v_amount
    from private.football_weekly_auction_bids bid
    join private.football_weekly_superteam_bid_preferences preference
      on preference.week_start=bid.week_start
     and preference.day_index=bid.day_index
     and preference.profile_id=bid.profile_id
     and preference.slot=bid.slot
    where bid.week_start=p_week_start
      and bid.day_index=p_day_index
      and bid.slot=v_slot
      and bid.amount>0
      and exists(
        select 1 from private.football_weekly_auction_participants participant
        where participant.week_start=bid.week_start
          and participant.profile_id=bid.profile_id
      )
      and (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start=p_week_start
          and award.day_index=p_day_index
          and award.profile_id=bid.profile_id
      ) < 2
      and private.football_weekly_superteam_assignment_slot(
        p_week_start,bid.profile_id,v_item_reference
      ) is not null
      and bid.amount <= (
        50
        - coalesce((
          select sum(award.winning_bid)
          from private.football_weekly_auction_awards award
          where award.week_start=p_week_start
            and award.profile_id=bid.profile_id
        ),0)
        - greatest(
          7
          - (
            select count(*)
            from private.football_weekly_auction_awards award
            where award.week_start=p_week_start
              and award.profile_id=bid.profile_id
              and award.roster_slot is not null
          )
          - 1,
          0
        )
      )
    order by
      bid.amount desc,
      private.football_weekly_superteam_tie_rank(p_week_start,p_day_index,bid.profile_id),
      preference.claim_rank,
      bid.profile_id
    limit 1;

    if v_winner is not null then
      v_roster_slot:=private.football_weekly_superteam_assignment_slot(
        p_week_start,v_winner,v_item_reference
      );
    end if;

    insert into private.football_weekly_auction_awards(
      week_start,day_index,slot,profile_id,winning_bid,resolved_at,roster_slot
    ) values (
      p_week_start,p_day_index,v_slot,v_winner,coalesce(v_amount,0),p_at,v_roster_slot
    );
  end loop;
end;
$$;
revoke all on function private.resolve_football_weekly_superteam_day(date,integer,timestamptz)
  from public,anon,authenticated;

create or replace function private.finalize_football_weekly_superteam_week(
  p_week_start date,p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if exists(
    select 1 from private.football_weekly_auction_weeks
    where week_start=p_week_start and finalized_at is not null
  ) then return; end if;

  if (
    select count(*)
    from private.football_weekly_auction_awards
    where week_start=p_week_start
  )<>private.football_weekly_auction_cards_per_week(p_week_start) then
    return;
  end if;

  perform private.complete_football_weekly_superteam_rosters(p_week_start,p_at);

  if exists(
    select participant.profile_id
    from private.football_weekly_auction_participants participant
    left join private.football_weekly_auction_awards award
      on award.week_start=participant.week_start
     and award.profile_id=participant.profile_id
     and award.roster_slot is not null
    where participant.week_start=p_week_start
    group by participant.profile_id
    having count(award.roster_slot)<>7
  ) then
    raise exception 'CFB Superteam finalization requires seven filled roster slots per player';
  end if;

  delete from private.football_weekly_auction_results where week_start=p_week_start;

  insert into private.football_weekly_auction_results(
    week_start,profile_id,owned_count,final_score,scoring_cost,scoring_refs,tie_random
  )
  select
    p_week_start,
    participant.profile_id,
    7,
    round(avg(authority.hidden_grade),2),
    sum(award.winning_bid)::integer,
    array_agg(authority.item_reference order by award.roster_slot),
    random()
  from private.football_weekly_auction_participants participant
  join private.football_weekly_auction_awards award
    on award.week_start=participant.week_start
   and award.profile_id=participant.profile_id
   and award.roster_slot is not null
  join private.football_weekly_auction_board board
    on board.week_start=award.week_start
   and board.day_index=award.day_index
   and board.slot=award.slot
  join private.cfb_superteam_v1_authority authority
    on authority.item_reference=board.season_reference
  where participant.week_start=p_week_start
  group by participant.profile_id;

  with ranked as (
    select
      profile_id,
      row_number() over(
        order by final_score desc nulls last,scoring_cost asc nulls last,tie_random,profile_id
      )::integer as final_rank
    from private.football_weekly_auction_results
    where week_start=p_week_start
  )
  update private.football_weekly_auction_results result
  set final_rank=ranked.final_rank,
      is_winner=ranked.final_rank=1
  from ranked
  where result.week_start=p_week_start
    and result.profile_id=ranked.profile_id;

  update private.football_weekly_auction_weeks
  set finalized_at=p_at
  where week_start=p_week_start;
end;
$$;
revoke all on function private.finalize_football_weekly_superteam_week(date,timestamptz)
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_final_payload(
  p_week_start date,p_profile_id uuid
)
returns jsonb
language sql
stable security definer
set search_path=''
as $$
  with standings as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'rank',result.final_rank,
      'profile_id',result.profile_id,
      'display_name',profile.display_name,
      'final_score',result.final_score,
      'scoring_cost',result.scoring_cost,
      'owned_count',result.owned_count,
      'is_winner',result.is_winner,
      'is_current_user',result.profile_id=p_profile_id
    ) order by result.final_rank,profile.display_name),'[]'::jsonb) as payload
    from private.football_weekly_auction_results result
    join public.profiles profile on profile.id=result.profile_id
    where result.week_start=p_week_start
  ),
  collection as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'item_reference',authority.item_reference,
      'display_name',authority.display_name,
      'school',authority.school,
      'season_year',authority.season_year,
      'group_key',authority.group_key,
      'roster_slot',award.roster_slot,
      'grade',authority.hidden_grade,
      'winning_bid',award.winning_bid,
      'counts',true
    ) order by array_position(array['QB','RB','WR','Flex','Front Seven','Secondary','Head Coach']::text[],award.roster_slot)),'[]'::jsonb) as payload
    from private.football_weekly_auction_awards award
    join private.football_weekly_auction_board board
      on board.week_start=award.week_start
     and board.day_index=award.day_index
     and board.slot=award.slot
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=board.season_reference
    where award.week_start=p_week_start
      and award.profile_id=p_profile_id
      and award.roster_slot is not null
  ),
  all_items as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'day_index',board.day_index,
      'slot',board.slot,
      'item_reference',authority.item_reference,
      'display_name',authority.display_name,
      'school',authority.school,
      'season_year',authority.season_year,
      'group_key',authority.group_key,
      'eligible_slots',authority.eligible_slots,
      'grade',authority.hidden_grade,
      'winning_bid',award.winning_bid,
      'roster_slot',award.roster_slot,
      'winner_profile_id',award.profile_id,
      'winner_display_name',profile.display_name
    ) order by board.day_index,board.slot),'[]'::jsonb) as payload
    from private.football_weekly_auction_board board
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=board.season_reference
    left join private.football_weekly_auction_awards award
      on award.week_start=board.week_start
     and award.day_index=board.day_index
     and award.slot=board.slot
    left join public.profiles profile on profile.id=award.profile_id
    where board.week_start=p_week_start
      and board.slot<=private.football_weekly_auction_cards_for_day(
        board.week_start,board.day_index
      )
  ),
  mine as (
    select to_jsonb(result) as payload
    from private.football_weekly_auction_results result
    where result.week_start=p_week_start and result.profile_id=p_profile_id
  )
  select jsonb_build_object(
    'subject_key','cfb-superteam',
    'week_start',p_week_start,
    'standings',standings.payload,
    'collection',collection.payload,
    'all_teams',all_items.payload,
    'my_result',coalesce(mine.payload,'{}'::jsonb)
  )
  from standings,collection,all_items
  left join mine on true;
$$;
revoke all on function private.football_weekly_superteam_final_payload(date,uuid)
  from public,anon,authenticated;

create or replace function private.get_my_football_weekly_superteam(
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
  v_day_index integer;
  v_card_count integer;
  v_previous_week date;
  v_bankroll integer;
  v_owned integer;
  v_submitted boolean;
  v_show_intro boolean;
  v_previous_final jsonb:=null;
  v_cards jsonb;
  v_bids jsonb;
  v_prior_results jsonb:='[]'::jsonb;
  v_collection jsonb;
  v_tie_priority jsonb;
  v_open_slots integer;
  v_max_commit integer;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day_index:=private.football_weekly_auction_day_index(p_at,v_week_start);
  v_card_count:=private.football_weekly_auction_cards_for_day(v_week_start,v_day_index);
  v_previous_week:=v_week_start-7;

  if not exists(
    select 1 from private.football_weekly_auction_participants participant
    where participant.week_start=v_week_start and participant.profile_id=v_profile
  ) then
    return jsonb_build_object(
      'available',false,
      'subject_key','cfb-superteam',
      'locked_this_week',true,
      'week_start',v_week_start,
      'eligible_week_start',v_week_start+7
    );
  end if;

  if exists(
    select 1 from private.football_weekly_auction_results result
    where result.week_start=v_previous_week and result.profile_id=v_profile
  ) and not exists(
    select 1 from private.football_weekly_auction_final_views view_row
    where view_row.week_start=v_previous_week and view_row.profile_id=v_profile
  ) then
    v_previous_final:=private.football_weekly_auction_final_payload(v_previous_week,v_profile);
  end if;

  select
    50-coalesce(sum(award.winning_bid),0)::integer,
    count(award.roster_slot)::integer
  into v_bankroll,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=v_week_start
    and award.profile_id=v_profile
    and award.roster_slot is not null;

  v_open_slots:=greatest(7-v_owned,0);
  v_max_commit:=greatest(v_bankroll-greatest(v_open_slots-2,0),0);

  select exists(
    select 1 from private.football_weekly_auction_daily_entries entry
    where entry.week_start=v_week_start
      and entry.day_index=v_day_index
      and entry.profile_id=v_profile
  ) into v_submitted;

  select not exists(
    select 1 from private.football_weekly_auction_daily_entries entry
    where entry.week_start=v_week_start and entry.profile_id=v_profile
  ) into v_show_intro;

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
  where board.week_start=v_week_start
    and board.day_index=v_day_index
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
    where bid.week_start=v_week_start
      and bid.day_index=v_day_index
      and bid.profile_id=v_profile
      and bid.slot<=v_card_count
  ) source;

  if v_day_index>1 then
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
            where entry.week_start=v_week_start
              and entry.day_index=v_day_index-1
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
      where board.week_start=v_week_start
        and board.day_index=v_day_index-1
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
  ) order by array_position(array['QB','RB','WR','Flex','Front Seven','Secondary','Head Coach']::text[],award.roster_slot)),'[]'::jsonb)
  into v_collection
  from private.football_weekly_auction_awards award
  join private.football_weekly_auction_board board
    on board.week_start=award.week_start
   and board.day_index=award.day_index
   and board.slot=award.slot
  join private.cfb_superteam_v1_authority authority
    on authority.item_reference=board.season_reference
  where award.week_start=v_week_start
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
      private.football_weekly_superteam_tie_rank(v_week_start,v_day_index,participant.profile_id) as tie_rank
    from private.football_weekly_auction_participants participant
    join public.profiles profile on profile.id=participant.profile_id
    where participant.week_start=v_week_start
  ) ranked;

  return jsonb_build_object(
    'available',true,
    'subject_key','cfb-superteam',
    'week_start',v_week_start,
    'week_end',v_week_start+6,
    'day_index',v_day_index,
    'bankroll',v_bankroll,
    'owned_count',v_owned,
    'reserve_floor',v_open_slots,
    'max_commit',v_max_commit,
    'submitted_today',v_submitted,
    'show_intro',v_show_intro,
    'teams',v_cards,
    'bids',v_bids,
    'prior_results',v_prior_results,
    'collection',v_collection,
    'tie_priority',v_tie_priority,
    'previous_final',v_previous_final
  );
end;
$$;
revoke all on function private.get_my_football_weekly_superteam(timestamptz)
  from public,anon,authenticated;

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
  if v_profile is null then raise exception 'sign in required'; end if;
  if jsonb_typeof(p_bids)<>'object' then raise exception 'bids must be an object'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day_index:=private.football_weekly_auction_day_index(p_at,v_week_start);
  v_card_count:=private.football_weekly_auction_cards_for_day(v_week_start,v_day_index);

  if not exists(
    select 1 from private.football_weekly_auction_participants participant
    where participant.week_start=v_week_start and participant.profile_id=v_profile
  ) then
    raise exception 'Weekly Auction field is locked or full for this week';
  end if;

  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start=v_week_start and day_index=v_day_index;

  if v_lock_at is null or p_at>=v_lock_at then
    raise exception 'Today''s Weekly Auction bids are locked';
  end if;

  select
    50-coalesce(sum(award.winning_bid),0)::integer,
    count(award.roster_slot)::integer
  into v_bankroll,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=v_week_start
    and award.profile_id=v_profile
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
    where board.week_start=v_week_start
      and board.day_index=v_day_index
      and board.slot=v_slot;

    if v_item_reference is null then
      raise exception 'CFB Superteam board is incomplete';
    end if;

    if private.football_weekly_superteam_assignment_slot(
      v_week_start,v_profile,v_item_reference
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
    v_week_start,v_day_index,v_profile,p_at,p_at
  )
  on conflict(week_start,day_index,profile_id)
  do update set updated_at=excluded.updated_at;

  delete from private.football_weekly_superteam_bid_preferences
  where week_start=v_week_start and day_index=v_day_index and profile_id=v_profile;

  for v_slot in 1..v_card_count loop
    v_entry:=p_bids->v_slot::text;
    v_bid:=coalesce((v_entry->>'amount')::integer,0);
    v_priority:=coalesce((v_entry->>'priority')::integer,v_slot);

    insert into private.football_weekly_auction_bids(
      week_start,day_index,profile_id,slot,amount,updated_at
    ) values (
      v_week_start,v_day_index,v_profile,v_slot,v_bid,p_at
    )
    on conflict(week_start,day_index,profile_id,slot)
    do update set amount=excluded.amount,updated_at=excluded.updated_at;

    insert into private.football_weekly_superteam_bid_preferences(
      week_start,day_index,profile_id,slot,claim_rank
    ) values (
      v_week_start,v_day_index,v_profile,v_slot,v_priority
    );
  end loop;

  return public.get_my_football_weekly_auction(p_at);
end;
$$;
revoke all on function private.submit_my_football_weekly_superteam_bids(jsonb,timestamptz)
  from public,anon,authenticated;

create or replace function private.maintain_football_weekly_auction(
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_week_start date;
  v_subject text;
  v_join_lock_at timestamptz;
  v_due record;
  v_week record;
begin
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then return; end if;

  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.materialize_football_weekly_auction_week(v_week_start);
  perform private.materialize_football_weekly_auction_participants(v_week_start);

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  select min(board.lock_at) into v_join_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=v_week_start
    and board.day_index=case when v_subject='cfb-superteam' then 4 else 1 end;

  if v_join_lock_at is null then
    raise exception 'Weekly Auction join boundary is incomplete';
  end if;

  if p_at>=v_join_lock_at then
    update private.football_weekly_auction_weeks week
    set field_locked_at=coalesce(week.field_locked_at,v_join_lock_at)
    where week.week_start=v_week_start;
  end if;

  for v_due in
    select board.week_start,board.day_index
    from private.football_weekly_auction_board board
    group by board.week_start,board.day_index
    having min(board.lock_at)<=p_at
       and (
         select count(*)
         from private.football_weekly_auction_awards award
         where award.week_start=board.week_start
           and award.day_index=board.day_index
       ) < private.football_weekly_auction_cards_for_day(
         board.week_start,board.day_index
       )
    order by board.week_start,board.day_index
  loop
    perform private.resolve_football_weekly_auction_day(
      v_due.week_start,v_due.day_index,p_at
    );
  end loop;

  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start=week.week_start
      )=private.football_weekly_auction_cards_per_week(week.week_start)
  loop
    perform private.finalize_football_weekly_auction_week(v_week.week_start,p_at);
  end loop;
end;
$$;
revoke all on function private.maintain_football_weekly_auction(timestamptz)
  from public,anon,authenticated;

create or replace function public.football_weekly_auction_daily_gate(
  p_profile_id uuid,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_week_start date;
  v_day_index integer;
  v_required boolean;
  v_field_locked boolean;
  v_subject text;
  v_capacity integer:=null;
  v_field_size integer:=null;
begin
  if p_profile_id is null then raise exception 'profile required'; end if;
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then
    return jsonb_build_object('required',false,'available',false);
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day_index:=private.football_weekly_auction_day_index(p_at,v_week_start);
  perform private.ensure_football_weekly_auction_participant(
    v_week_start,p_profile_id,p_at
  );

  select week.field_locked_at is not null,week.subject_key
  into v_field_locked,v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=v_week_start;

  if v_subject='cfb-superteam' then
    v_capacity:=private.football_weekly_superteam_join_capacity(v_week_start,p_at);
    select count(*)::integer into v_field_size
    from private.football_weekly_auction_participants
    where week_start=v_week_start;
  end if;

  if not exists(
    select 1 from private.football_weekly_auction_participants participant
    where participant.week_start=v_week_start
      and participant.profile_id=p_profile_id
  ) then
    return jsonb_build_object(
      'required',false,
      'available',false,
      'field_locked',v_field_locked,
      'capacity_reached',coalesce(v_capacity is not null and v_field_size>=v_capacity,false),
      'week_start',v_week_start,
      'day_index',v_day_index,
      'eligible_week_start',v_week_start+7
    );
  end if;

  select not exists(
    select 1 from private.football_weekly_auction_daily_entries entry
    where entry.week_start=v_week_start
      and entry.day_index=v_day_index
      and entry.profile_id=p_profile_id
  ) into v_required;

  return jsonb_build_object(
    'required',v_required,
    'available',true,
    'field_locked',v_field_locked,
    'week_start',v_week_start,
    'day_index',v_day_index
  );
end;
$$;
revoke all on function public.football_weekly_auction_daily_gate(uuid,timestamptz)
  from public,anon,authenticated;
grant execute on function public.football_weekly_auction_daily_gate(uuid,timestamptz)
  to service_role;

create or replace function public.get_my_football_weekly_superteam_preview()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_current_week date;
  v_week_start date;
  v_subject text;
  v_card_count integer;
  v_cards jsonb;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  if not public.is_pick_control_owner(v_profile)
    or not exists(
      select 1 from public.profiles profile
      where profile.id=v_profile and profile.normalized_name='CODY'
    )
  then
    raise exception 'owner preview unavailable';
  end if;

  v_current_week:=private.football_weekly_auction_week_start(now());
  v_week_start:=v_current_week+7;
  v_subject:=private.football_weekly_auction_subject_for_week(v_week_start);

  if v_subject<>'cfb-superteam' then
    return jsonb_build_object(
      'available',false,
      'subject_key',v_subject,
      'week_start',v_week_start
    );
  end if;

  perform private.materialize_football_weekly_auction_week(v_week_start);
  v_card_count:=private.football_weekly_auction_cards_for_day(v_week_start,1);

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
  where board.week_start=v_week_start
    and board.day_index=1
    and board.slot<=v_card_count;

  if jsonb_array_length(v_cards)<>8 then
    raise exception 'CFB Superteam owner preview must expose the eight-card Day 1 base board';
  end if;

  return jsonb_build_object(
    'available',true,
    'subject_key','cfb-superteam',
    'week_start',v_week_start,
    'week_end',v_week_start+6,
    'day_index',1,
    'bankroll',50,
    'owned_count',0,
    'reserve_floor',7,
    'max_commit',45,
    'submitted_today',false,
    'show_intro',false,
    'teams',v_cards,
    'bids','{}'::jsonb,
    'prior_results','[]'::jsonb,
    'collection','[]'::jsonb,
    'tie_priority','[]'::jsonb,
    'previous_final',null
  );
end;
$$;
revoke all on function public.get_my_football_weekly_superteam_preview()
  from public,anon;
grant execute on function public.get_my_football_weekly_superteam_preview()
  to authenticated;

-- Extend the already-previewed Sep. 29 week by adding reserve cards only.
-- Slots 1-8 are never deleted or rerolled.
select private.materialize_football_weekly_superteam_week(date '2026-09-29');

do $cfb_superteam_elastic_contract$
declare
  v_capacity integer;
begin
  if (select count(*) from private.cfb_superteam_week_authority where week_start=date '2026-09-29')<>84
    or (select count(*) from private.football_weekly_auction_board where week_start=date '2026-09-29')<>84
  then
    raise exception 'Sep. 29 CFB Superteam must prebuild 84 base-plus-reserve cards';
  end if;

  if exists(
    select day_index
    from private.football_weekly_auction_board
    where week_start=date '2026-09-29'
    group by day_index
    having count(*)<>12
  ) then
    raise exception 'CFB Superteam reserve materialization must keep 12 cards per day';
  end if;

  if private.football_weekly_superteam_cards_for_field(5)<>8
    or private.football_weekly_superteam_cards_for_field(6)<>9
    or private.football_weekly_superteam_cards_for_field(8)<>10
    or private.football_weekly_superteam_cards_for_field(9)<>11
    or private.football_weekly_superteam_cards_for_field(10)<>12
  then
    raise exception 'CFB Superteam elastic field thresholds drifted';
  end if;

  v_capacity:=private.football_weekly_superteam_join_capacity(
    date '2026-09-29',
    timestamptz '2026-09-29 12:00:00-05'
  );
  if v_capacity<>11 then
    raise exception 'CFB Superteam Day 1 elastic capacity must safely support 11 entrants, got %',v_capacity;
  end if;

  if private.football_weekly_auction_cards_for_day(date '2026-09-29',1)<>8 then
    raise exception 'CFB Superteam Day 1 base board must stay at eight visible cards';
  end if;
end;
$cfb_superteam_elastic_contract$;
