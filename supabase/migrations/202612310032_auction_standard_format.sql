-- Move newly prepared standard Auctions to six rounds, three selections, and $30.
-- Ultimate Fighter retains its existing 10 / 5 / $50 contract. Existing pinned
-- Auction snapshots keep their historical rules; a reviewed v3 content snapshot
-- (identical to v2) is the durable marker for the new standard format.

update private.auction_catalog_versions
set is_preparation_version = false
where is_preparation_version;

insert into private.auction_catalog_versions (
  content_version,
  rarity_version,
  grading_version,
  is_preparation_version
) values (
  'ufc-auction-2026-08-v3',
  'balanced-rarity-2026-08-v2',
  'ufc-private-grader-2026-08-v2',
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
  'ufc-auction-2026-08-v3',
  mode_id,
  item_reference,
  display_label,
  display_description,
  rarity_band,
  generation_weight,
  private_generation_class,
  grading_inputs
from private.auction_catalog
where content_version = 'ufc-auction-2026-08-v2';

do $$
declare
  v_definition text;
  v_expected text;
begin
  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_expected := 'case when v_auction.mode_id = ''ultimate-fighter'' then 10 else 8 end';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction format migration owner drifted: validate_auction_private_row';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'case when v_auction.mode_id = ''ultimate-fighter'' then 10 when v_auction.content_version = ''ufc-auction-2026-08-v3'' then 6 else 8 end'
  );
  execute v_definition;

  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_expected := 'v_rounds := case when p_mode_id = ''ultimate-fighter'' then 10 else 8 end;';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction format migration owner drifted: prepare_auction rounds';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_rounds := case when p_mode_id = ''ultimate-fighter'' then 10 when v_content_version = ''ufc-auction-2026-08-v3'' then 6 else 8 end;'
  );
  v_expected := 'v_bankroll := case when p_mode_id = ''ultimate-fighter'' then 50 else 40 end;';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction format migration owner drifted: prepare_auction bankroll';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_bankroll := case when p_mode_id = ''ultimate-fighter'' then 50 when v_content_version = ''ufc-auction-2026-08-v3'' then 30 else 40 end;'
  );
  execute v_definition;

  v_definition := pg_get_functiondef(
    'private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure
  );
  v_expected := 'v_required := case when p_game.mode_id = ''ultimate-fighter'' then 5 else 4 end;';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction format migration owner drifted: validate_auction_bid';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_required := case when p_game.mode_id = ''ultimate-fighter'' then 5 when p_game.content_version = ''ufc-auction-2026-08-v3'' then 3 else 4 end;'
  );
  execute v_definition;

  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_expected := 'case when mode_id = ''ultimate-fighter'' then 10 else 8 end';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction format migration owner drifted: resolve_auction_round rounds';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'case when mode_id = ''ultimate-fighter'' then 10 when content_version = ''ufc-auction-2026-08-v3'' then 6 else 8 end'
  );
  v_expected := 'v_required := case when v_game.mode_id = ''ultimate-fighter'' then 5 else 4 end;';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction format migration owner drifted: resolve_auction_round selections';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_required := case when v_game.mode_id = ''ultimate-fighter'' then 5 when v_game.content_version = ''ufc-auction-2026-08-v3'' then 3 else 4 end;'
  );
  execute v_definition;

  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  v_expected := 'v_game.content_version = ''ufc-auction-2026-08-v2''';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction format migration owner drifted: grade_auction versions';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v2'', ''ufc-auction-2026-08-v3'')'
  );
  v_expected := 'v_required := case when v_game.mode_id = ''ultimate-fighter'' then 5 else 4 end;';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction format migration owner drifted: grade_auction selections';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_required := case when v_game.mode_id = ''ultimate-fighter'' then 5 when v_game.content_version = ''ufc-auction-2026-08-v3'' then 3 else 4 end;'
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
      when content_version = 'ufc-auction-2026-08-v3' then 6
      else 8
    end
  ),
  add constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version = 'ufc-auction-2026-08-v3' then 3
      else 4
    end
    and recipient_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version = 'ufc-auction-2026-08-v3' then 3
      else 4
    end
  ),
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version = 'ufc-auction-2026-08-v3' then 30
      else 40
    end
    and recipient_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version = 'ufc-auction-2026-08-v3' then 30
      else 40
    end
  );

comment on constraint auction_games_round_valid on private.auction_games is
  'New v3 standard Auctions have six rounds; Ultimate Fighter and older pinned snapshots retain their historical format.';
