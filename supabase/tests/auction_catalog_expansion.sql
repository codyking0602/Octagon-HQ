begin;
select plan(23);
select is((select count(*)::integer from private.auction_catalog_versions where content_version='ufc-auction-2026-08-v2'), 1, 'v2 version exists');
select is((select count(*)::integer from private.auction_catalog where content_version='ufc-auction-2026-08-v2'), 811, 'v2 has every reviewed item');
select is((select count(distinct mode_id)::integer from private.auction_catalog where content_version='ufc-auction-2026-08-v2'), 16, 'all modes exist');
select is((select count(*)::integer from private.auction_catalog where content_version='ufc-auction-2026-08-v2' and mode_id='jon-jones-performances'), 24, 'Jones history complete');
select is((select count(*)::integer from private.auction_catalog where content_version='ufc-auction-2026-08-v2' and mode_id='conor-mcgregor-performances'), 14, 'McGregor history complete');
select is((select count(*)::integer from private.auction_catalog where content_version='ufc-auction-2026-08-v2' and mode_id='charles-oliveira-performances'), 37, 'Oliveira history complete');
select ok(not has_table_privilege('authenticated','private.auction_catalog','select'), 'catalog remains private');
select ok((select bool_and(content_version='ufc-auction-2026-08-v2') from private.auction_catalog_versions where is_preparation_version), 'new preparations pin v2');
select like(pg_get_functiondef('private.grade_auction(uuid)'::regprocedure), '%ufc-auction-2026-08-v1%', 'grader retains pinned v1');
select like(pg_get_functiondef('private.grade_auction(uuid)'::regprocedure), '%ufc-auction-2026-08-v2%', 'grader accepts pinned v2');
select is((select (grading_inputs->>'overall')::integer from private.auction_catalog where content_version='ufc-auction-2026-08-v1' and mode_id='ultimate-fighter' and display_label='Jon Jones'), (select (grading_inputs->>'overall')::integer from private.auction_catalog where content_version='ufc-auction-2026-08-v2' and mode_id='ultimate-fighter' and display_label='Jon Jones'), 'copied item absolute value is invariant');
select ok((select bool_and(grading_inputs ?& array['Striking','Grappling','Frame','Power','Heart']) from private.auction_catalog where content_version='ufc-auction-2026-08-v2' and mode_id='ultimate-fighter'), 'all Ultimate Fighter categories exist');

-- Exercise the real generator with deterministic injected randomness.
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data) values
('00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-000000000000','authenticated','authenticated','auction-v2-d1@login.octagon-hq.app','',now(),now(),now(),'{}'),
('00000000-0000-0000-0000-0000000000d2','00000000-0000-0000-0000-000000000000','authenticated','authenticated','auction-v2-d2@login.octagon-hq.app','',now(),now(),now(),'{}');
insert into public.profiles(id,display_name,normalized_name,initials) values
('00000000-0000-0000-0000-0000000000d1','Auction V2 D1','AUCTION V2 D1','D1'),
('00000000-0000-0000-0000-0000000000d2','Auction V2 D2','AUCTION V2 D2','D2');
insert into private.auction_games(id,challenger_id,recipient_id,mode_id,lifecycle_state,content_version,rarity_version,grading_version,tie_priority_profile_id,challenger_bankroll,recipient_bankroll)
values ('00000000-0000-0000-0000-0000000000d3','00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000d2','strikers','prepared','ufc-auction-2026-08-v2','balanced-rarity-2026-08-v2','ufc-private-grader-2026-08-v2','00000000-0000-0000-0000-0000000000d1',40,40);
select private.generate_auction_deck('00000000-0000-0000-0000-0000000000d3','ufc-auction-2026-08-v2','strikers',8,array_fill(0.125::double precision,array[48]));
select is((select count(*)::integer from private.auction_deck_entries where auction_id='00000000-0000-0000-0000-0000000000d3'),8,'canonical v2 generator returns eight items');
select is((select count(distinct private_item_reference)::integer from private.auction_deck_entries where auction_id='00000000-0000-0000-0000-0000000000d3'),8,'canonical v2 generator has no duplicates');
select ok((select count(*) <= 2 from private.auction_deck_entries d join private.auction_catalog c on c.content_version='ufc-auction-2026-08-v2' and c.mode_id='strikers' and c.item_reference=d.private_item_reference where d.auction_id='00000000-0000-0000-0000-0000000000d3' and c.private_generation_class='ace'),'canonical v2 generator respects ace cap');
select ok((select count(*) <= 4 from private.auction_deck_entries d join private.auction_catalog c on c.content_version='ufc-auction-2026-08-v2' and c.mode_id='strikers' and c.item_reference=d.private_item_reference where d.auction_id='00000000-0000-0000-0000-0000000000d3' and c.rarity_band>=4),'canonical v2 generator respects high-end cap');

