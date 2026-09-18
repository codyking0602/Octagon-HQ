-- NFL Build a QB Weekly runtime.
-- Reuses the existing Football Weekly Auction lifecycle while preserving the
-- 2026-09-15 CFB week and all historical CFB behavior.
-- NFL Build a QB begins on the 2026-09-22 Tuesday lock with six participants.

-- Canonical v2 NFL Build a QB authority. This is private and versioned separately
-- from legacy v6 Draft Room rows so historical rooms are never rewritten.
create table if not exists private.nfl_build_qb_v2_authority (
  item_reference text primary key,
  display_name text not null unique,
  team_code text not null,
  arm numeric(5,1) not null check (arm between 0 and 100 and arm * 2 = trunc(arm * 2)),
  accuracy numeric(5,1) not null check (accuracy between 0 and 100 and accuracy * 2 = trunc(accuracy * 2)),
  processing numeric(5,1) not null check (processing between 0 and 100 and processing * 2 = trunc(processing * 2)),
  mobility numeric(5,1) not null check (mobility between 0 and 100 and mobility * 2 = trunc(mobility * 2)),
  overall numeric(5,1) not null check (overall between 0 and 100 and overall * 2 = trunc(overall * 2))
);
revoke all on private.nfl_build_qb_v2_authority from public, anon, authenticated;

