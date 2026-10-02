-- NFL Team-Seasons Weekly Auction Day 7 Wildcard / Reaping engine.
-- Dormant until the nfl-best-team-seasons-since-2000 subject is wired into rotation.
--
-- Locked product rules:
-- * Day 7 reveals four Wildcard team-seasons before entries are chosen.
-- * Each participant may submit 0-5 literal tickets plus an ordered list of acceptable Wildcards.
-- * Zero tickets means zero Priority chance and zero Reaping risk.
-- * Priority and Reaping both use the same LINEAR ticket weights.
-- * Priority is drawn without replacement; each player can claim at most one Wildcard.
-- * Reaping is a separate weighted draw and can hit an entrant even if that entrant did not claim.
-- * Reaping applies a one-week -$5 starting-bankroll adjustment to the next Weekly Auction.
-- * Reaping never compounds below a single -$5 adjustment for a given next week.
-- * Incomplete collections are completed after Wildcard resolution from the worst unclaimed
--   normal-day team-seasons that actually appeared on Days 1-6.

create table if not exists private.football_weekly_nfl_team_season_wildcard_board (
  week_start date not null
    references private.football_weekly_auction_weeks(week_start)
    on delete cascade,
  slot integer not null check (slot between 1 and 4),
  item_reference text not null
    references private.football_weekly_auction_items(item_reference)
    on delete restrict,
  target_grade numeric(4,1) not null,
  reveal_at timestamptz not null,
  lock_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (week_start, slot),
  unique (week_start, item_reference),
  check (lock_at > reveal_at)
);

create table if not exists private.football_weekly_nfl_team_season_wildcard_submissions (
  week_start date not null,
  profile_id uuid not null,
  entry_count integer not null check (entry_count between 0 and 5),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (week_start, profile_id),
  foreign key (week_start, profile_id)
    references private.football_weekly_auction_participants(week_start, profile_id)
    on delete cascade
);

create table if not exists private.football_weekly_nfl_team_season_wildcard_rankings (
  week_start date not null,
  profile_id uuid not null,
  rank integer not null check (rank between 1 and 4),
  item_reference text not null,
  primary key (week_start, profile_id, rank),
  unique (week_start, profile_id, item_reference),
  foreign key (week_start, profile_id)
    references private.football_weekly_nfl_team_season_wildcard_submissions(week_start, profile_id)
    on delete cascade,
  foreign key (week_start, item_reference)
    references private.football_weekly_nfl_team_season_wildcard_board(week_start, item_reference)
    on delete cascade
);

create table if not exists private.football_weekly_nfl_team_season_wildcard_priority_draws (
  week_start date not null,
  draw_order integer not null check (draw_order >= 1),
  profile_id uuid not null,
  entry_count integer not null check (entry_count between 1 and 5),
  drawn_at timestamptz not null default now(),
  primary key (week_start, draw_order),
  unique (week_start, profile_id),
  foreign key (week_start, profile_id)
    references private.football_weekly_nfl_team_season_wildcard_submissions(week_start, profile_id)
    on delete cascade
);

create table if not exists private.football_weekly_nfl_team_season_wildcard_claims (
  week_start date not null,
  profile_id uuid not null,
  item_reference text not null,
  replaced_item_reference text not null,
  priority_order integer not null check (priority_order >= 1),
  resolved_at timestamptz not null default now(),
  primary key (week_start, profile_id),
  unique (week_start, item_reference),
  foreign key (week_start, profile_id)
    references private.football_weekly_nfl_team_season_wildcard_submissions(week_start, profile_id)
    on delete cascade,
  foreign key (week_start, item_reference)
    references private.football_weekly_nfl_team_season_wildcard_board(week_start, item_reference)
    on delete restrict,
  foreign key (replaced_item_reference)
    references private.football_weekly_auction_items(item_reference)
    on delete restrict
);

