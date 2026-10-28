-- Production enables safe-update protection for full-table DELETE statements.
-- Patch the two existing private implementation functions in place so the
-- canonical v3 public wrapper can continue delegating through the same owners.

do $repair$
declare
  v_definition text;
  v_v2_delete constant text := 'delete from private.fighters_to_watch_whats_new_snapshot;';
  v_ranking_delete constant text := 'delete from private.ranking_whats_new_snapshot;';
  v_watchlist_delete constant text := 'delete from private.fighters_to_watch_whats_new_snapshot;';
begin
  select pg_catalog.pg_get_functiondef(
    'private.sync_ranking_whats_new_v2_core(text,jsonb,jsonb)'::pg_catalog.regprocedure
  ) into v_definition;

  if pg_catalog.strpos(v_definition, v_v2_delete) = 0 then
    raise exception 'canonical v2 What''s New delete statement not found';
  end if;

  v_definition := pg_catalog.replace(
    v_definition,
    v_v2_delete,
    'delete from private.fighters_to_watch_whats_new_snapshot where true;'
  );

  if pg_catalog.strpos(v_definition, v_v2_delete) <> 0 then
    raise exception 'canonical v2 What''s New delete repair was incomplete';
  end if;

  execute v_definition;

  select pg_catalog.pg_get_functiondef(
    'private.sync_ranking_whats_new_core(text,jsonb,jsonb)'::pg_catalog.regprocedure
  ) into v_definition;

  if pg_catalog.strpos(v_definition, v_ranking_delete) = 0 then
    raise exception 'canonical ranking snapshot delete statement not found';
  end if;
  if pg_catalog.strpos(v_definition, v_watchlist_delete) = 0 then
    raise exception 'canonical watchlist snapshot delete statement not found';
  end if;

  v_definition := pg_catalog.replace(
    v_definition,
    v_ranking_delete,
    'delete from private.ranking_whats_new_snapshot where true;'
  );
  v_definition := pg_catalog.replace(
    v_definition,
    v_watchlist_delete,
    'delete from private.fighters_to_watch_whats_new_snapshot where true;'
  );

  if pg_catalog.strpos(v_definition, v_ranking_delete) <> 0
    or pg_catalog.strpos(v_definition, v_watchlist_delete) <> 0 then
    raise exception 'canonical What''s New core delete repair was incomplete';
  end if;

  execute v_definition;
end;
$repair$;

-- CREATE OR REPLACE preserves function ownership and existing ACLs. Reassert the
-- private-only contract explicitly so this migration cannot widen execution access.
revoke all on function private.sync_ranking_whats_new_v2_core(text, jsonb, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.sync_ranking_whats_new_core(text, jsonb, jsonb)
  from public, anon, authenticated, service_role;
