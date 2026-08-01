-- Auction PR 3: the complete game engine lives behind authenticated, transactional RPCs.
-- Catalog rows, complete decks, pending bids, intent, and randomness stay in private.

create table private.auction_catalog (
  content_version text not null,
  mode_id text not null,
  item_reference text not null,
  display_label text not null,
  rarity_band integer not null check (rarity_band between 1 and 5),
  primary key (content_version, mode_id, item_reference),
  unique (content_version, mode_id, display_label)
);

alter table private.auction_catalog enable row level security;
revoke all on private.auction_catalog from public, anon, authenticated;

-- A deliberately small reviewed fixture. The generator selects a requested deck size;
-- it does not assume this fixture's size and can accept a larger future catalog unchanged.
insert into private.auction_catalog(content_version, mode_id, item_reference, display_label, rarity_band)
select 'fixture-2026-08-22-v1', mode.mode_id,
       mode.mode_id || '-item-' || item.n,
       mode.label || ' ' || item.n,
       1 + ((item.n - 1) % 5)
from (values
 ('ultimate-fighter','Ultimate Fighter'),('jon-jones-performances','Jon Jones Performance'),
 ('conor-mcgregor-performances','Conor McGregor Performance'),('charles-oliveira-performances','Charles Oliveira Performance'),
 ('fighter-performances','Fighter Performance'),('strikers','Striker'),('grapplers','Grappler'),
 ('knockout-artists','Knockout Artist'),('greatest-ufc-card','UFC Card Fight'),
 ('championship-performances','Championship Performance'),('finishes','Finish'),
 ('dominant-performances','Dominant Performance'),('wars','War'),('rivalries','Rivalry'),
 ('iconic-moments','Iconic Moment'),('nicknames','Nickname')
) mode(mode_id,label)
cross join generate_series(1, 12) item(n);

create unique index auction_one_prepared_choice
  on private.auction_games(challenger_id, recipient_id, mode_id)
  where lifecycle_state = 'prepared';

create or replace function private.generate_auction_deck(
  p_auction_id uuid, p_mode_id text, p_count integer, p_random_order double precision[] default null
) returns void language plpgsql security definer set search_path = '' as $$
declare v_available integer;
begin
  if p_count < 1 then raise exception 'invalid deck size'; end if;
  select count(*) into v_available from private.auction_catalog
   where content_version='fixture-2026-08-22-v1' and mode_id=p_mode_id;
  if v_available < p_count then raise exception 'catalog does not contain enough unique items'; end if;
  if p_random_order is not null and cardinality(p_random_order) < v_available then
    raise exception 'test randomness does not cover the catalog';
  end if;
  insert into private.auction_deck_entries(auction_id,deck_position,private_item_reference)
  select p_auction_id, row_number() over(order by random_key,item_reference), item_reference
  from (
    select item_reference,
      case when p_random_order is null then
        ('x'||substr(encode(extensions.digest(item_reference || extensions.gen_random_bytes(16)::text,'sha256'),'hex'),1,16))::bit(64)::bigint::double precision
      else p_random_order[row_number() over(order by item_reference)] end random_key
    from private.auction_catalog
    where content_version='fixture-2026-08-22-v1' and mode_id=p_mode_id
  ) candidates order by random_key,item_reference limit p_count;
end $$;

create or replace function public.prepare_auction(p_recipient_id uuid, p_mode_id text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); v_id uuid; v_rounds integer; v_bankroll integer; v_tie uuid;
begin
  if v_actor is null then raise exception 'sign in required'; end if;
  if p_recipient_id is null or not exists(select 1 from public.profiles where id=p_recipient_id) then raise exception 'opponent not found'; end if;
  if p_recipient_id=v_actor then raise exception 'self-challenges are not allowed'; end if;
  if p_mode_id not in ('ultimate-fighter','jon-jones-performances','conor-mcgregor-performances','charles-oliveira-performances','fighter-performances','strikers','grapplers','knockout-artists','greatest-ufc-card','championship-performances','finishes','dominant-performances','wars','rivalries','iconic-moments','nicknames') then raise exception 'invalid Auction mode'; end if;
  select id into v_id from private.auction_games where challenger_id=v_actor and recipient_id=p_recipient_id and mode_id=p_mode_id and lifecycle_state='prepared' for update;
  if found then return v_id; end if;
  v_rounds:=case when p_mode_id='ultimate-fighter' then 10 else 8 end;
  v_bankroll:=case when p_mode_id='ultimate-fighter' then 50 else 40 end;
  v_tie:=case when get_byte(extensions.gen_random_bytes(1),0)<128 then v_actor else p_recipient_id end;
  begin
    insert into private.auction_games(challenger_id,recipient_id,mode_id,content_version,rarity_version,grading_version,tie_priority_profile_id,challenger_bankroll,recipient_bankroll)
    values(v_actor,p_recipient_id,p_mode_id,'fixture-2026-08-22-v1','rarity-fixture-v1','grader-contract-v1',v_tie,v_bankroll,v_bankroll) returning id into v_id;
  exception when unique_violation then
    select id into v_id from private.auction_games where challenger_id=v_actor and recipient_id=p_recipient_id and mode_id=p_mode_id and lifecycle_state='prepared';
    return v_id;
  end;
  perform private.generate_auction_deck(v_id,p_mode_id,v_rounds,null);
  return v_id;
