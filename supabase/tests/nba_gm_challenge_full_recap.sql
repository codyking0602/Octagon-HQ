begin;

do $$
declare
  v_report jsonb;
begin
  if has_function_privilege('anon', 'public.nba_gm_challenge_recap(text)', 'execute') then
    raise exception 'Anonymous users must not be able to load private NBA GM franchises';
  end if;
  if not has_function_privilege('authenticated', 'public.nba_gm_challenge_recap(text)', 'execute') then
    raise exception 'Signed-in challenge participants need access to their recap';
  end if;
  if has_function_privilege('authenticated', 'private.nba_gm_challenge_recap_side(jsonb)', 'execute') then
    raise exception 'Private recap projection must not be directly exposed to browser roles';
  end if;
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', extensions.gen_random_uuid()::text, true);
  v_report := public.nba_gm_challenge_recap('AAAAAAAA');
  if v_report is not null then
    raise exception 'Unknown NBA GM challenge must not disclose any franchise run';
  end if;
  v_report := public.nba_gm_challenge_recap('invalid');
  if v_report is not null then
    raise exception 'Invalid challenge codes must return nothing';
  end if;
end;
$$;

rollback;
