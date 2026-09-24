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
      and public_enabled = false
      and field_ready = false
      and bracket_template = '{"teams":[],"nodes":[]}'::jsonb
  ) then
    raise exception '2026 MLB rollout must start private and field-pending';
  end if;

  if (select featured_challenge ->> 'route' from public.mlb_playoff_seasons where season = 2026) <> '/mlb/challenge' then
    raise exception 'MLB Featured Challenge route drifted';
  end if;

  select pg_get_functiondef('public.get_mlb_playoffs_hub(integer)'::regprocedure::oid)
    into v_hub_definition;
  if position('not v_season.public_enabled and not v_is_owner' in v_hub_definition) = 0 then
    raise exception 'MLB hub lost owner/private release gate';
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
    or position('when ''championship_series'' then 4' in v_score_definition) = 0
    or position('when ''world_series'' then 8' in v_score_definition) = 0
  then
    raise exception 'MLB progressive bracket scoring drifted';
  end if;
end;
$mlb_playoffs_contract$;

rollback;
