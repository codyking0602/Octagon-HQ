begin;

do $$
declare
  v_owner uuid;
  v_test uuid;
begin
  select id into v_owner from public.profiles where normalized_name = 'CODY';
  select id into v_test from public.profiles where normalized_name = 'TEST';
  if v_owner is null then raise exception 'CROWNS owner profile missing'; end if;
  if not exists (select 1 from public.crowns_owners where profile_id = v_owner) then
    raise exception 'CROWNS owner was not provisioned'; end if;
  if v_test is not null and exists (select 1 from public.crowns_owners where profile_id = v_test) then
    raise exception 'CROWNS owner access leaked to TEST'; end if;
  if public.crowns_is_public() then raise exception 'CROWNS was unexpectedly launched publicly'; end if;
  if (select count(*) from public.crowns_cards where source_sheet = 'Crown Master Tracker') <> 188 then
    raise exception 'CROWNS import must preserve 188 planning rows'; end if;
  if (select count(*) from public.crowns_subjects) <> 181 then
    raise exception 'CROWNS import must preserve 181 literal subject names'; end if;
  if exists (select 1 from public.crowns_cards where source_sheet = 'Crown Master Tracker' and (series_slug is not null or status <> 'planned')) then
    raise exception 'Imported card types must remain unassigned and planned'; end if;
  if not exists (select 1 from storage.buckets where id = 'crowns-card-assets' and public = false) then
    raise exception 'CROWNS assets bucket must be private'; end if;
  if not (select relrowsecurity from pg_class where oid = 'public.crowns_cards'::regclass) then
    raise exception 'CROWNS cards must have row-level security'; end if;

  perform set_config('request.jwt.claim.role','anon',true);
  perform set_config('request.jwt.claim.sub','',true);
  if (public.crowns_access()->>'can_view')::boolean then
    raise exception 'Anonymous visitors can view CROWNS'; end if;

  if v_test is not null then
    perform set_config('request.jwt.claim.role','authenticated',true);
    perform set_config('request.jwt.claim.sub',v_test::text,true);
    if (public.crowns_access()->>'can_view')::boolean then
      raise exception 'TEST account can view CROWNS'; end if;
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  if not (public.crowns_access()->>'is_owner')::boolean then
    raise exception 'CODY cannot view the owner-only CROWNS preview'; end if;
end $$;
rollback;