end $$;

create or replace function public.abandon_prepared_auction(p_auction_id uuid, p_expected_revision bigint)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  update private.auction_games set lifecycle_state='abandoned',revision=revision+1,updated_at=now()
   where id=p_auction_id and challenger_id=auth.uid() and lifecycle_state='prepared' and revision=p_expected_revision;
  if not found then raise exception 'prepared Auction not found or stale revision'; end if;
  return true;
end $$;

create or replace function private.validate_auction_bid(p_game private.auction_games,p_actor uuid,p_amount numeric,p_category text)
returns void language plpgsql set search_path='' as $$
declare v_bankroll integer; v_count integer; v_required integer; v_max integer;
begin
  if p_amount is null or p_amount<>trunc(p_amount) or p_amount<1 then raise exception 'bid must be a whole dollar amount of at least $1'; end if;
  v_required:=case when p_game.mode_id='ultimate-fighter' then 5 else 4 end;
  if p_actor=p_game.challenger_id then v_bankroll:=p_game.challenger_bankroll;v_count:=p_game.challenger_selection_count;
  elsif p_actor=p_game.recipient_id then v_bankroll:=p_game.recipient_bankroll;v_count:=p_game.recipient_selection_count;
  else raise exception 'not an Auction participant'; end if;
  if v_count>=v_required then raise exception 'collection is already full'; end if;
  v_max:=v_bankroll-(v_required-(v_count+1));
  if p_amount>v_max then raise exception 'bid exceeds reserve maximum of $%',v_max; end if;
  if p_game.mode_id='ultimate-fighter' then
    if p_category not in ('Striking','Grappling','Frame','Power','Heart') then raise exception 'an available Ultimate Fighter category is required'; end if;
    if exists(select 1 from private.auction_awards where auction_id=p_game.id and awarded_to=p_actor and visible_category=p_category) then raise exception 'Ultimate Fighter category is already filled'; end if;
  elsif p_category is not null then raise exception 'category intent is only valid for Ultimate Fighter'; end if;
end $$;

create or replace function private.complete_auction_placeholder(p_id uuid) returns void
language plpgsql set search_path='' as $$
begin
  -- PR 3 owns only the completion boundary. The future private grader replaces
  -- these neutral contract values without moving grading logic client-side.
  update private.auction_games set lifecycle_state='completed',challenger_final_score=0,
    recipient_final_score=0,winner_profile_id=null,revision=revision+1,updated_at=now() where id=p_id;
  update public.play_challenges set completed_at=coalesce(completed_at,now()),responder_result='{}'::jsonb where id=(select challenge_id from private.auction_games where id=p_id);
end $$;

