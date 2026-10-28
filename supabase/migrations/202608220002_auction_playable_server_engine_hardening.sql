-- Auction PR 3 hardening: opening a route is not acceptance.
-- Keep the canonical Challenge Center RPC, but let the Auction engine own the
-- recipient acceptance timestamp and notification when the first sealed bid lands.

create or replace function public.open_play_challenge(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_challenge public.play_challenges;
  v_recipient_name text;
  v_route text;
begin
  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.recipient_id = auth.uid()
    and challenge.completed_at is null
    and challenge.declined_at is null
    and challenge.recipient_hidden_at is null
  for update;

  if not found then
    return false;
  end if;

  if v_challenge.game_id = 'auction' then
    return true;
  end if;

  update public.play_challenges challenge
  set opened_at = coalesce(challenge.opened_at, now())
  where challenge.id = v_challenge.id
  returning challenge.* into v_challenge;

  select profile.display_name
    into v_recipient_name
  from public.profiles profile
  where profile.id = v_challenge.recipient_id;

  v_route := case v_challenge.game_id
    when 'find-leader' then '/play/find-leader?challenge=' || v_challenge.code
    when 'wavelength' then '/play/wavelength?match=' || v_challenge.code
    when 'blind-resume' then '/play/blind-resume?match=' || v_challenge.code
    when 'blind-rank' then '/play/blind-rank?match=' || v_challenge.code
    when 'keep-cut' then '/play/keep-cut?match=' || v_challenge.code
    when 'better-than' then '/play/better-than?match=' || v_challenge.code
    else '/play'
  end;

  perform private.publish_notification_to_profile(
    v_challenge.creator_id,
    'play-challenge:accepted:' || v_challenge.code || ':' || v_challenge.creator_id::text,
    'play-challenges:accepted',
    'game_challenge_accepted',
    'Your challenge was accepted',
    v_recipient_name || ' opened your ' || v_challenge.game_title || ' challenge.',
    v_route,
    'VIEW MATCHUP',
    v_challenge.opened_at
  );

  return true;
end;
$$;

comment on function public.open_play_challenge(text) is
  'Opens ordinary challenges through the canonical owner; Auction route reads do not accept the challenge or stamp opened_at.';
