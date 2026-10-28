begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $cowboys_sim$
declare
  v_mean_spread numeric;
  v_p10_spread numeric;
  v_median_spread numeric;
  v_under_seven_rate numeric;
  v_compressed_mean numeric;
  v_close_one_rate numeric;
  v_close_three_rate numeric;
  v_four_plus_rate numeric;
  v_median_margin numeric;
  v_skill_win_rate numeric;
begin
  if (select count(*) from private.draft_room_cowboys_player_pool) <> 69 then
    raise exception 'Cowboys Since 2007 pool must contain all 69 approved players';
  end if;

  if (
    select md5(string_agg(
      position_group || '|' || display_name || '|' || hidden_grade::integer::text,
      E'\n'
      order by player_reference
    ))
    from private.draft_room_cowboys_player_pool
  ) <> '7a29e7b8c67c4b92181c93a5b86ae200' then
    raise exception 'Cowboys Since 2007 approved names, positions, or grades drifted';
  end if;

  if (
    select jsonb_object_agg(grade_band, player_count)
    from (
      select grade_band, count(*) player_count
      from private.draft_room_cowboys_player_pool
      group by grade_band
    ) counts
  ) <> '{"Core":21,"Elite":7,"Icon":7,"Star":7,"Strong":10,"Wildcard":17}'::jsonb then
    raise exception 'Cowboys Since 2007 grade-band distribution drifted';
  end if;

  if not exists (
    select 1 from private.draft_room_cowboys_player_pool
    where display_name = 'CeeDee Lamb' and hidden_grade = 96
  ) or not exists (
    select 1 from private.draft_room_cowboys_player_pool
    where display_name = 'Ezekiel Elliott' and hidden_grade = 96
  ) or not exists (
    select 1 from private.draft_room_cowboys_player_pool
    where display_name = 'Micah Parsons' and hidden_grade = 96
  ) or not exists (
    select 1 from private.draft_room_cowboys_player_pool
    where display_name = 'Tony Romo' and hidden_grade = 94
  ) or not exists (
    select 1 from private.draft_room_cowboys_player_pool
    where display_name = 'Dak Prescott' and hidden_grade = 94
  ) or not exists (
    select 1 from private.draft_room_cowboys_player_pool
    where display_name = 'DeMarco Murray' and hidden_grade = 94
  ) then
    raise exception 'Locked Cowboys grading revisions drifted';
  end if;

  if (
    select jsonb_object_agg(shape, shape_count)
    from (
      select shape, count(*) shape_count
      from (
        select private.draft_room_cowboys_board_shape(i / 100.0) shape
        from generate_series(0, 99) i
      ) rolls
      group by shape
    ) counts
  ) <> '{"Balanced":24,"BottomHeavy":14,"Chaotic":16,"Compressed":12,"TopHeavy":14,"Wide":20}'::jsonb then
    raise exception 'Cowboys board-shape distribution drifted from 20/24/14/14/12/16';
  end if;

  if (
    select jsonb_object_agg(variant::text, variant_count)
    from (
      select variant, count(*) variant_count
      from (
        select private.draft_room_cowboys_board_variant(i / 400.0) variant
        from generate_series(0, 399) i
      ) rolls
      group by variant
    ) counts
  ) <> '{"1":100,"2":100,"3":100,"4":100}'::jsonb then
    raise exception 'Cowboys hidden board variants are not evenly randomized';
  end if;

  if (select count(*) from private.draft_room_cowboys_board_variants) <> 24
    or exists (
      select 1
      from private.draft_room_cowboys_board_variants
      where cardinality(grade_bands) <> 8
    )
  then
    raise exception 'Cowboys board model must keep 24 eight-player hidden variants';
  end if;

  create temporary table cowboy_grade_arrays on commit drop as
  select
    grade_band,
    array_agg(hidden_grade order by player_reference) as grades
  from private.draft_room_cowboys_player_pool
  group by grade_band;

  create temporary table cowboy_sim_players (
    board_id integer not null,
    shape text not null,
    variant integer not null,
    strength_slot integer not null,
    hidden_grade numeric not null,
    primary key (board_id, strength_slot)
  ) on commit drop;

  with boards as (
    select
      board_id,
      private.draft_room_cowboys_board_shape(
        (board_id - 1)::double precision / 10000.0
      ) as shape,
      ((board_id - 1) % 4) + 1 as variant
    from generate_series(1, 10000) board_id
  ),
  requested as (
    select
      board.board_id,
      board.shape,
      board.variant,
      strength_slot,
      private.draft_room_cowboys_grade_band(
        board.shape,
        board.variant,
        strength_slot
      ) as grade_band
    from boards board
    cross join generate_series(1, 8) strength_slot
  ),
  numbered as (
    select
      requested.*,
      row_number() over (
        partition by board_id, grade_band
        order by strength_slot
      ) as band_pick
    from requested
  )
  insert into cowboy_sim_players (
    board_id,
    shape,
    variant,
    strength_slot,
    hidden_grade
  )
  select
    numbered.board_id,
    numbered.shape,
    numbered.variant,
    numbered.strength_slot,
    grade_array.grades[
      1 + (
        (
          numbered.board_id * 37
          + length(numbered.grade_band) * 11
          + numbered.band_pick::integer
          - 1
        ) % cardinality(grade_array.grades)
      )
    ]
  from numbered
  join cowboy_grade_arrays grade_array
    on grade_array.grade_band = numbered.grade_band;

  if (select count(*) from cowboy_sim_players) <> 80000 then
    raise exception 'Cowboys simulation did not materialize 10,000 eight-player boards';
  end if;

  create temporary table cowboy_sim_boards on commit drop as
  select
    board_id,
    shape,
    max(hidden_grade) - min(hidden_grade) as board_spread
  from cowboy_sim_players
  group by board_id, shape;

  if exists (
    select 1
    from (
      select shape, count(*) board_count
      from cowboy_sim_boards
      group by shape
    ) actual
    join private.draft_room_cowboys_board_shapes configured
      on configured.shape = actual.shape
    where actual.board_count <> ((configured.roll_end - configured.roll_start) * 10000)::integer
  ) then
    raise exception 'Cowboys simulated shape frequencies drifted from configured weights';
  end if;

  select avg(board_spread)
  into v_compressed_mean
  from cowboy_sim_boards
  where shape = 'Compressed';

  if v_compressed_mean not between 5.5 and 7.5 then
    raise exception 'Compressed Cowboys boards no longer create legitimate close-quality rooms: %', v_compressed_mean;
  end if;

  if exists (
    select 1
    from (
      select shape, avg(board_spread) mean_spread
      from cowboy_sim_boards
      where shape <> 'Compressed'
      group by shape
    ) separated
    where separated.mean_spread < 9.0
  ) then
    raise exception 'A non-compressed Cowboys board shape lost meaningful separation';
  end if;

  select
    avg(board_spread),
    percentile_cont(0.10) within group (order by board_spread),
    percentile_cont(0.50) within group (order by board_spread),
    avg((board_spread < 7)::integer)
  into
    v_mean_spread,
    v_p10_spread,
    v_median_spread,
    v_under_seven_rate
  from cowboy_sim_boards;

  if v_mean_spread not between 12.5 and 14.2
    or v_p10_spread not between 7 and 9
    or v_median_spread not between 13 and 15
    or v_under_seven_rate not between 0.04 and 0.09
  then
    raise exception
      'Cowboys board-spread distribution left the calibrated envelope: mean %, p10 %, median %, under7 %',
      v_mean_spread, v_p10_spread, v_median_spread, v_under_seven_rate;
  end if;

  create temporary table cowboy_sim_subsets on commit drop as
  select
    row_number() over (order by a, b, c, d)::integer as subset_id,
    array[a,b,c,d]::integer[] as slots
  from generate_series(1, 5) a
  cross join generate_series(a + 1, 6) b
  cross join generate_series(b + 1, 7) c
  cross join generate_series(c + 1, 8) d;

  if (select count(*) from cowboy_sim_subsets) <> 70 then
    raise exception 'Cowboys 4-v-4 simulation must enumerate all 70 possible splits';
  end if;

  create temporary table cowboy_sim_outcomes on commit drop as
  select
    player.board_id,
    subset.subset_id,
    sum(player.hidden_grade) filter (
      where player.strength_slot = any(subset.slots)
    ) as selected_sum,
    (
      sum(player.hidden_grade) filter (
        where player.strength_slot = any(subset.slots)
      )
      - sum(player.hidden_grade) filter (
        where not (player.strength_slot = any(subset.slots))
      )
    ) / 4.0 as signed_margin
  from cowboy_sim_players player
  cross join cowboy_sim_subsets subset
  group by player.board_id, subset.subset_id;

  if (select count(*) from cowboy_sim_outcomes) <> 700000 then
    raise exception 'Cowboys simulation did not evaluate every 4-v-4 allocation';
  end if;

  select
    avg((abs(signed_margin) < 1)::integer),
    avg((abs(signed_margin) < 3)::integer),
    avg((abs(signed_margin) >= 4)::integer),
    percentile_cont(0.50) within group (order by abs(signed_margin))
  into
    v_close_one_rate,
    v_close_three_rate,
    v_four_plus_rate,
    v_median_margin
  from cowboy_sim_outcomes;

  with weighted as (
    select
      board_id,
      exp(0.059 * selected_sum) as decision_weight,
      signed_margin
    from cowboy_sim_outcomes
  ),
  board_probability as (
    select
      board_id,
      (
        sum(decision_weight) filter (where signed_margin > 0)
        + 0.5 * coalesce(sum(decision_weight) filter (where signed_margin = 0), 0)
      ) / sum(decision_weight) as skilled_win_probability
    from weighted
    group by board_id
  )
  select avg(skilled_win_probability)
  into v_skill_win_rate
  from board_probability;

  raise notice
    'Cowboys simulation: mean spread %, p10 %, median spread %, under7 %, compressed mean %, under1 margin %, under3 margin %, >=4 margin %, median margin %, skilled win %',
    round(v_mean_spread, 3),
    round(v_p10_spread, 3),
    round(v_median_spread, 3),
    round(v_under_seven_rate, 4),
    round(v_compressed_mean, 3),
    round(v_close_one_rate, 4),
    round(v_close_three_rate, 4),
    round(v_four_plus_rate, 4),
    round(v_median_margin, 3),
    round(v_skill_win_rate, 4);

  if v_close_one_rate not between 0.17 and 0.25
    or v_close_three_rate not between 0.57 and 0.66
    or v_four_plus_rate not between 0.22 and 0.29
    or v_median_margin not between 2.0 and 2.5
  then
    raise exception
      'Cowboys final-margin distribution left the calibrated envelope: under1 %, under3 %, >=4 %, median %',
      v_close_one_rate, v_close_three_rate, v_four_plus_rate, v_median_margin;
  end if;

  if v_skill_win_rate not between 0.63 and 0.68 then
    raise exception
      'Cowboys better-decision edge left the calibrated envelope: %',
      v_skill_win_rate;
  end if;
end $cowboys_sim$;

rollback;
