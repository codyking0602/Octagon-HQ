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

-- Apply the reviewed Wars substitutions while inserting v5. auction_catalog is
-- immutable after insertion, so this deliberately does not add a mutation path.
with replacements(item_reference, display_label) as (
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
  'ufc-auction-2026-08-v5',
  source.mode_id,
  source.item_reference,
  coalesce(replacement.display_label, source.display_label),
  case
    when replacement.display_label is not null then replacement.display_label
    else source.display_description
  end,
  source.rarity_band,
  source.generation_weight,
  source.private_generation_class,
  source.grading_inputs
from private.auction_catalog source
left join replacements replacement
  on source.mode_id = 'wars'
 and source.item_reference = replacement.item_reference
where source.content_version = 'ufc-auction-2026-08-v4';

-- Focused migration-time invariants: PR2 may change only the reviewed display content.
do $$
declare
  v_changed_rows integer;
begin
  if (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v5')
    <> (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v4')
  then
    raise exception 'Auction recognizability pass changed catalog row count';
  end if;

  if exists (
    select 1
    from private.auction_catalog v5
    join private.auction_catalog v4
      on v4.content_version = 'ufc-auction-2026-08-v4'
     and v4.mode_id = v5.mode_id
     and v4.item_reference = v5.item_reference
    where v5.content_version = 'ufc-auction-2026-08-v5'
      and (
        v5.rarity_band is distinct from v4.rarity_band
        or v5.generation_weight is distinct from v4.generation_weight
        or v5.private_generation_class is distinct from v4.private_generation_class
        or v5.grading_inputs is distinct from v4.grading_inputs
      )
  ) then
    raise exception 'PR2 changed scoring, rarity, or generation inputs';
  end if;

  select count(*) into v_changed_rows
  from private.auction_catalog v5
  join private.auction_catalog v4
    on v4.content_version = 'ufc-auction-2026-08-v4'
   and v4.mode_id = v5.mode_id
   and v4.item_reference = v5.item_reference
  where v5.content_version = 'ufc-auction-2026-08-v5'
    and (
      v5.display_label is distinct from v4.display_label
      or v5.display_description is distinct from v4.display_description
    );

  if v_changed_rows <> 15 then
    raise exception 'Auction recognizability pass expected 15 content replacements, found %', v_changed_rows;
  end if;

  if exists (
    select 1
    from private.auction_catalog v5
    join private.auction_catalog v4
      on v4.content_version = 'ufc-auction-2026-08-v4'
     and v4.mode_id = v5.mode_id
     and v4.item_reference = v5.item_reference
    where v5.content_version = 'ufc-auction-2026-08-v5'
      and (v5.display_label is distinct from v4.display_label or v5.display_description is distinct from v4.display_description)
      and v5.mode_id <> 'wars'
  ) then
    raise exception 'Auction recognizability pass changed a non-Wars catalog row';
  end if;

  if exists (
    select display_label
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v5' and mode_id = 'wars'
    group by display_label
    having count(*) > 1
  ) then
    raise exception 'Auction Wars v5 contains duplicate display labels';
  end if;
end;
$$;

do $$
declare
  v_definition text;
  v_expected text;
begin
  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_expected := 'v_auction.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: validate_auction_private_row';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_auction.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')');
  execute v_definition;

  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_expected := 'v_content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: prepare_auction format';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')');
  execute v_definition;

  v_definition := pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure);
  v_expected := 'p_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: validate_auction_bid';
  end if;
  v_definition := replace(v_definition, v_expected,
    'p_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')');
  execute v_definition;

  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: resolve_auction_round selections';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')');
  v_expected := 'content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: resolve_auction_round rounds';
  end if;
  v_definition := replace(v_definition, v_expected,
    'content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')');
  execute v_definition;

  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v2'', ''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: grade_auction versions';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v2'', ''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')');
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction recognizability owner drifted: grade_auction selections';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'')');
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
