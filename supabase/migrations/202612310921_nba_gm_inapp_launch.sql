-- One-time NBA GM launch notification in the bell/inbox only; no push.
-- Preserve all existing kind validations and preference behavior.
do $kind$
declare v_check text; v_def text;
begin
  select pg_get_constraintdef(c.oid) into v_check
    from pg_constraint c
    where c.conrelid='private.notification_groups'::regclass
      and c.conname='notification_groups_kind_valid';
  if v_check is null or position('new_game_available' in v_check)=0
    or position('CHECK (' in v_check)<>1 then
    raise exception 'Notification kind guard drifted';
  end if;
  execute 'alter table private.notification_groups drop constraint notification_groups_kind_valid';
  execute 'alter table private.notification_groups add constraint notification_groups_kind_valid '
    || replace(v_check,'CHECK (',
      'CHECK (kind = ''nba_gm_launch_available'' OR ');

  select pg_get_functiondef('private.notification_category_for_kind(text)'::regprocedure)
    into v_def;
  if position($old$'new_game_available'$old$ in v_def)=0
     or position('nba_gm_launch_available' in v_def)>0 then
    raise exception 'Notification category guard drifted';
  end if;
  execute replace(v_def,
    $old$'new_game_available'$old$,
    $new$'new_game_available', 'nba_gm_launch_available'$new$);
  if private.notification_category_for_kind('nba_gm_launch_available')<>'games'
    or private.notification_priority_for_kind('nba_gm_launch_available')<>'in_app'
  then
    raise exception 'NBA GM notification must remain games/in_app only';
  end if;
end;
$kind$;

create or replace function private.publish_nba_gm_launch_notification_once()
returns integer language plpgsql security definer set search_path='' as $notice$
declare v_profile record; v_count integer:=0;
begin
  if exists (select 1 from private.notification_events
    where source_key='new-game:nba-gm-v9-launch') then
    return 0;
  end if;
  for v_profile in select id from public.profiles order by id loop
    perform private.publish_notification_to_profile(
      v_profile.id,
      'new-game:nba-gm-v9-launch',
      'new-game:nba-gm-v9-launch',
      'nba_gm_launch_available',
      'NBA GM is live',
      'Build a seven-player roster, manage your cap and chase a championship across three seasons.',
      '/nba/gm',
      'PLAY NOW',
      now()
    );
    v_count:=v_count+1;
  end loop;
  return v_count;
end;
$notice$;

revoke all on function private.publish_nba_gm_launch_notification_once()
  from public,anon,authenticated;
grant execute on function private.publish_nba_gm_launch_notification_once()
  to service_role;

select private.publish_nba_gm_launch_notification_once();
notify pgrst, 'reload schema';
