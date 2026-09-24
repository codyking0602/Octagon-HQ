-- Patch the already-materialized September 24 UFC Sports Feud setup so
-- future players use the same corrected acceptance rules as the authored source.
-- This does not reset, delete, or rewrite any completed attempt.

do $$
declare
  v_setup_id uuid;
  v_setup_key text;
  v_pack jsonb;
  v_entities jsonb;
  v_fast_money jsonb;
  v_jon_id constant text := 'ufc-sep24-fast-striking-showcase:v17';
  v_expected_setup_key constant text :=
    'family-feud-daily-v2:play-rotation-v14-weighted-sep24:2026-09-24:ufc:sports-feud-bank-v1-ufc-2026-09-24-ufc-sep24-main-grappling-pressure-ufc-sep24-main-womens-ufc';
begin
  select setup.id, setup.setup_key, setup.private_setup_evidence -> 'pack'
    into v_setup_id, v_setup_key, v_pack
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  join private.daily_challenge_setups setup
    on setup.id = daily.setup_id
  where daily.central_day = date '2026-09-24'
    and schedule.sport = 'ufc'
    and daily.game_type = 'sports_feud';

  if v_setup_id is null then
    return;
  end if;

  if v_setup_key is distinct from v_expected_setup_key then
    raise exception 'September 24 UFC Sports Feud setup changed before acceptance hotfix: %', v_setup_key;
  end if;

  if v_pack is null then
    raise exception 'September 24 UFC Sports Feud private pack is missing';
  end if;

  select jsonb_agg(
    case
      when entity ->> 'id' = 'ufc-sep24-main-grappling-pressure:a5'
        then jsonb_set(entity, '{aliases}', '["GSP","St Pierre"]'::jsonb, true)
      else entity
    end
    order by ordinality
  )
  into v_entities
  from jsonb_array_elements(v_pack -> 'entities') with ordinality as rows(entity, ordinality);

  if not exists (
    select 1
    from jsonb_array_elements(v_entities) as rows(entity)
    where entity ->> 'id' = 'ufc-sep24-main-grappling-pressure:a5'
      and entity ->> 'displayName' = 'Georges St-Pierre'
  ) then
    raise exception 'Georges St-Pierre entity is missing from September 24 UFC Sports Feud';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(v_entities) as rows(entity)
    where entity ->> 'id' = v_jon_id
  ) then
    v_entities := v_entities || jsonb_build_array(
      jsonb_build_object(
        'id', v_jon_id,
        'kind', 'person',
        'aliases', '[]'::jsonb,
        'displayName', 'Jon Jones'
      )
    );
  end if;

  select jsonb_agg(
    case
      when question ->> 'id' = 'ufc-sep24-fast-striking-showcase' then
        jsonb_set(
          jsonb_set(
            question,
            '{candidateIds}',
            case
              when (question -> 'candidateIds') @> jsonb_build_array(v_jon_id)
                then question -> 'candidateIds'
              else (question -> 'candidateIds') || jsonb_build_array(v_jon_id)
            end,
            true
          ),
          '{alsoAcceptedEntityIds}',
          case
            when (question -> 'alsoAcceptedEntityIds') @> jsonb_build_array(v_jon_id)
              then question -> 'alsoAcceptedEntityIds'
            else (question -> 'alsoAcceptedEntityIds') || jsonb_build_array(v_jon_id)
          end,
          true
        )
      else question
    end
    order by ordinality
  )
  into v_fast_money
  from jsonb_array_elements(v_pack -> 'fastMoney') with ordinality as rows(question, ordinality);

  if not exists (
    select 1
    from jsonb_array_elements(v_fast_money) as rows(question)
    where question ->> 'id' = 'ufc-sep24-fast-striking-showcase'
      and (question -> 'alsoAcceptedEntityIds') @> jsonb_build_array(v_jon_id)
  ) then
    raise exception 'Jon Jones was not added to the September 24 striking showcase accepted universe';
  end if;

  v_pack := jsonb_set(v_pack, '{entities}', v_entities, true);
  v_pack := jsonb_set(v_pack, '{fastMoney}', v_fast_money, true);

  alter table private.daily_challenge_setups
    disable trigger daily_challenge_setups_immutable;

  update private.daily_challenge_setups
  set private_setup_evidence = jsonb_set(
    private_setup_evidence,
    '{pack}',
    v_pack,
    true
  )
  where id = v_setup_id;

  alter table private.daily_challenge_setups
    enable trigger daily_challenge_setups_immutable;
end;
$;
