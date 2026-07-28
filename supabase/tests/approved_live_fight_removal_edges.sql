begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_before_unaffected_bout jsonb;
  v_after_unaffected_bout jsonb;
  v_before_unaffected_picks jsonb;
  v_after_unaffected_picks jsonb;
  v_before_unaffected_locks jsonb;
  v_after_unaffected_locks jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values(v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'removal-edges@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','REMOVAL EDGES','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_owner_id,'Removal Edges','RE');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values
    ('removal-edge-live','Removal Edge Live','One vs. Two','Test Arena','Dallas, Texas',now()+interval '2 days',now()+interval '1 day',2198,'upcoming'),
    ('removal-edge-past-lock','Removal Edge Past Lock','One vs. Two','Test Arena','Dallas, Texas',now()+interval '1 day',now()-interval '1 minute',2198,'upcoming'),
    ('removal-edge-started','Removal Edge Started','One vs. Two','Test Arena','Dallas, Texas',now()-interval '1 minute',now()-interval '1 day',2198,'upcoming'),
    ('removal-edge-locked','Removal Edge Locked','One vs. Two','Test Arena','Dallas, Texas',now()+interval '2 days',now()+interval '1 day',2198,'locked'),
    ('removal-edge-complete','Removal Edge Complete','One vs. Two','Test Arena','Dallas, Texas',now()-interval '1 day',now()-interval '2 days',2198,'complete');

  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name,red_american_odds,blue_american_odds,odds_source,odds_updated_at,result_status,winner_fighter_slug,result_recorded_at)
  values
    ('removal-edge-live','target',1,'Lightweight','target-red','Target Red','target-blue','Target Blue',150,-170,'Test Sportsbook',now(),'pending',null,null),
    ('removal-edge-live','unaffected',2,'Welterweight','safe-red','Safe Red','safe-blue','Safe Blue',-115,105,'Test Sportsbook',now(),'pending',null,null),
    ('removal-edge-live','resolved',3,'Middleweight','resolved-red','Resolved Red','resolved-blue','Resolved Blue',-140,120,'Test Sportsbook',now(),'red_win','resolved-red',now()),
    ('removal-edge-live','cancelled',4,'Featherweight','cancel-red','Cancel Red','cancel-blue','Cancel Blue',-130,110,'Test Sportsbook',now(),'cancelled',null,now()),
    ('removal-edge-past-lock','target',1,'Lightweight','past-red','Past Red','past-blue','Past Blue',null,null,null,null,'pending',null,null),
    ('removal-edge-past-lock','unaffected',2,'Welterweight','past-safe-red','Past Safe Red','past-safe-blue','Past Safe Blue',null,null,null,null,'pending',null,null),
    ('removal-edge-started','target',1,'Lightweight','started-red','Started Red','started-blue','Started Blue',null,null,null,null,'pending',null,null),
    ('removal-edge-started','unaffected',2,'Welterweight','started-safe-red','Started Safe Red','started-safe-blue','Started Safe Blue',null,null,null,null,'pending',null,null),
    ('removal-edge-locked','target',1,'Lightweight','locked-red','Locked Red','locked-blue','Locked Blue',null,null,null,null,'pending',null,null),
    ('removal-edge-locked','unaffected',2,'Welterweight','locked-safe-red','Locked Safe Red','locked-safe-blue','Locked Safe Blue',null,null,null,null,'pending',null,null),
    ('removal-edge-complete','target',1,'Lightweight','complete-red','Complete Red','complete-blue','Complete Blue',null,null,null,null,'pending',null,null),
    ('removal-edge-complete','unaffected',2,'Welterweight','complete-safe-red','Complete Safe Red','complete-safe-blue','Complete Safe Blue',null,null,null,null,'red_win','complete-safe-red',now());

  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug)
  values
    (v_owner_id,'removal-edge-live','target','target-red'),
    (v_owner_id,'removal-edge-live','unaffected','safe-blue');
  insert into public.profile_event_underdog_locks(profile_id,event_id,bout_id,fighter_slug)
  values(v_owner_id,'removal-edge-live','unaffected','safe-blue');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);

  begin
    perform public.approve_pick_bout_inclusion('missing-event','target',false,true,'target-red','target-blue','Unknown event');
    raise exception 'unknown event removal succeeded';
  exception when others then
    if sqlerrm not like '%event not found%' then raise; end if;
  end;

  begin
    perform public.approve_pick_bout_inclusion('removal-edge-live','missing-bout',false,true,'target-red','target-blue','Unknown bout');
    raise exception 'unknown bout removal succeeded';
  exception when others then
    if sqlerrm not like '%bout not found%' then raise; end if;
  end;

  begin
    perform public.approve_pick_bout_inclusion('removal-edge-live','target',false,true,'target-red','target-blue','x');
    raise exception 'short reason removal succeeded';
  exception when others then
    if sqlerrm not like '%removal reason required%' then raise; end if;
  end;

  begin
    perform public.approve_pick_bout_inclusion('removal-edge-past-lock','target',false,true,'past-red','past-blue','Past lock');
    raise exception 'past-lock removal succeeded';
  exception when others then
    if sqlerrm not like '%pre-lock Picks inclusion changes are closed%' then raise; end if;
  end;

  begin
    perform public.approve_pick_bout_inclusion('removal-edge-started','target',false,true,'started-red','started-blue','Already started');
    raise exception 'started-event removal succeeded';
  exception when others then
    if sqlerrm not like '%pre-lock Picks inclusion changes are closed%' then raise; end if;
  end;

  begin
    perform public.approve_pick_bout_inclusion('removal-edge-locked','target',false,true,'locked-red','locked-blue','Locked event');
    raise exception 'locked-event removal succeeded';
  exception when others then
    if sqlerrm not like '%pre-lock Picks inclusion changes are closed%' then raise; end if;
  end;

  begin
    perform public.approve_pick_bout_inclusion('removal-edge-complete','target',false,true,'complete-red','complete-blue','Completed event');
    raise exception 'completed-event removal succeeded';
  exception when others then
    if sqlerrm not like '%pre-lock Picks inclusion changes are closed%' then raise; end if;
  end;

  begin
    perform public.approve_pick_bout_inclusion('removal-edge-live','resolved',false,true,'resolved-red','resolved-blue','Resolved bout');
    raise exception 'resolved-bout removal succeeded';
  exception when others then
    if sqlerrm not like '%only a pending bout%' then raise; end if;
  end;

  begin
    perform public.approve_pick_bout_inclusion('removal-edge-live','cancelled',false,true,'cancel-red','cancel-blue','Cancelled bout');
    raise exception 'cancelled-bout removal succeeded';
  exception when others then
    if sqlerrm not like '%only a pending bout%' then raise; end if;
  end;

  begin
    perform public.approve_pick_bout_inclusion('removal-edge-live','target',true,true,'target-red','target-blue','Unchanged include');
    raise exception 'unchanged include succeeded';
  exception when others then
    if sqlerrm not like '%requested Picks inclusion is unchanged%' then raise; end if;
  end;

  select to_jsonb(bout) into v_before_unaffected_bout
  from public.pick_bouts bout
  where bout.event_id='removal-edge-live' and bout.bout_id='unaffected';
  select coalesce(jsonb_agg(to_jsonb(pick) order by pick.profile_id), '[]'::jsonb) into v_before_unaffected_picks
  from public.profile_event_picks pick
  where pick.event_id='removal-edge-live' and pick.bout_id='unaffected';
  select coalesce(jsonb_agg(to_jsonb(lock_row) order by lock_row.profile_id), '[]'::jsonb) into v_before_unaffected_locks
  from public.profile_event_underdog_locks lock_row
  where lock_row.event_id='removal-edge-live' and lock_row.bout_id='unaffected';

  perform public.approve_pick_bout_inclusion('removal-edge-live','target',false,true,'target-red','target-blue','Approved edge removal');

  select to_jsonb(bout) into v_after_unaffected_bout
  from public.pick_bouts bout
  where bout.event_id='removal-edge-live' and bout.bout_id='unaffected';
  select coalesce(jsonb_agg(to_jsonb(pick) order by pick.profile_id), '[]'::jsonb) into v_after_unaffected_picks
  from public.profile_event_picks pick
  where pick.event_id='removal-edge-live' and pick.bout_id='unaffected';
  select coalesce(jsonb_agg(to_jsonb(lock_row) order by lock_row.profile_id), '[]'::jsonb) into v_after_unaffected_locks
  from public.profile_event_underdog_locks lock_row
  where lock_row.event_id='removal-edge-live' and lock_row.bout_id='unaffected';

  if v_after_unaffected_bout is distinct from v_before_unaffected_bout
    or v_after_unaffected_picks is distinct from v_before_unaffected_picks
    or v_after_unaffected_locks is distinct from v_before_unaffected_locks then
    raise exception 'removal changed unaffected bout, pick, lock, odds, order, result, or metadata';
  end if;

  begin
    perform public.approve_pick_bout_inclusion('removal-edge-live','target',false,false,'target-red','target-blue','Unchanged remove');
    raise exception 'unchanged remove succeeded';
  exception when others then
    if sqlerrm not like '%requested Picks inclusion is unchanged%' then raise; end if;
  end;

  begin
    insert into public.pick_card_change_actions(event_id,bout_id,action_type,reason,before_state,after_state,approved_by)
    values('removal-edge-live',null,'remove_bout_from_picks','Invalid null subject','{}','{}',v_owner_id);
    raise exception 'removal audit accepted a null bout subject';
  exception when check_violation then null;
  end;

  begin
    insert into public.pick_card_change_actions(event_id,bout_id,action_type,reason,before_state,after_state,approved_by)
    values('removal-edge-live','target','reorder_card','Invalid bout subject','{}','{}',v_owner_id);
    raise exception 'reorder audit accepted a bout subject';
  exception when check_violation then null;
  end;

  begin
    insert into public.pick_card_change_actions(event_id,bout_id,action_type,reason,before_state,after_state,approved_by)
    values('missing-event','missing-bout','remove_bout_from_picks','Invalid foreign key','{}','{}',v_owner_id);
    raise exception 'removal audit accepted an invalid event and bout foreign key';
  exception when foreign_key_violation then null;
  end;
end $$;

rollback;
