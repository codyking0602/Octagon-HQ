-- Correct the published and staged Belgrade card to the official UFC event-page time:
-- Aug. 1, 2026 at 1:00 p.m. EDT / 17:00 UTC (12:00 p.m. CDT in Dallas).
-- Preserve an intentionally earlier owner-set Picks deadline; otherwise move the
-- shared deadline with the corrected main-card start.

update public.pick_events
set locks_at = case
      when locks_at >= timestamptz '2026-08-01 17:00:00+00'
        then timestamptz '2026-08-01 17:00:00+00'
      else locks_at
    end,
    starts_at = timestamptz '2026-08-01 17:00:00+00'
where status = 'upcoming'
  and lower(subtitle) like '%medic%'
  and lower(subtitle) like '%rodriguez%'
  and starts_at::date = date '2026-08-01';

update public.pick_event_drafts
set locks_at = case
      when locks_at >= timestamptz '2026-08-01 17:00:00+00'
        then timestamptz '2026-08-01 17:00:00+00'
      else locks_at
    end,
    starts_at = timestamptz '2026-08-01 17:00:00+00',
    updated_at = now()
where lower(subtitle) like '%medic%'
  and lower(subtitle) like '%rodriguez%'
  and starts_at::date = date '2026-08-01';

notify pgrst, 'reload schema';
