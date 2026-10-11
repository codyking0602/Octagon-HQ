-- Current-chain Phase 2: independent shortlists, exact selections, owner auth, no publication.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $proof$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_players jsonb;
  v_games jsonb;
  v_candidates jsonb;
  v_result jsonb;
  v_bad boolean;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'weekly-editorial-phase2-owner@login.octagon-hq.app','',now(),now(),now(),'{}'::jsonb),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'weekly-editorial-phase2-member@login.octagon-hq.app','',now(),now(),now(),'{}'::jsonb);
  perform public.register_unclaimed_pin_profile(v_owner,'Editor Owner','EO');
  perform public.register_unclaimed_pin_profile(v_member,'Editor Member','EM');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  select jsonb_agg(jsonb_build_object(
    'id','player-' || n::text, 'name','Player ' || n::text,
    'team','School ' || n::text,'position','QB','summary','Validated weekly performance'
  ) order by n) into v_players from generate_series(1,5) n;
  select jsonb_agg(jsonb_build_object(
    'id','game-' || n::text, 'home_team','Home ' || n::text,
    'away_team','Away ' || n::text,'kickoff_at','2026-10-17T19:30:00Z',
    'summary','Upcoming featured matchup'
  ) order by n) into v_games from generate_series(1,5) n;
  v_candidates := jsonb_build_object('players',v_players,'games',v_games);

  if has_table_privilege('authenticated','public.football_weekly_content_packages','SELECT')
    or has_function_privilege('anon','public.stage_football_weekly_editorial_candidates(date,text,jsonb)','EXECUTE')
    or has_function_privilege('anon','public.select_football_weekly_editorial_choices(date,text,text,text)','EXECUTE')
  then raise exception 'Phase 2 exposed candidates or selections'; end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  v_bad := false;
  begin
    perform public.stage_football_weekly_editorial_candidates(date '2026-10-13','cfb',v_candidates);
  exception when others then v_bad := true; end;
  if not v_bad then raise exception 'Member staged candidates'; end if;
  v_bad := false;
  begin
    perform public.select_football_weekly_editorial_choices(date '2026-10-13','cfb','player-1','game-1');
  exception when others then v_bad := true; end;
  if not v_bad then raise exception 'Member approved choices'; end if;

  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_bad := false;
  begin
    perform public.stage_football_weekly_editorial_candidates(date '2026-10-13','cfb',
      jsonb_build_object('players',v_players->0,'games',v_games));
  exception when others then v_bad := true; end;
  if not v_bad then raise exception 'Malformed shortlist accepted'; end if;

  v_result := public.stage_football_weekly_editorial_candidates(date '2026-10-13','cfb',v_candidates);
  if jsonb_array_length(v_result->'proposals'->'cfb'->'players') <> 5
    or v_result->>'status' <> 'draft'
    or (v_result->>'release_at')::timestamptz <> timestamptz '2026-10-13 00:00:00 America/Chicago'
  then raise exception 'CFB staging failed: %',v_result; end if;

  v_bad := false;
  begin
    perform public.select_football_weekly_editorial_choices(date '2026-10-13','cfb','player-99','game-1');
  exception when others then v_bad := true; end;
  if not v_bad then raise exception 'Out-of-shortlist player approved'; end if;

  v_result := public.select_football_weekly_editorial_choices(date '2026-10-13','cfb','player-2','game-3');
  if v_result->'choices'->'cfb'->'player'->>'name' <> 'Player 2'
    or v_result->'choices'->'cfb'->'game'->>'id' <> 'game-3'
    or v_result->'choices'->'cfb'->>'selected_by' <> v_owner::text
    or v_result->>'status' <> 'draft' then
    raise exception 'CFB approval receipt invalid: %',v_result; end if;

  v_bad := false;
  begin
    perform public.stage_football_weekly_editorial_candidates(date '2026-10-13','cfb',v_candidates);
  exception when others then v_bad := true; end;
  if not v_bad then raise exception 'Selected CFB shortlist was overwritten'; end if;

  v_result := public.stage_football_weekly_editorial_candidates(date '2026-10-13','nfl',v_candidates);
  if v_result->'choices'->'cfb'->'player'->>'id' <> 'player-2'
    or jsonb_array_length(v_result->'proposals'->'nfl'->'games') <> 5 then
    raise exception 'NFL staging erased the CFB selection: %',v_result; end if;

  v_result := public.select_football_weekly_editorial_choices(date '2026-10-13','nfl','player-1','game-4');
  if v_result->'choices'->'nfl'->'game'->>'id' <> 'game-4'
    or v_result->'choices'->'cfb'->'player'->>'id' <> 'player-2'
    or v_result->>'published_at' is not null
    or v_result->>'status' <> 'draft'
  then raise exception 'NFL choice changed live state or CFB: %',v_result; end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform set_config('request.jwt.claim.sub','',true);
  update public.football_weekly_content_packages set status='approved' where week_of=date '2026-10-13';
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_bad := false;
  begin
    perform public.select_football_weekly_editorial_choices(date '2026-10-13','nfl','player-3','game-2');
  exception when others then v_bad := true; end;
  if not v_bad then raise exception 'Approved package could be reselected'; end if;
end
$proof$;
rollback;
\echo 'Football weekly editorial Phase 2 approval SQL proof passed.'
