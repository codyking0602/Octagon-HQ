create or replace function public.import_v1_history_atomic(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cutoff constant timestamptz := '2026-07-25T00:00:00Z';
  v_expected constant text[] := array['BROCK','CODY','RHONDA','SHANE','TONY','TYLER'];
  v_names text[];
  v_before jsonb;
  v_after jsonb;
  v_changes jsonb;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('octagon-v1-history-import', 0));

  if p_payload->>'schemaVersion' <> '1'
     or (p_payload->>'cutoff')::timestamptz <> v_cutoff
     or coalesce((p_payload->>'sourceGroupMatchCount')::int, 0) <> 1
     or nullif(p_payload->>'sourceGroupFingerprint', '') is null then
    raise exception 'unsupported payload or cutoff';
  end if;

  select array_agg(name order by name)
  into v_names
  from (
    select upper(regexp_replace(trim(profile.value->>'normalizedName'), '\s+', ' ', 'g')) as name
    from jsonb_array_elements(p_payload->'profiles') as profile(value)
  ) as names;

  if v_names is distinct from v_expected
     or (select count(*) from jsonb_array_elements(p_payload->'profiles')) <> 6
     or (select count(distinct upper(regexp_replace(trim(profile.value->>'normalizedName'), '\s+', ' ', 'g')))
         from jsonb_array_elements(p_payload->'profiles') as profile(value)) <> 6 then
    raise exception 'canonical six-member group mismatch';
  end if;

  if (select count(*) from public.profiles where normalized_name = any(v_expected)) <> 6 then
    raise exception 'V2 canonical profile mismatch';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_payload->'pickEvents') as event(value)
    where event.value->>'status' <> 'complete'
       or (event.value->>'startsAt')::timestamptz >= v_cutoff
  ) then
    raise exception 'incomplete or protected event in payload';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_payload->'pickFights') as fight(value)
    where nullif(fight.value->>'winnerFighterSlug', '') is null
       or fight.value->>'winnerFighterSlug' not in (
         fight.value->>'redFighterSlug',
         fight.value->>'blueFighterSlug'
       )
       or not exists (
         select 1
         from jsonb_array_elements(p_payload->'pickEvents') as event(value)
         where event.value->>'eventId' = fight.value->>'eventId'
       )
  ) then
    raise exception 'unresolved or orphaned fight in payload';
  end if;

  if exists (
       select 1 from jsonb_array_elements(p_payload->'pickEvents') as event(value)
       group by event.value->>'eventId' having count(*) > 1
     )
     or exists (
       select 1 from jsonb_array_elements(p_payload->'pickFights') as fight(value)
       group by fight.value->>'eventId', fight.value->>'boutId' having count(*) > 1
     )
     or exists (
       select 1
       from jsonb_array_elements(p_payload->'profiles') as profile(value),
            jsonb_array_elements(coalesce(profile.value->'findLeader', '[]'::jsonb)) as history(value)
       group by profile.value->>'normalizedName', history.value->>'day' having count(*) > 1
     )
     or exists (
       select 1
       from jsonb_array_elements(p_payload->'profiles') as profile(value),
            jsonb_array_elements(coalesce(profile.value->'picks', '[]'::jsonb)) as pick(value)
       group by profile.value->>'normalizedName', pick.value->>'eventId', pick.value->>'fightId'
       having count(*) > 1
     ) then
    raise exception 'duplicate payload identity';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_payload->'profiles') as profile(value),
         jsonb_array_elements(coalesce(profile.value->'findLeader', '[]'::jsonb)) as history(value)
    where (history.value->>'officialScore')::int not between 0 and 10
       or (history.value->>'bestScore')::int not between 0 and 10
       or (history.value->>'bestScore')::int < (history.value->>'officialScore')::int
       or (history.value->>'attempts')::int < 1
  ) then
    raise exception 'invalid Find the Leader row';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_payload->'profiles') as profile(value)
    where nullif(profile.value->>'avatarPhotoData', '') is not null
      and (
        length(profile.value->>'avatarPhotoData') > 240000
        or profile.value->>'avatarPhotoData' not like 'data:image/%;base64,%'
      )
  ) then
    raise exception 'invalid avatar payload';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_payload->'profiles') as profile(value),
         jsonb_array_elements(coalesce(profile.value->'picks', '[]'::jsonb)) as pick(value)
    left join lateral (
      select fight.value
      from jsonb_array_elements(p_payload->'pickFights') as fight(value)
      where fight.value->>'eventId' = pick.value->>'eventId'
        and fight.value->>'boutId' = pick.value->>'fightId'
    ) as matched_fight on true
    where matched_fight.value is null
       or pick.value->>'fighterSlug' not in (
         matched_fight.value->>'redFighterSlug',
         matched_fight.value->>'blueFighterSlug'
       )
  ) then
    raise exception 'invalid historical pick';
  end if;

  select jsonb_build_object(
    'events', coalesce((
      select jsonb_agg(to_jsonb(event_row) order by event_row.event_id)
      from public.pick_events event_row
      where event_row.starts_at >= v_cutoff
    ), '[]'::jsonb),
    'bouts', coalesce((
      select jsonb_agg(to_jsonb(bout_row) order by bout_row.event_id, bout_row.position)
      from public.pick_bouts bout_row
      join public.pick_events event_row using(event_id)
      where event_row.starts_at >= v_cutoff
    ), '[]'::jsonb),
    'picks', coalesce((
      select jsonb_agg(to_jsonb(pick_row) order by pick_row.profile_id, pick_row.event_id, pick_row.bout_id)
      from public.profile_event_picks pick_row
      join public.pick_events event_row using(event_id)
      where event_row.starts_at >= v_cutoff
    ), '[]'::jsonb)
  ) into v_before;

  if exists (
    select 1
    from jsonb_array_elements(p_payload->'pickEvents') as event(value)
    join public.pick_events existing on existing.event_id = event.value->>'eventId'
    where (existing.name, existing.starts_at, existing.locks_at, existing.season, existing.status)
      is distinct from (
        event.value->>'name',
        (event.value->>'startsAt')::timestamptz,
        (event.value->>'locksAt')::timestamptz,
        (event.value->>'season')::smallint,
        'complete'
      )
  ) then
    raise exception 'existing historical event conflict';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_payload->'profiles') as profile(value)
    join public.profiles canonical on canonical.normalized_name = profile.value->>'normalizedName'
    cross join lateral jsonb_array_elements(coalesce(profile.value->'findLeader', '[]'::jsonb)) as history(value)
    join public.find_leader_history existing
      on existing.profile_id = canonical.id
     and existing.day = (history.value->>'day')::date
    where (existing.official_score, existing.best_score, existing.attempts)
      is distinct from (
        (history.value->>'officialScore')::smallint,
        (history.value->>'bestScore')::smallint,
        (history.value->>'attempts')::int
      )
  ) then
    raise exception 'existing Find the Leader conflict';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_payload->'pickFights') as fight(value)
    join public.pick_bouts existing
      on existing.event_id = fight.value->>'eventId'
     and existing.bout_id = fight.value->>'boutId'
    where (existing.red_fighter_slug, existing.blue_fighter_slug, existing.winner_fighter_slug)
      is distinct from (
        fight.value->>'redFighterSlug',
        fight.value->>'blueFighterSlug',
        fight.value->>'winnerFighterSlug'
      )
  ) then
    raise exception 'existing historical bout conflict';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_payload->'profiles') as profile(value)
    join public.profiles canonical on canonical.normalized_name = profile.value->>'normalizedName'
    cross join lateral jsonb_array_elements(coalesce(profile.value->'picks', '[]'::jsonb)) as pick(value)
    join public.profile_event_picks existing
      on existing.profile_id = canonical.id
     and existing.event_id = pick.value->>'eventId'
     and existing.bout_id = pick.value->>'fightId'
    where existing.fighter_slug <> pick.value->>'fighterSlug'
  ) then
    raise exception 'existing historical pick conflict';
  end if;

  with source_rows as (
    select canonical.id as profile_id, profile.value->>'avatarPhotoData' as avatar
    from jsonb_array_elements(p_payload->'profiles') as profile(value)
    join public.profiles canonical on canonical.normalized_name = profile.value->>'normalizedName'
    where nullif(profile.value->>'avatarPhotoData', '') is not null
  ), inserted as (
    insert into public.profile_preferences(profile_id, avatar_photo_data, updated_at)
    select profile_id, avatar, now() from source_rows
    on conflict(profile_id) do update
      set avatar_photo_data = excluded.avatar_photo_data,
          updated_at = now()
      where public.profile_preferences.avatar_photo_data is null
    returning 1
  )
  select jsonb_build_object('avatarsInserted', count(*)) into v_changes from inserted;

  with source_rows as (
    select
      canonical.id as profile_id,
      (history.value->>'day')::date as day,
      (history.value->>'officialScore')::smallint as official_score,
      (history.value->>'bestScore')::smallint as best_score,
      (history.value->>'attempts')::int as attempts,
      (history.value->>'completedAt')::timestamptz as completed_at
    from jsonb_array_elements(p_payload->'profiles') as profile(value)
    join public.profiles canonical on canonical.normalized_name = profile.value->>'normalizedName'
    cross join lateral jsonb_array_elements(coalesce(profile.value->'findLeader', '[]'::jsonb)) as history(value)
  ), inserted as (
    insert into public.find_leader_history(
      profile_id, day, official_score, best_score, attempts, completed_at, updated_at
    )
    select profile_id, day, official_score, best_score, attempts, completed_at, now()
    from source_rows
    on conflict do nothing
    returning 1
  )
  select v_changes || jsonb_build_object('findLeaderInserted', count(*)) into v_changes from inserted;

  with inserted as (
    insert into public.pick_events(
      event_id, name, subtitle, venue, location, starts_at, locks_at, season, status, updated_at
    )
    select
      event.value->>'eventId',
      event.value->>'name',
      coalesce(event.value->>'subtitle', ''),
      coalesce(event.value->>'venue', ''),
      coalesce(event.value->>'location', ''),
      (event.value->>'startsAt')::timestamptz,
      (event.value->>'locksAt')::timestamptz,
      (event.value->>'season')::smallint,
      'complete',
      now()
    from jsonb_array_elements(p_payload->'pickEvents') as event(value)
    on conflict do nothing
    returning 1
  )
  select v_changes || jsonb_build_object('eventsInserted', count(*)) into v_changes from inserted;

  with inserted as (
    insert into public.pick_bouts(
      event_id, bout_id, position, weight_class,
      red_fighter_slug, red_fighter_name,
      blue_fighter_slug, blue_fighter_name,
      winner_fighter_slug
    )
    select
      fight.value->>'eventId',
      fight.value->>'boutId',
      (fight.value->>'position')::smallint,
      fight.value->>'weightClass',
      fight.value->>'redFighterSlug',
      fight.value->>'redFighterName',
      fight.value->>'blueFighterSlug',
      fight.value->>'blueFighterName',
      fight.value->>'winnerFighterSlug'
    from jsonb_array_elements(p_payload->'pickFights') as fight(value)
    on conflict do nothing
    returning 1
  )
  select v_changes || jsonb_build_object('boutsInserted', count(*)) into v_changes from inserted;

  with source_rows as (
    select
      canonical.id as profile_id,
      pick.value->>'eventId' as event_id,
      pick.value->>'fightId' as bout_id,
      pick.value->>'fighterSlug' as fighter_slug,
      coalesce(
        (pick.value->>'pickedAt')::timestamptz,
        (event.value->>'startsAt')::timestamptz
      ) as picked_at
    from jsonb_array_elements(p_payload->'profiles') as profile(value)
    join public.profiles canonical on canonical.normalized_name = profile.value->>'normalizedName'
    cross join lateral jsonb_array_elements(coalesce(profile.value->'picks', '[]'::jsonb)) as pick(value)
    join lateral (
      select event.value
      from jsonb_array_elements(p_payload->'pickEvents') as event(value)
      where event.value->>'eventId' = pick.value->>'eventId'
    ) as event on true
  ), inserted as (
    insert into public.profile_event_picks(
      profile_id, event_id, bout_id, fighter_slug, picked_at, updated_at
    )
    select profile_id, event_id, bout_id, fighter_slug, picked_at, picked_at
    from source_rows
    on conflict do nothing
    returning 1
  )
  select v_changes || jsonb_build_object('picksInserted', count(*)) into v_changes from inserted;

  select jsonb_build_object(
    'events', coalesce((
      select jsonb_agg(to_jsonb(event_row) order by event_row.event_id)
      from public.pick_events event_row
      where event_row.starts_at >= v_cutoff
    ), '[]'::jsonb),
    'bouts', coalesce((
      select jsonb_agg(to_jsonb(bout_row) order by bout_row.event_id, bout_row.position)
      from public.pick_bouts bout_row
      join public.pick_events event_row using(event_id)
      where event_row.starts_at >= v_cutoff
    ), '[]'::jsonb),
    'picks', coalesce((
      select jsonb_agg(to_jsonb(pick_row) order by pick_row.profile_id, pick_row.event_id, pick_row.bout_id)
      from public.profile_event_picks pick_row
      join public.pick_events event_row using(event_id)
      where event_row.starts_at >= v_cutoff
    ), '[]'::jsonb)
  ) into v_after;

  if v_before is distinct from v_after then
    raise exception 'protected Picks snapshot changed';
  end if;

  v_changes := v_changes || jsonb_build_object(
    'profilesMatched', 6,
    'profilesSkipped', 0,
    'avatarsPreserved', (
      select count(*)
      from jsonb_array_elements(p_payload->'profiles') as profile(value)
      join public.profiles canonical on canonical.normalized_name = profile.value->>'normalizedName'
      join public.profile_preferences preference on preference.profile_id = canonical.id
      where nullif(profile.value->>'avatarPhotoData', '') is not null
    ) - (v_changes->>'avatarsInserted')::int,
    'findLeaderConflicts', 0,
    'eventsPreserved', (select count(*) from jsonb_array_elements(p_payload->'pickEvents')) - (v_changes->>'eventsInserted')::int,
    'boutsPreserved', (select count(*) from jsonb_array_elements(p_payload->'pickFights')) - (v_changes->>'boutsInserted')::int,
    'picksPreserved', (
      select count(*)
      from jsonb_array_elements(p_payload->'profiles') as profile(value),
           jsonb_array_elements(coalesce(profile.value->'picks', '[]'::jsonb)) as pick(value)
    ) - (v_changes->>'picksInserted')::int
  );

  return jsonb_build_object(
    'cutoff', v_cutoff,
    'sourceGroupFingerprint', p_payload->>'sourceGroupFingerprint',
    'changes', v_changes,
    'excluded', coalesce(p_payload->'summary'->'excluded', '{}'::jsonb),
    'protectedBeforeHash', encode(extensions.digest(v_before::text, 'sha256'), 'hex'),
    'protectedAfterHash', encode(extensions.digest(v_after::text, 'sha256'), 'hex'),
    'protectedEventCount', jsonb_array_length(v_after->'events'),
    'protectedBoutCount', jsonb_array_length(v_after->'bouts'),
    'protectedPickCount', jsonb_array_length(v_after->'picks')
  );
end;
$$;

revoke all on function public.import_v1_history_atomic(jsonb) from public, anon, authenticated;
grant execute on function public.import_v1_history_atomic(jsonb) to service_role;
