-- OIDC ingress must not expand browser permissions or manufacture a Supabase owner.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $test$
declare
  v_date date := date '2099-10-06';
  v_players jsonb;
  v_games jsonb;
  v_options jsonb;
  v_receipt jsonb;
  v_failed boolean;
begin
  select jsonb_agg(jsonb_build_object('id','p-' || n,'name','Player ' || n,
    'team','School ' || n,'position','QB','summary','Verified strong performance') order by n)
    into v_players from generate_series(1,5) n;
  select jsonb_agg(jsonb_build_object('id','g-' || n,'home_team','Home ' || n,
    'away_team','Away ' || n,'kickoff_at','2099-10-10T19:00:00-05:00',
    'summary','Verified matchup') order by n)
    into v_games from generate_series(1,5) n;
  v_options:=jsonb_build_object('players',v_players,'games',v_games);
  if has_function_privilege('anon',
       'public.ingest_football_weekly_editorial_handoff(date,text,jsonb,text,text,text,text)','EXECUTE')
    or has_function_privilege('authenticated',
       'public.ingest_football_weekly_editorial_handoff(date,text,jsonb,text,text,text,text)','EXECUTE') then
    raise exception 'External editorial handoff exposed to clients';
  end if;
  perform set_config('request.jwt.claim.role','authenticated',true);
  v_failed:=false;
  begin
    perform public.ingest_football_weekly_editorial_handoff(v_date,'cfb',v_options,
      null,null,'284170760',repeat('a',40));
  exception when others then v_failed:=true; end;
  if not v_failed then raise exception 'Authenticated browser entered private handoff'; end if;
  perform set_config('request.jwt.claim.role','service_role',true);
  v_receipt:=public.ingest_football_weekly_editorial_handoff(v_date,'cfb',v_options,
    null,null,'2000000',repeat('a',40));
  if jsonb_array_length(v_receipt->'proposals'->'cfb'->'players') <> 5
    or v_receipt->'choices'->'cfb' is not null then
    raise exception 'Independent, selection-free CFB stage failed'; end if;
  -- Retry staging of exactly the same shortlist is safe.
  perform public.ingest_football_weekly_editorial_handoff(v_date,'cfb',v_options,
    null,null,'2000000',repeat('a',40));
  v_failed:=false;
  begin
    perform public.ingest_football_weekly_editorial_handoff(v_date,'cfb',v_options,
      'p-1','g-1','2000000',repeat('b',40));
  exception when others then v_failed:=true; end;
  if not v_failed then raise exception 'Non-owner GitHub actor selected candidates'; end if;
  v_failed:=false;
  begin
    perform public.ingest_football_weekly_editorial_handoff(v_date,'cfb',v_options,
      'p-9','g-1','284170760',repeat('b',40));
  exception when others then v_failed:=true; end;
  if not v_failed then raise exception 'Unknown candidate accepted as owner selection'; end if;
  v_receipt:=public.ingest_football_weekly_editorial_handoff(v_date,'cfb',v_options,
    'p-2','g-3','284170760',repeat('b',40));
  if v_receipt->'choices'->'cfb'->'player'->>'id' <> 'p-2'
    or v_receipt->'choices'->'cfb'->>'selected_by_github_id' <> '284170760'
    or v_receipt->'choices'->'cfb'->>'selected_via' <> 'github-oidc-owner'
    or v_receipt->'choices'->'cfb' ? 'selected_by' then
    raise exception 'Selection provenance was impersonated or not saved'; end if;
  -- Retry approval after a transient outage must not change the approval receipt.
  v_receipt:=public.ingest_football_weekly_editorial_handoff(v_date,'cfb',v_options,
    'p-2','g-3','284170760',repeat('c',40));
  if v_receipt->'choices'->'cfb'->>'source_sha' <> repeat('b',40) then
    raise exception 'Idempotent retry changed original approval proof'; end if;
  v_failed:=false;
  begin
    perform public.ingest_football_weekly_editorial_handoff(v_date,'cfb',v_options,
      'p-1','g-1','284170760',repeat('b',40));
  exception when others then v_failed:=true; end;
  if not v_failed then raise exception 'Owner selection illegally overwritten'; end if;
  v_receipt:=public.ingest_football_weekly_editorial_handoff(v_date,'nfl',v_options,
    null,null,'2000000',repeat('d',40));
  if v_receipt->'choices'->'cfb'->'player'->>'id' <> 'p-2'
    or jsonb_array_length(v_receipt->'proposals'->'nfl'->'games') <> 5 then
    raise exception 'NFL staging overwrote approved CFB'; end if;
  if v_receipt->>'status' <> 'draft' or v_receipt->>'ready_at' is not null then
    raise exception 'Staging attempted publication'; end if;
end
$test$;
rollback;
\echo 'GitHub OIDC Football editorial SQL ingress proof passed.'
