-- Split the Football Home Player Spotlight into independently managed CFB and NFL media slots.
-- Preserve the legacy key for rollback compatibility, while new Home clients read the sport-specific keys.

alter table public.home_feature_media
  drop constraint if exists home_feature_media_key;

alter table public.home_feature_media
  add constraint home_feature_media_key check (
    content_key in (
      'football-player-spotlight',
      'football-player-spotlight-cfb',
      'football-player-spotlight-nfl'
    )
  );

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

  if v_key not in (
    'football-player-spotlight',
    'football-player-spotlight-cfb',
    'football-player-spotlight-nfl'
  ) then
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
