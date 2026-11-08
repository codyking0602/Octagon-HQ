-- V13 end-to-end action, two actual authenticated three-year franchises.
-- Runs on an isolated GitHub Actions database with V13 migration installed.
-- Member data, transactions and player snapshots are fully rolled back.
begin;
set local statement_timeout='240s';
select set_config('request.jwt.claim.role','service_role',true);
do $v13_full_action$
declare
  v_owner uuid:=extensions.gen_random_uuid();
  v_state jsonb;v_original jsonb;v_result2 jsonb;v_result3 jsonb;
  v_run_seed text;v_team text;v_player text;v_old text;v_new text;
  v_idx integer;v_round integer;v_yr integer;v_spend bigint;
  v_released boolean;v_saved jsonb;v_score jsonb;
  v_v11_state jsonb;v_season_one jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values(v_owner,'00000000-0000-0000-0000-000000000000','authenticated',
    'authenticated','nba-gm-v13-release-candidate@login.octagon-hq.app','',
    now(),now(),now(),jsonb_build_object('display_name','V13 QA','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_owner,'V13QA','VQ');
  insert into public.pick_control_owners(profile_id) values(v_owner);
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);

  for v_idx in 1..2 loop
    v_state:=public.nba_gm_dev_action('start');
    v_run_seed:=v_state->>'seed';
    if v_state->>'simulationModelVersion'<>'13'
      or v_state->>'lineupModelVersion'<>'2'
      or v_state->>'repriceModelVersion'<>'2'
       or v_state->>'rosterQualityVersion'<>'1'
      or v_state->>'strengthCalibrationVersion'<>'1'
      or v_state->'caps' is distinct from
          '[175000000,175000000,175000000]'::jsonb
      or v_state->>'phase'<>'draft'
      then raise exception 'V13 start/default/cap regression: %',v_state;end if;

    for v_round in 1..7 loop
      v_state:=public.nba_gm_dev_action('spin');
      v_team:=v_state->>'pendingTeam';
      -- Two realistic wheel strategies: contract-efficient and shooting fit.
      -- Both use only wheel-accessible, roster-legal, authoritative salaries.
      select p.id into v_player from private.nba_gm_dev_players p
      where p.team_code=v_team and private.nba_gm_v2_can_add(v_state,p.id)
      order by case when v_idx=1 then
        .52*p.overall - .95*p.salaries[3]::numeric/1000000
      else
        .30*p.overall + .16*(p.skills->>'shooting')::numeric
          + .08*(p.skills->>'perimeterDefense')::numeric
          - .92*p.salaries[3]::numeric/1000000 end desc,
        p.id limit 1;
      if v_player is null then
        raise exception 'V13 wheel dead-end: approach %, round %, team %',
          v_idx,v_round,v_team;end if;
      v_state:=public.nba_gm_dev_action('pick',null,v_player);
      if jsonb_array_length(v_state->'picks')<>v_round then
        raise exception 'V13 draft % incomplete in round %',v_idx,v_round;end if;
    end loop;
    if v_state->>'phase'<>'year1'
      or jsonb_array_length(v_state->'results')<>1
      then raise exception 'V13 Year 1 never settled';end if;
    v_original:=v_state->'yearOnePicks';
    v_season_one:=v_state->'results'->0;
    if (v_season_one->>'wins')::integer+(v_season_one->>'losses')::integer<>82
      then raise exception 'V13 invalid Year 1 result';end if;
    v_v11_state:=jsonb_set(jsonb_set(v_state,
      '{simulationModelVersion}','11'::jsonb),
      '{lineupModelVersion}','1'::jsonb);
    if private.nba_gm_v2_season(v_v11_state,1) is distinct from
       private.nba_gm_v11_season(v_v11_state,1) then
       raise exception 'Existing V11 saved-run router regressed';end if;

    v_state:=public.nba_gm_dev_action('offseason');
    if v_state->>'phase'<>'offseason'
      or v_state->'picks' is distinct from
          (case when v_state->>'rosterQualityVersion'='1'
             then private.nba_gm_v14_season_lineup(v_state,2)
             else private.nba_gm_v12_season_lineup(v_state,3) end)
      or (select count(*) from jsonb_object_keys(
          coalesce(v_state->'development','{}'::jsonb)))<>7
      then raise exception 'V13 offseason developed lineup mismatch';end if;

    -- Exercise the real trade wheel and cancel path; don't artificially force
    -- a better player or change which trades the member would be offered.
    v_old:=v_state->'picks'->0->>'playerId';
    v_state:=public.nba_gm_dev_action('shop',null,v_old);
    v_state:=public.nba_gm_dev_action('trade-spin');
    if v_state->>'tradeTeam' is null then
      raise exception 'V13 trade-wheel routing missing';end if;
    v_state:=public.nba_gm_dev_action('cancel-trade');
    if v_state->>'tradeTeam' is not null
       or v_state->>'shopPlayerId' is not null then
      raise exception 'V13 trade-wheel cancellation did not recover';end if;

    -- The second run covers free-agent replacement through the public RPC,
    -- rather than only fabricating a seven-man postseason state.
    if v_idx=2 then
      v_released:=false;
      for v_old in select e.value->>'playerId'
        from jsonb_array_elements(v_state->'picks') e(value)
        order by private.nba_gm_v3_salary(v_state,e.value->>'playerId',3) desc
      loop
        begin
          v_state:=public.nba_gm_dev_action('release',null,v_old);
          v_released:=true;exit;
        exception when others then
          -- The action itself refuses releases with no affordable legal signing.
          null;
        end;
      end loop;
      if not v_released then
        raise exception 'V13 second franchise could not exercise any legal release';end if;
      v_state:=public.nba_gm_dev_action('fa-spin');
      if v_state->>'freeAgencyTeam' is null then
        raise exception 'V13 free-agent wheel missing';end if;
      select p.id into v_new from private.nba_gm_dev_players p
        where p.team_code=v_state->>'freeAgencyTeam'
          and private.nba_gm_v3_contract_for_state(v_state,p.id)='1YR'
          and p.id not in
            (select x.id from jsonb_array_elements_text(v_state->'releasedIds') x(id))
          and private.nba_gm_v2_can_add(v_state,p.id)
        order by private.nba_gm_v3_salary(v_state,p.id,3),p.id limit 1;
      if v_new is null then raise exception 'V13 free agent is inaccessible';end if;
      v_state:=public.nba_gm_dev_action('sign',null,v_new);
      if jsonb_array_length(v_state->'picks')<>7 then
        raise exception 'V13 free agent did not restore seven positions';end if;
       if v_state->'picks' is distinct from private.nba_gm_v14_season_lineup(v_state,2)
         then raise exception 'NBA offseason signing did not show Year 2 positions';end if;
    end if;
    for v_yr in 2..3 loop
      select coalesce(sum(private.nba_gm_v3_salary(v_state,e.value->>'playerId',v_yr)),0)
        into v_spend from jsonb_array_elements(v_state->'picks') e(value);
      if v_spend>175000000 then
        raise exception 'V13 wheel strategy % repriced over % cap by Year %',
          v_idx,v_spend,v_yr;end if;
    end loop;

    v_result2:=private.nba_gm_v2_season(v_state,2);
    v_result3:=private.nba_gm_v2_season(v_state,3);
    v_state:=public.nba_gm_dev_action('advance');
    if v_state->>'phase'<>'final' or
      v_state->>'simulationModelVersion'<>'13'
      or jsonb_array_length(v_state->'results')<>3
      or v_state->'yearOnePicks' is distinct from v_original
      or v_state->'results'->0 is distinct from v_season_one
      or v_state->'results'->1 is distinct from v_result2
      or v_state->'results'->2 is distinct from v_result3
      or v_state->'picks' is distinct from
          (case when v_state->>'rosterQualityVersion'='1'
             then private.nba_gm_v14_season_lineup(v_state,3)
             else private.nba_gm_v12_season_lineup(v_state,3) end)
      then raise exception 'V13 three-season action/lineup inconsistency';end if;
    if exists(select 1 from jsonb_array_elements(v_state->'results') e(value)
      where (e.value->>'wins')::integer+(e.value->>'losses')::integer<>82
      or (e.value->>'teamOverall')::integer not between 60 and 99
      or (e.value->>'titleOdds')::numeric not between 0 and 49.6)
      then raise exception 'V13 one of three seasons has invalid results';end if;
    v_score:=private.nba_gm_v13_final_score(v_state);
    if v_state->'scoreBreakdown' is distinct from v_score
      or v_score->'weights' is distinct from '[0.9,0.03,0.07]'::jsonb
      or (v_score->>'score')::numeric not between 0 and 100 then
      raise exception 'V13 final GM score/regression mismatch';end if;
    select r.state into v_saved from private.football_gm_runs r
      where r.seed=v_run_seed and r.profile_id=v_owner
        and r.game_version='nba-gm-dev-v2' limit 1;
    if v_saved is distinct from v_state then
      raise exception 'V13 completed franchise was not saved';end if;
    raise notice 'V13 FULL ACTION approach %: Y1 % / Y2 % / Y3 % wins, score %, roster %',
      v_idx,v_state->'results'->0->>'wins',v_state->'results'->1->>'wins',
      v_state->'results'->2->>'wins',v_score->>'score',v_state->'picks';
  end loop;
end;
$v13_full_action$;
rollback;
