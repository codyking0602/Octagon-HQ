-- CFB Superteam Weekly Auction runtime.
-- Reuses the shared Weekly Auction lifecycle while preserving completed CFB Teams
-- and NFL Build a QB history. Five active players is the calibration target, but
-- Day 1 field membership remains opt-in and is never hard-coded.

alter table private.football_weekly_auction_board
  add column if not exists candidate_group text;

alter table private.football_weekly_auction_board
  drop constraint if exists football_weekly_auction_board_slot_check,
  drop constraint if exists football_weekly_auction_board_theme_check,
  drop constraint if exists football_weekly_auction_board_hidden_shape_check;

alter table private.football_weekly_auction_board
  add constraint football_weekly_auction_board_slot_check check (slot between 1 and 8),
  add constraint football_weekly_auction_board_theme_check check (
    theme in ('SEC','Big Ten','Big 12','ACC','Wildcard','NFL','CFB Superteam')
  ),
  add constraint football_weekly_auction_board_hidden_shape_check check (
    hidden_shape in (
      'Wide','Compressed','TopHeavy','MiddleHeavy','Trap','Chaotic',
      'Premium','Standard','Grinder','Chaos','Superteam'
    )
  );

alter table private.football_weekly_auction_board
  drop constraint if exists football_weekly_auction_board_candidate_group_check;
alter table private.football_weekly_auction_board
  add constraint football_weekly_auction_board_candidate_group_check check (
    candidate_group is null
    or candidate_group in ('QB','RB','WR','TE','Front Seven','Secondary','Head Coach')
  );

alter table private.football_weekly_auction_bids
  drop constraint if exists football_weekly_auction_bids_slot_check;
alter table private.football_weekly_auction_bids
  add constraint football_weekly_auction_bids_slot_check check (slot between 1 and 8);

create table if not exists private.football_weekly_superteam_claims (
  week_start date not null,
  day_index integer not null check (day_index between 1 and 7),
  profile_id uuid not null,
  board_slot integer not null check (board_slot between 1 and 8),
  amount integer not null check (amount between 0 and 50),
  roster_slot text not null check (
    roster_slot in ('QB','RB','WR','Flex','Front Seven','Secondary','Head Coach')
  ),
  priority integer not null check (priority between 1 and 8),
  updated_at timestamptz not null default now(),
  primary key(week_start,day_index,profile_id,board_slot),
  unique(week_start,day_index,profile_id,priority),
  foreign key(week_start,profile_id)
    references private.football_weekly_auction_participants(week_start,profile_id)
    on delete cascade
);
revoke all on private.football_weekly_superteam_claims from public,anon,authenticated;

create table if not exists private.football_weekly_superteam_roster (
  week_start date not null,
  profile_id uuid not null,
  roster_slot text not null check (
    roster_slot in ('QB','RB','WR','Flex','Front Seven','Secondary','Head Coach')
  ),
  item_reference text not null references private.cfb_superteam_authority(item_reference) on delete restrict,
  price_paid integer not null check (price_paid between 0 and 50),
  awarded_day integer not null check (awarded_day between 1 and 7),
  source text not null check (source in ('auction','autofill')),
  awarded_at timestamptz not null default now(),
  primary key(week_start,profile_id,roster_slot),
  unique(week_start,item_reference),
  foreign key(week_start,profile_id)
    references private.football_weekly_auction_participants(week_start,profile_id)
    on delete cascade
);
revoke all on private.football_weekly_superteam_roster from public,anon,authenticated;

create table if not exists private.football_weekly_superteam_waiver (
  week_start date not null,
  profile_id uuid not null,
  base_rank integer not null check (base_rank >= 1),
  primary key(week_start,profile_id),
  unique(week_start,base_rank),
  foreign key(week_start,profile_id)
    references private.football_weekly_auction_participants(week_start,profile_id)
    on delete cascade
);
revoke all on private.football_weekly_superteam_waiver from public,anon,authenticated;

create or replace function private.football_weekly_superteam_item_eligible_for_slot(
  p_candidate_group text,
  p_roster_slot text
)
returns boolean
language sql
immutable
set search_path=''
as $$
  select case p_roster_slot
    when 'QB' then p_candidate_group='QB'
    when 'RB' then p_candidate_group='RB'
    when 'WR' then p_candidate_group='WR'
    when 'Flex' then p_candidate_group in ('RB','WR','TE')
    when 'Front Seven' then p_candidate_group='Front Seven'
    when 'Secondary' then p_candidate_group='Secondary'
    when 'Head Coach' then p_candidate_group='Head Coach'
    else false
  end;
$$;
revoke all on function private.football_weekly_superteam_item_eligible_for_slot(text,text)
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_open_slots(
  p_week_start date,
  p_profile_id uuid
)
returns integer
language sql
stable security definer
set search_path=''
as $$
  select 7-count(*)::integer
  from private.football_weekly_superteam_roster roster
  where roster.week_start=p_week_start
    and roster.profile_id=p_profile_id;
$$;
revoke all on function private.football_weekly_superteam_open_slots(date,uuid)
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_bankroll(
  p_week_start date,
  p_profile_id uuid
)
returns integer
language sql
stable security definer
set search_path=''
as $$
  select 50-coalesce(sum(roster.price_paid),0)::integer
  from private.football_weekly_superteam_roster roster
  where roster.week_start=p_week_start
    and roster.profile_id=p_profile_id;
