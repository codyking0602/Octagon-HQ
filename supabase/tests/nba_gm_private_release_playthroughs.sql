-- Private NBA GM owner release validation, on a disposable migrated database.
-- Six complete server-action franchises: wheel -> seven picks -> 82-game Year 1
-- -> offseason -> cap recovery if necessary -> Years 2/3 -> saved final score.
-- Random wheel-generated rosters are *not* the deterministic five-roster
-- calibration cohort in nba_gm_three_season_balance.sql. Log their actual
-- records and seeds; do not invent win thresholds or rewrite the 90/3/7 score.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $nba_release$
declare
  v_owner uuid:=extensions.gen_random_uuid();
  v_strategy integer;v_round integer;v_attempt integer;v_market integer;
  v_state jsonb;v_player text;v_team text;v_old text;
  v_picks jsonb;v_year_one jsonb;v_original_year_one jsonb;
  v_year2 bigint;v_year3 bigint;v_count integer;v_score numeric;
  v_found boolean;v_seed text;
  v_name text;
  v_roster_summary text;
  v_contender_picks jsonb;v_contender_state jsonb;v_contender_result jsonb;
  v_contender_wins integer:=0;v_seed_index integer;v_contender_cap bigint;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values(v_owner,'00000000-0000-0000-0000-000000000000','authenticated',
    'authenticated','nba-gm-private-release@login.octagon-hq.app','',now(),
    now(),now(),jsonb_build_object('display_name','CODY','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_owner,'CODY','CG');
  insert into public.pick_control_owners(profile_id) values(v_owner);
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);

  -- Independent, deliberately complementary *legal* $155M rotation.
  -- A credible contender must actually be possible under P3 without adding
  -- artificial wins to the six genuine random-wheel drafts below.
  v_contender_picks:=jsonb_build_array(
    jsonb_build_object('slot','PG','playerId','nba-gm-draft-shaigilgeousalexander'),
    jsonb_build_object('slot','SG','playerId','nba-gm-draft-ausarthompson'),
    jsonb_build_object('slot','SF','playerId','nba-gm-draft-cooperflagg'),
    jsonb_build_object('slot','PF','playerId','nba-gm-draft-isaiahstewart'),
    jsonb_build_object('slot','C','playerId','nba-gm-draft-joelembiid'),
    jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-jrueholiday'),
    jsonb_build_object('slot','BIG','playerId','nba-gm-draft-kristapsporzingis')
  );
  if private.nba_gm_v2_assign(v_contender_picks) is null then
    raise exception 'The reference contender is not a legal seven-position roster';end if;
  v_contender_state:=jsonb_build_object('economyVersion',3,
    'developmentModelVersion',2,'phase','draft',
    'seed','nba-gm-release-contender','picks',v_contender_picks,
    'yearOnePicks',v_contender_picks,'releasedIds','[]'::jsonb,'tradesUsed',0,
    'caps','[155000000,155000000,155000000]'::jsonb);
  select coalesce(sum(private.nba_gm_v3_salary(v_contender_state,pick->>'playerId',3)),0)
    into v_contender_cap from jsonb_array_elements(v_contender_picks) pick;
  if v_contender_cap>155000000 then
    raise exception 'Reference contender is not within Year 3 draft cap: %',v_contender_cap;end if;
  for v_seed_index in 1..30 loop
    v_contender_state:=jsonb_set(v_contender_state,'{seed}',
      to_jsonb('nba-gm-release-contender-'||v_seed_index));
    v_contender_result:=private.nba_gm_v2_season(v_contender_state,1);
    v_contender_wins:=v_contender_wins+(v_contender_result->>'wins')::integer;
  end loop;
  if v_contender_wins<30*50 then
    raise exception 'Legal complementarity contender cannot average 50 wins: %',
      v_contender_wins/30.0;end if;
  raise notice 'NBA GM MODEL CEILING: legal seven-player contender across 30 fixed seeds = avg % wins, Year 3 baseline commitment %',
    round(v_contender_wins/30.0,1),v_contender_cap;

  for v_strategy in 1..6 loop
    v_name:=case v_strategy when 1 then 'star-heavy'
      when 2 then 'balanced' when 3 then 'defense-first'
      when 4 then 'complementary' when 5 then 'depth-focused'
      else 'bargain-heavy' end;
    v_state:=public.nba_gm_dev_action('start');
    v_seed:=v_state->>'seed';
    if v_state->>'economyVersion'<>'4' or
       v_state->>'developmentModelVersion'<>'2' then
      raise exception 'Release playthrough did not use opt-in V4 model';end if;
    for v_round in 1..7 loop
      v_state:=public.nba_gm_dev_action('spin');
      v_team:=v_state->>'pendingTeam';
      select p.id into v_player from private.nba_gm_dev_players p
      where p.team_code=v_team and private.nba_gm_v2_can_add(v_state,p.id)
      order by
        case v_strategy
          when 1 then p.overall*1.5
          when 2 then p.overall-.5*(p.salaries[3]::numeric/1000000)
          when 3 then (p.skills->>'perimeterDefense')::numeric*.7+
              (p.skills->>'interiorDefense')::numeric*.65+
              (p.skills->>'rebounding')::numeric*.25
          when 4 then (p.skills->>'scoring')::numeric*.35+
              (p.skills->>'shooting')::numeric*.4+
              (p.skills->>'playmaking')::numeric*.35+
              (p.skills->>'perimeterDefense')::numeric*.4+
              (p.skills->>'interiorDefense')::numeric*.3
          when 5 then p.overall*.55-(p.salaries[3]::numeric/1000000)*.85
          else p.overall*.2-(p.salaries[3]::numeric/1000000)*1.5 end desc,
        p.overall desc,p.id limit 1;
      if v_player is null then raise exception 'Dead-end wheel % round % team %',
        v_name,v_round,v_team; end if;
      v_state:=public.nba_gm_dev_action('pick',null,v_player);
      if jsonb_array_length(v_state->'picks')<>v_round then
        raise exception 'Incomplete draft % round %',v_name,v_round;end if;
    end loop;
    if v_state->>'phase'<>'year1' or jsonb_array_length(v_state->'results')<>1 then
      raise exception 'Year 1 not simulated for %',v_name;end if;
    v_original_year_one:=v_state->'yearOnePicks';
    v_state:=public.nba_gm_dev_action('offseason');
    if v_state->>'phase'<>'offseason' or
      (select count(*) from jsonb_object_keys(coalesce(v_state->'development','{}'::jsonb)))<>7
      then raise exception 'Development not resolved for %',v_name;end if;

    -- A cap crisis must be recoverable, not trap a real player in offseason.
    for v_attempt in 1..5 loop
      select coalesce(sum(private.nba_gm_v3_salary(v_state,pick->>'playerId',2)),0),
             coalesce(sum(private.nba_gm_v3_salary(v_state,pick->>'playerId',3)),0)
        into v_year2,v_year3 from jsonb_array_elements(v_state->'picks') pick;
      exit when v_year2<=155000000 and v_year3<=155000000 and
        jsonb_array_length(v_state->'picks')=7;
      if jsonb_array_length(v_state->'picks')=7 then
        v_found:=false;
        for v_old in select pick->>'playerId' from jsonb_array_elements(v_state->'picks') pick
          order by greatest(private.nba_gm_v3_salary(v_state,pick->>'playerId',2),
            private.nba_gm_v3_salary(v_state,pick->>'playerId',3)) desc loop
          begin
            v_state:=public.nba_gm_dev_action('release',null,v_old);
            v_found:=true;
            exit;
          exception when others then
            -- Try another player if this cut has no legal cheap replacement.
            null;
          end;
        end loop;
        if not v_found then raise exception 'Unrecoverable cap crisis for %',v_name;end if;
      end if;
      if (v_state->>'freeAgencyVisits')::integer<3 then
        for v_market in ((v_state->>'freeAgencyVisits')::integer+1)..3 loop
          v_state:=public.nba_gm_dev_action('fa-spin');
          v_state:=public.nba_gm_dev_action('pass-fa');
        end loop;
      end if;
      select p.id into v_player from private.nba_gm_dev_players p
       where p.overall<=78 and private.nba_gm_v3_contract_for_state(v_state,p.id)='1YR'
         and p.id not in(select x.id from jsonb_array_elements_text(v_state->'releasedIds') x(id))
         and private.nba_gm_v2_can_add(v_state,p.id)
       order by greatest(private.nba_gm_v3_salary(v_state,p.id,2),
         private.nba_gm_v3_salary(v_state,p.id,3)),p.id limit 1;
      if v_player is null then raise exception 'No affordable emergency signing for %',v_name;end if;
      v_state:=public.nba_gm_dev_action('emergency-sign',null,v_player);
    end loop;
    v_picks:=v_state->'picks';
    if jsonb_array_length(v_picks)<>7 then raise exception 'Unfilled roster %',v_name;end if;
    select coalesce(sum(private.nba_gm_v3_salary(v_state,pick->>'playerId',2)),0),
           coalesce(sum(private.nba_gm_v3_salary(v_state,pick->>'playerId',3)),0)
      into v_year2,v_year3 from jsonb_array_elements(v_picks) pick;
    if v_year2>155000000 or v_year3>155000000 then
      raise exception 'Unresolved cap % Yr2 % Yr3 %',v_name,v_year2,v_year3; end if;
    v_state:=public.nba_gm_dev_action('advance');
    if v_state->>'phase'<>'final' or
       jsonb_array_length(v_state->'results')<>3 or
       v_state->'yearOnePicks' is distinct from v_original_year_one then
       raise exception 'Final franchise inconsistent %',v_name;end if;
    if exists (select 1 from jsonb_array_elements(v_state->'results') s
      where (s->>'wins')::int+(s->>'losses')::int<>82 or
        s->>'finish' not in ('Missed Playoffs','First Round',
          'Conference Semifinals','Conference Finals','Finals','Champion')) then
       raise exception 'Invalid season/playoff result %',v_name;end if;
    v_score:=(v_state->'scoreBreakdown'->>'score')::numeric;
    if v_score not between 0 and 100 or
      v_state->'scoreBreakdown'->'weights' is distinct from '[0.9,0.03,0.07]'::jsonb
      then raise exception 'Invalid 90/3/7 score %',v_name;end if;
    -- All six synthetic RPC calls run inside ONE rollback transaction, so
    -- now() is identical across completed run rows. The normal 'load' latest
    -- timestamp sort has an artificial tie here that does not occur when real
    -- browser RPCs run in separate transactions. Verify the exact seed row.
    if (select r.state from private.football_gm_runs r
        where r.profile_id=v_owner and r.game_version='nba-gm-dev-v2'
          and r.seed=v_seed limit 1) is distinct from v_state then
      raise exception 'Final seed-specific franchise did not persist %',v_name;end if;
    -- Every successful owner action must have one named, private audit event
    -- alongside its canonical snapshot. Include start and final advance.
    if (select count(*) from private.nba_gm_dev_action_events e
          join private.football_gm_runs r on r.id=e.run_id where r.seed=v_seed)
        <> (select count(*) from private.football_gm_run_snapshots snap
          join private.football_gm_runs r on r.id=snap.run_id where r.seed=v_seed)
       or not exists(select 1 from private.nba_gm_dev_action_events e
          join private.football_gm_runs r on r.id=e.run_id
          where r.seed=v_seed and e.action='start' and e.revision=1)
       or not exists(select 1 from private.nba_gm_dev_action_events e
          join private.football_gm_runs r on r.id=e.run_id
          where r.seed=v_seed and e.action='advance')
    then raise exception 'Private action history is incomplete for %',v_name;end if;
    select string_agg(pick->>'slot'||':'||p.name||' ('||p.overall||')',', '
      order by array_position(array['PG','SG','SF','PF','C','GUARD','BIG'],pick->>'slot'))
      into v_roster_summary from jsonb_array_elements(v_picks) pick
      join private.nba_gm_dev_players p on p.id=pick->>'playerId';
    raise notice 'NBA GM ACTUAL DRAFT % | %',v_name,v_roster_summary;
    raise notice 'NBA GM FULL RPC % seed % | Y1 %-% % | Y2 %-% % | Y3 %-% % | score % | cap Y2 %, Y3 %',
       v_name,v_seed,
       v_state->'results'->0->>'wins',v_state->'results'->0->>'losses',
       v_state->'results'->0->>'finish',
       v_state->'results'->1->>'wins',v_state->'results'->1->>'losses',
       v_state->'results'->1->>'finish',
       v_state->'results'->2->>'wins',v_state->'results'->2->>'losses',
       v_state->'results'->2->>'finish',
       v_score,v_year2,v_year3;
  end loop;
end;
$nba_release$;
rollback;
