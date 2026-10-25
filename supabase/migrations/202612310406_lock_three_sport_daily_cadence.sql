-- Coordinated future-only three-sport Daily cadence. No existing Daily board,
-- progress, attempt, leaderboard, or historical schedule version is updated.
-- Football: every Central day. UFC: Oct 25/27/29... (48-hour boards).
-- NBA: Nov 1/3/5... through Apr 11, 2027 (48-hour boards).
-- Neither unfinished Football nor UFC Higher or Lower enters a schedule.
do $guard$
begin
  if exists (
    select 1 from private.daily_challenges daily
    join private.daily_challenge_schedule_versions schedule on schedule.version = daily.schedule_version
    where (schedule.sport in ('ufc','football') and daily.central_day >= date '2026-10-25')
       or (schedule.sport = 'nba' and daily.central_day >= date '2026-11-01')
  ) then
    raise exception 'cadence cutover refused: future Daily boards have already been published';
  end if;
  if private.daily_challenge_schedule_for_day(date '2026-10-24','ufc') <> 'play-rotation-v20-resume-v18-oct3'
     or private.daily_challenge_schedule_for_day(date '2026-10-24','football') <> 'football-daily-v20-resume-v18-oct3'
     or private.daily_challenge_schedule_for_day(date '2026-11-01','nba') <> 'nba-daily-regular-v1' then
    raise exception 'cadence cutover base schedule has changed: re-audit live Daily commitments';
  end if;
end
$guard$;

insert into private.daily_challenge_schedule_versions(version,time_zone,anchor_day,starts_on,game_cycle,sport)
values
  ('football-daily-v21-locked-oct25','America/Chicago',date '2026-10-25',date '2026-10-25',array[
    'who_am_i',
    'millionaire',
    'find_leader',
    'hit_the_number',
    'wavelength',
    'sports_feud',
    'average_fan',
    'bar_trivia',
    'who_am_i',
    'millionaire',
    'find_leader',
    'sports_feud',
    'wavelength',
    'average_fan',
    'millionaire',
    'bar_trivia',
    'hit_the_number',
    'who_am_i',
    'sports_feud',
    'find_leader',
    'average_fan',
    'wavelength',
    'millionaire',
    'sports_feud',
    'bar_trivia',
    'average_fan'
  ]::text[],'football'),
  ('ufc-daily-v21-48h-oct25','America/Chicago',date '2026-10-25',date '2026-10-25',array[
    'find_leader',
    'sports_feud',
    'millionaire',
    'wavelength',
    'bar_trivia',
    'average_fan',
    'blind_resume',
    'who_am_i',
    'sports_feud',
    'find_leader',
    'millionaire',
    'average_fan',
    'wavelength',
    'hit_the_number',
    'bar_trivia',
    'sports_feud',
    'who_am_i',
    'millionaire',
    'average_fan',
    'find_leader',
    'blind_resume',
    'sports_feud',
    'wavelength',
    'millionaire',
    'bar_trivia',
    'who_am_i',
    'average_fan',
    'hit_the_number'
  ]::text[],'ufc'),
  ('nba-daily-regular-v2-locked','America/Chicago',date '2026-11-01',date '2026-11-01',array[
    'average_fan',
    'bar_trivia',
    'who_am_i',
    'millionaire',
    'hit_the_number',
    'sports_feud',
    'wavelength',
    'find_leader',
    'average_fan',
    'higher_lower',
    'bar_trivia',
    'millionaire',
    'who_am_i',
    'average_fan',
    'sports_feud',
    'wavelength',
    'find_leader',
    'millionaire',
    'hit_the_number',
    'bar_trivia',
    'sports_feud',
    'average_fan',
    'who_am_i',
    'higher_lower',
    'millionaire',
    'wavelength',
    'find_leader',
    'sports_feud'
  ]::text[],'nba');

-- One central policy owns the publication day for the two 48-hour sports.
-- Previous UFC schedules remain one-day, so historical identity is unaffected.
create or replace function private.daily_challenge_active_day(p_day date, p_sport text)
returns date language plpgsql immutable set search_path = '' as $fn$
begin
  if p_sport = 'nba' then
    return date '2026-11-01' + ((p_day - date '2026-11-01') / 2) * 2;
  end if;
  if p_sport = 'ufc' and p_day >= date '2026-10-25' then
    return date '2026-10-25' + ((p_day - date '2026-10-25') / 2) * 2;
  end if;
  if p_sport = 'football' or p_sport = 'ufc' then return p_day; end if;
  raise exception 'unsupported Daily cadence sport %', p_sport;
end;
$fn$;

