-- Canonical Tuesday-to-Monday Football editorial drafts. No public publishing in phase 1.
create table if not exists public.football_weekly_content_packages (
  week_of date primary key,
  status text not null default 'draft' check (status in ('draft','approved','ready','published')),
  cfb_spotlight jsonb,
  nfl_spotlight jsonb,
  cfb_game_of_week jsonb,
  nfl_game_of_week jsonb,
  approved_at timestamptz,
  ready_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint football_weekly_package_tuesday check (extract(isodow from week_of) = 2),
  constraint football_weekly_package_cfb_spotlight check (cfb_spotlight is null or jsonb_typeof(cfb_spotlight) = 'object'),
  constraint football_weekly_package_nfl_spotlight check (nfl_spotlight is null or jsonb_typeof(nfl_spotlight) = 'object'),
  constraint football_weekly_package_cfb_game check (cfb_game_of_week is null or jsonb_typeof(cfb_game_of_week) = 'object'),
  constraint football_weekly_package_nfl_game check (nfl_game_of_week is null or jsonb_typeof(nfl_game_of_week) = 'object')
);
alter table public.football_weekly_content_packages enable row level security;
revoke all on table public.football_weekly_content_packages from public, anon, authenticated;

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
revoke all on function public.get_football_weekly_content_package(date) from public, anon;
grant execute on function public.get_football_weekly_content_package(date) to authenticated;

-- Slot patches are independent: Sunday CFB edits must not clear Monday NFL content.
-- Draft writes do not allow approval, ready, or publication transitions.
create or replace function public.save_football_weekly_content_draft(p_week_of date, p_patch jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_key text;
  v_item jsonb;
  v_saved public.football_weekly_content_packages;
begin
  if auth.uid() is null or not public.is_pick_control_owner(auth.uid()) then
    raise exception 'Football editorial owner access required';
  end if;
  if p_week_of is null or extract(isodow from p_week_of) <> 2 then
    raise exception 'Football editorial week must begin Tuesday in America/Chicago';
  end if;
  if p_patch is null or jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb then
    raise exception 'Football editorial patch must be a nonempty object';
  end if;
  for v_key in select jsonb_object_keys(p_patch) loop
    if v_key not in ('cfb_spotlight','nfl_spotlight','cfb_game_of_week','nfl_game_of_week') then
      raise exception 'Unsupported Football editorial field: %',v_key;
    end if;
    v_item := p_patch->v_key;
    if v_item = 'null'::jsonb then continue; end if;
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Editorial slot % must be object or null',v_key;
    end if;
    if v_key in ('cfb_spotlight','nfl_spotlight') then
      if coalesce(trim(v_item->>'name'),'') = ''
        or coalesce(trim(v_item->>'team'),'') = ''
        or coalesce(trim(v_item->>'position'),'') = ''
        or coalesce(trim(v_item->>'result'),'') = ''
        or coalesce(trim(v_item->>'measurements'),'') = ''
        or coalesce(trim(v_item->>'team_color'),'') = ''
        or coalesce(trim(v_item->>'highlight_url'),'') not like 'https://%'
        or jsonb_typeof(v_item->'stats') is distinct from 'array' then
        raise exception 'Incomplete Football editorial Spotlight: %',v_key;
      end if;
      if jsonb_array_length(v_item->'stats') <> 4
        or exists (
          select 1 from jsonb_array_elements(v_item->'stats') stat
          where jsonb_typeof(stat) <> 'object'
            or coalesce(trim(stat->>'value'),'') = ''
            or coalesce(trim(stat->>'label'),'') = ''
        ) then
        raise exception 'Spotlight requires exactly four labeled stats: %',v_key;
      end if;
    else
      if coalesce(trim(v_item->>'home_team'),'') = ''
        or coalesce(trim(v_item->>'away_team'),'') = ''
        or coalesce(trim(v_item->>'kickoff_at'),'') = '' then
        raise exception 'Incomplete Football editorial matchup: %',v_key;
      end if;
      if v_item->>'home_team' = v_item->>'away_team' then
        raise exception 'Featured matchup requires two different teams';
      end if;
      perform (v_item->>'kickoff_at')::timestamptz;
    end if;
  end loop;

  insert into public.football_weekly_content_packages(week_of)
  values(p_week_of) on conflict(week_of) do nothing;
  update public.football_weekly_content_packages p set
    cfb_spotlight = case when p_patch ? 'cfb_spotlight' then nullif(p_patch->'cfb_spotlight','null'::jsonb) else p.cfb_spotlight end,
    nfl_spotlight = case when p_patch ? 'nfl_spotlight' then nullif(p_patch->'nfl_spotlight','null'::jsonb) else p.nfl_spotlight end,
    cfb_game_of_week = case when p_patch ? 'cfb_game_of_week' then nullif(p_patch->'cfb_game_of_week','null'::jsonb) else p.cfb_game_of_week end,
    nfl_game_of_week = case when p_patch ? 'nfl_game_of_week' then nullif(p_patch->'nfl_game_of_week','null'::jsonb) else p.nfl_game_of_week end,
    updated_at = now()
  where p.week_of = p_week_of and p.status = 'draft'
  returning p.* into v_saved;
  if not found then
    raise exception 'Football package is no longer an editable draft';
  end if;
  return to_jsonb(v_saved) || jsonb_build_object(
    'release_at', v_saved.week_of::timestamp at time zone 'America/Chicago'
  );
end;
$$;
revoke all on function public.save_football_weekly_content_draft(date,jsonb) from public, anon;
grant execute on function public.save_football_weekly_content_draft(date,jsonb) to authenticated;
notify pgrst, 'reload schema';
