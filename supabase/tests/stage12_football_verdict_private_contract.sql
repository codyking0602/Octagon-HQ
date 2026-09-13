begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_package jsonb;
  v_packet_definition text;
begin
  if has_function_privilege('anon', 'public.export_football_verdict_knowledge()', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.export_football_verdict_knowledge()', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.export_football_verdict_knowledge()', 'EXECUTE')
  then
    raise exception 'Football Verdict private knowledge export privileges are invalid';
  end if;

  if has_function_privilege('anon', 'public.get_football_verdict_packet(uuid)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.get_football_verdict_packet(uuid)', 'EXECUTE')
  then
    raise exception 'Football Verdict participant packet privileges are invalid';
  end if;

  v_package := public.export_football_verdict_knowledge();

  if v_package->>'package_version' <> 'football-verdict-private-knowledge-v1'
    or v_package->>'content_version' <> 'football-draft-room-2026-09-v6'
    or v_package->>'grading_version' <> 'football-build-qb-traits-2026-09-v2'
    or jsonb_array_length(v_package->'profiles') <> 140
    or v_package->'decoder' is null
  then
    raise exception 'Football Verdict private knowledge package shape is invalid';
  end if;

  if v_package->'traits' <> '["Arm", "Accuracy", "Processing", "Mobility"]'::jsonb then
    raise exception 'Football Verdict private knowledge traits drifted';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_package->'profiles') as profile(value)
    where profile.value->'trait_codes' ? 'Clutch'
      or not (profile.value->'trait_codes' ?& array['Arm','Accuracy','Processing','Mobility'])
      or (profile.value->'trait_codes' - 'Arm' - 'Accuracy' - 'Processing' - 'Mobility') <> '{}'::jsonb
  ) then
    raise exception 'Football Verdict private knowledge profile contains an invalid trait-code packet';
  end if;

  if exists (
    select 1
    from jsonb_each_text(v_package->'decoder') decoder
    where decoder.key !~ '^[A-Z]{6}$'
      or decoder.value::numeric not between 35 and 99
  ) then
    raise exception 'Football Verdict private decoder contains an invalid entry';
  end if;

  v_packet_definition := pg_get_functiondef('public.get_football_verdict_packet(uuid)'::regprocedure);

  if v_packet_definition not like '%private.auction_rating_code(%'
    or v_packet_definition like '%''rating'',%'
    or v_packet_definition like '%''grade'',%'
    or v_packet_definition like '%''grading_inputs'',%'
    or v_packet_definition like '%''private_item_reference'',%'
  then
    raise exception 'Football Verdict participant packet can expose private grading data';
  end if;
end
$$;

rollback;
