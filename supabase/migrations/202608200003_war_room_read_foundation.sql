alter table private.war_room_memberships
  add column if not exists last_read_message_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'war_room_memberships_last_read_message_fk'
      and conrelid = 'private.war_room_memberships'::regclass
  ) then
    alter table private.war_room_memberships
      add constraint war_room_memberships_last_read_message_fk
      foreign key (last_read_message_id)
      references private.war_room_messages(id)
      on delete set null;
  end if;
end $$;

update private.war_room_memberships membership
set last_read_message_id = (
      select message.id
      from private.war_room_messages message
      order by message.created_at desc, message.id desc
      limit 1
    ),
    updated_at = now()
where membership.status = 'active'
  and membership.last_read_message_id is null;

create or replace function private.war_room_unread_count(p_profile_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_last private.war_room_messages;
  v_count integer := 0;
begin
  select last_message.*
    into v_last
  from private.war_room_memberships membership
  join private.war_room_messages last_message
    on last_message.id = membership.last_read_message_id
  where membership.profile_id = p_profile_id
    and membership.status = 'active';

  if found then
    select count(*)::integer
      into v_count
    from private.war_room_messages message
    where message.author_profile_id <> p_profile_id
      and message.deleted_at is null
      and (message.created_at, message.id) > (v_last.created_at, v_last.id);
  else
    select count(*)::integer
      into v_count
    from private.war_room_messages message
    where message.author_profile_id <> p_profile_id
      and message.deleted_at is null;
  end if;

  return coalesce(v_count, 0);
end;
$$;

revoke all on function private.war_room_unread_count(uuid) from public, anon, authenticated;

