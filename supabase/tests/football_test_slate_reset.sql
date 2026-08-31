begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  v_current_event_id text := 'football-test-reset-current';
  v_current_bout_id text := 'football-test-reset-current-game';
  v_draft_one uuid;
  v_draft_two uuid;
  v_week_start timestamptz := date_trunc('week', now() + interval '30 days' - interval '1 day') + interval '1 day';
  v_nfl_kickoff timestamptz;
  v_cfb_kickoff timestamptz;
  v_setup jsonb;
  v_reset jsonb;
begin
  v_nfl_kickoff := v_week_start + interval '2 days 18 hours';
  v_cfb_kickoff := v_week_start + interval '4 days 19 hours 30 minutes';

  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'football-reset-owner@login.octagon-hq.app','',now(),now(),now(),
      jsonb_build_object('display_name','FOOTBALL RESET OWNER','historical_unclaimed',true)),
    (v_member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'football-reset-member@login.octagon-hq.app','',now(),now(),now(),
      jsonb_build_object('display_name','FOOTBALL RESET MEMBER','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_owner_id,'Football Reset Owner','FR');
  perform public.register_unclaimed_pin_profile(v_member_id,'Football Reset Member','FM');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  update public.pick_events
  set status='complete', completed_at=coalesce(completed_at,now()), updated_at=now()
  where status in ('upcoming','locked');

  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,locks_at,season,status,sport,league,event_kind
  ) values (
    v_current_event_id,'Disposable Football Test Slate','Test picks only','Test Stadium','Dallas, Texas',
    now()+interval '7 days',now()+interval '7 days',extract(year from now()+interval '7 days')::integer,
    'upcoming','football','nfl','slate'
  );
  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name,locks_at
  ) values (
    v_current_event_id,v_current_bout_id,1,'NFL ATS','test-home','Test Home','test-away','Test Away',now()+interval '7 days'
  );
  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug)
  values(v_member_id,v_current_event_id,v_current_bout_id,'test-home');

  v_draft_one := public.stage_pick_event_draft(jsonb_build_object(
    'source','espn+the-odds-api','source_event_key','espn:football-reset-nfl','source_url','https://www.espn.com/football/',
    'sport','football','league','nfl','event_kind','game','event_id','football-reset-nfl',
    'name','Away One at Home One','subtitle','NFL reset proof','venue','NFL Proof Stadium','location','Dallas, Texas',
    'starts_at',v_nfl_kickoff::text,'locks_at',v_nfl_kickoff::text,'season',extract(year from v_nfl_kickoff)::integer,
    'bouts',jsonb_build_array(jsonb_build_object(
      'bout_id','football-reset-nfl-game','position',1,'weight_class','NFL ATS',
      'red_fighter_slug','home-one','red_fighter_name','Home One','blue_fighter_slug','away-one','blue_fighter_name','Away One',
      'kickoff_at',v_nfl_kickoff::text,'home_team_slug','home-one','away_team_slug','away-one',
      'spread_home',-3.5,'spread_source','the-odds-api','spread_updated_at',(now()-interval '1 hour')::text,
      'card_segment','main','segment_sequence',1,'included',true
    ))
  ));

  v_draft_two := public.stage_pick_event_draft(jsonb_build_object(
    'source','espn+the-odds-api','source_event_key','espn:football-reset-cfb','source_url','https://www.espn.com/football/',
    'sport','football','league','college-football','event_kind','game','event_id','football-reset-cfb',
    'name','Away Two at Home Two','subtitle','CFB reset proof','venue','CFB Proof Stadium','location','Austin, Texas',
    'starts_at',v_cfb_kickoff::text,'locks_at',v_cfb_kickoff::text,'season',extract(year from v_cfb_kickoff)::integer,
    'bouts',jsonb_build_array(jsonb_build_object(
      'bout_id','football-reset-cfb-game','position',1,'weight_class','COLLEGE-FOOTBALL ATS',
      'red_fighter_slug','home-two','red_fighter_name','Home Two','blue_fighter_slug','away-two','blue_fighter_name','Away Two',
      'kickoff_at',v_cfb_kickoff::text,'home_team_slug','home-two','away_team_slug','away-two',
      'spread_home',2.5,'spread_source','the-odds-api','spread_updated_at',(now()-interval '30 minutes')::text,
      'card_segment','main','segment_sequence',1,'included',true
    ))
  ));

  if v_draft_one is distinct from v_draft_two then
    raise exception 'reset proof games did not compose into one staged Football slate';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);

  v_setup := public.get_pick_event_setup('football');
  if v_setup #>> '{can_publish}' <> 'false'
    or not (v_setup->'warnings' ? 'THE CURRENT FOOTBALL SLATE ALREADY HAS PICKS') then
    raise exception 'normal publication guard did not detect current Football picks: %',v_setup;
  end if;

  begin
    perform public.publish_pick_event_draft(v_draft_two);
    raise exception 'normal publication unexpectedly replaced a Football slate with picks';
  exception
    when others then
      if position('already has picks' in lower(sqlerrm)) = 0 then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.reset_current_football_pick_event();
    raise exception 'non-owner unexpectedly reset the current Football slate';
  exception
    when others then
      if position('pick control owner required' in lower(sqlerrm)) = 0 then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  v_reset := public.reset_current_football_pick_event();

  if v_reset #>> '{event_id}' <> v_current_event_id
    or v_reset #>> '{pick_count}' <> '1'
    or v_reset #>> '{deleted}' <> 'true' then
    raise exception 'reset result was incorrect: %',v_reset;
  end if;
  if exists(select 1 from public.pick_events where event_id=v_current_event_id)
    or exists(select 1 from public.profile_event_picks where event_id=v_current_event_id) then
    raise exception 'current Football test slate or its picks survived reset';
  end if;
  if not exists(
    select 1 from public.pick_event_drafts
    where draft_id=v_draft_two and state='staged'
  ) then
    raise exception 'staged replacement Football slate was changed by reset';
  end if;

  v_setup := public.get_pick_event_setup('football');
  if v_setup #>> '{draft_id}' <> v_draft_two::text
    or v_setup #>> '{can_publish}' <> 'true' then
    raise exception 'replacement Football slate was not publishable after reset: %',v_setup;
  end if;

  perform public.publish_pick_event_draft(v_draft_two);
  if not exists(
    select 1 from public.pick_events
    where event_id=(select event_id from public.pick_event_drafts where draft_id=v_draft_two)
      and sport='football' and status='upcoming'
  ) then
    raise exception 'replacement Football slate did not publish after reset';
  end if;
end $$;

rollback;
\echo 'Football test slate reset proof passed.'
