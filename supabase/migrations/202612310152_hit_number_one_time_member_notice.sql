-- One-time member notice for the September 18 Hit the Number tiebreak correction.
-- Eligibility is snapshotted at deployment so existing claimed members see the notice
-- exactly once on their next app open; future profiles are not enrolled retroactively.

create table if not exists private.member_app_notice_receipts (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  notice_key text not null,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (profile_id, notice_key),
  constraint member_app_notice_receipts_key_length
    check (char_length(trim(notice_key)) between 3 and 120)
);

alter table private.member_app_notice_receipts enable row level security;

revoke all on private.member_app_notice_receipts
  from public, anon, authenticated;

insert into private.member_app_notice_receipts (
  profile_id,
  notice_key,
  acknowledged_at
)
select
  profile.id,
  'hit-number-tiebreak-2026-09-18',
  null
from public.profiles profile
join private.profile_pin_credentials credential
  on credential.profile_id = profile.id
on conflict (profile_id, notice_key) do nothing;

create or replace function public.get_my_app_notice_state(
  p_notice_key text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_notice_key text := trim(coalesce(p_notice_key, ''));
  v_acknowledged_at timestamptz;
  v_eligible boolean := false;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = v_profile_id
  ) then
    raise exception 'Octagon HQ profile required';
  end if;

  select true, receipt.acknowledged_at
    into v_eligible, v_acknowledged_at
  from private.member_app_notice_receipts receipt
  where receipt.profile_id = v_profile_id
    and receipt.notice_key = v_notice_key;

  return jsonb_build_object(
    'notice_key', v_notice_key,
    'eligible', coalesce(v_eligible, false),
    'pending', coalesce(v_eligible, false) and v_acknowledged_at is null,
    'acknowledged_at', v_acknowledged_at
  );
end;
$$;

create or replace function public.acknowledge_my_app_notice(
  p_notice_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_notice_key text := trim(coalesce(p_notice_key, ''));
  v_acknowledged_at timestamptz;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  update private.member_app_notice_receipts receipt
  set acknowledged_at = coalesce(receipt.acknowledged_at, now())
  where receipt.profile_id = v_profile_id
    and receipt.notice_key = v_notice_key
  returning receipt.acknowledged_at
    into v_acknowledged_at;

  return jsonb_build_object(
    'notice_key', v_notice_key,
    'acknowledged', v_acknowledged_at is not null,
    'acknowledged_at', v_acknowledged_at
  );
end;
$$;

revoke all on function public.get_my_app_notice_state(text)
  from public, anon;
revoke all on function public.acknowledge_my_app_notice(text)
  from public, anon;

grant execute on function public.get_my_app_notice_state(text)
  to authenticated;
grant execute on function public.acknowledge_my_app_notice(text)
  to authenticated;

notify pgrst, 'reload schema';
