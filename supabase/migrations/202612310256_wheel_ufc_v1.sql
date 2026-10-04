-- Wheel of UFC v1.
-- Approved game: eight men's UFC divisions, weighted restriction wheel, current fighters only.
-- Ranking authority snapshot: UFC primary rankings as of 2026-10-04.
-- Special categories are explicit audited flags: Young Gun = under 25; Veteran = 10+ UFC fights.
-- Individual fighter grades are private and snapshotted on pick. Only completed-team grades are exposed.

create table if not exists private.wheel_ufc_fighter_authority (
  fighter_slug text not null,
  display_name text not null,
  weight_class text not null check (weight_class in (
    'Flyweight','Bantamweight','Featherweight','Lightweight',
    'Welterweight','Middleweight','Light Heavyweight','Heavyweight'
  )),
  current_rank integer check (current_rank between 1 and 15),
  is_champion boolean not null default false,
  country_bucket text,
  is_young_gun boolean not null default false,
  is_veteran boolean not null default false,
  hidden_grade numeric(5,1) not null check (hidden_grade between 0 and 100),
  grade_version text not null,
  effective_date date not null,
  source_url text not null,
  active boolean not null default true,
  primary key (fighter_slug, effective_date),
  check (not (is_champion and current_rank is not null))
);

create index if not exists wheel_ufc_fighter_authority_current_idx
  on private.wheel_ufc_fighter_authority (effective_date desc, fighter_slug);

create table if not exists private.wheel_ufc_matches (
  challenge_id uuid primary key references public.play_challenges(id) on delete cascade,
  phase text not null default 'waiting' check (phase in ('waiting','spin','pick','complete')),
  turn_count integer not null default 0 check (turn_count between 0 and 16),
  current_turn_profile_id uuid references public.profiles(id) on delete restrict,
  pending_category_key text check (pending_category_key in ('champion','top-5','rank-6-15','unranked','country','young-gun','veteran')),
  pending_country text,
  completed_at timestamptz,
  forfeited_by_profile_id uuid references public.profiles(id) on delete restrict,
  forfeited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (phase = 'waiting' and current_turn_profile_id is null and pending_category_key is null)
    or (phase = 'spin' and current_turn_profile_id is not null and pending_category_key is null)
    or (phase = 'pick' and current_turn_profile_id is not null and pending_category_key is not null)
    or (phase = 'complete' and current_turn_profile_id is null)
  ),
  check (pending_country is null or pending_category_key = 'country')
);

