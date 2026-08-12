-- Repair the current contract-v3 Rankings / Fighters to Watch synchronizer.
-- PostgreSQL exposes btrim(text) through pg_catalog, not trim(text).
-- Preserve the neutral ranking-copy behavior introduced by migration 0029.
create or replace function public.sync_ranking_whats_new(
  p_source_sha text,
  p_rows jsonb,
  p_watchlist_rows jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_sha text := lower(pg_catalog.btrim(p_source_sha));
  v_result jsonb;
  v_movement_count integer := 0;
  v_movements jsonb := '[]'::jsonb;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;
  if v_source_sha !~ '^[0-9a-f]{40}$' then
    raise exception 'valid exact source SHA required';
  end if;

  if pg_catalog.jsonb_typeof(p_rows) = 'array' then
    with incoming as (
      select
        lower(pg_catalog.btrim(row_data.slug)) as fighter_slug,
        pg_catalog.btrim(row_data.name) as fighter_name,
        lower(pg_catalog.btrim(row_data.board)) as board,
        row_data.rank as ranking_position
      from pg_catalog.jsonb_to_recordset(p_rows) as row_data(
        slug text,
        name text,
        board text,
        rank integer
      )
    ), movements as (
      select
        incoming.fighter_slug,
        incoming.fighter_name,
        incoming.board,
        prior.ranking_position as previous_rank,
        incoming.ranking_position as current_rank,
        prior.ranking_position - incoming.ranking_position as movement
      from incoming
      join private.ranking_whats_new_snapshot prior
        on prior.fighter_slug = incoming.fighter_slug
       and prior.board = incoming.board
      where pg_catalog.abs(prior.ranking_position - incoming.ranking_position) >= 3
    )
    select
      count(*)::integer,
      coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'fighter_slug', fighter_slug,
            'fighter_name', fighter_name,
            'board', board,
            'previous_rank', previous_rank,
            'current_rank', current_rank,
            'movement', movement
          )
          order by pg_catalog.abs(movement) desc, current_rank, fighter_slug
        ),
        '[]'::jsonb
      )
    into v_movement_count, v_movements
    from movements;
  end if;

  v_result := private.sync_ranking_whats_new_v2_core(
    v_source_sha,
    p_rows,
    p_watchlist_rows
  );

  if v_movement_count >= 5
    and coalesce((v_result ->> 'major_ranking_updates_published')::integer, 0) > 0 then
    insert into private.rich_preview_major_ranking_updates(
      source_sha,
      movement_count,
      movements,
      published_at
    ) values (
      v_source_sha,
      v_movement_count,
      v_movements,
      now()
    )
    on conflict (source_sha) do update set
      movement_count = excluded.movement_count,
      movements = excluded.movements,
      published_at = excluded.published_at;

    update private.whats_new_items
    set title = 'The UFC rankings had a major shakeup',
        summary = left(pg_catalog.format(
          '%s fighters moved three or more spots across the UFC boards.',
          v_movement_count
        ), 280),
        route = '/rankings?update=' || v_source_sha
    where source_key = 'rankings:major:' || v_source_sha
      and kind = 'major_ranking_update';
  end if;

  return coalesce(v_result, '{}'::jsonb) || pg_catalog.jsonb_build_object(
    'sync_contract_version', 3,
    'rich_preview_movement_count', v_movement_count
  );
end;
$$;

revoke all on function public.sync_ranking_whats_new(text, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.sync_ranking_whats_new(text, jsonb, jsonb)
  to service_role;

comment on function public.sync_ranking_whats_new(text, jsonb, jsonb) is
  'Synchronizes Rankings and Fighters to Watch, captures share-preview movement evidence, and keeps neutral ranking copy.';

notify pgrst, 'reload schema';
