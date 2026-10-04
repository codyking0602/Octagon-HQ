-- HQ Impostor rollout: preserve the Sep 29 and Oct 6 Auction weeks,
-- then make Impostor the Oct 13-19 Featured Challenge.
-- Creation and the pre-Daily requirement are server-owned.

create or replace function private.hq_impostor_v1_window_open(p_at timestamptz default now())
returns boolean
language sql
immutable
set search_path = ''
as $$
  select (p_at at time zone 'America/Chicago')::date >= date '2026-10-13'
     and (p_at at time zone 'America/Chicago')::date < date '2026-10-20';
$$;

create or replace function private.guard_hq_impostor_v1_launch_window()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.hq_impostor_v1_window_open(new.created_at) then
    raise exception 'HQ Impostor opens October 13.';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_hq_impostor_v1_launch_window
  on private.hq_impostor_events;

create trigger guard_hq_impostor_v1_launch_window
before insert on private.hq_impostor_events
for each row
execute function private.guard_hq_impostor_v1_launch_window();

create or replace function public.create_hq_impostor_event(p_member_names text[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_at timestamptz := now();
begin
  if not private.hq_impostor_v1_window_open(v_at) then
    if (v_at at time zone 'America/Chicago')::date < date '2026-10-13' then
      raise exception 'HQ Impostor opens October 13.';
    end if;
    raise exception 'The October HQ Impostor Featured Challenge has closed.';
  end if;

  return private.create_hq_impostor_event(p_member_names,v_at);
end;
$$;

-- The browser must enter through the dated public wrapper.
revoke execute on function private.create_hq_impostor_event(text[],timestamptz) from authenticated;
revoke all on function public.create_hq_impostor_event(text[]) from public,anon;
grant execute on function public.create_hq_impostor_event(text[]) to authenticated;

create or replace function private.hq_impostor_daily_gate(
  p_profile_id uuid,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id uuid;
  v_event_status text;
  v_round_no integer;
  v_round_status text;
  v_action_active boolean;
  v_clue_submitted_at timestamptz;
  v_required boolean := true;
begin
  if p_profile_id is null then raise exception 'profile required'; end if;

  if not private.hq_impostor_v1_window_open(p_at) then
    return jsonb_build_object(
      'required', false,
      'available', false,
      'featured_challenge', 'hq-impostor'
    );
  end if;

  select event.id,event.status
  into v_event_id,v_event_status
  from private.hq_impostor_events event
  join private.hq_impostor_participants participant
    on participant.event_id=event.id
  where participant.profile_id=p_profile_id
  order by
    case when event.status='active' then 0 else 1 end,
    event.created_at desc
  limit 1;

  if v_event_id is null then
    return jsonb_build_object(
      'required', true,
      'available', true,
      'featured_challenge', 'hq-impostor',
      'starts_on', date '2026-10-13'
    );
  end if;

  if v_event_status <> 'active' then
    return jsonb_build_object(
      'required', false,
      'available', true,
      'featured_challenge', 'hq-impostor',
      'event_id', v_event_id,
      'completed', true
    );
  end if;

  perform private.maintain_hq_impostor_event(v_event_id,p_at);

  select event.status into v_event_status
  from private.hq_impostor_events event
  where event.id=v_event_id;

  if v_event_status <> 'active' then
    return jsonb_build_object(
      'required', false,
      'available', true,
      'featured_challenge', 'hq-impostor',
      'event_id', v_event_id,
      'completed', true
    );
  end if;

  select round.round_no,round.status,action.active,action.clue_submitted_at
  into v_round_no,v_round_status,v_action_active,v_clue_submitted_at
  from private.hq_impostor_rounds round
  join private.hq_impostor_actions action
    on action.event_id=round.event_id
   and action.round_no=round.round_no
   and action.profile_id=p_profile_id
  where round.event_id=v_event_id
    and round.status in ('clue','vote')
  order by round.round_no
  limit 1;

  if v_round_no is null then
    v_required:=false;
  elsif v_round_status='clue'
    and coalesce(v_action_active,false)
    and v_clue_submitted_at is null then
    v_required:=true;
  else
    v_required:=false;
  end if;

  return jsonb_build_object(
    'required', v_required,
    'available', true,
    'featured_challenge', 'hq-impostor',
    'event_id', v_event_id,
    'round_no', v_round_no,
    'round_status', v_round_status
  );
end;
$$;

create or replace function public.football_weekly_auction_daily_gate(
  p_profile_id uuid,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_week_start date;
  v_day integer;
  v_subject text;
  v_required boolean;
  v_field_locked boolean;
  v_capacity integer:=null;
  v_field_size integer:=null;
begin
  if p_profile_id is null then raise exception 'profile required'; end if;

  if private.hq_impostor_v1_window_open(p_at) then
    return private.hq_impostor_daily_gate(p_profile_id,p_at);
  end if;

  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then
    return jsonb_build_object('required',false,'available',false);
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day:=private.football_weekly_auction_day_index(p_at,v_week_start);
  perform private.ensure_football_weekly_auction_participant(v_week_start,p_profile_id,p_at);

  select field_locked_at is not null,subject_key
  into v_field_locked,v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject='cfb-superteam' then
    v_capacity:=private.football_weekly_superteam_join_capacity(v_week_start,p_at);
    select count(*)::integer into v_field_size
    from private.football_weekly_auction_participants
    where week_start=v_week_start;
  end if;

  if not exists(
    select 1 from private.football_weekly_auction_participants
    where week_start=v_week_start and profile_id=p_profile_id
  ) then
    return jsonb_build_object(
      'required',false,'available',false,'field_locked',v_field_locked,
      'capacity_reached',coalesce(v_capacity is not null and v_field_size>=v_capacity,false),
      'week_start',v_week_start,'day_index',v_day,'eligible_week_start',v_week_start+7
    );
  end if;

  if v_subject='nfl-best-team-seasons-since-2000' and v_day>=7 then
    select not exists(
      select 1
      from private.football_weekly_nfl_team_season_wildcard_submissions
      where week_start=v_week_start and profile_id=p_profile_id
    ) into v_required;
  else
    select not exists(
      select 1 from private.football_weekly_auction_daily_entries
      where week_start=v_week_start and day_index=v_day and profile_id=p_profile_id
    ) into v_required;
  end if;

  return jsonb_build_object(
    'required',v_required,'available',true,'field_locked',v_field_locked,
    'week_start',v_week_start,'day_index',least(greatest(v_day,1),7)
  );
end;
$$;

revoke all on function private.hq_impostor_v1_window_open(timestamptz) from public,anon,authenticated;
revoke all on function private.guard_hq_impostor_v1_launch_window() from public,anon,authenticated;
revoke all on function private.hq_impostor_daily_gate(uuid,timestamptz) from public,anon,authenticated;

comment on function public.create_hq_impostor_event(text[]) is
  'Creates HQ Impostor only during the Oct 13-19, 2026 Featured Challenge window. Sep 29-Oct 5 and Oct 6-12 remain Weekly Auction weeks.';
comment on function private.hq_impostor_daily_gate(uuid,timestamptz) is
  'Oct 13-19 Featured Challenge gate. A player clears the Daily gate after submitting the current HQ Impostor blind clue; voting remains an asynchronous follow-up.';
comment on function public.football_weekly_auction_daily_gate(uuid,timestamptz) is
  'Server-owned Football pre-Daily gate. Weekly Auction remains authoritative except Oct 13-19, 2026, when HQ Impostor replaces it.';
