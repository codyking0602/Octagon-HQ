-- Rollback-only operator integration contract. Run after migrations in a disposable/local database.
begin;

-- Fixtures intentionally use transaction-local rows and the service role; authorization is
-- separately asserted by executing the RPC as a non-owner authenticated fixture.
do $$ begin
  if not exists (
    select 1 from pg_proc where proname = 'approve_pick_fighter_replacement'
  ) then raise exception 'replacement RPC missing'; end if;
  if has_table_privilege('authenticated', 'public.pick_card_change_actions', 'select') then
    raise exception 'private replacement audit is browser-readable';
  end if;
end $$;

-- Required live integration assertions (fixture IDs supplied by the local harness):
-- 1. A non-owner call must fail: "non-owner replacement was accepted".
-- 2. Wrong event/bout and stale expected slugs must fail without writes.
-- 3. Locked, started, complete, and locks_at-expired events must fail.
-- 4. Snapshot pick/audit/odds/lock rows, call RPC, and assert:
--    "old pick silently survived replacement", "unaffected pick changed",
--    "affected mutable lock survived", and "affected odds survived" are all false.
-- 5. save_my_event_pick(old slug) must fail; either current slug must succeed.
-- 6. Call again (including restoration to an original fighter) and assert
--    "second replacement did not append independent audit evidence" is false and no old pick returns.
-- 7. Verify resolved_bout_group_picks returns [] before lock and scoring cannot see deleted picks.

rollback;