insert into private.nfl_build_qb_v2_authority(
  item_reference, display_name, team_code, arm, accuracy, processing, mobility, overall
) values
  ('build-qb-johnny-unitas','Johnny Unitas','IND',92.0,90.0,97.5,67.5,87.0),
  ('build-qb-joe-montana','Joe Montana','SF',84.0,98.0,99.0,80.0,90.5),
  ('build-qb-brett-favre','Brett Favre','GB',98.0,86.0,86.0,81.0,88.0),
  ('build-qb-dan-marino','Dan Marino','MIA',97.5,92.5,98.5,70.0,89.5),
  ('build-qb-john-elway','John Elway','DEN',99.0,84.5,91.0,88.5,91.0),
  ('build-qb-steve-young','Steve Young','SF',91.0,94.5,97.0,96.5,95.0),
  ('build-qb-roger-staubach','Roger Staubach','DAL',89.0,87.5,92.5,95.5,91.0),
  ('build-qb-terry-bradshaw','Terry Bradshaw','PIT',94.0,72.0,82.0,78.5,81.5),
  ('build-qb-warren-moon','Warren Moon','OIL',95.5,87.0,90.0,82.0,88.5),
  ('build-qb-troy-aikman','Troy Aikman','DAL',91.0,96.0,95.0,65.0,87.0),
  ('build-qb-joe-namath','Joe Namath','NYJ',94.0,78.0,84.0,57.0,78.5),
  ('build-qb-dan-fouts','Dan Fouts','LAC',88.5,87.5,92.5,59.0,82.0),
  ('build-qb-fran-tarkenton','Fran Tarkenton','MIN',79.0,87.5,90.5,96.0,88.5),
  ('build-qb-bart-starr','Bart Starr','GB',78.0,89.0,97.0,71.5,84.0),
  ('build-qb-jim-kelly','Jim Kelly','BUF',92.5,86.0,90.0,74.5,86.0),
  ('build-qb-ken-stabler','Ken Stabler','LV',86.0,80.0,86.0,73.5,81.5),
  ('build-qb-tom-brady','Tom Brady','NE',89.0,98.5,100.0,72.0,90.0),
  ('build-qb-peyton-manning','Peyton Manning','IND',90.0,98.5,100.0,68.0,89.0),
  ('build-qb-kurt-warner','Kurt Warner','LAR',85.5,92.5,95.0,64.0,84.5),
  ('build-qb-drew-brees','Drew Brees','NO',80.0,100.0,99.0,72.0,88.0),
  ('build-qb-ben-roethlisberger','Ben Roethlisberger','PIT',92.5,85.0,89.0,83.0,87.5),
  ('build-qb-philip-rivers','Philip Rivers','LAC',88.0,90.5,95.0,58.0,83.0),
  ('build-qb-eli-manning','Eli Manning','NYG',87.5,84.0,90.0,64.0,81.5),
  ('build-qb-donovan-mcnabb','Donovan McNabb','PHI',91.0,82.0,89.0,92.5,88.5),
  ('build-qb-steve-mcnair','Steve McNair','TEN',89.5,84.0,89.0,94.0,89.0),
  ('build-qb-daunte-culpepper','Daunte Culpepper','MIN',95.0,82.0,82.0,92.5,88.0),
  ('build-qb-michael-vick','Michael Vick','ATL',97.5,68.0,75.0,99.5,85.0),
  ('build-qb-carson-palmer','Carson Palmer','CIN',94.0,89.0,89.0,64.0,84.0),
  ('build-qb-rich-gannon','Rich Gannon','LV',80.5,90.0,94.0,87.0,88.0),
  ('build-qb-matt-hasselbeck','Matt Hasselbeck','SEA',80.0,89.0,90.5,70.5,82.5),
  ('build-qb-chad-pennington','Chad Pennington','NYJ',65.0,90.5,91.5,63.0,77.5),
  ('build-qb-jake-delhomme','Jake Delhomme','CAR',82.0,82.0,82.0,72.5,79.5),
  ('build-qb-aaron-rodgers','Aaron Rodgers','GB',97.5,99.0,99.0,92.5,97.0),
  ('build-qb-matthew-stafford','Matthew Stafford','DET',98.0,91.5,94.5,75.5,90.0),
  ('build-qb-matt-ryan','Matt Ryan','ATL',82.5,92.5,94.5,68.5,84.5),
  ('build-qb-tony-romo','Tony Romo','DAL',84.0,90.5,92.0,85.5,88.0),
  ('build-qb-joe-flacco','Joe Flacco','BAL',94.0,78.5,81.5,62.0,79.0),
  ('build-qb-jay-cutler','Jay Cutler','CHI',95.0,78.0,78.0,80.0,83.0),
  ('build-qb-alex-smith','Alex Smith','KC',80.0,89.0,91.5,87.0,87.0),
  ('build-qb-ryan-fitzpatrick','Ryan Fitzpatrick','BUF',80.0,78.0,88.0,78.5,81.0),
  ('build-qb-mark-sanchez','Mark Sanchez','NYJ',82.5,72.0,70.0,72.5,74.5),
  ('build-qb-vince-young','Vince Young','TEN',87.0,66.5,65.0,95.5,78.5),
  ('build-qb-matt-schaub','Matt Schaub','HOU',80.0,87.5,89.0,68.5,81.5),
  ('build-qb-patrick-mahomes','Patrick Mahomes','KC',99.5,96.0,98.0,95.5,97.5),
  ('build-qb-lamar-jackson','Lamar Jackson','BAL',95.5,93.5,95.5,100.0,96.0),
  ('build-qb-josh-allen','Josh Allen','BUF',100.0,93.5,95.5,98.0,97.0),
  ('build-qb-russell-wilson','Russell Wilson','SEA',91.5,89.0,86.5,94.0,90.5),
  ('build-qb-cam-newton','Cam Newton','CAR',95.0,68.5,77.0,98.0,84.5),
  ('build-qb-andrew-luck','Andrew Luck','IND',92.5,84.5,92.5,91.0,90.0),
  ('build-qb-kirk-cousins','Kirk Cousins','MIN',82.5,92.5,94.0,68.0,84.5),
  ('build-qb-jared-goff','Jared Goff','DET',83.5,94.5,93.0,65.0,84.0),
  ('build-qb-dak-prescott','Dak Prescott','DAL',89.5,91.5,92.5,84.0,89.5),
  ('build-qb-andy-dalton','Andy Dalton','CIN',79.0,84.5,85.5,77.5,81.5),
  ('build-qb-jalen-hurts','Jalen Hurts','PHI',86.0,85.5,88.0,96.5,89.0),
  ('build-qb-joe-burrow','Joe Burrow','CIN',90.5,99.5,98.5,83.0,93.0),
  ('build-qb-justin-herbert','Justin Herbert','LAC',98.0,90.5,94.5,85.5,92.0),
  ('build-qb-derek-carr','Derek Carr','LV',89.5,89.0,89.0,73.5,85.5),
  ('build-qb-ryan-tannehill','Ryan Tannehill','TEN',84.0,86.0,86.5,85.5,85.5),
  ('build-qb-baker-mayfield','Baker Mayfield','TB',92.5,90.5,88.0,82.0,88.5),
  ('build-qb-jameis-winston','Jameis Winston','TB',91.5,76.0,70.0,76.5,78.5),
  ('build-qb-nick-foles','Nick Foles','PHI',83.5,81.5,81.5,68.0,78.5),
  ('build-qb-colin-kaepernick','Colin Kaepernick','SF',92.5,69.0,76.0,98.0,84.0),
  ('build-qb-deshaun-watson','Deshaun Watson','HOU',87.0,90.5,89.5,92.5,90.0),
  ('build-qb-kyler-murray','Kyler Murray','ARI',92.5,84.5,81.5,98.5,89.5),
  ('build-qb-brock-purdy','Brock Purdy','SF',79.5,93.5,94.5,83.0,87.5),
  ('build-qb-tua-tagovailoa','Tua Tagovailoa','MIA',80.5,96.0,94.0,74.5,86.5),
  ('build-qb-trevor-lawrence','Trevor Lawrence','JAX',91.0,84.0,82.5,84.0,85.5),
  ('build-qb-carson-wentz','Carson Wentz','PHI',91.0,76.0,75.0,84.0,81.5),
  ('build-qb-jimmy-garoppolo','Jimmy Garoppolo','SF',75.5,90.0,87.5,71.5,81.0),
  ('build-qb-c-j-stroud','C.J. Stroud','HOU',88.5,92.5,94.0,82.0,89.5),
  ('build-qb-jordan-love','Jordan Love','GB',94.0,87.0,87.5,85.5,88.5),
  ('build-qb-marcus-mariota','Marcus Mariota','TEN',83.5,80.0,79.5,94.0,84.5),
  ('build-qb-teddy-bridgewater','Teddy Bridgewater','MIN',74.5,87.5,89.0,78.5,82.5),
  ('build-qb-bo-nix','Bo Nix','DEN',83.0,86.0,90.5,88.5,87.0),
  ('build-qb-jayden-daniels','Jayden Daniels','WAS',87.5,97.5,94.5,98.0,94.5),
  ('build-qb-caleb-williams','Caleb Williams','CHI',94.0,82.5,79.5,92.5,87.0),
  ('build-qb-daniel-jones','Daniel Jones','NYG',86.0,81.5,80.5,89.5,84.5),
  ('build-qb-sam-darnold','Sam Darnold','MIN',89.5,81.5,78.5,82.0,83.0),
  ('build-qb-gardner-minshew','Gardner Minshew','JAX',71.0,78.5,81.5,77.5,77.0),
  ('build-qb-tyrod-taylor','Tyrod Taylor','BUF',80.5,83.0,85.5,94.0,86.0),
  ('build-qb-mitchell-trubisky','Mitchell Trubisky','CHI',84.0,68.0,67.5,87.0,76.5),
  ('build-qb-blake-bortles','Blake Bortles','JAX',89.5,69.0,65.5,80.0,76.0),
  ('build-qb-sam-bradford','Sam Bradford','LAR',87.5,90.5,87.5,63.0,82.0),
  ('build-qb-tim-tebow','Tim Tebow','DEN',84.5,55.0,59.0,92.5,73.0),
  ('build-qb-colt-mccoy','Colt McCoy','CLE',71.0,83.0,84.0,75.5,78.5),
  ('build-qb-geno-smith','Geno Smith','SEA',88.5,91.5,88.0,81.0,87.5),
  ('build-qb-justin-fields','Justin Fields','CHI',91.5,66.5,64.5,98.0,80.0),
  ('build-qb-robert-griffin-iii','Robert Griffin III','WAS',89.5,81.5,77.0,99.0,87.0),
  ('build-qb-zach-wilson','Zach Wilson','NYJ',92.5,64.5,57.0,85.5,75.0),
  ('build-qb-anthony-richardson','Anthony Richardson','IND',98.5,59.0,58.0,98.5,78.5),
  ('build-qb-bryce-young','Bryce Young','CAR',77.0,83.0,81.5,84.0,81.5),
  ('build-qb-drake-maye','Drake Maye','NE',92.5,86.0,85.5,92.5,89.0),
  ('build-qb-trey-lance','Trey Lance','SF',94.0,60.5,54.0,94.0,75.5),
  ('build-qb-mac-jones','Mac Jones','NE',76.5,84.5,84.0,60.0,76.5),
  ('build-qb-johnny-manziel','Johnny Manziel','CLE',82.0,62.5,52.0,94.0,72.5),
  ('build-qb-will-levis','Will Levis','TEN',95.5,66.5,59.0,89.5,77.5),
  ('build-qb-case-keenum','Case Keenum','MIN',73.5,81.5,81.5,74.5,78.0),
  ('build-qb-jacoby-brissett','Jacoby Brissett','IND',84.5,83.0,84.0,76.5,82.0),
  ('build-qb-blaine-gabbert','Blaine Gabbert','JAX',91.0,73.0,70.5,83.0,79.5),
  ('build-qb-josh-rosen','Josh Rosen','ARI',86.0,74.5,66.5,62.0,72.5),
  ('build-qb-sam-howell','Sam Howell','WAS',87.5,76.0,70.5,82.0,79.0),
  ('build-qb-desmond-ridder','Desmond Ridder','ATL',83.5,73.0,72.5,84.0,78.5),
  ('build-qb-malik-willis','Malik Willis','TEN',94.0,62.5,60.0,96.5,78.5),
  ('build-qb-spencer-rattler','Spencer Rattler','NO',91.5,77.5,72.5,80.0,80.5),
  ('build-qb-drew-lock','Drew Lock','DEN',94.0,68.0,65.5,82.0,77.5),
  ('build-qb-dwayne-haskins','Dwayne Haskins','WAS',91.0,70.0,66.5,70.5,74.5),
  ('build-qb-kenny-pickett','Kenny Pickett','PIT',82.5,81.5,80.5,81.0,81.5),
  ('build-qb-michael-penix-jr','Michael Penix Jr.','ATL',94.0,85.5,83.0,75.5,84.5),
  ('build-qb-j-j-mccarthy','J.J. McCarthy','MIN',86.0,83.0,81.5,88.5,85.0),
  ('build-qb-cam-ward','Cam Ward','TEN',92.5,86.0,84.0,91.0,88.5),
  ('build-qb-jaxson-dart','Jaxson Dart','NYG',88.5,80.0,78.5,87.0,83.5),
  ('build-qb-shedeur-sanders','Shedeur Sanders','CLE',83.0,86.0,83.0,78.5,82.5)
