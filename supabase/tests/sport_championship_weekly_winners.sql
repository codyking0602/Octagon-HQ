begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$
declare
  v_football jsonb;
  v_ufc jsonb;
begin
  if to_regprocedure('public.get_sport_championship_weekly(text,integer)') is null
    or to_regprocedure('private.sport_championship_week_projection(text,integer,date,date)') is null then
    raise exception 'Championship weekly projection missing';
  end if;
  v_football := public.get_sport_championship_weekly('football',2026);
  v_ufc := public.get_sport_championship_weekly('ufc',2026);
  if v_football->>'sport' <> 'football' or v_ufc->>'sport' <> 'ufc' then
    raise exception 'Weekly championship sport selection broken';
  end if;
  if jsonb_typeof(v_football->'weeks') <> 'array' or jsonb_typeof(v_ufc->'weeks') <> 'array' then
    raise exception 'Weekly champion archive must be an array';
  end if;
  if (select prosecdef from pg_proc where oid='public.get_sport_championship_weekly(text,integer)'::regprocedure) is distinct from true then
    raise exception 'Weekly championship function must be security definer';
  end if;
end $$;
rollback;
