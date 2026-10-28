-- Publish one in-app-only Shane King’s Contender Series ranking update
-- to existing profiles after Raul Rosas Jr. moved from #4 to #2.
-- This intentionally reuses fighter_watchlist_added because that kind is
-- Rankings-category and explicitly in-app only.

create or replace function private.publish_shane_contender_rosas_rank2_20260928_once()
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
    raise exception 'Shane Contender Series ranking update must remain rankings/in_app';
  end if;

  if exists (
    select 1
    from private.notification_events event
    where event.source_key = 'fighter-watchlist:rosas-rank2:2026-09-28'
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
      'fighter-watchlist:rosas-rank2:2026-09-28',
      'fighter-watchlist:rosas-rank2:2026-09-28',
      'fighter_watchlist_added',
      'Rosas jumps to #2 on Shane’s board',
      'Raul Rosas Jr. moves to #2, pushing Abdul Rakhman Yakhyaev to #3 and Bilal Hasan to #4.',
      '/fighters-to-watch',
      'VIEW BOARD',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$$;

revoke all on function private.publish_shane_contender_rosas_rank2_20260928_once()
  from public, anon, authenticated;

grant execute on function private.publish_shane_contender_rosas_rank2_20260928_once()
  to service_role;

select private.publish_shane_contender_rosas_rank2_20260928_once();

comment on function private.publish_shane_contender_rosas_rank2_20260928_once() is
  'Publishes the Sep. 28, 2026 Raul Rosas Jr. move to #2 on Shane King’s Contender Series as a one-time in-app-only notification for existing profiles.';

notify pgrst, 'reload schema';
