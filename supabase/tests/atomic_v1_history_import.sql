begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  n text;
  uid uuid;
  payload jsonb;
  report jsonb;
  protected_before jsonb;
  protected_after jsonb;
begin
  foreach n in array array['BROCK','CODY','RHONDA','SHANE','TONY','TYLER'] loop
    uid := extensions.gen_random_uuid();
    insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
    values(uid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',lower(n)||'@fixture.invalid','',now(),now());
    insert into public.profiles(id,display_name,normalized_name,initials)
    values(uid,n,n,left(n,1));
  end loop;

  insert into public.profile_preferences(profile_id,avatar_photo_data)
  select id,'data:image/png;base64,Q09EWQ==' from public.profiles where normalized_name='CODY';

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values('protected-current','Protected','','','','2026-07-25T00:00:00Z','2026-07-25T00:00:00Z',2026,'upcoming');
  select to_jsonb(e) into protected_before from public.pick_events e where event_id='protected-current';

  payload := jsonb_build_object(
    'schemaVersion',1,
    'cutoff','2026-07-25T00:00:00.000Z',
    'sourceGroupMatchCount',1,
    'sourceGroupFingerprint','fixture-group',
    'profiles',(
      select jsonb_agg(jsonb_build_object(
        'normalizedName',n,
        'avatarPhotoData','data:image/png;base64,QQ==',
        'findLeader',jsonb_build_array(jsonb_build_object(
          'day','2026-07-01','officialScore',0,'bestScore',0,'attempts',1,
          'completedAt','2026-07-01T12:00:00Z'
        )),
        'picks',jsonb_build_array(jsonb_build_object(
          'eventId','historic-event','fightId','historic-bout','fighterSlug','alpha'
        ))
      ) order by n)
      from unnest(array['BROCK','CODY','RHONDA','SHANE','TONY','TYLER']) n
    ),
    'pickEvents',jsonb_build_array(jsonb_build_object(
      'eventId','historic-event','name','Historic','subtitle','','venue','','location','',
      'startsAt','2026-07-01T00:00:00Z','locksAt','2026-07-01T00:00:00Z',
      'season',2026,'status','complete'
    )),
    'pickFights',jsonb_build_array(jsonb_build_object(
      'eventId','historic-event','boutId','historic-bout','position',1,'weightClass','Test',
      'redFighterSlug','alpha','redFighterName','Alpha',
      'blueFighterSlug','beta','blueFighterName','Beta','winnerFighterSlug','beta'
    ))
  );

  begin
    perform public.import_v1_history_atomic(jsonb_set(payload,'{pickFights}',
      (payload->'pickFights') || jsonb_build_array(jsonb_build_object(
        'eventId','historic-event','boutId','late-conflict','position',1,'weightClass','Test',
        'redFighterSlug','gamma','redFighterName','Gamma',
        'blueFighterSlug','delta','blueFighterName','Delta','winnerFighterSlug','gamma'
      ))));
    raise exception 'expected late conflict';
  exception when unique_violation then null;
  end;
  if exists(select 1 from public.pick_events where event_id='historic-event') then
    raise exception 'late conflict did not roll back';
  end if;

  report := public.import_v1_history_atomic(payload);
  if (report#>>'{changes,eventsInserted}')::int <> 1
     or (report#>>'{changes,picksInserted}')::int <> 6 then
    raise exception 'first-run counts wrong';
  end if;
  if (select avatar_photo_data from public.profile_preferences pp
      join public.profiles p on p.id=pp.profile_id
      where p.normalized_name='CODY') <> 'data:image/png;base64,Q09EWQ==' then
    raise exception 'Cody avatar overwritten';
  end if;
  if (select official_score from public.find_leader_history h
      join public.profiles p on p.id=h.profile_id
      where p.normalized_name='CODY' and day='2026-07-01') <> 0 then
    raise exception 'zero score lost';
  end if;

  report := public.import_v1_history_atomic(payload);
  if (report#>>'{changes,avatarsInserted}')::int <> 0
     or (report#>>'{changes,findLeaderInserted}')::int <> 0
     or (report#>>'{changes,eventsInserted}')::int <> 0
     or (report#>>'{changes,boutsInserted}')::int <> 0
     or (report#>>'{changes,picksInserted}')::int <> 0 then
    raise exception 'second run mutated rows';
  end if;

  select to_jsonb(e) into protected_after from public.pick_events e where event_id='protected-current';
  if protected_before is distinct from protected_after then
    raise exception 'protected event changed';
  end if;

  begin
    perform public.import_v1_history_atomic(jsonb_set(payload,'{profiles,0,normalizedName}','"CODY"'));
    raise exception 'duplicate identity accepted';
  exception when raise_exception then
    if sqlerrm = 'duplicate identity accepted' then raise; end if;
  end;

  begin
    perform public.import_v1_history_atomic(jsonb_set(payload,'{pickEvents,0,startsAt}','"2026-07-25T00:00:00Z"'));
    raise exception 'cutoff event accepted';
  exception when raise_exception then
    if sqlerrm = 'cutoff event accepted' then raise; end if;
  end;
end $$;

rollback;