create table if not exists private.football_weekly_nfl_team_season_wildcard_reapings (
  week_start date primary key
    references private.football_weekly_auction_weeks(week_start)
    on delete cascade,
  profile_id uuid not null,
  entry_count integer not null check (entry_count between 1 and 5),
  next_week_start date not null,
  bankroll_delta integer not null default -5 check (bankroll_delta = -5),
  resolved_at timestamptz not null default now(),
  foreign key (week_start, profile_id)
    references private.football_weekly_nfl_team_season_wildcard_submissions(week_start, profile_id)
    on delete cascade
);

create table if not exists private.football_weekly_auction_bankroll_adjustments (
  week_start date not null,
  profile_id uuid not null
    references public.profiles(id)
    on delete cascade,
  adjustment_kind text not null,
  amount_delta integer not null,
  source_week_start date,
  created_at timestamptz not null default now(),
  primary key (week_start, profile_id, adjustment_kind),
  check (amount_delta between -50 and 50)
);

create table if not exists private.football_weekly_nfl_team_season_autofill (
  week_start date not null,
  profile_id uuid not null,
  fill_order integer not null check (fill_order >= 1),
  item_reference text not null
    references private.football_weekly_auction_items(item_reference)
    on delete restrict,
  assigned_at timestamptz not null default now(),
  primary key (week_start, profile_id, fill_order),
  unique (week_start, item_reference),
  foreign key (week_start, profile_id)
    references private.football_weekly_auction_participants(week_start, profile_id)
    on delete cascade
);

create table if not exists private.football_weekly_nfl_team_season_wildcard_resolutions (
  week_start date primary key
    references private.football_weekly_auction_weeks(week_start)
    on delete cascade,
  resolved_at timestamptz not null default now()
);

create index if not exists football_weekly_nfl_wildcard_submission_profile_idx
  on private.football_weekly_nfl_team_season_wildcard_submissions(profile_id, week_start);
create index if not exists football_weekly_nfl_wildcard_claim_profile_idx
  on private.football_weekly_nfl_team_season_wildcard_claims(profile_id, week_start);
create index if not exists football_weekly_bankroll_adjustment_profile_idx
  on private.football_weekly_auction_bankroll_adjustments(profile_id, week_start);

revoke all on private.football_weekly_nfl_team_season_wildcard_board
  from public, anon, authenticated;
revoke all on private.football_weekly_nfl_team_season_wildcard_submissions
  from public, anon, authenticated;
revoke all on private.football_weekly_nfl_team_season_wildcard_rankings
  from public, anon, authenticated;
revoke all on private.football_weekly_nfl_team_season_wildcard_priority_draws
  from public, anon, authenticated;
revoke all on private.football_weekly_nfl_team_season_wildcard_claims
  from public, anon, authenticated;
revoke all on private.football_weekly_nfl_team_season_wildcard_reapings
  from public, anon, authenticated;
revoke all on private.football_weekly_auction_bankroll_adjustments
  from public, anon, authenticated;
revoke all on private.football_weekly_nfl_team_season_autofill
  from public, anon, authenticated;
revoke all on private.football_weekly_nfl_team_season_wildcard_resolutions
  from public, anon, authenticated;

-- Deterministic helper for a literal weighted wheel.
-- p_roll is in [0,1); each positive weight owns exactly that share of the wheel.
create or replace function private.football_weekly_auction_weighted_ticket_pick(
  p_profiles uuid[],
  p_weights integer[],
  p_roll double precision
)
returns uuid
language plpgsql
immutable
set search_path=''
as $$
declare
  v_total integer:=0;
  v_threshold double precision;
  v_running integer:=0;
  v_index integer;
begin
  if coalesce(array_length(p_profiles,1),0)=0
    or array_length(p_profiles,1) is distinct from array_length(p_weights,1)
  then
    raise exception 'Weighted wheel requires matching non-empty profile and weight arrays';
  end if;
  if p_roll<0 or p_roll>=1 then
    raise exception 'Weighted wheel roll must be in [0,1)';
  end if;

  for v_index in 1..array_length(p_weights,1) loop
    if p_weights[v_index] <= 0 then
      raise exception 'Weighted wheel accepts positive ticket counts only';
    end if;
    v_total:=v_total+p_weights[v_index];
  end loop;

  v_threshold:=p_roll*v_total;

  for v_index in 1..array_length(p_profiles,1) loop
    v_running:=v_running+p_weights[v_index];
    if v_threshold<v_running then
      return p_profiles[v_index];
    end if;
  end loop;

  return p_profiles[array_length(p_profiles,1)];
