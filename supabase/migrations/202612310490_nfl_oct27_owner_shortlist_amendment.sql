-- One-time owner-approved NFL shortlist amendment for Oct 27 only.
-- Preserve the five-choice lock, the other four matchups, all player candidates,
-- CFB selections, immutable owner approvals, and every previous week.
do $$
declare
  v_row public.football_weekly_content_packages%rowtype;
  v_games jsonb;
  v_next jsonb;
begin
  select * into v_row from public.football_weekly_content_packages
    where week_of = date '2026-10-27' for update;
  if not found then
    return; -- empty local CI databases have not staged future editorial candidates
  end if;
  if v_row.status <> 'draft'
     or v_row.choices ? 'nfl'
     or v_row.production ? 'nfl'
     or now() >= (timestamp '2026-10-27' at time zone 'America/Chicago') then
    raise exception 'Oct 27 NFL shortlist amendment requires unapproved, unprepared draft before Tuesday';
  end if;
  v_games := v_row.proposals #> '{nfl,games}';
  if jsonb_typeof(v_games) <> 'array'
     or jsonb_array_length(v_games) <> 5
     or jsonb_array_length(v_row.proposals #> '{nfl,players}') <> 5 then
    raise exception 'Existing NFL five-plus-five slate missing';
  end if;
  if (select count(*) from jsonb_array_elements(v_games) g where g->>'id' = 'browns-at-steelers') = 1 then
    if (select count(*) from jsonb_array_elements(v_games) g where g->>'id' = 'bears-at-seahawks') <> 0 then
      raise exception 'Conflicting NFL slate';
    end if;
    return; -- safe if migration applied after an identical guarded amendment
  end if;
  if (select count(*) from jsonb_array_elements(v_games) g where g->>'id' = 'bears-at-seahawks') <> 1 then
    raise exception 'Original immutable NFL shortlist does not match expected fixture';
  end if;
  select jsonb_agg(
    case when g->>'id' = 'bears-at-seahawks' then
      jsonb_build_object(
        'id', 'browns-at-steelers',
        'away_team', 'Cleveland Browns',
        'home_team', 'Pittsburgh Steelers',
        'kickoff_at', '2026-11-01T12:00:00-06:00',
        'summary', 'The 5-2 Browns visit the 5-2 Steelers for an AFC North rivalry at Acrisure Stadium, Sunday at 1 p.m. ET on CBS.'
      )
    else g end order by ord
  ) into v_next
  from jsonb_array_elements(v_games) with ordinality as t(g,ord);
  if jsonb_array_length(v_next) <> 5
     or (select count(distinct g->>'id') from jsonb_array_elements(v_next) g) <> 5 then
    raise exception 'NFL amendment violated five distinct matchup slots';
  end if;
  update public.football_weekly_content_packages p
    set proposals = jsonb_set(p.proposals, '{nfl,games}', v_next, false),
        updated_at = now()
    where week_of = date '2026-10-27' and status = 'draft';
  if not found then raise exception 'NFL staged shortlist amendment was not applied'; end if;
end $$;
