-- Prevent Average Fan from recycling an active current-event fact that already
-- appeared in another Daily game, and reset isolated owner preview state so the
-- October 2 preview rebuilds under the reviewed v4/v3 content contract.

create or replace function public.get_average_fan_publication_history(
  p_sport text,
  p_before_day date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_average_history jsonb;
  v_used_current_event_source_ids jsonb;
begin
  if p_sport is null or p_sport not in ('ufc', 'football') or p_before_day is null then
    raise exception 'valid Average Fan publication-history scope is required';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'day', daily.central_day,
      'sport', setup.private_setup_evidence->>'sport',
      'question_ids', coalesce(setup.private_setup_evidence->'question_ids', '[]'::jsonb),
      'final_question_id', setup.private_setup_evidence->>'final_question_id'
    )
    order by daily.central_day
  ), '[]'::jsonb)
  into v_average_history
  from private.daily_challenges daily
  join private.daily_challenge_setups setup
    on setup.id = daily.setup_id
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.game_type = 'average_fan'
    and daily.central_day < p_before_day
    and schedule.sport = p_sport
    and setup.private_setup_evidence->>'sport' in ('ufc', 'nfl', 'cfb');

  select coalesce(jsonb_agg(source_id order by source_id), '[]'::jsonb)
  into v_used_current_event_source_ids
  from (
    select distinct item->>'sourceId' as source_id
    from private.daily_challenges daily
    join private.daily_challenge_setups setup
      on setup.id = daily.setup_id
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = daily.schedule_version
    cross join lateral jsonb_path_query(
      setup.private_setup_evidence,
      '$.** ? (@.contentType == "current-event")'
    ) item
    where daily.central_day < p_before_day
      and schedule.sport = p_sport
      and nullif(item->>'sourceId', '') is not null
  ) used_sources;

  return v_average_history || jsonb_build_array(
    jsonb_build_object(
      'used_current_event_source_ids',
      coalesce(v_used_current_event_source_ids, '[]'::jsonb)
    )
  );
end;
$$;

revoke all on function public.get_average_fan_publication_history(text, date)
  from public, anon, authenticated;
grant execute on function public.get_average_fan_publication_history(text, date)
  to service_role;

-- Preview rows are non-competitive and must not preserve the pre-review questions.
delete from private.owner_average_fan_daily_preview_progress
where central_day >= date '2026-10-02';

notify pgrst, 'reload schema';
