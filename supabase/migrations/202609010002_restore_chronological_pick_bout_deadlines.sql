-- Correct the deployed deadline orientation without adding another owner.
-- Canonical cards are stored headline-first, while segment_sequence is the
-- chronological order inside each card segment. The segment opener locks at
-- its official start, then each later fight locks 30 minutes later.
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
  v_reverse_position_pattern boolean := false;
  v_correct_segment_pattern boolean := false;
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

  -- Keep the deployed parameter name for function identity compatibility. When
  -- true, repair only a recognized system-generated initial schedule.
  if p_require_uniform_default then
    select not exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = v_event.event_id
        and bout.locks_at is distinct from v_event.locks_at
    ) into v_uniform_default;

    with reverse_position_pattern as (
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
      join reverse_position_pattern expected
        on expected.bout_id = bout.bout_id
      where bout.event_id = v_event.event_id
        and bout.locks_at is distinct from expected.expected_locks_at
    ) into v_reverse_position_pattern;

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
    ) into v_correct_segment_pattern;

    if not (
      v_uniform_default
      or v_reverse_position_pattern
      or v_correct_segment_pattern
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

-- Repair only untouched system-generated schedules. This recognizes both the
-- legacy uniform default and the briefly deployed reverse-position schedule,
-- while preserving any card with an intentional per-fight adjustment.
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
