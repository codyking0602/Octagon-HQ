create or replace function public.import_v1_history_atomic_preserving_v2_history(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payload jsonb;
  v_result jsonb;
  v_conflict_rows jsonb := '[]'::jsonb;
  v_conflict_count integer := 0;
  v_preserved_count integer := 0;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  select
    count(*) filter (
      where (existing.official_score, existing.best_score, existing.attempts)
        is distinct from (
          (history.value->>'officialScore')::smallint,
          (history.value->>'bestScore')::smallint,
          (history.value->>'attempts')::integer
        )
    )::integer,
    count(*)::integer,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'profile', canonical.normalized_name,
          'day', existing.day,
          'v1OfficialScore', (history.value->>'officialScore')::smallint,
          'v1BestScore', (history.value->>'bestScore')::smallint,
          'v1Attempts', (history.value->>'attempts')::integer,
          'v2OfficialScore', existing.official_score,
          'v2BestScore', existing.best_score,
          'v2Attempts', existing.attempts,
          'resolution', 'preserved_v2'
        )
        order by canonical.normalized_name, existing.day
      ) filter (
        where (existing.official_score, existing.best_score, existing.attempts)
          is distinct from (
            (history.value->>'officialScore')::smallint,
            (history.value->>'bestScore')::smallint,
            (history.value->>'attempts')::integer
          )
      ),
      '[]'::jsonb
    )
  into v_conflict_count, v_preserved_count, v_conflict_rows
  from jsonb_array_elements(p_payload->'profiles') as profile(value)
  join public.profiles canonical
    on canonical.normalized_name = upper(regexp_replace(trim(profile.value->>'normalizedName'), '\s+', ' ', 'g'))
  cross join lateral jsonb_array_elements(coalesce(profile.value->'findLeader', '[]'::jsonb)) as history(value)
  join public.find_leader_history existing
    on existing.profile_id = canonical.id
   and existing.day = (history.value->>'day')::date;

  select jsonb_set(
    p_payload,
    '{profiles}',
    coalesce(
      jsonb_agg(
        jsonb_set(
          profile.value,
          '{findLeader}',
          coalesce((
            select jsonb_agg(history.value order by history.value->>'day')
            from jsonb_array_elements(coalesce(profile.value->'findLeader', '[]'::jsonb)) as history(value)
            where not exists (
              select 1
              from public.profiles canonical
              join public.find_leader_history existing on existing.profile_id = canonical.id
              where canonical.normalized_name = upper(regexp_replace(trim(profile.value->>'normalizedName'), '\s+', ' ', 'g'))
                and existing.day = (history.value->>'day')::date
            )
          ), '[]'::jsonb),
          true
        )
        order by profile.value->>'normalizedName'
      ),
      '[]'::jsonb
    ),
    true
  )
  into v_payload
  from jsonb_array_elements(p_payload->'profiles') as profile(value);

  v_result := public.import_v1_history_atomic(v_payload);
  v_result := jsonb_set(
    v_result,
    '{changes,findLeaderConflicts}',
    to_jsonb(v_conflict_count),
    true
  );
  v_result := jsonb_set(
    v_result,
    '{changes,findLeaderPreserved}',
    to_jsonb(v_preserved_count),
    true
  );

  return v_result || jsonb_build_object(
    'findLeaderConflictRows', v_conflict_rows,
    'findLeaderConflictPolicy', 'preserve_existing_v2'
  );
end;
$$;

