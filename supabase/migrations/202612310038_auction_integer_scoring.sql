-- PR4: make whole-number Auction results authoritative on the server.
-- New preparations rotate to immutable v7 / grader v3. V6 and older pinned games
-- keep the historical two-decimal grader contract. No bidding, bankroll, catalog,
-- rarity, generation, or mode-format behavior changes here.

update private.auction_catalog_versions
set is_preparation_version = false
where is_preparation_version;

insert into private.auction_catalog_versions (
  content_version,
  rarity_version,
  grading_version,
  is_preparation_version
) values (
  'ufc-auction-2026-08-v7',
  'balanced-rarity-2026-08-v2',
  'ufc-private-grader-2026-08-v3',
  true
);

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
  'ufc-auction-2026-08-v7',
  mode_id,
  item_reference,
  display_label,
  display_description,
  rarity_band,
  generation_weight,
  private_generation_class,
  grading_inputs
from private.auction_catalog
where content_version = 'ufc-auction-2026-08-v6';

-- V7 is a version-contract rotation only. Prove the reviewed v6 catalog is copied
-- byte-for-byte and that historical v6 remains pinned to grader v2.
do $$
begin
  if (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v7')
    <> (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v6')
  then
    raise exception 'Auction integer scoring changed catalog row count';
  end if;

  if (select count(distinct mode_id) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v7') <> 14 then
    raise exception 'Auction integer scoring changed the current fourteen-mode catalog shape';
  end if;

  if exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v7'
      and mode_id in ('championship-performances', 'dominant-performances')
  ) then
    raise exception 'Auction integer scoring restored a retired performance mode';
  end if;

  if exists (
    (
      select mode_id, item_reference, display_label, display_description, rarity_band,
        generation_weight, private_generation_class, grading_inputs
      from private.auction_catalog
      where content_version = 'ufc-auction-2026-08-v6'
      except
      select mode_id, item_reference, display_label, display_description, rarity_band,
        generation_weight, private_generation_class, grading_inputs
      from private.auction_catalog
      where content_version = 'ufc-auction-2026-08-v7'
    )
    union all
    (
      select mode_id, item_reference, display_label, display_description, rarity_band,
        generation_weight, private_generation_class, grading_inputs
      from private.auction_catalog
      where content_version = 'ufc-auction-2026-08-v7'
      except
      select mode_id, item_reference, display_label, display_description, rarity_band,
        generation_weight, private_generation_class, grading_inputs
      from private.auction_catalog
      where content_version = 'ufc-auction-2026-08-v6'
    )
  ) then
    raise exception 'Auction integer scoring changed catalog content or private grading inputs';
  end if;

  if not exists (
    select 1
    from private.auction_catalog_versions
    where content_version = 'ufc-auction-2026-08-v6'
      and rarity_version = 'balanced-rarity-2026-08-v2'
      and grading_version = 'ufc-private-grader-2026-08-v2'
      and not is_preparation_version
  ) then
    raise exception 'Historical v6 Auction grading contract was mutated';
  end if;

  if (select count(*) from private.auction_catalog_versions where is_preparation_version) <> 1
    or not exists (
      select 1
      from private.auction_catalog_versions
      where content_version = 'ufc-auction-2026-08-v7'
        and rarity_version = 'balanced-rarity-2026-08-v2'
        and grading_version = 'ufc-private-grader-2026-08-v3'
        and is_preparation_version
    )
  then
    raise exception 'V7 / grader v3 is not the single Auction preparation contract';
  end if;
end;
$$;

-- Preserve the existing canonical lifecycle owners and authorize v7 for the same
-- six-round / three-selection / $30 standard format introduced in v3.
do $$
declare
  v_definition text;
  v_expected text;
begin
  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_expected := 'v_auction.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction integer scoring owner drifted: validate_auction_private_row';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_auction.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'')');
  execute v_definition;

  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_expected := 'v_content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction integer scoring owner drifted: prepare_auction';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'')');
  execute v_definition;

  v_definition := pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure);
  v_expected := 'p_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction integer scoring owner drifted: validate_auction_bid';
  end if;
  v_definition := replace(v_definition, v_expected,
    'p_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'')');
  execute v_definition;

  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_expected := 'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction integer scoring owner drifted: resolve_auction_round selections';
  end if;
  v_definition := replace(v_definition, v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'')');
  v_expected := 'content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'')';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction integer scoring owner drifted: resolve_auction_round rounds';
  end if;
  v_definition := replace(v_definition, v_expected,
    'content_version in (''ufc-auction-2026-08-v3'', ''ufc-auction-2026-08-v4'', ''ufc-auction-2026-08-v5'', ''ufc-auction-2026-08-v6'', ''ufc-auction-2026-08-v7'')');
  execute v_definition;
