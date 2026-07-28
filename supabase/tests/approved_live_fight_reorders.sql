begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  owner_id uuid := extensions.gen_random_uuid(); member_id uuid := extensions.gen_random_uuid();
  before_rows jsonb; after_rows jsonb; player jsonb; control jsonb; audits integer;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data) values
   (owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','reorder-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','REORDER OWNER','historical_unclaimed',true)),
   (member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','reorder-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','REORDER MEMBER','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(owner_id,'Reorder Owner','RO');
  perform public.register_unclaimed_pin_profile(member_id,'Reorder Member','RM');
  insert into public.pick_control_owners(profile_id) values(owner_id);
  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status) values
   ('reorder-live-test','Reorder Test','A vs B','Arena','Dallas',now()+interval '2 days',now()+interval '1 day',2199,'upcoming'),
   ('reorder-locked-test','Locked','A vs B','Arena','Dallas',now()+interval '2 days',now()+interval '1 day',2199,'locked'),
   ('reorder-started-test','Started','A vs B','Arena','Dallas',now()-interval '1 second',now()+interval '1 day',2199,'upcoming');
  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,red_american_odds,blue_american_odds,odds_source,odds_updated_at,result_status,winner_fighter_slug,result_recorded_at) values
   ('reorder-live-test','a-b',1,'Lightweight','a','A','b','B',150,-170,'Book',now(),'pending',null,null),
   ('reorder-live-test','c-d',2,'Welterweight','c','C','d','D',210,-250,'Book Two',now(),'red_win','c',now()-interval '1 hour'),
   ('reorder-live-test','e-f',3,'Middleweight','e','E','f','F',110,-130,'Book Three',now(),'pending',null,null),
   ('reorder-locked-test','locked',1,'Lightweight','a','A','b','B',null,null,null,null,'pending',null,null),
   ('reorder-started-test','started',1,'Lightweight','a','A','b','B',null,null,null,null,'pending',null,null);
  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug) values(member_id,'reorder-live-test','a-b','a'),(member_id,'reorder-live-test','c-d','c');
  insert into public.profile_event_underdog_locks(profile_id,event_id,bout_id,fighter_slug,selected_at) values(member_id,'reorder-live-test','a-b','a',now());
  select jsonb_agg(to_jsonb(x) order by bout_id) into before_rows from (select bout_id,weight_class,red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,red_american_odds,blue_american_odds,odds_source,odds_updated_at,result_status,winner_fighter_slug,result_recorded_at from public.pick_bouts where event_id='reorder-live-test') x;

  perform set_config('request.jwt.claim.role','authenticated',true); perform set_config('request.jwt.claim.sub',member_id::text,true);
  begin perform public.approve_pick_card_reorder('reorder-live-test',array['a-b','c-d','e-f'],array['c-d','a-b','e-f'],'Unauthorized'); raise exception 'non-owner accepted'; exception when others then if sqlerrm not like '%pick control owner required%' then raise; end if; end;
  perform set_config('request.jwt.claim.sub',owner_id::text,true);
  begin perform public.approve_pick_card_reorder('reorder-live-test',array['a-b','c-d','e-f'],array['c-d','a-b','e-f'],''); raise exception 'blank reason accepted'; exception when others then if sqlerrm not like '%reorder reason required%' then raise; end if; end;
  begin perform public.approve_pick_card_reorder('reorder-live-test',array['c-d','a-b','e-f'],array['c-d','e-f','a-b'],'Stale'); raise exception 'stale accepted'; exception when others then if sqlerrm not like '%card order changed%' then raise; end if; end;
  begin perform public.approve_pick_card_reorder('reorder-live-test',array['a-b','c-d','e-f'],array['a-b','a-b','e-f'],'Duplicate'); raise exception 'duplicate accepted'; exception when others then if sqlerrm not like '%exactly once%' then raise; end if; end;
  begin perform public.approve_pick_card_reorder('reorder-live-test',array['a-b','c-d','e-f'],array['a-b','c-d'],'Missing'); raise exception 'missing accepted'; exception when others then if sqlerrm not like '%exactly once%' then raise; end if; end;
  begin perform public.approve_pick_card_reorder('reorder-live-test',array['a-b','c-d','e-f'],array['a-b','c-d','unknown'],'Unknown'); raise exception 'unknown accepted'; exception when others then if sqlerrm not like '%exactly once%' then raise; end if; end;
  begin perform public.approve_pick_card_reorder('reorder-live-test',array['a-b','c-d','e-f'],array['a-b','c-d','e-f'],'Same'); raise exception 'unchanged accepted'; exception when others then if sqlerrm not like '%unchanged%' then raise; end if; end;
  begin perform public.approve_pick_card_reorder('reorder-locked-test',array['locked'],array['locked'],'Locked'); raise exception 'locked accepted'; exception when others then if sqlerrm not like '%reordering is closed%' then raise; end if; end;
  begin perform public.approve_pick_card_reorder('reorder-started-test',array['started'],array['started'],'Started'); raise exception 'started accepted'; exception when others then if sqlerrm not like '%reordering is closed%' then raise; end if; end;
  if exists(select 1 from public.pick_card_change_actions where event_id like 'reorder-%-test') then raise exception 'rejection wrote audit'; end if;

  perform public.approve_pick_card_reorder('reorder-live-test',array['a-b','c-d','e-f'],array['c-d','e-f','a-b'],'Official card order updated');
  if (select array_agg(bout_id order by position) from public.pick_bouts where event_id='reorder-live-test') <> array['c-d','e-f','a-b'] or
     (select array_agg(position order by position) from public.pick_bouts where event_id='reorder-live-test') <> array[1,2,3] then raise exception 'final positions not unique contiguous order'; end if;
  select jsonb_agg(to_jsonb(x) order by bout_id) into after_rows from (select bout_id,weight_class,red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,red_american_odds,blue_american_odds,odds_source,odds_updated_at,result_status,winner_fighter_slug,result_recorded_at from public.pick_bouts where event_id='reorder-live-test') x;
  if after_rows <> before_rows then raise exception 'reorder changed matchup, odds, provenance, weight, or result data'; end if;
  if (select count(*) from public.profile_event_picks where event_id='reorder-live-test') <> 2 or (select count(*) from public.profile_event_underdog_locks where event_id='reorder-live-test') <> 1 then raise exception 'reorder changed picks or locks'; end if;
  if not exists(select 1 from public.pick_card_change_actions where event_id='reorder-live-test' and bout_id is null and action_type='reorder_card' and reason='Official card order updated' and approved_by=owner_id and before_state#>>'{0,bout_id}'='a-b' and after_state#>>'{0,bout_id}'='c-d') then raise exception 'audit before/after inaccurate'; end if;
  player := public.get_current_pick_event(); control := public.get_pick_control_event();
  if player#>>'{bouts,0,bout_id}' <> 'c-d' or control#>>'{bouts,0,bout_id}' <> 'c-d' or player::text like '%"repick_required": true%' then raise exception 'projections disagree or repick required'; end if;
  perform public.approve_pick_card_reorder('reorder-live-test',array['c-d','e-f','a-b'],array['e-f','a-b','c-d'],'Second owner order');
  select count(*) into audits from public.pick_card_change_actions where event_id='reorder-live-test' and action_type='reorder_card';
  if audits <> 2 then raise exception 'second independent audit not appended'; end if;
end $$;
rollback;
