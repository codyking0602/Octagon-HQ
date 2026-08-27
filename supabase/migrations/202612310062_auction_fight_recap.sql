create or replace function private.auction_ultimate_fighter_recap(p_auction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_game private.auction_games;
  v_analysis jsonb;
  v_winner_side text;
  v_loser_side text;
  v_winner_name text;
  v_loser_name text;
  v_primary_edge jsonb;
  v_counter_edge jsonb;
  v_primary_category text;
  v_primary_fighter text;
  v_counter_category text;
  v_counter_fighter text;
  v_primary_side_name text;
  v_primary_phrase text;
  v_counter_phrase text;
begin
  select auction.*
  into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  if v_game.id is null then
    raise exception 'Auction not found';
  end if;

  if v_game.mode_id <> 'ultimate-fighter' then
    raise exception 'Auction fight recap is only available for Build the Ultimate Fighter';
  end if;

  if v_game.lifecycle_state <> 'completed' then
    raise exception 'Auction fight recap requires a completed game';
  end if;

  v_analysis := private.auction_ultimate_fighter_analysis(p_auction_id);
  v_winner_side := v_analysis ->> 'winner';

  select challenger.display_name, recipient.display_name
  into strict v_winner_name, v_loser_name
  from public.profiles challenger
  join public.profiles recipient on recipient.id = v_game.recipient_id
  where challenger.id = v_game.challenger_id;

  if v_winner_side = 'recipient' then
    select v_loser_name, v_winner_name into v_winner_name, v_loser_name;
  end if;

  if v_winner_side = 'tie' then
    select edge_row
    into v_primary_edge
    from jsonb_array_elements(v_analysis -> 'category_edges') edge_row
    where edge_row ->> 'edge' <> 'tie'
    order by (edge_row ->> 'swing_rank')::integer, edge_row ->> 'category'
    limit 1;

    if v_primary_edge is null then
      return jsonb_build_array(
        'This matchup is basically a coin flip.',
        'Every category is effectively dead even across the two builds.',
        'Neither side separates enough to own the fight.'
      );
    end if;

    v_primary_category := v_primary_edge ->> 'category';
    v_primary_side_name := case
      when v_primary_edge ->> 'edge' = 'challenger' then (select display_name from public.profiles where id = v_game.challenger_id)
      else (select display_name from public.profiles where id = v_game.recipient_id)
    end;
    v_primary_fighter := case
      when v_primary_edge ->> 'edge' = 'challenger' then v_primary_edge ->> 'challenger_fighter'
      else v_primary_edge ->> 'recipient_fighter'
    end;
    v_primary_phrase := case v_primary_category
      when 'Striking' then 'win the cleaner exchanges on the feet'
      when 'Grappling' then 'dictate the clinch and mat phases'
      when 'Frame' then 'control the range and shape the exchanges'
      when 'Power' then 'own the biggest fight-changing moments'
      when 'Heart' then 'hold up better when the fight turns into a grind'
      else 'control the matchup'
    end;

    return jsonb_build_array(
      'This matchup is basically a coin flip.',
      format('%s gives %s the clearest swing in %s, helping the build %s.', v_primary_fighter, v_primary_side_name, lower(v_primary_category), v_primary_phrase),
      'Across all five categories, neither build separates enough to own the fight.'
    );
  end if;

  v_loser_side := case when v_winner_side = 'challenger' then 'recipient' else 'challenger' end;

  select edge_row
  into v_primary_edge
  from jsonb_array_elements(v_analysis -> 'category_edges') edge_row
  where edge_row ->> 'edge' = v_winner_side
  order by (edge_row ->> 'swing_rank')::integer, edge_row ->> 'category'
  limit 1;

  if v_primary_edge is null then
    raise exception 'Auction fight recap winner has no supporting category edge';
  end if;

  v_primary_category := v_primary_edge ->> 'category';
  v_primary_fighter := case
    when v_winner_side = 'challenger' then v_primary_edge ->> 'challenger_fighter'
    else v_primary_edge ->> 'recipient_fighter'
  end;
  v_primary_phrase := case v_primary_category
    when 'Striking' then 'win the cleaner exchanges on the feet'
    when 'Grappling' then 'dictate the clinch and mat phases'
    when 'Frame' then 'control the range and shape the exchanges'
    when 'Power' then 'own the biggest fight-changing moments'
    when 'Heart' then 'hold up better when the fight turns into a grind'
    else 'control the matchup'
  end;

  select edge_row
  into v_counter_edge
  from jsonb_array_elements(v_analysis -> 'category_edges') edge_row
  where edge_row ->> 'edge' = v_loser_side
  order by (edge_row ->> 'swing_rank')::integer, edge_row ->> 'category'
  limit 1;

  if v_counter_edge is not null then
    v_counter_category := v_counter_edge ->> 'category';
    v_counter_fighter := case
      when v_loser_side = 'challenger' then v_counter_edge ->> 'challenger_fighter'
      else v_counter_edge ->> 'recipient_fighter'
    end;
    v_counter_phrase := case v_counter_category
      when 'Striking' then 'the cleaner exchanges on the feet'
      when 'Grappling' then 'the clinch and mat phases'
      when 'Frame' then 'range and positioning'
      when 'Power' then 'the biggest fight-changing moments'
      when 'Heart' then 'the late grind'
      else 'that phase of the matchup'
    end;
  end if;

  return jsonb_build_array(
    format('%s''s build likely gets the win.', v_winner_name),
    format('%s gives %s the biggest edge in %s, helping the build %s.', v_primary_fighter, v_winner_name, lower(v_primary_category), v_primary_phrase),
    case
      when v_counter_edge is not null then format('%s gives %s a real answer through %s, but %s has the stronger five-category path.', v_counter_fighter, v_loser_name, v_counter_phrase, v_winner_name)
      else format('%s never finds a category edge big enough to flip the matchup.', v_loser_name)
    end
  );
end;
$$;

comment on function private.auction_ultimate_fighter_recap(uuid) is
  'Builds a deterministic two-to-three sentence Build the Ultimate Fighter fight recap from the canonical private relational analysis. No hidden ratings, numeric gaps, exchange codes, or external model calls.';

revoke all on function private.auction_ultimate_fighter_recap(uuid) from public, anon, authenticated, service_role;

create or replace function public.get_auction_fight_breakdown_packet(p_auction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_game private.auction_games;
  v_user_id uuid := auth.uid();
  v_challenger_name text;
  v_recipient_name text;
  v_challenger_selections jsonb;
  v_recipient_selections jsonb;
  v_challenger_count integer;
  v_recipient_count integer;
  v_challenger_category_count integer;
  v_recipient_category_count integer;
  v_winner_side text;
  v_recap jsonb;
begin
  if v_user_id is null then
    raise exception 'Auction fight breakdown requires authentication';
  end if;

  select auction.*
  into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  if v_game.id is null then
    raise exception 'Auction fight breakdown unavailable';
  end if;

  if v_user_id not in (v_game.challenger_id, v_game.recipient_id) then
    raise exception 'Auction fight breakdown unavailable';
  end if;

  if v_game.mode_id <> 'ultimate-fighter' then
    raise exception 'Auction fight breakdown is only available for Build the Ultimate Fighter';
  end if;

  if v_game.lifecycle_state <> 'completed' then
    raise exception 'Auction fight breakdown is only available after completion';
  end if;

  select profile.display_name
  into strict v_challenger_name
  from public.profiles profile
  where profile.id = v_game.challenger_id;

  select profile.display_name
  into strict v_recipient_name
  from public.profiles profile
  where profile.id = v_game.recipient_id;

  select
    coalesce(jsonb_agg(
      jsonb_build_object(
        'category', award.visible_category,
        'fighter', catalog.display_label,
        'code', private.auction_rating_code(
          (catalog.grading_inputs ->> award.visible_category)::numeric
        )
      )
      order by award.resolved_round, deck.deck_position
    ), '[]'::jsonb),
    count(*),
    count(distinct award.visible_category)
  into
    v_challenger_selections,
    v_challenger_count,
    v_challenger_category_count
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id
    and deck.auction_id = award.auction_id
  join private.auction_catalog catalog
    on catalog.content_version = v_game.content_version
    and catalog.mode_id = v_game.mode_id
    and catalog.item_reference = deck.private_item_reference
  where award.auction_id = v_game.id
    and award.awarded_to = v_game.challenger_id;

  select
    coalesce(jsonb_agg(
      jsonb_build_object(
        'category', award.visible_category,
        'fighter', catalog.display_label,
        'code', private.auction_rating_code(
          (catalog.grading_inputs ->> award.visible_category)::numeric
        )
      )
      order by award.resolved_round, deck.deck_position
    ), '[]'::jsonb),
    count(*),
    count(distinct award.visible_category)
  into
    v_recipient_selections,
    v_recipient_count,
    v_recipient_category_count
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id
    and deck.auction_id = award.auction_id
  join private.auction_catalog catalog
    on catalog.content_version = v_game.content_version
    and catalog.mode_id = v_game.mode_id
    and catalog.item_reference = deck.private_item_reference
  where award.auction_id = v_game.id
    and award.awarded_to = v_game.recipient_id;

  if v_challenger_count <> 5
    or v_recipient_count <> 5
    or v_challenger_category_count <> 5
    or v_recipient_category_count <> 5
  then
    raise exception 'Auction fight breakdown inputs are incomplete or invalid';
  end if;

  v_winner_side := case
    when v_game.winner_profile_id is null then 'tie'
    when v_game.winner_profile_id = v_game.challenger_id then 'challenger'
    when v_game.winner_profile_id = v_game.recipient_id then 'recipient'
    else null
  end;

  if v_winner_side is null then
    raise exception 'Auction fight breakdown result is invalid';
  end if;

  v_recap := private.auction_ultimate_fighter_recap(p_auction_id);

  return jsonb_build_object(
    'packet_version', 'auction-fight-breakdown-v2',
    'mode', 'ultimate-fighter',
    'winner', v_winner_side,
    'recap', v_recap,
    'challenger', jsonb_build_object(
      'name', v_challenger_name,
      'score', v_game.challenger_final_score,
      'selections', v_challenger_selections
    ),
    'recipient', jsonb_build_object(
      'name', v_recipient_name,
      'score', v_game.recipient_final_score,
      'selections', v_recipient_selections
    )
  );
end;
$$;

comment on function public.get_auction_fight_breakdown_packet(uuid) is
  'Participant-only completed Build the Ultimate Fighter packet. Returns public result data, opaque private-rating codes, and deterministic private-analysis-derived recap prose; never returns hidden ratings, numeric gaps, advantage labels, the decoder, or the private matchup-analysis object.';

revoke all on function public.get_auction_fight_breakdown_packet(uuid) from public, anon;
grant execute on function public.get_auction_fight_breakdown_packet(uuid) to authenticated;