-- Grade real pinned v1 and v2 fixtures through the one canonical grader.
do $$
declare v_ver text; v_game uuid; v_challenge uuid; v_suffix integer:=0;
begin
 for v_ver in select unnest(array['ufc-auction-2026-08-v1','ufc-auction-2026-08-v2']) loop
  v_suffix:=v_suffix+1; v_game:=case v_suffix when 1 then '00000000-0000-0000-0000-0000000000d4'::uuid else '00000000-0000-0000-0000-0000000000d5'::uuid end;
  insert into public.play_challenges(code,game_id,game_version,game_title,summary,creator_id,recipient_id,play_url,setup,creator_result) values ('V2STD00'||v_suffix,'auction','auction-server-v3','Auction','strikers','00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000d2','/play/auction?auction='||v_game,'{}','{}') returning id into v_challenge;
  insert into private.auction_games(id,challenger_id,recipient_id,mode_id,challenge_id,lifecycle_state,content_version,rarity_version,grading_version,current_round,tie_priority_profile_id,challenger_bankroll,recipient_bankroll,challenger_selection_count,recipient_selection_count) values
  (v_game,'00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000d2','strikers',v_challenge,'active',v_ver,case when v_suffix=1 then 'balanced-rarity-2026-08-v1' else 'balanced-rarity-2026-08-v2' end,case when v_suffix=1 then 'ufc-private-grader-2026-08-v1' else 'ufc-private-grader-2026-08-v2' end,8,'00000000-0000-0000-0000-0000000000d1',20,20,4,4);
  insert into private.auction_deck_entries(auction_id,deck_position,private_item_reference) select v_game,n,'strikers-'||n from generate_series(1,8)n;
  insert into private.auction_awards(auction_id,deck_entry_id,awarded_to,resolved_round) select v_game,id,case when deck_position<=4 then '00000000-0000-0000-0000-0000000000d1'::uuid else '00000000-0000-0000-0000-0000000000d2'::uuid end,deck_position from private.auction_deck_entries where auction_id=v_game;
  perform private.grade_auction(v_game);
 end loop;
end $$;
select is((select challenger_final_score from private.auction_games where id='00000000-0000-0000-0000-0000000000d4'),(select challenger_final_score from private.auction_games where id='00000000-0000-0000-0000-0000000000d5'),'identical v1/v2 inputs have identical contribution');
select is((select challenger_final_score from private.auction_games where id='00000000-0000-0000-0000-0000000000d5'),(select round(avg((grading_inputs->>'overall')::numeric),2) from private.auction_catalog where content_version='ufc-auction-2026-08-v2' and mode_id='strikers' and item_reference in ('strikers-1','strikers-2','strikers-3','strikers-4')),'standard v2 grade is arithmetic mean of four');
select is((select lifecycle_state from private.auction_games where id='00000000-0000-0000-0000-0000000000d4'),'completed','existing pinned v1 game remains supported');

