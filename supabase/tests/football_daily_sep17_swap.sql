begin;

-- The hotfix migration itself asserts the active production source schedule and safely
-- replaces September 17. This regression check verifies the intended v8 identity after
-- migrations are applied in the test database.
do $$
begin
  if private.daily_challenge_expected_game('football-daily-v8-sep17-swap', date '2026-09-17')
      is distinct from 'hit_the_number' then
    raise exception 'September 17 Football Daily must be Hit the Number after hotfix';
  end if;

  if private.daily_challenge_expected_game('football-daily-v8-sep17-swap', date '2026-09-18')
      is distinct from 'keep_4_cut_4' then
    raise exception 'September 18 Football Daily must be Keep 4 / Blind 5 after hotfix';
  end if;

  if private.daily_challenge_expected_game('football-daily-v8-sep17-swap', date '2026-09-19')
      is distinct from 'who_am_i' then
    raise exception 'September 19 Football Daily must retain the existing rotation';
  end if;
end
$$;

rollback;
