-- Reorder, addition, and removal finish by normalizing one active card to
-- unique positions 1..N. Defer the existing uniqueness check until the end of
-- that transaction so a removed private audit row cannot block an intermediate
-- active position while the shared reflow is still running.

alter table public.pick_bouts
  drop constraint if exists pick_bouts_event_id_position_key;

alter table public.pick_bouts
  add constraint pick_bouts_event_id_position_key
  unique (event_id, position)
  deferrable initially deferred;