-- Exercise ten-card Ultimate Fighter generation and five-category grading.
insert into private.auction_games(id,challenger_id,recipient_id,mode_id,lifecycle_state,content_version,rarity_version,grading_version,tie_priority_profile_id,challenger_bankroll,recipient_bankroll)
values ('00000000-0000-0000-0000-0000000000d6','00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000d2','ultimate-fighter','prepared','ufc-auction-2026-08-v2','balanced-rarity-2026-08-v2','ufc-private-grader-2026-08-v2','00000000-0000-0000-0000-0000000000d1',50,50);
select private.generate_auction_deck('00000000-0000-0000-0000-0000000000d6','ufc-auction-2026-08-v2','ultimate-fighter',10,array_fill(0.25::double precision,array[80]));
select is((select count(*)::integer from private.auction_deck_entries where auction_id='00000000-0000-0000-0000-0000000000d6'),10,'canonical Ultimate Fighter generator returns ten items');
select is((select count(distinct private_item_reference)::integer from private.auction_deck_entries where auction_id='00000000-0000-0000-0000-0000000000d6'),10,'canonical Ultimate Fighter generator has no duplicates');
select ok((select count(*) <= 2 from private.auction_deck_entries d join private.auction_catalog c on c.content_version='ufc-auction-2026-08-v2' and c.mode_id='ultimate-fighter' and c.item_reference=d.private_item_reference where d.auction_id='00000000-0000-0000-0000-0000000000d6' and c.private_generation_class in ('mythic','crown')),'canonical Ultimate Fighter generator respects crown cap');

do $$ declare v_challenge uuid; v_game constant uuid:='00000000-0000-0000-0000-0000000000d7'; begin
 insert into public.play_challenges(code,game_id,game_version,game_title,summary,creator_id,recipient_id,play_url,setup,creator_result) values ('V2ULT001','auction','auction-server-v3','Auction','ultimate-fighter','00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000d2','/play/auction?auction='||v_game,'{}','{}') returning id into v_challenge;
 insert into private.auction_games(id,challenger_id,recipient_id,mode_id,challenge_id,lifecycle_state,content_version,rarity_version,grading_version,current_round,tie_priority_profile_id,challenger_bankroll,recipient_bankroll,challenger_selection_count,recipient_selection_count) values (v_game,'00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000d2','ultimate-fighter',v_challenge,'active','ufc-auction-2026-08-v2','balanced-rarity-2026-08-v2','ufc-private-grader-2026-08-v2',10,'00000000-0000-0000-0000-0000000000d1',25,25,5,5);
 insert into private.auction_deck_entries(auction_id,deck_position,private_item_reference) select v_game,n,'ultimate-fighter-'||n from generate_series(1,10)n;
 insert into private.auction_awards(auction_id,deck_entry_id,awarded_to,resolved_round,visible_category)
 select v_game,d.id,case when d.deck_position<=5 then '00000000-0000-0000-0000-0000000000d1'::uuid else '00000000-0000-0000-0000-0000000000d2'::uuid end,d.deck_position,(array['Striking','Grappling','Frame','Power','Heart'])[((d.deck_position-1)%5)+1] from private.auction_deck_entries d where d.auction_id=v_game;
 perform private.grade_auction(v_game);
end $$;
select is((select challenger_final_score from private.auction_games where id='00000000-0000-0000-0000-0000000000d7'),(select round(avg((c.grading_inputs->>a.visible_category)::numeric),2) from private.auction_awards a join private.auction_deck_entries d on d.id=a.deck_entry_id join private.auction_catalog c on c.content_version='ufc-auction-2026-08-v2' and c.mode_id='ultimate-fighter' and c.item_reference=d.private_item_reference where a.auction_id='00000000-0000-0000-0000-0000000000d7' and a.awarded_to='00000000-0000-0000-0000-0000000000d1'),'Ultimate Fighter v2 grade is arithmetic mean of five categories');

select * from finish();
rollback;
