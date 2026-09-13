-- Stage 12 Football Verdict private intelligence contract.
-- Completed NFL/CFB Build a QB participants receive only opaque rating codes.
-- The decoder/profile knowledge package is service-role-only and never part of the client bundle.

create or replace function public.get_football_verdict_packet(p_auction_id uuid)
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
begin
  if v_user_id is null then
    raise exception 'Football Verdict requires authentication';
  end if;

  select auction.*
  into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  if v_game.id is null
    or v_user_id not in (v_game.challenger_id, v_game.recipient_id)
  then
    raise exception 'Football Verdict packet unavailable';
  end if;

  if v_game.mode_id not in ('build-qb', 'build-qb-cfb')
    or v_game.content_version <> 'football-draft-room-2026-09-v6'
    or v_game.grading_version <> 'football-build-qb-traits-2026-09-v2'
  then
    raise exception 'Football Verdict packet is only available for the current four-trait Build a QB format';
  end if;

  if v_game.lifecycle_state <> 'completed' then
    raise exception 'Football Verdict packet is only available after completion';
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
        'qb', catalog.display_label,
        'context', catalog.display_description,
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
    and award.awarded_to = v_game.challenger_id
    and award.visible_category in ('Arm', 'Accuracy', 'Processing', 'Mobility');

  select
    coalesce(jsonb_agg(
      jsonb_build_object(
        'category', award.visible_category,
        'qb', catalog.display_label,
        'context', catalog.display_description,
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
    and award.awarded_to = v_game.recipient_id
    and award.visible_category in ('Arm', 'Accuracy', 'Processing', 'Mobility');

  if v_challenger_count <> 4
    or v_recipient_count <> 4
    or v_challenger_category_count <> 4
    or v_recipient_category_count <> 4
  then
    raise exception 'Football Verdict packet inputs are incomplete or invalid';
  end if;

  v_winner_side := case
    when v_game.winner_profile_id is null then 'tie'
    when v_game.winner_profile_id = v_game.challenger_id then 'challenger'
    when v_game.winner_profile_id = v_game.recipient_id then 'recipient'
    else null
  end;

  if v_winner_side is null then
    raise exception 'Football Verdict result is invalid';
  end if;

  return jsonb_build_object(
    'packet_version', 'football-verdict-packet-v1',
    'mode', v_game.mode_id,
    'winner', v_winner_side,
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

comment on function public.get_football_verdict_packet(uuid) is
  'Participant-only completed NFL/CFB Build a QB packet for Football Verdict. Returns recorded result data plus opaque category rating codes; never returns raw grades, decoder mappings, private item references, ranking advice, or bidding advice.';

revoke all on function public.get_football_verdict_packet(uuid) from public, anon;
grant execute on function public.get_football_verdict_packet(uuid) to authenticated;

create or replace function public.export_football_verdict_knowledge()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
  v_profile_count integer;
  v_decoder jsonb;
  v_profiles jsonb;
begin
  if v_role <> 'service_role' then
    raise exception 'Football Verdict private knowledge export is service-role only';
  end if;

  select count(*)
  into v_profile_count
  from private.auction_catalog catalog
  where catalog.content_version = 'football-draft-room-2026-09-v6'
    and catalog.mode_id in ('build-qb', 'build-qb-cfb');

  if v_profile_count <> 140 then
    raise exception 'Football Verdict private knowledge requires exactly 140 current QB profiles';
  end if;

  if exists (
    select 1
    from private.auction_catalog catalog
    where catalog.content_version = 'football-draft-room-2026-09-v6'
      and catalog.mode_id in ('build-qb', 'build-qb-cfb')
      and (
        catalog.grading_inputs ? 'Clutch'
        or not (catalog.grading_inputs ?& array['Arm','Accuracy','Processing','Mobility','overall'])
        or (catalog.grading_inputs - 'Arm' - 'Accuracy' - 'Processing' - 'Mobility' - 'overall') <> '{}'::jsonb
      )
  ) then
    raise exception 'Football Verdict private knowledge found an invalid current QB grading packet';
  end if;

  select jsonb_object_agg(
    private.auction_rating_code(rating),
    rating
    order by rating
  )
  into v_decoder
  from (
    select distinct value::numeric as rating
    from private.auction_catalog catalog
    cross join lateral jsonb_each_text(catalog.grading_inputs - 'overall') trait
    where catalog.content_version = 'football-draft-room-2026-09-v6'
      and catalog.mode_id in ('build-qb', 'build-qb-cfb')
  ) ratings;

  select jsonb_agg(
    jsonb_build_object(
      'mode', catalog.mode_id,
      'qb', catalog.display_label,
      'context', catalog.display_description,
      'trait_codes', jsonb_build_object(
        'Arm', private.auction_rating_code((catalog.grading_inputs->>'Arm')::numeric),
        'Accuracy', private.auction_rating_code((catalog.grading_inputs->>'Accuracy')::numeric),
        'Processing', private.auction_rating_code((catalog.grading_inputs->>'Processing')::numeric),
        'Mobility', private.auction_rating_code((catalog.grading_inputs->>'Mobility')::numeric)
      )
    )
    order by catalog.mode_id, catalog.display_label, catalog.item_reference
  )
  into v_profiles
  from private.auction_catalog catalog
  where catalog.content_version = 'football-draft-room-2026-09-v6'
    and catalog.mode_id in ('build-qb', 'build-qb-cfb');

  return jsonb_build_object(
    'package_version', 'football-verdict-private-knowledge-v1',
    'content_version', 'football-draft-room-2026-09-v6',
    'grading_version', 'football-build-qb-traits-2026-09-v2',
    'traits', jsonb_build_array('Arm', 'Accuracy', 'Processing', 'Mobility'),
    'handling_rules', jsonb_build_array(
      'Use this package only to interpret opaque codes inside completed Football Verdict packets.',
      'Treat recorded final scores and winner as authoritative.',
      'Never reveal, translate, enumerate, rank, or expose hidden grade values or decoder mappings.',
      'Never provide bidding advice, player rankings, or optimization advice derived from private grades.'
    ),
    'decoder', v_decoder,
    'profiles', v_profiles
  );
end;
$$;

comment on function public.export_football_verdict_knowledge() is
  'Service-role-only export for the private Football Verdict GPT knowledge package. Contains the current NFL/CFB QB code dataset and decoder and must never be returned to normal clients.';

revoke all on function public.export_football_verdict_knowledge() from public, anon, authenticated;
grant execute on function public.export_football_verdict_knowledge() to service_role;
