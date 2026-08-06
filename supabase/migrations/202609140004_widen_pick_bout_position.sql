-- Card position is an ordered application value, not a small numeric domain.
-- Widen the canonical column so audited atomic reorder/addition writers can use
-- collision-free temporary positions before the shared reflow normalizes 1..N.

alter table public.pick_bouts
  alter column position type integer
  using position::integer;

notify pgrst, 'reload schema';
