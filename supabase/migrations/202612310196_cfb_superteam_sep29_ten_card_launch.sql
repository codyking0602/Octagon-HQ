-- Tune only the Sep. 29 CFB Superteam launch to open with ten visible cards.
-- The reusable elastic field thresholds stay unchanged, so Day 2+ can contract
-- or expand from the actual field without rerolling any prebuilt candidates.

create or replace function private.football_weekly_auction_cards_for_day(
  p_week_start date,p_day_index integer
)
returns integer
language plpgsql
stable
security definer
set search_path=''
as $$
declare
  v_subject text;
  v_day_start timestamptz;
  v_players integer;
begin
  if p_day_index not between 1 and 7 then
    raise exception 'Football Weekly Auction day must be between 1 and 7';
  end if;

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject<>'cfb-superteam' then
    return private.football_weekly_auction_cards_per_day(p_week_start);
  end if;

  -- Launch tuning: the Sep. 29 week is planned around six players, so Day 1
  -- opens with ten cards. Later days still use the actual enrolled field.
  if p_week_start=date '2026-09-29' and p_day_index=1 then
    return 10;
  end if;

  v_day_start:=((p_week_start+(p_day_index-1))::timestamp at time zone 'America/Chicago');

  select count(*)::integer into v_players
  from private.football_weekly_auction_participants participant
  where participant.week_start=p_week_start
    and participant.locked_at<v_day_start;

  return private.football_weekly_superteam_cards_for_field(v_players);
end;
$$;
revoke all on function private.football_weekly_auction_cards_for_day(date,integer)
  from public,anon,authenticated;

create or replace function public.get_my_football_weekly_superteam_preview()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_current_week date;
  v_week_start date;
  v_subject text;
  v_card_count integer;
  v_cards jsonb;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  if not public.is_pick_control_owner(v_profile)
    or not exists(
      select 1 from public.profiles profile
      where profile.id=v_profile and profile.normalized_name='CODY'
    )
  then
    raise exception 'owner preview unavailable';
  end if;

  v_current_week:=private.football_weekly_auction_week_start(now());
  v_week_start:=v_current_week+7;
  v_subject:=private.football_weekly_auction_subject_for_week(v_week_start);

  if v_subject<>'cfb-superteam' then
    return jsonb_build_object(
      'available',false,
      'subject_key',v_subject,
      'week_start',v_week_start
    );
  end if;

  perform private.materialize_football_weekly_auction_week(v_week_start);
  v_card_count:=private.football_weekly_auction_cards_for_day(v_week_start,1);

  select coalesce(jsonb_agg(jsonb_build_object(
    'slot',board.slot,
    'item_reference',authority.item_reference,
    'display_name',authority.display_name,
    'school',authority.school,
    'season_year',authority.season_year,
    'group_key',authority.group_key,
    'eligible_slots',authority.eligible_slots,
    'lock_at',board.lock_at
  ) order by board.slot),'[]'::jsonb)
  into v_cards
  from private.football_weekly_auction_board board
  join private.cfb_superteam_v1_authority authority
    on authority.item_reference=board.season_reference
  where board.week_start=v_week_start
    and board.day_index=1
    and board.slot<=v_card_count;

  if jsonb_array_length(v_cards)<>v_card_count then
    raise exception 'CFB Superteam owner preview board is incomplete';
  end if;

  return jsonb_build_object(
    'available',true,
    'subject_key','cfb-superteam',
    'week_start',v_week_start,
    'week_end',v_week_start+6,
    'day_index',1,
    'bankroll',50,
    'owned_count',0,
    'reserve_floor',7,
    'max_commit',45,
    'submitted_today',false,
    'show_intro',false,
    'teams',v_cards,
    'bids','{}'::jsonb,
    'prior_results','[]'::jsonb,
    'collection','[]'::jsonb,
    'tie_priority','[]'::jsonb,
    'previous_final',null
  );
end;
$$;
revoke all on function public.get_my_football_weekly_superteam_preview()
  from public,anon;
grant execute on function public.get_my_football_weekly_superteam_preview()
  to authenticated;

do $cfb_superteam_sep29_launch$
begin
  if exists(
    select 1
    from private.football_weekly_auction_daily_entries
    where week_start=date '2026-09-29'
  ) or exists(
    select 1
    from private.football_weekly_auction_bids
    where week_start=date '2026-09-29'
  ) or exists(
    select 1
    from private.football_weekly_auction_awards
    where week_start=date '2026-09-29'
  ) then
    raise exception 'Sep. 29 CFB Superteam launch tuning must be applied before auction activity begins';
  end if;

  perform private.materialize_football_weekly_superteam_week(date '2026-09-29');

  if private.football_weekly_auction_cards_for_day(date '2026-09-29',1)<>10 then
    raise exception 'Sep. 29 CFB Superteam Day 1 must expose ten launch cards';
  end if;

  if (
    select count(*)
    from private.football_weekly_auction_board
    where week_start=date '2026-09-29'
      and day_index=1
      and slot<=10
  )<>10 then
    raise exception 'Sep. 29 CFB Superteam ten-card launch board is incomplete';
  end if;

  if private.football_weekly_superteam_cards_for_field(5)<>8
    or private.football_weekly_superteam_cards_for_field(6)<>9
    or private.football_weekly_superteam_cards_for_field(8)<>10
    or private.football_weekly_superteam_cards_for_field(9)<>11
    or private.football_weekly_superteam_cards_for_field(10)<>12
  then
    raise exception 'CFB Superteam reusable elastic thresholds changed during launch tuning';
  end if;
end;
$cfb_superteam_sep29_launch$;
