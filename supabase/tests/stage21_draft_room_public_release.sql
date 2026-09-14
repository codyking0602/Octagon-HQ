begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $stage21$
declare
  v_member_a uuid := extensions.gen_random_uuid();
  v_member_b uuid := extensions.gen_random_uuid();
  v_mode text;
  v_game uuid;
  v_modes text[] := array[
    'build-qb',
    'build-qb-cfb',
    'trio-nfl',
    'trio-cfb',
    'nfl-divisions',
    'longhorns-2005',
    'longhorns-teams-2005',
    'cowboys-2007',
    'cowboys-teams-2007',
    'cfb-best-teams'
  ];
begin
  if not private.draft_room_public_release_enabled() then
    raise exception 'Stage 21 Draft Room public release switch is disabled';
  end if;

  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_member_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage21-member-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 21 MEMBER A','historical_unclaimed',true)),
    (v_member_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage21-member-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 21 MEMBER B','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_member_a,'Stage 21 Member A','RA');
  perform public.register_unclaimed_pin_profile(v_member_b,'Stage 21 Member B','RB');

  if public.is_pick_control_owner(v_member_a) or public.is_pick_control_owner(v_member_b) then
    raise exception 'Stage 21 public-release proof accidentally uses a Picks owner';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member_a::text,true);

  foreach v_mode in array v_modes loop
    v_game := public.prepare_auction(v_member_b, v_mode);

    if not exists (
      select 1
      from private.auction_games game
      where game.id = v_game
        and game.challenger_id = v_member_a
        and game.recipient_id = v_member_b
        and game.mode_id = v_mode
        and game.lifecycle_state = 'prepared'
    ) then
      raise exception 'normal members could not prepare public Draft Room mode %', v_mode;
    end if;
  end loop;
end;
$stage21$;

rollback;
