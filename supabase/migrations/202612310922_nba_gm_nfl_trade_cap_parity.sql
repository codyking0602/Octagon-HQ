-- NBA GM: bring trade acceptance, package ranking, and temporary cap
-- crisis treatment into parity with NFL GM. Do not alter season simulation,
-- player ratings/contracts, NFL, existing runs, or the $155M cap.
-- Future seasons STILL require seven legal active players, no held assets,
-- and both Year 2 and Year 3 payrolls within cap before advancing.
CREATE OR REPLACE FUNCTION private.nba_gm_v8_trade_offers(p_state jsonb, p_target_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
declare
  v_anchor text:=p_state->>'shopPlayerId';
  v_anchor_held boolean:=false;
  v_partner text:=p_state->>'tradeTeam';
  v_target private.nba_gm_dev_players%rowtype;
  v_out2 text; v_in2 text;
  v_out jsonb;v_in jsonb;v_base jsonb;v_active jsonb;v_pool jsonb;
  v_receives numeric;v_sends numeric;v_ratio numeric;v_threshold numeric;
  v_spend bigint;v_year integer;v_over2 bigint;v_over3 bigint;v_best_slack numeric;
  v_candidates jsonb:='[]'::jsonb;
  v_candidate jsonb;
  v_offers jsonb:='[]'::jsonb;
  v_used text[]:=array[]::text[];
  v_shape text;v_key text;
begin
  if p_state->>'phase'<>'offseason' or v_anchor is null or v_partner is null
    then return '[]'::jsonb; end if;
  select exists(select 1 from jsonb_array_elements(coalesce(p_state->'displacedAssets','[]'::jsonb)) p
    where p#>>'{}'=v_anchor) into v_anchor_held;
  if (not v_anchor_held and not exists(select 1 from jsonb_array_elements(p_state->'picks') p
      where p->>'playerId'=v_anchor))
    or (not v_anchor_held and jsonb_array_length(coalesce(p_state->'displacedAssets','[]'::jsonb))>0)
    then return '[]'::jsonb; end if;
  select * into v_target from private.nba_gm_dev_players where id=p_target_id;
  if not found or v_target.team_code<>v_partner
    or exists(select 1 from jsonb_array_elements(p_state->'picks') p where p->>'playerId'=p_target_id)
    or exists(select 1 from jsonb_array_elements(coalesce(p_state->'releasedIds','[]'::jsonb)) p
      where p#>>'{}'=p_target_id)
    then return '[]'::jsonb; end if;

  -- 1-for-1, 2-for-1, 1-for-2, and 2-for-2. The secondary players are
  -- discovered by the server: the user never assembles a trade chip manually.
  for v_out2 in
    select id from (select null::text id,0 sort_order
      union all select p->>'playerId',1 from jsonb_array_elements(p_state->'picks') p
        where p->>'playerId'<>v_anchor) z order by sort_order,id nulls first
  loop
    for v_in2 in
      select id from (select null::text id,0 sort_order
        union all select p.id,1 from private.nba_gm_dev_players p
          where p.team_code=v_partner and p.id<>p_target_id
            and not exists(select 1 from jsonb_array_elements(p_state->'picks') x
              where x->>'playerId'=p.id)
            and not exists(select 1 from jsonb_array_elements(coalesce(p_state->'releasedIds','[]'::jsonb)) x
              where x#>>'{}'=p.id)) z order by sort_order,id nulls first
    loop
      v_out:=jsonb_build_array(v_anchor);
      v_in:=jsonb_build_array(p_target_id);
      if v_out2 is not null then v_out:=v_out||to_jsonb(v_out2); end if;
      if v_in2 is not null then v_in:=v_in||to_jsonb(v_in2); end if;

      -- Relative asset value uses existing Year-2 development grades, not
      -- displayed team OVR, and does not alter any underlying player rating.
      v_receives:=power(greatest(1,private.nba_gm_v3_grade(p_state,v_anchor,2)-56),1.45);
      if v_out2 is not null then v_receives:=v_receives+
        power(greatest(1,private.nba_gm_v3_grade(p_state,v_out2,2)-56),1.45); end if;
      v_sends:=power(greatest(1,private.nba_gm_v3_grade(p_state,p_target_id,2)-56),1.45);
      if v_in2 is not null then v_sends:=v_sends+
        power(greatest(1,private.nba_gm_v3_grade(p_state,v_in2,2)-56),1.45); end if;
      v_ratio:=v_receives/nullif(v_sends,0);
      -- NFL GM parity: a deterministic 0-1% counterparty threshold, but
      -- never reject a trade simply because the GM offers too much value.
      v_threshold:=1+(mod(abs(hashtext(concat_ws(':',
        coalesce(p_state->>'seed',''),v_partner,v_out::text,v_in::text))::bigint),5)*.0025);
      if v_ratio is null or v_ratio<v_threshold then continue; end if;

      select coalesce(jsonb_agg(x),'[]'::jsonb) into v_base
        from jsonb_array_elements(p_state->'picks') x
        where x->>'playerId'<>v_anchor and (v_out2 is null or x->>'playerId'<>v_out2);
      select coalesce(jsonb_agg(x),'[]'::jsonb) into v_pool
        from jsonb_array_elements(coalesce(p_state->'displacedAssets','[]'::jsonb)) x
        where x#>>'{}'<>v_anchor;
      if jsonb_array_length(v_base)<7 then
        v_active:=private.nba_gm_v2_assign(v_base,p_target_id);
        if v_active is null then continue; end if;
      else
        v_active:=v_base;
        v_pool:=v_pool||jsonb_build_array(p_target_id);
      end if;
      if v_in2 is not null then
        if jsonb_array_length(v_active)<7 then
          v_active:=private.nba_gm_v2_assign(v_active,v_in2);
          if v_active is null then continue; end if;
        else
          v_pool:=v_pool||jsonb_build_array(v_in2);
        end if;
      end if;
      -- As in NFL GM, accept a trade that causes a TEMPORARY cap crisis.
      -- Cap relief must be completed before the Years 2/3 simulation;
      -- salary obligations for active and displaced players remain payable.
      v_over2:=0;v_over3:=0;
      for v_year in 2..3 loop
        select coalesce(sum(private.nba_gm_v3_salary(p_state,x->>'playerId',v_year)),0)
          into v_spend from jsonb_array_elements(v_active) x;
        v_spend:=v_spend+(select coalesce(sum(private.nba_gm_v3_salary(p_state,x#>>'{}',v_year)),0)
          from jsonb_array_elements(v_pool) x);
        if v_year=2 then
          v_over2:=greatest(0,v_spend-(p_state->'caps'->>1)::bigint);
        else
          v_over3:=greatest(0,v_spend-(p_state->'caps'->>2)::bigint);
        end if;
      end loop;
      -- 2-for-1 packages may leave a vacancy, just like NFL. The existing
      -- three-visit FA and emergency markets handle legal completion. A GM
      -- may need to trade/cut again to create the cap space for a signing.
      v_shape:=jsonb_array_length(v_out)::text||'-FOR-'||jsonb_array_length(v_in)::text;
      v_candidate:=jsonb_build_object(
        'outgoingPlayerIds',v_out,'incomingPlayerIds',v_in,'shape',v_shape,
        'activePicks',v_active,'displacedAssets',v_pool,
        'requiresFreeAgency',jsonb_array_length(v_active)<7,
        'requiresRosterMove',jsonb_array_length(v_pool)>0,
        'capOverYear2',v_over2,'capOverYear3',v_over3,
        'acceptanceSlack',round((v_ratio/v_threshold-1)::numeric,5));
      v_candidates:=v_candidates||jsonb_build_array(v_candidate);
    end loop;
  end loop;
  -- NFL GM parity: remove dominated packages before selecting the five
  -- strongest offers. Never show a needlessly worse package when another
  -- offer uses fewer outgoing assets and gains at least as many incoming.
  select coalesce(jsonb_agg(x.value),'[]'::jsonb) into v_candidates
    from jsonb_array_elements(v_candidates) x
    where not exists(
      select 1 from jsonb_array_elements(v_candidates) y
      where (x.value->'outgoingPlayerIds') @> (y.value->'outgoingPlayerIds')
        and (y.value->'incomingPlayerIds') @> (x.value->'incomingPlayerIds')
        and (jsonb_array_length(y.value->'outgoingPlayerIds') <
             jsonb_array_length(x.value->'outgoingPlayerIds')
          or jsonb_array_length(y.value->'incomingPlayerIds') >
             jsonb_array_length(x.value->'incomingPlayerIds')));
  select min((x.value->>'acceptanceSlack')::numeric) into v_best_slack
    from jsonb_array_elements(v_candidates) x;
  -- Stay within eight percentage points of the least-cost fair offer,
  -- while representing different package shapes wherever possible.
  -- Every displayed price is guaranteed accepted on selection.
  for v_candidate in
    select x.value from jsonb_array_elements(v_candidates) x
    where (x.value->>'acceptanceSlack')::numeric<=v_best_slack+.08
    order by (x.value->>'acceptanceSlack')::numeric,
      jsonb_array_length(x.value->'outgoingPlayerIds'),
      jsonb_array_length(x.value->'incomingPlayerIds') desc,
      x.value->>'outgoingPlayerIds',x.value->>'incomingPlayerIds'
  loop
    v_shape:=v_candidate->>'shape';
    if v_shape=any(v_used) then continue;end if;
    v_offers:=v_offers||jsonb_build_array(v_candidate);
    v_used:=array_append(v_used,v_shape);
    if jsonb_array_length(v_offers)>=4 then exit;end if;
  end loop;
  for v_candidate in
    select x.value from jsonb_array_elements(v_candidates) x
    where (x.value->>'acceptanceSlack')::numeric<=v_best_slack+.08
    order by (x.value->>'acceptanceSlack')::numeric,
      jsonb_array_length(x.value->'outgoingPlayerIds'),
      x.value->>'outgoingPlayerIds',x.value->>'incomingPlayerIds'
  loop
    if jsonb_array_length(v_offers)>=5 then exit;end if;
    if v_offers @> jsonb_build_array(v_candidate) then continue;end if;
    v_offers:=v_offers||jsonb_build_array(v_candidate);
  end loop;
  return v_offers;
end;
$function$;

revoke all on function private.nba_gm_v8_trade_offers(jsonb,text)
  from public,anon,authenticated;
