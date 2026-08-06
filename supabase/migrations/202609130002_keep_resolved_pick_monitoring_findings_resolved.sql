-- Repeated provider runs may confirm the same exact event/subject/field/value.
-- Preserve the first finding and its review history instead of recreating the
-- same owner work after it has already been reviewed or dismissed.

create or replace function private.deduplicate_current_pick_monitoring_finding()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_event_identity text;
begin
  select run.source_event_identity
    into v_source_event_identity
  from public.pick_monitoring_runs run
  where run.run_id = new.run_id;

  if exists (
    select 1
    from public.pick_monitoring_findings existing
    join public.pick_monitoring_runs run on run.run_id = existing.run_id
    where existing.finding_key = new.finding_key
      and existing.event_id is not distinct from new.event_id
      and run.source_event_identity = v_source_event_identity
  ) then
    return null;
  end if;

  return new;
end;
$$;

revoke all on function private.deduplicate_current_pick_monitoring_finding()
  from public, anon, authenticated, service_role;