$$;
revoke all on function private.football_weekly_superteam_bankroll(date,uuid)
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_daily_waiver_rank(
  p_week_start date,
  p_day_index integer,
  p_profile_id uuid
)
returns integer
language sql
stable security definer
set search_path=''
as $$
  with field as (
    select count(*)::integer as n
    from private.football_weekly_superteam_waiver
    where week_start=p_week_start
  ),
  seeded as (
    select waiver.base_rank,field.n
    from private.football_weekly_superteam_waiver waiver
    cross join field
    where waiver.week_start=p_week_start
      and waiver.profile_id=p_profile_id
  )
  select case
    when n<=0 then 999
    else 1+mod(base_rank-1-(p_day_index-1)+(n*20),n)
  end
  from seeded;
$$;
revoke all on function private.football_weekly_superteam_daily_waiver_rank(date,integer,uuid)
  from public,anon,authenticated;

create or replace function private.materialize_football_weekly_superteam_day(
  p_week_start date,
  p_day_index integer
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_group text;
  v_extra_group text;
  v_slot integer:=0;
  v_existing integer;
  v_pick private.cfb_superteam_authority;
  v_lock_at timestamptz;
begin
  if p_day_index not between 1 and 7 then
    raise exception 'CFB Superteam day index must be 1-7';
  end if;
  if extract(isodow from p_week_start)<>2 then
    raise exception 'CFB Superteam week must start Tuesday';
  end if;
  if not exists(
    select 1 from private.football_weekly_auction_weeks week
    where week.week_start=p_week_start
      and week.subject_key='cfb-superteam'
  ) then
    raise exception 'CFB Superteam day requires a Superteam week';
  end if;

  select count(*) into v_existing
  from private.football_weekly_auction_board board
  where board.week_start=p_week_start
    and board.day_index=p_day_index;

  if v_existing=8 then return; end if;
  if v_existing<>0 then
    raise exception 'CFB Superteam day already has a partial board';
  end if;

  v_lock_at:=((p_week_start+p_day_index)::timestamp at time zone 'America/Chicago');

  foreach v_group in array array[
    'QB','RB','WR','TE','Front Seven','Secondary','Head Coach'
  ]::text[]
  loop
    select authority.*
    into v_pick
    from private.cfb_superteam_authority authority
    where authority.candidate_group=v_group
      and not exists(
        select 1
        from private.football_weekly_auction_board used
        where used.week_start=p_week_start
          and used.season_reference=authority.item_reference
      )
    order by random()
    limit 1;

    if v_pick.item_reference is null then
      raise exception 'CFB Superteam exhausted % pool',v_group;
    end if;

    v_slot:=v_slot+1;
    insert into private.football_weekly_auction_board(
      week_start,day_index,theme,hidden_shape,slot,season_reference,lock_at,trait,candidate_group
    ) values (
      p_week_start,p_day_index,'CFB Superteam','Superteam',v_slot,
      v_pick.item_reference,v_lock_at,null,v_group
    );
  end loop;

  -- The eighth card is need-responsive. Flex pressure is shared across RB/WR/TE.
  -- Before anybody has joined Day 1, all groups tie and the extra is naturally random.
  with field as (
    select count(*)::numeric as n
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
  ),
  filled as (
    select
      count(*) filter(where roster_slot='QB')::numeric as qb,
      count(*) filter(where roster_slot='RB')::numeric as rb,
      count(*) filter(where roster_slot='WR')::numeric as wr,
      count(*) filter(where roster_slot='Flex')::numeric as flex,
      count(*) filter(where roster_slot='Front Seven')::numeric as front_seven,
      count(*) filter(where roster_slot='Secondary')::numeric as secondary,
      count(*) filter(where roster_slot='Head Coach')::numeric as head_coach
    from private.football_weekly_superteam_roster roster
    where roster.week_start=p_week_start
  ),
  demand as (
    select 'QB'::text as group_name, greatest(field.n-filled.qb,0) as score from field,filled
    union all
    select 'RB',greatest(field.n-filled.rb,0)+(greatest(field.n-filled.flex,0)/3.0) from field,filled
    union all
    select 'WR',greatest(field.n-filled.wr,0)+(greatest(field.n-filled.flex,0)/3.0) from field,filled
    union all
    select 'TE',greatest(field.n-filled.flex,0) from field,filled
    union all
    select 'Front Seven',greatest(field.n-filled.front_seven,0) from field,filled
    union all
    select 'Secondary',greatest(field.n-filled.secondary,0) from field,filled
    union all
    select 'Head Coach',greatest(field.n-filled.head_coach,0) from field,filled
  )
  select demand.group_name
  into v_extra_group
  from demand
  order by demand.score desc,random()
  limit 1;

  select authority.*
  into v_pick
  from private.cfb_superteam_authority authority
  where authority.candidate_group=v_extra_group
    and not exists(
      select 1
      from private.football_weekly_auction_board used
      where used.week_start=p_week_start
        and used.season_reference=authority.item_reference
    )
  order by random()
  limit 1;

  if v_pick.item_reference is null then
    raise exception 'CFB Superteam exhausted extra % pool',v_extra_group;
  end if;

  insert into private.football_weekly_auction_board(
    week_start,day_index,theme,hidden_shape,slot,season_reference,lock_at,trait,candidate_group
  ) values (
    p_week_start,p_day_index,'CFB Superteam','Superteam',8,
    v_pick.item_reference,v_lock_at,null,v_extra_group
  );

  if (
    select count(*)
    from private.football_weekly_auction_board board
    where board.week_start=p_week_start
      and board.day_index=p_day_index
  )<>8 then
    raise exception 'CFB Superteam day did not materialize eight cards';
  end if;
end;
$$;
revoke all on function private.materialize_football_weekly_superteam_day(date,integer)
  from public,anon,authenticated;

create or replace function private.materialize_football_weekly_superteam_week(
  p_week_start date
)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if extract(isodow from p_week_start)<>2 then
    raise exception 'CFB Superteam week must start Tuesday';
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(p_week_start,'cfb-superteam')
  on conflict(week_start) do nothing;

  if (
    select week.subject_key
    from private.football_weekly_auction_weeks week
    where week.week_start=p_week_start
  )<>'cfb-superteam' then
    raise exception 'CFB Superteam materializer requires a Superteam week';
  end if;

  -- Future weeks reveal/materialize only Day 1 for owner preview. Later days
  -- materialize lazily after preceding results so the eighth card can respond
  -- to actual unfilled roster pressure.
  perform private.materialize_football_weekly_superteam_day(p_week_start,1);
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

  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;

  if v_subject is null then
    v_subject:=private.football_weekly_auction_subject_for_week(p_week_start);
    if v_subject is null then
      raise exception 'Football Weekly Auction has no eligible subject';
    end if;
    insert into private.football_weekly_auction_weeks(week_start,subject_key)
    values(p_week_start,v_subject)
    on conflict(week_start) do nothing;
    select week.subject_key into v_subject
    from private.football_weekly_auction_weeks week
    where week.week_start=p_week_start;
  end if;

  if v_subject='nfl-build-qb' then
    perform private.materialize_football_weekly_build_qb_week(p_week_start);
  elsif v_subject='cfb-superteam' then
    perform private.materialize_football_weekly_superteam_week(p_week_start);
  else
    perform private.materialize_football_weekly_auction_week_cfb(p_week_start);
  end if;
end;
$$;
revoke all on function private.materialize_football_weekly_auction_week(date)
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

create or replace function private.validate_football_weekly_auction_board_authority()
returns trigger
language plpgsql
set search_path=''
as $$
declare v_subject text;
begin
  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=new.week_start;

  if v_subject='nfl-build-qb' then
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
  elsif v_subject='cfb-superteam' then
    if new.trait is not null
      or new.theme<>'CFB Superteam'
      or new.candidate_group is null
      or not exists(
        select 1
        from private.cfb_superteam_authority authority
        where authority.item_reference=new.season_reference
          and authority.candidate_group=new.candidate_group
      )
    then
      raise exception 'CFB Superteam board row is outside Superteam authority';
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

create or replace function private.football_weekly_superteam_seed_waiver(
  p_week_start date
)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if exists(
    select 1
    from private.football_weekly_superteam_waiver waiver
    where waiver.week_start=p_week_start
  ) then
    return;
  end if;

  insert into private.football_weekly_superteam_waiver(week_start,profile_id,base_rank)
  select
    p_week_start,
    participant.profile_id,
    row_number() over(order by random(),participant.profile_id)::integer
  from private.football_weekly_auction_participants participant
  where participant.week_start=p_week_start;
end;
$$;
revoke all on function private.football_weekly_superteam_seed_waiver(date)
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_autofill(
  p_week_start date,
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_participant record;
  v_slot text;
  v_pick private.cfb_superteam_authority;
begin
  for v_participant in
    select participant.profile_id
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
    order by participant.profile_id
  loop
    foreach v_slot in array array[
      'Head Coach','Secondary','Front Seven','QB','RB','WR','Flex'
    ]::text[]
    loop
      if exists(
        select 1
        from private.football_weekly_superteam_roster roster
        where roster.week_start=p_week_start
          and roster.profile_id=v_participant.profile_id
          and roster.roster_slot=v_slot
      ) then
        continue;
      end if;

      if private.football_weekly_superteam_bankroll(p_week_start,v_participant.profile_id)<1 then
        raise exception 'CFB Superteam reserve failed for autofill';
      end if;

      v_pick:=null;

      select authority.*
      into v_pick
      from private.cfb_superteam_authority authority
      join private.football_weekly_auction_board board
        on board.week_start=p_week_start
       and board.season_reference=authority.item_reference
      where private.football_weekly_superteam_item_eligible_for_slot(
              authority.candidate_group,v_slot
            )
        and not exists(
          select 1
          from private.football_weekly_superteam_roster used
          where used.week_start=p_week_start
            and used.item_reference=authority.item_reference
        )
      order by authority.hidden_grade asc,random()
      limit 1;

      if v_pick.item_reference is null then
        select authority.*
        into v_pick
        from private.cfb_superteam_authority authority
        where private.football_weekly_superteam_item_eligible_for_slot(
                authority.candidate_group,v_slot
              )
          and not exists(
            select 1
            from private.football_weekly_superteam_roster used
            where used.week_start=p_week_start
              and used.item_reference=authority.item_reference
          )
        order by authority.hidden_grade asc,random()
        limit 1;
      end if;

      if v_pick.item_reference is null then
        raise exception 'CFB Superteam could not autofill %',v_slot;
      end if;

      insert into private.football_weekly_superteam_roster(
        week_start,profile_id,roster_slot,item_reference,price_paid,awarded_day,source,awarded_at
      ) values (
        p_week_start,v_participant.profile_id,v_slot,v_pick.item_reference,1,7,'autofill',p_at
      );
    end loop;
  end loop;
end;
$$;
revoke all on function private.football_weekly_superteam_autofill(date,timestamptz)
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
  v_board_slot integer;
  v_profile uuid;
  v_amount integer;
  v_roster_slot text;
  v_priority integer;
  v_item_reference text;
  v_proposal_found boolean;
  v_loop integer:=0;
begin
  select min(board.lock_at) into v_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=p_week_start
    and board.day_index=p_day_index;

  if v_lock_at is null then
    raise exception 'CFB Superteam day is not materialized';
  end if;
  if p_at<v_lock_at then return; end if;

  perform private.football_weekly_superteam_seed_waiver(p_week_start);

  loop
    v_loop:=v_loop+1;
    exit when v_loop>8;
    v_proposal_found:=false;

    with proposals as (
      select
        board.slot as board_slot,
        board.season_reference as item_reference,
        best.profile_id,
        best.amount,
        best.roster_slot,
        best.priority,
        best.waiver_rank
      from private.football_weekly_auction_board board
      join lateral (
        select
          claim.profile_id,
          claim.amount,
          claim.roster_slot,
          claim.priority,
          private.football_weekly_superteam_daily_waiver_rank(
            p_week_start,p_day_index,claim.profile_id
          ) as waiver_rank
        from private.football_weekly_superteam_claims claim
        where claim.week_start=p_week_start
          and claim.day_index=p_day_index
          and claim.board_slot=board.slot
          and claim.amount>0
          and not exists(
            select 1
            from private.football_weekly_superteam_roster roster
            where roster.week_start=p_week_start
              and roster.profile_id=claim.profile_id
              and roster.roster_slot=claim.roster_slot
          )
          and (
            select count(*)
            from private.football_weekly_superteam_roster roster
            where roster.week_start=p_week_start
              and roster.profile_id=claim.profile_id
              and roster.source='auction'
              and roster.awarded_day=p_day_index
          )<2
          and claim.amount <=
            private.football_weekly_superteam_bankroll(p_week_start,claim.profile_id)
            - greatest(
                private.football_weekly_superteam_open_slots(p_week_start,claim.profile_id)-1,
                0
              )
        order by
          claim.amount desc,
          claim.priority asc,
          private.football_weekly_superteam_daily_waiver_rank(
            p_week_start,p_day_index,claim.profile_id
          ) asc,
          claim.profile_id
        limit 1
      ) best on true
      where board.week_start=p_week_start
        and board.day_index=p_day_index
        and not exists(
          select 1
          from private.football_weekly_auction_awards award
          where award.week_start=p_week_start
            and award.day_index=p_day_index
            and award.slot=board.slot
        )
    )
    select
      proposal.board_slot,
      proposal.profile_id,
      proposal.amount,
      proposal.roster_slot,
      proposal.priority,
      proposal.item_reference
    into
      v_board_slot,v_profile,v_amount,v_roster_slot,v_priority,v_item_reference
    from proposals proposal
    order by
      proposal.priority asc,
      proposal.amount desc,
      proposal.waiver_rank asc,
      proposal.board_slot
    limit 1;

    if v_board_slot is null then
      exit;
    end if;

    v_proposal_found:=true;

    insert into private.football_weekly_auction_awards(
      week_start,day_index,slot,profile_id,winning_bid,resolved_at
    ) values (
      p_week_start,p_day_index,v_board_slot,v_profile,v_amount,p_at
    );

    insert into private.football_weekly_superteam_roster(
      week_start,profile_id,roster_slot,item_reference,price_paid,awarded_day,source,awarded_at
    ) values (
      p_week_start,v_profile,v_roster_slot,v_item_reference,v_amount,p_day_index,'auction',p_at
    );

    v_board_slot:=null;
    v_profile:=null;
    v_amount:=null;
    v_roster_slot:=null;
    v_priority:=null;
    v_item_reference:=null;

    exit when not v_proposal_found;
  end loop;

  insert into private.football_weekly_auction_awards(
    week_start,day_index,slot,profile_id,winning_bid,resolved_at
  )
  select
    board.week_start,board.day_index,board.slot,null,0,p_at
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

  if p_day_index=7 then
    perform private.football_weekly_superteam_autofill(p_week_start,p_at);
  end if;
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
  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;

  if v_subject='nfl-build-qb' then
    perform private.resolve_football_weekly_build_qb_day(p_week_start,p_day_index,p_at);
  elsif v_subject='cfb-superteam' then
    perform private.resolve_football_weekly_superteam_day(p_week_start,p_day_index,p_at);
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
begin
  if exists(
    select 1
    from private.football_weekly_auction_weeks week
    where week.week_start=p_week_start
      and week.finalized_at is not null
  ) then return; end if;

  if (
    select count(*)
    from private.football_weekly_auction_awards award
    where award.week_start=p_week_start
  )<>56 then
    return;
  end if;

  perform private.football_weekly_superteam_autofill(p_week_start,p_at);

  if exists(
    select participant.profile_id
    from private.football_weekly_auction_participants participant
    left join private.football_weekly_superteam_roster roster
      on roster.week_start=participant.week_start
     and roster.profile_id=participant.profile_id
    where participant.week_start=p_week_start
    group by participant.profile_id
    having count(roster.item_reference)<>7
  ) then
    raise exception 'CFB Superteam finalization requires seven filled roster slots per participant';
  end if;

  delete from private.football_weekly_auction_results result
  where result.week_start=p_week_start;

  insert into private.football_weekly_auction_results(
    week_start,profile_id,owned_count,final_score,scoring_cost,scoring_refs,tie_random
  )
  select
    p_week_start,
    participant.profile_id,
    count(roster.item_reference)::integer,
    round(avg(authority.hidden_grade),2),
    sum(roster.price_paid)::integer,
    array_agg(roster.item_reference order by
      case roster.roster_slot
        when 'QB' then 1 when 'RB' then 2 when 'WR' then 3 when 'Flex' then 4
        when 'Front Seven' then 5 when 'Secondary' then 6 else 7
      end
    ),
    random()
  from private.football_weekly_auction_participants participant
  join private.football_weekly_superteam_roster roster
    on roster.week_start=participant.week_start
   and roster.profile_id=participant.profile_id
  join private.cfb_superteam_authority authority
    on authority.item_reference=roster.item_reference
  where participant.week_start=p_week_start
  group by participant.profile_id;

  with ranked as (
    select
      result.profile_id,
      row_number() over(
        order by
          result.final_score desc nulls last,
          result.scoring_cost asc nulls last,
          result.tie_random,
          result.profile_id
      )::integer as final_rank
    from private.football_weekly_auction_results result
    where result.week_start=p_week_start
  )
  update private.football_weekly_auction_results result
  set final_rank=ranked.final_rank,
      is_winner=ranked.final_rank=1
  from ranked
  where result.week_start=p_week_start
    and result.profile_id=ranked.profile_id;

  update private.football_weekly_auction_weeks week
  set finalized_at=p_at
  where week.week_start=p_week_start;
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
  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;

  if v_subject='nfl-build-qb' then
    perform private.finalize_football_weekly_build_qb_week(p_week_start,p_at);
  elsif v_subject='cfb-superteam' then
    perform private.finalize_football_weekly_superteam_week(p_week_start,p_at);
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
  my_roster as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'item_reference',roster.item_reference,
      'display_name',authority.display_name,
      'school',authority.school,
      'season_year',authority.season_year,
      'candidate_group',authority.candidate_group,
      'roster_slot',roster.roster_slot,
      'grade',authority.hidden_grade,
      'price_paid',roster.price_paid,
      'source',roster.source
    ) order by
      case roster.roster_slot
        when 'QB' then 1 when 'RB' then 2 when 'WR' then 3 when 'Flex' then 4
        when 'Front Seven' then 5 when 'Secondary' then 6 else 7
      end
    ),'[]'::jsonb) as payload
    from private.football_weekly_superteam_roster roster
    join private.cfb_superteam_authority authority
      on authority.item_reference=roster.item_reference
    where roster.week_start=p_week_start
      and roster.profile_id=p_profile_id
  ),
  all_rosters as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id',roster.profile_id,
      'display_name',profile.display_name,
      'item_reference',roster.item_reference,
      'player_name',authority.display_name,
      'school',authority.school,
      'season_year',authority.season_year,
      'candidate_group',authority.candidate_group,
      'roster_slot',roster.roster_slot,
      'grade',authority.hidden_grade,
      'price_paid',roster.price_paid,
      'source',roster.source
    ) order by profile.display_name,roster.roster_slot),'[]'::jsonb) as payload
    from private.football_weekly_superteam_roster roster
    join public.profiles profile on profile.id=roster.profile_id
    join private.cfb_superteam_authority authority
      on authority.item_reference=roster.item_reference
    where roster.week_start=p_week_start
  ),
  candidates as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'day_index',board.day_index,
      'slot',board.slot,
      'item_reference',board.season_reference,
      'display_name',authority.display_name,
      'school',authority.school,
      'season_year',authority.season_year,
      'candidate_group',authority.candidate_group,
      'grade',authority.hidden_grade,
      'winning_bid',award.winning_bid,
      'winner_profile_id',award.profile_id,
      'winner_display_name',winner.display_name
    ) order by board.day_index,board.slot),'[]'::jsonb) as payload
    from private.football_weekly_auction_board board
    join private.cfb_superteam_authority authority
      on authority.item_reference=board.season_reference
    left join private.football_weekly_auction_awards award
      on award.week_start=board.week_start
     and award.day_index=board.day_index
     and award.slot=board.slot
    left join public.profiles winner on winner.id=award.profile_id
    where board.week_start=p_week_start
  ),
  mine as (
    select to_jsonb(result) as payload
    from private.football_weekly_auction_results result
    where result.week_start=p_week_start
      and result.profile_id=p_profile_id
  )
  select jsonb_build_object(
    'subject_key','cfb-superteam',
    'week_start',p_week_start,
    'standings',standings.payload,
    'collection',my_roster.payload,
    'all_rosters',all_rosters.payload,
    'all_teams',candidates.payload,
    'my_result',coalesce(mine.payload,'{}'::jsonb)
  )
  from standings,my_roster,all_rosters,candidates
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
  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;

  if v_subject='nfl-build-qb' then
    return private.football_weekly_build_qb_final_payload(p_week_start,p_profile_id);
  elsif v_subject='cfb-superteam' then
    return private.football_weekly_superteam_final_payload(p_week_start,p_profile_id);
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
  v_cards jsonb:='[]'::jsonb;
  v_claims jsonb:='{}'::jsonb;
  v_prior_results jsonb:='[]'::jsonb;
  v_roster jsonb:='[]'::jsonb;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day_index:=private.football_weekly_auction_day_index(p_at,v_week_start);
  v_previous_week:=v_week_start-7;

  if not exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start=v_week_start
      and participant.profile_id=v_profile
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
    select 1
    from private.football_weekly_auction_results result
    where result.week_start=v_previous_week
      and result.profile_id=v_profile
  ) and not exists(
    select 1
    from private.football_weekly_auction_final_views view_row
    where view_row.week_start=v_previous_week
      and view_row.profile_id=v_profile
  ) then
    v_previous_final:=private.football_weekly_auction_final_payload(v_previous_week,v_profile);
  end if;

  v_bankroll:=private.football_weekly_superteam_bankroll(v_week_start,v_profile);
  v_open:=private.football_weekly_superteam_open_slots(v_week_start,v_profile);
  v_owned:=7-v_open;

  select exists(
    select 1
    from private.football_weekly_auction_daily_entries entry
    where entry.week_start=v_week_start
      and entry.day_index=v_day_index
      and entry.profile_id=v_profile
  ) into v_submitted;

  select not exists(
    select 1
    from private.football_weekly_auction_daily_entries entry
    where entry.week_start=v_week_start
      and entry.profile_id=v_profile
  ) into v_show_intro;

  select coalesce(jsonb_agg(jsonb_build_object(
    'slot',board.slot,
    'item_reference',board.season_reference,
    'display_name',authority.display_name,
    'school',authority.school,
    'season_year',authority.season_year,
    'candidate_group',authority.candidate_group,
    'lock_at',board.lock_at
  ) order by board.slot),'[]'::jsonb)
  into v_cards
  from private.football_weekly_auction_board board
  join private.cfb_superteam_authority authority
    on authority.item_reference=board.season_reference
  where board.week_start=v_week_start
    and board.day_index=v_day_index;

  select coalesce(jsonb_object_agg(
    claim.board_slot::text,
    jsonb_build_object(
      'amount',claim.amount,
      'roster_slot',claim.roster_slot,
      'priority',claim.priority
    )
  ),'{}'::jsonb)
  into v_claims
  from private.football_weekly_superteam_claims claim
  where claim.week_start=v_week_start
    and claim.day_index=v_day_index
    and claim.profile_id=v_profile;

  if v_day_index>1 then
    select coalesce(jsonb_agg(result_row.payload order by result_row.slot),'[]'::jsonb)
    into v_prior_results
    from (
      select
        board.slot,
        jsonb_build_object(
          'slot',board.slot,
          'item_reference',board.season_reference,
          'display_name',authority.display_name,
          'school',authority.school,
          'season_year',authority.season_year,
          'candidate_group',authority.candidate_group,
          'winning_bid',award.winning_bid,
          'winner_profile_id',award.profile_id,
          'winner_display_name',winner.display_name,
          'roster_slot',winner_claim.roster_slot,
          'bids',coalesce((
            select jsonb_agg(jsonb_build_object(
              'profile_id',entry.profile_id,
              'display_name',bidder.display_name,
              'amount',coalesce(claim.amount,0),
              'priority',claim.priority,
              'roster_slot',claim.roster_slot
            ) order by coalesce(claim.amount,0) desc,claim.priority,bidder.display_name)
            from private.football_weekly_auction_daily_entries entry
            join public.profiles bidder on bidder.id=entry.profile_id
            left join private.football_weekly_superteam_claims claim
              on claim.week_start=entry.week_start
             and claim.day_index=entry.day_index
             and claim.profile_id=entry.profile_id
             and claim.board_slot=board.slot
            where entry.week_start=v_week_start
              and entry.day_index=v_day_index-1
          ),'[]'::jsonb)
        ) as payload
      from private.football_weekly_auction_board board
      join private.cfb_superteam_authority authority
        on authority.item_reference=board.season_reference
      join private.football_weekly_auction_awards award
        on award.week_start=board.week_start
       and award.day_index=board.day_index
       and award.slot=board.slot
      left join public.profiles winner on winner.id=award.profile_id
      left join private.football_weekly_superteam_claims winner_claim
        on winner_claim.week_start=award.week_start
       and winner_claim.day_index=award.day_index
       and winner_claim.profile_id=award.profile_id
       and winner_claim.board_slot=award.slot
      where board.week_start=v_week_start
        and board.day_index=v_day_index-1
    ) result_row;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'item_reference',roster.item_reference,
    'display_name',authority.display_name,
    'school',authority.school,
    'season_year',authority.season_year,
    'candidate_group',authority.candidate_group,
    'roster_slot',roster.roster_slot,
    'price_paid',roster.price_paid,
    'source',roster.source
  ) order by
    case roster.roster_slot
      when 'QB' then 1 when 'RB' then 2 when 'WR' then 3 when 'Flex' then 4
      when 'Front Seven' then 5 when 'Secondary' then 6 else 7
    end
  ),'[]'::jsonb)
  into v_roster
  from private.football_weekly_superteam_roster roster
  join private.cfb_superteam_authority authority
    on authority.item_reference=roster.item_reference
  where roster.week_start=v_week_start
    and roster.profile_id=v_profile;

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
    'bids','{}'::jsonb,
    'claims',v_claims,
    'prior_results',v_prior_results,
    'roster',v_roster,
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
  v_open integer;
  v_max_claim integer;
  v_slot integer;
  v_payload jsonb;
  v_amount integer;
  v_roster_slot text;
  v_priority integer;
  v_candidate_group text;
  v_priorities integer[]:=array[]::integer[];
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if jsonb_typeof(p_bids)<>'object' then
    raise exception 'CFB Superteam claims must be an object';
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day_index:=private.football_weekly_auction_day_index(p_at,v_week_start);

  if not exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start=v_week_start
      and participant.profile_id=v_profile
  ) then
    raise exception 'Weekly Auction field is locked for this week';
  end if;

  select min(board.lock_at) into v_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=v_week_start
    and board.day_index=v_day_index;

  if v_lock_at is null or p_at>=v_lock_at then
    raise exception 'Today''s Weekly Auction claims are locked';
  end if;

  v_bankroll:=private.football_weekly_superteam_bankroll(v_week_start,v_profile);
  v_open:=private.football_weekly_superteam_open_slots(v_week_start,v_profile);
  v_max_claim:=greatest(v_bankroll-greatest(v_open-1,0),0);

  for v_slot in 1..8 loop
    v_payload:=p_bids->v_slot::text;
    if v_payload is null or jsonb_typeof(v_payload)<>'object' then
      raise exception 'Every Superteam card needs an amount, roster slot, and priority';
    end if;

    begin
      v_amount:=coalesce((v_payload->>'amount')::integer,0);
      v_priority:=(v_payload->>'priority')::integer;
    exception when others then
      raise exception 'Superteam amounts and priorities must be whole numbers';
    end;

    v_roster_slot:=v_payload->>'roster_slot';

    if v_amount<0 or v_amount>50 then
      raise exception 'Superteam bids must be between $0 and $50';
    end if;
    if v_priority not between 1 and 8 then
      raise exception 'Superteam claim priority must be 1-8';
    end if;
    if v_priority=any(v_priorities) then
      raise exception 'Superteam claim priorities must be unique';
    end if;
    v_priorities:=array_append(v_priorities,v_priority);

    select board.candidate_group into v_candidate_group
    from private.football_weekly_auction_board board
    where board.week_start=v_week_start
      and board.day_index=v_day_index
      and board.slot=v_slot;

    if v_candidate_group is null then
      raise exception 'Superteam board is incomplete';
    end if;

    if not private.football_weekly_superteam_item_eligible_for_slot(
      v_candidate_group,v_roster_slot
    ) then
      raise exception '% cannot fill the % Superteam slot',v_candidate_group,v_roster_slot;
    end if;

    if v_amount>0 and exists(
      select 1
      from private.football_weekly_superteam_roster roster
      where roster.week_start=v_week_start
        and roster.profile_id=v_profile
        and roster.roster_slot=v_roster_slot
    ) then
      raise exception 'Your % Superteam slot is already filled',v_roster_slot;
    end if;

    if v_amount>v_max_claim then
      raise exception
        'A single claim can be at most $% so $1 stays protected for every other open slot',
        v_max_claim;
    end if;

    insert into private.football_weekly_auction_bids(
      week_start,day_index,profile_id,slot,amount,updated_at
    ) values (
      v_week_start,v_day_index,v_profile,v_slot,v_amount,p_at
    )
    on conflict(week_start,day_index,profile_id,slot)
    do update set amount=excluded.amount,updated_at=excluded.updated_at;

    insert into private.football_weekly_superteam_claims(
      week_start,day_index,profile_id,board_slot,amount,roster_slot,priority,updated_at
    ) values (
      v_week_start,v_day_index,v_profile,v_slot,v_amount,v_roster_slot,v_priority,p_at
    )
    on conflict(week_start,day_index,profile_id,board_slot)
    do update set
      amount=excluded.amount,
      roster_slot=excluded.roster_slot,
      priority=excluded.priority,
      updated_at=excluded.updated_at;
  end loop;

  insert into private.football_weekly_auction_daily_entries(
    week_start,day_index,profile_id,submitted_at,updated_at
  ) values (
    v_week_start,v_day_index,v_profile,p_at,p_at
  )
  on conflict(week_start,day_index,profile_id)
  do update set updated_at=excluded.updated_at;

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
  v_day_index integer;
  v_subject text;
  v_day1_lock_at timestamptz;
  v_due record;
  v_week record;
  v_day integer;
