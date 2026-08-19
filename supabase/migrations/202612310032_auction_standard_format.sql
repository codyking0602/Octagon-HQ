-- Move every standard Auction mode to six rounds, three selections, and $30.
-- Ultimate Fighter retains its existing 10 / 5 / $50 contract. The existing
-- command, validation, round-resolution, and grader functions remain the rule
-- owners; this migration updates those owners in place.

do $$
declare
  v_function regprocedure;
  v_definition text;
begin
  foreach v_function in array array[
    'private.validate_auction_private_row()'::regprocedure,
    'public.prepare_auction(uuid,text)'::regprocedure,
    'private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure,
    'private.resolve_auction_round(uuid)'::regprocedure,
    'private.grade_auction(uuid)'::regprocedure
  ] loop
    v_definition := pg_get_functiondef(v_function);
    v_definition := replace(v_definition, 'then 10 else 8', 'then 10 else 6');
    v_definition := replace(v_definition, 'then 5 else 4', 'then 5 else 3');
    v_definition := replace(v_definition, 'then 50 else 40', 'then 50 else 30');
    execute v_definition;
  end loop;
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
      when lifecycle_state in ('completed', 'declined', 'cancelled') then 8
      else 6
    end
  ),
  add constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'declined', 'cancelled') then 4
      else 3
    end
    and recipient_selection_count between 0 and case
      when mode_id = 'ultimate-fighter' then 5
      when lifecycle_state in ('completed', 'declined', 'cancelled') then 4
      else 3
    end
  ),
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'declined', 'cancelled') then 40
      else 30
    end
    and recipient_bankroll <= case
      when mode_id = 'ultimate-fighter' then 50
      when lifecycle_state in ('completed', 'declined', 'cancelled') then 40
      else 30
    end
  );

comment on constraint auction_games_round_valid on private.auction_games is
  'Active standard Auctions have six rounds; terminal rows retain historical snapshots.';
