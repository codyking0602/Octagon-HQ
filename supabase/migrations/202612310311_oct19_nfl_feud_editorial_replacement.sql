-- Editorial hotfix for the published October 19 NFL Sports Feud board.
-- Change only the single day's snapshot; preserve historical answers and official scores.
-- Exactly one player had entered a stray one-character miss; reset that unearned strike.
-- The current TS generator contains the same day-specific question/answer authority.
do $oct19_feud$
declare
  v_daily uuid;
  v_setup uuid;
  v_s record;
  v_plan jsonb := '{"main":[{"id":"nfl-oct19-east-teams","prompt":"Name an NFL team in the AFC East or NFC East.","answers":[{"name":"Buffalo Bills","aliases":["Bills","Buffalo"]},{"name":"Dallas Cowboys","aliases":["Cowboys","Dallas"]},{"name":"Philadelphia Eagles","aliases":["Eagles","Philly","Philadelphia"]},{"name":"Miami Dolphins","aliases":["Dolphins","Miami"]},{"name":"New England Patriots","aliases":["Patriots","Pats","New England"]},{"name":"New York Giants","aliases":["Giants"]},{"name":"New York Jets","aliases":["Jets"]},{"name":"Washington Commanders","aliases":["Commanders","Washington"]}],"alsoAcceptedAnswers":[]},{"id":"nfl-oct19-multiple-sb-winners","prompt":"Name an NFL franchise that has won at least two Super Bowls.","answers":[{"name":"New England Patriots","aliases":["Patriots","Pats"]},{"name":"Pittsburgh Steelers","aliases":["Steelers"]},{"name":"Dallas Cowboys","aliases":["Cowboys"]},{"name":"San Francisco 49ers","aliases":["49ers","Niners"]},{"name":"Kansas City Chiefs","aliases":["Chiefs","KC"]},{"name":"Green Bay Packers","aliases":["Packers","Green Bay"]},{"name":"New York Giants","aliases":["Giants"]},{"name":"Denver Broncos","aliases":["Broncos"]}],"alsoAcceptedAnswers":[{"name":"Las Vegas Raiders","aliases":["Raiders","Oakland Raiders"]},{"name":"Washington Commanders","aliases":["Commanders","Washington Redskins","Washington"]},{"name":"Baltimore Ravens","aliases":["Ravens"]},{"name":"Miami Dolphins","aliases":["Dolphins"]},{"name":"Indianapolis Colts","aliases":["Colts","Baltimore Colts"]},{"name":"Los Angeles Rams","aliases":["Rams","St Louis Rams"]},{"name":"Philadelphia Eagles","aliases":["Eagles"]},{"name":"Tampa Bay Buccaneers","aliases":["Buccaneers","Bucs"]},{"name":"Seattle Seahawks","aliases":["Seahawks"]}]}],"fast":[{"id":"nfl-fast5-10-2","prompt":"Name a current NFL franchise that began play before 1970.","additionalAccepted":["Arizona Cardinals","Atlanta Falcons","Cincinnati Bengals","Denver Broncos","Detroit Lions","New York Jets","Minnesota Vikings","New England Patriots","Tennessee Titans","Washington Commanders"]},{"id":"nfl-fast1-09-4","prompt":"Name an NFL defender with at least 100 official regular-season sacks.","additionalAccepted":["Lawrence Taylor","Rickey Jackson","Jason Taylor","Richard Dent","Khalil Mack","Justin Houston","Cameron Jordan","Calais Campbell","John Abraham","Chandler Jones","Simeon Rice","Robert Mathis","Dwight Freeney","Elvis Dumervil"]},{"id":"nfl-fast2-09-1","prompt":"Name a player who made the Pro Bowl while playing for the Raiders.","additionalAccepted":["Maxx Crosby","Khalil Mack","Derek Carr","Davante Adams","Josh Jacobs","Darren Waller","Hunter Renfrow","Rich Gannon","Amari Cooper","Nnamdi Asomugha","Shane Lechler","Sebastian Janikowski","Rodney Hudson"]},{"id":"nfl-fast3-08-3","prompt":"Name a tight end with at least 5,000 NFL regular-season receiving yards.","additionalAccepted":["Jason Witten","Greg Olsen","Jimmy Graham","Jared Cook","Heath Miller","Jeremy Shockey","Todd Heap","Delanie Walker","Benjamin Watson","Kellen Winslow II"]}]}'::jsonb;
  v_pack jsonb;
  v_entities jsonb;
  v_new_main jsonb := '[]'::jsonb;
  v_main_reveal jsonb := '[]'::jsonb;
  v_q jsonb;
  v_patch jsonb;
  v_main jsonb;
  v_ans jsonb;
  v_entity jsonb;
  v_answers jsonb;
  v_ids jsonb;
  v_also jsonb;
  v_reveal_answers jsonb;
  v_main_public jsonb := '[]'::jsonb;
  v_fast_public jsonb := '[]'::jsonb;
  v_public jsonb;
  v_initial jsonb;
  v_reveal jsonb;
  v_evidence jsonb;
  v_grading jsonb;
  v_engine jsonb;
  v_entity_id text;
  v_name text;
  v_kind text;
  v_pack_id text := 'sports-feud-bank-v1-nfl-2026-10-19-nfl-oct19-east-teams-nfl-oct19-multiple-sb-winners';
  v_proof text;
  v_signature text;
  v_setup_key text;
  v_i integer;
  v_j integer;
  v_rank integer;
  v_points constant integer[] := array[10,8,7,5,5,4,4,3];
  v_count integer;
