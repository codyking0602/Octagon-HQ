begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_fight_night_draft uuid;
  v_numbered_draft uuid;
  v_main_anchor timestamptz := timestamptz '2199-06-01 21:00:00+00';
  v_prelim_anchor timestamptz := timestamptz '2199-06-01 19:00:00+00';
  v_manual_lock timestamptz := timestamptz '2199-06-01 23:30:00+00';
  v_master_override timestamptz := timestamptz '2199-06-01 20:30:00+00';
  v_event public.pick_events;
  v_bout public.pick_bouts;
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
    'progressive-lock-owner@login.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','PROGRESSIVE LOCK OWNER','historical_unclaimed',true)
  );
  perform public.register_unclaimed_pin_profile(v_owner,'Progressive Lock Owner','PL');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  -- Early Prelims remain outside the canonical staging/publication boundary.
  begin
    perform public.stage_pick_event_draft(jsonb_build_object(
      'source','UFC.com + MMA Mania',
      'source_event_key','progressive-early-prelim-rejected',
      'source_url','https://example.com/progressive-early-prelim-rejected',
      'event_id','progressive-early-prelim-rejected',
      'name','UFC 900',
      'subtitle','Rejected Red vs. Rejected Blue',
      'venue','Test Arena',
      'location','Dallas, Texas',
      'starts_at',v_main_anchor,
      'prelims_starts_at',v_prelim_anchor,
      'locks_at',v_main_anchor,
      'season',2199,
      'bouts',jsonb_build_array(
        jsonb_build_object(
          'bout_id','early-prelim-rejected-red-rejected-blue',
          'position',1,
          'weight_class','Lightweight',
          'red_fighter_name','Rejected Red',
          'blue_fighter_name','Rejected Blue',
          'card_segment','prelim',
          'segment_sequence',1,
          'included',true
        )
      )
    ));
    raise exception 'Early Prelims reached a publishable staged card';
  exception when others then
    if sqlerrm not like '%Early Prelims or invalid segment metadata cannot be staged%' then
      raise;
    end if;
  end;

  -- Fight Nights use only the Main Card anchor and chronological segment order.
  v_fight_night_draft := public.stage_pick_event_draft(jsonb_build_object(
    'source','UFC.com + MMA Mania',
    'source_event_key','progressive-fight-night-source',
    'source_url','https://example.com/progressive-fight-night',
    'event_id','progressive-fight-night',
    'name','UFC Fight Night',
    'subtitle','Main Event Red vs. Main Event Blue',
    'venue','Fight Night Arena',
    'location','Dallas, Texas',
    'starts_at',v_main_anchor,
    'locks_at',v_main_anchor,
    'season',2199,
    'bouts',jsonb_build_array(
      jsonb_build_object(
        'bout_id','fight-night-main-event',
        'position',1,
        'weight_class','Lightweight',
        'red_fighter_name','Main Event Red',
        'blue_fighter_name','Main Event Blue',
        'card_segment','main',
        'segment_sequence',3,
        'included',true
      ),
      jsonb_build_object(
        'bout_id','fight-night-co-main',
        'position',2,
        'weight_class','Welterweight',
        'red_fighter_name','Co Main Red',
        'blue_fighter_name','Co Main Blue',
        'card_segment','main',
        'segment_sequence',2,
        'included',true
      ),
      jsonb_build_object(
        'bout_id','fight-night-opener',
        'position',3,
        'weight_class','Middleweight',
        'red_fighter_name','Opener Red',
        'blue_fighter_name','Opener Blue',
        'card_segment','main',
        'segment_sequence',1,
        'included',true
      )
    )
  ));

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  select * into v_event from public.publish_pick_event_draft(v_fight_night_draft);

  if (select locks_at from public.pick_bouts
      where event_id='progressive-fight-night' and bout_id='fight-night-opener')
      is distinct from v_main_anchor then
    raise exception 'Fight Night Main Card opener missed the official Main Card start';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id='progressive-fight-night' and bout_id='fight-night-co-main')
      is distinct from v_main_anchor + interval '30 minutes'
    or (select locks_at from public.pick_bouts
      where event_id='progressive-fight-night' and bout_id='fight-night-main-event')
      is distinct from v_main_anchor + interval '60 minutes' then
    raise exception 'Fight Night later bouts missed chronological 30-minute increments';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id='progressive-fight-night' and position=1)
      is distinct from v_main_anchor + interval '60 minutes' then
    raise exception 'headline-first position was treated as chronological sequence';
  end if;

  -- A deliberate future bout adjustment remains independent from a later edit
  -- to the existing event-wide default deadline.
  perform public.adjust_pick_bout_lock_time(
    'progressive-fight-night','fight-night-main-event',v_manual_lock
  );
  perform public.adjust_pick_event_lock_time(
    'progressive-fight-night',v_master_override,v_main_anchor,
    'Move the event-wide master deadline'
  );
  if (select locks_at from public.pick_bouts
      where event_id='progressive-fight-night' and bout_id='fight-night-opener')
      is distinct from v_master_override then
    raise exception 'event-wide deadline did not move its still-defaulted opener';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id='progressive-fight-night' and bout_id='fight-night-main-event')
      is distinct from v_manual_lock then
    raise exception 'event-wide deadline overwrote an explicitly adjusted bout';
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events
  set status='complete',completed_at=now()
  where event_id='progressive-fight-night';

  -- Numbered cards use separate Prelims/Main Card anchors and reset the Main
  -- Card schedule instead of continuing the Prelims increments.
  v_numbered_draft := public.stage_pick_event_draft(jsonb_build_object(
    'source','UFC.com + MMA Mania',
    'source_event_key','progressive-numbered-source',
    'source_url','https://example.com/progressive-numbered',
    'event_id','progressive-numbered',
    'name','UFC 901',
    'subtitle','Numbered Main Red vs. Numbered Main Blue',
    'venue','Numbered Arena',
    'location','Dallas, Texas',
    'starts_at',v_main_anchor,
    'prelims_starts_at',v_prelim_anchor,
    'locks_at',v_main_anchor,
    'season',2199,
    'bouts',jsonb_build_array(
      jsonb_build_object(
        'bout_id','numbered-main-event',
        'position',1,
        'weight_class','Lightweight',
        'red_fighter_name','Numbered Main Red',
        'blue_fighter_name','Numbered Main Blue',
        'card_segment','main',
        'segment_sequence',3,
        'included',true
      ),
      jsonb_build_object(
        'bout_id','numbered-co-main',
        'position',2,
        'weight_class','Welterweight',
        'red_fighter_name','Numbered Co Red',
        'blue_fighter_name','Numbered Co Blue',
        'card_segment','main',
        'segment_sequence',2,
        'included',true
      ),
      jsonb_build_object(
        'bout_id','numbered-main-opener',
        'position',3,
        'weight_class','Middleweight',
        'red_fighter_name','Numbered Opener Red',
        'blue_fighter_name','Numbered Opener Blue',
        'card_segment','main',
        'segment_sequence',1,
        'included',true
      ),
      jsonb_build_object(
        'bout_id','prelim-numbered-feature',
        'position',4,
        'weight_class','Featherweight',
        'red_fighter_name','Prelim Feature Red',
        'blue_fighter_name','Prelim Feature Blue',
        'card_segment','prelim',
        'segment_sequence',3,
        'included',true
      ),
      jsonb_build_object(
        'bout_id','prelim-numbered-middle',
        'position',5,
        'weight_class','Bantamweight',
        'red_fighter_name','Prelim Middle Red',
        'blue_fighter_name','Prelim Middle Blue',
        'card_segment','prelim',
        'segment_sequence',2,
        'included',true
      ),
      jsonb_build_object(
        'bout_id','prelim-numbered-opener',
        'position',6,
        'weight_class','Flyweight',
        'red_fighter_name','Prelim Opener Red',
        'blue_fighter_name','Prelim Opener Blue',
        'card_segment','prelim',
        'segment_sequence',1,
        'included',true
      )
    )
  ));

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  select * into v_event from public.publish_pick_event_draft(v_numbered_draft);

  if (select locks_at from public.pick_bouts
      where event_id='progressive-numbered' and bout_id='prelim-numbered-opener')
      is distinct from v_prelim_anchor then
    raise exception 'Numbered Prelim opener missed the official Prelims start';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id='progressive-numbered' and bout_id='prelim-numbered-middle')
      is distinct from v_prelim_anchor + interval '30 minutes'
    or (select locks_at from public.pick_bouts
      where event_id='progressive-numbered' and bout_id='prelim-numbered-feature')
      is distinct from v_prelim_anchor + interval '60 minutes' then
    raise exception 'Numbered Prelims missed chronological 30-minute increments';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id='progressive-numbered' and bout_id='numbered-main-opener')
      is distinct from v_main_anchor then
    raise exception 'Numbered Main Card opener did not reset to the Main Card anchor';
  end if;
  if (select locks_at from public.pick_bouts
      where event_id='progressive-numbered' and bout_id='numbered-co-main')
      is distinct from v_main_anchor + interval '30 minutes'
    or (select locks_at from public.pick_bouts
      where event_id='progressive-numbered' and bout_id='numbered-main-event')
      is distinct from v_main_anchor + interval '60 minutes' then
    raise exception 'Numbered Main Card continued the Prelims schedule';
  end if;
  if exists (
    select 1 from public.pick_bouts
    where event_id='progressive-numbered' and bout_id like 'early-prelim-%'
  ) then
    raise exception 'Early Prelims received a published bout';
  end if;

  -- Valid later-card deadlines are allowed while the stable bout is open.
  select * into v_bout from public.adjust_pick_bout_lock_time(
    'progressive-numbered','numbered-main-event',v_manual_lock
  );
  if v_bout.locks_at is distinct from v_manual_lock
    or v_bout.locks_at <= v_main_anchor then
    raise exception 'manual future adjustment later than Main Card start was rejected';
  end if;

  -- A passed effective deadline is final and cannot be reopened.
  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_bouts
  set locks_at=now()-interval '1 minute'
  where event_id='progressive-numbered' and bout_id='prelim-numbered-opener';
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  begin
    perform public.adjust_pick_bout_lock_time(
      'progressive-numbered','prelim-numbered-opener',now()+interval '1 hour'
    );
    raise exception 'passed bout lock was reopened';
  exception when others then
    if sqlerrm not like '%locked bout cannot be reopened%' then raise; end if;
  end;

  -- Resulted/cancelled bouts are final through the same canonical owner.
  perform public.approve_pick_bout_cancellation(
    'progressive-numbered','prelim-numbered-middle',true,
    'Prove resulted bout lock safety'
  );
  begin
    perform public.adjust_pick_bout_lock_time(
      'progressive-numbered','prelim-numbered-middle',now()+interval '2 hours'
    );
    raise exception 'resulted bout was reopened';
  exception when others then
    if sqlerrm not like '%resulted bout cannot be reopened%' then raise; end if;
  end;

  -- Explicit event lock and completion remain the master override even when an
  -- individual bout carries a later future deadline.
  perform public.transition_pick_event('progressive-numbered','locked');
  select * into v_event from public.pick_events where event_id='progressive-numbered';
  select * into v_bout from public.pick_bouts
    where event_id='progressive-numbered' and bout_id='numbered-main-event';
  if not private.pick_bout_is_locked(v_event,v_bout) then
    raise exception 'event-wide locked status did not override a later bout deadline';
  end if;
  begin
    perform public.adjust_pick_bout_lock_time(
      'progressive-numbered','numbered-main-opener',now()+interval '3 hours'
    );
    raise exception 'locked event was reopened';
  exception when others then
    if sqlerrm not like '%event cannot be reopened%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events
  set status='complete',completed_at=now()
  where event_id='progressive-numbered';
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  begin
    perform public.adjust_pick_bout_lock_time(
      'progressive-numbered','numbered-main-opener',now()+interval '3 hours'
    );
    raise exception 'completed event was reopened';
  exception when others then
    if sqlerrm not like '%event cannot be reopened%' then raise; end if;
  end;
end
$$;

rollback;
