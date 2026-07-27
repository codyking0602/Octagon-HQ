begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  v_draft_id uuid;
  v_blocked_draft_id uuid;
  v_setup jsonb;
  v_payload jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'pick-setup-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','SETUP OWNER','historical_unclaimed',true)),
    (v_member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'pick-setup-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','SETUP MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner_id,'Setup Owner','SO');
  perform public.register_unclaimed_pin_profile(v_member_id,'Setup Member','SM');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  -- A disposable database may carry seed events. Retire them inside this rollback-only transaction.
  update public.pick_events
  set status='complete', completed_at=coalesce(completed_at,now()), updated_at=now()
  where status in ('upcoming','locked');

  v_payload := jsonb_build_object(
    'source','ufc.com',
    'source_event_key','event/setup-test-one',
    'source_url','https://www.ufc.com/event/setup-test-one',
    'event_id','pick-setup-test-one',
    'name','UFC Setup Test',
    'subtitle','Red vs. Blue',
    'venue','Draft Arena',
    'location','Dallas, Texas',
    'starts_at',(now()+interval '7 days')::text,
    'locks_at',(now()+interval '7 days')::text,
    'season',2199,
    'bouts',jsonb_build_array(
      jsonb_build_object('bout_id','setup-red-blue','position',1,'weight_class','Lightweight',
        'red_fighter_name','Setup Red','red_fighter_slug','setup-red',
        'blue_fighter_name','Setup Blue','blue_fighter_slug','setup-blue','included',true),
      jsonb_build_object('bout_id','setup-second-third','position',2,'weight_class','Welterweight',
        'red_fighter_name','Setup Second','red_fighter_slug','setup-second',
        'blue_fighter_name','Setup Third','blue_fighter_slug','setup-third','included',true)
    )
  );

  v_draft_id := public.stage_pick_event_draft(v_payload);
  if exists(select 1 from public.pick_events where event_id='pick-setup-test-one') then
    raise exception 'staged event leaked into the live Picks tables';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.get_pick_event_setup();
    raise exception 'non-owner loaded Event Setup';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;
  begin
    perform public.update_pick_event_draft(v_draft_id,jsonb_build_object('venue','Unauthorized Arena'));
    raise exception 'non-owner edited an event draft';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  v_setup := public.get_pick_event_setup();
  if v_setup #>> '{draft_id}' <> v_draft_id::text
    or v_setup #>> '{can_publish}' <> 'true'
    or jsonb_array_length(v_setup->'bouts') <> 2 then
    raise exception 'owner setup projection is incorrect: %',v_setup;
  end if;

  perform public.update_pick_event_draft(v_draft_id,jsonb_build_object('venue','Reviewed Arena'));
  perform public.reorder_pick_event_draft_bouts(v_draft_id,'["setup-second-third","setup-red-blue"]'::jsonb);
  if (select venue from public.pick_event_drafts where draft_id=v_draft_id) <> 'Reviewed Arena' then
    raise exception 'owner metadata edit did not persist in the draft';
  end if;
  if (select position from public.pick_event_draft_bouts where draft_id=v_draft_id and bout_id='setup-second-third') <> 1 then
    raise exception 'owner fight reorder did not persist in the draft';
  end if;

  perform public.publish_pick_event_draft(v_draft_id);
  if (select status from public.pick_events where event_id='pick-setup-test-one') <> 'upcoming' then
    raise exception 'reviewed draft was not published as the upcoming event';
  end if;
  if (select count(*) from public.pick_bouts where event_id='pick-setup-test-one') <> 2 then
    raise exception 'published card did not contain the reviewed fights';
  end if;
  if (select red_fighter_slug from public.pick_bouts where event_id='pick-setup-test-one' and position=1) <> 'setup-second' then
    raise exception 'published card did not preserve reviewed fight order';
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug)
  values(v_member_id,'pick-setup-test-one','setup-second-third','setup-second');
  v_blocked_draft_id := public.stage_pick_event_draft(v_payload || jsonb_build_object(
    'source_event_key','event/setup-test-two',
    'event_id','pick-setup-test-two'
  ));

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  begin
    perform public.publish_pick_event_draft(v_blocked_draft_id);
    raise exception 'published over an upcoming card with submitted picks';
  exception when others then
    if sqlerrm not like '%current upcoming card already has picks%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  delete from public.profile_event_picks where event_id='pick-setup-test-one';
  update public.pick_events set status='locked' where event_id='pick-setup-test-one';
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  begin
    perform public.publish_pick_event_draft(v_blocked_draft_id);
    raise exception 'published over a locked event';
  exception when others then
    if sqlerrm not like '%locked event already exists%' then raise; end if;
  end;

  if has_table_privilege('authenticated','public.pick_event_drafts','SELECT')
    or has_table_privilege('authenticated','public.pick_event_draft_bouts','SELECT') then
    raise exception 'browser role can read private staged card tables';
  end if;
end $$;

rollback;
