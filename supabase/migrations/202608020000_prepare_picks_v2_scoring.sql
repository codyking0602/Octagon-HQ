-- PostgreSQL cannot change a function's table return shape with CREATE OR REPLACE.
-- Remove the prior four-column summary so the following scoring migration can
-- create the authoritative seven-column projection.
drop function if exists public.get_my_pick_summary(integer);
