begin;

do $$
declare
  v_total integer;
  v_qb integer;
  v_rb integer;
  v_wr integer;
  v_te integer;
  v_front integer;
  v_secondary integer;
  v_coach integer;
  v_snapshot jsonb;
begin
  select count(*) into v_total from private.wheel_football_nfl_grades;
  if v_total <> 626 then
    raise exception 'Wheel NFL grade authority must contain 626 rows, got %', v_total;
  end if;

  select count(*) into v_qb from private.wheel_football_nfl_grades where grade_family = 'QB';
  select count(*) into v_rb from private.wheel_football_nfl_grades where grade_family = 'RB';
  select count(*) into v_wr from private.wheel_football_nfl_grades where grade_family = 'WR';
  select count(*) into v_te from private.wheel_football_nfl_grades where grade_family = 'TE';
  select count(*) into v_front from private.wheel_football_nfl_grades where grade_family = 'Front Seven';
  select count(*) into v_secondary from private.wheel_football_nfl_grades where grade_family = 'Secondary';
  select count(*) into v_coach from private.wheel_football_nfl_grades where grade_family = 'Head Coach';

  if v_qb <> 34 or v_rb <> 65 or v_wr <> 103 or v_te <> 33
    or v_front <> 191 or v_secondary <> 168 or v_coach <> 32 then
    raise exception 'Wheel NFL grade family counts are wrong: QB %, RB %, WR %, TE %, front %, secondary %, coach %',
      v_qb, v_rb, v_wr, v_te, v_front, v_secondary, v_coach;
  end if;

  if has_table_privilege('anon', 'private.wheel_football_nfl_grades', 'select')
    or has_table_privilege('authenticated', 'private.wheel_football_nfl_grades', 'select') then
    raise exception 'Wheel NFL grades leaked direct table access';
  end if;

  v_snapshot := private.wheel_football_grade_snapshot_json('BUF', 'Josh Allen', 'QB', 'QB');
  if (v_snapshot ->> 'grade')::integer <> 99 or v_snapshot ->> 'family' <> 'QB' then
    raise exception 'Josh Allen authoritative grade did not resolve';
  end if;

  v_snapshot := private.wheel_football_grade_snapshot_json('DAL', 'CeeDee Lamb', 'WR', 'Flex');
  if v_snapshot is null or v_snapshot ->> 'family' <> 'WR' then
    raise exception 'Flex did not inherit the WR grade family';
  end if;

  v_snapshot := private.wheel_football_grade_snapshot_json('DAL', 'Dak Prescott', 'WR', 'WR');
  if v_snapshot is not null then
    raise exception 'wrong-position grade collision resolved unexpectedly';
  end if;

  v_snapshot := private.wheel_football_grade_snapshot_json('NYG', 'Jevon Holland', 'S', 'Secondary');
  if v_snapshot is null or v_snapshot ->> 'family' <> 'Secondary' then
    raise exception 'accent-normalized same-player identity did not resolve';
  end if;

  if private.wheel_football_presentation_score(75 * 7, 7) <> 50
    or private.wheel_football_presentation_score(80 * 7, 7) <> 60
    or private.wheel_football_presentation_score(85 * 7, 7) <> 70
    or private.wheel_football_presentation_score(90 * 7, 7) <> 80
    or private.wheel_football_presentation_score(95 * 7, 7) <> 90
    or private.wheel_football_presentation_score(100 * 7, 7) <> 100 then
    raise exception 'Wheel presentation score curve changed';
  end if;
end;
$$;

rollback;
