-- One-time owner-approved Oct 27 NFL GOTW replacement. Never alter CFB or Spotlights.
-- The armed-content immutability guard is narrowly extended only WITHIN THIS TRANSACTION
-- and restored before COMMIT; an immutable before/after audit receipt is retained.
create table if not exists public.football_weekly_owner_corrections (
  week_of date not null, sport text not null, recorded_at timestamptz not null default now(),
  approval text not null, prior_state jsonb not null, corrected_state jsonb not null,
  primary key (week_of,sport),
  constraint valid_owner_correction_sport check (sport in ('cfb','nfl'))
);
alter table public.football_weekly_owner_corrections enable row level security;
revoke all on public.football_weekly_owner_corrections from public, anon, authenticated;
create or replace function public.guard_armed_football_editorial()
returns trigger language plpgsql set search_path = '' as $guard$
declare v_sport text;
begin
  foreach v_sport in array array['cfb','nfl'] loop
    if old.production->v_sport->>'ready_at' is not null then
      -- Controlled one-time owner correction: can change only the selected NFL GOTW
      -- on Oct 27, while preserving readiness, player, and the CFB package.
      if v_sport = 'nfl'
        and current_setting('octagon.approved_oct27_swap',true) = 'bears-at-seahawks'
        and old.week_of = date '2026-10-27'
        and old.choices->'nfl'->'game'->>'id' = 'browns-at-steelers'
        and new.choices->'nfl'->'game'->>'id' = 'bears-at-seahawks'
        and new.choices->'nfl'->'player' is not distinct from old.choices->'nfl'->'player'
        and new.nfl_spotlight is not distinct from old.nfl_spotlight
        and new.production->'nfl'->>'ready_at' = old.production->'nfl'->>'ready_at'
        and new.production->'nfl'->'media_verification' is not distinct from old.production->'nfl'->'media_verification'
        and new.production->'nfl'->>'player_id' = 'cam-skattebo'
        and old.production->'nfl'->>'published_at' is null
        and now() < ((old.week_of::timestamp + interval '8 hours') at time zone 'America/Chicago')
      then continue; end if;
      if (case when v_sport='cfb' then new.cfb_spotlight else new.nfl_spotlight end)
           is distinct from
         (case when v_sport='cfb' then old.cfb_spotlight else old.nfl_spotlight end)
        or (case when v_sport='cfb' then new.cfb_game_of_week else new.nfl_game_of_week end)
           is distinct from
           (case when v_sport='cfb' then old.cfb_game_of_week else old.nfl_game_of_week end)
        or new.choices->v_sport is distinct from old.choices->v_sport
        or new.proposals->v_sport is distinct from old.proposals->v_sport
        or ((new.production->v_sport) - 'published_at') is distinct from
           ((old.production->v_sport) - 'published_at') then
        raise exception 'Armed Football editorial % is immutable',v_sport;
      end if;
    end if;
  end loop;
  return new;
end;
$guard$;
do $correction$
declare
  v_before public.football_weekly_content_packages%rowtype;
  v_after public.football_weekly_content_packages%rowtype;
  v_new jsonb := '{"id":"bears-at-seahawks","away_team":"Chicago Bears","home_team":"Seattle Seahawks","kickoff_at":"2026-11-02T19:15:00-06:00","summary":"The 5–2 Bears visit the 4–3 Seahawks at Lumen Field on Monday Night Football, after Chicago beat New England 30–24 and Seattle held Kansas City to three points."}'::jsonb;
  v_game jsonb := '{"away_team":"Chicago Bears","home_team":"Seattle Seahawks","kickoff_at":"2026-11-02T19:15:00-06:00"}'::jsonb;
  v_breakdown jsonb := '{"setup":["Chicago travels to Seattle at 5–2 after a 30–24 win over New England, while the 4–3 Seahawks just held previously unbeaten Kansas City to three points. Caleb Williams and the Bears bring a passing attack producing explosive plays, but Seattle''s defense showed how effectively it can disrupt a top quarterback and keep opponents off the scoreboard."],"things":[{"title":"Caleb Williams against Seattle’s defense","body":"Williams threw for 308 yards and two touchdowns against New England, including several chunk gains to Chicago''s receivers. Seattle held Patrick Mahomes to 165 passing yards and forced an interception against Kansas City. Protection and avoiding long-yardage downs are central to keeping Chicago''s offense moving."},{"title":"Containing Jaxon Smith-Njigba","body":"Smith-Njigba caught nine passes for 150 yards and a touchdown against the Chiefs, taking his season totals to 867 receiving yards and eight scores. The Bears must decide how much coverage help to commit to Seattle''s top target without creating room for Sam Darnold''s other options."},{"title":"Who controls the ground game?","body":"Emanuel Wilson rushed for 100 yards and a touchdown in Seattle''s win over Kansas City. Chicago got a rushing touchdown from D''Andre Swift against New England, but sustaining early-down gains on the road matters especially with Seattle''s pass defense coming off a dominant outing."}],"bottom_line":"Seattle''s defense and Smith-Njigba''s explosive receiving challenge Chicago on both sides of the ball. The matchup turns on whether Williams can find consistent protection and explosive throws while the Bears keep Seattle balanced rather than letting its passing game dictate field position."}'::jsonb;
  v_urls jsonb := '["https://www.chicagobears.com/schedule/2026/","https://www.seahawks.com/schedule/","https://www.chicagobears.com/news/game-recap-bears-knock-off-patriots-on-thursday-night-football-improve-to-5-2","https://www.seahawks.com/news/rapid-reactions-seahawks-defense-shines-in-dominant-20-3-victory-over-chiefs","https://www.seahawks.com/news/seahawks-receiver-jaxon-smith-njigba-adds-another-tremendous-game-to-his-2026-season","https://www.giants.com/team/players-roster/cam-skattebo/logs/"]'::jsonb;
  v_games jsonb;
  v_count integer;
