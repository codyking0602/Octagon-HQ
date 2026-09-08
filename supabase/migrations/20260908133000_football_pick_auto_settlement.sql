do $$
declare
  monitoring_job_id bigint;
  monitoring_job_count integer;
begin
  select count(*), min(jobid)
  into monitoring_job_count, monitoring_job_id
  from cron.job
  where command like '%/functions/v1/run-pick-monitoring%';

  if monitoring_job_count <> 1 then
    raise exception 'expected exactly one canonical pick monitoring cron job, found %', monitoring_job_count;
  end if;

  perform cron.alter_job(
    job_id := monitoring_job_id,
    command := $command$
      select
        net.http_post(
          url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/daily-challenge-runtime',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-octagon-scheduler-token', (
              select decrypted_secret
              from vault.decrypted_secrets
              where name = 'octagon_pick_monitoring_scheduler_token'
            )
          ),
          body := '{"mode":"scheduled"}'::jsonb,
          timeout_milliseconds := 60000
        ) as daily_challenge_request_id,
        net.http_post(
          url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/sync-next-football-event',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-octagon-scheduler-token', (
              select decrypted_secret
              from vault.decrypted_secrets
              where name = 'octagon_pick_monitoring_scheduler_token'
            )
          ),
          body := '{"mode":"scheduled-finals"}'::jsonb,
          timeout_milliseconds := 60000
        ) as football_pick_settlement_request_id,
        net.http_post(
          url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/run-pick-monitoring',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-octagon-scheduler-token', (
              select decrypted_secret
              from vault.decrypted_secrets
              where name = 'octagon_pick_monitoring_scheduler_token'
            )
          ),
          body := '{"mode":"scheduled"}'::jsonb,
          timeout_milliseconds := 60000
        ) as pick_monitoring_request_id;
    $command$
  );
end
$$;

create or replace function public.get_current_pick_event(p_sport text)
returns jsonb
language sql
stable
security definer
set search_path to ''
as $function$
  with selected_event as (
    select event.*, event as event_row
    from public.pick_events event
    where event.status in ('upcoming', 'locked')
      and event.sport = case lower(trim(p_sport))
        when 'mma' then 'mma'
        when 'football' then 'football'
        else null
      end
    order by event.starts_at
    limit 1
  )
  select jsonb_build_object(
    'event_id', event.event_id,
    'sport', event.sport,
    'league', event.league,
    'event_kind', event.event_kind,
    'name', event.name,
    'subtitle', event.subtitle,
    'venue', event.venue,
    'location', event.location,
    'starts_at', event.starts_at,
    'locks_at', event.locks_at,
    'season', event.season,
    'status', case
      when event.status = 'locked' then 'locked'
      when not exists (
        select 1 from public.pick_bouts open_bout
        where open_bout.event_id = event.event_id
          and open_bout.included_in_picks
          and not private.pick_bout_is_locked(event.event_row, open_bout)
      ) then 'locked'
      else 'upcoming'
    end,
    'can_control', public.is_pick_control_owner(auth.uid()),
    'header_storage_path', event.header_storage_path,
    'header_natural_width', event.header_natural_width,
    'header_natural_height', event.header_natural_height,
    'spotlights', coalesce((
      select jsonb_agg(spotlight.value order by spotlight.ordinality)
      from jsonb_array_elements(coalesce(event.spotlights, '[]'::jsonb))
        with ordinality as spotlight(value, ordinality)
      where private.pick_event_spotlight_is_valid(event.event_id, jsonb_build_array(spotlight.value))
    ), '[]'::jsonb),
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'locks_at', coalesce(bout.locks_at, event.locks_at),
        'is_locked', private.pick_bout_is_locked(event.event_row, bout),
        'position', bout.position,
        'weight_class', bout.weight_class,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'home_team_slug', bout.home_team_slug,
        'away_team_slug', bout.away_team_slug,
        'home_team_logo_url', home_asset.logo_url,
        'away_team_logo_url', away_asset.logo_url,
        'frozen_spread_home', bout.frozen_spread_home,
        'spread_source', bout.spread_source,
        'spread_frozen_at', bout.spread_frozen_at,
        'home_final_score', bout.home_final_score,
        'away_final_score', bout.away_final_score,
        'red_american_odds', bout.red_american_odds,
        'blue_american_odds', bout.blue_american_odds,
        'odds_source', bout.odds_source,
        'odds_updated_at', bout.odds_updated_at,
        'winner_fighter_slug', bout.winner_fighter_slug,
        'result_status', bout.result_status,
        'result_recorded_at', bout.result_recorded_at,
        'included_in_picks', bout.included_in_picks,
        'repick_required', bout.included_in_picks
          and auth.uid() is not null
          and not exists (
            select 1 from public.profile_event_picks current_pick
            where current_pick.profile_id = auth.uid()
              and current_pick.event_id = bout.event_id
              and current_pick.bout_id = bout.bout_id
          )
          and exists (
            select 1
            from public.pick_card_change_actions action,
              jsonb_array_elements(action.before_state->'invalidated_picks') evidence
            where action.event_id = bout.event_id
              and action.bout_id = bout.bout_id
              and action.action_type = 'replace_fighter'
              and evidence->>'profile_id' = auth.uid()::text
          ),
        'group_picks', public.resolved_bout_group_picks(bout.event_id, bout.bout_id)
      ) order by bout.position)
      from public.pick_bouts bout
      left join public.football_team_assets home_asset on home_asset.team_slug=bout.home_team_slug
      left join public.football_team_assets away_asset on away_asset.team_slug=bout.away_team_slug
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  )
  from selected_event event;
$function$;
