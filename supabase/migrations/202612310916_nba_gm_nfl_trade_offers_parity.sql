-- NBA GM NFL-style server-generated trade offers. Owner-only; no ratings, salary,
-- simulation, NFL/CFB, or historical franchise results are modified.
-- Current action function is surgically extended in place to retain all later
-- economy/simulation overlays and legacy signed franchise behavior.

create or replace function private.nba_gm_v8_trade_offers(
  p_state jsonb, p_target_id text
) returns jsonb language plpgsql stable set search_path='' as $offers$
declare
  v_anchor text:=p_state->>'shopPlayerId';
  v_partner text:=p_state->>'tradeTeam';
  v_target private.nba_gm_dev_players%rowtype;
  v_out2 text; v_in2 text;
  v_out jsonb;v_in jsonb;v_base jsonb;v_active jsonb;v_pool jsonb;
  v_receives numeric;v_sends numeric;v_ratio numeric;
  v_spend bigint;v_year integer;v_legal boolean;
  v_candidates jsonb:='[]'::jsonb;
  v_candidate jsonb;
  v_offers jsonb:='[]'::jsonb;
  v_used text[]:=array[]::text[];
  v_shape text;v_key text;
begin
  if p_state->>'phase'<>'offseason' or v_anchor is null or v_partner is null
    or jsonb_array_length(coalesce(p_state->'displacedAssets','[]'::jsonb))>0
    then return '[]'::jsonb; end if;
  if not exists(select 1 from jsonb_array_elements(p_state->'picks') p
      where p->>'playerId'=v_anchor) then return '[]'::jsonb; end if;
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
      -- The counterparty receives an even-to-five-percent value premium.
      if v_ratio is null or v_ratio<1 or v_ratio>1.05 then continue; end if;

      select coalesce(jsonb_agg(x),'[]'::jsonb) into v_base
        from jsonb_array_elements(p_state->'picks') x
        where x->>'playerId'<>v_anchor and (v_out2 is null or x->>'playerId'<>v_out2);
      v_active:=private.nba_gm_v2_assign(v_base,p_target_id);
      if v_active is null then continue; end if;
      v_pool:='[]'::jsonb;
      if v_in2 is not null then
        if jsonb_array_length(v_active)<7 then
          v_active:=private.nba_gm_v2_assign(v_active,v_in2);
          if v_active is null then continue; end if;
        else
          v_pool:=jsonb_build_array(v_in2);
        end if;
      end if;
      v_legal:=true;
      for v_year in 2..3 loop
        select coalesce(sum(private.nba_gm_v3_salary(p_state,x->>'playerId',v_year)),0)
          into v_spend from jsonb_array_elements(v_active) x;
        if v_in2 is not null and jsonb_array_length(v_pool)>0 then
          v_spend:=v_spend+private.nba_gm_v3_salary(p_state,v_in2,v_year);
        end if;
        if v_spend>(p_state->'caps'->>(v_year-1))::bigint then
          v_legal:=false;exit;end if;
      end loop;
      if not v_legal then continue; end if;
      -- No 2-for-1 is offered if the gap cannot be filled affordably.
      if jsonb_array_length(v_active)<7 and not exists(
        select 1 from private.nba_gm_dev_players p
        where private.nba_gm_v3_contract_for_state(p_state,p.id)='1YR'
          and p.overall<=78 and p.id<>all(array[v_anchor,p_target_id,coalesce(v_out2,''),coalesce(v_in2,'')])
          and not exists(select 1 from jsonb_array_elements(v_active) x where x->>'playerId'=p.id)
          and private.nba_gm_v2_can_add(jsonb_set(p_state,'{picks}',v_active),p.id)
      ) then continue; end if;
      v_shape:=jsonb_array_length(v_out)::text||'-FOR-'||jsonb_array_length(v_in)::text;
      v_candidate:=jsonb_build_object(
        'outgoingPlayerIds',v_out,'incomingPlayerIds',v_in,'shape',v_shape,
        'activePicks',v_active,'displacedAssets',v_pool,
        'requiresFreeAgency',jsonb_array_length(v_active)<7,
        'requiresRosterMove',jsonb_array_length(v_pool)>0,
        'acceptanceSlack',round((v_ratio-1)::numeric,5));
      v_candidates:=v_candidates||jsonb_build_array(v_candidate);
    end loop;
  end loop;
  -- Offer the smallest fair overpay first, with varied package shapes.
  -- Every displayed proposal is legal and guaranteed accepted on selection.
  for v_candidate in
    select x.value from jsonb_array_elements(v_candidates) x
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
$offers$;

