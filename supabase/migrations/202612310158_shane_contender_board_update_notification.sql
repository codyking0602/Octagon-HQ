-- Publish one in-app-only Shane King’s Contender Series board update to
-- existing profiles. This intentionally reuses the established
-- fighter_watchlist_added kind because that kind is Rankings-category and
-- explicitly in-app only.

create or replace function private.publish_shane_contender_board_update_20260921_once()
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
    raise exception 'Shane Contender Series board update must remain rankings/in_app';
  end if;

  if exists (
    select 1
    from private.notification_events event
    where event.source_key = 'fighter-watchlist:board-update:2026-09-21'
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
      'fighter-watchlist:board-update:2026-09-21',
      'fighter-watchlist:board-update:2026-09-21',
      'fighter_watchlist_added',
      'Shane’s Contender Series reshuffled',
      'Salkilld is the new #1, Raul Rosas Jr. joins at #4, and Gable Steveson drops to #8 after UFC 331.',
      '/fighters-to-watch',
      'VIEW BOARD',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$$;

revoke all on function private.publish_shane_contender_board_update_20260921_once()
  from public, anon, authenticated;

grant execute on function private.publish_shane_contender_board_update_20260921_once()
  to service_role;

select private.publish_shane_contender_board_update_20260921_once();

comment on function private.publish_shane_contender_board_update_20260921_once() is
  'Publishes the Sep. 21, 2026 Shane Contender Series board reshuffle as a one-time in-app-only notification for existing profiles.';

notify pgrst, 'reload schema';
