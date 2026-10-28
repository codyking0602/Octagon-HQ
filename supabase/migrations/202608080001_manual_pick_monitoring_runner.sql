-- Narrow informational evidence for a canonical bout that has no stored odds.
alter table public.pick_monitoring_findings drop constraint pick_monitoring_finding_type;
alter table public.pick_monitoring_findings add constraint pick_monitoring_finding_type check (
  finding_type in ('card_change','odds_change','odds_available','unmatched_fight','provider_error','quota_warning')
);
