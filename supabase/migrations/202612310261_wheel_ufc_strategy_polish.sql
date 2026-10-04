-- Wheel of UFC strategy + presentation support.
-- Preserve the approved wheel weights/grading while exposing safe scarcity counts,
-- retaining each pick's spin source for postgame analysis, removing the six-candidate cap,
-- and repairing verified ESPN fighter headshots.

alter table private.wheel_ufc_picks
  add column if not exists spin_category text check (
    spin_category is null or spin_category in (
      'CHAMPION', 'TOP_5', 'SIX_TO_FIFTEEN', 'UNRANKED', 'COUNTRY', 'YOUNG_GUN', 'VETERAN'
    )
  ),
  add column if not exists spin_country_code text,
  add column if not exists spin_country_name text;

create or replace function private.capture_wheel_ufc_spin_source()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.spin_category is null then
    select match.pending_category, match.pending_country_code, match.pending_country_name
      into new.spin_category, new.spin_country_code, new.spin_country_name
    from private.wheel_ufc_matches match
    where match.challenge_id = new.challenge_id;
  end if;
  return new;
end;
$$;

drop trigger if exists wheel_ufc_capture_spin_source on private.wheel_ufc_picks;
create trigger wheel_ufc_capture_spin_source
before insert on private.wheel_ufc_picks
for each row execute function private.capture_wheel_ufc_spin_source();

revoke all on function private.capture_wheel_ufc_spin_source() from public, anon, authenticated;

create or replace function private.wheel_ufc_eligible_slot_counts(
  p_challenge_id uuid,
  p_profile_id uuid,
  p_category text,
  p_country_code text
)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  with slots(slot, ordinal) as (
    values
      ('Flyweight', 1), ('Bantamweight', 2), ('Featherweight', 3), ('Lightweight', 4),
      ('Welterweight', 5), ('Middleweight', 6), ('Light Heavyweight', 7), ('Heavyweight', 8)
  ), open_slots as (
    select slots.slot, slots.ordinal
    from slots
    where not exists (
      select 1
      from private.wheel_ufc_picks pick
      where pick.challenge_id = p_challenge_id
        and pick.profile_id = p_profile_id
        and pick.roster_slot = slots.slot
    )
  ), counts as (
    select
      open_slots.slot,
      open_slots.ordinal,
      count(fighter.fighter_id)::integer as candidate_count
    from open_slots
    join private.wheel_ufc_fighters fighter
      on fighter.division = open_slots.slot
     and fighter.active
     and private.wheel_ufc_category_ok(
       p_category,
       p_country_code,
       fighter.country_code,
       fighter.is_champion,
       fighter.ranking,
       fighter.young_gun,
       fighter.veteran_10_plus
     )
     and not exists (
       select 1
       from private.wheel_ufc_picks used
       where used.challenge_id = p_challenge_id
         and used.fighter_id = fighter.fighter_id
     )
    group by open_slots.slot, open_slots.ordinal
  )
  select coalesce(
    jsonb_object_agg(counts.slot, counts.candidate_count order by counts.ordinal),
    '{}'::jsonb
  )
  from counts
  where counts.candidate_count > 0;
$$;

revoke all on function private.wheel_ufc_eligible_slot_counts(uuid,uuid,text,text) from public, anon, authenticated;

