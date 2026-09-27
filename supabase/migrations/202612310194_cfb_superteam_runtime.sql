-- CFB Superteam Weekly Auction runtime.
-- Sep 29 launch: 7 roster slots, $50 bankroll, 8 candidates/day,
-- max 2 auction wins/day, ranked conditional claims, $1/open-slot reserve,
-- no upgrades, and worst-eligible end-week completion fallback.

create or replace function private.football_weekly_auction_subject_for_week(p_week_start date)
returns text
language sql
stable security definer
set search_path=''
as $$
  with week_index as (
    select greatest(((p_week_start-date '2026-09-15')/7),0)::integer as value
  ),
  lane as (
    select
      case when mod(value,2)=0 then 'CFB' else 'NFL' end as competition_level,
      case when mod(value,2)=0 then value/2 else (value-1)/2 end as lane_index
    from week_index
  ),
  eligible as (
    select
      subject.subject_key,
      row_number() over(order by subject.rotation_order,subject.subject_key)::integer as position,
      count(*) over()::integer as subject_count,
      lane.lane_index
    from private.football_weekly_auction_subjects subject
    cross join lane
    where subject.is_active
      and subject.eligible_from<=p_week_start
      and subject.competition_level=lane.competition_level
  )
  select subject_key
  from eligible
  where position=1+mod(lane_index,subject_count)
  limit 1;
$$;
revoke all on function private.football_weekly_auction_subject_for_week(date)
  from public,anon,authenticated;

create or replace function private.football_weekly_auction_cards_per_day(p_week_start date)
returns integer
language sql
stable security definer
set search_path=''
as $$
  select case week.subject_key
    when 'cfb-superteam' then 8
    when 'nfl-build-qb' then 4
    else 3
  end
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;
$$;
revoke all on function private.football_weekly_auction_cards_per_day(date)
  from public,anon,authenticated;

create or replace function private.football_weekly_auction_cards_per_week(p_week_start date)
returns integer
language sql
stable security definer
set search_path=''
as $$
  select private.football_weekly_auction_cards_per_day(p_week_start)*7;
$$;
revoke all on function private.football_weekly_auction_cards_per_week(date)
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_slot_for_group(
  p_week_start date,
  p_profile_id uuid,
  p_candidate_group text
)
returns text
language plpgsql
stable security definer
set search_path=''
as $$
declare
  v_has_qb boolean;
  v_has_rb boolean;
  v_has_wr boolean;
  v_has_flex boolean;
  v_has_front_seven boolean;
  v_has_secondary boolean;
  v_has_head_coach boolean;
begin
  select
    bool_or(award.roster_slot='QB'),
    bool_or(award.roster_slot='RB'),
    bool_or(award.roster_slot='WR'),
    bool_or(award.roster_slot='Flex'),
    bool_or(award.roster_slot='Front Seven'),
    bool_or(award.roster_slot='Secondary'),
    bool_or(award.roster_slot='Head Coach')
  into
    v_has_qb,v_has_rb,v_has_wr,v_has_flex,
    v_has_front_seven,v_has_secondary,v_has_head_coach
  from private.football_weekly_auction_awards award
  where award.week_start=p_week_start
    and award.profile_id=p_profile_id;

  if p_candidate_group='QB' then
    return case when not coalesce(v_has_qb,false) then 'QB' else null end;
  elsif p_candidate_group='RB' then
    if not coalesce(v_has_rb,false) then return 'RB'; end if;
    return case when not coalesce(v_has_flex,false) then 'Flex' else null end;
  elsif p_candidate_group='WR' then
    if not coalesce(v_has_wr,false) then return 'WR'; end if;
    return case when not coalesce(v_has_flex,false) then 'Flex' else null end;
  elsif p_candidate_group='TE' then
    return case when not coalesce(v_has_flex,false) then 'Flex' else null end;
  elsif p_candidate_group='Front Seven' then
    return case when not coalesce(v_has_front_seven,false) then 'Front Seven' else null end;
  elsif p_candidate_group='Secondary' then
    return case when not coalesce(v_has_secondary,false) then 'Secondary' else null end;
  elsif p_candidate_group='Head Coach' then
    return case when not coalesce(v_has_head_coach,false) then 'Head Coach' else null end;
  end if;
  return null;
end;
$$;
revoke all on function private.football_weekly_superteam_slot_for_group(date,uuid,text)
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_waiver_rank(
  p_week_start date,
  p_profile_id uuid,
  p_day_index integer
)
returns integer
language sql
stable security definer
set search_path=''
as $$
  with ordered as (
    select
      participant.profile_id,
      row_number() over(
        order by md5(p_week_start::text || ':' || participant.profile_id::text),participant.profile_id
      )::integer-1 as base_rank,
      count(*) over()::integer as player_count
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
  )
  select case when player_count>0
    then 1+mod(base_rank-(greatest(p_day_index,1)-1)+(player_count*16),player_count)
    else 1
  end
  from ordered
  where profile_id=p_profile_id;
$$;
revoke all on function private.football_weekly_superteam_waiver_rank(date,uuid,integer)
  from public,anon,authenticated;

create or replace function private.materialize_football_weekly_superteam_week(p_week_start date)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_existing integer;
  v_day integer;
  v_slot integer;
  v_group text;
  v_groups text[];
  v_extra text;
  v_item text;
  v_lock_at timestamptz;
