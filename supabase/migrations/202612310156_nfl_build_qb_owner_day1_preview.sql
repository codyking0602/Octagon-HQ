-- Owner-only prelaunch preview for the next NFL Build a QB Weekly board.
-- Materializes the real future board without running maintenance or locking participants,
-- then returns only Day 1 public card identity to Cody's controller profile.

create or replace function public.get_my_football_weekly_build_qb_preview()
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
  v_cards jsonb;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  if not public.is_pick_control_owner(v_profile)
    or not exists(
      select 1
      from public.profiles profile
      where profile.id=v_profile
        and profile.normalized_name='CODY'
    )
  then
    raise exception 'owner preview unavailable';
  end if;

  v_current_week:=private.football_weekly_auction_week_start(now());
  v_week_start:=v_current_week+7;
  v_subject:=private.football_weekly_auction_subject_for_week(v_week_start);

  if v_subject<>'nfl-build-qb' then
    return jsonb_build_object(
      'available',false,
      'subject_key',v_subject,
      'week_start',v_week_start
    );
  end if;

  -- Intentionally do not call maintain_football_weekly_auction here:
  -- previewing must not lock the future participant field.
  perform private.materialize_football_weekly_auction_week(v_week_start);

  select coalesce(jsonb_agg(jsonb_build_object(
    'slot',board.slot,
    'item_reference',board.season_reference,
    'display_name',qb.display_name,
    'team_code',qb.team_code,
    'trait',board.trait,
    'lock_at',board.lock_at
  ) order by board.slot),'[]'::jsonb)
  into v_cards
  from private.football_weekly_auction_board board
  join private.nfl_build_qb_v2_authority qb
    on qb.item_reference=board.season_reference
  where board.week_start=v_week_start
    and board.day_index=1;

  if jsonb_array_length(v_cards)<>4 then
    raise exception 'NFL Build a QB owner preview did not materialize four Day 1 cards';
  end if;

  return jsonb_build_object(
    'available',true,
    'subject_key','nfl-build-qb',
    'week_start',v_week_start,
    'week_end',v_week_start+6,
    'day_index',1,
    'bankroll',40,
    'owned_count',0,
    'reserve_floor',0,
    'max_commit',40,
    'submitted_today',false,
    'show_intro',false,
    'teams',v_cards,
    'bids','{}'::jsonb,
    'trait_passes',jsonb_build_object(
      'Arm',false,
      'Accuracy',false,
      'Processing',false,
      'Mobility',false
    ),
    'prior_results','[]'::jsonb,
    'collection','[]'::jsonb,
    'previous_final',null
  );
end;
$$;

revoke all on function public.get_my_football_weekly_build_qb_preview() from public,anon;
grant execute on function public.get_my_football_weekly_build_qb_preview() to authenticated;
