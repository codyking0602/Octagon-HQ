-- CFB Superteam Weekly Auction launch for Sep. 29, 2026.
-- Reuses the shared Weekly Auction lifecycle while adding a seven-slot roster game
-- calibrated around the five-player field: 8 candidates/day, $50 bankroll,
-- max 2 auction wins/day, ranked conditional overcommit, $1/open-slot reserve,
-- rotating tie priority, locked roster slots, and worst-eligible $1 autofill.

alter table private.football_weekly_auction_board
  drop constraint if exists football_weekly_auction_board_slot_check,
  add constraint football_weekly_auction_board_slot_check check (slot between 1 and 8),
  drop constraint if exists football_weekly_auction_board_theme_check,
  add constraint football_weekly_auction_board_theme_check check (
    theme in ('SEC','Big Ten','Big 12','ACC','Wildcard','NFL','CFB Superteam')
  );

alter table private.football_weekly_auction_bids
  drop constraint if exists football_weekly_auction_bids_slot_check,
  add constraint football_weekly_auction_bids_slot_check check (slot between 1 and 8),
  drop constraint if exists football_weekly_auction_bids_amount_check,
  add constraint football_weekly_auction_bids_amount_check check (amount between 0 and 50);

alter table private.football_weekly_auction_awards
  drop constraint if exists football_weekly_auction_awards_winning_bid_check,
  add constraint football_weekly_auction_awards_winning_bid_check check (winning_bid between 0 and 50),
  add column if not exists roster_slot text;

alter table private.football_weekly_auction_awards
  drop constraint if exists football_weekly_auction_awards_roster_slot_check,
  add constraint football_weekly_auction_awards_roster_slot_check check (
    roster_slot is null
    or roster_slot in ('QB','RB','WR','Flex','Front Seven','Secondary','Head Coach')
  );

create unique index if not exists football_weekly_superteam_roster_slot_unique
  on private.football_weekly_auction_awards(week_start,profile_id,roster_slot)
  where profile_id is not null and roster_slot is not null;

create table if not exists private.cfb_superteam_v1_authority (
  item_reference text primary key,
  display_name text not null,
  school text not null,
  season_year integer not null check (season_year between 1900 and 2100),
  group_key text not null check (
    group_key in ('QB','RB','WR','TE','Front Seven','Secondary','Head Coach')
  ),
  eligible_slots text[] not null,
  hidden_grade numeric(5,1) not null check (
    hidden_grade between 0 and 100
    and hidden_grade * 2 = trunc(hidden_grade * 2)
  ),
  launch_day integer not null check (launch_day between 1 and 7),
  launch_slot integer not null check (launch_slot between 1 and 8),
  unique(launch_day,launch_slot)
);
revoke all on private.cfb_superteam_v1_authority from public,anon,authenticated;

