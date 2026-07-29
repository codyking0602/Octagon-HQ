begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_sha_a text := repeat('a', 40);
  v_sha_b text := repeat('b', 40);
  v_sha_c text := repeat('c', 40);
  v_result jsonb;
  v_rows jsonb;
begin
  delete from private.ranking_whats_new_snapshot;

  v_rows := jsonb_build_array(
    jsonb_build_object('slug', 'alpha', 'name', 'Alpha', 'board', 'men', 'rank', 1),
    jsonb_build_object('slug', 'bravo', 'name', 'Bravo', 'board', 'men', 'rank', 2),
    jsonb_build_object('slug', 'charlie', 'name', 'Charlie', 'board', 'men', 'rank', 3),
    jsonb_build_object('slug', 'delta', 'name', 'Delta', 'board', 'men', 'rank', 4),
    jsonb_build_object('slug', 'echo', 'name', 'Echo', 'board', 'men', 'rank', 5),
    jsonb_build_object('slug', 'golf', 'name', 'Golf', 'board', 'women', 'rank', 1),
    jsonb_build_object('slug', 'hotel', 'name', 'Hotel', 'board', 'women', 'rank', 2)
  );

  v_result := public.sync_ranking_whats_new(v_sha_a, v_rows);

  if (v_result->>'baseline_created')::boolean is not true
    or (v_result->>'fighter_count')::integer <> 7
    or (v_result->>'new_fighters_published')::integer <> 0
    or (v_result->>'ranking_movements_published')::integer <> 0 then
    raise exception 'initial Rankings sync did not create a quiet baseline: %', v_result;
  end if;

  if exists (
    select 1 from private.whats_new_items item
    where item.source_key like 'rankings:%:' || v_sha_a || ':%'
  ) then
    raise exception 'initial Rankings baseline flooded What''s New';
  end if;

  v_rows := jsonb_build_array(
    jsonb_build_object('slug', 'delta', 'name', 'Delta', 'board', 'men', 'rank', 1),
    jsonb_build_object('slug', 'alpha', 'name', 'Alpha', 'board', 'men', 'rank', 2),
    jsonb_build_object('slug', 'foxtrot', 'name', 'Foxtrot', 'board', 'men', 'rank', 3),
    jsonb_build_object('slug', 'bravo', 'name', 'Bravo', 'board', 'men', 'rank', 4),
    jsonb_build_object('slug', 'charlie', 'name', 'Charlie', 'board', 'men', 'rank', 5),
    jsonb_build_object('slug', 'echo', 'name', 'Echo', 'board', 'men', 'rank', 6),
    jsonb_build_object('slug', 'golf', 'name', 'Golf', 'board', 'women', 'rank', 1),
    jsonb_build_object('slug', 'hotel', 'name', 'Hotel', 'board', 'women', 'rank', 2)
  );

  v_result := public.sync_ranking_whats_new(v_sha_b, v_rows);

  if (v_result->>'baseline_created')::boolean is true
    or (v_result->>'new_fighters_published')::integer <> 1
    or (v_result->>'ranking_movements_published')::integer <> 1 then
    raise exception 'meaningful Rankings changes were not published correctly: %', v_result;
  end if;

  if not exists (
    select 1
    from private.whats_new_items item
    where item.source_key = 'rankings:new-fighter:' || v_sha_b || ':foxtrot'
      and item.kind = 'new_fighter'
      and item.category = 'fighters'
      and item.title = 'Foxtrot joined the rankings'
      and item.summary = 'Now ranked #3 on the UFC Men''s GOAT board.'
      and item.route = '/fighters/foxtrot'
      and item.action_label = 'VIEW FIGHTER'
  ) then
    raise exception 'new fighter update was not published correctly';
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
      'rankings:movement:' || v_sha_b || ':echo'
    )
  ) then
    raise exception 'one- or two-position ranking movement created feed noise';
  end if;

  v_result := public.sync_ranking_whats_new(v_sha_b, v_rows);
  if (v_result->>'new_fighters_published')::integer <> 0
    or (v_result->>'ranking_movements_published')::integer <> 0 then
    raise exception 'unchanged Rankings snapshot republished feed items: %', v_result;
  end if;

  if (
    select count(*)
    from private.whats_new_items item
    where item.source_key in (
      'rankings:new-fighter:' || v_sha_b || ':foxtrot',
      'rankings:movement:' || v_sha_b || ':delta'
    )
  ) <> 2 then
    raise exception 'idempotent Rankings sync created duplicate items';
  end if;

  v_rows := jsonb_build_array(
    jsonb_build_object('slug', 'bravo', 'name', 'Bravo', 'board', 'men', 'rank', 1),
    jsonb_build_object('slug', 'alpha', 'name', 'Alpha', 'board', 'men', 'rank', 2),
    jsonb_build_object('slug', 'foxtrot', 'name', 'Foxtrot', 'board', 'men', 'rank', 3),
    jsonb_build_object('slug', 'delta', 'name', 'Delta', 'board', 'men', 'rank', 4),
    jsonb_build_object('slug', 'charlie', 'name', 'Charlie', 'board', 'men', 'rank', 5),
    jsonb_build_object('slug', 'echo', 'name', 'Echo', 'board', 'men', 'rank', 6),
    jsonb_build_object('slug', 'golf', 'name', 'Golf', 'board', 'women', 'rank', 1),
    jsonb_build_object('slug', 'hotel', 'name', 'Hotel', 'board', 'women', 'rank', 2)
  );

  v_result := public.sync_ranking_whats_new(v_sha_c, v_rows);
  if (v_result->>'new_fighters_published')::integer <> 0
    or (v_result->>'ranking_movements_published')::integer <> 2 then
    raise exception 'upward and downward three-position moves were not both published: %', v_result;
  end if;

  if not exists (
    select 1
    from private.whats_new_items item
    where item.source_key = 'rankings:movement:' || v_sha_c || ':delta'
      and item.title = 'Delta moved down to #4'
      and item.summary = 'Down 3 spots from #1 to #4 on the UFC Men''s GOAT board.'
  ) then
    raise exception 'downward ranking movement copy is incorrect';
  end if;

  if (select count(*) from private.ranking_whats_new_snapshot) <> 8
    or not exists (
      select 1
      from private.ranking_whats_new_snapshot snapshot
      where snapshot.fighter_slug = 'bravo'
        and snapshot.ranking_position = 1
        and snapshot.source_sha = v_sha_c
    ) then
    raise exception 'canonical Rankings snapshot was not replaced by the latest source';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  begin
    perform public.sync_ranking_whats_new(v_sha_c, v_rows);
    raise exception 'authenticated role synchronized Rankings into What''s New';
  exception when others then
    if sqlerrm not like '%not allowed%' then raise; end if;
  end;

  if has_table_privilege('authenticated', 'private.ranking_whats_new_snapshot', 'SELECT') then
    raise exception 'authenticated role can read the private Rankings snapshot';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.sync_ranking_whats_new(text,jsonb)',
    'EXECUTE'
  ) then
    raise exception 'authenticated role can execute the Rankings What''s New sync';
  end if;
end $$;

rollback;
