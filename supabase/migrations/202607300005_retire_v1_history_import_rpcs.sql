-- The controlled V1 history import completed successfully. Retire only the
-- disposable service-role mutation entry points; durable profile, Picks,
-- Find the Leader, member-profile, and profile-claiming owners remain intact.
revoke all on function public.import_v1_history_atomic(jsonb)
  from public, anon, authenticated, service_role;

revoke all on function public.import_v1_history_atomic_reconciled(jsonb)
  from public, anon, authenticated, service_role;

drop function public.import_v1_history_atomic(jsonb);
drop function public.import_v1_history_atomic_reconciled(jsonb);