begin
  if extract(isodow from p_week_start)<>2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key,rules_version)
  values(p_week_start,'cfb-superteam','cfb-superteam-2026-09-v1')
  on conflict(week_start) do nothing;

  if (select subject_key from private.football_weekly_auction_weeks where week_start=p_week_start)<>'cfb-superteam' then
    raise exception 'CFB Superteam materializer requires a CFB Superteam week';
  end if;

  select count(*) into v_existing
  from private.football_weekly_auction_board
  where week_start=p_week_start;

  if v_existing=56 then return; end if;
  if v_existing<>0 then
    raise exception 'CFB Superteam week already has a partial board';
  end if;

  -- Launch Day 1 is intentionally curated from approved calibration anchors.
  if p_week_start=date '2026-09-29' then
    v_lock_at:=((p_week_start+1)::timestamp at time zone 'America/Chicago');
    insert into private.football_weekly_auction_board(
      week_start,day_index,theme,hidden_shape,slot,season_reference,lock_at,trait
    ) values
      (p_week_start,1,'CFB','Standard',1,'cfb-superteam-qb-vince-young-2005',v_lock_at,null),
      (p_week_start,1,'CFB','Standard',2,'cfb-superteam-rb-bijan-robinson-2022',v_lock_at,null),
      (p_week_start,1,'CFB','Standard',3,'cfb-superteam-wr-ceedee-lamb-2019',v_lock_at,null),
      (p_week_start,1,'CFB','Standard',4,'cfb-superteam-te-travis-kelce-2012',v_lock_at,null),
      (p_week_start,1,'CFB','Standard',5,'cfb-superteam-front-seven-manti-teo-2012',v_lock_at,null),
      (p_week_start,1,'CFB','Standard',6,'cfb-superteam-secondary-earl-thomas-2009',v_lock_at,null),
      (p_week_start,1,'CFB','Standard',7,'cfb-superteam-head-coach-mike-gundy-2011',v_lock_at,null),
      (p_week_start,1,'CFB','Standard',8,'cfb-superteam-front-seven-brian-burns-2018',v_lock_at,null);
  end if;

  for v_day in 1..7 loop
    if p_week_start=date '2026-09-29' and v_day=1 then continue; end if;

    v_extra:=case v_day
      when 1 then 'Front Seven'
      when 2 then 'Secondary'
      when 3 then 'RB'
      when 4 then 'WR'
      when 5 then 'QB'
      when 6 then 'TE'
      else 'Head Coach'
    end;
    v_groups:=array['QB','RB','WR','TE','Front Seven','Secondary','Head Coach',v_extra];
    v_lock_at:=((p_week_start+v_day)::timestamp at time zone 'America/Chicago');

    for v_slot in 1..8 loop
      v_group:=v_groups[v_slot];
      v_item:=null;

      select item.item_reference
      into v_item
      from private.football_weekly_auction_items item
      where item.subject_key='cfb-superteam'
        and item.board_bucket=v_group
        and not exists(
          select 1
          from private.football_weekly_auction_board prior
          where prior.week_start=p_week_start
            and prior.season_reference=item.item_reference
        )
      order by md5(
        item.item_reference || '|' || p_week_start::text || '|' ||
        v_day::text || '|' || v_slot::text
      ),item.item_reference
      limit 1;

      if v_item is null then
        raise exception 'CFB Superteam pool exhausted for % on Day % slot %',v_group,v_day,v_slot;
      end if;

      insert into private.football_weekly_auction_board(
        week_start,day_index,theme,hidden_shape,slot,season_reference,lock_at,trait
      ) values(
        p_week_start,v_day,'CFB','Standard',v_slot,v_item,v_lock_at,null
      );
    end loop;
  end loop;

  if (select count(*) from private.football_weekly_auction_board where week_start=p_week_start)<>56
    or (select count(distinct season_reference) from private.football_weekly_auction_board where week_start=p_week_start)<>56
    or exists(
      select day_index
      from private.football_weekly_auction_board
      where week_start=p_week_start
      group by day_index
      having count(*)<>8
    )
    or exists(
      select board.day_index
      from private.football_weekly_auction_board board
      join private.football_weekly_auction_items item
        on item.item_reference=board.season_reference
      where board.week_start=p_week_start
      group by board.day_index
      having count(distinct item.board_bucket)<7
    )
  then
    raise exception 'CFB Superteam materializer produced an invalid 56-card week';
  end if;
end;
$$;
revoke all on function private.materialize_football_weekly_superteam_week(date)
  from public,anon,authenticated;

create or replace function private.materialize_football_weekly_auction_week(p_week_start date)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare v_subject text;
begin
  if p_week_start<date '2026-09-15' then return; end if;
  if extract(isodow from p_week_start)<>2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject is null then
    v_subject:=private.football_weekly_auction_subject_for_week(p_week_start);
    if v_subject is null then raise exception 'Football Weekly Auction has no eligible subject'; end if;
    insert into private.football_weekly_auction_weeks(week_start,subject_key)
    values(p_week_start,v_subject)
    on conflict(week_start) do nothing;
    select subject_key into v_subject
    from private.football_weekly_auction_weeks
    where week_start=p_week_start;
  end if;

  if v_subject='cfb-superteam' then
    perform private.materialize_football_weekly_superteam_week(p_week_start);
  elsif v_subject='nfl-build-qb' then
    perform private.materialize_football_weekly_build_qb_week(p_week_start);
  else
    perform private.materialize_football_weekly_auction_week_cfb(p_week_start);
  end if;
end;
$$;
revoke all on function private.materialize_football_weekly_auction_week(date)
  from public,anon,authenticated;