create or replace function private.daily_challenge_expected_game(p_schedule_version text,p_day date)
returns text language plpgsql stable set search_path = '' as $fn$
declare v_schedule private.daily_challenge_schedule_versions;
  v_length integer; v_offset integer; v_index integer;
begin
  select * into v_schedule from private.daily_challenge_schedule_versions where version = p_schedule_version;
  if v_schedule.version is null then raise exception 'unknown daily schedule version %',p_schedule_version; end if;
  v_length := cardinality(v_schedule.game_cycle);
  if v_length = 0 then raise exception 'empty Daily schedule %',p_schedule_version; end if;
  v_index := p_day - v_schedule.anchor_day;
  if v_schedule.sport = 'nba'
     or (v_schedule.sport = 'ufc' and v_schedule.starts_on >= date '2026-10-25') then
    -- Must be an actual publication day; day 2 maps to the same board.
    v_index := (private.daily_challenge_active_day(p_day,v_schedule.sport) - v_schedule.anchor_day) / 2;
  end if;
  v_offset := ((v_index % v_length) + v_length) % v_length;
  return v_schedule.game_cycle[v_offset + 1];
end;
$fn$;

create or replace function public.get_daily_challenge_materialization_request(
 p_sport text,p_at timestamptz default now()
) returns jsonb language plpgsql stable security definer set search_path = '' as $fn$
declare v_today date;v_day date;v_version text;v_game text;v_daily private.daily_challenges;
begin
  if p_sport not in ('ufc','football','nba') then raise exception 'unsupported Daily Challenge sport %',coalesce(p_sport,'<null>');end if;
  v_today := private.daily_challenge_central_day(p_at);
  if p_sport = 'nba' and (v_today < date '2026-11-01' or v_today > date '2027-04-11') then
    raise exception 'NBA regular-season Daily is not currently available';
  end if;
  v_day := private.daily_challenge_active_day(v_today,p_sport);
  v_version := private.daily_challenge_schedule_for_day(v_day,p_sport);
  if v_version is null then raise exception 'no % daily challenge schedule is active for %',p_sport,v_day; end if;
  v_game := private.daily_challenge_expected_game(v_version,v_day);
  select * into v_daily from private.daily_challenges
  where central_day = v_day and schedule_version = v_version;
  return jsonb_build_object('required',v_daily.id is null,'central_day',v_day,
    'schedule_version',v_version,'expected_game',v_game,
    'daily_challenge_id',v_daily.id,'published_game',v_daily.game_type,
    'fallback_reason',v_daily.fallback_reason);
end;
$fn$;

-- Do not permit a retry or an old worker to generate extra 48-hour boards.
create or replace function private.enforce_future_daily_publication_cadence()
returns trigger language plpgsql set search_path = '' as $fn$
declare v_sport text; v_canonical text;
begin
  select sport into v_sport from private.daily_challenge_schedule_versions where version = new.schedule_version;
  if (v_sport = 'ufc' and new.central_day >= date '2026-10-25')
     or (v_sport = 'nba' and new.central_day >= date '2026-11-01') then
    if private.daily_challenge_active_day(new.central_day,v_sport) <> new.central_day then
      raise exception '% Daily cannot publish on a non-opening day %',v_sport,new.central_day;
    end if;
    v_canonical := private.daily_challenge_schedule_for_day(new.central_day,v_sport);
    if v_canonical is distinct from new.schedule_version then
      raise exception '% Daily schedule version is no longer canonical',v_sport;
    end if;
  end if;
  return new;
end;
$fn$;
drop trigger if exists enforce_future_daily_publication_cadence on private.daily_challenges;
create trigger enforce_future_daily_publication_cadence
before insert on private.daily_challenges for each row
execute function private.enforce_future_daily_publication_cadence();

