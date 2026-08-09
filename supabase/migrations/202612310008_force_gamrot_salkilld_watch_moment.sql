-- Repair the completed Gamrot vs. Salkilld recap with Cody's supplied Must-Watch Moment.
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
  select count(*), min(event_id)
  into v_match_count, v_event_id
  from public.pick_events
  where season = 2026
    and lower(coalesce(subtitle, '')) like '%gamrot%'
    and lower(coalesce(subtitle, '')) like '%salkilld%';

  if v_match_count <> 1 then
    raise exception 'expected exactly one 2026 Gamrot vs. Salkilld Picks event, found %', v_match_count;
  end if;

  update public.pick_events
  set watch_moments = jsonb_build_array(v_moment),
      updated_at = now()
  where event_id = v_event_id;
end;
$$;
