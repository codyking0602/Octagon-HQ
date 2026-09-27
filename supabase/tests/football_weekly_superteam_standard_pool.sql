begin;

select set_config('request.jwt.claim.role','service_role',true);

do $superteam_standard_pool$
declare
  v_week_a date:=date '2026-10-20';
  v_week_b date:=date '2026-11-10';
  v_sig_a text;
  v_sig_b text;
begin
  if (select count(*) from private.cfb_superteam_v1_authority where group_key='QB')<>50
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='RB')<>50
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='WR')<>50
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='TE')<>24
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='Front Seven')<>60
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='Secondary')<>60
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='Head Coach')<>35
  then
    raise exception 'CFB Superteam deep pool counts are not locked';
  end if;

  perform private.materialize_football_weekly_superteam_week(v_week_a);
  perform private.materialize_football_weekly_superteam_week(v_week_b);

  if (select count(*) from private.football_weekly_auction_board where week_start=v_week_a)<>56
    or (select count(*) from private.football_weekly_auction_board where week_start=v_week_b)<>56
  then
    raise exception 'CFB Superteam reusable generator did not materialize 56-card weeks';
  end if;

  if exists(
    select board.day_index
    from private.football_weekly_auction_board board
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=board.season_reference
    where board.week_start in (v_week_a,v_week_b)
    group by board.week_start,board.day_index
    having count(*)<>8
      or count(distinct authority.display_name)<>8
      or count(distinct authority.school)<>8
      or max(authority.hidden_grade)-min(authority.hidden_grade)<7
      or max(authority.hidden_grade)<95
      or min(authority.hidden_grade)>92
      or count(*) filter(where authority.hidden_grade>=96)>3
  ) then
    raise exception 'CFB Superteam Standard board shape regressed into a compressed board';
  end if;

  if exists(
    select week_start
    from private.cfb_superteam_week_authority weekly
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=weekly.item_reference
    where week_start in (v_week_a,v_week_b)
    group by week_start
    having count(*)<>56
      or count(*) filter(where authority.group_key='QB')<>8
      or count(*) filter(where authority.group_key='RB')<>9
      or count(*) filter(where authority.group_key='WR')<>9
      or count(*) filter(where authority.group_key='TE')<>4
      or count(*) filter(where authority.group_key='Front Seven')<>9
      or count(*) filter(where authority.group_key='Secondary')<>9
      or count(*) filter(where authority.group_key='Head Coach')<>8
  ) then
    raise exception 'CFB Superteam weekly positional mix drifted';
  end if;

  select string_agg(season_reference,'|' order by day_index,slot)
  into v_sig_a
  from private.football_weekly_auction_board
  where week_start=v_week_a;

  select string_agg(season_reference,'|' order by day_index,slot)
  into v_sig_b
  from private.football_weekly_auction_board
  where week_start=v_week_b;

  if v_sig_a=v_sig_b then
    raise exception 'CFB Superteam reusable generator repeated the entire weekly board';
  end if;

  if exists(
    select 1 from private.football_weekly_auction_board
    where week_start in (v_week_a,v_week_b)
      and hidden_shape<>'Standard'
  ) then
    raise exception 'CFB Superteam introduced a named non-Standard board shape';
  end if;
end;
$superteam_standard_pool$;

rollback;

\echo 'CFB Superteam deep-pool Standard generator proof passed.'