begin
  select d.id,d.setup_id into v_daily,v_setup
  from private.daily_challenges d
  join private.daily_challenge_schedule_versions v on v.version=d.schedule_version
  where d.central_day=date '2026-10-19'
    and d.game_type='sports_feud' and v.sport='football';
  if v_daily is null then return; end if; -- clean test databases can lack the publication
  if v_daily<>'b8e50eb4-4136-4414-b44c-6facfbf1b921'::uuid then
    raise exception 'Oct 19 NFL Feud daily identity changed';
  end if;
  select * into strict v_s from private.daily_challenge_setups where id=v_setup for update;
  v_pack:=v_s.private_setup_evidence->'pack';
  if v_pack#>>'{mainBoards,0,id}'='nfl-oct19-east-teams' then
    if v_pack->>'id'<>v_pack_id or
       v_s.public_setup#>>'{main_boards,0,prompt}'<>'Name an NFL team in the AFC East or NFC East.' then
      raise exception 'Oct 19 NFL Feud correction is only partially applied';
    end if;
    return;
  end if;
  if v_s.id<>'f8c7eb82-ad36-4f89-b242-2cc3bd823f79'::uuid
    or v_pack#>>'{mainBoards,0,id}'<>'nfl-main-13-5'
    or v_pack#>>'{mainBoards,1,id}'<>'nfl-main-01-2'
    or v_pack#>>'{fastMoney,0,id}'<>'nfl-fast4-10-5'
    or v_pack#>>'{fastMoney,1,id}'<>'nfl-fast5-10-2'
    or v_pack#>>'{fastMoney,2,id}'<>'nfl-fast1-09-4'
    or v_pack#>>'{fastMoney,3,id}'<>'nfl-fast2-09-1'
    or v_pack#>>'{fastMoney,4,id}'<>'nfl-fast3-08-3'
    or v_s.private_setup_evidence->>'proof' is distinct from v_s.private_grading_evidence->>'proof'
  then
    raise exception 'Oct 19 NFL Feud has changed since editorial review';
  end if;
  if exists (select 1 from private.daily_challenge_attempts where daily_challenge_id=v_daily) then
    raise exception 'Refusing to modify a completed NFL Feud result without a regrade';
  end if;
  if exists (
    select 1 from private.daily_challenge_progress p
    where p.daily_challenge_id=v_daily and (
      p.submission_state#>>'{engine_state,phase}' is distinct from 'main'
      or p.submission_state#>>'{engine_state,mainBoardIndex}' is distinct from '0'
      or jsonb_array_length(coalesce(p.submission_state#>'{engine_state,mainBoards,0,revealedEntityIds}','[]'::jsonb))>0
      or jsonb_array_length(coalesce(p.submission_state#>'{engine_state,mainBoards,1,revealedEntityIds}','[]'::jsonb))>0
    )
  ) then
    raise exception 'Somebody has progressed beyond the replaced opening board; editorial correction needs per-player review';
  end if;

  -- Replace both subjective main boards with fixed, verifiable NFL categories.
  select coalesce(jsonb_agg(e.value),'[]'::jsonb) into v_entities
  from jsonb_array_elements(v_pack->'entities') e
  where e.value->>'id' not like 'nfl-main-13-5:%'
    and e.value->>'id' not like 'nfl-main-01-2:%';

  for v_main in select x.value from jsonb_array_elements(v_plan->'main') x loop
    v_answers:='[]'::jsonb; v_ids:='[]'::jsonb; v_also:='[]'::jsonb;
    v_reveal_answers:='[]'::jsonb; v_rank:=0;
    for v_ans in select x.value from jsonb_array_elements(v_main->'answers') x loop
      v_rank:=v_rank+1;
      v_entity_id:=v_main->>'id'||':a'||v_rank;
      v_entity:=jsonb_build_object('id',v_entity_id,'displayName',v_ans->>'name',
        'kind','team','aliases',coalesce(v_ans->'aliases','[]'::jsonb));
      v_entities:=v_entities||jsonb_build_array(v_entity);
      v_ids:=v_ids||jsonb_build_array(v_entity_id);
      v_answers:=v_answers||jsonb_build_array(jsonb_build_object('entityId',v_entity_id,'points',v_points[v_rank]));
      v_reveal_answers:=v_reveal_answers||jsonb_build_array(jsonb_build_object(
        'rank',v_rank,'entity',jsonb_build_object('id',v_entity_id,'display_name',v_ans->>'name'),
        'points',v_points[v_rank]));
    end loop;
    if v_rank<>8 then raise exception 'Main board must have exactly eight ranked answers'; end if;
    v_j:=0;
    for v_ans in select x.value from jsonb_array_elements(v_main->'alsoAcceptedAnswers') x loop
      v_j:=v_j+1; v_entity_id:=v_main->>'id'||':v'||v_j;
      v_entities:=v_entities||jsonb_build_array(jsonb_build_object('id',v_entity_id,'kind','team',
        'displayName',v_ans->>'name','aliases',coalesce(v_ans->'aliases','[]'::jsonb)));
      v_ids:=v_ids||jsonb_build_array(v_entity_id);
      v_also:=v_also||jsonb_build_array(v_entity_id);
    end loop;
    v_new_main:=v_new_main||jsonb_build_array(jsonb_build_object(
      'id',v_main->>'id','prompt',v_main->>'prompt',
      'answers',v_answers,'candidateIds',v_ids,'alsoAcceptedEntityIds',v_also));
    v_main_public:=v_main_public||jsonb_build_array(jsonb_build_object('id',v_main->>'id','prompt',v_main->>'prompt'));
    v_main_reveal:=v_main_reveal||jsonb_build_array(jsonb_build_object('id',v_main->>'id','accepted_answers',v_reveal_answers));
  end loop;
  v_pack:=jsonb_set(v_pack,'{mainBoards}',v_new_main,false);

  -- Four Fast Money prompts were subjectively worded; retain their existing
  -- ranked point ladders, narrow to objective criteria, and cover additional
  -- legitimate responses as 1-point accepted alternates.
  for v_i in 0..4 loop
    v_q:=v_pack->'fastMoney'->v_i;
    select x.value into v_patch from jsonb_array_elements(v_plan->'fast') x
      where x.value->>'id'=v_q->>'id';
    if v_patch is not null then
      v_q:=jsonb_set(v_q,'{prompt}',to_jsonb(v_patch->>'prompt'),false);
      v_j:=jsonb_array_length(coalesce(v_q->'alsoAcceptedEntityIds','[]'::jsonb));
      for v_name in select jsonb_array_elements_text(v_patch->'additionalAccepted') loop
        if exists (select 1 from jsonb_array_elements(v_q->'candidateIds') id
            join lateral jsonb_array_elements(v_entities) e on e->>'id'=id.value#>>'{}'
            where lower(e->>'displayName')=lower(v_name)) then
          raise exception 'Duplicate Fast Money alternate %',v_name;
        end if;
        v_j:=v_j+1;
        v_entity_id:=v_q->>'id'||':v'||v_j;
        v_kind:=case when v_i=1 then 'team' else 'person' end;
        v_entities:=v_entities||jsonb_build_array(jsonb_build_object(
          'id',v_entity_id,'kind',v_kind,'displayName',v_name,
          'aliases',case when v_kind='team' then jsonb_build_array(
             (regexp_split_to_array(v_name,' '))[array_length(regexp_split_to_array(v_name,' '),1)])
           else '[]'::jsonb end));
        v_q:=jsonb_set(v_q,'{candidateIds}',(v_q->'candidateIds')||jsonb_build_array(v_entity_id),false);
        v_q:=jsonb_set(v_q,'{alsoAcceptedEntityIds}',(v_q->'alsoAcceptedEntityIds')||jsonb_build_array(v_entity_id),false);
      end loop;
      v_pack:=jsonb_set(v_pack,array['fastMoney',v_i::text],v_q,false);
    end if;
    v_patch:=null;
  end loop;

  v_pack:=jsonb_set(jsonb_set(v_pack,'{entities}',v_entities,false),
    '{id}',to_jsonb(v_pack_id),false);
  select string_agg(z.q->>'id'||':'||
    (select string_agg(a.value->>'entityId'||'='||a.value->>'points',',' order by a.n)
       from jsonb_array_elements(z.q->'answers') with ordinality a(value,n)),
     '|' order by z.n) into v_signature
  from jsonb_array_elements((v_pack->'mainBoards')||(v_pack->'fastMoney')) with ordinality z(q,n);
  v_proof:='family-feud-daily-v2|football|2026-10-19|football-daily-v20-resume-v18-oct3|'||
    v_pack_id||'|'||v_signature;
  v_setup_key:='family-feud-daily-v2:football-daily-v20-resume-v18-oct3:2026-10-19:football:'||v_pack_id;

  v_public:=v_s.public_setup;
  v_public:=jsonb_set(v_public,'{pack_id}',to_jsonb(v_pack_id),false);
  v_public:=jsonb_set(v_public,'{main_boards}',v_main_public,false);
  for v_i in 0..4 loop
    v_q:=v_pack->'fastMoney'->v_i;
    v_fast_public:=v_fast_public||jsonb_build_array(jsonb_build_object('id',v_q->>'id','prompt',v_q->>'prompt'));
  end loop;
  v_public:=jsonb_set(v_public,'{fast_money_prompts}',v_fast_public,false);
  v_initial:=v_public->'initial_state';
  for v_i in 0..1 loop
    v_initial:=jsonb_set(v_initial,array['main_boards',v_i::text,'id'],
      to_jsonb(v_new_main->v_i->>'id'),false);
    v_initial:=jsonb_set(v_initial,array['main_boards',v_i::text,'prompt'],
      to_jsonb(v_new_main->v_i->>'prompt'),false);
  end loop;
  v_public:=jsonb_set(v_public,'{initial_state}',v_initial,false);
  v_reveal:=jsonb_set(v_s.reveal_setup,'{main_boards}',v_main_reveal,false);
  v_evidence:=jsonb_set(v_s.private_setup_evidence,'{pack}',v_pack,false)
    ||jsonb_build_object('proof',v_proof);
  v_grading:=v_s.private_grading_evidence||jsonb_build_object('proof',v_proof);

  -- Trigger exemptions are tightly scoped and restored on every exit path.
  execute 'alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable';
  begin
    update private.daily_challenge_setups set
      setup_key=v_setup_key,public_setup=v_public,reveal_setup=v_reveal,
      private_setup_evidence=v_evidence,private_grading_evidence=v_grading
    where id=v_setup;
    get diagnostics v_count=row_count;
    if v_count<>1 then raise exception 'Expected one Oct 19 setup, got %',v_count; end if;
  exception when others then
    execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';

  -- The lone started player has zero accepted guesses and one accidental P
  -- strike on the disallowed question. Clear it without affecting any results.
  v_engine:=jsonb_build_object(
    'phase','main','mainBoardIndex',0,'mainBoards',jsonb_build_array(
      jsonb_build_object('revealedEntityIds','[]'::jsonb,'submittedEntityIds','[]'::jsonb,
        'submittedUnrecognized','[]'::jsonb,'attempts','[]'::jsonb,'strikes',0),
      jsonb_build_object('revealedEntityIds','[]'::jsonb,'submittedEntityIds','[]'::jsonb,
        'submittedUnrecognized','[]'::jsonb,'attempts','[]'::jsonb,'strikes',0)),
    'fastMoneyIndex',0,'fastMoneyResults','[]'::jsonb,'fastMoneyTimeRemainingMs',50000);
  update private.daily_challenge_progress set
    revision=revision+1,
    public_state=v_initial,
    submission_state=jsonb_set(submission_state,'{engine_state}',v_engine,true)
  where daily_challenge_id=v_daily;
end
$oct19_feud$;
