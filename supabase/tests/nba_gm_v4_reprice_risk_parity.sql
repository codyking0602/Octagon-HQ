-- NBA GM signed-salary V4 scouting must report the same clear LOW / MED /
-- HIGH / LOCKED categories as NFL, without revealing seeded outcomes.
-- Run on an isolated migrated database; this test does not persist changes.
begin;
set local statement_timeout='120s';

do $nba_v4_reprice_test$
declare
  v_row record;
  v_draft_a jsonb:=jsonb_build_object('economyVersion',4,'developmentModelVersion',2,
    'phase','draft','seed','nba-v4-reprice-a');
  v_draft_b jsonb:=jsonb_build_object('economyVersion',4,'developmentModelVersion',2,
    'phase','draft','seed','nba-v4-reprice-b');
  v_offseason jsonb:=jsonb_build_object('economyVersion',4,'developmentModelVersion',2,
    'phase','offseason','seed','nba-v4-reprice-a');
  v_legacy jsonb:=jsonb_build_object('economyVersion',3,'developmentModelVersion',2,
    'phase','draft','seed','nba-v4-reprice-a');
  v_a text;v_b text;
  v_low integer:=0;v_med integer:=0;v_high integer:=0;v_locked integer:=0;
  v_catalog_def text;
begin
  select pg_get_functiondef('public.nba_gm_dev_catalog()'::regprocedure)
    into v_catalog_def;
  if position('''repriceRisk'',private.nba_gm_v5_reprice_risk(v_state,p.id)' in v_catalog_def)=0 then
    raise exception 'NBA GM catalog does not return a server-owned reprice tier';
  end if;
  if not private.nba_gm_v4_salary_certified() then
    raise exception 'V4 salary provenance must be certified for all 330';
  end if;
  for v_row in
    select c.player_id,c.candidate_contract
    from private.nba_gm_contract_candidates_2026_27 c order by c.player_id
  loop
    v_a:=private.nba_gm_v5_reprice_risk(v_draft_a,v_row.player_id);
    v_b:=private.nba_gm_v5_reprice_risk(v_draft_b,v_row.player_id);
    if v_a is distinct from v_b then
      raise exception 'Seed leaked into NBA salary forecast for %',v_row.player_id;
    end if;
    if v_row.candidate_contract='3YR' then
      v_locked:=v_locked+1;
      if v_a<>'LOCKED' then raise exception '3YR salary not locked for %',v_row.player_id;end if;
    elsif v_row.candidate_contract='1YR' then
      case v_a
        when 'LOW' then v_low:=v_low+1;
        when 'MEDIUM' then v_med:=v_med+1;
        when 'HIGH' then v_high:=v_high+1;
        else raise exception 'Missing V4 1YR tier for %: %',v_row.player_id,v_a;
      end case;
      -- NBA and NFL reprice exactly once, after Season 1.
      if private.nba_gm_v5_reprice_risk(v_offseason,v_row.player_id)<>'LOCKED' then
        raise exception 'V4 one-year salary should be locked in offseason: %',v_row.player_id;
      end if;
    else
      raise exception 'Unsupported contract term %',v_row.candidate_contract;
    end if;
  end loop;
  if v_locked<>154 or v_low+v_med+v_high<>176
    or v_low<20 or v_med<20 or v_high<10 then
    raise exception 'V4 risk tiers collapsed: low %, med %, high %, locked %',
      v_low,v_med,v_high,v_locked;
  end if;
  if private.nba_gm_v5_reprice_risk(v_legacy,'nba-gm-draft-anthonydavis')
     not in ('LOW','MEDIUM','HIGH','LOCKED') then
    raise exception 'Old V3 economy lost its existing repricing behavior';
  end if;
  raise notice 'NBA GM V4 repricing: low %, med %, high %, locked %',
    v_low,v_med,v_high,v_locked;
end;
$nba_v4_reprice_test$;
rollback;
