-- Auction PR 6: complete the existing server-owned notification lifecycle,
-- add a completed-only public share projection, and keep all private Auction
-- inputs inside the canonical database transaction.

-- Profile deletion already owns dependent public challenge cleanup. Keep that
-- single cleanup boundary complete for private Auction state and every child row.
alter table private.auction_games
  drop constraint auction_games_challenger_id_fkey,
  drop constraint auction_games_recipient_id_fkey,
  drop constraint auction_games_challenge_id_fkey,
  drop constraint auction_games_tie_priority_profile_id_fkey,
  drop constraint auction_games_cancelled_by_fkey,
  drop constraint auction_games_winner_profile_id_fkey;

alter table private.auction_games
  add constraint auction_games_challenger_id_fkey
    foreign key (challenger_id) references public.profiles(id) on delete cascade,
  add constraint auction_games_recipient_id_fkey
    foreign key (recipient_id) references public.profiles(id) on delete cascade,
  add constraint auction_games_challenge_id_fkey
    foreign key (challenge_id) references public.play_challenges(id) on delete cascade,
  add constraint auction_games_tie_priority_profile_id_fkey
    foreign key (tie_priority_profile_id) references public.profiles(id) on delete cascade,
  add constraint auction_games_cancelled_by_fkey
    foreign key (cancelled_by) references public.profiles(id) on delete cascade,
  add constraint auction_games_winner_profile_id_fkey
    foreign key (winner_profile_id) references public.profiles(id) on delete cascade;

alter table private.auction_pending_bids
  drop constraint auction_pending_bids_bidder_id_fkey,
  add constraint auction_pending_bids_bidder_id_fkey
    foreign key (bidder_id) references public.profiles(id) on delete cascade;

alter table private.auction_awards
  drop constraint auction_awards_awarded_to_fkey,
  add constraint auction_awards_awarded_to_fkey
    foreign key (awarded_to) references public.profiles(id) on delete cascade;

alter table private.notification_groups
  drop constraint if exists notification_groups_kind_valid;

alter table private.notification_groups
  add constraint notification_groups_kind_valid check (kind in (
    'war_room_mention',
    'war_room_reply',
    'war_room_invite_accepted',
    'game_challenge_received',
    'game_challenge_accepted',
    'game_opponent_finished',
    'game_challenge_result_ready',
    'game_challenge_expiring',
    'auction_action_required',
    'auction_result_ready',
    'picks_repick_required',
    'picks_fight_cancelled',
    'picks_incomplete_near_lock',
    'picks_recap_ready',
    'picks_season_result_changed',
    'ufc_event_starting',
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available',
    'card_change_detected',
    'fighter_replacement_detected',
    'fight_cancellation_detected',
    'fight_order_changed',
    'fight_moved_off_card',
    'published_card_mismatch',
    'event_draft_ready',
    'picks_card_missing',
    'odds_match_failed',
    'monitoring_repeatedly_failed',
    'provider_quota_low',
    'all_results_entered',
    'event_ready_to_complete',
    'post_lock_correction_review'
  ));

create or replace function private.notification_category_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if v_kind in (
    'war_room_mention',
    'war_room_reply',
    'war_room_invite_accepted',
    'game_challenge_received',
    'game_challenge_accepted',
    'game_opponent_finished',
    'game_challenge_result_ready',
    'game_challenge_expiring'
  ) then
    return 'social';
  end if;

  if v_kind in (
    'auction_action_required',
    'auction_result_ready',
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available'
  ) then
    return 'games';
  end if;

  if v_kind in (
    'picks_repick_required',
    'picks_fight_cancelled',
    'picks_incomplete_near_lock',
    'picks_recap_ready',
    'picks_season_result_changed',
    'ufc_event_starting'
  ) then
    return 'picks';
  end if;

  if v_kind in (
    'card_change_detected',
    'fighter_replacement_detected',
    'fight_cancellation_detected',
    'fight_order_changed',
    'fight_moved_off_card',
    'published_card_mismatch',
    'event_draft_ready',
    'picks_card_missing',
    'odds_match_failed',
    'monitoring_repeatedly_failed',
    'provider_quota_low',
    'all_results_entered',
    'event_ready_to_complete',
    'post_lock_correction_review'
  ) then
    return 'operations';
  end if;

  raise exception 'unsupported notification kind: %', v_kind;
