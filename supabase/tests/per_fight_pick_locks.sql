begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_other uuid := extensions.gen_random_uuid();
  v_old_event_lock timestamptz;
  v_new_event_lock timestamptz;
  v_early_lock timestamptz;
  v_later_lock timestamptz;
  v_result_at timestamptz;
  v_reveal jsonb;
  v_current jsonb;
  v_control jsonb;
  v_history jsonb;
  v_progress record;
  v_draft_id uuid;
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now())
  where status in ('upcoming','locked');

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data
  )
  values
    (v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'fight-lock-owner@login.octagon-hq.app','',now(),now(),now(),
      jsonb_build_object('display_name','FIGHT LOCK OWNER','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'fight-lock-member@login.octagon-hq.app','',now(),now(),now(),
      jsonb_build_object('display_name','FIGHT LOCK MEMBER','historical_unclaimed',true)),
    (v_other,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'fight-lock-other@login.octagon-hq.app','',now(),now(),now(),
      jsonb_build_object('display_name','FIGHT LOCK OTHER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner,'Fight Lock Owner','FO');
  perform public.register_unclaimed_pin_profile(v_member,'Fight Lock Member','FM');
  perform public.register_unclaimed_pin_profile(v_other,'Fight Lock Other','FX');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  v_old_event_lock := now() + interval '12 hours';
  v_new_event_lock := now() + interval '10 hours';
  v_early_lock := now() + interval '2 hours';
  v_later_lock := now() + interval '1 day';

  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,locks_at,season,status
  )
  values(
    'per-fight-lock-test','UFC Per-Fight Lock Test','Early vs. Later',
    'Test Arena','Dallas, Texas',now()+interval '2 days',
    v_old_event_lock,2199,'upcoming'
  );

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,
    red_american_odds,blue_american_odds,odds_source,odds_updated_at,locks_at
  )
  values
    ('per-fight-lock-test','early-bout',1,'Lightweight',
      'early-red','Early Red','early-blue','Early Blue',
      150,-170,'Test Sportsbook',now(),v_early_lock),
    ('per-fight-lock-test','later-bout',2,'Welterweight',
      'later-red','Later Red','later-blue','Later Blue',
      -120,110,'Test Sportsbook',now(),v_later_lock),
    ('per-fight-lock-test','default-bout',3,'Middleweight',
      'default-red','Default Red','default-blue','Default Blue',
      125,-145,'Test Sportsbook',now(),v_old_event_lock),
    ('per-fight-lock-test','legacy-bout',4,'Featherweight',
      'legacy-red','Legacy Red','legacy-blue','Legacy Blue',
      -130,115,'Test Sportsbook',now(),null);

  -- The existing event-wide deadline owner moves only still-defaulted bouts.
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  perform public.adjust_pick_event_lock_time(
    'per-fight-lock-test',v_new_event_lock,v_old_event_lock,'Move the shared default deadline'
  );
  if (select locks_at from public.pick_bouts
      where event_id='per-fight-lock-test' and bout_id='default-bout')
      is distinct from v_new_event_lock then
    raise exception 'event-wide deadline did not move a defaulted bout';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id='per-fight-lock-test' and bout_id='early-bout')
      is distinct from v_early_lock
    or (select locks_at from public.pick_bouts
      where event_id='per-fight-lock-test' and bout_id='later-bout')
      is distinct from v_later_lock then
    raise exception 'event-wide deadline overwrote an explicitly adjusted bout';
  end if;

  -- Open bouts accept first picks and edits through the one canonical mutation.
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('per-fight-lock-test','early-bout','early-red');
  perform public.save_my_event_pick('per-fight-lock-test','early-bout','early-blue');
  perform public.save_my_event_pick('per-fight-lock-test','early-bout','early-red');
  perform public.save_my_event_pick('per-fight-lock-test','later-bout','later-red');
  perform public.save_my_event_pick('per-fight-lock-test','default-bout','default-red');
  perform public.save_my_event_pick('per-fight-lock-test','legacy-bout','legacy-red');

  if not exists (
    select 1
    from public.list_my_event_picks('per-fight-lock-test')
    where bout_id='early-bout' and fighter_slug='early-red'
  ) then
    raise exception 'own open-bout pick was not readable';
  end if;

  perform public.set_my_event_underdog_lock(
    'per-fight-lock-test','early-bout','early-red'
  );

  perform set_config('request.jwt.claim.sub',v_other::text,true);
  perform public.save_my_event_pick('per-fight-lock-test','later-bout','later-blue');
  perform public.set_my_event_underdog_lock(
    'per-fight-lock-test','later-bout','later-blue'
  );

  if has_table_privilege('authenticated','public.profile_event_picks','INSERT')
    or has_table_privilege('authenticated','public.profile_event_picks','UPDATE')
    or has_table_privilege('authenticated','public.profile_event_picks','DELETE') then
    raise exception 'browser role can bypass the canonical pick mutation';
  end if;

  -- Open picks stay private from another member and from anonymous viewers.
  v_reveal := public.resolved_bout_group_picks('per-fight-lock-test','later-bout');
  if jsonb_array_length(v_reveal) <> 0 then
    raise exception 'other member read an open-bout pick';
  end if;
  perform set_config('request.jwt.claim.role','anon',true);
  perform set_config('request.jwt.claim.sub','',true);
  if public.resolved_bout_group_picks('per-fight-lock-test','later-bout') <> '[]'::jsonb then
    raise exception 'anonymous viewer read private picks';
  end if;
  if has_function_privilege(
    'anon','public.adjust_pick_bout_lock_time(text,text,timestamptz)','EXECUTE'
  ) then
    raise exception 'anonymous viewer can adjust a bout lock';
  end if;

  -- Non-owners cannot move a future lock, while the canonical owner can.
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  begin
    perform public.adjust_pick_bout_lock_time(
      'per-fight-lock-test','later-bout',now()+interval '20 hours'
    );
    raise exception 'non-owner adjusted a bout lock';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_later_lock := now() + interval '2 days 6 hours';
  perform public.adjust_pick_bout_lock_time(
    'per-fight-lock-test','later-bout',v_later_lock
  );
  if (select locks_at from public.pick_bouts
      where event_id='per-fight-lock-test' and bout_id='later-bout')
      is distinct from v_later_lock then
    raise exception 'future lock after event start was not accepted';
  end if;
  v_later_lock := now() + interval '20 hours';
  perform public.adjust_pick_bout_lock_time(
    'per-fight-lock-test','later-bout',v_later_lock
  );

  -- Approved pre-lock cancellation/restoration remains intact and private.
  perform public.approve_pick_bout_cancellation(
    'per-fight-lock-test','default-bout',true,'Temporary pre-lock cancellation'
  );
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  if public.resolved_bout_group_picks('per-fight-lock-test','default-bout') <> '[]'::jsonb then
    raise exception 'pre-lock cancellation revealed private picks';
  end if;
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  perform public.approve_pick_bout_cancellation(
    'per-fight-lock-test','default-bout',false,'Fight restored before its deadline'
  );

  -- Reordering changes positions only; every lock remains with its bout ID.
  perform public.approve_pick_card_reorder(
    'per-fight-lock-test',
    array['early-bout','later-bout','default-bout','legacy-bout'],
    array['later-bout','early-bout','legacy-bout','default-bout'],
    'Reorder without moving lock ownership'
  );
  if (select locks_at from public.pick_bouts
      where event_id='per-fight-lock-test' and bout_id='early-bout')
      is distinct from v_early_lock
    or (select locks_at from public.pick_bouts
      where event_id='per-fight-lock-test' and bout_id='later-bout')
      is distinct from v_later_lock then
    raise exception 'reorder moved a lock to a different fight';
  end if;

  -- Lock the early bout. A first pick, changed pick, bonus mutation, odds write,
  -- and direct card-change bypass must all fail, while a no-op remains valid.
  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_bouts
  set locks_at = now() - interval '1 minute'
  where event_id='per-fight-lock-test' and bout_id='early-bout';
  v_early_lock := (
    select locks_at from public.pick_bouts
    where event_id='per-fight-lock-test' and bout_id='early-bout'
  );

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_other::text,true);
  begin
    perform public.save_my_event_pick('per-fight-lock-test','early-bout','early-red');
    raise exception 'locked bout accepted a first pick';
  exception when others then
    if sqlerrm not like '%pick is locked for this fight%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('per-fight-lock-test','early-bout','early-red');
  begin
    perform public.save_my_event_pick('per-fight-lock-test','early-bout','early-blue');
    raise exception 'locked bout accepted a changed pick';
  exception when others then
    if sqlerrm not like '%pick is locked for this fight%' then raise; end if;
  end;
  begin
    perform public.set_my_event_underdog_lock(
      'per-fight-lock-test','early-bout','early-red'
    );
    raise exception 'locked bout accepted an Underdog Lock write';
  exception when others then
    if sqlerrm not like '%underdog lock is closed for this fight%' then raise; end if;
  end;
  begin
    perform public.clear_my_event_underdog_lock('per-fight-lock-test');
    raise exception 'locked bout accepted an Underdog Lock clear';
  exception when others then
    if sqlerrm not like '%underdog lock is closed for this fight%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  begin
    update public.pick_bouts
    set red_american_odds=200,blue_american_odds=-220,
        odds_source='Late Sportsbook',odds_updated_at=now()
    where event_id='per-fight-lock-test' and bout_id='early-bout';
    raise exception 'locked bout accepted an odds mutation';
  exception when others then
    if sqlerrm not like '%odds are locked for this fight%' then raise; end if;
  end;
  begin
    update public.pick_bouts
    set red_fighter_slug='bypass-red'
    where event_id='per-fight-lock-test' and bout_id='early-bout';
    raise exception 'locked bout accepted a direct fighter replacement';
  exception when others then
    if sqlerrm not like '%fight card changes are closed for this locked bout%' then raise; end if;
  end;
  begin
    update public.pick_bouts
    set result_status='cancelled',result_recorded_at=now()
    where event_id='per-fight-lock-test' and bout_id='early-bout';
    raise exception 'locked bout accepted a direct pre-lock cancellation';
  exception when others then
    if sqlerrm not like '%fight card changes are closed for this locked bout%' then raise; end if;
  end;

  -- The locked bout reveals only event entrants. The later open bout stays hidden.
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  v_reveal := public.resolved_bout_group_picks('per-fight-lock-test','early-bout');
  if jsonb_array_length(v_reveal) <> 2 then
    raise exception 'locked reveal did not preserve entrant-only ownership: %',v_reveal;
  end if;
  if public.resolved_bout_group_picks('per-fight-lock-test','later-bout') <> '[]'::jsonb then
    raise exception 'locking one bout revealed a later open bout';
  end if;

  select * into v_progress
  from public.get_event_pick_progress('per-fight-lock-test')
  where profile_id = v_member;
  if v_progress.underdog_lock_bout_id is distinct from 'early-bout' then
    raise exception 'locked bout did not reveal its exact Underdog Lock target';
  end if;
  select * into v_progress
  from public.get_event_pick_progress('per-fight-lock-test')
  where profile_id = v_other;
  if v_progress.underdog_lock_bout_id is not null then
    raise exception 'later open bout revealed its Underdog Lock target';
  end if;

  -- A legacy event timestamp locks only NULL/default-fallback bouts. Explicitly
  -- later bouts remain editable through the canonical mutation.
  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events
  set locks_at = now() - interval '1 minute'
  where event_id='per-fight-lock-test';

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('per-fight-lock-test','later-bout','later-blue');
  begin
    perform public.save_my_event_pick('per-fight-lock-test','legacy-bout','legacy-blue');
    raise exception 'legacy fallback bout ignored the event deadline';
  exception when others then
    if sqlerrm not like '%pick is locked for this fight%' then raise; end if;
  end;

  v_current := public.get_current_pick_event();
  if v_current->>'status' <> 'upcoming'
    or (
      select item->>'is_locked'
      from jsonb_array_elements(v_current->'bouts') item
      where item->>'bout_id'='later-bout'
    ) <> 'false'
    or (
      select item->>'is_locked'
      from jsonb_array_elements(v_current->'bouts') item
      where item->>'bout_id'='legacy-bout'
    ) <> 'true' then
    raise exception 'effective lock projection is incorrect: %',v_current;
  end if;

  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_control := public.get_pick_control_event(null);
  if (
      select item->>'can_adjust_lock'
      from jsonb_array_elements(v_control->'bouts') item
      where item->>'bout_id'='later-bout'
    ) <> 'true' then
    raise exception 'owner cannot adjust a future unlocked bout: %',v_control;
  end if;

  begin
    perform public.adjust_pick_bout_lock_time(
      'per-fight-lock-test','early-bout',now()+interval '3 hours'
    );
    raise exception 'already locked bout was reopened';
  exception when others then
    if sqlerrm not like '%locked bout cannot be reopened%' then raise; end if;
  end;

  -- Direct calls to every existing card-change owner cannot bypass the early lock.
  begin
    perform public.approve_pick_bout_cancellation(
      'per-fight-lock-test','early-bout',true,'Bypass locked cancellation'
    );
    raise exception 'cancellation RPC bypassed a locked bout';
  exception when others then
    if sqlerrm not like '%pre-lock card changes are closed%'
      and sqlerrm not like '%fight card changes are closed for this locked bout%' then raise; end if;
  end;
  begin
    perform public.approve_pick_fighter_replacement(
      'per-fight-lock-test','early-bout','red','early-red','early-blue',
      'replacement-red','Replacement Red','Bypass locked replacement'
    );
    raise exception 'replacement RPC bypassed a locked bout';
  exception when others then
    if sqlerrm not like '%pre-lock fighter replacements are closed%'
      and sqlerrm not like '%fight card changes are closed for this locked bout%' then raise; end if;
  end;
  begin
    perform public.approve_pick_bout_inclusion(
      'per-fight-lock-test','early-bout',false,true,
      'early-red','early-blue','Bypass locked removal'
    );
    raise exception 'inclusion RPC bypassed a locked bout';
  exception when others then
    if sqlerrm not like '%pre-lock Picks inclusion changes are closed%'
      and sqlerrm not like '%fight card changes are closed for this locked bout%' then raise; end if;
  end;

  -- Explicit event lock is the master override and freezes bonus odds at each
  -- row's effective deadline without changing picks.
  perform public.transition_pick_event('per-fight-lock-test','locked');
  if not private.pick_bout_is_locked(
    (select event from public.pick_events event where event_id='per-fight-lock-test'),
    (select bout from public.pick_bouts bout
      where event_id='per-fight-lock-test' and bout_id='later-bout')
  ) then
    raise exception 'event-wide lock did not lock every bout';
  end if;
  if (select frozen_at from public.profile_event_underdog_locks
      where profile_id=v_member and event_id='per-fight-lock-test')
      is distinct from v_early_lock then
    raise exception 'early Underdog Lock did not freeze at its bout deadline';
  end if;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  begin
    perform public.save_my_event_pick('per-fight-lock-test','later-bout','later-red');
    raise exception 'event-wide lock did not protect a later bout';
  exception when others then
    if sqlerrm not like '%pick is locked for this fight%' then raise; end if;
  end;

  -- Existing result and correction owners remain intact, including cancelled.
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  perform public.record_official_pick_bout_result(
    'per-fight-lock-test','early-bout','cancelled'
  );
  select result_recorded_at into v_result_at
  from public.pick_bouts
  where event_id='per-fight-lock-test' and bout_id='early-bout';
  perform public.correct_official_pick_bout_result(
    'per-fight-lock-test','early-bout','red_win','cancelled',null,
    v_result_at,'Correct cancelled result to red win'
  );
  perform public.record_official_pick_bout_result(
    'per-fight-lock-test','later-bout','blue_win'
  );
  perform public.record_official_pick_bout_result(
    'per-fight-lock-test','default-bout','draw'
  );
  perform public.record_official_pick_bout_result(
    'per-fight-lock-test','legacy-bout','no_contest'
  );
  perform public.transition_pick_event('per-fight-lock-test','complete');

  if (select count(*) from public.profile_event_picks
      where event_id='per-fight-lock-test') <> 5 then
    raise exception 'locking/results rewrote historical member picks';
  end if;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  v_history := public.get_my_pick_history(2199);
  if not exists (
    select 1
    from jsonb_array_elements(v_history->'events') event_item
    where event_item->>'event_id'='per-fight-lock-test'
  ) then
    raise exception 'completed-event history was not preserved';
  end if;

  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  select result_recorded_at into v_result_at
  from public.pick_bouts
  where event_id='per-fight-lock-test' and bout_id='early-bout';
  perform public.correct_official_pick_bout_result(
    'per-fight-lock-test','early-bout','cancelled','red_win','early-red',
    v_result_at,'Correct completed result back to cancelled'
  );
  if (select status from public.pick_events where event_id='per-fight-lock-test')
      <> 'complete'
    or (select count(*) from public.pick_result_corrections
      where event_id='per-fight-lock-test' and bout_id='early-bout') <> 2 then
    raise exception 'completed result correction or history was damaged';
  end if;

  begin
    perform public.adjust_pick_bout_lock_time(
      'per-fight-lock-test','later-bout',now()+interval '1 hour'
    );
    raise exception 'completed event was partially reopened';
  exception when others then
    if sqlerrm not like '%event cannot be reopened%' then raise; end if;
  end;

  -- Event Setup publication initializes Main Card deadlines from chronological sequence.
  perform set_config('request.jwt.claim.role','service_role',true);
  v_draft_id := public.stage_pick_event_draft(jsonb_build_object(
    'source','UFC.com + MMA Mania',
    'source_event_key','per-fight-lock-publication-source',
    'source_url','https://example.com/per-fight-lock',
    'event_id','per-fight-lock-publication',
    'name','UFC Publication Test',
    'subtitle','Publish Red vs. Publish Blue',
    'venue','Publish Arena',
    'location','Dallas, Texas',
    'starts_at',now()+interval '10 days',
    'locks_at',now()+interval '9 days 23 hours',
    'season',2199,
    'bouts',jsonb_build_array(
      jsonb_build_object(
        'bout_id','publish-red-publish-blue',
        'position',1,
        'weight_class','Lightweight',
        'red_fighter_name','Publish Red',
        'blue_fighter_name','Publish Blue',
        'included',true
      ),
      jsonb_build_object(
        'bout_id','publish-two-red-publish-two-blue',
        'position',2,
        'weight_class','Welterweight',
        'red_fighter_name','Publish Two Red',
        'blue_fighter_name','Publish Two Blue',
        'included',true
      )
    )
  ));

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  perform public.publish_pick_event_draft(v_draft_id);
  if (select bout.locks_at
      from public.pick_bouts bout
      where bout.event_id='per-fight-lock-publication'
        and bout.bout_id='publish-two-red-publish-two-blue')
      is distinct from (select event.starts_at
        from public.pick_events event
        where event.event_id='per-fight-lock-publication') then
    raise exception 'published Main Card opener missed the official Main Card start';
  end if;
  if (select bout.locks_at
      from public.pick_bouts bout
      where bout.event_id='per-fight-lock-publication'
        and bout.bout_id='publish-red-publish-blue')
      is distinct from (select event.starts_at + interval '30 minutes'
        from public.pick_events event
        where event.event_id='per-fight-lock-publication') then
    raise exception 'published later Main Card fight missed its 30-minute increment';
  end if;
end
$$;

rollback;

-- Continue through the existing canonical group-reveal proof on the same fresh database.
\ir picks_group_reveals.sql