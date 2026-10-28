-- Reveal the exact Underdog Lock target only after the canonical event lock.
-- Completion counts and the fact that a lock exists remain visible before lock.
drop function if exists public.get_event_pick_progress(text);

create function public.get_event_pick_progress(p_event_id text)
returns table (
  profile_id uuid,
  display_name text,
  completed integer,
  total integer,
  has_underdog_lock boolean,
  underdog_lock_bout_id text,
  underdog_lock_fighter_slug text,
  is_current_user boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with requested_event as (
    select event.event_id, event.locks_at
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
    count(lock.bout_id) > 0 has_underdog_lock,
    case when now() >= event.locks_at then max(lock.bout_id) else null end underdog_lock_bout_id,
    case when now() >= event.locks_at then max(lock.fighter_slug) else null end underdog_lock_fighter_slug,
    profile.id = auth.uid() is_current_user
  from public.profiles profile
  cross join requested_event event
  cross join totals
  left join public.profile_event_picks pick
    on pick.profile_id = profile.id
   and pick.event_id = event.event_id
  left join eligible_bouts eligible on eligible.bout_id = pick.bout_id
  left join public.profile_event_underdog_locks lock
    on lock.profile_id = profile.id
   and lock.event_id = event.event_id
  where auth.uid() is not null
    and exists (select 1 from public.profiles viewer where viewer.id = auth.uid())
  group by profile.id, profile.display_name, totals.total, event.locks_at
  order by
    case when profile.id = auth.uid() then 0 else 1 end,
    completed desc,
    profile.display_name;
$$;

revoke all on function public.get_event_pick_progress(text) from public, anon;
grant execute on function public.get_event_pick_progress(text) to authenticated;

notify pgrst, 'reload schema';
