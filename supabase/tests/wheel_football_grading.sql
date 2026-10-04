begin;

do $$
declare
  v_count integer;
  v_grade numeric;
  v_version text;
  v_effective date;
begin
  select count(*) into v_count from private.wheel_football_grade_authority;
  if v_count <> 1967 then
    raise exception 'Expected 1967 locked NFL + CFB Wheel grades after Boise audit, got %', v_count;
  end if;

  if has_table_privilege('anon', 'private.wheel_football_grade_authority', 'select')
    or has_table_privilege('authenticated', 'private.wheel_football_grade_authority', 'select') then
    raise exception 'Wheel grade authority leaked direct read access';
  end if;

  select count(*) into v_count
  from private.wheel_football_grade_authority
  where source_artifact like 'data/generated/football/wheel-cfb-%';
  if v_count <> 1335 then
    raise exception 'Expected 1335 locked CFB Wheel grades, got %', v_count;
  end if;

  select count(*) into v_count
  from private.wheel_football_grade_authority
  where team_code = 'boise-state'
    and source_artifact = 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json';
  if v_count <> 19 then
    raise exception 'Expected 19 current audited Boise State Wheel grades, got %', v_count;
  end if;

  select count(*) into v_count
  from private.wheel_football_teams
  where conference in ('SEC', 'Big Ten', 'Big 12', 'ACC', 'Independent');
  if v_count <> 68 then
    raise exception 'Expected 68 current CFB Wheel schools, got %', v_count;
  end if;

  select count(*) into v_count from private.wheel_football_teams where conference = 'SEC';
  if v_count <> 16 then raise exception 'CFB SEC pool drifted: %', v_count; end if;
  select count(*) into v_count from private.wheel_football_teams where conference = 'Big Ten';
  if v_count <> 18 then raise exception 'CFB Big Ten pool drifted: %', v_count; end if;
  select count(*) into v_count from private.wheel_football_teams where conference = 'Big 12';
  if v_count <> 16 then raise exception 'CFB Big 12 pool drifted: %', v_count; end if;
  select count(*) into v_count from private.wheel_football_teams where conference = 'ACC';
  if v_count <> 17 then raise exception 'CFB ACC pool drifted: %', v_count; end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('texas', 'Arch Manning', 'QB', 'QB');
  if v_grade <> 88 then
    raise exception 'Arch Manning CFB QB grade resolved incorrectly: %', v_grade;
  end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('lsu', 'Trey''Dez Green', 'Flex', 'TE');
  if v_grade <> 97 then
    raise exception 'CFB Flex did not inherit Trey''Dez Green TE grade: %', v_grade;
  end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('indiana', 'Curt Cignetti', 'Head Coach', 'HC');
  if v_grade <> 99 then
    raise exception 'Curt Cignetti CFB Head Coach grade resolved incorrectly: %', v_grade;
  end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('boise-state', 'Dylan Riley', 'RB', 'RB');
  if v_grade <> 95 then
    raise exception 'Dylan Riley audited Boise State RB grade resolved incorrectly: %', v_grade;
  end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('boise-state', 'Matt Wagner', 'Flex', 'TE');
  if v_grade <> 84 then
    raise exception 'Matt Wagner audited Boise State Flex/TE grade resolved incorrectly: %', v_grade;
  end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('boise-state', 'Boen Phelps', 'Front Seven', 'LB');
  if v_grade <> 88 then
    raise exception 'Boen Phelps audited Boise State Front Seven grade resolved incorrectly: %', v_grade;
  end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('boise-state', 'Travis Anderson', 'Secondary', 'S');
  if v_grade <> 86 then
    raise exception 'Travis Anderson audited Boise State Secondary grade resolved incorrectly: %', v_grade;
  end if;

  select hidden_grade, grade_version, effective_date
    into v_grade, v_version, v_effective
  from private.resolve_wheel_football_grade_snapshot('boise-state', 'Spencer Danielson', 'Head Coach', 'HC');
  if v_grade <> 86
    or v_version <> 'cfb-wheel-boise-state-grades-2026-10-03-v2'
    or v_effective <> date '2026-10-03' then
    raise exception 'Spencer Danielson audited Boise State coach snapshot resolved incorrectly: grade %, version %, date %',
      v_grade, v_version, v_effective;
  end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('boise-state', 'Kaden Anderson', 'Flex', 'TE');
  if v_grade <> 80 then
    raise exception 'Legacy Boise State Kaden Anderson grade no longer resolves for compatibility: %', v_grade;
  end if;

  select hidden_grade, grade_version, effective_date
    into v_grade, v_version, v_effective
  from private.resolve_wheel_football_grade_snapshot('JAX', 'Travis Hunter', 'WR', 'WR');
  if v_grade <> 77 then
    raise exception 'Travis Hunter WR grade resolved incorrectly: %', v_grade;
  end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('JAX', 'Travis Hunter', 'Secondary', 'CB');
  if v_grade <> 82 then
    raise exception 'Travis Hunter Secondary grade resolved incorrectly: %', v_grade;
  end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('KC', 'Kenneth Walker III', 'RB', 'RB');
  if v_grade <> 89 then
    raise exception 'Kenneth Walker III suffix-safe RB grade resolved incorrectly: %', v_grade;
  end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('KC', 'Kenneth Walker III', 'Flex', 'RB');
  if v_grade <> 89 then
    raise exception 'Kenneth Walker III suffix-safe Flex grade resolved incorrectly: %', v_grade;
  end if;

  select hidden_grade
    into v_grade
  from private.resolve_wheel_football_grade_snapshot('DAL', 'Jake Ferguson', 'Flex', 'TE');
  if v_grade is null then
    raise exception 'Flex did not inherit the TE grade';
  end if;

  if private.wheel_football_final_grade_v2(89) <> 80
    or private.wheel_football_final_grade_v2(90) <> 82.5
    or private.wheel_football_final_grade_v2(92) <> 87.5
    or private.wheel_football_final_grade_v2(94) <> 92.5
    or private.wheel_football_final_grade_v2(95) <> 95
    or private.wheel_football_final_grade_v2(96) <> 96
    or private.wheel_football_final_grade_v2(99) <> 99 then
    raise exception 'Wheel final-grade v2 curve drifted from approved 2.5x calibration';
  end if;

  if has_function_privilege('anon', 'private.wheel_football_grade_total(uuid,uuid)', 'execute')
    or has_function_privilege('authenticated', 'private.wheel_football_grade_total(uuid,uuid)', 'execute') then
    raise exception 'Wheel exact grade total leaked callable access';
  end if;

  begin
    perform *
    from private.resolve_wheel_football_grade_snapshot('DAL', 'Definitely Missing', 'QB', 'QB');
    raise exception 'Missing curated grade did not fail loudly';
  exception
    when others then
      if sqlerrm = 'Missing curated grade did not fail loudly' then
        raise;
      end if;
      if position('Missing locked Wheel grade' in sqlerrm) = 0 then
        raise;
      end if;
  end;
end;
$$;

rollback;
