-- Football Weekly Auction subject catalog.
-- This is an additive architecture layer only: the live CFB board remains on the
-- existing generator and no active-week board, bid, award, or result rows are touched.

create table private.football_weekly_auction_subjects (
  subject_key text primary key,
  display_name text not null,
  short_label text not null,
  competition_level text not null check (competition_level in ('NFL','CFB')),
  item_kind text not null check (item_kind in ('team-season','player-season','player-career')),
  rotation_order integer not null unique check (rotation_order >= 0),
  eligible_from date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table private.football_weekly_auction_items (
  item_reference text primary key,
  subject_key text not null
    references private.football_weekly_auction_subjects(subject_key)
    on delete restrict,
  season_year integer not null check (season_year between 1900 and 2100),
  primary_name text not null,
  secondary_name text,
  team_code text,
  board_bucket text not null,
  identity_group text not null,
  display_label text not null,
  hidden_grade numeric(4,1) not null check (
    hidden_grade between 86.0 and 100.0
    and hidden_grade * 2 = trunc(hidden_grade * 2)
  ),
  source_url text,
  created_at timestamptz not null default now(),
  unique (subject_key, primary_name, season_year)
);

create index football_weekly_auction_items_subject_bucket_idx
  on private.football_weekly_auction_items(subject_key, board_bucket, hidden_grade desc);
create index football_weekly_auction_items_subject_identity_idx
  on private.football_weekly_auction_items(subject_key, identity_group, season_year);

revoke all on private.football_weekly_auction_subjects from public, anon, authenticated;
revoke all on private.football_weekly_auction_items from public, anon, authenticated;

insert into private.football_weekly_auction_subjects(
  subject_key,
  display_name,
  short_label,
  competition_level,
  item_kind,
  rotation_order,
  eligible_from,
  is_active
) values (
  'cfb-best-teams-since-2000',
  'Best CFB Teams Since 2000',
  'CFB Teams',
  'CFB',
  'team-season',
  0,
  date '2026-09-15',
  true
)
on conflict (subject_key) do update set
  display_name = excluded.display_name,
  short_label = excluded.short_label,
  competition_level = excluded.competition_level,
  item_kind = excluded.item_kind,
  rotation_order = excluded.rotation_order,
  eligible_from = excluded.eligible_from,
  is_active = excluded.is_active;

insert into private.football_weekly_auction_items(
  item_reference,
  subject_key,
  season_year,
  primary_name,
  secondary_name,
  team_code,
  board_bucket,
  identity_group,
  display_label,
  hidden_grade,
  source_url
)
select
  pool.season_reference,
  'cfb-best-teams-since-2000',
  pool.season_year,
  pool.school,
  null,
  null,
  pool.conference_bucket,
  pool.school,
  pool.display_label,
  pool.hidden_grade,
  null
from private.draft_room_cfb_best_teams_pool pool
on conflict (item_reference) do update set
  subject_key = excluded.subject_key,
  season_year = excluded.season_year,
  primary_name = excluded.primary_name,
  secondary_name = excluded.secondary_name,
  team_code = excluded.team_code,
  board_bucket = excluded.board_bucket,
  identity_group = excluded.identity_group,
  display_label = excluded.display_label,
  hidden_grade = excluded.hidden_grade,
  source_url = excluded.source_url;

alter table private.football_weekly_auction_weeks
  add column if not exists subject_key text;

update private.football_weekly_auction_weeks
set subject_key = 'cfb-best-teams-since-2000'
where subject_key is null;

alter table private.football_weekly_auction_weeks
  alter column subject_key set default 'cfb-best-teams-since-2000',
  alter column subject_key set not null;

do $subject_fk$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'football_weekly_auction_weeks_subject_key_fkey'
      and conrelid = 'private.football_weekly_auction_weeks'::regclass
  ) then
    alter table private.football_weekly_auction_weeks
      add constraint football_weekly_auction_weeks_subject_key_fkey
      foreign key (subject_key)
      references private.football_weekly_auction_subjects(subject_key)
      on delete restrict;
  end if;
end
$subject_fk$;

do $subject_catalog_contract$
declare
  v_cfb_pool_count integer;
  v_cfb_catalog_count integer;
  v_live_board_missing integer;
begin
  select count(*) into v_cfb_pool_count
  from private.draft_room_cfb_best_teams_pool;

  select count(*) into v_cfb_catalog_count
  from private.football_weekly_auction_items
  where subject_key = 'cfb-best-teams-since-2000';

  if v_cfb_pool_count <> 233 or v_cfb_catalog_count <> 233 then
    raise exception
      'Weekly Auction CFB catalog must mirror all 233 calibrated seasons (pool %, catalog %)',
      v_cfb_pool_count,
      v_cfb_catalog_count;
  end if;

  if exists (
    select 1
    from private.draft_room_cfb_best_teams_pool pool
    left join private.football_weekly_auction_items item
      on item.item_reference = pool.season_reference
     and item.subject_key = 'cfb-best-teams-since-2000'
    where item.item_reference is null
       or item.season_year <> pool.season_year
       or item.primary_name <> pool.school
       or item.board_bucket <> pool.conference_bucket
       or item.display_label <> pool.display_label
       or item.hidden_grade <> pool.hidden_grade
  ) then
    raise exception 'Weekly Auction CFB subject catalog drifted from the calibrated source pool';
  end if;

  select count(*) into v_live_board_missing
  from private.football_weekly_auction_board board
  left join private.football_weekly_auction_items item
    on item.item_reference = board.season_reference
  where item.item_reference is null;

  if v_live_board_missing <> 0 then
    raise exception 'Weekly Auction live board contains items missing from the subject catalog';
  end if;
end
$subject_catalog_contract$;
