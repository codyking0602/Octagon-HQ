-- Stage 15: Dallas Cowboys Teams Since 2007.
-- Reuses the existing server-owned sealed-bid Draft Room architecture.
-- Only completed Cowboys seasons 2007-2025 are eligible; 2026 is intentionally excluded.

alter table private.auction_catalog_versions drop constraint auction_catalog_versions_game_id_check;
alter table private.auction_catalog_versions add constraint auction_catalog_versions_game_id_check
  check (game_id in ('auction','draft-room','draft-room-trio','draft-room-longhorns','draft-room-longhorn-teams','draft-room-cowboys-teams'));

create or replace function private.auction_catalog_game_id_for_mode(p_mode_id text)
returns text language sql immutable set search_path = '' as $$
  select case
    when p_mode_id in ('trio-nfl','trio-cfb') then 'draft-room-trio'
    when p_mode_id = 'longhorns-2005' then 'draft-room-longhorns'
    when p_mode_id = 'longhorns-teams-2005' then 'draft-room-longhorn-teams'
    when p_mode_id = 'cowboys-teams-2007' then 'draft-room-cowboys-teams'
    when p_mode_id in ('build-qb','build-qb-cfb') then 'draft-room'
    else 'auction'
  end;
$$;
revoke all on function private.auction_catalog_game_id_for_mode(text) from public, anon, authenticated;

create or replace function private.auction_game_id_for_mode(p_mode_id text)
returns text language sql immutable set search_path = '' as $$
  select case when p_mode_id in ('build-qb','build-qb-cfb','trio-nfl','trio-cfb','longhorns-2005','longhorns-teams-2005','cowboys-teams-2007') then 'draft-room' else 'auction' end;
$$;
revoke all on function private.auction_game_id_for_mode(text) from public, anon, authenticated;

insert into private.auction_catalog_versions (content_version, rarity_version, grading_version, is_preparation_version, game_id)
values ('football-draft-room-cowboys-teams-2007-2026-09-v1','football-draft-room-cowboys-teams-2007-board-2026-09-v1','football-draft-room-cowboys-teams-2007-grading-2026-09-v1',true,'draft-room-cowboys-teams');

create table private.draft_room_cowboys_teams_pool (
  season_reference text primary key,
  season_year integer not null unique check (season_year between 2007 and 2025),
  display_label text not null unique,
  hidden_grade numeric(5,2) not null check (hidden_grade between 58 and 97),
  quality_band text not null check (quality_band in ('A','B','C','D','E'))
);

insert into private.draft_room_cowboys_teams_pool (season_reference,season_year,display_label,hidden_grade,quality_band) values
('cowboys-2007',2007,'2007 Cowboys|13-3 · NFC East Champ · Divisional Round',97,'A'),
('cowboys-2016',2016,'2016 Cowboys|13-3 · NFC East Champ · Divisional Round',96,'A'),
('cowboys-2014',2014,'2014 Cowboys|12-4 · NFC East Champ · Won Wild Card',95,'A'),
('cowboys-2022',2022,'2022 Cowboys|12-5 · Won Wild Card · Divisional Round',94,'A'),
('cowboys-2021',2021,'2021 Cowboys|12-5 · NFC East Champ · Wild Card',93,'A'),
('cowboys-2023',2023,'2023 Cowboys|12-5 · NFC East Champ · Wild Card',92,'A'),
('cowboys-2009',2009,'2009 Cowboys|11-5 · NFC East Champ · Won Wild Card',91,'B'),
('cowboys-2018',2018,'2018 Cowboys|10-6 · NFC East Champ · Won Wild Card',86,'B'),
('cowboys-2019',2019,'2019 Cowboys|8-8 · 2nd NFC East',82,'B'),
('cowboys-2017',2017,'2017 Cowboys|9-7 · 2nd NFC East',81,'B'),
('cowboys-2011',2011,'2011 Cowboys|8-8 · 3rd NFC East',79,'C'),
('cowboys-2008',2008,'2008 Cowboys|9-7 · 3rd NFC East',78,'C'),
('cowboys-2012',2012,'2012 Cowboys|8-8 · 3rd NFC East',77,'C'),
('cowboys-2013',2013,'2013 Cowboys|8-8 · 2nd NFC East',76,'C'),
('cowboys-2010',2010,'2010 Cowboys|6-10 · 3rd NFC East',72,'D'),
('cowboys-2025',2025,'2025 Cowboys|7-9-1 · 2nd NFC East',70,'D'),
('cowboys-2020',2020,'2020 Cowboys|6-10 · 3rd NFC East',66,'D'),
('cowboys-2024',2024,'2024 Cowboys|7-10 · 3rd NFC East',62,'E'),
('cowboys-2015',2015,'2015 Cowboys|4-12 · 4th NFC East',58,'E');

