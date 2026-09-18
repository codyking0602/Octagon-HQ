begin;

select set_config('request.jwt.claim.role','service_role',true);

do $best_cfb_calibration$
declare
  v_weight numeric;
  v_weekly_definition text;
  v_before text[];
  v_after text[];
begin
  select sum(roll_end-roll_start) into v_weight from private.draft_room_cfb_best_teams_board_shapes;
  if v_weight<>1 then raise exception 'Best CFB Teams shape weights must total 100 percent'; end if;

  if not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='Wide' and roll_start=0.00 and roll_end=0.14)
    or not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='Balanced' and roll_start=0.14 and roll_end=0.43)
    or not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='TopHeavy' and roll_start=0.43 and roll_end=0.56)
    or not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='BottomHeavy' and roll_start=0.56 and roll_end=0.69)
    or not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='Compressed' and roll_start=0.69 and roll_end=0.87)
    or not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='Chaotic' and roll_start=0.87 and roll_end=1.00)
  then raise exception 'Best CFB Teams locked Casual shape weights drifted'; end if;

  if (select min(hidden_grade) from private.draft_room_cfb_best_teams_pool)<>86
    or (select max(hidden_grade) from private.draft_room_cfb_best_teams_pool)<>100
  then raise exception 'Best CFB Teams legacy v1 grade range drifted'; end if;

  if (select min(hidden_grade) from private.cfb_best_teams_v2_authority)<>74
    or (select max(hidden_grade) from private.cfb_best_teams_v2_authority)<>100
  then raise exception 'Best CFB Teams v2 grade range drifted'; end if;

  select pg_get_functiondef('private.materialize_football_weekly_auction_week(date)'::regprocedure::oid)
  into v_weekly_definition;
  if position('materialize_football_weekly_auction_week_cfb' in v_weekly_definition)=0
    or position('materialize_football_weekly_build_qb_week' in v_weekly_definition)=0
  then raise exception 'Weekly Auction subject router drifted'; end if;

  select pg_get_functiondef('private.materialize_football_weekly_auction_week_cfb(date)'::regprocedure::oid)
  into v_weekly_definition;
  if position('2026-09-22' in v_weekly_definition)=0
    or position('cfb_best_teams_v2_authority' in v_weekly_definition)=0
  then raise exception 'Weekly Auction preserved CFB v2 boundary or authority drifted'; end if;

  -- If the current legacy week exists in the test fixture, rematerialization must be a no-op.
  if (select count(*) from private.football_weekly_auction_board where week_start=date '2026-09-15')=21 then
    select array_agg(season_reference order by day_index,slot) into v_before
    from private.football_weekly_auction_board where week_start=date '2026-09-15';
    perform private.materialize_football_weekly_auction_week(date '2026-09-15');
    select array_agg(season_reference order by day_index,slot) into v_after
    from private.football_weekly_auction_board where week_start=date '2026-09-15';
    if v_before<>v_after then raise exception 'Current legacy Weekly board changed during v2 cutover'; end if;
  end if;

  perform private.materialize_football_weekly_auction_week(date '2026-09-22');

  if (select count(*) from private.football_weekly_auction_board where week_start=date '2026-09-22')<>21
    or (select count(distinct b.season_reference) from private.football_weekly_auction_board b where b.week_start=date '2026-09-22')<>21
    or exists(
      select 1 from private.football_weekly_auction_board b
      left join private.cfb_best_teams_v2_authority p on p.season_reference=b.season_reference
      where b.week_start=date '2026-09-22' and p.season_reference is null
    )
  then raise exception 'Next Weekly board did not materialize entirely from CFB v2'; end if;

  if (select count(distinct p.school)
      from private.football_weekly_auction_board b
      join private.cfb_best_teams_v2_authority p using(season_reference)
      where b.week_start=date '2026-09-22')<>21
  then raise exception 'Next Weekly board repeated a school'; end if;
end;
$best_cfb_calibration$;

rollback;
