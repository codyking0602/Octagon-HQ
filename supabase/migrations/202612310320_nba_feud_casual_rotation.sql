-- NBA Sports Feud: account-backed, cross-device no-repeat history for Casual only.
-- No scores, answers, results, Daily selection, or other sports are changed.
create table if not exists public.nba_feud_casual_rotation (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  seen_main text[] not null default '{}',
  seen_fast text[] not null default '{}',
  completed_reservations integer not null default 0 check (completed_reservations >= 0),
  cycle integer not null default 0 check (cycle >= 0),
  updated_at timestamptz not null default now()
);
alter table public.nba_feud_casual_rotation enable row level security;
revoke all on public.nba_feud_casual_rotation from public, anon, authenticated;

create or replace function public.get_nba_feud_casual_rotation()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_row public.nba_feud_casual_rotation%rowtype;
begin
  if v_user is null then raise exception 'nba_feud_sign_in_required'; end if;
  select * into v_row from public.nba_feud_casual_rotation
    where profile_id = v_user;
  return jsonb_build_object(
    'main', coalesce(to_jsonb(v_row.seen_main), '[]'::jsonb),
    'fast', coalesce(to_jsonb(v_row.seen_fast), '[]'::jsonb),
    'runs', coalesce(v_row.completed_reservations, 0),
    'cycle', coalesce(v_row.cycle, 0)
  );
end;
$$;

-- Atomic reservation: concurrent sessions cannot reserve the same board twice.
-- The server allows a new cycle only after >=20 complete 2+5 Casual packs.
create or replace function public.reserve_nba_feud_casual_pack(
  p_main text[], p_fast text[], p_new_cycle boolean default false
) returns boolean language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_row public.nba_feud_casual_rotation%rowtype;
begin
  if v_user is null then raise exception 'nba_feud_sign_in_required'; end if;
  if p_main is null or p_fast is null
    or cardinality(p_main) <> 2 or cardinality(p_fast) <> 5
    or array_position(p_main, null) is not null
    or array_position(p_fast, null) is not null
    or (select count(distinct x) from unnest(p_main) x) <> 2
    or (select count(distinct x) from unnest(p_fast) x) <> 5
    or exists (select 1 from unnest(p_main || p_fast) x where x !~ '^nba-feud-[a-z0-9-]+$')
  then
    raise exception 'nba_feud_invalid_pack';
  end if;

  insert into public.nba_feud_casual_rotation(profile_id)
    values (v_user) on conflict (profile_id) do nothing;
  select * into strict v_row from public.nba_feud_casual_rotation
    where profile_id = v_user for update;

  if p_new_cycle then
    if v_row.completed_reservations < 20 then
      raise exception 'nba_feud_cycle_too_early';
    end if;
    update public.nba_feud_casual_rotation set
      seen_main = p_main, seen_fast = p_fast, completed_reservations = 1,
      cycle = v_row.cycle + 1, updated_at = now()
      where profile_id = v_user;
    return true;
  end if;

  if v_row.seen_main && p_main or v_row.seen_fast && p_fast then
    return false;
  end if;
  update public.nba_feud_casual_rotation set
    seen_main = v_row.seen_main || p_main,
    seen_fast = v_row.seen_fast || p_fast,
    completed_reservations = v_row.completed_reservations + 1,
    updated_at = now()
    where profile_id = v_user;
  return true;
end;
$$;

revoke all on function public.get_nba_feud_casual_rotation() from public, anon;
revoke all on function public.reserve_nba_feud_casual_pack(text[],text[],boolean) from public, anon;
grant execute on function public.get_nba_feud_casual_rotation() to authenticated;
grant execute on function public.reserve_nba_feud_casual_pack(text[],text[],boolean) to authenticated;
notify pgrst, 'reload schema';
