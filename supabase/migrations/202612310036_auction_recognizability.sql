-- Rotate the current Auction catalog for a recognizability-only content pass.
-- V5 preserves v4 grading, rarity, generation weights, item references, and the
-- 6-round / 3-selection / $30 standard format. Historical snapshots stay immutable.

do $$
begin
  if not exists (
    select 1
    from private.auction_catalog_versions
    where content_version = 'ufc-auction-2026-08-v4'
      and rarity_version = 'balanced-rarity-2026-08-v2'
      and grading_version = 'ufc-private-grader-2026-08-v2'
      and is_preparation_version
  ) then
    raise exception 'Auction recognizability pass expected v4 to own new preparations';
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
  'ufc-auction-2026-08-v5',
  'balanced-rarity-2026-08-v2',
  'ufc-private-grader-2026-08-v2',
  true
);

-- Clone the complete current catalog first. Content replacements below are deliberately
-- label/description-only so PR3 can own grading calibration independently.
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
  'ufc-auction-2026-08-v5',
  mode_id,
  item_reference,
  display_label,
  display_description,
  rarity_band,
  generation_weight,
  private_generation_class,
  grading_inputs
from private.auction_catalog
where content_version = 'ufc-auction-2026-08-v4';

-- Wars was the only current pool whose weak tail fell below the knowledgeable-fan
-- recognizability floor. Replace deep cuts, duplicate expansion rows, and obvious
-- category mismatches with recognizable fights that still span eras and divisions.
update private.auction_catalog catalog
set
  display_label = replacement.display_label,
  display_description = replacement.display_label
from (
  values
    ('wars-25', 'Robbie Lawler vs Johny Hendricks — UFC 171'),
    ('wars-26', 'Robbie Lawler vs Carlos Condit — UFC 195'),
    ('wars-27', 'Yoel Romero vs Paulo Costa — UFC 241'),
    ('wars-28', 'Sean O''Malley vs Petr Yan — UFC 280'),
    ('wars-32', 'Justin Gaethje vs Rafael Fiziev — UFC 286'),
    ('wars-35', 'Alex Pereira vs Khalil Rountree Jr. — UFC 307'),
    ('wars-36', 'Islam Makhachev vs Dustin Poirier — UFC 302'),
    ('wars-37', 'Islam Makhachev vs Alexander Volkanovski — UFC 284'),
    ('wars-38', 'Charles Oliveira vs Michael Chandler II — UFC 309'),
    ('wars-40', 'Joanna Jedrzejczyk vs Claudia Gadelha II — TUF 23 Finale'),
    ('wars-42', 'Anderson Silva vs Michael Bisping — UFC Fight Night 84'),
    ('wars-43', 'Eddie Alvarez vs Justin Gaethje — UFC 218'),
    ('wars-44', 'Wanderlei Silva vs Brian Stann — UFC on Fuel TV 8'),
    ('wars-46', 'Jim Miller vs Joe Lauzon — UFC 155'),
    ('wars-47', 'Dustin Poirier vs Eddie Alvarez II — UFC on Fox 30')
) replacement(item_reference, display_label)
where catalog.content_version = 'ufc-auction-2026-08-v5'
  and catalog.mode_id = 'wars'
  and catalog.item_reference = replacement.item_reference;

do $$
declare
  v_definition text;
  v_expected text;
begin
  -- Extend the existing private-row validator to the new immutable snapshot.
  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_expected := 'v_auction.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: validate_auction_private_row';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_auction.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')'
  );
  execute v_definition;

  -- Keep one prepare RPC and inherit the exact v3/v4 standard format contract.
  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_expected := 'v_content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: prepare_auction format';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')'
  );
  execute v_definition;

  -- Extend the one bid validator to the same three-selection rule.
  v_definition := pg_get_functiondef(
    'private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure
  );
  v_expected := 'p_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: validate_auction_bid';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'p_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')'
  );
  execute v_definition;

  -- Extend the one round resolver to the same v3/v4/v5 format rules.
  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: resolve_auction_round selections';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')'
  );
  v_expected := 'content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: resolve_auction_round rounds';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')'
  );
  execute v_definition;

  -- Keep the canonical grader and all grading inputs unchanged; only authorize v5.
  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v2'', ''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: grade_auction versions';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v2'', ''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')'
  );
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: grade_auction selections';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')'
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
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5') then 6
      else 8
    end
  ),
  add constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5') then 3
      else 4
    end
    and recipient_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5') then 3
      else 4
    end
  ),
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5') then 30
      else 40
    end
    and recipient_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in ('ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5') then 30
      else 40
    end
  );

comment on constraint auction_games_round_valid on private.auction_games is
  'V3 through v5 standard Auctions have six rounds; Ultimate Fighter and older pinned snapshots retain their historical format.';