-- Extend NBA's already-authoritative 48-hour write window to UFC only after cutover.
-- Transform current functions rather than cloning complex score/idempotency logic.
do $patch$
declare v_sig regprocedure; v_sql text;v_before text;v_after text;
begin
  foreach v_sig in array array[
    'public.save_daily_challenge_runtime_progress(uuid,uuid,integer,jsonb,jsonb)'::regprocedure,
    'public.submit_my_daily_challenge_attempt(uuid,jsonb)'::regprocedure
  ] loop
    v_sql := pg_get_functiondef(v_sig::oid);
    v_before := 'where schedule.version = v_daily.schedule_version and schedule.sport = ''nba'')';
    v_after := 'where schedule.version = v_daily.schedule_version and (schedule.sport = ''nba'' or (schedule.sport = ''ufc'' and v_daily.central_day >= date ''2026-10-25'')))';
    if position(v_before in v_sql) = 0 then raise exception '48-hour submission contract changed: %',v_sig; end if;
    execute replace(v_sql,v_before,v_after);
  end loop;

  -- The standings grouping ordinal must count UFC 48-hour rounds as one streak
  -- while connecting the published Oct 24 result to the first Oct 25 board.
  v_sig := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_sql := pg_get_functiondef(v_sig::oid);
  v_before := 'then (central_day - date ''2026-11-01'') / 2' || chr(10) ||
              '        else central_day - date ''2000-01-01''';
  v_after := 'then (central_day - date ''2026-11-01'') / 2' || chr(10) ||
             '        when p_sport = ''ufc'' and central_day >= date ''2026-10-25''' || chr(10) ||
             '        then (date ''2026-10-25'' - date ''2000-01-01'') + 1 + (central_day - date ''2026-10-25'') / 2' || chr(10) ||
             '        else central_day - date ''2000-01-01''';
  if position(v_before in v_sql)=0 then raise exception 'standings streak grouping contract changed';end if;
  v_sql := replace(v_sql,v_before,v_after);
  v_before := '       when exists (' || chr(10) || '         select 1 from history' || chr(10) ||
              '         where history.profile_id = profile.id' || chr(10) ||
              '           and history.central_day = v_today';
  v_after := '       when p_sport = ''ufc'' and v_today >= date ''2026-10-25'' then' || chr(10) ||
             '         case when exists (select 1 from history where history.profile_id = profile.id' || chr(10) ||
             '           and history.central_day = private.daily_challenge_active_day(v_today,''ufc''))' || chr(10) ||
             '           then private.daily_challenge_active_day(v_today,''ufc'')' || chr(10) ||
             '           when private.daily_challenge_active_day(v_today,''ufc'') = date ''2026-10-25''' || chr(10) ||
             '           then date ''2026-10-24''' || chr(10) ||
             '           else private.daily_challenge_active_day(v_today,''ufc'') - 2 end' || chr(10) ||
             '       when exists (' || chr(10) || '         select 1 from history' || chr(10) ||
             '         where history.profile_id = profile.id' || chr(10) ||
             '           and history.central_day = v_today';
  if position(v_before in v_sql)=0 then raise exception 'standings current-streak contract changed';end if;
  execute replace(v_sql,v_before,v_after);

  -- Canonical combined close reminders: Football nightly; UFC only on day 2.
  v_sig := 'private.publish_combined_daily_closing_reminder(uuid,text,text,text,text,text,timestamp with time zone)'::regprocedure;
  v_sql := pg_get_functiondef(v_sig::oid);
  v_before := 'where challenge.central_day = v_day' || chr(10) ||
              '        and schedule.sport in (''ufc'', ''football'')';
  v_after := 'where challenge.central_day = case when schedule.sport = ''ufc''' || chr(10) ||
             '        then private.daily_challenge_active_day(v_day,''ufc'') else v_day end' || chr(10) ||
             '        and schedule.sport in (''ufc'', ''football'')' || chr(10) ||
             '        and (schedule.sport <> ''ufc'' or v_day < date ''2026-10-25''' || chr(10) ||
             '          or v_day = private.daily_challenge_active_day(v_day,''ufc'') + 1)';
  if position(v_before in v_sql)=0 then raise exception 'combined UFC closing contract changed';end if;
  execute replace(v_sql,v_before,v_after);

  -- The NBA notification jobs must use the new authoritative future version.
  v_sig := 'public.dispatch_due_nba_notifications(timestamp with time zone)'::regprocedure;
  v_sql := pg_get_functiondef(v_sig::oid);
  if position('nba-daily-regular-v1' in v_sql)=0 then raise exception 'NBA notification version changed';end if;
  execute replace(v_sql,'nba-daily-regular-v1','nba-daily-regular-v2-locked');
  v_sig := 'private.publish_combined_daily_closing_reminder(uuid,text,text,text,text,text,timestamp with time zone)'::regprocedure;
  v_sql := pg_get_functiondef(v_sig::oid);
  if position('nba-daily-regular-v1' in v_sql)=0 then raise exception 'combined NBA version changed';end if;
  execute replace(v_sql,'nba-daily-regular-v1','nba-daily-regular-v2-locked');
end
$patch$;

-- Existing UFC streak history remains daily before Oct 25; the new 48-hour
-- section is counted in appearance units without rewriting old streaks.
create or replace function public.get_my_daily_challenge_streak(p_sport text)
returns jsonb language plpgsql stable security definer set search_path = '' as $fn$
declare v_profile uuid := auth.uid();v_today date := private.daily_challenge_central_day(now());
 v_day date;v_previous date;v_expected date;v_active date;v_step integer;
 v_run integer := 0;v_best integer := 0;v_current integer := 0;
