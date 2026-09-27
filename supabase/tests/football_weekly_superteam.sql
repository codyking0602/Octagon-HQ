begin;

select set_config('request.jwt.claim.role','service_role',true);

do $cfb_superteam_lifecycle$
declare
  v_players uuid[]:=array[
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid()
  ];
  v_names text[]:=array[
    'SUPERTEAM A','SUPERTEAM B','SUPERTEAM C','SUPERTEAM D','SUPERTEAM E'
  ];
  v_initials text[]:=array['SA','SB','SC','SD','SE'];
  v_profile uuid;
  v_index integer;
  v_day integer;
  v_submit_at timestamptz;
  v_lock_at timestamptz;
  v_payload jsonb;
  v_state jsonb;
  v_count integer;
begin
  for v_index in 1..5 loop
    insert into auth.users(
      id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,
      created_at,updated_at,raw_user_meta_data
    ) values(
      v_players[v_index],
      '00000000-0000-0000-0000-000000000000',
      'authenticated','authenticated',
      'cfb-superteam-' || v_index::text || '@login.octagon-hq.app',
      '',now(),now(),now(),
      jsonb_build_object(
        'display_name',v_names[v_index],
        'historical_unclaimed',true
      )
    );
    perform public.register_unclaimed_pin_profile(
      v_players[v_index],v_names[v_index],v_initials[v_index]
    );
  end loop;

  perform private.materialize_football_weekly_auction_week(date '2026-09-29');

  if (select subject_key from private.football_weekly_auction_weeks where week_start=date '2026-09-29')
      is distinct from 'cfb-superteam' then
    raise exception 'Sep 29 did not materialize as CFB Superteam';
  end if;

  if (select count(*) from private.football_weekly_auction_board where week_start=date '2026-09-29')<>56 then
    raise exception 'CFB Superteam did not materialize 56 cards';
  end if;

  -- Day 1: A deliberately overcommits $60 across three ranked claims.
  -- A can win only two cards; B must inherit card 3 after A hits the daily cap.
  v_submit_at:='2026-09-29 12:00:00-05'::timestamptz;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_players[1]::text,true);
  v_state:=public.submit_my_football_weekly_auction_bids(
    '{"1":20,"2":20,"3":20,"4":0,"5":0,"6":0,"7":0,"8":0,
      "_priorities":{"1":1,"2":2,"3":3}}'::jsonb,
    v_submit_at
  );
  if (v_state->>'subject_key') is distinct from 'cfb-superteam' then
    raise exception 'A did not receive CFB Superteam state: %',v_state;
  end if;

  perform set_config('request.jwt.claim.sub',v_players[2]::text,true);
  perform public.submit_my_football_weekly_auction_bids(
    '{"1":0,"2":0,"3":19,"4":0,"5":0,"6":0,"7":0,"8":0,
      "_priorities":{"3":1}}'::jsonb,
    v_submit_at
  );

  for v_index in 3..5 loop
    perform set_config('request.jwt.claim.sub',v_players[v_index]::text,true);
    perform public.submit_my_football_weekly_auction_bids(
      '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,
        "_priorities":{}}'::jsonb,
      v_submit_at
    );
  end loop;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform set_config('request.jwt.claim.sub','',true);

  if (select count(*) from private.football_weekly_auction_participants where week_start=date '2026-09-29')<>5 then
    raise exception 'CFB Superteam did not lock onto five opt-in players';
  end if;

  perform private.maintain_football_weekly_auction(
    '2026-09-30 00:00:01-05'::timestamptz
  );

  select count(*)::integer into v_count
  from private.football_weekly_auction_awards
  where week_start=date '2026-09-29'
    and day_index=1
    and profile_id=v_players[1]
    and award_source='auction';
  if v_count<>2 then
    raise exception 'max-two daily wins failed for A: %',v_count;
  end if;

  if not exists(
    select 1
    from private.football_weekly_auction_awards
    where week_start=date '2026-09-29'
      and day_index=1
      and slot=3
      and profile_id=v_players[2]
      and winning_bid=19
      and award_source='auction'
  ) then
    raise exception 'conditional overcommit did not fall through to B on card 3';
  end if;

  if (
    select coalesce(sum(winning_bid),0)
    from private.football_weekly_auction_awards
    where week_start=date '2026-09-29'
      and profile_id=v_players[1]
      and award_source='auction'
  )<>40 then
    raise exception 'A did not spend the expected $40 on the two valid Day 1 wins';
  end if;

  -- Days 2-7: all five players pass. This intentionally exercises the
  -- end-of-week completion fallback against a five-player field.
  for v_day in 2..7 loop
    v_submit_at:=(
      (date '2026-09-29'+(v_day-1))::timestamp + interval '12 hours'
    ) at time zone 'America/Chicago';

    for v_index in 1..5 loop
      perform set_config('request.jwt.claim.role','authenticated',true);
      perform set_config('request.jwt.claim.sub',v_players[v_index]::text,true);
      perform public.submit_my_football_weekly_auction_bids(
        '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,
          "_priorities":{}}'::jsonb,
        v_submit_at
      );
    end loop;

    perform set_config('request.jwt.claim.role','service_role',true);
    perform set_config('request.jwt.claim.sub','',true);
    v_lock_at:=(
      (date '2026-09-29'+v_day)::timestamp + interval '1 second'
    ) at time zone 'America/Chicago';
    perform private.maintain_football_weekly_auction(v_lock_at);
  end loop;

  if (select finalized_at from private.football_weekly_auction_weeks where week_start=date '2026-09-29') is null then
    raise exception 'CFB Superteam did not finalize after Day 7';
  end if;

  if (select count(*) from private.football_weekly_auction_results where week_start=date '2026-09-29')<>5 then
    raise exception 'CFB Superteam did not produce five final results';
  end if;

  if exists(
    select 1
    from private.football_weekly_auction_results
    where week_start=date '2026-09-29'
      and (owned_count<>7 or final_score is null or scoring_cost is null or scoring_cost>50)
  ) then
    raise exception 'CFB Superteam produced an incomplete or over-budget final result';
  end if;

  if exists(
    select participant.profile_id
    from private.football_weekly_auction_participants participant
    left join private.football_weekly_auction_awards award
      on award.week_start=participant.week_start
     and award.profile_id=participant.profile_id
     and award.roster_slot is not null
    where participant.week_start=date '2026-09-29'
    group by participant.profile_id
    having count(distinct award.roster_slot)<>7
  ) then
    raise exception 'CFB Superteam fallback did not complete all seven roster slots';
  end if;

  if not exists(
    select 1
    from private.football_weekly_auction_awards
    where week_start=date '2026-09-29'
      and award_source='autofill'
  ) then
    raise exception 'CFB Superteam completion fallback was not exercised';
  end if;

  if exists(
    select profile_id,day_index
    from private.football_weekly_auction_awards
    where week_start=date '2026-09-29'
      and award_source='auction'
      and profile_id is not null
    group by profile_id,day_index
    having count(*)>2
  ) then
    raise exception 'CFB Superteam exceeded the two-auction-wins-per-day cap';
  end if;
end;
$cfb_superteam_lifecycle$;

rollback;

\echo 'CFB Superteam five-player lifecycle proof passed.'
