begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_completed_draft_id uuid;
  v_elapsed_draft_id uuid;
  v_future_draft_id uuid;
  v_setup jsonb;
  v_completed_event_name text;
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now())
  where status in ('upcoming','locked');

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values (
    v_owner_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'stale-draft-owner@login.octagon-hq.app',
    '',now(),now(),now(),
    jsonb_build_object('display_name','STALE DRAFT OWNER','historical_unclaimed',true)
  );
  perform public.register_unclaimed_pin_profile(v_owner_id,'Stale Draft Owner','SD');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  insert into public.pick_events(
    event_id,name,subtitle,venue,location,
    starts_at,locks_at,season,status
  ) values (
    'stale-draft-completed-event',
    'UFC Completed Draft Test',
    'Old Red vs. Old Blue',
    'Old Arena',
    'Dallas, Texas',
    now() - interval '2 days',
    now() - interval '2 days 1 hour',
    2199,
    'upcoming'
  );
  update public.pick_events
  set status = 'complete', completed_at = now() - interval '1 day'
  where event_id = 'stale-draft-completed-event';

  v_completed_draft_id := public.stage_pick_event_draft(jsonb_build_object(
    'source','UFC.com + MMA Mania',
    'source_event_key','stale-draft-completed-source',
    'source_url','https://example.com/stale-completed',
    'event_id','stale-draft-completed-event',
    'name','UFC Completed Draft Test',
    'subtitle','Old Red vs. Old Blue',
    'venue','Old Arena',
    'location','Dallas, Texas',
    'starts_at',now() - interval '2 days',
    'locks_at',now() - interval '2 days 1 hour',
    'season',2199,
    'bouts',jsonb_build_array(jsonb_build_object(
      'bout_id','old-red-old-blue',
      'position',1,
      'weight_class','Welterweight',
      'red_fighter_name','Old Red',
      'blue_fighter_name','Old Blue',
      'included',true
    ))
  ));

  v_elapsed_draft_id := public.stage_pick_event_draft(jsonb_build_object(
    'source','UFC.com + MMA Mania',
    'source_event_key','stale-draft-elapsed-source',
    'source_url','https://example.com/stale-elapsed',
    'event_id','stale-draft-elapsed-event',
    'name','UFC Elapsed Draft Test',
    'subtitle','Elapsed Red vs. Elapsed Blue',
    'venue','Elapsed Arena',
    'location','Dallas, Texas',
    'starts_at',now() - interval '1 hour',
    'locks_at',now() - interval '2 hours',
    'season',2199,
    'bouts',jsonb_build_array(jsonb_build_object(
      'bout_id','elapsed-red-elapsed-blue',
      'position',1,
      'weight_class','Lightweight',
      'red_fighter_name','Elapsed Red',
      'blue_fighter_name','Elapsed Blue',
      'included',true
    ))
  ));

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);

  v_setup := public.get_pick_event_setup();
  if v_setup is not null then
    raise exception 'stale completed or elapsed draft remained in Event Setup: %',v_setup;
  end if;

  select name into v_completed_event_name
  from public.pick_events
  where event_id = 'stale-draft-completed-event'
    and status = 'complete';
  if v_completed_event_name is distinct from 'UFC Completed Draft Test' then
    raise exception 'completed event history was removed during stale draft rollover';
  end if;

  begin
    perform public.publish_pick_event_draft(v_completed_draft_id);
    raise exception 'completed event draft was republished';
  exception when others then
    if sqlerrm not like '%completed event drafts cannot be republished%' then
      raise;
    end if;
  end;

  begin
    perform public.publish_pick_event_draft(v_elapsed_draft_id);
    raise exception 'elapsed event draft was published';
  exception when others then
    if sqlerrm not like '%event draft start time has passed%' then
      raise;
    end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  v_future_draft_id := public.stage_pick_event_draft(jsonb_build_object(
    'source','UFC.com + MMA Mania',
    'source_event_key','stale-draft-future-source',
    'source_url','https://example.com/future',
    'event_id','stale-draft-future-event',
    'name','UFC Future Draft Test',
    'subtitle','Future Red vs. Future Blue',
    'venue','Future Arena',
    'location','Dallas, Texas',
    'starts_at',now() + interval '10 days',
    'locks_at',now() + interval '9 days 23 hours',
    'season',2199,
    'bouts',jsonb_build_array(jsonb_build_object(
      'bout_id','future-red-future-blue',
      'position',1,
      'weight_class','Middleweight',
      'red_fighter_name','Future Red',
      'blue_fighter_name','Future Blue',
      'included',true
    ))
  ));
  update public.pick_event_drafts
  set synced_at = now() + interval '1 minute'
  where draft_id = v_future_draft_id;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  v_setup := public.get_pick_event_setup();
  if v_setup #>> '{draft_id}' <> v_future_draft_id::text
    or v_setup #>> '{event_id}' <> 'stale-draft-future-event'
    or v_setup #>> '{can_publish}' <> 'true' then
    raise exception 'future draft did not become the canonical Event Setup card: %',v_setup;
  end if;
end $$;

rollback;
