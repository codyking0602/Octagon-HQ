create or replace function private.publish_pick_monitoring_finding_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_profile_id uuid;
  v_kind text;
  v_title text;
  v_event_key text;
  v_aggregation_key text;
begin
  if new.review_status <> 'new' then
    return new;
  end if;

  -- Ordinary line movement and newly available odds remain evidence-only.
  if new.finding_type in ('odds_change', 'odds_available') then
    return new;
  end if;

  if new.finding_type = 'card_change' then
    if new.summary = 'Fight order changed.' then
      v_kind := 'fight_order_changed';
      v_title := 'Fight order changed';
    elsif new.summary ~ '^Removed ' then
      v_kind := 'fight_moved_off_card';
      v_title := 'Fight moved off monitored card';
    else
      v_kind := 'card_change_detected';
      v_title := 'Card change detected';
    end if;
  elsif new.finding_type = 'unmatched_fight' then
    v_kind := 'odds_match_failed';
    v_title := 'Odds match failed';
  elsif new.finding_type = 'provider_error'
    and new.matchup_identity is not null
    and new.severity in ('warning', 'error') then
    v_kind := 'odds_match_failed';
    v_title := 'Odds match failed';
  elsif new.finding_type = 'quota_warning' then
    v_kind := 'provider_quota_low';
    v_title := case
      when lower(new.summary) like '%exhausted%' then 'Odds provider quota exhausted'
      else 'Odds provider quota is low'
    end;
  else
    -- Global provider failures need a proven repeated-failure rule before notifying.
    return new;
  end if;

  select owner.profile_id
    into v_owner_profile_id
  from private.notification_owner owner
  where owner.singleton = true;

  -- Monitoring evidence must still record if the owner profile is temporarily absent.
  if v_owner_profile_id is null then
    return new;
  end if;

  v_event_key := lower(regexp_replace(
    coalesce(
      nullif(trim(new.event_id), ''),
      nullif(trim(new.source_details->>'source_event_identity'), ''),
      new.run_id::text
    ),
    '[^a-z0-9:_-]+',
    '-',
    'g'
  ));
  v_aggregation_key := left(
    'pick-monitoring:' || v_kind || ':' || v_event_key,
    180
  );

  perform private.publish_notification_to_profile(
    v_owner_profile_id,
    'pick-monitoring-finding:' || new.finding_id::text,
    v_aggregation_key,
    v_kind,
    v_title,
    left(trim(new.summary), 280),
    '/picks/monitoring',
    'REVIEW',
    new.detected_at
  );

  return new;
end;
$$;

revoke all on function private.publish_pick_monitoring_finding_notification()
  from public, anon, authenticated;

drop trigger if exists publish_pick_monitoring_finding_notification
  on public.pick_monitoring_findings;
create trigger publish_pick_monitoring_finding_notification
after insert on public.pick_monitoring_findings
for each row execute function private.publish_pick_monitoring_finding_notification();

comment on function private.publish_pick_monitoring_finding_notification() is
  'Routes only meaningful new Picks monitoring findings to the canonical Cody-only notification owner without applying any card change.';
