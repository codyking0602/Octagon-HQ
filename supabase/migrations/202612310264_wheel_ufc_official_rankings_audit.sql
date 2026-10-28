-- Wheel of UFC official ranking authority correction.
-- The launch snapshot used the separate Meta UFC Rankings table. The game should use the
-- standard "All Rankings" table shown first on UFC.com/rankings for Champion / Top 5 /
-- 6-15 / Unranked eligibility. Audited against UFC.com on 2026-10-04; the standard
-- rankings table was last updated 2026-09-29.
-- This changes ranking eligibility only. Hidden HQ grades are intentionally untouched.

alter table private.wheel_ufc_fighters
  add column if not exists ranking_source text not null default 'ufc-all-rankings';

create temporary table wheel_ufc_official_rankings (
  division text not null,
  fighter_id text not null,
  ranking integer,
  is_champion boolean not null,
  primary key (division, fighter_id),
  unique (division, ranking),
  check (ranking is null or ranking between 1 and 15),
  check ((is_champion and ranking is null) or not is_champion)
) on commit drop;

insert into wheel_ufc_official_rankings (division, fighter_id, ranking, is_champion) values
  ('Flyweight','joshua-van',null,true),
  ('Flyweight','alexandre-pantoja',1,false),
  ('Flyweight','manel-kape',2,false),
  ('Flyweight','brandon-royval',3,false),
  ('Flyweight','tatsuro-taira',4,false),
  ('Flyweight','kyoji-horiguchi',5,false),
  ('Flyweight','loneer-kavanagh',6,false),
  ('Flyweight','asu-almabayev',7,false),
  ('Flyweight','brandon-moreno',8,false),
  ('Flyweight','amir-albazi',9,false),
  ('Flyweight','ramazan-temirov',10,false),
  ('Flyweight','tim-elliott',11,false),
  ('Flyweight','steve-erceg',12,false),
  ('Flyweight','sumudaerji',13,false),
  ('Flyweight','tagir-ulanbekov',14,false),
  ('Flyweight','alex-perez',15,false),

  ('Bantamweight','petr-yan',null,true),
  ('Bantamweight','merab-dvalishvili',1,false),
  ('Bantamweight','sean-omalley',2,false),
  ('Bantamweight','song-yadong',3,false),
  ('Bantamweight','umar-nurmagomedov',4,false),
  ('Bantamweight','mario-bautista',5,false),
  ('Bantamweight','cory-sandhagen',6,false),
  ('Bantamweight','aiemann-zahabi',7,false),
  ('Bantamweight','david-martinez',8,false),
  ('Bantamweight','deiveson-figueiredo',9,false),
  ('Bantamweight','marlon-vera',10,false),
  ('Bantamweight','raul-rosas-jr',11,false),
  ('Bantamweight','payton-talbott',12,false),
  ('Bantamweight','farid-basharat',13,false),
  ('Bantamweight','raoni-barcelos',14,false),
  ('Bantamweight','marcus-mcghee',15,false),

  ('Featherweight','alexander-volkanovski',null,true),
  ('Featherweight','movsar-evloev',1,false),
  ('Featherweight','diego-lopes',2,false),
  ('Featherweight','lerone-murphy',3,false),
  ('Featherweight','aljamain-sterling',4,false),
  ('Featherweight','jean-silva',5,false),
  ('Featherweight','yair-rodriguez',6,false),
  ('Featherweight','arnold-allen',7,false),
  ('Featherweight','youssef-zalal',8,false),
  ('Featherweight','kevin-vallejos',9,false),
  ('Featherweight','steve-garcia',10,false),
  ('Featherweight','aaron-pico',11,false),
  ('Featherweight','melquizael-costa',12,false),
  ('Featherweight','brian-ortega',13,false),
  ('Featherweight','patricio-pitbull',14,false),
  ('Featherweight','david-onama',15,false),

  ('Lightweight','justin-gaethje',null,true),
  ('Lightweight','ilia-topuria',1,false),
  ('Lightweight','arman-tsarukyan',2,false),
  ('Lightweight','charles-oliveira',3,false),
  ('Lightweight','max-holloway',4,false),
  ('Lightweight','paddy-pimblett',5,false),
  ('Lightweight','benoit-saint-denis',6,false),
  ('Lightweight','quillan-salkilld',7,false),
  ('Lightweight','mauricio-ruffy',8,false),
  ('Lightweight','salahdine-parnasse',9,false),
  ('Lightweight','mateusz-gamrot',10,false),
  ('Lightweight','rafael-fiziev',11,false),
  ('Lightweight','renato-moicano',12,false),
  ('Lightweight','dan-hooker',13,false),
  ('Lightweight','tom-nolan',14,false),
  ('Lightweight','beneil-dariush',15,false),

  ('Welterweight','islam-makhachev',null,true),
  ('Welterweight','ian-machado-garry',1,false),
  ('Welterweight','carlos-prates',2,false),
  ('Welterweight','michael-morales',3,false),
  ('Welterweight','jack-della-maddalena',4,false),
  ('Welterweight','gabriel-bonfim',5,false),
  ('Welterweight','sean-brady',6,false),
  ('Welterweight','belal-muhammad',7,false),
  ('Welterweight','leon-edwards',8,false),
  ('Welterweight','kamaru-usman',9,false),
  ('Welterweight','joaquin-buckley',10,false),
  ('Welterweight','yaroslav-amosov',11,false),
  ('Welterweight','uros-medic',12,false),
  ('Welterweight','mike-malott',13,false),
  ('Welterweight','daniel-rodriguez',14,false),
  ('Welterweight','neil-magny',15,false),

  ('Middleweight','sean-strickland',null,true),
  ('Middleweight','khamzat-chimaev',1,false),
  ('Middleweight','dricus-du-plessis',2,false),
  ('Middleweight','nassourdine-imavov',3,false),
  ('Middleweight','brendan-allen',4,false),
  ('Middleweight','caio-borralho',5,false),
  ('Middleweight','joe-pyfer',6,false),
  ('Middleweight','gregory-rodrigues',7,false),
  ('Middleweight','anthony-hernandez',8,false),
  ('Middleweight','israel-adesanya',9,false),
  ('Middleweight','christian-leroy-duncan',10,false),
  ('Middleweight','jared-cannonier',11,false),
  ('Middleweight','abus-magomedov',12,false),
  ('Middleweight','ikram-aliskerov',13,false),
  ('Middleweight','bo-nickal',14,false),
  ('Middleweight','shara-magomedov',15,false),

  ('Light Heavyweight','carlos-ulberg',null,true),
  ('Light Heavyweight','magomed-ankalaev',1,false),
  ('Light Heavyweight','jiri-prochazka',2,false),
  ('Light Heavyweight','alex-pereira',3,false),
  ('Light Heavyweight','khalil-rountree-jr',4,false),
  ('Light Heavyweight','navajo-stirling',5,false),
  ('Light Heavyweight','paulo-costa',6,false),
  ('Light Heavyweight','jamahal-hill',7,false),
  ('Light Heavyweight','azamat-murzakanov',8,false),
  ('Light Heavyweight','jan-blachowicz',9,false),
  ('Light Heavyweight','dominick-reyes',10,false),
  ('Light Heavyweight','bogdan-guskov',11,false),
  ('Light Heavyweight','robert-whittaker',12,false),
  ('Light Heavyweight','johnny-walker',13,false),
  ('Light Heavyweight','alonzo-menifield',14,false),
  ('Light Heavyweight','nikita-krylov',15,false),

  ('Heavyweight','ciryl-gane',null,true),
  ('Heavyweight','tom-aspinall',1,false),
  ('Heavyweight','alexander-volkov',2,false),
  ('Heavyweight','sergei-pavlovich',3,false),
  ('Heavyweight','josh-hokit',4,false),
  ('Heavyweight','curtis-blaydes',5,false),
  ('Heavyweight','waldo-cortes-acosta',6,false),
  ('Heavyweight','rizvan-kuniev',7,false),
  ('Heavyweight','vitor-petrino',8,false),
  ('Heavyweight','serghei-spivac',9,false),
  ('Heavyweight','ante-delija',10,false),
  ('Heavyweight','valter-walker',11,false),
  ('Heavyweight','tyrell-fortune',12,false),
  ('Heavyweight','derrick-lewis',13,false),
  ('Heavyweight','mario-pinto',14,false),
  ('Heavyweight','aleksandar-rakic',15,false);

