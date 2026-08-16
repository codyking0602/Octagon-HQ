begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_today date := private.daily_challenge_central_day(now());
  v_week_start date := v_today - (extract(isodow from v_today)::integer - 1);
  v_week_end date := v_week_start + 6;
  v_title_counts jsonb;
begin
  if extract(isodow from v_week_start) <> 1
    or extract(isodow from v_week_end) <> 7
    or v_week_end - v_week_start <> 6 then
    raise exception 'competition week is not Monday-Sunday in canonical Central days';
  end if;

  -- Exercise the championship ordering independently of names and ids. The four
  -- completed weeks cover wins, average, games-played, and exact-tie outcomes;
  -- the active week proves that an in-progress leader receives no title.
  with weekly_stats(profile_id, week_start, wins, average_score, played) as (
    values
      ('a', v_week_start - 28, 2, 90.0, 3),
      ('b', v_week_start - 28, 2, 90.0, 3),
      ('a', v_week_start - 21, 3, 70.0, 3),
      ('b', v_week_start - 21, 2, 99.0, 7),
      ('a', v_week_start - 14, 1, 95.0, 2),
      ('b', v_week_start - 14, 1, 90.0, 7),
      ('a', v_week_start - 7, 1, 80.0, 4),
      ('b', v_week_start - 7, 1, 80.0, 3),
      ('b', v_week_start, 7, 100.0, 7)
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
      where weekly_rank = 1 and week_start < v_week_start
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
