-- PR 7: canonical generalized Today's Challenge backend.
create schema if not exists private;

create table if not exists private.daily_challenge_setups (
  id uuid primary key default extensions.gen_random_uuid(),
  game_type text not null check (game_type in ('find_leader','blind_resume','wavelength','blind_rank_5','keep_4_cut_4')),
  setup_key text not null,
  content_version text not null,
  scoring_version text not null,
  public_setup jsonb not null default '{}'::jsonb,
  private_setup_evidence jsonb not null default '{}'::jsonb,
  private_grading_evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (game_type, setup_key, content_version, scoring_version)
);

create table if not exists public.daily_challenges (
  id uuid primary key default extensions.gen_random_uuid(),
  central_day date not null,
  schedule_version text not null,
  game_type text not null check (game_type in ('find_leader','blind_resume','wavelength','blind_rank_5','keep_4_cut_4')),
  setup_id uuid not null references private.daily_challenge_setups(id),
  content_version text not null,
  scoring_version text not null,
  fallback_reason text,
  published_at timestamptz not null default now(),
  unique (schedule_version, central_day),
  unique (schedule_version, central_day, game_type)
);

create table if not exists private.daily_challenge_attempts (
  id uuid primary key default extensions.gen_random_uuid(),
  daily_challenge_id uuid not null references public.daily_challenges(id),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  attempt_kind text not null check (attempt_kind in ('official_first','replay')),
  native_score integer not null,
  normalized_score integer not null check (normalized_score between 0 and 100),
  completed_at timestamptz not null default now(),
  content_version text not null,
  scoring_version text not null,
  public_result jsonb not null default '{}'::jsonb,
  private_grading_evidence jsonb not null default '{}'::jsonb,
  legacy_find_leader_day date,
  created_at timestamptz not null default now(),
  unique (daily_challenge_id, profile_id, attempt_kind) deferrable initially immediate
);

create unique index if not exists daily_challenge_one_official_attempt
  on private.daily_challenge_attempts(daily_challenge_id, profile_id)
  where attempt_kind = 'official_first';

alter table private.daily_challenge_setups enable row level security;
alter table public.daily_challenges enable row level security;
alter table private.daily_challenge_attempts enable row level security;

revoke all on private.daily_challenge_setups from public, anon, authenticated;
revoke all on private.daily_challenge_attempts from public, anon, authenticated;
grant select on public.daily_challenges to authenticated;

drop policy if exists daily_challenges_authenticated_public_projection on public.daily_challenges;
create policy daily_challenges_authenticated_public_projection
  on public.daily_challenges for select to authenticated using (true);

create or replace function private.daily_challenge_central_day(p_at timestamptz default now())
returns date language sql stable set search_path = '' as $$
  select (p_at at time zone 'America/Chicago')::date;
$$;

create or replace function private.daily_challenge_normalized_score(p_game_type text, p_native_score integer)
returns integer language plpgsql immutable set search_path = '' as $$
begin
  if p_game_type = 'find_leader' then return greatest(0, least(100, p_native_score * 10)); end if;
  if p_game_type = 'blind_resume' then return greatest(0, least(100, p_native_score * 20)); end if;
  if p_game_type in ('wavelength','blind_rank_5','keep_4_cut_4') then return greatest(0, least(100, p_native_score)); end if;
  raise exception 'unsupported daily game type %', p_game_type;
end; $$;

