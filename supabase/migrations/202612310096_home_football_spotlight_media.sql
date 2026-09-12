-- Server-owned media for the Home Football Player Spotlight.
-- The Home surface reads one canonical row; only the existing Picks owner may replace it.

create table if not exists public.home_feature_media (
  content_key text primary key,
  photo_source text not null,
  updated_at timestamptz not null default now(),
  constraint home_feature_media_key check (content_key = 'football-player-spotlight'),
  constraint home_feature_media_photo_source check (
    char_length(photo_source) between 1 and 500000
    and (
      photo_source ~ '^https://'
      or photo_source ~* '^data:image/(jpeg|png|webp);base64,'
    )
  )
);

alter table public.home_feature_media enable row level security;
revoke all on table public.home_feature_media from public, anon, authenticated;

insert into public.home_feature_media(content_key, photo_source)
values (
  'football-player-spotlight',
  'https://images.sidearmdev.com/crop?height=680&type=webp&url=https%3A%2F%2Fdxbhsrqyrr690.cloudfront.net%2Fsidearm.nextgen.sites%2Fmsstate.sidearmsports.com%2Fimages%2F2026%2F6%2F26%2FTaylor_Kamario_WEB_20260624_FB_ProductionDay_MM_0101.jpg&width=530'
)
on conflict (content_key) do nothing;

create or replace function public.get_home_feature_media(p_content_key text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when media.content_key is null then null
    else jsonb_build_object(
      'content_key', media.content_key,
      'photo_source', media.photo_source,
      'updated_at', media.updated_at
    )
  end
  from (select trim(coalesce(p_content_key, '')) as requested_key) request
  left join public.home_feature_media media
    on media.content_key = request.requested_key
$$;

revoke all on function public.get_home_feature_media(text) from public;
grant execute on function public.get_home_feature_media(text) to anon, authenticated;

create or replace function public.set_home_feature_media(
  p_content_key text,
  p_photo_source text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := trim(coalesce(p_content_key, ''));
  v_photo_source text := trim(coalesce(p_photo_source, ''));
  v_media public.home_feature_media;
begin
  if auth.uid() is null or not public.is_pick_control_owner(auth.uid()) then
    raise exception 'Picks owner access required';
  end if;

  if v_key <> 'football-player-spotlight' then
    raise exception 'unsupported Home feature media key';
  end if;

  if char_length(v_photo_source) not between 1 and 500000
    or not (
      v_photo_source ~ '^https://'
      or v_photo_source ~* '^data:image/(jpeg|png|webp);base64,'
    )
  then
    raise exception 'Home feature photo source is invalid';
  end if;

  insert into public.home_feature_media(content_key, photo_source, updated_at)
  values (v_key, v_photo_source, now())
  on conflict (content_key) do update
    set photo_source = excluded.photo_source,
        updated_at = excluded.updated_at
  returning * into v_media;

  return jsonb_build_object(
    'content_key', v_media.content_key,
    'photo_source', v_media.photo_source,
    'updated_at', v_media.updated_at
  );
end;
$$;

revoke all on function public.set_home_feature_media(text, text) from public, anon;
grant execute on function public.set_home_feature_media(text, text) to authenticated;

notify pgrst, 'reload schema';
