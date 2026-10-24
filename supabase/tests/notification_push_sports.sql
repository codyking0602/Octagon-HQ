-- Read-only QA assertions for the draft sport-push migration.
-- Run only against an isolated migrated database; no member push is dispatched.
begin;

do $test$
declare
  v_id uuid := '00000000-0000-0000-0000-000000000001';
  v_existing_id uuid;
  v_result jsonb;
  v_scope text[];
begin
  v_scope := private.notification_push_scope(
    'football_picks_open','/football/picks?week=4','football-picks','Open picks');
  if v_scope <> array['football'] then raise exception 'football route did not bind'; end if;

  v_scope := private.notification_push_scope(
    'new_game_available','/?hq-reveal=basketball-2026','nba-launch','The NBA is here');
  if v_scope <> array['nba'] then raise exception 'NBA reveal did not bind'; end if;

  v_scope := private.notification_push_scope(
    'new_game_available','/','ambiguous','Sports game');
  if cardinality(v_scope) <> 0 then raise exception 'ambiguous generic sports push not fail-closed'; end if;

  v_scope := private.notification_push_scope(
    'daily_challenge_four_hours','/','daily-closing-combined',
    'Your UFC, Football, and MLB challenges close at midnight Central.');
  if v_scope <> array['ufc','football','mlb'] then
    raise exception 'combined alert scope incorrect';
  end if;

  v_result := private.notification_push_selection(
    v_id,'new_game_available','/?hq-reveal=basketball-2026','nba-launch','NBA is here');
  if coalesce((v_result->>'allowed')::boolean,true) then
    raise exception 'new members did not default NBA push off';
  end if;

  v_result := private.notification_push_selection(
    v_id,'football_picks_open','/football/picks','football-picks','Make picks');
  if coalesce((v_result->>'allowed')::boolean,true) then
    raise exception 'new member football push should await explicit opt-in';
  end if;

  v_result := private.notification_push_selection(
    v_id,'daily_challenge_four_hours','/','daily-closing-combined',
    'Your UFC and NBA challenges close at midnight Central. Play them.');
  if coalesce((v_result->>'allowed')::boolean,true) then
    raise exception 'combined push unexpectedly allowed before any sport opt-in';
  end if;

  -- For a real profile in the isolated fixture, model UFC-only opt-in and
  -- ensure the phone text excludes a muted NBA or Football sport.
  select id into v_existing_id from public.profiles order by id limit 1;
  if v_existing_id is not null then
    insert into private.notification_push_sports(profile_id,ufc,football,mlb,nba)
    values (v_existing_id,true,false,false,false)
    on conflict (profile_id) do update
      set ufc = true, football = false, mlb = false, nba = false;

    v_result := private.notification_push_selection(
      v_existing_id,'daily_challenge_four_hours','/','daily-closing-combined',
      'Your UFC and Football challenges close at midnight Central. Play them.');
    if not coalesce((v_result->>'allowed')::boolean,false)
      or position('Football' in (v_result->>'summary')) > 0
      or position('UFC' in (v_result->>'summary')) = 0 then
      raise exception 'combined push did not sanitize muted sport';
    end if;

    v_result := private.notification_push_selection(
      v_existing_id,'football_picks_open','/football/picks','football-picks','Make picks');
    if coalesce((v_result->>'allowed')::boolean,true) then
      raise exception 'football-only push was not muted';
    end if;
  end if;

  v_result := private.notification_push_selection(
    v_id,'war_room_mention','/war-room','mention','You were mentioned');
  if not coalesce((v_result->>'allowed')::boolean,false) then
    raise exception 'universal social notification unexpectedly muted';
  end if;

  -- Owner monitoring events remain critical even with all sport choices muted.
  v_result := private.notification_push_selection(
    v_id,'card_change_detected','/picks/control','monitoring','A UFC card needs owner review');
  if not coalesce((v_result->>'allowed')::boolean,false) then
    raise exception 'critical owner monitoring push was muted by entertainment sport choices';
  end if;

  if has_table_privilege('authenticated', 'private.notification_push_sports', 'SELECT') then
    raise exception 'private preferences exposed to authenticated browser';
  end if;
  if has_function_privilege('anon', 'public.set_my_notification_push_sports(boolean,boolean,boolean,boolean)', 'EXECUTE') then
    raise exception 'anonymous actor can set member sport preferences';
  end if;
end;
$test$;

rollback;
