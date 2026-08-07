begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_draft_id uuid;
  v_event public.pick_events;
  v_applied boolean;
  v_anchor timestamptz := timestamptz '2199-08-09 00:00:00+00';
  v_lock timestamptz;
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now())
  where status in ('upcoming','locked');

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values (
    v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'chronological-deadline-owner@login.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','DEADLINE OWNER','historical_unclaimed',true)
  );
  perform public.register_unclaimed_pin_profile(v_owner,'Deadline Owner','CD');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  -- Stage a headline-first card, then change its approved order before publish.
  -- Publication must recompute chronological segment_sequence from that final
  -- order: the bottom main-card fight is the 7:00 PM opener and every later
  -- fight adds exactly 30 minutes until the main event.
  v_draft_id := public.stage_pick_event_draft(jsonb_build_object(
    'source','UFC.com + MMA Mania',
    'source_event_key','gamrot-quillan-chronological-test',
    'source_url','https://example.com/gamrot-quillan-chronological-test',
    'event_id','gamrot-vs-quillan-chronological-test',
    'name','UFC Fight Night: Gamrot vs. Quillan',
    'subtitle','Mateusz Gamrot vs. Quillan Salkilld',
    'venue','UFC Apex',
    'location','Las Vegas, Nevada',
    'starts_at',v_anchor,
    'locks_at',v_anchor,
    'season',2199,
    'bouts',jsonb_build_array(
      jsonb_build_object(
        'bout_id','gamrot-quillan-main-event',
        'position',1,
        'weight_class','Lightweight',
        'red_fighter_name','Mateusz Gamrot',
        'blue_fighter_name','Quillan Salkilld',
        'card_segment','main',
        'segment_sequence',4,
        'included',true
      ),
      jsonb_build_object(
        'bout_id','main-card-2',
        'position',2,
        'weight_class','Welterweight',
        'red_fighter_name','Main Card Two Red',
        'blue_fighter_name','Main Card Two Blue',
        'card_segment','main',
        'segment_sequence',3,
        'included',true
      ),
      jsonb_build_object(
        'bout_id','main-card-3',
        'position',3,
        'weight_class','Middleweight',
        'red_fighter_name','Main Card Three Red',
        'blue_fighter_name','Main Card Three Blue',
        'card_segment','main',
        'segment_sequence',2,
        'included',true
      ),
      jsonb_build_object(
        'bout_id','main-card-4',
        'position',4,
        'weight_class','Featherweight',
        'red_fighter_name','Main Card Four Red',
        'blue_fighter_name','Main Card Four Blue',
        'card_segment','main',
        'segment_sequence',1,
        'included',true
      )
    )
  ));

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  perform public.reorder_pick_event_draft_bouts(
    v_draft_id,
    jsonb_build_array(
      'gamrot-quillan-main-event',
      'main-card-3',
      'main-card-2',
      'main-card-4'
    )
  );
  select * into v_event from public.publish_pick_event_draft(v_draft_id);

  if (select bout_id from public.pick_bouts
      where event_id=v_event.event_id and position=2)
      is distinct from 'main-card-3' then
    raise exception 'approved draft reorder did not own the published deadline order';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id=v_event.event_id and bout_id='main-card-4')
      is distinct from v_anchor then
    raise exception 'first chronological main-card fight missed the 7:00 PM anchor';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id=v_event.event_id and bout_id='main-card-2')
      is distinct from v_anchor + interval '30 minutes'
    or (select locks_at from public.pick_bouts
      where event_id=v_event.event_id and bout_id='main-card-3')
      is distinct from v_anchor + interval '60 minutes' then
    raise exception 'later main-card fights missed 30-minute increments';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id=v_event.event_id and bout_id='gamrot-quillan-main-event')
      is distinct from v_anchor + interval '90 minutes' then
    raise exception 'main event did not receive the latest deadline';
  end if;
  if exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id=v_event.event_id
      and bout.locks_at is distinct from v_anchor
        + make_interval(mins => 30 * (bout.segment_sequence - 1))
  ) then
    raise exception 'future event creation did not apply the chronological stagger automatically';
  end if;

  -- Recreate the briefly deployed reverse-position schedule shown on the live
  -- Gamrot vs. Quillan card, then repair it through the same guarded calculator.
  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_bouts bout
  set locks_at = v_anchor - make_interval(mins => 30 * (bout.position - 1))
  where event_id = v_event.event_id;
  v_applied := private.apply_initial_pick_bout_deadlines(v_event.event_id, true);
  if not v_applied then
    raise exception 'Gamrot vs. Quillan reverse schedule repair did not apply';
  end if;
  if exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id=v_event.event_id
      and bout.locks_at is distinct from v_anchor
        + make_interval(mins => 30 * (bout.segment_sequence - 1))
  ) then
    raise exception 'Gamrot vs. Quillan chronological repair produced incorrect deadlines';
  end if;

  -- The existing per-bout mutation remains the sole owner for +10, +20, and
  -- custom event-day adjustments.
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  select locks_at into v_lock
  from public.pick_bouts
  where event_id=v_event.event_id and bout_id='main-card-3';
  perform public.adjust_pick_bout_lock_time(
    v_event.event_id,'main-card-3',v_lock + interval '10 minutes'
  );
  if (select locks_at from public.pick_bouts
      where event_id=v_event.event_id and bout_id='main-card-3')
      is distinct from v_lock + interval '10 minutes' then
    raise exception '+10 minute adjustment failed';
  end if;
  perform public.adjust_pick_bout_lock_time(
    v_event.event_id,'main-card-3',v_lock + interval '30 minutes'
  );
  if (select locks_at from public.pick_bouts
      where event_id=v_event.event_id and bout_id='main-card-3')
      is distinct from v_lock + interval '30 minutes' then
    raise exception '+20 minute adjustment failed';
  end if;
  perform public.adjust_pick_bout_lock_time(
    v_event.event_id,'main-card-2',v_anchor + interval '45 minutes'
  );
  if (select locks_at from public.pick_bouts
      where event_id=v_event.event_id and bout_id='main-card-2')
      is distinct from v_anchor + interval '45 minutes' then
    raise exception 'custom-time adjustment failed';
  end if;

  -- Any intentional per-fight difference makes the guarded initialization path
  -- a no-op, preserving established manual adjustments.
  v_applied := private.apply_initial_pick_bout_deadlines(v_event.event_id, true);
  if v_applied then
    raise exception 'manual deadline was overwritten by initial deadline repair';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id=v_event.event_id and bout_id='main-card-2')
      is distinct from v_anchor + interval '45 minutes' then
    raise exception 'custom-time deadline changed during guarded repair';
  end if;

  -- A passed bout is final through the existing mutation and through the
  -- guarded initialization helper.
  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_bouts
  set locks_at = now() - interval '1 minute'
  where event_id=v_event.event_id and bout_id='main-card-4';
  v_applied := private.apply_initial_pick_bout_deadlines(v_event.event_id, true);
  if v_applied then
    raise exception 'finalized deadline was reopened or overwritten';
  end if;
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  begin
    perform public.adjust_pick_bout_lock_time(
      v_event.event_id,'main-card-4',v_anchor
    );
    raise exception 'passed bout lock was reopened';
  exception when others then
    if sqlerrm not like '%locked, removed, or resulted fight deadline cannot change%'
      and sqlerrm not like '%locked bout cannot be reopened%' then raise; end if;
  end;

  -- Resulted and event-finalized rows remain closed under the same established
  -- no-reopen boundaries.
  perform public.approve_pick_bout_cancellation(
    v_event.event_id,'gamrot-quillan-main-event',true,
    'Prove finalized deadline safety'
  );
  begin
    perform public.adjust_pick_bout_lock_time(
      v_event.event_id,'gamrot-quillan-main-event',v_anchor + interval '2 hours'
    );
    raise exception 'resulted bout was reopened';
  exception when others then
    if sqlerrm not like '%locked, removed, or resulted fight deadline cannot change%'
      and sqlerrm not like '%resulted bout cannot be reopened%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events
  set status='locked'
  where event_id=v_event.event_id;
  v_applied := private.apply_initial_pick_bout_deadlines(v_event.event_id, true);
  if v_applied then
    raise exception 'locked event deadlines were overwritten';
  end if;
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  begin
    perform public.adjust_pick_bout_lock_time(
      v_event.event_id,'main-card-2',v_anchor + interval '2 hours'
    );
    raise exception 'locked event was reopened';
  exception when others then
    if sqlerrm not like '%ordinary fight changes require an upcoming event%'
      and sqlerrm not like '%locked, removed, or resulted fight deadline cannot change%'
      and sqlerrm not like '%event cannot be reopened%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events
  set status='complete',completed_at=now()
  where event_id=v_event.event_id;
  v_applied := private.apply_initial_pick_bout_deadlines(v_event.event_id, true);
  if v_applied then
    raise exception 'completed event deadlines were overwritten';
  end if;
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  begin
    perform public.adjust_pick_bout_lock_time(
      v_event.event_id,'main-card-2',v_anchor + interval '3 hours'
    );
    raise exception 'completed event was reopened';
  exception when others then
    if sqlerrm not like '%completed event is immutable%'
      and sqlerrm not like '%event cannot be reopened%' then raise; end if;
  end;
end
$$;

rollback;