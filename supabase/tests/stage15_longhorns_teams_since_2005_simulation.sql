begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $longhorn_teams_sim$
declare
  v_mean_spread numeric;
  v_p10_spread numeric;
  v_median_spread numeric;
  v_close_one_rate numeric;
  v_close_three_rate numeric;
  v_four_plus_rate numeric;
  v_median_margin numeric;
begin
  if (select count(*) from private.draft_room_longhorn_teams_pool) <> 23 then
    raise exception 'Longhorns Teams pool must contain all 23 completed seasons from 2003-2025';
  end if;

  if (
    select md5(string_agg(
      season_year::text || '|' || display_label || '|' || hidden_grade::integer::text || '|' || quality_band,
      E'\n'
      order by hidden_grade desc, season_year
    ))
    from private.draft_room_longhorn_teams_pool
  ) <> 'e87ef9320a0a5e70f21e83bc8417f5fd' then
    raise exception 'Longhorns Teams 2003-2025 approved seasons or grades drifted';
  end if;

  if exists (
    select 1 from private.draft_room_longhorn_teams_pool
    where season_year = 2026
  ) then
    raise exception 'Incomplete 2026 season entered Longhorns Teams';
  end if;

  if not exists (
    select 1 from private.draft_room_longhorn_teams_pool
    where season_year = 2003 and hidden_grade = 82 and quality_band = 'B'
  ) or not exists (
    select 1 from private.draft_room_longhorn_teams_pool
    where season_year = 2004 and hidden_grade = 92 and quality_band = 'A'
  ) then
    raise exception 'Longhorns Teams 2003/2004 additions drifted';
  end if;

  if (
    select jsonb_object_agg(shape, shape_count)
    from (
      select shape, count(*) shape_count
      from (
        select private.draft_room_longhorn_teams_board_shape(i / 100.0) shape
        from generate_series(0, 99) i
      ) rolls
      group by shape
    ) counts
  ) <> '{"Balanced":26,"BottomHeavy":16,"Chaotic":10,"Compressed":20,"TopHeavy":16,"Wide":12}'::jsonb then
    raise exception 'Longhorns Teams board-shape distribution drifted from 12/26/16/16/20/10';
  end if;

  if (select count(*) from private.draft_room_longhorn_teams_board_variants) <> 24
    or exists (
      select 1 from private.draft_room_longhorn_teams_board_variants
      where cardinality(quality_bands) <> 8
    )
  then
    raise exception 'Longhorns Teams must keep 24 hidden eight-season variants';
  end if;

  create temporary table longhorn_team_grade_arrays on commit drop as
  select
    quality_band,
    array_agg(hidden_grade order by season_reference) as grades
  from private.draft_room_longhorn_teams_pool
  group by quality_band;

  create temporary table longhorn_team_sim_players (
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
      private.draft_room_longhorn_teams_board_shape((board_id - 1)::double precision / 10000.0) as shape,
      ((board_id - 1) % 4) + 1 as variant
    from generate_series(1, 10000) board_id
  ),
  requested as (
    select
      board.board_id,
      board.shape,
      board.variant,
      strength_slot,
      private.draft_room_longhorn_teams_quality_band(board.shape, board.variant, strength_slot) as quality_band
    from boards board
    cross join generate_series(1, 8) strength_slot
  ),
  numbered as (
    select
      requested.*,
      row_number() over (
        partition by board_id, quality_band
        order by strength_slot
      ) as band_pick
    from requested
  )
  insert into longhorn_team_sim_players (
    board_id, shape, variant, strength_slot, hidden_grade
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
          + length(numbered.quality_band) * 11
          + numbered.band_pick::integer
          - 1
        ) % cardinality(grade_array.grades)
      )
    ]
  from numbered
  join longhorn_team_grade_arrays grade_array
    on grade_array.quality_band = numbered.quality_band;

  if (select count(*) from longhorn_team_sim_players) <> 80000 then
    raise exception 'Longhorns Teams simulation did not materialize 10,000 eight-season boards';
  end if;

  create temporary table longhorn_team_sim_boards on commit drop as
  select
    board_id,
    shape,
    max(hidden_grade) - min(hidden_grade) as board_spread
  from longhorn_team_sim_players
  group by board_id, shape;

  if (
    select avg(board_spread)
    from longhorn_team_sim_boards
    where shape = 'Compressed'
  ) not between 15 and 20 then
    raise exception 'Compressed Longhorns Teams boards lost their close-quality profile';
  end if;

  if (
    select avg(board_spread)
    from longhorn_team_sim_boards
    where shape = 'Wide'
  ) < 35 then
    raise exception 'Wide Longhorns Teams boards lost meaningful separation';
  end if;

  select
    avg(board_spread),
    percentile_cont(0.10) within group (order by board_spread),
    percentile_cont(0.50) within group (order by board_spread)
  into v_mean_spread, v_p10_spread, v_median_spread
  from longhorn_team_sim_boards;

  if v_mean_spread not between 30 and 34
    or v_p10_spread not between 16 and 20
    or v_median_spread not between 34 and 38
  then
    raise exception
      'Longhorns Teams board spread left the calibrated envelope: mean %, p10 %, median %',
      v_mean_spread, v_p10_spread, v_median_spread;
  end if;

  create temporary table longhorn_team_sim_subsets on commit drop as
  select
    row_number() over (order by a, b, c, d)::integer as subset_id,
    array[a,b,c,d]::integer[] as slots
  from generate_series(1, 5) a
  cross join generate_series(a + 1, 6) b
  cross join generate_series(b + 1, 7) c
  cross join generate_series(c + 1, 8) d;

  if (select count(*) from longhorn_team_sim_subsets) <> 70 then
    raise exception 'Longhorns Teams 4-v-4 simulation must enumerate all 70 possible splits';
  end if;

  create temporary table longhorn_team_sim_outcomes on commit drop as
  select
    player.board_id,
    subset.subset_id,
    (
      sum(player.hidden_grade) filter (where player.strength_slot = any(subset.slots))
      - sum(player.hidden_grade) filter (where not (player.strength_slot = any(subset.slots)))
    ) / 4.0 as signed_margin
  from longhorn_team_sim_players player
  cross join longhorn_team_sim_subsets subset
  group by player.board_id, subset.subset_id;

  if (select count(*) from longhorn_team_sim_outcomes) <> 700000 then
    raise exception 'Longhorns Teams simulation did not evaluate every 4-v-4 split';
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
  from longhorn_team_sim_outcomes;

  if v_close_one_rate not between 0.07 and 0.12
    or v_close_three_rate not between 0.25 and 0.32
    or v_four_plus_rate not between 0.59 and 0.66
    or v_median_margin not between 5.0 and 6.0
  then
    raise exception
      'Longhorns Teams final-margin distribution left the calibrated envelope: under1 %, under3 %, >=4 %, median %',
      v_close_one_rate, v_close_three_rate, v_four_plus_rate, v_median_margin;
  end if;
end $longhorn_teams_sim$;

rollback;
