-- Build the Ultimate Fighter v8: new games use the same reviewed v7 Auction catalog,
-- rarity, generator, and grader, except the Ultimate Fighter pool is men-only.
-- Historical v1-v7 games remain immutable and pinned to their original decks.

update private.auction_catalog_versions
set is_preparation_version = false
where is_preparation_version;

insert into private.auction_catalog_versions (
  content_version,
  rarity_version,
  grading_version,
  is_preparation_version
) values (
  'ufc-auction-2026-08-v8',
  'balanced-rarity-2026-08-v2',
  'ufc-private-grader-2026-08-v3',
  true
);

with excluded_v7_women(item_reference) as (
  values
    ('ultimate-fighter-8'),
    ('ultimate-fighter-9'),
    ('ultimate-fighter-24'),
    ('ultimate-fighter-30'),
    ('ultimate-fighter-71'),
    ('ultimate-fighter-72'),
    ('ultimate-fighter-73'),
    ('ultimate-fighter-74'),
    ('ultimate-fighter-75'),
    ('ultimate-fighter-76'),
    ('ultimate-fighter-77'),
    ('ultimate-fighter-78'),
    ('ultimate-fighter-79'),
    ('ultimate-fighter-80')
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
  'ufc-auction-2026-08-v8',
  source.mode_id,
  source.item_reference,
  source.display_label,
  source.display_description,
  source.rarity_band,
  source.generation_weight,
  source.private_generation_class,
  source.grading_inputs
from private.auction_catalog source
where source.content_version = 'ufc-auction-2026-08-v7'
  and not (
    source.mode_id = 'ultimate-fighter'
    and exists (
      select 1
      from excluded_v7_women excluded
      where excluded.item_reference = source.item_reference
    )
  );

-- V8 is a one-mode eligibility rotation only. Prove the 14 reviewed women rows are
-- removed from new Ultimate Fighter games while every retained row stays byte-identical.
do $$
declare
  v_excluded text[] := array[
    'ultimate-fighter-8',
    'ultimate-fighter-9',
    'ultimate-fighter-24',
    'ultimate-fighter-30',
    'ultimate-fighter-71',
    'ultimate-fighter-72',
    'ultimate-fighter-73',
    'ultimate-fighter-74',
    'ultimate-fighter-75',
    'ultimate-fighter-76',
    'ultimate-fighter-77',
    'ultimate-fighter-78',
    'ultimate-fighter-79',
    'ultimate-fighter-80'
  ];
begin
  if (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v7' and mode_id = 'ultimate-fighter') <> 80 then
    raise exception 'Historical v7 Ultimate Fighter pool drifted from the reviewed 80-row snapshot';
  end if;

  if (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v7' and mode_id = 'ultimate-fighter' and item_reference = any(v_excluded)) <> 14 then
    raise exception 'Historical v7 women row identity drifted';
  end if;

  if (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v8' and mode_id = 'ultimate-fighter') <> 66 then
    raise exception 'V8 Ultimate Fighter pool is not the reviewed 66-man pool';
  end if;

  if exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v8'
      and mode_id = 'ultimate-fighter'
      and item_reference = any(v_excluded)
  ) then
    raise exception 'V8 Ultimate Fighter retained a women row';
  end if;

  if exists (
    (
      select mode_id, item_reference, display_label, display_description, rarity_band,
        generation_weight, private_generation_class, grading_inputs
      from private.auction_catalog
      where content_version = 'ufc-auction-2026-08-v7'
        and not (mode_id = 'ultimate-fighter' and item_reference = any(v_excluded))
      except
      select mode_id, item_reference, display_label, display_description, rarity_band,
        generation_weight, private_generation_class, grading_inputs
      from private.auction_catalog
      where content_version = 'ufc-auction-2026-08-v8'
    )
    union all
    (
      select mode_id, item_reference, display_label, display_description, rarity_band,
        generation_weight, private_generation_class, grading_inputs
      from private.auction_catalog
      where content_version = 'ufc-auction-2026-08-v8'
      except
      select mode_id, item_reference, display_label, display_description, rarity_band,
        generation_weight, private_generation_class, grading_inputs
      from private.auction_catalog
      where content_version = 'ufc-auction-2026-08-v7'
        and not (mode_id = 'ultimate-fighter' and item_reference = any(v_excluded))
    )
  ) then
    raise exception 'V8 changed retained Auction content, weights, classes, or grading inputs';
  end if;

  if (select count(distinct mode_id) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v8') <> 14 then
    raise exception 'V8 changed the current fourteen-mode Auction shape';
  end if;

  if exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v8'
      and mode_id in ('championship-performances', 'dominant-performances')
  ) then
    raise exception 'V8 restored a retired Auction mode';
  end if;

  if not exists (
    select 1
    from private.auction_catalog_versions
    where content_version = 'ufc-auction-2026-08-v7'
      and rarity_version = 'balanced-rarity-2026-08-v2'
      and grading_version = 'ufc-private-grader-2026-08-v3'
      and not is_preparation_version
  ) then
    raise exception 'Historical v7 Auction contract was mutated';
  end if;

  if (select count(*) from private.auction_catalog_versions where is_preparation_version) <> 1
    or not exists (
      select 1
      from private.auction_catalog_versions
      where content_version = 'ufc-auction-2026-08-v8'
        and rarity_version = 'balanced-rarity-2026-08-v2'
        and grading_version = 'ufc-private-grader-2026-08-v3'
        and is_preparation_version
    )
  then
    raise exception 'V8 is not the single Auction preparation contract';
  end if;
end;
$$;

-- Preserve the existing lifecycle owners. V8 has the same 10 / 5 / $50 Ultimate
-- Fighter format and the same 6 / 3 / $30 standard format as v7.
do $$
declare
  v_definition text;
  v_expected text;
begin
  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_expected := 'v_auction.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction men-only owner drifted: validate_auction_private_row';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_auction.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'', ''ufc-auction-2026-08-v8'')');
  execute v_definition;

  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_expected := 'v_content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction men-only owner drifted: prepare_auction';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'', ''ufc-auction-2026-08-v8'')');
  execute v_definition;

  v_definition := pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure);
  v_expected := 'p_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction men-only owner drifted: validate_auction_bid';
  end if;
  v_definition := replace(v_definition, v_expected,
    'p_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'', ''ufc-auction-2026-08-v8'')');
  execute v_definition;

  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction men-only owner drifted: resolve_auction_round selections';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'', ''ufc-auction-2026-08-v8'')');
  v_expected := 'content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction men-only owner drifted: resolve_auction_round rounds';
  end if;
  v_definition := replace(v_definition, v_expected,
    'content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'', ''ufc-auction-2026-08-v8'')');
  execute v_definition;
end;
$$;
