begin;

select set_config('request.jwt.claim.role','service_role',true);

do $best_cfb_contract$
declare
  v_generator_definition text;
  v_router_definition text;
begin
  -- v1 remains intact for pinned in-progress rooms.
  if (select count(*) from private.draft_room_cfb_best_teams_pool where season_reference like 'cfb-best-%') <> 132 then
    raise exception 'Best CFB Teams v1 legacy population must remain 132';
  end if;
  if (select min(hidden_grade) from private.draft_room_cfb_best_teams_pool) <> 86
    or (select max(hidden_grade) from private.draft_room_cfb_best_teams_pool) <> 100
  then raise exception 'Best CFB Teams v1 legacy scale drifted'; end if;

  select pg_get_functiondef('private.generate_draft_room_cfb_best_teams_deck(uuid)'::regprocedure::oid)
  into v_generator_definition;
  if position('season_reference like ''cfb-best-%''' in v_generator_definition)=0 then
    raise exception 'Best CFB Teams v1 generator lost its legacy 132-season pin';
  end if;

  -- v2 is the canonical authority for all newly generated rooms.
  if (select count(*) from private.cfb_best_teams_v2_authority) <> 257 then
    raise exception 'Best CFB Teams v2 authority must contain exactly 257 seasons';
  end if;
  if (select count(distinct (school,season_year)) from private.cfb_best_teams_v2_authority) <> 257 then
    raise exception 'Best CFB Teams v2 authority contains duplicate season identities';
  end if;
  if (select min(hidden_grade) from private.cfb_best_teams_v2_authority) <> 74
    or (select max(hidden_grade) from private.cfb_best_teams_v2_authority) <> 100
    or (select percentile_disc(0.5) within group(order by hidden_grade) from private.cfb_best_teams_v2_authority) <> 85
    or (select round(avg(hidden_grade),2) from private.cfb_best_teams_v2_authority) <> 85.12
  then raise exception 'Best CFB Teams v2 locked distribution drifted'; end if;

  if not exists(select 1 from private.cfb_best_teams_v2_authority where school='Auburn' and season_year=2013 and hidden_grade=87.5)
    or not exists(select 1 from private.cfb_best_teams_v2_authority where school='Florida' and season_year=2007 and hidden_grade=80)
    or not exists(select 1 from private.cfb_best_teams_v2_authority where school='Kansas State' and season_year=2003 and hidden_grade=80.5)
    or not exists(select 1 from private.cfb_best_teams_v2_authority where school='Indiana' and season_year=2024 and hidden_grade=85)
  then raise exception 'Best CFB Teams v2 final neighbor corrections drifted'; end if;

  if not exists(
      select 1 from private.auction_catalog_versions
      where game_id='draft-room-cfb-best-teams'
        and content_version='football-draft-room-cfb-best-teams-2026-09-v2'
        and rarity_version='football-draft-room-cfb-best-teams-board-2026-09-v2'
        and grading_version='football-draft-room-cfb-best-teams-grading-2026-09-v2'
    )
  then raise exception 'Best CFB Teams v2 catalog version is missing'; end if;

  select pg_get_functiondef('private.generate_draft_room_cfb_best_teams_deck_v2(uuid)'::regprocedure::oid)
  into v_generator_definition;
  if position('cfb_best_teams_v2_authority' in v_generator_definition)=0
    or position('season_reference like ''cfb-best-%''' in v_generator_definition)>0
  then raise exception 'Best CFB Teams v2 generator is not bound to the 257-team authority'; end if;

  select pg_get_functiondef('private.generate_draft_room_cfb_best_teams_deck_router(uuid)'::regprocedure::oid)
  into v_router_definition;
  if position('football-draft-room-cfb-best-teams-grading-2026-09-v2' in v_router_definition)=0 then
    raise exception 'Best CFB Teams generator router lost version pinning'; end if;

  if private.auction_game_id_for_mode('cfb-best-teams') <> 'draft-room'
    or private.auction_catalog_game_id_for_mode('cfb-best-teams') <> 'draft-room-cfb-best-teams'
  then raise exception 'Best CFB Teams must reuse shared Draft Room ownership'; end if;
end;
$best_cfb_contract$;

insert into private.football_weekly_auction_items(
  item_reference,subject_key,season_year,primary_name,board_bucket,identity_group,display_label,hidden_grade
) values (
  'test-cfb-grade-74','cfb-best-teams-since-2000',2000,'Constraint Probe','Wildcard','Constraint Probe','Constraint Probe · 2000',74
);

rollback;
