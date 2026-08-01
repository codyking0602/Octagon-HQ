begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_challenger uuid := extensions.gen_random_uuid();
  v_recipient uuid := extensions.gen_random_uuid();
  v_unrelated uuid := extensions.gen_random_uuid();
  v_prepared uuid := extensions.gen_random_uuid();
  v_flow uuid := extensions.gen_random_uuid();
  v_declined uuid := extensions.gen_random_uuid();
  v_challenge_one uuid := extensions.gen_random_uuid();
  v_challenge_two uuid := extensions.gen_random_uuid();
  v_challenge_three uuid := extensions.gen_random_uuid();
  v_challenge_four uuid := extensions.gen_random_uuid();
  v_challenge_five uuid := extensions.gen_random_uuid();
  v_rejected boolean;
  v_submitted boolean;
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_challenger, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-hardening-challenger@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_recipient, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-hardening-recipient@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_unrelated, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-hardening-unrelated@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (id, display_name, normalized_name, initials) values
    (v_challenger, 'Auction Challenger', 'AUCTION CHALLENGER', 'AC'),
    (v_recipient, 'Auction Recipient', 'AUCTION RECIPIENT', 'AR'),
    (v_unrelated, 'Auction Unrelated', 'AUCTION UNRELATED', 'AU');

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, lifecycle_state,
    content_version, rarity_version, grading_version, tie_priority_profile_id,
    challenger_bankroll, recipient_bankroll
  ) values (
    v_prepared, v_challenger, v_recipient, 'strikers', 'prepared',
    'catalog-hardening', 'rarity-hardening', 'grading-hardening',
    v_challenger, 40, 40
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  if not exists (select 1 from public.get_auction_participant_state(v_prepared)) then
    raise exception 'challenger could not read the prepared Auction';
  end if;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  if exists (select 1 from public.get_auction_participant_state(v_prepared)) then
    raise exception 'recipient read an unsent prepared Auction';
  end if;

  perform set_config('request.jwt.claim.sub', v_unrelated::text, true);
  if exists (select 1 from public.get_auction_participant_state(v_prepared)) then
    raise exception 'unrelated profile read a prepared Auction';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  update private.auction_games
  set lifecycle_state = 'abandoned'
  where id = v_prepared;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  if exists (select 1 from public.get_auction_participant_state(v_prepared)) then
    raise exception 'abandoned prepared Auction remained client-readable';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  insert into public.play_challenges (
    id, code, game_id, game_version, game_title, summary,
    creator_id, recipient_id, play_url, setup, creator_result
  ) values
    (v_challenge_one, 'AHARD001', 'auction', 'auction-v1', 'Auction', 'Hardening flow one',
      v_challenger, v_recipient, '/play/auction', '{}'::jsonb, '{}'::jsonb),
    (v_challenge_two, 'AHARD002', 'auction', 'auction-v1', 'Auction', 'Hardening flow two',
      v_challenger, v_recipient, '/play/auction', '{}'::jsonb, '{}'::jsonb),
    (v_challenge_three, 'AHARD003', 'auction', 'auction-v1', 'Auction', 'Hardening constraint three',
      v_challenger, v_recipient, '/play/auction', '{}'::jsonb, '{}'::jsonb),
    (v_challenge_four, 'AHARD004', 'auction', 'auction-v1', 'Auction', 'Hardening constraint four',
      v_challenger, v_recipient, '/play/auction', '{}'::jsonb, '{}'::jsonb),
    (v_challenge_five, 'AHARD005', 'auction', 'auction-v1', 'Auction', 'Hardening decline five',
      v_challenger, v_recipient, '/play/auction', '{}'::jsonb, '{}'::jsonb);

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, lifecycle_state,
    content_version, rarity_version, grading_version, tie_priority_profile_id,
    challenger_bankroll, recipient_bankroll
  ) values (
    v_flow, v_challenger, v_recipient, 'strikers', 'prepared',
    'catalog-flow', 'rarity-flow', 'grading-flow', v_recipient, 40, 40
  );

  update private.auction_games
  set lifecycle_state = 'sent', challenge_id = v_challenge_one
  where id = v_flow;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  if not exists (select 1 from public.get_auction_participant_state(v_flow)) then
    raise exception 'recipient could not read a sent Auction';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  v_rejected := false;
  begin
    update private.auction_games
    set challenge_id = v_challenge_two
    where id = v_flow;
  exception when others then
    if position('Linked Auction challenge cannot change' in sqlerrm) > 0 then
      v_rejected := true;
    else
      raise;
    end if;
  end;
  if not v_rejected then
    raise exception 'sent Auction was relinked to another canonical challenge';
  end if;

  v_rejected := false;
  begin
    update private.auction_games
    set mode_id = 'grapplers'
    where id = v_flow;
  exception when others then
    if position('participants and mode cannot change' in sqlerrm) > 0 then
      v_rejected := true;
    else
      raise;
    end if;
  end;
  if not v_rejected then
    raise exception 'Auction mode changed after preparation';
  end if;

  update private.auction_games
  set lifecycle_state = 'active', revision = revision + 1
  where id = v_flow;

  insert into private.auction_pending_bids (
    auction_id, round_number, bidder_id, amount
  ) values (v_flow, 1, v_challenger, 20);

  v_rejected := false;
  begin
    update private.auction_games
    set lifecycle_state = 'sent'
    where id = v_flow;
  exception when others then
    if position('Invalid Auction lifecycle transition' in sqlerrm) > 0 then
      v_rejected := true;
    else
      raise;
    end if;
  end;
  if not v_rejected then
    raise exception 'active Auction regressed to sent';
  end if;

  update private.auction_games
  set lifecycle_state = 'cancelled',
      cancelled_by = v_recipient,
      cancelled_at = now(),
      revision = revision + 1
  where id = v_flow;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  select current_user_submitted_bid into v_submitted
  from public.get_auction_participant_state(v_flow);
  if v_submitted is distinct from false then
    raise exception 'cancelled Auction leaked pending bid presence';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  v_rejected := false;
  begin
    update private.auction_games
    set challenger_bankroll = challenger_bankroll - 1
    where id = v_flow;
  exception when others then
    if position('terminal state cannot change' in sqlerrm) > 0 then
      v_rejected := true;
    else
      raise;
    end if;
  end;
  if not v_rejected then
    raise exception 'terminal Auction bankroll remained mutable';
  end if;

  v_rejected := false;
  begin
    insert into private.auction_games (
      challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
      content_version, rarity_version, grading_version, tie_priority_profile_id,
      challenger_bankroll, recipient_bankroll
    ) values (
      v_challenger, v_recipient, 'strikers', v_challenge_three, 'cancelled',
      'v1', 'v1', 'v1', v_challenger, 40, 40
    );
  exception when check_violation then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'cancelled Auction without cancellation audit was accepted';
  end if;

  v_rejected := false;
  begin
    insert into private.auction_games (
      challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
      content_version, rarity_version, grading_version, tie_priority_profile_id,
      challenger_bankroll, recipient_bankroll,
      challenger_final_score, recipient_final_score, winner_profile_id
    ) values (
      v_challenger, v_recipient, 'strikers', v_challenge_four, 'completed',
      'v1', 'v1', 'v1', v_recipient, 20, 20, 90, 80, null
    );
  exception when check_violation then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'unequal completed scores without a winner were accepted';
  end if;

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, lifecycle_state,
    content_version, rarity_version, grading_version, tie_priority_profile_id,
    challenger_bankroll, recipient_bankroll
  ) values (
    v_declined, v_challenger, v_recipient, 'nicknames', 'prepared',
    'catalog-decline', 'rarity-decline', 'grading-decline', v_challenger, 40, 40
  );

  update private.auction_games
  set lifecycle_state = 'sent', challenge_id = v_challenge_five
  where id = v_declined;
  update private.auction_games
  set lifecycle_state = 'declined'
  where id = v_declined;

  v_rejected := false;
  begin
    update private.auction_games
    set lifecycle_state = 'active'
    where id = v_declined;
  exception when others then
    if position('terminal state cannot change' in sqlerrm) > 0 then
      v_rejected := true;
    else
      raise;
    end if;
  end;
  if not v_rejected then
    raise exception 'declined Auction was not terminal';
  end if;
end $$;

rollback;
