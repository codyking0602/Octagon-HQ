-- Allow authenticated storage policies to evaluate the existing Picks owner helper.
-- The helper remains the single authorization owner; anon/public execution stays revoked.

revoke all on function public.is_pick_control_owner(uuid) from public, anon;
grant execute on function public.is_pick_control_owner(uuid) to authenticated;