insert into private.cfb_superteam_v1_authority(
  item_reference,display_name,school,season_year,group_key,eligible_slots,hidden_grade,launch_day,launch_slot
) values
  ('cfb-superteam-chase-young-2019','Chase Young','Ohio State',2019,'Front Seven',array['Front Seven'],97,1,1),
  ('cfb-superteam-jayden-daniels-2023','Jayden Daniels','LSU',2023,'QB',array['QB'],98,1,2),
  ('cfb-superteam-darren-mcfadden-2007','Darren McFadden','Arkansas',2007,'RB',array['RB','Flex'],98,1,3),
  ('cfb-superteam-myles-garrett-2015','Myles Garrett','Texas A&M',2015,'Front Seven',array['Front Seven'],94,1,4),
  ('cfb-superteam-tyrann-mathieu-2011','Tyrann Mathieu','LSU',2011,'Secondary',array['Secondary'],99,1,5),
  ('cfb-superteam-mack-brown-2005','Mack Brown','Texas',2005,'Head Coach',array['Head Coach'],98,1,6),
  ('cfb-superteam-amari-cooper-2014','Amari Cooper','Alabama',2014,'WR',array['WR','Flex'],97,1,7),
  ('cfb-superteam-jimbo-fisher-2013','Jimbo Fisher','Florida State',2013,'Head Coach',array['Head Coach'],96,1,8),

  ('cfb-superteam-jim-harbaugh-2023','Jim Harbaugh','Michigan',2023,'Head Coach',array['Head Coach'],97,2,1),
  ('cfb-superteam-michael-penix-jr-2023','Michael Penix Jr.','Washington',2023,'QB',array['QB'],93,2,2),
  ('cfb-superteam-aidan-hutchinson-2021','Aidan Hutchinson','Michigan',2021,'Front Seven',array['Front Seven'],97,2,3),
  ('cfb-superteam-luke-kuechly-2011','Luke Kuechly','Boston College',2011,'Front Seven',array['Front Seven'],98,2,4),
  ('cfb-superteam-reggie-bush-2005','Reggie Bush','USC',2005,'RB',array['RB','Flex'],100,2,5),
  ('cfb-superteam-michael-crabtree-2007','Michael Crabtree','Texas Tech',2007,'WR',array['WR','Flex'],99,2,6),
  ('cfb-superteam-patrick-peterson-2010','Patrick Peterson','LSU',2010,'Secondary',array['Secondary'],98,2,7),
  ('cfb-superteam-dabo-swinney-2018','Dabo Swinney','Clemson',2018,'Head Coach',array['Head Coach'],99,2,8),

  ('cfb-superteam-marcus-mariota-2014','Marcus Mariota','Oregon',2014,'QB',array['QB'],98,3,1),
  ('cfb-superteam-kirby-smart-2022','Kirby Smart','Georgia',2022,'Head Coach',array['Head Coach'],98,3,2),
  ('cfb-superteam-bijan-robinson-2022','Bijan Robinson','Texas',2022,'RB',array['RB','Flex'],93,3,3),
  ('cfb-superteam-mark-andrews-2017','Mark Andrews','Oklahoma',2017,'TE',array['Flex'],96,3,4),
  ('cfb-superteam-justin-jefferson-2019','Justin Jefferson','LSU',2019,'WR',array['WR','Flex'],96,3,5),
  ('cfb-superteam-travis-hunter-2024','Travis Hunter','Colorado',2024,'Secondary',array['Secondary'],98,3,6),
  ('cfb-superteam-ed-reed-2001','Ed Reed','Miami',2001,'Secondary',array['Secondary'],100,3,7),
  ('cfb-superteam-devonta-smith-2020','DeVonta Smith','Alabama',2020,'WR',array['WR','Flex'],100,3,8),

  ('cfb-superteam-minkah-fitzpatrick-2017','Minkah Fitzpatrick','Alabama',2017,'Secondary',array['Secondary'],97,4,1),
  ('cfb-superteam-urban-meyer-2008','Urban Meyer','Florida',2008,'Head Coach',array['Head Coach'],97,4,2),
  ('cfb-superteam-justin-blackmon-2010','Justin Blackmon','Oklahoma State',2010,'WR',array['WR','Flex'],98,4,3),
  ('cfb-superteam-ndamukong-suh-2009','Ndamukong Suh','Nebraska',2009,'Front Seven',array['Front Seven'],100,4,4),
  ('cfb-superteam-jamarr-chase-2019','Ja''Marr Chase','LSU',2019,'WR',array['WR','Flex'],98,4,5),
  ('cfb-superteam-derrick-henry-2015','Derrick Henry','Alabama',2015,'RB',array['RB','Flex'],99,4,6),
  ('cfb-superteam-jadeveon-clowney-2012','Jadeveon Clowney','South Carolina',2012,'Front Seven',array['Front Seven'],96,4,7),
  ('cfb-superteam-lamar-jackson-2016','Lamar Jackson','Louisville',2016,'QB',array['QB'],98,4,8),

  ('cfb-superteam-ed-orgeron-2019','Ed Orgeron','LSU',2019,'Head Coach',array['Head Coach'],96,5,1),
  ('cfb-superteam-vince-young-2005','Vince Young','Texas',2005,'QB',array['QB'],99,5,2),
  ('cfb-superteam-earl-thomas-2009','Earl Thomas','Texas',2009,'Secondary',array['Secondary'],97,5,3),
  ('cfb-superteam-marvin-harrison-jr-2023','Marvin Harrison Jr.','Ohio State',2023,'WR',array['WR','Flex'],94,5,4),
  ('cfb-superteam-ashton-jeanty-2024','Ashton Jeanty','Boise State',2024,'RB',array['RB','Flex'],97,5,5),
  ('cfb-superteam-sean-taylor-2003','Sean Taylor','Miami',2003,'Secondary',array['Secondary'],99,5,6),
  ('cfb-superteam-larry-fitzgerald-2003','Larry Fitzgerald','Pittsburgh',2003,'WR',array['WR','Flex'],99,5,7),
  ('cfb-superteam-joe-burrow-2019','Joe Burrow','LSU',2019,'QB',array['QB'],100,5,8),

  ('cfb-superteam-christian-mccaffrey-2015','Christian McCaffrey','Stanford',2015,'RB',array['RB','Flex'],98,6,1),
  ('cfb-superteam-tyler-warren-2024','Tyler Warren','Penn State',2024,'TE',array['Flex'],99,6,2),
  ('cfb-superteam-will-anderson-jr-2021','Will Anderson Jr.','Alabama',2021,'Front Seven',array['Front Seven'],98,6,3),
  ('cfb-superteam-aaron-donald-2013','Aaron Donald','Pittsburgh',2013,'Front Seven',array['Front Seven'],99,6,4),
  ('cfb-superteam-patrick-mahomes-2016','Patrick Mahomes','Texas Tech',2016,'QB',array['QB'],89,6,5),
  ('cfb-superteam-brock-bowers-2021','Brock Bowers','Georgia',2021,'TE',array['Flex'],98,6,6),
  ('cfb-superteam-adrian-peterson-2004','Adrian Peterson','Oklahoma',2004,'RB',array['RB','Flex'],96,6,7),
  ('cfb-superteam-caleb-downs-2025','Caleb Downs','Ohio State',2025,'Secondary',array['Secondary'],97,6,8),

  ('cfb-superteam-cam-newton-2010','Cam Newton','Auburn',2010,'QB',array['QB'],100,7,1),
  ('cfb-superteam-nick-saban-2020','Nick Saban','Alabama',2020,'Head Coach',array['Head Coach'],100,7,2),
  ('cfb-superteam-pete-carroll-2004','Pete Carroll','USC',2004,'Head Coach',array['Head Coach'],99,7,3),
  ('cfb-superteam-von-miller-2010','Von Miller','Texas A&M',2010,'Front Seven',array['Front Seven'],97,7,4),
  ('cfb-superteam-saquon-barkley-2017','Saquon Barkley','Penn State',2017,'RB',array['RB','Flex'],93,7,5),
  ('cfb-superteam-ezekiel-elliott-2014','Ezekiel Elliott','Ohio State',2014,'RB',array['RB','Flex'],97,7,6),
  ('cfb-superteam-kyle-pitts-2020','Kyle Pitts','Florida',2020,'TE',array['Flex'],99,7,7),
  ('cfb-superteam-eric-berry-2008','Eric Berry','Tennessee',2008,'Secondary',array['Secondary'],98,7,8)
