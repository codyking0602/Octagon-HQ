-- Wheel of UFC v1.
-- Current men's UFC roster authority is seeded from the official UFC rankings snapshot
-- checked against the official Meta UFC Rankings on 2026-10-04. "Unranked" launch options are current active UFC fighters
-- outside the current Meta UFC Top 15, with post-UFC 332 current-roster updates included.
-- HQ grades stay private during play and are revealed only after a natural 16-pick completion.

create table if not exists private.wheel_ufc_fighters (
  fighter_id text not null,
  display_name text not null,
  division text not null check (division in (
    'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight',
    'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight'
  )),
  ranking integer check (ranking between 1 and 15),
  is_champion boolean not null default false,
  country_code text,
  country_name text,
  young_gun boolean not null default false,
  veteran_10_plus boolean not null default false,
  headshot_url text,
  hidden_grade numeric(5,2) not null check (hidden_grade between 0 and 100),
  grade_version text not null default 'ufc-wheel-current-v2',
  rankings_as_of date not null default date '2026-10-04',
  active boolean not null default true,
  primary key (fighter_id, division),
  constraint wheel_ufc_champion_rank_check check (
    (is_champion and ranking is null) or (not is_champion)
  ),
  constraint wheel_ufc_country_pair_check check (
    (country_code is null and country_name is null)
    or (country_code is not null and country_name is not null)
  )
);

alter table private.wheel_ufc_fighters enable row level security;
revoke all on private.wheel_ufc_fighters from public, anon, authenticated;