create or replace function public.publish_daily_challenge_setup(
  p_central_day date,
  p_schedule_version text,
  p_game_type text,
  p_setup_key text,
  p_content_version text,
  p_scoring_version text,
  p_public_setup jsonb default '{}'::jsonb,
  p_private_setup_evidence jsonb default '{}'::jsonb,
  p_private_grading_evidence jsonb default '{}'::jsonb,
  p_fallback_reason text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_setup_id uuid; v_daily public.daily_challenges;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required to publish daily challenge setup'; end if;
  if p_game_type not in ('find_leader','blind_resume','wavelength','blind_rank_5','keep_4_cut_4') then raise exception 'unsupported daily game type %', p_game_type; end if;
  insert into private.daily_challenge_setups(game_type,setup_key,content_version,scoring_version,public_setup,private_setup_evidence,private_grading_evidence)
  values (p_game_type,p_setup_key,p_content_version,p_scoring_version,coalesce(p_public_setup,'{}'::jsonb),coalesce(p_private_setup_evidence,'{}'::jsonb),coalesce(p_private_grading_evidence,'{}'::jsonb))
  on conflict (game_type, setup_key, content_version, scoring_version) do update set public_setup = excluded.public_setup
  returning id into v_setup_id;

  insert into public.daily_challenges(central_day,schedule_version,game_type,setup_id,content_version,scoring_version,fallback_reason)
  values (p_central_day,p_schedule_version,p_game_type,v_setup_id,p_content_version,p_scoring_version,p_fallback_reason)
  on conflict (schedule_version, central_day) do update
    set game_type = excluded.game_type,
        setup_id = excluded.setup_id,
        content_version = excluded.content_version,
        scoring_version = excluded.scoring_version,
        fallback_reason = excluded.fallback_reason
  returning * into v_daily;

  return jsonb_build_object('id',v_daily.id,'central_day',v_daily.central_day,'schedule_version',v_daily.schedule_version,'game_type',v_daily.game_type,'setup_id',v_daily.setup_id,'content_version',v_daily.content_version,'scoring_version',v_daily.scoring_version,'fallback_reason',v_daily.fallback_reason);
end; $$;

create or replace function public.get_today_challenge_public(p_at timestamptz default now(), p_schedule_version text default 'find-leader-v1')
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_profile uuid := auth.uid(); v_day date := private.daily_challenge_central_day(p_at); v_daily public.daily_challenges; v_setup jsonb; v_attempt private.daily_challenge_attempts;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  select * into v_daily from public.daily_challenges where central_day = v_day and schedule_version = p_schedule_version;
  if v_daily.id is null then return jsonb_build_object('central_day',v_day,'schedule_version',p_schedule_version,'available',false); end if;
  select public_setup into v_setup from private.daily_challenge_setups where id = v_daily.setup_id;
  select * into v_attempt from private.daily_challenge_attempts where daily_challenge_id = v_daily.id and profile_id = v_profile and attempt_kind = 'official_first';
  return jsonb_build_object('available',true,'id',v_daily.id,'central_day',v_daily.central_day,'schedule_version',v_daily.schedule_version,'game_type',v_daily.game_type,'setup_id',v_daily.setup_id,'content_version',v_daily.content_version,'scoring_version',v_daily.scoring_version,'public_setup',coalesce(v_setup,'{}'::jsonb),'official_attempt',case when v_attempt.id is null then null else jsonb_build_object('native_score',v_attempt.native_score,'normalized_score',v_attempt.normalized_score,'completed_at',v_attempt.completed_at,'public_result',v_attempt.public_result) end);
end; $$;

create or replace function public.record_my_daily_challenge_attempt(p_daily_challenge_id uuid,p_native_score integer,p_public_result jsonb default '{}'::jsonb,p_private_grading_evidence jsonb default '{}'::jsonb,p_completed_at timestamptz default now())
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_profile uuid := auth.uid(); v_daily public.daily_challenges; v_official private.daily_challenge_attempts; v_replay private.daily_challenge_attempts; v_norm integer;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  select * into v_daily from public.daily_challenges where id = p_daily_challenge_id;
  if v_daily.id is null then raise exception 'daily challenge not found'; end if;
  v_norm := private.daily_challenge_normalized_score(v_daily.game_type,p_native_score);
  insert into private.daily_challenge_attempts(daily_challenge_id,profile_id,attempt_kind,native_score,normalized_score,completed_at,content_version,scoring_version,public_result,private_grading_evidence)
  values (v_daily.id,v_profile,'official_first',p_native_score,v_norm,p_completed_at,v_daily.content_version,v_daily.scoring_version,coalesce(p_public_result,'{}'::jsonb),coalesce(p_private_grading_evidence,'{}'::jsonb))
  on conflict (daily_challenge_id, profile_id) where attempt_kind = 'official_first' do nothing
  returning * into v_official;
  if v_official.id is not null then
    return jsonb_build_object('attempt_kind','official_first','native_score',v_official.native_score,'normalized_score',v_official.normalized_score,'completed_at',v_official.completed_at,'content_version',v_official.content_version,'scoring_version',v_official.scoring_version);
  end if;
  select * into v_official from private.daily_challenge_attempts where daily_challenge_id = v_daily.id and profile_id = v_profile and attempt_kind = 'official_first';
  insert into private.daily_challenge_attempts(daily_challenge_id,profile_id,attempt_kind,native_score,normalized_score,completed_at,content_version,scoring_version,public_result,private_grading_evidence)
  values (v_daily.id,v_profile,'replay',p_native_score,v_norm,p_completed_at,v_daily.content_version,v_daily.scoring_version,coalesce(p_public_result,'{}'::jsonb),coalesce(p_private_grading_evidence,'{}'::jsonb))
  on conflict (daily_challenge_id, profile_id, attempt_kind) do update set native_score = excluded.native_score, normalized_score = excluded.normalized_score, completed_at = excluded.completed_at, public_result = excluded.public_result, private_grading_evidence = excluded.private_grading_evidence
  returning * into v_replay;
  return jsonb_build_object('attempt_kind','replay','official_native_score',v_official.native_score,'official_normalized_score',v_official.normalized_score,'replay_native_score',v_replay.native_score,'replay_normalized_score',v_replay.normalized_score,'content_version',v_official.content_version,'scoring_version',v_official.scoring_version);
end; $$;

create or replace view public.daily_challenge_history as
select daily.central_day, daily.schedule_version, daily.game_type, attempt.profile_id, attempt.native_score, attempt.normalized_score, attempt.completed_at, attempt.content_version, attempt.scoring_version, attempt.public_result
from private.daily_challenge_attempts attempt join public.daily_challenges daily on daily.id = attempt.daily_challenge_id
where attempt.attempt_kind = 'official_first';

revoke all on public.daily_challenge_history from public, anon, authenticated;

create or replace function public.list_my_daily_challenge_history()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_profile uuid := auth.uid();
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('day',h.central_day,'schedule_version',h.schedule_version,'game_type',h.game_type,'native_score',h.native_score,'normalized_score',h.normalized_score,'completed_at',h.completed_at,'content_version',h.content_version,'scoring_version',h.scoring_version,'public_result',h.public_result) order by h.central_day desc) from public.daily_challenge_history h where h.profile_id = v_profile),'[]'::jsonb);
end; $$;

