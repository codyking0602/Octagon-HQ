-- Persist private, revisioned NFL GM Mode playtest runs so owner playtesting can be
-- inspected after the fact without exposing the run log to normal app users.

create table if not exists private.football_gm_runs (
  id uuid primary key default extensions.gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  seed text not null,
  game_version text not null,
  state jsonb not null,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint football_gm_runs_profile_seed_unique unique (profile_id, seed),
  constraint football_gm_runs_seed_length check (char_length(seed) between 1 and 160),
  constraint football_gm_runs_version_length check (char_length(game_version) between 1 and 120),
  constraint football_gm_runs_state_object check (jsonb_typeof(state) = 'object'),
  constraint football_gm_runs_state_size check (octet_length(state::text) <= 750000)
);

create index if not exists football_gm_runs_profile_updated_idx
  on private.football_gm_runs (profile_id, updated_at desc);

create table if not exists private.football_gm_run_snapshots (
  run_id uuid not null references private.football_gm_runs(id) on delete cascade,
  revision integer not null,
  state jsonb not null,
  created_at timestamptz not null default now(),
  primary key (run_id, revision),
  constraint football_gm_run_snapshots_revision_positive check (revision > 0),
  constraint football_gm_run_snapshots_state_object check (jsonb_typeof(state) = 'object'),
  constraint football_gm_run_snapshots_state_size check (octet_length(state::text) <= 750000)
);

revoke all on private.football_gm_runs from public, anon, authenticated;
revoke all on private.football_gm_run_snapshots from public, anon, authenticated;

create or replace function public.save_my_football_gm_run(
  p_seed text,
  p_game_version text,
  p_state jsonb,
  p_completed boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_run_id uuid;
  v_previous jsonb;
  v_revision integer;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    join public.pick_control_owners owner
      on owner.profile_id = profile.id
    where profile.id = v_profile
      and upper(trim(profile.display_name)) in ('CODY', 'TEST')
  ) then
    raise exception 'GM playtest access required';
  end if;

  if nullif(trim(p_seed), '') is null
    or char_length(trim(p_seed)) > 160 then
    raise exception 'invalid GM run seed';
  end if;

  if nullif(trim(p_game_version), '') is null
    or char_length(trim(p_game_version)) > 120 then
    raise exception 'invalid GM game version';
  end if;

  if p_state is null
    or jsonb_typeof(p_state) <> 'object'
    or octet_length(p_state::text) > 750000 then
    raise exception 'invalid GM run state';
  end if;

  select run.id, run.state
  into v_run_id, v_previous
  from private.football_gm_runs run
  where run.profile_id = v_profile
    and run.seed = trim(p_seed)
  for update;

  if v_run_id is null then
    insert into private.football_gm_runs (
      profile_id,
      seed,
      game_version,
      state,
      completed_at
    )
    values (
      v_profile,
      trim(p_seed),
      trim(p_game_version),
      p_state,
      case when coalesce(p_completed, false) then now() else null end
    )
    returning id into v_run_id;

    insert into private.football_gm_run_snapshots (run_id, revision, state)
    values (v_run_id, 1, p_state);

    return v_run_id;
  end if;

  if v_previous is distinct from p_state then
    select coalesce(max(snapshot.revision), 0) + 1
    into v_revision
    from private.football_gm_run_snapshots snapshot
    where snapshot.run_id = v_run_id;

    update private.football_gm_runs run
    set game_version = trim(p_game_version),
        state = p_state,
        updated_at = now(),
        completed_at = case
          when coalesce(p_completed, false) then coalesce(run.completed_at, now())
          else run.completed_at
        end
    where run.id = v_run_id;

    insert into private.football_gm_run_snapshots (run_id, revision, state)
    values (v_run_id, v_revision, p_state);
  elsif coalesce(p_completed, false) then
    update private.football_gm_runs run
    set updated_at = now(),
        completed_at = coalesce(run.completed_at, now())
    where run.id = v_run_id;
  end if;

  return v_run_id;
end;
$$;

revoke all on function public.save_my_football_gm_run(text, text, jsonb, boolean)
  from public, anon;
grant execute on function public.save_my_football_gm_run(text, text, jsonb, boolean)
  to authenticated;
