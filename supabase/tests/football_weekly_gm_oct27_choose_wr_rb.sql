-- Oct 27 2026 choose-your-WR/RB server allowlist, selection locks and historical isolation.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $oct27$
declare
  v_player uuid := extensions.gen_random_uuid();
  v_wr jsonb;
  v_repeat jsonb;
  v_rb jsonb;
  v_initial jsonb;
  v_invalid boolean;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values (v_player,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'weekly-gm-oct27-test@login.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','GM OCT27 TEST','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_player,'GM OCT27 TEST','GO');
  update private.football_weekly_gm_events
    set closes_at=now()-interval '1 minute'
    where week_start=date '2026-10-20';
  update private.football_weekly_gm_events
    set opens_at=now()-interval '1 hour', closes_at=now()+interval '1 day'
    where week_start=date '2026-10-27';

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_player::text,true);
  if public.get_my_football_weekly_gm()->>'week_start' <> '2026-10-27'
  then raise exception 'Current Weekly GM did not roll over to Oct 27'; end if;
  if public.football_weekly_auction_daily_gate(v_player,
       '2026-10-28 12:00:00 America/Chicago'::timestamptz)->>'required' <> 'false'
  then raise exception 'Auction gate still blocks Daily during chosen-player GM week'; end if;

  v_invalid:=false;
  begin
    perform public.start_my_football_weekly_gm('elite');
  exception when others then v_invalid := sqlerrm like '%Choose your featured%'; end;
  if not v_invalid then raise exception 'Old one-argument start bypassed cornerstone choice'; end if;
  v_invalid:=false;
  begin
    perform public.start_my_football_weekly_gm_with_player('elite','BAL|WR|zayflowers');
  exception when others then v_invalid := sqlerrm like '%approved franchise%'; end;
  if not v_invalid then raise exception 'Non-approved receiver was accepted'; end if;
  v_invalid:=false;
  begin
    perform public.start_my_football_weekly_gm_with_player('young','IND|RB|jonathantaylor');
  exception when others then v_invalid := sqlerrm like '%approved franchise%'; end;
  if not v_invalid then raise exception 'Excluded decline-risk RB was accepted'; end if;
  v_invalid:=false;
  begin
    perform public.start_my_football_weekly_gm_with_player('young','CIN|WR|jamarrchase');
  exception when others then v_invalid := sqlerrm like '%approved franchise%'; end;
  if not v_invalid then raise exception 'A WR was accepted in the RB run'; end if;

  v_wr:=public.start_my_football_weekly_gm_with_player('elite','LAR|WR|pukanacua');
  v_repeat:=public.start_my_football_weekly_gm_with_player('elite','LAR|WR|pukanacua');
  if v_wr->>'seed' is distinct from v_repeat->>'seed'
    or v_wr->>'starting_player_id' <> 'LAR|WR|pukanacua'
  then raise exception 'WR selection was not stably persisted'; end if;
  v_invalid:=false;
  begin
    perform public.start_my_football_weekly_gm_with_player('elite','MIN|WR|justinjefferson');
  exception when others then v_invalid := sqlerrm like '%already locked%'; end;
  if not v_invalid then raise exception 'Opening WR was silently rerolled'; end if;

  v_initial:=jsonb_build_object(
    'version','football-gm-v11-seeded-development','seed',v_wr->>'seed',
    'phase','draft','spinIndex',1,
    'roster',jsonb_build_array(jsonb_build_object(
      'slot','WR','playerId','LAR|WR|pukanacua','acquired','draft')),
    'finalRoster','[]'::jsonb,'resolvedSeasons','[]'::jsonb
  );
  v_invalid:=false;
  begin
    perform public.save_my_football_weekly_gm('elite',v_wr->>'seed',
      jsonb_set(v_initial,'{roster,0,playerId}','"CIN|WR|jamarrchase"'::jsonb),
      false,null);
  exception when others then v_invalid := sqlerrm like '%chosen player%' or sqlerrm like '%cornerstone%'; end;
  if not v_invalid then raise exception 'Wrong WR accepted on initial save'; end if;
  v_invalid:=false;
  begin
    perform public.save_my_football_weekly_gm('elite',v_wr->>'seed',
      jsonb_set(v_initial,'{roster,0,slot}','"RB"'::jsonb),
      false,null);
  exception when others then v_invalid := sqlerrm like '%chosen player%'; end;
  if not v_invalid then raise exception 'Wrong position slot accepted'; end if;
  perform public.save_my_football_weekly_gm('elite',v_wr->>'seed',v_initial,false,null);

  v_invalid:=false;
  begin
    perform public.save_my_football_weekly_gm('elite',v_wr->>'seed',
      jsonb_set(v_initial,'{roster,0,playerId}','"MIN|WR|justinjefferson"'::jsonb),
      false,null);
  exception when others then v_invalid := sqlerrm like '%cornerstone%'; end;
  if not v_invalid then raise exception 'Player was removed from Year 1 after initial save'; end if;

  v_rb:=public.start_my_football_weekly_gm_with_player('young','SF|RB|christianmccaffrey');
  if v_rb->>'starting_player_id' <> 'SF|RB|christianmccaffrey'
  then raise exception 'Approved McCaffrey wildcard not available'; end if;
  perform public.save_my_football_weekly_gm('young',v_rb->>'seed',jsonb_build_object(
    'version','football-gm-v11-seeded-development','seed',v_rb->>'seed',
    'phase','draft','spinIndex',1,
    'roster',jsonb_build_array(jsonb_build_object(
      'slot','RB','playerId','SF|RB|christianmccaffrey','acquired','draft')),
    'finalRoster','[]'::jsonb,'resolvedSeasons','[]'::jsonb
  ),false,null);

  if (public.get_my_football_weekly_gm()->'attempts'->'elite'->>'starting_player_id')
    is distinct from 'LAR|WR|pukanacua'
  then raise exception 'Current season starter missing from resumed attempt'; end if;
  if has_function_privilege('anon','public.start_my_football_weekly_gm_with_player(text,text)','EXECUTE')
    or not has_function_privilege('authenticated','public.start_my_football_weekly_gm_with_player(text,text)','EXECUTE')
  then raise exception 'Start with player endpoint grants are invalid'; end if;
  if has_table_privilege('authenticated','private.football_weekly_gm_attempts','SELECT')
  then raise exception 'Private attempt table is exposed'; end if;
end;
$oct27$;
rollback;
\echo 'Oct 27 WR/RB Weekly GM selections and protections passed.'
