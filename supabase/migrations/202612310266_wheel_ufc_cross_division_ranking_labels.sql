-- Wheel of UFC cross-division ranking label correction.
-- A fighter can be playable in more than one weight-class slot, while UFC rankings
-- belong to a single official division. The secondary slot must not make a ranked
-- fighter look globally "UNRANKED" in the picker or saved result.
--
-- Keep spin eligibility division-specific. This migration changes presentation only:
-- Alex Pereira remains ranked #3 at Light Heavyweight and Johnny Walker #13 at
-- Light Heavyweight under the 2026-09-29 UFC All Rankings snapshot, while both may
-- still be playable in the Heavyweight roster slot.

create or replace function private.wheel_ufc_ranking_label(
  p_fighter_id text,
  p_division text
)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  with selected as (
    select fighter.division, fighter.ranking, fighter.is_champion
    from private.wheel_ufc_fighters fighter
    where fighter.active
      and fighter.fighter_id = p_fighter_id
      and fighter.division = p_division
    limit 1
  ), alternate_ranked as (
    select
      fighter.division,
      fighter.ranking,
      fighter.is_champion,
      case fighter.division
        when 'Flyweight' then 'FLW'
        when 'Bantamweight' then 'BW'
        when 'Featherweight' then 'FW'
        when 'Lightweight' then 'LW'
        when 'Welterweight' then 'WW'
        when 'Middleweight' then 'MW'
        when 'Light Heavyweight' then 'LHW'
        when 'Heavyweight' then 'HW'
        else fighter.division
      end as division_label
    from private.wheel_ufc_fighters fighter
    where fighter.active
      and fighter.fighter_id = p_fighter_id
      and fighter.division <> p_division
      and (fighter.is_champion or fighter.ranking is not null)
    order by fighter.is_champion desc, fighter.ranking asc nulls last, fighter.division
    limit 1
  )
  select coalesce(
    (
      select case
        when selected.is_champion then 'CHAMPION'
        when selected.ranking is not null then '#' || selected.ranking::text
        else null
      end
      from selected
    ),
    (
      select case
        when alternate_ranked.is_champion then alternate_ranked.division_label || ' CHAMPION'
        else alternate_ranked.division_label || ' #' || alternate_ranked.ranking::text
      end
      from alternate_ranked
    ),
    'UNRANKED'
  );
$$;

revoke all on function private.wheel_ufc_ranking_label(text,text) from public, anon, authenticated;

create or replace function private.apply_wheel_ufc_ranking_label()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.ranking_label := private.wheel_ufc_ranking_label(new.fighter_id, new.roster_slot);
  return new;
end;
$$;

revoke all on function private.apply_wheel_ufc_ranking_label() from public, anon, authenticated;

drop trigger if exists wheel_ufc_picks_ranking_label on private.wheel_ufc_picks;
create trigger wheel_ufc_picks_ranking_label
before insert or update of fighter_id, roster_slot
on private.wheel_ufc_picks
for each row
execute function private.apply_wheel_ufc_ranking_label();

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
    limit 6
  ) candidate;

  return v_rows;
end;
$$;

-- Repair already-saved picks/results so an existing Heavyweight Alex Pereira or
-- Johnny Walker selection is not permanently labeled UNRANKED.
update private.wheel_ufc_picks pick
set ranking_label = private.wheel_ufc_ranking_label(pick.fighter_id, pick.roster_slot)
where pick.ranking_label is distinct from private.wheel_ufc_ranking_label(pick.fighter_id, pick.roster_slot);

do $wheel_ufc_cross_division_ranking_label_postflight$
declare
  v_alex_hw text;
  v_alex_lhw text;
  v_walker_hw text;
begin
  select private.wheel_ufc_ranking_label('alex-pereira', 'Heavyweight') into v_alex_hw;
  select private.wheel_ufc_ranking_label('alex-pereira', 'Light Heavyweight') into v_alex_lhw;
  select private.wheel_ufc_ranking_label('johnny-walker', 'Heavyweight') into v_walker_hw;

  if v_alex_hw is distinct from 'LHW #3' then
    raise exception 'Alex Pereira Heavyweight display ranking expected LHW #3, found %', v_alex_hw;
  end if;

  if v_alex_lhw is distinct from '#3' then
    raise exception 'Alex Pereira Light Heavyweight display ranking expected #3, found %', v_alex_lhw;
  end if;

  if v_walker_hw is distinct from 'LHW #13' then
    raise exception 'Johnny Walker Heavyweight display ranking expected LHW #13, found %', v_walker_hw;
  end if;
end;
$wheel_ufc_cross_division_ranking_label_postflight$;

comment on function private.wheel_ufc_ranking_label(text,text) is
  'Wheel of UFC display-only ranking label. Uses the selected division ranking when present; otherwise shows the fighter''s official ranking from another active division with a division prefix. Spin eligibility remains division-specific.';