end;
$$;

create or replace function private.notification_priority_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if private.notification_category_for_kind(v_kind) = 'operations'
    or v_kind in (
      'war_room_mention',
      'war_room_reply',
      'game_challenge_received',
      'auction_action_required',
      'auction_result_ready',
      'picks_repick_required',
      'picks_incomplete_near_lock',
      'picks_recap_ready'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$$;

create or replace function private.notification_preference_key_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if v_kind in ('picks_incomplete_near_lock', 'ufc_event_starting') then
    return 'picks_reminders';
  end if;

  if v_kind = 'daily_challenge_four_hours' then
    return 'daily_challenge_reminders';
  end if;

  if v_kind in (
    'game_challenge_received',
    'game_challenge_accepted',
    'game_challenge_result_ready',
    'game_challenge_expiring',
    'auction_action_required',
    'auction_result_ready'
  ) then
    return 'game_challenge_activity';
  end if;

  if v_kind in ('war_room_mention', 'war_room_reply', 'war_room_invite_accepted') then
    return 'war_room_activity';
  end if;

  return null;
end;
$$;

create or replace function public.submit_auction_bid(
  p_auction_id uuid,
  p_round integer,
  p_expected_revision bigint,
  p_amount numeric,
  p_category text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_actor uuid := auth.uid();
  v_opponent uuid;
  v_was_sent boolean;
  v_actor_name text;
  v_challenger_name text;
  v_recipient_name text;
  v_challenger_score text;
  v_recipient_score text;
  v_resolved_round integer;
  v_round_resolved boolean;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  select auction.*
    into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null
    or v_actor not in (v_game.challenger_id, v_game.recipient_id)
  then
    raise exception 'not an Auction participant';
  end if;

  if v_game.lifecycle_state not in ('sent', 'active') then
    raise exception 'Auction is not accepting bids';
  end if;

  v_was_sent := v_game.lifecycle_state = 'sent';

  if v_was_sent and v_actor <> v_game.recipient_id then
    raise exception 'recipient must accept with the first bid';
  end if;

  if v_game.current_round <> p_round then
    raise exception 'wrong round';
  end if;

  if v_game.revision <> p_expected_revision then
    raise exception 'stale revision';
  end if;

  perform private.validate_auction_bid(
    v_game,
    v_actor,
    p_amount,
    p_category
  );

  begin
    insert into private.auction_pending_bids (
      auction_id,
      round_number,
      bidder_id,
      amount,
      ultimate_fighter_category
    ) values (
      v_game.id,
      p_round,
      v_actor,
      p_amount::integer,
      p_category
    );
  exception when unique_violation then
    raise exception 'bid is locked and cannot be edited';
  end;

  if v_was_sent then
    update public.play_challenges
    set opened_at = coalesce(opened_at, now())
    where id = v_game.challenge_id;

    select profile.display_name
      into v_actor_name
    from public.profiles profile
    where profile.id = v_actor;
  end if;

  v_resolved_round := v_game.current_round;
  perform private.resolve_auction_round(v_game.id);

  select auction.*
    into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  select challenger.display_name, recipient.display_name
    into v_challenger_name, v_recipient_name
  from public.profiles challenger
  join public.profiles recipient on recipient.id = v_game.recipient_id
  where challenger.id = v_game.challenger_id;

  select exists (
    select 1
    from private.auction_awards award
    where award.auction_id = p_auction_id
      and award.resolved_round = v_resolved_round
  ) into v_round_resolved;

  if v_round_resolved and v_game.lifecycle_state = 'active' then
    if v_was_sent then
      perform private.publish_notification_to_profile(
        v_game.challenger_id,
        'auction:accepted:' || v_game.id::text,
        'auction:' || v_game.id::text,
        'auction_action_required',
        'Auction accepted · bid now',
        v_actor_name || ' accepted your Auction challenge. Round 1 resolved and your next sealed bid is ready.',
        '/play/auction?auction=' || v_game.id::text,
        'PLACE BID',
        now()
      );
    else
      v_opponent := case
        when v_actor = v_game.challenger_id then v_game.recipient_id
        else v_game.challenger_id
      end;

      perform private.publish_notification_to_profile(
        v_opponent,
        'auction:round:' || v_game.id::text || ':' || v_resolved_round::text,
        'auction:' || v_game.id::text,
        'auction_action_required',
        'Auction action required',
        'Round ' || v_resolved_round::text || ' resolved. Your next sealed bid is ready.',
        '/play/auction?auction=' || v_game.id::text,
        'PLACE BID',
        now()
      );
    end if;
  elsif v_game.lifecycle_state = 'completed' then
    v_challenger_score := pg_catalog.regexp_replace(
      pg_catalog.regexp_replace(pg_catalog.to_char(v_game.challenger_final_score, 'FM990.00'), '0+$', ''),
      '\.$',
      ''
    );
    v_recipient_score := pg_catalog.regexp_replace(
      pg_catalog.regexp_replace(pg_catalog.to_char(v_game.recipient_final_score, 'FM990.00'), '0+$', ''),
      '\.$',
      ''
    );

    perform private.publish_notification_to_profile(
      v_game.challenger_id,
      'auction:completed:' || v_game.id::text,
      'auction:' || v_game.id::text,
      'auction_result_ready',
      case
        when v_game.winner_profile_id is null then 'Auction result · True tie'
        when v_game.winner_profile_id = v_game.challenger_id then 'Auction result · You won'
        else 'Auction result · ' || v_recipient_name || ' won'
      end,
      'Final score: ' || v_challenger_name || ' ' || v_challenger_score
        || ' · ' || v_recipient_name || ' ' || v_recipient_score || '.',
      '/play/auction?auction=' || v_game.id::text,
      'VIEW RESULT',
      now()
    );

    perform private.publish_notification_to_profile(
      v_game.recipient_id,
      'auction:completed:' || v_game.id::text,
      'auction:' || v_game.id::text,
      'auction_result_ready',
      case
        when v_game.winner_profile_id is null then 'Auction result · True tie'
        when v_game.winner_profile_id = v_game.recipient_id then 'Auction result · You won'
        else 'Auction result · ' || v_challenger_name || ' won'
      end,
      'Final score: ' || v_challenger_name || ' ' || v_challenger_score
        || ' · ' || v_recipient_name || ' ' || v_recipient_score || '.',
      '/play/auction?auction=' || v_game.id::text,
      'VIEW RESULT',
      now()
    );
  end if;

  return v_game.revision;
end;
$$;

create or replace function public.cancel_auction(
  p_auction_id uuid,
  p_expected_revision bigint
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_game private.auction_games;
  v_opponent uuid;
  v_actor_name text;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  select auction.*
    into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null
    or v_actor not in (v_game.challenger_id, v_game.recipient_id)
  then
    raise exception 'not an Auction participant';
  end if;

  if v_game.lifecycle_state = 'cancelled' then
    return v_game.revision;
  end if;

  if v_game.lifecycle_state <> 'active' then
    raise exception 'only an active Auction can be cancelled';
  end if;

  if v_game.revision <> p_expected_revision then
    raise exception 'stale revision';
  end if;

  update private.auction_games
  set lifecycle_state = 'cancelled',
      cancelled_by = v_actor,
      cancelled_at = now(),
      revision = revision + 1,
      updated_at = now()
  where id = p_auction_id
  returning * into v_game;

  update public.play_challenges
  set creator_hidden_at = coalesce(creator_hidden_at, now()),
      recipient_hidden_at = coalesce(recipient_hidden_at, now())
  where id = v_game.challenge_id;

  select profile.display_name
    into v_actor_name
  from public.profiles profile
  where profile.id = v_actor;

  v_opponent := case
    when v_actor = v_game.challenger_id then v_game.recipient_id
    else v_game.challenger_id
  end;

  perform private.publish_notification_to_profile(
    v_opponent,
    'auction:cancelled:' || v_game.id::text,
    'auction:' || v_game.id::text,
    'auction_result_ready',
    'Auction cancelled',
    v_actor_name || ' cancelled this Auction. No winner, score, loss, or forfeit was recorded.',
    '/play/auction?auction=' || v_game.id::text,
    'VIEW AUCTION',
    now()
  );

  return v_game.revision;
end;
$$;

create or replace function private.sync_auction_challenge_decline()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_auction private.auction_games;
  v_recipient_name text;
begin
  if old.declined_at is null and new.declined_at is not null then
    update private.auction_games
    set lifecycle_state = 'declined',
        revision = revision + 1,
        updated_at = now()
    where challenge_id = new.id
      and lifecycle_state = 'sent'
    returning * into v_auction;

    if found then
      select profile.display_name
        into v_recipient_name
      from public.profiles profile
      where profile.id = v_auction.recipient_id;

      perform private.publish_notification_to_profile(
        v_auction.challenger_id,
        'auction:declined:' || v_auction.id::text,
        'auction:' || v_auction.id::text,
        'auction_result_ready',
        'Auction declined',
        v_recipient_name || ' declined your Auction challenge. No result was recorded.',
        '/play/auction?auction=' || v_auction.id::text,
        'VIEW AUCTION',
        now()
      );
    end if;
  end if;

  return new;
end;
$$;

-- Preserve the existing public rich-preview RPC as the sole Worker lookup. Its
-- prior implementation remains private for every non-Auction destination.
alter function public.get_rich_preview_data(text, text) set schema private;
alter function private.get_rich_preview_data(text, text)
  rename to get_rich_preview_data_pr6_core;
revoke all on function private.get_rich_preview_data_pr6_core(text, text)
  from public, anon, authenticated, service_role;

create or replace function public.get_rich_preview_data(
  p_kind text,
  p_key text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_kind text := lower(pg_catalog.btrim(p_kind));
  v_key text := lower(pg_catalog.btrim(p_key));
  v_result jsonb;
begin
  if v_kind <> 'auction' then
    return private.get_rich_preview_data_pr6_core(p_kind, p_key);
  end if;

  if v_key !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return null;
  end if;

  select pg_catalog.jsonb_build_object(
    'kind', 'auction-result',
    'auction_id', auction.id,
    'mode_id', auction.mode_id,
    'challenger_name', challenger.display_name,
    'recipient_name', recipient.display_name,
    'challenger_score', auction.challenger_final_score,
    'recipient_score', auction.recipient_final_score,
    'verdict', case
      when auction.winner_profile_id is null then 'True tie'
      when auction.winner_profile_id = auction.challenger_id then challenger.display_name || ' wins'
      else recipient.display_name || ' wins'
    end
  )
  into v_result
  from private.auction_games auction
  join public.profiles challenger on challenger.id = auction.challenger_id
  join public.profiles recipient on recipient.id = auction.recipient_id
  where auction.id = v_key::uuid
    and auction.lifecycle_state = 'completed'
    and auction.challenger_final_score between 0 and 100
    and auction.recipient_final_score between 0 and 100
  limit 1;

  return v_result;
end;
$$;

revoke all on function public.get_rich_preview_data(text, text) from public;
grant execute on function public.get_rich_preview_data(text, text) to anon, authenticated;

revoke all on function private.notification_category_for_kind(text)
  from public, anon, authenticated;
revoke all on function private.notification_priority_for_kind(text)
  from public, anon, authenticated;
revoke all on function private.notification_preference_key_for_kind(text)
  from public, anon, authenticated;
revoke all on function private.sync_auction_challenge_decline()
  from public, anon, authenticated;

comment on function public.submit_auction_bid(uuid, integer, bigint, numeric, text) is
  'Locks one sealed bid, resolves transactionally, and publishes only idempotent public-safe action or final-result notifications after authoritative state exists.';
comment on function public.get_rich_preview_data(text, text) is
  'Single public rich-preview owner. Auction returns only completed final names, 0-100 scores, and winner or true tie; incomplete and private state returns null.';

notify pgrst, 'reload schema';
