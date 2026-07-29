-- The original lock-time migration was already applied before its Belgrade data
-- correction was added. Apply the current-event correction in a fresh migration
-- so production receives the official UFC main-card start.
--
-- UFC Fight Night: Medic vs Rodriguez
-- Aug. 1, 2026 at 1:00 p.m. EDT / 17:00 UTC / 12:00 p.m. CDT.

update public.pick_events
set locks_at = case
      when locks_at = starts_at or locks_at > timestamptz '2026-08-01 17:00:00+00'
        then timestamptz '2026-08-01 17:00:00+00'
      else locks_at
    end,
    starts_at = timestamptz '2026-08-01 17:00:00+00'
where season = 2026
  and lower(subtitle) like '%medic%'
  and lower(subtitle) like '%rodriguez%'
  and starts_at::date = date '2026-08-01';

update public.pick_event_drafts
set locks_at = case
      when locks_at = starts_at or locks_at > timestamptz '2026-08-01 17:00:00+00'
        then timestamptz '2026-08-01 17:00:00+00'
      else locks_at
    end,
    starts_at = timestamptz '2026-08-01 17:00:00+00',
    updated_at = now()
where season = 2026
  and lower(subtitle) like '%medic%'
  and lower(subtitle) like '%rodriguez%'
  and starts_at::date = date '2026-08-01';

notify pgrst, 'reload schema';
