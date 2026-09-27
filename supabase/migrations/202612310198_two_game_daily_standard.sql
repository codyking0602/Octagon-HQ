-- Make Wavelength, Hit the Number, and Find the Leader two-game averaged
-- Daily Challenges for UFC and Football beginning September 27, 2026.

create table if not exists private.daily_two_game_cutover_carryover (
  sport text not null check (sport in ('ufc', 'football')),
  central_day date not null,
  profile_id uuid not null,
  game_type text not null check (game_type in ('find_leader', 'wavelength', 'hit_the_number')),
  legacy_daily_challenge_id uuid not null,
  legacy_revision integer,
  legacy_submission_state jsonb,
  legacy_public_state jsonb,
  legacy_native_score integer,
  legacy_normalized_score integer,
  legacy_public_result jsonb,
  legacy_submission_evidence jsonb,
  legacy_completed_at timestamptz,
  restored_daily_challenge_id uuid,
  restored_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (sport, central_day, profile_id)
);

revoke all on table private.daily_two_game_cutover_carryover from public, anon, authenticated;

create or replace function private.reject_daily_challenge_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_setting('octagon.daily_two_game_cutover', true) = 'on' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  raise exception 'official daily challenge records are immutable'
    using errcode = '55000';
end;
$$;