begin
  select * into v_before from public.football_weekly_content_packages
    where week_of=date '2026-10-27' for update;
  if not found then return; end if; -- Empty CI database.
  if v_before.choices->'nfl'->'game'->>'id'='bears-at-seahawks' then
    if v_before.nfl_game_of_week is distinct from v_game
       or v_before.production->'nfl'->'breakdown' is distinct from v_breakdown
       or v_before.production->'nfl'->'source_urls' is distinct from v_urls then
       raise exception 'Previously corrected NFL package drifted from approved content';
    end if;
    return; -- Idempotent migration replay.
  end if;
  if v_before.status <> 'ready'
    or v_before.choices->'nfl'->'game'->>'id' <> 'browns-at-steelers'
    or v_before.choices->'nfl'->'player'->>'id' <> 'cam-skattebo'
    or v_before.choices->'cfb'->'game'->>'id' <> 'miami-at-north-carolina'
    or v_before.choices->'cfb'->'player'->>'id' <> 'keyone-jenkins'
    or v_before.production->'nfl'->>'ready_at' is null
    or v_before.production->'nfl'->>'published_at' is not null
    or v_before.production->'nfl'->>'player_id' <> 'cam-skattebo'
    or now() >= ((v_before.week_of::timestamp + interval '8 hours') at time zone 'America/Chicago')
  then raise exception 'NFL Oct 27 correction preconditions do not match live owner approval'; end if;
  v_games := v_before.proposals #> '{nfl,games}';
  if jsonb_typeof(v_games) is distinct from 'array' or jsonb_array_length(v_games) <> 5
    or (select count(*) from jsonb_array_elements(v_games) g where g->>'id'='browns-at-steelers') <> 1
    or (select count(*) from jsonb_array_elements(v_games) g where g->>'id'='bears-at-seahawks') <> 0
  then raise exception 'Expected unique original NFL candidate is missing'; end if;
  select jsonb_agg(case when g->>'id'='browns-at-steelers' then v_new else g end order by ord)
    into v_games from jsonb_array_elements(v_games) with ordinality as x(g,ord);
  perform set_config('octagon.approved_oct27_swap','bears-at-seahawks',true);
  update public.football_weekly_content_packages p
    set proposals=jsonb_set(p.proposals,'{nfl,games}',v_games,false),
        choices=jsonb_set(jsonb_set(p.choices,'{nfl,game}',v_new,false),
            '{nfl,correction}',jsonb_build_object('prior_game_id','browns-at-steelers',
            'approved_game_id','bears-at-seahawks','corrected_at',now(),
            'reason','Owner explicitly replaced Oct 27 NFL GOTW'),true),
        nfl_game_of_week=v_game,
        production=jsonb_set(jsonb_set(jsonb_set(p.production,'{nfl,game_id}',
            to_jsonb('bears-at-seahawks'::text),false),'{nfl,breakdown}',v_breakdown,false),
            '{nfl,source_urls}',v_urls,false),
        updated_at=now()
    where p.week_of=date '2026-10-27' and p.status='ready'
    returning * into v_after;
  if not found then raise exception 'Owner correction update did not commit'; end if;
  if v_after.choices->'cfb' is distinct from v_before.choices->'cfb'
     or v_after.proposals->'cfb' is distinct from v_before.proposals->'cfb'
     or v_after.production->'cfb' is distinct from v_before.production->'cfb'
     or v_after.cfb_spotlight is distinct from v_before.cfb_spotlight
     or v_after.cfb_game_of_week is distinct from v_before.cfb_game_of_week
     or v_after.nfl_spotlight is distinct from v_before.nfl_spotlight
     or v_after.production->'nfl'->>'ready_at' is distinct from v_before.production->'nfl'->>'ready_at'
     or v_after.production->'nfl'->'media_verification' is distinct from v_before.production->'nfl'->'media_verification'
     or v_after.choices->'nfl'->'player' is distinct from v_before.choices->'nfl'->'player'
  then raise exception 'Correction changed a protected CFB/Spotlight/readiness field'; end if;
  insert into public.football_weekly_owner_corrections
      (week_of,sport,approval,prior_state,corrected_state)
    values(date '2026-10-27','nfl',
      'Owner-approved Bears–Seahawks substitution preserving Cam Skattebo, CFB, and 8AM release',
      jsonb_build_object('proposals',v_before.proposals->'nfl','choice',v_before.choices->'nfl',
        'game',v_before.nfl_game_of_week,'production',v_before.production->'nfl'),
      jsonb_build_object('proposals',v_after.proposals->'nfl','choice',v_after.choices->'nfl',
        'game',v_after.nfl_game_of_week,'production',v_after.production->'nfl'));