on conflict(item_reference) do update set
  display_name=excluded.display_name,
  team_code=excluded.team_code,
  arm=excluded.arm,
  accuracy=excluded.accuracy,
  processing=excluded.processing,
  mobility=excluded.mobility,
  overall=excluded.overall;

-- The generic Weekly catalog now carries player-career grading packets.
alter table private.football_weekly_auction_items
  alter column season_year drop not null,
  add column if not exists grading_inputs jsonb not null default '{}'::jsonb;

insert into private.football_weekly_auction_subjects(
  subject_key,display_name,short_label,competition_level,item_kind,
  rotation_order,eligible_from,is_active
) values (
  'nfl-build-qb',
  'NFL Build a QB',
  'Build a QB',
  'NFL',
  'player-career',
  1,
  date '2026-09-22',
  true
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
  qb.item_reference,
  'nfl-build-qb',
  null,
  qb.display_name,
  null,
  qb.team_code,
  'QB',
  qb.display_name,
  qb.display_name,
  qb.overall,
  null,
  jsonb_build_object(
    'Arm',qb.arm,
    'Accuracy',qb.accuracy,
    'Processing',qb.processing,
    'Mobility',qb.mobility,
    'overall',qb.overall
  )
from private.nfl_build_qb_v2_authority qb
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

-- Genericize the existing board just enough for a four-trait player-career subject.
alter table private.football_weekly_auction_board
  add column if not exists trait text;

alter table private.football_weekly_auction_board
  drop constraint if exists football_weekly_auction_board_slot_check,
  drop constraint if exists football_weekly_auction_board_theme_check,
  drop constraint if exists football_weekly_auction_board_hidden_shape_check,
  add constraint football_weekly_auction_board_slot_check check (slot between 1 and 4),
  add constraint football_weekly_auction_board_theme_check check (
    theme in ('SEC','Big Ten','Big 12','ACC','Wildcard','NFL')
  ),
  add constraint football_weekly_auction_board_hidden_shape_check check (
    hidden_shape in (
      'Wide','Compressed','TopHeavy','MiddleHeavy','Trap','Chaotic',
      'Premium','Standard','Grinder','Chaos'
    )
  ),
  add constraint football_weekly_auction_board_trait_check check (
    trait is null or trait in ('Arm','Accuracy','Processing','Mobility')
  );

alter table private.football_weekly_auction_bids
  drop constraint if exists football_weekly_auction_bids_slot_check,
  add constraint football_weekly_auction_bids_slot_check check (slot between 1 and 4);

create table if not exists private.football_weekly_auction_trait_passes (
  week_start date not null,
  profile_id uuid not null,
  trait text not null check (trait in ('Arm','Accuracy','Processing','Mobility')),
  used_day_index integer not null check (used_day_index between 1 and 7),
  used_at timestamptz not null,
  primary key(week_start,profile_id,trait),
  foreign key(week_start,profile_id)
    references private.football_weekly_auction_participants(week_start,profile_id)
    on delete cascade
);
revoke all on private.football_weekly_auction_trait_passes from public, anon, authenticated;

create or replace function private.nfl_build_qb_v2_trait_grade(
  p_item_reference text,
  p_trait text
)
returns numeric
language sql
stable security definer
set search_path=''
as $$
  select case p_trait
    when 'Arm' then qb.arm
    when 'Accuracy' then qb.accuracy
    when 'Processing' then qb.processing
    when 'Mobility' then qb.mobility
    else null
  end
  from private.nfl_build_qb_v2_authority qb
  where qb.item_reference=p_item_reference;
$$;
revoke all on function private.nfl_build_qb_v2_trait_grade(text,text) from public,anon,authenticated;

create or replace function private.football_weekly_auction_subject_for_week(p_week_start date)
returns text
language sql
stable security definer
set search_path=''
as $$
  with eligible as (
    select
      subject.subject_key,
      row_number() over(order by subject.rotation_order,subject.subject_key)::integer as position,
      count(*) over()::integer as subject_count
    from private.football_weekly_auction_subjects subject
    where subject.is_active
      and subject.eligible_from <= p_week_start
  )
  select subject_key
  from eligible
  where position = 1 + mod(
    greatest(((p_week_start - date '2026-09-15') / 7),0),
    subject_count
  )
  limit 1;
$$;
revoke all on function private.football_weekly_auction_subject_for_week(date) from public,anon,authenticated;

create or replace function private.football_weekly_auction_cards_per_day(p_week_start date)
returns integer
language sql
stable security definer
set search_path=''
as $$
  select case week.subject_key when 'nfl-build-qb' then 4 else 3 end
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

-- Preserve the exact current CFB owners before routing the shared lifecycle by subject.
do $clone_weekly_cfb_owners$
declare d text; n text;
begin
  if to_regprocedure('private.materialize_football_weekly_auction_week_cfb(date)') is null then
    d:=pg_get_functiondef('private.materialize_football_weekly_auction_week(date)'::regprocedure);
    n:=replace(d,
      'private.materialize_football_weekly_auction_week(p_week_start date)',
      'private.materialize_football_weekly_auction_week_cfb(p_week_start date)');
    if n=d then raise exception 'Weekly CFB materializer clone drifted'; end if;
    execute n;
  end if;

  if to_regprocedure('private.resolve_football_weekly_auction_day_cfb(date,integer,timestamptz)') is null then
    d:=pg_get_functiondef('private.resolve_football_weekly_auction_day(date,integer,timestamptz)'::regprocedure);
    n:=replace(d,
      'private.resolve_football_weekly_auction_day(p_week_start date, p_day_index integer, p_at timestamp with time zone DEFAULT now())',
      'private.resolve_football_weekly_auction_day_cfb(p_week_start date, p_day_index integer, p_at timestamp with time zone DEFAULT now())');
    if n=d then raise exception 'Weekly CFB resolver clone drifted'; end if;
    execute n;
  end if;

  if to_regprocedure('private.finalize_football_weekly_auction_week_cfb(date,timestamptz)') is null then
    d:=pg_get_functiondef('private.finalize_football_weekly_auction_week(date,timestamptz)'::regprocedure);
    n:=replace(d,
      'private.finalize_football_weekly_auction_week(p_week_start date, p_at timestamp with time zone DEFAULT now())',
      'private.finalize_football_weekly_auction_week_cfb(p_week_start date, p_at timestamp with time zone DEFAULT now())');
    if n=d then raise exception 'Weekly CFB finalizer clone drifted'; end if;
    execute n;
  end if;

  if to_regprocedure('private.football_weekly_auction_final_payload_cfb(date,uuid)') is null then
    d:=pg_get_functiondef('private.football_weekly_auction_final_payload(date,uuid)'::regprocedure);
    n:=replace(d,
      'private.football_weekly_auction_final_payload(p_week_start date, p_profile_id uuid)',
      'private.football_weekly_auction_final_payload_cfb(p_week_start date, p_profile_id uuid)');
    if n=d then raise exception 'Weekly CFB final payload clone drifted'; end if;
    execute n;
  end if;

  if to_regprocedure('private.get_my_football_weekly_auction_cfb(timestamptz)') is null then
    d:=pg_get_functiondef('public.get_my_football_weekly_auction(timestamptz)'::regprocedure);
    n:=replace(d,
      'public.get_my_football_weekly_auction(p_at timestamp with time zone DEFAULT now())',
      'private.get_my_football_weekly_auction_cfb(p_at timestamp with time zone DEFAULT now())');
    if n=d then raise exception 'Weekly CFB getter clone drifted'; end if;
    execute n;
  end if;

  if to_regprocedure('private.submit_my_football_weekly_auction_bids_cfb(jsonb,timestamptz)') is null then
    d:=pg_get_functiondef('public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)'::regprocedure);
    n:=replace(d,
      'public.submit_my_football_weekly_auction_bids(p_bids jsonb, p_at timestamp with time zone DEFAULT now())',
      'private.submit_my_football_weekly_auction_bids_cfb(p_bids jsonb, p_at timestamp with time zone DEFAULT now())');
    if n=d then raise exception 'Weekly CFB submit clone drifted'; end if;
    execute n;
  end if;
end
$clone_weekly_cfb_owners$;

revoke all on function private.materialize_football_weekly_auction_week_cfb(date) from public,anon,authenticated;
revoke all on function private.resolve_football_weekly_auction_day_cfb(date,integer,timestamptz) from public,anon,authenticated;
revoke all on function private.finalize_football_weekly_auction_week_cfb(date,timestamptz) from public,anon,authenticated;
revoke all on function private.football_weekly_auction_final_payload_cfb(date,uuid) from public,anon,authenticated;
revoke all on function private.get_my_football_weekly_auction_cfb(timestamptz) from public,anon,authenticated;
revoke all on function private.submit_my_football_weekly_auction_bids_cfb(jsonb,timestamptz) from public,anon,authenticated;

create or replace function private.materialize_football_weekly_build_qb_week(p_week_start date)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_attempt integer;
  v_trait text;
  v_trait_slot integer;
  v_day integer;
  v_roll double precision;
  v_caliber text;
  v_bands text[];
  v_band text;
  v_pick private.nfl_build_qb_v2_authority;
  v_grade numeric;
  v_used_refs text[];
  v_low_count integer;
  v_lock_at timestamptz;
  v_existing integer;
begin
  if extract(isodow from p_week_start)<>2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(p_week_start,'nfl-build-qb')
  on conflict(week_start) do nothing;

  if (select subject_key from private.football_weekly_auction_weeks where week_start=p_week_start) <> 'nfl-build-qb' then
    raise exception 'NFL Build a QB materializer requires an NFL Build a QB week';
  end if;

  select count(*) into v_existing
  from private.football_weekly_auction_board
  where week_start=p_week_start;

  if v_existing=28 then return; end if;
  if v_existing<>0 then
    raise exception 'NFL Build a QB week already has a partial board';
  end if;

  v_roll:=random();
  v_caliber:=case
    when v_roll<0.15 then 'Premium'
    when v_roll<0.75 then 'Standard'
    when v_roll<0.95 then 'Grinder'
    else 'Chaos'
  end;

  <<attempt_loop>>
  for v_attempt in 1..500 loop
    delete from private.football_weekly_auction_board where week_start=p_week_start;
    v_used_refs:=array[]::text[];

    foreach v_trait in array array['Arm','Accuracy','Processing','Mobility']::text[] loop
      v_trait_slot:=case v_trait when 'Arm' then 1 when 'Accuracy' then 2 when 'Processing' then 3 else 4 end;
      v_low_count:=0;

      select array_agg(source.band order by random())
      into v_bands
      from unnest(
        case v_caliber
          when 'Premium' then array['96+','96+','90-95.5','90-95.5','90-95.5','84-89.5','84-89.5']::text[]
          when 'Standard' then array['96+','90-95.5','90-95.5','84-89.5','84-89.5','78-83.5','78-83.5']::text[]
          when 'Grinder' then array['90-95.5','84-89.5','84-89.5','78-83.5','78-83.5','70-77.5','70-77.5']::text[]
          else array['96+','90-95.5','84-89.5','78-83.5','70-77.5','WILD','WILD']::text[]
        end
      ) as source(band);

      for v_day in 1..7 loop
        v_band:=v_bands[v_day];
        v_pick:=null;

        select qb.*
        into v_pick
        from private.nfl_build_qb_v2_authority qb
        where not (qb.item_reference=any(v_used_refs))
          and (
            case v_trait
              when 'Arm' then qb.arm
              when 'Accuracy' then qb.accuracy
              when 'Processing' then qb.processing
              else qb.mobility
            end
          ) between 0 and 100
          and (
            v_band='WILD'
            or (v_band='96+' and private.nfl_build_qb_v2_trait_grade(qb.item_reference,v_trait)>=96)
            or (v_band='90-95.5' and private.nfl_build_qb_v2_trait_grade(qb.item_reference,v_trait)>=90 and private.nfl_build_qb_v2_trait_grade(qb.item_reference,v_trait)<96)
            or (v_band='84-89.5' and private.nfl_build_qb_v2_trait_grade(qb.item_reference,v_trait)>=84 and private.nfl_build_qb_v2_trait_grade(qb.item_reference,v_trait)<90)
            or (v_band='78-83.5' and private.nfl_build_qb_v2_trait_grade(qb.item_reference,v_trait)>=78 and private.nfl_build_qb_v2_trait_grade(qb.item_reference,v_trait)<84)
            or (v_band='70-77.5' and private.nfl_build_qb_v2_trait_grade(qb.item_reference,v_trait)>=70 and private.nfl_build_qb_v2_trait_grade(qb.item_reference,v_trait)<78)
          )
          and not (
            v_caliber='Chaos'
            and v_band='WILD'
            and v_low_count>=1
            and private.nfl_build_qb_v2_trait_grade(qb.item_reference,v_trait)<70
          )
        order by random()
        limit 1;

        if v_pick.item_reference is null then
          continue attempt_loop;
        end if;

        v_grade:=private.nfl_build_qb_v2_trait_grade(v_pick.item_reference,v_trait);
        if v_grade<70 then v_low_count:=v_low_count+1; end if;
        v_used_refs:=array_append(v_used_refs,v_pick.item_reference);
        v_lock_at:=((p_week_start+v_day)::timestamp at time zone 'America/Chicago');

        insert into private.football_weekly_auction_board(
          week_start,day_index,theme,hidden_shape,slot,season_reference,lock_at,trait
        ) values (
          p_week_start,v_day,'NFL',v_caliber,v_trait_slot,v_pick.item_reference,v_lock_at,v_trait
        );
      end loop;
    end loop;

    if (select count(*) from private.football_weekly_auction_board where week_start=p_week_start)=28
      and (select count(distinct season_reference) from private.football_weekly_auction_board where week_start=p_week_start)=28
      and not exists (
        select trait
        from private.football_weekly_auction_board
        where week_start=p_week_start
        group by trait
        having count(*)<>7
      )
    then
      return;
    end if;
  end loop;

  raise exception 'Unable to materialize a valid NFL Build a QB Weekly board';
end;
$$;
revoke all on function private.materialize_football_weekly_build_qb_week(date) from public,anon,authenticated;

create or replace function private.materialize_football_weekly_auction_week(p_week_start date)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare v_subject text;
begin
  if p_week_start < date '2026-09-15' then return; end if;
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
    select subject_key into v_subject from private.football_weekly_auction_weeks where week_start=p_week_start;
  end if;

  if v_subject='nfl-build-qb' then
    perform private.materialize_football_weekly_build_qb_week(p_week_start);
  else
    perform private.materialize_football_weekly_auction_week_cfb(p_week_start);
  end if;
end;
$$;
revoke all on function private.materialize_football_weekly_auction_week(date) from public,anon,authenticated;

-- Make the board authority guard subject-aware.
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

  if v_subject='nfl-build-qb' then
    if new.trait not in ('Arm','Accuracy','Processing','Mobility')
      or new.theme<>'NFL'
      or new.slot<>(case new.trait when 'Arm' then 1 when 'Accuracy' then 2 when 'Processing' then 3 else 4 end)
      or not exists (
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

create or replace function private.football_weekly_auction_bids_preserve_required_completion(
  p_bankroll integer,
  p_required integer,
  p_owned integer,
  p_bids integer[]
)
returns boolean
language sql
immutable
set search_path=''
as $$
  with normalized as (
    select greatest(p_required-p_owned,0) as needed,
           coalesce((select sum(value) from unnest(p_bids) value),0)::integer as committed
  )
  select
    p_bankroll>=0
    and p_required>=0
    and p_owned between 0 and p_required
    and not exists(select 1 from unnest(p_bids) value where value<0)
    and normalized.committed<=p_bankroll
    and (
      normalized.needed<=1
      or not exists (
        select 1
        from generate_series(1,normalized.needed-1) as possible_wins
        where (
          select coalesce(sum(value),0)
          from (
            select value
            from unnest(p_bids) value
            order by value desc
            limit possible_wins
          ) ranked_bids
        ) > p_bankroll-(normalized.needed-possible_wins)
      )
    )
  from normalized;
$$;
revoke all on function private.football_weekly_auction_bids_preserve_required_completion(integer,integer,integer,integer[]) from public,anon,authenticated;

create or replace function private.football_weekly_auction_bids_preserve_completion(
  p_bankroll integer,p_owned integer,p_bid1 integer,p_bid2 integer,p_bid3 integer
)
returns boolean
language sql
immutable
set search_path=''
as $$
  select private.football_weekly_auction_bids_preserve_required_completion(
    p_bankroll,3,p_owned,array[p_bid1,p_bid2,p_bid3]
  );
$$;
revoke all on function private.football_weekly_auction_bids_preserve_completion(integer,integer,integer,integer,integer) from public,anon,authenticated;

create or replace function private.resolve_football_weekly_build_qb_day(
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
  v_slot integer;
  v_trait text;
  v_winner uuid;
  v_amount integer;
  v_lock_at timestamptz;
begin
  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start=p_week_start and day_index=p_day_index;

  if v_lock_at is null then raise exception 'Weekly Auction day is not materialized'; end if;
  if p_at<v_lock_at then return; end if;

  -- A pass is consumed only at lock. Editing a $0 bid to positive before lock
  -- therefore preserves the player's one free pass for that trait.
  insert into private.football_weekly_auction_trait_passes(
    week_start,profile_id,trait,used_day_index,used_at
  )
  select
    p_week_start,
    participant.profile_id,
    board.trait,
    p_day_index,
    p_at
  from private.football_weekly_auction_participants participant
  join private.football_weekly_auction_board board
    on board.week_start=p_week_start
   and board.day_index=p_day_index
  left join private.football_weekly_auction_bids bid
    on bid.week_start=p_week_start
   and bid.day_index=p_day_index
   and bid.profile_id=participant.profile_id
   and bid.slot=board.slot
  where participant.week_start=p_week_start
    and board.trait is not null
    and coalesce(bid.amount,0)=0
    and not exists (
      select 1
      from private.football_weekly_auction_awards prior_award
      join private.football_weekly_auction_board prior_board
        on prior_board.week_start=prior_award.week_start
       and prior_board.day_index=prior_award.day_index
       and prior_board.slot=prior_award.slot
      where prior_award.week_start=p_week_start
        and prior_award.profile_id=participant.profile_id
        and prior_board.trait=board.trait
    )
  on conflict(week_start,profile_id,trait) do nothing;

  for v_slot in 1..4 loop
    if exists (
      select 1 from private.football_weekly_auction_awards
      where week_start=p_week_start and day_index=p_day_index and slot=v_slot
    ) then continue; end if;

    select trait into v_trait
    from private.football_weekly_auction_board
    where week_start=p_week_start and day_index=p_day_index and slot=v_slot;

    v_winner:=null;
    v_amount:=0;

    select bid.profile_id,bid.amount
    into v_winner,v_amount
    from private.football_weekly_auction_bids bid
    where bid.week_start=p_week_start
      and bid.day_index=p_day_index
      and bid.slot=v_slot
      and bid.amount>0
      and exists (
        select 1 from private.football_weekly_auction_participants participant
        where participant.week_start=bid.week_start
          and participant.profile_id=bid.profile_id
      )
      and not exists (
        select 1
        from private.football_weekly_auction_awards prior_award
        join private.football_weekly_auction_board prior_board
          on prior_board.week_start=prior_award.week_start
         and prior_board.day_index=prior_award.day_index
         and prior_board.slot=prior_award.slot
        where prior_award.week_start=p_week_start
          and prior_award.profile_id=bid.profile_id
          and prior_board.trait=v_trait
      )
    order by
      bid.amount desc,
      (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start=p_week_start
          and award.profile_id=bid.profile_id
          and award.day_index<p_day_index
      ) asc,
      (
        select coalesce(sum(award.winning_bid),0)
        from private.football_weekly_auction_awards award
        where award.week_start=p_week_start
          and award.profile_id=bid.profile_id
          and award.day_index<p_day_index
      ) asc,
      random()
    limit 1;

    insert into private.football_weekly_auction_awards(
      week_start,day_index,slot,profile_id,winning_bid,resolved_at
    ) values (
      p_week_start,p_day_index,v_slot,v_winner,coalesce(v_amount,0),p_at
    );
  end loop;
end;
$$;
revoke all on function private.resolve_football_weekly_build_qb_day(date,integer,timestamptz) from public,anon,authenticated;

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
  if v_subject='nfl-build-qb' then
    perform private.resolve_football_weekly_build_qb_day(p_week_start,p_day_index,p_at);
  else
    perform private.resolve_football_weekly_auction_day_cfb(p_week_start,p_day_index,p_at);
  end if;
end;
$$;
revoke all on function private.resolve_football_weekly_auction_day(date,integer,timestamptz) from public,anon,authenticated;

create or replace function private.finalize_football_weekly_build_qb_week(
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

  if (select count(*) from private.football_weekly_auction_awards where week_start=p_week_start)<>28 then
    return;
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
      board.season_reference,
      board.trait,
      private.nfl_build_qb_v2_trait_grade(board.season_reference,board.trait) as trait_grade,
      award.winning_bid
    from private.football_weekly_auction_awards award
    join private.football_weekly_auction_board board
      on board.week_start=award.week_start
     and board.day_index=award.day_index
     and board.slot=award.slot
    where award.week_start=p_week_start
      and award.profile_id is not null
  ),
  summarized as (
    select
      participant.profile_id,
      count(owned.season_reference)::integer as owned_count,
      case when count(distinct owned.trait)=4
        then round(avg(owned.trait_grade),2)
        else null end as final_score,
      case when count(distinct owned.trait)=4
        then sum(owned.winning_bid)::integer
        else null end as scoring_cost,
      coalesce(
        array_agg(owned.season_reference order by owned.trait)
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
revoke all on function private.finalize_football_weekly_build_qb_week(date,timestamptz) from public,anon,authenticated;

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
  select subject_key into v_subject from private.football_weekly_auction_weeks where week_start=p_week_start;
  if v_subject='nfl-build-qb' then
    perform private.finalize_football_weekly_build_qb_week(p_week_start,p_at);
  else
    perform private.finalize_football_weekly_auction_week_cfb(p_week_start,p_at);
  end if;
end;
$$;
revoke all on function private.finalize_football_weekly_auction_week(date,timestamptz) from public,anon,authenticated;

create or replace function private.maintain_football_weekly_auction(p_at timestamptz default now())
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_week_start date;
  v_due record;
  v_week record;
begin
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then return; end if;

  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.materialize_football_weekly_auction_week(v_week_start);
  perform private.materialize_football_weekly_auction_participants(v_week_start);

  if (
    select week.subject_key='nfl-build-qb'
      and (
        select count(*)
        from private.football_weekly_auction_participants participant
        where participant.week_start=v_week_start
      ) <> 6
    from private.football_weekly_auction_weeks week
    where week.week_start=v_week_start
  ) then
    raise exception 'NFL Build a QB Weekly requires exactly six locked participants';
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
      ) = private.football_weekly_auction_cards_per_week(week.week_start)
  loop
    perform private.finalize_football_weekly_auction_week(v_week.week_start,p_at);
  end loop;
end;
$$;
revoke all on function private.maintain_football_weekly_auction(timestamptz) from public,anon,authenticated;

create or replace function private.football_weekly_build_qb_final_payload(
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
  my_owned as (
    select
      board.season_reference as item_reference,
      qb.display_name,
      qb.team_code,
      board.trait,
      private.nfl_build_qb_v2_trait_grade(board.season_reference,board.trait) as grade,
      award.winning_bid
    from private.football_weekly_auction_awards award
    join private.football_weekly_auction_board board
      on board.week_start=award.week_start
     and board.day_index=award.day_index
     and board.slot=award.slot
    join private.nfl_build_qb_v2_authority qb on qb.item_reference=board.season_reference
    where award.week_start=p_week_start
      and award.profile_id=p_profile_id
  ),
  collection as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'item_reference',item_reference,
      'display_name',display_name,
      'team_code',team_code,
      'trait',trait,
      'grade',grade,
      'winning_bid',winning_bid,
      'counts',true
    ) order by trait),'[]'::jsonb) as payload
    from my_owned
  ),
  all_items as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'day_index',board.day_index,
      'slot',board.slot,
      'item_reference',board.season_reference,
      'display_name',qb.display_name,
      'team_code',qb.team_code,
      'trait',board.trait,
      'grade',private.nfl_build_qb_v2_trait_grade(board.season_reference,board.trait),
      'winning_bid',award.winning_bid,
      'winner_profile_id',award.profile_id,
      'winner_display_name',profile.display_name
    ) order by board.day_index,board.slot),'[]'::jsonb) as payload
    from private.football_weekly_auction_board board
    join private.nfl_build_qb_v2_authority qb on qb.item_reference=board.season_reference
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
    'subject_key','nfl-build-qb',
    'week_start',p_week_start,
    'standings',standings.payload,
    'collection',collection.payload,
    'all_teams',all_items.payload,
    'my_result',coalesce(mine.payload,'{}'::jsonb)
  )
  from standings,collection,all_items
  left join mine on true;
