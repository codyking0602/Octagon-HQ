-- Oct 14 Wednesday monitoring: standard UFC.com "All Rankings", updated October 10.
-- NEVER use the separate "All Meta Rankings" list for Wheel categories.
-- Ranking is eligibility/display only; retain the independently curated hidden HQ grades.
-- Source: https://www.ufc.com/rankings
-- Historical spin_category, fighter grade snapshots and past migrations are untouched.

create temporary table wheel_ufc_all_rankings_oct10 (
  division text not null,
  fighter_id text not null,
  ranking integer,
  is_champion boolean not null,
  primary key (division, fighter_id),
  unique (division, ranking),
  check (ranking between 1 and 15 or ranking is null),
  check (not is_champion or ranking is null)
) on commit drop;

insert into wheel_ufc_all_rankings_oct10 (division, fighter_id, ranking, is_champion)
values
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
  ('Bantamweight','payton-talbott',7,false),
  ('Bantamweight','aiemann-zahabi',8,false),
  ('Bantamweight','david-martinez',9,false),
  ('Bantamweight','raul-rosas-jr',10,false),
  ('Bantamweight','marlon-vera',11,false),
  ('Bantamweight','deiveson-figueiredo',12,false),
  ('Bantamweight','farid-basharat',13,false),
  ('Bantamweight','marcus-mcghee',14,false),
  ('Bantamweight','raoni-barcelos',15,false),
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
  ('Light Heavyweight','azamat-murzakanov',7,false),
  ('Light Heavyweight','dominick-reyes',8,false),
  ('Light Heavyweight','jan-blachowicz',9,false),
  ('Light Heavyweight','bogdan-guskov',10,false),
  ('Light Heavyweight','robert-whittaker',11,false),
  ('Light Heavyweight','alonzo-menifield',12,false),
  ('Light Heavyweight','muhammad-saidov',13,false),
  ('Light Heavyweight','reinier-de-ridder',14,false),
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
  ('Heavyweight','aleksandar-rakic',14,false),
  ('Heavyweight','mario-pinto',15,false);

do $wheel_oct10_preflight$
declare
  v_missing integer;
  v_bad integer;
begin
  if (select count(*) from wheel_ufc_all_rankings_oct10) <> 128 then
    raise exception 'UFC All Rankings must contain 128 entries';
  end if;
  select count(*) into v_missing
  from wheel_ufc_all_rankings_oct10 official
  left join private.wheel_ufc_fighters fighter
    on fighter.division = official.division and fighter.fighter_id = official.fighter_id and fighter.active
  where fighter.fighter_id is null;
  if v_missing <> 0 then
    raise exception 'UFC official ranking has % identities missing from active Wheel pool', v_missing;
  end if;
  select count(*) into v_bad
  from (
    select division,
      count(*) filter (where is_champion) champions,
      count(*) filter (where ranking between 1 and 15) ranked,
      count(distinct ranking) filter (where ranking between 1 and 15) distinct_ranks
    from wheel_ufc_all_rankings_oct10 group by division
  ) division_check
  where champions <> 1 or ranked <> 15 or distinct_ranks <> 15;
  if v_bad <> 0 then
    raise exception 'UFC official snapshot has % invalid divisions', v_bad;
  end if;
end;
$wheel_oct10_preflight$;

-- Clear rankings only (not eligibility flags, headshots, grades, or any pick records).
update private.wheel_ufc_fighters
set ranking = null,
    is_champion = false,
    ranking_source = 'ufc-all-rankings',
    rankings_as_of = date '2026-10-10'
where active;

update private.wheel_ufc_fighters fighter
set ranking = official.ranking,
    is_champion = official.is_champion
from wheel_ufc_all_rankings_oct10 official
where fighter.active and fighter.division = official.division
  and fighter.fighter_id = official.fighter_id;

-- Refresh factual labels on already-saved results without rewriting spin categories.
update private.wheel_ufc_picks pick
set ranking_label = private.wheel_ufc_ranking_label(pick.fighter_id, pick.roster_slot)
where pick.ranking_label is distinct from private.wheel_ufc_ranking_label(pick.fighter_id, pick.roster_slot);

do $wheel_oct10_postflight$
declare
  v_bad integer;
  v_active integer;
  v_missing_media integer;
begin
  with division_check as (
    select division,
      count(*) filter(where is_champion) champions,
      count(*) filter(where ranking between 1 and 15) ranked,
      count(distinct ranking) filter(where ranking between 1 and 15) distinct_ranks
    from private.wheel_ufc_fighters where active group by division
  )
  select count(*) into v_bad
  from division_check where champions <> 1 or ranked <> 15 or distinct_ranks <> 15;
  if v_bad <> 0 then raise exception 'UFC live authority has % invalid divisions', v_bad; end if;
  select count(*), count(*) filter(where headshot_url is null or btrim(headshot_url) = '')
    into v_active, v_missing_media from private.wheel_ufc_fighters where active;
  if v_active < 128 or v_missing_media <> 0 then
    raise exception 'UFC active roster/media integrity failed: % roster, % empty media', v_active, v_missing_media;
  end if;
  if private.wheel_ufc_ranking_label('alex-pereira','Heavyweight') <> 'LHW #3'
    or private.wheel_ufc_ranking_label('johnny-walker','Heavyweight') <> 'UNRANKED'
    or private.wheel_ufc_ranking_label('payton-talbott','Bantamweight') <> '#7'
  then raise exception 'UFC changed-ranking/cross-division labels not current'; end if;
end;
$wheel_oct10_postflight$;
