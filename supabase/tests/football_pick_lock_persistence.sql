begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_member uuid := extensions.gen_random_uuid();
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now())
  where status in ('upcoming','locked');

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values (
    v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'football-lock-member@login.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','FOOTBALL LOCK MEMBER','historical_unclaimed',true)
  );

  perform public.register_unclaimed_pin_profile(v_member,'Football Lock Member','FL');

  insert into public.pick_events(
    event_id,sport,league,event_kind,name,subtitle,venue,location,
    starts_at,locks_at,season,status
  ) values (
    'football-lock-persistence-test','football','nfl','slate',
    'Football Lock Persistence Test','Two-game slate','Test Stadium','Dallas, Texas',
    now()+interval '2 days',now()+interval '2 days',2199,'upcoming'
  );

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,
    home_team_slug,away_team_slug,frozen_spread_home,spread_source,spread_frozen_at,
    red_american_odds,blue_american_odds,locks_at
  ) values
    (
      'football-lock-persistence-test','game-one',1,'NFL ATS',
      'home-one','Home One','away-one','Away One',
      'home-one','away-one',-3.5,'test',now(),null,null,now()+interval '1 day'
    ),
    (
      'football-lock-persistence-test','game-two',2,'NFL ATS',
      'home-two','Home Two','away-two','Away Two',
      'home-two','away-two',2.5,'test',now(),null,null,now()+interval '1 day'
    );

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);

  -- The evolved mutation remains backward-compatible: omitted Lock means false.
  perform public.save_my_event_pick('football-lock-persistence-test','game-one','home-one');
  if not exists (
    select 1 from public.profile_event_picks
    where profile_id=v_member and event_id='football-lock-persistence-test'
      and bout_id='game-one' and fighter_slug='home-one' and is_lock is false
  ) then
    raise exception 'legacy three-argument pick save did not default to a normal pick';
  end if;

  perform public.save_my_event_pick('football-lock-persistence-test','game-one','home-one',true);
  if not exists (
    select 1 from public.profile_event_picks
    where profile_id=v_member and event_id='football-lock-persistence-test'
      and bout_id='game-one' and is_lock is true
  ) then
    raise exception 'Football Lock was not persisted';
  end if;

  -- Changing the team through the same mutation can preserve the Lock explicitly.
  perform public.save_my_event_pick('football-lock-persistence-test','game-one','away-one',true);
  if not exists (
    select 1 from public.profile_event_picks
    where profile_id=v_member and event_id='football-lock-persistence-test'
      and bout_id='game-one' and fighter_slug='away-one' and is_lock is true
  ) then
    raise exception 'Football pick edit did not preserve its Lock';
  end if;

  -- Two games allow one Lock; the existing canonical trigger must reject a second.
  begin
    perform public.save_my_event_pick('football-lock-persistence-test','game-two','home-two',true);
    raise exception 'second Football Lock unexpectedly bypassed the slate allowance';
  exception when others then
    if sqlerrm not like '%football_lock_limit_reached%' then
      raise;
    end if;
  end;

  perform public.save_my_event_pick('football-lock-persistence-test','game-one','away-one',false);
  perform public.save_my_event_pick('football-lock-persistence-test','game-two','home-two',true);

  if not exists (
    select 1 from public.profile_event_picks
    where profile_id=v_member and event_id='football-lock-persistence-test'
      and bout_id='game-one' and is_lock is false
  ) or not exists (
    select 1 from public.profile_event_picks
    where profile_id=v_member and event_id='football-lock-persistence-test'
      and bout_id='game-two' and is_lock is true
  ) then
    raise exception 'Football Lock removal/reassignment did not persist';
  end if;
end $$;

rollback;
\echo 'Football Pick Lock persistence proof passed.'
