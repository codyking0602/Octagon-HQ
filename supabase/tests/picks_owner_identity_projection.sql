begin;

do $$
declare
  owner_id uuid := '11111111-1111-4111-8111-111111111111';
  member_id uuid := '22222222-2222-4222-8222-222222222222';
  row_count integer;
  capability boolean;
begin
  insert into auth.users(id, email) values
    (owner_id, 'owner-projection@example.com'),
    (member_id, 'member-projection@example.com');
  insert into public.profiles(id, display_name, initials) values
    (owner_id, 'OWNER PROJECTION', 'OP'),
    (member_id, 'CODY', 'C');
  insert into public.pick_control_owners(profile_id) values (owner_id);

  if has_table_privilege('authenticated', 'public.pick_control_owners', 'SELECT') then
    raise exception 'authenticated must not read pick_control_owners';
  end if;
  if has_function_privilege('anon', 'public.get_my_identity_profile()', 'EXECUTE') then
    raise exception 'anon must not execute get_my_identity_profile';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  select count(*), bool_and(can_control_picks) into row_count, capability
    from public.get_my_identity_profile();
  if row_count <> 1 or capability is distinct from true then
    raise exception 'owner projection was not exactly one authorized profile';
  end if;

  perform set_config('request.jwt.claim.sub', member_id::text, true);
  select count(*), bool_or(can_control_picks) into row_count, capability
    from public.get_my_identity_profile();
  if row_count <> 1 or capability is distinct from false then
    raise exception 'member projection was not exactly one unauthorized profile';
  end if;
end $$;

rollback;
