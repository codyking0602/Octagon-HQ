alter table public.profile_preferences
  add column if not exists football_team text
  check (football_team is null or football_team in ('cowboys', 'longhorns'));

create or replace function public.set_my_football_team(p_football_team text)
returns public.profile_preferences
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_team text := nullif(lower(trim(p_football_team)), '');
  v_row public.profile_preferences;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if v_team not in ('cowboys', 'longhorns') then
    raise exception 'invalid football team';
  end if;

  insert into public.profile_preferences (profile_id, football_team, updated_at)
  values (v_profile_id, v_team, now())
  on conflict (profile_id) do update
  set football_team = excluded.football_team,
      updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.set_my_football_team(text) from public, anon;
grant execute on function public.set_my_football_team(text) to authenticated;