on conflict(item_reference) do update set
  display_name=excluded.display_name,
  school=excluded.school,
  season_year=excluded.season_year,
  group_key=excluded.group_key,
  eligible_slots=excluded.eligible_slots,
  hidden_grade=excluded.hidden_grade,
  launch_day=excluded.launch_day,
  launch_slot=excluded.launch_slot;

insert into private.football_weekly_auction_subjects(
  subject_key,display_name,short_label,competition_level,item_kind,
  rotation_order,eligible_from,is_active
) values (
  'cfb-superteam','CFB Superteam','CFB Superteam','CFB','player-season',2,date '2026-09-29',true
)
on conflict(subject_key) do update set
  display_name=excluded.display_name,
  short_label=excluded.short_label,
  competition_level=excluded.competition_level,
  item_kind=excluded.item_kind,
  rotation_order=excluded.rotation_order,
  eligible_from=excluded.eligible_from,
  is_active=excluded.is_active;

insert into private.football_weekly_auction_items(
  item_reference,subject_key,season_year,primary_name,secondary_name,team_code,
  board_bucket,identity_group,display_label,hidden_grade,source_url,grading_inputs
)
select
  authority.item_reference,
  'cfb-superteam',
  authority.season_year,
  authority.display_name,
  authority.school,
  null,
  authority.group_key,
  authority.display_name,
  authority.display_name || ' · ' || authority.school || ' · ' || authority.season_year::text,
  authority.hidden_grade,
  null,
  jsonb_build_object(
    'school',authority.school,
    'season_year',authority.season_year,
    'group_key',authority.group_key,
    'eligible_slots',authority.eligible_slots
  )
