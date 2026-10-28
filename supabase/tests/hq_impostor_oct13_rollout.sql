begin;
do $reassigned$
declare
  v_gate jsonb;
  v_blocked boolean := false;
  v_source text;
begin
  v_gate := public.football_weekly_auction_daily_gate(
    gen_random_uuid(), '2026-10-13 12:00:00-05'::timestamptz
  );
  if (v_gate->>'required')::boolean is distinct from false
     or v_gate->>'featured_challenge' <> 'nfl-gm' then
    raise exception 'Football Daily still blocked by the superseded Impostor rollout: %',v_gate;
  end if;
  begin
    perform public.create_hq_impostor_event(array['Anybody']);
  exception when others then
    v_blocked := position('paused until a future Featured rotation' in sqlerrm)>0;
  end;
  if not v_blocked then raise exception 'Impostor creation must remain paused'; end if;
  select pg_get_functiondef('public.football_weekly_auction_daily_gate(uuid,timestamptz)'::regprocedure) into v_source;
  if position('nfl-gm' in v_source)=0 then raise exception 'GM Featured Daily gate is missing'; end if;
end;
$reassigned$;
rollback;