begin
 if v_profile is null then raise exception 'sign in required';end if;
 if p_sport not in ('ufc','football','nba','nba_preview') then raise exception 'unsupported Daily Challenge sport %',p_sport;end if;
 if p_sport = 'nba_preview' and not exists (
   select 1 from public.pick_control_owners o join public.profiles p on p.id=o.profile_id
   where o.profile_id=auth.uid() and p.normalized_name='CODY'
 ) then raise exception 'NBA prelaunch tests are restricted to the HQ owner';end if;
 for v_day in select distinct h.central_day from private.daily_challenge_history h
   join private.daily_challenge_schedule_versions s on s.version=h.schedule_version
   where h.profile_id=v_profile and s.sport=p_sport order by h.central_day
 loop
   v_step := case when p_sport='nba' then 2
       when p_sport='ufc' and v_day>date '2026-10-25' then 2 else 1 end;
   if v_previous is null or v_day=v_previous+v_step then v_run:=v_run+1;else v_run:=1;end if;
   v_best:=greatest(v_best,v_run);v_previous:=v_day;
 end loop;
 v_active := case when p_sport in ('ufc','nba') then private.daily_challenge_active_day(v_today,p_sport) else v_today end;
 v_step := case when p_sport='nba' or (p_sport='ufc' and v_active>date '2026-10-25') then 2 else 1 end;
 if exists(select 1 from private.daily_challenge_history h
   join private.daily_challenge_schedule_versions s on s.version=h.schedule_version
   where h.profile_id=v_profile and s.sport=p_sport and h.central_day=v_active)
 then v_expected:=v_active;else v_expected:=v_active-v_step;end if;
 for v_day in select distinct h.central_day from private.daily_challenge_history h
   join private.daily_challenge_schedule_versions s on s.version=h.schedule_version
   where h.profile_id=v_profile and s.sport=p_sport and h.central_day<=v_expected
   order by h.central_day desc
 loop
   exit when v_day<>v_expected;
   v_current:=v_current+1;
   v_step:=case when p_sport='nba' or (p_sport='ufc' and v_expected>date '2026-10-25') then 2 else 1 end;
   v_expected:=v_expected-v_step;
 end loop;
 return jsonb_build_object('current_streak',v_current,'best_streak',v_best);
end;
$fn$;

-- Fail closed if another migration accidentally reactivates an unfinished game,
-- modifies weights or breaks alternation.
do $verify$
declare v_f text[];v_u text[];v_n text[];v_day date;v_expected text;
begin
 select game_cycle into strict v_f from private.daily_challenge_schedule_versions where version='football-daily-v21-locked-oct25';
 select game_cycle into strict v_u from private.daily_challenge_schedule_versions where version='ufc-daily-v21-48h-oct25';
 select game_cycle into strict v_n from private.daily_challenge_schedule_versions where version='nba-daily-regular-v2-locked';
 if cardinality(v_f)<>26 or cardinality(v_u)<>28 or cardinality(v_n)<>28 then raise exception 'locked weights have wrong cycle lengths';end if;
 if 'higher_lower'=any(v_f) or 'higher_lower'=any(v_u) then raise exception 'unfinished Higher or Lower was activated';end if;
 if (select count(*) from unnest(v_f) as g where g='average_fan')<>4
   or (select count(*) from unnest(v_u) as g where g='average_fan')<>4
   or (select count(*) from unnest(v_f) as g where g='hit_the_number')<>2
   or (select count(*) from unnest(v_u) as g where g='hit_the_number')<>2
 then raise exception 'approved Football/UFC weights changed';end if;
 for v_day in select d::date from generate_series(date '2026-10-25',date '2027-04-24', interval '1 day') d loop
   if private.daily_challenge_schedule_for_day(v_day,'football') <> 'football-daily-v21-locked-oct25' then raise exception 'missing Football day %',v_day;end if;
   if private.daily_challenge_active_day(v_day,'ufc') <> date '2026-10-25' + (((v_day-date '2026-10-25')/2)*2) then raise exception 'UFC cadence drift %',v_day;end if;
   if v_day between date '2026-11-01' and date '2027-04-11'
     and private.daily_challenge_active_day(v_day,'nba') <> date '2026-11-01' + (((v_day-date '2026-11-01')/2)*2)
     then raise exception 'NBA cadence drift %',v_day;end if;
 end loop;
end
$verify$;
