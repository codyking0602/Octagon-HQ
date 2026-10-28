-- Restore the user-confirmed chronological deadline rule after migration
-- 202609010003 temporarily reinstated the opposite headline-first schedule.
-- Keep the same calculator and Event Setup publication owner: the first
-- chronological fight in each card segment receives the official segment
-- start, then every later fight adds exactly 30 minutes.
create or replace function private.apply_initial_pick_bout_deadlines(
  p_event_id text,
  p_require_uniform_default boolean default false
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_uniform_default boolean := false;
  v_headline_first_pattern boolean := false;
  v_chronological_segment_pattern boolean := false;
begin
  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for update;

  if not found then
    raise exception 'event not found';
  end if;

  perform 1
  from public.pick_bouts
  where event_id = v_event.event_id
  order by position, bout_id
  for update;

  if v_event.status <> 'upcoming'
    or now() >= v_event.locks_at
    or not exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = v_event.event_id
    )
    or exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = v_event.event_id
        and (
          not bout.included_in_picks
          or coalesce(bout.result_status, 'pending') <> 'pending'
          or private.pick_bout_is_locked(v_event, bout)
          or bout.card_segment not in ('prelim', 'main')
          or bout.segment_sequence is null
          or bout.segment_sequence < 1
        )
    )
    or (
      v_event.prelims_starts_at is null
      and exists (
        select 1
        from public.pick_bouts bout
        where bout.event_id = v_event.event_id
          and bout.card_segment = 'prelim'
      )
    )
  then
    return false;
  end if;

  -- Existing upcoming cards are eligible for automatic repair only when the
  -- complete card matches a known system-generated schedule. Any intentional
  -- per-fight difference makes all patterns false and remains authoritative.
  if p_require_uniform_default then
    select not exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = v_event.event_id
        and bout.locks_at is distinct from v_event.locks_at
    ) into v_uniform_default;

    with headline_first_pattern as (
      select
        bout.bout_id,
        v_event.locks_at - make_interval(
          mins => 30 * (
            row_number() over (order by bout.position, bout.bout_id) - 1
          )::integer
        ) expected_locks_at
      from public.pick_bouts bout
      where bout.event_id = v_event.event_id
    )
    select not exists (
      select 1
      from public.pick_bouts bout
      join headline_first_pattern expected
        on expected.bout_id = bout.bout_id
      where bout.event_id = v_event.event_id
        and bout.locks_at is distinct from expected.expected_locks_at
    ) into v_headline_first_pattern;

    select not exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = v_event.event_id
        and bout.locks_at is distinct from (
          case bout.card_segment
            when 'prelim' then v_event.prelims_starts_at
            else v_event.starts_at
          end
          + make_interval(mins => 30 * (bout.segment_sequence - 1))
        )
    ) into v_chronological_segment_pattern;

    if not (
      v_uniform_default
      or v_headline_first_pattern
      or v_chronological_segment_pattern
    ) then
      return false;
    end if;
  end if;

  update public.pick_bouts bout
  set locks_at = case bout.card_segment
      when 'prelim' then v_event.prelims_starts_at
      else v_event.starts_at
    end
    + make_interval(mins => 30 * (bout.segment_sequence - 1))
  where bout.event_id = v_event.event_id;

  return true;
end;
$$;
revoke all on function private.apply_initial_pick_bout_deadlines(text,boolean)
  from public, anon, authenticated, service_role;

-- Repair the exact system-generated schedule written by migration 003 through
-- the same guarded calculator used by all future Event Setup publication.
do $$
declare
  v_event_id text;
begin
  for v_event_id in
    select event.event_id
    from public.pick_events event
    where event.status = 'upcoming'
    order by event.starts_at, event.event_id
  loop
    perform private.apply_initial_pick_bout_deadlines(v_event_id, true);
  end loop;
end;
$$;

notify pgrst, 'reload schema';
