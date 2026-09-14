-- Stage 17: extend both Texas Longhorns Draft Room subjects back to 2003.
-- Preserve the historical internal mode ids for existing rooms/results while
-- expanding the private player and team-season populations.

insert into private.draft_room_longhorns_player_pool (
  player_reference,
  display_name,
  position_group,
  hidden_grade,
  grade_band
) values
  ('longhorns-2005-065', 'Derrick Johnson', 'LB', 99, 'Icon'),
  ('longhorns-2005-066', 'Cedric Benson', 'RB', 97, 'Icon'),
  ('longhorns-2005-067', 'Roy Williams', 'WR', 95, 'Elite'),
  ('longhorns-2005-068', 'Nathan Vasher', 'DB', 94, 'Elite'),
  ('longhorns-2005-069', 'Marcus Tubbs', 'DL/EDGE', 92, 'Star'),
  ('longhorns-2005-070', 'Bo Scaife', 'TE', 87, 'Strong');

alter table private.draft_room_longhorn_teams_pool
  drop constraint if exists draft_room_longhorn_teams_pool_season_year_check;

alter table private.draft_room_longhorn_teams_pool
  add constraint draft_room_longhorn_teams_pool_season_year_check
  check (season_year between 2003 and 2025);

alter table private.draft_room_longhorn_teams_board_entries
  drop constraint if exists draft_room_longhorn_teams_board_entries_season_year_check;

alter table private.draft_room_longhorn_teams_board_entries
  add constraint draft_room_longhorn_teams_board_entries_season_year_check
  check (season_year between 2003 and 2025);

insert into private.draft_room_longhorn_teams_pool (
  season_reference,
  season_year,
  display_label,
  hidden_grade,
  quality_band
) values
  ('texas-2003', 2003, '2003 Texas', 82, 'B'),
  ('texas-2004', 2004, '2004 Texas', 92, 'A');

do $$
declare
  v_definition text;
  v_next text;
begin
  -- Keep the legacy internal mode ids, but make all outgoing challenge copy
  -- match the new 2003-forward public names.
  v_definition := pg_get_functiondef('public.send_auction_first_bid(uuid,bigint,numeric,text)'::regprocedure);
  v_next := replace(
    replace(
      v_definition,
      'Longhorns Teams Since 2005',
      'Longhorns Teams Since 2003'
    ),
    'Longhorns Since 2005',
    'Longhorns Since 2003'
  );

  if v_next = v_definition then
    raise exception 'Longhorns 2003 notification-copy contract drifted';
  end if;

  execute v_next;
end;
$$;

do $$
begin
  if (select count(*) from private.draft_room_longhorns_player_pool) <> 70 then
    raise exception 'Longhorns Since 2003 must contain exactly 70 approved players';
  end if;

  if not exists (
    select 1
    from private.draft_room_longhorns_player_pool
    where display_name = 'Derrick Johnson' and position_group = 'LB' and hidden_grade = 99 and grade_band = 'Icon'
  ) or not exists (
    select 1
    from private.draft_room_longhorns_player_pool
    where display_name = 'Cedric Benson' and position_group = 'RB' and hidden_grade = 97 and grade_band = 'Icon'
  ) or not exists (
    select 1
    from private.draft_room_longhorns_player_pool
    where display_name = 'Roy Williams' and position_group = 'WR' and hidden_grade = 95 and grade_band = 'Elite'
  ) or not exists (
    select 1
    from private.draft_room_longhorns_player_pool
    where display_name = 'Nathan Vasher' and position_group = 'DB' and hidden_grade = 94 and grade_band = 'Elite'
  ) or not exists (
    select 1
    from private.draft_room_longhorns_player_pool
    where display_name = 'Marcus Tubbs' and position_group = 'DL/EDGE' and hidden_grade = 92 and grade_band = 'Star'
  ) or not exists (
    select 1
    from private.draft_room_longhorns_player_pool
    where display_name = 'Bo Scaife' and position_group = 'TE' and hidden_grade = 87 and grade_band = 'Strong'
  ) then
    raise exception 'Longhorns Since 2003 approved player additions or grades drifted';
  end if;

  if (select count(*) from private.draft_room_longhorn_teams_pool) <> 23 then
    raise exception 'Longhorns Teams Since 2003 must contain exactly 23 completed seasons';
  end if;

  if not exists (
    select 1
    from private.draft_room_longhorn_teams_pool
    where season_year = 2003 and display_label = '2003 Texas' and hidden_grade = 82 and quality_band = 'B'
  ) or not exists (
    select 1
    from private.draft_room_longhorn_teams_pool
    where season_year = 2004 and display_label = '2004 Texas' and hidden_grade = 92 and quality_band = 'A'
  ) then
    raise exception 'Longhorns Teams Since 2003 approved season additions or grades drifted';
  end if;

  if exists (
    select 1
    from private.draft_room_longhorn_teams_pool
    where season_year < 2003 or season_year > 2025
  ) then
    raise exception 'Longhorns Teams eligibility escaped the completed 2003-2025 window';
  end if;

  if pg_get_functiondef('public.send_auction_first_bid(uuid,bigint,numeric,text)'::regprocedure)
      not like '%Longhorns Since 2003%'
    or pg_get_functiondef('public.send_auction_first_bid(uuid,bigint,numeric,text)'::regprocedure)
      not like '%Longhorns Teams Since 2003%'
    or pg_get_functiondef('public.send_auction_first_bid(uuid,bigint,numeric,text)'::regprocedure)
      like '%Longhorns Since 2005%'
    or pg_get_functiondef('public.send_auction_first_bid(uuid,bigint,numeric,text)'::regprocedure)
      like '%Longhorns Teams Since 2005%'
  then
    raise exception 'Longhorns challenge notification copy did not fully move to 2003';
  end if;
end;
$;
