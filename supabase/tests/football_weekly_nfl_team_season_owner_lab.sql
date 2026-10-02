begin;
select set_config('request.jwt.claim.role','service_role',true);

do $nfl_team_season_owner_lab$
declare
  v_owner uuid;
  v_candidates uuid[]:=array[
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid()
  ];
  v_dummy_week date:=date '2026-12-29';
  v_lab jsonb;
  v_day integer;
  v_seat integer;
  v_final jsonb;
begin
  select profile.id into v_owner
  from public.profiles profile
  where profile.normalized_name='CODY'
  order by profile.created_at
  limit 1;

  if v_owner is null then
    v_owner:=extensions.gen_random_uuid();
    insert into auth.users(
      id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,
      created_at,updated_at,raw_user_meta_data
    ) values (
      v_owner,
      '00000000-0000-0000-0000-000000000000',
      'authenticated','authenticated',
      'nfl-weekly-lab-owner@login.octagon-hq.app','',now(),now(),now(),
      jsonb_build_object('display_name','Cody','historical_unclaimed',true)
    );
    perform public.register_unclaimed_pin_profile(v_owner,'Cody','CK');
  end if;

  insert into public.pick_control_owners(profile_id)
  values(v_owner)
  on conflict(profile_id) do nothing;

  for v_seat in 1..4 loop
    insert into auth.users(
      id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,
      created_at,updated_at,raw_user_meta_data
    ) values (
      v_candidates[v_seat],
      '00000000-0000-0000-0000-000000000000',
      'authenticated','authenticated',
      'nfl-weekly-lab-seat-'||v_seat||'@login.octagon-hq.app','',now(),now(),now(),
      jsonb_build_object(
        'display_name','NFL LAB SEAT '||v_seat,
        'historical_unclaimed',true
      )
    );
    perform public.register_unclaimed_pin_profile(
      v_candidates[v_seat],
      'NFL Lab Seat '||v_seat,
      'L'||v_seat
    );
  end loop;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(v_dummy_week,'cfb-best-teams-since-2000')
  on conflict(week_start) do nothing;

  insert into private.football_weekly_auction_participants(
    week_start,profile_id,locked_at,source
  )
  select
    v_dummy_week,
    candidate,
    (v_dummy_week::timestamp at time zone 'America/Chicago'),
    'nfl_lab_sql_candidate'
  from unnest(v_candidates) candidate
  on conflict(week_start,profile_id) do nothing;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);

  v_lab:=public.reset_my_football_weekly_nfl_team_season_lab();

  if coalesce((v_lab->>'available')::boolean,false) is not true
    or (v_lab->>'day_index')::integer<>1
    or jsonb_array_length(v_lab->'seats')<>5
    or v_lab#>>'{state,subject_key}'<>'nfl-best-team-seasons-since-2000'
    or jsonb_array_length(v_lab#>'{state,teams}')<>4
  then
    raise exception 'owner lab did not initialize a five-seat four-card Day 1: %',v_lab;
  end if;

  if v_lab::text like '%hidden_grade%' or v_lab::text like '%"grade":%' then
    raise exception 'owner lab leaked a hidden grade before finalization';
  end if;

  for v_day in 1..6 loop
    for v_seat in 1..5 loop
      v_lab:=public.submit_my_football_weekly_nfl_team_season_lab_bids(
        v_seat,
        jsonb_build_object('1',0,'2',0,'3',0,'4',0)
      );
    end loop;

    if (v_lab->>'submitted_count')::integer<>5 then
      raise exception 'owner lab Day % did not record all five submissions: %',v_day,v_lab;
    end if;

    v_lab:=public.advance_my_football_weekly_nfl_team_season_lab(1);

    if v_day<6 and (v_lab->>'day_index')::integer<>v_day+1 then
      raise exception 'owner lab did not advance from Day %: %',v_day,v_lab;
    end if;
  end loop;

  if (v_lab->>'day_index')::integer<>7
    or v_lab#>>'{state,theme}'<>'Wildcard Finale'
    or jsonb_array_length(v_lab#>'{state,wildcard,teams}')<>4
  then
    raise exception 'owner lab did not reach a four-card Day 7 finale: %',v_lab;
  end if;

  for v_seat in 1..5 loop
    v_lab:=public.submit_my_football_weekly_nfl_team_season_lab_wildcard(
      v_seat,0,'[]'::jsonb
    );
  end loop;

  if (v_lab->>'submitted_count')::integer<>5 then
    raise exception 'owner lab did not record all five zero-entry Wildcard passes: %',v_lab;
  end if;

  v_lab:=public.advance_my_football_weekly_nfl_team_season_lab(1);

  if coalesce((v_lab->>'completed')::boolean,false) is not true
    or (v_lab->>'day_index')::integer<>8
    or v_lab->'final' is null
  then
    raise exception 'owner lab did not finalize after Day 7: %',v_lab;
  end if;

  for v_seat in 1..5 loop
    v_lab:=public.get_my_football_weekly_nfl_team_season_lab(v_seat);
    v_final:=v_lab->'final';

    if jsonb_array_length(v_final->'collection')<4
      or coalesce((v_final#>>'{my_result,owned_count}')::integer,0)<4
      or coalesce(jsonb_array_length(v_final#>'{my_result,scoring_refs}'),0)<>4
    then
      raise exception 'owner lab seat % did not finish with a valid best-four collection: %',
        v_seat,v_final;
    end if;

    if exists(
      select 1
      from jsonb_array_elements(v_final->'collection') item
      where item->>'source'<>'autofill'
    ) then
      raise exception 'all-pass lab seat % used non-autofill completion inventory: %',
        v_seat,v_final;
    end if;
  end loop;

  if exists(
    select 1
    from private.football_weekly_auction_bankroll_adjustments adjustment
    join private.football_weekly_nfl_team_season_lab_runs lab
      on lab.owner_profile_id=v_owner
     and adjustment.source_week_start=lab.lab_week_start
  ) then
    raise exception 'zero-entry owner lab leaked a Reaping bankroll adjustment';
  end if;

  if exists(
    select 1
    from private.football_weekly_auction_results result
    join private.football_weekly_nfl_team_season_lab_runs lab
      on lab.owner_profile_id=v_owner
     and result.week_start=lab.lab_week_start
  ) then
    raise exception 'owner lab leaked shadow final results into shared Weekly history';
  end if;
end;
$nfl_team_season_owner_lab$;

rollback;

\echo 'NFL Team-Seasons five-seat owner playthrough lab proof passed.'
