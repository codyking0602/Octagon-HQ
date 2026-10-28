-- Replace the August 8 completed Picks event's Must-Watch Moment with Cody's
-- latest supplied URL. Runtime ownership remains pick_events.watch_moments and
-- set_pick_event_watch_moments; this is a one-off data correction only.
do $$
declare
  v_event_id text;
  v_match_count integer;
  v_url constant text := 'https://youtu.be/mLamuYVoc2E?is=XQ3Ozk5j-nUNTj0t';
  v_moment jsonb := jsonb_build_object(
    'title', 'UFC Fight Night - Must-Watch Moment',
    'url', v_url
  );
begin
  select count(*), min(event_id)
  into v_match_count, v_event_id
  from public.pick_events
  where season = 2026
    and status = 'completed'
    and starts_at >= timestamptz '2026-08-08 00:00:00+00'
    and starts_at < timestamptz '2026-08-10 00:00:00+00';

  if v_match_count > 1 then
    raise exception 'expected at most one completed Picks event in the August 8 Fight Night window, found %', v_match_count;
  end if;

  if v_match_count = 0 then
    return;
  end if;

  update public.pick_events
  set watch_moments = (
        select coalesce(jsonb_agg(item), '[]'::jsonb)
        from jsonb_array_elements(coalesce(watch_moments, '[]'::jsonb)) as item
        where item->>'title' <> 'UFC Fight Night - Must-Watch Moment'
      ) || jsonb_build_array(v_moment),
      updated_at = now()
  where event_id = v_event_id;
end;
$$;