create or replace function private.resolve_auction_round(p_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare g private.auction_games; cb private.auction_pending_bids; rb private.auction_pending_bids;
 d private.auction_deck_entries; winner uuid; winning integer; category text; required integer; rounds integer;
 other_id uuid; pos integer; forced_cat text;
begin
 select * into g from private.auction_games where id=p_id for update;
 select * into cb from private.auction_pending_bids where auction_id=p_id and round_number=g.current_round and bidder_id=g.challenger_id;
 select * into rb from private.auction_pending_bids where auction_id=p_id and round_number=g.current_round and bidder_id=g.recipient_id;
 if cb is null or rb is null then return; end if;
 select * into d from private.auction_deck_entries where auction_id=p_id and deck_position=g.current_round;
 if cb.amount>rb.amount then winner:=g.challenger_id;winning:=cb.amount;category:=cb.ultimate_fighter_category;
 elsif rb.amount>cb.amount then winner:=g.recipient_id;winning:=rb.amount;category:=rb.ultimate_fighter_category;
 else winner:=g.tie_priority_profile_id;winning:=cb.amount;category:=case when winner=g.challenger_id then cb.ultimate_fighter_category else rb.ultimate_fighter_category end;
 end if;
 insert into private.auction_awards(auction_id,deck_entry_id,awarded_to,resolved_round,visible_category) values(p_id,d.id,winner,g.current_round,category);
 update private.auction_games set lifecycle_state='active',
   challenger_bankroll=challenger_bankroll-case when winner=challenger_id then winning else 0 end,
   recipient_bankroll=recipient_bankroll-case when winner=recipient_id then winning else 0 end,
   challenger_selection_count=challenger_selection_count+case when winner=challenger_id then 1 else 0 end,
   recipient_selection_count=recipient_selection_count+case when winner=recipient_id then 1 else 0 end,
   tie_priority_profile_id=case when cb.amount=rb.amount then case when tie_priority_profile_id=challenger_id then recipient_id else challenger_id end else tie_priority_profile_id end,
   current_round=least(current_round+1,case when mode_id='ultimate-fighter' then 10 else 8 end),revision=revision+1,updated_at=now() where id=p_id returning * into g;
 required:=case when g.mode_id='ultimate-fighter' then 5 else 4 end; rounds:=required*2;
 if g.challenger_selection_count=required or g.recipient_selection_count=required then
   other_id:=case when g.challenger_selection_count=required then g.recipient_id else g.challenger_id end;
   for pos in g.current_round..rounds loop
     exit when (select count(*) from private.auction_awards where auction_id=p_id and awarded_to=other_id)>=required;
     select * into d from private.auction_deck_entries where auction_id=p_id and deck_position=pos;
     if g.mode_id='ultimate-fighter' then select cat into forced_cat from unnest(array['Striking','Grappling','Frame','Power','Heart']) cat where not exists(select 1 from private.auction_awards where auction_id=p_id and awarded_to=other_id and visible_category=cat) order by array_position(array['Striking','Grappling','Frame','Power','Heart'],cat) limit 1; else forced_cat:=null; end if;
     insert into private.auction_awards(auction_id,deck_entry_id,awarded_to,resolved_round,visible_category) values(p_id,d.id,other_id,pos,forced_cat);
     update private.auction_games set challenger_bankroll=challenger_bankroll-case when other_id=challenger_id then 1 else 0 end,
       recipient_bankroll=recipient_bankroll-case when other_id=recipient_id then 1 else 0 end,
       challenger_selection_count=challenger_selection_count+case when other_id=challenger_id then 1 else 0 end,
       recipient_selection_count=recipient_selection_count+case when other_id=recipient_id then 1 else 0 end,
       current_round=least(pos+1,rounds),revision=revision+1,updated_at=now() where id=p_id;
   end loop;
 end if;
 select * into g from private.auction_games where id=p_id;
 if g.challenger_selection_count=required and g.recipient_selection_count=required then perform private.complete_auction_placeholder(p_id); end if;
end $$;

create or replace function public.send_auction_first_bid(p_auction_id uuid,p_expected_revision bigint,p_amount numeric,p_category text default null)
returns text language plpgsql security definer set search_path='' as $$
declare g private.auction_games; code text; attempt integer:=0; creator_name text;
begin
 select * into g from private.auction_games where id=p_auction_id for update;
 if g.id is null or g.challenger_id<>auth.uid() then raise exception 'challenger only'; end if;
 if g.lifecycle_state<>'prepared' then raise exception 'Auction already sent'; end if;
 if g.revision<>p_expected_revision then raise exception 'stale revision'; end if;
 perform private.validate_auction_bid(g,auth.uid(),p_amount,p_category);
 insert into private.auction_pending_bids values(g.id,1,auth.uid(),p_amount::integer,p_category,now());
 loop attempt:=attempt+1; code:=upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,8));
 begin insert into public.play_challenges(code,game_id,game_version,game_title,summary,creator_id,recipient_id,play_url,setup,creator_result)
 values(code,'auction','server-v3','Auction',g.mode_id,g.challenger_id,g.recipient_id,'/play/auction?challenge='||code,jsonb_build_object('auction_id',g.id,'mode_id',g.mode_id),'{}'); exit;
 exception when unique_violation then if attempt>=5 then raise; end if; end; end loop;
 update private.auction_games set challenge_id=(select id from public.play_challenges where public.play_challenges.code=code),lifecycle_state='sent',revision=revision+1,updated_at=now() where id=g.id;
 select display_name into creator_name from public.profiles where id=g.challenger_id;
 perform private.publish_notification_to_profile(g.recipient_id,'auction:received:'||g.id,'auction:'||g.id,'game_challenge_received','Auction challenge received',creator_name||' challenged you to Auction.','/play/auction?challenge='||code,'VIEW AUCTION',now());
 return code;
