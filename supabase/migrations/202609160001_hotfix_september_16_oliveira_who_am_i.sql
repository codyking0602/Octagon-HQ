-- Same-day factual correction for the September 16, 2026 UFC Who Am I Daily Challenge.
-- The canonical source incorrectly treated distinct catchweight labels as UFC divisions.
-- Preserve the existing immutable daily identity and scores while correcting only the published clue evidence.
do $$
declare
  v_setup_id uuid;
  v_reveal_clues jsonb;
  v_private_clues jsonb;
begin
  select setup.id
  into v_setup_id
  from private.daily_challenges daily
  join private.daily_challenge_setups setup on setup.id = daily.setup_id
  where daily.central_day = date '2026-09-16'
    and daily.schedule_version = 'play-rotation-v7'
    and daily.game_type = 'who_am_i'
    and setup.private_setup_evidence #>> '{hidden_subject_id}' = 'ufc:charles-oliveira';

  -- Fresh database replays may not have materialized this historical day.
  if v_setup_id is null then
    return;
  end if;

  select jsonb_agg(
    case
      when clue ->> 'id' = 'division-count'
        then jsonb_set(clue, '{text}', to_jsonb('I competed in 2 UFC divisions.'::text), false)
      when clue ->> 'id' = 'title-wins'
        then jsonb_build_object(
          'id', 'ufc-submission-record',
          'text', 'I hold the UFC record for submission wins.'
        )
      else clue
    end
    order by ordinal
  )
  into v_reveal_clues
  from private.daily_challenge_setups setup,
       jsonb_array_elements(setup.reveal_setup -> 'clues') with ordinality as items(clue, ordinal)
  where setup.id = v_setup_id;

  select jsonb_agg(
    case
      when clue ->> 'id' = 'division-count'
        then jsonb_set(clue, '{text}', to_jsonb('I competed in 2 UFC divisions.'::text), false)
      when clue ->> 'id' = 'title-wins'
        then jsonb_set(
          jsonb_set(clue, '{id}', to_jsonb('ufc-submission-record'::text), false),
          '{text}',
          to_jsonb('I hold the UFC record for submission wins.'::text),
          false
        )
      else clue
    end
    order by ordinal
  )
  into v_private_clues
  from private.daily_challenge_setups setup,
       jsonb_array_elements(setup.private_setup_evidence -> 'clues') with ordinality as items(clue, ordinal)
  where setup.id = v_setup_id;

  alter table private.daily_challenge_setups
    disable trigger daily_challenge_setups_immutable;

  update private.daily_challenge_setups
  set
    reveal_setup = jsonb_set(reveal_setup, '{clues}', v_reveal_clues, false),
    private_setup_evidence = jsonb_set(private_setup_evidence, '{clues}', v_private_clues, false)
  where id = v_setup_id;

  alter table private.daily_challenge_setups
    enable trigger daily_challenge_setups_immutable;
end
$$;
