create or replace function public.create_play_challenge(
  p_recipient_id uuid,
  p_game_id text,
  p_game_version text,
  p_game_title text,
  p_summary text,
  p_play_url text,
  p_setup jsonb,
  p_creator_result jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_creator_id uuid := auth.uid();
  v_creator_name text;
  v_code text;
  v_attempt integer := 0;
  v_created_at timestamptz;
  v_route text;
begin
  if v_creator_id is null then
    raise exception 'sign in required';
  end if;

  if p_recipient_id is null or p_recipient_id = v_creator_id then
    raise exception 'choose another profile';
  end if;

  if not exists (select 1 from public.profiles where id = p_recipient_id) then
    raise exception 'profile not found';
  end if;

  select profile.display_name
    into v_creator_name
  from public.profiles profile
  where profile.id = v_creator_id;

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.play_challenges (
        code,
        game_id,
        game_version,
        game_title,
        summary,
        creator_id,
        recipient_id,
        play_url,
        setup,
        creator_result
      ) values (
        v_code,
        trim(p_game_id),
        trim(p_game_version),
        trim(p_game_title),
        trim(p_summary),
        v_creator_id,
        p_recipient_id,
        coalesce(trim(p_play_url), ''),
        p_setup,
        p_creator_result
      )
      returning created_at into v_created_at;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  v_route := case trim(p_game_id)
    when 'find-leader' then '/play/find-leader?challenge=' || v_code
    when 'wavelength' then '/play/wavelength?match=' || v_code
    when 'blind-resume' then '/play/blind-resume?match=' || v_code
    when 'blind-rank' then '/play/blind-rank?match=' || v_code
    when 'keep-cut' then '/play/keep-cut?match=' || v_code
    when 'better-than' then '/play/better-than?match=' || v_code
    else '/play'
  end;

  perform private.publish_notification_to_profile(
    p_recipient_id,
    'play-challenge:received:' || v_code || ':' || p_recipient_id::text,
    'play-challenges:received',
    'game_challenge_received',
    'You were challenged',
    v_creator_name || ' challenged you to ' || trim(p_game_title) || '.',
    v_route,
    'VIEW CHALLENGE',
    v_created_at
  );

  return v_code;
end;
$$;

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
  update public.play_challenges challenge
  set opened_at = coalesce(challenge.opened_at, now())
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

comment on function public.create_play_challenge(uuid, text, text, text, text, text, jsonb, jsonb) is
  'Creates one profile challenge and notifies the recipient through the canonical notification owner.';
comment on function public.open_play_challenge(text) is
  'Marks a received challenge opened and notifies the creator that the challenge was accepted.';
