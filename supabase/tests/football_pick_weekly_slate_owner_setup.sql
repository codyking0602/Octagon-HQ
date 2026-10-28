begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_mma_draft uuid;
  v_football_draft_one uuid;
  v_football_draft_two uuid;
  v_week_start timestamptz := date_trunc('week', now() + interval '30 days' - interval '1 day') + interval '1 day';
  v_nfl_kickoff timestamptz;
  v_cfb_kickoff timestamptz;
  v_football_setup jsonb;
  v_mma_setup jsonb;
  v_current_mma jsonb;
  v_current_football jsonb;
  v_control jsonb;
  v_monitoring jsonb;
  v_mma_payload jsonb;
  v_nfl_payload jsonb;
  v_cfb_payload jsonb;
  v_nfl_bout text := 'football-nfl-owner-proof-1';
  v_cfb_bout text := 'football-college-football-owner-proof-2';
  v_football_event_id text;
  v_frozen_at timestamptz;
  v_publish_blocked boolean := false;
  v_non_owner_blocked boolean := false;
begin
  v_nfl_kickoff := v_week_start + interval '2 days 18 hours';
  v_cfb_kickoff := v_week_start + interval '4 days 19 hours 30 minutes';

  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'football-weekly-owner-proof@login.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','FOOTBALL WEEKLY OWNER','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_owner_id,'Football Weekly Owner','FW');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  -- Keep seed data from competing with this rollback-only proof.
  update public.pick_events
  set status='complete', completed_at=coalesce(completed_at,now()), updated_at=now()
  where status in ('upcoming','locked');

  v_mma_payload := jsonb_build_object(
    'source','ufc.com',
    'source_event_key','event/football-weekly-owner-mma-draft',
    'source_url','https://www.ufc.com/event/football-weekly-owner-mma-draft',
    'event_id','football-weekly-owner-mma-draft',
    'name','UFC Owner Proof Draft',
    'subtitle','MMA stays canonical',
    'venue','Owner Proof Arena',
    'location','Dallas, Texas',
    'starts_at',(now()+interval '40 days')::text,
    'locks_at',(now()+interval '40 days')::text,
    'season',extract(year from now()+interval '40 days')::integer,
    'bouts',jsonb_build_array(
      jsonb_build_object('bout_id','main-event-mma-a-mma-b','position',1,'weight_class','Lightweight','red_fighter_name','MMA A','red_fighter_slug','mma-a','blue_fighter_name','MMA B','blue_fighter_slug','mma-b','included',true),
      jsonb_build_object('bout_id','main-mma-c-mma-d','position',2,'weight_class','Welterweight','red_fighter_name','MMA C','red_fighter_slug','mma-c','blue_fighter_name','MMA D','blue_fighter_slug','mma-d','included',true),
      jsonb_build_object('bout_id','main-mma-e-mma-f','position',3,'weight_class','Middleweight','red_fighter_name','MMA E','red_fighter_slug','mma-e','blue_fighter_name','MMA F','blue_fighter_slug','mma-f','included',true),
      jsonb_build_object('bout_id','main-mma-g-mma-h','position',4,'weight_class','Bantamweight','red_fighter_name','MMA G','red_fighter_slug','mma-g','blue_fighter_name','MMA H','blue_fighter_slug','mma-h','included',true)
    )
  );
  v_mma_draft := public.stage_pick_event_draft(v_mma_payload);

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status,sport,league,event_kind)
  values('football-weekly-owner-mma-live','UFC Owner Proof Live','MMA remains current','Owner Proof Arena','Dallas, Texas',
    now()+interval '5 days',now()+interval '5 days',extract(year from now()+interval '5 days')::integer,'upcoming','mma','ufc','fight_card');
  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,locks_at)
  values('football-weekly-owner-mma-live','mma-live-a-b',1,'Lightweight','mma-live-a','MMA Live A','mma-live-b','MMA Live B',now()+interval '5 days');

  v_nfl_payload := jsonb_build_object(
    'source','espn+the-odds-api',
    'source_event_key','espn:owner-proof-1',
    'source_url','https://www.espn.com/football/',
    'sport','football','league','nfl','event_kind','game',
    'event_id','nfl-owner-proof-1','name','Away One at Home One','subtitle','NFL owner proof',
    'venue','NFL Proof Stadium','location','Dallas, Texas','starts_at',v_nfl_kickoff::text,'locks_at',v_nfl_kickoff::text,
    'season',extract(year from v_nfl_kickoff)::integer,
    'bouts',jsonb_build_array(jsonb_build_object(
      'bout_id',v_nfl_bout,'position',1,'weight_class','NFL ATS',
      'red_fighter_slug','home-one','red_fighter_name','Home One','blue_fighter_slug','away-one','blue_fighter_name','Away One',
      'kickoff_at',v_nfl_kickoff::text,'home_team_slug','home-one','away_team_slug','away-one',
      'spread_home',-3.5,'spread_source','the-odds-api','spread_updated_at',(now()-interval '1 hour')::text,
      'card_segment','main','segment_sequence',1,'included',true
    ))
  );
  v_football_draft_one := public.stage_pick_event_draft(v_nfl_payload);

  v_cfb_payload := jsonb_build_object(
    'source','espn+the-odds-api',
    'source_event_key','espn:owner-proof-2',
    'source_url','https://www.espn.com/football/',
    'sport','football','league','college-football','event_kind','game',
    'event_id','college-owner-proof-2','name','Away Two at Home Two','subtitle','CFB owner proof',
    'venue','CFB Proof Stadium','location','Austin, Texas','starts_at',v_cfb_kickoff::text,'locks_at',v_cfb_kickoff::text,
    'season',extract(year from v_cfb_kickoff)::integer,
    'bouts',jsonb_build_array(jsonb_build_object(
      'bout_id',v_cfb_bout,'position',1,'weight_class','COLLEGE-FOOTBALL ATS',
      'red_fighter_slug','home-two','red_fighter_name','Home Two','blue_fighter_slug','away-two','blue_fighter_name','Away Two',
      'kickoff_at',v_cfb_kickoff::text,'home_team_slug','home-two','away_team_slug','away-two',
      'spread_home',2.5,'spread_source','the-odds-api','spread_updated_at',(now()-interval '30 minutes')::text,
      'card_segment','main','segment_sequence',1,'included',true
    ))
  );
  v_football_draft_two := public.stage_pick_event_draft(v_cfb_payload);

  if v_football_draft_one is distinct from v_football_draft_two then
    raise exception 'Football games did not compose into one weekly draft';
  end if;
  if (select count(*) from public.pick_event_draft_bouts where draft_id=v_football_draft_two and included) <> 2 then
    raise exception 'Football weekly draft did not contain both games';
  end if;
  if (select league from public.pick_event_drafts where draft_id=v_football_draft_two) <> 'mixed'
    or (select event_kind from public.pick_event_drafts where draft_id=v_football_draft_two) <> 'slate' then
    raise exception 'Football weekly draft metadata is incorrect';
  end if;
  if (select kickoff_at from public.pick_event_draft_bouts where draft_id=v_football_draft_two and position=1) <> v_nfl_kickoff
    or (select kickoff_at from public.pick_event_draft_bouts where draft_id=v_football_draft_two and position=2) <> v_cfb_kickoff then
    raise exception 'Football weekly draft order did not follow real kickoff times';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);

  v_football_setup := public.get_pick_event_setup('football');
  if v_football_setup #>> '{draft_id}' <> v_football_draft_two::text
    or v_football_setup #>> '{can_publish}' <> 'true'
    or jsonb_array_length(v_football_setup->'bouts') <> 2 then
    raise exception 'Football owner setup projection is incorrect: %',v_football_setup;
  end if;

  v_mma_setup := public.get_pick_event_setup();
  if v_mma_setup #>> '{draft_id}' <> v_mma_draft::text then
    raise exception 'legacy UFC setup was displaced by Football: %',v_mma_setup;
  end if;

  perform public.publish_pick_event_draft(v_football_draft_two);
  select event_id into v_football_event_id
  from public.pick_events where sport='football' and status='upcoming';

  if v_football_event_id is null then raise exception 'Football slate did not publish'; end if;
  if (select count(*) from public.pick_events where status in ('upcoming','locked')) <> 2
    or not exists(select 1 from public.pick_events where event_id='football-weekly-owner-mma-live' and status='upcoming') then
    raise exception 'Football publication replaced or blocked the active UFC event';
  end if;

  if (select frozen_spread_home from public.pick_bouts where event_id=v_football_event_id and bout_id=v_nfl_bout) <> -3.5
    or (select frozen_spread_home from public.pick_bouts where event_id=v_football_event_id and bout_id=v_cfb_bout) <> 2.5 then
    raise exception 'Football spreads were not frozen from the reviewed draft at publication';
  end if;
  if (select locks_at from public.pick_bouts where event_id=v_football_event_id and bout_id=v_nfl_bout) <> v_nfl_kickoff
    or (select locks_at from public.pick_bouts where event_id=v_football_event_id and bout_id=v_cfb_bout) <> v_cfb_kickoff then
    raise exception 'Football published game deadlines do not match kickoff';
  end if;
  select spread_frozen_at into v_frozen_at
  from public.pick_bouts where event_id=v_football_event_id and bout_id=v_nfl_bout;
  if v_frozen_at is null then raise exception 'Football spread freeze timestamp is missing'; end if;

  -- A later staged-line mutation cannot rewrite the published grading line.
  update public.pick_event_draft_bouts set spread_home=-7
  where draft_id=v_football_draft_two and bout_id=v_nfl_bout;
  if (select frozen_spread_home from public.pick_bouts where event_id=v_football_event_id and bout_id=v_nfl_bout) <> -3.5
    or (select spread_frozen_at from public.pick_bouts where event_id=v_football_event_id and bout_id=v_nfl_bout) <> v_frozen_at then
    raise exception 'published Football frozen spread changed after publication';
  end if;

  v_current_mma := public.get_current_pick_event();
  v_current_football := public.get_current_pick_event('football');
  if v_current_mma #>> '{event_id}' <> 'football-weekly-owner-mma-live'
    or v_current_football #>> '{event_id}' <> v_football_event_id then
    raise exception 'sport-scoped current event ownership is incorrect: MMA %, Football %',v_current_mma,v_current_football;
  end if;

  v_control := public.get_pick_control_event();
  if v_control #>> '{event_id}' <> 'football-weekly-owner-mma-live' then
    raise exception 'legacy UFC control owner was displaced by Football: %',v_control;
  end if;

  if private.pick_bout_is_locked(
      (select event from public.pick_events event where event.event_id=v_football_event_id),
      (select bout from public.pick_bouts bout where bout.event_id=v_football_event_id and bout.bout_id=v_cfb_bout),
      v_nfl_kickoff + interval '1 minute'
    ) then
    raise exception 'later Football game locked when an earlier game kicked off';
  end if;
  if not private.pick_bout_is_locked(
      (select event from public.pick_events event where event.event_id=v_football_event_id),
      (select bout from public.pick_bouts bout where bout.event_id=v_football_event_id and bout.bout_id=v_nfl_bout),
      v_nfl_kickoff + interval '1 minute'
    ) then
    raise exception 'Football game did not lock at its own kickoff';
  end if;

  -- Recreate the real admin failure mode: a reviewed staged Football slate is
  -- ready while disposable picks exist on the current published test slate.
  update public.pick_event_drafts
  set state='staged', published_at=null, updated_at=now()
  where draft_id=v_football_draft_two;
  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug)
  values(v_owner_id,v_football_event_id,v_nfl_bout,'home-one');

  begin
    perform public.publish_pick_event_draft(v_football_draft_two);
  exception when others then
    if sqlerrm like '%current upcoming event for this sport already has picks%' then
      v_publish_blocked := true;
    else
      raise;
    end if;
  end;
  if not v_publish_blocked then
    raise exception 'normal Football publication bypassed the current-picks safeguard';
  end if;

  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
  begin
    perform public.reset_current_football_pick_event();
  exception when others then
    if sqlerrm = 'pick control owner required' then
      v_non_owner_blocked := true;
    else
      raise;
    end if;
  end;
  if not v_non_owner_blocked then
    raise exception 'non-owner could reset the current Football slate';
  end if;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  perform public.reset_current_football_pick_event();

  if exists(select 1 from public.pick_events where event_id=v_football_event_id) then
    raise exception 'Football test slate survived owner reset';
  end if;
  if exists(select 1 from public.profile_event_picks where event_id=v_football_event_id) then
    raise exception 'Football test picks survived owner reset';
  end if;
  if not exists(
    select 1 from public.pick_event_drafts
    where draft_id=v_football_draft_two and state='staged'
  ) then
    raise exception 'Football staged replacement was removed by owner reset';
  end if;

  v_football_setup := public.get_pick_event_setup('football');
  if v_football_setup #>> '{draft_id}' <> v_football_draft_two::text
    or v_football_setup #>> '{can_publish}' <> 'true' then
    raise exception 'Football staged replacement did not become publishable after reset: %',v_football_setup;
  end if;

  perform public.publish_pick_event_draft(v_football_draft_two);
  if not exists(
    select 1 from public.pick_events
    where event_id=v_football_event_id and sport='football' and status='upcoming'
  ) then
    raise exception 'Football staged replacement did not publish normally after reset';
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  v_monitoring := public.get_pick_monitoring_event_state();
  if v_monitoring #>> '{current,event_id}' <> 'football-weekly-owner-mma-live'
    or v_monitoring #>> '{staged,event_id}' <> 'football-weekly-owner-mma-draft' then
    raise exception 'UFC monitoring ownership was displaced by Football: %',v_monitoring;
  end if;
end $$;

rollback;
\echo 'Football weekly slate owner setup proof passed.'
