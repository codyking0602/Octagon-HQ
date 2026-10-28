begin;

select plan(12);

select is(
  (select count(*)::integer from private.draft_room_cowboys_teams_pool),
  19,
  'Cowboys Teams has exactly 19 completed seasons'
);

select is(
  (select min(season_year) from private.draft_room_cowboys_teams_pool),
  2007,
  'Cowboys Teams starts at 2007'
);

select is(
  (select max(season_year) from private.draft_room_cowboys_teams_pool),
  2025,
  'Cowboys Teams stops at the last completed 2025 season'
);

select is(
  (select count(*)::integer from private.draft_room_cowboys_teams_pool where season_year = 2026),
  0,
  'Incomplete 2026 season is excluded'
);

select is(
  (select hidden_grade::integer from private.draft_room_cowboys_teams_pool where season_year = 2007),
  97,
  '2007 grade is locked'
);

select is(
  (select hidden_grade::integer from private.draft_room_cowboys_teams_pool where season_year = 2014),
  95,
  '2014 postseason-adjusted grade is locked'
);

select is(
  (select hidden_grade::integer from private.draft_room_cowboys_teams_pool where season_year = 2022),
  94,
  '2022 postseason-adjusted grade is locked'
);

select is(
  (select hidden_grade::integer from private.draft_room_cowboys_teams_pool where season_year = 2018),
  86,
  '2018 postseason-adjusted grade is locked'
);

select is(
  (select count(*)::integer from private.draft_room_cowboys_teams_board_shapes),
  6,
  'Cowboys Teams defines all six board shapes'
);

select is(
  (select count(*)::integer from private.draft_room_cowboys_teams_board_variants),
  24,
  'Cowboys Teams defines four variants per board shape'
);

select is(
  (select sum(roll_end - roll_start) from private.draft_room_cowboys_teams_board_shapes),
  1.00000::numeric,
  'Cowboys Teams board-shape weights cover 100 percent'
);

select ok(
  private.auction_catalog_game_id_for_mode('cowboys-teams-2007') = 'draft-room-cowboys-teams'
  and private.auction_game_id_for_mode('cowboys-teams-2007') = 'draft-room',
  'Cowboys Teams routes through the shared Draft Room architecture'
);

select * from finish();
rollback;
