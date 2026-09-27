-- Move any September 27 two-game Daily players already parked at the
-- Game 1 intermission directly into Game 2 without touching their saved
-- Game 1 submission or score. Future handoffs are handled by the runtime.

update private.daily_challenge_progress as progress
set
  revision = progress.revision + 1,
  public_state = progress.public_state || jsonb_build_object(
    'round_index', 1,
    'awaiting_next', false,
    'active_round', setup.public_setup -> 'rounds' -> 1 -> 'initial_state',
    'active_reveal', null
  ),
  updated_at = now()
from private.daily_challenges as daily
join private.daily_challenge_setups as setup
  on setup.id = daily.setup_id
where progress.daily_challenge_id = daily.id
  and daily.central_day = date '2026-09-27'
  and daily.scoring_version = 'daily-two-game-average-score-v1'
  and progress.public_state ->> 'format_version' = 'daily-two-game-average-v1'
  and progress.public_state ->> 'awaiting_next' = 'true'
  and coalesce((progress.public_state ->> 'round_index')::integer, 0) = 0
  and jsonb_typeof(progress.public_state -> 'round_scores') = 'array'
  and jsonb_array_length(progress.public_state -> 'round_scores') = 1
  and jsonb_typeof(setup.public_setup -> 'rounds') = 'array'
  and jsonb_array_length(setup.public_setup -> 'rounds') = 2
  and setup.public_setup -> 'rounds' -> 1 -> 'initial_state' is not null;
