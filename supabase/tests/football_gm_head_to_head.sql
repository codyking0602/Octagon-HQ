begin;

do $$
declare
  v_pick_definition text;
  v_year1_definition text;
  v_offseason_definition text;
  v_finish_definition text;
  v_forfeit_definition text;
begin
  if to_regclass('private.football_gm_matches') is null
    or to_regclass('private.football_gm_participants') is null then
    raise exception 'The GM head-to-head tables are missing';
  end if;

  if to_regprocedure('private.create_football_gm_challenge(uuid)') is null
    or to_regprocedure('public.create_football_gm_challenge(uuid)') is null
    or to_regprocedure('private.get_my_football_gm_match(text)') is null
    or to_regprocedure('public.get_my_football_gm_match(text)') is null
    or to_regprocedure('private.open_football_gm_challenge(text)') is null
    or to_regprocedure('public.open_football_gm_challenge(text)') is null
    or to_regprocedure('private.spin_football_gm(text,text[])') is null
    or to_regprocedure('public.spin_football_gm(text,text[])') is null
    or to_regprocedure('private.pick_football_gm(text,text,text,jsonb)') is null
    or to_regprocedure('public.pick_football_gm(text,text,text,jsonb)') is null
    or to_regprocedure('private.submit_football_gm_year1(text,jsonb)') is null
    or to_regprocedure('public.submit_football_gm_year1(text,jsonb)') is null
    or to_regprocedure('private.save_football_gm_offseason(text,jsonb)') is null
    or to_regprocedure('public.save_football_gm_offseason(text,jsonb)') is null
    or to_regprocedure('private.finish_football_gm_offseason(text,jsonb)') is null
    or to_regprocedure('public.finish_football_gm_offseason(text,jsonb)') is null
    or to_regprocedure('private.forfeit_football_gm(text)') is null
    or to_regprocedure('public.forfeit_football_gm(text)') is null then
    raise exception 'The GM head-to-head RPC contract is incomplete';
  end if;

  select pg_get_functiondef('private.pick_football_gm(text,text,text,jsonb)'::regprocedure)
    into v_pick_definition;
  if position('current_turn_profile_id <> v_user_id' in v_pick_definition) = 0
    or position('That player was already drafted in this match' in v_pick_definition) = 0
    or position('current_turn_profile_id = case' in v_pick_definition) = 0 then
    raise exception 'The GM draft turn ownership or match-wide uniqueness drifted';
  end if;

  select pg_get_functiondef('private.submit_football_gm_year1(text,jsonb)'::regprocedure)
    into v_year1_definition;
  if position('football_gm_finish_rank' in v_year1_definition) = 0
    or position('offseason_first_profile_id' in v_year1_definition) = 0
    or position('order by' in v_year1_definition) = 0
    or position('football_gm_repair_duplicate_finalists' in v_year1_definition) = 0 then
    raise exception 'The GM Year 1 offseason-priority contract drifted';
  end if;

  select pg_get_functiondef('private.save_football_gm_offseason(text,jsonb)'::regprocedure)
    into v_offseason_definition;
  if position('It is not your offseason' in v_offseason_definition) = 0
    or position('already held by the other GM' in v_offseason_definition) = 0 then
    raise exception 'The GM shared offseason market is not server-owned';
  end if;

  select pg_get_functiondef('private.finish_football_gm_offseason(text,jsonb)'::regprocedure)
    into v_finish_definition;
  if position('offseason_completed_at' in v_finish_definition) = 0
    or position('current_turn_profile_id = v_other_id' in v_finish_definition) = 0
    or position('The remaining market is yours' in v_finish_definition) = 0 then
    raise exception 'The GM full-offseason handoff contract drifted';
  end if;

  select pg_get_functiondef('private.forfeit_football_gm(text)'::regprocedure)
    into v_forfeit_definition;
  if position('match has not started' in v_forfeit_definition) = 0
    or position('set phase = ''complete''' in v_forfeit_definition) = 0
    or position('forfeited_by_profile_id = v_user_id' in v_forfeit_definition) = 0
    or position('exception when others then' in v_forfeit_definition) = 0 then
    raise exception 'The GM active-match forfeit contract drifted';
  end if;

  if to_regprocedure('private.football_gm_repair_duplicate_finalists(uuid,uuid)') is null then
    raise exception 'GM legacy double-finalist normalizer is missing';
  end if;

  if exists (
    select 1
    from private.football_gm_matches match
    join private.football_gm_participants participant
      on participant.challenge_id = match.challenge_id
    where match.phase = 'complete'
      and match.offseason_first_profile_id is not null
    group by match.challenge_id
    having count(*) = 2
      and count(distinct participant.year1_result ->> 'finish') = 1
      and max(participant.year1_result ->> 'finish') in ('Champion', 'Super Bowl Loss')
  ) then
    raise exception 'Legacy GM match still has two exclusive Super Bowl finalists';
  end if;

  if has_table_privilege('anon', 'private.football_gm_matches', 'select')
    or has_table_privilege('authenticated', 'private.football_gm_matches', 'select')
    or has_table_privilege('anon', 'private.football_gm_participants', 'select')
    or has_table_privilege('authenticated', 'private.football_gm_participants', 'select') then
    raise exception 'The GM private match state leaked direct table access';
  end if;
end;
$$;

rollback;
