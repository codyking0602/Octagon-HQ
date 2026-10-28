-- Connect the canonical calculated Rankings model and Shane's Fighters to Watch
-- to the existing What's New publisher. The trusted main deployment sends one
-- compact snapshot only after the same source SHA reaches production.

create table if not exists private.ranking_whats_new_snapshot (
  fighter_slug text primary key,
  fighter_name text not null,
  board text not null,
  ranking_position integer not null,
  source_sha text not null,
  synced_at timestamptz not null default now(),
  constraint ranking_whats_new_snapshot_slug_valid check (
    char_length(fighter_slug) between 1 and 80
    and fighter_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint ranking_whats_new_snapshot_name_valid check (
    char_length(trim(fighter_name)) between 1 and 100
  ),
  constraint ranking_whats_new_snapshot_board_valid check (
    board in ('men', 'women')
  ),
  constraint ranking_whats_new_snapshot_position_valid check (
    ranking_position between 1 and 500
  ),
  constraint ranking_whats_new_snapshot_source_valid check (
    source_sha ~ '^[0-9a-f]{40}$'
  )
);

create table if not exists private.fighters_to_watch_whats_new_snapshot (
  watch_id text primary key,
  fighter_name text not null,
  source_sha text not null,
  synced_at timestamptz not null default now(),
  constraint fighters_to_watch_whats_new_snapshot_id_valid check (
    char_length(watch_id) between 1 and 80
    and watch_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint fighters_to_watch_whats_new_snapshot_name_valid check (
    char_length(trim(fighter_name)) between 1 and 100
  ),
  constraint fighters_to_watch_whats_new_snapshot_source_valid check (
    source_sha ~ '^[0-9a-f]{40}$'
  )
);

alter table private.ranking_whats_new_snapshot enable row level security;
alter table private.fighters_to_watch_whats_new_snapshot enable row level security;
revoke all on private.ranking_whats_new_snapshot from public, anon, authenticated;
revoke all on private.fighters_to_watch_whats_new_snapshot from public, anon, authenticated;

create unique index if not exists ranking_whats_new_snapshot_board_position_idx
  on private.ranking_whats_new_snapshot(board, ranking_position);

drop function if exists public.sync_ranking_whats_new(text, jsonb);

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
  v_has_ranking_baseline boolean;
  v_has_watchlist_baseline boolean;
  v_published_at timestamptz := now();
  v_new_fighters integer := 0;
  v_meaningful_movements integer := 0;
  v_movement_items integer := 0;
  v_major_updates integer := 0;
  v_watchlist_items integer := 0;
  v_row record;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  if v_source_sha !~ '^[0-9a-f]{40}$' then
    raise exception 'valid exact source SHA required';
  end if;

  if pg_catalog.jsonb_typeof(p_rows) <> 'array'
    or pg_catalog.jsonb_array_length(p_rows) < 2
    or pg_catalog.jsonb_array_length(p_rows) > 500 then
    raise exception 'ranking snapshot must contain between 2 and 500 fighters';
  end if;

  if pg_catalog.jsonb_typeof(p_watchlist_rows) <> 'array'
    or pg_catalog.jsonb_array_length(p_watchlist_rows) > 100 then
    raise exception 'Fighters to Watch snapshot must be an array of at most 100 fighters';
  end if;

  if exists (
    with incoming as (
      select
        lower(trim(row_data.slug)) as fighter_slug,
        trim(row_data.name) as fighter_name,
        lower(trim(row_data.board)) as board,
        row_data.rank as ranking_position
      from pg_catalog.jsonb_to_recordset(p_rows) as row_data(
        slug text,
        name text,
        board text,
        rank integer
      )
    )
    select 1
    from incoming
    where fighter_slug is null
      or char_length(fighter_slug) not between 1 and 80
      or fighter_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      or fighter_name is null
      or char_length(fighter_name) not between 1 and 100
      or board not in ('men', 'women')
      or ranking_position is null
      or ranking_position not between 1 and 500
  ) then
    raise exception 'ranking snapshot contains an invalid fighter row';
  end if;

  if exists (
    with incoming as (
      select lower(trim(row_data.slug)) as fighter_slug
      from pg_catalog.jsonb_to_recordset(p_rows) as row_data(
        slug text,
        name text,
        board text,
        rank integer
      )
    )
    select 1
    from incoming
    group by fighter_slug
    having count(*) > 1
  ) then
    raise exception 'ranking snapshot contains duplicate fighter slugs';
  end if;

  if exists (
    with incoming as (
      select
        lower(trim(row_data.board)) as board,
        row_data.rank as ranking_position
      from pg_catalog.jsonb_to_recordset(p_rows) as row_data(
        slug text,
        name text,
        board text,
        rank integer
      )
    )
    select 1
    from incoming
    group by board, ranking_position
    having count(*) > 1
  ) then
    raise exception 'ranking snapshot contains duplicate board positions';
  end if;

  if (
    select count(distinct lower(trim(row_data.board)))
    from pg_catalog.jsonb_to_recordset(p_rows) as row_data(
      slug text,
      name text,
      board text,
      rank integer
    )
  ) <> 2 then
    raise exception 'ranking snapshot must include both the men and women boards';
  end if;

  if exists (
    with incoming as (
      select
        lower(trim(row_data.board)) as board,
        row_data.rank as ranking_position
      from pg_catalog.jsonb_to_recordset(p_rows) as row_data(
        slug text,
        name text,
        board text,
        rank integer
      )
    ), board_state as (
      select
        board,
        count(*)::integer as fighter_count,
        min(ranking_position) as minimum_position,
        max(ranking_position) as maximum_position,
        count(distinct ranking_position)::integer as distinct_positions
      from incoming
      group by board
    )
    select 1
    from board_state
    where minimum_position <> 1
      or maximum_position <> fighter_count
      or distinct_positions <> fighter_count
  ) then
    raise exception 'ranking positions must be contiguous within each board';
  end if;

  if exists (
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
    select 1
    from incoming
    where watch_id is null
      or char_length(watch_id) not between 1 and 80
      or watch_id !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      or fighter_name is null
      or char_length(fighter_name) not between 1 and 100
      or scouting_note is null
      or char_length(scouting_note) not between 1 and 280
  ) then
    raise exception 'Fighters to Watch snapshot contains an invalid fighter row';
  end if;

  if exists (
    with incoming as (
      select lower(trim(row_data.id)) as watch_id
      from pg_catalog.jsonb_to_recordset(p_watchlist_rows) as row_data(
        id text,
        name text,
        note text
      )
    )
    select 1
    from incoming
    group by watch_id
    having count(*) > 1
  ) then
    raise exception 'Fighters to Watch snapshot contains duplicate fighter IDs';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('octagon-hq:whats-new:rankings-fighters', 0)
  );

  select exists (
    select 1 from private.ranking_whats_new_snapshot
  ) into v_has_ranking_baseline;

  select exists (
    select 1 from private.fighters_to_watch_whats_new_snapshot
  ) into v_has_watchlist_baseline;

  if v_has_ranking_baseline then
    select count(*)::integer
      into v_meaningful_movements
    from (
      select 1
      from pg_catalog.jsonb_to_recordset(p_rows) as row_data(
        slug text,
        name text,
        board text,
        rank integer
      )
      join private.ranking_whats_new_snapshot prior
        on prior.fighter_slug = lower(trim(row_data.slug))
       and prior.board = lower(trim(row_data.board))
      where abs(prior.ranking_position - row_data.rank) >= 3
    ) movement;

    for v_row in
      with incoming as (
        select
          lower(trim(row_data.slug)) as fighter_slug,
          trim(row_data.name) as fighter_name,
          lower(trim(row_data.board)) as board,
          row_data.rank as ranking_position
        from pg_catalog.jsonb_to_recordset(p_rows) as row_data(
          slug text,
          name text,
          board text,
          rank integer
        )
      )
      select incoming.*
      from incoming
      left join private.ranking_whats_new_snapshot prior
        on prior.fighter_slug = incoming.fighter_slug
      where prior.fighter_slug is null
      order by incoming.board, incoming.ranking_position
    loop
      perform public.publish_whats_new_item(
        'rankings:new-fighter:' || v_source_sha || ':' || v_row.fighter_slug,
        'new_fighter',
        'fighters',
        'automatic',
        left(v_row.fighter_name || ' joined the rankings', 100),
        left(format(
          'Now ranked #%s on the UFC %s GOAT board.',
          v_row.ranking_position,
          case when v_row.board = 'women' then 'Women''s' else 'Men''s' end
        ), 280),
        '/fighters/' || v_row.fighter_slug,
        'VIEW FIGHTER',
        v_published_at
      );
      v_new_fighters := v_new_fighters + 1;
    end loop;

    if v_meaningful_movements >= 5 then
      perform public.publish_whats_new_item(
        'rankings:major:' || v_source_sha,
        'major_ranking_update',
        'rankings',
        'automatic',
        'The UFC GOAT rankings had a major shakeup',
        left(format(
          '%s fighters moved three or more spots across the UFC GOAT boards.',
          v_meaningful_movements
        ), 280),
        '/rankings',
        'VIEW RANKINGS',
        v_published_at
      );
      v_major_updates := 1;
    else
      for v_row in
        with incoming as (
          select
            lower(trim(row_data.slug)) as fighter_slug,
            trim(row_data.name) as fighter_name,
            lower(trim(row_data.board)) as board,
            row_data.rank as ranking_position
          from pg_catalog.jsonb_to_recordset(p_rows) as row_data(
            slug text,
            name text,
            board text,
            rank integer
          )
        )
        select
          incoming.*,
          prior.ranking_position as prior_position,
          prior.ranking_position - incoming.ranking_position as movement
        from incoming
        join private.ranking_whats_new_snapshot prior
          on prior.fighter_slug = incoming.fighter_slug
         and prior.board = incoming.board
        where abs(prior.ranking_position - incoming.ranking_position) >= 3
        order by incoming.board, incoming.ranking_position
      loop
        perform public.publish_whats_new_item(
          'rankings:movement:' || v_source_sha || ':' || v_row.fighter_slug,
          'ranking_movement',
          'rankings',
          'automatic',
          left(format(
            '%s moved %s to #%s',
            v_row.fighter_name,
            case when v_row.movement > 0 then 'up' else 'down' end,
            v_row.ranking_position
          ), 100),
          left(format(
            '%s %s spots from #%s to #%s on the UFC %s GOAT board.',
            case when v_row.movement > 0 then 'Up' else 'Down' end,
            abs(v_row.movement),
            v_row.prior_position,
            v_row.ranking_position,
            case when v_row.board = 'women' then 'Women''s' else 'Men''s' end
          ), 280),
          '/fighters/' || v_row.fighter_slug,
          'VIEW FIGHTER',
          v_published_at
        );
        v_movement_items := v_movement_items + 1;
      end loop;
    end if;
  end if;

  if v_has_watchlist_baseline then
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
      left join private.fighters_to_watch_whats_new_snapshot prior
        on prior.watch_id = incoming.watch_id
      where prior.watch_id is null
      order by incoming.fighter_name
    loop
      perform public.publish_whats_new_item(
        'fighters-to-watch:new:' || v_source_sha || ':' || v_row.watch_id,
        'fighters_to_watch',
        'fighters',
        'automatic',
        left(v_row.fighter_name || ' added to Fighters to Watch', 100),
        left(v_row.scouting_note, 280),
        '/#shanes-watchlist',
        'VIEW WATCHLIST',
        v_published_at
      );
      v_watchlist_items := v_watchlist_items + 1;
    end loop;
  end if;

  delete from private.ranking_whats_new_snapshot;

  insert into private.ranking_whats_new_snapshot(
    fighter_slug,
    fighter_name,
    board,
    ranking_position,
    source_sha,
    synced_at
  )
  select
    lower(trim(row_data.slug)),
    trim(row_data.name),
    lower(trim(row_data.board)),
    row_data.rank,
    v_source_sha,
    v_published_at
  from pg_catalog.jsonb_to_recordset(p_rows) as row_data(
    slug text,
    name text,
    board text,
    rank integer
  );

  delete from private.fighters_to_watch_whats_new_snapshot;

  insert into private.fighters_to_watch_whats_new_snapshot(
    watch_id,
    fighter_name,
    source_sha,
    synced_at
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
  );

  return jsonb_build_object(
    'ranking_baseline_created', not v_has_ranking_baseline,
    'watchlist_baseline_created', not v_has_watchlist_baseline,
    'fighter_count', pg_catalog.jsonb_array_length(p_rows),
    'watchlist_count', pg_catalog.jsonb_array_length(p_watchlist_rows),
    'new_fighters_published', v_new_fighters,
    'meaningful_movements_detected', v_meaningful_movements,
    'ranking_movements_published', v_movement_items,
    'major_ranking_updates_published', v_major_updates,
    'fighters_to_watch_published', v_watchlist_items,
    'source_sha', v_source_sha
  );
end;
$$;

revoke all on function public.sync_ranking_whats_new(text, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.sync_ranking_whats_new(text, jsonb, jsonb)
  to service_role;

notify pgrst, 'reload schema';