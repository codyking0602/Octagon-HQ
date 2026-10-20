-- Prove October 20 event assignment, non-reroll, and server-enforced first QB.
-- Transaction-only test; never changes live official player records.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $oct20$
declare
  v_player uuid := extensions.gen_random_uuid();
  v_dak jsonb;
  v_penix jsonb;
  v_dak_second jsonb;
  v_state jsonb;
  v_rejected boolean := false;
  v_oct13_count integer;
begin
  select count(*) into v_oct13_count from private.football_weekly_gm_attempts
    where week_start=date '2026-10-13';
  if not exists (
    select 1 from private.football_weekly_gm_events
    where week_start=date '2026-10-20'
      and subject_key='nfl-gm-championship'
      and opens_at='2026-10-20 00:00:00 America/Chicago'::timestamptz
      and closes_at='2026-10-27 00:00:00 America/Chicago'::timestamptz
  ) then raise exception 'October 20 official event is missing or misconfigured'; end if;
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values (v_player,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'gm-oct20-test@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','GM OCT20 TEST','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_player,'GM OCT20 TEST','GT');
  update private.football_weekly_gm_events
    set opens_at=now()-interval '1 day', closes_at=now()+interval '1 day'
    where week_start=date '2026-10-20';
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_player::text,true);
  v_dak := public.start_my_football_weekly_gm('elite');
  v_dak_second := public.start_my_football_weekly_gm('elite');
  v_penix := public.start_my_football_weekly_gm('young');
  if v_dak->>'seed' is distinct from v_dak_second->>'seed'
    or position('weekly-gm:2026-10-20:elite:' in v_dak->>'seed')<>1
    or position('weekly-gm:2026-10-20:young:' in v_penix->>'seed')<>1 then
    raise exception 'Official Oct20 attempts were not date-bound and non-rerollable';
  end if;
  v_state:=jsonb_build_object(
    'version','football-gm-v11-seeded-development',
    'seed',v_dak->>'seed','phase','draft','spinIndex',1,
    'roster',jsonb_build_array(jsonb_build_object('slot','QB','playerId','BUF|QB|joshallen','acquired','draft')),
    'finalRoster','[]'::jsonb,'resolvedSeasons','[]'::jsonb
  );
  begin
    perform public.save_my_football_weekly_gm('elite',v_dak->>'seed',v_state,false,null);
  exception when others then v_rejected:=sqlerrm like '%assigned quarterback%'; end;
  if not v_rejected then raise exception 'Oct20 incorrectly accepted Josh Allen as Dak'; end if;
  v_state:=jsonb_set(v_state,'{roster,0,playerId}','"DAL|QB|dakprescott"'::jsonb);
  perform public.save_my_football_weekly_gm('elite',v_dak->>'seed',v_state,false,null);
  v_state:=jsonb_set(v_state,'{seed}',to_jsonb(v_penix->>'seed'));
  v_state:=jsonb_set(v_state,'{roster,0,playerId}','"ATL|QB|michaelpenix"'::jsonb);
  perform public.save_my_football_weekly_gm('young',v_penix->>'seed',v_state,false,null);
  if (public.get_my_football_weekly_gm()->>'week_start')<>'2026-10-20'
    or (public.get_my_football_weekly_gm()->'attempts'->'elite'->'state'->'roster'->0->>'playerId')<>'DAL|QB|dakprescott'
    or (public.get_my_football_weekly_gm()->'attempts'->'young'->'state'->'roster'->0->>'playerId')<>'ATL|QB|michaelpenix' then
    raise exception 'Current weekly retrieval returned wrong QB or old event'; end if;
  if (select count(*) from private.football_weekly_gm_attempts where week_start=date '2026-10-13')<>v_oct13_count then
    raise exception 'October 13 official attempts changed during Oct20 rollout test'; end if;
end;
$oct20$;
rollback;
\echo 'Oct20 Dak and Penix Weekly GM isolation and first-QB integrity passed.'
