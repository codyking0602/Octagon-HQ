\set ON_ERROR_STOP on
-- Transactional, isolated proof: this script never runs on live production.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $nba_cup_public_release$
declare
  v_a uuid := '73000000-0000-4000-8000-000000000001';
  v_b uuid := '73000000-0000-4000-8000-000000000002';
  v_response jsonb;
  v_invalid boolean := false;
  v_locked boolean := false;
begin
  if has_function_privilege('anon','public.get_nba_cup_group_preview()','EXECUTE')
     or has_function_privilege('anon','public.save_nba_cup_group_preview(jsonb)','EXECUTE')
     or not has_function_privilege('authenticated','public.get_nba_cup_group_preview()','EXECUTE')
     or not has_function_privilege('authenticated','public.save_nba_cup_group_preview(jsonb)','EXECUTE')
  then raise exception 'NBA Cup public RPC grants are not authenticated-only'; end if;
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='nba_cup_group_preview_2026'
      and c.relrowsecurity
  ) then raise exception 'NBA Cup picks must retain RLS'; end if;
  if has_table_privilege('authenticated','public.nba_cup_group_preview_2026','SELECT')
    or has_table_privilege('authenticated','public.nba_cup_group_preview_2026','UPDATE')
  then raise exception 'NBA Cup picks must not expose direct table reads or writes'; end if;

  insert into auth.users
    (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
       'nba-cup-public-a@octagon-hq.app','',now(),now(),now(),'{}'::jsonb),
    (v_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
       'nba-cup-public-b@octagon-hq.app','',now(),now(),now(),'{}'::jsonb)
  on conflict(id) do nothing;
  perform public.register_unclaimed_pin_profile(v_a,'NBA CUP PUBLIC A','CA');
  perform public.register_unclaimed_pin_profile(v_b,'NBA CUP PUBLIC B','CB');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_a::text,true);
  v_response := public.get_nba_cup_group_preview();
  if v_response->'picks'<>'{}'::jsonb then
    raise exception 'NBA Cup A should start with a private empty card'; end if;
  v_response := public.save_nba_cup_group_preview('{"EA":"DET","WB":"OKC"}'::jsonb);
  if v_response->'picks'<>'{"EA":"DET","WB":"OKC"}'::jsonb then
    raise exception 'NBA Cup A saved picks did not round-trip'; end if;

  perform set_config('request.jwt.claim.sub',v_b::text,true);
  v_response := public.get_nba_cup_group_preview();
  if v_response->'picks'<>'{}'::jsonb then
    raise exception 'NBA Cup B must not read A picks'; end if;
  v_response := public.save_nba_cup_group_preview('{"EA":"TOR","WC":"LAL"}'::jsonb);
  if v_response->'picks'<>'{"EA":"TOR","WC":"LAL"}'::jsonb then
    raise exception 'NBA Cup B saved picks did not round-trip'; end if;

  begin
    perform public.save_nba_cup_group_preview('{"EA":"OKC"}'::jsonb);
  exception when others then v_invalid:=true;
  end;
  if not v_invalid then raise exception 'NBA Cup must reject teams in wrong groups'; end if;

  perform set_config('request.jwt.claim.sub',v_a::text,true);
  v_response := public.get_nba_cup_group_preview();
  if v_response->'picks'<>'{"EA":"DET","WB":"OKC"}'::jsonb then
    raise exception 'NBA Cup B actions changed A picks'; end if;

  update public.nba_cup_group_preview_lock_2026 set manually_locked=true where season=2026;
  begin
    perform public.save_nba_cup_group_preview('{"EA":"MIL"}'::jsonb);
  exception when others then v_locked:=true;
  end;
  if not v_locked then raise exception 'NBA Cup locked picks accepted a write'; end if;
  v_response := public.get_nba_cup_group_preview();
  if v_response->>'locked'<>'true' or v_response->'picks'<>'{"EA":"DET","WB":"OKC"}'::jsonb then
    raise exception 'NBA Cup lock must preserve readable saved picks'; end if;
end;
$nba_cup_public_release$;
rollback;
\echo 'Public NBA Cup authenticated RPC, per-profile isolation, validation, RLS and manual lock passed.'