create or replace function private.validate_football_weekly_auction_board_authority()
returns trigger
language plpgsql
set search_path=''
as $$
declare v_subject text;
begin
  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=new.week_start;

  if v_subject='cfb-superteam' then
    if new.trait is not null
      or new.theme<>'CFB'
      or not exists(
        select 1
        from private.football_weekly_auction_items item
        where item.item_reference=new.season_reference
          and item.subject_key='cfb-superteam'
      )
    then
      raise exception 'CFB Superteam board row is outside the locked authority';
    end if;
  elsif v_subject='nfl-build-qb' then
    if new.trait not in ('Arm','Accuracy','Processing','Mobility')
      or new.theme<>'NFL'
      or new.slot<>(case new.trait when 'Arm' then 1 when 'Accuracy' then 2 when 'Processing' then 3 else 4 end)
      or not exists(
        select 1 from private.nfl_build_qb_v2_authority qb
        where qb.item_reference=new.season_reference
      )
    then
      raise exception 'NFL Build a QB Weekly board row is outside the v2 authority';
    end if;
  else
    if new.trait is not null then
      raise exception 'CFB Weekly board rows cannot carry an NFL QB trait';
    end if;
    if new.week_start>=date '2026-09-22' then
      if not exists(
        select 1 from private.cfb_best_teams_v2_authority
        where season_reference=new.season_reference
      ) then
        raise exception 'Weekly Auction v2 board reference is outside the v2 authority';
      end if;
    elsif not exists(
      select 1 from private.draft_room_cfb_best_teams_pool
      where season_reference=new.season_reference
    ) then
      raise exception 'Weekly Auction legacy board reference is outside the legacy authority';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.validate_football_weekly_auction_board_authority()
  from public,anon,authenticated;

