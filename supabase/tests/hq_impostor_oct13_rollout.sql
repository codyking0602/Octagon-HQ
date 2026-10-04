begin;

do $$
declare
  v_source text;
  v_gate_source text;
  v_gate jsonb;
begin
  if to_regprocedure('public.create_hq_impostor_event(text[])') is null then
    raise exception 'HQ Impostor public creation RPC is missing';
  end if;

  select pg_get_functiondef('public.create_hq_impostor_event(text[])'::regprocedure)
  into v_source;

  if position('2026-10-13' in v_source) = 0 or position('2026-10-20' in v_source) = 0 then
    raise exception 'HQ Impostor creation RPC is not locked to the Oct 13-19 window';
  end if;

  if has_function_privilege(
    'authenticated',
    'private.create_hq_impostor_event(text[],timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated clients can still bypass the dated public creation RPC';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.create_hq_impostor_event(text[])',
    'EXECUTE'
  ) then
    raise exception 'Authenticated clients lost the public HQ Impostor creation RPC';
  end if;

  begin
    perform public.create_hq_impostor_event(array['Nobody']);
    raise exception 'HQ Impostor unexpectedly opened before October 13';
  exception
    when others then
      if sqlerrm not like '%opens October 13%' then
        raise;
      end if;
  end;

  if to_regprocedure('private.hq_impostor_daily_gate(uuid,timestamptz)') is null then
    raise exception 'HQ Impostor server Daily gate helper is missing';
  end if;

  select pg_get_functiondef('public.football_weekly_auction_daily_gate(uuid,timestamptz)'::regprocedure)
  into v_gate_source;
  if position('private.hq_impostor_daily_gate' in v_gate_source)=0
     or position('2026-10-13' in v_gate_source)=0
     or position('2026-10-20' in v_gate_source)=0 then
    raise exception 'Football server Daily gate does not delegate the Oct 13-19 week to HQ Impostor';
  end if;

  v_gate := private.hq_impostor_daily_gate(
    gen_random_uuid(),
    '2026-10-13 12:00:00-05'::timestamptz
  );
  if coalesce((v_gate->>'required')::boolean,false) is not true
     or v_gate->>'featured_challenge' <> 'hq-impostor' then
    raise exception 'A player with no Impostor event should be blocked from Football Daily during featured week';
  end if;

  v_gate := private.hq_impostor_daily_gate(
    gen_random_uuid(),
    '2026-10-12 12:00:00-05'::timestamptz
  );
  if coalesce((v_gate->>'required')::boolean,true) is not false then
    raise exception 'HQ Impostor must not own the Football Daily gate before October 13';
  end if;
end;
$$;

rollback;