end $correction$;
create or replace function public.guard_armed_football_editorial()
returns trigger language plpgsql set search_path = '' as $guard$
declare v_sport text;
begin
  foreach v_sport in array array['cfb','nfl'] loop
    if old.production->v_sport->>'ready_at' is not null then
      if (case when v_sport='cfb' then new.cfb_spotlight else new.nfl_spotlight end)
           is distinct from
         (case when v_sport='cfb' then old.cfb_spotlight else old.nfl_spotlight end)
        or (case when v_sport='cfb' then new.cfb_game_of_week else new.nfl_game_of_week end)
           is distinct from
           (case when v_sport='cfb' then old.cfb_game_of_week else old.nfl_game_of_week end)
        or new.choices->v_sport is distinct from old.choices->v_sport
        or new.proposals->v_sport is distinct from old.proposals->v_sport
        or ((new.production->v_sport) - 'published_at') is distinct from
           ((old.production->v_sport) - 'published_at') then
        raise exception 'Armed Football editorial % is immutable',v_sport;
      end if;
    end if;
  end loop;
  return new;
end;
$guard$;
-- The prior immutable-game guard is restored before commit.

-- Already-armed signed manifests are safe to replay only as exact read-only receipts.
create or replace function public.ingest_football_weekly_editorial_preparation(
  p_week_of date,p_sport text,p_spotlight jsonb,p_game jsonb,p_editorial jsonb,
  p_actor_id text,p_source_sha text
) returns jsonb language plpgsql security definer set search_path='' as $handoff$
declare
  v_saved jsonb;
  v_row public.football_weekly_content_packages%rowtype;
  v_prod jsonb;
  v_spotlight jsonb;
  v_game jsonb;
begin
  if auth.role() is distinct from 'service_role' or p_actor_id <> '284170760'
    or coalesce(p_source_sha,'') !~ '^[0-9a-f]{40}$'
    or p_week_of is null or now() >= ((p_week_of + 7)::timestamp at time zone 'America/Chicago')
    or p_sport not in ('cfb','nfl') then
    raise exception 'Owner-signed editorial preparation authorization required';
  end if;
  select * into v_row from public.football_weekly_content_packages
    where week_of=p_week_of for update;
  if not found then raise exception 'Canonical weekly package does not exist'; end if;
  if v_row.production->p_sport->>'ready_at' is not null then
    v_prod := v_row.production->p_sport;
    v_spotlight := case when p_sport='nfl' then v_row.nfl_spotlight else v_row.cfb_spotlight end;
    v_game := case when p_sport='nfl' then v_row.nfl_game_of_week else v_row.cfb_game_of_week end;
    if v_spotlight is distinct from p_spotlight or v_game is distinct from p_game
      or v_prod->'breakdown' is distinct from p_editorial->'breakdown'
      or v_prod->'source_urls' is distinct from p_editorial->'source_urls'
      or v_prod->>'player_id' is distinct from v_row.choices->p_sport->'player'->>'id'
      or v_prod->>'game_id' is distinct from v_row.choices->p_sport->'game'->>'id' then
      raise exception 'Armed editorial cannot be edited via signed handoff';
    end if;
    return to_jsonb(v_row);
  end if;
  v_saved := public.prepare_football_weekly_editorial(p_week_of,p_sport,p_spotlight,p_game,p_editorial);
  if v_saved->'production'->p_sport->>'prepared_at' is null then
    raise exception 'Canonical editorial preparation readback failed';
  end if;
  return v_saved;
end;
$handoff$;
revoke all on function public.ingest_football_weekly_editorial_preparation(date,text,jsonb,jsonb,jsonb,text,text) from public,anon,authenticated;
grant execute on function public.ingest_football_weekly_editorial_preparation(date,text,jsonb,jsonb,jsonb,text,text) to service_role;
notify pgrst,'reload schema';
