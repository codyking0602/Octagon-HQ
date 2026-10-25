-- Future-only Football Higher or Lower content history. No changes to Daily schedules.
-- The existing server-owned higher_lower grader is shared with NBA and already
-- validates all ten question ids and choices independently of the browser.
create or replace function public.get_football_higher_lower_publication_history(
  p_before_day date,
  p_limit integer default 16
) returns jsonb language plpgsql stable security definer set search_path = ''
as $function$
declare
  v_rows jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required for private Football Higher or Lower history';
  end if;
  if p_before_day is null or p_limit < 1 or p_limit > 30 then
    raise exception 'invalid Football Higher or Lower history bounds';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'day', recent.central_day::text,
    'question_ids', recent.question_ids
  ) order by recent.central_day desc), '[]'::jsonb)
  into v_rows
  from (
    select daily.central_day,
      (select coalesce(jsonb_agg(item->>'id' order by ord), '[]'::jsonb)
       from jsonb_array_elements(setup.private_setup_evidence->'board'->'questions')
       with ordinality as questions(item,ord)) as question_ids
    from private.daily_challenges daily
    join private.daily_challenge_schedule_versions schedule on schedule.version = daily.schedule_version
    join private.daily_challenge_setups setup on setup.id = daily.setup_id
    where schedule.sport = 'football' and daily.game_type = 'higher_lower'
      and daily.central_day < p_before_day
      and daily.central_day >= p_before_day - 183
    order by daily.central_day desc
    limit p_limit
  ) recent;
  return v_rows;
end;
$function$;
revoke all on function public.get_football_higher_lower_publication_history(date,integer)
from public,anon,authenticated;
grant execute on function public.get_football_higher_lower_publication_history(date,integer) to service_role;
