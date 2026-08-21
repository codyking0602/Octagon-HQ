begin;

select set_config('request.jwt.claim.role', 'service_role', true);
alter table private.notification_groups disable trigger notification_groups_push_delivery;

create or replace function pg_temp.set_pending_cancel_actor(p_actor uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', p_actor::text, true);
end;
$$;

do $$
declare
  v_challenger constant uuid := '00000000-0000-4000-8000-0000000007a1';
  v_recipient constant uuid := '00000000-0000-4000-8000-0000000007a2';
  v_pending uuid;
  v_started uuid;
  v_code text;
  v_revision bigint;
  v_blocked boolean;
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_challenger, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pending-cancel-a@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_recipient, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pending-cancel-b@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (id, display_name, normalized_name, initials) values
    (v_challenger, 'Cancel Sender', 'CANCEL SENDER', 'CS'),
    (v_recipient, 'Cancel Receiver', 'CANCEL RECEIVER', 'CR');

  perform pg_temp.set_pending_cancel_actor(v_challenger);
  v_pending := public.prepare_auction(v_recipient, 'strikers');
  v_code := public.send_auction_first_bid(v_pending, 0, 4, null);
  select revision into v_revision from private.auction_games where id = v_pending;

  v_blocked := false;
  perform pg_temp.set_pending_cancel_actor(v_recipient);
  begin
    perform public.cancel_auction(v_pending, v_revision);
  exception when others then
    if position('only the challenger can cancel a pending Auction' in sqlerrm) = 0 then
      raise;
    end if;
    v_blocked := true;
  end;
  if not v_blocked then
    raise exception 'recipient unexpectedly cancelled a pending Auction';
  end if;

  perform pg_temp.set_pending_cancel_actor(v_challenger);
  perform public.cancel_auction(v_pending, v_revision);

  if not exists (
    select 1
    from private.auction_games auction
    join public.play_challenges challenge on challenge.id = auction.challenge_id
    where auction.id = v_pending
      and auction.lifecycle_state = 'cancelled'
      and auction.cancelled_by = v_challenger
      and challenge.code = v_code
      and challenge.creator_hidden_at is not null
      and challenge.recipient_hidden_at is not null
  ) then
    raise exception 'pending Auction cancellation did not terminate and hide the challenge for both players';
  end if;

  v_blocked := false;
  perform pg_temp.set_pending_cancel_actor(v_recipient);
  begin
    perform public.submit_auction_bid(v_pending, 1, v_revision + 1, 2, null);
  exception when others then
    if position('Auction is not accepting bids' in sqlerrm) = 0 then
      raise;
    end if;
    v_blocked := true;
  end;
  if not v_blocked then
    raise exception 'recipient unexpectedly bid after pending Auction cancellation';
  end if;

  perform pg_temp.set_pending_cancel_actor(v_challenger);
  v_started := public.prepare_auction(v_recipient, 'grapplers');
  v_code := public.send_auction_first_bid(v_started, 0, 4, null);
  select revision into v_revision from private.auction_games where id = v_started;

  perform pg_temp.set_pending_cancel_actor(v_recipient);
  if not public.open_play_challenge(v_code) then
    raise exception 'recipient could not open the sent Auction challenge';
  end if;

  v_blocked := false;
  perform pg_temp.set_pending_cancel_actor(v_challenger);
  begin
    perform public.cancel_auction(v_started, v_revision);
  exception when others then
    if position('pending Auction has already been opened' in sqlerrm) = 0 then
      raise;
    end if;
    v_blocked := true;
  end;
  if not v_blocked then
    raise exception 'challenger unexpectedly cancelled an opened pending Auction';
  end if;

  perform pg_temp.set_pending_cancel_actor(v_recipient);
  perform public.submit_auction_bid(v_started, 1, v_revision, 2, null);

  v_blocked := false;
  perform pg_temp.set_pending_cancel_actor(v_challenger);
  begin
    perform public.cancel_auction(v_started, v_revision);
  exception when others then
    if position('stale revision' in sqlerrm) = 0 then
      raise;
    end if;
    v_blocked := true;
  end;
  if not v_blocked then
    raise exception 'stale pending cancellation unexpectedly cancelled a started Auction';
  end if;
end;
$$;

rollback;
