-- Wheel of UFC rank-band eligibility must follow the fighter's official ranked
-- status across the active pool, not only the roster slot currently being filled.
-- This matters for cross-division playable fighters such as Alex Pereira and
-- Johnny Walker: they may be selectable at Heavyweight, but their official LHW
-- ranking means they are not eligible for an UNRANKED spin.
--
-- Non-ranking categories (Country / Young Gun / Veteran) remain slot-row based.
-- Ranking labels continue to use the display helper introduced in migration 266.

create or replace function private.wheel_ufc_fighter_category_ok(
  p_category text,
  p_required_country_code text,
  p_fighter_id text,
  p_fighter_country_code text,
  p_young_gun boolean,
  p_veteran boolean
)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  with rank_state as (
    select
      coalesce(bool_or(fighter.is_champion), false) as is_champion_any,
      min(fighter.ranking) filter (where fighter.ranking is not null) as best_ranking
    from private.wheel_ufc_fighters fighter
    where fighter.active
      and fighter.fighter_id = p_fighter_id
  )
  select case p_category
    when 'CHAMPION' then rank_state.is_champion_any
    when 'TOP_5' then not rank_state.is_champion_any
      and rank_state.best_ranking between 1 and 5
    when 'SIX_TO_FIFTEEN' then not rank_state.is_champion_any
      and rank_state.best_ranking between 6 and 15
    when 'UNRANKED' then not rank_state.is_champion_any
      and rank_state.best_ranking is null
    when 'COUNTRY' then p_fighter_country_code is not null
      and (
        nullif(trim(coalesce(p_required_country_code, '')), '') is null
        or p_fighter_country_code = nullif(trim(coalesce(p_required_country_code, '')), '')
      )
    when 'YOUNG_GUN' then p_young_gun
    when 'VETERAN' then p_veteran
    else false
  end
  from rank_state;
$$;

revoke all on function private.wheel_ufc_fighter_category_ok(text,text,text,text,boolean,boolean)
  from public, anon, authenticated;

create or replace function private.wheel_ufc_eligible_slots(
  p_challenge_id uuid,
  p_profile_id uuid,
  p_category text,
  p_country_code text
)
returns text[]
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
  ), eligible as (
    select open_slots.slot, open_slots.ordinal
    from open_slots
    where exists (
      select 1
      from private.wheel_ufc_fighters fighter
      where fighter.active
        and fighter.division = open_slots.slot
        and private.wheel_ufc_fighter_category_ok(
          p_category,
          p_country_code,
          fighter.fighter_id,
          fighter.country_code,
          fighter.young_gun,
          fighter.veteran_10_plus
        )
        and not exists (
          select 1
          from private.wheel_ufc_picks used
          where used.challenge_id = p_challenge_id
            and used.fighter_id = fighter.fighter_id
        )
    )
  )
  select coalesce(array_agg(eligible.slot order by eligible.ordinal), '{}'::text[])
  from eligible;
$$;

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
     and private.wheel_ufc_fighter_category_ok(
       p_category,
       p_country_code,
       fighter.fighter_id,
       fighter.country_code,
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
    'ranking_label', private.wheel_ufc_ranking_label(candidate.fighter_id, candidate.division),
    'country_code', candidate.country_code,
    'country_name', candidate.country_name,
    'headshot_url', candidate.headshot_url
  ) order by
    case
      when private.wheel_ufc_ranking_label(candidate.fighter_id, candidate.division) = 'CHAMPION' then 0
      when private.wheel_ufc_ranking_label(candidate.fighter_id, candidate.division) like '%#%' then 1
      else 2
    end,
    candidate.display_name
  ), '[]'::jsonb)
  into v_rows
  from (
    select fighter.*
    from private.wheel_ufc_fighters fighter
    where fighter.active
      and fighter.division = v_slot
      and private.wheel_ufc_fighter_category_ok(
        v_match.pending_category,
        v_match.pending_country_code,
        fighter.fighter_id,
        fighter.country_code,
        fighter.young_gun,
        fighter.veteran_10_plus
      )
      and not exists (
        select 1 from private.wheel_ufc_picks used
        where used.challenge_id = v_challenge.id
          and used.fighter_id = fighter.fighter_id
      )
    order by fighter.display_name
  ) candidate;

  return v_rows;
end;
$$;

create or replace function private.enforce_wheel_ufc_global_rank_category()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_category text;
  v_country_code text;
  v_fighter private.wheel_ufc_fighters%rowtype;
begin
  select match.pending_category, match.pending_country_code
  into v_category, v_country_code
  from private.wheel_ufc_matches match
  where match.challenge_id = new.challenge_id;

  if v_category is null then
    raise exception 'Wheel of UFC pick has no active spin';
  end if;

  select fighter.* into v_fighter
  from private.wheel_ufc_fighters fighter
  where fighter.active
    and fighter.fighter_id = new.fighter_id
    and fighter.division = new.roster_slot;

  if not found then
    raise exception 'Wheel of UFC fighter is not active in that roster slot';
  end if;

  if not private.wheel_ufc_fighter_category_ok(
    v_category,
    v_country_code,
    v_fighter.fighter_id,
    v_fighter.country_code,
    v_fighter.young_gun,
    v_fighter.veteran_10_plus
  ) then
    raise exception 'That fighter is not eligible for this spin';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_wheel_ufc_global_rank_category()
  from public, anon, authenticated;

drop trigger if exists wheel_ufc_enforce_global_rank_category on private.wheel_ufc_picks;
create trigger wheel_ufc_enforce_global_rank_category
before insert on private.wheel_ufc_picks
for each row
execute function private.enforce_wheel_ufc_global_rank_category();

do $wheel_ufc_global_rank_eligibility_postflight$
declare
  v_alex_unranked boolean;
  v_alex_top5 boolean;
  v_walker_unranked boolean;
  v_gable_unranked boolean;
begin
  select private.wheel_ufc_fighter_category_ok(
    'UNRANKED', null, 'alex-pereira', 'BR', false, true
  ) into v_alex_unranked;

  select private.wheel_ufc_fighter_category_ok(
    'TOP_5', null, 'alex-pereira', 'BR', false, true
  ) into v_alex_top5;

  select private.wheel_ufc_fighter_category_ok(
    'UNRANKED', null, 'johnny-walker', 'BR', false, true
  ) into v_walker_unranked;

  select private.wheel_ufc_fighter_category_ok(
    'UNRANKED', null, 'gable-steveson', 'US', false, false
  ) into v_gable_unranked;

  if v_alex_unranked is distinct from false then
    raise exception 'Alex Pereira must not qualify for an UNRANKED spin';
  end if;
  if v_alex_top5 is distinct from true then
    raise exception 'Alex Pereira must qualify for TOP 5 from official LHW #3';
  end if;
  if v_walker_unranked is distinct from false then
    raise exception 'Johnny Walker must not qualify for an UNRANKED spin';
  end if;
  if v_gable_unranked is distinct from true then
    raise exception 'Gable Steveson should remain eligible for UNRANKED';
  end if;
end;
$wheel_ufc_global_rank_eligibility_postflight$;

comment on function private.wheel_ufc_fighter_category_ok(text,text,text,text,boolean,boolean) is
  'Wheel of UFC eligibility helper. Rank-band categories use the fighter''s best official active ranking across divisions so a ranked cross-division fighter cannot appear as unranked in another roster slot.';
