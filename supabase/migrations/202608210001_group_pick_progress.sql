-- Show authenticated members how far each group member has progressed without
-- exposing fighter selections before the event-wide lock time.
create or replace function public.get_event_pick_progress(p_event_id text)
returns table (
  profile_id uuid,
  display_name text,
  completed integer,
  total integer,
  has_underdog_lock boolean,
  is_current_user boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with requested_event as (
    select event.event_id
    from public.pick_events event
    where event.event_id = lower(trim(p_event_id))
  ), eligible_bouts as (
    select bout.bout_id
    from public.pick_bouts bout
    join requested_event event on event.event_id = bout.event_id
    where coalesce(bout.included_in_picks, true)
      and coalesce(bout.result_status, 'pending') <> 'cancelled'
  ), totals as (
    select count(*)::integer total from eligible_bouts
  )
  select
    profile.id profile_id,
    profile.display_name,
    count(pick.bout_id) filter (where eligible.bout_id is not null)::integer completed,
    totals.total,
    exists (
      select 1
      from public.profile_event_underdog_locks lock
      join requested_event event on event.event_id = lock.event_id
      where lock.profile_id = profile.id
    ) has_underdog_lock,
    profile.id = auth.uid() is_current_user
  from public.profiles profile
  cross join totals
  left join public.profile_event_picks pick
    on pick.profile_id = profile.id
   and pick.event_id = lower(trim(p_event_id))
  left join eligible_bouts eligible on eligible.bout_id = pick.bout_id
  where auth.uid() is not null
    and exists (select 1 from public.profiles viewer where viewer.id = auth.uid())
  group by profile.id, profile.display_name, totals.total
  order by
    case when profile.id = auth.uid() then 0 else 1 end,
    completed desc,
    profile.display_name;
$$;
revoke all on function public.get_event_pick_progress(text) from public, anon;
grant execute on function public.get_event_pick_progress(text) to authenticated;

-- Actual selections remain backend-hidden until the event lock. After lock, the
-- existing current-event projection can safely support member comparisons.
create or replace function public.resolved_bout_group_picks(p_event_id text, p_bout_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null
      or not exists (select 1 from public.profiles viewer where viewer.id = auth.uid())
      or now() < event.locks_at
      then '[]'::jsonb
    else coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'display_name', profile.display_name,
          'picked_fighter_slug', pick.fighter_slug,
          'is_current_user', profile.id = auth.uid()
        )
        order by profile.display_name
      )
      from public.profiles profile
      left join public.profile_event_picks pick
        on pick.profile_id = profile.id
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