$$;
revoke all on function private.football_weekly_build_qb_final_payload(date,uuid) from public,anon,authenticated;

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
  select subject_key into v_subject from private.football_weekly_auction_weeks where week_start=p_week_start;
  if v_subject='nfl-build-qb' then
    return private.football_weekly_build_qb_final_payload(p_week_start,p_profile_id);
  end if;
  return private.football_weekly_auction_final_payload_cfb(p_week_start,p_profile_id)
    || jsonb_build_object('subject_key',coalesce(v_subject,'cfb-best-teams-since-2000'));
end;
$$;
revoke all on function private.football_weekly_auction_final_payload(date,uuid) from public,anon,authenticated;

create or replace function private.get_my_football_weekly_build_qb(p_at timestamptz default now())
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
  v_passes jsonb;
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
      'subject_key','nfl-build-qb',
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
    40-coalesce(sum(award.winning_bid),0)::integer,
    count(*)::integer
  into v_bankroll,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=v_week_start
    and award.profile_id=v_profile;

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
    'item_reference',board.season_reference,
    'display_name',qb.display_name,
    'team_code',qb.team_code,
    'trait',board.trait,
    'lock_at',board.lock_at
  ) order by board.slot),'[]'::jsonb)
  into v_cards
  from private.football_weekly_auction_board board
  join private.nfl_build_qb_v2_authority qb on qb.item_reference=board.season_reference
  where board.week_start=v_week_start and board.day_index=v_day_index;

  select coalesce(jsonb_object_agg(bid.slot::text,bid.amount),'{}'::jsonb)
  into v_bids
  from private.football_weekly_auction_bids bid
  where bid.week_start=v_week_start
    and bid.day_index=v_day_index
    and bid.profile_id=v_profile;

  select coalesce(jsonb_object_agg(source.trait,source.used),'{}'::jsonb)
  into v_passes
  from (
    select trait,true as used
    from private.football_weekly_auction_trait_passes
    where week_start=v_week_start and profile_id=v_profile
  ) source;

  if v_day_index>1 then
    select coalesce(jsonb_agg(result_row.payload order by result_row.slot),'[]'::jsonb)
    into v_prior_results
    from (
      select
        board.slot,
        jsonb_build_object(
          'slot',board.slot,
          'item_reference',board.season_reference,
          'display_name',qb.display_name,
          'team_code',qb.team_code,
          'trait',board.trait,
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
            where entry.week_start=v_week_start
              and entry.day_index=v_day_index-1
          ),'[]'::jsonb)
        ) as payload
      from private.football_weekly_auction_board board
      join private.nfl_build_qb_v2_authority qb on qb.item_reference=board.season_reference
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
    'item_reference',board.season_reference,
    'display_name',qb.display_name,
    'team_code',qb.team_code,
    'trait',board.trait,
    'winning_bid',award.winning_bid
  ) order by board.trait),'[]'::jsonb)
  into v_collection
  from private.football_weekly_auction_awards award
  join private.football_weekly_auction_board board
    on board.week_start=award.week_start
   and board.day_index=award.day_index
   and board.slot=award.slot
  join private.nfl_build_qb_v2_authority qb on qb.item_reference=board.season_reference
  where award.week_start=v_week_start
    and award.profile_id=v_profile;

  return jsonb_build_object(
    'available',true,
    'subject_key','nfl-build-qb',
    'week_start',v_week_start,
    'week_end',v_week_start+6,
    'day_index',v_day_index,
    'bankroll',v_bankroll,
    'owned_count',v_owned,
    'reserve_floor',0,
    'max_commit',v_bankroll,
    'submitted_today',v_submitted,
    'show_intro',v_show_intro,
    'teams',v_cards,
    'bids',v_bids,
    'trait_passes',v_passes,
    'prior_results',v_prior_results,
    'collection',v_collection,
    'previous_final',v_previous_final
  );
