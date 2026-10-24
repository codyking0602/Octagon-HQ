-- Signed owner correction for a published Football weekly Spotlight.
-- Maintain immutable player/game/editorial and real media receipts. Do not
-- introduce a second publisher, and keep anonymous browser callers excluded.
-- Only the existing OIDC main-push handoff may invoke this service_role RPC.

create or replace function public.ingest_football_weekly_editorial_handoff(
  p_week_of date, p_sport text, p_candidates jsonb,
  p_player_id text, p_game_id text, p_actor_id text, p_source_sha text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_package public.football_weekly_content_packages;
  v_kind text;
  v_array jsonb;
  v_item jsonb;
  v_player jsonb;
  v_game jsonb;
  v_choice jsonb;
  v_current jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'Private editorial integration authorization required';
  end if;
  if p_week_of is null or extract(isodow from p_week_of) <> 2
     or p_sport not in ('cfb','nfl')
     or coalesce(p_source_sha,'') !~ '^[0-9a-f]{40}$'
     or coalesce(p_actor_id,'') !~ '^[0-9]{1,20}$' then
    raise exception 'Invalid signed editorial provenance, sport or Tuesday week';
  end if;
  if (p_player_id is null) <> (p_game_id is null) then
    raise exception 'Player and game choices must be supplied together';
  end if;
  if p_player_id is not null and p_actor_id <> '284170760' then
    raise exception 'A verified GitHub owner action is required to select';
  end if;
  if now() >= ((p_week_of + 7)::timestamp at time zone 'America/Chicago') then
    raise exception 'Football editorial week has closed';
  end if;
  if p_candidates is not null then
    if jsonb_typeof(p_candidates) is distinct from 'object'
       or (select count(*) from jsonb_object_keys(p_candidates)) <> 2
       or not (p_candidates ? 'players' and p_candidates ? 'games') then
      raise exception 'Exactly two candidate arrays required';
    end if;
    foreach v_kind in array array['players','games'] loop
      v_array := p_candidates->v_kind;
      if jsonb_typeof(v_array) is distinct from 'array'
         or jsonb_array_length(v_array) <> 5
         or (select count(distinct value->>'id') from jsonb_array_elements(v_array)) <> 5 then
        raise exception 'Exactly five distinct Football % candidates required',v_kind;
      end if;
      for v_item in select value from jsonb_array_elements(v_array) loop
        if jsonb_typeof(v_item) is distinct from 'object'
           or coalesce(v_item->>'id','') !~ '^[a-z0-9][a-z0-9-]{0,79}$'
           or coalesce(trim(v_item->>'summary'),'') = '' then
          raise exception 'Invalid Football % candidate',v_kind;
        end if;
        if v_kind = 'players' then
          if coalesce(trim(v_item->>'name'),'') = ''
             or coalesce(trim(v_item->>'team'),'') = ''
             or coalesce(trim(v_item->>'position'),'') = '' then
            raise exception 'Incomplete Spotlight identity';
          end if;
        else
          if coalesce(trim(v_item->>'home_team'),'') = ''
             or coalesce(trim(v_item->>'away_team'),'') = ''
             or v_item->>'home_team' = v_item->>'away_team'
             or coalesce(trim(v_item->>'kickoff_at'),'') = '' then
            raise exception 'Incomplete matchup identity';
          end if;
          perform (v_item->>'kickoff_at')::timestamptz;
        end if;
      end loop;
    end loop;
  end if;

  insert into public.football_weekly_content_packages(week_of)
    values (p_week_of) on conflict (week_of) do nothing;
  select * into v_package from public.football_weekly_content_packages
    where week_of = p_week_of for update;
  -- Published packages are immutable except for the separately checked signed
  -- Spotlight YouTube correction below. The existing shortlist and owner choice
  -- must be byte-for-byte unchanged before the handoff can continue.
  if v_package.status = 'published' then
    if p_candidates is distinct from v_package.proposals->p_sport
       or p_player_id is null or p_game_id is null
       or p_player_id is distinct from v_package.choices->p_sport->'player'->>'id'
       or p_game_id is distinct from v_package.choices->p_sport->'game'->>'id' then
      raise exception 'Published Football choices and shortlist are immutable';
    end if;
    return to_jsonb(v_package) || jsonb_build_object(
      'release_at',(v_package.week_of::timestamp + interval '8 hours') at time zone 'America/Chicago');
  end if;
  if v_package.status not in ('draft','ready') then raise exception 'Football editorial package is locked'; end if;
  v_current := v_package.proposals->p_sport;
  if p_candidates is not null then
    if v_current is not null and v_current <> p_candidates then
      raise exception 'Existing Football shortlist differs: refusing destructive overwrite';
    end if;
    if v_current is null then
      update public.football_weekly_content_packages
      set proposals=proposals || jsonb_build_object(p_sport,p_candidates), updated_at=now()
      where week_of=p_week_of;
      v_current := p_candidates;
    end if;
  end if;
  if p_player_id is not null then
    if v_current is null then raise exception 'Cannot approve absent shortlist'; end if;
    select value into v_player from jsonb_array_elements(v_current->'players')
      where value->>'id'=p_player_id;
    select value into v_game from jsonb_array_elements(v_current->'games')
      where value->>'id'=p_game_id;
    if v_player is null or v_game is null then
      raise exception 'Owner selection must match exact staged candidate IDs';
    end if;
    v_choice := v_package.choices->p_sport;
    if v_choice is not null then
      if v_choice->'player'->>'id' <> p_player_id
         or v_choice->'game'->>'id' <> p_game_id then
        raise exception 'Existing owner selection is immutable';
      end if;
    else
      update public.football_weekly_content_packages
      set choices=choices || jsonb_build_object(p_sport,
        jsonb_build_object('player',v_player,'game',v_game,
          'selected_at',now(),'selected_via','github-oidc-owner',
          'selected_by_github_id',p_actor_id,'source_sha',p_source_sha)),
          updated_at=now()
      where week_of=p_week_of;
    end if;
  end if;
  select * into v_package from public.football_weekly_content_packages where week_of=p_week_of;
  return to_jsonb(v_package) || jsonb_build_object(
    'release_at',v_package.week_of::timestamp at time zone 'America/Chicago');
end;
$$;

create or replace function public.ingest_football_weekly_editorial_preparation(
  p_week_of date, p_sport text,
  p_spotlight jsonb, p_game jsonb, p_editorial jsonb,
  p_actor_id text, p_source_sha text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_saved jsonb;
  v_package public.football_weekly_content_packages;
  v_previous_spotlight jsonb;
  v_current_game jsonb;
  v_production jsonb;
  v_candidate_editorial jsonb;
begin
  if auth.role() is distinct from 'service_role'
     or p_actor_id <> '284170760'
     or coalesce(p_source_sha,'') !~ '^[0-9a-f]{40}$'
     or p_week_of is null
     or now() >= ((p_week_of + 7)::timestamp at time zone 'America/Chicago')
     or p_sport not in ('cfb','nfl') then
    raise exception 'Owner-signed editorial preparation authorization required';
  end if;
  select * into v_package
    from public.football_weekly_content_packages
    where week_of=p_week_of for update;
  if not found then raise exception 'Football week is missing'; end if;
  v_production := v_package.production->p_sport;
  if v_production->>'published_at' is not null then
    v_previous_spotlight := case when p_sport='cfb'
      then v_package.cfb_spotlight else v_package.nfl_spotlight end;
    v_current_game := case when p_sport='cfb'
      then v_package.cfb_game_of_week else v_package.nfl_game_of_week end;
    v_candidate_editorial := jsonb_build_object(
      'source_urls',v_production->'source_urls',
      'breakdown',v_production->'breakdown');

    -- No future-week data, athlete, stat, game, media, or editorial mutation.
    -- Only a verified GitHub-owner-signed YouTube URL may change on a
    -- previously released Spotlight; never re-arm or reset its receipts.
    if p_spotlight is null or jsonb_typeof(p_spotlight) <> 'object'
       or p_spotlight - 'highlight_url' is distinct from v_previous_spotlight - 'highlight_url'
       or p_game is distinct from v_current_game
       or p_editorial is distinct from v_candidate_editorial
       or p_spotlight->>'name' is distinct from v_package.choices->p_sport->'player'->>'name'
       or p_spotlight->>'highlight_url' !~
         '^https://(www[.])?(youtube[.]com|youtu[.]be)/(watch[?]v=|shorts/|[A-Za-z0-9_-]{11})'
       or length(p_spotlight->>'highlight_url') > 500 then
      raise exception 'Published Spotlight correction must change only the approved YouTube URL';
    end if;

    update public.football_weekly_content_packages p
    set cfb_spotlight = case when p_sport='cfb'
          then jsonb_set(p.cfb_spotlight,'{highlight_url}',p_spotlight->'highlight_url')
          else p.cfb_spotlight end,
        nfl_spotlight = case when p_sport='nfl'
          then jsonb_set(p.nfl_spotlight,'{highlight_url}',p_spotlight->'highlight_url')
          else p.nfl_spotlight end,
        updated_at = now()
    where p.week_of=p_week_of
    returning p.* into v_package;
    return to_jsonb(v_package) || jsonb_build_object(
      'release_at',(v_package.week_of::timestamp + interval '8 hours') at time zone 'America/Chicago');
  end if;

  -- Reuse the unchanged validated canonical preparation implementation;
  -- that function performs exact selected identity, four-stat, YouTube,
  -- ESPN, SeatGeek, six-section breakdown, and asset-path validation.
  v_saved := public.prepare_football_weekly_editorial(
    p_week_of,p_sport,p_spotlight,p_game,p_editorial
  );
  if v_saved->'production'->p_sport->>'prepared_at' is null then
    raise exception 'Canonical editorial preparation readback failed';
  end if;
  return v_saved;
end;
$$;

revoke all on function public.ingest_football_weekly_editorial_handoff(date,text,jsonb,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.ingest_football_weekly_editorial_handoff(date,text,jsonb,text,text,text,text)
  to service_role;
revoke all on function public.ingest_football_weekly_editorial_preparation(date,text,jsonb,jsonb,jsonb,text,text)
  from public, anon, authenticated;
grant execute on function public.ingest_football_weekly_editorial_preparation(date,text,jsonb,jsonb,jsonb,text,text)
  to service_role;
notify pgrst, 'reload schema';
