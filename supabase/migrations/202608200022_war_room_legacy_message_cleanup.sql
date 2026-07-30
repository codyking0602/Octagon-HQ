-- Remove the two legacy Cody test messages that predate the current deletion path.
-- The selector is intentionally exact: author, body, Central-time date, hour, and minute.

do $cleanup$
declare
  v_yo_count integer;
  v_sup_count integer;
begin
  select count(*)::integer
    into v_yo_count
  from private.war_room_messages message
  join public.profiles profile on profile.id = message.author_profile_id
  where upper(trim(profile.display_name)) = 'CODY'
    and message.body = 'Yo'
    and date_trunc('minute', timezone('America/Chicago', message.created_at))
      = timestamp '2026-07-29 13:46:00';

  select count(*)::integer
    into v_sup_count
  from private.war_room_messages message
  join public.profiles profile on profile.id = message.author_profile_id
  where upper(trim(profile.display_name)) = 'CODY'
    and message.body = 'Sup'
    and date_trunc('minute', timezone('America/Chicago', message.created_at))
      = timestamp '2026-07-29 14:37:00';

  if v_yo_count > 1 or v_sup_count > 1 then
    raise exception 'Legacy War Room cleanup selector matched more than one message';
  end if;

  delete from private.war_room_reactions reaction
  where reaction.message_id in (
    select message.id
    from private.war_room_messages message
    join public.profiles profile on profile.id = message.author_profile_id
    where upper(trim(profile.display_name)) = 'CODY'
      and (
        (
          message.body = 'Yo'
          and date_trunc('minute', timezone('America/Chicago', message.created_at))
            = timestamp '2026-07-29 13:46:00'
        )
        or (
          message.body = 'Sup'
          and date_trunc('minute', timezone('America/Chicago', message.created_at))
            = timestamp '2026-07-29 14:37:00'
        )
      )
  );

  update private.war_room_messages message
  set deleted_at = coalesce(message.deleted_at, now()),
      deleted_by_profile_id = coalesce(message.deleted_by_profile_id, message.author_profile_id)
  from public.profiles profile
  where profile.id = message.author_profile_id
    and upper(trim(profile.display_name)) = 'CODY'
    and (
      (
        message.body = 'Yo'
        and date_trunc('minute', timezone('America/Chicago', message.created_at))
          = timestamp '2026-07-29 13:46:00'
      )
      or (
        message.body = 'Sup'
        and date_trunc('minute', timezone('America/Chicago', message.created_at))
          = timestamp '2026-07-29 14:37:00'
      )
    );
end;
$cleanup$;

notify pgrst, 'reload schema';
