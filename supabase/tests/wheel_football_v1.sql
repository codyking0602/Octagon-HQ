begin;

do $$
declare
  v_team_count integer;
  v_afc_count integer;
  v_nfc_count integer;
  v_bad_divisions integer;
begin
  select count(*) into v_team_count from private.wheel_football_teams;
  if v_team_count <> 32 then
    raise exception 'Wheel of Football must own exactly 32 NFL teams, got %', v_team_count;
  end if;

  select count(*) into v_afc_count from private.wheel_football_teams where conference = 'AFC';
  select count(*) into v_nfc_count from private.wheel_football_teams where conference = 'NFC';
  if v_afc_count <> 16 or v_nfc_count <> 16 then
    raise exception 'Wheel conference split must be 16/16, got %/%', v_afc_count, v_nfc_count;
  end if;

  select count(*)
    into v_bad_divisions
  from (
    select conference, division, count(*) as team_count
    from private.wheel_football_teams
    group by conference, division
    having count(*) <> 4
  ) bad;
  if v_bad_divisions <> 0 then
    raise exception 'Each NFL division must own four Wheel teams';
  end if;

  if to_regprocedure('public.create_wheel_football_challenge(uuid,text,text)') is null
    or to_regprocedure('public.get_my_wheel_football_match(text)') is null
    or to_regprocedure('public.open_wheel_football_challenge(text)') is null
    or to_regprocedure('public.spin_wheel_football(text)') is null
    or to_regprocedure('public.forfeit_wheel_football(text)') is null
    or to_regprocedure('public.pick_wheel_football(text,text,text,text,text,text,text)') is null then
    raise exception 'Wheel of Football RPC contract is incomplete';
  end if;

  if has_table_privilege('anon', 'private.wheel_football_matches', 'select')
    or has_table_privilege('authenticated', 'private.wheel_football_matches', 'select')
    or has_table_privilege('anon', 'private.wheel_football_picks', 'select')
    or has_table_privilege('authenticated', 'private.wheel_football_picks', 'select') then
    raise exception 'Wheel private state leaked direct table access';
  end if;
end;
$$;


do $$
declare
  v_grade_count integer;
  v_dak smallint;
  v_hunter_wr smallint;
  v_hunter_secondary smallint;
  v_state_definition text;
  v_nullable_columns integer;
  v_pick_definition text;
begin
  select count(*)
    into v_grade_count
  from private.wheel_football_nfl_grades
  where effective_date = date '2026-10-03';

  if v_grade_count <> 626 then
    raise exception 'Wheel authoritative NFL grade population must be 626, got %', v_grade_count;
  end if;

  if has_table_privilege('anon', 'private.wheel_football_nfl_grades', 'select')
    or has_table_privilege('authenticated', 'private.wheel_football_nfl_grades', 'select') then
    raise exception 'Wheel authoritative grades leaked direct table access';
  end if;

  select grade into v_dak
  from private.resolve_wheel_football_nfl_grade('DAL', 'QB', 'Dak Prescott', date '2026-10-03');
  if v_dak <> 92 then
    raise exception 'Dak authoritative QB grade resolved incorrectly: %', v_dak;
  end if;

  select grade into v_hunter_wr
  from private.resolve_wheel_football_nfl_grade('JAX', 'WR', 'Travis Hunter', date '2026-10-03');
  select grade into v_hunter_secondary
  from private.resolve_wheel_football_nfl_grade('JAX', 'Secondary', 'Travis Hunter', date '2026-10-03');

  if v_hunter_wr <> 77 or v_hunter_secondary <> 82 then
    raise exception 'Same-name position binding failed for Travis Hunter: WR %, Secondary %',
      v_hunter_wr, v_hunter_secondary;
  end if;

  select count(*)
    into v_nullable_columns
  from information_schema.columns
  where table_schema = 'private'
    and table_name = 'wheel_football_picks'
    and column_name in ('selected_grade', 'grade_version', 'grade_effective_date')
    and is_nullable = 'YES';

  if v_nullable_columns <> 3 then
    raise exception 'Legacy Wheel grade columns must remain nullable for pre-grading history, got % nullable columns',
      v_nullable_columns;
  end if;

  v_pick_definition := pg_get_functiondef('private.pick_wheel_football(text,text,text,text,text,text,text)'::regprocedure);
  if position('v_selected_grade' in v_pick_definition) = 0
    or position('selected_grade,' in v_pick_definition) = 0
    or position('v_grade_version' in v_pick_definition) = 0
    or position('v_grade_effective_date' in v_pick_definition) = 0 then
    raise exception 'New Wheel picks do not freeze authoritative grade/version/effective date';
  end if;

  v_state_definition := pg_get_functiondef('private.wheel_football_state_json(uuid)'::regprocedure);
  if position('selected_grade' in v_state_definition) > 0
    or position('grade_version' in v_state_definition) > 0
    or position('grade_effective_date' in v_state_definition) > 0
    or position('creator_raw_grade' in v_state_definition) > 0
    or position('recipient_raw_grade' in v_state_definition) > 0 then
    raise exception 'Wheel state JSON exposes private grading internals';
  end if;

  if position('creator_final_grade' in v_state_definition) = 0
    or position('recipient_final_grade' in v_state_definition) = 0 then
    raise exception 'Wheel state JSON is missing final team grade reveal fields';
  end if;
end;
$$;

rollback;
