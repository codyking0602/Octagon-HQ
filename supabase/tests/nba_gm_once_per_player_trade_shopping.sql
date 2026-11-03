-- No persistent test data: owner-profile game actions are rolled back.
BEGIN;
SELECT set_config('request.jwt.claim.role','service_role',true);
DO $nba_shop_one_shot$
DECLARE v_owner uuid:=extensions.gen_random_uuid();v_run_id uuid;v_state jsonb;
  v_roster jsonb;v_anchor text:='nba-gm-draft-acebailey';
  v_second text:='nba-gm-draft-konknueppel';v_rejected boolean:=false;
BEGIN
  INSERT INTO auth.users(id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  VALUES(v_owner,'00000000-0000-0000-0000-000000000000',
    'authenticated','authenticated','nba-shop-once-'||v_owner::text||'@test.octagon.invalid',
    '',now(),now(),now(),jsonb_build_object('display_name','TEST','historical_unclaimed',true));
  PERFORM public.register_unclaimed_pin_profile(v_owner,'TEST','NO');
  INSERT INTO public.pick_control_owners(profile_id) VALUES(v_owner);
  PERFORM set_config('request.jwt.claim.role','authenticated',true);
  PERFORM set_config('request.jwt.claim.sub',v_owner::text,true);

  v_state:=public.nba_gm_dev_action('start');
  IF v_state->'shoppedPlayerIds' <> '[]'::jsonb THEN
    RAISE EXCEPTION 'New NBA run must initialize empty spent-shopping ledger';END IF;
  SELECT id INTO v_run_id FROM private.football_gm_runs
    WHERE profile_id=v_owner AND game_version='nba-gm-dev-v2';
  v_roster:=jsonb_build_array(
    jsonb_build_object('slot','PG','playerId','nba-gm-draft-lukadoncic'),
    jsonb_build_object('slot','SG','playerId',v_second),
    jsonb_build_object('slot','SF','playerId',v_anchor),
    jsonb_build_object('slot','PF','playerId','nba-gm-draft-lebronjames'),
    jsonb_build_object('slot','C','playerId','nba-gm-draft-victorwembanyama'),
    jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-jamalshead'),
    jsonb_build_object('slot','BIG','playerId','nba-gm-draft-deniavdija'));
  IF private.nba_gm_v2_assign(v_roster) IS NULL THEN RAISE EXCEPTION 'Fixture positions invalid';END IF;
  v_state:=v_state||jsonb_build_object('phase','offseason',
    'picks',v_roster,'yearOnePicks',v_roster);
  PERFORM set_config('octagon.nba_gm_dev_authorized_write','yes',true);
  UPDATE private.football_gm_runs SET state=v_state WHERE id=v_run_id;
  PERFORM set_config('octagon.nba_gm_dev_authorized_write','',true);

  -- The GM may back out before any partner is selected.
  v_state:=public.nba_gm_dev_action('shop',null,v_anchor);
  v_state:=public.nba_gm_dev_action('cancel-trade');
  IF v_state->'shoppedPlayerIds' <> '[]'::jsonb THEN
    RAISE EXCEPTION 'Pre-spin cancel incorrectly consumed the attempt';END IF;
  v_state:=public.nba_gm_dev_action('shop',null,v_anchor);
  v_state:=public.nba_gm_dev_action('trade-spin');
  IF v_state->>'tradeTeam' IS NULL OR NOT (v_state->'shoppedPlayerIds' ? v_anchor)
    THEN RAISE EXCEPTION 'Trade partner spin failed to spend attempt';END IF;

  v_state:=public.nba_gm_dev_action('cancel-trade');
  IF v_state->>'shopPlayerId' IS NOT NULL OR NOT (v_state->'shoppedPlayerIds' ? v_anchor)
    THEN RAISE EXCEPTION 'End talks failed to retain spent attempt';END IF;
  v_rejected:=false;
  BEGIN PERFORM public.nba_gm_dev_action('shop',null,v_anchor);
  EXCEPTION WHEN OTHERS THEN v_rejected:=true;END;
  IF NOT v_rejected THEN RAISE EXCEPTION 'Already-shopped player could be shopped twice';END IF;

  v_state:=public.nba_gm_dev_action('shop',null,v_second);
  IF v_state->>'shopPlayerId' IS DISTINCT FROM v_second
    OR NOT (v_state->'shoppedPlayerIds' ? v_anchor)
    OR (v_state->'shoppedPlayerIds' ? v_second)
    THEN RAISE EXCEPTION 'New player wrongly blocked or prior ledger lost';END IF;
  IF public.nba_gm_dev_action('load')->'shoppedPlayerIds' IS DISTINCT FROM v_state->'shoppedPlayerIds'
    THEN RAISE EXCEPTION 'Shop lock not durable across reload';END IF;
END;
$nba_shop_one_shot$;
ROLLBACK;
