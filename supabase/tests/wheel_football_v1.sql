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

rollback;
