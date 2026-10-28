-- Day 7 strategy/presentation contract for NFL Team-Seasons.
-- Players explicitly choose the normal team they are willing to cut.
-- Wildcard claims never compare hidden grades; the user's cut is the strategy.
-- "Reaping" remains an internal storage name only. Product copy calls it Risk Draw.

alter table private.football_weekly_nfl_team_season_wildcard_submissions
  add column if not exists cut_item_reference text;

do $nfl_wildcard_cut_fk$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname='football_weekly_nfl_wildcard_submission_cut_fk'
      and conrelid='private.football_weekly_nfl_team_season_wildcard_submissions'::regclass
  ) then
    alter table private.football_weekly_nfl_team_season_wildcard_submissions
      add constraint football_weekly_nfl_wildcard_submission_cut_fk
      foreign key (cut_item_reference)
      references private.football_weekly_auction_items(item_reference)
      on delete restrict;
  end if;
end;
$nfl_wildcard_cut_fk$;

create or replace function private.submit_football_weekly_nfl_team_season_wildcard_v2(
  p_week_start date,
  p_profile_id uuid,
  p_entries integer,
  p_rankings text[],
  p_cut_item_reference text,
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
  v_cut text:=nullif(p_cut_item_reference,'');
begin
  if p_profile_id is null then raise exception 'profile required'; end if;
  if p_entries is null or p_entries not between 0 and 5 then
    raise exception 'Wildcard entries must be between 0 and 5';
  end if;
  if coalesce(array_length(p_rankings,1),0)>4 then
    raise exception 'Wildcard ranking accepts at most four teams';
  end if;
  if coalesce(array_length(p_rankings,1),0)
    <>coalesce(array_length(array(select distinct unnest(p_rankings)),1),0)
  then
    raise exception 'Wildcard ranking cannot contain duplicates';
  end if;

  if p_entries=0 then
    v_cut:=null;
    p_rankings:=array[]::text[];
  else
    if coalesce(array_length(p_rankings,1),0)=0 then
      raise exception 'Wildcard entries require at least one ranked team';
    end if;
    if v_cut is null then
      raise exception 'Choose the team you would cut before buying Wildcard entries';
    end if;
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
    raise exception 'You need at least four normal teams to enter the Wildcard round';
  end if;

  if p_entries>0 and not exists(
    select 1
    from private.football_weekly_auction_awards award
    join private.football_weekly_auction_board board
      on board.week_start=award.week_start
     and board.day_index=award.day_index
     and board.slot=award.slot
    where award.week_start=p_week_start
      and award.day_index between 1 and 6
      and award.profile_id=p_profile_id
      and board.season_reference=v_cut
  ) then
    raise exception 'Your cut must be one of the normal teams you won this week';
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
    week_start,profile_id,entry_count,cut_item_reference,submitted_at,updated_at
  ) values (
    p_week_start,p_profile_id,p_entries,v_cut,p_at,p_at
  )
  on conflict(week_start,profile_id)
  do update set
    entry_count=excluded.entry_count,
    cut_item_reference=excluded.cut_item_reference,
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
revoke all on function private.submit_football_weekly_nfl_team_season_wildcard_v2(date,uuid,integer,text[],text,timestamptz)
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
  v_remaining uuid[];
  v_profiles uuid[];
  v_weights integer[];
  v_pick uuid;
  v_order integer:=0;
  v_draw record;
  v_rank record;
  v_replaced_ref text;
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

  -- Day 7 choices stay sealed/editable until lock.
  if p_at<v_lock_at then return; end if;

  -- No action means a true pass: no Claim Order ticket and no Risk Draw ticket.
  insert into private.football_weekly_nfl_team_season_wildcard_submissions(
    week_start,profile_id,entry_count,cut_item_reference,submitted_at,updated_at
  )
  select p_week_start,participant.profile_id,0,null,p_at,p_at
  from private.football_weekly_auction_participants participant
  where participant.week_start=p_week_start
  on conflict(week_start,profile_id) do nothing;

  select array_agg(submission.profile_id order by submission.profile_id)
  into v_remaining
  from private.football_weekly_nfl_team_season_wildcard_submissions submission
  where submission.week_start=p_week_start
    and submission.entry_count>0;

  -- Claim Order: weighted draw without replacement. The first draw is the
  -- animated moment; remaining persisted order can be revealed immediately.
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

  -- Each entrant chose the normal team they are willing to cut. No hidden
  -- grade comparison is made here. Strategy belongs to the player.
  for v_draw in
    select draw.draw_order,draw.profile_id
    from private.football_weekly_nfl_team_season_wildcard_priority_draws draw
    where draw.week_start=p_week_start
    order by draw.draw_order
  loop
    select submission.cut_item_reference
    into v_replaced_ref
    from private.football_weekly_nfl_team_season_wildcard_submissions submission
    where submission.week_start=p_week_start
      and submission.profile_id=v_draw.profile_id;

    if v_replaced_ref is null then continue; end if;

    if not exists(
      select 1
      from private.football_weekly_auction_awards award
      join private.football_weekly_auction_board board
        on board.week_start=award.week_start
       and board.day_index=award.day_index
       and board.slot=award.slot
      where award.week_start=p_week_start
        and award.day_index between 1 and 6
        and award.profile_id=v_draw.profile_id
        and board.season_reference=v_replaced_ref
    ) then
      continue;
    end if;

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

      insert into private.football_weekly_nfl_team_season_wildcard_claims(
        week_start,profile_id,item_reference,replaced_item_reference,priority_order,resolved_at
      ) values (
        p_week_start,v_draw.profile_id,v_rank.item_reference,v_replaced_ref,v_draw.draw_order,p_at
      );
      exit;
    end loop;
  end loop;

  -- Risk Draw is independent from Claim Order and uses the original full ticket pool.
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

  -- Completion happens after the Wildcard round. Only exposed normal Days 1-6
  -- can be used for worst-unclaimed autofill.
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
  v_my_cut text;
  v_priority jsonb:='[]'::jsonb;
  v_claims jsonb:='[]'::jsonb;
  v_reaping jsonb;
  v_autofill jsonb:='[]'::jsonb;