create or replace function public.import_v1_history_atomic_reconciled(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payload jsonb;
  v_base jsonb;
  v_profiles jsonb;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  if coalesce((p_payload->'rules'->>'canonicalSixMemberGroupOnly')::boolean, false) is not true
     or nullif(p_payload->>'sourceGroupFingerprint', '') is null then
    raise exception 'canonical V1 source-group proof missing';
  end if;

  v_payload := p_payload || jsonb_build_object('sourceGroupMatchCount', 1);
  v_base := public.import_v1_history_atomic_preserving_v2_history(v_payload);

  select coalesce(jsonb_object_agg(profile_name, profile_stats), '{}'::jsonb)
  into v_profiles
  from (
    select
      canonical.normalized_name as profile_name,
      jsonb_build_object(
        'recordedDays', (
          select count(*)
          from public.find_leader_history history
          where history.profile_id = canonical.id
        ),
        'bestStreak', coalesce((
          select max(streak)
          from (
            select count(*) as streak
            from (
              select
                history.day,
                history.day - (row_number() over(order by history.day))::int as streak_group
              from public.find_leader_history history
              where history.profile_id = canonical.id
            ) as ordered_days
            group by streak_group
          ) as streaks
        ), 0),
        'perfect10s', (
          select count(*)
          from public.find_leader_history history
          where history.profile_id = canonical.id
            and history.official_score = 10
        ),
        'bestScore', coalesce((
          select max(history.best_score)
          from public.find_leader_history history
          where history.profile_id = canonical.id
        ), 0),
        'historicalPicksCorrect', coalesce(sum(event_row.correct_picks), 0),
        'historicalPicksIncorrect', coalesce(sum(event_row.incorrect_picks), 0),
        'historicalPicksMissing', coalesce(sum(event_row.missing_picks), 0),
        'historicalPickEvents', count(event_row.event_id),
        'eventRecords', coalesce(
          jsonb_agg(
            jsonb_build_object(
              'eventId', event_row.event_id,
              'eventName', event_row.event_name,
              'eventDate', event_row.starts_at,
              'eligibleResolvedBouts', event_row.eligible_bouts,
              'picksSubmitted', event_row.picks_submitted,
              'correctPicks', event_row.correct_picks,
              'incorrectPicks', event_row.incorrect_picks,
              'missingPicks', event_row.missing_picks,
              'excludedResults', event_row.excluded_results,
              'record', jsonb_build_object(
                'wins', event_row.correct_picks,
                'losses', event_row.incorrect_picks
              )
            )
            order by event_row.starts_at, event_row.event_id
          ) filter (where event_row.event_id is not null),
          '[]'::jsonb
        )
      ) as profile_stats
    from public.profiles canonical
    left join lateral (
      select
        event.value->>'eventId' as event_id,
        event.value->>'name' as event_name,
        (event.value->>'startsAt')::timestamptz as starts_at,
        count(fight.value)::int as eligible_bouts,
        count(saved_pick.bout_id)::int as picks_submitted,
        count(saved_pick.bout_id) filter (
          where saved_pick.fighter_slug = bout.winner_fighter_slug
        )::int as correct_picks,
        count(saved_pick.bout_id) filter (
          where saved_pick.fighter_slug <> bout.winner_fighter_slug
        )::int as incorrect_picks,
        (count(fight.value) - count(saved_pick.bout_id))::int as missing_picks,
        coalesce((event.value->>'excludedResults')::int, 0) as excluded_results
      from jsonb_array_elements(v_payload->'pickEvents') as event(value)
      left join lateral jsonb_array_elements(v_payload->'pickFights') as fight(value)
        on fight.value->>'eventId' = event.value->>'eventId'
      left join public.pick_bouts bout
        on bout.event_id = fight.value->>'eventId'
       and bout.bout_id = fight.value->>'boutId'
      left join public.profile_event_picks saved_pick
        on saved_pick.profile_id = canonical.id
       and saved_pick.event_id = fight.value->>'eventId'
       and saved_pick.bout_id = fight.value->>'boutId'
      group by
        event.value->>'eventId',
        event.value->>'name',
        (event.value->>'startsAt')::timestamptz,
        coalesce((event.value->>'excludedResults')::int, 0)
    ) as event_row on true
    where canonical.normalized_name = any(array['BROCK','CODY','RHONDA','SHANE','TONY','TYLER']::text[])
    group by canonical.id, canonical.normalized_name
  ) as derived;

  return v_base || jsonb_build_object(
    'profiles', v_profiles,
    'recordScoringRules', jsonb_build_object(
      'correctSelectionCountsAsWin', true,
      'incorrectSelectionCountsAsLoss', true,
      'missingSelectionCountsAsLoss', false,
      'predeterminedRecordExpected', false
    )
  );
end;
$$;

revoke all on function public.import_v1_history_atomic_preserving_v2_history(jsonb) from public, anon, authenticated;
revoke all on function public.import_v1_history_atomic_reconciled(jsonb) from public, anon, authenticated;
grant execute on function public.import_v1_history_atomic_preserving_v2_history(jsonb) to service_role;
grant execute on function public.import_v1_history_atomic_reconciled(jsonb) to service_role;