end;
$$;
revoke all on function private.football_weekly_auction_weighted_ticket_pick(uuid[],integer[],double precision)
  from public,anon,authenticated;

-- Apply stored one-week adjustments to a subject's normal starting bankroll.
-- The Reaping engine stores a single -5 row for the next calendar auction week,
-- so consecutive Reapings never stack into -10 for one week.
create or replace function private.football_weekly_auction_starting_bankroll(
  p_week_start date,
  p_profile_id uuid,
  p_default integer
)
returns integer
language sql
stable security definer
set search_path=''
as $$
  select greatest(
    p_default + coalesce((
      select sum(adjustment.amount_delta)::integer
      from private.football_weekly_auction_bankroll_adjustments adjustment
      where adjustment.week_start=p_week_start
        and adjustment.profile_id=p_profile_id
    ),0),
    0
  );
$$;
revoke all on function private.football_weekly_auction_starting_bankroll(date,uuid,integer)
  from public,anon,authenticated;

create or replace function private.materialize_football_weekly_nfl_team_season_wildcard(
  p_week_start date
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_subject text;
  v_existing integer;
  v_target numeric;
  v_targets numeric[]:=array[90.5,89.0,87.5,85.5]::numeric[];
  v_refs text[]:=array[]::text[];
  v_selected_groups text[]:=array[]::text[];
  v_ref text;
  v_group text;
  v_index integer;
  v_slot integer:=0;
  v_reveal_at timestamptz:=(p_week_start+6)::timestamp at time zone 'America/Chicago';
  v_lock_at timestamptz:=(p_week_start+7)::timestamp at time zone 'America/Chicago';
begin
  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;

  if v_subject is distinct from 'nfl-best-team-seasons-since-2000' then
    raise exception 'NFL team-season Wildcard can only materialize for its subject week';
  end if;

  select count(*)::integer into v_existing
  from private.football_weekly_nfl_team_season_wildcard_board board
  where board.week_start=p_week_start;

  if v_existing=4 then return; end if;
  if v_existing<>0 then
    raise exception 'NFL team-season Wildcard board is partial; refusing to reroll exposed cards';
  end if;

  for v_index in 1..array_length(v_targets,1) loop
    v_target:=v_targets[v_index];

    select item.item_reference,item.identity_group
    into v_ref,v_group
    from private.football_weekly_auction_items item
    where item.subject_key='nfl-best-team-seasons-since-2000'
      and not (item.item_reference=any(v_refs))
      and not (item.identity_group=any(v_selected_groups))
      and not exists(
        select 1
        from private.football_weekly_auction_board normal_board
        where normal_board.week_start=p_week_start
          and normal_board.day_index between 1 and 6
          and normal_board.season_reference=item.item_reference
      )
    order by abs(item.hidden_grade-v_target)+random()*0.75,
             item.item_reference
    limit 1;

    if v_ref is null then
      raise exception 'Unable to materialize four distinct NFL Wildcard candidates';
    end if;

    v_refs:=array_append(v_refs,v_ref);
    v_selected_groups:=array_append(v_selected_groups,v_group);
  end loop;

  for v_index in
    select idx
    from generate_subscripts(v_refs,1) idx
    order by random()
  loop
    v_slot:=v_slot+1;
    insert into private.football_weekly_nfl_team_season_wildcard_board(
      week_start,slot,item_reference,target_grade,reveal_at,lock_at
    ) values (
      p_week_start,v_slot,v_refs[v_index],v_targets[v_index],v_reveal_at,v_lock_at
    );
  end loop;
end;
$$;
revoke all on function private.materialize_football_weekly_nfl_team_season_wildcard(date)
  from public,anon,authenticated;

create or replace function private.submit_football_weekly_nfl_team_season_wildcard(
  p_week_start date,
  p_profile_id uuid,
  p_entries integer,
  p_rankings text[],
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_subject text;
  v_day integer;
  v_lock_at timestamptz;
  v_owned integer;
  v_ref text;
  v_rank integer:=0;
begin
  if p_profile_id is null then raise exception 'profile required'; end if;
  if p_entries is null or p_entries not between 0 and 5 then raise exception 'Wildcard entries must be between 0 and 5'; end if;
  if coalesce(array_length(p_rankings,1),0)>4 then raise exception 'Wildcard ranking accepts at most four teams'; end if;
  if p_entries>0 and coalesce(array_length(p_rankings,1),0)=0 then
    raise exception 'Wildcard entries require at least one acceptable ranked team';
  end if;
  if coalesce(array_length(p_rankings,1),0)<>coalesce(array_length(array(select distinct unnest(p_rankings)),1),0) then
    raise exception 'Wildcard ranking cannot contain duplicates';
  end if;

  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;
  if v_subject is distinct from 'nfl-best-team-seasons-since-2000' then
    raise exception 'NFL team-season Wildcard is not active this week';
  end if;

  if not exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
      and participant.profile_id=p_profile_id
  ) then
    raise exception 'You are not in this Weekly Auction field';
  end if;

  v_day:=private.football_weekly_auction_day_index(p_at,p_week_start);
  if v_day<>7 then raise exception 'Wildcard entries are only open on Day 7'; end if;

  perform private.materialize_football_weekly_nfl_team_season_wildcard(p_week_start);

  select max(board.lock_at) into v_lock_at
  from private.football_weekly_nfl_team_season_wildcard_board board
  where board.week_start=p_week_start;

  if p_at>=v_lock_at then raise exception 'Wildcard entries are locked'; end if;
  if exists(
    select 1
    from private.football_weekly_nfl_team_season_wildcard_resolutions resolution
    where resolution.week_start=p_week_start
  ) then
    raise exception 'Wildcard has already resolved';
  end if;

  select count(*)::integer into v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=p_week_start
    and award.day_index between 1 and 6
    and award.profile_id=p_profile_id;

  if p_entries>0 and v_owned<4 then
    raise exception 'Wildcard cannot be used to fill an incomplete collection';
  end if;

  foreach v_ref in array coalesce(p_rankings,array[]::text[]) loop
    if not exists(
      select 1
      from private.football_weekly_nfl_team_season_wildcard_board board
      where board.week_start=p_week_start
        and board.item_reference=v_ref
    ) then
      raise exception 'Wildcard ranking contains a team that is not on the four-card board';
    end if;
  end loop;

  insert into private.football_weekly_nfl_team_season_wildcard_submissions(
    week_start,profile_id,entry_count,submitted_at,updated_at
  ) values (
    p_week_start,p_profile_id,p_entries,p_at,p_at
  )
  on conflict(week_start,profile_id)
  do update set
    entry_count=excluded.entry_count,
    updated_at=excluded.updated_at;

  delete from private.football_weekly_nfl_team_season_wildcard_rankings ranking
  where ranking.week_start=p_week_start
    and ranking.profile_id=p_profile_id;

  foreach v_ref in array coalesce(p_rankings,array[]::text[]) loop
    v_rank:=v_rank+1;
    insert into private.football_weekly_nfl_team_season_wildcard_rankings(
      week_start,profile_id,rank,item_reference
    ) values (
      p_week_start,p_profile_id,v_rank,v_ref
    );
  end loop;
end;
$$;
revoke all on function private.submit_football_weekly_nfl_team_season_wildcard(date,uuid,integer,text[],timestamptz)
  from public,anon,authenticated;

create or replace function private.resolve_football_weekly_nfl_team_season_wildcard(
  p_week_start date,
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_subject text;
  v_lock_at timestamptz;
  v_participants integer;
  v_submissions integer;
  v_remaining uuid[];
  v_profiles uuid[];
  v_weights integer[];
  v_pick uuid;
  v_order integer:=0;
  v_draw record;
  v_rank record;
  v_candidate_grade numeric;
  v_replaced_ref text;
  v_replaced_grade numeric;
  v_owned integer;
  v_fill_profile uuid;
  v_fill_needed integer;
  v_fill_order integer;
  v_fill_ref text;
begin
  if exists(
    select 1
    from private.football_weekly_nfl_team_season_wildcard_resolutions resolution
    where resolution.week_start=p_week_start
  ) then
    return;
  end if;

  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;
  if v_subject is distinct from 'nfl-best-team-seasons-since-2000' then
    raise exception 'NFL team-season Wildcard is not active this week';
  end if;

  perform private.materialize_football_weekly_nfl_team_season_wildcard(p_week_start);

  select max(board.lock_at) into v_lock_at
  from private.football_weekly_nfl_team_season_wildcard_board board
  where board.week_start=p_week_start;

  select count(*)::integer into v_participants
  from private.football_weekly_auction_participants participant
  where participant.week_start=p_week_start;

  select count(*)::integer into v_submissions
  from private.football_weekly_nfl_team_season_wildcard_submissions submission
  where submission.week_start=p_week_start;

  -- Entries stay sealed and editable for the whole Day 7 window. Merely having
  -- every participant submit early must never freeze the field or reroll the finale.
  if p_at<v_lock_at then
    return;
  end if;

  -- At lock, anyone who did not act is a true pass: zero Priority and zero Reaping risk.
  insert into private.football_weekly_nfl_team_season_wildcard_submissions(
    week_start,profile_id,entry_count,submitted_at,updated_at
  )
  select p_week_start,participant.profile_id,0,p_at,p_at
  from private.football_weekly_auction_participants participant
  where participant.week_start=p_week_start
  on conflict(week_start,profile_id) do nothing;

  select array_agg(submission.profile_id order by submission.profile_id)
  into v_remaining
  from private.football_weekly_nfl_team_season_wildcard_submissions submission
  where submission.week_start=p_week_start
    and submission.entry_count>0;

  -- Priority wheel: sequential weighted draws without replacement.
  while coalesce(array_length(v_remaining,1),0)>0 loop
    select
      array_agg(submission.profile_id order by submission.profile_id),
      array_agg(submission.entry_count order by submission.profile_id)
    into v_profiles,v_weights
    from private.football_weekly_nfl_team_season_wildcard_submissions submission
    where submission.week_start=p_week_start
      and submission.profile_id=any(v_remaining)
      and submission.entry_count>0;

    v_pick:=private.football_weekly_auction_weighted_ticket_pick(
      v_profiles,v_weights,random()
    );
    v_order:=v_order+1;

    insert into private.football_weekly_nfl_team_season_wildcard_priority_draws(
      week_start,draw_order,profile_id,entry_count,drawn_at
    )
    select p_week_start,v_order,submission.profile_id,submission.entry_count,p_at
    from private.football_weekly_nfl_team_season_wildcard_submissions submission
    where submission.week_start=p_week_start
      and submission.profile_id=v_pick;

    v_remaining:=array_remove(v_remaining,v_pick);
  end loop;

  -- Resolve ranked claims in the persisted Priority order. A Wildcard is a true
  -- upgrade only: compare it with the player's current fourth scoring team.
  for v_draw in
    select draw.draw_order,draw.profile_id
    from private.football_weekly_nfl_team_season_wildcard_priority_draws draw
    where draw.week_start=p_week_start
    order by draw.draw_order
  loop
    select count(*)::integer into v_owned
    from private.football_weekly_auction_awards award
    where award.week_start=p_week_start
      and award.day_index between 1 and 6
      and award.profile_id=v_draw.profile_id;

    if v_owned<4 then
      continue;
    end if;

    select scored.item_reference,scored.hidden_grade
    into v_replaced_ref,v_replaced_grade
    from (
      select
        board.season_reference as item_reference,
        item.hidden_grade,
        row_number() over(
          order by item.hidden_grade desc,board.season_reference
        ) as scoring_order
      from private.football_weekly_auction_awards award
      join private.football_weekly_auction_board board
        on board.week_start=award.week_start
       and board.day_index=award.day_index
       and board.slot=award.slot
      join private.football_weekly_auction_items item
        on item.item_reference=board.season_reference
      where award.week_start=p_week_start
        and award.day_index between 1 and 6
        and award.profile_id=v_draw.profile_id
    ) scored
    where scored.scoring_order=4;

    for v_rank in
      select ranking.rank,ranking.item_reference
      from private.football_weekly_nfl_team_season_wildcard_rankings ranking
      where ranking.week_start=p_week_start
        and ranking.profile_id=v_draw.profile_id
      order by ranking.rank
    loop
      if exists(
        select 1
        from private.football_weekly_nfl_team_season_wildcard_claims claim
        where claim.week_start=p_week_start
          and claim.item_reference=v_rank.item_reference
      ) then
        continue;
      end if;

      select item.hidden_grade into v_candidate_grade
      from private.football_weekly_auction_items item
      where item.item_reference=v_rank.item_reference;

      if v_candidate_grade>v_replaced_grade then
        insert into private.football_weekly_nfl_team_season_wildcard_claims(
          week_start,profile_id,item_reference,replaced_item_reference,priority_order,resolved_at
        ) values (
          p_week_start,v_draw.profile_id,v_rank.item_reference,v_replaced_ref,v_draw.draw_order,p_at
        );
        exit;
      end if;
    end loop;
  end loop;

  -- Reaping wheel is separate from Priority and uses the same literal entry weights.
  -- It is drawn from every entrant, not just players who successfully claimed.
  select
    array_agg(submission.profile_id order by submission.profile_id),
    array_agg(submission.entry_count order by submission.profile_id)
  into v_profiles,v_weights
  from private.football_weekly_nfl_team_season_wildcard_submissions submission
  where submission.week_start=p_week_start
    and submission.entry_count>0;

  if coalesce(array_length(v_profiles,1),0)>0 then
    v_pick:=private.football_weekly_auction_weighted_ticket_pick(
      v_profiles,v_weights,random()
    );

    insert into private.football_weekly_nfl_team_season_wildcard_reapings(
      week_start,profile_id,entry_count,next_week_start,bankroll_delta,resolved_at
    )
    select
      p_week_start,
      submission.profile_id,
      submission.entry_count,
      p_week_start+7,
      -5,
      p_at
    from private.football_weekly_nfl_team_season_wildcard_submissions submission
    where submission.week_start=p_week_start
      and submission.profile_id=v_pick;

    insert into private.football_weekly_auction_bankroll_adjustments(
      week_start,profile_id,adjustment_kind,amount_delta,source_week_start,created_at
    ) values (
      p_week_start+7,v_pick,'wildcard_reaping',-5,p_week_start,p_at
    )
    on conflict(week_start,profile_id,adjustment_kind)
    do update set
      amount_delta=-5,
      source_week_start=excluded.source_week_start,
      created_at=excluded.created_at;
  end if;

  -- Completion happens after Wildcard. Only normal Days 1-6 are eligible for
  -- worst-unclaimed autofill; unseen cards and the Day 7 Wildcard board are not.
  for v_fill_profile in
    select participant.profile_id
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
    order by participant.profile_id
  loop
    select greatest(4-count(*),0)::integer
    into v_fill_needed
    from private.football_weekly_auction_awards award
    where award.week_start=p_week_start
      and award.day_index between 1 and 6
      and award.profile_id=v_fill_profile;

    if v_fill_needed<=0 then continue; end if;

    v_fill_order:=0;
    while v_fill_order<v_fill_needed loop
      select candidate.item_reference
      into v_fill_ref
      from (
        select board.season_reference as item_reference,item.hidden_grade
        from private.football_weekly_auction_board board
        join private.football_weekly_auction_items item
          on item.item_reference=board.season_reference
        left join private.football_weekly_auction_awards award
          on award.week_start=board.week_start
         and award.day_index=board.day_index
         and award.slot=board.slot
        where board.week_start=p_week_start
          and board.day_index between 1 and 6
          and board.slot<=private.football_weekly_auction_cards_for_day(
            p_week_start,board.day_index
          )
          and award.profile_id is null
          and not exists(
            select 1
            from private.football_weekly_nfl_team_season_autofill fill
            where fill.week_start=p_week_start
              and fill.item_reference=board.season_reference
          )
        order by item.hidden_grade asc,board.season_reference
        limit 1
      ) candidate;

      if v_fill_ref is null then
        raise exception 'NFL team-season completion capacity exhausted before every player reached four teams';
      end if;

      v_fill_order:=v_fill_order+1;
      insert into private.football_weekly_nfl_team_season_autofill(
        week_start,profile_id,fill_order,item_reference,assigned_at
      ) values (
        p_week_start,v_fill_profile,v_fill_order,v_fill_ref,p_at
      );
    end loop;
  end loop;

  insert into private.football_weekly_nfl_team_season_wildcard_resolutions(
    week_start,resolved_at
  ) values (
    p_week_start,p_at
  );
end;
$$;
revoke all on function private.resolve_football_weekly_nfl_team_season_wildcard(date,timestamptz)
  from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_wildcard_state(
  p_week_start date,
  p_profile_id uuid,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
stable security definer
set search_path=''
as $$
declare
  v_subject text;
  v_resolved boolean;
  v_board jsonb;
  v_my_entries integer;
  v_my_rankings jsonb;
  v_priority jsonb:='[]'::jsonb;
  v_claims jsonb:='[]'::jsonb;
  v_reaping jsonb;
  v_autofill jsonb:='[]'::jsonb;
begin
  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;

  if v_subject is distinct from 'nfl-best-team-seasons-since-2000' then
    return jsonb_build_object(
      'available',false,
      'subject_key',v_subject
    );
  end if;

  select exists(
    select 1
    from private.football_weekly_nfl_team_season_wildcard_resolutions resolution
    where resolution.week_start=p_week_start
  ) into v_resolved;

  select coalesce(jsonb_agg(jsonb_build_object(
    'slot',board.slot,
    'item_reference',item.item_reference,
    'season_year',item.season_year,
    'primary_name',item.primary_name,
    'team_code',item.team_code,
    'display_label',item.display_label,
    'source_url',item.source_url
  ) order by board.slot),'[]'::jsonb)
  into v_board
  from private.football_weekly_nfl_team_season_wildcard_board board
  join private.football_weekly_auction_items item
    on item.item_reference=board.item_reference
  where board.week_start=p_week_start;

  select submission.entry_count
  into v_my_entries
  from private.football_weekly_nfl_team_season_wildcard_submissions submission
  where submission.week_start=p_week_start
    and submission.profile_id=p_profile_id;

  select coalesce(jsonb_agg(ranking.item_reference order by ranking.rank),'[]'::jsonb)
  into v_my_rankings
  from private.football_weekly_nfl_team_season_wildcard_rankings ranking
  where ranking.week_start=p_week_start
    and ranking.profile_id=p_profile_id;

  if v_resolved then
    select coalesce(jsonb_agg(jsonb_build_object(
      'draw_order',draw.draw_order,
      'profile_id',draw.profile_id,
      'display_name',profile.display_name,
      'entry_count',draw.entry_count
    ) order by draw.draw_order),'[]'::jsonb)
    into v_priority
    from private.football_weekly_nfl_team_season_wildcard_priority_draws draw
    join public.profiles profile on profile.id=draw.profile_id
    where draw.week_start=p_week_start;

    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id',claim.profile_id,
      'display_name',profile.display_name,
      'item_reference',claim.item_reference,
      'replaced_item_reference',claim.replaced_item_reference,
      'priority_order',claim.priority_order
    ) order by claim.priority_order),'[]'::jsonb)
    into v_claims
    from private.football_weekly_nfl_team_season_wildcard_claims claim
    join public.profiles profile on profile.id=claim.profile_id
    where claim.week_start=p_week_start;

    select jsonb_build_object(
      'profile_id',reaping.profile_id,
      'display_name',profile.display_name,
      'entry_count',reaping.entry_count,
      'next_week_start',reaping.next_week_start,
      'bankroll_delta',reaping.bankroll_delta
    )
    into v_reaping
    from private.football_weekly_nfl_team_season_wildcard_reapings reaping
    join public.profiles profile on profile.id=reaping.profile_id
    where reaping.week_start=p_week_start;

    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id',fill.profile_id,
      'item_reference',fill.item_reference,
      'fill_order',fill.fill_order
    ) order by fill.profile_id,fill.fill_order),'[]'::jsonb)
    into v_autofill
    from private.football_weekly_nfl_team_season_autofill fill
    where fill.week_start=p_week_start;
  end if;

  return jsonb_build_object(
    'available',true,
    'subject_key','nfl-best-team-seasons-since-2000',
    'week_start',p_week_start,
    'day_index',private.football_weekly_auction_day_index(p_at,p_week_start),
    'teams',v_board,
    'submitted',v_my_entries is not null,
    'my_entries',coalesce(v_my_entries,0),
    'my_rankings',coalesce(v_my_rankings,'[]'::jsonb),
    'resolved',v_resolved,
    -- Other players' ticket counts remain sealed until resolution.
    'priority_draws',case when v_resolved then v_priority else '[]'::jsonb end,
    'claims',case when v_resolved then v_claims else '[]'::jsonb end,
    'reaping',case when v_resolved then v_reaping else null end,
    'autofill',case when v_resolved then v_autofill else '[]'::jsonb end
  );
