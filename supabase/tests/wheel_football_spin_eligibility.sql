begin;

do $$
declare
  v_spin_definition text;
  v_state_definition text;
begin
  if to_regprocedure('private.wheel_football_team_in_pool(text,text,text)') is null
    or to_regprocedure('private.wheel_football_team_has_eligible_pick(uuid,uuid,text)') is null
    or to_regprocedure('private.wheel_football_eligible_team_codes(uuid,uuid,text,text)') is null then
    raise exception 'Wheel eligibility-aware helper contract is incomplete';
  end if;

  select pg_get_functiondef('private.spin_wheel_football(text)'::regprocedure)
    into v_spin_definition;

  if position('wheel_football_eligible_team_codes' in v_spin_definition) = 0 then
    raise exception 'Wheel spin is not using the canonical eligibility-aware team set';
  end if;

  if position('cardinality(v_eligible_team_codes) > 1' in v_spin_definition) = 0 then
    raise exception 'Wheel spin lost the previous-team fallback rule';
  end if;

  if position('v_dead_pending' in v_spin_definition) = 0 then
    raise exception 'Wheel spin lost the dead-pending free re-spin failsafe';
  end if;

  select pg_get_functiondef('private.wheel_football_state_json(uuid)'::regprocedure)
    into v_state_definition;

  if position('eligible_team_codes' in v_state_definition) = 0 then
    raise exception 'Wheel state does not expose server-owned eligible team codes';
  end if;
end;
$$;

rollback;
