begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_profile_id uuid := extensions.gen_random_uuid();
  football_summary record;
  mma_summary record;
  default_mma_summary record;
  football_history jsonb;
  mma_history jsonb;
  default_mma_history jsonb;
  standing jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values (v_profile_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'football-scope@login.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','FOOTBALL SCOPE','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_profile_id,'Football Scope','FS');

  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,locks_at,season,status,completed_at,sport,league,event_kind
  ) values
    ('football-scope-week-1','Week 1','ATS slate','Test Stadium','Dallas, Texas',now()-interval '28 days',now()-interval '28 days 1 hour',2199,'complete',now()-interval '27 days','football','nfl','slate'),
    ('football-scope-week-2','Week 2','ATS slate','Test Stadium','Dallas, Texas',now()-interval '21 days',now()-interval '21 days 1 hour',2199,'complete',now()-interval '20 days','football','nfl','slate'),
    ('football-scope-super-bowl','Super Bowl','ATS championship','Test Stadium','Dallas, Texas',now()-interval '14 days',now()-interval '14 days 1 hour',2199,'complete',now()-interval '13 days','football','nfl','game'),
    ('mma-scope-event','UFC Scope Test','Main Card','Test Arena','Dallas, Texas',now()-interval '7 days',now()-interval '7 days 1 hour',2199,'complete',now()-interval '6 days','mma','ufc','fight_card');

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,
    winner_fighter_slug,result_status,result_recorded_at,included_in_picks,
    home_team_slug,away_team_slug,frozen_spread_home,spread_source,spread_frozen_at,home_final_score,away_final_score
  ) values
    ('football-scope-week-1','normal-win',1,'NFL ATS','w1-home-a','W1 Home A','w1-away-a','W1 Away A','w1-home-a','red_win',now(),true,'w1-home-a','w1-away-a',-3,'the-odds-api',now()-interval '29 days',24,20),
    ('football-scope-week-1','lock-win',2,'NFL ATS','w1-home-b','W1 Home B','w1-away-b','W1 Away B','w1-home-b','red_win',now(),true,'w1-home-b','w1-away-b',-7,'the-odds-api',now()-interval '29 days',31,20),
    ('football-scope-week-1','push',3,'NFL ATS','w1-home-c','W1 Home C','w1-away-c','W1 Away C','w1-home-c','red_win',now(),true,'w1-home-c','w1-away-c',-3,'the-odds-api',now()-interval '29 days',27,24),
    ('football-scope-week-1','loss',4,'NFL ATS','w1-home-d','W1 Home D','w1-away-d','W1 Away D','w1-away-d','blue_win',now(),true,'w1-home-d','w1-away-d',3,'the-odds-api',now()-interval '29 days',20,24),
    ('football-scope-week-2','missed',1,'NFL ATS','w2-home','W2 Home','w2-away','W2 Away','w2-home','red_win',now(),true,'w2-home','w2-away',-2,'the-odds-api',now()-interval '22 days',24,20),
    ('football-scope-super-bowl','super-bowl',1,'NFL ATS','sb-home','SB Home','sb-away','SB Away','sb-away','blue_win',now(),true,'sb-home','sb-away',3,'the-odds-api',now()-interval '15 days',20,24),
    ('mma-scope-event','mma-bout',1,'Lightweight','mma-red','MMA Red','mma-blue','MMA Blue','mma-red','red_win',now(),true,null,null,null,null,null,null,null);

  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug,is_lock) values
    (v_profile_id,'football-scope-week-1','normal-win','w1-home-a',false),
    (v_profile_id,'football-scope-week-1','lock-win','w1-home-b',true),
    (v_profile_id,'football-scope-week-1','push','w1-home-c',false),
    (v_profile_id,'football-scope-week-1','loss','w1-home-d',false),
    (v_profile_id,'football-scope-super-bowl','super-bowl','sb-away',false),
    (v_profile_id,'mma-scope-event','mma-bout','mma-red',false);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_profile_id::text,true);

  select * into football_summary from public.get_my_pick_summary(2199,'football');
  if football_summary.correct <> 3 or football_summary.incorrect <> 1 or football_summary.pending <> 0
    or football_summary.events_entered <> 2 or football_summary.base_points <> 3.5
    or football_summary.lock_bonus <> 2 or football_summary.total_points <> 5.5 then
    raise exception 'Football ATS + Lock summary is incorrect: %', row_to_json(football_summary);
  end if;

  football_history := public.get_my_pick_history(2199,'football');
  if jsonb_array_length(football_history->'events') <> 3
    or exists (select 1 from jsonb_array_elements(football_history->'events') e where e->>'event_id' not like 'football-scope-%') then
    raise exception 'Football history mixed sports: %', football_history;
  end if;
  standing := football_history #> '{season_standings,0}';
  if standing->>'total_points' <> '5.5' or standing->>'adjusted_points' <> '5.5'
    or standing->>'pushes' <> '1' or standing->>'dropped_week_label' <> 'Week 2'
    or standing->>'events_entered' <> '2' or standing->>'correct' <> '3' or standing->>'incorrect' <> '1' then
    raise exception 'Football championship drop/standings are incorrect: %', football_history;
  end if;
  if not exists (
    select 1 from jsonb_array_elements(football_history->'events') e
    where e->>'event_id' = 'football-scope-super-bowl' and e #>> '{record,total_points}' = '1'
  ) then
    raise exception 'Super Bowl points were not included in Football championship history: %', football_history;
  end if;

  select * into mma_summary from public.get_my_pick_summary(2199,'mma');
  select * into default_mma_summary from public.get_my_pick_summary(2199);
  if row_to_json(mma_summary)::jsonb is distinct from row_to_json(default_mma_summary)::jsonb
    or mma_summary.correct <> 1 or mma_summary.incorrect <> 0 or mma_summary.events_entered <> 1
    or mma_summary.base_points <> 4 or mma_summary.lock_bonus <> 0 or mma_summary.total_points <> 4 then
    raise exception 'UFC/MMA summary behavior regressed: explicit %, default %', row_to_json(mma_summary), row_to_json(default_mma_summary);
  end if;

  mma_history := public.get_my_pick_history(2199,'mma');
  default_mma_history := public.get_my_pick_history(2199);
  if mma_history is distinct from default_mma_history
    or jsonb_array_length(mma_history->'events') <> 1
    or mma_history #>> '{events,0,event_id}' <> 'mma-scope-event'
    or mma_history #>> '{summary,total_points}' <> '4' then
    raise exception 'UFC/MMA history isolation or scoring regressed: %', mma_history;
  end if;
end $$;

rollback;
\echo 'Football Picks sport-scoped scoring/history/standings proof passed.'