create or replace function private.resolve_football_weekly_superteam_day(
  p_week_start date,
  p_day_index integer,
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_lock_at timestamptz;
  v_claim record;
  v_destination text;
  v_bankroll integer;
  v_open_slots integer;
  v_day_wins integer;
  v_rejected text[]:=array[]::text[];
  v_reject_key text;
  v_iterations integer:=0;
begin
  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start=p_week_start and day_index=p_day_index;

  if v_lock_at is null then raise exception 'Weekly Auction day is not materialized'; end if;
  if p_at<v_lock_at then return; end if;

  loop
    v_iterations:=v_iterations+1;
    if v_iterations>512 then
      raise exception 'CFB Superteam resolver exceeded its bounded claim scan';
    end if;

    select
      board.slot,
      board.season_reference,
      item.board_bucket as candidate_group,
      bid.profile_id,
      bid.amount,
      bid.claim_priority
    into v_claim
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_items item
      on item.item_reference=board.season_reference
    join private.football_weekly_auction_bids bid
      on bid.week_start=board.week_start
     and bid.day_index=board.day_index
     and bid.slot=board.slot
    where board.week_start=p_week_start
      and board.day_index=p_day_index
      and bid.amount>0
      and bid.claim_priority is not null
      and exists(
        select 1
        from private.football_weekly_auction_participants participant
        where participant.week_start=p_week_start
          and participant.profile_id=bid.profile_id
      )
      and not exists(
        select 1
        from private.football_weekly_auction_awards award
        where award.week_start=board.week_start
          and award.day_index=board.day_index
          and award.slot=board.slot
      )
      and not ((board.slot::text || ':' || bid.profile_id::text)=any(v_rejected))
    order by
      bid.amount desc,
      bid.claim_priority asc,
      private.football_weekly_superteam_waiver_rank(
        p_week_start,bid.profile_id,p_day_index
      ) asc,
      board.slot,
      bid.profile_id
    limit 1;

    if not found then exit; end if;

    v_reject_key:=v_claim.slot::text || ':' || v_claim.profile_id::text;
    v_destination:=private.football_weekly_superteam_slot_for_group(
      p_week_start,v_claim.profile_id,v_claim.candidate_group
    );

    select count(*)::integer
    into v_day_wins
    from private.football_weekly_auction_awards award
    where award.week_start=p_week_start
      and award.day_index=p_day_index
      and award.profile_id=v_claim.profile_id;

    select
      50-coalesce(sum(award.winning_bid),0)::integer,
      7-count(distinct award.roster_slot)::integer
    into v_bankroll,v_open_slots
    from private.football_weekly_auction_awards award
    where award.week_start=p_week_start
      and award.profile_id=v_claim.profile_id;

    if v_destination is null
      or v_day_wins>=2
      or v_claim.amount>v_bankroll
      or (v_bankroll-v_claim.amount)<greatest(v_open_slots-1,0)
    then
      v_rejected:=array_append(v_rejected,v_reject_key);
      continue;
    end if;

    insert into private.football_weekly_auction_awards(
      week_start,day_index,slot,profile_id,winning_bid,resolved_at,roster_slot,award_source
    ) values(
      p_week_start,p_day_index,v_claim.slot,v_claim.profile_id,
      v_claim.amount,p_at,v_destination,'auction'
    );
  end loop;

  insert into private.football_weekly_auction_awards(
    week_start,day_index,slot,profile_id,winning_bid,resolved_at,roster_slot,award_source
  )
  select board.week_start,board.day_index,board.slot,null,0,p_at,null,'auction'
  from private.football_weekly_auction_board board
  where board.week_start=p_week_start
    and board.day_index=p_day_index
    and not exists(
      select 1
      from private.football_weekly_auction_awards award
      where award.week_start=board.week_start
        and award.day_index=board.day_index
        and award.slot=board.slot
    );
end;
$$;
revoke all on function private.resolve_football_weekly_superteam_day(date,integer,timestamptz)
  from public,anon,authenticated;

create or replace function private.resolve_football_weekly_auction_day(
  p_week_start date,
  p_day_index integer,
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare v_subject text;
begin
  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;
  if v_subject='cfb-superteam' then
    perform private.resolve_football_weekly_superteam_day(p_week_start,p_day_index,p_at);
  elsif v_subject='nfl-build-qb' then
    perform private.resolve_football_weekly_build_qb_day(p_week_start,p_day_index,p_at);
  else
    perform private.resolve_football_weekly_auction_day_cfb(p_week_start,p_day_index,p_at);
  end if;
end;
$$;
revoke all on function private.resolve_football_weekly_auction_day(date,integer,timestamptz)
  from public,anon,authenticated;

create or replace function private.finalize_football_weekly_superteam_week(
  p_week_start date,
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_roster_slot text;
  v_profile uuid;
  v_pick record;
  v_bankroll integer;
begin
  if exists(
    select 1 from private.football_weekly_auction_weeks
    where week_start=p_week_start and finalized_at is not null
  ) then return; end if;

  if (select count(*) from private.football_weekly_auction_awards where week_start=p_week_start)<>56 then
    return;
  end if;

  -- Complete core slots before Flex so RB/WR fallback inventory stays position-safe.
  foreach v_roster_slot in array array[
    'QB','RB','WR','Front Seven','Secondary','Head Coach','Flex'
  ]::text[] loop
    for v_profile in
      select participant.profile_id
      from private.football_weekly_auction_participants participant
      where participant.week_start=p_week_start
      order by private.football_weekly_superteam_waiver_rank(
        p_week_start,participant.profile_id,7
      ),participant.profile_id
    loop
      if exists(
        select 1
        from private.football_weekly_auction_awards award
        where award.week_start=p_week_start
          and award.profile_id=v_profile
          and award.roster_slot=v_roster_slot
      ) then continue; end if;

      select
        award.day_index,
        award.slot,
        item.item_reference,
        item.hidden_grade
      into v_pick
      from private.football_weekly_auction_awards award
      join private.football_weekly_auction_board board
        on board.week_start=award.week_start
       and board.day_index=award.day_index
       and board.slot=award.slot
      join private.football_weekly_auction_items item
        on item.item_reference=board.season_reference
      where award.week_start=p_week_start
        and award.profile_id is null
        and (
          (v_roster_slot='Flex' and item.board_bucket in ('RB','WR','TE'))
          or (v_roster_slot<>'Flex' and item.board_bucket=v_roster_slot)
        )
      order by item.hidden_grade asc,item.item_reference
      limit 1;

      if not found then
        raise exception 'CFB Superteam cannot auto-fill % for profile %',v_roster_slot,v_profile;
      end if;

      select 50-coalesce(sum(award.winning_bid),0)::integer
      into v_bankroll
      from private.football_weekly_auction_awards award
      where award.week_start=p_week_start
        and award.profile_id=v_profile;

      if v_bankroll<1 then
        raise exception 'CFB Superteam reserve failed before auto-fill for profile %',v_profile;
      end if;

      update private.football_weekly_auction_awards award
      set profile_id=v_profile,
          winning_bid=1,
          resolved_at=p_at,
          roster_slot=v_roster_slot,
          award_source='autofill'
      where award.week_start=p_week_start
        and award.day_index=v_pick.day_index
        and award.slot=v_pick.slot
        and award.profile_id is null;

      if not found then
        raise exception 'CFB Superteam auto-fill candidate was concurrently consumed';
      end if;
    end loop;
  end loop;

  if exists(
    select participant.profile_id
    from private.football_weekly_auction_participants participant
    left join private.football_weekly_auction_awards award
      on award.week_start=participant.week_start
     and award.profile_id=participant.profile_id
     and award.roster_slot is not null
    where participant.week_start=p_week_start
    group by participant.profile_id
    having count(distinct award.roster_slot)<>7
  ) then
    raise exception 'CFB Superteam finalization left an incomplete roster';
  end if;

  delete from private.football_weekly_auction_results where week_start=p_week_start;

  insert into private.football_weekly_auction_results(
    week_start,profile_id,owned_count,final_score,scoring_cost,scoring_refs,tie_random
  )
  with participants as (
    select profile_id
    from private.football_weekly_auction_participants
    where week_start=p_week_start
  ),
  owned as (
    select
      award.profile_id,
      award.roster_slot,
      board.season_reference,
      item.hidden_grade,
      award.winning_bid
    from private.football_weekly_auction_awards award
    join private.football_weekly_auction_board board
      on board.week_start=award.week_start
     and board.day_index=award.day_index
     and board.slot=award.slot
    join private.football_weekly_auction_items item
      on item.item_reference=board.season_reference
    where award.week_start=p_week_start
      and award.profile_id is not null
      and award.roster_slot is not null
  ),
  summarized as (
    select
      participant.profile_id,
      count(owned.season_reference)::integer as owned_count,
      case when count(distinct owned.roster_slot)=7
        then round(avg(owned.hidden_grade),2) else null end as final_score,
      case when count(distinct owned.roster_slot)=7
        then sum(owned.winning_bid)::integer else null end as scoring_cost,
      coalesce(
        array_agg(owned.season_reference order by owned.roster_slot)
          filter(where owned.season_reference is not null),
        array[]::text[]
      ) as scoring_refs
    from participants participant
    left join owned on owned.profile_id=participant.profile_id
    group by participant.profile_id
  )
  select p_week_start,profile_id,owned_count,final_score,scoring_cost,scoring_refs,random()
  from summarized;

  with ranked as (
    select
      profile_id,
      row_number() over(
        order by
          (final_score is not null) desc,
          final_score desc nulls last,
          scoring_cost asc nulls last,
          tie_random,
          profile_id
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

create or replace function private.finalize_football_weekly_auction_week(
  p_week_start date,
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare v_subject text;
begin
  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;
  if v_subject='cfb-superteam' then
    perform private.finalize_football_weekly_superteam_week(p_week_start,p_at);
  elsif v_subject='nfl-build-qb' then
    perform private.finalize_football_weekly_build_qb_week(p_week_start,p_at);
  else
    perform private.finalize_football_weekly_auction_week_cfb(p_week_start,p_at);
  end if;
end;
$$;
revoke all on function private.finalize_football_weekly_auction_week(date,timestamptz)
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_final_payload(
  p_week_start date,
  p_profile_id uuid
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
  my_owned as (
    select
      board.season_reference as item_reference,
      item.primary_name as display_name,
      item.secondary_name as school,
      item.season_year as peak_season,
      item.board_bucket as candidate_group,
      award.roster_slot,
      item.hidden_grade as grade,
      award.winning_bid,
      award.award_source
    from private.football_weekly_auction_awards award
    join private.football_weekly_auction_board board
      on board.week_start=award.week_start
     and board.day_index=award.day_index
     and board.slot=award.slot
    join private.football_weekly_auction_items item
      on item.item_reference=board.season_reference
    where award.week_start=p_week_start
      and award.profile_id=p_profile_id
      and award.roster_slot is not null
  ),
  collection as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'item_reference',item_reference,
      'display_name',display_name,
      'school',school,
      'peak_season',peak_season,
      'candidate_group',candidate_group,
      'roster_slot',roster_slot,
      'grade',grade,
      'winning_bid',winning_bid,
      'award_source',award_source,
      'counts',true
    ) order by case roster_slot
      when 'QB' then 1 when 'RB' then 2 when 'WR' then 3 when 'Flex' then 4
      when 'Front Seven' then 5 when 'Secondary' then 6 else 7 end),'[]'::jsonb) as payload
    from my_owned
  ),
  all_items as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'day_index',board.day_index,
      'slot',board.slot,
      'item_reference',board.season_reference,
      'display_name',item.primary_name,
      'school',item.secondary_name,
      'peak_season',item.season_year,
      'candidate_group',item.board_bucket,
      'grade',item.hidden_grade,
      'winning_bid',award.winning_bid,
      'winner_profile_id',award.profile_id,
      'winner_display_name',profile.display_name,
      'roster_slot',award.roster_slot,
      'award_source',award.award_source
    ) order by board.day_index,board.slot),'[]'::jsonb) as payload
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_items item
      on item.item_reference=board.season_reference
    left join private.football_weekly_auction_awards award
      on award.week_start=board.week_start
     and award.day_index=board.day_index
     and award.slot=board.slot
    left join public.profiles profile on profile.id=award.profile_id
    where board.week_start=p_week_start
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