end;
$$;
revoke all on function private.football_weekly_nfl_team_season_wildcard_state(date,uuid,timestamptz)
  from public,anon,authenticated;

create or replace function public.get_my_football_weekly_nfl_team_season_wildcard(
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

  v_week_start:=private.football_weekly_auction_week_start(p_at);
  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=v_week_start;

  if v_subject is distinct from 'nfl-best-team-seasons-since-2000' then
    return jsonb_build_object('available',false,'subject_key',v_subject);
  end if;
  if not exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start=v_week_start
      and participant.profile_id=v_profile
  ) then
    return jsonb_build_object(
      'available',false,
      'subject_key',v_subject,
      'locked_this_week',true,
      'week_start',v_week_start
    );
  end if;

  if private.football_weekly_auction_day_index(p_at,v_week_start)>=7 then
    perform private.materialize_football_weekly_nfl_team_season_wildcard(v_week_start);
  end if;

  return private.football_weekly_nfl_team_season_wildcard_state(
    v_week_start,v_profile,p_at
  );
end;
$$;
revoke all on function public.get_my_football_weekly_nfl_team_season_wildcard(timestamptz)
  from public,anon;
grant execute on function public.get_my_football_weekly_nfl_team_season_wildcard(timestamptz)
  to authenticated;