begin
  select week.subject_key into v_subject
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;

  if v_subject is distinct from 'nfl-best-team-seasons-since-2000' then
    return jsonb_build_object('available',false,'subject_key',v_subject);
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

  select submission.entry_count,submission.cut_item_reference
  into v_my_entries,v_my_cut
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
      'replaced_team_name',replaced.primary_name,
      'replaced_team_code',replaced.team_code,
      'replaced_season_year',replaced.season_year,
      'priority_order',claim.priority_order
    ) order by claim.priority_order),'[]'::jsonb)
    into v_claims
    from private.football_weekly_nfl_team_season_wildcard_claims claim
    join public.profiles profile on profile.id=claim.profile_id
    join private.football_weekly_auction_items replaced
      on replaced.item_reference=claim.replaced_item_reference
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
    'my_cut_item_reference',v_my_cut,
    'resolved',v_resolved,
    'priority_draws',case when v_resolved then v_priority else '[]'::jsonb end,
    'claims',case when v_resolved then v_claims else '[]'::jsonb end,
    'reaping',case when v_resolved then v_reaping else null end,
    'autofill',case when v_resolved then v_autofill else '[]'::jsonb end
  );
end;
$$;
revoke all on function private.football_weekly_nfl_team_season_wildcard_state(date,uuid,timestamptz)
  from public,anon,authenticated;

