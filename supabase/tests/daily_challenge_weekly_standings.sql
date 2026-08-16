begin;

select set_config('request.jwt.claim.role', 'service_role', true);

\ir ../migrations/202612310022_reset_daily_challenge_championship_era.sql

do $$
declare
  v_championship_start date := date '2026-08-10';
  v_projection_week_start date;
  v_title_counts jsonb;
begin
  if extract(isodow from v_championship_start) <> 1 then
    raise exception 'championship era must begin on a canonical Monday';
  end if;

  -- At launch, all historical completed weeks are outside the championship era
  -- and the launch week itself is still active, so every title count is zero.
  v_projection_week_start := v_championship_start;
  with weekly_stats(profile_id, week_start, wins, average_score, played) as (
    values
      ('a', v_championship_start - 7, 4, 99.0, 7),
      ('b', v_championship_start - 7, 1, 70.0, 7),
      ('a', v_championship_start, 6, 90.0, 7),
      ('b', v_championship_start, 1, 80.0, 7)
  ),
  weekly_ranked as (
    select weekly_stats.*,
      rank() over (
        partition by week_start
        order by wins desc, average_score desc, played desc
      ) as weekly_rank
    from weekly_stats
  ),
  title_counts as (
    select profile_id, count(*) filter (
      where weekly_rank = 1
        and week_start >= v_championship_start
        and week_start < v_projection_week_start
    ) as titles
    from weekly_ranked
    group by profile_id
  )
  select jsonb_object_agg(profile_id, titles)
  into v_title_counts
  from title_counts;

  if (v_title_counts->>'a')::integer <> 0
    or (v_title_counts->>'b')::integer <> 0 then
    raise exception 'championship reset did not zero historical titles: %', v_title_counts;
  end if;

  -- Once championship weeks complete, preserve wins, average, games-played,
  -- and exact-tie/co-champion rules while ignoring pre-era history.
  v_projection_week_start := v_championship_start + 28;
  with weekly_stats(profile_id, week_start, wins, average_score, played) as (
    values
      ('b', v_championship_start - 7, 9, 100.0, 7),
      ('a', v_championship_start, 2, 90.0, 3),
      ('b', v_championship_start, 2, 90.0, 3),
      ('a', v_championship_start + 7, 3, 70.0, 3),
      ('b', v_championship_start + 7, 2, 99.0, 7),
      ('a', v_championship_start + 14, 1, 95.0, 2),
      ('b', v_championship_start + 14, 1, 90.0, 7),
      ('a', v_championship_start + 21, 1, 80.0, 4),
      ('b', v_championship_start + 21, 1, 80.0, 3),
      ('b', v_projection_week_start, 7, 100.0, 7)
  ),
  weekly_ranked as (
    select weekly_stats.*,
      rank() over (
        partition by week_start
        order by wins desc, average_score desc, played desc
      ) as weekly_rank
    from weekly_stats
  ),
  title_counts as (
    select profile_id, count(*) filter (
      where weekly_rank = 1
        and week_start >= v_championship_start
        and week_start < v_projection_week_start
    ) as titles
    from weekly_ranked
    group by profile_id
  )
  select jsonb_object_agg(profile_id, titles)
  into v_title_counts
  from title_counts;

  if (v_title_counts->>'a')::integer <> 4
    or (v_title_counts->>'b')::integer <> 1 then
    raise exception 'weekly title wins/tiebreak/co-champion contract failed: %', v_title_counts;
  end if;
end
$$;

rollback;
