-- Private NBA GM Priority 3: balance calibration for the already opt-in
-- player-specific v4 development model. No saved-run rewrite, no public grants,
-- no changes to V2/legacy V3, Football GM, or the 90/3/7 score formula.
-- Recalibrates the PROVISIONAL seven-player skill-to-net mapping, NOT the
-- independently studied historical observed-net-rating-to-wins conversion.
create or replace function private.nba_gm_v2_season(p_state jsonb,p_year integer)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
  v_off numeric;v_def numeric;v_fit numeric;v_floor numeric;
  v_best_creator numeric:=0;v_second_creator numeric:=0;v_star_bonus numeric:=0;
  v_noise integer;v_wins integer;v_finish text;v_estimated_net numeric;
  v_roll integer;v_cutoff integer;v_round integer;
  v_turnover integer:=coalesce(jsonb_array_length(p_state->'releasedIds'),0)
     +coalesce((p_state->>'tradesUsed')::integer,0);
begin
  select
    sum((((p.skills->>'scoring')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.33+((p.skills->>'shooting')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.25
        +((p.skills->>'playmaking')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.27+((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.10
        +((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.05)
      *case when pick->>'slot' in ('GUARD','BIG') then .55 else 1 end)/6.1,
    sum((((p.skills->>'perimeterDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        *case when pick->>'slot' in ('PG','SG','SF','GUARD') then .57 else .30 end
      +((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        *case when pick->>'slot' in ('C','PF','BIG') then .55 else .23 end
      +((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.18)
      /case when pick->>'slot' in ('PG','SG','SF','GUARD') then .98 else 1.03 end
      *case when pick->>'slot' in ('GUARD','BIG') then .55 else 1 end)/6.1,
    sum(case when pick->>'slot'='PG' then ((p.skills->>'playmaking')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.35
      when pick->>'slot'='C' then (((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        +((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall))*.175
      when pick->>'slot' in ('SG','SF') then (((p.skills->>'shooting')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        +((p.skills->>'perimeterDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall))*.175
      when pick->>'slot'='PF' then (((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        +((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall))*.175 else 0 end)/5,
    min(case when pick->>'slot' in ('PG','SG','SF','PF','C')
      then least(((p.skills->>'scoring')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall),((p.skills->>'perimeterDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)+10)
      else 99 end)
  into v_off,v_def,v_fit,v_floor
  from jsonb_array_elements(p_state->'picks') pick
  join private.nba_gm_dev_players p on p.id=pick->>'playerId';
  if v_off is null or v_def is null
     or jsonb_array_length(p_state->'picks')<>7 then raise exception 'NBA rotation incomplete'; end if;

  -- NBA-only 7-man calibration: five starters can be carried offensively
  -- by two elite creators, but a bad defense still materially hurts.
  -- Never use this correction for original V2/V3 save models.
  if p_state->>'economyVersion'='3'
     and p_state->>'developmentModelVersion'='2' then
    select coalesce(max(creator) filter (where rank=1),0),
           coalesce(max(creator) filter (where rank=2),0)
      into v_best_creator,v_second_creator
    from (
      select ((p.skills->>'scoring')::numeric*.65
             +(p.skills->>'playmaking')::numeric*.35
             +private.nba_gm_v3_grade(p_state,p.id,p_year)-p.overall) creator,
         row_number() over(order by
             ((p.skills->>'scoring')::numeric*.65
             +(p.skills->>'playmaking')::numeric*.35
             +private.nba_gm_v3_grade(p_state,p.id,p_year)-p.overall) desc) rank
      from jsonb_array_elements(p_state->'picks') pick
      join private.nba_gm_dev_players p on p.id=pick->>'playerId'
      where pick->>'slot' in ('PG','SG','SF','PF','C')
    ) starters;
    v_star_bonus:=least(3.75,
      greatest(0,v_best_creator-86)*.22
      +greatest(0,v_second_creator-84)*.12);
  end if;
  v_noise:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year),1,8))::bit(32)::int::bigint)%11)::integer-5;
  -- The 150 historical team-seasons establish W = 40.9983 + 2.2684
  -- times OBSERVED net rating on a 2025–26 walk-forward holdout.
  -- The seven-athlete skill -> estimated net rating mapping below remains
  -- an explicitly PROVISIONAL game assumption, not a fitted lineup forecast.
  if p_state->>'economyVersion' is distinct from '3' then
    -- Exact legacy V2 win conversion, preserving preexisting save behavior.
    v_wins:=greatest(8,least(74,round(
      41+(v_off-78)*1.2+(v_def-78)*1.05+(v_fit-27)*.35
        +least(0,(v_floor-65))*.2
        -case when p_year=1 then 0 else greatest(0,v_turnover-2)*.8 end+v_noise
    )::integer));
  else
    v_estimated_net:=(v_off-78)*.529+(v_def-78)*.463
      +(v_fit-27)*.154+least(0,(v_floor-65))*.088
      -case when p_year=1 then 0 else greatest(0,v_turnover-2)*.353 end
      +case when p_state->>'developmentModelVersion'='2' then 3.0+v_star_bonus else 0 end;
    v_wins:=greatest(8,least(74,round(
      40.9983+2.2684*v_estimated_net+v_noise
    )::integer));
  end if;
  -- A 53-win Denver team won in 2023; a 64+ win season must not
  -- guarantee a title. This PRIVATE playoff model is a deterministic,
  -- seed-driven variance fixture, NOT a fitted 150-team NBA estimate.
  -- Each advancement roll is independent of the regular-season win noise.
  v_finish:='Missed Playoffs';
  v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':entry'),1,8))
    ::bit(32)::int::bigint)%1000)::integer;
  if v_wins>=47 or (v_wins>=36 and
    v_roll<greatest(0,least(950,(v_wins-34)*80))) then
    v_finish:='First Round';
    for v_round in 1..4 loop
      v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':playoff:'||v_round),1,8))
        ::bit(32)::int::bigint)%1000)::integer;
      v_cutoff:=greatest(75,least(890,470+(v_wins-47)*15-(v_round-1)*25));
      exit when v_roll>=v_cutoff;
      v_finish:=case v_round when 1 then 'Conference Semifinals'
        when 2 then 'Conference Finals' when 3 then 'Finals' else 'Champion' end;
    end loop;
  end if;
  return jsonb_build_object('season',p_year,'wins',v_wins,'losses',82-v_wins,
    'offense',round(v_off,1),'defense',round(v_def,1),
    'positionalFit',round(v_fit,1),'finish',v_finish);
end;
$$;
revoke all on function private.nba_gm_v2_season(jsonb,integer) from public,anon,authenticated;
