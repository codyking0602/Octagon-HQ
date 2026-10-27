-- One-time October 27, 2026 UFC V2 all-time rankings announcement.
-- Ciryl Gane and Natalia Silva have been added, and five existing fighters
-- received an October fight-history/ranking refresh. Bell only; never push.

create or replace function private.publish_ufc_v2_oct27_alltime_notification_once()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile record;
  v_published integer := 0;
begin
  if private.notification_category_for_kind('ranking_refresh_available') <> 'rankings'
    or private.notification_priority_for_kind('ranking_refresh_available') <> 'in_app'
  then
    raise exception 'UFC V2 all-time announcement must stay rankings/in_app';
  end if;

  -- The migration publishes atomically to the current membership. Retries
  -- never rebroadcast or start delivering this historical update to new users.
  if exists (
    select 1
    from private.notification_events event
    where event.source_key = 'ranking-refresh:ufc-v2-alltime:2026-10-27'
  ) then
    return 0;
  end if;

  for v_profile in
    select profile.id
    from public.profiles profile
    order by profile.id
  loop
    perform private.publish_notification_to_profile(
      v_profile.id,
      'ranking-refresh:ufc-v2-alltime:2026-10-27',
      'ranking-refresh:ufc-v2-alltime:2026-10-27',
      'ranking_refresh_available',
      'UFC all-time rankings: new names, new order',
      'Ciryl Gane and Natalia Silva join the boards. Petr Yan leaps to #24; Merab is #21, Volkanovski stays #6, dos Anjos is #30, and Figueiredo’s record is current.',
      '/rankings',
      'VIEW RANKINGS',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$$;

revoke all on function private.publish_ufc_v2_oct27_alltime_notification_once()
  from public, anon, authenticated;

grant execute on function private.publish_ufc_v2_oct27_alltime_notification_once()
  to service_role;

select private.publish_ufc_v2_oct27_alltime_notification_once();

comment on function private.publish_ufc_v2_oct27_alltime_notification_once() is
  'One-time, in-app-only UFC V2 October 27 all-time board announcement (two additions and five fighter refreshes).';

notify pgrst, 'reload schema';
