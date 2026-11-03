-- Verify V4 NBA GM risk labels without touching user state.
begin;
do $check$
declare
  s jsonb:='{"economyVersion":4,"developmentModelVersion":2,"phase":"draft","seed":"test"}'::jsonb;
  p record;
  label text;
  count_risk integer:=0;
  count_locked integer:=0;
begin
  for p in select x.id,c.candidate_contract contract from private.nba_gm_dev_players x
    join private.nba_gm_contract_candidates_2026_27 c on x.id=c.player_id loop
    label:=private.nba_gm_v10_reprice_risk(s,p.id);
    if p.contract='1YR' and label in ('LOW','MEDIUM','HIGH') then
      count_risk:=count_risk+1;
    elsif p.contract='3YR' and label='LOCKED' then
      count_locked:=count_locked+1;
    else raise exception 'NBA GM risk label missing: %, %',p.id,label;end if;
  end loop;
  if count_risk+count_locked<>330 then raise exception 'Incomplete 330-player census';end if;
end;
$check$;
rollback;