do $wheel_ufc_official_preflight$
declare
  v_expected integer;
  v_missing integer;
begin
  select count(*) into v_expected from wheel_ufc_official_rankings;
  if v_expected <> 128 then
    raise exception 'Expected 128 official Wheel of UFC ranking rows, found %', v_expected;
  end if;

  select count(*) into v_missing
  from wheel_ufc_official_rankings official
  left join private.wheel_ufc_fighters fighter
    on fighter.division = official.division
   and fighter.fighter_id = official.fighter_id
   and fighter.active
  where fighter.fighter_id is null;

  if v_missing <> 0 then
    raise exception 'Official Wheel of UFC ranking audit references % fighters missing from the active pool', v_missing;
  end if;
end;
$wheel_ufc_official_preflight$;

-- Clear the Meta ranking snapshot first so fighters no longer present in the standard
-- UFC Top 15 become correctly unranked.
update private.wheel_ufc_fighters
set ranking = null,
    is_champion = false,
    rankings_as_of = date '2026-09-29',
    ranking_source = 'ufc-all-rankings'
where active;

update private.wheel_ufc_fighters fighter
set ranking = official.ranking,
    is_champion = official.is_champion,
    rankings_as_of = date '2026-09-29',
    ranking_source = 'ufc-all-rankings'
