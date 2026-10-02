begin;

select set_config('request.jwt.claim.role','service_role',true);

do $nfl_team_season_full_flow$
declare
  v_week date:=date '2026-10-06';
  v_profiles uuid[]:=array[
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid(),
    extensions.gen_random_uuid()
  ];
  v_entries integer[]:=array[0,1,2,4,5];
  v_day integer;
  v_slot integer;
  v_player integer;
  v_winner_index integer;
  v_bids jsonb;
  v_submit_at timestamptz;
  v_resolve_at timestamptz;
  v_wildcard_refs text[];
  v_reaped uuid;
  v_count integer;
begin
  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,
    created_at,updated_at,raw_user_meta_data
  )
  select
    v_profiles[i],
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'nfl-weekly-flow-'||i||'@login.octagon-hq.app',
    '',
    now(),now(),now(),
    jsonb_build_object('display_name','NFL WEEKLY FLOW '||i,'historical_unclaimed',true)
  from generate_series(1,5) i;

  for v_player in 1..5 loop
    perform public.register_unclaimed_pin_profile(
      v_profiles[v_player],
      'NFL Weekly Flow '||v_player,
      'N'||v_player
    );
  end loop;

  perform private.materialize_football_weekly_auction_week(v_week);

  insert into private.football_weekly_auction_participants(
    week_start,profile_id,locked_at,source
  )
  select
    v_week,
    v_profiles[i],
    ((v_week::timestamp at time zone 'America/Chicago')-interval '1 minute'),
    'sql_full_flow'
  from generate_series(1,5) i;

  -- Days 1-5 normally rotate four winners. On Day 5, the card Player 1 would
  -- have won is redirected to Player 4, leaving Player 1 at three teams and
  -- Player 4 at the five-normal-team cap. Day 6 is a full pass, supplying
  -- exposed unclaimed inventory for the real post-Wildcard completion path.
  for v_day in 1..6 loop
    if private.football_weekly_auction_cards_for_day(v_week,v_day)<>4 then
      raise exception 'expected four exposed normal cards on day %, got %',
        v_day,private.football_weekly_auction_cards_for_day(v_week,v_day);
    end if;

    v_submit_at:=((v_week+(v_day-1))+time '12:00')
      at time zone 'America/Chicago';

    for v_player in 1..5 loop
      v_bids:='{}'::jsonb;
      for v_slot in 1..4 loop
        v_winner_index:=mod(v_day+v_slot-2,5)+1;
        if v_day=5 and v_winner_index=1 then
          v_winner_index:=4;
        end if;
        v_bids:=jsonb_set(
          v_bids,
          array[v_slot::text],
          to_jsonb(case
            when v_day<=5 and v_player=v_winner_index then 5
            else 0
          end),
          true
        );
      end loop;

      perform private.submit_football_weekly_nfl_team_season_bids_for_profile(
        v_week,v_day,v_profiles[v_player],v_bids,v_submit_at
      );
    end loop;

    v_resolve_at:=((v_week+v_day)+time '00:00:01')
      at time zone 'America/Chicago';
    perform private.resolve_football_weekly_nfl_team_season_day(
      v_week,v_day,v_resolve_at
    );

    if (
      select count(*)
      from private.football_weekly_auction_awards
      where week_start=v_week and day_index=v_day
    )<>4 then
      raise exception 'normal day % did not resolve exactly four exposed cards',v_day;
    end if;
  end loop;

  if (
    select count(*) from private.football_weekly_auction_awards
    where week_start=v_week and profile_id=v_profiles[1] and day_index between 1 and 6
  )<>3 then
    raise exception 'Player 1 must enter the finale with exactly three normal teams';
  end if;

  if (
    select count(*) from private.football_weekly_auction_awards
    where week_start=v_week and profile_id=v_profiles[4] and day_index between 1 and 6
  )<>5 then
    raise exception 'Player 4 must exercise the five-normal-team cap in the proof';
  end if;

  if exists(
    select participant.profile_id
    from private.football_weekly_auction_participants participant
    left join private.football_weekly_auction_awards award
      on award.week_start=participant.week_start
     and award.profile_id=participant.profile_id
     and award.day_index between 1 and 6
    where participant.week_start=v_week
      and participant.profile_id not in (v_profiles[1],v_profiles[4])
    group by participant.profile_id
    having count(award.profile_id)<>4
  ) then
    raise exception 'middle proof seats must enter the finale with exactly four normal teams';
  end if;

  perform private.materialize_football_weekly_nfl_team_season_wildcard(v_week);

  select array_agg(board.item_reference order by board.slot)
  into v_wildcard_refs
  from private.football_weekly_nfl_team_season_wildcard_board board
  where board.week_start=v_week;

  if coalesce(array_length(v_wildcard_refs,1),0)<>4 then
    raise exception 'Wildcard finale did not materialize exactly four teams';
  end if;

  v_submit_at:=((v_week+6)+time '12:00')
    at time zone 'America/Chicago';

  for v_player in 1..5 loop
    perform private.submit_football_weekly_nfl_team_season_wildcard(
      v_week,
      v_profiles[v_player],
      v_entries[v_player],
      case when v_entries[v_player]=0 then array[]::text[] else v_wildcard_refs end,
      v_submit_at
    );
  end loop;

  -- Early unanimous submission must not resolve before the actual Day 7 lock.
  perform private.resolve_football_weekly_nfl_team_season_wildcard(
    v_week,
    ((v_week+6)+time '18:00') at time zone 'America/Chicago'
  );

  if exists(
    select 1
    from private.football_weekly_nfl_team_season_wildcard_resolutions
    where week_start=v_week
  ) then
    raise exception 'Wildcard resolved before its midnight CT lock';
  end if;

  v_resolve_at:=((v_week+7)+time '00:00:01')
    at time zone 'America/Chicago';

  -- The first request after Monday can be a Tuesday request for the next
  -- calendar auction week. The maintainer must still finish the prior NFL
  -- finale from its persisted submissions without rerolling either wheel.
  perform private.maintain_football_weekly_auction(v_resolve_at);

  if not exists(
    select 1
    from private.football_weekly_auction_weeks week
    where week.week_start=v_week
      and week.finalized_at is not null
  ) then
    raise exception 'Tuesday rollover did not finalize the prior NFL Team-Seasons week';
  end if;

  select count(*)::integer into v_count
  from private.football_weekly_nfl_team_season_wildcard_priority_draws
  where week_start=v_week;
  if v_count<>4 then
    raise exception 'Priority wheel should draw four positive-entry players, got %',v_count;
  end if;

  if exists(
    select 1
    from private.football_weekly_nfl_team_season_wildcard_priority_draws
    where week_start=v_week and profile_id=v_profiles[1]
  ) then
    raise exception 'zero-entry player appeared on the Priority wheel';
  end if;

  select reaping.profile_id into v_reaped
  from private.football_weekly_nfl_team_season_wildcard_reapings reaping
  where reaping.week_start=v_week;

  if v_reaped is null or v_reaped=v_profiles[1] then
    raise exception 'Reaping must choose exactly one positive-entry player';
  end if;

  if not exists(
    select 1
    from private.football_weekly_auction_bankroll_adjustments adjustment
    where adjustment.week_start=v_week+7
      and adjustment.profile_id=v_reaped
      and adjustment.adjustment_kind='wildcard_reaping'
      and adjustment.amount_delta=-5
      and adjustment.source_week_start=v_week
  ) then
    raise exception 'Reaping did not persist the next-calendar-week -$5 adjustment';
  end if;

  if private.football_weekly_auction_starting_bankroll(v_week+7,v_reaped,40)<>35 then
    raise exception 'Reaped player did not start the next CFB Weekly Auction at $35';
  end if;

  if private.football_weekly_auction_starting_bankroll(v_week+7,v_profiles[1],40)<>40 then
    raise exception 'zero-entry player was incorrectly penalized next week';
  end if;

  if (
    select count(*)
    from private.football_weekly_nfl_team_season_autofill fill
    where fill.week_start=v_week and fill.profile_id=v_profiles[1]
  )<>1 then
    raise exception 'three-team zero-entry player did not receive exactly one completion autofill';
  end if;

  if exists(
    select 1
    from private.football_weekly_nfl_team_season_autofill fill
    join private.football_weekly_auction_board board
      on board.week_start=fill.week_start
     and board.season_reference=fill.item_reference
    where fill.week_start=v_week
      and fill.profile_id=v_profiles[1]
      and board.slot>private.football_weekly_auction_cards_for_day(
        board.week_start,board.day_index
      )
  ) then
    raise exception 'completion autofill used a hidden reserve card that never appeared';
  end if;

  if (select count(*) from private.football_weekly_auction_results where week_start=v_week)<>5 then
    raise exception 'full flow did not finalize all five players';
  end if;

  if exists(
    select 1
    from private.football_weekly_auction_results result
    where result.week_start=v_week
      and (
        result.owned_count<4
        or result.final_score is null
        or coalesce(array_length(result.scoring_refs,1),0)<>4
      )
  ) then
    raise exception 'full flow finalized an incomplete or non-best-four collection';
  end if;

  -- If a Wildcard was claimed, it must be a true fourth-team upgrade.
  if exists(
    select 1
    from private.football_weekly_nfl_team_season_wildcard_claims claim
    join private.football_weekly_auction_items wildcard_item
      on wildcard_item.item_reference=claim.item_reference
    join private.football_weekly_auction_items replaced_item
      on replaced_item.item_reference=claim.replaced_item_reference
    where claim.week_start=v_week
      and wildcard_item.hidden_grade<=replaced_item.hidden_grade
  ) then
    raise exception 'Wildcard claim did not strictly improve the replaced scoring team';
  end if;
end;
$nfl_team_season_full_flow$;

rollback;

\echo 'NFL Team-Seasons normal-days through Wildcard/Reaping full-flow proof passed.'
