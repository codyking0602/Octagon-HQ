begin;

do $$
declare
  v_candidate_count integer;
  v_team_count integer;
  v_spin_def text;
  v_state_def text;
begin
  if to_regclass('private.wheel_football_slot_candidate_authority') is null then
    raise exception 'Wheel slot candidate authority is missing';
  end if;

  select count(*), count(distinct team_code)
    into v_candidate_count, v_team_count
  from private.wheel_football_slot_candidate_authority;

  if v_candidate_count <> 2270 then
    raise exception 'Wheel eligibility authority expected 2270 slot candidates, got %', v_candidate_count;
  end if;

  if v_team_count <> 101 then
    raise exception 'Wheel eligibility authority expected 101 NFL/CFB teams, got %', v_team_count;
  end if;

  if not exists (
    select 1
    from private.wheel_football_slot_candidate_authority
    where team_code = 'DAL'
      and roster_slot = 'QB'
      and candidate_name = 'Dak Prescott'
  ) or not exists (
    select 1
    from private.wheel_football_slot_candidate_authority
    where team_code = 'DAL'
      and roster_slot = 'Head Coach'
      and candidate_name = 'Brian Schottenheimer'
  ) then
    raise exception 'Dallas QB/coach dead-roll authority is incomplete';
  end if;

  if not exists (
    select 1
    from private.wheel_football_slot_candidate_authority
    where team_code = 'boise-state'
      and roster_slot = 'QB'
      and candidate_name = 'Maddux Madsen'
  ) or not exists (
    select 1
    from private.wheel_football_slot_candidate_authority
    where team_code = 'boise-state'
      and roster_slot = 'Head Coach'
      and candidate_name = 'Spencer Danielson'
  ) then
    raise exception 'CFB/AP Top 25 dead-roll authority is incomplete';
  end if;

  if has_table_privilege('anon', 'private.wheel_football_slot_candidate_authority', 'select')
    or has_table_privilege('authenticated', 'private.wheel_football_slot_candidate_authority', 'select') then
    raise exception 'Wheel slot candidate authority leaked direct table access';
  end if;

  if to_regprocedure('private.wheel_football_team_has_open_candidate(uuid,uuid,text)') is null
    or to_regprocedure('private.wheel_football_eligible_team_codes(uuid,uuid)') is null then
    raise exception 'Wheel eligibility helper contract is incomplete';
  end if;

  select pg_get_functiondef('private.spin_wheel_football(text)'::regprocedure)
    into v_spin_def;

  if position('wheel_football_eligible_team_codes' in v_spin_def) = 0 then
    raise exception 'Wheel spin does not use the server-owned eligibility pool';
  end if;

  if position('case when eligible.code = v_last_team then 1 else 0 end' in lower(v_spin_def)) = 0 then
    raise exception 'Wheel spin does not soft-avoid the previous team';
  end if;

  if position('team.code <> v_last_team' in v_spin_def) > 0 then
    raise exception 'Wheel spin still hard-blocks the previous team and can deadlock';
  end if;

  select pg_get_functiondef('private.wheel_football_state_json(uuid)'::regprocedure)
    into v_state_def;

  if position('eligible_team_codes' in v_state_def) = 0 then
    raise exception 'Wheel state does not expose the eligible wheel projection';
  end if;
end;
$$;

rollback;