end;
$$;
revoke all on function private.get_my_football_weekly_build_qb(timestamptz) from public,anon,authenticated;

create or replace function private.submit_my_football_weekly_build_qb_bids(
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
  v_slot integer;
  v_bid integer;
  v_trait text;
  v_bids_array integer[]:=array[0,0,0,0];
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
    40-coalesce(sum(award.winning_bid),0)::integer,
    count(*)::integer
  into v_bankroll,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=v_week_start and award.profile_id=v_profile;

  for v_slot in 1..4 loop
    begin
      v_bid:=coalesce((p_bids->>v_slot::text)::integer,0);
    exception when others then
      raise exception 'Weekly Auction bids must be whole-dollar integers';
    end;

    if v_bid<0 or v_bid>40 then
      raise exception 'Weekly Auction bids must be between $0 and $40';
    end if;

    select trait into v_trait
    from private.football_weekly_auction_board
    where week_start=v_week_start and day_index=v_day_index and slot=v_slot;

    if v_trait is null then raise exception 'NFL Build a QB trait board is incomplete'; end if;

    if exists(
      select 1
      from private.football_weekly_auction_awards award
      join private.football_weekly_auction_board board
        on board.week_start=award.week_start
       and board.day_index=award.day_index
       and board.slot=award.slot
      where award.week_start=v_week_start
        and award.profile_id=v_profile
        and board.trait=v_trait
    ) then
      if v_bid<>0 then raise exception 'You already own the % trait',v_trait; end if;
    elsif v_bid=0 and exists(
      select 1 from private.football_weekly_auction_trait_passes pass
      where pass.week_start=v_week_start
        and pass.profile_id=v_profile
        and pass.trait=v_trait
    ) then
      raise exception 'Your free % pass is already used; bid at least $1',v_trait;
    end if;

    v_bids_array[v_slot]:=v_bid;
  end loop;

  if not private.football_weekly_auction_bids_preserve_required_completion(
    v_bankroll,4,v_owned,v_bids_array
  ) then
    raise exception 'Today''s bids must leave at least $1 for every Build a QB trait you could still need';
  end if;

  insert into private.football_weekly_auction_daily_entries(
    week_start,day_index,profile_id,submitted_at,updated_at
  ) values (
    v_week_start,v_day_index,v_profile,p_at,p_at
  )
  on conflict(week_start,day_index,profile_id)
  do update set updated_at=excluded.updated_at;

  for v_slot in 1..4 loop
    insert into private.football_weekly_auction_bids(
      week_start,day_index,profile_id,slot,amount,updated_at
    ) values (
      v_week_start,v_day_index,v_profile,v_slot,v_bids_array[v_slot],p_at
    )
    on conflict(week_start,day_index,profile_id,slot)
    do update set amount=excluded.amount,updated_at=excluded.updated_at;
  end loop;

  return public.get_my_football_weekly_auction(p_at);
end;
$$;
revoke all on function private.submit_my_football_weekly_build_qb_bids(jsonb,timestamptz) from public,anon,authenticated;

create or replace function public.get_my_football_weekly_auction(p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_week_start date;
  v_subject text;
begin
  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  select subject_key into v_subject from private.football_weekly_auction_weeks where week_start=v_week_start;

  if v_subject='nfl-build-qb' then
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
  v_week_start date;
  v_subject text;
begin
  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  select subject_key into v_subject from private.football_weekly_auction_weeks where week_start=v_week_start;

  if v_subject='nfl-build-qb' then
    return private.submit_my_football_weekly_build_qb_bids(p_bids,p_at);
  end if;
  return private.submit_my_football_weekly_auction_bids_cfb(p_bids,p_at);
end;
$$;
revoke all on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz) from public,anon;
grant execute on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz) to authenticated;

