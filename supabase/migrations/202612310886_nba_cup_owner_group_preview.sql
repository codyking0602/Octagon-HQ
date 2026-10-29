-- 2026 NBA Cup group picks: isolated, owner-only preview.
-- Date does not lock picks; the manual lock remains false until explicitly changed.
create table if not exists public.nba_cup_group_preview_2026 (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  picks jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.nba_cup_group_preview_2026 enable row level security;
revoke all on public.nba_cup_group_preview_2026 from public, anon, authenticated;

create table if not exists public.nba_cup_group_preview_lock_2026 (
  season integer primary key check (season = 2026),
  manually_locked boolean not null default false
);
alter table public.nba_cup_group_preview_lock_2026 enable row level security;
revoke all on public.nba_cup_group_preview_lock_2026 from public, anon, authenticated;
insert into public.nba_cup_group_preview_lock_2026(season,manually_locked)
values(2026,false) on conflict(season) do nothing;

create or replace function public.get_nba_cup_group_preview()
returns jsonb language plpgsql stable security definer set search_path=''
as $$
declare v_profile uuid := auth.uid(); v_picks jsonb; v_updated timestamptz; v_locked boolean;
begin
  if v_profile is null or not exists (
    select 1 from public.profiles p
    join public.pick_control_owners o on o.profile_id=p.id
    where p.id=v_profile and upper(trim(p.display_name))='CODY'
  ) then raise exception 'nba_cup_owner_preview_only'; end if;
  select picks,updated_at into v_picks,v_updated
    from public.nba_cup_group_preview_2026 where profile_id=v_profile;
  select manually_locked into v_locked from public.nba_cup_group_preview_lock_2026 where season=2026;
  return jsonb_build_object('season',2026,'locked',coalesce(v_locked,false),
    'picks',coalesce(v_picks,'{}'::jsonb),'updated_at',v_updated);
end; $$;

create or replace function public.save_nba_cup_group_preview(p_picks jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_profile uuid := auth.uid(); v_key text; v_team text; v_allowed text[];
begin
  if v_profile is null or not exists (
    select 1 from public.profiles p
    join public.pick_control_owners o on o.profile_id=p.id
    where p.id=v_profile and upper(trim(p.display_name))='CODY'
  ) then raise exception 'nba_cup_owner_preview_only'; end if;
  if coalesce((select manually_locked from public.nba_cup_group_preview_lock_2026 where season=2026),false)
    then raise exception 'nba_cup_group_picks_locked'; end if;
  if p_picks is null or jsonb_typeof(p_picks)<>'object'
    then raise exception 'nba_cup_invalid_picks'; end if;
  if (select count(*) from jsonb_object_keys(p_picks))>6
    then raise exception 'nba_cup_too_many_picks'; end if;
  for v_key,v_team in select key,value from jsonb_each_text(p_picks) loop
    v_allowed:=case v_key
      when 'EA' then array['DET','TOR','ORL','MIL','BKN']
      when 'EB' then array['NYK','CLE','PHI','MIA','IND']
      when 'EC' then array['BOS','ATL','CHA','CHI','WAS']
      when 'WA' then array['DEN','HOU','PHX','DAL','UTA']
      when 'WB' then array['OKC','MIN','LAC','NOP','MEM']
      when 'WC' then array['SAS','LAL','POR','GSW','SAC']
      else null
    end;
    if v_allowed is null or jsonb_typeof(p_picks->v_key)<>'string'
      or not (v_team=any(v_allowed))
      then raise exception 'nba_cup_invalid_group_pick_%',v_key; end if;
  end loop;
  insert into public.nba_cup_group_preview_2026(profile_id,picks,updated_at)
    values(v_profile,p_picks,now())
    on conflict(profile_id) do update set picks=excluded.picks,updated_at=now();
  return public.get_nba_cup_group_preview();
end; $$;

revoke all on function public.get_nba_cup_group_preview() from public,anon;
revoke all on function public.save_nba_cup_group_preview(jsonb) from public,anon;
grant execute on function public.get_nba_cup_group_preview() to authenticated;
grant execute on function public.save_nba_cup_group_preview(jsonb) to authenticated;
notify pgrst,'reload schema';