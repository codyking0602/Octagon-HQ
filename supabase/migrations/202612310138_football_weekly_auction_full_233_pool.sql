-- Weekly Auction: open Best CFB Teams to the complete 233-season calibrated pool.
-- Preserve any day that already has bids or awards. Refresh only untouched future slots
-- in the current live week so the expanded pool is eligible immediately.

CREATE OR REPLACE FUNCTION private.materialize_football_weekly_auction_week(p_week_start date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_themes text[];
  v_theme text;
  v_day integer;
  v_slot integer;
  v_attempt integer;
  v_shape_attempt integer;
  v_shape text;
  v_shape_roll double precision;
  v_prev_shape text;
  v_two_back_shape text;
  v_targets numeric[];
  v_target numeric;
  v_high numeric;
  v_center numeric;
  v_pick private.draft_room_cfb_best_teams_pool;
  v_used_refs text[];
  v_used_schools text[];
  v_forced_refs text[];
  v_trap_blue_ref text;
  v_trap_other_ref text;
  v_elites integer;
  v_lock_at timestamptz;
begin
  if p_week_start < date '2026-09-15' then
    return;
  end if;
  if extract(isodow from p_week_start) <> 2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  insert into private.football_weekly_auction_weeks(week_start)
  values (p_week_start)
  on conflict (week_start) do nothing;

  if (select count(*) from private.football_weekly_auction_board where week_start = p_week_start) = 21 then
    return;
  end if;

  <<attempt_loop>>
  for v_attempt in 1..500 loop
    delete from private.football_weekly_auction_board where week_start = p_week_start;
    v_used_refs := array[]::text[];
    v_used_schools := array[]::text[];
    v_elites := 0;
    v_prev_shape := null;
    v_two_back_shape := null;

    select array_agg(theme order by random())
    into v_themes
    from unnest(array['SEC','SEC','Big Ten','Big Ten','Big 12','ACC','Wildcard']::text[]) as theme;

    for v_day in 1..7 loop
      v_theme := v_themes[v_day];

      for v_shape_attempt in 1..30 loop
        v_shape_roll := random() * 100;
        v_shape := case
          when v_shape_roll < 19 then 'Wide'
          when v_shape_roll < 37 then 'Compressed'
          when v_shape_roll < 54 then 'TopHeavy'
          when v_shape_roll < 74 then 'MiddleHeavy'
          when v_shape_roll < 88 then 'Trap'
          else 'Chaotic'
        end;
        exit when not (v_shape = v_prev_shape and v_shape = v_two_back_shape);
      end loop;
      if v_shape = v_prev_shape and v_shape = v_two_back_shape then
        continue attempt_loop;
      end if;

      v_forced_refs := array[]::text[];
      v_targets := null;

      if v_shape = 'Wide' then
        v_high := 94 + floor(random() * 9) * 0.5;
        v_targets := array[
          v_high,
          v_high - (4 + random() * 1.5),
          v_high - (7 + random() * 2)
        ]::numeric[];
      elsif v_shape = 'Compressed' then
        v_center := 88.5 + floor(random() * 14) * 0.5;
        v_targets := array[v_center - 0.5, v_center, v_center + 0.5]::numeric[];
      elsif v_shape = 'TopHeavy' then
        v_high := 94 + floor(random() * 8) * 0.5;
        v_targets := array[
          v_high,
          v_high - (0.5 + random()),
          v_high - (4 + random() * 2)
        ]::numeric[];
      elsif v_shape = 'MiddleHeavy' then
        v_center := 89.5 + floor(random() * 8) * 0.5;
        v_targets := array[
          v_center - (1.2 + random() * 0.8),
          v_center + (random() - 0.5) * 0.5,
          v_center + (1.2 + random() * 0.8)
        ]::numeric[];
      elsif v_shape = 'Trap' then
        v_trap_blue_ref := null;
        v_trap_other_ref := null;

        select blue.season_reference, other.season_reference
        into v_trap_blue_ref, v_trap_other_ref
        from private.draft_room_cfb_best_teams_pool blue
        cross join private.draft_room_cfb_best_teams_pool other
        where (
            (v_theme = 'Wildcard' and blue.conference_bucket in ('Notre Dame','Wildcard'))
            or blue.conference_bucket = v_theme
          )
          and (
            (v_theme = 'Wildcard' and other.conference_bucket in ('Notre Dame','Wildcard'))
            or other.conference_bucket = v_theme
          )
          and blue.school in (
            'Alabama','Ohio State','USC','Texas','Oklahoma','Michigan','Notre Dame',
            'Georgia','LSU','Florida','Florida State','Clemson','Miami','Penn State',
            'Nebraska','Oregon','Auburn'
          )
          and other.school not in (
            'Alabama','Ohio State','USC','Texas','Oklahoma','Michigan','Notre Dame',
            'Georgia','LSU','Florida','Florida State','Clemson','Miami','Penn State',
            'Nebraska','Oregon','Auburn'
          )
          and other.school <> blue.school
          and other.hidden_grade >= blue.hidden_grade + 1.5
          and other.hidden_grade <= blue.hidden_grade + 4.5
          and not (blue.school = any(v_used_schools))
          and not (other.school = any(v_used_schools))
          and not exists (
            select 1 from private.football_weekly_auction_board prior
            where prior.week_start >= p_week_start - 28
              and prior.week_start < p_week_start
              and prior.season_reference = blue.season_reference
          )
          and not exists (
            select 1 from private.football_weekly_auction_board prior
            where prior.week_start >= p_week_start - 28
              and prior.week_start < p_week_start
              and prior.season_reference = other.season_reference
          )
        order by random()
        limit 1;

        if v_trap_blue_ref is not null and v_trap_other_ref is not null then
          v_forced_refs := array[v_trap_blue_ref, v_trap_other_ref];
          select array[null::numeric, null::numeric, avg(pool.hidden_grade)]::numeric[]
          into v_targets
          from private.draft_room_cfb_best_teams_pool pool
          where pool.season_reference = any(v_forced_refs);
        else
          v_targets := array[
            90 + random() * 4,
            92 + random() * 3,
            88.5 + random() * 3.5
          ]::numeric[];
        end if;
      else
        v_targets := array[
          86 + random() * 14,
          86 + random() * 14,
          86 + random() * 14
        ]::numeric[];
      end if;

      for v_slot in 1..3 loop
        v_pick := null;

        if array_length(v_forced_refs, 1) is not null
          and v_slot <= array_length(v_forced_refs, 1)
        then
          select pool.*
          into v_pick
          from private.draft_room_cfb_best_teams_pool pool
          where pool.season_reference = v_forced_refs[v_slot];
        else
          v_target := v_targets[v_slot];

          select pool.*
          into v_pick
          from private.draft_room_cfb_best_teams_pool pool
          where (
              (v_theme = 'Wildcard' and pool.conference_bucket in ('Notre Dame','Wildcard'))
              or pool.conference_bucket = v_theme
            )
            and not (pool.season_reference = any(v_used_refs))
            and not (pool.school = any(v_used_schools))
            and not exists (
              select 1
              from private.football_weekly_auction_board prior
              where prior.week_start >= p_week_start - 28
                and prior.week_start < p_week_start
                and prior.season_reference = pool.season_reference
            )
          order by abs(pool.hidden_grade - v_target) + random() * 0.3, pool.season_reference
          limit 1;

          if v_pick.season_reference is null then
            select pool.*
            into v_pick
            from private.draft_room_cfb_best_teams_pool pool
            where (
                (v_theme = 'Wildcard' and pool.conference_bucket in ('Notre Dame','Wildcard'))
                or pool.conference_bucket = v_theme
              )
              and not (pool.season_reference = any(v_used_refs))
              and not (pool.school = any(v_used_schools))
            order by abs(pool.hidden_grade - v_target) + random() * 0.3, pool.season_reference
            limit 1;
          end if;
        end if;

        if v_pick.season_reference is null then
          continue attempt_loop;
        end if;

        v_used_refs := array_append(v_used_refs, v_pick.season_reference);
        v_used_schools := array_append(v_used_schools, v_pick.school);
        if v_pick.hidden_grade >= 96 then
          v_elites := v_elites + 1;
        end if;

        v_lock_at := ((p_week_start + v_day)::timestamp at time zone 'America/Chicago');
        insert into private.football_weekly_auction_board(
          week_start, day_index, theme, hidden_shape, slot, season_reference, lock_at
        ) values (
          p_week_start, v_day, v_theme, v_shape, v_slot, v_pick.season_reference, v_lock_at
        );
      end loop;

      v_two_back_shape := v_prev_shape;
      v_prev_shape := v_shape;
    end loop;

    if (select count(*) from private.football_weekly_auction_board where week_start = p_week_start) = 21
      and v_elites between 1 and 6
      and (
        select count(distinct pool.school)
        from private.football_weekly_auction_board board
        join private.draft_room_cfb_best_teams_pool pool using (season_reference)
        where board.week_start = p_week_start
      ) = 21
    then
      return;
    end if;
  end loop;

  raise exception 'Unable to materialize a valid Football Weekly Auction board';
end;
$function$
;

do $weekly_auction_full_pool_refresh$
declare
  v_week_start date := private.football_weekly_auction_week_start(now());
  v_row record;
  v_pick text;
  v_pool_count integer;
begin
  select count(*)
  into v_pool_count
  from private.draft_room_cfb_best_teams_pool;

  if v_pool_count <> 233 then
    raise exception 'Expected 233 calibrated Weekly Auction CFB seasons, found %', v_pool_count;
  end if;

  for v_row in
    select
      board.week_start,
      board.day_index,
      board.slot,
      board.theme,
      pool.hidden_grade as target_grade
    from private.football_weekly_auction_board board
    join private.draft_room_cfb_best_teams_pool pool
      on pool.season_reference = board.season_reference
    where board.week_start = v_week_start
      and board.lock_at > now()
      and not exists (
        select 1
        from private.football_weekly_auction_daily_entries entry
        where entry.week_start = board.week_start
          and entry.day_index = board.day_index
      )
      and not exists (
        select 1
        from private.football_weekly_auction_awards award
        where award.week_start = board.week_start
          and award.day_index = board.day_index
          and award.slot = board.slot
      )
    order by board.day_index, board.slot
  loop
    select candidate.season_reference
    into v_pick
    from private.draft_room_cfb_best_teams_pool candidate
    where (
        (v_row.theme = 'Wildcard' and candidate.conference_bucket in ('Notre Dame','Wildcard'))
        or candidate.conference_bucket = v_row.theme
      )
      and not exists (
        select 1
        from private.football_weekly_auction_board other_board
        join private.draft_room_cfb_best_teams_pool other_pool
          on other_pool.season_reference = other_board.season_reference
        where other_board.week_start = v_row.week_start
          and not (
            other_board.day_index = v_row.day_index
            and other_board.slot = v_row.slot
          )
          and (
            other_board.season_reference = candidate.season_reference
            or other_pool.school = candidate.school
          )
      )
      and not exists (
        select 1
        from private.football_weekly_auction_board prior
        where prior.week_start >= v_row.week_start - 28
          and prior.week_start < v_row.week_start
          and prior.season_reference = candidate.season_reference
      )
    order by
      abs(candidate.hidden_grade - v_row.target_grade) + random() * 0.30,
      candidate.season_reference
    limit 1;

    if v_pick is null then
      raise exception 'Unable to refresh Weekly Auction future slot %.%', v_row.day_index, v_row.slot;
    end if;

    update private.football_weekly_auction_board
    set season_reference = v_pick
    where week_start = v_row.week_start
      and day_index = v_row.day_index
      and slot = v_row.slot;
  end loop;
end
$weekly_auction_full_pool_refresh$;