end;
$$;

-- Keep one canonical grader. Grader v2 preserves its historical two-decimal score;
-- grader v3 rounds the final quality average once before persistence and winner/tie
-- selection. Ultimate Fighter keeps its category-placement inputs and uses the same
-- final-only whole-number rule.
create or replace function private.grade_auction(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_required integer;
  v_challenger_count integer;
  v_recipient_count integer;
  v_challenger_scored integer;
  v_recipient_scored integer;
  v_challenger_score numeric(5,2);
  v_recipient_score numeric(5,2);
  v_winner uuid;
begin
  select auction.*
    into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null then
    raise exception 'Auction not found';
  end if;

  if v_game.lifecycle_state = 'completed' then
    return;
  end if;

  if v_game.lifecycle_state <> 'active' then
    raise exception 'Auction grading boundary is invalid';
  end if;

  if v_game.grading_version = 'grader-contract-v1' then
    update private.auction_games
    set lifecycle_state = 'completed',
        challenger_final_score = 0,
        recipient_final_score = 0,
        winner_profile_id = null,
        revision = revision + 1,
        updated_at = now()
    where id = v_game.id;

    update public.play_challenges
    set completed_at = coalesce(completed_at, now()),
        creator_result = jsonb_build_object('overall_score', 0),
        responder_result = jsonb_build_object('overall_score', 0)
    where id = v_game.challenge_id;
    return;
  end if;

  if not (
    (v_game.content_version = 'ufc-auction-2026-08-v1'
      and v_game.rarity_version = 'balanced-rarity-2026-08-v1'
      and v_game.grading_version = 'ufc-private-grader-2026-08-v1')
    or (v_game.content_version in (
        'ufc-auction-2026-08-v2',
        'ufc-auction-2026-08-v3',
        'ufc-auction-2026-08-v4',
        'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6'
      )
      and v_game.rarity_version = 'balanced-rarity-2026-08-v2'
      and v_game.grading_version = 'ufc-private-grader-2026-08-v2')
    or (v_game.content_version = 'ufc-auction-2026-08-v7'
      and v_game.rarity_version = 'balanced-rarity-2026-08-v2'
      and v_game.grading_version = 'ufc-private-grader-2026-08-v3')
  ) then
    raise exception 'Auction grading version is unsupported';
  end if;

  v_required := case
    when v_game.mode_id = 'ultimate-fighter' then 5
    when v_game.content_version in (
      'ufc-auction-2026-08-v3',
      'ufc-auction-2026-08-v4',
      'ufc-auction-2026-08-v5',
      'ufc-auction-2026-08-v6',
      'ufc-auction-2026-08-v7'
    ) then 3
    else 4
  end;

  select
    count(*),
    count(score_value),
    case
      when v_game.grading_version = 'ufc-private-grader-2026-08-v3' then round(avg(score_value))
      else round(avg(score_value), 2)
    end
  into
    v_challenger_count,
    v_challenger_scored,
    v_challenger_score
  from (
    select case
      when v_game.mode_id = 'ultimate-fighter'
        then (catalog.grading_inputs ->> award.visible_category)::numeric
      else (catalog.grading_inputs ->> 'overall')::numeric
    end as score_value
    from private.auction_awards award
    join private.auction_deck_entries deck
      on deck.id = award.deck_entry_id
      and deck.auction_id = award.auction_id
    join private.auction_catalog catalog
      on catalog.content_version = v_game.content_version
      and catalog.mode_id = v_game.mode_id
      and catalog.item_reference = deck.private_item_reference
    where award.auction_id = v_game.id
      and award.awarded_to = v_game.challenger_id
  ) scored;

  select
    count(*),
    count(score_value),
    case
      when v_game.grading_version = 'ufc-private-grader-2026-08-v3' then round(avg(score_value))
      else round(avg(score_value), 2)
    end
  into
    v_recipient_count,
    v_recipient_scored,
    v_recipient_score
  from (
    select case
      when v_game.mode_id = 'ultimate-fighter'
        then (catalog.grading_inputs ->> award.visible_category)::numeric
      else (catalog.grading_inputs ->> 'overall')::numeric
    end as score_value
    from private.auction_awards award
    join private.auction_deck_entries deck
      on deck.id = award.deck_entry_id
      and deck.auction_id = award.auction_id
    join private.auction_catalog catalog
      on catalog.content_version = v_game.content_version
      and catalog.mode_id = v_game.mode_id
      and catalog.item_reference = deck.private_item_reference
    where award.auction_id = v_game.id
      and award.awarded_to = v_game.recipient_id
  ) scored;

  if v_challenger_count <> v_required
    or v_recipient_count <> v_required
    or v_challenger_scored <> v_required
    or v_recipient_scored <> v_required
    or v_challenger_score not between 0 and 100
    or v_recipient_score not between 0 and 100
  then
    raise exception 'Auction grading inputs are incomplete or invalid';
  end if;

  v_winner := case
    when v_challenger_score > v_recipient_score then v_game.challenger_id
    when v_recipient_score > v_challenger_score then v_game.recipient_id
    else null
  end;

  update private.auction_games
  set lifecycle_state = 'completed',
      challenger_final_score = v_challenger_score,
      recipient_final_score = v_recipient_score,
      winner_profile_id = v_winner,
      revision = revision + 1,
      updated_at = now()
  where id = v_game.id;

  update public.play_challenges
  set completed_at = coalesce(completed_at, now()),
      creator_result = jsonb_build_object('overall_score', v_challenger_score),
      responder_result = jsonb_build_object('overall_score', v_recipient_score)
  where id = v_game.challenge_id;
end;
$$;

revoke all on function private.grade_auction(uuid)
  from public, anon, authenticated;

comment on function private.grade_auction(uuid) is
  'Single server-private Auction grader. Historical v2 snapshots retain two-decimal scores; v7 / grader v3 stores one authoritative whole-number result used for persistence and winner/tie selection.';

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
      when content_version in (
        'ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6', 'ufc-auction-2026-08-v7'
      ) then 6
      else 8
    end
  ),
  add constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in (
        'ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6', 'ufc-auction-2026-08-v7'
      ) then 3
      else 4
    end
    and recipient_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in (
        'ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6', 'ufc-auction-2026-08-v7'
      ) then 3
      else 4
    end
  ),
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in (
        'ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6', 'ufc-auction-2026-08-v7'
      ) then 30
      else 40
    end
    and recipient_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in (
        'ufc-auction-2026-08-v3', 'ufc-auction-2026-08-v4', 'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6', 'ufc-auction-2026-08-v7'
      ) then 30
      else 40
    end
  );