begin
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then
    return;
  end if;

  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day_index:=private.football_weekly_auction_day_index(p_at,v_week_start);
  perform private.materialize_football_weekly_auction_week(v_week_start);
  perform private.materialize_football_weekly_auction_participants(v_week_start);

  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=v_week_start;

  select min(board.lock_at) into v_day1_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=v_week_start
    and board.day_index=1;

  if v_day1_lock_at is null then
    raise exception 'Weekly Auction Day 1 board is incomplete';
  end if;

  if p_at>=v_day1_lock_at then
    update private.football_weekly_auction_weeks week
    set field_locked_at=coalesce(week.field_locked_at,v_day1_lock_at)
    where week.week_start=v_week_start;
  end if;

  -- Lazily materialize each due/current Superteam day in sequence so the eighth
  -- card responds to the actual roster needs created by prior resolved days.
  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and week.subject_key='cfb-superteam'
      and week.week_start<=v_week_start
    order by week.week_start
  loop
    for v_day in 1..7 loop
      exit when (
        ((v_week.week_start+v_day-1)::timestamp at time zone 'America/Chicago')>p_at
        and not (
          v_week.week_start=v_week_start
          and v_day<=least(greatest(v_day_index,1),7)
        )
      );

      perform private.materialize_football_weekly_superteam_day(v_week.week_start,v_day);

      if (
        select min(board.lock_at)
        from private.football_weekly_auction_board board
        where board.week_start=v_week.week_start
          and board.day_index=v_day
      )<=p_at then
        perform private.resolve_football_weekly_superteam_day(v_week.week_start,v_day,p_at);
      end if;
    end loop;
  end loop;

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
       ) < private.football_weekly_auction_cards_per_day(board.week_start)
    order by board.week_start,board.day_index
  loop
    perform private.resolve_football_weekly_auction_day(v_due.week_start,v_due.day_index,p_at);
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
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.ensure_football_weekly_auction_participant(v_week_start,v_profile,p_at);

  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=v_week_start;

  if v_subject='nfl-build-qb' then
    return private.get_my_football_weekly_build_qb(p_at);
  elsif v_subject='cfb-superteam' then
    return private.get_my_football_weekly_superteam(p_at);
  end if;

  return private.get_my_football_weekly_auction_cfb(p_at)
    || jsonb_build_object(
      'subject_key',coalesce(v_subject,'cfb-best-teams-since-2000')
    );
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
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.ensure_football_weekly_auction_participant(v_week_start,v_profile,p_at);

  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=v_week_start;

  if v_subject='nfl-build-qb' then
    return private.submit_my_football_weekly_build_qb_bids(p_bids,p_at);
  elsif v_subject='cfb-superteam' then
    return private.submit_my_football_weekly_superteam_bids(p_bids,p_at);
  end if;

  return private.submit_my_football_weekly_auction_bids_cfb(p_bids,p_at);
