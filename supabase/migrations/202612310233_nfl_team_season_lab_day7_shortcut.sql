-- Owner-only Day 7 shortcut for the isolated NFL Team-Seasons playthrough lab.
-- Seeds a fresh five-seat shadow week through the real Days 1-6 submit/resolve
-- engines, leaving every seat with four normal wins so Wildcard/Reaping can be
-- tested immediately. Live competition rows are never touched.

create or replace function public.jump_my_football_weekly_nfl_team_season_lab_to_day7(
  p_seat_index integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_run private.football_weekly_nfl_team_season_lab_runs%rowtype;
  v_day integer;
  v_card_count integer;
  v_skip_seat integer;
  v_target_slot integer;
  v_next_slot integer;
  v_seat record;
  v_bids jsonb;
  v_submit_at timestamptz;
  v_resolve_at timestamptz;
  v_owned integer;
begin
  v_owner:=private.football_weekly_superteam_lab_owner();
  if auth.uid() is distinct from v_owner then
    raise exception 'NFL Team-Seasons Playthrough Lab is owner-only';
  end if;
  if p_seat_index not between 1 and 5 then
    raise exception 'Lab seat must be between 1 and 5';
  end if;

  -- Always start from a fresh isolated run so the shortcut is repeatable and
  -- cannot inherit a partially submitted QA state.
  perform private.reset_football_weekly_nfl_team_season_lab(v_owner);

  select * into v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=v_owner
  for update;

  for v_day in 1..6 loop
    v_card_count:=private.football_weekly_auction_cards_for_day(
      v_run.lab_week_start,v_day
    );
    if v_card_count<4 then
      raise exception 'Day 7 shortcut requires at least four visible cards on Day %',v_day;
    end if;

    -- Across Days 1-5 one different seat sits out each day. The other four
    -- seats each make the only positive $1 bid on a different visible card.
    -- That guarantees exactly four legitimate normal wins per seat before Day 7.
    v_skip_seat:=case when v_day<=5 then 1+mod(v_day-1,5) else 0 end;
    v_next_slot:=0;

    for v_seat in
      select seat.seat_index,seat.profile_id
      from private.football_weekly_nfl_team_season_lab_seats seat
      where seat.owner_profile_id=v_owner
      order by seat.seat_index
    loop
      v_target_slot:=0;
      if v_day<=5 and v_seat.seat_index<>v_skip_seat then
        v_next_slot:=v_next_slot+1;
        v_target_slot:=v_next_slot;
      end if;

      select jsonb_object_agg(
        slot_number::text,
        jsonb_build_object(
          'amount',case when slot_number=v_target_slot then 1 else 0 end,
          'priority',slot_number
        )
        order by slot_number
      )
      into v_bids
      from generate_series(1,v_card_count) slot_number;

      v_submit_at:=(
        (v_run.lab_week_start+(v_day-1))::date+time '12:00'
      ) at time zone 'America/Chicago';

      perform private.submit_football_weekly_nfl_team_season_bids_for_profile(
        v_run.lab_week_start,
        v_day,
        v_seat.profile_id,
        v_bids,
        v_submit_at
      );
    end loop;

    v_resolve_at:=(
      (v_run.lab_week_start+v_day)::date+time '00:01'
    ) at time zone 'America/Chicago';

    perform private.resolve_football_weekly_nfl_team_season_day(
      v_run.lab_week_start,v_day,v_resolve_at
    );
  end loop;

  for v_seat in
    select seat.seat_index,seat.profile_id
    from private.football_weekly_nfl_team_season_lab_seats seat
    where seat.owner_profile_id=v_owner
    order by seat.seat_index
  loop
    select count(*)::integer into v_owned
    from private.football_weekly_auction_awards award
    where award.week_start=v_run.lab_week_start
      and award.day_index between 1 and 6
      and award.profile_id=v_seat.profile_id;

    if v_owned<>4 then
      raise exception 'Day 7 shortcut expected seat % to own four normal teams, got %',
        v_seat.seat_index,v_owned;
    end if;
  end loop;

  update private.football_weekly_nfl_team_season_lab_runs
  set current_day=7,updated_at=now()
  where owner_profile_id=v_owner;

  perform private.materialize_football_weekly_nfl_team_season_wildcard(
    v_run.lab_week_start
  );

  return private.football_weekly_nfl_team_season_lab_state(
    v_owner,p_seat_index
  );
end;
$$;
revoke all on function public.jump_my_football_weekly_nfl_team_season_lab_to_day7(integer)
  from public,anon;
grant execute on function public.jump_my_football_weekly_nfl_team_season_lab_to_day7(integer)
  to authenticated;
