-- Publish the UFC 332 Shane King’s Contender Series reshuffle as a
-- one-time in-app-only notification for existing profiles.
-- Reuse fighter_watchlist_added so the alert stays in Rankings and never
-- becomes push-eligible.

create or replace function private.publish_shane_contender_ufc332_update_20261004_once()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile record;
  v_published integer := 0;
begin
  if private.notification_category_for_kind('fighter_watchlist_added') <> 'rankings'
    or private.notification_priority_for_kind('fighter_watchlist_added') <> 'in_app'
  then
    raise exception 'Shane Contender Series UFC 332 update must remain rankings/in_app';
  end if;

  if exists (
    select 1
    from private.notification_events event
    where event.source_key = 'fighter-watchlist:ufc332-board-update:2026-10-04'
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
      'fighter-watchlist:ufc332-board-update:2026-10-04',
      'fighter-watchlist:ufc332-board-update:2026-10-04',
      'fighter_watchlist_added',
      'Shane’s Contender Series updated',
      'Damian Pinas joins at #7 after another first-round KO. Ateba Gautier drops to #9 after UFC 332.',
      '/fighters-to-watch',
      'VIEW BOARD',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$$;

revoke all on function private.publish_shane_contender_ufc332_update_20261004_once()
  from public, anon, authenticated;

grant execute on function private.publish_shane_contender_ufc332_update_20261004_once()
  to service_role;

select private.publish_shane_contender_ufc332_update_20261004_once();

comment on function private.publish_shane_contender_ufc332_update_20261004_once() is
  'Publishes the Oct. 4, 2026 UFC 332 Shane Contender Series reshuffle as a one-time in-app-only notification for existing profiles.';

notify pgrst, 'reload schema';
