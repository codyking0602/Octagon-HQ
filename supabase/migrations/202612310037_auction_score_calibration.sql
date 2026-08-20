-- PR3: widen compressed Auction grading inputs without changing the canonical grader.
-- New preparations rotate to immutable v6. V5 and older completed games retain their
-- pinned grading inputs and historical scores. Final-score rounding remains PR4 work.

do $$
declare
  v_wars_min numeric;
  v_wars_max numeric;
  v_strikers_min numeric;
  v_strikers_max numeric;
  v_grapplers_min numeric;
  v_grapplers_max numeric;
begin
  if not exists (
    select 1
    from private.auction_catalog_versions
    where content_version = 'ufc-auction-2026-08-v5'
      and rarity_version = 'balanced-rarity-2026-08-v2'
      and grading_version = 'ufc-private-grader-2026-08-v2'
      and is_preparation_version
  ) then
    raise exception 'Auction calibration expected v5 to own new preparations';
  end if;

  -- Lock the audited reference distributions before any new snapshot is inserted.
  -- Wars is badly compressed; Strikers and Grapplers already use a healthy range.
  select min((grading_inputs ->> 'overall')::numeric), max((grading_inputs ->> 'overall')::numeric)
    into v_wars_min, v_wars_max
  from private.auction_catalog
  where content_version = 'ufc-auction-2026-08-v5' and mode_id = 'wars';

  select min((grading_inputs ->> 'overall')::numeric), max((grading_inputs ->> 'overall')::numeric)
    into v_strikers_min, v_strikers_max
  from private.auction_catalog
  where content_version = 'ufc-auction-2026-08-v5' and mode_id = 'strikers';

  select min((grading_inputs ->> 'overall')::numeric), max((grading_inputs ->> 'overall')::numeric)
    into v_grapplers_min, v_grapplers_max
  from private.auction_catalog
  where content_version = 'ufc-auction-2026-08-v5' and mode_id = 'grapplers';

  if v_wars_min <> 89 or v_wars_max <> 100 then
    raise exception 'Wars audit drifted: expected 89-100, found %-%', v_wars_min, v_wars_max;
  end if;
  if v_strikers_min <> 77 or v_strikers_max <> 99 then
    raise exception 'Strikers audit drifted: expected 77-99, found %-%', v_strikers_min, v_strikers_max;
  end if;
  if v_grapplers_min <> 78 or v_grapplers_max <> 99 then
    raise exception 'Grapplers audit drifted: expected 78-99, found %-%', v_grapplers_min, v_grapplers_max;
  end if;
end;
$$;

update private.auction_catalog_versions
set is_preparation_version = false
where is_preparation_version;

insert into private.auction_catalog_versions (
  content_version,
  rarity_version,
  grading_version,
  is_preparation_version
) values (
  'ufc-auction-2026-08-v6',
  'balanced-rarity-2026-08-v2',
  'ufc-private-grader-2026-08-v2',
  true
);

-- Category-specific floors reflect the audited compression. Career-performance modes,
-- Strikers, Grapplers, and Ultimate Fighter already have useful separation and are copied
-- exactly. The calibrated modes preserve their existing order and ceiling while using more
-- of the practical 70-100 scale.
with targets(mode_id, target_floor) as (
  values
    ('knockout-artists', 72::numeric),
    ('fighter-performances', 70::numeric),
    ('greatest-ufc-card', 70::numeric),
    ('finishes', 70::numeric),
    ('wars', 70::numeric),
    ('rivalries', 72::numeric),
    ('iconic-moments', 72::numeric),
    ('nicknames', 72::numeric)
),
stats as (
  select
    catalog.mode_id,
    min((catalog.grading_inputs ->> 'overall')::numeric) as source_min,
    max((catalog.grading_inputs ->> 'overall')::numeric) as source_max
  from private.auction_catalog catalog
  join targets on targets.mode_id = catalog.mode_id
  where catalog.content_version = 'ufc-auction-2026-08-v5'
  group by catalog.mode_id
)
insert into private.auction_catalog (
  content_version,
  mode_id,
  item_reference,
  display_label,
  display_description,
  rarity_band,
  generation_weight,
  private_generation_class,
  grading_inputs
)
select
  'ufc-auction-2026-08-v6',
  source.mode_id,
  source.item_reference,
  source.display_label,
  source.display_description,
  source.rarity_band,
  source.generation_weight,
  source.private_generation_class,
  case
    when targets.mode_id is null then source.grading_inputs
    else jsonb_set(
      source.grading_inputs,
      '{overall}',
      to_jsonb(round(
        targets.target_floor
        + (
          ((source.grading_inputs ->> 'overall')::numeric - stats.source_min)
          * ((stats.source_max - targets.target_floor) / nullif(stats.source_max - stats.source_min, 0))
        )
      )),
      false
    )
  end
from private.auction_catalog source
left join targets on targets.mode_id = source.mode_id
left join stats on stats.mode_id = source.mode_id
where source.content_version = 'ufc-auction-2026-08-v5';

-- Focused calibration invariants. V6 may change only standard-mode grading inputs in the
-- reviewed target families; catalog content, generation, rarity, and all other families stay exact.
do $$
declare
  v_mode record;
  v_source_min numeric;
  v_source_max numeric;
  v_new_min numeric;
  v_new_max numeric;
