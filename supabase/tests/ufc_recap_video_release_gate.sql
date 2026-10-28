begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_event public.pick_events;
begin
  -- A required UFC event cannot publish final standings without its recap video.
  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,locks_at,season,status,
    sport,league,event_kind,recap_video_required
  ) values (
    'ufc-recap-gate-locked','UFC Recap Gate','Red vs. Blue','Test Arena','Dallas, Texas',
    now()-interval '1 hour',now()-interval '2 hours',2199,'locked',
    'mma','ufc','fight_card',true
  );

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,
    result_status,winner_fighter_slug,result_recorded_at,included_in_picks
  ) values (
    'ufc-recap-gate-locked','gate-main',1,'Lightweight',
    'gate-red','Gate Red','gate-blue','Gate Blue',
    'red_win','gate-red',now()-interval '10 minutes',true
  );

  begin
    perform public.transition_pick_event('ufc-recap-gate-locked','complete');
    raise exception 'required UFC event completed without recap video';
  exception when others then
    if sqlerrm not like '%UFC recap video is required before final standings can publish%' then
      raise;
    end if;
  end;

  if (select status from public.pick_events where event_id='ufc-recap-gate-locked') <> 'locked' then
    raise exception 'failed UFC completion changed canonical event state';
  end if;

  perform public.set_pick_event_watch_moments(
    'ufc-recap-gate-locked',
    jsonb_build_array(jsonb_build_object(
      'title','UFC Recap Gate Highlight',
      'url','https://youtu.be/recap-gate'
    ))
  );

  select * into v_event
  from public.pick_events
  where event_id='ufc-recap-gate-locked';

  if v_event.status <> 'complete'
    or v_event.completed_at is null
    or jsonb_array_length(v_event.watch_moments) <> 1
  then
    raise exception 'publishing the UFC recap video did not release the event: %', row_to_json(v_event);
  end if;

  -- The final video action also closes an event whose stored lifecycle never moved
  -- from upcoming while per-fight ESPN results were being recorded.
  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,locks_at,season,status,
    sport,league,event_kind,recap_video_required
  ) values (
    'ufc-recap-gate-upcoming','UFC Recap Gate Upcoming','Alpha vs. Bravo','Test Arena','Dallas, Texas',
    now()-interval '1 hour',now()-interval '2 hours',2199,'upcoming',
    'mma','ufc','fight_card',true
  );

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,
    result_status,winner_fighter_slug,result_recorded_at,included_in_picks
  ) values (
    'ufc-recap-gate-upcoming','upcoming-main',1,'Welterweight',
    'alpha','Alpha','bravo','Bravo',
    'pending',null,null,true
  );

  perform public.record_pick_bout_live_states(
    'ufc-recap-gate-upcoming',
    jsonb_build_array(jsonb_build_object(
      'bout_id','upcoming-main',
      'state','final',
      'provider','espn',
      'source_event_id','espn-recap-gate',
      'source_competition_id','espn-recap-gate-main',
      'winner_fighter_slug','bravo',
      'observed_at',now()
    ))
  );

  if (select status from public.pick_events where event_id='ufc-recap-gate-upcoming') <> 'locked'
    or (select result_status from public.pick_bouts
        where event_id='ufc-recap-gate-upcoming' and bout_id='upcoming-main') <> 'blue_win'
  then
    raise exception 'trusted ESPN final did not grade the fight and advance the card to locked';
  end if;

  perform public.set_pick_event_watch_moments(
    'ufc-recap-gate-upcoming',
    jsonb_build_array(jsonb_build_object(
      'title','Alpha vs. Bravo Highlight',
      'url','https://www.youtube.com/watch?v=recap-gate'
    ))
  );

  if (select status from public.pick_events where event_id='ufc-recap-gate-upcoming') <> 'complete' then
    raise exception 'video publish did not advance the automatically locked UFC event to complete';
  end if;

  -- A completed required UFC recap cannot have its release evidence cleared later.
  begin
    perform public.set_pick_event_watch_moments('ufc-recap-gate-upcoming','[]'::jsonb);
    raise exception 'completed required UFC recap allowed its video to be cleared';
  exception when others then
    if sqlerrm not like '%UFC recap video is required before final standings can publish%' then
      raise;
    end if;
  end;

  -- Football keeps its existing automatic completion behavior and never inherits
  -- the UFC video gate.
  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,locks_at,season,status,
    sport,league,event_kind
  ) values (
    'football-recap-gate-proof','Football Recap Gate Proof','Away vs. Home','Test Stadium','Dallas, Texas',
    now()-interval '1 hour',now()-interval '2 hours',2199,'locked',
    'football','nfl','game'
  );

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,
    result_status,winner_fighter_slug,result_recorded_at,included_in_picks
  ) values (
    'football-recap-gate-proof','football-game',1,'NFL',
    'away','Away','home','Home',
    'red_win','away',now()-interval '10 minutes',true
  );

  perform public.transition_pick_event('football-recap-gate-proof','complete');

  if (select status from public.pick_events where event_id='football-recap-gate-proof') <> 'complete' then
    raise exception 'UFC recap gate changed Football completion';
  end if;

  -- Legacy/test MMA rows remain backward compatible unless explicitly opted in.
  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,locks_at,season,status,
    sport,league,event_kind
  ) values (
    'mma-recap-gate-legacy','Legacy MMA Recap','Legacy Red vs. Legacy Blue','Test Arena','Dallas, Texas',
    now()-interval '1 hour',now()-interval '2 hours',2199,'locked',
    'mma','ufc','fight_card'
  );

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,
    result_status,winner_fighter_slug,result_recorded_at,included_in_picks
  ) values (
    'mma-recap-gate-legacy','legacy-main',1,'Middleweight',
    'legacy-red','Legacy Red','legacy-blue','Legacy Blue',
    'red_win','legacy-red',now()-interval '10 minutes',true
  );

  perform public.transition_pick_event('mma-recap-gate-legacy','complete');

  if (select status from public.pick_events where event_id='mma-recap-gate-legacy') <> 'complete' then
    raise exception 'non-required legacy MMA event lost backward-compatible completion';
  end if;
end $$;

rollback;
