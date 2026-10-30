-- Confirm the final score server-side, rather than trusting the number in an API request.
-- This follows precisely the shipped NFL GM Team OVR ladder and 90/10 formula.
-- No historical records, sim outcomes, or Casual GM grading are altered.
create or replace function private.football_weekly_gm_verified_score(p_state jsonb)
returns numeric
language plpgsql immutable
set search_path = ''
as $$
declare
  v_seasons jsonb := p_state->'resolvedSeasons';
  v_row jsonb;
  v_year integer;
  v_grade numeric;
  v_raw numeric;
  v_weak numeric;
  v_wins integer;
  v_losses integer;
  v_finish text;
  v_resume integer;
  v_resume_total numeric := 0;
  v_wins_total integer := 0;
  v_old_finish_total numeric := 0;
  v_ovr_total numeric := 0;
  v_ovr numeric;
  v_ranked_roster numeric;
  v_resume_score numeric;
  v_anchor_grades numeric[] := array[78,80,82,84,85,86,87,88,89,90,91,92,93,94,98];
  v_anchor_ovrs numeric[] := array[70,74,78,82,84,87,89,92,94,96,97,98,98,99,99];
begin
  if jsonb_typeof(v_seasons) is distinct from 'array'
    or jsonb_array_length(v_seasons) <> 3 then
    raise exception 'Weekly GM requires three verified season summaries';
  end if;
  for v_year in 1..3 loop
    v_row := v_seasons->(v_year - 1);
    if jsonb_typeof(v_row) is distinct from 'object'
      or v_row->>'year' is distinct from v_year::text
      or coalesce(v_row->>'teamGrade','') !~ '^[0-9]+(\.[0-9]+)?$'
      or coalesce(v_row->>'rawTeamGrade','') !~ '^[0-9]+(\.[0-9]+)?$'
      or coalesce(v_row->>'weakLinkPenalty','') !~ '^[0-9]+(\.[0-9]+)?$'
      or coalesce(v_row->>'wins','') !~ '^[0-9]+$'
      or coalesce(v_row->>'losses','') !~ '^[0-9]+$'
      then raise exception 'Invalid Weekly GM season summary for Year %', v_year;
    end if;
    v_grade := (v_row->>'teamGrade')::numeric;
    v_raw := (v_row->>'rawTeamGrade')::numeric;
    v_weak := (v_row->>'weakLinkPenalty')::numeric;
    v_wins := (v_row->>'wins')::integer;
    v_losses := (v_row->>'losses')::integer;
    if v_grade not between 65 and 105
      or v_raw not between 65 and 105
      or v_weak not between 0 and 0.8
      or v_grade <> round(v_raw - v_weak, 1)
      or v_wins + v_losses <> 17
      or v_wins > 17 or v_losses > 17 then
      raise exception 'Inconsistent Weekly GM season grading for Year %', v_year;
    end if;
    v_finish := v_row->>'finish';
    v_resume := case v_finish
      when 'Missed Playoffs' then 70
      when 'Wild Card' then 80
      when 'Divisional' then 86
      when 'Conference Championship' then 92
      when 'Super Bowl Loss' then 96
      when 'Champion' then 100
      else null end;
    if v_resume is null then raise exception 'Invalid Weekly GM postseason finish'; end if;
    -- footballGmTeamOverall(): clamp the raw grade, then interpolate the
    -- exact same approved OVR anchors used for Casual and Weekly.
    v_grade := greatest(78, least(98, v_grade));
    v_ovr := 99;
    for i in 2..15 loop
      if v_grade <= v_anchor_grades[i] then
        v_ovr := round(v_anchor_ovrs[i - 1]
          + (v_anchor_ovrs[i] - v_anchor_ovrs[i - 1])
            * (v_grade - v_anchor_grades[i - 1])
            / greatest(1, v_anchor_grades[i] - v_anchor_grades[i - 1]));
        exit;
      end if;
    end loop;
    v_ovr_total := v_ovr_total + v_ovr;
    v_resume_total := v_resume_total + v_resume;
    v_wins_total := v_wins_total + v_wins;
    v_old_finish_total := v_old_finish_total + case v_finish
      when 'Missed Playoffs' then 83 when 'Wild Card' then 85
      when 'Divisional' then 88 when 'Conference Championship' then 94
      when 'Super Bowl Loss' then 97 when 'Champion' then 100 end;
  end loop;
  v_ranked_roster := round(v_ovr_total / 3, 1);
  v_resume_score := round(v_resume_total / 3, 1);
  if coalesce(p_state->>'seed','') ~ '^weekly-gm:2026-10-(13|20):' then
    return round(v_ranked_roster * 0.90 + round(v_old_finish_total / 3, 1) * 0.10, 1);
  end if;
  return round(v_ranked_roster * 0.90
    + round(60 + 40 * v_wins_total::numeric / 51, 1) * 0.03
    + v_resume_score * 0.07, 1);
end;
$$;


revoke all on function private.football_weekly_gm_verified_score(jsonb) from public, anon, authenticated;

-- Regrade every completed official attempt in the currently active October 27
-- championship using the identical protected server function. Existing draws,
-- roster choices, season outcomes, completion timestamps and previous weeks
-- remain unchanged. The official leaderboard reads these canonical scores.
update private.football_weekly_gm_attempts
set score = private.football_weekly_gm_verified_score(state)
where week_start = date '2026-10-27'
  and completed_at is not null
  and state is not null;