create table private.draft_room_cowboys_teams_board_shapes (
 shape text primary key check (shape in ('Wide','Balanced','TopHeavy','BottomHeavy','Compressed','Chaotic')),
 roll_start numeric(6,5) not null check (roll_start >= 0 and roll_start < 1),
 roll_end numeric(6,5) not null check (roll_end > 0 and roll_end <= 1),
 check (roll_start < roll_end), unique(roll_start), unique(roll_end)
);
insert into private.draft_room_cowboys_teams_board_shapes values
('Wide',0.00,0.14),('Balanced',0.14,0.42),('TopHeavy',0.42,0.62),('BottomHeavy',0.62,0.76),('Compressed',0.76,0.90),('Chaotic',0.90,1.00);

create table private.draft_room_cowboys_teams_board_variants (
 shape text not null references private.draft_room_cowboys_teams_board_shapes(shape),
 variant integer not null check (variant between 1 and 4),
 quality_bands text[] not null check (cardinality(quality_bands)=8),
 primary key(shape,variant), check (quality_bands <@ array['A','B','C','D','E']::text[])
);
insert into private.draft_room_cowboys_teams_board_variants values
('Balanced',1,array['A','A','B','B','C','C','D','E']),
('Balanced',2,array['A','A','B','B','C','D','D','E']),
('Balanced',3,array['A','B','B','C','C','D','D','E']),
('Balanced',4,array['A','A','A','B','C','C','D','E']),
('TopHeavy',1,array['A','A','A','A','B','B','C','D']),
('TopHeavy',2,array['A','A','A','B','B','B','C','E']),
('TopHeavy',3,array['A','A','A','A','B','C','C','D']),
('TopHeavy',4,array['A','A','A','B','B','C','C','E']),
('BottomHeavy',1,array['A','B','C','C','D','D','E','E']),
('BottomHeavy',2,array['B','C','C','D','D','D','E','E']),
('BottomHeavy',3,array['A','C','C','D','D','D','E','E']),
('BottomHeavy',4,array['B','B','C','C','D','D','E','E']),
('Wide',1,array['A','A','A','B','C','D','E','E']),
('Wide',2,array['A','A','B','B','C','C','D','E']),
('Wide',3,array['A','A','A','B','B','C','D','E']),
('Wide',4,array['A','A','B','C','C','D','E','E']),
('Compressed',1,array['A','A','A','A','B','B','B','B']),
('Compressed',2,array['B','B','B','B','C','C','C','C']),
('Compressed',3,array['B','C','C','C','C','D','D','D']),
('Compressed',4,array['C','C','C','D','D','D','E','E']),
('Chaotic',1,array['A','A','A','B','C','D','E','E']),
('Chaotic',2,array['A','A','B','B','C','D','E','E']),
('Chaotic',3,array['A','A','B','C','C','D','E','E']),
('Chaotic',4,array['A','B','B','C','C','D','E','E']);

create or replace function private.draft_room_cowboys_teams_board_shape(p_roll double precision)
returns text language plpgsql stable set search_path='' as $$ declare v_shape text; begin
 if p_roll is null or p_roll < 0 or p_roll >= 1 then raise exception 'Cowboys Teams board-shape roll must be in [0,1)'; end if;
 select shape into v_shape from private.draft_room_cowboys_teams_board_shapes where p_roll >= roll_start and p_roll < roll_end order by roll_start limit 1;
 if v_shape is null then raise exception 'Cowboys Teams board-shape configuration does not cover roll %',p_roll; end if; return v_shape; end; $$;
