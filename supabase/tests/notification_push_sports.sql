-- Read-only QA assertions for the draft sport-push migration.
-- Run only against an isolated migrated database; no member push is dispatched.
begin;

do $test$
declare
  v_id uuid := '00000000-0000-0000-0000-000000000001';
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
  if not coalesce((v_result->>'allowed')::boolean,false) then
    raise exception 'existing football push unexpectedly disabled';
  end if;

  v_result := private.notification_push_selection(
    v_id,'daily_challenge_four_hours','/','daily-closing-combined',
    'Your UFC and NBA challenges close at midnight Central. Play them.');
  if not coalesce((v_result->>'allowed')::boolean,false)
    or position('NBA' in (v_result->>'summary')) > 0
    or position('UFC' in (v_result->>'summary')) = 0 then
    raise exception 'combined push leaked a muted sport';
  end if;

  v_result := private.notification_push_selection(
    v_id,'war_room_mention','/war-room','mention','You were mentioned');
  if not coalesce((v_result->>'allowed')::boolean,false) then
    raise exception 'universal social notification unexpectedly muted';
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
