-- Record official Football finals inside the canonical Picks event/bout lifecycle.
create function public.record_football_pick_final(
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
  v_home text := public.slugify_pick_text(p_home_team_slug);
  v_away text := public.slugify_pick_text(p_away_team_slug);
  v_match_count integer;
  v_bout public.pick_bouts;
  v_event public.pick_events;
  v_result_status text;
  v_winner_slug text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required';
  end if;
  if nullif(v_home, '') is null or nullif(v_away, '') is null or v_home = v_away then
    raise exception 'football final teams are invalid';
  end if;
  if p_home_final_score is null or p_away_final_score is null
    or p_home_final_score < 0 or p_away_final_score < 0 then
    raise exception 'football final scores are invalid';
  end if;

  select count(*) into v_match_count
  from public.pick_bouts bout
  join public.pick_events event on event.event_id = bout.event_id
  where event.sport = 'football'
    and event.status in ('upcoming', 'locked')
    and bout.included_in_picks
    and bout.home_team_slug = v_home
    and bout.away_team_slug = v_away;

  if v_match_count <> 1 then
    raise exception 'expected exactly one active published Football game, found %', v_match_count;
  end if;

  select bout.* into v_bout
  from public.pick_bouts bout
  join public.pick_events event on event.event_id = bout.event_id
  where event.sport = 'football'
    and event.status in ('upcoming', 'locked')
    and bout.included_in_picks
    and bout.home_team_slug = v_home
    and bout.away_team_slug = v_away
  for update of bout;

  if v_bout.red_fighter_slug <> v_home or v_bout.blue_fighter_slug <> v_away then
    raise exception 'published Football game identity is inconsistent';
  end if;

  if v_bout.result_status <> 'pending' then
    if v_bout.home_final_score = p_home_final_score
      and v_bout.away_final_score = p_away_final_score then
      return v_bout;
    end if;
    raise exception 'published Football result is already recorded with different scores';
  end if;

  if p_home_final_score > p_away_final_score then
    v_result_status := 'red_win';
    v_winner_slug := v_home;
  elsif p_away_final_score > p_home_final_score then
    v_result_status := 'blue_win';
    v_winner_slug := v_away;
  else
    v_result_status := 'draw';
    v_winner_slug := null;
  end if;

  update public.pick_bouts
  set home_final_score = p_home_final_score,
      away_final_score = p_away_final_score,
      result_status = v_result_status,
      winner_fighter_slug = v_winner_slug,
      result_recorded_at = now()
  where event_id = v_bout.event_id
    and bout_id = v_bout.bout_id
  returning * into v_bout;

  if not exists (
    select 1
    from public.pick_bouts pending
    where pending.event_id = v_bout.event_id
      and pending.included_in_picks
      and pending.result_status = 'pending'
  ) then
    select * into v_event
    from public.pick_events
    where event_id = v_bout.event_id;

    if v_event.status = 'upcoming' then
      perform public.transition_pick_event(v_bout.event_id, 'locked');
    end if;
    perform public.transition_pick_event(v_bout.event_id, 'complete');
  end if;

  return v_bout;
end;
$$;

revoke all on function public.record_football_pick_final(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.record_football_pick_final(text,text,integer,integer) to service_role;

notify pgrst, 'reload schema';
