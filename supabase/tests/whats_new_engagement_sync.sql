begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_sha_a text := repeat('d', 40);
  v_sha_b text := repeat('e', 40);
  v_sha_c text := repeat('f', 40);
  v_games jsonb;
  v_challenges jsonb;
  v_achievements jsonb;
  v_result jsonb;
begin
  delete from private.game_whats_new_snapshot;
  delete from private.challenge_whats_new_snapshot;
  delete from private.achievement_whats_new_snapshot;
  delete from private.whats_new_items
  where source_key like 'games:new:%'
     or source_key like 'challenges:new:%'
     or source_key like 'achievements:new:%';

  v_games := jsonb_build_array(
    jsonb_build_object(
      'id', 'find-leader',
      'title', 'Find the Leader',
      'summary', 'Leave the category leader standing.',
      'route', '/play/find-leader'
    ),
    jsonb_build_object(
      'id', 'wavelength',
      'title', 'Wavelength',
      'summary', 'Find the hidden UFC rating.',
      'route', '/play/wavelength'
    )
  );
  v_challenges := '[]'::jsonb;
  v_achievements := '[]'::jsonb;

  v_result := public.sync_engagement_whats_new(
    v_sha_a,
    v_games,
    v_challenges,
    v_achievements
  );

  if (v_result->>'game_baseline_created')::boolean is not true
    or (v_result->>'challenge_baseline_created')::boolean is not true
    or (v_result->>'achievement_baseline_created')::boolean is not true
    or (v_result->>'new_games_published')::integer <> 0
    or (v_result->>'new_challenges_published')::integer <> 0
    or (v_result->>'new_achievements_published')::integer <> 0 then
    raise exception 'initial engagement sync did not create quiet baselines: %', v_result;
  end if;

  if exists (
    select 1 from private.whats_new_items item
    where item.source_key like '%' || v_sha_a || '%'
  ) then
    raise exception 'initial engagement baseline flooded What''s New';
  end if;

  v_games := v_games || jsonb_build_array(
    jsonb_build_object(
      'id', 'fight-grid',
      'title', 'Fight Grid',
      'summary', 'Complete a UFC fighter grid with one valid answer per square.',
      'route', '/play/fight-grid'
    )
  );
  v_challenges := jsonb_build_array(
    jsonb_build_object(
      'id', 'weekly-gauntlet',
      'title', 'Weekly Gauntlet is live',
      'summary', 'A permanent weekly multi-game challenge is now available.',
      'route', '/play#challenge-center',
      'action_label', 'VIEW CHALLENGE'
    )
  );
  v_achievements := jsonb_build_array(
    jsonb_build_object(
      'id', 'perfect-card',
      'title', 'Perfect Card badge added',
      'summary', 'Finish an official Picks card without a miss to earn it.',
      'route', '/profile',
      'action_label', 'VIEW BADGES'
    )
  );

  v_result := public.sync_engagement_whats_new(
    v_sha_b,
    v_games,
    v_challenges,
    v_achievements
  );

  if (v_result->>'game_baseline_created')::boolean is true
    or (v_result->>'challenge_baseline_created')::boolean is true
    or (v_result->>'achievement_baseline_created')::boolean is true
    or (v_result->>'new_games_published')::integer <> 1
    or (v_result->>'new_challenges_published')::integer <> 1
    or (v_result->>'new_achievements_published')::integer <> 1 then
    raise exception 'meaningful engagement additions were not published correctly: %', v_result;
  end if;

  if not exists (
    select 1 from private.whats_new_items item
    where item.source_key = 'games:new:' || v_sha_b || ':fight-grid'
      and item.kind = 'new_game'
      and item.category = 'games'
      and item.title = 'Fight Grid is now playable'
      and item.route = '/play/fight-grid'
      and item.action_label = 'PLAY GAME'
  ) then
    raise exception 'new game update was not published correctly';
  end if;

  if not exists (
    select 1 from private.whats_new_items item
    where item.source_key = 'challenges:new:' || v_sha_b || ':weekly-gauntlet'
      and item.kind = 'new_challenge'
      and item.category = 'challenges'
      and item.title = 'Weekly Gauntlet is live'
      and item.route = '/play#challenge-center'
      and item.action_label = 'VIEW CHALLENGE'
  ) then
    raise exception 'new app-level challenge update was not published correctly';
  end if;

  if not exists (
    select 1 from private.whats_new_items item
    where item.source_key = 'achievements:new:' || v_sha_b || ':perfect-card'
      and item.kind = 'achievement'
      and item.category = 'community'
      and item.title = 'Perfect Card badge added'
      and item.route = '/profile'
      and item.action_label = 'VIEW BADGES'
  ) then
    raise exception 'new meaningful achievement update was not published correctly';
  end if;

  v_result := public.sync_engagement_whats_new(
    v_sha_b,
    v_games,
    v_challenges,
    v_achievements
  );

  if (v_result->>'new_games_published')::integer <> 0
    or (v_result->>'new_challenges_published')::integer <> 0
    or (v_result->>'new_achievements_published')::integer <> 0 then
    raise exception 'unchanged engagement snapshot republished items: %', v_result;
  end if;

  if (
    select count(*) from private.whats_new_items item
    where item.source_key in (
      'games:new:' || v_sha_b || ':fight-grid',
      'challenges:new:' || v_sha_b || ':weekly-gauntlet',
      'achievements:new:' || v_sha_b || ':perfect-card'
    )
  ) <> 3 then
    raise exception 'idempotent engagement sync created duplicate items';
  end if;

  v_games := jsonb_set(v_games, '{2,summary}', '"Updated wording only."'::jsonb);
  v_challenges := jsonb_set(v_challenges, '{0,summary}', '"Updated wording only."'::jsonb);
  v_achievements := jsonb_set(v_achievements, '{0,summary}', '"Updated wording only."'::jsonb);

  v_result := public.sync_engagement_whats_new(
    v_sha_c,
    v_games,
    v_challenges,
    v_achievements
  );

  if (v_result->>'new_games_published')::integer <> 0
    or (v_result->>'new_challenges_published')::integer <> 0
    or (v_result->>'new_achievements_published')::integer <> 0 then
    raise exception 'copy-only engagement edits created feed noise: %', v_result;
  end if;

  if (select count(*) from private.game_whats_new_snapshot) <> 3
    or (select count(*) from private.challenge_whats_new_snapshot) <> 1
    or (select count(*) from private.achievement_whats_new_snapshot) <> 1 then
    raise exception 'latest engagement snapshots were not replaced correctly';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  begin
    perform public.sync_engagement_whats_new(v_sha_c, v_games, v_challenges, v_achievements);
    raise exception 'authenticated role synchronized engagement into What''s New';
  exception when others then
    if sqlerrm not like '%not allowed%' then raise; end if;
  end;

  if has_table_privilege('authenticated', 'private.game_whats_new_snapshot', 'SELECT')
    or has_table_privilege('authenticated', 'private.challenge_whats_new_snapshot', 'SELECT')
    or has_table_privilege('authenticated', 'private.achievement_whats_new_snapshot', 'SELECT') then
    raise exception 'authenticated role can read private engagement snapshots';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.sync_engagement_whats_new(text,jsonb,jsonb,jsonb)',
    'EXECUTE'
  ) then
    raise exception 'authenticated role can execute the engagement What''s New sync';
  end if;
end $$;

rollback;
