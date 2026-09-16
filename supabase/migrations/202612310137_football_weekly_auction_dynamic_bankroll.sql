-- Let Weekly Auction players use their full remaining bankroll when today's bid
-- distribution still guarantees a path to the required three-team collection.
--
-- Examples:
--   1 team owned, $30 left: $19 + $11 is legal because winning both finishes 3,
--   while winning only one leaves the losing bid uncharged for the final team.
--   $30 on one team is still illegal because that win could strand the player at 2.
--
-- The same principle applies from 0 teams: after any one possible win, at least
-- $2 must remain; after any two possible wins, at least $1 must remain.

create or replace function private.football_weekly_auction_bids_preserve_completion(
  p_bankroll integer,
  p_owned integer,
  p_bid1 integer,
  p_bid2 integer,
  p_bid3 integer
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when p_bankroll < 0
      or least(p_bid1, p_bid2, p_bid3) < 0
      or p_bid1 + p_bid2 + p_bid3 > p_bankroll
      then false
    when p_owned >= 2
      then true
    when p_owned = 1
      then greatest(p_bid1, p_bid2, p_bid3) <= p_bankroll - 1
    else greatest(p_bid1, p_bid2, p_bid3) <= p_bankroll - 2
      and (p_bid1 + p_bid2 + p_bid3 - least(p_bid1, p_bid2, p_bid3)) <= p_bankroll - 1
  end;
$$;

do $weekly_auction_getter_patch$
declare
  v_signature constant regprocedure := 'public.get_my_football_weekly_auction(timestamptz)'::regprocedure;
  v_definition text;
  v_old constant text := $old$
    'reserve_floor', v_floor,
    'max_commit', greatest(v_bankroll - v_floor, 0),
$old$;
  v_new constant text := $new$
    'reserve_floor', 0,
    'max_commit', v_bankroll,
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position(v_new in v_definition) = 0 then
    if position(v_old in v_definition) = 0 then
      raise exception 'Weekly Auction getter commitment projection changed unexpectedly';
    end if;
    v_definition := replace(v_definition, v_old, v_new);
    execute v_definition;
  end if;
end
$weekly_auction_getter_patch$;

do $weekly_auction_submit_patch$
declare
  v_signature constant regprocedure := 'public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)'::regprocedure;
  v_definition text;
  v_old constant text := $old$
  v_floor := private.football_weekly_auction_reserve_floor(v_owned);
  v_max := greatest(v_bankroll - v_floor, 0);
  v_total := v_bid1 + v_bid2 + v_bid3;

  if v_total > v_max then
    raise exception 'Today''s bids exceed the available Weekly Auction commitment of $%', v_max;
  end if;
$old$;
  v_new constant text := $new$
  v_max := v_bankroll;
  v_total := v_bid1 + v_bid2 + v_bid3;

  if v_total > v_max then
    raise exception 'Today''s bids exceed the available Weekly Auction commitment of $%', v_max;
  end if;

  if not private.football_weekly_auction_bids_preserve_completion(
    v_bankroll,
    v_owned,
    v_bid1,
    v_bid2,
    v_bid3
  ) then
    raise exception 'Today''s bids must leave enough bankroll to still reach 3 teams unless today''s winning bids would complete your collection';
  end if;
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position('football_weekly_auction_bids_preserve_completion(' in v_definition) = 0 then
    if position(v_old in v_definition) = 0 then
      raise exception 'Weekly Auction submit commitment validation changed unexpectedly';
    end if;
    v_definition := replace(v_definition, v_old, v_new);
    execute v_definition;
  end if;
end
$weekly_auction_submit_patch$;

do $weekly_auction_dynamic_bankroll_contract$
begin
  if not private.football_weekly_auction_bids_preserve_completion(30, 1, 0, 19, 11) then
    raise exception 'One-team owner must be able to commit the full bankroll across two completion-capable bids';
  end if;

  if private.football_weekly_auction_bids_preserve_completion(30, 1, 30, 0, 0) then
    raise exception 'One-team owner must not be allowed to strand at two teams with a single all-in bid';
  end if;

  if not private.football_weekly_auction_bids_preserve_completion(40, 0, 38, 1, 1) then
    raise exception 'Zero-team owner must be able to commit the full bankroll when all outcome paths preserve completion';
  end if;

  if private.football_weekly_auction_bids_preserve_completion(40, 0, 38, 2, 0) then
    raise exception 'Zero-team owner must retain one dollar after any possible two-win outcome';
  end if;

  if not private.football_weekly_auction_bids_preserve_completion(17, 2, 17, 0, 0) then
    raise exception 'Two-team owner must be able to spend the full remaining bankroll';
  end if;
end
$weekly_auction_dynamic_bankroll_contract$;
