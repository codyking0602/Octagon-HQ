-- Runtime UFC fighter thumbnail registry.
-- Event header artwork remains owner-uploaded and is intentionally untouched.
-- This registry stores only fighter photos observed from official UFC or ESPN
-- sources and exposes them through a read-only RPC for the existing
-- FighterThumbnail owner.

create table if not exists public.ufc_fighter_media (
  fighter_slug text primary key,
  display_name text not null,
  photo_url text not null,
  source text not null,
  source_page_url text not null,
  source_fighter_id text,
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ufc_fighter_media_slug check (
    fighter_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint ufc_fighter_media_display_name check (
    length(trim(display_name)) between 2 and 120
  ),
  constraint ufc_fighter_media_source check (
    source in ('espn', 'ufc')
  ),
  constraint ufc_fighter_media_photo_https check (
    photo_url ~ '^https://'
  ),
  constraint ufc_fighter_media_source_page_https check (
    source_page_url ~ '^https://'
  )
);

alter table public.ufc_fighter_media enable row level security;
revoke all on table public.ufc_fighter_media from public, anon, authenticated;

create or replace function public.get_ufc_fighter_media_map()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_object_agg(media.fighter_slug, media.photo_url order by media.fighter_slug),
    '{}'::jsonb
  )
  from public.ufc_fighter_media media;
$$;

revoke all on function public.get_ufc_fighter_media_map()
  from public;
grant execute on function public.get_ufc_fighter_media_map()
  to anon, authenticated, service_role;

create or replace function public.sync_ufc_fighter_media(
  p_candidates jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_candidate jsonb;
  v_slug text;
  v_name text;
  v_photo_url text;
  v_source text;
  v_source_page_url text;
  v_source_fighter_id text;
  v_inserted integer := 0;
  v_verified integer := 0;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to sync UFC fighter media';
  end if;

  if jsonb_typeof(p_candidates) <> 'array' then
    raise exception 'UFC fighter media candidates must be an array';
  end if;

  for v_candidate in
    select value from jsonb_array_elements(p_candidates)
  loop
    v_slug := lower(trim(coalesce(v_candidate->>'fighter_slug', '')));
    v_name := trim(coalesce(v_candidate->>'display_name', ''));
    v_photo_url := trim(coalesce(v_candidate->>'photo_url', ''));
    v_source := lower(trim(coalesce(v_candidate->>'source', '')));
    v_source_page_url := trim(coalesce(v_candidate->>'source_page_url', ''));
    v_source_fighter_id := nullif(trim(coalesce(v_candidate->>'source_fighter_id', '')), '');

    if v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      or length(v_name) not between 2 and 120
      or v_source not in ('espn', 'ufc')
      or v_photo_url !~ '^https://'
      or v_source_page_url !~ '^https://'
      or v_photo_url ~* '(silhouette|placeholder|default[-_]?avatar|ufc[-_]?logo)'
    then
      continue;
    end if;

    if v_source = 'espn' and (
      v_photo_url !~ '^https://a[.]espncdn[.]com/'
      or v_source_page_url !~ '^https://www[.]espn[.]com/mma/fighter/_/id/[0-9]+'
      or v_source_fighter_id is null
      or v_source_fighter_id !~ '^[0-9]+$'
    ) then
      continue;
    end if;

    if v_source = 'ufc' and
      v_source_page_url !~ '^https://www[.]ufc[.]com/athlete/[a-z0-9-]+$'
    then
      continue;
    end if;

    insert into public.ufc_fighter_media (
      fighter_slug,
      display_name,
      photo_url,
      source,
      source_page_url,
      source_fighter_id,
      last_verified_at,
      created_at,
      updated_at
    ) values (
      v_slug,
      v_name,
      v_photo_url,
      v_source,
      v_source_page_url,
      v_source_fighter_id,
      now(),
      now(),
      now()
    )
    on conflict (fighter_slug) do nothing;

    if found then
      v_inserted := v_inserted + 1;
      continue;
    end if;

    update public.ufc_fighter_media media
    set last_verified_at = now(),
        updated_at = now()
    where media.fighter_slug = v_slug
      and media.photo_url = v_photo_url
      and media.source = v_source
      and media.source_page_url = v_source_page_url;

    if found then
      v_verified := v_verified + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'received', jsonb_array_length(p_candidates),
    'inserted', v_inserted,
    'verified', v_verified
  );
end;
$$;

revoke all on function public.sync_ufc_fighter_media(jsonb)
  from public, anon, authenticated;
grant execute on function public.sync_ufc_fighter_media(jsonb)
  to service_role;

comment on table public.ufc_fighter_media is
  'Approved runtime UFC fighter thumbnails sourced only from official UFC athlete pages or ESPN MMA athlete headshots. Event header artwork is not part of this registry.';

comment on function public.get_ufc_fighter_media_map() is
  'Read-only fighter_slug to approved UFC/ESPN thumbnail URL map for the canonical FighterThumbnail owner.';

comment on function public.sync_ufc_fighter_media(jsonb) is
  'Service-only idempotent ingest for official UFC/ESPN fighter thumbnail candidates. Existing approved photos are never replaced automatically.';

notify pgrst, 'reload schema';