create or replace function private.football_weekly_auction_final_payload(
  p_week_start date,
  p_profile_id uuid
)
returns jsonb
language plpgsql
stable security definer
set search_path=''
as $$
declare v_subject text;
begin
  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;
  if v_subject='cfb-superteam' then
    return private.football_weekly_superteam_final_payload(p_week_start,p_profile_id);
  elsif v_subject='nfl-build-qb' then
    return private.football_weekly_build_qb_final_payload(p_week_start,p_profile_id);
  end if;
  return private.football_weekly_auction_final_payload_cfb(p_week_start,p_profile_id)
    || jsonb_build_object('subject_key',coalesce(v_subject,'cfb-best-teams-since-2000'));
end;
$$;
revoke all on function private.football_weekly_auction_final_payload(date,uuid)
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
  v_previous_week date;
  v_bankroll integer;
  v_owned integer;
  v_open integer;
  v_submitted boolean;
  v_show_intro boolean;
  v_previous_final jsonb:=null;
  v_cards jsonb;
  v_bids jsonb;
  v_priorities jsonb;
  v_prior_results jsonb:='[]'::jsonb;
  v_collection jsonb;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day_index:=private.football_weekly_auction_day_index(p_at,v_week_start);
  v_previous_week:=v_week_start-7;

  if not exists(
    select 1 from private.football_weekly_auction_participants participant
    where participant.week_start=v_week_start and participant.profile_id=v_profile
  ) then
    return jsonb_build_object(
      'available',false,'subject_key','cfb-superteam','locked_this_week',true,
      'week_start',v_week_start,'eligible_week_start',v_week_start+7
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
    count(*) filter(where award.roster_slot is not null)::integer
  into v_bankroll,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=v_week_start and award.profile_id=v_profile;
  v_open:=greatest(7-v_owned,0);

  select exists(
    select 1 from private.football_weekly_auction_daily_entries entry
    where entry.week_start=v_week_start and entry.day_index=v_day_index and entry.profile_id=v_profile
  ) into v_submitted;

  select not exists(
    select 1 from private.football_weekly_auction_daily_entries entry
    where entry.week_start=v_week_start and entry.profile_id=v_profile
  ) into v_show_intro;

  select coalesce(jsonb_agg(jsonb_build_object(
    'slot',board.slot,
    'item_reference',board.season_reference,
    'display_name',item.primary_name,
    'school',item.secondary_name,
    'peak_season',item.season_year,
    'candidate_group',item.board_bucket,
    'lock_at',board.lock_at
  ) order by board.slot),'[]'::jsonb)
  into v_cards
  from private.football_weekly_auction_board board
  join private.football_weekly_auction_items item on item.item_reference=board.season_reference
  where board.week_start=v_week_start and board.day_index=v_day_index;

  select coalesce(jsonb_object_agg(bid.slot::text,bid.amount),'{}'::jsonb)
  into v_bids
  from private.football_weekly_auction_bids bid
  where bid.week_start=v_week_start and bid.day_index=v_day_index and bid.profile_id=v_profile;

  select coalesce(
    jsonb_object_agg(bid.slot::text,bid.claim_priority)
      filter(where bid.claim_priority is not null),
    '{}'::jsonb
  )
  into v_priorities
  from private.football_weekly_auction_bids bid
  where bid.week_start=v_week_start and bid.day_index=v_day_index and bid.profile_id=v_profile;

  if v_day_index>1 then
    select coalesce(jsonb_agg(result_row.payload order by result_row.slot),'[]'::jsonb)
    into v_prior_results
    from (
      select
        board.slot,
        jsonb_build_object(
          'slot',board.slot,
          'item_reference',board.season_reference,
          'display_name',item.primary_name,
          'school',item.secondary_name,
          'peak_season',item.season_year,
          'candidate_group',item.board_bucket,
          'winning_bid',award.winning_bid,
          'winner_profile_id',award.profile_id,
          'winner_display_name',winner.display_name,
          'roster_slot',award.roster_slot,
          'award_source',award.award_source,
          'bids',coalesce((
            select jsonb_agg(jsonb_build_object(
              'profile_id',entry.profile_id,
              'display_name',bidder.display_name,
              'amount',coalesce(bid.amount,0),
              'priority',bid.claim_priority
            ) order by coalesce(bid.amount,0) desc,bid.claim_priority nulls last,bidder.display_name)
            from private.football_weekly_auction_daily_entries entry
            join public.profiles bidder on bidder.id=entry.profile_id
            left join private.football_weekly_auction_bids bid
              on bid.week_start=entry.week_start
             and bid.day_index=entry.day_index
             and bid.profile_id=entry.profile_id
             and bid.slot=board.slot
            where entry.week_start=v_week_start
              and entry.day_index=v_day_index-1
          ),'[]'::jsonb)
        ) as payload
      from private.football_weekly_auction_board board
      join private.football_weekly_auction_items item on item.item_reference=board.season_reference
      join private.football_weekly_auction_awards award
        on award.week_start=board.week_start and award.day_index=board.day_index and award.slot=board.slot
      left join public.profiles winner on winner.id=award.profile_id
      where board.week_start=v_week_start and board.day_index=v_day_index-1
    ) result_row;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'item_reference',board.season_reference,
    'display_name',item.primary_name,
    'school',item.secondary_name,
    'peak_season',item.season_year,
    'candidate_group',item.board_bucket,
    'roster_slot',award.roster_slot,
    'winning_bid',award.winning_bid,
    'award_source',award.award_source
  ) order by case award.roster_slot
    when 'QB' then 1 when 'RB' then 2 when 'WR' then 3 when 'Flex' then 4
    when 'Front Seven' then 5 when 'Secondary' then 6 else 7 end),'[]'::jsonb)
  into v_collection
  from private.football_weekly_auction_awards award
  join private.football_weekly_auction_board board
    on board.week_start=award.week_start and board.day_index=award.day_index and board.slot=award.slot
  join private.football_weekly_auction_items item on item.item_reference=board.season_reference
  where award.week_start=v_week_start
    and award.profile_id=v_profile
    and award.roster_slot is not null;

  return jsonb_build_object(
    'available',true,
    'subject_key','cfb-superteam',
    'week_start',v_week_start,
    'week_end',v_week_start+6,
    'day_index',v_day_index,
    'bankroll',v_bankroll,
    'owned_count',v_owned,
    'reserve_floor',v_open,
    'max_commit',greatest(v_bankroll-greatest(v_open-1,0),0),
    'submitted_today',v_submitted,
    'show_intro',v_show_intro,
    'teams',v_cards,
    'bids',v_bids,
    'claim_priorities',v_priorities,
    'prior_results',v_prior_results,
    'collection',v_collection,
    'previous_final',v_previous_final
  );
