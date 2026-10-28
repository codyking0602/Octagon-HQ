-- Prove the actual owner-only Weekly GM dress rehearsal is isolated from October 13.
begin;
do $proof$
declare
  v_rejected boolean := false;
begin
  if not exists (
    select 1 from private.football_weekly_gm_events
    where week_start=date '1980-01-29'
      and subject_key='owner-only-nfl-gm-playtest'
      and closes_at='2026-10-13 00:00:00 America/Chicago'::timestamptz
  ) then raise exception 'Isolated owner playtest event missing'; end if;
  if not exists (
    select 1 from private.football_weekly_gm_events
    where week_start=date '2026-10-13'
      and opens_at='2026-10-13 00:00:00 America/Chicago'::timestamptz
      and closes_at='2026-10-20 00:00:00 America/Chicago'::timestamptz
  ) then raise exception 'The scheduled official GM event was changed'; end if;
  if has_function_privilege('anon','public.start_my_football_weekly_gm_preview(text)','EXECUTE')
    or has_function_privilege('anon','public.reset_my_football_weekly_gm_preview()','EXECUTE')
    or has_function_privilege('anon','public.get_my_football_weekly_gm_preview()','EXECUTE')
    or has_function_privilege('anon','public.get_football_weekly_gm_preview_result(text,uuid)','EXECUTE')
    or has_table_privilege('authenticated','private.football_weekly_gm_attempts','SELECT')
  then raise exception 'Owner-only preview exposed to unauthorized API roles'; end if;
  if not has_function_privilege('authenticated','public.start_my_football_weekly_gm_preview(text)','EXECUTE')
    or not has_function_privilege('authenticated','public.get_my_football_weekly_gm_preview()','EXECUTE')
  then raise exception 'Owner preview RPCs unavailable'; end if;
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
  begin
    perform public.start_my_football_weekly_gm_preview('elite');
  exception when others then v_rejected := sqlerrm like '%Owner-only%';
  end;
  if not v_rejected then raise exception 'A non-owner started an owner-only attempt'; end if;
  v_rejected := false;
  begin
    perform public.reset_my_football_weekly_gm_preview();
  exception when others then v_rejected := sqlerrm like '%Owner-only%';
  end;
  if not v_rejected then raise exception 'A non-owner reset a preview'; end if;
  if exists (
    select 1 from private.football_weekly_gm_attempts
    where week_start=date '2026-10-13'
      and profile_id='00000000-0000-4000-8000-000000000001'::uuid
  ) then raise exception 'Owner preview touched official live entries'; end if;
end;
$proof$;
rollback;
\echo 'Owner Weekly GM preview isolation proof passed.'
