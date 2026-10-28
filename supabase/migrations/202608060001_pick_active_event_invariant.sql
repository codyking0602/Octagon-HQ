-- Picks lifecycle Phase C, slice 1: enforce one canonical active event.
-- Existing transition_pick_event and publish_pick_event_draft RPCs remain the only
-- lifecycle and staged-card publication mutation owners.

-- Fail clearly instead of creating an invalid unique index if production data has
-- somehow drifted before this invariant reaches the database.
do $$
begin
  if (
    select count(*)
    from public.pick_events event
    where event.status in ('upcoming', 'locked')
  ) > 1 then
    raise exception 'multiple active Picks events must be reconciled before applying the active-event invariant';
  end if;
end;
$$;

-- A constant-expression partial unique index allows any number of completed
-- historical events while preventing concurrent or accidental creation of a
-- second upcoming/locked event through any database path.
create unique index if not exists pick_events_one_active_event_idx
  on public.pick_events ((1))
  where status in ('upcoming', 'locked');

notify pgrst, 'reload schema';
