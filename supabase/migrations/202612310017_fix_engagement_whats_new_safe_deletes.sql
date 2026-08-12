-- Production enables safe-update protection for full-table DELETE statements.
-- Patch the existing engagement What's New synchronizer in place so the
-- canonical workflow keeps one RPC and one publisher path.

do $repair$
declare
  v_definition text;
  v_game_delete constant text := 'delete from private.game_whats_new_snapshot;';
  v_challenge_delete constant text := 'delete from private.challenge_whats_new_snapshot;';
  v_achievement_delete constant text := 'delete from private.achievement_whats_new_snapshot;';
begin
  select pg_catalog.pg_get_functiondef(
    'public.sync_engagement_whats_new(text,jsonb,jsonb,jsonb)'::pg_catalog.regprocedure
  ) into v_definition;

  if pg_catalog.strpos(v_definition, v_game_delete) = 0 then
    raise exception 'canonical engagement game snapshot delete statement not found';
  end if;
  if pg_catalog.strpos(v_definition, v_challenge_delete) = 0 then
    raise exception 'canonical engagement challenge snapshot delete statement not found';
  end if;
  if pg_catalog.strpos(v_definition, v_achievement_delete) = 0 then
    raise exception 'canonical engagement achievement snapshot delete statement not found';
  end if;

  v_definition := pg_catalog.replace(
    v_definition,
    v_game_delete,
    'delete from private.game_whats_new_snapshot where true;'
  );
  v_definition := pg_catalog.replace(
    v_definition,
    v_challenge_delete,
    'delete from private.challenge_whats_new_snapshot where true;'
  );
  v_definition := pg_catalog.replace(
    v_definition,
    v_achievement_delete,
    'delete from private.achievement_whats_new_snapshot where true;'
  );

  if pg_catalog.strpos(v_definition, v_game_delete) <> 0
    or pg_catalog.strpos(v_definition, v_challenge_delete) <> 0
    or pg_catalog.strpos(v_definition, v_achievement_delete) <> 0 then
    raise exception 'canonical engagement What''s New delete repair was incomplete';
  end if;

  execute v_definition;
end;
$repair$;

-- CREATE OR REPLACE preserves ownership and ACLs; reassert the existing public
-- contract explicitly so only the service role can execute the synchronizer.
revoke all on function public.sync_engagement_whats_new(text, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.sync_engagement_whats_new(text, jsonb, jsonb, jsonb)
  to service_role;
