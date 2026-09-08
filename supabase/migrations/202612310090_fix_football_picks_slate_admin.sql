create or replace function public.stage_pick_event_draft(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_draft_id uuid;
  v_sport text := coalesce(nullif(trim(p_payload->>'sport'), ''), 'mma');
  v_source text := coalesce(nullif(trim(p_payload->>'source'), ''), 'ufc.com');
  v_kickoff timestamptz;
  v_week_start date;
  v_week_key text;
  v_existing_state text;
  v_existing_bouts jsonb := '[]'::jsonb;
  v_merged_bouts jsonb := '[]'::jsonb;
  v_slate_start timestamptz;
  v_slate_league text;
  v_slate_payload jsonb;
begin
  if v_sport not in ('mma', 'football') then
    raise exception 'unsupported Picks sport';
  end if;

  -- Preserve the established UFC staging behavior byte-for-byte in ownership:
  -- the same private core remains the only staging implementation.
  if v_sport <> 'football' then
    v_draft_id := private.stage_pick_event_draft_football_core(p_payload);
    update public.pick_event_drafts
    set sport = v_sport,
        league = nullif(trim(p_payload->>'league'), ''),
        event_kind = coalesce(nullif(p_payload->>'event_kind', ''), 'fight_card')
    where draft_id = v_draft_id;
    return v_draft_id;
  end if;

  if nullif(trim(p_payload->>'league'), '') is null
    or lower(trim(p_payload->>'league')) not in ('nfl', 'college-football')
    or p_payload->>'event_kind' <> 'game'
    or jsonb_typeof(coalesce(p_payload->'bouts', '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(p_payload->'bouts', '[]'::jsonb)) <> 1 then
    raise exception 'football event metadata is incomplete';
  end if;

  v_kickoff := nullif(p_payload->'bouts'->0->>'kickoff_at', '')::timestamptz;
  if v_kickoff is null then
    raise exception 'football kickoff is required';
  end if;

  -- A Football Picks week runs Tuesday through Monday in Eastern time. Using
  -- UTC here incorrectly moves late Monday-night games into the next slate.
  v_week_start := (
    date_trunc('week', (v_kickoff at time zone 'America/New_York') - interval '1 day')
    + interval '1 day'
  )::date;
  v_week_key := 'football-slate:' || to_char(v_week_start, 'YYYY-MM-DD');

  select draft.draft_id, draft.state
  into v_draft_id, v_existing_state
  from public.pick_event_drafts draft
  where draft.source = v_source
    and draft.source_event_key = v_week_key
  for update;

  if v_existing_state = 'published' then
    raise exception 'published Football slate cannot be restaged';
  end if;

  if v_draft_id is not null then
    select coalesce(jsonb_agg(jsonb_build_object(
      'bout_id', bout.bout_id,
      'position', bout.position,
      'weight_class', bout.weight_class,
      'red_fighter_slug', bout.red_fighter_slug,
      'red_fighter_name', bout.red_fighter_name,
      'blue_fighter_slug', bout.blue_fighter_slug,
      'blue_fighter_name', bout.blue_fighter_name,
      'kickoff_at', bout.kickoff_at,
      'home_team_slug', bout.home_team_slug,
      'away_team_slug', bout.away_team_slug,
      'spread_home', bout.spread_home,
      'spread_source', bout.spread_source,
      'spread_updated_at', bout.spread_updated_at,
      'included', bout.included
    ) order by bout.position), '[]'::jsonb)
    into v_existing_bouts
    from public.pick_event_draft_bouts bout
    where bout.draft_id = v_draft_id;
  end if;

  with incoming as (
    select p_payload->'bouts'->0 as item
  ), combined as (
    select value as item
    from jsonb_array_elements(v_existing_bouts)
    where public.slugify_pick_text(value->>'bout_id') <>
      public.slugify_pick_text((select item->>'bout_id' from incoming))
    union all
    select item from incoming
  ), ranked as (
    select item,
      row_number() over (
        order by nullif(item->>'kickoff_at', '')::timestamptz,
          public.slugify_pick_text(item->>'bout_id')
      )::integer as position
    from combined
  )
  select jsonb_agg(
    jsonb_set(
      jsonb_set(
        jsonb_set(item, '{position}', to_jsonb(position), true),
        '{card_segment}', '"main"'::jsonb, true
      ),
      '{segment_sequence}', to_jsonb(position), true
    )
    order by position
  )
  into v_merged_bouts
  from ranked;

  select min(nullif(item->>'kickoff_at', '')::timestamptz)
  into v_slate_start
  from jsonb_array_elements(v_merged_bouts) item;

  select case
    when count(distinct lower(replace(item->>'weight_class', ' ATS', ''))) = 1
      then min(lower(replace(item->>'weight_class', ' ATS', '')))
    else 'mixed'
  end
  into v_slate_league
  from jsonb_array_elements(v_merged_bouts) item;

  v_slate_payload := jsonb_build_object(
    'source', v_source,
    'source_event_key', v_week_key,
    'source_url', coalesce(nullif(trim(p_payload->>'source_url'), ''), 'https://www.espn.com/football/'),
    'sport', 'football',
    'league', v_slate_league,
    'event_kind', 'slate',
    'event_id', 'football-picks-' || to_char(v_week_start, 'YYYY-MM-DD'),
    'name', 'Football Picks · Week of ' || to_char(v_week_start, 'Mon FMDD'),
    'subtitle', 'Weekly ATS slate',
    'venue', 'Multiple venues',
    'location', case when v_slate_league = 'mixed' then 'NFL + College Football' else upper(v_slate_league) end,
    'starts_at', v_slate_start,
    'locks_at', v_slate_start,
    'season', (p_payload->>'season')::smallint,
    'bouts', v_merged_bouts
  );

  v_draft_id := private.stage_pick_event_draft_football_core(v_slate_payload);

  update public.pick_event_drafts
  set sport = 'football',
      league = v_slate_league,
      event_kind = 'slate'
  where draft_id = v_draft_id;

  update public.pick_event_draft_bouts bout
  set kickoff_at = nullif(item.value->>'kickoff_at', '')::timestamptz,
      home_team_slug = public.slugify_pick_text(item.value->>'home_team_slug'),
      away_team_slug = public.slugify_pick_text(item.value->>'away_team_slug'),
      spread_home = (item.value->>'spread_home')::numeric,
      spread_source = item.value->>'spread_source',
      spread_updated_at = nullif(item.value->>'spread_updated_at', '')::timestamptz
  from jsonb_array_elements(v_merged_bouts) item
  where bout.draft_id = v_draft_id
    and bout.bout_id = public.slugify_pick_text(item.value->>'bout_id');

  if exists (
    select 1
    from public.pick_event_draft_bouts bout
    where bout.draft_id = v_draft_id
      and bout.included
      and (
        bout.kickoff_at is null
        or bout.home_team_slug is null
        or bout.away_team_slug is null
        or bout.home_team_slug = bout.away_team_slug
        or bout.spread_home is null
        or bout.spread_source <> 'the-odds-api'
        or bout.spread_updated_at is null
      )
  ) then
    raise exception 'football ATS metadata is incomplete';
  end if;

  return v_draft_id;
end;
$function$;

create or replace function public.send_active_pick_event_push(p_event_id text, p_event_title text)
returns integer
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_event public.pick_events;
  v_profile record;
  v_published integer := 0;
  v_target_type text;
  v_notification_type text;
  v_body text;
  v_route text;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  select event.* into v_event
  from public.pick_events event
  where event.event_id = p_event_id
    and event.status in ('upcoming', 'locked');

  if not found or v_event.name <> trim(p_event_title) then
    raise exception 'active pick event changed';
  end if;

  if coalesce(v_event.sport, 'mma') = 'football' then
    v_target_type := 'football-event:' || v_event.event_id;
    v_notification_type := 'football_picks_open';
    v_body := 'This week''s Football Picks slate is published. Make your picks before kickoff.';
    v_route := '/football/picks';
  else
    v_target_type := 'ufc-event:' || v_event.event_id;
    v_notification_type := 'ufc_event_starting';
    v_body := 'The active UFC card is published. Make your picks before the deadline.';
    v_route := '/picks';
  end if;

  for v_profile in select profile.id from public.profiles profile order by profile.id
  loop
    perform private.publish_notification_to_profile(
      v_profile.id,
      'manual-event-push:' || v_event.event_id || ':' || extensions.gen_random_uuid()::text,
      v_target_type,
      v_notification_type,
      v_event.name || ' picks are open',
      v_body,
      v_route,
      'MAKE PICKS',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$function$;