end;
$$;
revoke all on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  from public,anon;
grant execute on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  to authenticated;

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

  -- Do not call maintain: previewing the real Day 1 board must not lock or join
  -- the future field.
  perform private.materialize_football_weekly_auction_week(v_week_start);

  select coalesce(jsonb_agg(jsonb_build_object(
    'slot',board.slot,
    'item_reference',board.season_reference,
    'display_name',authority.display_name,
    'school',authority.school,
    'season_year',authority.season_year,
    'candidate_group',authority.candidate_group,
    'lock_at',board.lock_at
  ) order by board.slot),'[]'::jsonb)
  into v_cards
  from private.football_weekly_auction_board board
  join private.cfb_superteam_authority authority
    on authority.item_reference=board.season_reference
  where board.week_start=v_week_start
    and board.day_index=1;

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
    'claims','{}'::jsonb,
    'prior_results','[]'::jsonb,
    'roster','[]'::jsonb,
    'previous_final',null
  );
end;
$$;
revoke all on function public.get_my_football_weekly_superteam_preview()
  from public,anon;
grant execute on function public.get_my_football_weekly_superteam_preview()
  to authenticated;

do $superteam_runtime_contract$
declare
  v_subject text;
  v_cards integer;
begin
  v_subject:=private.football_weekly_auction_subject_for_week(date '2026-09-29');
  if v_subject<>'cfb-superteam' then
    raise exception 'Sep. 29 must be CFB Superteam, got %',v_subject;
  end if;

  perform private.materialize_football_weekly_auction_week(date '2026-09-29');

  select count(*) into v_cards
  from private.football_weekly_auction_board board
  where board.week_start=date '2026-09-29'
    and board.day_index=1;

  if v_cards<>8 then
    raise exception 'Sep. 29 CFB Superteam Day 1 must contain eight candidates';
  end if;

  if exists(
    select board.season_reference
    from private.football_weekly_auction_board board
    where board.week_start=date '2026-09-29'
    group by board.season_reference
    having count(*)>1
  ) then
    raise exception 'CFB Superteam candidate burn contract failed';
  end if;
end;
$superteam_runtime_contract$;