create or replace function public.get_daily_challenge_leaderboard(p_day date,p_schedule_version text default 'find-leader-v1')
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_profile uuid := auth.uid(); v_entries jsonb; v_count int;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if not exists (select 1 from public.daily_challenge_history h where h.profile_id=v_profile and h.central_day=p_day and h.schedule_version=p_schedule_version) then return jsonb_build_object('unlocked',false,'player_count',0,'entries','[]'::jsonb); end if;
  with ranked as (
    select h.profile_id, p.display_name, p.initials, pref.avatar_photo_data, h.game_type, h.native_score, h.normalized_score, rank() over(order by h.normalized_score desc)::int as score_rank
    from public.daily_challenge_history h join public.profiles p on p.id=h.profile_id left join public.profile_preferences pref on pref.profile_id=h.profile_id
    where h.central_day=p_day and h.schedule_version=p_schedule_version)
  select count(*)::int, coalesce(jsonb_agg(jsonb_build_object('rank',score_rank,'display_name',display_name,'initials',initials,'avatar_photo_data',avatar_photo_data,'game_type',game_type,'native_score',native_score,'normalized_score',normalized_score,'official_score',case when game_type='find_leader' then native_score else normalized_score end,'is_current_user',profile_id=v_profile) order by score_rank, display_name),'[]'::jsonb) into v_count,v_entries from ranked;
  return jsonb_build_object('unlocked',true,'player_count',coalesce(v_count,0),'entries',coalesce(v_entries,'[]'::jsonb));
end; $$;

create or replace function public.get_my_daily_challenge_streak()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_profile uuid := auth.uid(); v_current int := 0; v_best int := 0; v_prev date; v_run int := 0; v_day date;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  for v_day in select distinct central_day from public.daily_challenge_history where profile_id=v_profile order by central_day loop
    if v_prev is null or v_day = v_prev + 1 then v_run := v_run + 1; else v_run := 1; end if;
    v_best := greatest(v_best, v_run); v_prev := v_day;
  end loop;
  select count(*)::int into v_current from (select central_day, row_number() over(order by central_day desc) rn from (select distinct central_day from public.daily_challenge_history where profile_id=v_profile) d order by central_day desc) s where central_day = (select max(central_day) from public.daily_challenge_history where profile_id=v_profile) - (rn::int - 1);
  return jsonb_build_object('current_streak',coalesce(v_current,0),'best_streak',coalesce(v_best,0));
