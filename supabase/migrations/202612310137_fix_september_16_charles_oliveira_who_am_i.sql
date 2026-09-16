-- Correct the already-published September 16, 2026 UFC Who Am I setup in place.
-- Preserve the official Daily identity and Cody's completed attempt while replacing only
-- two incorrect immutable clue texts before additional players receive the challenge.
do $$
declare
  v_target_day constant date := date '2026-09-16';
  v_setup_key constant text := 'who-am-i-daily-v1:official-daily-runtime-v1:play-rotation-v7:2026-09-16:UFC';
  v_central_today date := private.daily_challenge_central_day(now());
  v_setup_id uuid;
  v_hidden_subject_id text;
  v_division_clue_id text;
  v_title_clue_id text;
  v_division_text text;
  v_title_text text;
begin
  -- Fresh database replays after the historical day should not mutate anything.
  if v_central_today is distinct from v_target_day then
    return;
  end if;

  select
    setup.id,
    setup.reveal_setup #>> '{identity,id}',
    setup.reveal_setup #>> '{clues,3,id}',
    setup.reveal_setup #>> '{clues,9,id}',
    setup.reveal_setup #>> '{clues,3,text}',
    setup.reveal_setup #>> '{clues,9,text}'
  into
    v_setup_id,
    v_hidden_subject_id,
    v_division_clue_id,
    v_title_clue_id,
    v_division_text,
    v_title_text
  from private.daily_challenge_setups setup
  where setup.game_type = 'who_am_i'
    and setup.setup_key = v_setup_key
    and setup.content_version = 'who-am-i-daily-v1'
    and setup.scoring_version = 'play-official-score-v1';

  -- On a fresh same-day database the runtime may not have materialized this challenge yet.
  if v_setup_id is null then
    return;
  end if;

  if v_hidden_subject_id is distinct from 'ufc:charles-oliveira'
    or v_division_clue_id is distinct from 'division-count'
    or v_title_clue_id is distinct from 'title-wins' then
    raise exception 'refusing to modify unexpected September 16 Who Am I evidence';
  end if;

  if v_division_text = 'I competed in 2 UFC divisions.'
    and v_title_text = 'I won 2 UFC title fights.' then
    return;
  end if;

  if v_division_text is distinct from 'I competed in 9 UFC divisions.'
    or v_title_text is distinct from 'I won 3 UFC title fights.' then
    raise exception 'September 16 Who Am I evidence no longer matches the known bad publication';
  end if;

  alter table private.daily_challenge_setups
    disable trigger daily_challenge_setups_immutable;

  update private.daily_challenge_setups
  set
    reveal_setup = jsonb_set(
      jsonb_set(
        reveal_setup,
        '{clues,3,text}',
        to_jsonb('I competed in 2 UFC divisions.'::text),
        false
      ),
      '{clues,9,text}',
      to_jsonb('I won 2 UFC title fights.'::text),
      false
    ),
    private_setup_evidence = jsonb_set(
      jsonb_set(
        private_setup_evidence,
        '{clues,3,text}',
        to_jsonb('I competed in 2 UFC divisions.'::text),
        false
      ),
      '{clues,9,text}',
      to_jsonb('I won 2 UFC title fights.'::text),
      false
    )
  where id = v_setup_id;

  if not found then
    raise exception 'September 16 Who Am I setup disappeared during correction';
  end if;

  alter table private.daily_challenge_setups
    enable trigger daily_challenge_setups_immutable;
end
$$;