create or replace function private.wheel_ufc_state_json(p_challenge_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'code', challenge.code,
    'phase', match.phase,
    'turn_count', match.turn_count,
    'current_turn_profile_id', match.current_turn_profile_id,
    'pending_spin', case when match.pending_category is null then null else jsonb_build_object(
      'category', match.pending_category,
      'label', case match.pending_category
        when 'CHAMPION' then 'CHAMPION'
        when 'TOP_5' then 'TOP 5'
        when 'SIX_TO_FIFTEEN' then '6–15'
        when 'UNRANKED' then 'UNRANKED'
        when 'COUNTRY' then 'COUNTRY'
        when 'YOUNG_GUN' then 'YOUNG GUN'
        when 'VETERAN' then 'VETERAN'
      end,
      'country_code', match.pending_country_code,
      'country_name', match.pending_country_name,
      'eligible_slots', private.wheel_ufc_eligible_slots(
        challenge.id,
        match.current_turn_profile_id,
        match.pending_category,
        match.pending_country_code
      ),
      'eligible_counts', private.wheel_ufc_eligible_slot_counts(
        challenge.id,
        match.current_turn_profile_id,
        match.pending_category,
        match.pending_country_code
      )
    ) end,
    'creator', jsonb_build_object('id', challenge.creator_id, 'display_name', creator.display_name),
    'recipient', jsonb_build_object('id', challenge.recipient_id, 'display_name', recipient.display_name),
    'creator_roster', coalesce((
      select jsonb_agg(jsonb_build_object(
        'turn_number', pick.turn_number,
        'fighter_id', pick.fighter_id,
        'display_name', pick.display_name,
        'roster_slot', pick.roster_slot,
        'ranking_label', pick.ranking_label,
        'country_code', pick.country_code,
        'country_name', pick.country_name,
        'headshot_url', pick.headshot_url,
        'spin_category', pick.spin_category,
        'spin_country_name', pick.spin_country_name,
        'revealed_grade', case
          when match.phase = 'complete' and match.forfeited_at is null then pick.hidden_grade
          else null
        end
      ) order by pick.turn_number)
      from private.wheel_ufc_picks pick
      where pick.challenge_id = challenge.id and pick.profile_id = challenge.creator_id
    ), '[]'::jsonb),
    'recipient_roster', coalesce((
      select jsonb_agg(jsonb_build_object(
        'turn_number', pick.turn_number,
        'fighter_id', pick.fighter_id,
        'display_name', pick.display_name,
        'roster_slot', pick.roster_slot,
        'ranking_label', pick.ranking_label,
        'country_code', pick.country_code,
        'country_name', pick.country_name,
        'headshot_url', pick.headshot_url,
        'spin_category', pick.spin_category,
        'spin_country_name', pick.spin_country_name,
        'revealed_grade', case
          when match.phase = 'complete' and match.forfeited_at is null then pick.hidden_grade
          else null
        end
      ) order by pick.turn_number)
      from private.wheel_ufc_picks pick
      where pick.challenge_id = challenge.id and pick.profile_id = challenge.recipient_id
    ), '[]'::jsonb),
    'result', case
      when match.phase = 'complete'
        and match.forfeited_at is null
        and coalesce(challenge.creator_result ? 'finalGrade', false)
        and coalesce(challenge.responder_result ? 'finalGrade', false)
        and private.wheel_ufc_grade_total(challenge.id, challenge.creator_id) is not null
        and private.wheel_ufc_grade_total(challenge.id, challenge.recipient_id) is not null
      then jsonb_build_object(
        'creator_final_grade', (challenge.creator_result ->> 'finalGrade')::numeric,
        'recipient_final_grade', (challenge.responder_result ->> 'finalGrade')::numeric,
        'winner_profile_id', case
          when private.wheel_ufc_grade_total(challenge.id, challenge.creator_id)
            > private.wheel_ufc_grade_total(challenge.id, challenge.recipient_id) then challenge.creator_id
          when private.wheel_ufc_grade_total(challenge.id, challenge.recipient_id)
            > private.wheel_ufc_grade_total(challenge.id, challenge.creator_id) then challenge.recipient_id
          else null
        end,
        'is_tie', private.wheel_ufc_grade_total(challenge.id, challenge.creator_id)
          = private.wheel_ufc_grade_total(challenge.id, challenge.recipient_id)
      )
      else null
    end,
    'opened_at', challenge.opened_at,
    'completed_at', challenge.completed_at,
    'forfeited_by_profile_id', match.forfeited_by_profile_id,
    'forfeited_at', match.forfeited_at
  )
  from public.play_challenges challenge
  join private.wheel_ufc_matches match on match.challenge_id = challenge.id
  join public.profiles creator on creator.id = challenge.creator_id
  join public.profiles recipient on recipient.id = challenge.recipient_id
  where challenge.id = p_challenge_id;
$$;

