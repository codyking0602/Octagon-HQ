begin;

select set_config('request.jwt.claim.role','service_role',true);

do $best_cfb_calibration$
declare
  v_weight numeric;
begin
  select sum(roll_end-roll_start) into v_weight from private.draft_room_cfb_best_teams_board_shapes;
  if v_weight<>1 then raise exception 'Best CFB Teams shape weights must total 100 percent'; end if;

  if not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='Wide' and roll_start=0.00 and roll_end=0.14)
    or not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='Balanced' and roll_start=0.14 and roll_end=0.43)
    or not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='TopHeavy' and roll_start=0.43 and roll_end=0.56)
    or not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='BottomHeavy' and roll_start=0.56 and roll_end=0.69)
    or not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='Compressed' and roll_start=0.69 and roll_end=0.87)
    or not exists(select 1 from private.draft_room_cfb_best_teams_board_shapes where shape='Chaotic' and roll_start=0.87 and roll_end=1.00)
  then raise exception 'Best CFB Teams locked 14/29/13/13/18/13 weights drifted'; end if;

  if exists(
    select 1 from private.draft_room_cfb_best_teams_board_variants
    where cardinality(target_percentiles)<>8
      or exists(select 1 from unnest(target_percentiles) p where p<0 or p>1)
  ) then raise exception 'Best CFB Teams percentile variants drifted'; end if;

  if (select min(hidden_grade) from private.draft_room_cfb_best_teams_pool)<>86
    or (select max(hidden_grade) from private.draft_room_cfb_best_teams_pool)<>100
  then raise exception 'Best CFB Teams approved universal grade range drifted'; end if;
end;
$best_cfb_calibration$;

rollback;