begin
  if (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v6')
    <> (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v5')
  then
    raise exception 'Auction calibration changed catalog row count';
  end if;

  if (select count(distinct mode_id) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v6') <> 14 then
    raise exception 'Auction calibration changed the current fourteen-mode catalog shape';
  end if;

  if exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v6'
      and mode_id in ('championship-performances', 'dominant-performances')
  ) then
    raise exception 'Auction calibration restored a retired performance mode';
  end if;

  if exists (
    select 1
    from private.auction_catalog v6
    join private.auction_catalog v5
      on v5.content_version = 'ufc-auction-2026-08-v5'
     and v5.mode_id = v6.mode_id
     and v5.item_reference = v6.item_reference
    where v6.content_version = 'ufc-auction-2026-08-v6'
      and (
        v6.display_label is distinct from v5.display_label
        or v6.display_description is distinct from v5.display_description
        or v6.rarity_band is distinct from v5.rarity_band
        or v6.generation_weight is distinct from v5.generation_weight
        or v6.private_generation_class is distinct from v5.private_generation_class
      )
  ) then
    raise exception 'PR3 changed content, rarity, or generation ownership';
  end if;

  if exists (
    select 1
    from private.auction_catalog v6
    join private.auction_catalog v5
      on v5.content_version = 'ufc-auction-2026-08-v5'
     and v5.mode_id = v6.mode_id
     and v5.item_reference = v6.item_reference
    where v6.content_version = 'ufc-auction-2026-08-v6'
      and v6.mode_id not in (
        'knockout-artists',
        'fighter-performances',
        'greatest-ufc-card',
        'finishes',
        'wars',
        'rivalries',
        'iconic-moments',
        'nicknames'
      )
      and v6.grading_inputs is distinct from v5.grading_inputs
  ) then
    raise exception 'PR3 changed a grading family that passed the range audit';
  end if;

  -- Ultimate Fighter's category-placement inputs must remain byte-for-byte identical.
  if exists (
    select 1
    from private.auction_catalog v6
    join private.auction_catalog v5
      on v5.content_version = 'ufc-auction-2026-08-v5'
     and v5.mode_id = v6.mode_id
     and v5.item_reference = v6.item_reference
    where v6.content_version = 'ufc-auction-2026-08-v6'
      and v6.mode_id = 'ultimate-fighter'
      and v6.grading_inputs is distinct from v5.grading_inputs
  ) then
    raise exception 'PR3 changed Ultimate Fighter category-placement grading';
  end if;

  for v_mode in
    select * from (values
      ('knockout-artists', 72::numeric),
      ('fighter-performances', 70::numeric),
      ('greatest-ufc-card', 70::numeric),
      ('finishes', 70::numeric),
      ('wars', 70::numeric),
      ('rivalries', 72::numeric),
      ('iconic-moments', 72::numeric),
      ('nicknames', 72::numeric)
    ) as calibrated(mode_id, target_floor)
  loop
    select
      min((grading_inputs ->> 'overall')::numeric),
      max((grading_inputs ->> 'overall')::numeric)
      into v_source_min, v_source_max
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v5'
      and mode_id = v_mode.mode_id;

    select
      min((grading_inputs ->> 'overall')::numeric),
      max((grading_inputs ->> 'overall')::numeric)
      into v_new_min, v_new_max
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v6'
      and mode_id = v_mode.mode_id;

    if v_new_min <> v_mode.target_floor
      or v_new_max <> v_source_max
      or (v_new_max - v_new_min) < 27
      or v_new_min >= v_source_min
    then
      raise exception 'Auction % calibration invalid: source %-% new %-%',
        v_mode.mode_id, v_source_min, v_source_max, v_new_min, v_new_max;
    end if;
  end loop;

  -- Explicitly prove the pinned v5 Wars contract was not rewritten.
  if (select min((grading_inputs ->> 'overall')::numeric)
      from private.auction_catalog
      where content_version = 'ufc-auction-2026-08-v5' and mode_id = 'wars') <> 89
  then
    raise exception 'Historical v5 Wars grading inputs were mutated';
  end if;
end;
$$;

-- Preserve the existing canonical Auction owners and only authorize the v6 snapshot.
do $$
declare
  v_definition text;
  v_expected text;
begin
  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_expected := 'v_auction.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction calibration owner drifted: validate_auction_private_row';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_auction.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')');
  execute v_definition;

  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_expected := 'v_content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction calibration owner drifted: prepare_auction format';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')');
  execute v_definition;

  v_definition := pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure);
  v_expected := 'p_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction calibration owner drifted: validate_auction_bid';
  end if;
  v_definition := replace(v_definition, v_expected,
    'p_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')');
  execute v_definition;

  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction calibration owner drifted: resolve_auction_round selections';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')');
  v_expected := 'content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction calibration owner drifted: resolve_auction_round rounds';
  end if;
  v_definition := replace(v_definition, v_expected,
    'content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')');
  execute v_definition;

  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v2'', ''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction calibration owner drifted: grade_auction versions';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v2'', ''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')');
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction calibration owner drifted: grade_auction selections';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')');
  execute v_definition;
end;
$$;

alter table private.auction_games
  drop constraint auction_games_round_valid,
  drop constraint auction_games_selection_counts_valid,
  drop constraint auction_games_bankroll_ceiling;

alter table private.auction_games
  add constraint auction_games_round_valid check (
    current_round >= 1
    and current_round <= case
      when mode_id = 'ultimate-fighter' then 10
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 8
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5', 'ufc-auction-2026-08-v6') then 6
      else 8
    end
  ),
  add constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5', 'ufc-auction-2026-08-v6') then 3
      else 4
    end
    and recipient_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5', 'ufc-auction-2026-08-v6') then 3
      else 4
    end
  ),
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5', 'ufc-auction-2026-08-v6') then 30
      else 40
    end
    and recipient_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5', 'ufc-auction-2026-08-v6') then 30
      else 40
    end
  );

comment on constraint auction_games_round_valid on private.auction_games is
  'V3 through v6 standard Auctions have six rounds; Ultimate Fighter and older pinned snapshots retain their historical format.';