-- Repair six Wheel of UFC headshots that referenced local assets absent from the repo.
-- Each replacement ESPN MMA image was live-verified as image/png immediately before this migration.

create temporary table wheel_ufc_broken_headshot_repair (
  fighter_slug text primary key,
  display_name text not null,
  espn_id text not null,
  broken_url text not null,
  photo_url text not null
) on commit drop;

insert into wheel_ufc_broken_headshot_repair (
  fighter_slug, display_name, espn_id, broken_url, photo_url
) values
  ('beneil-dariush', 'Beneil Dariush', '3085551', '/assets/fighters/beneil-dariush-thumb.webp', 'https://a.espncdn.com/i/headshots/mma/players/full/3085551.png'),
  ('francisco-prado', 'Francisco Prado', '5123216', '/assets/fighters/francisco-prado-thumb.webp', 'https://a.espncdn.com/i/headshots/mma/players/full/5123216.png'),
  ('mick-parkin', 'Mick Parkin', '5060505', '/assets/fighters/mick-parkin-thumb.webp', 'https://a.espncdn.com/i/headshots/mma/players/full/5060505.png'),
  ('roberto-soldic', 'Roberto Soldić', '4274796', '/assets/fighters/roberto-soldic-thumb.webp', 'https://a.espncdn.com/i/headshots/mma/players/full/4274796.png'),
  ('santiago-luna', 'Santiago Luna', '5307799', '/assets/fighters/santiago-luna-thumb.webp', 'https://a.espncdn.com/i/headshots/mma/players/full/5307799.png'),
  ('shavkat-rakhmonov', 'Shavkat Rakhmonov', '4020699', '/assets/fighters/shavkat-rakhmonov-thumb.webp', 'https://a.espncdn.com/i/headshots/mma/players/full/4020699.png');

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
)
select
  repair.fighter_slug,
  repair.display_name,
  repair.photo_url,
  'espn',
  'https://www.espn.com/mma/fighter/_/id/' || repair.espn_id,
  repair.espn_id,
  now(),
  now(),
  now()
from wheel_ufc_broken_headshot_repair repair
on conflict (fighter_slug) do update
set display_name = excluded.display_name,
    photo_url = excluded.photo_url,
    source = excluded.source,
    source_page_url = excluded.source_page_url,
    source_fighter_id = excluded.source_fighter_id,
    last_verified_at = excluded.last_verified_at,
    updated_at = excluded.updated_at;

update private.wheel_ufc_fighters fighter
set headshot_url = repair.photo_url
from wheel_ufc_broken_headshot_repair repair
where fighter.fighter_id = repair.fighter_slug
  and (
    fighter.headshot_url = repair.broken_url
    or fighter.headshot_url is null
    or btrim(fighter.headshot_url) = ''
  );

update private.wheel_ufc_picks pick
set headshot_url = repair.photo_url
from wheel_ufc_broken_headshot_repair repair
where pick.fighter_id = repair.fighter_slug
  and (
    pick.headshot_url = repair.broken_url
    or pick.headshot_url is null
    or btrim(pick.headshot_url) = ''
  );

do $wheel_ufc_broken_headshot_audit$
declare
  v_bad integer;
begin
  select count(*)
    into v_bad
  from private.wheel_ufc_fighters fighter
  join wheel_ufc_broken_headshot_repair repair
    on repair.fighter_slug = fighter.fighter_id
  where fighter.active
    and (
      fighter.headshot_url is null
      or btrim(fighter.headshot_url) = ''
      or fighter.headshot_url = repair.broken_url
      or fighter.headshot_url <> repair.photo_url
    );

  if v_bad <> 0 then
    raise exception 'Wheel of UFC broken-headshot repair left % bad active rows', v_bad;
  end if;
end;
$wheel_ufc_broken_headshot_audit$;
