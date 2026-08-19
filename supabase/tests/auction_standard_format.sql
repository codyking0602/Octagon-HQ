do $$
declare
  v_definition text;
begin
  select pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure)
    into v_definition;
  if v_definition not like '%then 10 else 6%'
    or v_definition not like '%then 50 else 30%'
  then
    raise exception 'Auction preparation does not use the 6-round, $30 standard format';
  end if;

  select pg_get_functiondef(
    'private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure
  ) into v_definition;
  if v_definition not like '%then 5 else 3%' then
    raise exception 'Auction bid validation does not reserve for three standard selections';
  end if;

  select pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure)
    into v_definition;
  if v_definition not like '%then 10 else 6%'
    or v_definition not like '%then 5 else 3%'
  then
    raise exception 'Auction resolution does not complete the new standard format';
  end if;

  select pg_get_functiondef('private.grade_auction(uuid)'::regprocedure)
    into v_definition;
  if v_definition not like '%then 5 else 3%' then
    raise exception 'Auction grading does not require three standard selections';
  end if;
end;
$$;