create or replace function public.get_football_weekly_build_qb_table(p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_subject text;
  v_table jsonb:='[]'::jsonb;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  select subject_key into v_subject from private.football_weekly_auction_weeks where week_start=v_week_start;
  if v_subject<>'nfl-build-qb' then return '[]'::jsonb; end if;

  with participants as (
    select profile_id
    from private.football_weekly_auction_participants
    where week_start=v_week_start
  ),
  summaries as (
    select
      participant.profile_id,
      coalesce(profile.display_name,'Player') as display_name,
      participant.profile_id=v_profile as is_current_user,
      40-coalesce(sum(award.winning_bid),0)::integer as bankroll,
      count(award.profile_id)::integer as owned_count,
      coalesce(jsonb_agg(jsonb_build_object(
        'item_reference',board.season_reference,
        'display_name',qb.display_name,
        'team_code',qb.team_code,
        'trait',board.trait,
        'price_paid',award.winning_bid
      ) order by board.trait) filter(where award.profile_id is not null),'[]'::jsonb) as traits
    from participants participant
    join public.profiles profile on profile.id=participant.profile_id
    left join private.football_weekly_auction_awards award
      on award.week_start=v_week_start and award.profile_id=participant.profile_id
    left join private.football_weekly_auction_board board
      on board.week_start=award.week_start
     and board.day_index=award.day_index
     and board.slot=award.slot
    left join private.nfl_build_qb_v2_authority qb on qb.item_reference=board.season_reference
    group by participant.profile_id,profile.display_name
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'profile_id',summary.profile_id,
    'display_name',summary.display_name,
    'is_current_user',summary.is_current_user,
    'bankroll',summary.bankroll,
    'owned_count',summary.owned_count,
    'traits',summary.traits
  ) order by summary.is_current_user desc,lower(summary.display_name),summary.profile_id),'[]'::jsonb)
  into v_table
  from summaries summary;

  return v_table;
