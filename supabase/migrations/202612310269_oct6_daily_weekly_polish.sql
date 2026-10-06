-- Oct. 6 product polish:
-- 1) retire generic NFL Team-Seasons themes for future weeks,
-- 2) repair the already-exposed Oct. 6 labels without rerolling cards,
-- 3) accept the owner's semantically correct hot-route answer on today's
--    Average Fan setup and restore the score he would have banked.

create or replace function private.materialize_football_weekly_nfl_team_season_week(p_week_start date)
returns void
language plpgsql
security definer
set search_path=''
as $nfl_theme_week$
declare
  v_existing integer;
  v_attempt integer;
  v_def_slot integer;
  v_def_attempt integer;
  v_def_index integer;
  v_pick_index integer;
  v_day integer;
  v_slot integer;
  v_actual_day integer;
  v_family text;
  v_variant text;
  v_theme text;
  v_ref text;
  v_franchise text;
  v_conference text;
  v_priority_family text;
  v_history_franchise text;
  v_chosen boolean;
  v_family_counts jsonb;
  v_weekly_counts jsonb;
  v_used_labels text[];
  v_used_refs text[];
  v_day_franchises text[];
  v_selected_refs text[];
  v_def_families text[];
  v_def_variants text[];
  v_def_themes text[];
  v_final_days integer[];
  v_priority_order text[]:=array[
    'franchise_history','rivalry','division','season',
    'fell_short','era','conference_clash'
  ];
