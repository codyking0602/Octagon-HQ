alter table public.pick_events
  add column if not exists header_storage_path text,
  add column if not exists header_natural_width integer,
  add column if not exists header_natural_height integer;

alter table public.pick_events
  drop constraint if exists pick_event_header_metadata_complete;

alter table public.pick_events
  add constraint pick_event_header_metadata_complete check (
    (header_storage_path is null and header_natural_width is null and header_natural_height is null)
    or (
      nullif(trim(header_storage_path), '') is not null
      and header_natural_width between 1 and 30000
      and header_natural_height between 1 and 30000
    )
  );

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'pick-event-headers',
  'pick-event-headers',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists pick_event_headers_public_read on storage.objects;
create policy pick_event_headers_public_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'pick-event-headers');

drop policy if exists pick_event_headers_owner_insert on storage.objects;
create policy pick_event_headers_owner_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'pick-event-headers'
    and public.is_pick_control_owner(auth.uid())
  );

drop policy if exists pick_event_headers_owner_update on storage.objects;
create policy pick_event_headers_owner_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'pick-event-headers'
    and public.is_pick_control_owner(auth.uid())
  )
  with check (
    bucket_id = 'pick-event-headers'
    and public.is_pick_control_owner(auth.uid())
  );

drop policy if exists pick_event_headers_owner_delete on storage.objects;
create policy pick_event_headers_owner_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'pick-event-headers'
    and public.is_pick_control_owner(auth.uid())
  );

create or replace function public.set_pick_event_header(
  p_event_id text,
  p_storage_path text,
  p_natural_width integer,
  p_natural_height integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_path text := trim(coalesce(p_storage_path, ''));
begin
  if auth.uid() is null or not public.is_pick_control_owner(auth.uid()) then
    raise exception 'Fight Night Control owner access required';
  end if;

  if v_path = ''
    or v_path like '%..%'
    or left(v_path, length(p_event_id) + 1) <> p_event_id || '/'
  then
    raise exception 'event header storage path must belong to the event';
  end if;

  if p_natural_width is null
    or p_natural_height is null
    or p_natural_width not between 1 and 30000
    or p_natural_height not between 1 and 30000
  then
    raise exception 'event header dimensions are invalid';
  end if;

  update public.pick_events
  set header_storage_path = v_path,
      header_natural_width = p_natural_width,
      header_natural_height = p_natural_height,
      updated_at = now()
  where event_id = p_event_id
  returning * into v_event;

  if not found then
    raise exception 'event not found';
  end if;

  return jsonb_build_object(
    'event_id', v_event.event_id,
    'header_storage_path', v_event.header_storage_path,
    'header_natural_width', v_event.header_natural_width,
    'header_natural_height', v_event.header_natural_height
  );
end;
$$;

revoke all on function public.set_pick_event_header(text, text, integer, integer) from public, anon;
grant execute on function public.set_pick_event_header(text, text, integer, integer) to authenticated;