create or replace function public.submit_my_football_weekly_nfl_team_season_wildcard(
  p_entries integer,
  p_rankings jsonb,
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
  v_rankings text[];
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if p_rankings is null or jsonb_typeof(p_rankings)<>'array' then raise exception 'Wildcard rankings must be an array'; end if;

  select coalesce(array_agg(value order by ordinal),array[]::text[])
  into v_rankings
  from jsonb_array_elements_text(p_rankings) with ordinality ranked(value,ordinal);

  v_week_start:=private.football_weekly_auction_week_start(p_at);

  perform private.submit_football_weekly_nfl_team_season_wildcard(
    v_week_start,v_profile,p_entries,v_rankings,p_at
  );

  -- Resolution is idempotent and remains a no-op until the Day 7 lock.
  -- The shared Weekly Auction maintainer will call the resolver at the deadline.
  perform private.resolve_football_weekly_nfl_team_season_wildcard(
    v_week_start,p_at
  );

  return private.football_weekly_nfl_team_season_wildcard_state(
    v_week_start,v_profile,p_at
  );
end;
$$;
revoke all on function public.submit_my_football_weekly_nfl_team_season_wildcard(integer,jsonb,timestamptz)
  from public,anon;
grant execute on function public.submit_my_football_weekly_nfl_team_season_wildcard(integer,jsonb,timestamptz)
  to authenticated;
