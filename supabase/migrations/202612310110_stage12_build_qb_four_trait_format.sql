-- Stage 12 Build a QB format refinement.
-- New rooms use the approved four playable traits, eight rounds and $40 bankroll.
-- Existing v1-v5 rooms remain valid so in-flight/historical games are not rewritten.

update private.auction_catalog_versions
set is_preparation_version = false
where game_id = 'draft-room'
  and is_preparation_version;

insert into private.auction_catalog_versions (
  content_version, rarity_version, grading_version, is_preparation_version, game_id
) values (
  'football-draft-room-2026-09-v6',
  'football-draft-room-rarity-2026-09-v4',
  'football-build-qb-traits-2026-09-v1',
  true,
  'draft-room'
);

insert into private.auction_catalog (
  content_version, mode_id, item_reference, display_label, rarity_band,
  display_description, generation_weight, private_generation_class, grading_inputs
)
select
  'football-draft-room-2026-09-v6', mode_id, item_reference, display_label, rarity_band,
  display_description, generation_weight, private_generation_class, grading_inputs
from private.auction_catalog
where content_version = 'football-draft-room-2026-09-v5'
  and mode_id in ('build-qb', 'build-qb-cfb');

alter table private.auction_games
  drop constraint auction_games_round_valid,
  drop constraint auction_games_selection_counts_valid,
  drop constraint auction_games_bankroll_ceiling,
  add constraint auction_games_round_valid check (
    current_round >= 1
    and current_round <= case
      when content_version = 'football-draft-room-2026-09-v6'
        and mode_id in ('build-qb', 'build-qb-cfb') then 8
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 10
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 8
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 6
      else 8
    end
  ),
  add constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case
      when content_version = 'football-draft-room-2026-09-v6'
        and mode_id in ('build-qb', 'build-qb-cfb') then 4
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 3
      else 4
    end
    and recipient_selection_count between 0 and case
      when content_version = 'football-draft-room-2026-09-v6'
        and mode_id in ('build-qb', 'build-qb-cfb') then 4
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 3
      else 4
    end
  ),
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll <= case
      when content_version = 'football-draft-room-2026-09-v6'
        and mode_id in ('build-qb', 'build-qb-cfb') then 40
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 30
      else 40
    end
    and recipient_bankroll <= case
      when content_version = 'football-draft-room-2026-09-v6'
        and mode_id in ('build-qb', 'build-qb-cfb') then 40
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 30
      else 40
    end
  );

-- Patch the single canonical Auction/Draft Room functions in place. The replacements
-- are asserted so schema drift fails the migration instead of silently adding a fallback.
do $$
declare
  v_definition text;
  v_next text;
begin
  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_next := replace(v_definition,
    'when p_mode_id in (''build-qb'', ''build-qb-cfb'') then 10',
    E'when p_mode_id in (''build-qb'', ''build-qb-cfb'') and v_content_version = ''football-draft-room-2026-09-v6'' then 8\n    when p_mode_id in (''build-qb'', ''build-qb-cfb'') then 10');
  v_next := replace(v_next,
    'when p_mode_id in (''build-qb'', ''build-qb-cfb'') then 50',
    E'when p_mode_id in (''build-qb'', ''build-qb-cfb'') and v_content_version = ''football-draft-room-2026-09-v6'' then 40\n    when p_mode_id in (''build-qb'', ''build-qb-cfb'') then 50');
  if v_next = v_definition then raise exception 'Draft Room prepare contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_next := replace(v_definition,
    'when v_auction.mode_id in (''ultimate-fighter'', ''build-qb'', ''build-qb-cfb'') then 10',
    E'when v_auction.content_version = ''football-draft-room-2026-09-v6'' and v_auction.mode_id in (''build-qb'', ''build-qb-cfb'') then 8\n        when v_auction.mode_id in (''ultimate-fighter'', ''build-qb'', ''build-qb-cfb'') then 10');
  v_next := replace(v_next,
    'or new.ultimate_fighter_category not in (''Arm'', ''Accuracy'', ''Processing'', ''Mobility'', ''Clutch'')',
    E'or (v_auction.content_version = ''football-draft-room-2026-09-v6'' and new.ultimate_fighter_category not in (''Arm'', ''Accuracy'', ''Processing'', ''Mobility''))\n        or (v_auction.content_version <> ''football-draft-room-2026-09-v6'' and new.ultimate_fighter_category not in (''Arm'', ''Accuracy'', ''Processing'', ''Mobility'', ''Clutch''))');
  v_next := replace(v_next,
    'or new.visible_category not in (''Arm'', ''Accuracy'', ''Processing'', ''Mobility'', ''Clutch'')',
    E'or (v_auction.content_version = ''football-draft-room-2026-09-v6'' and new.visible_category not in (''Arm'', ''Accuracy'', ''Processing'', ''Mobility''))\n        or (v_auction.content_version <> ''football-draft-room-2026-09-v6'' and new.visible_category not in (''Arm'', ''Accuracy'', ''Processing'', ''Mobility'', ''Clutch''))');
  if v_next = v_definition then raise exception 'Draft Room private-row contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure);
  v_next := replace(v_definition,
    'when p_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 5',
    E'when p_game.content_version = ''football-draft-room-2026-09-v6'' and p_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 4\n    when p_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 5');
  v_next := replace(v_next,
    'if p_category not in (''Arm'', ''Accuracy'', ''Processing'', ''Mobility'', ''Clutch'') then',
    E'if (p_game.content_version = ''football-draft-room-2026-09-v6'' and p_category not in (''Arm'', ''Accuracy'', ''Processing'', ''Mobility''))\n      or (p_game.content_version <> ''football-draft-room-2026-09-v6'' and p_category not in (''Arm'', ''Accuracy'', ''Processing'', ''Mobility'', ''Clutch'')) then');
  if v_next = v_definition then raise exception 'Draft Room bid contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_next := replace(v_definition,
    'when v_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 5',
    E'when v_game.content_version = ''football-draft-room-2026-09-v6'' and v_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 4\n    when v_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 5');
  v_next := replace(v_next,
    'when v_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 10',
    E'when v_game.content_version = ''football-draft-room-2026-09-v6'' and v_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 8\n    when v_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 10');
  v_next := replace(v_next,
    E'when v_game.mode_id in (''build-qb'', ''build-qb-cfb'')\n        then array[''Arm'',''Accuracy'',''Processing'',''Mobility'',''Clutch'']::text[]',
    E'when v_game.mode_id in (''build-qb'', ''build-qb-cfb'')\n        then case when v_game.content_version = ''football-draft-room-2026-09-v6''\n          then array[''Arm'',''Accuracy'',''Processing'',''Mobility'']::text[]\n          else array[''Arm'',''Accuracy'',''Processing'',''Mobility'',''Clutch'']::text[] end');
  if v_next = v_definition then raise exception 'Draft Room round-resolution contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  v_next := replace(v_definition,
    '''football-draft-room-2026-09-v4'', ''football-draft-room-2026-09-v5'')',
    '''football-draft-room-2026-09-v4'', ''football-draft-room-2026-09-v5'', ''football-draft-room-2026-09-v6'')');
  v_next := replace(v_next,
    'when v_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 5',
    E'when v_game.content_version = ''football-draft-room-2026-09-v6'' and v_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 4\n    when v_game.mode_id in (''build-qb'', ''build-qb-cfb'') then 5');
  if v_next = v_definition then raise exception 'Draft Room grading contract drifted'; end if;
  execute v_next;
end;
$$;
