-- Extend canonical Picks facts and scoring helpers for Football; UFC rows and scoring RPCs are untouched.
alter table public.pick_bouts
  add column if not exists home_final_score integer,
  add column if not exists away_final_score integer;
alter table public.profile_event_picks
  add column if not exists is_lock boolean not null default false;

alter table public.pick_bouts add constraint pick_football_final_score_shape check (
  (home_final_score is null and away_final_score is null)
  or (home_final_score >= 0 and away_final_score >= 0)
);

create or replace function public.football_pick_lock_allowance(p_game_count integer)
returns integer language sql immutable strict set search_path = '' as $$
  select case when p_game_count >= 12 then 3 when p_game_count >= 6 then 2
    when p_game_count >= 2 then 1 else 0 end;
$$;

create or replace function public.football_pick_ats_points(
  p_picked_home boolean,
  p_home_score integer,
  p_away_score integer,
  p_frozen_spread_home numeric,
  p_is_lock boolean default false
) returns numeric language sql immutable set search_path = '' as $$
  select case
    when p_home_score is null or p_away_score is null or p_frozen_spread_home is null then null
    when (case when p_picked_home then 1 else -1 end)
      * (p_home_score - p_away_score + p_frozen_spread_home) = 0 then 0.5
    when (case when p_picked_home then 1 else -1 end)
      * (p_home_score - p_away_score + p_frozen_spread_home) > 0 then case when p_is_lock then 3 else 1 end
    else 0
  end;
$$;

create or replace function public.enforce_football_pick_lock_allowance()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_sport text; v_games integer; v_locks integer;
begin
  if not new.is_lock then return new; end if;
  select sport into v_sport from public.pick_events where event_id = new.event_id;
  if v_sport <> 'football' then return new; end if;
  select count(*) into v_games from public.pick_bouts
    where event_id = new.event_id and included_in_picks and result_status <> 'cancelled';
  select count(*) into v_locks from public.profile_event_picks
    where profile_id = new.profile_id and event_id = new.event_id and is_lock
      and bout_id <> new.bout_id;
  if v_locks >= public.football_pick_lock_allowance(v_games) then
    raise exception 'football Lock allowance exceeded for % game slate', v_games;
  end if;
  return new;
end;
$$;
drop trigger if exists enforce_football_pick_lock_allowance on public.profile_event_picks;
create trigger enforce_football_pick_lock_allowance before insert or update of is_lock
on public.profile_event_picks for each row execute function public.enforce_football_pick_lock_allowance();

revoke all on function public.football_pick_lock_allowance(integer) from public, anon, authenticated;
revoke all on function public.football_pick_ats_points(boolean,integer,integer,numeric,boolean) from public, anon, authenticated;
revoke all on function public.enforce_football_pick_lock_allowance() from public, anon, authenticated;

notify pgrst, 'reload schema';
