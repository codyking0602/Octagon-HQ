begin;

do $$
declare
  v_indexdef text;
  v_functiondef text;
begin
  select indexdef
    into v_indexdef
  from pg_indexes
  where schemaname = 'private'
    and indexname = 'wheel_football_picks_challenge_athlete_unique';

  if v_indexdef is null
    or position('(challenge_id, athlete_id)' in v_indexdef) = 0 then
    raise exception 'Wheel match-wide athlete uniqueness index is missing or malformed';
  end if;

  select pg_get_functiondef(
    'private.pick_wheel_football(text,text,text,text,text,text,text)'::regprocedure
  )
    into v_functiondef;

  if position('That player has already been drafted in this matchup' in v_functiondef) = 0 then
    raise exception 'Wheel match-wide duplicate guard is missing';
  end if;

  if position(
    'pick.profile_id = v_user_id' || chr(10) || '      and pick.athlete_id = trim(p_athlete_id)'
    in v_functiondef
  ) > 0 then
    raise exception 'Wheel duplicate guard is still scoped to one participant';
  end if;
end;
$$;

rollback;
