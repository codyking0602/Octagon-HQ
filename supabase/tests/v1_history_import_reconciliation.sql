begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  n text;
  uid uuid;
  payload jsonb;
  report jsonb;
  second_report jsonb;
  cody jsonb;
  cody_event jsonb;
  protected_before jsonb;
  protected_after jsonb;
begin
  foreach n in array array['BROCK','CODY','RHONDA','SHANE','TONY','TYLER'] loop
    uid := extensions.gen_random_uuid();
    insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
    values(uid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',lower(n)||'@reconciliation.invalid','',now(),now());
    insert into public.profiles(id,display_name,normalized_name,initials)
    values(uid,n,n,left(n,1));
  end loop;

  insert into public.profile_preferences(profile_id,avatar_photo_data)
  select id,'data:image/png;base64,Q09EWV9ORVc=' from public.profiles where normalized_name='CODY';

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values('protected-reconciliation','Protected current event','','','','2026-07-25T00:00:00Z','2026-07-25T00:00:00Z',2026,'upcoming');
  select to_jsonb(e) into protected_before from public.pick_events e where event_id='protected-reconciliation';

  payload := jsonb_build_object(
    'schemaVersion',1,
    'cutoff','2026-07-25T00:00:00.000Z',
    'sourceGroupFingerprint','fixture-reconciliation',
    'rules',jsonb_build_object('canonicalSixMemberGroupOnly',true),
    'profiles',(
      select jsonb_agg(
        jsonb_build_object(
          'normalizedName',n,
          'avatarPhotoData','data:image/png;base64,T0xEX0FWQVRBUg==',
          'findLeader',case when n='CODY' then jsonb_build_array(
            jsonb_build_object(
              'day','2026-07-01','officialScore',0,'bestScore',0,'attempts',1,
              'completedAt','2026-07-01T12:00:00Z'
            )
          ) else '[]'::jsonb end,
          'picks',case when n='CODY' then jsonb_build_array(
            jsonb_build_object(
              'eventId','historic-reconciliation',
              'fightId','historic-reconciliation-1',
              'fighterSlug','beta',
              'pickedAt','2026-07-01T00:00:00Z'
            )
          ) else '[]'::jsonb end
        ) order by n
      )
      from unnest(array['BROCK','CODY','RHONDA','SHANE','TONY','TYLER']) n
    ),
    'pickEvents',jsonb_build_array(
      jsonb_build_object(
        'eventId','historic-reconciliation','name','Historic reconciliation',
        'subtitle','','venue','','location','',
        'startsAt','2026-07-01T00:00:00Z','locksAt','2026-07-01T00:00:00Z',
        'season',2026,'status','complete','excludedResults',1
      )
    ),
    'pickFights',jsonb_build_array(
      jsonb_build_object(
        'eventId','historic-reconciliation','boutId','historic-reconciliation-1',
        'position',1,'weightClass','Test',
        'redFighterSlug','alpha','redFighterName','Alpha',
        'blueFighterSlug','beta','blueFighterName','Beta','winnerFighterSlug','beta'
      ),
      jsonb_build_object(
        'eventId','historic-reconciliation','boutId','historic-reconciliation-2',
        'position',2,'weightClass','Test',
        'redFighterSlug','gamma','redFighterName','Gamma',
        'blueFighterSlug','delta','blueFighterName','Delta','winnerFighterSlug','gamma'
      )
    )
  );

  report := public.import_v1_history_atomic_reconciled(payload);
  cody := report->'profiles'->'CODY';
  cody_event := cody->'eventRecords'->0;

  if (cody->>'historicalPicksCorrect')::int <> 1 then
    raise exception 'Cody correct Picks were not derived from the actual winner';
  end if;
  if (cody->>'historicalPicksIncorrect')::int <> 0 then
    raise exception 'A missing Cody selection was incorrectly counted as a loss';
  end if;
  if (cody->>'historicalPicksMissing')::int <> 1 then
    raise exception 'Cody missing Picks were not reported separately';
  end if;
  if (cody_event->>'eligibleResolvedBouts')::int <> 2
     or (cody_event->>'picksSubmitted')::int <> 1
     or (cody_event->>'correctPicks')::int <> 1
     or (cody_event->>'incorrectPicks')::int <> 0
     or (cody_event->>'missingPicks')::int <> 1
     or (cody_event->>'excludedResults')::int <> 1 then
    raise exception 'Per-event reconciliation counts are wrong';
  end if;
  if (report#>>'{recordScoringRules,missingSelectionCountsAsLoss}')::boolean is not false
     or (report#>>'{recordScoringRules,predeterminedRecordExpected}')::boolean is not false then
    raise exception 'Picks scoring rules permit a predetermined record or missing-pick loss';
  end if;

  if (select avatar_photo_data from public.profile_preferences pp
      join public.profiles p on p.id=pp.profile_id
      where p.normalized_name='CODY') <> 'data:image/png;base64,Q09EWV9ORVc=' then
    raise exception 'Cody current avatar was overwritten';
  end if;
  if (select official_score from public.find_leader_history h
      join public.profiles p on p.id=h.profile_id
      where p.normalized_name='CODY' and h.day='2026-07-01') <> 0 then
    raise exception 'Legitimate zero Find the Leader score was lost';
  end if;

  second_report := public.import_v1_history_atomic_reconciled(payload);
  if (second_report#>>'{changes,avatarsInserted}')::int <> 0
     or (second_report#>>'{changes,findLeaderInserted}')::int <> 0
     or (second_report#>>'{changes,eventsInserted}')::int <> 0
     or (second_report#>>'{changes,boutsInserted}')::int <> 0
     or (second_report#>>'{changes,picksInserted}')::int <> 0 then
    raise exception 'Second reconciled import mutated rows';
  end if;
  if second_report->'profiles' is distinct from report->'profiles' then
    raise exception 'Second reconciled import changed derived records';
  end if;

  select to_jsonb(e) into protected_after from public.pick_events e where event_id='protected-reconciliation';
  if protected_before is distinct from protected_after
     or report->>'protectedBeforeHash' <> report->>'protectedAfterHash'
     or second_report->>'protectedBeforeHash' <> second_report->>'protectedAfterHash' then
    raise exception 'Protected July 25 Picks data changed';
  end if;

  begin
    perform public.import_v1_history_atomic_reconciled(
      jsonb_set(payload,'{pickFights,0,winnerFighterSlug}','"draw"')
    );
    raise exception 'Unresolved or draw result was accepted';
  exception when raise_exception then
    if sqlerrm = 'Unresolved or draw result was accepted' then raise; end if;
  end;

  begin
    perform public.import_v1_history_atomic_reconciled(
      jsonb_set(payload,'{pickEvents,0,startsAt}','"2026-07-25T00:00:00Z"')
    );
    raise exception 'Cutoff event was accepted';
  exception when raise_exception then
    if sqlerrm = 'Cutoff event was accepted' then raise; end if;
  end;
end $$;

rollback;