create or replace function public.submit_my_football_weekly_nfl_team_season_wildcard_v2(
  p_entries integer,
  p_rankings jsonb,
  p_cut_item_reference text,
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
  if p_rankings is null or jsonb_typeof(p_rankings)<>'array' then
    raise exception 'Wildcard rankings must be an array';
  end if;

  select coalesce(array_agg(value order by ordinal),array[]::text[])
  into v_rankings
  from jsonb_array_elements_text(p_rankings) with ordinality ranked(value,ordinal);

  v_week_start:=private.football_weekly_auction_week_start(p_at);

  perform private.submit_football_weekly_nfl_team_season_wildcard_v2(
    v_week_start,v_profile,p_entries,v_rankings,p_cut_item_reference,p_at
  );

  perform private.resolve_football_weekly_nfl_team_season_wildcard(
    v_week_start,p_at
  );

  return private.get_my_football_weekly_nfl_team_season(p_at);
end;
$$;
revoke all on function public.submit_my_football_weekly_nfl_team_season_wildcard_v2(integer,jsonb,text,timestamptz)
  from public,anon;
grant execute on function public.submit_my_football_weekly_nfl_team_season_wildcard_v2(integer,jsonb,text,timestamptz)
  to authenticated;

create or replace function public.submit_my_football_weekly_nfl_team_season_lab_wildcard_v2(
  p_seat_index integer,
  p_entries integer,
  p_rankings jsonb,
  p_cut_item_reference text
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_run private.football_weekly_nfl_team_season_lab_runs%rowtype;
  v_profile uuid;
  v_at timestamptz;
  v_rankings text[];
begin
  v_owner:=private.football_weekly_superteam_lab_owner();
  if auth.uid() is distinct from v_owner then
    raise exception 'NFL Team-Seasons Playthrough Lab is owner-only';
  end if;

  select * into v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=v_owner;
  if v_run.current_day<>7 then
    raise exception 'Wildcard lab entry is only open on Day 7';
  end if;
  if p_rankings is null or jsonb_typeof(p_rankings)<>'array' then
    raise exception 'Wildcard rankings must be an array';
  end if;

  select profile_id into v_profile
  from private.football_weekly_nfl_team_season_lab_seats
  where owner_profile_id=v_owner
    and seat_index=p_seat_index;
  if v_profile is null then raise exception 'Lab seat unavailable'; end if;

  select coalesce(array_agg(value order by ordinal),array[]::text[])
  into v_rankings
  from jsonb_array_elements_text(p_rankings) with ordinality ranked(value,ordinal);

  v_at:=((v_run.lab_week_start+6)::date+time '12:00')
    at time zone 'America/Chicago';

  perform private.submit_football_weekly_nfl_team_season_wildcard_v2(
    v_run.lab_week_start,v_profile,p_entries,v_rankings,p_cut_item_reference,v_at
  );

  update private.football_weekly_nfl_team_season_lab_runs
  set updated_at=now()
  where owner_profile_id=v_owner;

  return private.football_weekly_nfl_team_season_lab_state(v_owner,p_seat_index);
end;
$$;
revoke all on function public.submit_my_football_weekly_nfl_team_season_lab_wildcard_v2(integer,integer,jsonb,text)
  from public,anon;
grant execute on function public.submit_my_football_weekly_nfl_team_season_lab_wildcard_v2(integer,integer,jsonb,text)
  to authenticated;

do $nfl_wildcard_player_cut_contract$
begin
  if not exists(
    select 1
    from information_schema.columns
    where table_schema='private'
      and table_name='football_weekly_nfl_team_season_wildcard_submissions'
      and column_name='cut_item_reference'
  ) then
    raise exception 'NFL Wildcard submissions must persist the player-selected cut';
  end if;

  if position(
    'v_candidate_grade>v_replaced_grade'
    in pg_get_functiondef(
      'private.resolve_football_weekly_nfl_team_season_wildcard(date,timestamptz)'::regprocedure
    )
  )>0 then
    raise exception 'NFL Wildcard resolver must not leak hidden-grade strategy through automatic replacement';
  end if;
end;
$nfl_wildcard_player_cut_contract$;
