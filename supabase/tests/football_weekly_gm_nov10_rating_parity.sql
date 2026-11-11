-- Nov 10+ Football Weekly GM must save the same NBA-parity score the UI reveals.
-- Historical GM event scoring and every existing completed attempt remain unchanged.
begin;
select set_config('request.jwt.claim.role','service_role',true);

do $weekly_gm_rating_parity$
declare
  v_state jsonb;
  v_legacy jsonb;
  v_player uuid := extensions.gen_random_uuid();
  v_start jsonb;
  v_seed text;
  v_roster jsonb := '[
    {"slot":"QB","playerId":"BUF|QB|joshallen","acquired":"draft"},
    {"slot":"RB","playerId":"JAX|RB|bhayshultuten","acquired":"draft"},
    {"slot":"WR","playerId":"MIN|WR|jordanaddison","acquired":"draft"},
    {"slot":"FLEX","playerId":"LV|TE|brockbowers","acquired":"draft"},
    {"slot":"DL","playerId":"CLE|Front Seven|carsonschwesinger","acquired":"draft"},
    {"slot":"LB","playerId":"HOU|Front Seven|daniellehunter","acquired":"draft"},
    {"slot":"DB","playerId":"NE|Secondary|christiangonzalez","acquired":"draft"}
  ]'::jsonb;
  v_score numeric;
  v_rejected boolean := false;
  v_dynasty jsonb;
  v_prior_week jsonb;
