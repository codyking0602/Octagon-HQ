-- Trusted UFC Picks fight-card automation.
-- Only structured current-card findings sourced from the official UFC event/card
-- parser may be auto-applied. Ambiguous findings remain review-only. Event header
-- artwork stays owner-managed and is intentionally untouched.

alter table public.pick_monitoring_findings
  add column if not exists reviewed_automatically boolean not null default false;

alter table public.pick_monitoring_findings
  drop constraint if exists pick_monitoring_finding_review_shape;

alter table public.pick_monitoring_findings
  add constraint pick_monitoring_finding_review_shape check (
    (
      review_status = 'new'
      and reviewed_at is null
      and reviewed_by is null
      and reviewed_automatically = false
    )
    or (
      review_status in ('reviewed','dismissed')
      and reviewed_at is not null
      and (reviewed_by is not null or reviewed_automatically = true)
    )
  );

create or replace function public.protect_pick_monitoring_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'pick monitoring evidence is append-only';
  end if;

  if tg_table_name = 'pick_monitoring_findings' then
    if (
      to_jsonb(new)
        - 'review_status'
        - 'reviewed_at'
        - 'reviewed_by'
        - 'reviewed_automatically'
        - 'approval_receipt'
    ) is distinct from (
      to_jsonb(old)
        - 'review_status'
        - 'reviewed_at'
        - 'reviewed_by'
        - 'reviewed_automatically'
        - 'approval_receipt'
    ) then
      raise exception 'pick monitoring finding evidence is immutable';
    end if;
    return new;
  end if;

  raise exception 'pick monitoring evidence is append-only';
end;
$$;

revoke all on function public.protect_pick_monitoring_evidence()
  from public, anon, authenticated, service_role;

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_type;

alter table public.pick_card_change_actions
  add constraint pick_card_change_action_type check (
    action_type in (
      'cancel_bout',
      'restore_bout',
      'replace_fighter',
      'reorder_card',
      'sync_card_segments',
      'remove_bout_from_picks',
      'restore_bout_to_picks',
      'adjust_lock_time',
      'update_event_metadata',
      'update_bout_weight_class',
      'add_bout',
      'adjust_bout_lock_time'
    )
  );

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_subject;

alter table public.pick_card_change_actions
  add constraint pick_card_change_action_subject check (
    (
      action_type in ('reorder_card', 'sync_card_segments', 'adjust_lock_time', 'update_event_metadata')
      and bout_id is null
    )
    or
    (
      action_type in (
        'cancel_bout',
        'restore_bout',
        'replace_fighter',
        'remove_bout_from_picks',
        'restore_bout_to_picks',
        'update_bout_weight_class',
        'add_bout',
        'adjust_bout_lock_time'
      )
      and bout_id is not null
    )
  );

-- Participant-facing card updates are important Picks notifications. Existing
-- repick/cancellation/add-fight notifications remain the more specific messages
-- when a mutation actually changes a member's required selection.
alter table private.notification_groups
  drop constraint if exists notification_groups_kind_valid;

alter table private.notification_groups
  add constraint notification_groups_kind_valid check (kind in (
    'war_room_mention',
    'war_room_reply',
    'war_room_invite_accepted',
    'game_challenge_received',
    'game_challenge_accepted',
    'game_opponent_finished',
    'game_challenge_result_ready',
    'game_challenge_expiring',
    'auction_action_required',
    'auction_result_ready',
    'picks_repick_required',
    'picks_fight_cancelled',
    'picks_incomplete_near_lock',
    'picks_recap_ready',
    'picks_season_result_changed',
    'picks_card_updated',
    'ufc_event_starting',
    'football_picks_open',
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available',
    'ranking_refresh_available',
    'fighter_watchlist_added',
    'card_change_detected',
    'fighter_replacement_detected',
    'fight_cancellation_detected',
    'fight_order_changed',
    'fight_moved_off_card',
    'published_card_mismatch',
    'event_draft_ready',
    'picks_card_missing',
    'odds_match_failed',
    'monitoring_repeatedly_failed',
    'provider_quota_low',
    'all_results_entered',
    'event_ready_to_complete',
    'post_lock_correction_review'
  ));

