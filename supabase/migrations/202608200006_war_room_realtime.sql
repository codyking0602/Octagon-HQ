create or replace function public.can_receive_war_room_realtime()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.war_room_memberships membership
    where membership.profile_id = auth.uid()
      and membership.status = 'active'
  );
$$;

revoke all on function public.can_receive_war_room_realtime() from public, anon;
grant execute on function public.can_receive_war_room_realtime() to authenticated;

drop policy if exists war_room_members_receive_broadcast on realtime.messages;
create policy war_room_members_receive_broadcast
on realtime.messages
for select
to authenticated
using (
  realtime.topic() = 'war-room:conversation'
  and extension = 'broadcast'
  and public.can_receive_war_room_realtime()
);

create or replace function private.broadcast_war_room_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object(
      'message_id', new.id,
      'operation', lower(tg_op)
    ),
    'war_room_changed',
    'war-room:conversation',
    true
  );
  return null;
end;
$$;

revoke all on function private.broadcast_war_room_change() from public, anon, authenticated;

drop trigger if exists war_room_messages_broadcast on private.war_room_messages;
create trigger war_room_messages_broadcast
after insert or update on private.war_room_messages
for each row execute function private.broadcast_war_room_change();

revoke all on function public.mark_war_room_read(uuid) from public, anon;
grant execute on function public.mark_war_room_read(uuid) to authenticated;

revoke all on function public.get_my_war_room_access(text) from public, anon;
revoke all on function public.join_war_room_with_invite(text) from public, anon;
revoke all on function public.get_war_room_snapshot(timestamptz, uuid, integer) from public, anon;
grant execute on function public.get_my_war_room_access(text) to authenticated;
grant execute on function public.join_war_room_with_invite(text) to authenticated;
grant execute on function public.get_war_room_snapshot(timestamptz, uuid, integer) to authenticated;
