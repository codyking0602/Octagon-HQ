-- Stage 21: release Football Draft Room to all authenticated members.
--
-- Draft Room was intentionally built behind this single backend release switch.
-- Preserve the shared Auction lifecycle and simply open every already-supported
-- Draft Room mode to normal authenticated member challenges.

create or replace function private.draft_room_public_release_enabled()
returns boolean
language sql
immutable
set search_path = ''
as $$
  select true;
$$;

revoke all on function private.draft_room_public_release_enabled() from public, anon, authenticated;

do $$
begin
  if not private.draft_room_public_release_enabled() then
    raise exception 'Draft Room public release switch did not enable';
  end if;
end;
$$;
