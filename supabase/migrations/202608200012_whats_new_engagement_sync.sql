-- Connect the canonical Play registry and app-level engagement catalogs to What's New.
-- Personal profile-to-profile challenges remain private and are intentionally excluded.

create table if not exists private.game_whats_new_snapshot (
  game_id text primary key,
  game_title text not null,
  summary text not null,
  route text not null,
  source_sha text not null,
  synced_at timestamptz not null default now(),
  constraint game_whats_new_snapshot_id_valid check (game_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint game_whats_new_snapshot_title_valid check (char_length(trim(game_title)) between 1 and 100),
  constraint game_whats_new_snapshot_summary_valid check (char_length(trim(summary)) between 1 and 280),
  constraint game_whats_new_snapshot_route_valid check (route ~ '^/'),
  constraint game_whats_new_snapshot_source_valid check (source_sha ~ '^[0-9a-f]{40}$')
);

create table if not exists private.challenge_whats_new_snapshot (
  challenge_id text primary key,
  title text not null,
  summary text not null,
  route text not null,
  action_label text not null,
  source_sha text not null,
  synced_at timestamptz not null default now(),
  constraint challenge_whats_new_snapshot_id_valid check (challenge_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint challenge_whats_new_snapshot_title_valid check (char_length(trim(title)) between 1 and 100),
  constraint challenge_whats_new_snapshot_summary_valid check (char_length(trim(summary)) between 1 and 280),
  constraint challenge_whats_new_snapshot_route_valid check (route ~ '^/'),
  constraint challenge_whats_new_snapshot_action_valid check (char_length(trim(action_label)) between 1 and 40),
  constraint challenge_whats_new_snapshot_source_valid check (source_sha ~ '^[0-9a-f]{40}$')
);

create table if not exists private.achievement_whats_new_snapshot (
  achievement_id text primary key,
  title text not null,
  summary text not null,
  route text not null,
  action_label text not null,
  source_sha text not null,
  synced_at timestamptz not null default now(),
  constraint achievement_whats_new_snapshot_id_valid check (achievement_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint achievement_whats_new_snapshot_title_valid check (char_length(trim(title)) between 1 and 100),
  constraint achievement_whats_new_snapshot_summary_valid check (char_length(trim(summary)) between 1 and 280),
  constraint achievement_whats_new_snapshot_route_valid check (route ~ '^/'),
  constraint achievement_whats_new_snapshot_action_valid check (char_length(trim(action_label)) between 1 and 40),
  constraint achievement_whats_new_snapshot_source_valid check (source_sha ~ '^[0-9a-f]{40}$')
);

alter table private.game_whats_new_snapshot enable row level security;
alter table private.challenge_whats_new_snapshot enable row level security;
alter table private.achievement_whats_new_snapshot enable row level security;

revoke all on private.game_whats_new_snapshot from public, anon, authenticated;
revoke all on private.challenge_whats_new_snapshot from public, anon, authenticated;
revoke all on private.achievement_whats_new_snapshot from public, anon, authenticated;

create or replace function public.sync_engagement_whats_new(
  p_source_sha text,
  p_games jsonb,
  p_challenges jsonb,
  p_achievements jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_sha text := lower(trim(p_source_sha));
  v_published_at timestamptz := now();
  v_has_game_baseline boolean;
  v_has_challenge_baseline boolean;
  v_has_achievement_baseline boolean;
  v_new_games integer := 0;
  v_new_challenges integer := 0;
  v_new_achievements integer := 0;
  v_row record;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  if v_source_sha !~ '^[0-9a-f]{40}$' then
    raise exception 'valid exact source SHA required';
  end if;

  if jsonb_typeof(p_games) <> 'array'
    or jsonb_array_length(p_games) < 1
    or jsonb_array_length(p_games) > 100 then
    raise exception 'game snapshot must contain between 1 and 100 games';
  end if;

  if jsonb_typeof(p_challenges) <> 'array'
    or jsonb_array_length(p_challenges) > 100 then
    raise exception 'challenge snapshot must be an array of at most 100 entries';
  end if;

  if jsonb_typeof(p_achievements) <> 'array'
    or jsonb_array_length(p_achievements) > 100 then
    raise exception 'achievement snapshot must be an array of at most 100 entries';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_games) as row_data(id text, title text, summary text, route text)
    where row_data.id is null
      or lower(trim(row_data.id)) !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      or char_length(trim(coalesce(row_data.title, ''))) not between 1 and 100
      or char_length(trim(coalesce(row_data.summary, ''))) not between 1 and 280
      or trim(coalesce(row_data.route, '')) !~ '^/'
  ) then
    raise exception 'game snapshot contains an invalid row';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_games) as row_data(id text, title text, summary text, route text)
    group by lower(trim(row_data.id))
    having count(*) > 1
  ) then
    raise exception 'game snapshot contains duplicate IDs';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_challenges) as row_data(id text, title text, summary text, route text, action_label text)
    where row_data.id is null
      or lower(trim(row_data.id)) !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      or char_length(trim(coalesce(row_data.title, ''))) not between 1 and 100
      or char_length(trim(coalesce(row_data.summary, ''))) not between 1 and 280
      or trim(coalesce(row_data.route, '')) !~ '^/'
      or char_length(trim(coalesce(row_data.action_label, ''))) not between 1 and 40
  ) then
    raise exception 'challenge snapshot contains an invalid row';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_challenges) as row_data(id text, title text, summary text, route text, action_label text)
    group by lower(trim(row_data.id))
    having count(*) > 1
  ) then
    raise exception 'challenge snapshot contains duplicate IDs';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_achievements) as row_data(id text, title text, summary text, route text, action_label text)
    where row_data.id is null
      or lower(trim(row_data.id)) !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      or char_length(trim(coalesce(row_data.title, ''))) not between 1 and 100
      or char_length(trim(coalesce(row_data.summary, ''))) not between 1 and 280
      or trim(coalesce(row_data.route, '')) !~ '^/'
      or char_length(trim(coalesce(row_data.action_label, ''))) not between 1 and 40
  ) then
    raise exception 'achievement snapshot contains an invalid row';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_achievements) as row_data(id text, title text, summary text, route text, action_label text)
    group by lower(trim(row_data.id))
    having count(*) > 1
  ) then
    raise exception 'achievement snapshot contains duplicate IDs';
  end if;

  select exists(select 1 from private.game_whats_new_snapshot) into v_has_game_baseline;
  select exists(select 1 from private.challenge_whats_new_snapshot) into v_has_challenge_baseline;
  select exists(select 1 from private.achievement_whats_new_snapshot) into v_has_achievement_baseline;

  if v_has_game_baseline then
    for v_row in
      select
        lower(trim(row_data.id)) as item_id,
        trim(row_data.title) as title,
        trim(row_data.summary) as summary,
        trim(row_data.route) as route
      from jsonb_to_recordset(p_games) as row_data(id text, title text, summary text, route text)
      left join private.game_whats_new_snapshot prior
        on prior.game_id = lower(trim(row_data.id))
      where prior.game_id is null
      order by row_data.title
    loop
      perform public.publish_whats_new_item(
        'games:new:' || v_source_sha || ':' || v_row.item_id,
        'new_game',
        'games',
        'automatic',
        left(v_row.title || ' is now playable', 100),
        left(v_row.summary, 280),
        v_row.route,
        'PLAY GAME',
        v_published_at
      );
      v_new_games := v_new_games + 1;
    end loop;
  end if;

  if v_has_challenge_baseline then
    for v_row in
      select
        lower(trim(row_data.id)) as item_id,
        trim(row_data.title) as title,
        trim(row_data.summary) as summary,
        trim(row_data.route) as route,
        trim(row_data.action_label) as action_label
      from jsonb_to_recordset(p_challenges) as row_data(id text, title text, summary text, route text, action_label text)
      left join private.challenge_whats_new_snapshot prior
        on prior.challenge_id = lower(trim(row_data.id))
      where prior.challenge_id is null
      order by row_data.title
    loop
      perform public.publish_whats_new_item(
        'challenges:new:' || v_source_sha || ':' || v_row.item_id,
        'new_challenge',
        'challenges',
        'automatic',
        left(v_row.title, 100),
        left(v_row.summary, 280),
        v_row.route,
        v_row.action_label,
        v_published_at
      );
      v_new_challenges := v_new_challenges + 1;
    end loop;
  end if;

  if v_has_achievement_baseline then
    for v_row in
      select
        lower(trim(row_data.id)) as item_id,
        trim(row_data.title) as title,
        trim(row_data.summary) as summary,
        trim(row_data.route) as route,
        trim(row_data.action_label) as action_label
      from jsonb_to_recordset(p_achievements) as row_data(id text, title text, summary text, route text, action_label text)
      left join private.achievement_whats_new_snapshot prior
        on prior.achievement_id = lower(trim(row_data.id))
      where prior.achievement_id is null
      order by row_data.title
    loop
      perform public.publish_whats_new_item(
        'achievements:new:' || v_source_sha || ':' || v_row.item_id,
        'achievement',
        'community',
        'automatic',
        left(v_row.title, 100),
        left(v_row.summary, 280),
        v_row.route,
        v_row.action_label,
        v_published_at
      );
      v_new_achievements := v_new_achievements + 1;
    end loop;
  end if;

  delete from private.game_whats_new_snapshot;
  insert into private.game_whats_new_snapshot(game_id, game_title, summary, route, source_sha, synced_at)
  select lower(trim(row_data.id)), trim(row_data.title), trim(row_data.summary), trim(row_data.route), v_source_sha, v_published_at
  from jsonb_to_recordset(p_games) as row_data(id text, title text, summary text, route text);

  delete from private.challenge_whats_new_snapshot;
  insert into private.challenge_whats_new_snapshot(challenge_id, title, summary, route, action_label, source_sha, synced_at)
  select lower(trim(row_data.id)), trim(row_data.title), trim(row_data.summary), trim(row_data.route), trim(row_data.action_label), v_source_sha, v_published_at
  from jsonb_to_recordset(p_challenges) as row_data(id text, title text, summary text, route text, action_label text);

  delete from private.achievement_whats_new_snapshot;
  insert into private.achievement_whats_new_snapshot(achievement_id, title, summary, route, action_label, source_sha, synced_at)
  select lower(trim(row_data.id)), trim(row_data.title), trim(row_data.summary), trim(row_data.route), trim(row_data.action_label), v_source_sha, v_published_at
  from jsonb_to_recordset(p_achievements) as row_data(id text, title text, summary text, route text, action_label text);

  return jsonb_build_object(
    'game_baseline_created', not v_has_game_baseline,
    'challenge_baseline_created', not v_has_challenge_baseline,
    'achievement_baseline_created', not v_has_achievement_baseline,
    'game_count', jsonb_array_length(p_games),
    'challenge_count', jsonb_array_length(p_challenges),
    'achievement_count', jsonb_array_length(p_achievements),
    'new_games_published', v_new_games,
    'new_challenges_published', v_new_challenges,
    'new_achievements_published', v_new_achievements,
    'source_sha', v_source_sha
  );
end;
$$;

revoke all on function public.sync_engagement_whats_new(text, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.sync_engagement_whats_new(text, jsonb, jsonb, jsonb)
  to service_role;

notify pgrst, 'reload schema';