from private.cfb_superteam_v1_authority authority
on conflict(item_reference) do update set
  subject_key=excluded.subject_key,
  season_year=excluded.season_year,
  primary_name=excluded.primary_name,
  secondary_name=excluded.secondary_name,
  team_code=excluded.team_code,
  board_bucket=excluded.board_bucket,
  identity_group=excluded.identity_group,
  display_label=excluded.display_label,
  hidden_grade=excluded.hidden_grade,
  source_url=excluded.source_url,
  grading_inputs=excluded.grading_inputs;

create table if not exists private.football_weekly_superteam_bid_preferences (
  week_start date not null,
  day_index integer not null check(day_index between 1 and 7),
  profile_id uuid not null,
  slot integer not null check(slot between 1 and 8),
  claim_rank integer not null check(claim_rank between 1 and 8),
  primary key(week_start,day_index,profile_id,slot),
  unique(week_start,day_index,profile_id,claim_rank),
  foreign key(week_start,day_index,profile_id)
    references private.football_weekly_auction_daily_entries(week_start,day_index,profile_id)
    on delete cascade
);
revoke all on private.football_weekly_superteam_bid_preferences from public,anon,authenticated;

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
revoke all on function private.football_weekly_auction_cards_per_day(date) from public,anon,authenticated;

create or replace function private.football_weekly_auction_cards_per_week(p_week_start date)
returns integer
language sql
stable security definer
set search_path=''
as $$
  select private.football_weekly_auction_cards_per_day(p_week_start) * 7;
$$;
revoke all on function private.football_weekly_auction_cards_per_week(date) from public,anon,authenticated;

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

  select count(*) into v_existing
  from private.football_weekly_auction_board
  where week_start=p_week_start;

  if v_existing=56 then return; end if;
  if v_existing<>0 then raise exception 'CFB Superteam week already has a partial board'; end if;

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
  from private.cfb_superteam_v1_authority authority
  order by authority.launch_day,authority.launch_slot;

  if (select count(*) from private.football_weekly_auction_board where week_start=p_week_start)<>56 then
    raise exception 'CFB Superteam board did not materialize 56 candidates';
  end if;
end;
$$;
revoke all on function private.materialize_football_weekly_superteam_week(date) from public,anon,authenticated;

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
revoke all on function private.materialize_football_weekly_auction_week(date) from public,anon,authenticated;

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
      or new.theme<>'CFB Superteam'
      or not exists(
        select 1 from private.cfb_superteam_v1_authority authority
        where authority.item_reference=new.season_reference
          and authority.launch_day=new.day_index
          and authority.launch_slot=new.slot
      )
    then
      raise exception 'CFB Superteam board row is outside the launch authority';
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
revoke all on function private.validate_football_weekly_auction_board_authority() from public,anon,authenticated;

create or replace function private.football_weekly_superteam_tie_rank(
  p_week_start date,p_day_index integer,p_profile_id uuid
)
returns integer
language sql
stable security definer
set search_path=''
as $$
  with ordered as (
    select
      participant.profile_id,
      row_number() over(order by lower(profile.display_name),participant.profile_id)::integer as base_rank,
      count(*) over()::integer as field_size
    from private.football_weekly_auction_participants participant
    join public.profiles profile on profile.id=participant.profile_id
    where participant.week_start=p_week_start
  )
  select case
    when field_size<=0 then 999
    else 1 + mod(base_rank - 1 - mod(p_day_index - 1,field_size) + field_size,field_size)
  end
  from ordered
  where profile_id=p_profile_id;
$$;
revoke all on function private.football_weekly_superteam_tie_rank(date,integer,uuid) from public,anon,authenticated;

create or replace function private.football_weekly_superteam_assignment_slot(
  p_week_start date,p_profile_id uuid,p_item_reference text
)
returns text
language plpgsql
stable security definer
set search_path=''
as $$
declare
  v_group text;
  v_rb boolean;
  v_wr boolean;
  v_flex boolean;
  v_direct text;