end;
$$;
revoke all on function public.get_football_weekly_build_qb_table(timestamptz) from public,anon;
grant execute on function public.get_football_weekly_build_qb_table(timestamptz) to authenticated;

-- Weekly Auction champion bonuses remain exclusive to the CFB Teams subject.
-- NFL Build a QB winner does not receive a Daily Challenge win unless product
-- rules explicitly change later.
do $restrict_weekly_bonus_to_cfb$
declare d text; n text;
begin
  d:=pg_get_functiondef('public.get_daily_challenge_standings(text)'::regprocedure);
  n:=replace(
    d,
    'from private.football_weekly_auction_results auction_result',
    E'from private.football_weekly_auction_results auction_result\n          join private.football_weekly_auction_weeks auction_week\n            on auction_week.week_start = auction_result.week_start'
  );
  n:=replace(
    n,
    'and auction_result.is_winner',
    E'and auction_result.is_winner\n            and auction_week.subject_key = ''cfb-best-teams-since-2000'''
  );
  if n=d then raise exception 'Football Weekly bonus restriction patch drifted'; end if;
  execute n;
end
$restrict_weekly_bonus_to_cfb$;

-- Contract proofs.
do $nfl_build_qb_weekly_contract$
declare
  v_subject text;
begin
  if (select count(*) from private.nfl_build_qb_v2_authority)<>112 then
    raise exception 'NFL Build a QB v2 authority must contain 112 quarterbacks';
  end if;
  if exists(
    select 1 from private.nfl_build_qb_v2_authority
    where overall<>round((arm+accuracy+processing+mobility)/4*2)/2
  ) then
    raise exception 'NFL Build a QB v2 overall must be the half-point four-trait average';
  end if;

  if private.football_weekly_auction_subject_for_week(date '2026-09-15')<>'cfb-best-teams-since-2000'
    or private.football_weekly_auction_subject_for_week(date '2026-09-22')<>'nfl-build-qb'
    or private.football_weekly_auction_subject_for_week(date '2026-09-29')<>'cfb-best-teams-since-2000'
  then
    raise exception 'Football Weekly subject rotation drifted';
  end if;

  if not private.football_weekly_auction_bids_preserve_required_completion(40,4,0,array[37,1,1,1])
    or private.football_weekly_auction_bids_preserve_required_completion(40,4,0,array[40,0,0,0])
    or not private.football_weekly_auction_bids_preserve_required_completion(40,4,0,array[20,10,5,5])
  then
    raise exception 'NFL Build a QB completion-preserving bankroll contract drifted';
  end if;

  if exists (
    select 1
    from private.football_weekly_auction_weeks
    where week_start=date '2026-09-15'
      and subject_key is distinct from 'cfb-best-teams-since-2000'
  ) then
    raise exception 'NFL Build a QB migration rewrote the active CFB Weekly subject';
  end if;

  if position(
    'auction_week.subject_key = ''cfb-best-teams-since-2000''' in
    pg_get_functiondef('public.get_daily_challenge_standings(text)'::regprocedure)
  )=0 then
    raise exception 'NFL Build a QB unexpectedly grants a Football Daily bonus win';
  end if;
end
$nfl_build_qb_weekly_contract$;
