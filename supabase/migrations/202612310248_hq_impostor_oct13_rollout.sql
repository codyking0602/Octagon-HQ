-- HQ Impostor rollout: preserve the Sep 29 and Oct 6 Auction weeks,
-- then make Impostor the Oct 13-19 Featured Challenge.
-- Creation is server-locked so the hidden prelaunch UI cannot be bypassed.

create or replace function public.create_hq_impostor_event(p_member_names text[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_at timestamptz := now();
  v_central_day date := (v_at at time zone 'America/Chicago')::date;
begin
  if v_central_day < date '2026-10-13' then
    raise exception 'HQ Impostor opens October 13.';
  end if;

  if v_central_day >= date '2026-10-20' then
    raise exception 'The October HQ Impostor Featured Challenge has closed.';
  end if;

  return private.create_hq_impostor_event(p_member_names,v_at);
end;
$$;

-- The authenticated browser must enter through the dated public wrapper.
revoke execute on function private.create_hq_impostor_event(text[],timestamptz) from authenticated;
revoke all on function public.create_hq_impostor_event(text[]) from public,anon;
grant execute on function public.create_hq_impostor_event(text[]) to authenticated;

comment on function public.create_hq_impostor_event(text[]) is
  'Creates HQ Impostor only during the Oct 13-19, 2026 Featured Challenge window. Sep 29-Oct 5 and Oct 6-12 remain Weekly Auction weeks.';
