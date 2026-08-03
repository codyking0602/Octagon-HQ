begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_draft_id uuid;
  v_event public.pick_events;
  v_locks timestamptz[];
begin
  update public.pick_events
  set status = 'complete', completed_at = coalesce(completed_at, now())
  where status in ('upcoming','locked');

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values (
    v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'progressive-lock-owner@login.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','PROGRESSIVE LOCK OWNER','historical_unclaimed',true)
  );
  perform public.register_unclaimed_pin_profile(v_owner,'Progressive Lock Owner','PL');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  v_draft_id := public.stage_pick_event_draft(jsonb_build_object(
    'source','UFC.com + MMA Mania',
    'source_event_key','progressive-lock-source',
    'source_url','https://example.com/progressive-lock',
    'event_id','progressive-lock-event',
    'name','UFC Progressive Lock Test',
    'subtitle','Main Red vs. Main Blue',
    'venue','Test Arena',
    'location','Dallas, Texas',
    'starts_at',now()+interval '10 days',
    'locks_at',now()+interval '10 days',
    'season',2199,
    'bouts',jsonb_build_array(
      jsonb_build_object('bout_id','main','position',1,'weight_class','Lightweight','red_fighter_name','Main Red','blue_fighter_name','Main Blue','included',true),
      jsonb_build_object('bout_id','co-main','position',2,'weight_class','Welterweight','red_fighter_name','Co Red','blue_fighter_name','Co Blue','included',true),
      jsonb_build_object('bout_id','middle','position',3,'weight_class','Middleweight','red_fighter_name','Middle Red','blue_fighter_name','Middle Blue','included',true),
      jsonb_build_object('bout_id','second','position',4,'weight_class','Featherweight','red_fighter_name','Second Red','blue_fighter_name','Second Blue','included',true),
      jsonb_build_object('bout_id','opener','position',5,'weight_class','Bantamweight','red_fighter_name','Opening Red','blue_fighter_name','Opening Blue','included',true)
    )
  ));

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_event := public.publish_pick_event_draft(v_draft_id);

  select array_agg(locks_at order by position)
  into v_locks
  from public.pick_bouts
  where event_id = v_event.event_id;

  if v_locks[5] is distinct from v_event.starts_at
    or v_locks[4] is distinct from v_event.starts_at + interval '30 minutes'
    or v_locks[3] is distinct from v_event.starts_at + interval '60 minutes'
    or v_locks[2] is distinct from v_event.starts_at + interval '90 minutes'
    or v_locks[1] is distinct from v_event.starts_at + interval '120 minutes' then
    raise exception 'published progressive lock schedule is incorrect: %',v_locks;
  end if;

  perform public.adjust_pick_bout_lock_time(
    v_event.event_id,'main',v_event.starts_at + interval '110 minutes'
  );
  if (select locks_at from public.pick_bouts where event_id=v_event.event_id and bout_id='main')
      is distinct from v_event.starts_at + interval '110 minutes' then
    raise exception 'owner could not adjust within the estimated card window';
  end if;

  begin
    perform public.adjust_pick_bout_lock_time(
      v_event.event_id,'main',v_event.starts_at + interval '121 minutes'
    );
    raise exception 'owner adjusted beyond the estimated card window';
  exception when others then
    if sqlerrm not like '%valid future bout lock time required%' then raise; end if;
  end;
end $$;

rollback;
