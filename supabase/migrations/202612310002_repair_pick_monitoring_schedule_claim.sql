-- Repair the one canonical automatic Picks monitoring claim boundary in place.
-- Production cron wakes were reaching the canonical runner but the service-role claim
-- RPC failed before the MMA Mania preview or The Odds API could run. Recreate only
-- that existing RPC, remove the obsolete historical overload if it survives anywhere,
-- and make the claim independent of a table-column default while preserving the
-- same atomic lease semantics.

drop function if exists public.claim_pick_monitoring_schedule(text, timestamptz, timestamptz);
drop function if exists public.claim_pick_monitoring_schedule(text, timestamptz);

create function public.claim_pick_monitoring_schedule(
  p_source_event_identity text,
  p_now timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to claim pick monitoring schedule';
  end if;
  if length(trim(coalesce(p_source_event_identity, ''))) = 0 then
    raise exception 'invalid pick monitoring schedule claim';
  end if;

  -- Existing identity: acquire only when due and no live claim exists. PostgreSQL
  -- rechecks the predicate after any concurrent row lock, so only one caller wins.
  update public.pick_monitoring_schedule_state
  set lease_until = p_now + interval '15 minutes',
      last_claimed_at = p_now,
      updated_at = now()
  where source_event_identity = p_source_event_identity
    and next_eligible_at <= p_now
    and (
      lease_until is null
      or lease_until <= p_now
    );

  if found then
    return true;
  end if;

  -- First claim for a newly monitored event. Supply next_eligible_at explicitly so
  -- this canonical runtime does not depend on historical production column defaults.
  insert into public.pick_monitoring_schedule_state (
    source_event_identity,
    next_eligible_at,
    lease_until,
    last_claimed_at,
    updated_at
  ) values (
    p_source_event_identity,
    '-infinity'::timestamptz,
    p_now + interval '15 minutes',
    p_now,
    now()
  )
  on conflict (source_event_identity) do nothing;

  return found;
end;
$$;

revoke all on function public.claim_pick_monitoring_schedule(text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.claim_pick_monitoring_schedule(text, timestamptz)
  to service_role;

notify pgrst, 'reload schema';
