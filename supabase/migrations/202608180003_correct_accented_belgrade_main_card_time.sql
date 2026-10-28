-- The prior Belgrade correction matched the ASCII text "medic", but the
-- canonical subtitle stores the fighter as "Medić". PostgreSQL LIKE matching
-- is accent-sensitive, so that migration updated zero rows. Match the exact
-- event through season, date, location, and Rodriguez instead.
--
-- UFC Fight Night: Uroš Medić vs. Daniel Rodriguez
-- Aug. 1, 2026 at 1:00 p.m. EDT / 17:00 UTC / 12:00 p.m. CDT.

update public.pick_events
set locks_at = case
      when locks_at = starts_at or locks_at > timestamptz '2026-08-01 17:00:00+00'
        then timestamptz '2026-08-01 17:00:00+00'
      else locks_at
    end,
    starts_at = timestamptz '2026-08-01 17:00:00+00'
where season = 2026
  and starts_at::date = date '2026-08-01'
  and lower(location) like '%belgrade%'
  and lower(subtitle) like '%rodriguez%';

update public.pick_event_drafts
set locks_at = case
      when locks_at = starts_at or locks_at > timestamptz '2026-08-01 17:00:00+00'
        then timestamptz '2026-08-01 17:00:00+00'
      else locks_at
    end,
    starts_at = timestamptz '2026-08-01 17:00:00+00',
    updated_at = now()
where season = 2026
  and starts_at::date = date '2026-08-01'
  and lower(location) like '%belgrade%'
  and lower(subtitle) like '%rodriguez%';

notify pgrst, 'reload schema';