create or replace function private.seed_wheel_ufc_fighters(p_rows text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  with raw as (
    select btrim(row_text) as row_text
    from regexp_split_to_table(p_rows, E'\r?\n') as rows(row_text)
    where btrim(row_text) <> ''
  ), parsed as (
    select
      split_part(row_text, '|', 1) as fighter_id,
      split_part(row_text, '|', 2) as display_name,
      split_part(row_text, '|', 3) as division,
      nullif(split_part(row_text, '|', 4), '')::integer as ranking,
      split_part(row_text, '|', 5)::boolean as is_champion,
      nullif(split_part(row_text, '|', 6), '') as country_code,
      nullif(split_part(row_text, '|', 7), '') as country_name,
      split_part(row_text, '|', 8)::boolean as young_gun,
      split_part(row_text, '|', 9)::boolean as veteran_10_plus,
      split_part(row_text, '|', 10)::numeric as hidden_grade,
      nullif(split_part(row_text, '|', 11), '') as headshot_url
    from raw
  )
  insert into private.wheel_ufc_fighters (
    fighter_id, display_name, division, ranking, is_champion,
    country_code, country_name, young_gun, veteran_10_plus,
    hidden_grade, headshot_url
  )
  select
    fighter_id, display_name, division, ranking, is_champion,
    country_code, country_name, young_gun, veteran_10_plus,
    hidden_grade, headshot_url
  from parsed
  on conflict (fighter_id, division) do update
  set display_name = excluded.display_name,
      ranking = excluded.ranking,
      is_champion = excluded.is_champion,
      country_code = excluded.country_code,
      country_name = excluded.country_name,
      young_gun = excluded.young_gun,
      veteran_10_plus = excluded.veteran_10_plus,
      hidden_grade = excluded.hidden_grade,
      headshot_url = excluded.headshot_url,
      grade_version = 'ufc-wheel-current-v2',
      rankings_as_of = date '2026-10-04',
      active = true;
end;
$$;

revoke all on function private.seed_wheel_ufc_fighters(text) from public, anon, authenticated;

select private.seed_wheel_ufc_fighters($wheel_ufc_rows$
joshua-van|Joshua Van|Flyweight||true|MM|Myanmar|true|false|97.5|/assets/fighters/joshua-van-thumb.webp
manel-kape|Manel Kape|Flyweight|1|false|AO|Angola|false|false|95.5|
alexandre-pantoja|Alexandre Pantoja|Flyweight|2|false|BR|Brazil|false|true|95.3|/assets/fighters/alex-pantoja-thumb.webp
brandon-royval|Brandon Royval|Flyweight|3|false|US|United States|false|true|93.7|/assets/fighters/brandon-royval-thumb.webp
tatsuro-taira|Tatsuro Taira|Flyweight|4|false|JP|Japan|false|false|92.5|
asu-almabayev|Asu Almabayev|Flyweight|5|false|KZ|Kazakhstan|false|false|90.5|
loneer-kavanagh|Lone’er Kavanagh|Flyweight|6|false|GB|England|false|false|89.8|/assets/fighters/loneer-kavanagh-thumb.webp
ramazan-temirov|Ramazan Temirov|Flyweight|7|false|UZ|Uzbekistan|false|false|88.7|/assets/fighters/ramazan-temirov-thumb.webp
kyoji-horiguchi|Kyoji Horiguchi|Flyweight|8|false|JP|Japan|false|false|89.3|
brandon-moreno|Brandon Moreno|Flyweight|9|false|MX|Mexico|false|true|86.5|/assets/fighters/brandon-moreno-thumb.webp
amir-albazi|Amir Albazi|Flyweight|10|false|IQ|Iraq|false|false|85.5|
sumudaerji|Sumudaerji|Flyweight|11|false|CN|China|false|false|84.5|/assets/fighters/sumudaerji-thumb.webp
mitch-raposo|Mitch Raposo|Flyweight|12|false|US|United States|false|false|83.5|
rei-tsuruya|Rei Tsuruya|Flyweight|13|false|JP|Japan|true|false|82.5|
charles-johnson|Charles Johnson|Flyweight|14|false|US|United States|false|true|81.5|/assets/fighters/charles-johnson-thumb.webp
alessandro-costa|Alessandro Costa|Flyweight|15|false|BR|Brazil|false|false|80|
alex-perez|Alex Perez|Flyweight||false|US|United States|false|true|80|/assets/fighters/alex-perez-thumb.webp
steve-erceg|Steve Erceg|Flyweight||false|AU|Australia|false|false|83|/assets/fighters/steve-erceg-thumb.webp
tagir-ulanbekov|Tagir Ulanbekov|Flyweight||false|RU|Russia|false|false|81|
tim-elliott|Tim Elliott|Flyweight||false|US|United States|false|true|84|
petr-yan|Petr Yan|Bantamweight||true|RU|Russia|false|true|98|/assets/fighters/petr-yan-thumb.webp
merab-dvalishvili|Merab Dvalishvili|Bantamweight|1|false|GE|Georgia|false|true|96|/assets/fighters/merab-dvalishvili-thumb.webp
song-yadong|Song Yadong|Bantamweight|2|false|CN|China|false|true|94.4|/assets/fighters/song-yadong-thumb.webp
sean-omalley|Sean O'Malley|Bantamweight|3|false|US|United States|false|true|94.2|/assets/fighters/sean-omalley-thumb.webp
mario-bautista|Mario Bautista|Bantamweight|4|false|US|United States|false|true|92.1|/assets/fighters/mario-bautista-thumb.webp
umar-nurmagomedov|Umar Nurmagomedov|Bantamweight|5|false|RU|Russia|false|false|91.9|/assets/fighters/umar-nurmagomedov-thumb.webp
cory-sandhagen|Cory Sandhagen|Bantamweight|6|false|US|United States|false|true|90.2|/assets/fighters/cory-sandhagen-thumb.webp
david-martinez|David Martinez|Bantamweight|7|false|MX|Mexico|false|false|88.7|
raul-rosas-jr|Raul Rosas Jr.|Bantamweight|8|false|MX|Mexico|true|false|86.6|/assets/fighters/raul-rosas-jr-thumb.webp
farid-basharat|Farid Basharat|Bantamweight|9|false|AF|Afghanistan|false|false|86.5|
marcus-mcghee|Marcus McGhee|Bantamweight|10|false|US|United States|false|false|85.5|/assets/fighters/marcus-mcghee-thumb.webp
deiveson-figueiredo|Deiveson Figueiredo|Bantamweight|11|false|BR|Brazil|false|true|85.4|/assets/fighters/deiveson-figueiredo-thumb.webp
montel-jackson|Montel Jackson|Bantamweight|12|false|US|United States|false|true|83.5|
aiemann-zahabi|Aiemann Zahabi|Bantamweight|13|false|CA|Canada|false|false|82.5|
marlon-vera|Marlon Vera|Bantamweight|14|false|EC|Ecuador|false|true|81.5|/assets/fighters/marlon-vera-thumb.webp
bryce-mitchell|Bryce Mitchell|Bantamweight|15|false|US|United States|false|true|80|
charles-jourdain|Charles Jourdain|Bantamweight||false|CA|Canada|false|false|81|
payton-talbott|Payton Talbott|Bantamweight||false|US|United States|false|false|91|/assets/fighters/payton-talbott-thumb.webp
raoni-barcelos|Raoni Barcelos|Bantamweight||false|BR|Brazil|false|true|81|/assets/fighters/raoni-barcelos-thumb.webp
santiago-luna|Santiago Luna|Bantamweight||false|US|United States|true|false|80|/assets/fighters/santiago-luna-thumb.webp
vinicius-oliveira|Vinicius Oliveira|Bantamweight||false|BR|Brazil|false|false|82|
alexander-volkanovski|Alexander Volkanovski|Featherweight||true|AU|Australia|false|true|99|/assets/fighters/alexander-volkanovski-thumb.webp
movsar-evloev|Movsar Evloev|Featherweight|1|false|RU|Russia|false|false|96|
diego-lopes|Diego Lopes|Featherweight|2|false|BR|Brazil|false|false|94.8|
lerone-murphy|Lerone Murphy|Featherweight|3|false|GB|England|false|false|93.7|
aljamain-sterling|Aljamain Sterling|Featherweight|4|false|US|United States|false|true|92.5|/assets/fighters/aljamain-sterling-thumb.webp
jean-silva|Jean Silva|Featherweight|5|false|BR|Brazil|false|false|91.4|
arnold-allen|Arnold Allen|Featherweight|6|false|GB|England|false|true|89.8|
pat-sabatini|Pat Sabatini|Featherweight|7|false|US|United States|false|false|88.7|
pavel-andrusca|Pavel Andrusca|Featherweight|8|false|MD|Moldova|false|false|87.5|
youssef-zalal|Youssef Zalal|Featherweight|9|false|MA|Morocco|false|false|86.5|
kevin-vallejos|Kevin Vallejos|Featherweight|10|false|AR|Argentina|true|false|85.5|
joanderson-brito|Joanderson Brito|Featherweight|11|false|BR|Brazil|false|false|84.5|
melquizael-costa|Melquizael Costa|Featherweight|12|false|BR|Brazil|false|false|83.5|
steve-garcia|Steve Garcia|Featherweight|13|false|US|United States|false|true|82.5|
aaron-pico|Aaron Pico|Featherweight|14|false|US|United States|false|false|81.5|
jamall-emmers|Jamall Emmers|Featherweight|15|false|US|United States|false|true|80|
brian-ortega|Brian Ortega|Featherweight||false|US|United States|false|true|82|/assets/fighters/brian-ortega-thumb.webp
david-onama|David Onama|Featherweight||false|UG|Uganda|false|false|80|
patricio-pitbull|Patricio Pitbull|Featherweight||false|BR|Brazil|false|false|81|
yair-rodriguez|Yair Rodriguez|Featherweight||false|MX|Mexico|false|true|89|/assets/fighters/yair-rodriguez-thumb.webp
justin-gaethje|Justin Gaethje|Lightweight||true|US|United States|false|true|98|/assets/fighters/justin-gaethje-thumb.webp
ilia-topuria|Ilia Topuria|Lightweight|1|false|ES|Spain|false|false|96|/assets/fighters/ilia-topuria-thumb.webp
arman-tsarukyan|Arman Tsarukyan|Lightweight|2|false|AM|Armenia|false|true|94.8|
charles-oliveira|Charles Oliveira|Lightweight|3|false|BR|Brazil|false|true|93.7|/assets/fighters/charles-oliveira-thumb.webp
max-holloway|Max Holloway|Lightweight|4|false|US|United States|false|true|92.5|/assets/fighters/max-holloway-thumb.webp
paddy-pimblett|Paddy Pimblett|Lightweight|5|false|GB|England|false|false|91.4|/assets/fighters/paddy-pimblett-thumb.webp
quillan-salkilld|Quillan Salkilld|Lightweight|6|false|AU|Australia|false|false|89.8|/assets/fighters/quillan-salkilld-thumb.webp
benoit-saint-denis|Benoît Saint Denis|Lightweight|7|false|FR|France|false|false|89.6|/assets/fighters/benoit-saint-denis-thumb.webp
renato-moicano|Renato Moicano|Lightweight|8|false|BR|Brazil|false|true|87.5|/assets/fighters/renato-moicano-thumb.webp
mateusz-gamrot|Mateusz Gamrot|Lightweight|9|false|PL|Poland|false|true|86.3|/assets/fighters/mateusz-gamrot-thumb.webp
mauricio-ruffy|Mauricio Ruffy|Lightweight|10|false|BR|Brazil|false|false|86.6|
tom-nolan|Tom Nolan|Lightweight|11|false|AU|Australia|false|false|84.5|
rafael-fiziev|Rafael Fiziev|Lightweight|12|false|AZ|Azerbaijan|false|true|83.5|/assets/fighters/rafael-fiziev-thumb.webp
tofiq-musayev|Tofiq Musayev|Lightweight|13|false|AZ|Azerbaijan|false|false|82.5|
grant-dawson|Grant Dawson|Lightweight|14|false|US|United States|false|true|81.5|
jalin-turner|Jalin Turner|Lightweight|15|false|US|United States|false|true|80|/assets/fighters/jalin-turner-thumb.webp
beneil-dariush|Beneil Dariush|Lightweight||false|US|United States|false|true|80|/assets/fighters/beneil-dariush-thumb.webp
dan-hooker|Dan Hooker|Lightweight||false|NZ|New Zealand|false|true|82|/assets/fighters/dan-hooker-thumb.webp
esteban-ribovics|Esteban Ribovics|Lightweight||false|AR|Argentina|false|false|88|/assets/fighters/esteban-ribovics-thumb.webp
francisco-prado|Francisco Prado|Lightweight||false|AR|Argentina|true|false|77|/assets/fighters/francisco-prado-thumb.webp
ignacio-bahamondes|Ignacio Bahamondes|Lightweight||false|CL|Chile|false|false|82|
king-green|King Green|Lightweight||false|US|United States|false|true|78|/assets/fighters/king-green-thumb.webp
salahdine-parnasse|Salahdine Parnasse|Lightweight||false|FR|France|false|false|86|
islam-makhachev|Islam Makhachev|Welterweight||true|RU|Russia|false|true|99|/assets/fighters/islam-makhachev-thumb.webp
carlos-prates|Carlos Prates|Welterweight|1|false|BR|Brazil|false|false|95.5|
ian-machado-garry|Ian Machado Garry|Welterweight|2|false|IE|Ireland|false|false|95.3|/assets/fighters/ian-machado-garry-thumb.webp
michael-morales|Michael Morales|Welterweight|3|false|EC|Ecuador|false|false|93.7|
jack-della-maddalena|Jack Della Maddalena|Welterweight|4|false|AU|Australia|false|false|92.5|
sean-brady|Sean Brady|Welterweight|5|false|US|United States|false|false|90.9|
gabriel-bonfim|Gabriel Bonfim|Welterweight|6|false|BR|Brazil|false|false|90.7|
belal-muhammad|Belal Muhammad|Welterweight|7|false|US|United States|false|true|88.7|/assets/fighters/belal-muhammad-thumb.webp
joaquin-buckley|Joaquin Buckley|Welterweight|8|false|US|United States|false|true|87|
uros-medic|Uroš Medić|Welterweight|9|false|RS|Serbia|false|false|86.5|/assets/fighters/uros-medic-thumb.webp
leon-edwards|Leon Edwards|Welterweight|10|false|GB|England|false|true|85.5|/assets/fighters/leon-edwards-thumb.webp
mike-malott|Mike Malott|Welterweight|11|false|CA|Canada|false|false|84.5|
kamaru-usman|Kamaru Usman|Welterweight|12|false|NG|Nigeria|false|true|83.5|/assets/fighters/kamaru-usman-thumb.webp
yaroslav-amosov|Yaroslav Amosov|Welterweight|13|false|UA|Ukraine|false|false|82.5|
kevin-holland|Kevin Holland|Welterweight|14|false|US|United States|false|true|81.5|/assets/fighters/kevin-holland-thumb.webp
daniel-rodriguez|Daniel Rodriguez|Welterweight|15|false|US|United States|false|true|80|/assets/fighters/daniel-rodriguez-thumb.webp
khaos-williams|Khaos Williams|Welterweight||false|US|United States|false|false|80|/assets/fighters/khaos-williams-thumb.webp
neil-magny|Neil Magny|Welterweight||false|US|United States|false|true|80|/assets/fighters/neil-magny-thumb.webp
randy-brown|Randy Brown|Welterweight||false|JM|Jamaica|false|false|80|/assets/fighters/randy-brown-thumb.webp
rinat-fakhretdinov|Rinat Fakhretdinov|Welterweight||false|RU|Russia|false|false|83|
roberto-soldic|Roberto Soldić|Welterweight||false|HR|Croatia|false|false|86|/assets/fighters/roberto-soldic-thumb.webp
shavkat-rakhmonov|Shavkat Rakhmonov|Welterweight||false|KZ|Kazakhstan|false|false|94|/assets/fighters/shavkat-rakhmonov-thumb.webp
sean-strickland|Sean Strickland|Middleweight||true|US|United States|false|true|96.5|/assets/fighters/sean-strickland-thumb.webp
khamzat-chimaev|Khamzat Chimaev|Middleweight|1|false|AE|United Arab Emirates|false|false|96|/assets/fighters/khamzat-chimaev-thumb.webp
dricus-du-plessis|Dricus Du Plessis|Middleweight|2|false|ZA|South Africa|false|true|94.8|/assets/fighters/dricus-du-plessis-thumb.webp
nassourdine-imavov|Nassourdine Imavov|Middleweight|3|false|FR|France|false|true|93.7|
joe-pyfer|Joe Pyfer|Middleweight|4|false|US|United States|false|false|91.6|
brendan-allen|Brendan Allen|Middleweight|5|false|US|United States|false|true|91.9|/assets/fighters/brendan-allen-thumb.webp
caio-borralho|Caio Borralho|Middleweight|6|false|BR|Brazil|false|false|90.7|
gregory-rodrigues|Gregory Rodrigues|Middleweight|7|false|BR|Brazil|false|true|88.7|/assets/fighters/gregory-rodrigues-thumb.webp
anthony-hernandez|Anthony Hernandez|Middleweight|8|false|US|United States|false|true|88|/assets/fighters/anthony-hernandez-thumb.webp
israel-adesanya|Israel Adesanya|Middleweight|9|false|NZ|New Zealand|false|true|86.5|/assets/fighters/israel-adesanya-thumb.webp
christian-leroy-duncan|Christian Leroy Duncan|Middleweight|10|false|GB|England|false|false|85.5|/assets/fighters/christian-leroy-duncan-thumb.webp
ikram-aliskerov|Ikram Aliskerov|Middleweight|11|false|RU|Russia|false|false|84.5|
bo-nickal|Bo Nickal|Middleweight|12|false|US|United States|false|false|83.5|/assets/fighters/bo-nickal-thumb.webp
abus-magomedov|Abus Magomedov|Middleweight|13|false|DE|Germany|false|false|82.5|
edmen-shahbazyan|Edmen Shahbazyan|Middleweight|14|false|US|United States|false|true|81.5|/assets/fighters/edmen-shahbazyan-thumb.webp
shara-magomedov|Shara Magomedov|Middleweight|15|false|RU|Russia|false|false|80|
ateba-gautier|Ateba Gautier|Middleweight||false|CM|Cameroon|false|false|82|/assets/fighters/ateba-gautier-thumb.webp
damian-pinas|Damian Pinas|Middleweight||false|SR|Suriname|true|false|88|/assets/fighters/damian-pinas-thumb.webp
jared-cannonier|Jared Cannonier|Middleweight||false|US|United States|false|true|84|/assets/fighters/jared-cannonier-thumb.webp
mansur-abdul-malik|Mansur Abdul-Malik|Middleweight||false|US|United States|false|false|80|/assets/fighters/mansur-abdul-malik-thumb.webp
michel-pereira|Michel Pereira|Middleweight||false|BR|Brazil|false|true|80|/assets/fighters/michel-pereira-thumb.webp
roman-kopylov|Roman Kopylov|Middleweight||false|RU|Russia|false|true|88|/assets/fighters/roman-kopylov-thumb.webp
carlos-ulberg|Carlos Ulberg|Light Heavyweight||true|NZ|New Zealand|false|true|96|
alex-pereira|Alex Pereira|Light Heavyweight|1|false|BR|Brazil|false|true|95.1|/assets/fighters/alex-pereira-thumb.webp
magomed-ankalaev|Magomed Ankalaev|Light Heavyweight|2|false|RU|Russia|false|true|95.3|/assets/fighters/magomed-ankalaev-thumb.webp
jiri-prochazka|Jiří Procházka|Light Heavyweight|3|false|CZ|Czech Republic|false|false|94.2|
paulo-costa|Paulo Costa|Light Heavyweight|4|false|BR|Brazil|false|true|91.6|/assets/fighters/paulo-costa-thumb.webp
jamahal-hill|Jamahal Hill|Light Heavyweight|5|false|US|United States|false|false|90.5|
khalil-rountree-jr|Khalil Rountree Jr.|Light Heavyweight|6|false|US|United States|false|true|91.2|/assets/fighters/khalil-rountree-jr-thumb.webp
navajo-stirling|Navajo Stirling|Light Heavyweight|7|false|NZ|New Zealand|false|false|90|/assets/fighters/navajo-stirling-thumb.webp
dominick-reyes|Dominick Reyes|Light Heavyweight|8|false|US|United States|false|true|87.5|/assets/fighters/dominick-reyes-thumb.webp
reinier-de-ridder|Reinier de Ridder|Light Heavyweight|9|false|NL|Netherlands|false|false|86.5|/assets/fighters/reinier-de-ridder-thumb.webp
azamat-murzakanov|Azamat Murzakanov|Light Heavyweight|10|false|RU|Russia|false|false|85.5|
alonzo-menifield|Alonzo Menifield|Light Heavyweight|11|false|US|United States|false|true|84.5|
bogdan-guskov|Bogdan Guskov|Light Heavyweight|12|false|UZ|Uzbekistan|false|false|83.5|/assets/fighters/bogdan-guskov-thumb.webp
robert-whittaker|Robert Whittaker|Light Heavyweight|13|false|AU|Australia|false|true|82.5|/assets/fighters/robert-whittaker-thumb.webp
johnny-walker|Johnny Walker|Light Heavyweight|14|false|BR|Brazil|false|true|81.5|/assets/fighters/johnny-walker-thumb.webp
muhammad-saidov|Muhammad Saidov|Light Heavyweight|15|false|TJ|Tajikistan|false|false|80|
jan-blachowicz|Jan Błachowicz|Light Heavyweight||false|PL|Poland|false|true|86|/assets/fighters/jan-blachowicz-thumb.webp
nikita-krylov|Nikita Krylov|Light Heavyweight||false|UA|Ukraine|false|true|80|/assets/fighters/nikita-krylov-thumb.webp
volkan-oezdemir|Volkan Oezdemir|Light Heavyweight||false|CH|Switzerland|false|true|80|/assets/fighters/volkan-oezdemir-thumb.webp
zhang-mingyang|Zhang Mingyang|Light Heavyweight||false|CN|China|false|false|83|
ciryl-gane|Ciryl Gane|Heavyweight||true|FR|France|false|true|96.5|/assets/fighters/ciryl-gane-thumb.webp
tom-aspinall|Tom Aspinall|Heavyweight|1|false|GB|England|false|true|96|/assets/fighters/tom-aspinall-thumb.webp
sergei-pavlovich|Sergei Pavlovich|Heavyweight|2|false|RU|Russia|false|false|94.4|
alex-pereira|Alex Pereira|Heavyweight|3|false|BR|Brazil|false|true|92.8|/assets/fighters/alex-pereira-thumb.webp
alexander-volkov|Alexander Volkov|Heavyweight|4|false|RU|Russia|false|true|93.5|
rizvan-kuniev|Rizvan Kuniev|Heavyweight|5|false|RU|Russia|false|false|90.5|/assets/fighters/rizvan-kuniev-thumb.webp
josh-hokit|Josh Hokit|Heavyweight|6|false|US|United States|false|false|91.2|
curtis-blaydes|Curtis Blaydes|Heavyweight|7|false|US|United States|false|true|90|/assets/fighters/curtis-blaydes-thumb.webp
waldo-cortes-acosta|Waldo Cortes Acosta|Heavyweight|8|false|DO|Dominican Republic|false|false|87.5|
vitor-petrino|Vitor Petrino|Heavyweight|9|false|BR|Brazil|false|false|86.5|/assets/fighters/vitor-petrino-thumb.webp
mario-pinto|Mario Pinto|Heavyweight|10|false|PT|Portugal|false|false|85.5|
valter-walker|Valter Walker|Heavyweight|11|false|BR|Brazil|false|false|84.5|
brando-pericic|Brando Peričić|Heavyweight|12|false|HR|Croatia|false|false|83.5|
serghei-spivac|Serghei Spivac|Heavyweight|13|false|MD|Moldova|false|true|82.5|/assets/fighters/serghei-spivac-thumb.webp
shamil-gaziev|Shamil Gaziev|Heavyweight|14|false|BH|Bahrain|false|false|81.5|/assets/fighters/shamil-gaziev-thumb.webp
aleksandar-rakic|Aleksandar Rakić|Heavyweight|15|false|AT|Austria|false|true|80|/assets/fighters/aleksandar-rakic-thumb.webp
ante-delija|Ante Delija|Heavyweight||false|HR|Croatia|false|false|85|
derrick-lewis|Derrick Lewis|Heavyweight||false|US|United States|false|true|82|/assets/fighters/derrick-lewis-thumb.webp
gable-steveson|Gable Steveson|Heavyweight||false|US|United States|false|false|86|/assets/fighters/gable-steveson-thumb.webp
johnny-walker|Johnny Walker|Heavyweight||false|BR|Brazil|false|true|86|/assets/fighters/johnny-walker-thumb.webp
mick-parkin|Mick Parkin|Heavyweight||false|GB|England|false|false|78|/assets/fighters/mick-parkin-thumb.webp
tyrell-fortune|Tyrell Fortune|Heavyweight||false|US|United States|false|false|83|/assets/fighters/tyrell-fortune-thumb.webp
$wheel_ufc_rows$);

drop function private.seed_wheel_ufc_fighters(text);

create table if not exists private.wheel_ufc_matches (
  challenge_id uuid primary key references public.play_challenges(id) on delete cascade,
  current_turn_profile_id uuid references public.profiles(id) on delete restrict,
  turn_count integer not null default 0 check (turn_count between 0 and 16),
  phase text not null default 'waiting' check (phase in ('waiting', 'spin', 'pick', 'complete')),
  pending_category text check (pending_category in ('CHAMPION', 'TOP_5', 'SIX_TO_FIFTEEN', 'UNRANKED', 'COUNTRY', 'YOUNG_GUN', 'VETERAN')),
  pending_country_code text,
  pending_country_name text,
  forfeited_by_profile_id uuid references public.profiles(id) on delete restrict,
  forfeited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint wheel_ufc_pending_country_pair check (
    (pending_country_code is null and pending_country_name is null)
    or (pending_category = 'COUNTRY' and pending_country_code is not null and pending_country_name is not null)
  ),
  constraint wheel_ufc_phase_state_valid check (
    (phase = 'waiting' and current_turn_profile_id is null and pending_category is null and completed_at is null)
    or (phase = 'complete' and current_turn_profile_id is null and pending_category is null and completed_at is not null)
    or (phase = 'spin' and current_turn_profile_id is not null and pending_category is null and completed_at is null)
    or (phase = 'pick' and current_turn_profile_id is not null and pending_category is not null and completed_at is null)
  )
);

create table if not exists private.wheel_ufc_picks (
  id bigint generated always as identity primary key,
  challenge_id uuid not null references private.wheel_ufc_matches(challenge_id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  turn_number integer not null check (turn_number between 1 and 16),
  fighter_id text not null,
  display_name text not null,
  roster_slot text not null check (roster_slot in (
    'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight',
    'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight'
  )),
  ranking_label text not null,
  country_code text,
  country_name text,
  headshot_url text,
  hidden_grade numeric(5,2) not null check (hidden_grade between 0 and 100),
  hidden_grade_version text not null,
  hidden_grade_effective_date date not null,
  created_at timestamptz not null default now(),
  unique (challenge_id, profile_id, roster_slot),
  unique (challenge_id, fighter_id),
  unique (challenge_id, turn_number)
);

create index if not exists wheel_ufc_picks_match_profile_idx
  on private.wheel_ufc_picks (challenge_id, profile_id, turn_number);

alter table private.wheel_ufc_matches enable row level security;
alter table private.wheel_ufc_picks enable row level security;
revoke all on private.wheel_ufc_matches from public, anon, authenticated;
revoke all on private.wheel_ufc_picks from public, anon, authenticated;

create or replace function private.wheel_ufc_category_ok(
  p_category text,
  p_required_country_code text,
  p_fighter_country_code text,
  p_is_champion boolean,
  p_ranking integer,
  p_young_gun boolean,
  p_veteran boolean
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case p_category
    when 'CHAMPION' then p_is_champion
    when 'TOP_5' then p_ranking between 1 and 5
    when 'SIX_TO_FIFTEEN' then p_ranking between 6 and 15
    when 'UNRANKED' then not p_is_champion and p_ranking is null
    when 'COUNTRY' then p_fighter_country_code is not null
      and (
        nullif(trim(coalesce(p_required_country_code, '')), '') is null
        or p_fighter_country_code = nullif(trim(coalesce(p_required_country_code, '')), '')
      )
    when 'YOUNG_GUN' then p_young_gun
    when 'VETERAN' then p_veteran
    else false
  end;
$$;

create or replace function private.wheel_ufc_eligible_slots(
  p_challenge_id uuid,
  p_profile_id uuid,
  p_category text,
  p_country_code text
)
returns text[]
language sql
security definer
set search_path = ''
stable
as $$
  with slots(slot, ordinal) as (
    values
      ('Flyweight', 1), ('Bantamweight', 2), ('Featherweight', 3), ('Lightweight', 4),
      ('Welterweight', 5), ('Middleweight', 6), ('Light Heavyweight', 7), ('Heavyweight', 8)
  ), open_slots as (
    select slots.slot, slots.ordinal
    from slots
    where not exists (
      select 1
      from private.wheel_ufc_picks pick
      where pick.challenge_id = p_challenge_id
        and pick.profile_id = p_profile_id
        and pick.roster_slot = slots.slot
    )
  ), eligible as (
    select open_slots.slot, open_slots.ordinal
    from open_slots
    where exists (
      select 1
      from private.wheel_ufc_fighters fighter
      where fighter.active
        and fighter.division = open_slots.slot
        and private.wheel_ufc_category_ok(
          p_category,
          p_country_code,
          fighter.country_code,
          fighter.is_champion,
          fighter.ranking,
          fighter.young_gun,
          fighter.veteran_10_plus
        )
        and not exists (
          select 1
          from private.wheel_ufc_picks used
          where used.challenge_id = p_challenge_id
            and used.fighter_id = fighter.fighter_id
        )
    )
  )
  select coalesce(array_agg(eligible.slot order by eligible.ordinal), '{}'::text[])
  from eligible;
$$;

create or replace function private.wheel_ufc_raw_grade(
  p_challenge_id uuid,
  p_profile_id uuid
)
returns numeric
language sql
security definer
set search_path = ''
stable
as $$
  select case when count(*) = 8 and count(pick.hidden_grade) = 8
    then avg(pick.hidden_grade)::numeric else null end
  from private.wheel_ufc_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = p_profile_id;
$$;

create or replace function private.wheel_ufc_grade_total(
  p_challenge_id uuid,
  p_profile_id uuid
)
returns numeric
language sql
security definer
set search_path = ''
stable
as $$
  select case when count(*) = 8 and count(pick.hidden_grade) = 8
    then sum(pick.hidden_grade)::numeric else null end
  from private.wheel_ufc_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = p_profile_id;
$$;

create or replace function private.wheel_ufc_final_grade(p_raw_grade numeric)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case
    when p_raw_grade is null then null
    else round(greatest(0::numeric, least(100::numeric, p_raw_grade)), 1)
  end;
$$;

create or replace function private.wheel_ufc_state_json(p_challenge_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'code', challenge.code,
    'phase', match.phase,
    'turn_count', match.turn_count,
    'current_turn_profile_id', match.current_turn_profile_id,
    'pending_spin', case when match.pending_category is null then null else jsonb_build_object(
      'category', match.pending_category,
      'label', case match.pending_category
        when 'CHAMPION' then 'CHAMPION'
        when 'TOP_5' then 'TOP 5'
        when 'SIX_TO_FIFTEEN' then '6–15'
        when 'UNRANKED' then 'UNRANKED'
        when 'COUNTRY' then 'COUNTRY'
        when 'YOUNG_GUN' then 'YOUNG GUN'
        when 'VETERAN' then 'VETERAN'
      end,
      'country_code', match.pending_country_code,
      'country_name', match.pending_country_name,
      'eligible_slots', private.wheel_ufc_eligible_slots(
        challenge.id,
        match.current_turn_profile_id,
        match.pending_category,
        match.pending_country_code
      )
    ) end,
    'creator', jsonb_build_object('id', challenge.creator_id, 'display_name', creator.display_name),
    'recipient', jsonb_build_object('id', challenge.recipient_id, 'display_name', recipient.display_name),
    'creator_roster', coalesce((
      select jsonb_agg(jsonb_build_object(
        'turn_number', pick.turn_number,
        'fighter_id', pick.fighter_id,
        'display_name', pick.display_name,
        'roster_slot', pick.roster_slot,
        'ranking_label', pick.ranking_label,
        'country_code', pick.country_code,
        'country_name', pick.country_name,
        'headshot_url', pick.headshot_url,
        'revealed_grade', case
          when match.phase = 'complete' and match.forfeited_at is null then pick.hidden_grade
          else null
        end
      ) order by pick.turn_number)
      from private.wheel_ufc_picks pick
      where pick.challenge_id = challenge.id and pick.profile_id = challenge.creator_id
    ), '[]'::jsonb),
    'recipient_roster', coalesce((
      select jsonb_agg(jsonb_build_object(
        'turn_number', pick.turn_number,
        'fighter_id', pick.fighter_id,
        'display_name', pick.display_name,
        'roster_slot', pick.roster_slot,
        'ranking_label', pick.ranking_label,
        'country_code', pick.country_code,
        'country_name', pick.country_name,
        'headshot_url', pick.headshot_url,
        'revealed_grade', case
          when match.phase = 'complete' and match.forfeited_at is null then pick.hidden_grade
          else null
        end
      ) order by pick.turn_number)
      from private.wheel_ufc_picks pick
      where pick.challenge_id = challenge.id and pick.profile_id = challenge.recipient_id
    ), '[]'::jsonb),
    'result', case
      when match.phase = 'complete'
        and match.forfeited_at is null
        and coalesce(challenge.creator_result ? 'finalGrade', false)
        and coalesce(challenge.responder_result ? 'finalGrade', false)
        and private.wheel_ufc_grade_total(challenge.id, challenge.creator_id) is not null
        and private.wheel_ufc_grade_total(challenge.id, challenge.recipient_id) is not null
      then jsonb_build_object(
        'creator_final_grade', (challenge.creator_result ->> 'finalGrade')::numeric,
        'recipient_final_grade', (challenge.responder_result ->> 'finalGrade')::numeric,
        'winner_profile_id', case
          when private.wheel_ufc_grade_total(challenge.id, challenge.creator_id)
            > private.wheel_ufc_grade_total(challenge.id, challenge.recipient_id) then challenge.creator_id
          when private.wheel_ufc_grade_total(challenge.id, challenge.recipient_id)
            > private.wheel_ufc_grade_total(challenge.id, challenge.creator_id) then challenge.recipient_id
          else null
        end,
        'is_tie', private.wheel_ufc_grade_total(challenge.id, challenge.creator_id)
          = private.wheel_ufc_grade_total(challenge.id, challenge.recipient_id)
      )
      else null
    end,
    'opened_at', challenge.opened_at,
    'completed_at', challenge.completed_at,
    'forfeited_by_profile_id', match.forfeited_by_profile_id,
    'forfeited_at', match.forfeited_at
  )
  from public.play_challenges challenge
  join private.wheel_ufc_matches match on match.challenge_id = challenge.id
  join public.profiles creator on creator.id = challenge.creator_id
  join public.profiles recipient on recipient.id = challenge.recipient_id
  where challenge.id = p_challenge_id;
$$;

create or replace function private.get_my_wheel_ufc_match(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  select challenge.id into v_challenge_id
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-ufc'
    and (
      (challenge.creator_id = v_user_id and challenge.creator_hidden_at is null)
      or (challenge.recipient_id = v_user_id and challenge.recipient_hidden_at is null)
    );
  if v_challenge_id is null then raise exception 'Wheel of UFC match not found'; end if;
  return private.wheel_ufc_state_json(v_challenge_id);
end;
$$;

create or replace function private.create_wheel_ufc_challenge(p_recipient_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_creator_id uuid := auth.uid();
  v_creator_name text;
  v_code text;
  v_attempt integer := 0;
  v_challenge_id uuid;
  v_created_at timestamptz;
begin
  if v_creator_id is null then raise exception 'sign in required'; end if;
  if p_recipient_id is null or p_recipient_id = v_creator_id then raise exception 'choose another profile'; end if;
  if not exists (select 1 from public.profiles where id = p_recipient_id) then raise exception 'profile not found'; end if;

  select profile.display_name into v_creator_name
  from public.profiles profile where profile.id = v_creator_id;

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.play_challenges (
        code, game_id, game_version, game_title, summary,
        creator_id, recipient_id, play_url, setup, creator_result
      ) values (
        v_code, 'wheel-ufc', 'ufc-wheel-v1', 'Wheel of UFC',
        'Current UFC · 8 men''s divisions · weighted category wheel',
        v_creator_id, p_recipient_id, '/play/wheel?match=' || v_code,
        jsonb_build_object(
          'currentOnly', true,
          'rosterSlots', jsonb_build_array(
            'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight',
            'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight'
          ),
          'categoryWeights', jsonb_build_object(
            'CHAMPION', 5, 'TOP_5', 10, 'SIX_TO_FIFTEEN', 15, 'UNRANKED', 20,
            'COUNTRY', 20, 'YOUNG_GUN', 15, 'VETERAN', 15
          ),
          'rankingsAsOf', '2026-10-04',
          'rankingsSource', 'Meta UFC Rankings',
          'youngGunRule', 'under-25',
          'veteranRule', '10-plus-ufc-fights'
        ),
        jsonb_build_object('status', 'in-progress')
      )
      returning id, created_at into v_challenge_id, v_created_at;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  insert into private.wheel_ufc_matches (challenge_id) values (v_challenge_id);

  perform private.publish_notification_to_profile(
    p_recipient_id,
    'wheel-ufc:received:' || v_code || ':' || p_recipient_id::text,
    'play-challenges:received',
    'game_challenge_received',
    'You were challenged',
    v_creator_name || ' challenged you to Wheel of UFC.',
    '/play/wheel?match=' || v_code,
    'PLAY',
    v_created_at
  );
  return v_code;
end;
$$;

create or replace function private.open_wheel_ufc_challenge(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_ufc_matches%rowtype;
  v_recipient_name text;
  v_first_turn uuid;
  v_was_open boolean;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  select challenge.* into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-ufc'
    and challenge.recipient_id = v_user_id
    and challenge.completed_at is null
    and challenge.declined_at is null
    and challenge.recipient_hidden_at is null
  for update;
  if not found then return false; end if;

  select match.* into v_match
  from private.wheel_ufc_matches match
  where match.challenge_id = v_challenge.id
  for update;
  if not found then raise exception 'Wheel of UFC state not found'; end if;

  v_was_open := v_challenge.opened_at is not null;
  if not v_was_open then
    v_first_turn := case when random() < 0.5 then v_challenge.creator_id else v_challenge.recipient_id end;
    update public.play_challenges challenge
    set opened_at = now()
    where challenge.id = v_challenge.id
    returning challenge.* into v_challenge;

    update private.wheel_ufc_matches match
    set phase = 'spin', current_turn_profile_id = v_first_turn, updated_at = v_challenge.opened_at
    where match.challenge_id = v_challenge.id;

    select profile.display_name into v_recipient_name
    from public.profiles profile where profile.id = v_challenge.recipient_id;

    if v_first_turn = v_challenge.creator_id then
      perform private.publish_notification_to_profile(
        v_challenge.creator_id,
        'wheel-ufc:turn:' || v_challenge.code || ':1:' || v_challenge.creator_id::text,
        'play-challenges:received',
        'game_challenge_received',
        'Your turn in Wheel of UFC',
        v_recipient_name || ' accepted. You have the first spin.',
        '/play/wheel?match=' || v_challenge.code,
        'TAKE YOUR TURN',
        v_challenge.opened_at
      );
    else
      perform private.publish_notification_to_profile(
        v_challenge.creator_id,
        'wheel-ufc:accepted:' || v_challenge.code || ':' || v_challenge.creator_id::text,
        'play-challenges:accepted',
        'game_challenge_accepted',
        'Your challenge was accepted',
        v_recipient_name || ' accepted your Wheel of UFC challenge and has the first spin.',
        '/play/wheel?match=' || v_challenge.code,
        'OPEN MATCH',
        v_challenge.opened_at
      );
    end if;
  end if;
  return true;
end;
$$;

create or replace function private.spin_wheel_ufc(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_ufc_matches%rowtype;
  v_category text;
  v_country_code text;
  v_country_name text;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  select challenge.* into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-ufc'
    and (challenge.creator_id = v_user_id or challenge.recipient_id = v_user_id);
  if not found then raise exception 'Wheel of UFC match not found'; end if;

  select match.* into v_match
  from private.wheel_ufc_matches match
  where match.challenge_id = v_challenge.id
  for update;

  if v_challenge.declined_at is not null or v_challenge.completed_at is not null then
    raise exception 'This Wheel of UFC match is closed';
  end if;
  if v_challenge.opened_at is null then raise exception 'The challenge must be accepted before the first spin'; end if;
  if v_match.current_turn_profile_id <> v_user_id or v_match.phase <> 'spin' then raise exception 'It is not your spin'; end if;

  with categories(category, weight) as (
    values
      ('CHAMPION', 5), ('TOP_5', 10), ('SIX_TO_FIFTEEN', 15), ('UNRANKED', 20),
      ('COUNTRY', 20), ('YOUNG_GUN', 15), ('VETERAN', 15)
  ), viable as (
    select category, weight
    from categories
    where cardinality(private.wheel_ufc_eligible_slots(v_challenge.id, v_user_id, category, null)) > 0
  ), tickets as (
    select viable.category
    from viable
    cross join lateral generate_series(1, viable.weight)
  )
  select tickets.category into v_category
  from tickets
  order by random()
  limit 1;

  if v_category is null then raise exception 'No eligible UFC category remains for this roster'; end if;

  if v_category = 'COUNTRY' then
    with slots(slot) as (
      values ('Flyweight'), ('Bantamweight'), ('Featherweight'), ('Lightweight'),
             ('Welterweight'), ('Middleweight'), ('Light Heavyweight'), ('Heavyweight')
    ), open_slots as (
      select slots.slot
      from slots
      where not exists (
        select 1 from private.wheel_ufc_picks pick
        where pick.challenge_id = v_challenge.id
          and pick.profile_id = v_user_id
          and pick.roster_slot = slots.slot
      )
    ), country_counts as (
      select fighter.country_code, fighter.country_name, count(distinct fighter.division)::integer as slot_count
      from private.wheel_ufc_fighters fighter
      join open_slots on open_slots.slot = fighter.division
      where fighter.active
        and fighter.country_code is not null
        and not exists (
          select 1 from private.wheel_ufc_picks used
          where used.challenge_id = v_challenge.id
            and used.fighter_id = fighter.fighter_id
        )
      group by fighter.country_code, fighter.country_name
    ), tickets as (
      select country_counts.country_code, country_counts.country_name
      from country_counts
      cross join lateral generate_series(1, greatest(1, country_counts.slot_count))
    )
    select tickets.country_code, tickets.country_name
      into v_country_code, v_country_name
    from tickets
    order by random()
    limit 1;

    if v_country_code is null then raise exception 'No eligible country remains for this roster'; end if;
  end if;

  update private.wheel_ufc_matches match
  set phase = 'pick',
      pending_category = v_category,
      pending_country_code = v_country_code,
      pending_country_name = v_country_name,
      updated_at = now()
  where match.challenge_id = v_challenge.id;

  return private.wheel_ufc_state_json(v_challenge.id);
end;
$$;

create or replace function private.get_wheel_ufc_candidates(
  p_code text,
  p_roster_slot text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_ufc_matches%rowtype;
  v_slot text := trim(coalesce(p_roster_slot, ''));
  v_rows jsonb;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  select challenge.* into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-ufc'
    and (challenge.creator_id = v_user_id or challenge.recipient_id = v_user_id);
  if not found then raise exception 'Wheel of UFC match not found'; end if;

  select match.* into v_match
  from private.wheel_ufc_matches match
  where match.challenge_id = v_challenge.id;

  if v_match.current_turn_profile_id <> v_user_id or v_match.phase <> 'pick' or v_match.pending_category is null then
    raise exception 'It is not your pick';
  end if;
  if not v_slot = any(private.wheel_ufc_eligible_slots(
    v_challenge.id, v_user_id, v_match.pending_category, v_match.pending_country_code
  )) then raise exception 'That weight class is not available for this spin'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'fighter_id', candidate.fighter_id,
    'display_name', candidate.display_name,
    'division', candidate.division,
    'ranking_label', case
      when candidate.is_champion then 'CHAMPION'
      when candidate.ranking is not null then '#' || candidate.ranking::text
      else 'UNRANKED'
    end,
    'country_code', candidate.country_code,
    'country_name', candidate.country_name,
    'headshot_url', candidate.headshot_url
  ) order by candidate.is_champion desc, candidate.ranking asc nulls last, candidate.display_name), '[]'::jsonb)
  into v_rows
  from (
    select fighter.*
    from private.wheel_ufc_fighters fighter
    where fighter.active
      and fighter.division = v_slot
      and private.wheel_ufc_category_ok(
        v_match.pending_category,
        v_match.pending_country_code,
        fighter.country_code,
        fighter.is_champion,
        fighter.ranking,
        fighter.young_gun,
        fighter.veteran_10_plus
      )
      and not exists (
        select 1 from private.wheel_ufc_picks used
        where used.challenge_id = v_challenge.id
          and used.fighter_id = fighter.fighter_id
      )
    order by fighter.is_champion desc, fighter.ranking asc nulls last, fighter.display_name
    limit 6
  ) candidate;

  return v_rows;
end;
$$;

create or replace function private.pick_wheel_ufc(
  p_code text,
  p_fighter_id text,
  p_roster_slot text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_ufc_matches%rowtype;
  v_fighter private.wheel_ufc_fighters%rowtype;
  v_slot text := trim(coalesce(p_roster_slot, ''));
  v_next_turn_count integer;
  v_next_profile uuid;
  v_actor_name text;
  v_creator_roster jsonb;
  v_recipient_roster jsonb;
  v_creator_raw numeric;
  v_recipient_raw numeric;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  select challenge.* into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-ufc'
    and (challenge.creator_id = v_user_id or challenge.recipient_id = v_user_id);
  if not found then raise exception 'Wheel of UFC match not found'; end if;

  select match.* into v_match
  from private.wheel_ufc_matches match
  where match.challenge_id = v_challenge.id
  for update;

  if v_challenge.declined_at is not null or v_challenge.completed_at is not null then
    raise exception 'This Wheel of UFC match is closed';
  end if;
  if v_match.current_turn_profile_id <> v_user_id or v_match.phase <> 'pick' or v_match.pending_category is null then
    raise exception 'It is not your pick';
  end if;
  if not v_slot = any(private.wheel_ufc_eligible_slots(
    v_challenge.id, v_user_id, v_match.pending_category, v_match.pending_country_code
  )) then raise exception 'That weight class is not available for this spin'; end if;

  select fighter.* into v_fighter
  from private.wheel_ufc_fighters fighter
  where fighter.fighter_id = trim(p_fighter_id)
    and fighter.division = v_slot
    and fighter.active
    and private.wheel_ufc_category_ok(
      v_match.pending_category,
      v_match.pending_country_code,
      fighter.country_code,
      fighter.is_champion,
      fighter.ranking,
      fighter.young_gun,
      fighter.veteran_10_plus
    )
    and not exists (
      select 1 from private.wheel_ufc_picks used
      where used.challenge_id = v_challenge.id
        and used.fighter_id = fighter.fighter_id
    );
  if not found then raise exception 'That fighter is not eligible for this spin'; end if;

  v_next_turn_count := v_match.turn_count + 1;

  insert into private.wheel_ufc_picks (
    challenge_id, profile_id, turn_number, fighter_id, display_name,
    roster_slot, ranking_label, country_code, country_name, headshot_url,
    hidden_grade, hidden_grade_version, hidden_grade_effective_date
  ) values (
    v_challenge.id, v_user_id, v_next_turn_count, v_fighter.fighter_id, v_fighter.display_name,
    v_slot,
    case when v_fighter.is_champion then 'CHAMPION'
      when v_fighter.ranking is not null then '#' || v_fighter.ranking::text
      else 'UNRANKED' end,
    v_fighter.country_code, v_fighter.country_name, v_fighter.headshot_url,
    v_fighter.hidden_grade, v_fighter.grade_version, v_fighter.rankings_as_of
  );

  select profile.display_name into v_actor_name
  from public.profiles profile where profile.id = v_user_id;

  if v_next_turn_count = 16 then
    update private.wheel_ufc_matches match
    set turn_count = 16,
        phase = 'complete',
        current_turn_profile_id = null,
        pending_category = null,
        pending_country_code = null,
        pending_country_name = null,
        completed_at = now(),
        updated_at = now()
    where match.challenge_id = v_challenge.id;

    select coalesce(jsonb_agg(jsonb_build_object(
      'turnNumber', pick.turn_number,
      'fighterId', pick.fighter_id,
      'displayName', pick.display_name,
      'rosterSlot', pick.roster_slot,
      'rankingLabel', pick.ranking_label,
      'countryName', pick.country_name
    ) order by pick.turn_number), '[]'::jsonb)
    into v_creator_roster
    from private.wheel_ufc_picks pick
    where pick.challenge_id = v_challenge.id and pick.profile_id = v_challenge.creator_id;

    select coalesce(jsonb_agg(jsonb_build_object(
      'turnNumber', pick.turn_number,
      'fighterId', pick.fighter_id,
      'displayName', pick.display_name,
      'rosterSlot', pick.roster_slot,
      'rankingLabel', pick.ranking_label,
      'countryName', pick.country_name
    ) order by pick.turn_number), '[]'::jsonb)
    into v_recipient_roster
    from private.wheel_ufc_picks pick
    where pick.challenge_id = v_challenge.id and pick.profile_id = v_challenge.recipient_id;

    v_creator_raw := private.wheel_ufc_raw_grade(v_challenge.id, v_challenge.creator_id);
    v_recipient_raw := private.wheel_ufc_raw_grade(v_challenge.id, v_challenge.recipient_id);
    if v_creator_raw is null or v_recipient_raw is null then
      raise exception 'Wheel of UFC grading could not be completed';
    end if;

    update public.play_challenges challenge
    set creator_result = jsonb_build_object(
          'complete', true,
          'roster', v_creator_roster,
          'finalGrade', private.wheel_ufc_final_grade(v_creator_raw),
          'wheelGradeRuntimeVersion', 'ufc-wheel-current-v2'
        ),
        responder_result = jsonb_build_object(
          'complete', true,
          'roster', v_recipient_roster,
          'finalGrade', private.wheel_ufc_final_grade(v_recipient_raw),
          'wheelGradeRuntimeVersion', 'ufc-wheel-current-v2'
        ),
        completed_at = now(),
        opened_at = coalesce(challenge.opened_at, now())
    where challenge.id = v_challenge.id;

    v_next_profile := case when v_user_id = v_challenge.creator_id
      then v_challenge.recipient_id else v_challenge.creator_id end;

    perform private.publish_notification_to_profile(
      v_next_profile,
      'wheel-ufc:complete:' || v_challenge.code || ':' || v_next_profile::text,
      'play-challenges:results-ready',
      'game_challenge_result_ready',
      'Wheel of UFC is complete',
      v_actor_name || ' made the final pick. Both UFC rosters are locked.',
      '/play/wheel?match=' || v_challenge.code,
      'VIEW ROSTERS',
      now()
    );
  else
    v_next_profile := case when v_user_id = v_challenge.creator_id
      then v_challenge.recipient_id else v_challenge.creator_id end;

    update private.wheel_ufc_matches match
    set turn_count = v_next_turn_count,
        phase = 'spin',
        current_turn_profile_id = v_next_profile,
        pending_category = null,
        pending_country_code = null,
        pending_country_name = null,
        updated_at = now()
    where match.challenge_id = v_challenge.id;

    perform private.publish_notification_to_profile(
      v_next_profile,
      'wheel-ufc:turn:' || v_challenge.code || ':' || v_next_turn_count::text || ':' || v_next_profile::text,
      'play-challenges:received',
      'game_challenge_received',
      'Your turn in Wheel of UFC',
      v_actor_name || ' made a pick. Spin for your next category.',
      '/play/wheel?match=' || v_challenge.code,
      'TAKE YOUR TURN',
      now()
    );
  end if;

  return private.wheel_ufc_state_json(v_challenge.id);
end;
$$;

create or replace function private.forfeit_wheel_ufc(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_ufc_matches%rowtype;
  v_opponent_id uuid;
  v_actor_name text;
  v_now timestamptz := now();
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  select challenge.* into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-ufc'
    and (challenge.creator_id = v_user_id or challenge.recipient_id = v_user_id)
  for update;
  if not found then raise exception 'Wheel of UFC match not found'; end if;

  select match.* into v_match
  from private.wheel_ufc_matches match
  where match.challenge_id = v_challenge.id
  for update;
  if not found then raise exception 'Wheel of UFC state not found'; end if;
  if v_challenge.opened_at is null then raise exception 'match has not started'; end if;
  if v_challenge.declined_at is not null or v_challenge.completed_at is not null or v_match.phase = 'complete' then
    raise exception 'match has already ended';
  end if;

  v_opponent_id := case when v_user_id = v_challenge.creator_id
    then v_challenge.recipient_id else v_challenge.creator_id end;
  select profile.display_name into v_actor_name
  from public.profiles profile where profile.id = v_user_id;

  update private.wheel_ufc_matches match
  set phase = 'complete',
      current_turn_profile_id = null,
      pending_category = null,
      pending_country_code = null,
      pending_country_name = null,
      completed_at = v_now,
      forfeited_by_profile_id = v_user_id,
      forfeited_at = v_now,
      updated_at = v_now
  where match.challenge_id = v_challenge.id;

  update public.play_challenges challenge
  set creator_result = jsonb_build_object(
        'complete', true,
        'forfeited', v_user_id = v_challenge.creator_id,
        'forfeitedByProfileId', v_user_id
      ),
      responder_result = jsonb_build_object(
        'complete', true,
        'forfeited', v_user_id = v_challenge.recipient_id,
        'forfeitedByProfileId', v_user_id
      ),
      completed_at = v_now,
      opened_at = coalesce(challenge.opened_at, v_now)
  where challenge.id = v_challenge.id;

  perform private.publish_notification_to_profile(
    v_opponent_id,
    'wheel-ufc:forfeit:' || v_challenge.code || ':' || v_opponent_id::text,
    'play-challenges:results-ready',
    'game_challenge_result_ready',
    'Wheel of UFC ended',
    v_actor_name || ' forfeited. You win the matchup.',
    '/play/wheel?match=' || v_challenge.code,
    'VIEW MATCHUP',
    v_now
  );

  return private.wheel_ufc_state_json(v_challenge.id);
end;
$$;

create or replace function public.get_my_wheel_ufc_match(p_code text)
returns jsonb language sql security invoker set search_path = '' stable
as $$ select private.get_my_wheel_ufc_match(p_code); $$;

create or replace function public.create_wheel_ufc_challenge(p_recipient_id uuid)
returns text language sql security invoker set search_path = ''
as $$ select private.create_wheel_ufc_challenge(p_recipient_id); $$;

create or replace function public.open_wheel_ufc_challenge(p_code text)
returns boolean language sql security invoker set search_path = ''
as $$ select private.open_wheel_ufc_challenge(p_code); $$;

create or replace function public.spin_wheel_ufc(p_code text)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.spin_wheel_ufc(p_code); $$;

create or replace function public.get_wheel_ufc_candidates(p_code text, p_roster_slot text)
returns jsonb language sql security invoker set search_path = '' stable
as $$ select private.get_wheel_ufc_candidates(p_code, p_roster_slot); $$;

create or replace function public.pick_wheel_ufc(p_code text, p_fighter_id text, p_roster_slot text)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.pick_wheel_ufc(p_code, p_fighter_id, p_roster_slot); $$;

create or replace function public.forfeit_wheel_ufc(p_code text)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.forfeit_wheel_ufc(p_code); $$;

grant usage on schema private to authenticated;

revoke all on function private.wheel_ufc_category_ok(text,text,text,boolean,integer,boolean,boolean) from public, anon, authenticated;
revoke all on function private.wheel_ufc_eligible_slots(uuid,uuid,text,text) from public, anon, authenticated;
revoke all on function private.wheel_ufc_raw_grade(uuid,uuid) from public, anon, authenticated;
revoke all on function private.wheel_ufc_grade_total(uuid,uuid) from public, anon, authenticated;
revoke all on function private.wheel_ufc_final_grade(numeric) from public, anon, authenticated;
revoke all on function private.wheel_ufc_state_json(uuid) from public, anon, authenticated;
revoke all on function private.get_my_wheel_ufc_match(text) from public, anon;
revoke all on function private.create_wheel_ufc_challenge(uuid) from public, anon;
revoke all on function private.open_wheel_ufc_challenge(text) from public, anon;
revoke all on function private.spin_wheel_ufc(text) from public, anon;
revoke all on function private.get_wheel_ufc_candidates(text,text) from public, anon;
revoke all on function private.pick_wheel_ufc(text,text,text) from public, anon;
revoke all on function private.forfeit_wheel_ufc(text) from public, anon;

grant execute on function private.get_my_wheel_ufc_match(text) to authenticated;
grant execute on function private.create_wheel_ufc_challenge(uuid) to authenticated;
grant execute on function private.open_wheel_ufc_challenge(text) to authenticated;
grant execute on function private.spin_wheel_ufc(text) to authenticated;
grant execute on function private.get_wheel_ufc_candidates(text,text) to authenticated;
grant execute on function private.pick_wheel_ufc(text,text,text) to authenticated;
grant execute on function private.forfeit_wheel_ufc(text) to authenticated;

revoke all on function public.get_my_wheel_ufc_match(text) from public, anon;
revoke all on function public.create_wheel_ufc_challenge(uuid) from public, anon;
revoke all on function public.open_wheel_ufc_challenge(text) from public, anon;
revoke all on function public.spin_wheel_ufc(text) from public, anon;
revoke all on function public.get_wheel_ufc_candidates(text,text) from public, anon;
revoke all on function public.pick_wheel_ufc(text,text,text) from public, anon;
revoke all on function public.forfeit_wheel_ufc(text) from public, anon;

grant execute on function public.get_my_wheel_ufc_match(text) to authenticated;
grant execute on function public.create_wheel_ufc_challenge(uuid) to authenticated;
grant execute on function public.open_wheel_ufc_challenge(text) to authenticated;
grant execute on function public.spin_wheel_ufc(text) to authenticated;
grant execute on function public.get_wheel_ufc_candidates(text,text) to authenticated;
grant execute on function public.pick_wheel_ufc(text,text,text) to authenticated;
grant execute on function public.forfeit_wheel_ufc(text) to authenticated;

comment on table private.wheel_ufc_fighters is
  'Server-only current UFC Wheel authority. Grades remain hidden during play and reveal only on naturally completed result state.';
comment on function public.spin_wheel_ufc(text) is
  'Weighted Wheel of UFC spin: Champion 5, Top 5 10, 6-15 15, Unranked 20, Country 20, Young Gun 15, Veteran 15. Categories are renormalized to viable remaining roster slots.';
comment on function public.get_wheel_ufc_candidates(text,text) is
  'Returns only candidate identity/ranking/country fields for the active player and selected open weight class; grades never leak through candidate RPCs.';
comment on function public.pick_wheel_ufc(text,text,text) is
  'Locks one server-authorized current fighter into one open men''s UFC weight-class slot and advances the turn.';
