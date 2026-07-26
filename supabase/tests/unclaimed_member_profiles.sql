begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  profile_id uuid := extensions.gen_random_uuid();
  profile_row public.profiles;
  claim_row record;
  verify_row record;
begin
  insert into auth.users(
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) values (
    profile_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'unclaimed-member-fixture@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'SHANE', 'historical_unclaimed', true)
  );

  select * into profile_row
  from public.register_unclaimed_pin_profile(profile_id, 'Shane', 'S');

  if profile_row.id <> profile_id or profile_row.normalized_name <> 'SHANE' then
    raise exception 'unclaimed profile was not registered canonically';
  end if;
  if exists (
    select 1 from private.profile_pin_credentials credential
    where credential.profile_id = profile_id
  ) then
    raise exception 'unclaimed profile unexpectedly has a PIN credential';
  end if;

  select * into claim_row
  from public.claim_unclaimed_pin_profile('shane', '2468');

  if claim_row.profile_id <> profile_id
     or claim_row.internal_email <> 'unclaimed-member-fixture@login.octagon-hq.app'
     or claim_row.claim_result <> 'claimed' then
    raise exception 'unclaimed profile claim result was invalid';
  end if;
  if not exists (
    select 1
    from private.profile_pin_credentials credential
    where credential.profile_id = profile_id
      and credential.pin_hash = extensions.crypt('2468', credential.pin_hash)
      and credential.failed_attempts = 0
      and credential.locked_until is null
  ) then
    raise exception 'claimed profile PIN credential was not created correctly';
  end if;

  if exists (
    select 1 from public.claim_unclaimed_pin_profile('SHANE', '1357')
  ) then
    raise exception 'claimed profile was claimable a second time';
  end if;

  select * into verify_row
  from public.verify_profile_pin('SHANE', '2468');
  if verify_row.profile_id <> profile_id or verify_row.auth_result <> 'ok' then
    raise exception 'claimed profile could not authenticate through the canonical PIN verifier';
  end if;
end $$;

rollback;
