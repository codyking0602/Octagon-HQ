-- Full Wheel of UFC active-pool headshot audit/backfill.
-- All 65 ESPN URLs below were live-verified as image/png before this migration.
-- Muhammad Saidov uses his live-verified official UFC athlete image.
-- This also wires the existing canonical UFC media registry into Wheel of UFC
-- so newly approved media automatically fills future Wheel gaps.

create temporary table wheel_ufc_headshot_backfill (
  fighter_slug text primary key,
  display_name text not null,
  photo_url text not null,
  source text not null,
  source_page_url text not null,
  source_fighter_id text
) on commit drop;

insert into wheel_ufc_headshot_backfill (
  fighter_slug, display_name, photo_url, source, source_page_url, source_fighter_id
) values
  ('aaron-pico', 'Aaron Pico', 'https://a.espncdn.com/i/headshots/mma/players/full/4199009.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4199009', '4199009'),
  ('abus-magomedov', 'Abus Magomedov', 'https://a.espncdn.com/i/headshots/mma/players/full/3077822.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/3077822', '3077822'),
  ('aiemann-zahabi', 'Aiemann Zahabi', 'https://a.espncdn.com/i/headshots/mma/players/full/4079149.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4079149', '4079149'),
  ('alessandro-costa', 'Alessandro Costa', 'https://a.espncdn.com/i/headshots/mma/players/full/5074121.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/5074121', '5074121'),
  ('alexander-volkov', 'Alexander Volkov', 'https://a.espncdn.com/i/headshots/mma/players/full/2993650.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/2993650', '2993650'),
  ('alonzo-menifield', 'Alonzo Menifield', 'https://a.espncdn.com/i/headshots/mma/players/full/3948876.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/3948876', '3948876'),
  ('amir-albazi', 'Amir Albazi', 'https://a.espncdn.com/i/headshots/mma/players/full/4684848.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4684848', '4684848'),
  ('ante-delija', 'Ante Delija', 'https://a.espncdn.com/i/headshots/mma/players/full/3041315.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/3041315', '3041315'),
  ('arman-tsarukyan', 'Arman Tsarukyan', 'https://a.espncdn.com/i/headshots/mma/players/full/4419372.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4419372', '4419372'),
  ('arnold-allen', 'Arnold Allen', 'https://a.espncdn.com/i/headshots/mma/players/full/3902098.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/3902098', '3902098'),
  ('asu-almabayev', 'Asu Almabayev', 'https://a.espncdn.com/i/headshots/mma/players/full/4294926.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4294926', '4294926'),
  ('azamat-murzakanov', 'Azamat Murzakanov', 'https://a.espncdn.com/i/headshots/mma/players/full/4227265.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4227265', '4227265'),
  ('brando-pericic', 'Brando Peričić', 'https://a.espncdn.com/i/headshots/mma/players/full/5293988.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/5293988', '5293988'),
  ('bryce-mitchell', 'Bryce Mitchell', 'https://a.espncdn.com/i/headshots/mma/players/full/3953381.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/3953381', '3953381'),
  ('caio-borralho', 'Caio Borralho', 'https://a.espncdn.com/i/headshots/mma/players/full/4835137.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4835137', '4835137'),
  ('carlos-prates', 'Carlos Prates', 'https://a.espncdn.com/i/headshots/mma/players/full/4294832.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4294832', '4294832'),
  ('carlos-ulberg', 'Carlos Ulberg', 'https://a.espncdn.com/i/headshots/mma/players/full/4695736.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4695736', '4695736'),
  ('charles-jourdain', 'Charles Jourdain', 'https://a.espncdn.com/i/headshots/mma/players/full/4421978.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4421978', '4421978'),
  ('david-martinez', 'David Martinez', 'https://a.espncdn.com/i/headshots/mma/players/full/4503229.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4503229', '4503229'),
  ('david-onama', 'David Onama', 'https://a.espncdn.com/i/headshots/mma/players/full/4897850.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4897850', '4897850'),
  ('diego-lopes', 'Diego Lopes', 'https://a.espncdn.com/i/headshots/mma/players/full/4881999.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4881999', '4881999'),
  ('farid-basharat', 'Farid Basharat', 'https://a.espncdn.com/i/headshots/mma/players/full/5016786.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/5016786', '5016786'),
  ('gabriel-bonfim', 'Gabriel Bonfim', 'https://a.espncdn.com/i/headshots/mma/players/full/4921516.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4921516', '4921516'),
  ('grant-dawson', 'Grant Dawson', 'https://a.espncdn.com/i/headshots/mma/players/full/3931156.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/3931156', '3931156'),
  ('ignacio-bahamondes', 'Ignacio Bahamondes', 'https://a.espncdn.com/i/headshots/mma/players/full/4038116.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4038116', '4038116'),
  ('ikram-aliskerov', 'Ikram Aliskerov', 'https://a.espncdn.com/i/headshots/mma/players/full/4684776.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4684776', '4684776'),
  ('jack-della-maddalena', 'Jack Della Maddalena', 'https://a.espncdn.com/i/headshots/mma/players/full/4828707.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4828707', '4828707'),
  ('jamahal-hill', 'Jamahal Hill', 'https://a.espncdn.com/i/headshots/mma/players/full/4425355.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4425355', '4425355'),
  ('jamall-emmers', 'Jamall Emmers', 'https://a.espncdn.com/i/headshots/mma/players/full/3915502.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/3915502', '3915502'),
  ('jean-silva', 'Jean Silva', 'https://a.espncdn.com/i/headshots/mma/players/full/5145766.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/5145766', '5145766'),
  ('jiri-prochazka', 'Jiří Procházka', 'https://a.espncdn.com/i/headshots/mma/players/full/3156612.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/3156612', '3156612'),
  ('joanderson-brito', 'Joanderson Brito', 'https://a.espncdn.com/i/headshots/mma/players/full/4422355.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4422355', '4422355'),
  ('joaquin-buckley', 'Joaquin Buckley', 'https://a.espncdn.com/i/headshots/mma/players/full/4024714.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4024714', '4024714'),
  ('joe-pyfer', 'Joe Pyfer', 'https://a.espncdn.com/i/headshots/mma/players/full/4684135.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4684135', '4684135'),
  ('kevin-vallejos', 'Kevin Vallejos', 'https://a.espncdn.com/i/headshots/mma/players/full/5145681.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/5145681', '5145681'),
  ('kyoji-horiguchi', 'Kyoji Horiguchi', 'https://a.espncdn.com/i/headshots/mma/players/full/2613374.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/2613374', '2613374'),
  ('manel-kape', 'Manel Kape', 'https://a.espncdn.com/i/headshots/mma/players/full/4236504.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4236504', '4236504'),
  ('mario-pinto', 'Mario Pinto', 'https://a.espncdn.com/i/headshots/mma/players/full/5218817.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/5218817', '5218817'),
  ('mauricio-ruffy', 'Mauricio Ruffy', 'https://a.espncdn.com/i/headshots/mma/players/full/5122238.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/5122238', '5122238'),
  ('melquizael-costa', 'Melquizael Costa', 'https://a.espncdn.com/i/headshots/mma/players/full/4425763.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4425763', '4425763'),
  ('mike-malott', 'Mike Malott', 'https://a.espncdn.com/i/headshots/mma/players/full/3165120.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/3165120', '3165120'),
  ('mitch-raposo', 'Mitch Raposo', 'https://a.espncdn.com/i/headshots/mma/players/full/4815978.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4815978', '4815978'),
  ('montel-jackson', 'Montel Jackson', 'https://a.espncdn.com/i/headshots/mma/players/full/4339130.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4339130', '4339130'),
  ('movsar-evloev', 'Movsar Evloev', 'https://a.espncdn.com/i/headshots/mma/players/full/4029275.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4029275', '4029275'),
  ('nassourdine-imavov', 'Nassourdine Imavov', 'https://a.espncdn.com/i/headshots/mma/players/full/4690539.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4690539', '4690539'),
  ('pat-sabatini', 'Pat Sabatini', 'https://a.espncdn.com/i/headshots/mma/players/full/4085967.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4085967', '4085967'),
  ('patricio-pitbull', 'Patricio Pitbull', 'https://a.espncdn.com/i/headshots/mma/players/full/2532870.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/2532870', '2532870'),
  ('pavel-andrusca', 'Pavel Andrusca', 'https://a.espncdn.com/i/headshots/mma/players/full/5445620.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/5445620', '5445620'),
  ('rei-tsuruya', 'Rei Tsuruya', 'https://a.espncdn.com/i/headshots/mma/players/full/5137012.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/5137012', '5137012'),
  ('rinat-fakhretdinov', 'Rinat Fakhretdinov', 'https://a.espncdn.com/i/headshots/mma/players/full/4712980.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4712980', '4712980'),
  ('salahdine-parnasse', 'Salahdine Parnasse', 'https://a.espncdn.com/i/headshots/mma/players/full/4312859.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4312859', '4312859'),
  ('sean-brady', 'Sean Brady', 'https://a.espncdn.com/i/headshots/mma/players/full/4295192.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4295192', '4295192'),
  ('sergei-pavlovich', 'Sergei Pavlovich', 'https://a.espncdn.com/i/headshots/mma/players/full/4217395.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4217395', '4217395'),
  ('shara-magomedov', 'Shara Magomedov', 'https://a.espncdn.com/i/headshots/mma/players/full/4421784.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4421784', '4421784'),
  ('steve-garcia', 'Steve Garcia', 'https://a.espncdn.com/i/headshots/mma/players/full/3023804.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/3023804', '3023804'),
  ('tagir-ulanbekov', 'Tagir Ulanbekov', 'https://a.espncdn.com/i/headshots/mma/players/full/4294924.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4294924', '4294924'),
  ('tim-elliott', 'Tim Elliott', 'https://a.espncdn.com/i/headshots/mma/players/full/2614020.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/2614020', '2614020'),
  ('tofiq-musayev', 'Tofiq Musayev', 'https://a.espncdn.com/i/headshots/mma/players/full/4423264.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4423264', '4423264'),
  ('tom-nolan', 'Tom Nolan', 'https://a.espncdn.com/i/headshots/mma/players/full/5144007.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/5144007', '5144007'),
  ('valter-walker', 'Valter Walker', 'https://a.espncdn.com/i/headshots/mma/players/full/5147389.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/5147389', '5147389'),
  ('vinicius-oliveira', 'Vinicius Oliveira', 'https://a.espncdn.com/i/headshots/mma/players/full/4884877.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4884877', '4884877'),
  ('waldo-cortes-acosta', 'Waldo Cortes Acosta', 'https://a.espncdn.com/i/headshots/mma/players/full/4903365.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4903365', '4903365'),
  ('yaroslav-amosov', 'Yaroslav Amosov', 'https://a.espncdn.com/i/headshots/mma/players/full/4275020.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4275020', '4275020'),
  ('youssef-zalal', 'Youssef Zalal', 'https://a.espncdn.com/i/headshots/mma/players/full/4351319.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4351319', '4351319'),
  ('zhang-mingyang', 'Zhang Mingyang', 'https://a.espncdn.com/i/headshots/mma/players/full/4845284.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4845284', '4845284'),
  ('muhammad-saidov', 'Muhammad Saidov', 'https://ufc.com/images/2026-07/SAIDOV_MUHAMMAD_07-25.png', 'ufc', 'https://www.ufc.com/athlete/muhammad-said', null);

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
  source.fighter_slug,
  source.display_name,
  source.photo_url,
  source.source,
  source.source_page_url,
  source.source_fighter_id,
  now(),
  now(),
  now()
