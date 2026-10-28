-- Consolidate overlapping performance Auctions into one deeper current pool without
-- mutating any historical snapshot. V4 keeps the v3 6-round / 3-pick / $30 format,
-- preserves Best Finishes exactly, and leaves retired mode data available to pinned games.

do $$
begin
  if not exists (
    select 1
    from private.auction_catalog_versions
    where content_version = 'ufc-auction-2026-08-v3'
      and rarity_version = 'balanced-rarity-2026-08-v2'
      and grading_version = 'ufc-private-grader-2026-08-v2'
      and is_preparation_version
  ) then
    raise exception 'Auction consolidation expected v3 to own new preparations';
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
  'ufc-auction-2026-08-v4',
  'balanced-rarity-2026-08-v2',
  'ufc-private-grader-2026-08-v2',
  true
);

-- Copy every surviving current mode directly from v3. Historical v3 rows remain immutable.
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
  'ufc-auction-2026-08-v4',
  mode_id,
  item_reference,
  display_label,
  display_description,
  rarity_band,
  generation_weight,
  private_generation_class,
  grading_inputs
from private.auction_catalog
where content_version = 'ufc-auction-2026-08-v3'
  and mode_id not in ('championship-performances', 'dominant-performances');

-- Fold only already-reviewed elite performances from the two retired pools into the
-- canonical Best Fighter Performances pool. Existing fighter-performance labels win;
-- duplicate retired labels contribute only their strongest reviewed row.
with promoted as (
  select distinct on (source.display_label)
    source.mode_id as source_mode_id,
    source.item_reference as source_item_reference,
    source.display_label,
    source.display_description,
    source.rarity_band,
    source.generation_weight,
    source.private_generation_class,
    source.grading_inputs
  from private.auction_catalog source
  where source.content_version = 'ufc-auction-2026-08-v3'
    and source.mode_id in ('championship-performances', 'dominant-performances')
    and (source.grading_inputs ->> 'overall')::numeric >= 90
    and not exists (
      select 1
      from private.auction_catalog fighter
      where fighter.content_version = 'ufc-auction-2026-08-v3'
        and fighter.mode_id = 'fighter-performances'
        and fighter.display_label = source.display_label
    )
  order by
    source.display_label,
    (source.grading_inputs ->> 'overall')::numeric desc,
    source.mode_id,
    source.item_reference
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
  'ufc-auction-2026-08-v4',
  'fighter-performances',
  'consolidated-' || md5(source_mode_id || '|' || source_item_reference),
  display_label,
  display_description,
  rarity_band,
  generation_weight,
  private_generation_class,
  grading_inputs
from promoted;

do $$
declare
  v_definition text;
  v_expected text;
begin
  -- Keep the one existing private-row validator and extend its v3 format branch to v4.
  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_expected := 'v_auction.content_version = ''ufc-auction-2026-08-v3''';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction consolidation owner drifted: validate_auction_private_row';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_auction.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')'
  );
  execute v_definition;

  -- Keep one prepare RPC. Retired modes are no longer valid new choices, while v4
  -- inherits the exact standard v3 round and bankroll contract.
  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_expected := '''championship-performances'',';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction consolidation owner drifted: championship mode whitelist';
  end if;
  v_definition := replace(v_definition, v_expected, '');
  v_expected := '''dominant-performances'',';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction consolidation owner drifted: dominant mode whitelist';
  end if;
  v_definition := replace(v_definition, v_expected, '');
  v_expected := 'v_content_version = ''ufc-auction-2026-08-v3''';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction consolidation owner drifted: prepare_auction v3 format';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')'
  );
  execute v_definition;

  -- Extend the one bid validator to the same v3/v4 three-selection rule.
  v_definition := pg_get_functiondef(
    'private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure
  );
  v_expected := 'p_game.content_version = ''ufc-auction-2026-08-v3''';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction consolidation owner drifted: validate_auction_bid';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'p_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')'
  );
  execute v_definition;

  -- Extend the one round resolver to the same v3/v4 format rules.
  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_expected := 'v_game.content_version = ''ufc-auction-2026-08-v3''';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction consolidation owner drifted: resolve_auction_round selections';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')'
  );
  v_expected := 'content_version = ''ufc-auction-2026-08-v3''';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction consolidation owner drifted: resolve_auction_round rounds';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')'
  );
  execute v_definition;

  -- Extend the one canonical grader. No scoring formula or grading inputs change.
  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v2'', ''ufc-auction-2026-08-v3'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction consolidation owner drifted: grade_auction versions';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v2'', ''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')'
  );
  v_expected := 'v_game.content_version = ''ufc-auction-2026-08-v3''';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction consolidation owner drifted: grade_auction selections';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')'
  );
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
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4') then 6
      else 8
    end
  ),
  add constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4') then 3
      else 4
    end
    and recipient_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4') then 3
      else 4
    end
  ),
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4') then 30
      else 40
    end
    and recipient_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4') then 30
      else 40
    end
  );

comment on constraint auction_games_round_valid on private.auction_games is
  'V3 and v4 standard Auctions have six rounds; Ultimate Fighter and older pinned snapshots retain their historical format.';
