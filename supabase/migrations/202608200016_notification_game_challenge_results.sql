create or replace function public.complete_play_challenge(p_code text, p_result jsonb)
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
  update public.play_challenges challenge
  set opened_at = coalesce(challenge.opened_at, now()),
      responder_result = p_result,
      completed_at = now()
  where challenge.code = upper(trim(p_code))
    and challenge.recipient_id = auth.uid()
    and challenge.completed_at is null
    and challenge.declined_at is null
    and challenge.recipient_hidden_at is null
  returning challenge.* into v_challenge;

  if not found then
    return false;
  end if;

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
    'play-challenge:result-ready:' || v_challenge.code || ':' || v_challenge.creator_id::text,
    'play-challenges:results-ready',
    'game_challenge_result_ready',
    'Challenge result is ready',
    v_recipient_name || ' finished your ' || v_challenge.game_title || ' challenge. See how you matched up.',
    v_route,
    'VIEW RESULT',
    v_challenge.completed_at
  );

  return true;
end;
$$;

comment on function public.complete_play_challenge(text, jsonb) is
  'Completes one received challenge and sends one non-overlapping result-ready notification to its creator.';