create or replace function private.notification_category_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if v_kind in (
    'war_room_mention',
    'war_room_reply',
    'war_room_invite_accepted',
    'game_challenge_received',
    'game_challenge_accepted',
    'game_opponent_finished',
    'game_challenge_result_ready',
    'game_challenge_expiring'
  ) then
    return 'social';
  end if;

  if v_kind in (
    'auction_action_required',
    'auction_result_ready',
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available'
  ) then
    return 'games';
  end if;

  if v_kind in ('ranking_refresh_available', 'fighter_watchlist_added') then
    return 'rankings';
  end if;

  if v_kind in (
    'picks_repick_required',
    'picks_fight_cancelled',
    'picks_incomplete_near_lock',
    'picks_recap_ready',
    'picks_season_result_changed',
    'picks_card_updated',
    'ufc_event_starting',
    'football_picks_open'
  ) then
    return 'picks';
  end if;

  if v_kind in (
    'card_change_detected',
    'fighter_replacement_detected',
    'fight_cancellation_detected',
    'fight_order_changed',
    'fight_moved_off_card',
    'published_card_mismatch',
    'event_draft_ready',
    'picks_card_missing',
    'odds_match_failed',
    'monitoring_repeatedly_failed',
    'provider_quota_low',
    'all_results_entered',
    'event_ready_to_complete',
    'post_lock_correction_review'
  ) then
    return 'operations';
  end if;

  raise exception 'unsupported notification kind: %', v_kind;
end;
$$;

