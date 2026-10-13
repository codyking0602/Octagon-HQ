-- Phase 4 regression: exact Central-midnight gating, DST, per-sport fallback,
-- owner-only arming and immutable armed editorial. Runs against current full migrations.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $proof$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_guest uuid := extensions.gen_random_uuid();
  v_spotlight jsonb;
  v_game jsonb;
  v_receipt jsonb;
  v_editorial jsonb;
  v_verified jsonb;
  v_projection jsonb;
  v_result jsonb;
  v_failed boolean;
  v_sha text := repeat('a',40);
  v_oct date := date '2034-10-10';
  v_nov date := date '2034-11-07';
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
  (v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'football-phase4-owner@login.octagon-hq.app','',now(),now(),now(),'{}'::jsonb),
  (v_guest,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'football-phase4-guest@login.octagon-hq.app','',now(),now(),now(),'{}'::jsonb);
  perform public.register_unclaimed_pin_profile(v_owner,'Release Owner','RO');
  perform public.register_unclaimed_pin_profile(v_guest,'Release Guest','RG');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  v_spotlight := jsonb_build_object(
    'name','Selected Quarterback','team','Test Team','position','QB',
    'stats',jsonb_build_array(
      jsonb_build_object('label','PASS YDS','value','301'),
      jsonb_build_object('label','PASS TD','value','3'),
      jsonb_build_object('label','RUSH YDS','value','45'),
      jsonb_build_object('label','RUSH TD','value','1')),
    'result','W 42-17','measurements','6ft 2in',
    'team_color','#123456','highlight_url','https://youtu.be/verified',
    'photo_source','https://a.espncdn.com/player.webp','photo_kind','action',
    'photo_asset_path','/assets/football/weekly/2034-11-07/cfb/spotlight.webp');
  v_game := jsonb_build_object(
    'home_team','Home School','away_team','Away School',
    'kickoff_at','2034-11-11T21:00:00Z',
    'header_asset_path','/assets/football/weekly/2034-11-07/cfb/game-header.webp',
    'header_photo_sources',jsonb_build_array(
      'https://seatgeekimages.com/matchup/verified/600x450.jpg'));
  v_receipt := jsonb_build_object(
    'player',jsonb_build_object('id','picked-qb','name','Selected Quarterback',
      'team','Test Team','position','QB','summary','Verified selection'),
    'game',jsonb_build_object('id','picked-game','home_team','Home School',
      'away_team','Away School','kickoff_at','2034-11-11T21:00:00Z','summary','Verified game'),
    'selected_at',now(),'selected_by',v_owner);
  v_editorial := jsonb_build_object(
    'player_id','picked-qb','game_id','picked-game','prepared_at',now(),
    'source_urls',jsonb_build_array('https://www.espn.com/a','https://www.espn.com/b'),
    'breakdown',jsonb_build_object('setup',jsonb_build_array(
      'A verified game featuring a legitimate test offense and defense with postseason stakes.',
      'The game turns on pressure, turnovers, timing and execution rather than prediction.')));
  v_verified := jsonb_build_object(
    'spotlight_url','https://octagon.hq-app.workers.dev/assets/football/weekly/2034-11-07/cfb/spotlight.webp',
    'header_url','https://octagon.hq-app.workers.dev/assets/football/weekly/2034-11-07/cfb/game-header.webp',
    'deployed_sha',v_sha);

  -- Prior CFB publication stays live if the next CFB update is missing.
  insert into public.football_weekly_content_packages
    (week_of,cfb_spotlight,cfb_game_of_week,production,choices)
  values (v_oct,
    v_spotlight||'{"name":"Last week CFB"}'::jsonb,
    v_game,
    jsonb_build_object('cfb',v_editorial||jsonb_build_object('ready_at','2034-10-09T04:00:00Z')),
    jsonb_build_object('cfb',v_receipt));

  insert into public.football_weekly_content_packages
    (week_of,cfb_spotlight,cfb_game_of_week,production,choices)
  values(v_nov,v_spotlight,v_game,jsonb_build_object('cfb',v_editorial),
    jsonb_build_object('cfb',v_receipt));

  if has_function_privilege('anon','public.arm_football_weekly_editorial(date,text,jsonb)','EXECUTE')
    or has_function_privilege('anon','public.live_football_weekly_editorial_at(timestamptz)','EXECUTE')
    or has_function_privilege('authenticated','public.finalize_football_weekly_publication()','EXECUTE')
    or not has_function_privilege('anon','public.get_live_football_weekly_editorial()','EXECUTE') then
    raise exception 'Phase 4 browser grants are unsafe'; end if;
  if not exists(select 1 from cron.job where jobname='octagon-hq-football-editorial-publish' and active) then
    raise exception 'Missing active publication audit scheduler'; end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_guest::text,true);
  v_failed := false;
  begin
    perform public.arm_football_weekly_editorial(v_nov,'cfb',v_verified);
  exception when others then v_failed := true; end;
  if not v_failed then raise exception 'Non-owner armed release'; end if;

  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_failed := false;
  begin
    perform public.arm_football_weekly_editorial(v_nov,'cfb',
      v_verified||'{"deployed_sha":"wrong"}'::jsonb);
  exception when others then v_failed := true; end;
  if not v_failed then raise exception 'Unverified deployment SHA armed release'; end if;

  v_result := public.arm_football_weekly_editorial(v_nov,'cfb',v_verified);
  if v_result->>'status' <> 'draft'
     or v_result->'production'->'cfb'->>'ready_at' is null
     or v_result->>'published_at' is not null then
    raise exception 'Arm unexpectedly published or blocked independent CFB preparation'; end if;

  v_failed := false;
  begin
    perform public.save_football_weekly_content_draft(v_nov,
      '{"cfb_spotlight":{"name":"Tamper"}}'::jsonb);
  exception when others then v_failed := true; end;
  if not v_failed then raise exception 'Armed CFB content was mutable'; end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform set_config('request.jwt.claim.sub','',true);
  v_projection := public.live_football_weekly_editorial_at('2034-11-07T05:59:59Z'::timestamptz);
  if v_projection->'cfb'->'spotlight'->>'name' <> 'Last week CFB'
    or v_projection->'nfl' is distinct from 'null'::jsonb then
    raise exception 'Content was exposed early or failed fallback: %',v_projection; end if;
  v_projection := public.live_football_weekly_editorial_at('2034-11-07T06:00:00Z'::timestamptz);
  if v_projection->'cfb'->'spotlight'->>'name' <> 'Selected Quarterback'
    or v_projection->'nfl' is distinct from 'null'::jsonb
    or v_projection::text like '%selected_by%'
    or v_projection::text like '%media_verification%' then
    raise exception 'Incorrect Central-midnight cutover or leaked private editor data: %',v_projection; end if;

  -- A prepared package absent any arming stays unexposed, even after its release date.
  insert into public.football_weekly_content_packages(week_of,cfb_spotlight,cfb_game_of_week,production)
    values(date '2034-11-14',v_spotlight,v_game,jsonb_build_object('cfb',v_editorial));
  v_projection := public.live_football_weekly_editorial_at('2034-11-14T06:00:00Z'::timestamptz);
  if v_projection->'cfb'->>'week_of' <> v_nov::text then
    raise exception 'Unarmed future content was published'; end if;

  -- Fall-back is independent by sport and only ever returns a completed receipt.
  update public.football_weekly_content_packages p set
    nfl_spotlight=v_spotlight||'{"name":"Previously NFL"}'::jsonb,
    nfl_game_of_week=v_game,
    production=p.production||jsonb_build_object('nfl',v_editorial||
      jsonb_build_object('ready_at','2034-10-09T04:00:00Z'))
  where p.week_of=v_oct;
  v_projection := public.live_football_weekly_editorial_at('2034-11-07T06:00:00Z'::timestamptz);
  if v_projection->'cfb'->>'week_of' <> v_nov::text
    or v_projection->'nfl'->>'week_of' <> v_oct::text then
    raise exception 'Independent CFB/NFL fallback failed'; end if;
end
$proof$;
rollback;
\echo 'Football Phase 4 Central midnight publisher proof passed.'
