-- Nov 3 standard GM rollover: no forced starter and no Auction gate.
begin;
do $nov03_weekly_gm$
declare
  v_profile uuid := extensions.gen_random_uuid();
  v_elite jsonb;
  v_young jsonb;
  v_state jsonb;
  v_gate jsonb;
  v_bad boolean := false;
begin
  if not exists (
    select 1 from private.football_weekly_gm_events
    where week_start=date '2026-11-03'
      and opens_at='2026-11-03 00:00:00 America/Chicago'::timestamptz
      and closes_at='2026-11-10 00:00:00 America/Chicago'::timestamptz
      and subject_key='nfl-gm-championship'
  ) then raise exception 'Standard November 3–9 GM event is missing'; end if;

  v_gate:=public.football_weekly_auction_daily_gate(
    v_profile,'2026-11-03 12:00:00 America/Chicago'::timestamptz);
  if v_gate->>'featured_challenge'<>'nfl-gm'
    or v_gate->>'week_start'<>'2026-11-03'
    or v_gate->>'required'<>'false'
    or v_gate->>'available'<>'false' then
    raise exception 'Nov 3 still requires Auction: %',v_gate;
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values (v_profile,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'nov03-weekly-gm-'||v_profile::text||'@test.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','NOV03 WEEKLY GM TEST','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_profile,'NOV03 WEEKLY GM TEST','NG');
  update private.football_weekly_gm_events
    set opens_at=now()-interval '1 hour',closes_at=now()+interval '1 day'
    where week_start=date '2026-11-03';
  update private.football_weekly_gm_events
    set closes_at=now()-interval '1 day'
    where week_start=date '2026-10-27' and closes_at >= now();

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_profile::text,true);
  v_elite:=public.start_my_football_weekly_gm('elite');
  v_young:=public.start_my_football_weekly_gm('young');
  if v_elite->>'seed' not like 'weekly-gm:2026-11-03:elite:%'
     or v_young->>'seed' not like 'weekly-gm:2026-11-03:young:%'
     or v_elite->>'seed'=v_young->>'seed' then
    raise exception 'Standard GM scenario start failed: %, %',v_elite,v_young;
  end if;
  if (select count(*) from private.football_weekly_gm_attempts
      where week_start=date '2026-11-03' and profile_id=v_profile
      and starting_player_id is not null)<>0 then
    raise exception 'Nov 3 incorrectly bound a themed opening player';
  end if;

  v_state:=jsonb_build_object(
    'version','football-gm-v11-seeded-development',
    'seed',v_elite->>'seed','phase','draft','spinIndex',0,
    'roster','[]'::jsonb,'finalRoster','[]'::jsonb,'resolvedSeasons','[]'::jsonb
  );
  v_bad:=false;
  begin
    perform public.save_my_football_weekly_gm('elite',v_elite->>'seed',
      jsonb_set(jsonb_set(v_state,'{spinIndex}','1'::jsonb),
        '{roster}',jsonb_build_array(jsonb_build_object(
          'slot','QB','playerId','BUF|QB|joshallen','acquired','draft'))),false,null);
  exception when others then v_bad:=sqlerrm like '%empty roster%'; end;
  if not v_bad then raise exception 'Nov 3 allowed a forced starting player'; end if;

  perform public.save_my_football_weekly_gm('elite',v_elite->>'seed',v_state,false,null);
  if public.get_my_football_weekly_gm()->>'week_start'<>'2026-11-03' then
    raise exception 'November 3 official GM is not active';
  end if;
end;
$nov03_weekly_gm$;
rollback;
\echo 'Nov 3 standard Weekly GM launch proof passed.'