comment on constraint auction_games_round_valid on private.auction_games is
  'V3 through v7 standard Auctions have six rounds; Ultimate Fighter and older pinned snapshots retain their historical format.';

-- Executable rounding contract assertions. These run on every fresh-database backend
-- verification and on deployment, so PostgreSQL itself proves the positive numeric
-- boundary and the tie/winner behavior that grader v3 relies on.
do $$
begin
  if round(72.49::numeric) <> 72 or round(72.50::numeric) <> 73 then
    raise exception 'PostgreSQL Auction whole-number rounding boundary drifted';
  end if;

  if round(80.33::numeric) <> round(79.67::numeric) then
    raise exception 'Auction integer rounding no longer creates the expected canonical tie';
  end if;

  if not (round(80.67::numeric) > round(80.33::numeric)) then
    raise exception 'Auction integer rounding no longer preserves canonical winner ordering';
  end if;
end;
$$;

-- Lock the final grader shape after replacement: v6 is decimal, v7 is integer,
-- winner/tie and both persisted result surfaces consume the already-finalized values.
do $$
declare
  v_definition text := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
begin
  if v_definition not like '%ufc-auction-2026-08-v6%'
    or v_definition not like '%ufc-private-grader-2026-08-v2%'
    or v_definition not like '%ufc-auction-2026-08-v7%'
    or v_definition not like '%ufc-private-grader-2026-08-v3%'
    or v_definition not like '%round(avg(score_value))%'
    or v_definition not like '%round(avg(score_value), 2)%'
    or v_definition not like '%when v_challenger_score > v_recipient_score%'
    or v_definition not like '%challenger_final_score = v_challenger_score%'
    or v_definition not like '%recipient_final_score = v_recipient_score%'
    or v_definition not like '%jsonb_build_object(''overall_score'', v_challenger_score)%'
    or v_definition not like '%jsonb_build_object(''overall_score'', v_recipient_score)%'
  then
    raise exception 'Auction authoritative integer grader contract drifted';
  end if;
end;
$$;
