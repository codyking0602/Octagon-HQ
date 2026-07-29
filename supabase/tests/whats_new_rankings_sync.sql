begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_sha_a text := repeat('a', 40);
  v_sha_b text := repeat('b', 40);
  v_sha_c text := repeat('c', 40);
  v_result jsonb;
  v_rows jsonb;
  v_watchlist jsonb;
begin
  delete from private.ranking_whats_new_snapshot;
  delete from private.fighters_to_watch_whats_new_snapshot;
  delete from private.whats_new_items
  where source_key like 'rankings:%:' || v_sha_a || '%'
     or source_key like 'rankings:%:' || v_sha_b || '%'
     or source_key like 'rankings:%:' || v_sha_c || '%'
     or source_key like 'fighters-to-watch:%:' || v_sha_a || '%'
     or source_key like 'fighters-to-watch:%:' || v_sha_b || '%'
     or source_key like 'fighters-to-watch:%:' || v_sha_c || '%';

  v_rows := jsonb_build_array(
    jsonb_build_object('slug', 'alpha', 'name', 'Alpha', 'board', 'men', 'rank', 1),
    jsonb_build_object('slug', 'bravo', 'name', 'Bravo', 'board', 'men', 'rank', 2),
    jsonb_build_object('slug', 'charlie', 'name', 'Charlie', 'board', 'men', 'rank', 3),
    jsonb_build_object('slug', 'delta', 'name', 'Delta', 'board', 'men', 'rank', 4),
    jsonb_build_object('slug', 'echo', 'name', 'Echo', 'board', 'men', 'rank', 5),
    jsonb_build_object('slug', 'foxtrot', 'name', 'Foxtrot', 'board', 'men', 'rank', 6),
    jsonb_build_object('slug', 'golf', 'name', 'Golf', 'board', 'men', 'rank', 7),
    jsonb_build_object('slug', 'hotel', 'name', 'Hotel', 'board', 'men', 'rank', 8),
    jsonb_build_object('slug', 'india', 'name', 'India', 'board', 'women', 'rank', 1),
    jsonb_build_object('slug', 'juliet', 'name', 'Juliet', 'board', 'women', 'rank', 2)
  );
  v_watchlist := jsonb_build_array(
    jsonb_build_object('id', 'watch-alpha', 'name', 'Watch Alpha', 'note', 'The first scouting note.'),
    jsonb_build_object('id', 'watch-bravo', 'name', 'Watch Bravo', 'note', 'The second scouting note.')
  );

  v_result := public.sync_ranking_whats_new(v_sha_a, v_rows, v_watchlist);

  if (v_result->>'ranking_baseline_created')::boolean is not true
    or (v_result->>'watchlist_baseline_created')::boolean is not true
    or (v_result->>'fighter_count')::integer <> 10
    or (v_result->>'watchlist_count')::integer <> 2
    or (v_result->>'new_fighters_published')::integer <> 0
    or (v_result->>'meaningful_movements_detected')::integer <> 0
    or (v_result->>'ranking_movements_published')::integer <> 0
    or (v_result->>'major_ranking_updates_published')::integer <> 0
    or (v_result->>'fighters_to_watch_published')::integer <> 0 then
    raise exception 'initial Rankings and Fighters sync did not create quiet baselines: %', v_result;
  end if;

  if exists (
    select 1 from private.whats_new_items item
    where item.source_key like '%:' || v_sha_a || ':%'
       or item.source_key = 'rankings:major:' || v_sha_a
  ) then
    raise exception 'initial Rankings and Fighters baseline flooded What''s New';
  end if;

  v_rows := jsonb_build_array(
    jsonb_build_object('slug', 'delta', 'name', 'Delta', 'board', 'men', 'rank', 1),
    jsonb_build_object('slug', 'alpha', 'name', 'Alpha', 'board', 'men', 'rank', 2),
    jsonb_build_object('slug', 'bravo', 'name', 'Bravo', 'board', 'men', 'rank', 3),
    jsonb_build_object('slug', 'charlie', 'name', 'Charlie', 'board', 'men', 'rank', 4),
    jsonb_build_object('slug', 'kilo', 'name', 'Kilo', 'board', 'men', 'rank', 5),
    jsonb_build_object('slug', 'echo', 'name', 'Echo', 'board', 'men', 'rank', 6),
    jsonb_build_object('slug', 'foxtrot', 'name', 'Foxtrot', 'board', 'men', 'rank', 7),
    jsonb_build_object('slug', 'golf', 'name', 'Golf', 'board', 'men', 'rank', 8),
    jsonb_build_object('slug', 'hotel', 'name', 'Hotel', 'board', 'men', 'rank', 9),
    jsonb_build_object('slug', 'india', 'name', 'India', 'board', 'women', 'rank', 1),
    jsonb_build_object('slug', 'juliet', 'name', 'Juliet', 'board', 'women', 'rank', 2)
  );
  v_watchlist := jsonb_build_array(
    jsonb_build_object('id', 'watch-alpha', 'name', 'Watch Alpha', 'note', 'The first scouting note.'),
    jsonb_build_object('id', 'watch-bravo', 'name', 'Watch Bravo', 'note', 'The second scouting note.'),
    jsonb_build_object('id', 'watch-charlie', 'name', 'Watch Charlie', 'note', 'A new prospect with real finishing upside.')
  );

  v_result := public.sync_ranking_whats_new(v_sha_b, v_rows, v_watchlist);

  if (v_result->>'ranking_baseline_created')::boolean is true
    or (v_result->>'watchlist_baseline_created')::boolean is true
    or (v_result->>'new_fighters_published')::integer <> 1
    or (v_result->>'meaningful_movements_detected')::integer <> 1
    or (v_result->>'ranking_movements_published')::integer <> 1
    or (v_result->>'major_ranking_updates_published')::integer <> 0
    or (v_result->>'fighters_to_watch_published')::integer <> 1 then
    raise exception 'meaningful Rankings and Fighters changes were not published correctly: %', v_result;
  end if;

  if not exists (
    select 1
    from private.whats_new_items item
    where item.source_key = 'rankings:new-fighter:' || v_sha_b || ':kilo'
      and item.kind = 'new_fighter'
      and item.category = 'fighters'
      and item.title = 'Kilo joined the rankings'
      and item.summary = 'Now ranked #5 on the UFC Men''s GOAT board.'
      and item.route = '/fighters/kilo'
      and item.action_label = 'VIEW FIGHTER'
  ) then
    raise exception 'new ranked fighter update was not published correctly';
  end if;

  if not exists (
    select 1
    from private.whats_new_items item
    where item.source_key = 'rankings:movement:' || v_sha_b || ':delta'
      and item.kind = 'ranking_movement'
      and item.category = 'rankings'
      and item.title = 'Delta moved up to #1'
      and item.summary = 'Up 3 spots from #4 to #1 on the UFC Men''s GOAT board.'
      and item.route = '/fighters/delta'
      and item.action_label = 'VIEW FIGHTER'
  ) then
    raise exception 'three-position ranking movement was not published correctly';
  end if;

  if exists (
    select 1
    from private.whats_new_items item
    where item.source_key in (
      'rankings:movement:' || v_sha_b || ':alpha',
      'rankings:movement:' || v_sha_b || ':bravo',
      'rankings:movement:' || v_sha_b || ':charlie',
      'rankings:movement:' || v_sha_b || ':echo',
      'rankings:movement:' || v_sha_b || ':foxtrot',
      'rankings:movement:' || v_sha_b || ':golf',
      'rankings:movement:' || v_sha_b || ':hotel'
    )
  ) then
    raise exception 'one- or two-position ranking movement created feed noise';
  end if;

  if not exists (
    select 1
    from private.whats_new_items item
    where item.source_key = 'fighters-to-watch:new:' || v_sha_b || ':watch-charlie'
      and item.kind = 'fighters_to_watch'
      and item.category = 'fighters'
      and item.title = 'Watch Charlie added to Fighters to Watch'
      and item.summary = 'A new prospect with real finishing upside.'
      and item.route = '/#shanes-watchlist'
      and item.action_label = 'VIEW WATCHLIST'
  ) then
    raise exception 'new Fighters to Watch update was not published correctly';
  end if;

  v_result := public.sync_ranking_whats_new(v_sha_b, v_rows, v_watchlist);
  if (v_result->>'new_fighters_published')::integer <> 0
    or (v_result->>'meaningful_movements_detected')::integer <> 0
    or (v_result->>'ranking_movements_published')::integer <> 0
    or (v_result->>'major_ranking_updates_published')::integer <> 0
    or (v_result->>'fighters_to_watch_published')::integer <> 0 then
    raise exception 'unchanged Rankings and Fighters snapshot republished feed items: %', v_result;
  end if;

  if (
    select count(*)
    from private.whats_new_items item
    where item.source_key in (
      'rankings:new-fighter:' || v_sha_b || ':kilo',
      'rankings:movement:' || v_sha_b || ':delta',
      'fighters-to-watch:new:' || v_sha_b || ':watch-charlie'
    )
  ) <> 3 then
    raise exception 'idempotent Rankings and Fighters sync created duplicate items';
  end if;

  v_rows := jsonb_build_array(
    jsonb_build_object('slug', 'hotel', 'name', 'Hotel', 'board', 'men', 'rank', 1),
    jsonb_build_object('slug', 'golf', 'name', 'Golf', 'board', 'men', 'rank', 2),
    jsonb_build_object('slug', 'foxtrot', 'name', 'Foxtrot', 'board', 'men', 'rank', 3),
    jsonb_build_object('slug', 'echo', 'name', 'Echo', 'board', 'men', 'rank', 4),
    jsonb_build_object('slug', 'kilo', 'name', 'Kilo', 'board', 'men', 'rank', 5),
    jsonb_build_object('slug', 'charlie', 'name', 'Charlie', 'board', 'men', 'rank', 6),
    jsonb_build_object('slug', 'bravo', 'name', 'Bravo', 'board', 'men', 'rank', 7),
    jsonb_build_object('slug', 'alpha', 'name', 'Alpha', 'board', 'men', 'rank', 8),
    jsonb_build_object('slug', 'delta', 'name', 'Delta', 'board', 'men', 'rank', 9),
    jsonb_build_object('slug', 'india', 'name', 'India', 'board', 'women', 'rank', 1),
    jsonb_build_object('slug', 'juliet', 'name', 'Juliet', 'board', 'women', 'rank', 2)
  );

  v_result := public.sync_ranking_whats_new(v_sha_c, v_rows, v_watchlist);
  if (v_result->>'new_fighters_published')::integer <> 0
    or (v_result->>'meaningful_movements_detected')::integer <> 6
    or (v_result->>'ranking_movements_published')::integer <> 0
    or (v_result->>'major_ranking_updates_published')::integer <> 1
    or (v_result->>'fighters_to_watch_published')::integer <> 0 then
    raise exception 'major Rankings shakeup was not consolidated correctly: %', v_result;
  end if;

  if not exists (
    select 1
    from private.whats_new_items item
    where item.source_key = 'rankings:major:' || v_sha_c
      and item.kind = 'major_ranking_update'
      and item.category = 'rankings'
      and item.title = 'The UFC GOAT rankings had a major shakeup'
      and item.summary = '6 fighters moved three or more spots across the UFC GOAT boards.'
      and item.route = '/rankings'
      and item.action_label = 'VIEW RANKINGS'
  ) then
    raise exception 'major ranking update summary was not published correctly';
  end if;

  if exists (
    select 1
    from private.whats_new_items item
    where item.source_key like 'rankings:movement:' || v_sha_c || ':%'
  ) then
    raise exception 'major ranking update also published duplicate individual movement cards';
  end if;

  if (select count(*) from private.ranking_whats_new_snapshot) <> 11
    or not exists (
      select 1
      from private.ranking_whats_new_snapshot snapshot
      where snapshot.fighter_slug = 'hotel'
        and snapshot.ranking_position = 1
        and snapshot.source_sha = v_sha_c
    ) then
    raise exception 'canonical Rankings comparison snapshot was not replaced by the latest source';
  end if;

  if (select count(*) from private.fighters_to_watch_whats_new_snapshot) <> 3
    or not exists (
      select 1
      from private.fighters_to_watch_whats_new_snapshot snapshot
      where snapshot.watch_id = 'watch-charlie'
        and snapshot.source_sha = v_sha_c
    ) then
    raise exception 'canonical Fighters to Watch comparison snapshot was not replaced by the latest source';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  begin
    perform public.sync_ranking_whats_new(v_sha_c, v_rows, v_watchlist);
    raise exception 'authenticated role synchronized Rankings and Fighters into What''s New';
  exception when others then
    if sqlerrm not like '%not allowed%' then raise; end if;
  end;

  if has_table_privilege('authenticated', 'private.ranking_whats_new_snapshot', 'SELECT')
    or has_table_privilege('authenticated', 'private.fighters_to_watch_whats_new_snapshot', 'SELECT') then
    raise exception 'authenticated role can read a private What''s New comparison snapshot';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.sync_ranking_whats_new(text,jsonb,jsonb)',
    'EXECUTE'
  ) then
    raise exception 'authenticated role can execute the Rankings and Fighters What''s New sync';
  end if;
end $$;

rollback;
