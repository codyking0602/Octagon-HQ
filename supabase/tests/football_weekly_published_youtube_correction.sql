-- A real published weekly Spotlight may change only its direct YouTube link
-- through the verified GitHub owner OIDC handoff; no replay of draft production.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $proof$
declare
  v_week date := date '2034-12-05';
  v_sha text := repeat('a',40);
  v_candidates jsonb;
  v_choice jsonb;
  v_spotlight jsonb;
  v_game jsonb;
  v_editorial jsonb;
  v_production jsonb;
  v_reply jsonb;
  v_bad boolean;
  v_new_url text := 'https://youtu.be/8YZfJ2YbOj4?is=jJPg92oyqhH7iEKH';
begin
  v_candidates := jsonb_build_object(
    'players',(select jsonb_agg(jsonb_build_object('id','p'||n,'name','Player '||n,
      'team','Test Team','position','QB','summary','Verified result')) from generate_series(1,5) n),
    'games',(select jsonb_agg(jsonb_build_object('id','g'||n,'home_team','Home '||n,
      'away_team','Away '||n,'kickoff_at','2034-12-09T18:00:00-06:00',
      'summary','Verified kickoff')) from generate_series(1,5) n));
  v_choice := jsonb_build_object(
    'player',v_candidates->'players'->0,
    'game',v_candidates->'games'->0,
    'selected_by_github_id','284170760',
    'selected_via','github-oidc-owner',
    'source_sha',v_sha,'selected_at',now());
  v_spotlight := jsonb_build_object(
    'name','Player 1','team','Test Team','position','QB',
    'stats',jsonb_build_array(jsonb_build_object('label','PASS YDS','value','305')),
    'result','W 31-23','measurements','6ft 2in','team_color','#123456',
    'photo_source','https://a.espncdn.com/verified.png',
    'photo_kind','portrait','photo_asset_path',
    '/assets/football/weekly/2034-12-05/cfb/spotlight.webp',
    'highlight_url','https://www.youtube.com/watch?v=oldVerified');
  v_game := jsonb_build_object(
    'home_team','Home 1','away_team','Away 1',
    'kickoff_at','2034-12-09T18:00:00-06:00',
    'header_asset_path','/assets/football/weekly/2034-12-05/cfb/game-header.webp',
    'header_photo_sources',jsonb_build_array(
      'https://seatgeekimages.com/matchup/old/1/2/600x600.jpg'));
  v_editorial := jsonb_build_object(
    'source_urls',jsonb_build_array('https://www.espn.com/1','https://www.espn.com/2'),
    'breakdown',jsonb_build_object('setup',jsonb_build_array('Verified A','Verified B')));
  v_production := v_editorial || jsonb_build_object(
    'player_id','p1','game_id','g1','prepared_at','2034-12-05T14:00:00Z',
    'ready_at','2034-12-05T14:01:00Z',
    'published_at','2034-12-05T14:02:00Z',
    'media_verification',jsonb_build_object('deployed_sha',v_sha),
    'armed_by',null);

  insert into public.football_weekly_content_packages(
    week_of,status,cfb_spotlight,cfb_game_of_week,proposals,choices,production)
  values (v_week,'published',v_spotlight,v_game,
    jsonb_build_object('cfb',v_candidates),
    jsonb_build_object('cfb',v_choice),
    jsonb_build_object('cfb',v_production));

  v_reply := public.ingest_football_weekly_editorial_handoff(
    v_week,'cfb',v_candidates,'p1','g1','284170760',v_sha);
  if v_reply->>'status' <> 'published' then
    raise exception 'Signed handoff blocked identical published choices'; end if;

  -- A different suggestion or selected identity must never overwrite history.
  v_bad := false;
  begin
    perform public.ingest_football_weekly_editorial_handoff(
      v_week,'cfb',v_candidates,'p2','g1','284170760',v_sha);
  exception when others then v_bad := true; end;
  if not v_bad then raise exception 'Published owner choice was mutable'; end if;

  v_reply := public.ingest_football_weekly_editorial_preparation(
    v_week,'cfb',jsonb_set(v_spotlight,'{highlight_url}',to_jsonb(v_new_url)),
    v_game,v_editorial,'284170760',v_sha);
  if v_reply->'cfb_spotlight'->>'highlight_url' <> v_new_url
    or v_reply->'cfb_game_of_week' is distinct from v_game
    or v_reply->'production'->'cfb' is distinct from v_production
    or v_reply->>'status' <> 'published'
    or v_reply->'cfb_spotlight'->'stats' is distinct from v_spotlight->'stats' then
      raise exception 'Owner video-only correction mutated immutable publication'; end if;

  -- Repeatable signed handoff should be idempotent.
  perform public.ingest_football_weekly_editorial_preparation(
    v_week,'cfb',jsonb_set(v_spotlight,'{highlight_url}',to_jsonb(v_new_url)),
    v_game,v_editorial,'284170760',v_sha);

  v_bad := false;
  begin
    perform public.ingest_football_weekly_editorial_preparation(
      v_week,'cfb',jsonb_set(v_spotlight,'{highlight_url}',to_jsonb(v_new_url))
        || '{"team":"Wrong team"}'::jsonb,
      v_game,v_editorial,'284170760',v_sha);
  exception when others then v_bad := true; end;
  if not v_bad then raise exception 'Published player identity was mutable'; end if;

  v_bad := false;
  begin
    perform public.ingest_football_weekly_editorial_preparation(
      v_week,'cfb',jsonb_set(v_spotlight,'{highlight_url}',to_jsonb(v_new_url)),
      v_game || '{"home_team":"Wrong team"}'::jsonb,
      v_editorial,'284170760',v_sha);
  exception when others then v_bad := true; end;
  if not v_bad then raise exception 'Published matchup was mutable'; end if;

  v_bad := false;
  begin
    perform public.ingest_football_weekly_editorial_preparation(
      v_week,'cfb',jsonb_set(v_spotlight,'{highlight_url}',to_jsonb('https://example.com')),
      v_game,v_editorial,'284170760',v_sha);
  exception when others then v_bad := true; end;
  if not v_bad then raise exception 'Non-YouTube URL was accepted'; end if;

  v_bad := false;
  begin
    perform public.ingest_football_weekly_editorial_preparation(
      v_week,'cfb',jsonb_set(v_spotlight,'{highlight_url}',to_jsonb(v_new_url)),
      v_game,v_editorial,'12345678',v_sha);
  exception when others then v_bad := true; end;
  if not v_bad then raise exception 'Non-owner corrected published Spotlight'; end if;

  if has_function_privilege('anon',
       'public.ingest_football_weekly_editorial_preparation(date,text,jsonb,jsonb,jsonb,text,text)','EXECUTE')
     or has_function_privilege('authenticated',
       'public.ingest_football_weekly_editorial_preparation(date,text,jsonb,jsonb,jsonb,text,text)','EXECUTE') then
    raise exception 'Published correction RPC leaked to browser'; end if;
end
$proof$;
rollback;
\echo 'Published Football Spotlight owner-only YouTube amendment passed.'