from wheel_ufc_headshot_backfill source
on conflict (fighter_slug) do update
set display_name = excluded.display_name,
    photo_url = excluded.photo_url,
    source = excluded.source,
    source_page_url = excluded.source_page_url,
    source_fighter_id = excluded.source_fighter_id,
    last_verified_at = excluded.last_verified_at,
    updated_at = excluded.updated_at
where public.ufc_fighter_media.photo_url is distinct from excluded.photo_url
   or public.ufc_fighter_media.source is distinct from excluded.source
   or public.ufc_fighter_media.source_page_url is distinct from excluded.source_page_url
   or public.ufc_fighter_media.source_fighter_id is distinct from excluded.source_fighter_id;

update private.wheel_ufc_fighters fighter
set headshot_url = source.photo_url
from wheel_ufc_headshot_backfill source
where fighter.fighter_id = source.fighter_slug
  and (fighter.headshot_url is null or btrim(fighter.headshot_url) = '');

update private.wheel_ufc_picks pick
set headshot_url = source.photo_url
from wheel_ufc_headshot_backfill source
where pick.fighter_id = source.fighter_slug
  and (pick.headshot_url is null or btrim(pick.headshot_url) = '');

create or replace function private.sync_wheel_ufc_headshot_from_media()
returns trigger
language plpgsql
security definer
set search_path = ''
as $wheel_ufc_media_sync$
begin
  update private.wheel_ufc_fighters fighter
  set headshot_url = new.photo_url
  where fighter.fighter_id = new.fighter_slug
    and (fighter.headshot_url is null or btrim(fighter.headshot_url) = '');

  update private.wheel_ufc_picks pick
  set headshot_url = new.photo_url
  where pick.fighter_id = new.fighter_slug
    and (pick.headshot_url is null or btrim(pick.headshot_url) = '');

  return new;
end;
$wheel_ufc_media_sync$;

drop trigger if exists sync_wheel_ufc_headshot_from_media on public.ufc_fighter_media;
create trigger sync_wheel_ufc_headshot_from_media
after insert or update of photo_url on public.ufc_fighter_media
for each row
execute function private.sync_wheel_ufc_headshot_from_media();

revoke all on function private.sync_wheel_ufc_headshot_from_media() from public, anon, authenticated;

do $wheel_ufc_headshot_audit$
declare
  v_active integer;
  v_missing integer;
begin
  select count(*),
         count(*) filter (where headshot_url is null or btrim(headshot_url) = '')
    into v_active, v_missing
  from private.wheel_ufc_fighters
  where active;

  if v_active <> 170 then
    raise exception 'Wheel of UFC headshot audit expected 170 active fighters, found %', v_active;
  end if;

  if v_missing <> 0 then
    raise exception 'Wheel of UFC headshot audit still has % active fighters without headshots', v_missing;
  end if;
end;
$wheel_ufc_headshot_audit$;

comment on function private.sync_wheel_ufc_headshot_from_media() is
  'Reuses the canonical approved UFC fighter media registry to fill missing Wheel of UFC fighter and pick snapshots without overwriting existing approved Wheel photos.';