begin
  if extract(isodow from p_week_start)<>2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(p_week_start,'nfl-best-team-seasons-since-2000')
  on conflict(week_start) do nothing;

  if (select subject_key from private.football_weekly_auction_weeks where week_start=p_week_start)
    <>'nfl-best-team-seasons-since-2000'
  then
    raise exception 'NFL Team-Seasons materializer requires its subject week';
  end if;

  select count(*)::integer into v_existing
  from private.football_weekly_auction_board
  where week_start=p_week_start;

  if v_existing>=24 then return; end if;
  if v_existing<>0 then
    raise exception 'NFL Team-Seasons normal board is partial; refusing to reroll exposed cards';
  end if;

  -- Runtime mirrors the approved #1601 calibrated generator:
  -- weighted families with weekly caps, unique public labels, priority-ordered
  -- construction, distinct-franchise balancing where the theme permits it,
  -- exact team-season uniqueness, and weekly franchise exposure limits.
  <<attempt_loop>>
  for v_attempt in 1..300 loop
    delete from private.football_weekly_auction_board where week_start=p_week_start;
    delete from private.football_weekly_nfl_team_season_themes where week_start=p_week_start;

    v_family_counts:='{}'::jsonb;
    v_weekly_counts:='{}'::jsonb;
    v_used_labels:=array[]::text[];
    v_used_refs:=array[]::text[];
    v_def_families:=array[]::text[];
    v_def_variants:=array[]::text[];
    v_def_themes:=array[]::text[];
    v_history_franchise:=null;

    -- Choose six theme definitions using the calibrated weights/caps.
    for v_def_slot in 1..6 loop
      v_chosen:=false;

      for v_def_attempt in 1..100 loop
        v_family:=null;
        select weighted.family into v_family
        from (
          select family,weight,cap
          from (values
            ('division'::text,1.35::double precision,2),
            ('season',1.10,1),
            ('era',1.00,1),
            ('rivalry',1.15,1),
            ('franchise_history',0.90,1),
            ('fell_short',1.00,1),
            ('conference_clash',1.15,1)
          ) family_weights(family,weight,cap)
          where coalesce((v_family_counts->>family)::integer,0)<cap
          order by -ln(greatest(random(),0.000000000001))/weight
          limit 1
        ) weighted;

        if v_family is null then
          continue attempt_loop;
        end if;

        if v_family='division' then
          select division into v_variant
          from (select distinct division from private.nfl_best_team_seasons_v1_authority) divisions
          order by random()
          limit 1;
          v_theme:=v_variant||' Spotlight';
        elsif v_family='season' then
          v_variant:=(2000+floor(random()*26)::integer)::text;
          v_theme:=v_variant||' Season Spotlight';
        elsif v_family='era' then
          v_variant:=(array['2000s','2010s','2020s'])[1+floor(random()*3)::integer];
          v_theme:=v_variant||' Spotlight';
        elsif v_family='rivalry' then
          v_variant:=(array[
            'DAL|PHI','GB|CHI','BAL|PIT','KC|LV','NE|NYJ','SF|LAR',
            'ATL|NO','DEN|KC','NYG|PHI','SEA|SF','CLE|PIT','MIN|GB'
          ])[1+floor(random()*12)::integer];
          v_theme:=private.football_weekly_nfl_team_short_name(split_part(v_variant,'|',1))
            ||' vs '||
            private.football_weekly_nfl_team_short_name(split_part(v_variant,'|',2));
        elsif v_family='franchise_history' then
          select franchise_id into v_variant
          from private.nfl_best_team_seasons_v1_authority
          group by franchise_id
          having count(*)>=4
          order by random()
          limit 1;
          v_theme:=private.football_weekly_nfl_team_short_name(v_variant)||' Through the Years';
        elsif v_family='fell_short' then
          v_variant:=null;
          v_theme:='Great Teams That Fell Short';
        elsif v_family='conference_clash' then
          v_variant:=null;
          v_theme:='Super Bowl Champions';
        else
          v_variant:=null;
          v_theme:='Open Field';
        end if;

        if v_theme=any(v_used_labels) then
          continue;
        end if;

        v_def_families:=array_append(v_def_families,v_family);
        v_def_variants:=array_append(v_def_variants,v_variant);
        v_def_themes:=array_append(v_def_themes,v_theme);
        v_used_labels:=array_append(v_used_labels,v_theme);
        v_family_counts:=jsonb_set(
          v_family_counts,
          array[v_family],
          to_jsonb(coalesce((v_family_counts->>v_family)::integer,0)+1),
          true
        );
        v_chosen:=true;
        exit;
      end loop;

      if not v_chosen then
        continue attempt_loop;
      end if;
    end loop;

    select array_agg(n order by random())
    into v_final_days
    from generate_series(1,6) as day_order(n);

    -- Build constrained families first, matching the audited generator's
    -- BUILD_PRIORITY, then randomly place the completed theme days in the week.
    foreach v_priority_family in array v_priority_order loop
      for v_def_index in 1..6 loop
        if v_def_families[v_def_index]<>v_priority_family then
          continue;
        end if;

        v_family:=v_def_families[v_def_index];
        v_variant:=v_def_variants[v_def_index];
        v_theme:=v_def_themes[v_def_index];
        v_actual_day:=v_final_days[v_def_index];
        v_selected_refs:=array[]::text[];
        v_day_franchises:=array[]::text[];

        if v_family='franchise_history' then
          v_history_franchise:=v_variant;
          for v_pick_index in 1..4 loop
            v_ref:=null;
            select candidate.item_reference into v_ref
            from private.nfl_best_team_seasons_v1_authority candidate
            where candidate.franchise_id=v_variant
              and not (candidate.item_reference=any(v_used_refs))
            order by random()
            limit 1;
            if v_ref is null then continue attempt_loop; end if;
            v_selected_refs:=array_append(v_selected_refs,v_ref);
            v_used_refs:=array_append(v_used_refs,v_ref);
          end loop;

        elsif v_family='rivalry' then
          foreach v_franchise in array array[
            split_part(v_variant,'|',1),
            split_part(v_variant,'|',2)
          ] loop
            for v_pick_index in 1..2 loop
              v_ref:=null;
              select candidate.item_reference into v_ref
              from private.nfl_best_team_seasons_v1_authority candidate
              where candidate.franchise_id=v_franchise
                and not (candidate.item_reference=any(v_used_refs))
              order by random()
              limit 1;
              if v_ref is null then continue attempt_loop; end if;
              v_selected_refs:=array_append(v_selected_refs,v_ref);
              v_used_refs:=array_append(v_used_refs,v_ref);
            end loop;
          end loop;

        elsif v_family='division' then
          for v_franchise in
            select distinct candidate.franchise_id
            from private.nfl_best_team_seasons_v1_authority candidate
            where candidate.division=v_variant
            order by candidate.franchise_id
          loop
            v_ref:=null;
            select candidate.item_reference into v_ref
            from private.nfl_best_team_seasons_v1_authority candidate
            where candidate.franchise_id=v_franchise
              and not (candidate.item_reference=any(v_used_refs))
            order by random()
            limit 1;
            if v_ref is null then continue attempt_loop; end if;
            v_selected_refs:=array_append(v_selected_refs,v_ref);
            v_used_refs:=array_append(v_used_refs,v_ref);
          end loop;
          if coalesce(array_length(v_selected_refs,1),0)<>4 then
            continue attempt_loop;
          end if;

        elsif v_family='conference_clash' then
          for v_pick_index in 1..4 loop
            v_ref:=null;
            v_franchise:=null;
            select candidate.item_reference,candidate.franchise_id
            into v_ref,v_franchise
            from private.nfl_best_team_seasons_v1_authority candidate
            where candidate.super_bowl_champion
              and not (candidate.item_reference=any(v_used_refs))
              and not (candidate.franchise_id=any(v_day_franchises))
              and coalesce((v_weekly_counts->>candidate.franchise_id)::integer,0)<2
            order by
              coalesce((v_weekly_counts->>candidate.franchise_id)::integer,0),
              random()
            limit 1;
            if v_ref is null then continue attempt_loop; end if;
            v_selected_refs:=array_append(v_selected_refs,v_ref);
            v_day_franchises:=array_append(v_day_franchises,v_franchise);
            v_used_refs:=array_append(v_used_refs,v_ref);
          end loop;

        else
          -- Season, era, fell-short and open-field use the same calibrated
          -- least-used/distinct-franchise selection rule.
          for v_pick_index in 1..4 loop
            v_ref:=null;
            v_franchise:=null;
            select candidate.item_reference,candidate.franchise_id
            into v_ref,v_franchise
            from private.nfl_best_team_seasons_v1_authority candidate
            where not (candidate.item_reference=any(v_used_refs))
              and not (candidate.franchise_id=any(v_day_franchises))
              and coalesce((v_weekly_counts->>candidate.franchise_id)::integer,0)<2
              and (
                (v_family='season' and candidate.season_year=v_variant::integer)
                or (v_family='era' and (
                  (v_variant='2000s' and candidate.season_year between 2000 and 2009)
                  or (v_variant='2010s' and candidate.season_year between 2010 and 2019)
                  or (v_variant='2020s' and candidate.season_year between 2020 and 2025)
                ))
                or (v_family='fell_short' and candidate.fell_short)
                or v_family='open_field'
              )
            order by
              coalesce((v_weekly_counts->>candidate.franchise_id)::integer,0),
              random()
            limit 1;
            if v_ref is null then continue attempt_loop; end if;
            v_selected_refs:=array_append(v_selected_refs,v_ref);
            v_day_franchises:=array_append(v_day_franchises,v_franchise);
            v_used_refs:=array_append(v_used_refs,v_ref);
          end loop;
        end if;

        if coalesce(array_length(v_selected_refs,1),0)<>4 then
          continue attempt_loop;
        end if;

        select array_agg(ref order by random())
        into v_selected_refs
        from unnest(v_selected_refs) as shuffled(ref);

        insert into private.football_weekly_nfl_team_season_themes(
          week_start,day_index,family,variant,public_theme
        ) values (
          p_week_start,v_actual_day,v_family,v_variant,v_theme
        );

        for v_slot in 1..4 loop
          v_ref:=v_selected_refs[v_slot];
          insert into private.football_weekly_auction_board(
            week_start,day_index,theme,hidden_shape,slot,season_reference,lock_at,trait
          ) values (
            p_week_start,v_actual_day,v_theme,'Natural',v_slot,v_ref,
            ((p_week_start+v_actual_day)::timestamp at time zone 'America/Chicago'),
            null
          );

          select franchise_id into v_franchise
          from private.nfl_best_team_seasons_v1_authority
          where item_reference=v_ref;

          v_weekly_counts:=jsonb_set(
            v_weekly_counts,
            array[v_franchise],
            to_jsonb(coalesce((v_weekly_counts->>v_franchise)::integer,0)+1),
            true
          );
        end loop;
      end loop;
    end loop;

    if (select count(*) from private.football_weekly_auction_board
        where week_start=p_week_start and slot<=4)<>24
      or (select count(*) from private.football_weekly_nfl_team_season_themes
          where week_start=p_week_start)<>6
    then
      continue attempt_loop;
    end if;

    if exists(
      select authority.franchise_id
      from private.football_weekly_auction_board board
      join private.nfl_best_team_seasons_v1_authority authority
        on authority.item_reference=board.season_reference
      where board.week_start=p_week_start and board.slot<=4
      group by authority.franchise_id
      having count(*)>
        case when authority.franchise_id=v_history_franchise then 4 else 3 end
    ) then
      continue attempt_loop;
    end if;

    -- Prebuild hidden reserve cards under the same theme eligibility. Reserve
    -- scarcity may leave a theme with fewer than seven total cards; exposed
    -- cards are never rerolled and later supply logic uses only what exists.
    for v_day in 1..6 loop
      select family,variant,public_theme
      into v_family,v_variant,v_theme
      from private.football_weekly_nfl_team_season_themes
      where week_start=p_week_start and day_index=v_day;

      for v_slot in 5..7 loop
        v_ref:=null;
        select candidate.item_reference into v_ref
        from private.nfl_best_team_seasons_v1_authority candidate
        where not exists(
            select 1
            from private.football_weekly_auction_board used
            where used.week_start=p_week_start
              and used.season_reference=candidate.item_reference
          )
          and (
            (v_family='division' and candidate.division=v_variant)
            or (v_family='season' and candidate.season_year=v_variant::integer)
            or (v_family='era' and (
              (v_variant='2000s' and candidate.season_year between 2000 and 2009)
              or (v_variant='2010s' and candidate.season_year between 2010 and 2019)
              or (v_variant='2020s' and candidate.season_year between 2020 and 2025)
            ))
            or (v_family='rivalry' and candidate.franchise_id in (
              split_part(v_variant,'|',1),split_part(v_variant,'|',2)
            ))
            or (v_family='franchise_history' and candidate.franchise_id=v_variant)
            or (v_family='fell_short' and candidate.fell_short)
            or (v_family='conference_clash' and candidate.super_bowl_champion)
            or v_family='open_field'
          )
        order by
          (
            select count(*)
            from private.football_weekly_auction_board weekly
            join private.nfl_best_team_seasons_v1_authority weekly_item
              on weekly_item.item_reference=weekly.season_reference
            where weekly.week_start=p_week_start
              and weekly_item.franchise_id=candidate.franchise_id
          ),
          random()
        limit 1;

        if v_ref is null then exit; end if;

        insert into private.football_weekly_auction_board(
          week_start,day_index,theme,hidden_shape,slot,season_reference,lock_at,trait
        ) values (
          p_week_start,v_day,v_theme,'Natural',v_slot,v_ref,
          ((p_week_start+v_day)::timestamp at time zone 'America/Chicago'),
          null
        );
      end loop;
    end loop;

    return;
  end loop attempt_loop;

  delete from private.football_weekly_auction_board where week_start=p_week_start;
  delete from private.football_weekly_nfl_team_season_themes where week_start=p_week_start;
  raise exception 'Unable to materialize a valid calibrated NFL Team-Seasons themed week';
