begin;

do $best_cfb_contract$
begin
  if (select count(*) from private.draft_room_cfb_best_teams_pool) <> 132 then
    raise exception 'Best CFB Teams must have 132 approved seasons';
  end if;
  if (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='SEC') <> 32
    or (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='Big Ten') <> 32
    or (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='Big 12') <> 32
    or (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='ACC') <> 32
    or (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='Notre Dame') <> 4
  then
    raise exception 'Best CFB Teams conference population contract drifted';
  end if;

  if not exists (
    select 1 from private.draft_room_cfb_best_teams_pool
    where school='LSU' and season_year=2019 and hidden_grade=100
  ) or not exists (
    select 1 from private.draft_room_cfb_best_teams_pool
    where school='Miami' and season_year=2001 and hidden_grade=100
  ) or not exists (
    select 1 from private.draft_room_cfb_best_teams_pool
    where school='Indiana' and season_year=2025 and hidden_grade=98.5
  ) then
    raise exception 'Best CFB Teams locked grading anchors drifted';
  end if;

  if exists (select 1 from private.draft_room_cfb_best_teams_pool where season_year=2026) then
    raise exception 'Incomplete 2026 season must remain excluded';
  end if;

  if (select count(*) from private.draft_room_cfb_best_teams_board_shapes) <> 6
    or (select count(*) from private.draft_room_cfb_best_teams_board_variants) <> 24
    or (select sum(roll_end-roll_start) from private.draft_room_cfb_best_teams_board_shapes) <> 1
  then
    raise exception 'Best CFB Teams hidden board calibration is incomplete';
  end if;

  if private.auction_game_id_for_mode('cfb-best-teams') <> 'draft-room'
    or private.auction_catalog_game_id_for_mode('cfb-best-teams') <> 'draft-room-cfb-best-teams'
  then
    raise exception 'Best CFB Teams lost shared Draft Room routing';
  end if;

  if not exists (
    select 1 from private.auction_catalog_versions
    where game_id='draft-room-cfb-best-teams'
      and content_version='football-draft-room-cfb-best-teams-2026-09-v1'
      and rarity_version='football-draft-room-cfb-best-teams-board-2026-09-v1'
      and grading_version='football-draft-room-cfb-best-teams-grading-2026-09-v1'
  ) then
    raise exception 'Best CFB Teams private catalog version is missing';
  end if;
end;
$best_cfb_contract$;

rollback;
