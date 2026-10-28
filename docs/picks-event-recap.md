# Picks event recaps

Completed Picks events remain owned by the existing archived history projection and `LatestEventRecap` presentation.

Each `pick_events` row may store zero to five ordered `watch_moments`. The canonical owner mutation is `set_pick_event_watch_moments(event_id, moments)`, restricted to the designated Fight Night Control owner and service role. Each moment contains a title and secure YouTube URL. Events with no moments render no watch section.

The full recap:

- opens from its permanent `/picks?event=<event-id>&view=recap` destination;
- personalizes picks, points, and the current-user standing for the signed-in viewer;
- shows a neutral non-entry state when the viewer did not participate;
- uses one viewport-height mobile scroll owner;
- places Must-Watch Moments between the story cards and Final Table.

The Share action creates one universal event poster. It includes event results, group stories, final standings, the first Must-Watch Moment, and Octagon HQ branding. It never includes the sender's personal picks, points, record, or `YOU` marker. Native sharing includes the poster file, permanent personalized recap destination, and all saved YouTube moment links. Clipboard fallback preserves the same links.
