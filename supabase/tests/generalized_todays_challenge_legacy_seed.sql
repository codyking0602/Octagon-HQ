select set_config('request.jwt.claim.role', 'service_role', false);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
)
values
  ('72000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'legacy-daily-one@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'LEGACY DAILY ONE', 'historical_unclaimed', true)),
  ('72000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'legacy-daily-two@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'LEGACY DAILY TWO', 'historical_unclaimed', true))
on conflict (id) do nothing;

select public.register_unclaimed_pin_profile(
  '72000000-0000-4000-8000-000000000001'::uuid,
  'Legacy Daily One',
  'LO'
);
select public.register_unclaimed_pin_profile(
  '72000000-0000-4000-8000-000000000002'::uuid,
  'Legacy Daily Two',
  'LT'
);

insert into public.find_leader_history (
  profile_id,
  day,
  official_score,
  best_score,
  attempts,
  completed_at,
  updated_at
)
values
  (
    '72000000-0000-4000-8000-000000000001',
    date '2026-07-01',
    4,
    9,
    3,
    timestamptz '2026-07-01 18:00:00+00',
    timestamptz '2026-07-01 18:05:00+00'
  ),
  (
    '72000000-0000-4000-8000-000000000002',
    date '2026-07-01',
    7,
    7,
    1,
    timestamptz '2026-07-01 19:00:00+00',
    timestamptz '2026-07-01 19:00:00+00'
  )
on conflict (profile_id, day) do update
set official_score = excluded.official_score,
    best_score = excluded.best_score,
    attempts = excluded.attempts,
    completed_at = excluded.completed_at,
    updated_at = excluded.updated_at;
