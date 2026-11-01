-- New V4 rules are deterministic and rollback-only; do not rewrite live games.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $nba_owner_fix$
declare
  v_picks jsonb:=jsonb_build_array(
    jsonb_build_object('slot','SF','playerId','nba-gm-draft-ruihachimura'),
    jsonb_build_object('slot','BIG','playerId','nba-gm-draft-nikolajokic'),
    jsonb_build_object('slot','PF','playerId','nba-gm-draft-evanmobley'),
    jsonb_build_object('slot','SG','playerId','nba-gm-draft-devinbooker'),
    jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-collingillespie'),
    jsonb_build_object('slot','PG','playerId','nba-gm-draft-joshgiddey'),
    jsonb_build_object('slot','C','playerId','nba-gm-draft-adembona'));
  v_fixed jsonb;v_state jsonb;v_result jsonb;v_score jsonb;
begin
  v_fixed:=private.nba_gm_v2_assign(v_picks,null);
  if (select count(*) from jsonb_array_elements(v_fixed) p
       where p->>'playerId'='nba-gm-draft-nikolajokic' and p->>'slot'='C')<>1
    or (select count(*) from jsonb_array_elements(v_fixed) p
       where p->>'playerId'='nba-gm-draft-adembona' and p->>'slot'='BIG')<>1
  then raise exception 'Strongest eligible center must start instead of Bona'; end if;
  v_state:=jsonb_build_object('seed','nba-gm-starter-release-fixed-seed',
    'economyVersion',3,'developmentModelVersion',2,
    'picks',v_fixed,'yearOnePicks',v_fixed,
    'releasedIds','[]'::jsonb,'tradesUsed',0);
  v_result:=private.nba_gm_v2_season(v_state,1);
  if (v_result->>'wins')::integer not between 8 and 74 then
    raise exception 'Invalid season outcomes'; end if;
  v_score:=private.nba_gm_v3_final_score(jsonb_set(v_state,'{results}',
    jsonb_build_array(
      jsonb_build_object('wins',37,'finish','Missed Playoffs'),
      jsonb_build_object('wins',40,'finish','Missed Playoffs'),
      jsonb_build_object('wins',29,'finish','Missed Playoffs'))));
  if v_score->>'playoffs'<>'25.0' or v_score->'weights'<>'[0.90, 0.03, 0.07]'::jsonb
    then raise exception 'Approved 90/3/7 weights or playoff penalty changed: %',v_score;end if;
  raise notice 'NBA owner starter test: % | %',v_fixed,v_score;
end;
$nba_owner_fix$;
rollback;
