-- Football Picks V1: keep the existing ESPN/The Odds API sync, staged draft,
-- publication, deadline, and result owners. This only teaches those owners how
-- to compose one weekly Football slate from repeated real-game syncs.

alter table public.pick_event_draft_bouts
  add column if not exists kickoff_at timestamptz;

-- One active Picks event per sport lets Football and UFC remain independent.
drop index if exists public.pick_events_one_active_event_idx;
create unique index if not exists pick_events_one_active_event_per_sport_idx
  on public.pick_events(sport)
  where status in ('upcoming', 'locked');

create or replace function public.stage_pick_event_draft(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
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

  -- A Football Picks week runs Tuesday through Monday. That keeps Thursday,
  -- Saturday, Sunday and Monday games in the same real weekly slate.
  v_week_start := (date_trunc('week', v_kickoff - interval '1 day') + interval '1 day')::date;
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
$$;

-- Football owner projection. The existing zero-argument UFC setup owner is left
-- untouched; the frontend calls this overload only when Football is selected.
create or replace function public.get_pick_event_setup(p_sport text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_sport text := lower(trim(coalesce(p_sport, '')));
  v_draft public.pick_event_drafts;
  v_bouts jsonb;
  v_count integer;
  v_can_publish boolean;
  v_warnings jsonb := '[]'::jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if v_sport <> 'football' then
    raise exception 'Football setup projection requires football sport';
  end if;

  select * into v_draft
  from public.pick_event_drafts draft
  where draft.state = 'staged'
    and draft.sport = 'football'
  order by draft.synced_at desc
  limit 1;
  if not found then return null; end if;

  select count(*) filter (where bout.included),
    coalesce(jsonb_agg(jsonb_build_object(
      'bout_id', bout.bout_id,
      'position', bout.position,
      'weight_class', bout.weight_class,
      'red_fighter_slug', bout.red_fighter_slug,
      'red_fighter_name', bout.red_fighter_name,
      'blue_fighter_slug', bout.blue_fighter_slug,
      'blue_fighter_name', bout.blue_fighter_name,
      'included', bout.included,
      'kickoff_at', bout.kickoff_at,
      'home_team_slug', bout.home_team_slug,
      'away_team_slug', bout.away_team_slug,
      'spread_home', bout.spread_home,
      'spread_source', bout.spread_source,
      'spread_updated_at', bout.spread_updated_at
    ) order by bout.position), '[]'::jsonb)
  into v_count, v_bouts
  from public.pick_event_draft_bouts bout
  where bout.draft_id = v_draft.draft_id;

  if v_count < 2 then
    v_warnings := v_warnings || '["ADD AT LEAST 2 FOOTBALL GAMES"]'::jsonb;
  end if;
  if v_draft.starts_at is null or v_draft.starts_at <= now() then
    v_warnings := v_warnings || '["FIRST KICKOFF MUST BE IN THE FUTURE"]'::jsonb;
  end if;
  if exists (
    select 1 from public.pick_event_draft_bouts bout
    where bout.draft_id = v_draft.draft_id and bout.included
      and (bout.kickoff_at is null or bout.home_team_slug is null or bout.away_team_slug is null
        or bout.spread_home is null or bout.spread_source <> 'the-odds-api' or bout.spread_updated_at is null)
  ) then
    v_warnings := v_warnings || '["FOOTBALL GAME DATA NEEDS REVIEW"]'::jsonb;
  end if;
  if exists (
    select 1 from public.pick_events event
    where event.sport = 'football' and event.status = 'locked'
  ) then
    v_warnings := v_warnings || '["A LOCKED FOOTBALL SLATE ALREADY EXISTS"]'::jsonb;
  end if;
  if exists (
    select 1
    from public.pick_events event
    join public.profile_event_picks pick on pick.event_id = event.event_id
    where event.sport = 'football' and event.status = 'upcoming'
  ) then
    v_warnings := v_warnings || '["THE CURRENT FOOTBALL SLATE ALREADY HAS PICKS"]'::jsonb;
  end if;

  v_can_publish := v_count >= 2
    and v_draft.starts_at is not null and v_draft.starts_at > now()
    and not exists (
      select 1 from public.pick_event_draft_bouts bout
      where bout.draft_id = v_draft.draft_id and bout.included
        and (bout.kickoff_at is null or bout.home_team_slug is null or bout.away_team_slug is null
          or bout.spread_home is null or bout.spread_source <> 'the-odds-api' or bout.spread_updated_at is null)
    )
    and not exists (select 1 from public.pick_events event where event.sport='football' and event.status='locked')
    and not exists (
      select 1 from public.pick_events event
      join public.profile_event_picks pick on pick.event_id=event.event_id
      where event.sport='football' and event.status='upcoming'
    );

  return jsonb_build_object(
    'draft_id', v_draft.draft_id,
    'source', v_draft.source,
    'source_event_key', v_draft.source_event_key,
    'source_url', v_draft.source_url,
    'event_id', v_draft.event_id,
    'sport', v_draft.sport,
    'league', v_draft.league,
    'event_kind', v_draft.event_kind,
    'name', v_draft.name,
    'subtitle', v_draft.subtitle,
    'venue', v_draft.venue,
    'location', v_draft.location,
    'starts_at', v_draft.starts_at,
    'locks_at', v_draft.locks_at,
    'season', v_draft.season,
    'state', v_draft.state,
    'synced_at', v_draft.synced_at,
    'updated_at', v_draft.updated_at,
    'warnings', v_warnings,
    'can_publish', v_can_publish,
    'spotlights', '[]'::jsonb,
    'bouts', v_bouts
  );
end;
$$;
revoke all on function public.get_pick_event_setup(text) from public, anon;
grant execute on function public.get_pick_event_setup(text) to authenticated;

-- The existing publication owner becomes sport-scoped instead of global. This
-- is the same canonical import core used by every existing wrapper.
create or replace function private.publish_pick_event_draft_import_core(p_draft_id uuid)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_draft public.pick_event_drafts;
  v_event public.pick_events;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  select * into v_draft
  from public.pick_event_drafts
  where draft_id = p_draft_id
  for update;
  if not found or v_draft.state <> 'staged' then
    raise exception 'staged event draft not found';
  end if;
  if v_draft.starts_at is null or v_draft.locks_at is null
    or nullif(trim(v_draft.venue), '') is null or nullif(trim(v_draft.location), '') is null then
    raise exception 'event draft is missing required metadata';
  end if;
  if v_draft.locks_at > v_draft.starts_at then raise exception 'Picks lock must not follow event start'; end if;
  if exists (select 1 from public.pick_events where event_id=v_draft.event_id and status='complete') then
    raise exception 'completed event drafts cannot be republished';
  end if;
  if v_draft.starts_at <= now() then raise exception 'event draft start time has passed'; end if;
  if v_draft.locks_at <= now() then raise exception 'Picks lock time has passed'; end if;
  if not exists (select 1 from public.pick_event_draft_bouts where draft_id=p_draft_id and included) then
    raise exception 'event draft has no included fights';
  end if;
  if exists (select 1 from public.pick_events where sport=v_draft.sport and status='locked') then
    raise exception 'a locked event already exists for this sport';
  end if;
  if exists (
    select 1 from public.pick_events event
    join public.profile_event_picks pick on pick.event_id=event.event_id
    where event.sport=v_draft.sport and event.status='upcoming'
  ) then
    raise exception 'the current upcoming event for this sport already has picks';
  end if;

  delete from public.pick_events where sport=v_draft.sport and status='upcoming';

  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,locks_at,season,status,updated_at,
    sport,league,event_kind
  ) values (
    v_draft.event_id,v_draft.name,v_draft.subtitle,v_draft.venue,v_draft.location,
    v_draft.starts_at,v_draft.locks_at,v_draft.season,'upcoming',now(),
    v_draft.sport,v_draft.league,v_draft.event_kind
  ) returning * into v_event;

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name,locks_at
  )
  select v_draft.event_id,bout.bout_id,row_number() over(order by bout.position)::smallint,
    bout.weight_class,bout.red_fighter_slug,bout.red_fighter_name,
    bout.blue_fighter_slug,bout.blue_fighter_name,v_draft.locks_at
  from public.pick_event_draft_bouts bout
  where bout.draft_id=p_draft_id and bout.included
  order by bout.position;

  update public.pick_event_drafts
  set state='published', published_at=now(), updated_at=now()
  where draft_id=p_draft_id;
  return v_event;