end;
$$;
revoke all on function private.get_my_football_weekly_superteam(timestamptz)
  from public,anon,authenticated;

create or replace function private.submit_my_football_weekly_superteam_bids(
  p_bids jsonb,
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
  v_lock_at timestamptz;
  v_bankroll integer;
  v_owned integer;
  v_open integer;
  v_max_claim integer;
  v_slot integer;
  v_bid integer;
  v_priority integer;
  v_group text;
  v_positive integer:=0;
  v_priorities integer[]:=array[]::integer[];
  v_priority_json jsonb;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if jsonb_typeof(p_bids)<>'object' then raise exception 'bids must be an object'; end if;

  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day_index:=private.football_weekly_auction_day_index(p_at,v_week_start);

  if not exists(
    select 1 from private.football_weekly_auction_participants participant
    where participant.week_start=v_week_start and participant.profile_id=v_profile
  ) then
    raise exception 'Weekly Auction field is locked for this week';
  end if;

  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start=v_week_start and day_index=v_day_index;
  if v_lock_at is null or p_at>=v_lock_at then
    raise exception 'Today''s Weekly Auction bids are locked';
  end if;

  select
    50-coalesce(sum(award.winning_bid),0)::integer,
    count(*) filter(where award.roster_slot is not null)::integer
  into v_bankroll,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=v_week_start and award.profile_id=v_profile;

  v_open:=greatest(7-v_owned,0);
  v_max_claim:=greatest(v_bankroll-greatest(v_open-1,0),0);
  v_priority_json:=coalesce(p_bids->'_priorities','{}'::jsonb);

  for v_slot in 1..8 loop
    begin
      v_bid:=coalesce((p_bids->>v_slot::text)::integer,0);
    exception when others then
      raise exception 'Superteam bids must be whole-dollar integers';
    end;
    if v_bid<0 or v_bid>50 then
      raise exception 'Superteam bids must be between $0 and $50';
    end if;

    select item.board_bucket
    into v_group
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_items item on item.item_reference=board.season_reference
    where board.week_start=v_week_start and board.day_index=v_day_index and board.slot=v_slot;
    if v_group is null then raise exception 'CFB Superteam board is incomplete'; end if;

    if v_bid>0 then
      if private.football_weekly_superteam_slot_for_group(v_week_start,v_profile,v_group) is null then
        raise exception 'Your eligible % roster slot is already filled',v_group;
      end if;
      if v_bid>v_max_claim then
        raise exception 'Each claim can be at most $% so $1 stays protected for every open roster spot',v_max_claim;
      end if;
      begin
        v_priority:=(v_priority_json->>v_slot::text)::integer;
      exception when others then
        raise exception 'Every positive Superteam bid needs a whole-number claim priority';
      end;
      if v_priority is null or v_priority<1 or v_priority>8 then
        raise exception 'Every positive Superteam bid needs a claim priority from 1 to 8';
      end if;
      if v_priority=any(v_priorities) then
        raise exception 'Superteam claim priorities must be unique';
      end if;
      v_positive:=v_positive+1;
      v_priorities:=array_append(v_priorities,v_priority);
    end if;
  end loop;

  if v_positive>0 and (
    select array_agg(value order by value) from unnest(v_priorities) value
  ) is distinct from (
    select array_agg(value) from generate_series(1,v_positive) value
  ) then
    raise exception 'Superteam claim priorities must run from 1 through the number of active claims';
  end if;

  insert into private.football_weekly_auction_daily_entries(
    week_start,day_index,profile_id,submitted_at,updated_at
  ) values(v_week_start,v_day_index,v_profile,p_at,p_at)
  on conflict(week_start,day_index,profile_id)
  do update set updated_at=excluded.updated_at;

  delete from private.football_weekly_auction_bids
  where week_start=v_week_start and day_index=v_day_index and profile_id=v_profile;

  for v_slot in 1..8 loop
    v_bid:=coalesce((p_bids->>v_slot::text)::integer,0);
    v_priority:=case when v_bid>0 then (v_priority_json->>v_slot::text)::integer else null end;
    insert into private.football_weekly_auction_bids(
      week_start,day_index,profile_id,slot,amount,updated_at,claim_priority
    ) values(v_week_start,v_day_index,v_profile,v_slot,v_bid,p_at,v_priority);
  end loop;

  return public.get_my_football_weekly_auction(p_at);
end;
$$;
revoke all on function private.submit_my_football_weekly_superteam_bids(jsonb,timestamptz)
  from public,anon,authenticated;

create or replace function public.get_my_football_weekly_auction(
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
  v_subject text;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.ensure_football_weekly_auction_participant(v_week_start,v_profile,p_at);

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject='cfb-superteam' then
    return private.get_my_football_weekly_superteam(p_at);
  elsif v_subject='nfl-build-qb' then
    return private.get_my_football_weekly_build_qb(p_at);
  end if;

  return private.get_my_football_weekly_auction_cfb(p_at)
    || jsonb_build_object('subject_key',coalesce(v_subject,'cfb-best-teams-since-2000'));
end;
$$;
revoke all on function public.get_my_football_weekly_auction(timestamptz)
  from public,anon;
grant execute on function public.get_my_football_weekly_auction(timestamptz)
  to authenticated;

create or replace function public.submit_my_football_weekly_auction_bids(
  p_bids jsonb,
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
  v_subject text;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.ensure_football_weekly_auction_participant(v_week_start,v_profile,p_at);

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject='cfb-superteam' then
    return private.submit_my_football_weekly_superteam_bids(p_bids,p_at);
  elsif v_subject='nfl-build-qb' then
    return private.submit_my_football_weekly_build_qb_bids(p_bids,p_at);
  end if;
  return private.submit_my_football_weekly_auction_bids_cfb(p_bids,p_at);
end;
$$;
revoke all on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  from public,anon;
grant execute on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  to authenticated;

-- Both CFB Weekly formats award the existing +1 Football Daily win.
do $extend_cfb_weekly_bonus$
declare d text; n text;
begin
  d:=pg_get_functiondef('public.get_daily_challenge_standings(text)'::regprocedure);
  n:=replace(
    d,
    'auction_week.subject_key = ''cfb-best-teams-since-2000''',
    'auction_week.subject_key in (''cfb-best-teams-since-2000'',''cfb-superteam'')'
  );
  if n=d then raise exception 'Daily standings CFB Weekly bonus contract drifted'; end if;
  execute n;

  d:=pg_get_functiondef('public.get_my_daily_challenge_weekly_recap(text)'::regprocedure);
  n:=replace(
    d,
    'auction_week.subject_key = ''cfb-best-teams-since-2000''',
    'auction_week.subject_key in (''cfb-best-teams-since-2000'',''cfb-superteam'')'
  );
  n:=replace(
    n,
    'and week.subject_key = ''cfb-best-teams-since-2000''',
    'and week.subject_key in (''cfb-best-teams-since-2000'',''cfb-superteam'')'
  );
  n:=replace(
    n,
    'when ''nfl-build-qb'' then ''NFL Build a QB''',
    'when ''nfl-build-qb'' then ''NFL Build a QB'' when ''cfb-superteam'' then ''CFB Superteam'''
  );
  if position('cfb-superteam' in n)=0 then
    raise exception 'Weekly recap CFB Superteam contract drifted';
  end if;
  execute n;
end;
$extend_cfb_weekly_bonus$;

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
  v_subject:=coalesce(
    (select subject_key from private.football_weekly_auction_weeks where week_start=v_week_start),
    private.football_weekly_auction_subject_for_week(v_week_start)
  );

  if v_subject<>'cfb-superteam' then
    return jsonb_build_object(
      'available',false,'subject_key',v_subject,'week_start',v_week_start
    );
  end if;

  perform private.materialize_football_weekly_superteam_week(v_week_start);

  select coalesce(jsonb_agg(jsonb_build_object(
    'slot',board.slot,
    'item_reference',board.season_reference,
    'display_name',item.primary_name,
    'school',item.secondary_name,
    'peak_season',item.season_year,
    'candidate_group',item.board_bucket,
    'lock_at',board.lock_at
  ) order by board.slot),'[]'::jsonb)
  into v_cards
  from private.football_weekly_auction_board board
  join private.football_weekly_auction_items item on item.item_reference=board.season_reference
  where board.week_start=v_week_start and board.day_index=1;

  if jsonb_array_length(v_cards)<>8 then
    raise exception 'CFB Superteam owner preview did not materialize eight Day 1 cards';
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
    'max_commit',44,
    'submitted_today',false,
    'show_intro',false,
    'teams',v_cards,
    'bids','{}'::jsonb,
    'claim_priorities','{}'::jsonb,
    'prior_results','[]'::jsonb,
    'collection','[]'::jsonb,
    'previous_final',null
  );
end;
$$;
revoke all on function public.get_my_football_weekly_superteam_preview()
  from public,anon;
grant execute on function public.get_my_football_weekly_superteam_preview()
  to authenticated;

-- Materialize the actual Sep 29 week now, but never join/freeze participants.
do $materialize_sep29_superteam$
begin
  if exists(
    select 1
    from private.football_weekly_auction_weeks week
    where week.week_start=date '2026-09-29'
      and week.subject_key<>'cfb-superteam'
  ) then
    if exists(
      select 1 from private.football_weekly_auction_daily_entries where week_start=date '2026-09-29'
      union all
      select 1 from private.football_weekly_auction_awards where week_start=date '2026-09-29'
      union all
      select 1 from private.football_weekly_auction_participants where week_start=date '2026-09-29'
    ) then
      raise exception 'Sep 29 Weekly Auction already has user activity and cannot be repurposed';
    end if;
    delete from private.football_weekly_auction_board where week_start=date '2026-09-29';
    delete from private.football_weekly_auction_weeks where week_start=date '2026-09-29';
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key,rules_version)
  values(date '2026-09-29','cfb-superteam','cfb-superteam-2026-09-v1')
  on conflict(week_start) do update
  set subject_key=excluded.subject_key,
      rules_version=excluded.rules_version;

  perform private.materialize_football_weekly_superteam_week(date '2026-09-29');
end;
$materialize_sep29_superteam$;

do $cfb_superteam_runtime_contract$
declare
  v_subject text;
begin
  if private.football_weekly_auction_subject_for_week(date '2026-09-29')<>'cfb-superteam' then
    raise exception 'Sep 29 must resolve to CFB Superteam';
  end if;
  if private.football_weekly_auction_subject_for_week(date '2026-10-06')<>'nfl-build-qb' then
    raise exception 'Oct 6 must preserve the NFL Build a QB lane';
  end if;

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=date '2026-09-29';
  if v_subject<>'cfb-superteam' then
    raise exception 'Sep 29 materialized under the wrong subject';
  end if;

  if (select count(*) from private.football_weekly_auction_board where week_start=date '2026-09-29')<>56
    or (select count(distinct season_reference) from private.football_weekly_auction_board where week_start=date '2026-09-29')<>56
  then
    raise exception 'Sep 29 CFB Superteam board must contain 56 unique candidates';
  end if;

  if (
    select array_agg(item.primary_name order by board.slot)
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_items item on item.item_reference=board.season_reference
    where board.week_start=date '2026-09-29' and board.day_index=1
  ) is distinct from array[
    'Vince Young','Bijan Robinson','CeeDee Lamb','Travis Kelce',
    'Manti Te’o','Earl Thomas','Mike Gundy','Brian Burns'
  ]::text[] then
    raise exception 'Sep 29 CFB Superteam Day 1 preview board drifted';
  end if;
end;
$cfb_superteam_runtime_contract$;