create or replace function private.notification_priority_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if private.notification_category_for_kind(v_kind) = 'operations'
    or v_kind in (
      'war_room_mention',
      'war_room_reply',
      'game_challenge_received',
      'auction_action_required',
      'auction_result_ready',
      'picks_repick_required',
      'picks_incomplete_near_lock',
      'picks_recap_ready',
      'picks_card_updated',
      'ufc_event_starting',
      'football_picks_open',
      'new_game_available',
      'daily_challenge_four_hours'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$$;

create or replace function private.apply_pick_card_segment_sync(
  p_event_id text,
  p_expected_segments jsonb,
  p_proposed_segments jsonb,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_reason text := trim(coalesce(p_reason, ''));
  v_expected_ids text[];
  v_proposed_ids text[];
  v_item jsonb;
  v_bout public.pick_bouts;
  v_expected_segment text;
  v_expected_sequence integer;
  v_proposed_segment text;
  v_proposed_sequence integer;
  v_before jsonb;
  v_after jsonb;
  v_action_id bigint;
  v_approved_at timestamptz;
  v_preserved integer := 0;
  v_notification_count integer := 0;
  v_profile_id uuid;
  v_receipt jsonb;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'UNAUTHORIZED: pick control owner required';
  end if;

  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'STALE_STATE: segment sync reason required';
  end if;
  if jsonb_typeof(p_expected_segments) <> 'array'
    or jsonb_typeof(p_proposed_segments) <> 'array'
    or jsonb_array_length(p_expected_segments) = 0
    or jsonb_array_length(p_expected_segments) <> jsonb_array_length(p_proposed_segments) then
    raise exception 'STALE_STATE: complete expected and proposed card segments required';
  end if;

  select * into v_event
  from public.pick_events event
  where event.event_id = lower(trim(p_event_id))
  for update;

  if not found then raise exception 'STALE_STATE: event not found'; end if;
  if v_event.status <> 'upcoming' then
    raise exception 'PROHIBITED: card segment sync requires an upcoming event';
  end if;

  perform 1
  from public.pick_bouts bout
  where bout.event_id = v_event.event_id
  order by bout.position, bout.bout_id
  for update;

  select array_agg(lower(trim(item.value->>'bout_id')) order by item.ordinality)
    into v_expected_ids
  from jsonb_array_elements(p_expected_segments) with ordinality item(value, ordinality);

  select array_agg(lower(trim(item.value->>'bout_id')) order by item.ordinality)
    into v_proposed_ids
  from jsonb_array_elements(p_proposed_segments) with ordinality item(value, ordinality);

  if cardinality(v_expected_ids) <> (
      select count(distinct id) from unnest(v_expected_ids) id
    )
    or cardinality(v_proposed_ids) <> (
      select count(distinct id) from unnest(v_proposed_ids) id
    )
    or exists (
      select 1 from unnest(v_expected_ids) id
      where id = '' or not id = any(v_proposed_ids)
    )
    or exists (
      select 1 from unnest(v_proposed_ids) id
      where id = '' or not id = any(v_expected_ids)
    ) then
    raise exception 'STALE_STATE: segment sync must contain the same unique fights';
  end if;

  for v_item in select value from jsonb_array_elements(p_expected_segments)
  loop
    select * into v_bout
    from public.pick_bouts bout
    where bout.event_id = v_event.event_id
      and bout.bout_id = lower(trim(v_item->>'bout_id'));

    if not found then raise exception 'STALE_STATE: segment sync bout not found'; end if;

    v_expected_segment := nullif(trim(coalesce(v_item->>'card_segment', '')), '');
    v_expected_sequence := nullif(v_item->>'segment_sequence', '')::integer;
    if v_bout.card_segment is distinct from v_expected_segment
      or v_bout.segment_sequence is distinct from v_expected_sequence then
      raise exception 'STALE_STATE: card segment changed; refresh Picks control';
    end if;
  end loop;

  if exists (
    select 1
    from jsonb_array_elements(p_proposed_segments) proposed(value)
    where lower(trim(coalesce(proposed.value->>'card_segment', ''))) not in ('main','prelim')
      or nullif(proposed.value->>'segment_sequence', '')::integer is null
      or (proposed.value->>'segment_sequence')::integer < 1
  ) then
    raise exception 'STALE_STATE: proposed card segments are invalid';
  end if;

  if exists (
    select 1
    from (
      select
        lower(trim(proposed.value->>'card_segment')) as segment,
        (proposed.value->>'segment_sequence')::integer as sequence,
        count(*) as count
      from jsonb_array_elements(p_proposed_segments) proposed(value)
      group by 1, 2
    ) duplicate
    where duplicate.count > 1
  ) then
    raise exception 'STALE_STATE: proposed card segment slots must be unique';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_proposed_segments) proposed(value)
    join public.pick_bouts other
      on other.event_id = v_event.event_id
     and other.bout_id <> all(v_expected_ids)
     and other.card_segment = lower(trim(proposed.value->>'card_segment'))
     and other.segment_sequence = (proposed.value->>'segment_sequence')::integer
  ) then
    raise exception 'STALE_STATE: proposed card segment slot conflicts with another fight';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_proposed_segments) proposed(value)
    join jsonb_array_elements(p_expected_segments) expected(value)
      on lower(trim(expected.value->>'bout_id')) = lower(trim(proposed.value->>'bout_id'))
    join public.pick_bouts bout
      on bout.event_id = v_event.event_id
     and bout.bout_id = lower(trim(proposed.value->>'bout_id'))
    where (
      nullif(trim(coalesce(expected.value->>'card_segment', '')), '')
        is distinct from lower(trim(proposed.value->>'card_segment'))
      or nullif(expected.value->>'segment_sequence', '')::integer
        is distinct from (proposed.value->>'segment_sequence')::integer
    )
      and (
        not bout.included_in_picks
        or bout.result_status <> 'pending'
        or private.pick_bout_is_locked(v_event, bout)
      )
  ) then
    raise exception 'PROHIBITED: locked, removed, or resulted fights cannot change card segment';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_proposed_segments) proposed(value)
    where lower(trim(proposed.value->>'card_segment')) = 'prelim'
  ) and v_event.prelims_starts_at is null then
    raise exception 'PROHIBITED: prelim placement requires an official prelim start';
  end if;

  select coalesce(jsonb_agg(to_jsonb(bout) order by bout.position), '[]'::jsonb)
    into v_before
  from public.pick_bouts bout
  where bout.event_id = v_event.event_id
    and bout.bout_id = any(v_expected_ids);

  update public.pick_bouts bout
  set segment_sequence = null
  where bout.event_id = v_event.event_id
    and bout.bout_id = any(v_expected_ids);

  for v_item in select value from jsonb_array_elements(p_proposed_segments)
  loop
    v_proposed_segment := lower(trim(v_item->>'card_segment'));
    v_proposed_sequence := (v_item->>'segment_sequence')::integer;

    update public.pick_bouts bout
    set card_segment = v_proposed_segment,
        segment_sequence = v_proposed_sequence
    where bout.event_id = v_event.event_id
      and bout.bout_id = lower(trim(v_item->>'bout_id'));
  end loop;

  select coalesce(jsonb_agg(to_jsonb(bout) order by bout.position), '[]'::jsonb)
    into v_after
  from public.pick_bouts bout
  where bout.event_id = v_event.event_id
    and bout.bout_id = any(v_expected_ids);

  select count(*)::integer into v_preserved
  from public.profile_event_picks pick
  where pick.event_id = v_event.event_id;

  insert into public.pick_card_change_actions(
    event_id, bout_id, action_type, reason, before_state, after_state, approved_by, receipt
  ) values (
    v_event.event_id, null, 'sync_card_segments', v_reason, v_before, v_after, auth.uid(), '{}'::jsonb
  )
  returning action_id, approved_at into v_action_id, v_approved_at;

  for v_profile_id in
    select distinct pick.profile_id
    from public.profile_event_picks pick
    where pick.event_id = v_event.event_id
    order by pick.profile_id
  loop
    perform private.publish_notification_to_profile(
      v_profile_id,
      'pick-card-segments:' || v_action_id::text || ':' || v_profile_id::text,
      left('picks-card-updated:' || v_event.event_id || ':' || v_profile_id::text, 180),
      'picks_card_updated',
      'Fight card updated',
      'The UFC moved fights between the main card and prelims. Your submitted picks are still valid.',
      '/picks',
      'VIEW PICKS',
      v_approved_at
    );
    v_notification_count := v_notification_count + 1;
  end loop;

  v_receipt := jsonb_build_object(
    'decision', 'applied',
    'action', 'sync_card_segments',
    'event_id', v_event.event_id,
    'bout_id', null,
    'before_value', v_before,
    'after_value', v_after,
    'mutation_occurred', true,
    'finding_resolved', false,
    'picks_preserved', v_preserved,
    'picks_invalidated', 0,
    'repicks_required', false,
    'player_action_required', false,
    'required_action', null,
    'player_action_profile_ids', '[]'::jsonb,
    'deadlines_changed', false,
    'card_order_changed', true,
    'notification_recorded', v_notification_count > 0,
    'notification_count', v_notification_count,
    'remains_pending', false,
    'audit_id', v_action_id,
    'failure_code', null
  );

  update public.pick_card_change_actions
  set receipt = v_receipt
  where action_id = v_action_id;

  return v_receipt;
