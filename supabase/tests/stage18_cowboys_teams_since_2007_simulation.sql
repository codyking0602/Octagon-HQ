begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $cowboys_teams_simulation$
declare
  v_shape_count integer;
  v_variant_count integer;
  v_weight numeric;
  v_min_grade numeric;
  v_max_grade numeric;
  v_a integer;
  v_b integer;
  v_c integer;
  v_d integer;
  v_e integer;
begin
  select count(*), sum(roll_end - roll_start)
  into v_shape_count, v_weight
  from private.draft_room_cowboys_teams_board_shapes;

  select count(*) into v_variant_count
  from private.draft_room_cowboys_teams_board_variants;

  if v_shape_count <> 6 or v_variant_count <> 24 or v_weight <> 1 then
    raise exception 'Cowboys Teams calibration must stay at six shapes, four variants each, and 100 percent total weight';
  end if;

  if not exists (
    select 1 from private.draft_room_cowboys_teams_board_shapes
    where shape = 'Wide' and roll_start = 0.00 and roll_end = 0.14
  ) or not exists (
    select 1 from private.draft_room_cowboys_teams_board_shapes
    where shape = 'Balanced' and roll_start = 0.14 and roll_end = 0.42
  ) or not exists (
    select 1 from private.draft_room_cowboys_teams_board_shapes
    where shape = 'TopHeavy' and roll_start = 0.42 and roll_end = 0.62
  ) or not exists (
    select 1 from private.draft_room_cowboys_teams_board_shapes
    where shape = 'BottomHeavy' and roll_start = 0.62 and roll_end = 0.76
  ) or not exists (
    select 1 from private.draft_room_cowboys_teams_board_shapes
    where shape = 'Compressed' and roll_start = 0.76 and roll_end = 0.90
  ) or not exists (
    select 1 from private.draft_room_cowboys_teams_board_shapes
    where shape = 'Chaotic' and roll_start = 0.90 and roll_end = 1.00
  ) then
    raise exception 'Cowboys Teams locked 14/28/20/14/14/10 shape weights drifted';
  end if;

  select min(hidden_grade), max(hidden_grade) into v_min_grade, v_max_grade
  from private.draft_room_cowboys_teams_pool;

  select
    count(*) filter (where quality_band = 'A'),
    count(*) filter (where quality_band = 'B'),
    count(*) filter (where quality_band = 'C'),
    count(*) filter (where quality_band = 'D'),
    count(*) filter (where quality_band = 'E')
  into v_a, v_b, v_c, v_d, v_e
  from private.draft_room_cowboys_teams_pool;

  if v_min_grade <> 58 or v_max_grade <> 97
    or v_a <> 6 or v_b <> 4 or v_c <> 4 or v_d <> 3 or v_e <> 2
  then
    raise exception 'Cowboys Teams grade spread or calibrated band population drifted';
  end if;

  if private.draft_room_cowboys_teams_board_shape(0.00) <> 'Wide'
    or private.draft_room_cowboys_teams_board_shape(0.14) <> 'Balanced'
    or private.draft_room_cowboys_teams_board_shape(0.42) <> 'TopHeavy'
    or private.draft_room_cowboys_teams_board_shape(0.62) <> 'BottomHeavy'
    or private.draft_room_cowboys_teams_board_shape(0.76) <> 'Compressed'
    or private.draft_room_cowboys_teams_board_shape(0.90) <> 'Chaotic'
  then
    raise exception 'Cowboys Teams board-shape boundaries drifted';
  end if;
end $cowboys_teams_simulation$;

rollback;
