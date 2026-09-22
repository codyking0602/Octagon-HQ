-- UFC Picks preproduction package.
-- This sits before the existing staged draft. The Monday preparation task writes
-- researched event/card/editorial metadata here; the owner-only Event Setup UI
-- reads it and still leaves staging/publishing under the existing manual owners.

create table if not exists public.ufc_pick_prep_packages (
  prep_id uuid primary key default gen_random_uuid(),
  source_event_key text not null unique,
  source_url text not null,
  event_id text not null,
  event_name text not null,
  event_kind text not null,
  card_scope text not null,
  starts_at timestamptz not null,
  status text not null default 'review-needed',
  payload jsonb not null,
  prepared_at timestamptz not null default now(),
  verified_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ufc_pick_prep_event_kind check (event_kind in ('fight-night','numbered')),
  constraint ufc_pick_prep_card_scope check (card_scope in ('main','main-prelims')),
  constraint ufc_pick_prep_status check (status in ('ready','review-needed','blocked')),
  constraint ufc_pick_prep_payload_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists ufc_pick_prep_upcoming_idx
  on public.ufc_pick_prep_packages (starts_at, prepared_at desc);

alter table public.ufc_pick_prep_packages enable row level security;
revoke all on table public.ufc_pick_prep_packages from public, anon, authenticated;

comment on table public.ufc_pick_prep_packages is
  'Owner-only preproduction packages prepared before UFC Picks staging. Fight Night scope is main card only; numbered scope is main card plus prelims, never early prelims.';

create or replace function public.get_ufc_pick_prep()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  select prep.payload || jsonb_build_object(
    'prep_id', prep.prep_id,
    'source_event_key', prep.source_event_key,
    'source_url', prep.source_url,
    'event_id', prep.event_id,
    'event_name', prep.event_name,
    'event_kind', prep.event_kind,
    'card_scope', prep.card_scope,
    'starts_at', prep.starts_at,
    'status', prep.status,
    'prepared_at', prep.prepared_at,
    'verified_at', prep.verified_at,
    'updated_at', prep.updated_at
  )
  into v_result
  from public.ufc_pick_prep_packages prep
  where prep.starts_at >= now() - interval '6 hours'
  order by prep.starts_at asc, prep.prepared_at desc
  limit 1;

  return v_result;
end;
$$;

revoke all on function public.get_ufc_pick_prep() from public, anon;
grant execute on function public.get_ufc_pick_prep() to authenticated;

notify pgrst, 'reload schema';
