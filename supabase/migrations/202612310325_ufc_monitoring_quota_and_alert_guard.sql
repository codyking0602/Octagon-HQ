-- Free official UFC card checks, shared odds quota, and deduplicated failure pushes.
-- This keeps one existing scheduler, Picks recorder, and notification owner.

-- Preserve the append-only protection: the canonical writer inserts card-only
-- monitoring evidence with provider_called=false from the outset. Never UPDATE
-- evidence rows after inserting them.
CREATE OR REPLACE FUNCTION public.record_pick_monitoring_run(p_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_run_id uuid;
  v_card_only boolean := coalesce(p_payload->>'decision_reason' = 'card_source_only', false);
  v_trigger_kind text := coalesce(nullif(trim(p_payload->>'trigger_kind'),''), 'scheduled');
  v_status text := trim(coalesce(p_payload->>'status',''));
  v_source_event_identity text := trim(coalesce(p_payload->>'source_event_identity',''));
  v_event_id text := nullif(lower(trim(p_payload->>'event_id')), '');
  v_started_at timestamptz := coalesce(nullif(p_payload->>'started_at','')::timestamptz, now());
  v_completed_at timestamptz := nullif(p_payload->>'completed_at','')::timestamptz;
  v_payload_locks_at timestamptz := nullif(p_payload->>'locks_at','')::timestamptz;
  v_observed_locks_at timestamptz;
  v_diagnostics jsonb := coalesce(p_payload->'diagnostics', '[]'::jsonb);
  v_findings jsonb := coalesce(p_payload->'findings', '[]'::jsonb);
  v_snapshots jsonb := coalesce(p_payload->'odds_snapshots', '[]'::jsonb);
  v_finding jsonb;
  v_snapshot jsonb;
  v_prices jsonb;
  v_fetched_at timestamptz;
  v_bout_id text;
  v_fighter_one_odds integer;
  v_fighter_two_odds integer;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to record pick monitoring evidence';
  end if;
  if jsonb_typeof(p_payload) <> 'object' then
    raise exception 'pick monitoring payload must be an object';
  end if;
  if v_status not in ('completed','partial','failed') or v_source_event_identity = '' then
    raise exception 'pick monitoring run identity or status is invalid';
  end if;
  if jsonb_typeof(v_diagnostics) <> 'array'
    or jsonb_typeof(v_findings) <> 'array'
    or jsonb_typeof(v_snapshots) <> 'array' then
    raise exception 'pick monitoring diagnostics, findings, and odds snapshots must be arrays';
  end if;

  if v_card_only and (
    v_trigger_kind <> 'scheduled'
    or v_status <> 'completed'
    or v_event_id is null
    or jsonb_array_length(v_snapshots) <> 0
    or jsonb_array_length(v_findings) = 0
    or p_payload->'quota'->>'requests_remaining' is not null
    or p_payload->'quota'->>'requests_used' is not null
    or p_payload->'quota'->>'last_request_cost' is not null
  ) then
    raise exception 'invalid free official-card evidence for canonical monitoring writer';
  end if;

  if v_event_id is not null then
    select event.locks_at into v_observed_locks_at
    from public.pick_events event
    where event.event_id = v_event_id;
    if not found then
      raise exception 'canonical pick event not found for monitoring run';
    end if;
    if v_payload_locks_at is not null and v_payload_locks_at is distinct from v_observed_locks_at then
      raise exception 'monitoring lock snapshot does not match canonical event';
    end if;
  else
    v_observed_locks_at := v_payload_locks_at;
  end if;

  insert into public.pick_monitoring_runs (
    trigger_kind, status, source_event_identity, event_id, observed_locks_at,
    started_at, completed_at, card_source, card_source_url, odds_provider,
    provider_requests_remaining, provider_requests_used, provider_last_request_cost,
    provider_event_count, complete_snapshot_count, missing_snapshot_count,
    diagnostics, provider_called, decision_reason
  ) values (
    v_trigger_kind,
    v_status,
    v_source_event_identity,
    v_event_id,
    v_observed_locks_at,
    v_started_at,
    v_completed_at,
    nullif(trim(p_payload->>'card_source'),''),
    nullif(trim(p_payload->>'card_source_url'),''),
    nullif(trim(p_payload->>'odds_provider'),''),
    nullif(p_payload->'quota'->>'requests_remaining','')::integer,
    nullif(p_payload->'quota'->>'requests_used','')::integer,
    nullif(p_payload->'quota'->>'last_request_cost','')::integer,
    coalesce(nullif(p_payload->'coverage'->>'provider_events','')::integer, 0),
    coalesce(nullif(p_payload->'coverage'->>'complete_snapshots','')::integer, 0),
    coalesce(nullif(p_payload->'coverage'->>'missing_snapshots','')::integer, 0),
    v_diagnostics,
    not v_card_only,
    case when v_card_only then 'card_source_only' else null end
  ) returning run_id into v_run_id;

  for v_finding in select value from jsonb_array_elements(v_findings)
  loop
    insert into public.pick_monitoring_findings (
      run_id, event_id, finding_key, finding_type, severity, review_status,
      matchup_identity, bout_id, summary, before_value, after_value,
      source_details, detected_at
    ) values (
      v_run_id,
      v_event_id,
      trim(coalesce(v_finding->>'finding_key','')),
      trim(coalesce(v_finding->>'finding_type','')),
      trim(coalesce(v_finding->>'severity','')),
      'new',
      nullif(trim(v_finding->>'matchup_identity'),''),
      nullif(trim(v_finding->>'bout_id'),''),
      trim(coalesce(v_finding->>'summary','')),
      v_finding->'before_value',
      v_finding->'after_value',
      coalesce(v_finding->'source_details', '{}'::jsonb),
      coalesce(nullif(v_finding->>'detected_at','')::timestamptz, v_completed_at, now())
    );
  end loop;

  for v_snapshot in select value from jsonb_array_elements(v_snapshots)
  loop
    v_prices := v_snapshot->'prices';
    if jsonb_typeof(v_prices) <> 'array' or jsonb_array_length(v_prices) <> 2 then
      raise exception 'monitoring odds snapshot must contain exactly two prices';
    end if;
    v_fetched_at := nullif(v_snapshot->>'fetched_at','')::timestamptz;
    v_bout_id := nullif(trim(v_snapshot->>'bout_id'),'');
    v_fighter_one_odds := (v_prices->0->>'american_odds')::integer;
    v_fighter_two_odds := (v_prices->1->>'american_odds')::integer;

    insert into public.pick_monitoring_odds_snapshots (
      run_id, event_id, bout_id, provider, sport_key, source_event_id,
      source_event_identity, matchup_identity, commence_time, sportsbook,
      sportsbook_title, sportsbook_updated_at, fetched_at, observed_locks_at,
      fighter_one_name, fighter_one_identity, fighter_one_american_odds,
      fighter_two_name, fighter_two_identity, fighter_two_american_odds
    ) values (
      v_run_id,
      v_event_id,
      v_bout_id,
      trim(coalesce(v_snapshot->>'provider','')),
      trim(coalesce(v_snapshot->>'sport_key','')),
      trim(coalesce(v_snapshot->>'source_event_id','')),
      trim(coalesce(v_snapshot->>'source_event_identity','')),
      trim(coalesce(v_snapshot->>'matchup_identity','')),
      (v_snapshot->>'commence_time')::timestamptz,
      trim(coalesce(v_snapshot->>'sportsbook','')),
      trim(coalesce(v_snapshot->>'sportsbook_title','')),
      (v_snapshot->>'sportsbook_updated_at')::timestamptz,
      v_fetched_at,
      v_observed_locks_at,
      trim(coalesce(v_prices->0->>'fighter_name','')),
      trim(coalesce(v_prices->0->>'fighter_identity','')),
      v_fighter_one_odds,
      trim(coalesce(v_prices->1->>'fighter_name','')),
      trim(coalesce(v_prices->1->>'fighter_identity','')),
      v_fighter_two_odds
    );
  end loop;

  return v_run_id;
end;
$function$;

revoke all on function public.record_pick_monitoring_run(jsonb)
  from public, anon, authenticated;
grant execute on function public.record_pick_monitoring_run(jsonb) to service_role;
create or replace function public.record_card_source_monitoring_run(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_run_id uuid;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to record UFC card monitoring';
  end if;
  if jsonb_typeof(p_payload) is distinct from 'object'
    or p_payload->>'trigger_kind' is distinct from 'scheduled'
    or p_payload->>'status' is distinct from 'completed'
    or nullif(p_payload->>'event_id', '') is null
    or nullif(p_payload->>'card_source', '') is null
    or jsonb_typeof(p_payload->'odds_snapshots') is distinct from 'array'
    or jsonb_array_length(p_payload->'odds_snapshots') <> 0
    or jsonb_typeof(p_payload->'findings') is distinct from 'array'
    or jsonb_array_length(p_payload->'findings') = 0
    or exists (
      select 1 from jsonb_array_elements(
        case when jsonb_typeof(p_payload->'findings') = 'array'
          then p_payload->'findings' else '[]'::jsonb end
      ) as entry(value)
      where entry.value->>'finding_type' is distinct from 'card_change'
    )
    or coalesce(jsonb_array_length(
      case when jsonb_typeof(p_payload->'diagnostics') = 'array'
        then p_payload->'diagnostics' else '[]'::jsonb end
    ), 0) <> 0
    or p_payload->'quota'->>'requests_remaining' is not null
    or p_payload->'quota'->>'requests_used' is not null
    or p_payload->'quota'->>'last_request_cost' is not null
  then
    raise exception 'invalid free official-card monitoring evidence';
  end if;

  v_run_id := public.record_pick_monitoring_run(
    p_payload || jsonb_build_object(
      'decision_reason', 'card_source_only',
      'odds_provider', null
    )
  );
  return v_run_id;
end;
$function$;

revoke all on function public.record_card_source_monitoring_run(jsonb)
  from public, anon, authenticated;
grant execute on function public.record_card_source_monitoring_run(jsonb) to service_role;

CREATE OR REPLACE FUNCTION public.get_pick_monitoring_schedule_state(p_source_event_identity text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_last public.pick_monitoring_runs;
  v_global_quota public.pick_monitoring_runs;
  v_schedule public.pick_monitoring_schedule_state;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to read pick monitoring schedule state';
  end if;

  select run.* into v_last
  from public.pick_monitoring_runs run
  where run.source_event_identity = p_source_event_identity
    and run.provider_called
    and run.decision_reason is null
  order by coalesce(run.completed_at, run.started_at) desc, run.created_at desc
  limit 1;

  -- Quota belongs to the provider account, NOT an individual UFC event.
  select run.* into v_global_quota
  from public.pick_monitoring_runs run
  where run.provider_called
    and run.decision_reason is null
    and run.provider_requests_remaining is not null
  order by coalesce(run.completed_at, run.started_at) desc, run.created_at desc
  limit 1;

  select state.* into v_schedule
  from public.pick_monitoring_schedule_state state
  where state.source_event_identity = p_source_event_identity;

  return jsonb_build_object(
    'last_completed_at', v_last.completed_at,
    'provider_requests_remaining', v_global_quota.provider_requests_remaining,
    'quota_observed_at', coalesce(v_global_quota.completed_at, v_global_quota.started_at),
    'next_eligible_at', v_schedule.next_eligible_at,
    'lease_until', v_schedule.lease_until,
    'existing_finding_keys', coalesce((
      select jsonb_agg(keys.finding_key order by keys.finding_key)
      from (
        select distinct finding.finding_key
        from public.pick_monitoring_findings finding
        join public.pick_monitoring_runs run on run.run_id = finding.run_id
        where run.source_event_identity = p_source_event_identity
          and run.decision_reason is null
          and finding.review_status = 'new'
      ) keys
    ), '[]'::jsonb)
  );
end;
$function$;

revoke all on function public.get_pick_monitoring_schedule_state(text)
  from public, anon, authenticated;
grant execute on function public.get_pick_monitoring_schedule_state(text) to service_role;

CREATE OR REPLACE FUNCTION public.dispatch_due_in_app_notifications(p_now timestamp with time zone DEFAULT now())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_owner_profile_id uuid;
  v_central_day date := (p_now at time zone 'America/Chicago')::date;
  v_central_time time := (p_now at time zone 'America/Chicago')::time;
  v_event record;
  v_recipient record;
  v_draft record;
  v_failure record;
  v_daily record;
  v_required_bouts integer;
  v_picks_incomplete integer := 0;
  v_event_starting integer := 0;
  v_daily_challenge integer := 0;
  v_owner_operations integer := 0;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to dispatch due notifications';
  end if;

  select owner.profile_id
    into v_owner_profile_id
  from private.notification_owner owner
  where owner.singleton = true;

  -- Member Picks timing uses the canonical event, lock, included-bout, profile, and
  -- saved-pick owners. Every claimed profile with any missing included fight is due,
  -- including a member who has not submitted a first pick yet.
  for v_event in
    select event.event_id, event.name, event.status, event.locks_at, event.starts_at
    from public.pick_events event
    where event.status in ('upcoming', 'locked')
    order by event.starts_at, event.event_id
  loop
    select count(*)
      into v_required_bouts
    from public.pick_bouts bout
    where bout.event_id = v_event.event_id
      and bout.included_in_picks
      and bout.result_status = 'pending';

    if v_required_bouts > 0
      and v_event.status = 'upcoming'
      and v_event.locks_at > p_now
      and v_event.locks_at <= p_now + interval '4 hours'
    then
      for v_recipient in
        select profile.id as profile_id
        from public.profiles profile
        join private.profile_pin_credentials credential
          on credential.profile_id = profile.id
        where exists (
          select 1
          from public.pick_bouts required_bout
          where required_bout.event_id = v_event.event_id
            and required_bout.included_in_picks
            and required_bout.result_status = 'pending'
            and not exists (
              select 1
              from public.profile_event_picks saved
              where saved.profile_id = profile.id
                and saved.event_id = required_bout.event_id
                and saved.bout_id = required_bout.bout_id
            )
        )
        order by profile.id
      loop
        perform private.publish_notification_to_profile(
          v_recipient.profile_id,
          'picks-incomplete-near-lock:' || v_event.event_id,
          'picks-incomplete-near-lock',
          'picks_incomplete_near_lock',
          'Finish your Picks',
          left(coalesce(nullif(trim(v_event.name), ''), 'The UFC event') ||
            ' locks within four hours. Complete the remaining fights before lock.', 280),
          '/picks',
          'FINISH PICKS',
          p_now
        );
        v_picks_incomplete := v_picks_incomplete + 1;
      end loop;
    end if;

    if v_required_bouts > 0
      and v_event.starts_at > p_now
      and v_event.starts_at <= p_now + interval '1 hour'
    then
      for v_recipient in
        select distinct pick.profile_id
        from public.profile_event_picks pick
        join private.profile_pin_credentials credential
          on credential.profile_id = pick.profile_id
        where pick.event_id = v_event.event_id
          and not exists (
            select 1
            from public.pick_bouts required_bout
            where required_bout.event_id = v_event.event_id
              and required_bout.included_in_picks
              and required_bout.result_status = 'pending'
              and not exists (
                select 1
                from public.profile_event_picks saved
                where saved.profile_id = pick.profile_id
                  and saved.event_id = required_bout.event_id
                  and saved.bout_id = required_bout.bout_id
              )
          )
        order by pick.profile_id
      loop
        perform private.publish_notification_to_profile(
          v_recipient.profile_id,
          'ufc-event-starting:' || v_event.event_id,
          'ufc-event-starting',
          'ufc_event_starting',
          left(coalesce(nullif(trim(v_event.name), ''), 'The UFC event') || ' starts soon', 100),
          'Your Picks are in. The main card starts in under one hour.',
          '/picks',
          'VIEW PICKS',
          p_now
        );
        v_event_starting := v_event_starting + 1;
      end loop;
    end if;
  end loop;

  -- The canonical dispatcher emits one independently scoped reminder for each
  -- official sport daily. A finish suppresses only that sport's reminder.
  if v_central_time >= time '20:00'
    and v_central_time < time '21:00'
  then
    for v_daily in
      select distinct on (schedule.sport)
        challenge.id, challenge.game_type, schedule.sport
      from private.daily_challenges challenge
      join private.daily_challenge_schedule_versions schedule
        on schedule.version = challenge.schedule_version
      where challenge.central_day = v_central_day
        and schedule.sport in ('ufc', 'football')
      order by schedule.sport, challenge.published_at desc, challenge.id desc
    loop
      for v_recipient in
        select profile.id as profile_id
        from public.profiles profile
        join private.profile_pin_credentials credential
          on credential.profile_id = profile.id
        where not exists (
          select 1
          from private.daily_challenge_attempts attempt
          where attempt.daily_challenge_id = v_daily.id
            and attempt.profile_id = profile.id
            and attempt.attempt_kind = 'official_first'
        )
        order by profile.id
      loop
        perform private.publish_notification_to_profile(
          v_recipient.profile_id,
          'daily-challenge-four-hours:' || v_daily.sport || ':' || v_central_day::text,
          'daily-challenge-four-hours:' || v_daily.sport,
          'daily_challenge_four_hours',
          case when v_daily.sport = 'football' then 'Football Daily closes soon' else 'Four hours remain' end,
          case
            when v_daily.sport = 'football' then 'Today''s Football Daily challenge closes at midnight Central.'
            when v_daily.game_type = 'find_leader' then 'Today''s Find the Leader challenge closes at midnight Central.'
            when v_daily.game_type = 'blind_resume' then 'Today''s Blind Resume challenge closes at midnight Central.'
            when v_daily.game_type = 'wavelength' then 'Today''s Wavelength challenge closes at midnight Central.'
            when v_daily.game_type = 'blind_rank_5' then 'Today''s Blind Rank 5 challenge closes at midnight Central.'
            when v_daily.game_type = 'keep_4_cut_4' then 'Today''s Keep 4, Cut 4 challenge closes at midnight Central.'
            else 'Today''s official challenge closes at midnight Central.'
          end,
          case
            when v_daily.sport = 'football' then '/football/today'
            when v_daily.game_type = 'find_leader' then '/play/find-leader'
            when v_daily.game_type = 'blind_resume' then '/play/blind-resume?mode=daily'
            when v_daily.game_type = 'wavelength' then '/play/wavelength?mode=daily'
            when v_daily.game_type = 'blind_rank_5' then '/play/blind-rank?mode=daily'
            when v_daily.game_type = 'keep_4_cut_4' then '/play/keep-cut?mode=daily'
            else '/play'
          end,
          'PLAY TODAY',
          p_now
        );
        v_daily_challenge := v_daily_challenge + 1;
      end loop;
    end loop;
  end if;

  if v_owner_profile_id is not null then
    -- A staged upcoming event with no matching published card is one clear owner action,
    -- not separate "draft ready" and "missing card" noise.
    for v_draft in
      select draft.draft_id, draft.event_id, draft.name, draft.starts_at
      from public.pick_event_drafts draft
      where draft.state = 'staged'
        and draft.starts_at > p_now
        and draft.starts_at <= p_now + interval '14 days'
        and not exists (
          select 1
          from public.pick_events event
          where event.event_id = draft.event_id
            and event.status in ('upcoming', 'locked')
        )
      order by draft.starts_at, draft.draft_id
    loop
      perform private.publish_notification_to_profile(
        v_owner_profile_id,
        'event-draft-ready:' || v_draft.draft_id::text,
        'event-drafts-ready',
        'event_draft_ready',
        'Event draft ready for review',
        left(coalesce(nullif(trim(v_draft.name), ''), 'The next UFC event') ||
          ' is staged and has no published Picks card.', 280),
        '/picks/setup',
        'REVIEW',
        p_now
      );
      v_owner_operations := v_owner_operations + 1;
    end loop;

    -- Escalate only after three recent consecutive failed automatic provider runs.
    -- Manual checks and decision-only scheduler evidence cannot create this notification.
    for v_failure in
      with ranked_runs as (
        select run.run_id,
               run.source_event_identity,
               run.status,
               coalesce(run.completed_at, run.started_at) as occurred_at,
               row_number() over (
                 partition by run.source_event_identity
                 order by coalesce(run.completed_at, run.started_at) desc, run.created_at desc
               ) as recent_rank
        from public.pick_monitoring_runs run
        where run.trigger_kind = 'scheduled'
          and run.provider_called
          and run.decision_reason is null
          -- Exceeded quota already generates the provider-quota alert and cannot be
          -- fixed by repeated monitoring; exclude it from three-failure escalation.
          and not (
            coalesce(run.provider_requests_remaining, -1) = 0
            and run.diagnostics @> '[{"code":"provider_http_error"}]'::jsonb
          )
          and coalesce(run.completed_at, run.started_at) >= p_now - interval '6 hours'
      )
      select source_event_identity,
             max(run_id::text) filter (where recent_rank = 1) as latest_run_id,
             max(occurred_at) filter (where recent_rank = 1) as latest_occurred_at
      from ranked_runs
      where recent_rank <= 3
      group by source_event_identity
      having count(*) = 3 and bool_and(status = 'failed')
    loop
      perform private.publish_notification_to_profile(
        v_owner_profile_id,
        -- One source per UFC event rather than a new push for every retry.
        'monitoring-repeatedly-failed:' || left(lower(regexp_replace(
          v_failure.source_event_identity, '[^a-zA-Z0-9:_-]+', '-', 'g'
        )), 140),
        'monitoring-repeatedly-failed:' || left(lower(regexp_replace(
          v_failure.source_event_identity, '[^a-zA-Z0-9:_-]+', '-', 'g'
        )), 140),
        'monitoring_repeatedly_failed',
        'Monitoring repeatedly failed',
        'Three consecutive automatic monitoring runs failed for the current UFC event. Review the Monitoring Inbox.',
        '/picks/monitoring',
        'REVIEW',
        v_failure.latest_occurred_at
      );
      v_owner_operations := v_owner_operations + 1;
    end loop;

    -- Once every included result is final, Cody receives one completion action rather
    -- than separate "all results entered" and "ready to complete" notifications.
    for v_event in
      select event.event_id, event.name
      from public.pick_events event
      where event.status = 'locked'
        and exists (
          select 1
          from public.pick_bouts bout
          where bout.event_id = event.event_id
            and bout.included_in_picks
        )
        and not exists (
          select 1
          from public.pick_bouts bout
          where bout.event_id = event.event_id
            and bout.included_in_picks
            and bout.result_status = 'pending'
        )
      order by event.starts_at, event.event_id
    loop
      perform private.publish_notification_to_profile(
        v_owner_profile_id,
        'event-ready-to-complete:' || v_event.event_id,
        'event-ready-to-complete',
        'event_ready_to_complete',
        'Event ready to complete',
        left('All included results are entered for ' ||
          coalesce(nullif(trim(v_event.name), ''), 'the UFC event') || '.', 280),
        '/picks/control',
        'COMPLETE EVENT',
        p_now
      );
      v_owner_operations := v_owner_operations + 1;
    end loop;
  end if;

  return jsonb_build_object(
    'picks_incomplete', v_picks_incomplete,
    'event_starting', v_event_starting,
    'daily_challenge', v_daily_challenge,
    'owner_operations', v_owner_operations
  );
end;
$function$;

revoke all on function public.dispatch_due_in_app_notifications(timestamptz)
  from public, anon, authenticated;
grant execute on function public.dispatch_due_in_app_notifications(timestamptz) to service_role;