revoke all on function private.nba_gm_v8_trade_offers(jsonb,text) from public,anon,authenticated;

create or replace function public.nba_gm_dev_trade_offers(p_target_id text)
returns jsonb language plpgsql security definer set search_path='' as $view$
declare v_state jsonb;v_full jsonb;
begin
  if not private.nba_gm_dev_owner() then raise exception 'NBA GM playtest access required';end if;
  select r.state into v_state from private.football_gm_runs r
    where r.profile_id=auth.uid() and r.game_version='nba-gm-dev-v2'
      and r.completed_at is null order by r.updated_at desc limit 1;
  if v_state is null then raise exception 'Start an NBA GM franchise';end if;
  v_full:=private.nba_gm_v8_trade_offers(v_state,p_target_id);
  return coalesce((select jsonb_agg(x.value-'activePicks'-'displacedAssets'-'acceptanceSlack'
      order by x.ordinality) from jsonb_array_elements(v_full) with ordinality x(value,ordinality)),
      '[]'::jsonb);
end;
$view$;
revoke all on function public.nba_gm_dev_trade_offers(text) from public,anon;
grant execute on function public.nba_gm_dev_trade_offers(text) to authenticated;

-- Preserve the exact latest deployed function, including V4 salaries and
-- V7 independent playoff simulation. Do not overwrite it with a stale copy
-- of an early NBA action migration.
do $patch$
declare v_def text;v_old text;v_new text;v_a integer;v_b integer;
begin
  v_def:=pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure);
  if position('elsif p_action=''trade'' then' in v_def)=0 or
     position('elsif p_action=''cancel-trade'' then' in v_def)=0 or
     position('v_chip_grade numeric;v_offer_value numeric;v_ask numeric;v_chip_id text;' in v_def)=0
     then raise exception 'NBA GM action function changed; manual integration required';end if;

  v_def:=replace(v_def,
    'v_chip_grade numeric;v_offer_value numeric;v_ask numeric;v_chip_id text;',
    'v_chip_grade numeric;v_offer_value numeric;v_ask numeric;v_chip_id text;'||
    chr(10)||'  v_offers jsonb; v_offer jsonb; v_offer_index integer; v_swap jsonb;');

  -- Lift the old one-successful-trade limit, but finish an outstanding
  -- displaced-asset decision before beginning another shop.
  v_def:=replace(v_def,
    'or (v_state->>''tradesUsed'')::integer>=1',
    'or jsonb_array_length(coalesce(v_state->''displacedAssets'',''[]''::jsonb))>0');

  v_old:='elsif p_action=''trade'' then';
  v_new:=$offer_branch$
elsif p_action='trade' then
    if left(coalesce(p_slot,''),6)='offer:' then
      if v_state->>'phase'<>'offseason' or v_state->>'shopPlayerId' is null
        or v_state->>'tradeTeam' is null then
        raise exception 'Select a trade target first'; end if;
      begin v_offer_index:=substring(p_slot from 7)::integer;
      exception when invalid_text_representation then
        raise exception 'Invalid asking price'; end;
      if v_offer_index not between 1 and 5 then raise exception 'Invalid asking price';end if;
      v_offers:=private.nba_gm_v8_trade_offers(v_state,p_player_id);
      v_offer:=v_offers->(v_offer_index-1);
      if v_offer is null then raise exception 'Asking price is no longer available';end if;
      v_next:=jsonb_set(v_state,'{picks}',v_offer->'activePicks');
      v_next:=jsonb_set(v_next,'{displacedAssets}',v_offer->'displacedAssets');
      v_next:=jsonb_set(v_next,'{shopPlayerId}','null'::jsonb);
      v_next:=jsonb_set(v_next,'{tradeTeam}','null'::jsonb);
      v_next:=jsonb_set(v_next,'{tradeAttempts}','0'::jsonb);
      v_next:=jsonb_set(v_next,'{tradesUsed}',to_jsonb((v_state->>'tradesUsed')::integer+1));
    else
