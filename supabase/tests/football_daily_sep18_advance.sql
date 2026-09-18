begin;

-- The hotfix migration validates the live source schedule and replaces September 18 safely.
-- This regression check verifies the intended v9 identity after migrations are applied.
do $$
begin
  if private.daily_challenge_expected_game('football-daily-v9-sep18-advance', date '2026-09-18')
      is distinct from 'who_am_i' then
    raise exception 'September 18 Football Daily must be Who Am I after hotfix';
  end if;

  if private.daily_challenge_expected_game('football-daily-v9-sep18-advance', date '2026-09-19')
      is distinct from 'keep_4_cut_4' then
    raise exception 'September 19 Football Daily must be Keep 4 / Blind 5 after hotfix';
  end if;

  if private.daily_challenge_expected_game('football-daily-v9-sep18-advance', date '2026-09-20')
      is distinct from 'find_leader' then
    raise exception 'September 20 Football Daily must retain the existing rotation';
  end if;
end
$$;

rollback;