from wheel_ufc_official_rankings official
where fighter.division = official.division
  and fighter.fighter_id = official.fighter_id
  and fighter.active;

-- Existing result screens should display the corrected official ranking labels too.
-- The recorded spin_category remains untouched as historical match data.
update private.wheel_ufc_picks pick
set ranking_label = case
  when fighter.is_champion then 'CHAMPION'
  when fighter.ranking is not null then '#' || fighter.ranking::text
  else 'UNRANKED'
end
from private.wheel_ufc_fighters fighter
where fighter.active
  and fighter.division = pick.roster_slot
  and fighter.fighter_id = pick.fighter_id;

do $wheel_ufc_official_postflight$
declare
  v_bad_divisions integer;
  v_bad_source integer;
  v_talbott integer;
begin
  with division_audit as (
    select
      division,
      count(*) filter (where active and is_champion) as champions,
      count(*) filter (where active and ranking is not null) as ranked,
      count(distinct ranking) filter (where active and ranking is not null) as distinct_ranked,
      min(ranking) filter (where active and ranking is not null) as min_rank,
      max(ranking) filter (where active and ranking is not null) as max_rank
    from private.wheel_ufc_fighters
    where active
    group by division
  )
  select count(*) into v_bad_divisions
  from division_audit
  where champions <> 1
     or ranked <> 15
     or distinct_ranked <> 15
     or min_rank <> 1
     or max_rank <> 15;

  if v_bad_divisions <> 0 then
    raise exception 'Wheel of UFC official ranking audit left % invalid divisions', v_bad_divisions;
  end if;

  select count(*) into v_bad_source
  from private.wheel_ufc_fighters
  where active
    and (ranking_source <> 'ufc-all-rankings' or rankings_as_of <> date '2026-09-29');

  if v_bad_source <> 0 then
    raise exception 'Wheel of UFC official ranking source metadata mismatch on % active rows', v_bad_source;
  end if;

  select ranking into v_talbott
  from private.wheel_ufc_fighters
  where active
    and division = 'Bantamweight'
    and fighter_id = 'payton-talbott';

  if v_talbott is distinct from 12 then
    raise exception 'Payton Talbott official ranking expected #12, found %', v_talbott;
  end if;
end;
$wheel_ufc_official_postflight$;

comment on column private.wheel_ufc_fighters.ranking_source is
  'Ranking authority used for Wheel of UFC category eligibility. Current authority is the standard All Rankings table on UFC.com/rankings, not the separate Meta rankings table.';