create or replace function private.get_wheel_ufc_candidates(
  p_code text,
  p_roster_slot text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_ufc_matches%rowtype;
  v_slot text := trim(coalesce(p_roster_slot, ''));
  v_rows jsonb;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  select challenge.* into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-ufc'
    and (challenge.creator_id = v_user_id or challenge.recipient_id = v_user_id);
  if not found then raise exception 'Wheel of UFC match not found'; end if;

  select match.* into v_match
  from private.wheel_ufc_matches match
  where match.challenge_id = v_challenge.id;

  if v_match.current_turn_profile_id <> v_user_id or v_match.phase <> 'pick' or v_match.pending_category is null then
    raise exception 'It is not your pick';
  end if;
  if not v_slot = any(private.wheel_ufc_eligible_slots(
    v_challenge.id, v_user_id, v_match.pending_category, v_match.pending_country_code
  )) then raise exception 'That weight class is not available for this spin'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'fighter_id', candidate.fighter_id,
    'display_name', candidate.display_name,
    'division', candidate.division,
    'ranking_label', case
      when candidate.is_champion then 'CHAMPION'
      when candidate.ranking is not null then '#' || candidate.ranking::text
      else 'UNRANKED'
    end,
    'country_code', candidate.country_code,
    'country_name', candidate.country_name,
    'headshot_url', candidate.headshot_url
  ) order by candidate.is_champion desc, candidate.ranking asc nulls last, candidate.display_name), '[]'::jsonb)
  into v_rows
  from (
    select fighter.*
    from private.wheel_ufc_fighters fighter
    where fighter.active
      and fighter.division = v_slot
      and private.wheel_ufc_category_ok(
        v_match.pending_category,
        v_match.pending_country_code,
        fighter.country_code,
        fighter.is_champion,
        fighter.ranking,
        fighter.young_gun,
        fighter.veteran_10_plus
      )
      and not exists (
        select 1 from private.wheel_ufc_picks used
        where used.challenge_id = v_challenge.id
          and used.fighter_id = fighter.fighter_id
      )
    order by fighter.is_champion desc, fighter.ranking asc nulls last, fighter.display_name
  ) candidate;

  return v_rows;
end;
$$;

update private.wheel_ufc_fighters
set headshot_url = case fighter_id
  when 'michael-morales' then 'https://a.espncdn.com/i/headshots/mma/players/full/4869426.png'
  when 'josh-hokit' then 'https://a.espncdn.com/i/headshots/mma/players/full/4049391.png'
  when 'tatsuro-taira' then 'https://a.espncdn.com/i/headshots/mma/players/full/4917772.png'
  when 'lerone-murphy' then 'https://a.espncdn.com/i/headshots/mma/players/full/4576101.png'
  else headshot_url
end
where fighter_id in ('michael-morales', 'josh-hokit', 'tatsuro-taira', 'lerone-murphy');

update private.wheel_ufc_picks
set headshot_url = case fighter_id
  when 'michael-morales' then 'https://a.espncdn.com/i/headshots/mma/players/full/4869426.png'
  when 'josh-hokit' then 'https://a.espncdn.com/i/headshots/mma/players/full/4049391.png'
  when 'tatsuro-taira' then 'https://a.espncdn.com/i/headshots/mma/players/full/4917772.png'
  when 'lerone-murphy' then 'https://a.espncdn.com/i/headshots/mma/players/full/4576101.png'
  else headshot_url
end
where fighter_id in ('michael-morales', 'josh-hokit', 'tatsuro-taira', 'lerone-murphy')
  and headshot_url is null;

insert into public.ufc_fighter_media (
  fighter_slug, display_name, photo_url, source, source_page_url, source_fighter_id, last_verified_at
) values
  ('michael-morales', 'Michael Morales', 'https://a.espncdn.com/i/headshots/mma/players/full/4869426.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4869426/michael-morales', '4869426', now()),
  ('josh-hokit', 'Josh Hokit', 'https://a.espncdn.com/i/headshots/mma/players/full/4049391.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4049391/josh-hokit', '4049391', now()),
  ('tatsuro-taira', 'Tatsuro Taira', 'https://a.espncdn.com/i/headshots/mma/players/full/4917772.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4917772/tatsuro-taira', '4917772', now()),
  ('lerone-murphy', 'Lerone Murphy', 'https://a.espncdn.com/i/headshots/mma/players/full/4576101.png', 'espn', 'https://www.espn.com/mma/fighter/_/id/4576101/lerone-murphy', '4576101', now())
on conflict (fighter_slug) do update
set display_name = excluded.display_name,
    photo_url = excluded.photo_url,
    source = excluded.source,
    source_page_url = excluded.source_page_url,
    source_fighter_id = excluded.source_fighter_id,
    last_verified_at = excluded.last_verified_at,
    updated_at = now();

comment on function private.wheel_ufc_eligible_slot_counts(uuid,uuid,text,text) is
  'Returns only safe per-slot eligible fighter counts for the active Wheel of UFC spin; grades remain private.';
comment on function public.get_wheel_ufc_candidates(text,text) is
  'Returns every eligible candidate identity/ranking/country row for the active player and selected open weight class; grades never leak through candidate RPCs.';
