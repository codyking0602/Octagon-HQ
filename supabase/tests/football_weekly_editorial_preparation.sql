begin;
select set_config('request.jwt.claim.role','service_role',true);

do $proof$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_outsider uuid := extensions.gen_random_uuid();
  v_players jsonb;
  v_games jsonb;
  v_spotlight jsonb;
  v_game jsonb;
  v_editorial jsonb;
  v_result jsonb;
  v_blocked boolean;
  v_long text := 'A specific verified matchup changes the outcome because execution and early-down efficiency matter.';
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'football-editorial-phase3-owner@login.octagon-hq.app','',now(),now(),now(),'{}'::jsonb),
    (v_outsider,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'football-editorial-phase3-guest@login.octagon-hq.app','',now(),now(),now(),'{}'::jsonb);
  perform public.register_unclaimed_pin_profile(v_owner,'Media Owner','MO');
  perform public.register_unclaimed_pin_profile(v_outsider,'Media Guest','MG');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  select jsonb_agg(jsonb_build_object('id','player-'||n,'name','Player '||n,
    'team','Team '||n,'position','QB','summary','Verified meaningful football game') order by n)
    into v_players from generate_series(1,5) n;
  select jsonb_agg(jsonb_build_object('id','game-'||n,'home_team','Home '||n,
    'away_team','Away '||n,'kickoff_at','2026-10-17T19:30:00Z',
    'summary','Verified high stakes game') order by n)
    into v_games from generate_series(1,5) n;
  v_spotlight := jsonb_build_object(
    'name','Player 2','team','Team 2','position','QB',
    'stats',jsonb_build_array(
      jsonb_build_object('value','300','label','PASS YDS'),
      jsonb_build_object('value','3','label','PASS TD'),
      jsonb_build_object('value','50','label','RUSH YDS'),
      jsonb_build_object('value','1','label','RUSH TD')),
    'result','W 35–17','measurements','6ft 2in',
    'team_color','#223366',
    'highlight_url','https://youtu.be/example',
    'photo_source','https://a.espncdn.com/photo.jpg',
    'photo_asset_path','/assets/football/weekly/2026-10-13/cfb/spotlight.webp',
    'photo_kind','action'
  );
  v_game := jsonb_build_object(
    'home_team','Home 3','away_team','Away 3',
    'kickoff_at','2026-10-17T19:30:00Z',
    'header_asset_path','/assets/football/weekly/2026-10-13/cfb/game-header.webp',
    'header_photo_sources',jsonb_build_array(
      'https://a.espncdn.com/away.jpg','https://a.espncdn.com/home.jpg'));
  v_editorial := jsonb_build_object(
    'source_urls',jsonb_build_array('https://www.espn.com/football/game/1',
      'https://www.sports-reference.com/cfb/schools/example/2026.html'),
    'breakdown',jsonb_build_object(
      'setup',jsonb_build_array(v_long,v_long),
      'things',jsonb_build_array(
        jsonb_build_object('title','Protection vs pressure','body',v_long,'edge','Home 3'),
        jsonb_build_object('title','Receiver vs corners','body',v_long,'edge','Away 3'),
        jsonb_build_object('title','Run fits','body',v_long,'edge','Even')),
      'paths_to_win',jsonb_build_array(
        jsonb_build_object('team','Away 3','body',v_long),
        jsonb_build_object('team','Home 3','body',v_long)),
      'players_to_watch',jsonb_build_array(
        jsonb_build_object('team','Away 3','players',jsonb_build_array(
          jsonb_build_object('name','A QB','position','QB','body',v_long),
          jsonb_build_object('name','A WR','position','WR','body',v_long),
          jsonb_build_object('name','A DL','position','DL','body',v_long))),
        jsonb_build_object('team','Home 3','players',jsonb_build_array(
          jsonb_build_object('name','H QB','position','QB','body',v_long),
          jsonb_build_object('name','H WR','position','WR','body',v_long),
          jsonb_build_object('name','H DL','position','DL','body',v_long)))),
      'unit_edges',jsonb_build_array(
        jsonb_build_object('title','Away offense vs home defense','body',v_long,'edge','Away 3'),
        jsonb_build_object('title','Home offense vs away defense','body',v_long,'edge','Home 3'))
    )
  );

  if has_function_privilege('anon','public.prepare_football_weekly_editorial(date,text,jsonb,jsonb,jsonb)','EXECUTE')
    or has_table_privilege('authenticated','public.football_weekly_content_packages','UPDATE')
  then raise exception 'Phase 3 exposed unapproved production write access'; end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_outsider::text,true);
  v_blocked := false;
  begin
    perform public.prepare_football_weekly_editorial(date '2026-10-13','cfb',
      v_spotlight,v_game,v_editorial);
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Non-owner prepared editorial'; end if;

  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  perform public.stage_football_weekly_editorial_candidates(
    date '2026-10-13','cfb',jsonb_build_object('players',v_players,'games',v_games));

  v_blocked := false;
  begin
    perform public.prepare_football_weekly_editorial(date '2026-10-13','cfb',
      v_spotlight,v_game,v_editorial);
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Prepared before owner approval'; end if;

  perform public.select_football_weekly_editorial_choices(
    date '2026-10-13','cfb','player-2','game-3');
  v_blocked := false;
  begin
    perform public.prepare_football_weekly_editorial(date '2026-10-13','cfb',
      v_spotlight||'{"name":"Wrong Player"}'::jsonb,v_game,v_editorial);
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Prepared the wrong selected player'; end if;

  v_blocked := false;
  begin
    perform public.prepare_football_weekly_editorial(date '2026-10-13','cfb',
      v_spotlight,v_game||'{"home_team":"Wrong Opponent"}'::jsonb,v_editorial);
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Prepared the wrong matchup'; end if;

  v_blocked := false;
  begin
    perform public.prepare_football_weekly_editorial(date '2026-10-13','cfb',
      v_spotlight||jsonb_build_object('stats',(v_spotlight->'stats') - 3),v_game,v_editorial);
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Accepted incomplete spotlight stats'; end if;

  v_result := public.prepare_football_weekly_editorial(date '2026-10-13','cfb',
    v_spotlight,v_game,v_editorial);
  if v_result->>'status' <> 'draft'
    or v_result->>'published_at' is not null
    or v_result->'production'->'cfb'->>'player_id' <> 'player-2'
    or v_result->'production'->'cfb'->>'game_id' <> 'game-3'
    or v_result->'cfb_spotlight'->>'name' <> 'Player 2'
    or v_result->'cfb_game_of_week'->>'header_asset_path'
      <> '/assets/football/weekly/2026-10-13/cfb/game-header.webp'
    or v_result->'nfl_spotlight' is distinct from 'null'::jsonb then
    raise exception 'Editorial preparation affected publication or other sport: %',v_result;
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform set_config('request.jwt.claim.sub','',true);
  update public.football_weekly_content_packages
    set status='approved' where week_of=date '2026-10-13';
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_blocked := false;
  begin
    perform public.prepare_football_weekly_editorial(date '2026-10-13','cfb',
      v_spotlight,v_game,v_editorial);
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Prepared after package lock'; end if;
end
$proof$;
rollback;
\echo 'Football Phase 3 owner production and quality gate SQL proof passed.'