begin
  select group_key into v_group
  from private.cfb_superteam_v1_authority
  where item_reference=p_item_reference;

  if v_group is null then return null; end if;

  if v_group in ('QB','Front Seven','Secondary','Head Coach') then
    v_direct:=v_group;
    if exists(
      select 1 from private.football_weekly_auction_awards
      where week_start=p_week_start and profile_id=p_profile_id and roster_slot=v_direct
    ) then return null; end if;
    return v_direct;
  end if;

  select
    exists(select 1 from private.football_weekly_auction_awards where week_start=p_week_start and profile_id=p_profile_id and roster_slot='RB'),
    exists(select 1 from private.football_weekly_auction_awards where week_start=p_week_start and profile_id=p_profile_id and roster_slot='WR'),
    exists(select 1 from private.football_weekly_auction_awards where week_start=p_week_start and profile_id=p_profile_id and roster_slot='Flex')
  into v_rb,v_wr,v_flex;

  if v_group='RB' then
    if not v_rb then return 'RB'; end if;
    if not v_flex then return 'Flex'; end if;
    return null;
  elsif v_group='WR' then
    if not v_wr then return 'WR'; end if;
    if not v_flex then return 'Flex'; end if;
    return null;
  elsif v_group='TE' then
    if not v_flex then return 'Flex'; end if;
    return null;
  end if;

  return null;
end;
$$;
revoke all on function private.football_weekly_superteam_assignment_slot(date,uuid,text) from public,anon,authenticated;

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

  for v_iteration in 1..8 loop
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
          order by
            bid.amount desc,
            private.football_weekly_superteam_tie_rank(p_week_start,p_day_index,bid.profile_id),
            bid.profile_id
          limit 1
        ),99) as top_claim_rank
      from private.football_weekly_auction_board board
      where board.week_start=p_week_start
        and board.day_index=p_day_index
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
revoke all on function private.resolve_football_weekly_superteam_day(date,integer,timestamptz) from public,anon,authenticated;

