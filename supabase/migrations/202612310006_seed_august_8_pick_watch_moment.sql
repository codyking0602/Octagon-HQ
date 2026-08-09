-- Seed Cody's supplied Must-Watch Moment onto the one completed UFC Picks event
-- from the August 8 Fight Night window. This is a one-off data migration only;
-- runtime ownership remains pick_events.watch_moments and set_pick_event_watch_moments.
do $$
declare
  v_event_id text;
  v_match_count integer;
  v_url constant text := 'https://youtu.be/vOnbuPMDJUc?is=pYiX3TKQV0-YEY-f';
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

  -- Fresh databases do not necessarily contain the live-published event row.
  if v_match_count = 0 then
    return;
  end if;

  update public.pick_events
  set watch_moments = case
        when exists (
          select 1
          from jsonb_array_elements(watch_moments) as item
          where item->>'url' = v_url
        ) then watch_moments
        when jsonb_array_length(watch_moments) < 5
          then watch_moments || jsonb_build_array(v_moment)
        else watch_moments
      end,
      updated_at = now()
  where event_id = v_event_id;
end;
$$;