end $$;

create or replace function public.submit_auction_bid(p_auction_id uuid,p_round integer,p_expected_revision bigint,p_amount numeric,p_category text default null)
returns bigint language plpgsql security definer set search_path='' as $$
declare g private.auction_games; actor uuid:=auth.uid(); opponent uuid;
begin
 select * into g from private.auction_games where id=p_auction_id for update;
 if g.id is null or actor not in(g.challenger_id,g.recipient_id) then raise exception 'not an Auction participant'; end if;
 if g.lifecycle_state not in('sent','active') then raise exception 'Auction is not accepting bids'; end if;
 if g.lifecycle_state='sent' and actor<>g.recipient_id then raise exception 'recipient must accept with the first bid'; end if;
 if g.current_round<>p_round then raise exception 'wrong round'; end if;
 if g.revision<>p_expected_revision then raise exception 'stale revision'; end if;
 perform private.validate_auction_bid(g,actor,p_amount,p_category);
 begin insert into private.auction_pending_bids values(g.id,p_round,actor,p_amount::integer,p_category,now());
 exception when unique_violation then raise exception 'bid is locked and cannot be edited'; end;
 if g.lifecycle_state='sent' then update public.play_challenges set opened_at=coalesce(opened_at,now()) where id=g.challenge_id; end if;
 perform private.resolve_auction_round(g.id);
 select * into g from private.auction_games where id=g.id;
 if g.lifecycle_state='active' then
   opponent:=case when actor=g.challenger_id then g.recipient_id else g.challenger_id end;
   perform private.publish_notification_to_profile(opponent,'auction:round:'||g.id||':'||g.revision,'auction:'||g.id,'game_challenge_accepted','Auction action required','An Auction round resolved or needs your next bid.','/play/auction?challenge='||(select code from public.play_challenges where id=g.challenge_id),'VIEW AUCTION',now());
 elsif g.lifecycle_state='completed' then
   perform private.publish_notification_to_profile(g.challenger_id,'auction:completed:'||g.id,'auction:'||g.id,'game_challenge_result_ready','Auction completed','Your Auction is complete.','/play/auction?challenge='||(select code from public.play_challenges where id=g.challenge_id),'VIEW RESULT',now());
   perform private.publish_notification_to_profile(g.recipient_id,'auction:completed:'||g.id,'auction:'||g.id,'game_challenge_result_ready','Auction completed','Your Auction is complete.','/play/auction?challenge='||(select code from public.play_challenges where id=g.challenge_id),'VIEW RESULT',now());
 end if;
 return g.revision;
end $$;

-- Keep pre-acceptance decline owned by the canonical Challenge Center command.
create or replace function private.sync_auction_challenge_decline() returns trigger language plpgsql set search_path='' as $$
begin
 if old.declined_at is null and new.declined_at is not null then
   update private.auction_games set lifecycle_state='declined',revision=revision+1,updated_at=now() where challenge_id=new.id and lifecycle_state='sent';
 end if; return new;
end $$;
create trigger play_challenge_sync_auction_decline after update of declined_at on public.play_challenges for each row execute function private.sync_auction_challenge_decline();

