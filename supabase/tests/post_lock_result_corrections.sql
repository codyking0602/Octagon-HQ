begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  v_initial_at timestamptz;
  v_locked_correction_at timestamptz;
  v_completed_at timestamptz;
  v_picks_before jsonb;
  v_picks_after jsonb;
  v_lock_before jsonb;
  v_lock_after jsonb;
  v_group_picks jsonb;
  v_summary record;
  v_history jsonb;
  v_control jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'result-correction-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','RESULT CORRECTION OWNER','historical_unclaimed',true)),
    (v_member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'result-correction-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','RESULT CORRECTION MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner_id,'Result Correction Owner','RO');
  perform public.register_unclaimed_pin_profile(v_member_id,'Result Correction Member','RM');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values('post-lock-result-correction-test','UFC Result Correction Test','Red vs. Blue','Test Arena','Dallas, Texas',
    now()+interval '1 hour',now()-interval '1 minute',2199,'upcoming');

  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name,red_american_odds,blue_american_odds,odds_source,odds_updated_at)
  values('post-lock-result-correction-test','correction-main',1,'Lightweight','correction-red','Correction Red',
    'correction-blue','Correction Blue',-150,130,'Test Sportsbook',now());

  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug)
  values
    (v_owner_id,'post-lock-result-correction-test','correction-main','correction-red'),
    (v_member_id,'post-lock-result-correction-test','correction-main','correction-blue');

  insert into public.profile_event_underdog_locks(profile_id,event_id,bout_id,fighter_slug)
  values(v_member_id,'post-lock-result-correction-test','correction-main','correction-blue');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.correct_official_pick_bout_result(
      'post-lock-result-correction-test','correction-main','blue_win','red_win','correction-red',now(),'Not allowed'
    );
    raise exception 'non-owner corrected an official result';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  perform public.transition_pick_event('post-lock-result-correction-test','locked');

  v_group_picks := public.resolved_bout_group_picks('post-lock-result-correction-test','correction-main');
  if jsonb_array_length(v_group_picks) <> 0 then
    raise exception 'locked pending result exposed private group picks';
  end if;

  perform public.record_official_pick_bout_result('post-lock-result-correction-test','correction-main','red_win');
  select result_recorded_at into v_initial_at
  from public.pick_bouts
  where event_id='post-lock-result-correction-test' and bout_id='correction-main';

  select coalesce(jsonb_agg(to_jsonb(pick) order by pick.profile_id),'[]'::jsonb) into v_picks_before
  from public.profile_event_picks pick
  where pick.event_id='post-lock-result-correction-test';
  select to_jsonb(lock_row) into v_lock_before
  from public.profile_event_underdog_locks lock_row
  where lock_row.event_id='post-lock-result-correction-test' and lock_row.profile_id=v_member_id;

  begin
    perform public.record_official_pick_bout_result('post-lock-result-correction-test','correction-main','blue_win');
    raise exception 'initial result owner overwrote a finalized result';
  exception when others then
    if sqlerrm not like '%official result already recorded; use correction workflow%' then raise; end if;
  end;

  begin
    perform public.record_official_pick_bout_result('post-lock-result-correction-test','correction-main','pending');
    raise exception 'initial result owner cleared a finalized result';
  exception when others then
    if sqlerrm not like '%initial result entry requires a final official result%' then raise; end if;
  end;

  begin
    perform public.correct_official_pick_bout_result(
      'post-lock-result-correction-test','correction-main','blue_win','red_win','correction-red',v_initial_at,'x'
    );
    raise exception 'result correction accepted a missing reason';
  exception when others then
    if sqlerrm not like '%result correction reason required%' then raise; end if;
  end;

  begin
    perform public.correct_official_pick_bout_result(
      'post-lock-result-correction-test','correction-main','blue_win','draw','correction-red',v_initial_at,'Stale result status'
    );
    raise exception 'result correction accepted stale status';
  exception when others then
    if sqlerrm not like '%official result changed; reload Fight Night Control%' then raise; end if;
  end;

  begin
    perform public.correct_official_pick_bout_result(
      'post-lock-result-correction-test','correction-main','blue_win','red_win','correction-blue',v_initial_at,'Stale result winner'
    );
    raise exception 'result correction accepted stale winner';
  exception when others then
    if sqlerrm not like '%official result changed; reload Fight Night Control%' then raise; end if;
  end;

  begin
    perform public.correct_official_pick_bout_result(
      'post-lock-result-correction-test','correction-main','blue_win','red_win','correction-red',v_initial_at-interval '1 second','Stale result timestamp'
    );
    raise exception 'result correction accepted stale timestamp';
  exception when others then
    if sqlerrm not like '%official result changed; reload Fight Night Control%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  select * into v_summary from public.get_my_pick_summary(2199);
  if v_summary.correct <> 0 or v_summary.incorrect <> 1 or v_summary.lock_bonus <> 0 then
    raise exception 'initial red result did not drive canonical scoring: %',to_jsonb(v_summary);
  end if;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  perform public.correct_official_pick_bout_result(
    'post-lock-result-correction-test','correction-main','blue_win','red_win','correction-red',v_initial_at,
    'Official commission corrected the recorded winner'
  );
  select result_recorded_at into v_locked_correction_at
  from public.pick_bouts
  where event_id='post-lock-result-correction-test' and bout_id='correction-main';

  select coalesce(jsonb_agg(to_jsonb(pick) order by pick.profile_id),'[]'::jsonb) into v_picks_after
  from public.profile_event_picks pick
  where pick.event_id='post-lock-result-correction-test';
  select to_jsonb(lock_row) into v_lock_after
  from public.profile_event_underdog_locks lock_row
  where lock_row.event_id='post-lock-result-correction-test' and lock_row.profile_id=v_member_id;
  if v_picks_after is distinct from v_picks_before then
    raise exception 'result correction changed submitted picks';
  end if;
  if v_lock_after is distinct from v_lock_before then
    raise exception 'result correction changed the frozen Underdog Lock';
  end if;

  if not exists(
    select 1 from public.pick_result_corrections correction
    where correction.event_id='post-lock-result-correction-test'
      and correction.bout_id='correction-main'
      and correction.reason='Official commission corrected the recorded winner'
      and correction.before_state->>'result_status'='red_win'
      and correction.before_state->>'winner_fighter_slug'='correction-red'
      and correction.after_state->>'result_status'='blue_win'
      and correction.after_state->>'winner_fighter_slug'='correction-blue'
  ) then
    raise exception 'first correction did not preserve the original result and corrected state';
  end if;

  v_group_picks := public.resolved_bout_group_picks('post-lock-result-correction-test','correction-main');
  if jsonb_array_length(v_group_picks) <> 2 then
    raise exception 'corrected finalized result did not preserve normal group-pick reveal';
  end if;

  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  select * into v_summary from public.get_my_pick_summary(2199);
  if v_summary.correct <> 1 or v_summary.incorrect <> 0 or v_summary.lock_bonus <= 0 then
    raise exception 'locked result correction did not recalculate scoring and lock bonus: %',to_jsonb(v_summary);
  end if;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  perform public.transition_pick_event('post-lock-result-correction-test','complete');
  select completed_at into v_completed_at
  from public.pick_events where event_id='post-lock-result-correction-test';

  v_control := public.get_pick_control_event('post-lock-result-correction-test');
  if v_control #>> '{status}' <> 'complete'
    or v_control #>> '{bouts,0,can_correct_result}' <> 'true'
    or v_control #>> '{bouts,0,has_correction_history}' <> 'true' then
    raise exception 'completed event was not available through the existing control owner: %',v_control;
  end if;

  perform public.correct_official_pick_bout_result(
    'post-lock-result-correction-test','correction-main','draw','blue_win','correction-blue',v_locked_correction_at,
    'Official commission changed the bout to a draw'
  );

  if (select status from public.pick_events where event_id='post-lock-result-correction-test') <> 'complete'
    or (select completed_at from public.pick_events where event_id='post-lock-result-correction-test') is distinct from v_completed_at then
    raise exception 'completed result correction reopened or rewrote event lifecycle state';
  end if;

  begin
    perform public.correct_official_pick_bout_result(
      'post-lock-result-correction-test','correction-main','pending','draw',null,
      (select result_recorded_at from public.pick_bouts where event_id='post-lock-result-correction-test' and bout_id='correction-main'),
      'A correction must be a final canonical result'
    );
    raise exception 'result correction accepted a pending outcome';
  exception when others then
    if sqlerrm not like '%corrected official result requires a final result%' then raise; end if;
  end;

  if (select count(*) from public.pick_result_corrections
      where event_id='post-lock-result-correction-test' and bout_id='correction-main') <> 2 then
    raise exception 'every successful correction was not appended independently';
  end if;
  if not exists(
    select 1 from public.pick_result_corrections correction
    where correction.event_id='post-lock-result-correction-test'
      and correction.before_state->>'result_status'='blue_win'
      and correction.after_state->>'result_status'='draw'
  ) then
    raise exception 'second correction did not preserve the prior corrected result';
  end if;

  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  v_history := public.get_my_pick_history(2199);
  if (v_history #>> '{summary,correct}')::integer <> 0
    or (v_history #>> '{summary,incorrect}')::integer <> 0
    or (v_history #>> '{summary,excluded}')::integer <> 1
    or (v_history #>> '{summary,lock_bonus}')::integer <> 0
    or v_history #>> '{events,0,bouts,0,verdict}' <> 'excluded' then
    raise exception 'completed recap and season totals did not recalculate from corrected canonical draw: %',v_history;
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  begin
    update public.pick_result_corrections
    set reason='tampered'
    where event_id='post-lock-result-correction-test';
    raise exception 'result correction audit was updated';
  exception when others then
    if sqlerrm not like '%pick result correction audit is immutable%' then raise; end if;
  end;
  begin
    delete from public.pick_result_corrections
    where event_id='post-lock-result-correction-test';
    raise exception 'result correction audit was deleted';
  exception when others then
    if sqlerrm not like '%pick result correction audit is immutable%' then raise; end if;
  end;

  if has_table_privilege('authenticated','public.pick_result_corrections','SELECT') then
    raise exception 'browser role can read private result correction evidence';
  end if;
end $$;

rollback;
