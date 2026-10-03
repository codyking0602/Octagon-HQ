begin;

do $$
declare
  v_count integer;
  v_grade numeric;
  v_version text;
  v_effective date;
begin
  select count(*) into v_count from private.wheel_football_grade_authority;
  if v_count <> 626 then
    raise exception 'Expected 626 locked Wheel grades, got %', v_count;
  end if;

  if has_table_privilege('anon', 'private.wheel_football_grade_authority', 'select')
    or has_table_privilege('authenticated', 'private.wheel_football_grade_authority', 'select') then
    raise exception 'Wheel grade authority leaked direct read access';
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
  from private.resolve_wheel_football_grade_snapshot('DAL', 'Jake Ferguson', 'Flex', 'TE');
  if v_grade is null then
    raise exception 'Flex did not inherit the TE grade';
  end if;

  if private.wheel_football_final_grade(90) <> 70
    or private.wheel_football_final_grade(92) <> 80
    or private.wheel_football_final_grade(94) <> 90
    or private.wheel_football_final_grade(96) <> 100 then
    raise exception 'Wheel final-grade curve drifted from Weekly Superteam separation';
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
