begin;

select set_config('request.jwt.claim.role', 'service_role', true);
select set_config('request.jwt.claim.sub', '', true);

-- Keep the fresh-database proof independent from whichever active Picks fixture
-- was created by earlier migrations.
update public.pick_events
set status = 'complete',
    completed_at = coalesce(completed_at, now()),
    updated_at = now()
where status in ('upcoming', 'locked');

insert into public.pick_events(
  event_id,
  name,
  subtitle,
  venue,
  location,
  prelims_starts_at,
  starts_at,
  locks_at,
  season,
  status
) values (
  'append-sequence-regression',
  'UFC Append Sequence Regression',
  'Alpha vs. Beta',
  'Test Arena',
  'Dallas, Texas',
  now() + interval '20 hours',
  now() + interval '22 hours',
  now() + interval '6 hours',
  2199,
  'upcoming'
);

insert into public.pick_bouts(
  event_id,
  bout_id,
  position,
  weight_class,
  red_fighter_slug,
  red_fighter_name,
  blue_fighter_slug,
  blue_fighter_name,
  result_status,
  included_in_picks,
  card_segment,
  segment_sequence,
  locks_at
) values
  (
    'append-sequence-regression', 'append-a', 1, 'Lightweight',
    'append-a-red', 'Append A Red', 'append-a-blue', 'Append A Blue',
    'pending', true, 'main', 1, now() + interval '7 hours'
  ),
  (
    'append-sequence-regression', 'append-b', 2, 'Welterweight',
    'append-b-red', 'Append B Red', 'append-b-blue', 'Append B Blue',
    'pending', true, 'main', 2, now() + interval '8 hours'
  );

do $$
declare
  v_a_lock timestamptz;
  v_b_lock timestamptz;
  v_receipt jsonb;
begin
  select locks_at into v_a_lock
  from public.pick_bouts
  where event_id = 'append-sequence-regression' and bout_id = 'append-a';
  select locks_at into v_b_lock
  from public.pick_bouts
  where event_id = 'append-sequence-regression' and bout_id = 'append-b';

  -- Source sequence 2 is intentionally occupied. The canonical add contract is
  -- append-first, so this must succeed without moving either existing fight.
  v_receipt := public.approve_pick_bout_addition(
    'append-sequence-regression',
    'append-new',
    'Featherweight',
    'append-new-red',
    'Append New Red',
    'append-new-blue',
    'Append New Blue',
    'main',
    2,
    now() + interval '9 hours',
    array['append-a', 'append-b'],
    'Owner confirmed UFC-source fight addition'
  );

  if v_receipt->>'action' <> 'add_bout' then
    raise exception 'occupied source sequence did not produce add_bout receipt: %', v_receipt;
  end if;

  if not exists (
    select 1
    from public.pick_bouts
    where event_id = 'append-sequence-regression'
      and bout_id = 'append-new'
      and position = 3
      and card_segment = 'main'
      and segment_sequence = 3
      and included_in_picks
      and result_status = 'pending'
  ) then
    raise exception 'new fight did not append to the existing card and segment';
  end if;

  if not exists (
    select 1
    from public.pick_bouts
    where event_id = 'append-sequence-regression'
      and bout_id = 'append-a'
      and position = 1
      and segment_sequence = 1
      and locks_at = v_a_lock
  ) or not exists (
    select 1
    from public.pick_bouts
    where event_id = 'append-sequence-regression'
      and bout_id = 'append-b'
      and position = 2
      and segment_sequence = 2
      and locks_at = v_b_lock
  ) then
    raise exception 'append-first addition changed an existing fight order or deadline';
  end if;
end;
$$;

rollback;