$offer_branch$;
  v_def:=replace(v_def,v_old,v_new);
  v_def:=replace(v_def,
    'elsif p_action=''cancel-trade'' then',
    'end if;'||chr(10)||'  elsif p_action=''cancel-trade'' then');

  -- Free, server-validated asset promotion: moving someone to the active
  -- seven does not generate a new free-agent visit or a trade.
  v_old:='elsif p_action=''release'' then';
  v_new:=$asset_branch$
elsif p_action='promote-displaced' then
    if v_state->>'phase'<>'offseason'
      or not exists(select 1 from jsonb_array_elements(coalesce(v_state->'displacedAssets','[]'::jsonb)) x
        where x#>>'{}'=p_player_id)
      or not exists(select 1 from jsonb_array_elements(v_picks) x where x->>'playerId'=p_slot)
      then raise exception 'Select one held asset and one active player to swap';end if;
    select coalesce(jsonb_agg(x),'[]'::jsonb) into v_swap
      from jsonb_array_elements(v_picks) x where x->>'playerId'<>p_slot;
    v_swap:=private.nba_gm_v2_assign(v_swap,p_player_id);
    if v_swap is null or jsonb_array_length(v_swap)<>7 then
      raise exception 'Swap cannot form a legal NBA rotation';end if;
    v_next:=jsonb_set(v_state,'{picks}',v_swap);
    v_next:=jsonb_set(v_next,'{displacedAssets}',
      (select coalesce(jsonb_agg(case when x#>>'{}'=p_player_id then to_jsonb(p_slot) else x end),'[]'::jsonb)
        from jsonb_array_elements(v_state->'displacedAssets') x));
  elsif p_action='release-displaced' then
    if v_state->>'phase'<>'offseason'
      or not exists(select 1 from jsonb_array_elements(coalesce(v_state->'displacedAssets','[]'::jsonb)) x
        where x#>>'{}'=p_player_id)
      then raise exception 'Player is not a held displaced asset';end if;
    v_next:=jsonb_set(v_state,'{displacedAssets}',
      (select coalesce(jsonb_agg(x),'[]'::jsonb)
        from jsonb_array_elements(v_state->'displacedAssets') x where x#>>'{}'<>p_player_id));
    v_next:=jsonb_set(v_next,'{releasedIds}',
      coalesce(v_state->'releasedIds','[]'::jsonb)||jsonb_build_array(p_player_id));
  elsif p_action='release' then
$asset_branch$;
  v_def:=replace(v_def,v_old,v_new);
  v_old:='or v_state->>''freeAgencyTeam'' is not null';
  -- Only restrict advance specifically (do not rewrite FA/release guards).
  v_a:=position('elsif p_action=''advance'' then' in v_def);
  if v_a=0 then raise exception 'NBA GM advance guard moved';end if;
  v_b:=position('else'||chr(10)||'    raise exception ''Unsupported NBA GM action''' in substring(v_def from v_a));
  if v_b=0 then raise exception 'NBA GM final action moved';end if;
  v_old:=substring(v_def from v_a for v_b-1);
  if position(v_old in v_def)=0 or position('or v_state->>''freeAgencyTeam'' is not null' in v_old)=0
    then raise exception 'NBA advance guard changed';end if;
  v_new:=replace(v_old,'or v_state->>''freeAgencyTeam'' is not null',
    'or v_state->>''freeAgencyTeam'' is not null'||
    chr(10)||'      or jsonb_array_length(coalesce(v_state->''displacedAssets'',''[]''::jsonb))>0');
  v_def:=replace(v_def,v_old,v_new);
  execute v_def;
end;
$patch$;
