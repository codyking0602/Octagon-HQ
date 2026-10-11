begin;

do $mlb_playoffs_contract$
declare
  v_hub_definition text;
  v_save_definition text;
  v_score_definition text;
begin
  if to_regclass('public.mlb_playoff_seasons') is null then
    raise exception 'MLB season config table is missing';
  end if;
  if to_regclass('public.mlb_playoff_series') is null then
    raise exception 'MLB series table is missing';
  end if;
  if to_regclass('public.mlb_playoff_brackets') is null then
    raise exception 'MLB bracket table is missing';
  end if;
  if to_regclass('public.mlb_playoff_round_picks') is null then
    raise exception 'MLB round picks table is missing';
  end if;

  if not exists (
    select 1
    from public.mlb_playoff_seasons
    where season = 2026
      and public_enabled = true
      and field_ready = true
      and current_round = 'championship_series'
      and bracket_lock_at = timestamptz '2026-09-29 12:00:00-05'
      and jsonb_array_length(coalesce(bracket_template -> 'teams', '[]'::jsonb)) = 12
      and jsonb_array_length(coalesce(bracket_template -> 'nodes', '[]'::jsonb)) = 11
  ) then
    raise exception '2026 MLB field must be ready and public after launch';
  end if;

  if (select count(*) from public.mlb_playoff_series where season = 2026 and round = 'wild_card') <> 4 then
    raise exception '2026 MLB field must retain four Wild Card series';
  end if;

  if (select count(*) from public.mlb_playoff_series where season = 2026 and round = 'division_series') <> 4 then
    raise exception '2026 MLB field must contain four Division Series';
  end if;

  if (select count(*) from public.mlb_playoff_series
      where season = 2026 and round = 'division_series'
        and status = 'complete' and winner_team_id is not null) <> 4 then
    raise exception '2026 MLB Division Series results must all be finalized';
  end if;

  if not exists (
    select 1 from public.mlb_playoff_series
    where series_id = 'al-ds-1' and winner_team_id = 'tb' and series_score = 'TB 3–0 NYY'
  ) or not exists (
    select 1 from public.mlb_playoff_series
    where series_id = 'al-ds-2' and winner_team_id = 'cle' and series_score = 'CLE 3–2 CWS'
  ) or not exists (
    select 1 from public.mlb_playoff_series
    where series_id = 'nl-ds-1' and winner_team_id = 'mil' and series_score = 'MIL 3–1 SD'
  ) or not exists (
    select 1 from public.mlb_playoff_series
    where series_id = 'nl-ds-2' and winner_team_id = 'lad' and series_score = 'LAD 3–1 ATL'
  ) then
    raise exception '2026 MLB official Division Series winners/scores drifted';
  end if;

  if (select count(*) from public.mlb_playoff_series
      where season = 2026 and round = 'championship_series'
        and status = 'scheduled' and winner_team_id is null
        and picks_lock_at = timestamptz '2026-10-11 19:00:00-05'
        and team_a_moneyline is not null and team_b_moneyline is not null
        and jsonb_array_length(schedule) = 7) <> 2 then
    raise exception 'ALCS/NLCS or their frozen lines/7pm CT lock missing';
  end if;

  if not exists (
    select 1 from public.mlb_playoff_series
     where series_id = 'nl-cs' and team_a_id = 'lad' and team_b_id = 'mil'
       and starts_at = timestamptz '2026-10-11 19:00:00-05'
       and team_a_moneyline = -160 and team_b_moneyline = 130
  ) or not exists (
    select 1 from public.mlb_playoff_series
     where series_id = 'al-cs' and team_a_id = 'cle' and team_b_id = 'tb'
       and starts_at = timestamptz '2026-10-12 19:00:00-05'
       and team_a_moneyline = 140 and team_b_moneyline = -170
  ) then
    raise exception '2026 LCS official matchups, starts or DraftKings lines drifted';
  end if;

  if (select featured_challenge ->> 'route' from public.mlb_playoff_seasons where season = 2026) <> '/mlb/challenge' then
    raise exception 'MLB Featured Challenge route drifted';
  end if;

  select pg_get_functiondef('public.get_mlb_playoffs_hub(integer)'::regprocedure::oid)
    into v_hub_definition;
  if position('not v_season.public_enabled and not v_is_owner' in v_hub_definition) = 0 then
    raise exception 'MLB hub lost owner/private release gate';
  end if;
  if position('if v_bracket_locked then' in v_hub_definition) = 0
    or position('if v_bracket_locked or v_is_owner then' in v_hub_definition) > 0
  then
    raise exception 'MLB hub must hide every other bracket until the global bracket lock';
  end if;

  select pg_get_functiondef('public.save_mlb_playoff_bracket(integer,jsonb)'::regprocedure::oid)
    into v_save_definition;
  if position('mlb_playoffs_field_not_ready' in v_save_definition) = 0
    or position('mlb_playoffs_invalid_bracket_path' in v_save_definition) = 0
    or position('now() >= v_season.bracket_lock_at' in v_save_definition) = 0
  then
    raise exception 'MLB bracket save lost field, path, or lock protection';
  end if;

  select pg_get_functiondef('public.score_mlb_playoff_bracket(integer,jsonb)'::regprocedure::oid)
    into v_score_definition;
  if position('when ''wild_card'' then 1' in v_score_definition) = 0
    or position('when ''division_series'' then 2' in v_score_definition) = 0
    or position('when ''championship_series'' then 5' in v_score_definition) = 0
    or position('when ''world_series'' then 10' in v_score_definition) = 0
  then
    raise exception 'MLB progressive bracket scoring drifted';
  end if;
  if to_regclass('public.mlb_postseason_challenges') is null then
    raise exception 'MLB championship challenge slots table is missing';
  end if;
  if to_regclass('public.mlb_postseason_challenge_results') is null then
    raise exception 'MLB championship challenge result table is missing';
  end if;
  if to_regprocedure('public.score_mlb_series_picks(integer,uuid)') is null then
    raise exception 'MLB series-pick championship scorer is missing';
  end if;
  if to_regprocedure('public.score_mlb_postseason_play(integer,uuid)') is null then
    raise exception 'MLB Play championship scorer is missing';
  end if;
  if to_regprocedure('public.get_mlb_postseason_championship(integer)') is null then
    raise exception 'MLB Championship projection is missing';
  end if;
  if (select count(*) from public.mlb_postseason_challenges where season = 2026) <> 16 then
    raise exception '2026 MLB Championship must have exactly sixteen Play scoring slots';
  end if;

  if (select count(*) from public.mlb_postseason_challenges where season = 2026 and content_ready) <> 16 then
    raise exception '2026 MLB Championship must have all sixteen Play challenges production-ready';
  end if;

  if exists (
    select 1 from public.mlb_postseason_challenges
    where season = 2026 and not content_ready
  ) then
    raise exception '2026 MLB Championship cannot retain a not-ready Play challenge';
  end if;

  if not exists (
    select 1
    from public.mlb_postseason_challenges
    where season = 2026
      and challenge_key = 'mlb-2026-play-11'
      and scheduled_date = date '2026-10-11'
      and game_type = 'bar_trivia'
      and content_ready
  ) then
    raise exception '2026 MLB Bar Trivia slot is missing or not production-ready';
  end if;
end;
$mlb_playoffs_contract$;

rollback;
