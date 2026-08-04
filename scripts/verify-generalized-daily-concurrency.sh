#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "usage: $0 <postgres-connection-url>" >&2
  exit 2
fi

db_url="$1"
profile_id="73000000-0000-4000-8000-000000000001"
today=$(psql "$db_url" --tuples-only --no-align --command \
  "select private.daily_challenge_central_day(now());")
schedule_version="test-concurrency-find-leader-v1"

psql "$db_url" --set ON_ERROR_STOP=on <<SQL
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
values (
  '$profile_id',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'daily-concurrency@login.octagon-hq.app',
  '',
  now(),
  now(),
  now(),
  jsonb_build_object('display_name', 'DAILY CONCURRENCY', 'historical_unclaimed', true)
)
on conflict (id) do nothing;

select public.register_unclaimed_pin_profile(
  '$profile_id'::uuid,
  'Daily Concurrency',
  'DC'
);

insert into private.daily_challenge_schedule_versions (
  version,
  time_zone,
  anchor_day,
  starts_on,
  game_cycle
)
values (
  '$schedule_version',
  'America/Chicago',
  '$today'::date,
  '$today'::date + 3000,
  array['find_leader']::text[]
)
on conflict (version) do nothing;

select public.publish_daily_challenge_setup(
  '$today'::date,
  '$schedule_version',
  'find_leader',
  'concurrency-$today',
  'find-leader-v2-20260724',
  'play-official-score-v1',
  jsonb_build_object('question', 'Concurrency proof'),
  jsonb_build_object('leader_id', 'f3'),
  '{}'::jsonb,
  jsonb_build_object(
    'candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10'),
    'leader_id', 'f3'
  ),
  null
);
SQL

daily_id=$(psql "$db_url" --tuples-only --no-align --command \
  "select id from private.daily_challenges where central_day = '$today'::date and schedule_version = '$schedule_version';")

if [ -z "$daily_id" ]; then
  echo "Concurrency daily challenge was not created." >&2
  exit 1
fi

submit_attempt() {
  local submission="$1"
  psql "$db_url" --quiet --set ON_ERROR_STOP=on <<SQL
begin;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '$profile_id', true);
select pg_sleep(1);
select public.submit_my_daily_challenge_attempt(
  '$daily_id'::uuid,
  '$submission'::jsonb
);
commit;
SQL
}

submit_attempt '{"eliminated_ids":["f1","f2","f3"]}' > /tmp/octagon-daily-concurrency-a.log &
pid_a=$!
submit_attempt '{"eliminated_ids":["f1","f2","f4","f5","f6","f7","f8","f9","f10"]}' > /tmp/octagon-daily-concurrency-b.log &
pid_b=$!

wait "$pid_a"
wait "$pid_b"

psql "$db_url" --set ON_ERROR_STOP=on <<SQL
do \$\$
declare
  v_official_count integer;
  v_replay_count integer;
  v_score_count integer;
begin
  select count(*) filter (where attempt_kind = 'official_first'),
         count(*) filter (where attempt_kind = 'replay'),
         count(distinct normalized_score)
  into v_official_count, v_replay_count, v_score_count
  from private.daily_challenge_attempts
  where daily_challenge_id = '$daily_id'::uuid
    and profile_id = '$profile_id'::uuid;

  if v_official_count <> 1
    or v_replay_count <> 1
    or v_score_count <> 2 then
    raise exception 'concurrent first submissions did not resolve to one immutable official attempt and one replay: official %, replay %, scores %',
      v_official_count,
      v_replay_count,
      v_score_count;
  end if;
end
\$\$;
SQL

rm -f /tmp/octagon-daily-concurrency-a.log /tmp/octagon-daily-concurrency-b.log

echo "Generalized daily concurrent first-attempt proof passed."
