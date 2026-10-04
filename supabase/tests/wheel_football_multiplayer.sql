begin;

do $$
declare
  v_state_definition text;
  v_pick_definition text;
  v_forfeit_definition text;
  v_open_definition text;
begin
  if to_regclass('private.wheel_football_participants') is null then
    raise exception 'Wheel multiplayer participant table is missing';
  end if;

  if to_regprocedure('private.create_wheel_football_challenge(uuid[],text,text)') is null
    or to_regprocedure('public.create_wheel_football_challenge(uuid[],text,text)') is null
    or to_regprocedure('private.decline_wheel_football_challenge(text)') is null
    or to_regprocedure('public.decline_wheel_football_challenge(text)') is null
    or to_regprocedure('private.finish_wheel_football(uuid,boolean)') is null then
    raise exception 'Wheel multiplayer RPC/function contract is incomplete';
  end if;

  select pg_get_functiondef('private.wheel_football_state_json(uuid)'::regprocedure)
    into v_state_definition;
  if position('participants' in v_state_definition) = 0
    or position('max_turns' in v_state_definition) = 0
    or position('winner_profile_ids' in v_state_definition) = 0 then
    raise exception 'Wheel multiplayer state projection is incomplete';
  end if;

  select pg_get_functiondef('private.open_wheel_football_challenge(text)'::regprocedure)
    into v_open_definition;
  if position('v_unaccepted = 0' in v_open_definition) = 0
    or position('order by random()' in v_open_definition) = 0 then
    raise exception 'Wheel multiplayer lobby does not wait for all accepts/randomize first turn';
  end if;

  select pg_get_functiondef('private.pick_wheel_football(text,text,text,text,text,text,text)'::regprocedure)
    into v_pick_definition;
  if position('wheel_football_participants' in v_pick_definition) = 0
    or position('participant.seat_order > v_actor_seat' in v_pick_definition) = 0
    or position('already drafted in this match' in v_pick_definition) = 0 then
    raise exception 'Wheel multiplayer pick rotation/uniqueness contract drifted';
  end if;

  select pg_get_functiondef('private.forfeit_wheel_football(text)'::regprocedure)
    into v_forfeit_definition;
  if position('v_remaining <= 1' in v_forfeit_definition) = 0
    or position('remaining players continue' in v_forfeit_definition) = 0 then
    raise exception 'Wheel multiplayer forfeit continuation contract drifted';
  end if;

  if has_table_privilege('anon', 'private.wheel_football_participants', 'select')
    or has_table_privilege('authenticated', 'private.wheel_football_participants', 'select') then
    raise exception 'Wheel multiplayer participant state leaked direct table access';
  end if;
end;
$$;

rollback;