end;
$$;

-- Preserve UFC's global-event lock behavior, but Football is locked by the
-- individual game's authoritative kickoff/result. This keeps later games open
-- even if the event status itself becomes locked after an earlier kickoff.
create or replace function private.pick_bout_is_locked(
  p_event public.pick_events,
  p_bout public.pick_bouts,
  p_now timestamptz default now()
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_event.status = 'complete'
    or (p_event.sport <> 'football' and p_event.status = 'locked')
    or coalesce(p_bout.result_status, 'pending') <> 'pending'
    or (
      current_setting('octagon.pick_deadline_owner_override', true) is distinct from 'on'
      and (
        (
          p_bout.live_status_provider is distinct from 'espn'
          and p_now >= coalesce(p_bout.locks_at, p_event.locks_at)
        )
        or (
          p_bout.live_status_provider = 'espn'
          and p_bout.live_status in ('live', 'final')
          and not exists (
            select 1 from public.pick_card_change_actions action
            where action.event_id=p_event.event_id and action.bout_id=p_bout.bout_id
              and action.action_type='adjust_bout_lock_time'
              and p_bout.live_status_observed_at is not null
              and action.approved_at > p_bout.live_status_observed_at
              and nullif(action.after_state->>'locks_at','')::timestamptz is not distinct from p_bout.locks_at
              and p_bout.locks_at is not null and p_now < p_bout.locks_at
          )
        )
      )
    );
$$;

-- Keep publication as the only spread-freeze owner. Football game deadlines are
-- copied from the staged ESPN kickoff at the same publication boundary.
create or replace function public.publish_pick_event_draft(p_draft_id uuid)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_draft public.pick_event_drafts;
begin
  select * into v_draft from public.pick_event_drafts where draft_id=p_draft_id;
  if not found then raise exception 'event draft not found'; end if;

  if v_draft.sport='football' and exists (
    select 1 from public.pick_event_draft_bouts bout
    where bout.draft_id=p_draft_id and bout.included
      and (bout.kickoff_at is null or bout.spread_home is null
        or bout.home_team_slug is null or bout.away_team_slug is null
        or bout.spread_source <> 'the-odds-api' or bout.spread_updated_at is null)
  ) then
    raise exception 'Football slate requires reviewed kickoff and ATS data';
  end if;

  v_event := private.publish_pick_event_draft_football_core(p_draft_id);
  update public.pick_events
  set sport=v_draft.sport, league=v_draft.league, event_kind=v_draft.event_kind
  where event_id=v_event.event_id
  returning * into v_event;

  if v_draft.sport='football' then
    update public.pick_bouts published
    set locks_at=draft.kickoff_at,
        home_team_slug=draft.home_team_slug,
        away_team_slug=draft.away_team_slug,
        frozen_spread_home=draft.spread_home,
        spread_source=draft.spread_source,
        spread_frozen_at=now()
    from public.pick_event_draft_bouts draft
    where draft.draft_id=p_draft_id
      and published.event_id=v_event.event_id
      and published.bout_id=draft.bout_id;
  end if;
  return v_event;
end;
$$;
revoke all on function public.publish_pick_event_draft(uuid) from public, anon;
grant execute on function public.publish_pick_event_draft(uuid) to authenticated;

-- Mixed NFL/CFB slates keep league identity on each canonical game row. Final
-- ingestion therefore matches the game league, not the slate-level label.
create or replace function public.record_football_pick_final(
  p_league text,
  p_home_team_slug text,
  p_away_team_slug text,
  p_home_final_score integer,
  p_away_final_score integer
)
returns public.pick_bouts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_league text := lower(trim(p_league));
  v_home text := public.slugify_pick_text(p_home_team_slug);
  v_away text := public.slugify_pick_text(p_away_team_slug);
  v_match_count integer;
  v_bout public.pick_bouts;
  v_event public.pick_events;
  v_result_status text;
  v_winner_slug text;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'service role required'; end if;
  if v_league not in ('nfl','college-football') then raise exception 'football final league is invalid'; end if;
  if nullif(v_home,'') is null or nullif(v_away,'') is null or v_home=v_away then
    raise exception 'football final teams are invalid';
  end if;
  if p_home_final_score is null or p_away_final_score is null
    or p_home_final_score < 0 or p_away_final_score < 0 then
    raise exception 'football final scores are invalid';
  end if;

  select count(*) into v_match_count
  from public.pick_bouts bout
  join public.pick_events event on event.event_id=bout.event_id
  where event.sport='football' and event.status in ('upcoming','locked')
    and lower(bout.weight_class)=v_league || ' ats'
    and bout.included_in_picks and bout.home_team_slug=v_home and bout.away_team_slug=v_away;
  if v_match_count <> 1 then
    raise exception 'expected exactly one active published Football game, found %', v_match_count;
  end if;

  select bout.* into v_bout
  from public.pick_bouts bout
  join public.pick_events event on event.event_id=bout.event_id
  where event.sport='football' and event.status in ('upcoming','locked')
    and lower(bout.weight_class)=v_league || ' ats'
    and bout.included_in_picks and bout.home_team_slug=v_home and bout.away_team_slug=v_away
  for update of bout;

  if v_bout.red_fighter_slug <> v_home or v_bout.blue_fighter_slug <> v_away then
    raise exception 'published Football game identity is inconsistent';
  end if;
  if v_bout.result_status <> 'pending' then
    if v_bout.home_final_score=p_home_final_score and v_bout.away_final_score=p_away_final_score then return v_bout; end if;
    raise exception 'published Football result is already recorded with different scores';
  end if;

  if p_home_final_score > p_away_final_score then
    v_result_status := 'red_win'; v_winner_slug := v_home;
  elsif p_away_final_score > p_home_final_score then
    v_result_status := 'blue_win'; v_winner_slug := v_away;
  else
    v_result_status := 'draw'; v_winner_slug := null;
  end if;

  update public.pick_bouts
  set home_final_score=p_home_final_score, away_final_score=p_away_final_score,
      result_status=v_result_status, winner_fighter_slug=v_winner_slug, result_recorded_at=now()
  where event_id=v_bout.event_id and bout_id=v_bout.bout_id
  returning * into v_bout;

  if not exists (
    select 1 from public.pick_bouts pending
    where pending.event_id=v_bout.event_id and pending.included_in_picks and pending.result_status='pending'
  ) then
    select * into v_event from public.pick_events where event_id=v_bout.event_id;
    if v_event.status='upcoming' then perform public.transition_pick_event(v_bout.event_id,'locked'); end if;
    perform public.transition_pick_event(v_bout.event_id,'complete');
  end if;
  return v_bout;
end;
$$;

notify pgrst, 'reload schema';
