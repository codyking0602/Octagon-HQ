-- Connect the canonical calculated Rankings model to the existing What's New publisher.
-- The trusted main deployment sends one compact snapshot after a successful backend deploy.

create table if not exists private.ranking_whats_new_snapshot (
  fighter_slug text primary key,
  fighter_name text not null,
  board text not null,
  ranking_position integer not null,
  source_sha text not null,
  synced_at timestamptz not null default now(),
  constraint ranking_whats_new_snapshot_slug_valid check (
    fighter_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
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

alter table private.ranking_whats_new_snapshot enable row level security;
revoke all on private.ranking_whats_new_snapshot from public, anon, authenticated;

create unique index if not exists ranking_whats_new_snapshot_board_position_idx
  on private.ranking_whats_new_snapshot(board, ranking_position);

create or replace function public.sync_ranking_whats_new(
  p_source_sha text,
  p_rows jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_sha text := lower(trim(p_source_sha));
  v_has_baseline boolean;
  v_published_at timestamptz := now();
  v_new_fighters integer := 0;
  v_movements integer := 0;
  v_row record;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  if v_source_sha !~ '^[0-9a-f]{40}$' then
    raise exception 'valid exact source SHA required';
  end if;

  if jsonb_typeof(p_rows) <> 'array'
    or jsonb_array_length(p_rows) < 1
    or jsonb_array_length(p_rows) > 500 then
    raise exception 'ranking snapshot must contain between 1 and 500 fighters';
  end if;

  if exists (
    with incoming as (
      select
        lower(trim(row_data.slug)) as fighter_slug,
        trim(row_data.name) as fighter_name,
        lower(trim(row_data.board)) as board,
        row_data.rank as ranking_position
      from jsonb_to_recordset(p_rows) as row_data(
        slug text,
        name text,
        board text,
        rank integer
      )
    )
    select 1
    from incoming
    where fighter_slug is null
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
      select
        lower(trim(row_data.slug)) as fighter_slug,
        lower(trim(row_data.board)) as board,
        row_data.rank as ranking_position
      from jsonb_to_recordset(p_rows) as row_data(
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
      from jsonb_to_recordset(p_rows) as row_data(
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

  if exists (
    with incoming as (
      select
        lower(trim(row_data.board)) as board,
        row_data.rank as ranking_position
      from jsonb_to_recordset(p_rows) as row_data(
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

  select exists (
    select 1 from private.ranking_whats_new_snapshot
  ) into v_has_baseline;

  if v_has_baseline then
    for v_row in
      with incoming as (
        select
          lower(trim(row_data.slug)) as fighter_slug,
          trim(row_data.name) as fighter_name,
          lower(trim(row_data.board)) as board,
          row_data.rank as ranking_position
        from jsonb_to_recordset(p_rows) as row_data(
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

    for v_row in
      with incoming as (
        select
          lower(trim(row_data.slug)) as fighter_slug,
          trim(row_data.name) as fighter_name,
          lower(trim(row_data.board)) as board,
          row_data.rank as ranking_position
        from jsonb_to_recordset(p_rows) as row_data(
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
      v_movements := v_movements + 1;
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
  from jsonb_to_recordset(p_rows) as row_data(
    slug text,
    name text,
    board text,
    rank integer
  );

  return jsonb_build_object(
    'baseline_created', not v_has_baseline,
    'fighter_count', jsonb_array_length(p_rows),
    'new_fighters_published', v_new_fighters,
    'ranking_movements_published', v_movements,
    'source_sha', v_source_sha
  );
end;
$$;

revoke all on function public.sync_ranking_whats_new(text, jsonb)
  from public, anon, authenticated;
grant execute on function public.sync_ranking_whats_new(text, jsonb)
  to service_role;

notify pgrst, 'reload schema';
