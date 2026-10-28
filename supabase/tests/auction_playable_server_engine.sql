-- Run the frozen PR 3 server-engine proof against its pinned fixture tuple.
begin;
update private.auction_catalog_versions set is_preparation_version = false where is_preparation_version;
update private.auction_catalog_versions set is_preparation_version = true where content_version = 'fixture-2026-08-22-v1';
commit;
\ir auction_playable_server_engine_legacy.sql

-- Restore PR 5 and run catalog, generation, grading, payload, tie, and pinned-version proof.
begin;
update private.auction_catalog_versions set is_preparation_version = false where is_preparation_version;
update private.auction_catalog_versions set is_preparation_version = true where content_version = 'ufc-auction-2026-08-v1';
commit;
begin;
\ir auction_real_content_private_grading_1.sql
\ir auction_real_content_private_grading_2.sql
\ir auction_real_content_private_grading_3.sql
rollback;

-- Prove the current cancellation owner also handles unopened sent challenges.
\ir auction_pending_cancel.sql
