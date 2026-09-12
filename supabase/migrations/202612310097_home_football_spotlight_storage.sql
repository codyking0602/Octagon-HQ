-- Store the mutable Home Football Player Spotlight image as a real storage object.
-- The existing home_feature_media row remains the one browser read/persistence owner.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'home-feature-media',
  'home-feature-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists home_feature_media_public_read on storage.objects;
create policy home_feature_media_public_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'home-feature-media');

drop policy if exists home_feature_media_owner_insert on storage.objects;
create policy home_feature_media_owner_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'home-feature-media'
    and public.is_pick_control_owner(auth.uid())
  );

drop policy if exists home_feature_media_owner_update on storage.objects;
create policy home_feature_media_owner_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'home-feature-media'
    and public.is_pick_control_owner(auth.uid())
  )
  with check (
    bucket_id = 'home-feature-media'
    and public.is_pick_control_owner(auth.uid())
  );

drop policy if exists home_feature_media_owner_delete on storage.objects;
create policy home_feature_media_owner_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'home-feature-media'
    and public.is_pick_control_owner(auth.uid())
  );
