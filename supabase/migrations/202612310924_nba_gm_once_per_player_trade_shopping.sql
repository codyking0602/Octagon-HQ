-- NBA GM parity: once a player spins a trade partner, that player's one
-- shopping attempt is spent. Pre-spin cancel remains free. Existing finalized
-- runs and scores are immutable. Historical snapshots protect old active saves.
DO $nba_gm_shop_once$
DECLARE v_def text;
BEGIN
  SELECT pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure) INTO v_def;
  IF position($old$'tradeAttempts',0,'tradesUsed',0,'freeAgencyTeam',null,$old$ IN v_def)=0
    OR position($old$or v_state->>'tradeTeam' is not null
      or not (exists(select$old$ IN v_def)=0
    OR position($old$v_next:=jsonb_set(v_state,'{tradeTeam}',to_jsonb(v_team));$old$ IN v_def)=0
    OR position($old$  perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
  update private.football_gm_runs$old$ IN v_def)=0
    OR position('shoppedPlayerIds' IN v_def)>0 THEN
    RAISE EXCEPTION 'NBA GM current action drifted; refuse shopping guard patch';
  END IF;

  -- New franchises begin with zero spent trade-partner spins.
  v_def:=replace(v_def,
    $old$'tradeAttempts',0,'tradesUsed',0,'freeAgencyTeam',null,$old$,
    $new$'tradeAttempts',0,'tradesUsed',0,'shoppedPlayerIds','[]'::jsonb,'freeAgencyTeam',null,$new$);

  -- Both the durable ledger and snapshots from pre-patch runs disallow repeats.
  v_def:=replace(v_def,
    $old$or v_state->>'tradeTeam' is not null
      or not (exists(select$old$,
    $new$or v_state->>'tradeTeam' is not null
      or coalesce(v_state->'shoppedPlayerIds','[]'::jsonb) ? p_player_id
      or exists (
        select 1 from private.football_gm_run_snapshots past
        where past.run_id=v_run_id
          and past.state->>'shopPlayerId'=p_player_id
          and past.state->>'tradeTeam' is not null
      )
      or not (exists(select$new$);

  -- Consume the attempt only AFTER the trade partner spin succeeds.
  v_def:=replace(v_def,
    $old$v_next:=jsonb_set(v_state,'{tradeTeam}',to_jsonb(v_team));$old$,
    $new$v_next:=jsonb_set(v_state,'{tradeTeam}',to_jsonb(v_team));
    v_next:=jsonb_set(v_next,'{shoppedPlayerIds}',
      coalesce(v_state->'shoppedPlayerIds','[]'::jsonb)||jsonb_build_array(v_old_id));$new$);

  -- Existing active talks opened before deployment also consume the attempt.
  v_def:=replace(v_def,
    $old$  perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
  update private.football_gm_runs$old$,
    $new$  if p_action in ('trade','cancel-trade')
      and v_state->>'tradeTeam' is not null
      and v_state->>'shopPlayerId' is not null
      and not (coalesce(v_next->'shoppedPlayerIds','[]'::jsonb) ? (v_state->>'shopPlayerId')) then
    v_next:=jsonb_set(v_next,'{shoppedPlayerIds}',
      coalesce(v_next->'shoppedPlayerIds','[]'::jsonb)||jsonb_build_array(v_state->>'shopPlayerId'));
  end if;
  perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
  update private.football_gm_runs$new$);

  EXECUTE v_def;
END;
$nba_gm_shop_once$;
