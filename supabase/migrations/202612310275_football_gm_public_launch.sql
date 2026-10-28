-- Public launch support for The GM: safe waiting-match cancellation and declined-match guards.

create or replace function private.cancel_football_gm_challenge(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_match private.football_gm_matches%rowtype;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    raise exception 'The GM match not found';
  end if;

  select match.* into v_match
  from private.football_gm_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if v_match.phase <> 'waiting' then
    raise exception 'The GM match has already started';
  end if;

  update public.play_challenges challenge
  set declined_at = coalesce(challenge.declined_at, now()),
      creator_hidden_at = case
        when challenge.creator_id = v_user_id then coalesce(challenge.creator_hidden_at, now())
        else challenge.creator_hidden_at
      end,
      recipient_hidden_at = case
        when challenge.recipient_id = v_user_id then coalesce(challenge.recipient_hidden_at, now())
        else challenge.recipient_hidden_at
      end
  where challenge.id = v_challenge_id;

  update private.football_gm_matches match
  set current_turn_profile_id = null,
      pending_team_code = null,
      updated_at = now()
  where match.challenge_id = v_challenge_id;

  return true;
end;
$$;

create or replace function private.open_football_gm_challenge(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_now timestamptz := now();
  v_first uuid;
  v_unaccepted integer;
  v_first_name text;
  v_row record;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then raise exception 'The GM match not found'; end if;

  if exists (
    select 1
    from public.play_challenges challenge
    where challenge.id = v_challenge_id
      and challenge.declined_at is not null
  ) then
    return private.football_gm_state_json(v_challenge_id);
  end if;

  update private.football_gm_participants participant
  set accepted_at = coalesce(participant.accepted_at, v_now)
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  update public.play_challenges challenge
  set opened_at = coalesce(challenge.opened_at, v_now)
  where challenge.id = v_challenge_id
    and challenge.recipient_id = v_user_id
    and challenge.declined_at is null;

  select count(*)::integer into v_unaccepted
  from private.football_gm_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.accepted_at is null;

  if v_unaccepted = 0 and exists (
    select 1 from private.football_gm_matches match
    where match.challenge_id = v_challenge_id and match.phase = 'waiting'
    for update
  ) then
    select participant.profile_id into v_first
    from private.football_gm_participants participant
    where participant.challenge_id = v_challenge_id
    order by random()
    limit 1;

    update private.football_gm_matches match
    set phase = 'draft',
        current_turn_profile_id = v_first,
        started_at = coalesce(match.started_at, v_now),
        updated_at = v_now
    where match.challenge_id = v_challenge_id
      and match.phase = 'waiting';

    select profile.display_name into v_first_name
    from public.profiles profile where profile.id = v_first;

    for v_row in
      select participant.profile_id
      from private.football_gm_participants participant
      where participant.challenge_id = v_challenge_id
    loop
      begin
        perform private.publish_notification_to_profile(
          v_row.profile_id,
          'gm-football:start:' || v_challenge_id::text || ':' || v_row.profile_id::text,
          'play-challenges:accepted',
          'game_challenge_accepted',
          case when v_row.profile_id = v_first then 'Your turn in The GM' else 'The GM is ready' end,
          case when v_row.profile_id = v_first
            then 'The draft is live. You have the first spin.'
            else coalesce(v_first_name, 'Your opponent') || ' has the first spin.'
          end,
          '/football/gm-mode?match=' || (
            select challenge.code from public.play_challenges challenge where challenge.id = v_challenge_id
          ),
          case when v_row.profile_id = v_first then 'TAKE YOUR TURN' else 'OPEN MATCH' end,
          v_now
        );
      exception when others then
        null;
      end;
    end loop;
  end if;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function public.cancel_football_gm_challenge(p_code text)
returns boolean
language sql
security invoker
set search_path = ''
as $$ select private.cancel_football_gm_challenge(p_code); $$;

revoke all on function private.cancel_football_gm_challenge(text) from public, anon;
grant execute on function private.cancel_football_gm_challenge(text) to authenticated;

revoke all on function public.cancel_football_gm_challenge(text) from public, anon;
grant execute on function public.cancel_football_gm_challenge(text) to authenticated;