begin
  v_state := jsonb_build_object(
    'seed','weekly-gm:2026-11-10:elite:rating-parity-fixture',
    'ratingScaleVersion',2,'playoffScoringVersion',2,
    'resolvedSeasons',jsonb_build_array(
      jsonb_build_object('year',1,'teamGrade',90,'rawTeamGrade',90,'weakLinkPenalty',0,'wins',12,'losses',5,'finish','Divisional'),
      jsonb_build_object('year',2,'teamGrade',90,'rawTeamGrade',90,'weakLinkPenalty',0,'wins',12,'losses',5,'finish','Divisional'),
      jsonb_build_object('year',3,'teamGrade',90,'rawTeamGrade',90,'weakLinkPenalty',0,'wins',12,'losses',5,'finish','Divisional')
    )
  );
  v_score := private.football_weekly_gm_verified_score(v_state);
  if v_score <> 90.6 then
    raise exception 'NBA parity grade 90 must map to 91 OVR and 90.6 GM score, got %', v_score;
  end if;

  -- Exercise fractional OVR breakpoints, matching the front-end JS interpolation.
  v_state := jsonb_set(v_state,'{resolvedSeasons}',jsonb_build_array(
    jsonb_build_object('year',1,'teamGrade',90.6,'rawTeamGrade',90.6,'weakLinkPenalty',0,'wins',12,'losses',5,'finish','Divisional'),
    jsonb_build_object('year',2,'teamGrade',90.6,'rawTeamGrade',90.6,'weakLinkPenalty',0,'wins',12,'losses',5,'finish','Divisional'),
    jsonb_build_object('year',3,'teamGrade',90.6,'rawTeamGrade',90.6,'weakLinkPenalty',0,'wins',12,'losses',5,'finish','Divisional')
  ));
  if private.football_weekly_gm_verified_score(v_state) <> 91.5 then
    raise exception 'NBA parity grade 90.6 must map to 92 OVR and 91.5 GM score';
  end if;

  -- Missing V2 flag retains the originally approved pre-Nov10 rating scale.
  v_legacy := v_state - 'ratingScaleVersion';
  v_legacy := jsonb_set(v_legacy,'{seed}','"weekly-gm:2026-11-03:elite:historical-fixture"'::jsonb);
  if private.football_weekly_gm_verified_score(v_legacy) <> 96.0 then
    raise exception 'Nov 3 historic grade-to-OVR mapping was changed';
  end if;

  -- Screenshot regression: 2 championships plus a Divisional result, with
  -- a 97 OVR franchise and 44 regular-season wins, reveals 97.1 (not 96.8).
  v_dynasty := jsonb_build_object(
    'seed','weekly-gm:2026-11-10:young:dynasty-regression',
    'ratingScaleVersion',2,'playoffScoringVersion',2,
    'resolvedSeasons',jsonb_build_array(
      jsonb_build_object('year',1,'teamGrade',94,'rawTeamGrade',94,'weakLinkPenalty',0,'wins',15,'losses',2,'finish','Champion'),
      jsonb_build_object('year',2,'teamGrade',94,'rawTeamGrade',94,'weakLinkPenalty',0,'wins',15,'losses',2,'finish','Champion'),
      jsonb_build_object('year',3,'teamGrade',94,'rawTeamGrade',94,'weakLinkPenalty',0,'wins',14,'losses',3,'finish','Divisional')
    )
  );
  if private.football_weekly_gm_verified_score(v_dynasty) <> 97.1 then
    raise exception 'Nov 10 dynasty client 97.1 must pass exact server parity';
  end if;
  v_prior_week := jsonb_set(v_dynasty,'{seed}',to_jsonb('weekly-gm:2026-11-03:young:historical'::text));
  if private.football_weekly_gm_verified_score(v_prior_week) <> 96.8 then
    raise exception 'Prior Nov 3 week must keep published pre-dynasty score';
  end if;
  v_prior_week := v_dynasty - 'playoffScoringVersion';
  if private.football_weekly_gm_verified_score(v_prior_week) <> 96.8 then
    raise exception 'Non-V2 scoring must not silently inherit dynasty bonus';
  end if;

  -- Test an authenticated official completion, not only the private calculation.
  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values (
    v_player,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'weekly-gm-rating-parity-'||v_player::text||'@test.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','GM RATING PARITY TEST','historical_unclaimed',true)
  );
  perform public.register_unclaimed_pin_profile(v_player,'GM RATING PARITY TEST','GP');
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_player::text,true);
  v_start := public.start_my_football_weekly_gm('elite');
  v_seed := v_start->>'seed';
  if split_part(v_seed,':',2)::date < date '2026-11-10' then
    raise exception 'Unexpected standard GM competition seed %',v_seed;
  end if;

  perform public.save_my_football_weekly_gm('elite',v_seed,jsonb_build_object(
    'seed',v_seed,'version','football-gm-v11-seeded-development',
    'phase','draft','spinIndex',0,'roster','[]'::jsonb,
    'finalRoster','[]'::jsonb,'resolvedSeasons','[]'::jsonb,
    'ratingScaleVersion',2,'playoffScoringVersion',2
  ),false,null);

  v_state := jsonb_set(v_state,'{seed}',to_jsonb(v_seed));
  v_state := v_state || jsonb_build_object(
    'version','football-gm-v11-seeded-development','phase','final',
    'spinIndex',7,'roster',v_roster,'finalRoster',v_roster
  );
  v_rejected := false;
  begin
    perform public.save_my_football_weekly_gm('elite',v_seed,v_state,true,96.0);
  exception when others then v_rejected := sqlerrm like '%server verification%'; end;
  if not v_rejected then raise exception 'Old-rating forged GM score was accepted'; end if;

  perform public.save_my_football_weekly_gm('elite',v_seed,v_state,true,91.5);
  if not exists (
    select 1 from private.football_weekly_gm_attempts
    where profile_id=v_player and seed=v_seed
      and completed_at is not null and score=91.5
  ) then raise exception 'New-rating official GM completion did not persist'; end if;

  -- Exercise the actual authenticated save RPC on the dynasty-franchise run.
  v_start := public.start_my_football_weekly_gm('young');
  v_seed := v_start->>'seed';
  perform public.save_my_football_weekly_gm('young',v_seed,jsonb_build_object(
    'seed',v_seed,'version','football-gm-v11-seeded-development',
    'phase','draft','spinIndex',0,'roster','[]'::jsonb,
    'finalRoster','[]'::jsonb,'resolvedSeasons','[]'::jsonb,
    'ratingScaleVersion',2,'playoffScoringVersion',2
  ),false,null);
  v_dynasty := jsonb_set(v_dynasty,'{seed}',to_jsonb(v_seed)) || jsonb_build_object(
    'version','football-gm-v11-seeded-development','phase','final',
    'spinIndex',7,'roster',v_roster,'finalRoster',v_roster
  );
  v_rejected := false;
  begin
    perform public.save_my_football_weekly_gm('young',v_seed,v_dynasty,true,96.8);
  exception when others then v_rejected := sqlerrm like '%server verification%'; end;
  if not v_rejected then raise exception 'Missing-dynasty official score was incorrectly accepted'; end if;
  perform public.save_my_football_weekly_gm('young',v_seed,v_dynasty,true,97.1);
  if not exists (
    select 1 from private.football_weekly_gm_attempts
    where profile_id=v_player and seed=v_seed
      and completed_at is not null and score=97.1
  ) then raise exception '97.1 official dynasty result did not persist'; end if;
end;
$weekly_gm_rating_parity$;

rollback;
\echo 'Weekly GM new-rating score parity, history and final save verified.'
