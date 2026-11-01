-- Direct GOTW reminders to their own published NFL/CFB matchup breakdown.
-- Preserve the original notification group and push-delivery identity.
create or replace function private.route_football_gotw_to_breakdown()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if new.kind = 'football_gotw_starting'
    and new.aggregation_key ~ '^football-gotw-starting:[0-9]{4}-[0-9]{2}-[0-9]{2}:(nfl|cfb)$'
  then
    new.route := '/football/gotw?league=' || split_part(new.aggregation_key, ':', 3)
      || '&week=' || split_part(new.aggregation_key, ':', 2);
  end if;
  return new;
end;
$function$;

drop trigger if exists notification_group_gotw_breakdown_route on private.notification_groups;
create trigger notification_group_gotw_breakdown_route
before insert or update of route, aggregation_key, kind
on private.notification_groups
for each row
execute function private.route_football_gotw_to_breakdown();

-- Fix already-created bell notifications; do not resend, dismiss, or reset them.
update private.notification_groups
set route = '/football/gotw?league=' || split_part(aggregation_key, ':', 3)
  || '&week=' || split_part(aggregation_key, ':', 2)
where kind = 'football_gotw_starting'
  and aggregation_key ~ '^football-gotw-starting:[0-9]{4}-[0-9]{2}-[0-9]{2}:(nfl|cfb)$'
  and route is distinct from '/football/gotw?league=' || split_part(aggregation_key, ':', 3)
    || '&week=' || split_part(aggregation_key, ':', 2);

revoke all on function private.route_football_gotw_to_breakdown() from public, anon, authenticated;
