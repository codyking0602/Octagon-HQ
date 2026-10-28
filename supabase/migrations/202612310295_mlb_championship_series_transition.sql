-- Advance the 2026 MLB postseason to the ALCS / NLCS after verified
-- Division Series finals. Preserve every prior bracket and round pick.
-- Official final results: CLE over CWS 3-2, TB over NYY 3-0,
-- LAD over ATL 3-1, MIL over SD 3-1 (MLB, October 10).
-- Championship Series winner moneylines: DraftKings, October 10, 2026.
-- One-time pick lock: Sunday October 11 at 7:00 PM America/Chicago.

do $mlb_cs$
declare
  v_changed integer;
begin
  if (select count(*) from public.mlb_playoff_seasons
      where season=2026 and public_enabled and field_ready
        and current_round in ('division_series','championship_series')) <> 1 then
    raise exception '2026 MLB season is not ready for CS transition';
  end if;

  if (select count(*) from public.mlb_playoff_series
      where season=2026 and round='division_series') <> 4 then
    raise exception 'expected exactly four Division Series';
  end if;

  if exists (
    select 1 from (values
      ('al-ds-1'::text,'nyy'::text,'tb'::text),
      ('al-ds-2','cws','cle'),
      ('nl-ds-1','sd','mil'),
      ('nl-ds-2','atl','lad')
    ) as expected(series_id, team_a_id, team_b_id)
    left join public.mlb_playoff_series s
      on s.series_id=expected.series_id and s.season=2026
    where s.series_id is null
       or s.team_a_id<>expected.team_a_id
       or s.team_b_id<>expected.team_b_id
  ) then
    raise exception 'Division Series identities differ from verified field';
  end if;

  update public.mlb_playoff_series as series_row
     set status='complete',
         winner_team_id=result.winner_id,
         series_score=result.final_score,
         updated_at=now()
    from (values
      ('al-ds-1'::text,'tb'::text,'TB 3–0 NYY'::text),
      ('al-ds-2','cle','CLE 3–2 CWS'),
      ('nl-ds-1','mil','MIL 3–1 SD'),
      ('nl-ds-2','lad','LAD 3–1 ATL')
    ) as result(series_id,winner_id,final_score)
   where series_row.season=2026
     and series_row.round='division_series'
     and series_row.series_id=result.series_id;
  get diagnostics v_changed=row_count;
  if v_changed<>4 then
    raise exception 'expected to close four Division Series, updated %',v_changed;
  end if;

  insert into public.mlb_playoff_series (
    series_id,season,round,league,label,
    team_a_id,team_a_name,team_b_id,team_b_name,
    starts_at,picks_lock_at,status,winner_team_id,series_score,
    schedule,position,team_a_moneyline,team_b_moneyline,
    odds_source,odds_updated_at,updated_at
  ) values
  (
    'nl-cs',2026,'championship_series','NL','NLCS · Best of 7',
    'lad','Los Angeles Dodgers','mil','Milwaukee Brewers',
    timestamptz '2026-10-12 00:00:00+00',
    timestamptz '2026-10-12 00:00:00+00',
    'scheduled',null,null,
    jsonb_build_array(
      'G1 · Sun Oct 11 · 7:00 PM CT · FOX',
      'G2 · Mon Oct 12 · 4:00 PM CT · FOX/FS1',
      'G3 · Wed Oct 14 · 7:00 PM CT · FS1',
      'G4 · Thu Oct 15 · 8:00 PM CT · FS1',
      'G5 · Fri Oct 16 · 8:00 PM CT · FS1 · IF NEEDED',
      'G6 · Sun Oct 18 · 7:00 PM CT · FS1 · IF NEEDED',
      'G7 · Mon Oct 19 · 7:00 PM CT · FOX/FS1 · IF NEEDED'
    ),10,-160,130,
    'DraftKings series winner · frozen Oct 10',
    timestamptz '2026-10-11 02:54:00+00',now()
  ),
  (
    'al-cs',2026,'championship_series','AL','ALCS · Best of 7',
    'cle','Cleveland Guardians','tb','Tampa Bay Rays',
    timestamptz '2026-10-13 00:00:00+00',
    timestamptz '2026-10-12 00:00:00+00',
    'scheduled',null,null,
    jsonb_build_array(
      'G1 · Mon Oct 12 · 7:00 PM CT · TBS',
      'G2 · Tue Oct 13 · 7:00 PM CT · TBS',
      'G3 · Thu Oct 15 · 5:00 PM CT · TBS',
      'G4 · Fri Oct 16 · 5:00 PM CT · TBS',
      'G5 · Sat Oct 17 · 7:00 PM CT · TBS · IF NEEDED',
      'G6 · Mon Oct 19 · 4:00 PM CT · TBS · IF NEEDED',
      'G7 · Tue Oct 20 · 7:00 PM CT · TBS · IF NEEDED'
    ),9,140,-170,
    'DraftKings series winner · frozen Oct 10',
    timestamptz '2026-10-11 03:00:00+00',now()
  )
  on conflict (series_id) do update set
    season=excluded.season,
    round=excluded.round,
    league=excluded.league,
    label=excluded.label,
    team_a_id=excluded.team_a_id,
    team_a_name=excluded.team_a_name,
    team_b_id=excluded.team_b_id,
    team_b_name=excluded.team_b_name,
    starts_at=excluded.starts_at,
    picks_lock_at=excluded.picks_lock_at,
    schedule=excluded.schedule,
    position=excluded.position,
    team_a_moneyline=excluded.team_a_moneyline,
    team_b_moneyline=excluded.team_b_moneyline,
    odds_source=excluded.odds_source,
    odds_updated_at=excluded.odds_updated_at,
    updated_at=now()
  where public.mlb_playoff_series.winner_team_id is null
    and public.mlb_playoff_series.status<>'complete';

  update public.mlb_playoff_seasons
     set current_round='championship_series',
         spotlight=jsonb_build_object(
           'series_id','nl-cs',
           'title','Dodgers vs. Brewers',
           'round','NL CHAMPIONSHIP SERIES',
           'status','Championship Series · Best of 7',
           'overview','The 100-win Dodgers face the 103-win Brewers in a rematch of the 2025 NLCS. Milwaukee took the 2026 regular-season series 4-3; Los Angeles swept their postseason meeting a year ago.',
           'keys',jsonb_build_array(
             'Milwaukee owns home-field advantage after a 103-win regular season',
             'Los Angeles is chasing a third straight World Series title'
           ),
           'player_to_watch','Shohei Ohtani',
           'player_context','Los Angeles Dodgers · two-way postseason centerpiece',
           'stats',jsonb_build_array(
             'Milwaukee won 103 regular-season games',
             'Brewers took the 2026 season series 4-3',
             'Dodgers swept the 2025 NLCS 4-0'
           )
         ),
         updated_at=now()
   where season=2026 and public_enabled and field_ready;
  get diagnostics v_changed=row_count;
  if v_changed<>1 then
    raise exception 'expected to advance one live 2026 season, updated %',v_changed;
  end if;

  if (select count(*) from public.mlb_playoff_series
      where season=2026 and round='championship_series'
        and status='scheduled' and winner_team_id is null
        and picks_lock_at=timestamptz '2026-10-12 00:00:00+00'
        and team_a_moneyline is not null and team_b_moneyline is not null
    )<>2 then
    raise exception '2026 CS pairs, frozen odds or 7pm CT lock incomplete';
  end if;
end;
$mlb_cs$;

-- Existing canonical round-pick RPCs enforce picks_lock_at and hide other
-- participants' selections until that time. No RPC or bracket rewrite needed.
-- The notification scheduler observes completed DS + published CS series.
notify pgrst, 'reload schema';
