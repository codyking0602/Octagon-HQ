begin;
select set_config('request.jwt.claim.role','service_role',true);
do $$
declare challenger uuid:=extensions.gen_random_uuid(); recipient uuid:=extensions.gen_random_uuid(); outsider uuid:=extensions.gen_random_uuid(); auction uuid; resumed uuid; code text; rev bigint; state record; rejected boolean;
begin
 insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data) values
 (challenger,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','engine-challenger@test.dev','',now(),now(),now(),'{}'),
 (recipient,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','engine-recipient@test.dev','',now(),now(),now(),'{}'),
 (outsider,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','engine-outsider@test.dev','',now(),now(),now(),'{}');
 insert into public.profiles(id,display_name,normalized_name,initials) values
 (challenger,'Engine Challenger','ENGINE CHALLENGER','EC'),(recipient,'Engine Recipient','ENGINE RECIPIENT','ER'),(outsider,'Engine Outsider','ENGINE OUTSIDER','EO');
 perform set_config('request.jwt.claim.role','authenticated',true); perform set_config('request.jwt.claim.sub',challenger::text,true);
 auction:=public.prepare_auction(recipient,'strikers'); resumed:=public.prepare_auction(recipient,'strikers');
 if auction<>resumed then raise exception 'prepare rerolled instead of resuming'; end if;
 if (select count(*) from private.auction_deck_entries where auction_id=auction)<>8 then raise exception 'ordinary deck is not eight items'; end if;
 if (select count(distinct private_item_reference) from private.auction_deck_entries where auction_id=auction)<>8 then raise exception 'deck contains duplicates'; end if;
 perform set_config('request.jwt.claim.sub',recipient::text,true);
 if exists(select 1 from public.get_auction_participant_state(auction)) then raise exception 'recipient discovered prepared Auction'; end if;
 perform set_config('request.jwt.claim.sub',outsider::text,true);
 if exists(select 1 from public.get_auction_participant_state(auction)) then raise exception 'outsider discovered prepared Auction'; end if;
 perform set_config('request.jwt.claim.sub',challenger::text,true);
 rejected:=false; begin perform public.send_auction_first_bid(auction,0,38,null); exception when others then rejected:=true; end;
 if not rejected then raise exception 'reserve maximum accepted unsafe bid'; end if;
 code:=public.send_auction_first_bid(auction,0,20,null);
 if (select count(*) from public.play_challenges where public.play_challenges.code=code and game_id='auction')<>1 then raise exception 'canonical challenge was not created exactly once'; end if;
 if not exists(select 1 from private.notification_events where recipient_profile_id=recipient and source_key='auction:received:'||auction) then raise exception 'canonical notification was not published'; end if;
 perform set_config('request.jwt.claim.sub',recipient::text,true); select revision into rev from private.auction_games where id=auction;
 perform public.submit_auction_bid(auction,1,rev,10,null); select * into state from private.auction_games where id=auction;
 if state.lifecycle_state<>'active' or state.current_round<>2 or state.challenger_bankroll<>20 or state.recipient_bankroll<>40 or state.challenger_selection_count<>1 then raise exception 'higher-bid resolution arithmetic failed'; end if;
 if (select count(*) from private.auction_awards where auction_id=auction)<>1 then raise exception 'round resolved more than once'; end if;
 rejected:=false; begin perform public.submit_auction_bid(auction,1,state.revision,10,null); exception when others then rejected:=true; end;
 if not rejected then raise exception 'wrong-round duplicate bid was accepted'; end if;
 perform set_config('request.jwt.claim.sub',outsider::text,true);
 if exists(select 1 from public.get_auction_participant_state(auction)) then raise exception 'outsider read sent Auction'; end if;
 perform set_config('request.jwt.claim.role','service_role',true); perform set_config('request.jwt.claim.sub','',true);
 if exists(select 1 from information_schema.routine_privileges where routine_schema='private' and routine_name='generate_auction_deck' and grantee='authenticated') then raise exception 'test generator leaked to clients'; end if;
end $$;
rollback;
