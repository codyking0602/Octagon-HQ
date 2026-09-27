-- Keep owner-only CFB Superteam playthrough weeks isolated from normal Weekly Auction maintenance
-- and expose a sealed-bid-safe Auction Table for both live play and the owner lab.

create or replace function private.maintain_football_weekly_auction(p_at timestamptz default now())
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_week_start date;
  v_subject text;
  v_join_lock_at timestamptz;
  v_due record;
  v_week record;
begin
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then return; end if;

  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.materialize_football_weekly_auction_week(v_week_start);
  perform private.materialize_football_weekly_auction_participants(v_week_start);

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  select min(board.lock_at) into v_join_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=v_week_start
    and board.day_index=case when v_subject='cfb-superteam' then 4 else 1 end;

  if v_join_lock_at is null then
    raise exception 'Weekly Auction join boundary is incomplete';
  end if;

  if p_at>=v_join_lock_at then
    update private.football_weekly_auction_weeks week
    set field_locked_at=coalesce(week.field_locked_at,v_join_lock_at)
    where week.week_start=v_week_start;
  end if;

  for v_due in
    select board.week_start,board.day_index
    from private.football_weekly_auction_board board
    where not exists(
      select 1
      from private.football_weekly_superteam_lab_runs lab
      where lab.lab_week_start=board.week_start
    )
    group by board.week_start,board.day_index
    having min(board.lock_at)<=p_at
       and (
         select count(*)
         from private.football_weekly_auction_awards award
         where award.week_start=board.week_start
           and award.day_index=board.day_index
       ) < private.football_weekly_auction_cards_for_day(
         board.week_start,board.day_index
       )
    order by board.week_start,board.day_index
  loop
    perform private.resolve_football_weekly_auction_day(
      v_due.week_start,v_due.day_index,p_at
    );
  end loop;

  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and not exists(
        select 1
        from private.football_weekly_superteam_lab_runs lab
        where lab.lab_week_start=week.week_start
      )
      and (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start=week.week_start
      )=private.football_weekly_auction_cards_per_week(week.week_start)
  loop
    perform private.finalize_football_weekly_auction_week(v_week.week_start,p_at);
  end loop;
end;
$$;
revoke all on function private.maintain_football_weekly_auction(timestamptz)
  from public,anon,authenticated;

create or replace function private.football_weekly_superteam_table_payload(
  p_week_start date,
  p_current_profile uuid
)
returns jsonb
language sql
stable
security definer
set search_path=''
as $$
  with participants as (
    select participant.profile_id
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
  ),
  summaries as (
    select
      participant.profile_id,
      profile.display_name,
      participant.profile_id=p_current_profile as is_current_user,
      50-coalesce(sum(award.winning_bid) filter(where award.roster_slot is not null),0)::integer as bankroll,
      count(award.roster_slot)::integer as owned_count,
      coalesce(
        jsonb_agg(jsonb_build_object(
          'item_reference',authority.item_reference,
          'display_name',authority.display_name,
          'school',authority.school,
          'season_year',authority.season_year,
          'group_key',authority.group_key,
          'roster_slot',award.roster_slot,
          'price_paid',award.winning_bid
        ) order by array_position(
          array['QB','RB','WR','Flex','Front Seven','Secondary','Head Coach']::text[],
          award.roster_slot
        )) filter(where award.roster_slot is not null),
        '[]'::jsonb
      ) as roster
    from participants participant
    join public.profiles profile on profile.id=participant.profile_id
    left join private.football_weekly_auction_awards award
      on award.week_start=p_week_start
     and award.profile_id=participant.profile_id
    left join private.football_weekly_auction_board board
      on board.week_start=award.week_start
     and board.day_index=award.day_index
     and board.slot=award.slot
    left join private.cfb_superteam_v1_authority authority
      on authority.item_reference=board.season_reference
    group by participant.profile_id,profile.display_name
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'profile_id',summary.profile_id,
    'display_name',summary.display_name,
    'is_current_user',summary.is_current_user,
    'bankroll',summary.bankroll,
    'owned_count',summary.owned_count,
    'roster',summary.roster
  ) order by summary.is_current_user desc,lower(summary.display_name),summary.profile_id),'[]'::jsonb)
  from summaries summary;
$$;
revoke all on function private.football_weekly_superteam_table_payload(date,uuid)
  from public,anon,authenticated;

create or replace function public.get_football_weekly_superteam_table(
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_subject text;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject<>'cfb-superteam' then return '[]'::jsonb; end if;

  return private.football_weekly_superteam_table_payload(v_week_start,v_profile);
end;
$$;
revoke all on function public.get_football_weekly_superteam_table(timestamptz)
  from public,anon;
grant execute on function public.get_football_weekly_superteam_table(timestamptz)
  to authenticated;

create or replace function public.get_my_football_weekly_superteam_lab_table(
  p_seat_index integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_week_start date;
  v_profile uuid;
begin
  v_owner:=private.football_weekly_superteam_lab_owner();

  if p_seat_index not between 1 and 6 then
    raise exception 'Lab seat must be between 1 and 6';
  end if;

  select lab.lab_week_start
  into v_week_start
  from private.football_weekly_superteam_lab_runs lab
  where lab.owner_profile_id=v_owner;

  select seat.profile_id
  into v_profile
  from private.football_weekly_superteam_lab_seats seat
  where seat.owner_profile_id=v_owner
    and seat.seat_index=p_seat_index;

  if v_week_start is null or v_profile is null then
    raise exception 'Weekly Auction Playthrough Lab is not initialized';
  end if;

  return private.football_weekly_superteam_table_payload(v_week_start,v_profile);
end;
$$;
revoke all on function public.get_my_football_weekly_superteam_lab_table(integer)
  from public,anon;
grant execute on function public.get_my_football_weekly_superteam_lab_table(integer)
  to authenticated;

-- Any lab week that was already swept by normal maintenance is disposable QA
-- state. Rebuild it now so every seat starts Day 1 with 0/7 and $50.
do $repair_existing_superteam_labs$
declare
  v_lab record;
begin
  for v_lab in
    select owner_profile_id
    from private.football_weekly_superteam_lab_runs
  loop
    perform private.reset_football_weekly_superteam_lab(v_lab.owner_profile_id);
  end loop;
end;
$repair_existing_superteam_labs$;

do $superteam_lab_realism_contract$
declare
  v_maintain text;
  v_table text;
begin
  v_maintain:=pg_get_functiondef(
    'private.maintain_football_weekly_auction(timestamptz)'::regprocedure
  );
  if position('football_weekly_superteam_lab_runs' in v_maintain)=0 then
    raise exception 'Weekly Auction maintenance no longer excludes owner lab weeks';
  end if;

  v_table:=pg_get_functiondef(
    'private.football_weekly_superteam_table_payload(date,uuid)'::regprocedure
  );
  if position('football_weekly_auction_bids' in v_table)>0
    or position('hidden_grade' in v_table)>0
  then
    raise exception 'CFB Superteam Auction Table must not expose sealed bids or hidden grades';
  end if;
end;
$superteam_lab_realism_contract$;
