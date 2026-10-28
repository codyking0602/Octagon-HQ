-- Announce Alice Pereira joining Shane King's Contender Series at #11
-- to existing profiles once. This uses Rankings/in_app only, never a push.

create or replace function private.publish_alice_pereira_contender_notification_20261011_once()
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
    raise exception 'Alice Pereira Contender Series notification must remain rankings/in_app';
  end if;

  if exists (
    select 1
    from private.notification_events event
    where event.source_key = 'fighter-watchlist:alice-pereira:2026-10-11'
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
      'fighter-watchlist:alice-pereira:2026-10-11',
      'fighter-watchlist:alice-pereira:2026-10-11',
      'fighter_watchlist_added',
      'Alice Pereira joins Shane’s Contender Series',
      'At 20 years old and 8–1, Pereira enters Shane’s board at #11 after stopping UFC #15 Daria Zhelezniakova.',
      '/fighters-to-watch#alice-pereira',
      'VIEW BOARD',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$$;

revoke all on function private.publish_alice_pereira_contender_notification_20261011_once()
  from public, anon, authenticated;

grant execute on function private.publish_alice_pereira_contender_notification_20261011_once()
  to service_role;

select private.publish_alice_pereira_contender_notification_20261011_once();

comment on function private.publish_alice_pereira_contender_notification_20261011_once() is
  'One-time in-app-only rankings notification for Alice Pereira joining Shane King’s Contender Series at #11 on Oct. 11, 2026.';

notify pgrst, 'reload schema';
