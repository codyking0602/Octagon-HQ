begin;

select set_config('request.jwt.claim.role','service_role',true);

do $field_lock$
declare
  v_a uuid := extensions.gen_random_uuid();
  v_b uuid := extensions.gen_random_uuid();
  v_c uuid := extensions.gen_random_uuid();
  v_after_lock uuid := extensions.gen_random_uuid();
  v_gate jsonb;
  v_state jsonb;
  v_count integer;
  v_lock timestamptz;
begin
  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values
    (v_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','weekly-day1-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WEEKLY DAY1 A','historical_unclaimed',true)),
    (v_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','weekly-day1-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WEEKLY DAY1 B','historical_unclaimed',true)),
    (v_c,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','weekly-day1-c@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WEEKLY DAY1 C','historical_unclaimed',true)),
    (v_after_lock,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','weekly-day1-late@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WEEKLY DAY1 LATE','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_a,'Weekly Day1 A','WA');
  perform public.register_unclaimed_pin_profile(v_b,'Weekly Day1 B','WB');
  perform public.register_unclaimed_pin_profile(v_c,'Weekly Day1 C','WC');
  perform public.register_unclaimed_pin_profile(v_after_lock,'Weekly Day1 Late','WL');

  -- Use an NFL Build a QB week well after launch so the proof is independent
  -- of the one-time Sep 22 repair.
  perform private.materialize_football_weekly_auction_week(date '2026-10-06');
  perform private.maintain_football_weekly_auction('2026-10-06 00:01:00-05'::timestamptz);

  select field_locked_at
  into v_lock
  from private.football_weekly_auction_weeks
  where week_start=date '2026-10-06';

  if v_lock is not null then
    raise exception 'Weekly Auction field locked before Day 1 completed: %',v_lock;
  end if;

  select count(*)::integer
  into v_count
  from private.football_weekly_auction_participants
  where week_start=date '2026-10-06';

  if v_count<>0 then
    raise exception 'Weekly Auction preselected participants before anyone joined: %',v_count;
  end if;

  -- Hitting the Football Daily gate on Day 1 opts a player into the field.
  v_gate:=public.football_weekly_auction_daily_gate(
    v_a,
    '2026-10-06 12:00:00-05'::timestamptz
  );
  if (v_gate->>'available')::boolean is distinct from true
    or (v_gate->>'required')::boolean is distinct from true
    or (v_gate->>'field_locked')::boolean is distinct from false
  then
    raise exception 'Day 1 player was not admitted through the Daily gate: %',v_gate;
  end if;

  v_gate:=public.football_weekly_auction_daily_gate(
    v_b,
    '2026-10-06 18:00:00-05'::timestamptz
  );
  if (v_gate->>'available')::boolean is distinct from true then
    raise exception 'second Day 1 player was not admitted: %',v_gate;
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_c::text,true);

  v_state:=public.get_my_football_weekly_auction(
    '2026-10-06 23:30:00-05'::timestamptz
  );
  if (v_state->>'available')::boolean is distinct from true
    or (v_state->>'subject_key') is distinct from 'nfl-build-qb'
  then
    raise exception 'late-Day-1 player did not receive the active board: %',v_state;
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform set_config('request.jwt.claim.sub','',true);

  select count(*)::integer
  into v_count
  from private.football_weekly_auction_participants
  where week_start=date '2026-10-06';

  if v_count<>3 then
    raise exception 'Day 1 join window did not contain exactly the three opt-in players: %',v_count;
  end if;

  -- Midnight CT ending Day 1 freezes exactly the players who joined.
  perform private.maintain_football_weekly_auction(
    '2026-10-07 00:00:01-05'::timestamptz
  );

  select field_locked_at
  into v_lock
  from private.football_weekly_auction_weeks
  where week_start=date '2026-10-06';

  if v_lock is distinct from '2026-10-07 00:00:00-05'::timestamptz then
    raise exception 'Weekly Auction field did not lock at the Day 1 deadline: %',v_lock;
  end if;

  v_gate:=public.football_weekly_auction_daily_gate(
    v_after_lock,
    '2026-10-07 12:00:00-05'::timestamptz
  );
  if (v_gate->>'available')::boolean is distinct from false
    or (v_gate->>'required')::boolean is distinct from false
    or (v_gate->>'eligible_week_start')::date is distinct from date '2026-10-13'
  then
    raise exception 'post-Day-1 join was not deferred to the next week: %',v_gate;
  end if;

  if exists(
    select 1
    from private.football_weekly_auction_participants
    where week_start=date '2026-10-06'
      and profile_id=v_after_lock
  ) then
    raise exception 'post-Day-1 player was added to the frozen field';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_after_lock::text,true);

  v_state:=public.get_my_football_weekly_auction(
    '2026-10-07 12:00:00-05'::timestamptz
  );
  if (v_state->>'available')::boolean is distinct from false
    or (v_state->>'locked_this_week')::boolean is distinct from true
    or (v_state->>'eligible_week_start')::date is distinct from date '2026-10-13'
  then
    raise exception 'post-Day-1 player saw an active Weekly Auction board: %',v_state;
  end if;

  begin
    perform public.submit_my_football_weekly_auction_bids(
      '{"1":1,"2":1,"3":1,"4":1}'::jsonb,
      '2026-10-07 12:00:00-05'::timestamptz
    );
    raise exception 'post-Day-1 player bid was accepted';
  exception
    when others then
      if sqlerrm='post-Day-1 player bid was accepted'
        or position('Weekly Auction field is locked for this week' in sqlerrm)=0
      then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform set_config('request.jwt.claim.sub','',true);

  -- No roster carries into the next week. A player must opt in again on Day 1.
  perform private.materialize_football_weekly_auction_week(date '2026-10-13');
  perform private.maintain_football_weekly_auction('2026-10-13 00:01:00-05'::timestamptz);

  select count(*)::integer
  into v_count
  from private.football_weekly_auction_participants
  where week_start=date '2026-10-13';

  if v_count<>0 then
    raise exception 'Weekly Auction carried prior participants into a new week: %',v_count;
  end if;

  v_gate:=public.football_weekly_auction_daily_gate(
    v_after_lock,
    '2026-10-13 12:00:00-05'::timestamptz
  );
  if (v_gate->>'available')::boolean is distinct from true
    or (v_gate->>'required')::boolean is distinct from true
  then
    raise exception 'deferred player could not join the following Day 1: %',v_gate;
  end if;
end;
$field_lock$;

rollback;

\echo 'Football Weekly Auction Day 1 join-window proof passed.'
