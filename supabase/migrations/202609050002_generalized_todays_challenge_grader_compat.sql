-- Keep the canonical grader compatible with the production PostgreSQL function set.
-- PostgreSQL exposes jsonb_object_keys but not jsonb_object_length in this project image.
create or replace function private.jsonb_object_length(p_value jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select count(*)::integer
  from jsonb_object_keys(p_value);
$$;

revoke all on function private.jsonb_object_length(jsonb)
  from public, anon, authenticated;

alter function private.grade_daily_challenge(text, text, jsonb, jsonb)
  set search_path to pg_catalog, private;
