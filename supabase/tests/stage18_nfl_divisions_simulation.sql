begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $nfl_divisions_sim$
declare
  v_min numeric;
  v_max numeric;
  v_avg numeric;
  v_mean_spread numeric;
  v_p10_spread numeric;
  v_median_spread numeric;
  v_single_mean_spread numeric;
  v_split_mean_spread numeric;
  v_close_one_rate numeric;
  v_close_three_rate numeric;
  v_four_plus_rate numeric;
  v_median_margin numeric;
  v_skill_win_rate numeric;
begin
  if (select count(*) from private.draft_room_nfl_divisions_pool) <> 128 then
    raise exception 'NFL Divisions simulation contract requires 128 team-seasons';
  end if;

  if (select count(distinct team_code) from private.draft_room_nfl_divisions_pool) <> 32
    or exists (
      select 1 from private.draft_room_nfl_divisions_pool
      group by team_code
      having count(*) <> 4
    )
  then
    raise exception 'NFL Divisions franchise coverage drifted';
  end if;

  if (select count(distinct division_label) from private.draft_room_nfl_divisions_pool) <> 8
    or exists (
      select 1 from private.draft_room_nfl_divisions_pool
      group by division_label
      having count(*) <> 16
    )
  then
    raise exception 'NFL Divisions division coverage drifted';
  end if;

  create temporary table nfl_divisions_expected_grades (
    season_reference text primary key,
    hidden_grade numeric(5,2) not null
  ) on commit drop;

  insert into nfl_divisions_expected_grades (season_reference, hidden_grade) values
    ('nfl-division-ari-2008', 90.5),
    ('nfl-division-ari-2009', 83.5),
    ('nfl-division-ari-2015', 89.0),
    ('nfl-division-ari-2021', 81.5),
    ('nfl-division-atl-2004', 86.5),
    ('nfl-division-atl-2010', 84.5),
    ('nfl-division-atl-2012', 89.0),
    ('nfl-division-atl-2016', 92.5),
    ('nfl-division-bal-2000', 99.5),
    ('nfl-division-bal-2012', 95.0),
    ('nfl-division-bal-2019', 91.0),
    ('nfl-division-bal-2023', 91.5),
    ('nfl-division-buf-2020', 91.0),
    ('nfl-division-buf-2021', 87.5),
    ('nfl-division-buf-2022', 88.0),
    ('nfl-division-buf-2024', 90.5),
    ('nfl-division-car-2003', 91.5),
    ('nfl-division-car-2005', 87.5),
    ('nfl-division-car-2013', 84.0),
    ('nfl-division-car-2015', 96.5),
    ('nfl-division-chi-2001', 85.0),
    ('nfl-division-chi-2006', 93.5),
    ('nfl-division-chi-2010', 87.5),
    ('nfl-division-chi-2018', 84.5),
    ('nfl-division-cin-2013', 83.5),
    ('nfl-division-cin-2015', 84.5),
    ('nfl-division-cin-2021', 91.0),
    ('nfl-division-cin-2022', 89.5),
    ('nfl-division-cle-2002', 78.5),
    ('nfl-division-cle-2007', 80.0),
    ('nfl-division-cle-2020', 84.0),
    ('nfl-division-cle-2023', 81.5),
    ('nfl-division-dal-2007', 85.5),
    ('nfl-division-dal-2014', 85.0),
    ('nfl-division-dal-2016', 86.0),
    ('nfl-division-dal-2023', 84.0),
    ('nfl-division-den-2005', 89.5),
    ('nfl-division-den-2013', 94.5),
    ('nfl-division-den-2015', 97.5),
    ('nfl-division-den-2025', 91.5),
    ('nfl-division-det-2011', 80.5),
    ('nfl-division-det-2014', 81.5),
    ('nfl-division-det-2023', 89.0),
    ('nfl-division-det-2024', 91.5),
    ('nfl-division-gb-2007', 89.5),
    ('nfl-division-gb-2010', 96.0),
    ('nfl-division-gb-2011', 91.5),
    ('nfl-division-gb-2020', 90.5),
    ('nfl-division-hou-2011', 83.0),
    ('nfl-division-hou-2012', 84.5),
    ('nfl-division-hou-2018', 82.0),
    ('nfl-division-hou-2025', 85.0),
    ('nfl-division-ind-2003', 89.0),
    ('nfl-division-ind-2005', 90.5),
    ('nfl-division-ind-2006', 96.5),
    ('nfl-division-ind-2009', 94.0),
    ('nfl-division-jax-1999', 91.5),
    ('nfl-division-jax-2007', 84.0),
    ('nfl-division-jax-2017', 88.5),
    ('nfl-division-jax-2025', 85.5),
    ('nfl-division-kc-2019', 97.0),
    ('nfl-division-kc-2020', 94.0),
    ('nfl-division-kc-2022', 98.5),
    ('nfl-division-kc-2023', 96.5),
    ('nfl-division-lac-2004', 85.0),
    ('nfl-division-lac-2006', 90.0),
    ('nfl-division-lac-2007', 88.5),
    ('nfl-division-lac-2009', 86.5),
    ('nfl-division-lar-1999', 99.5),
    ('nfl-division-lar-2001', 95.5),
    ('nfl-division-lar-2018', 93.0),
    ('nfl-division-lar-2021', 97.0),
    ('nfl-division-lv-2000', 88.5),
    ('nfl-division-lv-2001', 83.0),
    ('nfl-division-lv-2002', 92.0),
    ('nfl-division-lv-2016', 82.5),
    ('nfl-division-mia-2000', 83.5),
    ('nfl-division-mia-2001', 81.5),
    ('nfl-division-mia-2008', 82.0),
    ('nfl-division-mia-2023', 81.5),
    ('nfl-division-min-2000', 86.0),
    ('nfl-division-min-2009', 89.0),
    ('nfl-division-min-2017', 89.5),
    ('nfl-division-min-2024', 85.0),
    ('nfl-division-ne-2003', 98.5),
    ('nfl-division-ne-2004', 99.5),
    ('nfl-division-ne-2007', 99.0),
    ('nfl-division-ne-2016', 100.0),
    ('nfl-division-no-2009', 98.5),
    ('nfl-division-no-2011', 87.5),
    ('nfl-division-no-2018', 90.5),
    ('nfl-division-no-2020', 86.0),
    ('nfl-division-nyg-2000', 91.5),
    ('nfl-division-nyg-2007', 96.0),
    ('nfl-division-nyg-2008', 84.5),
    ('nfl-division-nyg-2011', 94.5),
    ('nfl-division-nyj-2004', 84.0),
    ('nfl-division-nyj-2009', 87.0),
    ('nfl-division-nyj-2010', 88.0),
    ('nfl-division-nyj-2015', 80.0),
    ('nfl-division-phi-2004', 93.0),
    ('nfl-division-phi-2017', 98.0),
    ('nfl-division-phi-2022', 94.5),
    ('nfl-division-phi-2024', 99.0),
    ('nfl-division-pit-2004', 92.0),
    ('nfl-division-pit-2005', 95.5),
    ('nfl-division-pit-2008', 97.5),
    ('nfl-division-pit-2010', 92.5),
    ('nfl-division-sea-2005', 93.0),
    ('nfl-division-sea-2013', 99.5),
    ('nfl-division-sea-2014', 92.5),
    ('nfl-division-sea-2025', 99.0),
    ('nfl-division-sf-2011', 89.5),
    ('nfl-division-sf-2012', 91.0),
    ('nfl-division-sf-2019', 93.5),
    ('nfl-division-sf-2023', 92.5),
    ('nfl-division-tb-1999', 86.5),
    ('nfl-division-tb-2002', 98.5),
    ('nfl-division-tb-2020', 96.5),
    ('nfl-division-tb-2021', 86.0),
    ('nfl-division-ten-1999', 93.5),
    ('nfl-division-ten-2000', 86.0),
    ('nfl-division-ten-2003', 85.0),
    ('nfl-division-ten-2008', 87.5),
    ('nfl-division-was-1999', 82.5),
    ('nfl-division-was-2005', 82.5),
    ('nfl-division-was-2012', 82.0),
    ('nfl-division-was-2024', 89.0);

  if (select count(*) from nfl_divisions_expected_grades) <> 128
    or exists (
      select 1
      from private.draft_room_nfl_divisions_pool actual
      full join nfl_divisions_expected_grades expected
        on expected.season_reference = actual.season_reference
      where actual.season_reference is null
        or expected.season_reference is null
        or actual.hidden_grade <> expected.hidden_grade
    )
  then
    raise exception 'NFL Divisions approved team-season calibration drifted';
  end if;

  select min(hidden_grade), max(hidden_grade), avg(hidden_grade)
  into v_min, v_max, v_avg
  from private.draft_room_nfl_divisions_pool;

  if v_min <> 78.5
    or v_max <> 100
    or v_avg not between 89.59 and 89.62
  then
    raise exception 'NFL Divisions grading distribution drifted: min %, max %, avg %', v_min, v_max, v_avg;
  end if;

  if exists (
    select 1
    from private.draft_room_nfl_divisions_pool
    where season_year < 1999 or season_year > 2025
  ) then
    raise exception 'NFL Divisions population escaped the pinned completed-season window';
  end if;

  create temporary table nfl_divisions_sim_divisions on commit drop as
  select
    row_number() over (order by division_label)::integer as division_id,
    division_label
  from (
    select distinct division_label
    from private.draft_room_nfl_divisions_pool
  ) divisions;

  create temporary table nfl_divisions_sim_pairs on commit drop as
  select
    row_number() over (order by one_div.division_id, two_div.division_id)::integer as pair_id,
    one_div.division_label as division_one,
    two_div.division_label as division_two
  from nfl_divisions_sim_divisions one_div
  cross join nfl_divisions_sim_divisions two_div
  where one_div.division_id <> two_div.division_id;

  if (select count(*) from nfl_divisions_sim_pairs) <> 56 then
    raise exception 'NFL Divisions split-board simulation lost an ordered division pair';
  end if;

  create temporary table nfl_divisions_sim_boards (
    board_id integer primary key,
    board_kind text not null,
    division_one text not null,
    division_two text
  ) on commit drop;

  insert into nfl_divisions_sim_boards (board_id, board_kind, division_one, division_two)
  select
    board_id,
    'single',
    division.division_label,
    null
  from generate_series(1, 5000) board_id
  join nfl_divisions_sim_divisions division
    on division.division_id = 1 + ((board_id - 1) % 8);

  insert into nfl_divisions_sim_boards (board_id, board_kind, division_one, division_two)
  select
    board_id,
    'split',
    pair.division_one,
    pair.division_two
  from generate_series(5001, 10000) board_id
  join nfl_divisions_sim_pairs pair
    on pair.pair_id = 1 + ((board_id - 5001) % 56);

  if (select count(*) from nfl_divisions_sim_boards) <> 10000
    or (select count(*) from nfl_divisions_sim_boards where board_kind = 'single') <> 5000
    or (select count(*) from nfl_divisions_sim_boards where board_kind = 'split') <> 5000
  then
    raise exception 'NFL Divisions simulation must contain 5,000 single and 5,000 split boards';
  end if;

  create temporary table nfl_divisions_sim_items (
    board_id integer not null,
    board_kind text not null,
    strength_slot integer not null check (strength_slot between 1 and 8),
    season_reference text not null,
    team_code text not null,
    division_label text not null,
    hidden_grade numeric not null,
    primary key (board_id, strength_slot),
    unique (board_id, season_reference)
  ) on commit drop;

  with teams as (
    select distinct division_label, team_code
    from private.draft_room_nfl_divisions_pool
  ),
  picked as (
    select
      board.board_id,
      board.board_kind,
      season.season_reference,
      season.team_code,
      season.division_label,
      season.hidden_grade
    from nfl_divisions_sim_boards board
    join teams team
      on board.board_kind = 'single'
      and team.division_label = board.division_one
    cross join lateral (
      select candidate.*
      from private.draft_room_nfl_divisions_pool candidate
      where candidate.team_code = team.team_code
      order by md5(board.board_id::text || '|single|' || candidate.season_reference)
      limit 2
    ) season
    where board.board_kind = 'single'

    union all

    select
      board.board_id,
      board.board_kind,
      season.season_reference,
      season.team_code,
      season.division_label,
      season.hidden_grade
    from nfl_divisions_sim_boards board
    join teams team
      on board.board_kind = 'split'
      and team.division_label in (board.division_one, board.division_two)
    cross join lateral (
      select candidate.*
      from private.draft_room_nfl_divisions_pool candidate
      where candidate.team_code = team.team_code
      order by md5(board.board_id::text || '|split|' || candidate.season_reference)
      limit 1
    ) season
    where board.board_kind = 'split'
  )
  insert into nfl_divisions_sim_items (
    board_id,
    board_kind,
    strength_slot,
    season_reference,
    team_code,
    division_label,
    hidden_grade
  )
  select
    picked.board_id,
    picked.board_kind,
    row_number() over (
      partition by picked.board_id
      order by picked.team_code, picked.season_reference
    )::integer,
    picked.season_reference,
    picked.team_code,
    picked.division_label,
    picked.hidden_grade
  from picked;

  if (select count(*) from nfl_divisions_sim_items) <> 80000
    or exists (
      select 1
      from nfl_divisions_sim_items
      group by board_id
      having count(*) <> 8
    )
  then
    raise exception 'NFL Divisions simulation did not materialize 10,000 valid eight-season boards';
  end if;

  if exists (
    select 1
    from nfl_divisions_sim_items item
    join nfl_divisions_sim_boards board on board.board_id = item.board_id
    where board.board_kind = 'single'
    group by item.board_id, item.team_code
    having count(*) <> 2
  ) or exists (
    select 1
    from nfl_divisions_sim_items item
    join nfl_divisions_sim_boards board on board.board_id = item.board_id
    where board.board_kind = 'split'
    group by item.board_id, item.team_code
    having count(*) <> 1
  ) then
    raise exception 'NFL Divisions simulated board composition drifted from the locked single/split contract';
  end if;

  create temporary table nfl_divisions_sim_spreads on commit drop as
  select
    board_id,
    board_kind,
    max(hidden_grade) - min(hidden_grade) as board_spread
  from nfl_divisions_sim_items
  group by board_id, board_kind;

  select
    avg(board_spread),
    percentile_cont(0.10) within group (order by board_spread),
    percentile_cont(0.50) within group (order by board_spread)
  into v_mean_spread, v_p10_spread, v_median_spread
  from nfl_divisions_sim_spreads;

  select avg(board_spread)
  into v_single_mean_spread
  from nfl_divisions_sim_spreads
  where board_kind = 'single';

  select avg(board_spread)
  into v_split_mean_spread
  from nfl_divisions_sim_spreads
  where board_kind = 'split';

  if v_mean_spread not between 14 and 17
    or v_p10_spread not between 9.5 and 13
    or v_median_spread not between 14 and 17.5
    or v_single_mean_spread not between 13.5 and 17
    or v_split_mean_spread not between 14 and 18
    or abs(v_single_mean_spread - v_split_mean_spread) > 2.5
  then
    raise exception
      'NFL Divisions board-spread simulation left the calibrated envelope: mean %, p10 %, median %, single %, split %',
      v_mean_spread, v_p10_spread, v_median_spread, v_single_mean_spread, v_split_mean_spread;
  end if;

  create temporary table nfl_divisions_sim_subsets on commit drop as
  select
    row_number() over (order by a, b, c, d)::integer as subset_id,
    array[a,b,c,d]::integer[] as slots
  from generate_series(1, 5) a
  cross join generate_series(a + 1, 6) b
  cross join generate_series(b + 1, 7) c
  cross join generate_series(c + 1, 8) d;

  if (select count(*) from nfl_divisions_sim_subsets) <> 70 then
    raise exception 'NFL Divisions 4-v-4 simulation must enumerate all 70 possible roster splits';
  end if;

  create temporary table nfl_divisions_sim_outcomes on commit drop as
  select
    item.board_id,
    item.board_kind,
    subset.subset_id,
    sum(item.hidden_grade) filter (
      where item.strength_slot = any(subset.slots)
    ) as selected_sum,
    (
      sum(item.hidden_grade) filter (
        where item.strength_slot = any(subset.slots)
      )
      - sum(item.hidden_grade) filter (
        where not (item.strength_slot = any(subset.slots))
      )
    ) / 4.0 as signed_margin
  from nfl_divisions_sim_items item
  cross join nfl_divisions_sim_subsets subset
  group by item.board_id, item.board_kind, subset.subset_id;

  if (select count(*) from nfl_divisions_sim_outcomes) <> 700000 then
    raise exception 'NFL Divisions simulation did not evaluate every 4-v-4 allocation';
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
  from nfl_divisions_sim_outcomes;

  with weighted as (
    select
      board_id,
      exp(0.059 * selected_sum) as decision_weight,
      signed_margin
    from nfl_divisions_sim_outcomes
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
    'NFL Divisions simulation: mean spread %, p10 %, median spread %, single mean %, split mean %, under1 margin %, under3 margin %, >=4 margin %, median margin %, skilled win %',
    round(v_mean_spread, 3),
    round(v_p10_spread, 3),
    round(v_median_spread, 3),
    round(v_single_mean_spread, 3),
    round(v_split_mean_spread, 3),
    round(v_close_one_rate, 4),
    round(v_close_three_rate, 4),
    round(v_four_plus_rate, 4),
    round(v_median_margin, 3),
    round(v_skill_win_rate, 4);

  if v_close_one_rate not between 0.15 and 0.22
    or v_close_three_rate not between 0.48 and 0.59
    or v_four_plus_rate not between 0.27 and 0.38
    or v_median_margin not between 2.25 and 3.25
    or v_skill_win_rate not between 0.64 and 0.71
  then
    raise exception
      'NFL Divisions competitive simulation left the calibrated envelope: under1 %, under3 %, >=4 %, median %, skilled win %',
      v_close_one_rate, v_close_three_rate, v_four_plus_rate, v_median_margin, v_skill_win_rate;
  end if;
end $nfl_divisions_sim$;

rollback;
