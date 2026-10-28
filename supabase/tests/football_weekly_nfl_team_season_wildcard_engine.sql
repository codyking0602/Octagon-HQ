begin;

select set_config('request.jwt.claim.role','service_role',true);

do $wildcard_ticket_wheel$
declare
  v_a uuid:='00000000-0000-0000-0000-000000000001';
  v_b uuid:='00000000-0000-0000-0000-000000000002';
  v_c uuid:='00000000-0000-0000-0000-000000000003';
  v_d uuid:='00000000-0000-0000-0000-000000000004';
  v_pick uuid;
begin
  -- Four players with four entries each own equal 25% quarters of the wheel.
  v_pick:=private.football_weekly_auction_weighted_ticket_pick(
    array[v_a,v_b,v_c,v_d],
    array[4,4,4,4],
    0.10
  );
  if v_pick is distinct from v_a then
    raise exception 'equal four-entry wheel did not land in A quarter: %',v_pick;
  end if;

  v_pick:=private.football_weekly_auction_weighted_ticket_pick(
    array[v_a,v_b,v_c,v_d],
    array[4,4,4,4],
    0.30
  );
  if v_pick is distinct from v_b then
    raise exception 'equal four-entry wheel did not land in B quarter: %',v_pick;
  end if;

  v_pick:=private.football_weekly_auction_weighted_ticket_pick(
    array[v_a,v_b,v_c,v_d],
    array[4,4,4,4],
    0.60
  );
  if v_pick is distinct from v_c then
    raise exception 'equal four-entry wheel did not land in C quarter: %',v_pick;
  end if;

  v_pick:=private.football_weekly_auction_weighted_ticket_pick(
    array[v_a,v_b,v_c,v_d],
    array[4,4,4,4],
    0.90
  );
  if v_pick is distinct from v_d then
    raise exception 'equal four-entry wheel did not land in D quarter: %',v_pick;
  end if;

  -- Five entries versus one is a 5/6 versus 1/6 wheel, not an automatic win.
  v_pick:=private.football_weekly_auction_weighted_ticket_pick(
    array[v_a,v_b],
    array[5,1],
    0.82
  );
  if v_pick is distinct from v_a then
    raise exception 'five-ticket player lost inside its 5/6 wheel share: %',v_pick;
  end if;

  v_pick:=private.football_weekly_auction_weighted_ticket_pick(
    array[v_a,v_b],
    array[5,1],
    0.90
  );
  if v_pick is distinct from v_b then
    raise exception 'one-ticket player could not win inside its 1/6 wheel share: %',v_pick;
  end if;

  -- Zero-ticket players are never passed into the helper. The helper rejects
  -- non-positive weights so a caller cannot accidentally put a pass on a wheel.
  begin
    perform private.football_weekly_auction_weighted_ticket_pick(
      array[v_a,v_b],
      array[4,0],
      0.50
    );
    raise exception 'zero-ticket player was accepted on a weighted wheel';
  exception
    when others then
      if sqlerrm='zero-ticket player was accepted on a weighted wheel'
        or position('positive ticket counts only' in sqlerrm)=0
      then
        raise;
      end if;
  end;
end;
$wildcard_ticket_wheel$;

rollback;

\echo 'NFL Team-Seasons Wildcard weighted-wheel proof passed.'
