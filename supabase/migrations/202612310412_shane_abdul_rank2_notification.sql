-- One-time in-app-only announcement for Abdul Rakhman Yakhyaev’s rise to
-- #2 on Shane King’s Contender Series. Reuse the established Rankings-only
-- notification type; never trigger a device push.

create or replace function private.publish_shane_abdul_rank2_20261026_once()
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
    raise exception 'Shane Abdul ranking notice must remain rankings/in_app';
  end if;

  if exists (
    select 1 from private.notification_events event
    where event.source_key = 'fighter-watchlist:abdul-rank2:2026-10-26'
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
      'fighter-watchlist:abdul-rank2:2026-10-26',
      'fighter-watchlist:abdul-rank2:2026-10-26',
      'fighter_watchlist_added',
      'Abdul Yakhyaev climbs to #2 on Shane’s board',
      'Three first-round UFC finishes put Abdul Rakhman Yakhyaev at #2. Raul Rosas Jr. moves to #3. See Abdul’s updated scouting report and highlight.',
      '/fighters-to-watch#abdul-rakhman-yakhyaev',
      'VIEW PROFILE',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$$;

revoke all on function private.publish_shane_abdul_rank2_20261026_once()
  from public, anon, authenticated;

grant execute on function private.publish_shane_abdul_rank2_20261026_once()
  to service_role;

select private.publish_shane_abdul_rank2_20261026_once();

comment on function private.publish_shane_abdul_rank2_20261026_once() is
  'One-time Rankings in-app notice for Abdul Yakhyaev moving from #3 to #2 on October 26, 2026.';

notify pgrst, 'reload schema';
