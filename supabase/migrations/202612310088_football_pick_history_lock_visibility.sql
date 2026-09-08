-- Keep lock visibility inside the canonical secure group-pick history projection.
-- Preserve the established per-fight reveal/privacy boundary exactly; only add the persisted lock flag.
create or replace function public.resolved_bout_group_picks(
  p_event_id text,
  p_bout_id text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null
      or not exists (
        select 1 from public.profiles viewer where viewer.id = auth.uid()
      )
      or (
        event.status not in ('locked', 'complete')
        and now() < coalesce(bout.locks_at, event.locks_at)
        and (
          bout.result_status = 'pending'
          or bout.result_status = 'cancelled'
        )
      )
      then '[]'::jsonb
    else coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'display_name', profile.display_name,
          'picked_fighter_slug', pick.fighter_slug,
          'is_current_user', entrant.profile_id = auth.uid(),
          'is_lock', coalesce(pick.is_lock, false)
        )
        order by profile.display_name
      )
      from (
        select distinct event_pick.profile_id
        from public.profile_event_picks event_pick
        where event_pick.event_id = bout.event_id
      ) entrant
      join public.profiles profile on profile.id = entrant.profile_id
      left join public.profile_event_picks pick
        on pick.profile_id = entrant.profile_id
       and pick.event_id = bout.event_id
       and pick.bout_id = bout.bout_id
    ), '[]'::jsonb)
  end
  from public.pick_bouts bout
  join public.pick_events event on event.event_id = bout.event_id
  where bout.event_id = lower(trim(p_event_id))
    and bout.bout_id = lower(trim(p_bout_id));
$$;

revoke all on function public.resolved_bout_group_picks(text,text) from public, anon, authenticated;

notify pgrst, 'reload schema';
