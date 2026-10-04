begin;

do $$
declare
  v_source text;
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
end;
$$;

rollback;
