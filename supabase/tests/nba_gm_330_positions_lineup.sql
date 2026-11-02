-- Read-only proof of canonical 330-player eligibility and server-owned lineup.
begin;
set local statement_timeout='180s';
do $nba_position_test$
declare
  v_names text[]:=array['nba-gm-draft-victorwembanyama','nba-gm-draft-lukadoncic',
    'nba-gm-draft-lebronjames','nba-gm-draft-deniavdija','nba-gm-draft-konknueppel',
    'nba-gm-draft-acebailey','nba-gm-draft-jamalshead'];
  v_picks jsonb;v_rev jsonb;v_assigned jsonb;v_player text;v_slot text;
  v_state jsonb;v_season jsonb;v_guards jsonb;v_bigs jsonb;
begin
  if (select count(*) from private.nba_gm_dev_players)<>330
    or (select count(*) from private.nba_gm_dev_players where cardinality(positions)=2
      and positions[1]<>positions[2]
      and positions<@array['PG','SG','SF','PF','C']::text[])<>330 then
    raise exception '330 NBA GM valid dual positions required';end if;
  select jsonb_agg(jsonb_build_object('playerId',id)) into v_picks
    from unnest(v_names) id;
  select jsonb_agg(jsonb_build_object('playerId',id) order by id desc) into v_rev
    from unnest(v_names) id;
  v_assigned:=private.nba_gm_v2_assign(v_picks);
  if v_assigned is distinct from private.nba_gm_v2_assign(v_rev) then
    raise exception 'Draft order changes NBA starting assignment';end if;
  for v_slot,v_player in select * from (values
     ('PG','nba-gm-draft-lukadoncic'),('SG','nba-gm-draft-konknueppel'),
     ('SF','nba-gm-draft-deniavdija'),('PF','nba-gm-draft-lebronjames'),
     ('C','nba-gm-draft-victorwembanyama'),('GUARD','nba-gm-draft-jamalshead'),
     ('BIG','nba-gm-draft-acebailey')) matches(slot,id)
  loop
    if not v_assigned @> jsonb_build_array(jsonb_build_object('slot',v_slot,'playerId',v_player)) then
      raise exception 'Wrong starter/bench allocation: % should be %',v_player,v_slot;end if;
  end loop;
  select jsonb_agg(jsonb_build_object('playerId',id)) into v_guards
    from (select id from private.nba_gm_dev_players
      where positions[1] in ('PG','SG') order by id limit 7) guards;
  select jsonb_agg(jsonb_build_object('playerId',id)) into v_bigs
    from (select id from private.nba_gm_dev_players
      where positions[1] in ('PF','C') order by id limit 7) bigs;
  if private.nba_gm_v2_assign(v_guards) is not null or
     private.nba_gm_v2_assign(v_bigs) is not null then
     raise exception 'One-category roster exploit: no guard or big balance';end if;
  v_state:=jsonb_build_object('economyVersion',4,'simulationModelVersion',7,
    'developmentModelVersion',2,'seed','nba-330-positions-test',
    'picks',v_assigned,'releasedIds','[]'::jsonb,'tradesUsed',0);
  v_season:=private.nba_gm_v2_season(v_state,1);
  if v_season is distinct from private.nba_gm_v7_season(v_state,1)
    or (v_season->>'teamOverall')::integer not between 70 and 99
    or (v_season->>'titleOdds')::numeric not between 0 and 49.6 then
     raise exception 'V7 and V6 six-skill independent model compatibility failed';end if;
end;
$nba_position_test$;
rollback;