end;
$nfl_theme_week$;
revoke all on function private.materialize_football_weekly_nfl_team_season_week(date)
  from public,anon,authenticated;

-- Preserve the exposed Oct. 6 board exactly; only improve the public labels.
update private.football_weekly_nfl_team_season_themes
set public_theme = case day_index
  when 1 then 'Champions & Contenders'
  when 4 then 'Postseason Runs'
  else public_theme
end
where week_start = date '2026-10-06'
  and day_index in (1,4);

update private.football_weekly_auction_board
set theme = case day_index
  when 1 then 'Champions & Contenders'
  when 4 then 'Postseason Runs'
  else theme
end
where week_start = date '2026-10-06'
  and day_index in (1,4);

do $oct6_hot_route_setup$
declare
  v_setup uuid;
  v_evidence jsonb;
  v_questions jsonb;
  v_index integer;
  v_question jsonb;
begin
  select setup.id, setup.private_setup_evidence
  into v_setup, v_evidence
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  join private.daily_challenge_setups setup
    on setup.id = daily.setup_id
  where daily.central_day = date '2026-10-06'
    and schedule.sport = 'football'
    and daily.game_type = 'average_fan'
  limit 1;

  if v_setup is null then
    return;
  end if;

  v_questions := coalesce(v_evidence->'questions', '[]'::jsonb);

  select (q.ordinality - 1)::integer
  into v_index
  from jsonb_array_elements(v_questions) with ordinality q(value, ordinality)
  where q.value->>'id' = 'average-fan:nfl:00-xo:hot-route:short'
  limit 1;

  if v_index is null then
    return;
  end if;

  v_question := v_questions->v_index;
  v_question := jsonb_set(
    v_question,
    '{aliases}',
    jsonb_build_array(
      'Audible to change route',
      'Audible to change a route',
      'An audible to change a route against pressure',
      'A route adjustment against pressure',
      'A quick route adjustment against a blitz'
    ),
    true
  );
  v_evidence := jsonb_set(v_evidence, array['questions',v_index::text], v_question, false);

  execute 'alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable';
  begin
    update private.daily_challenge_setups
    set private_setup_evidence = v_evidence
    where id = v_setup;
  exception when others then
    execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
