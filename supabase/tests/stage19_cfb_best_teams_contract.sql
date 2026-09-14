begin;

select plan(15);

select is((select count(*)::integer from private.draft_room_cfb_best_teams_pool),132,'Best CFB Teams has 132 approved seasons');
select is((select count(*)::integer from private.draft_room_cfb_best_teams_pool where conference_bucket='SEC'),32,'SEC pool has 32 seasons');
select is((select count(*)::integer from private.draft_room_cfb_best_teams_pool where conference_bucket='Big Ten'),32,'Big Ten pool has 32 seasons');
select is((select count(*)::integer from private.draft_room_cfb_best_teams_pool where conference_bucket='Big 12'),32,'Big 12 pool has 32 seasons');
select is((select count(*)::integer from private.draft_room_cfb_best_teams_pool where conference_bucket='ACC'),32,'ACC pool has 32 seasons');
select is((select count(*)::integer from private.draft_room_cfb_best_teams_pool where conference_bucket='Notre Dame'),4,'Notre Dame wildcard pool has four seasons');
select is((select hidden_grade from private.draft_room_cfb_best_teams_pool where school='LSU' and season_year=2019),100.00::numeric,'2019 LSU grade is locked');
select is((select hidden_grade from private.draft_room_cfb_best_teams_pool where school='Miami' and season_year=2001),100.00::numeric,'2001 Miami grade is locked');
select is((select hidden_grade from private.draft_room_cfb_best_teams_pool where school='Indiana' and season_year=2025),98.50::numeric,'2025 Indiana grade is locked');
select is((select count(*)::integer from private.draft_room_cfb_best_teams_pool where season_year=2026),0,'Incomplete 2026 season is excluded');
select is((select count(*)::integer from private.draft_room_cfb_best_teams_board_shapes),6,'All six hidden board shapes are defined');
select is((select count(*)::integer from private.draft_room_cfb_best_teams_board_variants),24,'Each hidden board shape has four variants');
select is((select sum(roll_end-roll_start) from private.draft_room_cfb_best_teams_board_shapes),1.00000::numeric,'Board shape weights cover 100 percent');
select ok(
  private.auction_game_id_for_mode('cfb-best-teams')='draft-room'
  and private.auction_catalog_game_id_for_mode('cfb-best-teams')='draft-room-cfb-best-teams',
  'Best CFB Teams reuses shared Draft Room ownership'
);
select ok(
  exists(select 1 from private.auction_catalog_versions
    where game_id='draft-room-cfb-best-teams'
      and content_version='football-draft-room-cfb-best-teams-2026-09-v1'
      and rarity_version='football-draft-room-cfb-best-teams-board-2026-09-v1'
      and grading_version='football-draft-room-cfb-best-teams-grading-2026-09-v1'),
  'Best CFB Teams private catalog version is registered'
);

select * from finish();
rollback;
