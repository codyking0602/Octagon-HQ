-- Actual public RPC must reject forged submitted GM scores, without committing test data.
begin;
select set_config('request.jwt.claim.role', 'service_role', true);
do $gm_score$
declare
  v_player uuid := extensions.gen_random_uuid();
  v_seed text := 'weekly-gm:2026-10-13:elite:score-verification-test:gmdev1';
  v_roster jsonb := '[
    {"slot":"QB","playerId":"BUF|QB|joshallen","acquired":"draft"},
    {"slot":"RB","playerId":"JAX|RB|bhayshultuten","acquired":"draft"},
    {"slot":"WR","playerId":"MIN|WR|jordanaddison","acquired":"draft"},
    {"slot":"FLEX","playerId":"LV|TE|brockbowers","acquired":"draft"},
    {"slot":"DL","playerId":"CLE|Front Seven|carsonschwesinger","acquired":"draft"},
    {"slot":"LB","playerId":"HOU|Front Seven|daniellehunter","acquired":"draft"},
    {"slot":"DB","playerId":"NE|Secondary|christiangonzalez","acquired":"draft"}
  ]'::jsonb;
  v_initial jsonb;
  v_complete jsonb;
  v_rejected boolean;
  v_actual numeric;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values (v_player,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'weekly-gm-score-test@login.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','GM SCORE TEST','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_player,'GM SCORE TEST','GS');
  update private.football_weekly_gm_events set opens_at=now()-interval '1 day',
    closes_at=now()+interval '1 day' where week_start=date '1980-01-29';
  insert into private.football_weekly_gm_attempts
    (week_start,profile_id,scenario,seed)
  values (date '1980-01-29',v_player,'elite',v_seed);
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_player::text,true);
  v_initial := jsonb_build_object(
    'seed',v_seed,'version','football-gm-v11-seeded-development',
    'phase','draft','spinIndex',1,'roster',jsonb_build_array(v_roster->0),
    'finalRoster','[]'::jsonb,'resolvedSeasons','[]'::jsonb
  );
  perform public.save_my_football_weekly_gm('elite',v_seed,v_initial,false,null);
  v_complete := jsonb_build_object(
    'seed',v_seed,'version','football-gm-v11-seeded-development',
    'phase','final','spinIndex',7,'roster',v_roster,'finalRoster',v_roster,
    'resolvedSeasons',jsonb_build_array(
      jsonb_build_object('year',1,'teamGrade',93.6,'rawTeamGrade',93.6,
        'weakLinkPenalty',0,'wins',15,'losses',2,'finish','Champion'),
      jsonb_build_object('year',2,'teamGrade',92.1,'rawTeamGrade',92.1,
        'weakLinkPenalty',0,'wins',15,'losses',2,'finish','Champion'),
      jsonb_build_object('year',3,'teamGrade',92,'rawTeamGrade',92,
        'weakLinkPenalty',0,'wins',15,'losses',2,'finish','Champion')
    )
  );
  if private.football_weekly_gm_verified_score(v_complete) <> 98.5 then
    raise exception 'Original 98.5 GM scoring formula changed';
  end if;
  v_rejected := false;
  begin
    perform public.save_my_football_weekly_gm('elite',v_seed,v_complete,true,100);
  exception when others then
    v_rejected := sqlerrm like '%server verification%';
  end;
  if not v_rejected then raise exception 'Forged 100-point GM score was accepted'; end if;
  v_rejected := false;
  begin
    perform public.save_my_football_weekly_gm('elite',v_seed,
      jsonb_set(v_complete,'{resolvedSeasons,0,wins}','16'),true,98.5);
  exception when others then
    v_rejected := sqlerrm like '%Inconsistent Weekly GM season%';
  end;
  if not v_rejected then raise exception 'Invalid 16-2 season record was accepted'; end if;
  perform public.save_my_football_weekly_gm('elite',v_seed,v_complete,true,98.5);
  select score into v_actual from private.football_weekly_gm_attempts
    where week_start=date '1980-01-29' and profile_id=v_player and scenario='elite';
  if v_actual <> 98.5 then raise exception 'Correct GM score was not persisted'; end if;
  perform public.save_my_football_weekly_gm('elite',v_seed,v_complete,true,99.9);
  select score into v_actual from private.football_weekly_gm_attempts
    where week_start=date '1980-01-29' and profile_id=v_player and scenario='elite';
  if v_actual <> 98.5 then raise exception 'Final GM result was not immutable'; end if;
end;
$gm_score$;
rollback;
\echo 'Weekly GM score verification and immutability passed.'