drop function public.get_auction_participant_state(uuid);
create function public.get_auction_participant_state(p_auction_id uuid)
returns table(auction_id uuid,challenge_id uuid,challenge_code text,mode_id text,challenger_id uuid,recipient_id uuid,lifecycle_state text,current_round integer,revision bigint,current_item jsonb,tie_priority_profile_id uuid,challenger_bankroll integer,recipient_bankroll integer,challenger_selection_count integer,recipient_selection_count integer,action_required_by text,resolved_collections jsonb,resolved_rounds jsonb,challenger_final_score numeric,recipient_final_score numeric,winner_profile_id uuid)
language sql security definer set search_path='' stable as $$
 select g.id,g.challenge_id,c.code,g.mode_id,g.challenger_id,g.recipient_id,g.lifecycle_state,g.current_round,g.revision,
 case when g.lifecycle_state in('prepared','sent','active') then (select jsonb_build_object('deck_position',d.deck_position,'item_reference',d.private_item_reference,'display_label',cat.display_label) from private.auction_deck_entries d join private.auction_catalog cat on cat.content_version=g.content_version and cat.mode_id=g.mode_id and cat.item_reference=d.private_item_reference where d.auction_id=g.id and d.deck_position=g.current_round) end,
 g.tie_priority_profile_id,g.challenger_bankroll,g.recipient_bankroll,g.challenger_selection_count,g.recipient_selection_count,
 case when g.lifecycle_state='prepared' then 'challenger' when g.lifecycle_state='sent' then 'recipient' when g.lifecycle_state='active' then case when exists(select 1 from private.auction_pending_bids b where b.auction_id=g.id and b.round_number=g.current_round and b.bidder_id=auth.uid()) then 'opponent' else 'current_user' end else 'none' end,
 coalesce((select jsonb_agg(jsonb_build_object('deck_position',d.deck_position,'item_reference',d.private_item_reference,'display_label',cat.display_label,'awarded_to',a.awarded_to,'category',a.visible_category,'resolved_round',a.resolved_round) order by a.resolved_round) from private.auction_awards a join private.auction_deck_entries d on d.id=a.deck_entry_id join private.auction_catalog cat on cat.content_version=g.content_version and cat.mode_id=g.mode_id and cat.item_reference=d.private_item_reference where a.auction_id=g.id),'[]'),
 coalesce((select jsonb_agg(jsonb_build_object('round',r.round_number,'challenger_bid',cb.amount,'recipient_bid',rb.amount,'winner',a.awarded_to) order by r.round_number) from (select distinct round_number from private.auction_pending_bids where auction_id=g.id) r join private.auction_pending_bids cb on cb.auction_id=g.id and cb.round_number=r.round_number and cb.bidder_id=g.challenger_id join private.auction_pending_bids rb on rb.auction_id=g.id and rb.round_number=r.round_number and rb.bidder_id=g.recipient_id join private.auction_awards a on a.auction_id=g.id and a.resolved_round=r.round_number),'[]'),
 case when g.lifecycle_state='completed' then g.challenger_final_score end,case when g.lifecycle_state='completed' then g.recipient_final_score end,case when g.lifecycle_state='completed' then g.winner_profile_id end
 from private.auction_games g left join public.play_challenges c on c.id=g.challenge_id where g.id=p_auction_id and ((g.lifecycle_state='prepared' and auth.uid()=g.challenger_id) or (g.lifecycle_state in('sent','active','completed','cancelled','declined') and auth.uid() in(g.challenger_id,g.recipient_id)));
$$;

revoke all on private.auction_catalog from public,anon,authenticated;
revoke all on function private.generate_auction_deck(uuid,text,integer,double precision[]) from public,anon,authenticated;
revoke all on function private.validate_auction_bid(private.auction_games,uuid,numeric,text) from public,anon,authenticated;
revoke all on function private.resolve_auction_round(uuid) from public,anon,authenticated;
revoke all on function private.complete_auction_placeholder(uuid) from public,anon,authenticated;
revoke all on function private.sync_auction_challenge_decline() from public,anon,authenticated;
grant execute on function public.prepare_auction(uuid,text),public.abandon_prepared_auction(uuid,bigint),public.send_auction_first_bid(uuid,bigint,numeric,text),public.submit_auction_bid(uuid,integer,bigint,numeric,text),public.get_auction_participant_state(uuid) to authenticated;

comment on function public.prepare_auction(uuid,text) is 'Creates or resumes one private, version-pinned Auction without exposing randomness or future deck entries.';
comment on function public.submit_auction_bid(uuid,integer,bigint,numeric,text) is 'Locks a sealed bid and resolves under a row lock; recipient round-one submission is acceptance.';
