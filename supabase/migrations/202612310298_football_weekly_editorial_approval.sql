-- Phase 2: durable five-option CFB/NFL shortlists and owner selection receipts.
-- Approvals do not publish or change the established Home/Picks rendering systems.
alter table public.football_weekly_content_packages
  add column if not exists proposals jsonb not null default '{}'::jsonb,
  add column if not exists choices jsonb not null default '{}'::jsonb;
alter table public.football_weekly_content_packages
  add constraint football_weekly_proposals_object check (jsonb_typeof(proposals) = 'object'),
  add constraint football_weekly_choices_object check (jsonb_typeof(choices) = 'object');

-- Keep the Phase 1 getter current; no new public row access is granted.
create or replace function public.get_football_weekly_content_package(p_week_of date)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare v_result jsonb;
begin
  if auth.uid() is null or not public.is_pick_control_owner(auth.uid()) then
    raise exception 'Football editorial owner access required';
  end if;
  select to_jsonb(p) || jsonb_build_object(
    'release_at', p.week_of::timestamp at time zone 'America/Chicago'
  ) into v_result
  from public.football_weekly_content_packages p where p.week_of = p_week_of;
  return v_result;
end;
$$;

-- Candidate staging is owner-only; it replaces only the named sport, not the other.
-- Never silently replace candidate IDs after the owner's choice has been captured.
create or replace function public.stage_football_weekly_editorial_candidates(
  p_week_of date, p_sport text, p_candidates jsonb
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_item jsonb;
  v_saved public.football_weekly_content_packages;
  v_kind text;
  v_arr jsonb;
begin
  if auth.uid() is null or not public.is_pick_control_owner(auth.uid()) then
    raise exception 'Football editorial owner access required';
  end if;
  if p_week_of is null or extract(isodow from p_week_of) <> 2 then
    raise exception 'Football editorial week must begin Tuesday in America/Chicago';
  end if;
  if p_sport not in ('cfb','nfl') then raise exception 'Unsupported editorial sport'; end if;
  if p_candidates is null or jsonb_typeof(p_candidates) <> 'object'
    or (select count(*) from jsonb_object_keys(p_candidates)) <> 2
    or not p_candidates ? 'players' or not p_candidates ? 'games' then
    raise exception 'Editorial candidates require players and games only';
  end if;

  for v_kind in select unnest(array['players','games']) loop
    v_arr := p_candidates->v_kind;
    if jsonb_typeof(v_arr) is distinct from 'array' or jsonb_array_length(v_arr) <> 5 then
      raise exception 'Football editorial % shortlist must contain five candidates',v_kind;
    end if;
    if (select count(distinct candidate->>'id') from jsonb_array_elements(v_arr) candidate) <> 5 then
      raise exception 'Football editorial % candidate IDs must be unique',v_kind;
    end if;
    for v_item in select value from jsonb_array_elements(v_arr) loop
      if jsonb_typeof(v_item) <> 'object'
        or coalesce(v_item->>'id','') !~ '^[a-z0-9][a-z0-9-]{0,79}$'
        or coalesce(trim(v_item->>'summary'),'') = '' then
        raise exception 'Invalid Football editorial % candidate',v_kind;
      end if;
      if v_kind = 'players' then
        if coalesce(trim(v_item->>'name'),'') = ''
          or coalesce(trim(v_item->>'team'),'') = ''
          or coalesce(trim(v_item->>'position'),'') = '' then
          raise exception 'Player shortlist candidate requires name, team and position';
        end if;
      else
        if coalesce(trim(v_item->>'home_team'),'') = ''
          or coalesce(trim(v_item->>'away_team'),'') = ''
          or v_item->>'home_team' = v_item->>'away_team'
          or coalesce(trim(v_item->>'kickoff_at'),'') = '' then
          raise exception 'Game shortlist requires distinct opponents and kickoff';
        end if;
        perform (v_item->>'kickoff_at')::timestamptz;
      end if;
    end loop;
  end loop;

  insert into public.football_weekly_content_packages (week_of)
    values (p_week_of) on conflict (week_of) do nothing;
  update public.football_weekly_content_packages p
    set proposals = p.proposals || jsonb_build_object(p_sport,p_candidates),
        updated_at = now()
  where p.week_of = p_week_of
    and p.status = 'draft'
    and not (p.choices ? p_sport)
  returning p.* into v_saved;
  if not found then raise exception 'Football shortlist is locked after a choice or publication'; end if;

  return to_jsonb(v_saved) || jsonb_build_object(
    'release_at', v_saved.week_of::timestamp at time zone 'America/Chicago'
  );
end;
$$;
revoke all on function public.stage_football_weekly_editorial_candidates(date,text,jsonb) from public, anon;
grant execute on function public.stage_football_weekly_editorial_candidates(date,text,jsonb) to authenticated;

-- Choose the player and GOTW from the staged shortlist, never an unverified free-text ID.
-- Selections are stored as immutable-option snapshots with auditable identity/time.
create or replace function public.select_football_weekly_editorial_choices(
  p_week_of date, p_sport text, p_player_id text, p_game_id text
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_package public.football_weekly_content_packages;
  v_player jsonb;
  v_game jsonb;
  v_receipt jsonb;
begin
  if auth.uid() is null or not public.is_pick_control_owner(auth.uid()) then
    raise exception 'Football editorial owner access required';
  end if;
  if p_week_of is null or extract(isodow from p_week_of) <> 2 then
    raise exception 'Football editorial week must begin Tuesday in America/Chicago';
  end if;
  if p_sport not in ('cfb','nfl') then raise exception 'Unsupported editorial sport'; end if;

  select * into v_package
  from public.football_weekly_content_packages p
  where p.week_of = p_week_of for update;
  if not found or v_package.status <> 'draft' then
    raise exception 'Football editorial package is not an editable draft';
  end if;
  if v_package.proposals->p_sport is null then
    raise exception 'No researched Football candidates staged for this sport';
  end if;

  select value into v_player
  from jsonb_array_elements(v_package.proposals->p_sport->'players')
  where value->>'id' = p_player_id;
  select value into v_game
  from jsonb_array_elements(v_package.proposals->p_sport->'games')
  where value->>'id' = p_game_id;
  if v_player is null or v_game is null then
    raise exception 'The selected Football player or game is not in the current shortlist';
  end if;

  v_receipt := jsonb_build_object(
    'player',v_player,'game',v_game,
    'selected_at',now(),'selected_by',auth.uid()
  );
  update public.football_weekly_content_packages p
  set choices = v_package.choices || jsonb_build_object(p_sport,v_receipt),
      updated_at = now()
  where p.week_of = p_week_of
  returning p.* into v_package;

  return to_jsonb(v_package) || jsonb_build_object(
    'release_at', v_package.week_of::timestamp at time zone 'America/Chicago'
  );
end;
$$;
revoke all on function public.select_football_weekly_editorial_choices(date,text,text,text) from public, anon;
grant execute on function public.select_football_weekly_editorial_choices(date,text,text,text) to authenticated;

notify pgrst, 'reload schema';
