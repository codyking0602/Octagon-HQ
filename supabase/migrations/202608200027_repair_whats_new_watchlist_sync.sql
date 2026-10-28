-- Repair Fighters to Watch publication after delayed or skipped frontend deployments.
-- The current snapshot remains disposable comparison evidence. This durable seen-ID
-- ledger records the historical rollout baseline and every successfully synchronized ID.

create table if not exists private.fighters_to_watch_whats_new_seen (
  watch_id text primary key,
  fighter_name text not null,
  first_seen_sha text not null,
  first_seen_at timestamptz not null default now(),
  constraint fighters_to_watch_whats_new_seen_id_valid check (
    char_length(watch_id) between 1 and 80
    and watch_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint fighters_to_watch_whats_new_seen_name_valid check (
    char_length(trim(fighter_name)) between 1 and 100
  ),
  constraint fighters_to_watch_whats_new_seen_source_valid check (
    first_seen_sha ~ '^[0-9a-f]{40}$'
  )
);

alter table private.fighters_to_watch_whats_new_seen enable row level security;
revoke all on private.fighters_to_watch_whats_new_seen from public, anon, authenticated;

-- Historical baseline at the Rankings/Fighters producer rollout. Gable Steveson was
-- added later and is intentionally omitted so the next exact production sync backfills
-- his missed announcement through the canonical publisher.
insert into private.fighters_to_watch_whats_new_seen (
  watch_id,
  fighter_name,
  first_seen_sha,
  first_seen_at
)
values
  (
    'fatima-kline',
    'Fatima Kline',
    '9b4efc9102890a46327b6def505a92453873d29e',
    '2026-07-29T21:55:46Z'::timestamptz
  ),
  (
    'abdul-rakhman-yakhyaev',
    'Abdul Rakhman Yakhyaev',
    '9b4efc9102890a46327b6def505a92453873d29e',
    '2026-07-29T21:55:46Z'::timestamptz
  ),
  (
    'daniil-donchenko',
    'Daniil Donchenko',
    '9b4efc9102890a46327b6def505a92453873d29e',
    '2026-07-29T21:55:46Z'::timestamptz
  )
on conflict (watch_id) do nothing;

-- Preserve the validated legacy ranking logic as a private implementation detail.
alter function public.sync_ranking_whats_new(text, jsonb, jsonb)
  set schema private;
alter function private.sync_ranking_whats_new(text, jsonb, jsonb)
  rename to sync_ranking_whats_new_core;

revoke all on function private.sync_ranking_whats_new_core(text, jsonb, jsonb)
  from public, anon, authenticated, service_role;

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
  v_source_sha text := lower(trim(p_source_sha));
  v_result jsonb;
  v_watchlist_items integer := 0;
  v_published_at timestamptz := now();
  v_row record;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  if v_source_sha !~ '^[0-9a-f]{40}$' then
    raise exception 'valid exact source SHA required';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('octagon-hq:whats-new:rankings-fighters', 0)
  );

  -- The private core still validates and replaces the canonical snapshots, but it must
  -- not infer watchlist initialization from whether snapshot rows happen to exist.
  -- Clearing only this disposable snapshot forces the core's old watchlist publisher
  -- to stay quiet; the durable seen-ID ledger below owns new-entry publication.
  delete from private.fighters_to_watch_whats_new_snapshot;

  v_result := private.sync_ranking_whats_new_core(
    v_source_sha,
    p_rows,
    p_watchlist_rows
  );

  for v_row in
    with incoming as (
      select
        lower(trim(row_data.id)) as watch_id,
        trim(row_data.name) as fighter_name,
        trim(row_data.note) as scouting_note
      from pg_catalog.jsonb_to_recordset(p_watchlist_rows) as row_data(
        id text,
        name text,
        note text
      )
    )
    select incoming.*
    from incoming
    left join private.fighters_to_watch_whats_new_seen seen
      on seen.watch_id = incoming.watch_id
    where seen.watch_id is null
      and not exists (
        select 1
        from private.whats_new_items item
        where item.source_key = 'fighters-to-watch:new:' || incoming.watch_id
           or item.source_key like 'fighters-to-watch:new:%:' || incoming.watch_id
      )
    order by incoming.fighter_name
  loop
    perform public.publish_whats_new_item(
      'fighters-to-watch:new:' || v_row.watch_id,
      'fighters_to_watch',
      'fighters',
      'automatic',
      left(v_row.fighter_name || ' added to Fighters to Watch', 100),
      left(v_row.scouting_note, 280),
      '/fighters-to-watch',
      'VIEW WATCHLIST',
      v_published_at
    );
    v_watchlist_items := v_watchlist_items + 1;
  end loop;

  insert into private.fighters_to_watch_whats_new_seen (
    watch_id,
    fighter_name,
    first_seen_sha,
    first_seen_at
  )
  select
    lower(trim(row_data.id)),
    trim(row_data.name),
    v_source_sha,
    v_published_at
  from pg_catalog.jsonb_to_recordset(p_watchlist_rows) as row_data(
    id text,
    name text,
    note text
  )
  on conflict (watch_id) do update
    set fighter_name = excluded.fighter_name;

  return coalesce(v_result, '{}'::jsonb) || jsonb_build_object(
    'sync_contract_version', 2,
    'watchlist_baseline_created', false,
    'fighters_to_watch_published', v_watchlist_items,
    'watchlist_seen_count', (
      select count(*)::integer
      from private.fighters_to_watch_whats_new_seen
    )
  );
end;
$$;

revoke all on function public.sync_ranking_whats_new(text, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.sync_ranking_whats_new(text, jsonb, jsonb)
  to service_role;

comment on table private.fighters_to_watch_whats_new_seen is
  'Durable historical evidence for Fighters to Watch IDs already synchronized into What''s New.';
comment on function public.sync_ranking_whats_new(text, jsonb, jsonb) is
  'Synchronizes Rankings and Fighters to Watch with durable seen-ID publication evidence; contract version 2.';

notify pgrst, 'reload schema';