create table if not exists private.wheel_ufc_picks (
  challenge_id uuid not null references public.play_challenges(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  turn_number integer not null check (turn_number between 1 and 16),
  category_key text not null check (category_key in ('champion','top-5','rank-6-15','unranked','country','young-gun','veteran')),
  category_country text,
  fighter_slug text not null,
  display_name text not null,
  weight_class text not null check (weight_class in (
    'Flyweight','Bantamweight','Featherweight','Lightweight',
    'Welterweight','Middleweight','Light Heavyweight','Heavyweight'
  )),
  ranking_position integer check (ranking_position between 1 and 15),
  was_champion boolean not null default false,
  country_bucket text,
  headshot_url text,
  source_url text not null,
  hidden_grade numeric(5,1) not null check (hidden_grade between 0 and 100),
  hidden_grade_version text not null,
  hidden_grade_effective_date date not null,
  created_at timestamptz not null default now(),
  primary key (challenge_id, profile_id, turn_number),
  unique (challenge_id, fighter_slug),
  unique (challenge_id, profile_id, weight_class)
);

alter table private.wheel_ufc_fighter_authority enable row level security;
alter table private.wheel_ufc_matches enable row level security;
alter table private.wheel_ufc_picks enable row level security;

revoke all on private.wheel_ufc_fighter_authority from public, anon, authenticated;
revoke all on private.wheel_ufc_matches from public, anon, authenticated;
revoke all on private.wheel_ufc_picks from public, anon, authenticated;

insert into private.wheel_ufc_fighter_authority (
  fighter_slug, display_name, weight_class, current_rank, is_champion, country_bucket,
  is_young_gun, is_veteran, hidden_grade, grade_version, effective_date, source_url, active
) values
  ('joshua-van','Joshua Van','Flyweight',null,true,'Myanmar',true,false,97.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('alexandre-pantoja','Alexandre Pantoja','Flyweight',1,false,'Brazil',false,true,95.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('manel-kape','Manel Kape','Flyweight',2,false,null,false,false,94.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('brandon-royval','Brandon Royval','Flyweight',3,false,'United States',false,true,93.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('tatsuro-taira','Tatsuro Taira','Flyweight',4,false,'Japan',false,false,92.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('kyoji-horiguchi','Kyoji Horiguchi','Flyweight',5,false,'Japan',false,false,91.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('loneer-kavanagh','Lone''er Kavanagh','Flyweight',6,false,'England',false,false,89.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('asu-almabayev','Asu Almabayev','Flyweight',7,false,null,false,false,88.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('brandon-moreno','Brandon Moreno','Flyweight',8,false,'Mexico',false,true,88.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('amir-albazi','Amir Albazi','Flyweight',9,false,null,false,false,87.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('ramazan-temirov','Ramazan Temirov','Flyweight',10,false,null,false,false,87.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('tim-elliott','Tim Elliott','Flyweight',11,false,'United States',false,true,85.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('steve-erceg','Steve Erceg','Flyweight',12,false,'Australia',false,false,85.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('sumudaerji','Sumudaerji','Flyweight',13,false,null,false,false,84.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('tagir-ulanbekov','Tagir Ulanbekov','Flyweight',14,false,null,false,false,84.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('alex-perez','Alex Perez','Flyweight',15,false,'United States',false,true,83.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('petr-yan','Petr Yan','Bantamweight',null,true,'Russia',false,true,97.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('merab-dvalishvili','Merab Dvalishvili','Bantamweight',1,false,'Georgia',false,true,95.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('sean-omalley','Sean O''Malley','Bantamweight',2,false,'United States',false,true,94.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('song-yadong','Song Yadong','Bantamweight',3,false,'China',false,false,93.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('umar-nurmagomedov','Umar Nurmagomedov','Bantamweight',4,false,'Russia',false,false,92.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('mario-bautista','Mario Bautista','Bantamweight',5,false,'United States',false,false,91.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('cory-sandhagen','Cory Sandhagen','Bantamweight',6,false,'United States',false,true,89.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('aiemann-zahabi','Aiemann Zahabi','Bantamweight',7,false,'Canada',false,false,88.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('david-martinez','David Martinez','Bantamweight',8,false,'Mexico',false,false,88.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('deiveson-figueiredo','Deiveson Figueiredo','Bantamweight',9,false,'Brazil',false,true,87.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('marlon-vera','Marlon Vera','Bantamweight',10,false,'Ecuador',false,true,87.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('raul-rosas-jr','Raul Rosas Jr.','Bantamweight',11,false,'United States',true,false,85.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('payton-talbott','Payton Talbott','Bantamweight',12,false,'United States',false,false,85.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('farid-basharat','Farid Basharat','Bantamweight',13,false,null,false,false,84.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('raoni-barcelos','Raoni Barcelos','Bantamweight',14,false,'Brazil',false,false,84.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('marcus-mcghee','Marcus McGhee','Bantamweight',15,false,'United States',false,false,83.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('alexander-volkanovski','Alexander Volkanovski','Featherweight',null,true,'Australia',false,true,97.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('movsar-evloev','Movsar Evloev','Featherweight',1,false,'Russia',false,false,95.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('diego-lopes','Diego Lopes','Featherweight',2,false,'Brazil',false,false,94.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('lerone-murphy','Lerone Murphy','Featherweight',3,false,'England',false,false,93.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('aljamain-sterling','Aljamain Sterling','Featherweight',4,false,'United States',false,true,92.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('jean-silva','Jean Silva','Featherweight',5,false,'Brazil',false,false,91.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('yair-rodriguez','Yair Rodriguez','Featherweight',6,false,'Mexico',false,true,89.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('arnold-allen','Arnold Allen','Featherweight',7,false,'England',false,true,88.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('youssef-zalal','Youssef Zalal','Featherweight',8,false,'Morocco',false,false,88.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('kevin-vallejos','Kevin Vallejos','Featherweight',9,false,'Argentina',true,false,87.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('steve-garcia','Steve Garcia','Featherweight',10,false,'United States',false,false,87.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('aaron-pico','Aaron Pico','Featherweight',11,false,'United States',false,false,85.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('melquizael-costa','Melquizael Costa','Featherweight',12,false,'Brazil',false,false,85.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('brian-ortega','Brian Ortega','Featherweight',13,false,'United States',false,true,84.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('patricio-pitbull','Patricio Pitbull','Featherweight',14,false,'Brazil',false,false,84.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('david-onama','David Onama','Featherweight',15,false,'Uganda',false,false,83.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('justin-gaethje','Justin Gaethje','Lightweight',null,true,'United States',false,true,97.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('ilia-topuria','Ilia Topuria','Lightweight',1,false,null,false,false,95.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('arman-tsarukyan','Arman Tsarukyan','Lightweight',2,false,null,false,false,94.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('charles-oliveira','Charles Oliveira','Lightweight',3,false,'Brazil',false,true,93.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('max-holloway','Max Holloway','Lightweight',4,false,'United States',false,true,92.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('paddy-pimblett','Paddy Pimblett','Lightweight',5,false,'England',false,false,91.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('benoit-saint-denis','Benoît Saint Denis','Lightweight',6,false,'France',false,false,89.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('quillan-salkilld','Quillan Salkilld','Lightweight',7,false,'Australia',false,false,88.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('mauricio-ruffy','Mauricio Ruffy','Lightweight',8,false,'Brazil',false,false,88.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('salahdine-parnasse','Salahdine Parnasse','Lightweight',9,false,'France',false,false,87.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('mateusz-gamrot','Mateusz Gamrot','Lightweight',10,false,'Poland',false,true,87.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('rafael-fiziev','Rafael Fiziev','Lightweight',11,false,null,false,true,85.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('renato-moicano','Renato Moicano','Lightweight',12,false,'Brazil',false,true,85.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('dan-hooker','Dan Hooker','Lightweight',13,false,'New Zealand',false,true,84.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('tom-nolan','Tom Nolan','Lightweight',14,false,'Australia',false,false,84.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('beneil-dariush','Beneil Dariush','Lightweight',15,false,null,false,true,83.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('islam-makhachev','Islam Makhachev','Welterweight',null,true,'Russia',false,true,97.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('ian-machado-garry','Ian Machado Garry','Welterweight',1,false,'Ireland',false,false,95.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('carlos-prates','Carlos Prates','Welterweight',2,false,'Brazil',false,false,94.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('michael-morales','Michael Morales','Welterweight',3,false,'Ecuador',false,false,93.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('jack-della-maddalena','Jack Della Maddalena','Welterweight',4,false,'Australia',false,false,92.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('gabriel-bonfim','Gabriel Bonfim','Welterweight',5,false,'Brazil',false,false,91.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('sean-brady','Sean Brady','Welterweight',6,false,'United States',false,false,89.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('belal-muhammad','Belal Muhammad','Welterweight',7,false,'United States',false,true,88.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('leon-edwards','Leon Edwards','Welterweight',8,false,'England',false,true,88.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('kamaru-usman','Kamaru Usman','Welterweight',9,false,'Nigeria',false,true,87.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('joaquin-buckley','Joaquin Buckley','Welterweight',10,false,'United States',false,true,87.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('yaroslav-amosov','Yaroslav Amosov','Welterweight',11,false,'Ukraine',false,false,85.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('uros-medic','Uroš Medić','Welterweight',12,false,'Serbia',false,false,85.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('mike-malott','Mike Malott','Welterweight',13,false,'Canada',false,false,84.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('daniel-rodriguez','Daniel Rodriguez','Welterweight',14,false,'United States',false,true,84.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('neil-magny','Neil Magny','Welterweight',15,false,'United States',false,true,83.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('sean-strickland','Sean Strickland','Middleweight',null,true,'United States',false,true,97.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('khamzat-chimaev','Khamzat Chimaev','Middleweight',1,false,null,false,false,95.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('dricus-du-plessis','Dricus Du Plessis','Middleweight',2,false,'South Africa',false,true,94.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('nassourdine-imavov','Nassourdine Imavov','Middleweight',3,false,'France',false,false,93.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('brendan-allen','Brendan Allen','Middleweight',4,false,'United States',false,true,92.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('caio-borralho','Caio Borralho','Middleweight',5,false,'Brazil',false,false,91.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('joe-pyfer','Joe Pyfer','Middleweight',6,false,'United States',false,false,89.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('gregory-rodrigues','Gregory Rodrigues','Middleweight',7,false,'Brazil',false,true,88.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('anthony-hernandez','Anthony Hernandez','Middleweight',8,false,'United States',false,true,88.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('israel-adesanya','Israel Adesanya','Middleweight',9,false,'New Zealand',false,true,87.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('christian-leroy-duncan','Christian Leroy Duncan','Middleweight',10,false,'England',false,false,87.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('jared-cannonier','Jared Cannonier','Middleweight',11,false,'United States',false,true,85.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('abus-magomedov','Abus Magomedov','Middleweight',12,false,null,false,false,85.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('ikram-aliskerov','Ikram Aliskerov','Middleweight',13,false,null,false,false,84.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('bo-nickal','Bo Nickal','Middleweight',14,false,'United States',false,false,84.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('shara-magomedov','Shara Magomedov','Middleweight',15,false,'Russia',false,false,83.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('carlos-ulberg','Carlos Ulberg','Light Heavyweight',null,true,'New Zealand',false,false,97.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('magomed-ankalaev','Magomed Ankalaev','Light Heavyweight',1,false,'Russia',false,true,95.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('jiri-prochazka','Jiří Procházka','Light Heavyweight',2,false,'Czech Republic',false,true,94.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('alex-pereira','Alex Pereira','Light Heavyweight',3,false,'Brazil',false,true,93.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('khalil-rountree-jr','Khalil Rountree Jr.','Light Heavyweight',4,false,'United States',false,true,92.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('navajo-stirling','Navajo Stirling','Light Heavyweight',5,false,'New Zealand',false,false,91.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('paulo-costa','Paulo Costa','Light Heavyweight',6,false,'Brazil',false,true,89.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('jamahal-hill','Jamahal Hill','Light Heavyweight',7,false,'United States',false,true,88.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('azamat-murzakanov','Azamat Murzakanov','Light Heavyweight',8,false,'Russia',false,false,88.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('jan-b-achowicz','Jan Błachowicz','Light Heavyweight',9,false,'Poland',false,true,87.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('dominick-reyes','Dominick Reyes','Light Heavyweight',10,false,'United States',false,true,87.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('bogdan-guskov','Bogdan Guskov','Light Heavyweight',11,false,null,false,false,85.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('robert-whittaker','Robert Whittaker','Light Heavyweight',12,false,'Australia',false,true,85.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('johnny-walker','Johnny Walker','Light Heavyweight',13,false,'Brazil',false,true,84.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('alonzo-menifield','Alonzo Menifield','Light Heavyweight',14,false,'United States',false,true,84.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('nikita-krylov','Nikita Krylov','Light Heavyweight',15,false,'Ukraine',false,true,83.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('ciryl-gane','Ciryl Gane','Heavyweight',null,true,'France',false,true,97.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('tom-aspinall','Tom Aspinall','Heavyweight',1,false,'England',false,true,95.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('alexander-volkov','Alexander Volkov','Heavyweight',2,false,'Russia',false,true,94.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('sergei-pavlovich','Sergei Pavlovich','Heavyweight',3,false,'Russia',false,true,93.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('josh-hokit','Josh Hokit','Heavyweight',4,false,'United States',false,false,92.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('curtis-blaydes','Curtis Blaydes','Heavyweight',5,false,'United States',false,true,91.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('waldo-cortes-acosta','Waldo Cortes Acosta','Heavyweight',6,false,'Dominican Republic',false,false,89.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('rizvan-kuniev','Rizvan Kuniev','Heavyweight',7,false,'Russia',false,false,88.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('vitor-petrino','Vitor Petrino','Heavyweight',8,false,'Brazil',false,false,88.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('serghei-spivac','Serghei Spivac','Heavyweight',9,false,'Moldova',false,true,87.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('ante-delija','Ante Delija','Heavyweight',10,false,'Croatia',false,false,87.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('valter-walker','Valter Walker','Heavyweight',11,false,'Brazil',false,false,85.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('tyrell-fortune','Tyrell Fortune','Heavyweight',12,false,'United States',false,false,85.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('derrick-lewis','Derrick Lewis','Heavyweight',13,false,'United States',false,true,84.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('mario-pinto','Mario Pinto','Heavyweight',14,false,null,false,false,84.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('aleksandar-rakic','Aleksandar Rakić','Heavyweight',15,false,'Austria',false,false,83.5,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/rankings',true),
  ('rei-tsuruya','Rei Tsuruya','Flyweight',null,false,'Japan',true,false,82.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/athlete/rei-tsuruya',true),
  ('ricky-simon','Ricky Simon','Bantamweight',null,false,'United States',false,true,82.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/athlete/ricky-simon',true),
  ('josh-emmett','Josh Emmett','Featherweight',null,false,'United States',false,true,82.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/athlete/josh-emmett',true),
  ('jai-herbert','Jai Herbert','Lightweight',null,false,'England',false,false,81.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/athlete/jai-herbert',true),
  ('kevin-holland','Kevin Holland','Welterweight',null,false,'United States',false,true,82.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/athlete/kevin-holland',true),
  ('ateba-gautier','Ateba Gautier','Middleweight',null,false,'Cameroon',true,false,82.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/athlete/ateba-gautier',true),
  ('billy-elekana','Billy Elekana','Light Heavyweight',null,false,'United States',false,false,81.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/athlete/billy-elekana',true),
  ('jordan-jackson','Jordan Jackson','Heavyweight',null,false,'United States',true,false,82.0,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04','https://www.ufc.com/athlete/jordan-jackson',true)
on conflict (fighter_slug, effective_date) do update set
  display_name = excluded.display_name,
  weight_class = excluded.weight_class,
  current_rank = excluded.current_rank,
  is_champion = excluded.is_champion,
  country_bucket = excluded.country_bucket,
  is_young_gun = excluded.is_young_gun,
  is_veteran = excluded.is_veteran,
  hidden_grade = excluded.hidden_grade,
  grade_version = excluded.grade_version,
  source_url = excluded.source_url,
  active = excluded.active;

create or replace function private.wheel_ufc_category_has_candidate(
  p_challenge_id uuid,
  p_profile_id uuid,
  p_category_key text,
  p_country text default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with current_fighters as (
    select distinct on (authority.fighter_slug)
      authority.*
    from private.wheel_ufc_fighter_authority authority
    where authority.effective_date <= current_date
    order by authority.fighter_slug, authority.effective_date desc
  )
  select exists (
    select 1
    from current_fighters fighter
    where fighter.active
      and not exists (
        select 1
        from private.wheel_ufc_picks pick
        where pick.challenge_id = p_challenge_id
          and pick.fighter_slug = fighter.fighter_slug
      )
      and not exists (
        select 1
        from private.wheel_ufc_picks pick
        where pick.challenge_id = p_challenge_id
          and pick.profile_id = p_profile_id
          and pick.weight_class = fighter.weight_class
      )
      and case p_category_key
        when 'champion' then fighter.is_champion
        when 'top-5' then fighter.current_rank between 1 and 5
        when 'rank-6-15' then fighter.current_rank between 6 and 15
        when 'unranked' then fighter.current_rank is null and not fighter.is_champion
        when 'country' then fighter.country_bucket is not null
          and (p_country is null or fighter.country_bucket = p_country)
        when 'young-gun' then fighter.is_young_gun
        when 'veteran' then fighter.is_veteran
        else false
      end
  );
$$;

create or replace function private.wheel_ufc_grade_total(
  p_challenge_id uuid,
  p_profile_id uuid
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when count(*) = 8 and count(pick.hidden_grade) = 8
      then sum(pick.hidden_grade)::numeric
    else null
  end
  from private.wheel_ufc_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = p_profile_id;
$$;

create or replace function private.wheel_ufc_raw_grade(
  p_challenge_id uuid,
  p_profile_id uuid
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when count(*) = 8 and count(pick.hidden_grade) = 8
      then avg(pick.hidden_grade)::numeric
    else null
  end
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
    when p_raw_grade <= 95
      then round(greatest(0::numeric, 95 + (2.5 * (p_raw_grade - 95))), 1)
    else round(least(100::numeric, p_raw_grade), 1)
  end;
$$;

create or replace function private.wheel_ufc_state_json(p_challenge_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'code', challenge.code,
    'phase', match.phase,
    'turn_count', match.turn_count,
    'current_turn_profile_id', match.current_turn_profile_id,
    'pending_category_key', match.pending_category_key,
    'pending_country', match.pending_country,
    'creator', jsonb_build_object(
      'id', challenge.creator_id,
      'display_name', creator.display_name
    ),
    'recipient', jsonb_build_object(
      'id', challenge.recipient_id,
      'display_name', recipient.display_name
    ),
    'creator_roster', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'turn_number', pick.turn_number,
          'category_key', pick.category_key,
          'category_country', pick.category_country,
          'fighter_slug', pick.fighter_slug,
          'display_name', pick.display_name,
          'weight_class', pick.weight_class,
          'ranking_position', pick.ranking_position,
          'was_champion', pick.was_champion,
          'country', pick.country_bucket,
          'headshot_url', pick.headshot_url,
          'source_url', pick.source_url
        )
        order by case pick.weight_class
          when 'Flyweight' then 1 when 'Bantamweight' then 2 when 'Featherweight' then 3
          when 'Lightweight' then 4 when 'Welterweight' then 5 when 'Middleweight' then 6
          when 'Light Heavyweight' then 7 when 'Heavyweight' then 8 else 99 end
      )
      from private.wheel_ufc_picks pick
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.creator_id
    ), '[]'::jsonb),
    'recipient_roster', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'turn_number', pick.turn_number,
          'category_key', pick.category_key,
          'category_country', pick.category_country,
          'fighter_slug', pick.fighter_slug,
          'display_name', pick.display_name,
          'weight_class', pick.weight_class,
          'ranking_position', pick.ranking_position,
          'was_champion', pick.was_champion,
          'country', pick.country_bucket,
          'headshot_url', pick.headshot_url,
          'source_url', pick.source_url
        )
        order by case pick.weight_class
          when 'Flyweight' then 1 when 'Bantamweight' then 2 when 'Featherweight' then 3
          when 'Lightweight' then 4 when 'Welterweight' then 5 when 'Middleweight' then 6
          when 'Light Heavyweight' then 7 when 'Heavyweight' then 8 else 99 end
      )
      from private.wheel_ufc_picks pick
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.recipient_id
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
            > private.wheel_ufc_grade_total(challenge.id, challenge.recipient_id)
            then challenge.creator_id
          when private.wheel_ufc_grade_total(challenge.id, challenge.recipient_id)
            > private.wheel_ufc_grade_total(challenge.id, challenge.creator_id)
            then challenge.recipient_id
          else null
        end,
        'is_tie',
          private.wheel_ufc_grade_total(challenge.id, challenge.creator_id)
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
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  select challenge.id
    into v_challenge_id
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-ufc'
    and (challenge.creator_id = v_user_id or challenge.recipient_id = v_user_id);

  if v_challenge_id is null then
    raise exception 'Wheel of UFC match not found';
  end if;

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
  if v_creator_id is null then
    raise exception 'sign in required';
  end if;
  if p_recipient_id is null or p_recipient_id = v_creator_id then
    raise exception 'choose another profile';
  end if;
  if not exists (select 1 from public.profiles where id = p_recipient_id) then
    raise exception 'profile not found';
  end if;

  select profile.display_name into v_creator_name
  from public.profiles profile
  where profile.id = v_creator_id;

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.play_challenges (
        code, game_id, game_version, game_title, summary,
        creator_id, recipient_id, play_url, setup, creator_result
      ) values (
        v_code,
        'wheel-ufc',
        'ufc-wheel-v1',
        'Wheel of UFC',
        'Current UFC · 8 divisions · weighted restriction wheel',
        v_creator_id,
        p_recipient_id,
        '/play/wheel?match=' || v_code,
        jsonb_build_object(
          'currentOnly', true,
          'rosterSlots', jsonb_build_array(
            'Flyweight','Bantamweight','Featherweight','Lightweight',
            'Welterweight','Middleweight','Light Heavyweight','Heavyweight'
          ),
          'categoryWeights', jsonb_build_object(
            'champion', 5, 'top-5', 10, 'rank-6-15', 15, 'unranked', 20,
            'country', 20, 'young-gun', 15, 'veteran', 15
          ),
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
  v_recipient_name text;
  v_first_turn uuid;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-ufc'
    and challenge.recipient_id = v_user_id
    and challenge.completed_at is null
    and challenge.declined_at is null
    and challenge.recipient_hidden_at is null
  for update;

  if not found then return false; end if;
  if v_challenge.opened_at is not null then return true; end if;

  v_first_turn := case when random() < 0.5 then v_challenge.creator_id else v_challenge.recipient_id end;

  update public.play_challenges challenge
  set opened_at = now()
  where challenge.id = v_challenge.id
  returning challenge.* into v_challenge;

  update private.wheel_ufc_matches match
  set phase = 'spin',
      current_turn_profile_id = v_first_turn,
      updated_at = v_challenge.opened_at
  where match.challenge_id = v_challenge.id;

  select profile.display_name into v_recipient_name
  from public.profiles profile
  where profile.id = v_challenge.recipient_id;

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
  v_country text;
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
  if v_challenge.opened_at is null then
    raise exception 'The challenge must be accepted before the first spin';
  end if;
  if v_match.current_turn_profile_id <> v_user_id or v_match.phase <> 'spin' then
    raise exception 'It is not your spin';
  end if;

  with category_weights(category_key, weight_units) as (
    values
      ('champion',1),
      ('top-5',2),
      ('rank-6-15',3),
      ('unranked',4),
      ('country',4),
      ('young-gun',3),
      ('veteran',3)
  ),
  eligible as (
    select category.category_key, category.weight_units
    from category_weights category
    where private.wheel_ufc_category_has_candidate(
      v_challenge.id, v_user_id, category.category_key, null
    )
  ),
  weighted as (
    select eligible.category_key
    from eligible
    cross join lateral generate_series(1, eligible.weight_units)
  )
  select weighted.category_key
    into v_category
  from weighted
  order by random()
  limit 1;

  if v_category is null then
    raise exception 'No legal Wheel of UFC category remains for your open divisions';
  end if;

  if v_category = 'country' then
    with current_fighters as (
      select distinct on (authority.fighter_slug) authority.*
      from private.wheel_ufc_fighter_authority authority
      where authority.effective_date <= current_date
      order by authority.fighter_slug, authority.effective_date desc
    ),
    available_countries as (
      select fighter.country_bucket
      from current_fighters fighter
      where fighter.active
        and fighter.country_bucket is not null
        and not exists (
          select 1 from private.wheel_ufc_picks pick
          where pick.challenge_id = v_challenge.id
            and pick.fighter_slug = fighter.fighter_slug
        )
        and not exists (
          select 1 from private.wheel_ufc_picks pick
          where pick.challenge_id = v_challenge.id
            and pick.profile_id = v_user_id
            and pick.weight_class = fighter.weight_class
        )
      group by fighter.country_bucket
    )
    select available_countries.country_bucket
      into v_country
    from available_countries
    order by random()
    limit 1;
  end if;

  update private.wheel_ufc_matches match
  set phase = 'pick',
      pending_category_key = v_category,
      pending_country = v_country,
      updated_at = now()
  where match.challenge_id = v_challenge.id;

  return private.wheel_ufc_state_json(v_challenge.id);
end;
$$;

create or replace function private.list_my_wheel_ufc_candidates(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_ufc_matches%rowtype;
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

  if v_match.phase <> 'pick' or v_match.current_turn_profile_id <> v_user_id then
    return '[]'::jsonb;
  end if;

  return (
    with current_fighters as (
      select distinct on (authority.fighter_slug) authority.*
      from private.wheel_ufc_fighter_authority authority
      where authority.effective_date <= current_date
      order by authority.fighter_slug, authority.effective_date desc
    )
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'fighter_slug', fighter.fighter_slug,
        'display_name', fighter.display_name,
        'weight_class', fighter.weight_class,
        'ranking_position', fighter.current_rank,
        'is_champion', fighter.is_champion,
        'country', fighter.country_bucket,
        'headshot_url', media.photo_url,
        'source_url', fighter.source_url
      )
      order by case fighter.weight_class
        when 'Flyweight' then 1 when 'Bantamweight' then 2 when 'Featherweight' then 3
        when 'Lightweight' then 4 when 'Welterweight' then 5 when 'Middleweight' then 6
        when 'Light Heavyweight' then 7 when 'Heavyweight' then 8 else 99 end,
        fighter.is_champion desc,
        fighter.current_rank nulls last,
        fighter.display_name
    ), '[]'::jsonb)
    from current_fighters fighter
    left join public.ufc_fighter_media media on media.fighter_slug = fighter.fighter_slug
    where fighter.active
      and not exists (
        select 1 from private.wheel_ufc_picks pick
        where pick.challenge_id = v_challenge.id
          and pick.fighter_slug = fighter.fighter_slug
      )
      and not exists (
        select 1 from private.wheel_ufc_picks pick
        where pick.challenge_id = v_challenge.id
          and pick.profile_id = v_user_id
          and pick.weight_class = fighter.weight_class
      )
      and case v_match.pending_category_key
        when 'champion' then fighter.is_champion
        when 'top-5' then fighter.current_rank between 1 and 5
        when 'rank-6-15' then fighter.current_rank between 6 and 15
        when 'unranked' then fighter.current_rank is null and not fighter.is_champion
        when 'country' then fighter.country_bucket = v_match.pending_country
        when 'young-gun' then fighter.is_young_gun
        when 'veteran' then fighter.is_veteran
        else false
      end
  );
end;
$$;

create or replace function private.pick_wheel_ufc(
  p_code text,
  p_fighter_slug text
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
  v_fighter private.wheel_ufc_fighter_authority%rowtype;
  v_headshot text;
  v_next_turn_count integer;
  v_next_profile uuid;
  v_actor_name text;
  v_creator_roster jsonb;
  v_recipient_roster jsonb;
  v_creator_raw numeric;
  v_recipient_raw numeric;
  v_creator_final numeric;
  v_recipient_final numeric;
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
  if v_match.current_turn_profile_id <> v_user_id
    or v_match.phase <> 'pick'
    or v_match.pending_category_key is null then
    raise exception 'It is not your pick';
  end if;

  select authority.*
    into v_fighter
  from private.wheel_ufc_fighter_authority authority
  where authority.fighter_slug = trim(p_fighter_slug)
    and authority.effective_date <= current_date
  order by authority.effective_date desc
  limit 1;

  if not found or not v_fighter.active then
    raise exception 'That fighter is not in the current Wheel of UFC pool';
  end if;

  if exists (
    select 1 from private.wheel_ufc_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.fighter_slug = v_fighter.fighter_slug
  ) then
    raise exception 'That fighter has already been drafted in this matchup';
  end if;

  if exists (
    select 1 from private.wheel_ufc_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_user_id
      and pick.weight_class = v_fighter.weight_class
  ) then
    raise exception 'That weight-class slot is already filled';
  end if;

  if not (
    case v_match.pending_category_key
      when 'champion' then v_fighter.is_champion
      when 'top-5' then v_fighter.current_rank between 1 and 5
      when 'rank-6-15' then v_fighter.current_rank between 6 and 15
      when 'unranked' then v_fighter.current_rank is null and not v_fighter.is_champion
      when 'country' then v_fighter.country_bucket = v_match.pending_country
      when 'young-gun' then v_fighter.is_young_gun
      when 'veteran' then v_fighter.is_veteran
      else false
    end
  ) then
    raise exception 'That fighter is not eligible for this spin';
  end if;

  select media.photo_url into v_headshot
  from public.ufc_fighter_media media
  where media.fighter_slug = v_fighter.fighter_slug
  limit 1;

  v_next_turn_count := v_match.turn_count + 1;

  insert into private.wheel_ufc_picks (
    challenge_id, profile_id, turn_number, category_key, category_country,
    fighter_slug, display_name, weight_class, ranking_position, was_champion,
    country_bucket, headshot_url, source_url, hidden_grade, hidden_grade_version,
    hidden_grade_effective_date
  ) values (
    v_challenge.id, v_user_id, v_next_turn_count, v_match.pending_category_key, v_match.pending_country,
    v_fighter.fighter_slug, v_fighter.display_name, v_fighter.weight_class, v_fighter.current_rank, v_fighter.is_champion,
    v_fighter.country_bucket, v_headshot, v_fighter.source_url, v_fighter.hidden_grade, v_fighter.grade_version,
    v_fighter.effective_date
  );

  select profile.display_name into v_actor_name
  from public.profiles profile where profile.id = v_user_id;

  if v_next_turn_count = 16 then
    update private.wheel_ufc_matches match
    set turn_count = 16,
        phase = 'complete',
        current_turn_profile_id = null,
        pending_category_key = null,
        pending_country = null,
        completed_at = now(),
        updated_at = now()
    where match.challenge_id = v_challenge.id;

    select coalesce(jsonb_agg(jsonb_build_object(
      'turnNumber', pick.turn_number,
      'categoryKey', pick.category_key,
      'categoryCountry', pick.category_country,
      'fighterSlug', pick.fighter_slug,
      'displayName', pick.display_name,
      'weightClass', pick.weight_class,
      'rankingPosition', pick.ranking_position,
      'wasChampion', pick.was_champion
    ) order by pick.turn_number), '[]'::jsonb)
    into v_creator_roster
    from private.wheel_ufc_picks pick
    where pick.challenge_id = v_challenge.id and pick.profile_id = v_challenge.creator_id;

    select coalesce(jsonb_agg(jsonb_build_object(
      'turnNumber', pick.turn_number,
      'categoryKey', pick.category_key,
      'categoryCountry', pick.category_country,
      'fighterSlug', pick.fighter_slug,
      'displayName', pick.display_name,
      'weightClass', pick.weight_class,
      'rankingPosition', pick.ranking_position,
      'wasChampion', pick.was_champion
    ) order by pick.turn_number), '[]'::jsonb)
    into v_recipient_roster
    from private.wheel_ufc_picks pick
    where pick.challenge_id = v_challenge.id and pick.profile_id = v_challenge.recipient_id;

    v_creator_raw := private.wheel_ufc_raw_grade(v_challenge.id, v_challenge.creator_id);
    v_recipient_raw := private.wheel_ufc_raw_grade(v_challenge.id, v_challenge.recipient_id);

    if v_creator_raw is null or v_recipient_raw is null then
      raise exception 'Wheel of UFC grading could not resolve both completed rosters';
    end if;

    v_creator_final := private.wheel_ufc_final_grade(v_creator_raw);
    v_recipient_final := private.wheel_ufc_final_grade(v_recipient_raw);

    update public.play_challenges challenge
    set creator_result = jsonb_build_object(
          'complete', true, 'roster', v_creator_roster,
          'finalGrade', v_creator_final, 'score', v_creator_final,
          'wheelGradeRuntimeVersion', 'ufc-wheel-ranking-anchor-2026-10-04-v1'
        ),
        responder_result = jsonb_build_object(
          'complete', true, 'roster', v_recipient_roster,
          'finalGrade', v_recipient_final, 'score', v_recipient_final,
          'wheelGradeRuntimeVersion', 'ufc-wheel-ranking-anchor-2026-10-04-v1'
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
      v_actor_name || ' made the final pick. Both fight teams are locked.',
      '/play/wheel?match=' || v_challenge.code,
      'VIEW TEAMS',
      now()
    );
  else
    v_next_profile := case when v_user_id = v_challenge.creator_id
      then v_challenge.recipient_id else v_challenge.creator_id end;

    update private.wheel_ufc_matches match
    set turn_count = v_next_turn_count,
        phase = 'spin',
        current_turn_profile_id = v_next_profile,
        pending_category_key = null,
        pending_country = null,
        updated_at = now()
    where match.challenge_id = v_challenge.id;

    perform private.publish_notification_to_profile(
      v_next_profile,
      'wheel-ufc:turn:' || v_challenge.code || ':' || v_next_turn_count::text || ':' || v_next_profile::text,
      'play-challenges:received',
      'game_challenge_received',
      'Your turn in Wheel of UFC',
      v_actor_name || ' made a pick. Spin for your next restriction.',
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

  if v_challenge.opened_at is null then raise exception 'match has not started'; end if;
  if v_challenge.declined_at is not null or v_challenge.completed_at is not null or v_match.phase = 'complete' then
    raise exception 'match has already ended';
  end if;

  v_opponent_id := case when v_user_id = v_challenge.creator_id
    then v_challenge.recipient_id else v_challenge.creator_id end;
  select profile.display_name into v_actor_name from public.profiles profile where profile.id = v_user_id;

  update private.wheel_ufc_matches match
  set phase = 'complete',
      current_turn_profile_id = null,
      pending_category_key = null,
      pending_country = null,
      completed_at = v_now,
      forfeited_by_profile_id = v_user_id,
      forfeited_at = v_now,
      updated_at = v_now
  where match.challenge_id = v_challenge.id;

  update public.play_challenges challenge
  set creator_result = jsonb_build_object(
        'complete', true, 'forfeited', v_user_id = v_challenge.creator_id,
        'forfeitedByProfileId', v_user_id
      ),
      responder_result = jsonb_build_object(
        'complete', true, 'forfeited', v_user_id = v_challenge.recipient_id,
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
returns jsonb language sql stable security invoker set search_path = ''
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

create or replace function public.list_my_wheel_ufc_candidates(p_code text)
returns jsonb language sql stable security invoker set search_path = ''
as $$ select private.list_my_wheel_ufc_candidates(p_code); $$;

create or replace function public.pick_wheel_ufc(p_code text, p_fighter_slug text)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.pick_wheel_ufc(p_code, p_fighter_slug); $$;

create or replace function public.forfeit_wheel_ufc(p_code text)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.forfeit_wheel_ufc(p_code); $$;

grant usage on schema private to authenticated;

revoke all on function private.wheel_ufc_category_has_candidate(uuid,uuid,text,text) from public, anon, authenticated;
revoke all on function private.wheel_ufc_grade_total(uuid,uuid) from public, anon, authenticated;
revoke all on function private.wheel_ufc_raw_grade(uuid,uuid) from public, anon, authenticated;
revoke all on function private.wheel_ufc_final_grade(numeric) from public, anon, authenticated;
revoke all on function private.wheel_ufc_state_json(uuid) from public, anon, authenticated;
revoke all on function private.get_my_wheel_ufc_match(text) from public, anon;
revoke all on function private.create_wheel_ufc_challenge(uuid) from public, anon;
revoke all on function private.open_wheel_ufc_challenge(text) from public, anon;
revoke all on function private.spin_wheel_ufc(text) from public, anon;
revoke all on function private.list_my_wheel_ufc_candidates(text) from public, anon;
revoke all on function private.pick_wheel_ufc(text,text) from public, anon;
revoke all on function private.forfeit_wheel_ufc(text) from public, anon;

grant execute on function private.get_my_wheel_ufc_match(text) to authenticated;
grant execute on function private.create_wheel_ufc_challenge(uuid) to authenticated;
grant execute on function private.open_wheel_ufc_challenge(text) to authenticated;
grant execute on function private.spin_wheel_ufc(text) to authenticated;
grant execute on function private.list_my_wheel_ufc_candidates(text) to authenticated;
grant execute on function private.pick_wheel_ufc(text,text) to authenticated;
grant execute on function private.forfeit_wheel_ufc(text) to authenticated;

revoke all on function public.get_my_wheel_ufc_match(text) from public, anon;
revoke all on function public.create_wheel_ufc_challenge(uuid) from public, anon;
revoke all on function public.open_wheel_ufc_challenge(text) from public, anon;
revoke all on function public.spin_wheel_ufc(text) from public, anon;
revoke all on function public.list_my_wheel_ufc_candidates(text) from public, anon;
revoke all on function public.pick_wheel_ufc(text,text) from public, anon;
revoke all on function public.forfeit_wheel_ufc(text) from public, anon;

grant execute on function public.get_my_wheel_ufc_match(text) to authenticated;
grant execute on function public.create_wheel_ufc_challenge(uuid) to authenticated;
grant execute on function public.open_wheel_ufc_challenge(text) to authenticated;
grant execute on function public.spin_wheel_ufc(text) to authenticated;
grant execute on function public.list_my_wheel_ufc_candidates(text) to authenticated;
grant execute on function public.pick_wheel_ufc(text,text) to authenticated;
grant execute on function public.forfeit_wheel_ufc(text) to authenticated;

comment on table private.wheel_ufc_fighter_authority is
  'Append-only current-fighter authority for Wheel of UFC. Grades never leave private RPC state.';
comment on function public.spin_wheel_ufc(text) is
  'Server-owned weighted Wheel of UFC spin. Ineligible categories are removed before weighting, preventing dead turns.';
comment on function public.pick_wheel_ufc(text,text) is
  'Locks one server-validated current UFC fighter into that fighter division slot and snapshots the hidden grade.';
