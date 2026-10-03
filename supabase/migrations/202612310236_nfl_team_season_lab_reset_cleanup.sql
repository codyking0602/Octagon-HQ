-- Let the owner NFL Team-Seasons lab reset after a completed Day 7.
-- Wildcard claims intentionally RESTRICT deletion of their board items, so the
-- lab must clear its isolated finale children before deleting the shadow week.

create or replace function private.reset_football_weekly_nfl_team_season_lab(p_owner uuid)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_old_week date;
  v_run integer;
  v_week date;
  v_seat integer:=1;
  v_candidate record;
begin
  -- Reuse the existing locked owner identity contract.
  if p_owner<>private.football_weekly_superteam_lab_owner() then
    raise exception 'NFL Team-Seasons Playthrough Lab is owner-only';
  end if;

  select lab_week_start,run_number into v_old_week,v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=p_owner
  for update;

  if found then
    delete from private.football_weekly_auction_bankroll_adjustments
    where source_week_start=v_old_week;
    delete from private.football_weekly_nfl_team_season_wildcard_claims
    where week_start=v_old_week;
    delete from private.football_weekly_nfl_team_season_wildcard_priority_draws
    where week_start=v_old_week;
    delete from private.football_weekly_nfl_team_season_wildcard_rankings
    where week_start=v_old_week;
    delete from private.football_weekly_nfl_team_season_wildcard_reapings
    where week_start=v_old_week;
    delete from private.football_weekly_nfl_team_season_wildcard_resolutions
    where week_start=v_old_week;
    delete from private.football_weekly_nfl_team_season_autofill
    where week_start=v_old_week;
    delete from private.football_weekly_nfl_team_season_wildcard_submissions
    where week_start=v_old_week;
    delete from private.football_weekly_auction_weeks
    where week_start=v_old_week;
    v_run:=case when v_run>=2000 then 1 else v_run+1 end;
    v_week:=private.football_weekly_nfl_team_season_lab_week_start(v_run);
    delete from private.football_weekly_auction_bankroll_adjustments
    where source_week_start=v_week;
    delete from private.football_weekly_nfl_team_season_wildcard_claims
    where week_start=v_week;
    delete from private.football_weekly_nfl_team_season_wildcard_priority_draws
    where week_start=v_week;
    delete from private.football_weekly_nfl_team_season_wildcard_rankings
    where week_start=v_week;
    delete from private.football_weekly_nfl_team_season_wildcard_reapings
    where week_start=v_week;
    delete from private.football_weekly_nfl_team_season_wildcard_resolutions
    where week_start=v_week;
    delete from private.football_weekly_nfl_team_season_autofill
    where week_start=v_week;
    delete from private.football_weekly_nfl_team_season_wildcard_submissions
    where week_start=v_week;
    delete from private.football_weekly_auction_weeks where week_start=v_week;
    update private.football_weekly_nfl_team_season_lab_runs
    set run_number=v_run,lab_week_start=v_week,current_day=1,final_payloads=null,updated_at=now()
    where owner_profile_id=p_owner;
    delete from private.football_weekly_nfl_team_season_lab_seats
    where owner_profile_id=p_owner;
  else
    v_run:=1;
    v_week:=private.football_weekly_nfl_team_season_lab_week_start(v_run);
    delete from private.football_weekly_auction_bankroll_adjustments
    where source_week_start=v_week;
    delete from private.football_weekly_auction_weeks where week_start=v_week;
    insert into private.football_weekly_nfl_team_season_lab_runs(
      owner_profile_id,run_number,lab_week_start,current_day
    ) values(p_owner,v_run,v_week,1);
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(v_week,'nfl-best-team-seasons-since-2000');

  perform private.materialize_football_weekly_nfl_team_season_week(v_week);

  insert into private.football_weekly_nfl_team_season_lab_seats(
    owner_profile_id,seat_index,profile_id
  ) values(p_owner,1,p_owner);

  for v_candidate in
    with recent as (
      select participant.profile_id,max(participant.week_start) as last_week
      from private.football_weekly_auction_participants participant
      join public.profiles profile on profile.id=participant.profile_id
      where participant.week_start>=date '2026-09-15'
        and participant.week_start<date '2026-12-31'
        and participant.profile_id<>p_owner
        and profile.normalized_name not like 'TEST%'
      group by participant.profile_id
    )
    select recent.profile_id
    from recent
    join public.profiles profile on profile.id=recent.profile_id
    order by recent.last_week desc,lower(profile.display_name),recent.profile_id
    limit 4
  loop
    v_seat:=v_seat+1;
    insert into private.football_weekly_nfl_team_season_lab_seats(
      owner_profile_id,seat_index,profile_id
    ) values(p_owner,v_seat,v_candidate.profile_id);
  end loop;

  if v_seat<5 then
    for v_candidate in
      select profile.id as profile_id
      from public.profiles profile
      where profile.id<>p_owner
        and profile.normalized_name not like 'TEST%'
        and not exists(
          select 1 from private.football_weekly_nfl_team_season_lab_seats seat
          where seat.owner_profile_id=p_owner and seat.profile_id=profile.id
        )
      order by profile.created_at,profile.id
      limit (5-v_seat)
    loop
      v_seat:=v_seat+1;
      insert into private.football_weekly_nfl_team_season_lab_seats(
        owner_profile_id,seat_index,profile_id
      ) values(p_owner,v_seat,v_candidate.profile_id);
    end loop;
  end if;

  if v_seat<>5 then
    raise exception 'NFL Team-Seasons Playthrough Lab needs five available non-test profiles';
  end if;

  insert into private.football_weekly_auction_participants(
    week_start,profile_id,locked_at,source
  )
  select
    v_week,seat.profile_id,
    ((v_week::timestamp at time zone 'America/Chicago')-interval '1 minute'),
    'owner_lab'
  from private.football_weekly_nfl_team_season_lab_seats seat
  where seat.owner_profile_id=p_owner;

  if private.football_weekly_auction_cards_for_day(v_week,1)<>4 then
    raise exception 'Five-player NFL Team-Seasons lab must expose four normal cards';
  end if;
end;
$$;

revoke all on function private.reset_football_weekly_nfl_team_season_lab(uuid)
  from public,anon,authenticated;

do $nfl_lab_reset_cleanup_contract$
begin
  if position(
    'delete from private.football_weekly_nfl_team_season_wildcard_claims'
    in pg_get_functiondef(
      'private.reset_football_weekly_nfl_team_season_lab(uuid)'::regprocedure
    )
  )=0 then
    raise exception 'NFL Team-Seasons lab reset must clear resolved Wildcard claims first';
  end if;
end;
$nfl_lab_reset_cleanup_contract$;
