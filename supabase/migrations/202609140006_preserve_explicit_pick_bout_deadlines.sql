-- Standard generated deadlines belong to card positions. Explicitly adjusted
-- per-fight deadlines remain deliberate bout overrides and are not silently
-- discarded by a later card reorder.

create or replace function private.reflow_active_pick_bout_slots(p_event_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_active_count integer;
  v_slot_owned_bout_ids text[];
begin
  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for update;

  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming'
    or now() >= v_event.locks_at
    or now() >= v_event.starts_at then
    raise exception 'pre-lock card changes are closed';
  end if;

  perform 1
  from public.pick_bouts
  where event_id = v_event.event_id
  order by position, bout_id
  for update;

  select count(*)::integer into v_active_count
  from public.pick_bouts
  where event_id = v_event.event_id
    and included_in_picks;

  if v_active_count < 1 then raise exception 'at least one active Picks bout is required'; end if;
  if exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event.event_id
      and bout.included_in_picks
      and coalesce(bout.result_status, 'pending') <> 'pending'
  ) then
    raise exception 'only pending active bouts can be reflowed';
  end if;

  -- A newly added fight has no deadline yet. Existing published fights are
  -- position-owned only while their stored deadline still equals the deadline
  -- generated from their prior segment sequence. Any other value is an explicit
  -- owner override and stays attached to that bout.
  select coalesce(array_agg(bout.bout_id), array[]::text[])
  into v_slot_owned_bout_ids
  from public.pick_bouts bout
  where bout.event_id = v_event.event_id
    and bout.included_in_picks
    and (
      bout.locks_at is null
      or (
        bout.segment_sequence is not null
        and bout.locks_at = (
          case coalesce(bout.card_segment, 'main')
            when 'prelim' then v_event.prelims_starts_at
            else v_event.starts_at
          end
          + make_interval(mins => 30 * (bout.segment_sequence - 1))
        )
      )
    );

  update public.pick_bouts
  set segment_sequence = null
  where event_id = v_event.event_id;

  with active as (
    select bout_id, row_number() over (order by position, bout_id)::integer new_position
    from public.pick_bouts
    where event_id = v_event.event_id and included_in_picks
  ), removed as (
    select bout_id,
      v_active_count + row_number() over (order by position, bout_id)::integer new_position
    from public.pick_bouts
    where event_id = v_event.event_id and not included_in_picks
  ), ordered as (
    select * from active union all select * from removed
  )
  update public.pick_bouts bout
  set position = 10000 + ordered.new_position
  from ordered
  where bout.event_id = v_event.event_id
    and bout.bout_id = ordered.bout_id;

  update public.pick_bouts
  set position = position - 10000
  where event_id = v_event.event_id;

  update public.pick_bouts
  set card_segment = coalesce(card_segment, 'main')
  where event_id = v_event.event_id
    and included_in_picks;

  if exists (
    select 1 from public.pick_bouts bout
    where bout.event_id = v_event.event_id
      and bout.included_in_picks
      and bout.card_segment = 'prelim'
  ) and v_event.prelims_starts_at is null then
    raise exception 'Prelims require an official start time';
  end if;

  with ranked as (
    select
      bout.bout_id,
      row_number() over (
        partition by bout.card_segment
        order by bout.position desc, bout.bout_id
      )::smallint segment_sequence
    from public.pick_bouts bout
    where bout.event_id = v_event.event_id
      and bout.included_in_picks
  )
  update public.pick_bouts bout
  set segment_sequence = ranked.segment_sequence
  from ranked
  where bout.event_id = v_event.event_id
    and bout.bout_id = ranked.bout_id;

  update public.pick_bouts bout
  set locks_at = case bout.card_segment
      when 'prelim' then v_event.prelims_starts_at
      else v_event.starts_at
    end + make_interval(mins => 30 * (bout.segment_sequence - 1))
  where bout.event_id = v_event.event_id
    and bout.included_in_picks
    and bout.bout_id = any(v_slot_owned_bout_ids);
end;
$$;
revoke all on function private.reflow_active_pick_bout_slots(text)
  from public, anon, authenticated, service_role;
