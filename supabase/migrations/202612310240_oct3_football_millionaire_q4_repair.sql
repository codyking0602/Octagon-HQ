-- Persist the Oct. 3 Football Millionaire Q4 production repair.
-- The replacement preserves Q4's correct answer slot (A), so already-recorded actions remain valid.

begin;

select set_config('octagon.daily_two_game_cutover', 'on', true);

do $repair$
declare
  v_setup uuid;
  v_prompt text;
  v_proof text;
begin
  select
    setup.id,
    setup.public_setup #>> '{questions,3,prompt}',
    setup.private_grading_evidence ->> 'proof'
  into v_setup, v_prompt, v_proof
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  join private.daily_challenge_setups setup
    on setup.id = daily.setup_id
  where daily.central_day = date '2026-10-03'
    and schedule.sport = 'football'
    and daily.game_type = 'millionaire'
  order by daily.published_at desc
  limit 1;

  if v_setup is null then
    return;
  end if;

  if v_prompt = 'Which program did Urban Meyer coach immediately before he became Florida''s head coach?' then
    return;
  end if;

  if v_prompt is distinct from 'Which of these programs won a national championship most recently?' then
    raise exception 'unexpected Oct 3 Football Millionaire Q4 prompt: %', coalesce(v_prompt, '<null>');
  end if;

  if v_proof not like '%|millionaire-cfb-run-2-q4:A|%' then
    raise exception 'Oct 3 Football Millionaire Q4 answer slot changed before repair';
  end if;

  update private.daily_challenge_setups
  set
    public_setup = jsonb_set(
      public_setup,
      '{questions,3}',
      jsonb_build_object(
        'id', 'millionaire-cfb-run-2-q4',
        'sport', 'football',
        'level', 'Q4',
        'money', 10000,
        'type', 'coaching-history',
        'prompt', 'Which program did Urban Meyer coach immediately before he became Florida''s head coach?',
        'choices', jsonb_build_array(
          jsonb_build_object('id', 'A', 'text', 'Utah'),
          jsonb_build_object('id', 'B', 'text', 'Bowling Green'),
          jsonb_build_object('id', 'C', 'text', 'Notre Dame'),
          jsonb_build_object('id', 'D', 'text', 'Cincinnati')
        )
      ),
      false
    ),
    reveal_setup = jsonb_set(
      reveal_setup,
      '{questions,3}',
      jsonb_build_object(
        'id', 'millionaire-cfb-run-2-q4',
        'correct_choice_id', 'A',
        'explanation', 'Utah is the correct answer.'
      ),
      false
    ),
    private_setup_evidence = jsonb_set(
      private_setup_evidence,
      '{run,3}',
      jsonb_build_object(
        'id', 'millionaire-cfb-run-2-q4',
        'sport', 'football',
        'level', 'Q4',
        'money', 10000,
        'type', 'coaching-history',
        'prompt', 'Which program did Urban Meyer coach immediately before he became Florida''s head coach?',
        'choices', jsonb_build_array(
          jsonb_build_object('id', 'A', 'text', 'Utah'),
          jsonb_build_object('id', 'B', 'text', 'Bowling Green'),
          jsonb_build_object('id', 'C', 'text', 'Notre Dame'),
          jsonb_build_object('id', 'D', 'text', 'Cincinnati')
        ),
        'correctChoiceId', 'A',
        'explanation', 'Utah is the correct answer.',
        'statSheet', 'Meyer led the Utes to an undefeated 2004 season before taking the Florida job.',
        'fiftyFifty', jsonb_build_object(
          'survivorChoiceIds', jsonb_build_array('A', 'B'),
          'removalChoiceIds', jsonb_build_array('C', 'D')
        ),
        'lifelineCompatibility', jsonb_build_object(
          'fiftyFifty', true,
          'statSheet', true,
          'doubleDip', true
        )
      ),
      false
    )
  where id = v_setup;
end
$repair$;

commit;
