begin;

select set_config('request.jwt.claim.role','service_role',true);

do $best_cfb_contract$
begin
  if (select count(*) from private.draft_room_cfb_best_teams_pool where season_reference like 'cfb-best-%') <> 132 then
    raise exception 'Best CFB Teams must preserve exactly 132 original approved seasons';
  end if;
  if (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='SEC' and season_reference like 'cfb-best-%') <> 32 then
    raise exception 'SEC original pool must have exactly 32 seasons';
  end if;
  if (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='Big Ten' and season_reference like 'cfb-best-%') <> 32 then
    raise exception 'Big Ten original pool must have exactly 32 seasons';
  end if;
  if (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='Big 12' and season_reference like 'cfb-best-%') <> 32 then
    raise exception 'Big 12 original pool must have exactly 32 seasons';
  end if;
  if (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='ACC' and season_reference like 'cfb-best-%') <> 32 then
    raise exception 'ACC original pool must have exactly 32 seasons';
  end if;
  if (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='Notre Dame' and season_reference like 'cfb-best-%') <> 4 then
    raise exception 'Notre Dame wildcard original pool must have exactly four seasons';
  end if;

  if (select hidden_grade from private.draft_room_cfb_best_teams_pool where school='LSU' and season_year=2019) <> 100.00 then
    raise exception '2019 LSU locked grade drifted';
  end if;
  if (select hidden_grade from private.draft_room_cfb_best_teams_pool where school='Miami' and season_year=2001) <> 100.00 then
    raise exception '2001 Miami locked grade drifted';
  end if;
  if (select hidden_grade from private.draft_room_cfb_best_teams_pool where school='Indiana' and season_year=2025) <> 98.50 then
    raise exception '2025 Indiana locked grade drifted';
  end if;
  if exists(select 1 from private.draft_room_cfb_best_teams_pool where season_year=2026) then
    raise exception 'Incomplete 2026 season must remain excluded';
  end if;

  if (select count(*) from private.draft_room_cfb_best_teams_board_shapes) <> 6 then
    raise exception 'Best CFB Teams must define all six hidden board shapes';
  end if;
  if (select count(*) from private.draft_room_cfb_best_teams_board_variants) <> 24 then
    raise exception 'Best CFB Teams must define four variants per hidden board shape';
  end if;
  if (select sum(roll_end-roll_start) from private.draft_room_cfb_best_teams_board_shapes) <> 1 then
    raise exception 'Best CFB Teams board-shape weights must cover 100 percent';
  end if;

  if private.auction_game_id_for_mode('cfb-best-teams') <> 'draft-room'
    or private.auction_catalog_game_id_for_mode('cfb-best-teams') <> 'draft-room-cfb-best-teams'
  then
    raise exception 'Best CFB Teams must reuse shared Draft Room ownership';
  end if;

  if not exists(
    select 1
    from private.auction_catalog_versions
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
