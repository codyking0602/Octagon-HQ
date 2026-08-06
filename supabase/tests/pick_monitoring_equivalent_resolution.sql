begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_run uuid;
  v_second_run uuid;
  v_finding uuid;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values (
    v_owner,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'monitoring-equivalent-owner@login.octagon-hq.app', '',
    now(), now(), now(),
    jsonb_build_object(
      'display_name', 'MONITORING EQUIVALENT OWNER',
      'historical_unclaimed', true
    )
  );

  perform public.register_unclaimed_pin_profile(v_owner, 'Monitor Equivalent Owner', 'ME');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:events/equivalent-resolution', null, now(), now()
  ) returning run_id into v_run;

  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity,
    summary, source_details, detected_at
  ) values(
    v_run, null, 'provider-ambiguity:same-value', 'provider_error', 'warning',
    'Provider ambiguity remains.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/equivalent-resolution:provider:ambiguity'
    ),
    now()
  ) returning finding_id into v_finding;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.review_pick_monitoring_finding(v_finding, 'dismissed');

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'scheduled', 'completed', 'ufc:events/equivalent-resolution', null,
    now() + interval '1 second', now() + interval '1 second'
  ) returning run_id into v_second_run;

  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity,
    summary, source_details, detected_at
  ) values(
    v_second_run, null, 'provider-ambiguity:same-value', 'provider_error', 'warning',
    'Provider ambiguity remains.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/equivalent-resolution:provider:ambiguity'
    ),
    now() + interval '1 second'
  );

  if (
    select count(*)
    from public.pick_monitoring_findings finding
    join public.pick_monitoring_runs run on run.run_id = finding.run_id
    where run.source_event_identity = 'ufc:events/equivalent-resolution'
      and finding.finding_key = 'provider-ambiguity:same-value'
  ) <> 1 then
    raise exception 'resolved equivalent monitoring work was recreated';
  end if;

  if (
    select review_status
    from public.pick_monitoring_findings
    where finding_id = v_finding
  ) <> 'dismissed' then
    raise exception 'resolved monitoring history was not preserved';
  end if;
end;
$$;

rollback;
