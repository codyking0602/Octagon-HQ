-- Extend the one rich-preview owner with deliberately small public projections.
-- Crawlers receive only share-card fields; full Picks, challenge setup, private
-- history, hidden results, and administrative data remain inaccessible.

create table if not exists private.rich_preview_major_ranking_updates (
  source_sha text primary key,
  movement_count integer not null,
  movements jsonb not null,
  published_at timestamptz not null default now(),
  constraint rich_preview_major_ranking_source_valid check (source_sha ~ '^[0-9a-f]{40}$'),
  constraint rich_preview_major_ranking_count_valid check (movement_count >= 5),
  constraint rich_preview_major_ranking_movements_valid check (jsonb_typeof(movements) = 'array')
);

alter table private.rich_preview_major_ranking_updates enable row level security;
revoke all on private.rich_preview_major_ranking_updates from public, anon, authenticated;

create or replace function private.rich_preview_result_score_label(
  p_game_id text,
  p_result jsonb
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_score numeric;
  v_count integer := 0;
begin
  if p_result is null or pg_catalog.jsonb_typeof(p_result) <> 'object' then
    return 'DONE';
  end if;

  if coalesce(p_result ->> 'score', '') ~ '^-?[0-9]+(?:\.[0-9]+)?$' then
    v_score := (p_result ->> 'score')::numeric;
  end if;

  if p_game_id = 'wavelength' then
    return case when v_score is null then 'DONE' else pg_catalog.trim(pg_catalog.to_char(v_score, 'FM999999990.##')) end;
  elsif p_game_id = 'blind-resume' then
    return case when v_score is null then 'DONE' else pg_catalog.trim(pg_catalog.to_char(v_score, 'FM999999990.##')) || '/5' end;
  elsif p_game_id = 'find-leader' then
    return case when v_score is null then 'DONE' else pg_catalog.trim(pg_catalog.to_char(v_score, 'FM999999990.##')) || '/10' end;
  elsif p_game_id = 'blind-rank' then
    v_count := case when pg_catalog.jsonb_typeof(p_result -> 'placements') = 'array'
      then pg_catalog.jsonb_array_length(p_result -> 'placements') else 0 end;
    return v_count::text || '/5';
  elsif p_game_id = 'keep-cut' then
    v_count := case when pg_catalog.jsonb_typeof(p_result -> 'decisions') = 'array'
      then pg_catalog.jsonb_array_length(p_result -> 'decisions') else 0 end;
    return v_count::text || '/8';
  elsif p_game_id = 'better-than' then
    if coalesce(p_result ->> 'claimCount', '') ~ '^[0-9]+$' then
      v_count := (p_result ->> 'claimCount')::integer;
    elsif pg_catalog.jsonb_typeof(p_result -> 'selections') = 'array' then
      v_count := pg_catalog.jsonb_array_length(p_result -> 'selections');
    end if;
    return v_count::text || ' NAMES';
  end if;

  return 'DONE';
end;
$$;

create or replace function private.rich_preview_result_verdict(
  p_game_id text,
  p_creator_result jsonb,
  p_responder_result jsonb,
  p_creator_name text,
  p_responder_name text
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_creator_score numeric;
  v_responder_score numeric;
  v_matches integer := 0;
begin
  if p_game_id = 'blind-rank' then
    select count(*)::integer into v_matches
    from pg_catalog.jsonb_array_elements_text(coalesce(p_creator_result -> 'placements', '[]'::jsonb))
      with ordinality as creator(value, position)
    join pg_catalog.jsonb_array_elements_text(coalesce(p_responder_result -> 'placements', '[]'::jsonb))
      with ordinality as responder(value, position)
      using (position)
    where creator.value = responder.value;
    return v_matches::text || ' of 5 slots matched';
  elsif p_game_id = 'keep-cut' then
    select count(*)::integer into v_matches
    from pg_catalog.jsonb_array_elements_text(coalesce(p_creator_result -> 'decisions', '[]'::jsonb))
      with ordinality as creator(value, position)
    join pg_catalog.jsonb_array_elements_text(coalesce(p_responder_result -> 'decisions', '[]'::jsonb))
      with ordinality as responder(value, position)
      using (position)
    where creator.value = responder.value;
    return v_matches::text || ' of 8 calls matched';
  elsif p_game_id = 'better-than' then
    select count(*)::integer into v_matches
    from pg_catalog.jsonb_array_elements(coalesce(p_creator_result -> 'selections', '[]'::jsonb)) as creator(item)
    join pg_catalog.jsonb_array_elements(coalesce(p_responder_result -> 'selections', '[]'::jsonb)) as responder(item)
      on creator.item ->> 'id' = responder.item ->> 'id';
    return v_matches::text || ' shared names';
  end if;

  if coalesce(p_creator_result ->> 'score', '') ~ '^-?[0-9]+(?:\.[0-9]+)?$' then
    v_creator_score := (p_creator_result ->> 'score')::numeric;
  end if;
  if coalesce(p_responder_result ->> 'score', '') ~ '^-?[0-9]+(?:\.[0-9]+)?$' then
    v_responder_score := (p_responder_result ->> 'score')::numeric;
  end if;

  if v_creator_score is null or v_responder_score is null then
    return 'Matchup complete';
  elsif v_creator_score = v_responder_score then
    return 'Tie game';
  elsif v_creator_score > v_responder_score then
    return coalesce(nullif(pg_catalog.trim(p_creator_name), ''), 'Sender') || ' wins';
  end if;
  return coalesce(nullif(pg_catalog.trim(p_responder_name), ''), 'Responder') || ' wins';
end;
$$;

revoke all on function private.rich_preview_result_score_label(text, jsonb) from public, anon, authenticated;
revoke all on function private.rich_preview_result_verdict(text, jsonb, jsonb, text, text) from public, anon, authenticated;

-- Wrap the validated v2 ranking synchronizer so movement evidence is captured
-- before its canonical snapshot is replaced.
alter function public.sync_ranking_whats_new(text, jsonb, jsonb) set schema private;
alter function private.sync_ranking_whats_new(text, jsonb, jsonb)
  rename to sync_ranking_whats_new_v2_core;
revoke all on function private.sync_ranking_whats_new_v2_core(text, jsonb, jsonb)
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
  v_source_sha text := lower(pg_catalog.trim(p_source_sha));
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
        lower(pg_catalog.trim(row_data.slug)) as fighter_slug,
        pg_catalog.trim(row_data.name) as fighter_name,
        lower(pg_catalog.trim(row_data.board)) as board,
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
    set route = '/rankings?update=' || v_source_sha
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

create or replace function public.get_rich_preview_data(
  p_kind text,
  p_key text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_kind text := lower(pg_catalog.trim(p_kind));
  v_key text := pg_catalog.trim(p_key);
  v_result jsonb;
  v_challenge record;
begin
  if v_kind = 'challenge' then
    if upper(v_key) !~ '^[A-Z0-9]{8}$' then
      return null;
    end if;

    select
      challenge.*,
      creator.display_name as creator_name,
      responder.display_name as responder_name
    into v_challenge
    from public.play_challenges challenge
    join public.profiles creator on creator.id = challenge.creator_id
    join public.profiles responder on responder.id = challenge.recipient_id
    where challenge.code = upper(v_key)
      and (challenge.creator_hidden_at is null or challenge.recipient_hidden_at is null)
    limit 1;

    if not found then
      return null;
    end if;

    if v_challenge.completed_at is not null and v_challenge.responder_result is not null then
      return pg_catalog.jsonb_build_object(
        'kind', 'game-result',
        'game_id', v_challenge.game_id,
        'game_title', v_challenge.game_title,
        'summary', v_challenge.summary,
        'creator_name', v_challenge.creator_name,
        'responder_name', v_challenge.responder_name,
        'creator_score', private.rich_preview_result_score_label(v_challenge.game_id, v_challenge.creator_result),
        'responder_score', private.rich_preview_result_score_label(v_challenge.game_id, v_challenge.responder_result),
        'verdict', private.rich_preview_result_verdict(
          v_challenge.game_id,
          v_challenge.creator_result,
          v_challenge.responder_result,
          v_challenge.creator_name,
          v_challenge.responder_name
        )
      );
    end if;

    return pg_catalog.jsonb_build_object(
      'kind', 'challenge',
      'game_id', v_challenge.game_id,
      'game_title', v_challenge.game_title,
      'summary', v_challenge.summary
    );
  elsif v_kind = 'picks-recap' then
    if v_key !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
      return null;
    end if;

    with event_row as (
      select event.*
      from public.pick_events event
      where event.event_id = lower(v_key)
        and event.status = 'complete'
      limit 1
    ), entrants as (
      select distinct pick.profile_id
      from public.profile_event_picks pick
      join event_row event on event.event_id = pick.event_id
    ), scored as (
      select
        entrant.profile_id,
        profile.display_name,
        bout.bout_id,
        bout.result_status,
        bout.winner_fighter_slug,
        pick.fighter_slug as picked_fighter_slug,
        lock.bout_id = bout.bout_id
          and lock.fighter_slug = pick.fighter_slug
          and lock.fighter_slug = bout.winner_fighter_slug as lock_won,
        lock.frozen_american_odds
      from entrants entrant
      join public.profiles profile on profile.id = entrant.profile_id
      join event_row event on true
      join public.pick_bouts bout on bout.event_id = event.event_id
      left join public.profile_event_picks pick
        on pick.profile_id = entrant.profile_id
       and pick.event_id = bout.event_id
       and pick.bout_id = bout.bout_id
      left join public.profile_event_underdog_locks lock
        on lock.profile_id = entrant.profile_id
       and lock.event_id = bout.event_id
      where coalesce(bout.included_in_picks, true)
    ), grouped as (
      select
        profile_id,
        display_name,
        count(*) filter (
          where result_status in ('red_win', 'blue_win')
            and picked_fighter_slug = winner_fighter_slug
        )::integer as correct,
        count(*) filter (
          where result_status in ('red_win', 'blue_win')
            and picked_fighter_slug is not null
            and picked_fighter_slug <> winner_fighter_slug
        )::integer as incorrect,
        count(*) filter (
          where result_status in ('red_win', 'blue_win')
            and picked_fighter_slug is null
        )::integer as missing,
        coalesce(pg_catalog.sum(public.pick_underdog_bonus(frozen_american_odds)) filter (where lock_won), 0)::integer as lock_bonus
      from scored
      group by profile_id, display_name
    ), totals as (
      select
        grouped.*,
        grouped.correct * 4 as base_points,
        grouped.correct * 4 + grouped.lock_bonus as total_points
      from grouped
    ), ranked as (
      select
        totals.*,
        pg_catalog.dense_rank() over (
          order by totals.total_points desc, totals.correct desc
        )::integer as ranking_position
      from totals
    ), leaders as (
      select * from ranked where ranking_position = 1
    )
    select pg_catalog.jsonb_build_object(
      'kind', 'picks-recap',
      'event_id', event.event_id,
      'event_name', event.name,
      'subtitle', event.subtitle,
      'entrant_count', (select count(*)::integer from entrants),
      'leaders', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'display_name', leader.display_name,
            'correct', leader.correct,
            'incorrect', leader.incorrect,
            'missing', leader.missing,
            'total_points', leader.total_points
          )
          order by leader.display_name
        )
        from leaders leader
      ), '[]'::jsonb),
      'main_event', (
        select pg_catalog.jsonb_build_object(
          'red_fighter_slug', bout.red_fighter_slug,
          'red_fighter_name', bout.red_fighter_name,
          'blue_fighter_slug', bout.blue_fighter_slug,
          'blue_fighter_name', bout.blue_fighter_name
        )
        from public.pick_bouts bout
        where bout.event_id = event.event_id
        order by bout.position
        limit 1
      )
    ) into v_result
    from event_row event;

    return v_result;
  elsif v_kind = 'major-ranking-update' then
    if lower(v_key) !~ '^[0-9a-f]{40}$' then
      return null;
    end if;

    select pg_catalog.jsonb_build_object(
      'kind', 'major-ranking-update',
      'source_sha', preview.source_sha,
      'title', item.title,
      'summary', item.summary,
      'movement_count', preview.movement_count,
      'movements', preview.movements
    ) into v_result
    from private.rich_preview_major_ranking_updates preview
    join private.whats_new_items item
      on item.source_key = 'rankings:major:' || preview.source_sha
     and item.kind = 'major_ranking_update'
    where preview.source_sha = lower(v_key)
    limit 1;

    return v_result;
  end if;

  return null;
end;
$$;

revoke all on function public.get_rich_preview_data(text, text) from public;
grant execute on function public.get_rich_preview_data(text, text) to anon, authenticated;

comment on function public.get_rich_preview_data(text, text) is
  'Returns only the small public projection required to render an explicitly shared Octagon HQ rich preview.';
comment on function public.sync_ranking_whats_new(text, jsonb, jsonb) is
  'Synchronizes Rankings and Fighters to Watch, captures major-movement preview evidence, and returns contract version 3.';

notify pgrst, 'reload schema';
