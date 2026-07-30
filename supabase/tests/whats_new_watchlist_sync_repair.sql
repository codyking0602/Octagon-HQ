begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_sha_a text := repeat('a', 40);
  v_sha_b text := repeat('b', 40);
  v_sha_c text := repeat('c', 40);
  v_rankings jsonb := jsonb_build_array(
    jsonb_build_object('slug', 'test-man', 'name', 'Test Man', 'board', 'men', 'rank', 1),
    jsonb_build_object('slug', 'test-woman', 'name', 'Test Woman', 'board', 'women', 'rank', 1)
  );
  v_watchlist jsonb;
  v_result jsonb;
begin
  delete from private.ranking_whats_new_snapshot;
  delete from private.fighters_to_watch_whats_new_snapshot;
  delete from private.fighters_to_watch_whats_new_seen;
  delete from private.whats_new_items
  where source_key like 'fighters-to-watch:new:%'
     or source_key like 'rankings:new-fighter:%'
     or source_key like 'rankings:movement:%'
     or source_key like 'rankings:major:%';

  insert into private.fighters_to_watch_whats_new_seen(
    watch_id,
    fighter_name,
    first_seen_sha,
    first_seen_at
  ) values (
    'existing-prospect',
    'Existing Prospect',
    v_sha_a,
    now() - interval '1 day'
  );

  -- Reproduce the production failure: the disposable snapshot already contains Gable,
  -- but the durable rollout ledger has never seen or announced him.
  insert into private.fighters_to_watch_whats_new_snapshot(
    watch_id,
    fighter_name,
    source_sha,
    synced_at
  ) values
    ('existing-prospect', 'Existing Prospect', v_sha_a, now() - interval '1 day'),
    ('gable-steveson', 'Gable Steveson', v_sha_a, now() - interval '1 day');

  v_watchlist := jsonb_build_array(
    jsonb_build_object(
      'id', 'existing-prospect',
      'name', 'Existing Prospect',
      'note', 'Already part of the historical rollout baseline.'
    ),
    jsonb_build_object(
      'id', 'gable-steveson',
      'name', 'Gable Steveson',
      'note', 'Olympic wrestling with heavyweight explosiveness.'
    )
  );

  v_result := public.sync_ranking_whats_new(v_sha_b, v_rankings, v_watchlist);

  if (v_result ->> 'sync_contract_version')::integer <> 2 then
    raise exception 'repaired watchlist sync did not return contract version 2';
  end if;

  if (v_result ->> 'fighters_to_watch_published')::integer <> 1 then
    raise exception 'Gable backfill did not publish exactly one Fighters to Watch item';
  end if;

  if not exists (
    select 1
    from private.whats_new_items
    where source_key = 'fighters-to-watch:new:gable-steveson'
      and kind = 'fighters_to_watch'
      and route = '/fighters-to-watch'
  ) then
    raise exception 'Gable Fighters to Watch backfill was not published correctly';
  end if;

  if exists (
    select 1
    from private.whats_new_items
    where source_key = 'fighters-to-watch:new:existing-prospect'
  ) then
    raise exception 'historical Fighters to Watch baseline was incorrectly announced';
  end if;

  if not exists (
    select 1
    from private.fighters_to_watch_whats_new_seen
    where watch_id = 'gable-steveson'
  ) then
    raise exception 'Gable was not retained in durable watchlist seen evidence';
  end if;

  -- Reproduce a later stale/failed deployment: a new ID reaches the disposable snapshot
  -- before the synchronizer gets a successful exact-main run. The durable ledger must
  -- still identify and announce the new fighter.
  insert into private.fighters_to_watch_whats_new_snapshot(
    watch_id,
    fighter_name,
    source_sha,
    synced_at
  ) values (
    'future-prospect',
    'Future Prospect',
    v_sha_b,
    now()
  ) on conflict (watch_id) do nothing;

  v_watchlist := v_watchlist || jsonb_build_array(
    jsonb_build_object(
      'id', 'future-prospect',
      'name', 'Future Prospect',
      'note', 'A newly added prospect after a skipped deployment.'
    )
  );

  v_result := public.sync_ranking_whats_new(v_sha_c, v_rankings, v_watchlist);

  if (v_result ->> 'fighters_to_watch_published')::integer <> 1 then
    raise exception 'delayed watchlist sync swallowed a new fighter already present in the snapshot';
  end if;

  if not exists (
    select 1
    from private.whats_new_items
    where source_key = 'fighters-to-watch:new:future-prospect'
  ) then
    raise exception 'future Fighters to Watch addition was not published after delayed sync';
  end if;

  perform public.sync_ranking_whats_new(repeat('d', 40), v_rankings, v_watchlist);

  if (
    select count(*)
    from private.whats_new_items
    where source_key in (
      'fighters-to-watch:new:gable-steveson',
      'fighters-to-watch:new:future-prospect'
    )
  ) <> 2 then
    raise exception 'idempotent repaired watchlist sync created duplicate items';
  end if;
end;
$$;

select set_config('request.jwt.claim.role', 'authenticated', true);

do $$
begin
  begin
    perform public.sync_ranking_whats_new(
      repeat('e', 40),
      jsonb_build_array(
        jsonb_build_object('slug', 'test-man', 'name', 'Test Man', 'board', 'men', 'rank', 1),
        jsonb_build_object('slug', 'test-woman', 'name', 'Test Woman', 'board', 'women', 'rank', 1)
      ),
      '[]'::jsonb
    );
    raise exception 'authenticated role can execute the repaired Rankings and Fighters What''s New sync';
  exception
    when others then
      if sqlerrm = 'authenticated role can execute the repaired Rankings and Fighters What''s New sync' then
        raise;
      end if;
  end;
end;
$$;

rollback;
