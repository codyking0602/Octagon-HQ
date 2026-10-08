-- Repair old GM head-to-head double finalists in durable result snapshots,
-- and normalize stale-browser year-one submissions before they lock.

-- Repair a legacy independent-roll double finalist without changing the
-- already assigned offseason order. The first offseason picker is the losing
-- Super Bowl finalist; their opponent is the champion.
create or replace function private.football_gm_repair_duplicate_finalists(
  p_challenge_id uuid,
  p_offseason_first_profile_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer;
  v_same integer;
  v_finish text;
begin
  if p_offseason_first_profile_id is null then return false; end if;

  select count(*)::integer,
         count(distinct participant.year1_result ->> 'finish')::integer,
         max(participant.year1_result ->> 'finish')
    into v_total, v_same, v_finish
  from private.football_gm_participants participant
  where participant.challenge_id = p_challenge_id
    and participant.year1_result ->> 'finish' is not null;

  if v_total <> 2 or v_same <> 1
     or v_finish not in ('Champion', 'Super Bowl Loss') then
    return false;
  end if;

  update private.football_gm_participants participant
  set year1_result = jsonb_set(
    jsonb_set(
      participant.year1_result,
      '{finish}',
      to_jsonb(case when participant.profile_id = p_offseason_first_profile_id
        then 'Super Bowl Loss'::text else 'Champion'::text end),
      true
    ),
    '{postseasonBonus}',
    to_jsonb(case when participant.profile_id = p_offseason_first_profile_id then 5 else 7 end),
    true
  ),
  run_state = case
    when jsonb_typeof(participant.run_state -> 'resolvedSeasons') = 'array'
      and jsonb_array_length(participant.run_state -> 'resolvedSeasons') >= 1
    then jsonb_set(
      jsonb_set(
        participant.run_state,
        '{resolvedSeasons,0,finish}',
        to_jsonb(case when participant.profile_id = p_offseason_first_profile_id
          then 'Super Bowl Loss'::text else 'Champion'::text end),
        true
      ),
      '{resolvedSeasons,0,postseasonBonus}',
      to_jsonb(case when participant.profile_id = p_offseason_first_profile_id then 5 else 7 end),
      true
    )
    else participant.run_state
  end
  where participant.challenge_id = p_challenge_id;

  return true;
end;
$$;

revoke all on function private.football_gm_repair_duplicate_finalists(uuid,uuid) from public, anon, authenticated;

-- Protect new Year 1 submissions from stale clients as well.
create or replace function private.submit_football_gm_year1(
  p_code text,
  p_result jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_ready integer;
  v_first uuid;
  v_first_name text;
  v_row record;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then raise exception 'The GM match not found'; end if;

  perform 1 from private.football_gm_matches match
  where match.challenge_id = v_challenge_id and match.phase in ('year1','offseason')
  for update;
  if not found then raise exception 'Year 1 is not ready'; end if;

  update private.football_gm_participants participant
  set year1_result = coalesce(participant.year1_result, p_result)
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  select count(*)::integer into v_ready
  from private.football_gm_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.year1_result is not null;

  if v_ready = 2 and exists (
    select 1 from private.football_gm_matches match
    where match.challenge_id = v_challenge_id and match.phase = 'year1'
  ) then
    select participant.profile_id into v_first
    from private.football_gm_participants participant
    where participant.challenge_id = v_challenge_id
    order by
      private.football_gm_finish_rank(participant.year1_result) asc,
      md5((
        select match.seed from private.football_gm_matches match where match.challenge_id = v_challenge_id
      ) || ':' || participant.profile_id::text) asc
    limit 1;

    -- Stale clients may submit independent terminal finishes. Normalize
    -- duplicates BEFORE the offseason becomes available, while retaining
    -- the existing first-pick tiebreaker as the lower finisher.
    perform private.football_gm_repair_duplicate_finalists(v_challenge_id, v_first);

    update private.football_gm_matches match
    set phase = 'offseason',
        current_turn_profile_id = v_first,
        offseason_first_profile_id = v_first,
        updated_at = now()
    where match.challenge_id = v_challenge_id
      and match.phase = 'year1';

    select profile.display_name into v_first_name from public.profiles profile where profile.id = v_first;

    for v_row in
      select participant.profile_id
      from private.football_gm_participants participant
      where participant.challenge_id = v_challenge_id
    loop
      perform private.publish_notification_to_profile(
        v_row.profile_id,
        'gm-football:offseason:' || v_challenge_id::text || ':' || v_row.profile_id::text,
        'play-challenges:received',
        'game_challenge_received',
        case when v_row.profile_id = v_first then 'Your offseason starts now' else 'The offseason is underway' end,
        case when v_row.profile_id = v_first
          then 'The lower Year 1 finisher gets first access to the shared market.'
          else coalesce(v_first_name, 'Your opponent') || ' has first offseason priority.'
        end,
        '/football/gm-mode?match=' || p_code,
        case when v_row.profile_id = v_first then 'OPEN FRONT OFFICE' else 'OPEN MATCH' end,
        now()
      );
    end loop;
  end if;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

-- Repair completed pre-release match snapshots, including the single
-- Tyler/Cody legacy game that retained two saved Champion results.
do $$
declare
  v_match record;
begin
  for v_match in
    select match.challenge_id, match.offseason_first_profile_id
    from private.football_gm_matches match
    where match.phase = 'complete'
      and match.offseason_first_profile_id is not null
    order by match.completed_at nulls last
  loop
    perform private.football_gm_repair_duplicate_finalists(
      v_match.challenge_id,
      v_match.offseason_first_profile_id
    );
  end loop;
end;
$$;

-- Backfill + submission guard cannot leave duplicate terminal results in
-- completed matches with known offseason priority.
do $$
begin
  if exists (
    select 1
    from private.football_gm_matches match
    join private.football_gm_participants participant
      on participant.challenge_id = match.challenge_id
    where match.phase = 'complete'
      and match.offseason_first_profile_id is not null
    group by match.challenge_id
    having count(*) = 2
       and count(distinct participant.year1_result ->> 'finish') = 1
       and max(participant.year1_result ->> 'finish') in ('Champion', 'Super Bowl Loss')
  ) then
    raise exception 'Completed GM match retains duplicate Super Bowl finalists';
  end if;
end;
$$;