end
$oct6_hot_route_setup$;

do $oct6_cody_average_fan$
declare
  v_profile uuid;
  v_daily uuid;
  v_attempt uuid;
  v_score integer;
  v_state jsonb;
  v_resolved jsonb;
  v_submission jsonb;
begin
  select id into v_profile
  from public.profiles
  where normalized_name = 'CODY'
  limit 1;

  if v_profile is null then
    return;
  end if;

  select daily.id into v_daily
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.central_day = date '2026-10-06'
    and schedule.sport = 'football'
    and daily.game_type = 'average_fan'
  limit 1;

  if v_daily is null then
    return;
  end if;

  select attempt.id, attempt.normalized_score
  into v_attempt, v_score
  from private.daily_challenge_attempts attempt
  where attempt.daily_challenge_id = v_daily
    and attempt.profile_id = v_profile
    and attempt.attempt_kind = 'official_first'
  limit 1;

  if v_attempt is null then
    return;
  end if;

  if v_score not in (84,90) then
    raise exception 'Oct. 6 Cody Average Fan score changed before correction: %', v_score;
  end if;

  if v_score = 90 then
    return;
  end if;

  select progress.public_state
  into v_state
  from private.daily_challenge_progress progress
  where progress.daily_challenge_id = v_daily
    and progress.profile_id = v_profile;

  if v_state is null
    or v_state->'resolved'->6->'question'->>'id' <> 'average-fan:nfl:00-xo:hot-route:short'
    or lower(v_state->'resolved'->6->>'player_answer') <> 'audible to change route'
    or v_state->'resolved'->7->'question'->>'id' <> 'average-fan:nfl:00-history:holy-roller:choice'
    or v_state->'resolved'->7->>'peek_used' <> 'true'
    or v_state->'resolved'->7->>'fan_answer' <> 'San Diego Chargers'
    or v_state->'resolved'->7->>'player_answer' <> 'Denver Broncos'
  then
    raise exception 'Oct. 6 Cody Average Fan correction evidence changed';
  end if;

  v_resolved := v_state->'resolved';
  v_resolved := jsonb_set(
    v_resolved,
    '{6}',
    (v_resolved->6) || jsonb_build_object(
      'correct', true,
      'saved', false,
      'save_consumed', false
    ),
    false
  );
  v_resolved := jsonb_set(
    v_resolved,
    '{7}',
    (v_resolved->7) || jsonb_build_object(
      'correct', false,
      'saved', true,
      'save_consumed', true
    ),
    false
  );

  v_submission := jsonb_build_object(
    'board_score', 90,
    'native_score', 90,
    'normalized_score', 90,
    'unsaved_miss_question_numbers', '[]'::jsonb,
    'saves', 1
  );

  execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
  begin
    update private.daily_challenge_attempts
    set native_score = 90,
        normalized_score = 90,
        public_result = public_result
          || jsonb_build_object(
            'score',90,
            'board_score',90,
            'score_correction','2026-10-06-average-fan-hot-route-repair'
          ),
        submission_evidence = submission_evidence
          || v_submission
          || jsonb_build_object(
            'score_correction','2026-10-06-average-fan-hot-route-repair'
          ),
        grading_evidence_snapshot = grading_evidence_snapshot
          || jsonb_build_object(
            'score_correction',
            jsonb_build_object(
              'reason','hot-route answer was semantically correct; save therefore remained available for question 8',
              'original_score',84,
              'corrected_score',90,
              'question_7_regraded_correct',true,
              'question_8_saved',true,
              'banked_score',90
            )
          )
    where id = v_attempt
      and normalized_score = 84;
  exception when others then
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';

  update private.daily_challenge_progress
  set public_state = v_state
      || jsonb_build_object(
        'resolved',v_resolved,
        'board_score',90,
        'final_score',90,
        'score_correction','2026-10-06-average-fan-hot-route-repair'
      ),
      submission_state = jsonb_set(
        submission_state,
        '{final_submission}',
        coalesce(submission_state->'final_submission','{}'::jsonb)
          || v_submission
          || jsonb_build_object(
            'score_correction','2026-10-06-average-fan-hot-route-repair'
          ),
        true
      )
  where daily_challenge_id = v_daily
    and profile_id = v_profile;

  update private.daily_challenge_history
  set native_score = 90,
      normalized_score = 90,
      public_result = public_result
        || jsonb_build_object(
          'score',90,
          'board_score',90,
          'score_correction','2026-10-06-average-fan-hot-route-repair'
        )
  where daily_challenge_id = v_daily
    and profile_id = v_profile
    and normalized_score = 84;
end
$oct6_cody_average_fan$;