end;
$$;

revoke all on function private.apply_pick_card_segment_sync(text,jsonb,jsonb,text)
  from public, anon, authenticated, service_role;

create or replace function public.auto_apply_trusted_pick_monitoring_changes(
  p_run_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run public.pick_monitoring_runs;
  v_finding public.pick_monitoring_findings;
  v_finding_run public.pick_monitoring_runs;
  v_proposal jsonb;
  v_action text;
  v_receipt jsonb;
  v_applied jsonb := '[]'::jsonb;
  v_failed jsonb := '[]'::jsonb;
  v_profile_id uuid;
  v_notification_count integer;
  v_audit_id bigint;
  v_approved_at timestamptz;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service role required for trusted Picks automation';
  end if;

  select * into v_run
  from public.pick_monitoring_runs run
  where run.run_id = p_run_id
  for share;

  if not found then
    raise exception 'monitoring run not found';
  end if;

  if v_run.trigger_kind <> 'scheduled'
    or v_run.event_id is null
    or v_run.card_source is distinct from 'UFC.com event + card'
    or v_run.card_source_url !~ '^https://www\.ufc\.com/event/[a-z0-9-]+$' then
    return jsonb_build_object(
      'status', 'not_eligible',
      'run_id', p_run_id,
      'applied', v_applied,
      'failed', v_failed
    );
  end if;

  for v_finding in
    select finding.*
    from public.pick_monitoring_findings finding
    join public.pick_monitoring_runs finding_run
      on finding_run.run_id = finding.run_id
    where finding.event_id = v_run.event_id
      and finding.review_status = 'new'
      and finding.finding_type = 'card_change'
      and finding.source_details->>'monitored_event_kind' = 'current'
      and finding_run.source_event_identity = v_run.source_event_identity
      and finding_run.card_source = 'UFC.com event + card'
      and finding_run.card_source_url ~ '^https://www\.ufc\.com/event/[a-z0-9-]+$'
      and finding.source_details->'approval_proposal'->>'action' in (
        'add_bout',
        'remove_bout',
        'replace_fighter',
        'reorder_card',
        'sync_card_segments'
      )
      and not exists (
        select 1
        from public.pick_monitoring_findings newer
        join public.pick_monitoring_runs newer_run
          on newer_run.run_id = newer.run_id
        where newer.finding_id <> finding.finding_id
          and newer_run.source_event_identity = finding_run.source_event_identity
          and newer.event_id is not distinct from finding.event_id
          and private.pick_monitoring_finding_identity(newer)
            = private.pick_monitoring_finding_identity(finding)
          and (newer.detected_at, newer.created_at, newer.finding_id)
            > (finding.detected_at, finding.created_at, finding.finding_id)
      )
    order by finding.detected_at, finding.created_at, finding.finding_id
    for update of finding
  loop
    begin
      v_proposal := v_finding.source_details->'approval_proposal';
      v_action := v_proposal->>'action';

      if v_proposal->>'event_id' is distinct from v_run.event_id then
        raise exception 'STALE_STATE: monitoring proposal event does not match the current event';
      end if;

      if v_action in ('add_bout','remove_bout','replace_fighter','reorder_card') then
        v_receipt := private.apply_pick_fight_change(
          v_action,
          v_run.event_id,
          v_proposal - 'action' - 'event_id',
          'Automatic UFC card sync from trusted official monitoring evidence.'
        );
      elsif v_action = 'sync_card_segments' then
        v_receipt := private.apply_pick_card_segment_sync(
          v_run.event_id,
          v_proposal->'expected_segments',
          v_proposal->'proposed_segments',
          'Automatic UFC card sync from trusted official monitoring evidence.'
        );
      else
        continue;
      end if;

      -- Reordering alone preserves every pick, so notify every participant who has
      -- already entered this event. Other pick-affecting mutations publish their
      -- existing, more specific add/remove/repick notifications in the canonical
      -- mutation owner.
      if v_action = 'reorder_card' then
        v_notification_count := coalesce((v_receipt->>'notification_count')::integer, 0);
        v_audit_id := nullif(v_receipt->>'audit_id', '')::bigint;
        select action.approved_at into v_approved_at
        from public.pick_card_change_actions action
        where action.action_id = v_audit_id;

        for v_profile_id in
          select distinct pick.profile_id
          from public.profile_event_picks pick
          where pick.event_id = v_run.event_id
          order by pick.profile_id
        loop
          perform private.publish_notification_to_profile(
            v_profile_id,
            'pick-card-reorder:' || v_finding.finding_id::text || ':' || v_profile_id::text,
            left('picks-card-updated:' || v_run.event_id || ':' || v_profile_id::text, 180),
            'picks_card_updated',
            'Fight order updated',
            'The UFC changed the fight order. Your submitted picks are still valid.',
            '/picks',
            'VIEW PICKS',
            coalesce(v_approved_at, now())
          );
          v_notification_count := v_notification_count + 1;
        end loop;

        v_receipt := v_receipt || jsonb_build_object(
          'notification_recorded', v_notification_count > 0,
          'notification_count', v_notification_count
        );

        if v_audit_id is not null then
          update public.pick_card_change_actions
          set receipt = v_receipt
          where action_id = v_audit_id;
        end if;
      end if;

      v_receipt := v_receipt || jsonb_build_object(
        'finding_id', v_finding.finding_id,
        'finding_resolved', true,
        'reviewed_automatically', true
      );

      update public.pick_monitoring_findings finding
      set review_status = 'reviewed',
          reviewed_at = now(),
          reviewed_by = null,
          reviewed_automatically = true,
          approval_receipt = v_receipt
      where finding.finding_id = v_finding.finding_id
        and finding.review_status = 'new';

      if not found then
        raise exception 'STALE_STATE: monitoring finding changed during automatic apply';
      end if;

      v_applied := v_applied || jsonb_build_array(jsonb_build_object(
        'finding_id', v_finding.finding_id,
        'action', v_action,
        'receipt', v_receipt
      ));
    exception when others then
      v_failed := v_failed || jsonb_build_array(jsonb_build_object(
        'finding_id', v_finding.finding_id,
        'action', coalesce(v_action, v_finding.source_details->'approval_proposal'->>'action'),
        'error', sqlerrm
      ));
      -- Leave the finding new. The existing Cody-only monitoring notification and
      -- inbox remain the safe fallback whenever automatic mutation cannot prove
      -- the required stale-state/lock guards.
    end;
  end loop;

  return jsonb_build_object(
    'status', case when jsonb_array_length(v_failed) > 0 then 'needs_review' else 'applied' end,
    'run_id', p_run_id,
    'event_id', v_run.event_id,
    'applied', v_applied,
    'failed', v_failed
  );
end;
$$;

revoke all on function public.auto_apply_trusted_pick_monitoring_changes(uuid)
  from public, anon, authenticated;
grant execute on function public.auto_apply_trusted_pick_monitoring_changes(uuid)
  to service_role;

comment on function public.auto_apply_trusted_pick_monitoring_changes(uuid) is
  'Service-only fail-closed automation for exact official UFC add/remove/replace/reorder/card-segment monitoring proposals.';

notify pgrst, 'reload schema';
