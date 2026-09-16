-- One-time correction for the September 16, 2026 UFC Who Am I Daily Challenge.
-- Preserve the published challenge identity, completed attempt, and leaderboard result.
-- Only correct the immutable clue evidence for the already-published Charles Oliveira setup.
do $$
declare
  v_target_day constant date := date '2026-09-16';
  v_daily_id uuid;
  v_setup_id uuid;
  v_hidden_subject text;
  v_division_text text;
begin
  if private.daily_challenge_central_day(now()) <> v_target_day then
    raise exception 'September 16 UFC Who Am I correction is only safe on %, current Central day is %',
      v_target_day,
      private.daily_challenge_central_day(now());
  end if;

  select daily.id, daily.setup_id
  into v_daily_id, v_setup_id
  from private.daily_challenges daily
  where daily.central_day = v_target_day
    and daily.schedule_version = 'play-rotation-v7'
    and daily.game_type = 'who_am_i';

  if v_daily_id is null or v_setup_id is null then
    raise exception 'expected published UFC Who Am I Daily Challenge for %', v_target_day;
  end if;

  select setup.private_grading_evidence ->> 'hidden_subject_id',
         setup.reveal_setup #>> '{clues,3,text}'
  into v_hidden_subject, v_division_text
  from private.daily_challenge_setups setup
  where setup.id = v_setup_id;

  if v_hidden_subject is distinct from 'ufc:charles-oliveira' then
    raise exception 'refusing to correct unexpected hidden subject %', coalesce(v_hidden_subject, '<none>');
  end if;

  if v_division_text is distinct from 'I competed in 9 UFC divisions.' then
    raise exception 'refusing to correct unexpected clue text %', coalesce(v_division_text, '<none>');
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
      '{clues,9}',
      jsonb_build_object(
        'id', 'ufc-submission-record',
        'text', 'I hold the UFC record for submission wins.'
      ),
      false
    ),
    private_setup_evidence = jsonb_set(
      jsonb_set(
        private_setup_evidence,
        '{clues,3,text}',
        to_jsonb('I competed in 2 UFC divisions.'::text),
        false
      ),
      '{clues,9}',
      jsonb_build_object(
        'id', 'ufc-submission-record',
        'band', 'giveaway',
        'text', 'I hold the UFC record for submission wins.'
      ),
      false
    )
  where id = v_setup_id;

  if not found then
    raise exception 'failed to update the intended UFC Who Am I setup';
  end if;

  alter table private.daily_challenge_setups
    enable trigger daily_challenge_setups_immutable;
end
$$;