create or replace function private.draft_room_cowboys_teams_board_variant(p_roll double precision)
returns integer language plpgsql immutable set search_path='' as $$ begin if p_roll is null or p_roll < 0 or p_roll >= 1 then raise exception 'Cowboys Teams board-variant roll must be in [0,1)'; end if; return floor(p_roll*4)::integer+1; end; $$;
create or replace function private.draft_room_cowboys_teams_quality_band(p_shape text,p_variant integer,p_slot integer)
returns text language plpgsql stable set search_path='' as $$ declare v_bands text[]; begin
 if p_slot not between 1 and 8 then raise exception 'Cowboys Teams board slot must be between 1 and 8'; end if;
 select quality_bands into v_bands from private.draft_room_cowboys_teams_board_variants where shape=p_shape and variant=p_variant;
 if v_bands is null then raise exception 'Unknown Cowboys Teams board variant'; end if; return v_bands[p_slot]; end; $$;

create table private.draft_room_cowboys_teams_board_entries (
 auction_id uuid not null references private.auction_games(id) on delete cascade,
 deck_position integer not null check(deck_position between 1 and 8), item_reference text not null,
 board_shape text not null check(board_shape in ('Wide','Balanced','TopHeavy','BottomHeavy','Compressed','Chaotic')),
 board_variant integer not null check(board_variant between 1 and 4), strength_slot integer not null check(strength_slot between 1 and 8),
 season_reference text not null references private.draft_room_cowboys_teams_pool(season_reference), season_year integer not null check(season_year between 2007 and 2025),
 display_label text not null, quality_band text not null check(quality_band in ('A','B','C','D','E')),
 primary key(auction_id,deck_position), unique(auction_id,item_reference), unique(auction_id,season_reference), unique(auction_id,strength_slot)
);

create or replace function private.protect_draft_room_cowboys_teams_calibration() returns trigger language plpgsql set search_path='' as $$ begin raise exception 'Cowboys Teams Since 2007 calibration records are immutable'; end; $$;
create trigger draft_room_cowboys_teams_pool_immutable before update or delete on private.draft_room_cowboys_teams_pool for each row execute function private.protect_draft_room_cowboys_teams_calibration();
create trigger draft_room_cowboys_teams_shapes_immutable before update or delete on private.draft_room_cowboys_teams_board_shapes for each row execute function private.protect_draft_room_cowboys_teams_calibration();
create trigger draft_room_cowboys_teams_variants_immutable before update or delete on private.draft_room_cowboys_teams_board_variants for each row execute function private.protect_draft_room_cowboys_teams_calibration();
create or replace function private.protect_draft_room_cowboys_teams_board_entry() returns trigger language plpgsql set search_path='' as $$ begin
 if tg_op='DELETE' and not exists(select 1 from private.auction_games where id=old.auction_id) then return old; end if;
 raise exception 'Cowboys Teams Since 2007 board entries are immutable'; end; $$;
create trigger draft_room_cowboys_teams_board_entries_immutable before update or delete on private.draft_room_cowboys_teams_board_entries for each row execute function private.protect_draft_room_cowboys_teams_board_entry();
revoke all on private.draft_room_cowboys_teams_pool, private.draft_room_cowboys_teams_board_shapes, private.draft_room_cowboys_teams_board_variants, private.draft_room_cowboys_teams_board_entries from public, anon, authenticated;

