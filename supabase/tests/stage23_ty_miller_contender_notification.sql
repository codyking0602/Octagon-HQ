begin;

select set_config('request.jwt.claim.role', 'service_role', true);

-- Keep this proof local. An in-app-only notification must never create push work.
alter table private.notification_groups disable trigger notification_groups_push_delivery;

do $$
declare
  v_member uuid := extensions.gen_random_uuid();
  v_notification jsonb;
  v_claim jsonb;
begin
  if private.notification_category_for_kind('fighter_watchlist_added') <> 'rankings' then
    raise exception 'fighter_watchlist_added is not categorized as rankings';
  end if;

  if private.notification_priority_for_kind('fighter_watchlist_added') <> 'in_app' then
    raise exception 'fighter_watchlist_added became push eligible';
  end if;

  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values (
    v_member,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'ty-miller-notification@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'TY MILLER TEST', 'historical_unclaimed', true)
  );

  perform public.register_unclaimed_pin_profile(
    v_member,
    'Ty Miller Test',
    'TM'
  );

  v_notification := public.publish_notification(
    v_member,
    'stage23:fighter-watchlist:ty-miller',
    'stage23:fighter-watchlist:ty-miller',
    'fighter_watchlist_added',
    'Ty Miller joins Shane’s Contender Series',
    'The unbeaten welterweight enters Shane King’s board at #7 after back-to-back UFC knockouts.',
    '/fighters-to-watch#ty-miller',
    'VIEW BOARD',
    now()
  );

  if not exists (
    select 1
    from private.notification_groups notification
    where notification.id = (v_notification->>'id')::uuid
      and notification.recipient_profile_id = v_member
      and notification.kind = 'fighter_watchlist_added'
      and notification.category = 'rankings'
      and notification.priority = 'in_app'
      and notification.title = 'Ty Miller joins Shane’s Contender Series'
      and notification.route = '/fighters-to-watch#ty-miller'
      and notification.action_label = 'VIEW BOARD'
      and notification.read_at is null
  ) then
    raise exception 'Ty Miller notification did not land in the canonical in-app inbox';
  end if;

  v_claim := public.claim_notification_push_delivery((v_notification->>'id')::uuid);
  if v_claim->'notification' <> 'null'::jsonb
    or jsonb_array_length(v_claim->'deliveries') <> 0
    or exists (
      select 1
      from private.notification_push_deliveries delivery
      where delivery.notification_id = (v_notification->>'id')::uuid
    )
  then
    raise exception 'Ty Miller in-app notification produced push delivery work: %', v_claim;
  end if;
end;
$$;

rollback;
