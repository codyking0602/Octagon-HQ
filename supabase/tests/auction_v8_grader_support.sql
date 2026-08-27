begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_challenger constant uuid := '00000000-0000-4000-8000-0000000008a1';
  v_recipient constant uuid := '00000000-0000-4000-8000-0000000008a2';
  v_game_id constant uuid := '00000000-0000-4000-8000-0000000008b1';
  v_challenge_id uuid;
  v_challenger_score numeric;
  v_recipient_score numeric;
begin
  if not exists (
    select 1
    from private.auction_catalog_versions
    where content_version = 'ufc-auction-2026-08-v8'
      and rarity_version = 'balanced-rarity-2026-08-v2'
      and grading_version = 'ufc-private-grader-2026-08-v3'
      and is_preparation_version
  ) then
    raise exception 'v8 / grader-v3 is not the current Auction preparation contract';
  end if;

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_challenger, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-v8-grader-a@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_recipient, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-v8-grader-b@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (id, display_name, normalized_name, initials) values
    (v_challenger, 'Auction V8 Grader A', 'AUCTION V8 GRADER A', 'VA'),
    (v_recipient, 'Auction V8 Grader B', 'AUCTION V8 GRADER B', 'VB');

  insert into public.play_challenges (
    code, game_id, game_version, game_title, summary,
    creator_id, recipient_id, play_url, setup, creator_result
  ) values (
    'AUCV8G01', 'auction', 'auction-server-v3', 'Auction', 'strikers',
    v_challenger, v_recipient, '/play/auction?auction=' || v_game_id,
    '{}'::jsonb, '{}'::jsonb
  ) returning id into v_challenge_id;

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
    content_version, rarity_version, grading_version, current_round,
    tie_priority_profile_id, challenger_bankroll, recipient_bankroll,
    challenger_selection_count, recipient_selection_count
  ) values (
    v_game_id, v_challenger, v_recipient, 'strikers', v_challenge_id, 'active',
    'ufc-auction-2026-08-v8', 'balanced-rarity-2026-08-v2', 'ufc-private-grader-2026-08-v3',
    6, v_challenger, 15, 15, 3, 3
  );

  perform private.generate_auction_deck(
    v_game_id,
    'ufc-auction-2026-08-v8',
    'strikers',
    6,
    null
  );

  insert into private.auction_awards (
    auction_id, deck_entry_id, awarded_to, resolved_round
  )
  select
    v_game_id,
    deck.id,
    case when deck.deck_position <= 3 then v_challenger else v_recipient end,
    deck.deck_position
  from private.auction_deck_entries deck
  where deck.auction_id = v_game_id;

  perform private.grade_auction(v_game_id);

  select challenger_final_score, recipient_final_score
  into v_challenger_score, v_recipient_score
  from private.auction_games
  where id = v_game_id
    and lifecycle_state = 'completed';

  if v_challenger_score is null
    or v_recipient_score is null
    or v_challenger_score not between 0 and 100
    or v_recipient_score not between 0 and 100
    or v_challenger_score <> trunc(v_challenger_score)
    or v_recipient_score <> trunc(v_recipient_score)
  then
    raise exception 'v8 did not complete with grader-v3 whole-number 0-100 scores: % / %',
      v_challenger_score, v_recipient_score;
  end if;

  if not exists (
    select 1
    from public.play_challenges
    where id = v_challenge_id
      and completed_at is not null
      and (creator_result ->> 'overall_score')::numeric = v_challenger_score
      and (responder_result ->> 'overall_score')::numeric = v_recipient_score
  ) then
    raise exception 'v8 grader did not persist the canonical challenge result';
  end if;
end;
$$;

rollback;
