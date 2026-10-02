-- Publish Ateba Gautier joining Shane King’s Contender Series as a
-- one-time in-app-only notification for existing profiles.
-- Reuse fighter_watchlist_added so the alert stays in Rankings and never
-- becomes push-eligible.

create or replace function private.publish_ateba_gautier_contender_notification_20261002_once()
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
    raise exception 'Ateba Gautier Contender Series notification must remain rankings/in_app';
  end if;

  if exists (
    select 1
    from private.notification_events event
    where event.source_key = 'fighter-watchlist:ateba-gautier:2026-10-02'
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
      'fighter-watchlist:ateba-gautier:2026-10-02',
      'fighter-watchlist:ateba-gautier:2026-10-02',
      'fighter_watchlist_added',
      'Ateba Gautier joins Shane’s Contender Series',
      'The 5–0 UFC middleweight enters Shane King’s board at #5 ahead of UFC 332.',
      '/fighters-to-watch#ateba-gautier',
      'VIEW BOARD',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$$;

revoke all on function private.publish_ateba_gautier_contender_notification_20261002_once()
  from public, anon, authenticated;

grant execute on function private.publish_ateba_gautier_contender_notification_20261002_once()
  to service_role;

select private.publish_ateba_gautier_contender_notification_20261002_once();

comment on function private.publish_ateba_gautier_contender_notification_20261002_once() is
  'Publishes Ateba Gautier joining Shane King’s Contender Series at #5 as a one-time in-app-only notification for existing profiles.';

notify pgrst, 'reload schema';