create or replace function private.resolve_football_weekly_auction_day(
  p_week_start date,p_day_index integer,p_at timestamptz default now()
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
revoke all on function private.resolve_football_weekly_auction_day(date,integer,timestamptz) from public,anon,authenticated;

create or replace function private.complete_football_weekly_superteam_rosters(
  p_week_start date,p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_participant record;
  v_roster_slot text;
  v_candidate record;
  v_spent integer;
begin
  for v_participant in
    select participant.profile_id
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
    order by participant.profile_id
  loop
    foreach v_roster_slot in array array['QB','RB','WR','Flex','Front Seven','Secondary','Head Coach']::text[]
    loop
      if exists(
        select 1 from private.football_weekly_auction_awards award
        where award.week_start=p_week_start
          and award.profile_id=v_participant.profile_id
          and award.roster_slot=v_roster_slot
      ) then continue; end if;

      select
        award.day_index,award.slot,authority.item_reference
      into v_candidate
      from private.football_weekly_auction_awards award
      join private.football_weekly_auction_board board
        on board.week_start=award.week_start
       and board.day_index=award.day_index
       and board.slot=award.slot
      join private.cfb_superteam_v1_authority authority
        on authority.item_reference=board.season_reference
      where award.week_start=p_week_start
        and award.profile_id is null
        and v_roster_slot=any(authority.eligible_slots)
      order by authority.hidden_grade asc,award.day_index desc,award.slot
      limit 1;

      if v_candidate.item_reference is null then
        raise exception 'CFB Superteam could not autofill % for %',v_roster_slot,v_participant.profile_id;
      end if;

      select coalesce(sum(winning_bid),0)::integer into v_spent
      from private.football_weekly_auction_awards
      where week_start=p_week_start and profile_id=v_participant.profile_id;

      if v_spent>=50 then
        raise exception 'CFB Superteam reserve failed before autofill for %',v_participant.profile_id;
      end if;

      update private.football_weekly_auction_awards
      set profile_id=v_participant.profile_id,
          winning_bid=1,
          resolved_at=p_at,
          roster_slot=v_roster_slot
      where week_start=p_week_start
        and day_index=v_candidate.day_index
        and slot=v_candidate.slot
        and profile_id is null;
    end loop;
  end loop;
end;
$$;
revoke all on function private.complete_football_weekly_superteam_rosters(date,timestamptz) from public,anon,authenticated;

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

  if (select count(*) from private.football_weekly_auction_awards where week_start=p_week_start)<>56 then
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
revoke all on function private.finalize_football_weekly_superteam_week(date,timestamptz) from public,anon,authenticated;

create or replace function private.finalize_football_weekly_auction_week(
  p_week_start date,p_at timestamptz default now()
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
revoke all on function private.finalize_football_weekly_auction_week(date,timestamptz) from public,anon,authenticated;

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
revoke all on function private.football_weekly_superteam_final_payload(date,uuid) from public,anon,authenticated;

create or replace function private.football_weekly_auction_final_payload(
  p_week_start date,p_profile_id uuid
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
revoke all on function private.football_weekly_auction_final_payload(date,uuid) from public,anon,authenticated;

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
    and board.day_index=v_day_index;

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
revoke all on function private.get_my_football_weekly_superteam(timestamptz) from public,anon,authenticated;

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
  v_top_commit integer;
  v_reserve_after integer;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if jsonb_typeof(p_bids)<>'object' then raise exception 'bids must be an object'; end if;

  perform private.maintain_football_weekly_auction(p_at);
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
    count(award.roster_slot)::integer
  into v_bankroll,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=v_week_start
    and award.profile_id=v_profile
    and award.roster_slot is not null;

  v_open_slots:=greatest(7-v_owned,0);
  v_max_wins:=least(2,v_open_slots);

  for v_slot in 1..8 loop
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
    if v_priority<1 or v_priority>8 then
      raise exception 'CFB Superteam priority must be between 1 and 8';
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

  select coalesce(sum(value),0)::integer
  into v_top_commit
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

  for v_slot in 1..8 loop
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
revoke all on function private.submit_my_football_weekly_superteam_bids(jsonb,timestamptz) from public,anon,authenticated;

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
revoke all on function public.get_my_football_weekly_auction(timestamptz) from public,anon;
grant execute on function public.get_my_football_weekly_auction(timestamptz) to authenticated;

create or replace function public.submit_my_football_weekly_auction_bids(
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
revoke all on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz) from public,anon;
grant execute on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz) to authenticated;

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
  v_subject:=private.football_weekly_auction_subject_for_week(v_week_start);

  if v_subject<>'cfb-superteam' then
    return jsonb_build_object(
      'available',false,
      'subject_key',v_subject,
      'week_start',v_week_start
    );
  end if;

  perform private.materialize_football_weekly_auction_week(v_week_start);

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
    and board.day_index=1;

  if jsonb_array_length(v_cards)<>8 then
    raise exception 'CFB Superteam owner preview did not materialize eight Day 1 candidates';
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
revoke all on function public.get_my_football_weekly_superteam_preview() from public,anon;
grant execute on function public.get_my_football_weekly_superteam_preview() to authenticated;

do $cfb_superteam_contract$
declare
  v_subject text;
begin
  if (select count(*) from private.cfb_superteam_v1_authority)<>56 then
    raise exception 'CFB Superteam launch authority must contain exactly 56 candidates';
  end if;

  if exists(
    select launch_day
    from private.cfb_superteam_v1_authority
    group by launch_day
    having count(*)<>8
  ) then
    raise exception 'CFB Superteam launch authority must contain exactly eight candidates per day';
  end if;

  v_subject:=private.football_weekly_auction_subject_for_week(date '2026-09-29');
  if v_subject<>'cfb-superteam' then
    raise exception 'Sep. 29 Weekly Auction must route to CFB Superteam, got %',v_subject;
  end if;

  perform private.materialize_football_weekly_auction_week(date '2026-09-29');

  if (select count(*) from private.football_weekly_auction_board where week_start=date '2026-09-29')<>56 then
    raise exception 'Sep. 29 CFB Superteam board must contain 56 candidates';
  end if;

  if exists(
    select season_reference
    from private.football_weekly_auction_board
    where week_start=date '2026-09-29'
    group by season_reference
    having count(*)>1
  ) then
    raise exception 'CFB Superteam candidates may appear only once per week';
  end if;
end
$cfb_superteam_contract$;
