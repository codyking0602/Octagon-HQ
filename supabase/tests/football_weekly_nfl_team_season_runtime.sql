begin;

select set_config('request.jwt.claim.role','service_role',true);

do $nfl_team_season_runtime$
declare
  v_week date:=date '2026-10-06';
  v_count integer;
  v_signature text;
begin
  if private.football_weekly_auction_subject_for_week(v_week)
    is distinct from 'nfl-best-team-seasons-since-2000'
  then
    raise exception 'Oct. 6 rotation did not select NFL Team-Seasons';
  end if;

  if (select count(*) from private.nfl_best_team_seasons_v1_authority)<>200
    or (select count(*) from private.football_weekly_auction_items
        where subject_key='nfl-best-team-seasons-since-2000')<>200
  then
    raise exception 'NFL Team-Seasons authority/catalog is not exactly 200 rows';
  end if;

  perform private.materialize_football_weekly_auction_week(v_week);

  if (select subject_key from private.football_weekly_auction_weeks where week_start=v_week)
    is distinct from 'nfl-best-team-seasons-since-2000'
  then
    raise exception 'materialized week has the wrong subject';
  end if;

  if (select count(*) from private.football_weekly_nfl_team_season_themes where week_start=v_week)<>6
  then
    raise exception 'NFL Team-Seasons did not create exactly six normal-day themes';
  end if;

  if exists(
    select 1
    from private.football_weekly_nfl_team_season_themes
    where week_start=v_week and (public_theme is null or char_length(public_theme)=0)
  ) then
    raise exception 'NFL Team-Seasons has incomplete theme metadata';
  end if;

  select count(*)::integer into v_count
  from private.football_weekly_auction_board
  where week_start=v_week;

  if v_count<24 or v_count>42 then
    raise exception 'NFL Team-Seasons hidden reserve board size is outside 24-42: %',v_count;
  end if;

  if private.football_weekly_auction_cards_for_day(v_week,1)<>4 then
    raise exception 'NFL Team-Seasons exposed Day 1 must stay fixed at four cards';
  end if;

  if private.football_weekly_auction_cards_for_day(v_week,7)<>0 then
    raise exception 'NFL Team-Seasons Day 7 must not expose normal auction cards';
  end if;

  if exists(
    select season_reference
    from private.football_weekly_auction_board
    where week_start=v_week
    group by season_reference
    having count(*)>1
  ) then
    raise exception 'NFL Team-Seasons repeated an exact team-season within the week';
  end if;

  if exists(
    select family
    from private.football_weekly_nfl_team_season_themes
    where week_start=v_week
    group by family
    having count(*)>case when family in ('division','open_field') then 2 else 1 end
  ) then
    raise exception 'NFL Team-Seasons theme-family weekly caps drifted';
  end if;

  if (
    select count(distinct public_theme)
    from private.football_weekly_nfl_team_season_themes
    where week_start=v_week
  )<>6 then
    raise exception 'NFL Team-Seasons repeated a public theme label';
  end if;

  if exists(
    select theme.day_index
    from private.football_weekly_nfl_team_season_themes theme
    join private.football_weekly_auction_board board
      on board.week_start=theme.week_start
     and board.day_index=theme.day_index
     and board.slot<=4
    join private.nfl_best_team_seasons_v1_authority item
      on item.item_reference=board.season_reference
    where theme.week_start=v_week
    group by theme.day_index,theme.family,theme.variant
    having
      count(*)<>4
      or (
        theme.family='division'
        and (
          count(distinct item.franchise_id)<>4
          or count(*) filter(where item.division=theme.variant)<>4
        )
      )
      or (
        theme.family='season'
        and count(*) filter(where item.season_year=theme.variant::integer)<>4
      )
      or (
        theme.family='era'
        and count(*) filter(where
          (theme.variant='2000s' and item.season_year between 2000 and 2009)
          or (theme.variant='2010s' and item.season_year between 2010 and 2019)
          or (theme.variant='2020s' and item.season_year between 2020 and 2025)
        )<>4
      )
      or (
        theme.family='rivalry'
        and (
          count(distinct item.franchise_id)<>2
          or min(
            case
              when item.franchise_id in (
                split_part(theme.variant,'|',1),
                split_part(theme.variant,'|',2)
              ) then 1 else 0
            end
          )<>1
          or min(
            case
              when item.franchise_id=split_part(theme.variant,'|',1) then 1 else 0
            end
          )=max(
            case
              when item.franchise_id=split_part(theme.variant,'|',1) then 1 else 0
            end
          )
        )
      )
      or (
        theme.family='franchise_history'
        and (
          count(distinct item.franchise_id)<>1
          or min(item.franchise_id)<>theme.variant
        )
      )
      or (
        theme.family='fell_short'
        and count(*) filter(where item.fell_short)<>4
      )
      or (
        theme.family='conference_clash'
        and (
          count(*) filter(where item.conference='AFC')<>2
          or count(*) filter(where item.conference='NFC')<>2
          or count(distinct item.franchise_id)<>4
        )
      )
      or (
        theme.family in ('season','era','fell_short','open_field')
        and count(distinct item.franchise_id)<>4
      )
  ) then
    raise exception 'NFL Team-Seasons exposed board violates its approved theme eligibility';
  end if;

  if exists(
    select item.franchise_id
    from private.football_weekly_auction_board board
    join private.nfl_best_team_seasons_v1_authority item
      on item.item_reference=board.season_reference
    where board.week_start=v_week and board.slot<=4
    group by item.franchise_id
    having count(*)>case
      when item.franchise_id=(
        select variant
        from private.football_weekly_nfl_team_season_themes
        where week_start=v_week and family='franchise_history'
        limit 1
      ) then 4 else 3 end
  ) then
    raise exception 'NFL Team-Seasons exposed week overexposed a franchise';
  end if;

  if exists(
    select 1
    from private.football_weekly_auction_board
    where week_start=v_week
      and (day_index not between 1 and 6 or slot not between 1 and 7 or hidden_shape<>'Natural')
  ) then
    raise exception 'NFL Team-Seasons normal reserve board shape drifted';
  end if;

  if exists(
    select 1
    from private.football_weekly_auction_board board
    left join private.nfl_best_team_seasons_v1_authority authority
      on authority.item_reference=board.season_reference
    where board.week_start=v_week and authority.item_reference is null
  ) then
    raise exception 'NFL Team-Seasons board escaped audited authority';
  end if;

  select string_agg(season_reference,'|' order by day_index,slot)
  into v_signature
  from private.football_weekly_auction_board
  where week_start=v_week;

  perform private.materialize_football_weekly_auction_week(v_week);

  if v_signature is distinct from (
    select string_agg(season_reference,'|' order by day_index,slot)
    from private.football_weekly_auction_board
    where week_start=v_week
  ) then
    raise exception 're-materialization rerolled an exposed NFL Team-Seasons board';
  end if;

  if position(
    '''hidden_grade'''
    in pg_get_functiondef(
      'private.get_my_football_weekly_nfl_team_season(timestamptz)'::regprocedure
    )
  )>0 then
    raise exception 'active NFL Team-Seasons getter leaks hidden grades';
  end if;

  if position(
    'return private.get_my_football_weekly_nfl_team_season(p_at)'
    in lower(pg_get_functiondef(
      'public.submit_my_football_weekly_nfl_team_season_wildcard(integer,jsonb,timestamptz)'::regprocedure
    ))
  )=0 then
    raise exception 'public Wildcard submit does not return the full Weekly Auction state';
  end if;
end;
$nfl_team_season_runtime$;

rollback;

\echo 'NFL Team-Seasons Weekly Auction runtime proof passed.'
