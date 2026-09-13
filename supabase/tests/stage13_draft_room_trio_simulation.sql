begin;

select set_config('request.jwt.claim.role', 'service_role', true);

-- Competitive-model simulation for Trio v2.
-- This runs 10,000 deterministic boards per sport (20,000 total) against the real
-- hidden player-grade pools and evaluates every 3-v-3 split of each six-package board.
do $simulation$
declare
  v_mode text;
  v_mean_spread numeric;
  v_p10_spread numeric;
  v_p50_spread numeric;
  v_compressed_rate numeric;
  v_close_one_rate numeric;
  v_close_three_rate numeric;
  v_six_plus_rate numeric;
  v_margin_median numeric;
  v_skill_win_rate numeric;
begin
  create temporary table trio_sim_packages (
    mode_id text not null,
    board_id integer not null,
    shape text not null,
    variant integer not null,
    strength_slot integer not null,
    package_score numeric not null,
    primary key (mode_id, board_id, strength_slot)
  ) on commit drop;

  with grade_arrays as (
    select
      mode_id,
      position,
      tier,
      array_agg(hidden_grade order by player_reference) as grades
    from private.draft_room_trio_player_pool
    group by mode_id, position, tier
  ),
  boards as (
    select
      mode.mode_id,
      board_id,
      private.draft_room_trio_board_shape((board_id - 1) / 10000.0) as shape,
      ((board_id - 1) % 3) + 1 as variant
    from (values ('trio-nfl'), ('trio-cfb')) mode(mode_id)
    cross join generate_series(1, 10000) board_id
  ),
  configured as (
    select
      board.mode_id,
      board.board_id,
      board.shape,
      board.variant,
      strength_slot,
      private.draft_room_trio_shape_combo(board.shape, board.variant, strength_slot) as combo,
      ((board.board_id * 17 + strength_slot * 13) % 6) + 1 as permutation
    from boards board
    cross join generate_series(1, 6) strength_slot
  ),
  assigned as (
    select
      configured.*,
      case permutation
        when 1 then combo[1]
        when 2 then combo[1]
        when 3 then combo[2]
        when 4 then combo[2]
        when 5 then combo[3]
        else combo[3]
      end as qb_tier,
      case permutation
        when 1 then combo[2]
        when 2 then combo[3]
        when 3 then combo[1]
        when 4 then combo[3]
        when 5 then combo[1]
        else combo[2]
      end as rb_tier,
      case permutation
        when 1 then combo[3]
        when 2 then combo[2]
        when 3 then combo[3]
        when 4 then combo[1]
        when 5 then combo[2]
        else combo[1]
      end as wr_tier
    from configured
  )
  insert into trio_sim_packages (
    mode_id, board_id, shape, variant, strength_slot, package_score
  )
  select
    assigned.mode_id,
    assigned.board_id,
    assigned.shape,
    assigned.variant,
    assigned.strength_slot,
    (
      qb.grades[1 + ((assigned.board_id * 31 + assigned.strength_slot * 5 + 1) % array_length(qb.grades, 1))]
      + rb.grades[1 + ((assigned.board_id * 37 + assigned.strength_slot * 5 + 3) % array_length(rb.grades, 1))]
      + wr.grades[1 + ((assigned.board_id * 41 + assigned.strength_slot * 5 + 5) % array_length(wr.grades, 1))]
    ) / 3.0
  from assigned
  join grade_arrays qb
    on qb.mode_id = assigned.mode_id and qb.position = 'QB' and qb.tier = assigned.qb_tier
  join grade_arrays rb
    on rb.mode_id = assigned.mode_id and rb.position = 'RB' and rb.tier = assigned.rb_tier
  join grade_arrays wr
    on wr.mode_id = assigned.mode_id and wr.position = 'WR' and wr.tier = assigned.wr_tier;

  if (select count(*) from trio_sim_packages) <> 120000 then
    raise exception 'Trio simulation did not materialize 20,000 six-package boards';
  end if;

  create temporary table trio_sim_boards on commit drop as
  select
    mode_id,
    board_id,
    shape,
    max(package_score) - min(package_score) as package_spread
  from trio_sim_packages
  group by mode_id, board_id, shape;

  if exists (
    select 1
    from (
      select
        mode_id,
        shape,
        count(*) as board_count
      from trio_sim_boards
      group by mode_id, shape
    ) actual
    join private.draft_room_trio_board_shapes configured
      on configured.shape = actual.shape
    where actual.board_count <> ((configured.roll_end - configured.roll_start) * 10000)::integer
  ) then
    raise exception 'Trio simulation board-shape frequencies drifted from the configured weights';
  end if;

  if exists (
    select 1
    from (
      select mode_id, avg(package_spread) as compressed_mean
      from trio_sim_boards
      where shape = 'Compressed'
      group by mode_id
    ) compressed
    where compressed.compressed_mean not between 4.0 and 7.5
  ) then
    raise exception 'Compressed Trio boards no longer behave like an occasional close-quality board';
  end if;

  if exists (
    select 1
    from (
      select mode_id, shape, avg(package_spread) as mean_spread
      from trio_sim_boards
      where shape <> 'Compressed'
      group by mode_id, shape
    ) separated
    where separated.mean_spread < 8.0
  ) then
    raise exception 'A non-compressed Trio board shape lost meaningful package separation';
  end if;

  create temporary table trio_sim_subsets (
    subset_id integer primary key,
    slots integer[] not null
  ) on commit drop;

  insert into trio_sim_subsets (subset_id, slots) values
    (1,  array[1,2,3]),
    (2,  array[1,2,4]),
    (3,  array[1,2,5]),
    (4,  array[1,2,6]),
    (5,  array[1,3,4]),
    (6,  array[1,3,5]),
    (7,  array[1,3,6]),
    (8,  array[1,4,5]),
    (9,  array[1,4,6]),
    (10, array[1,5,6]),
    (11, array[2,3,4]),
    (12, array[2,3,5]),
    (13, array[2,3,6]),
    (14, array[2,4,5]),
    (15, array[2,4,6]),
    (16, array[2,5,6]),
    (17, array[3,4,5]),
    (18, array[3,4,6]),
    (19, array[3,5,6]),
    (20, array[4,5,6]);

  create temporary table trio_sim_outcomes on commit drop as
  select
    package.mode_id,
    package.board_id,
    subset.subset_id,
    (
      sum(package.package_score) filter (where package.strength_slot = any(subset.slots))
      - sum(package.package_score) filter (where not (package.strength_slot = any(subset.slots)))
    ) / 3.0 as signed_margin
  from trio_sim_packages package
  cross join trio_sim_subsets subset
  group by package.mode_id, package.board_id, subset.subset_id;

  if (select count(*) from trio_sim_outcomes) <> 400000 then
    raise exception 'Trio simulation did not evaluate every 3-v-3 split';
  end if;

  for v_mode in select unnest(array['trio-nfl','trio-cfb']) loop
    select
      avg(package_spread),
      percentile_cont(0.10) within group (order by package_spread),
      percentile_cont(0.50) within group (order by package_spread),
      avg((package_spread < 6)::integer)
    into
      v_mean_spread,
      v_p10_spread,
      v_p50_spread,
      v_compressed_rate
    from trio_sim_boards
    where mode_id = v_mode;

    select
      avg((abs(signed_margin) < 1)::integer),
      avg((abs(signed_margin) < 3)::integer),
      avg((abs(signed_margin) >= 6)::integer),
      percentile_cont(0.50) within group (order by abs(signed_margin))
    into
      v_close_one_rate,
      v_close_three_rate,
      v_six_plus_rate,
      v_margin_median
    from trio_sim_outcomes
    where mode_id = v_mode;

    with weighted as (
      select
        board_id,
        exp(0.06 * (
          select sum(package.package_score)
          from trio_sim_packages package
          join trio_sim_subsets subset on subset.subset_id = outcome.subset_id
          where package.mode_id = outcome.mode_id
            and package.board_id = outcome.board_id
            and package.strength_slot = any(subset.slots)
        )) as decision_weight,
        signed_margin
      from trio_sim_outcomes outcome
      where mode_id = v_mode
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
      'Trio simulation %: mean spread %, p10 %, median spread %, <6 spread %, <1 margin %, <3 margin %, >=6 margin %, median margin %, skilled win %',
      v_mode,
      round(v_mean_spread, 3),
      round(v_p10_spread, 3),
      round(v_p50_spread, 3),
      round(v_compressed_rate, 4),
      round(v_close_one_rate, 4),
      round(v_close_three_rate, 4),
      round(v_six_plus_rate, 4),
      round(v_margin_median, 3),
      round(v_skill_win_rate, 4);

    if v_mean_spread not between 9.5 and 12.5
      or v_p10_spread < 5.0
      or v_p50_spread < 9.0
      or v_compressed_rate not between 0.04 and 0.12
    then
      raise exception 'Trio % board-spread distribution is outside the calibrated envelope', v_mode;
    end if;

    if v_close_one_rate > 0.28
      or v_close_three_rate not between 0.48 and 0.68
      or v_six_plus_rate < 0.06
      or v_margin_median not between 1.8 and 3.4
    then
      raise exception 'Trio % final-margin distribution is outside the calibrated envelope', v_mode;
    end if;

    if v_skill_win_rate not between 0.59 and 0.70 then
      raise exception 'Trio % better-decision edge is outside the calibrated envelope: %', v_mode, v_skill_win_rate;
    end if;
  end loop;
end $simulation$;

rollback;