end; $$;

create or replace function public.list_my_find_leader_history()
returns setof public.find_leader_history language sql stable security definer set search_path = '' as $$
  select legacy.* from public.find_leader_history legacy where legacy.profile_id = auth.uid()
  union all
  select h.profile_id, h.central_day, (h.native_score)::integer, greatest(h.native_score, coalesce((h.public_result->>'best_score')::int,h.native_score))::integer, greatest(1,coalesce((h.public_result->>'attempts')::int,1))::integer, h.completed_at, h.completed_at
  from public.daily_challenge_history h
  where h.profile_id = auth.uid() and h.game_type='find_leader' and not exists (select 1 from public.find_leader_history legacy where legacy.profile_id=h.profile_id and legacy.day=h.central_day)
  order by day desc;
$$;

create or replace function public.get_find_leader_daily_leaderboard(p_day date)
returns jsonb language sql stable security definer set search_path = '' as $$
  select public.get_daily_challenge_leaderboard(p_day,'find-leader-v1');
$$;

-- Compatibility backfill: project existing Find the Leader history into the generalized owner
-- without rewriting the legacy rows that existing clients and audits already trust.
insert into private.daily_challenge_setups(game_type, setup_key, content_version, scoring_version, public_setup, private_setup_evidence, private_grading_evidence)
select distinct 'find_leader', 'legacy-find-leader-' || history.day::text, 'legacy-find-leader-content-v1', 'find-leader-score-v1', jsonb_build_object('legacy', true), '{}'::jsonb, '{}'::jsonb
from public.find_leader_history history
on conflict (game_type, setup_key, content_version, scoring_version) do nothing;

insert into public.daily_challenges(central_day, schedule_version, game_type, setup_id, content_version, scoring_version, fallback_reason)
select history.day, 'find-leader-v1', 'find_leader', setup.id, 'legacy-find-leader-content-v1', 'find-leader-score-v1', 'legacy_find_leader_history_projection'
from (select distinct day from public.find_leader_history) history
join private.daily_challenge_setups setup on setup.game_type='find_leader' and setup.setup_key='legacy-find-leader-' || history.day::text and setup.content_version='legacy-find-leader-content-v1' and setup.scoring_version='find-leader-score-v1'
on conflict (schedule_version, central_day) do nothing;

insert into private.daily_challenge_attempts(daily_challenge_id, profile_id, attempt_kind, native_score, normalized_score, completed_at, content_version, scoring_version, public_result, private_grading_evidence, legacy_find_leader_day)
select daily.id, history.profile_id, 'official_first', history.official_score, private.daily_challenge_normalized_score('find_leader', history.official_score), history.completed_at, daily.content_version, daily.scoring_version, jsonb_build_object('best_score', history.best_score, 'attempts', history.attempts, 'legacy_find_leader', true), '{}'::jsonb, history.day
from public.find_leader_history history
join public.daily_challenges daily on daily.central_day=history.day and daily.schedule_version='find-leader-v1' and daily.game_type='find_leader'
on conflict (daily_challenge_id, profile_id) where attempt_kind = 'official_first' do nothing;

revoke all on function public.publish_daily_challenge_setup(date,text,text,text,text,text,jsonb,jsonb,jsonb,text) from public, anon, authenticated;
grant execute on function public.publish_daily_challenge_setup(date,text,text,text,text,text,jsonb,jsonb,jsonb,text) to service_role;
revoke all on function public.get_today_challenge_public(timestamptz,text) from public, anon;
grant execute on function public.get_today_challenge_public(timestamptz,text) to authenticated;
revoke all on function public.record_my_daily_challenge_attempt(uuid,integer,jsonb,jsonb,timestamptz) from public, anon;
grant execute on function public.record_my_daily_challenge_attempt(uuid,integer,jsonb,jsonb,timestamptz) to authenticated;
revoke all on function public.list_my_daily_challenge_history() from public, anon;
grant execute on function public.list_my_daily_challenge_history() to authenticated;
revoke all on function public.get_daily_challenge_leaderboard(date,text) from public, anon;
grant execute on function public.get_daily_challenge_leaderboard(date,text) to authenticated;
revoke all on function public.get_my_daily_challenge_streak() from public, anon;
grant execute on function public.get_my_daily_challenge_streak() to authenticated;