create or replace function private.generate_draft_room_cowboys_teams_deck(p_auction_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_game private.auction_games; v_shape text; v_variant integer; v_attempt integer; v_slot integer; v_position integer; v_index integer; v_band text; v_season private.draft_room_cowboys_teams_pool; v_refs text[]; v_slot_order integer[]; v_exact_repeat boolean; v_near_repeat boolean; v_elite_trio boolean; v_item_reference text;
begin
 select * into v_game from private.auction_games where id=p_auction_id for update;
 if v_game.id is null or v_game.mode_id <> 'cowboys-teams-2007' then raise exception 'Cowboys Teams deck generation requires a matching Draft Room game'; end if;
 if exists(select 1 from private.auction_deck_entries where auction_id=p_auction_id) or exists(select 1 from private.draft_room_cowboys_teams_board_entries where auction_id=p_auction_id) then raise exception 'Cowboys Teams deck is already fixed'; end if;
 v_shape:=private.draft_room_cowboys_teams_board_shape(random()); v_variant:=private.draft_room_cowboys_teams_board_variant(random());
 for v_attempt in 1..12 loop
  v_refs:=array[]::text[];
  for v_slot in 1..8 loop
   v_band:=private.draft_room_cowboys_teams_quality_band(v_shape,v_variant,v_slot);
   select * into v_season from private.draft_room_cowboys_teams_pool where quality_band=v_band and not(season_reference=any(v_refs)) order by random(),season_reference limit 1;
   if v_season.season_reference is null then raise exception 'Cowboys Teams board generation underfilled quality band %',v_band; end if;
   v_refs:=array_append(v_refs,v_season.season_reference);
  end loop;
  v_elite_trio := 'cowboys-2007'=any(v_refs) and 'cowboys-2016'=any(v_refs) and 'cowboys-2014'=any(v_refs);
  with recent as (
   select id,row_number() over(order by created_at desc,id) recent_rank from private.auction_games
   where mode_id='cowboys-teams-2007' and id<>p_auction_id and (challenger_id in(v_game.challenger_id,v_game.recipient_id) or recipient_id in(v_game.challenger_id,v_game.recipient_id)) order by created_at desc,id limit 10
  ), overlaps as (
   select recent.id,recent.recent_rank,count(*) filter(where entry.season_reference=any(v_refs)) overlap_count from recent join private.draft_room_cowboys_teams_board_entries entry on entry.auction_id=recent.id group by recent.id,recent.recent_rank
  ) select coalesce(bool_or(overlap_count=8),false),coalesce(bool_or(recent_rank<=3 and overlap_count>=7),false) into v_exact_repeat,v_near_repeat from overlaps;
  if v_attempt=12 or (not v_exact_repeat and not v_near_repeat and (not v_elite_trio or random()<0.20)) then exit; end if;
 end loop;
 select array_agg(slot order by random()) into v_slot_order from generate_series(1,8) slot;
 if array_length(v_refs,1)<>8 or array_length(v_slot_order,1)<>8 then raise exception 'Cowboys Teams board shuffle failed'; end if;
 for v_position in 1..8 loop
  v_index:=v_slot_order[v_position]; select * into v_season from private.draft_room_cowboys_teams_pool where season_reference=v_refs[v_index]; v_item_reference:='cowboys-team-'||v_position::text;
  insert into private.draft_room_cowboys_teams_board_entries values(p_auction_id,v_position,v_item_reference,v_shape,v_variant,v_index,v_season.season_reference,v_season.season_year,v_season.display_label,v_season.quality_band);
  insert into private.auction_deck_entries(auction_id,deck_position,private_item_reference) values(p_auction_id,v_position,v_item_reference);
 end loop;
end; $$;
revoke all on function private.generate_draft_room_cowboys_teams_deck(uuid) from public, anon, authenticated;

create or replace function private.grade_draft_room_cowboys_teams(p_auction_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_game private.auction_games; v_cc integer; v_rc integer; v_cs numeric(5,2); v_rs numeric(5,2); v_winner uuid;
begin
 select * into v_game from private.auction_games where id=p_auction_id for update;
 if v_game.id is null or v_game.mode_id<>'cowboys-teams-2007' or v_game.grading_version<>'football-draft-room-cowboys-teams-2007-grading-2026-09-v1' then raise exception 'Cowboys Teams grading boundary is invalid'; end if;
 select count(*),round(avg(season.hidden_grade),2) into v_cc,v_cs from private.auction_awards award join private.auction_deck_entries deck on deck.id=award.deck_entry_id and deck.auction_id=award.auction_id join private.draft_room_cowboys_teams_board_entries entry on entry.auction_id=award.auction_id and entry.item_reference=deck.private_item_reference join private.draft_room_cowboys_teams_pool season on season.season_reference=entry.season_reference where award.auction_id=p_auction_id and award.awarded_to=v_game.challenger_id;
 select count(*),round(avg(season.hidden_grade),2) into v_rc,v_rs from private.auction_awards award join private.auction_deck_entries deck on deck.id=award.deck_entry_id and deck.auction_id=award.auction_id join private.draft_room_cowboys_teams_board_entries entry on entry.auction_id=award.auction_id and entry.item_reference=deck.private_item_reference join private.draft_room_cowboys_teams_pool season on season.season_reference=entry.season_reference where award.auction_id=p_auction_id and award.awarded_to=v_game.recipient_id;
 if v_cc<>4 or v_rc<>4 or v_cs not between 0 and 100 or v_rs not between 0 and 100 then raise exception 'Cowboys Teams grading inputs are incomplete or invalid'; end if;
 v_winner:=case when v_cs>v_rs then v_game.challenger_id when v_rs>v_cs then v_game.recipient_id else null end;
 update private.auction_games set lifecycle_state='completed',challenger_final_score=v_cs,recipient_final_score=v_rs,winner_profile_id=v_winner,revision=revision+1,updated_at=now() where id=p_auction_id;
 update public.play_challenges set completed_at=coalesce(completed_at,now()),creator_result=jsonb_build_object('overall_score',v_cs),responder_result=jsonb_build_object('overall_score',v_rs) where id=v_game.challenge_id;
end; $$;
revoke all on function private.grade_draft_room_cowboys_teams(uuid) from public, anon, authenticated;

alter table private.auction_games drop constraint auction_games_mode_valid, drop constraint auction_games_round_valid, drop constraint auction_games_selection_counts_valid, drop constraint auction_games_bankroll_ceiling;
alter table private.auction_games add constraint auction_games_mode_valid check(mode_id in ('ultimate-fighter','jon-jones-performances','conor-mcgregor-performances','charles-oliveira-performances','fighter-performances','strikers','grapplers','knockout-artists','greatest-ufc-card','championship-performances','finishes','dominant-performances','wars','rivalries','iconic-moments','nicknames','build-qb','build-qb-cfb','trio-nfl','trio-cfb','longhorns-2005','longhorns-teams-2005','cowboys-teams-2007')),
 add constraint auction_games_round_valid check(current_round>=1 and current_round<=case when mode_id in('trio-nfl','trio-cfb') then 6 when mode_id in('longhorns-2005','longhorns-teams-2005','cowboys-teams-2007') then 8 when content_version='football-draft-room-2026-09-v6' and mode_id in('build-qb','build-qb-cfb') then 8 when mode_id in('ultimate-fighter','build-qb','build-qb-cfb') then 10 when lifecycle_state in('completed','cancelled','abandoned') then 8 when content_version in('ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5','ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8') then 6 else 8 end),
 add constraint auction_games_selection_counts_valid check(challenger_selection_count between 0 and case when mode_id in('trio-nfl','trio-cfb') then 3 when mode_id in('longhorns-2005','longhorns-teams-2005','cowboys-teams-2007') then 4 when content_version='football-draft-room-2026-09-v6' and mode_id in('build-qb','build-qb-cfb') then 4 when mode_id in('ultimate-fighter','build-qb','build-qb-cfb') then 5 when lifecycle_state in('completed','cancelled','abandoned') then 4 when content_version in('ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5','ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8') then 3 else 4 end and recipient_selection_count between 0 and case when mode_id in('trio-nfl','trio-cfb') then 3 when mode_id in('longhorns-2005','longhorns-teams-2005','cowboys-teams-2007') then 4 when content_version='football-draft-room-2026-09-v6' and mode_id in('build-qb','build-qb-cfb') then 4 when mode_id in('ultimate-fighter','build-qb','build-qb-cfb') then 5 when lifecycle_state in('completed','cancelled','abandoned') then 4 when content_version in('ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5','ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8') then 3 else 4 end),
 add constraint auction_games_bankroll_ceiling check(challenger_bankroll<=case when mode_id in('trio-nfl','trio-cfb') then 30 when mode_id in('longhorns-2005','longhorns-teams-2005','cowboys-teams-2007') then 40 when content_version='football-draft-room-2026-09-v6' and mode_id in('build-qb','build-qb-cfb') then 40 when mode_id in('ultimate-fighter','build-qb','build-qb-cfb') then 50 when lifecycle_state in('completed','cancelled','abandoned') then 40 when content_version in('ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5','ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8') then 30 else 40 end and recipient_bankroll<=case when mode_id in('trio-nfl','trio-cfb') then 30 when mode_id in('longhorns-2005','longhorns-teams-2005','cowboys-teams-2007') then 40 when content_version='football-draft-room-2026-09-v6' and mode_id in('build-qb','build-qb-cfb') then 40 when mode_id in('ultimate-fighter','build-qb','build-qb-cfb') then 50 when lifecycle_state in('completed','cancelled','abandoned') then 40 when content_version in('ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5','ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8') then 30 else 40 end);

do $$ declare v_definition text; v_next text; begin
 v_definition:=pg_get_functiondef('private.generate_auction_deck(uuid,text,text,integer,double precision[])'::regprocedure);
 v_next:=replace(v_definition,E'begin\n  if p_mode_id = ''longhorns-teams-2005'' then',E'begin\n  if p_mode_id = ''cowboys-teams-2007'' then\n    if p_count <> 8 then raise exception ''Cowboys Teams Since 2007 deck must contain eight seasons''; end if;\n    if p_random_order is not null then raise exception ''Injected Auction random order is unavailable for Cowboys Teams rooms''; end if;\n    perform private.generate_draft_room_cowboys_teams_deck(p_auction_id);\n    return;\n  end if;\n\n  if p_mode_id = ''longhorns-teams-2005'' then'); if v_next=v_definition then raise exception 'Cowboys Teams generator contract drifted'; end if; execute v_next;

 v_definition:=pg_get_functiondef('private.validate_auction_catalog_deck_entry()'::regprocedure);
 v_next:=replace(v_definition,E'begin\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_longhorn_teams_board_entries team',E'begin\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_cowboys_teams_board_entries cowboys on cowboys.auction_id = auction.id\n    where auction.id = new.auction_id and auction.mode_id = ''cowboys-teams-2007'' and cowboys.item_reference = new.private_item_reference\n  ) then return new; end if;\n\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_longhorn_teams_board_entries team'); if v_next=v_definition then raise exception 'Cowboys Teams deck validation contract drifted'; end if; execute v_next;

 v_definition:=pg_get_functiondef('private.validate_auction_private_row()'::regprocedure); v_next:=replace(v_definition,E'when v_auction.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 8',E'when v_auction.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-teams-2007'') then 8'); if v_next=v_definition then raise exception 'Cowboys private-row contract drifted'; end if; execute v_next;
 v_definition:=pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure); v_next:=replace(v_definition,E'when p_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 4',E'when p_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-teams-2007'') then 4'); if v_next=v_definition then raise exception 'Cowboys bid contract drifted'; end if; execute v_next;
 v_definition:=pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure); v_next:=replace(v_definition,E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 4',E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-teams-2007'') then 4'); v_next:=replace(v_next,E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 8',E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-teams-2007'') then 8'); if v_next=v_definition then raise exception 'Cowboys resolution contract drifted'; end if; execute v_next;
 v_definition:=pg_get_functiondef('private.grade_auction(uuid)'::regprocedure); v_next:=replace(v_definition,E'  if v_game.mode_id = ''longhorns-teams-2005''',E'  if v_game.mode_id = ''cowboys-teams-2007'' and v_game.grading_version = ''football-draft-room-cowboys-teams-2007-grading-2026-09-v1'' then\n    perform private.grade_draft_room_cowboys_teams(p_auction_id); return;\n  end if;\n\n  if v_game.mode_id = ''longhorns-teams-2005'''); if v_next=v_definition then raise exception 'Cowboys grading contract drifted'; end if; execute v_next;

 v_definition:=pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure); v_next:=replace(v_definition,E'    ''longhorns-teams-2005''',E'    ''longhorns-teams-2005'',\n    ''cowboys-teams-2007'''); v_next:=replace(v_next,E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'')',E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-teams-2007'')'); v_next:=replace(v_next,E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 8',E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-teams-2007'') then 8'); v_next:=replace(v_next,E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 40',E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-teams-2007'') then 40'); if v_next=v_definition then raise exception 'Cowboys preparation contract drifted'; end if; execute v_next;

 v_definition:=pg_get_functiondef('public.send_auction_first_bid(uuid,bigint,numeric,text)'::regprocedure); v_next:=replace(v_definition,E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'')',E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-teams-2007'')'); v_next:=replace(v_next,E'    when v_game.mode_id = ''longhorns-teams-2005'' then ''Longhorns Teams Since 2005''',E'    when v_game.mode_id = ''longhorns-teams-2005'' then ''Longhorns Teams Since 2005''\n    when v_game.mode_id = ''cowboys-teams-2007'' then ''Cowboys Teams Since 2007'''); v_next:=replace(v_next,E'when v_game.mode_id = ''longhorns-teams-2005'' then v_creator_name || '' challenged you to Longhorns Teams Since 2005.''',E'when v_game.mode_id = ''longhorns-teams-2005'' then v_creator_name || '' challenged you to Longhorns Teams Since 2005.''\n    when v_game.mode_id = ''cowboys-teams-2007'' then v_creator_name || '' challenged you to Cowboys Teams Since 2007.'''); if v_next=v_definition then raise exception 'Cowboys first-bid contract drifted'; end if; execute v_next;

 v_definition:=pg_get_functiondef('public.submit_auction_bid(uuid,integer,bigint,numeric,text)'::regprocedure); v_next:=replace(v_definition,E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'')',E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-teams-2007'')'); if v_next=v_definition then raise exception 'Cowboys submit-bid contract drifted'; end if; execute v_next;
 v_definition:=pg_get_functiondef('private.sync_auction_challenge_decline()'::regprocedure); v_next:=replace(v_definition,E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'')',E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-teams-2007'')'); if v_next=v_definition then raise exception 'Cowboys decline contract drifted'; end if; execute v_next;
 v_definition:=pg_get_functiondef('public.cancel_auction(uuid,bigint)'::regprocedure); v_next:=replace(v_definition,E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'')',E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-teams-2007'')'); if v_next=v_definition then raise exception 'Cowboys cancellation contract drifted'; end if; execute v_next;

 v_definition:=pg_get_functiondef('public.get_auction_participant_state(uuid)'::regprocedure);
 v_next:=replace(v_definition,E'      left join private.draft_room_longhorn_teams_board_entries longhorn_team\n        on longhorn_team.auction_id = auction.id\n        and longhorn_team.item_reference = deck.private_item_reference',E'      left join private.draft_room_longhorn_teams_board_entries longhorn_team\n        on longhorn_team.auction_id = auction.id\n        and longhorn_team.item_reference = deck.private_item_reference\n      left join private.draft_room_cowboys_teams_board_entries cowboys_team\n        on cowboys_team.auction_id = auction.id\n        and cowboys_team.item_reference = deck.private_item_reference');
 v_next:=replace(v_next,E'        left join private.draft_room_longhorn_teams_board_entries longhorn_team\n          on longhorn_team.auction_id = auction.id\n          and longhorn_team.item_reference = deck.private_item_reference',E'        left join private.draft_room_longhorn_teams_board_entries longhorn_team\n          on longhorn_team.auction_id = auction.id\n          and longhorn_team.item_reference = deck.private_item_reference\n        left join private.draft_room_cowboys_teams_board_entries cowboys_team\n          on cowboys_team.auction_id = auction.id\n          and cowboys_team.item_reference = deck.private_item_reference');
 v_next:=replace(v_next,'coalesce(catalog.display_label, trio.display_label, longhorn.display_name, longhorn_team.display_label)','coalesce(catalog.display_label, trio.display_label, longhorn.display_name, longhorn_team.display_label, cowboys_team.display_label)');
 v_next:=replace(v_next,'catalog.item_reference is not null or trio.item_reference is not null or longhorn.item_reference is not null or longhorn_team.item_reference is not null','catalog.item_reference is not null or trio.item_reference is not null or longhorn.item_reference is not null or longhorn_team.item_reference is not null or cowboys_team.item_reference is not null');
 if v_next=v_definition then raise exception 'Cowboys participant projection contract drifted'; end if; execute v_next;
end; $$;

do $$ begin
 if (select count(*) from private.draft_room_cowboys_teams_pool)<>19 then raise exception 'Cowboys Teams Since 2007 must contain exactly 19 completed seasons'; end if;
 if exists(select 1 from private.draft_room_cowboys_teams_pool where season_year=2026) then raise exception 'Incomplete 2026 season must not enter Cowboys Teams Since 2007'; end if;
 if (select count(*) from private.draft_room_cowboys_teams_board_shapes)<>6 or (select count(*) from private.draft_room_cowboys_teams_board_variants)<>24 then raise exception 'Cowboys Teams board calibration must define six shapes and 24 variants'; end if;
 if (select sum(roll_end-roll_start) from private.draft_room_cowboys_teams_board_shapes)<>1 then raise exception 'Cowboys Teams board-shape weights must cover exactly 100 percent'; end if;
end; $$;