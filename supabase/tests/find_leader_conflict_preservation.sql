begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  n text;
  uid uuid;
  payload jsonb;
  report jsonb;
  cody_id uuid;
begin
  foreach n in array array['BROCK','CODY','RHONDA','SHANE','TONY','TYLER'] loop
    uid := extensions.gen_random_uuid();
    insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
    values(uid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',lower(n)||'@conflict.invalid','',now(),now());
    insert into public.profiles(id,display_name,normalized_name,initials)
    values(uid,n,n,left(n,1));
    if n = 'CODY' then cody_id := uid; end if;
  end loop;

  insert into public.find_leader_history(
    profile_id,day,official_score,best_score,attempts,completed_at,updated_at
  ) values (
    cody_id,'2026-07-01',8,9,2,'2026-07-01T18:00:00Z',now()
  );

  payload := jsonb_build_object(
    'schemaVersion',1,
    'cutoff','2026-07-25T00:00:00.000Z',
    'sourceGroupFingerprint','conflict-fixture',
    'rules',jsonb_build_object('canonicalSixMemberGroupOnly',true),
    'profiles',(
      select jsonb_agg(jsonb_build_object(
        'normalizedName',n,
        'avatarPhotoData',null,
        'findLeader',case when n='CODY' then jsonb_build_array(
          jsonb_build_object(
            'day','2026-07-01','officialScore',10,'bestScore',10,'attempts',1,
            'completedAt','2026-07-01T12:00:00Z'
          ),
          jsonb_build_object(
            'day','2026-07-02','officialScore',7,'bestScore',7,'attempts',1,
            'completedAt','2026-07-02T12:00:00Z'
          )
        ) else '[]'::jsonb end,
        'picks','[]'::jsonb
      ) order by n)
      from unnest(array['BROCK','CODY','RHONDA','SHANE','TONY','TYLER']) n
    ),
    'pickEvents','[]'::jsonb,
    'pickFights','[]'::jsonb
  );

  report := public.import_v1_history_atomic_reconciled(payload);

  if (select official_score from public.find_leader_history
      where profile_id=cody_id and day='2026-07-01') <> 8 then
    raise exception 'existing V2 Find the Leader score was overwritten';
  end if;
  if (select best_score from public.find_leader_history
      where profile_id=cody_id and day='2026-07-01') <> 9 then
    raise exception 'existing V2 Find the Leader best score was overwritten';
  end if;
  if (select attempts from public.find_leader_history
      where profile_id=cody_id and day='2026-07-01') <> 2 then
    raise exception 'existing V2 Find the Leader attempts were overwritten';
  end if;
  if not exists (
    select 1 from public.find_leader_history
    where profile_id=cody_id and day='2026-07-02' and official_score=7
  ) then
    raise exception 'nonconflicting V1 Find the Leader row was not imported';
  end if;
  if (report#>>'{changes,findLeaderConflicts}')::int <> 1
     or (report#>>'{changes,findLeaderPreserved}')::int <> 1 then
    raise exception 'Find the Leader preservation counts were incorrect';
  end if;
  if report->>'findLeaderConflictPolicy' <> 'preserve_existing_v2'
     or report#>>'{findLeaderConflictRows,0,profile}' <> 'CODY'
     or report#>>'{findLeaderConflictRows,0,day}' <> '2026-07-01'
     or (report#>>'{findLeaderConflictRows,0,v1OfficialScore}')::int <> 10
     or (report#>>'{findLeaderConflictRows,0,v2OfficialScore}')::int <> 8 then
    raise exception 'Find the Leader conflict details were not reported safely';
  end if;
end $$;

rollback;
