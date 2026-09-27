begin;

select set_config('request.jwt.claim.role','service_role',true);

do $superteam_standard_pool$
declare
  v_week_a date:=date '2026-10-20';
  v_week_b date:=date '2026-11-10';
  v_sig_a text;
  v_sig_b text;
  v_capacity integer;
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

  if (select count(*) from private.football_weekly_auction_board where week_start=v_week_a)<>84
    or (select count(*) from private.football_weekly_auction_board where week_start=v_week_b)<>84
  then
    raise exception 'CFB Superteam elastic generator did not materialize 84-card reserve weeks';
  end if;

  if exists(
    select board.day_index
    from private.football_weekly_auction_board board
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=board.season_reference
    where board.week_start in (v_week_a,v_week_b)
    group by board.week_start,board.day_index
    having count(*)<>12
      or count(distinct authority.display_name)<>12
      or count(distinct authority.school)<>12
      or max(authority.hidden_grade)-min(authority.hidden_grade)<7
      or max(authority.hidden_grade)<95
      or min(authority.hidden_grade)>92
  ) then
    raise exception 'CFB Superteam elastic reserve board is unbalanced';
  end if;

  if exists(
    select board.day_index
    from private.football_weekly_auction_board board
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=board.season_reference
    where board.week_start in (v_week_a,v_week_b)
      and board.slot<=8
    group by board.week_start,board.day_index
    having count(*)<>8
      or max(authority.hidden_grade)-min(authority.hidden_grade)<7
      or max(authority.hidden_grade)<95
      or min(authority.hidden_grade)>92
      or count(*) filter(where authority.hidden_grade>=96)>3
  ) then
    raise exception 'CFB Superteam eight-card Standard base regressed';
  end if;

  if exists(
    select week_start
    from private.cfb_superteam_week_authority weekly
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=weekly.item_reference
    where week_start in (v_week_a,v_week_b)
    group by week_start
    having count(*)<>84
      or count(*) filter(where authority.group_key='QB')<>12
      or count(*) filter(where authority.group_key='RB')<>13
      or count(*) filter(where authority.group_key='WR')<>13
      or count(*) filter(where authority.group_key='TE')<>10
      or count(*) filter(where authority.group_key='Front Seven')<>12
      or count(*) filter(where authority.group_key='Secondary')<>12
      or count(*) filter(where authority.group_key='Head Coach')<>12
  ) then
    raise exception 'CFB Superteam elastic positional reserve mix drifted';
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

  if private.football_weekly_superteam_cards_for_field(5)<>8
    or private.football_weekly_superteam_cards_for_field(6)<>9
    or private.football_weekly_superteam_cards_for_field(8)<>10
    or private.football_weekly_superteam_cards_for_field(9)<>11
    or private.football_weekly_superteam_cards_for_field(10)<>12
  then
    raise exception 'CFB Superteam elastic field thresholds drifted';
  end if;

  if private.football_weekly_auction_cards_for_day(v_week_a,1)<>8 then
    raise exception 'CFB Superteam Day 1 must expose only eight base cards';
  end if;

  v_capacity:=private.football_weekly_superteam_join_capacity(
    v_week_a,
    ((v_week_a::timestamp+time '12:00') at time zone 'America/Chicago')
  );
  if v_capacity<>11 then
    raise exception 'CFB Superteam Day 1 capacity must safely allow 11 entrants, got %',v_capacity;
  end if;
end;
$superteam_standard_pool$;

rollback;

\echo 'CFB Superteam deep-pool Standard + elastic field proof passed.'
