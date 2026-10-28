-- Permanently remove the fragile Game 1 -> Game 2 intermission handoff.
-- Preserve each player's completed Game 1 submission + score and move every
-- currently stranded two-game Daily directly onto the canonical Game 2 initial state.

update private.daily_challenge_progress progress
set
  revision = progress.revision + 1,
  public_state = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            progress.public_state,
            '{round_index}',
            '1'::jsonb,
            true
          ),
          '{round_count}',
          '2'::jsonb,
          true
        ),
        '{awaiting_next}',
        'false'::jsonb,
        true
      ),
      '{active_round}',
      setup.public_setup -> 'rounds' -> 1 -> 'initial_state',
      true
    ),
    '{active_reveal}',
    'null'::jsonb,
    true
  ),
  updated_at = now()
from private.daily_challenges daily
join private.daily_challenge_setups setup
  on setup.id = daily.setup_id
where progress.daily_challenge_id = daily.id
  and daily.central_day >= date '2026-09-27'
  and daily.game_type in ('find_leader', 'wavelength', 'hit_the_number')
  and daily.scoring_version = 'daily-two-game-average-score-v1'
  and progress.public_state ->> 'format_version' = 'daily-two-game-average-v1'
  and progress.public_state ->> 'awaiting_next' = 'true'
  and coalesce((progress.public_state ->> 'round_index')::integer, 0) = 0
  and jsonb_typeof(progress.public_state -> 'round_scores') = 'array'
  and jsonb_array_length(progress.public_state -> 'round_scores') >= 1
  and jsonb_typeof(setup.public_setup -> 'rounds') = 'array'
  and jsonb_array_length(setup.public_setup -> 'rounds') = 2
  and jsonb_typeof(setup.public_setup -> 'rounds' -> 1 -> 'initial_state') = 'object';
