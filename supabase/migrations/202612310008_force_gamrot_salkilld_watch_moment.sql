-- Repair the Gamrot vs. Salkilld recap with Cody's supplied Must-Watch Moment.
-- Runtime ownership remains pick_events.watch_moments and set_pick_event_watch_moments.
do $$
declare
  v_event_id text;
  v_match_count integer;
  v_url constant text := 'https://youtu.be/mLamuYVoc2E?is=XQ3Ozk5j-nUNTj0t';
  v_moment jsonb := jsonb_build_object(
    'title', 'Gamrot vs. Salkilld - Must-Watch Moment',
    'url', v_url
  );
begin
  select count(distinct event.event_id), min(event.event_id)
  into v_match_count, v_event_id
  from public.pick_events event
  join public.pick_bouts bout
    on bout.event_id = event.event_id
   and bout.position = 1
  where event.season = 2026
    and (
      (bout.red_fighter_slug = 'mateusz-gamrot' and bout.blue_fighter_slug = 'quillan-salkilld')
      or (bout.red_fighter_slug = 'quillan-salkilld' and bout.blue_fighter_slug = 'mateusz-gamrot')
    );

  if v_match_count > 1 then
    raise exception 'expected at most one 2026 Gamrot vs. Salkilld Picks event, found %', v_match_count;
  end if;

  -- Fresh databases do not contain the live-published August event row.
  if v_match_count = 0 then
    return;
  end if;

  update public.pick_events
  set watch_moments = jsonb_build_array(v_moment),
      updated_at = now()
  where event_id = v_event_id;
end;
$$;
