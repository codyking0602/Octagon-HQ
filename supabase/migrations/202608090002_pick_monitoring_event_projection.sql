-- Preserve the canonical Event Setup projection when scheduled monitoring asks the
-- existing source-preview owner to compare a staged card. The original scheduler
-- migration intentionally read the same tables but omitted source metadata that the
-- existing sourceChanges comparison requires.

create or replace function public.get_pick_monitoring_event_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_staged jsonb;
  v_current jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to read pick monitoring event state';
  end if;

  select jsonb_build_object(
    'draft_id', draft.draft_id,
    'source', draft.source,
    'source_event_key', draft.source_event_key,
    'source_url', draft.source_url,
    'event_id', draft.event_id,
    'name', draft.name,
    'subtitle', draft.subtitle,
    'venue', draft.venue,
    'location', draft.location,
    'starts_at', draft.starts_at,
    'locks_at', draft.locks_at,
    'season', draft.season,
    'state', draft.state,
    'synced_at', draft.synced_at,
    'updated_at', draft.updated_at,
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'position', bout.position,
        'weight_class', bout.weight_class,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'included', bout.included
      ) order by bout.position)
      from public.pick_event_draft_bouts bout
      where bout.draft_id = draft.draft_id
    ), '[]'::jsonb)
  ) into v_staged
  from public.pick_event_drafts draft
  where draft.state = 'staged'
  order by draft.synced_at desc
  limit 1;

  select jsonb_build_object(
    'event_id', event.event_id,
    'name', event.name,
    'subtitle', event.subtitle,
    'starts_at', event.starts_at,
    'locks_at', event.locks_at,
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'position', bout.position,
        'weight_class', bout.weight_class,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'red_american_odds', bout.red_american_odds,
        'blue_american_odds', bout.blue_american_odds
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  ) into v_current
  from public.pick_events event
  where event.status in ('upcoming', 'locked')
  order by event.starts_at asc
  limit 1;

  return jsonb_build_object('staged', v_staged, 'current', v_current);
end;
$$;

revoke all on function public.get_pick_monitoring_event_state() from public, anon, authenticated;
grant execute on function public.get_pick_monitoring_event_state() to service_role;
