-- Preserve editorial citations while restoring the reserved Spotlight source contract.
update public.ufc_pick_prep_packages as prep
set payload = jsonb_set(
  jsonb_set(prep.payload, '{spotlights}', coalesce((
    select jsonb_agg(jsonb_set(s.value,'{source}',to_jsonb('UFCStats'::text),true) order by s.n)
    from jsonb_array_elements(prep.payload->'spotlights') with ordinality s(value,n)
  ),'[]'::jsonb),true),
  '{verification_notes}', coalesce(prep.payload->'verification_notes','[]'::jsonb) || coalesce((
    select jsonb_agg(to_jsonb(format('Source references for %s: %s',
      coalesce(s.value->>'bout_id','unknown bout'),coalesce(s.value->>'source','(missing source)'))) order by s.n)
    from jsonb_array_elements(prep.payload->'spotlights') with ordinality s(value,n)
    where s.value->>'source' is distinct from 'UFCStats'
  ),'[]'::jsonb),true),
updated_at = now()
where jsonb_typeof(prep.payload->'spotlights')='array'
and exists (select 1 from jsonb_array_elements(prep.payload->'spotlights') s(value)
  where s.value->>'source' is distinct from 'UFCStats');

-- Reject any future missing or noncanonical source, regardless of writer.
alter table public.ufc_pick_prep_packages
add constraint ufc_pick_prep_spotlight_source_canonical
check (
  jsonb_typeof(coalesce(payload->'spotlights','[]'::jsonb))='array'
  and not jsonb_path_exists(payload,
    '$.spotlights[*] ? (!exists(@.source) || @.source != "UFCStats")')
);
